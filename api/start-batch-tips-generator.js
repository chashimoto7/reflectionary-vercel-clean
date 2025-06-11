// api/start-batch-tips-generator.js
// OPTIMIZED version that leverages existing goal matching data

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import crypto from "crypto";

// Environment validation
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error("Supabase environment variables not configured");
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OpenAI API key not configured");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Config
const CONFIG = {
  DAYS_BACK: 90, // 3 months of journal entries
  MAX_TOKENS: 800,
  TEMPERATURE: 0.7,
  MODEL: "gpt-4o-mini",
  MAX_CONTENT_LENGTH: 12000,
  BATCH_SIZE: 50, // Process this many goals at once
  MIN_ENTRIES_FOR_PERSONALIZED: 2, // Need at least 2 entries for personalized tips
};

// === ENCRYPTION HELPERS (same as before) ===
function decryptDataKey(encryptedDataKeyBase64, dataKeyIvBase64, masterKeyHex) {
  try {
    const encryptedBuffer = Buffer.from(encryptedDataKeyBase64, "base64");
    const ivBuffer = Buffer.from(dataKeyIvBase64, "base64");

    const masterKeyBuffer = Buffer.from(masterKeyHex, "hex");
    let masterKey;
    if (masterKeyBuffer.length === 32) {
      masterKey = masterKeyBuffer;
    } else {
      masterKey = Buffer.alloc(32);
      masterKeyBuffer.copy(
        masterKey,
        0,
        0,
        Math.min(masterKeyBuffer.length, 32)
      );
    }

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      masterKey,
      ivBuffer
    );
    let decrypted = decipher.update(encryptedBuffer, null, "utf8");
    decrypted += decipher.final("utf8");
    return Buffer.from(decrypted, "base64");
  } catch (error) {
    throw new Error(`Failed to decrypt data key: ${error.message}`);
  }
}

function decryptContent(
  encryptedContentBase64,
  contentIvBase64,
  dataKeyBuffer
) {
  try {
    const encryptedBuffer = Buffer.from(encryptedContentBase64, "base64");
    const ivBuffer = Buffer.from(contentIvBase64, "base64");

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      dataKeyBuffer,
      ivBuffer
    );
    let decrypted = decipher.update(encryptedBuffer, null, "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    throw new Error(`Failed to decrypt content: ${error.message}`);
  }
}

function encryptText(plaintext, dataKeyBuffer) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", dataKeyBuffer, iv);
    let encrypted = cipher.update(plaintext, "utf8", "base64");
    encrypted += cipher.final("base64");
    return {
      encryptedData: encrypted,
      iv: iv.toString("base64"),
    };
  } catch (error) {
    throw new Error(`Failed to encrypt text: ${error.message}`);
  }
}

// === MAIN FUNCTIONS ===

// Get goals that need tip updates
async function getGoalsNeedingTips() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: goals, error } = await supabase
    .from("user_goals")
    .select(
      "id, user_id, encrypted_goal, goal_iv, encrypted_data_key, data_key_iv, tips_last_generated, status, mention_count"
    )
    .eq("status", "active") // Only active goals
    .or(
      `encrypted_tips.is.null,tips_last_generated.lt.${sevenDaysAgo.toISOString()}`
    )
    .limit(CONFIG.BATCH_SIZE);

  if (error) {
    throw new Error(`Failed to fetch goals: ${error.message}`);
  }

  return goals || [];
}

// Decrypt goal title and prepare goal object
async function decryptGoal(goal, masterKeyHex) {
  try {
    const dataKey = decryptDataKey(
      goal.encrypted_data_key,
      goal.data_key_iv,
      masterKeyHex
    );
    const goalTitle = decryptContent(
      goal.encrypted_goal,
      goal.goal_iv,
      dataKey
    );
    return { ...goal, decryptedTitle: goalTitle.trim(), _dataKey: dataKey };
  } catch (error) {
    console.warn(`Failed to decrypt goal ${goal.id}:`, error.message);
    return null;
  }
}

