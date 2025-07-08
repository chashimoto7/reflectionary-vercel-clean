// pages/api/save-entry.js
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper functions (keep your existing ones)
function countWords(html) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.split(" ").length : 0;
}

function generateDataKey() {
  return crypto.randomBytes(32);
}

function encryptText(plainText, keyBuffer) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(plainText, "utf8", "base64");
  encrypted += cipher.final("base64");
  return {
    encryptedData: encrypted,
    iv: iv.toString("base64"),
  };
}

function encryptKey(dataKeyBuffer, masterKeyHex) {
  const masterKey = Buffer.from(masterKeyHex, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", masterKey, iv);
  let encrypted = cipher.update(dataKeyBuffer, undefined, "base64");
  encrypted += cipher.final("base64");
  return {
    encryptedData: encrypted,
    iv: iv.toString("base64"),
  };
}

function analyzeCrisisPatterns(content) {
  const triggers = [];
  const protectiveFactors = [];
  let score = 0;

  const crisisKeywords = [
    "suicide",
    "harm",
    "hopeless",
    "worthless",
    "end it all",
  ];
  const protectiveKeywords = ["hope", "support", "better", "grateful", "loved"];

  const lowerContent = content.toLowerCase();

  crisisKeywords.forEach((keyword) => {
    if (lowerContent.includes(keyword)) {
      triggers.push(keyword);
      score += 20;
    }
  });

  protectiveKeywords.forEach((keyword) => {
    if (lowerContent.includes(keyword)) {
      protectiveFactors.push(keyword);
      score -= 5;
    }
  });

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    level: score >= 70 ? "high" : score >= 40 ? "medium" : "low",
    shouldAlert: score >= 40,
    triggers,
    protectiveFactors,
    confidence: "medium",
  };
}