// Get journal entries that mention this specific goal (using existing goal matching data!)
async function getRelevantJournalEntries(goalId, masterKeyHex) {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setDate(threeMonthsAgo.getDate() - CONFIG.DAYS_BACK);

  // Use the existing goal_ids array to find entries that mention this goal
  const { data: entries, error } = await supabase
    .from("journal_entries")
    .select(
      "id, encrypted_content, content_iv, encrypted_data_key, data_key_iv, created_at, goals_mentioned"
    )
    .contains("goal_ids", [goalId]) // This uses your existing goal matching!
    .gte("created_at", threeMonthsAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(15); // Look at last 15 relevant entries max

  if (error) {
    console.warn(`Failed to fetch entries for goal ${goalId}:`, error.message);
    return [];
  }

  if (!entries || entries.length === 0) {
    console.log(`No journal entries found that mention goal ${goalId}`);
    return [];
  }

  console.log(`Found ${entries.length} entries that mention this goal`);

  // Decrypt the content of relevant entries
  const relevantEntries = [];
  for (const entry of entries.slice(0, 10)) {
    // Use max 10 most recent
    try {
      const dataKey = decryptDataKey(
        entry.encrypted_data_key,
        entry.data_key_iv,
        masterKeyHex
      );
      const content = decryptContent(
        entry.encrypted_content,
        entry.content_iv,
        dataKey
      );

      // Truncate if too long
      const truncatedContent =
        content.length > CONFIG.MAX_CONTENT_LENGTH
          ? content.substring(0, CONFIG.MAX_CONTENT_LENGTH) + "..."
          : content;

      relevantEntries.push({
        content: truncatedContent,
        date: entry.created_at,
        goals_mentioned: entry.goals_mentioned || [],
      });
    } catch (error) {
      console.warn(`Failed to decrypt entry ${entry.id}:`, error.message);
      continue;
    }
  }

  return relevantEntries;
}

// Generate tips using OpenAI
async function generateTipsForGoal(goal, journalEntries) {
  const { decryptedTitle, mention_count } = goal;

  // If no relevant journal entries, generate generic tips
  if (journalEntries.length < CONFIG.MIN_ENTRIES_FOR_PERSONALIZED) {
    console.log(
      `Only ${journalEntries.length} relevant entries found for goal: ${decryptedTitle}. Generating generic tips.`
    );

    const prompt = `Generate 3 helpful, specific, and psychologically-informed tips for someone whose personal goal is: "${decryptedTitle}". 

This goal has been mentioned ${
      mention_count || 0
    } times in their journal entries, suggesting it's important to them.

Format your response as a JSON array of strings. Each tip should be:
- Actionable and specific (not generic advice)
- Psychologically grounded (based on behavioral science, motivation theory, etc.)
- Encouraging and supportive
- 1-2 sentences long
- Focused on practical strategies they can implement

Return only the JSON array, no other text.`;

    try {
      const response = await openai.chat.completions.create({
        model: CONFIG.MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a compassionate personal development coach with expertise in psychology and behavioral science. Always return valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        temperature: CONFIG.TEMPERATURE,
        max_tokens: CONFIG.MAX_TOKENS,
      });

      const content = response.choices[0].message.content.trim();
      const tips = JSON.parse(content);
      return Array.isArray(tips) ? tips.slice(0, 3) : [];
    } catch (error) {
      console.error(
        `Failed to generate generic tips for goal ${decryptedTitle}:`,
        error.message
      );
      return [];
    }
  }

  // Generate personalized tips based on journal entries
  const entrySummaries = journalEntries
    .map((entry, index) => {
      const date = entry.date.split("T")[0];
      const content = entry.content.substring(0, 800); // Limit each entry
      const mentioned =
        entry.goals_mentioned.length > 0
          ? ` (also mentioned: ${entry.goals_mentioned.slice(0, 3).join(", ")})`
          : "";
      return `Entry ${index + 1} (${date})${mentioned}: ${content}...`;
    })
    .join("\n\n");

  const prompt = `Based on this person's journal entries related to their goal "${decryptedTitle}", generate 3 personalized, specific tips to help them achieve this goal.

This goal has been mentioned ${
    mention_count || 0
  } times across their journal entries, showing consistent engagement.

Their recent relevant journal entries:
${entrySummaries}

Generate tips that are:
- Personalized to their specific situation, challenges, and patterns shown in the entries
- Actionable and specific (not generic advice)
- Build on insights from their journal entries (reference specific themes, challenges, or progress they've mentioned)
- Psychologically informed and supportive
- Address any obstacles or patterns you notice in their entries
- 1-2 sentences each

Format your response as a JSON array of strings. Return only the JSON array, no other text.`;

  try {
    const response = await openai.chat.completions.create({
      model: CONFIG.MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a compassionate personal development coach with expertise in psychology. Analyze the journal entries carefully to provide highly personalized advice that references their specific situation. Always return valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: CONFIG.TEMPERATURE,
      max_tokens: CONFIG.MAX_TOKENS,
    });

    const content = response.choices[0].message.content.trim();
    const tips = JSON.parse(content);
    return Array.isArray(tips) ? tips.slice(0, 3) : [];
  } catch (error) {
    console.error(
      `Failed to generate personalized tips for goal ${decryptedTitle}:`,
      error.message
    );
    return [];
  }
}

// Save encrypted tips to database
async function saveTipsToGoal(goal, tips) {
  try {
    // Encrypt the tips using the goal's data key
    const tipsJson = JSON.stringify(tips);
    const encryptedTips = encryptText(tipsJson, goal._dataKey);

    const { error } = await supabase
      .from("user_goals")
      .update({
        encrypted_tips: encryptedTips.encryptedData,
        tips_iv: encryptedTips.iv,
        tips_last_generated: new Date().toISOString(),
      })
      .eq("id", goal.id);

    if (error) {
      throw new Error(
        `Failed to save tips for goal ${goal.id}: ${error.message}`
      );
    }

    console.log(
      `✅ Successfully saved ${tips.length} tips for goal: ${goal.decryptedTitle}`
    );
    return true;
  } catch (error) {
    console.error(`Failed to save tips for goal ${goal.id}:`, error.message);
    return false;
  }
}

// === MAIN HANDLER ===
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log(
      "==== Starting OPTIMIZED batch tips generator (using existing goal matching)... ===="
    );

    // Get master key
    const masterKeyHex =
      process.env.MASTER_DECRYPTION_KEY || process.env.MASTER_ENCRYPTION_KEY;
    if (!masterKeyHex) {
      throw new Error(
        "Master decryption key not found in environment variables"
      );
    }

    // 1. Get goals that need tip updates
    console.log("🔍 Fetching goals that need tip updates...");
    const goals = await getGoalsNeedingTips();

    if (!goals || goals.length === 0) {
      console.log("✅ No goals need tip updates");
      return res.status(200).json({
        message: "No goals need tip updates.",
        processed: 0,
      });
    }

    console.log(`📝 Found ${goals.length} goals that need tip updates`);

    // 2. Process each goal
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    for (const goalData of goals) {
      try {
        console.log(`\n🎯 Processing goal ${goalData.id}...`);

        // Decrypt goal
        const goal = await decryptGoal(goalData, masterKeyHex);
        if (!goal) {
          errorCount++;
          continue;
        }

        console.log(
          `   Goal: "${goal.decryptedTitle}" (mentioned ${
            goal.mention_count || 0
          } times)`
        );

        // Get relevant journal entries using existing goal matching data
        console.log(
          "   📖 Finding entries that mention this goal (using existing goal_ids data)..."
        );
        const journalEntries = await getRelevantJournalEntries(
          goal.id,
          masterKeyHex
        );

        const tipType =
          journalEntries.length >= CONFIG.MIN_ENTRIES_FOR_PERSONALIZED
            ? "personalized"
            : "generic";
        console.log(
          `   Found ${journalEntries.length} relevant entries, generating ${tipType} tips`
        );

        // Generate tips
        console.log("   🤖 Generating AI tips...");
        const tips = await generateTipsForGoal(goal, journalEntries);

        if (tips.length === 0) {
          console.log("   ⚠️ No tips generated");
          errorCount++;
          continue;
        }

        console.log(`   Generated ${tips.length} ${tipType} tips`);

        // Save tips
        console.log("   💾 Saving encrypted tips...");
        const saved = await saveTipsToGoal(goal, tips);

        if (saved) {
          successCount++;
        } else {
          errorCount++;
        }

        processedCount++;

        // Add small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(
          `❌ Error processing goal ${goalData.id}:`,
          error.message
        );
        errorCount++;
        processedCount++;
      }
    }

    console.log("\n==== Batch processing complete ====");
    console.log(
      `📊 Results: ${successCount} successful, ${errorCount} errors, ${processedCount} total`
    );

    return res.status(200).json({
      message: "Optimized batch tips generation completed",
      results: {
        total_goals: goals.length,
        processed: processedCount,
        successful: successCount,
        errors: errorCount,
      },
      optimization: "Using existing goal matching data from journal entries",
      debug: {
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasSupabase: !!process.env.SUPABASE_URL,
        hasMasterKey: !!masterKeyHex,
        config: CONFIG,
      },
    });
  } catch (error) {
    console.error("💥 Fatal batch processing error:", error);
    return res.status(500).json({
      error: "Batch processing failed",
      details: error.message,
    });
  }
}