async function saveCrisisAlert(userId, entryId, analysis) {
  try {
    const alertData = {
      user_id: userId,
      entry_id: entryId,
      alert_level: analysis.level,
      detection_score: analysis.score,
      response_status: "pending",
      priority_score:
        analysis.confidence === "high"
          ? 9
          : analysis.confidence === "medium"
          ? 6
          : 3,
      detection_triggers: analysis.triggers || [],
      protective_factors: analysis.protectiveFactors || [],
      detected_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const { data, error } = await supabase
      .from("crisis_alerts")
      .insert(alertData)
      .select()
      .single();

    if (error) {
      console.error("⚠️ Failed to save crisis alert:", error);
      return null;
    }

    console.log("📝 Crisis alert saved:", data.id);
    return data;
  } catch (error) {
    console.error("⚠️ Error saving crisis alert:", error);
    return null;
  }
}

// MAIN HANDLER FUNCTION - FIXED with better error handling
export default async function handler(req, res) {
  console.log(`🚀 API Request: ${req.method} ${req.url}`);
  console.log(`🚀 Request headers:`, req.headers);

  // Set CORS headers FIRST - before any other operations
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("✅ Handling OPTIONS preflight request");
    res.status(200).end();
    return;
  }

  // Log the method check
  console.log(`🔍 Checking method: ${req.method}`);

  // CRITICAL: Only allow POST
  if (req.method !== "POST") {
    console.error(`❌ Method ${req.method} not allowed for this endpoint`);
    return res.status(405).json({
      error: "Method not allowed",
      message: `This endpoint only accepts POST requests, received ${req.method}`,
      allowed: ["POST"],
      received: req.method,
    });
  }

  try {
    console.log("📥 Processing save entry request...");

    // Parse and validate request body
    let body;
    try {
      body = req.body;
      console.log("📝 Request body received:", typeof body);
      console.log("📝 Request body keys:", Object.keys(body || {}));
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return res.status(400).json({
        error: "Invalid request body",
        message: "Failed to parse JSON request body",
        details: parseError.message,
      });
    }

    const {
      user_id,
      content,
      title,
      prompt,
      is_follow_up = false,
      parent_entry_id = null,
      thread_id = null,
      prompt_used = "user-initiated",
      // Removed wellness data since it's not part of journaling anymore
      // mood = null,
      // energy = null,
      // cycle_day = null,
      // cycle_phase = null,
      folder_id = null,
      starred = false,
      pinned = false,
      tags = null,
      goal_ids = null,
      metadata = {},
    } = body;

    // Validate required fields
    if (!user_id) {
      console.error("❌ Missing user_id");
      return res.status(400).json({
        error: "Missing required field: user_id",
        received: { user_id: !!user_id },
      });
    }

    if (!content) {
      console.error("❌ Missing content");
      return res.status(400).json({
        error: "Missing required field: content",
        received: { content: !!content },
      });
    }

    if (is_follow_up && !parent_entry_id) {
      console.error("❌ Follow-up missing parent_entry_id");
      return res.status(400).json({
        error: "Follow-up entries require parent_entry_id",
      });
    }

    // Check environment variables
    const masterKeyHex =
      process.env.MASTER_DECRYPTION_KEY || process.env.MASTER_ENCRYPTION_KEY;
    if (!masterKeyHex) {
      console.error("❌ Master encryption key not found in environment");
      return res.status(500).json({
        error: "Server configuration error",
        message: "Master encryption key not configured",
      });
    }

    console.log("🔐 Starting encryption process...");

    // Generate encryption keys
    const dataKey = generateDataKey();
    const encryptedContent = encryptText(content, dataKey);

    let encryptedPrompt = null;
    let promptIv = null;
    if (prompt) {
      const promptEncryption = encryptText(prompt, dataKey);
      encryptedPrompt = promptEncryption.encryptedData;
      promptIv = promptEncryption.iv;
    }

    const encryptedDataKey = encryptKey(dataKey, masterKeyHex);
    const word_count = countWords(content);

    console.log("🔍 Running crisis analysis...");
    const crisisAnalysis = analyzeCrisisPatterns(content);

    // Prepare entry data - Updated to match actual database schema (no data key columns)
    const entryToInsert = {
      user_id,
      encrypted_content: encryptedContent.encryptedData,
      content_iv: encryptedContent.iv,
      encrypted_prompt: encryptedPrompt,
      prompt_iv: promptIv,
      // Removed data key columns - they don't exist in current schema
      // encrypted_data_key: encryptedDataKey.encryptedData,
      // data_key_iv: encryptedDataKey.iv,
      word_count,
      entry_type: "standard",
      is_follow_up: is_follow_up,
      parent_entry_id: parent_entry_id || null,
      folder_id: folder_id || null,
      starred: starred || false,
      pinned: pinned || false,
      crisis_analyzed_realtime: true,
      crisis_score_realtime: crisisAnalysis.score,
      crisis_level_realtime:
        crisisAnalysis.level !== "none" ? crisisAnalysis.level : null,
      crisis_metadata: {
        thread_id,
        entry_type: is_follow_up ? "followup" : "main",
        crisis_triggers: crisisAnalysis.triggers || [],
        protective_factors: crisisAnalysis.protectiveFactors || [],
        goal_ids: goal_ids || [],
        prompt_used: prompt_used,
        tags: tags, // Store tags in metadata since no tags column
        ...metadata,
      },
    };

    console.log("💾 Attempting to save to database...");

    // Save to database
    const { data, error } = await supabase
      .from("journal_entries")
      .insert([entryToInsert])
      .select("id, created_at");

    if (error) {
      console.error("❌ Database error:", error);
      return res.status(500).json({
        error: "Database error",
        message: "Failed to save entry to database",
        details: error.message,
        code: error.code,
      });
    }

    const savedEntry = data?.[0];
    if (!savedEntry) {
      console.error("❌ No entry returned from database");
      return res.status(500).json({
        error: "Failed to save entry",
        message: "No data returned from database after insert",
      });
    }

    console.log("✅ Entry saved successfully:", savedEntry.id);

    // Handle crisis alert
    let crisisAlert = null;
    if (crisisAnalysis.shouldAlert) {
      console.log("🚨 Saving crisis alert...");
      crisisAlert = await saveCrisisAlert(
        user_id,
        savedEntry.id,
        crisisAnalysis
      );
    }

    // Save entry-goal relationships
    if (goal_ids && goal_ids.length > 0) {
      console.log("🎯 Saving goal relationships...");
      const entryGoals = goal_ids.map((goalId) => ({
        entry_id: savedEntry.id,
        goal_id: goalId,
        user_id: user_id,
      }));

      const { error: goalError } = await supabase
        .from("entry_goals")
        .insert(entryGoals);

      if (goalError) {
        console.error("⚠️ Failed to save entry-goal relationships:", goalError);
        // Don't fail the entire request for this
      }
    }

    // Prepare response
    const response = {
      message: "Entry saved successfully",
      entry: {
        id: savedEntry.id,
        created_at: savedEntry.created_at,
      },
      crisis_analysis: {
        level: crisisAnalysis.level,
        score: crisisAnalysis.score,
        should_alert: crisisAnalysis.shouldAlert,
        confidence: crisisAnalysis.confidence,
      },
    };

    if (crisisAlert) {
      response.crisis_alert_id = crisisAlert.id;
    }

    console.log("✅ Sending success response");
    return res.status(200).json(response);
  } catch (error) {
    console.error("❌ Handler error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while processing your request",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
