// api/start-batch-tips-generator.js
// Creates batch jobs for OpenAI tips generation (scalable version)

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import crypto from "crypto";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

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
  MIN_ENTRIES_FOR_PERSONALIZED: 2,
  DEBUG_ONE_ONLY: false, // Set to true for testing
};

// === ENCRYPTION HELPERS ===
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
    .eq("status", "active")
    .or(
      `encrypted_tips.is.null,tips_last_generated.lt.${sevenDaysAgo.toISOString()}`
    )
    .limit(50); // Process up to 50 goals per batch

  if (error) throw new Error(`Failed to fetch goals: ${error.message}`);
  return goals || [];
}

// Decrypt goal and get relevant journal entries
async function prepareGoalData(goal, masterKeyHex) {
  try {
    // Decrypt goal title
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

    // Get journal entries that mention this goal
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(threeMonthsAgo.getDate() - CONFIG.DAYS_BACK);

    const { data: entries, error } = await supabase
      .from("journal_entries")
      .select(
        "id, encrypted_content, content_iv, encrypted_data_key, data_key_iv, created_at, goals_mentioned"
      )
      .contains("goal_ids", [goal.id])
      .gte("created_at", threeMonthsAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(10); // Max 10 most recent entries

    if (error) {
      console.warn(
        `Failed to fetch entries for goal ${goal.id}:`,
        error.message
      );
      return { goal, goalTitle: goalTitle.trim(), journalEntries: [] };
    }

    // Decrypt journal entries
    const journalEntries = [];
    for (const entry of entries || []) {
      try {
        const entryDataKey = decryptDataKey(
          entry.encrypted_data_key,
          entry.data_key_iv,
          masterKeyHex
        );
        const content = decryptContent(
          entry.encrypted_content,
          entry.content_iv,
          entryDataKey
        );

        const truncatedContent =
          content.length > CONFIG.MAX_CONTENT_LENGTH
            ? content.substring(0, CONFIG.MAX_CONTENT_LENGTH) + "..."
            : content;

        journalEntries.push({
          content: truncatedContent,
          date: entry.created_at,
          goals_mentioned: entry.goals_mentioned || [],
        });
      } catch (error) {
        console.warn(`Failed to decrypt entry ${entry.id}:`, error.message);
      }
    }

    return { goal, goalTitle: goalTitle.trim(), journalEntries };
  } catch (error) {
    console.warn(`Failed to prepare data for goal ${goal.id}:`, error.message);
    return null;
  }
}

// Create batch request for a goal
function createTipGenerationRequest(goalData) {
  const { goal, goalTitle, journalEntries } = goalData;

  let prompt;

  if (journalEntries.length < CONFIG.MIN_ENTRIES_FOR_PERSONALIZED) {
    // Generic tips prompt
    prompt = `Generate 3 helpful, specific, and psychologically-informed tips for someone whose personal goal is: "${goalTitle}". 

This goal has been mentioned ${
      goal.mention_count || 0
    } times in their journal entries, suggesting it's important to them.

Format your response as a JSON array of strings. Each tip should be:
- Actionable and specific (not generic advice)
- Psychologically grounded (based on behavioral science, motivation theory, etc.)
- Encouraging and supportive
- 1-2 sentences long
- Focused on practical strategies they can implement

Return only the JSON array, no other text.`;
  } else {
    // Personalized tips prompt
    const entrySummaries = journalEntries
      .map((entry, index) => {
        const date = entry.date.split("T")[0];
        const content = entry.content.substring(0, 800);
        const mentioned =
          entry.goals_mentioned.length > 0
            ? ` (also mentioned: ${entry.goals_mentioned
                .slice(0, 3)
                .join(", ")})`
            : "";
        return `Entry ${index + 1} (${date})${mentioned}: ${content}...`;
      })
      .join("\n\n");

    prompt = `Based on this person's journal entries related to their goal "${goalTitle}", generate 3 personalized, specific tips to help them achieve this goal.

This goal has been mentioned ${
      goal.mention_count || 0
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
  }

  return {
    custom_id: goal.id,
    method: "POST",
    url: "/v1/chat/completions",
    body: {
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
    },
  };
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
    console.log("==== Starting batch tips generation process... ====");

    // Get master key
    const masterKeyHex =
      process.env.VITE_MASTER_DECRYPTION_KEY ||
      process.env.VITE_MASTER_ENCRYPTION_KEY;
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

    // Optionally process only one goal for debugging
    let goalsToProcess = goals;
    if (CONFIG.DEBUG_ONE_ONLY) {
      goalsToProcess = [goals[0]];
      console.log("🐛 DEBUG MODE: Processing ONLY one goal:", goals[0].id);
    }

    console.log(
      `📝 Found ${goalsToProcess.length} goals that need tip updates`
    );

    // 2. Prepare goal data and create batch requests
    console.log("🔄 Preparing goal data and creating batch requests...");
    const batchRequests = [];

    for (const goal of goalsToProcess) {
      try {
        console.log(`   Processing goal ${goal.id}...`);
        const goalData = await prepareGoalData(goal, masterKeyHex);

        if (!goalData) {
          console.warn(
            `   ⚠️ Skipping goal ${goal.id} due to processing error`
          );
          continue;
        }

        const request = createTipGenerationRequest(goalData);
        batchRequests.push(JSON.stringify(request));

        console.log(
          `   ✅ Created tip generation request for: "${goalData.goalTitle}"`
        );
      } catch (error) {
        console.error(
          `   ❌ Failed to process goal ${goal.id}:`,
          error.message
        );
      }
    }

    if (batchRequests.length === 0) {
      return res
        .status(500)
        .json({ error: "No valid tip generation requests could be created" });
    }

    console.log(
      `✅ Successfully created ${batchRequests.length} batch requests`
    );

    // 3. Write batch input to /tmp for OpenAI SDK
    const filePath = path.join("/tmp", `tips_batch_${Date.now()}.jsonl`);
    const jsonlContent = batchRequests.join("\n");
    await fsp.writeFile(filePath, jsonlContent, "utf8");
    console.log(`📁 Wrote batch input to file: ${filePath}`);

    // 4. Upload file to OpenAI Files API
    let file;
    try {
      console.log("📤 Uploading batch file to OpenAI...");
      file = await openai.files.create({
        file: fs.createReadStream(filePath),
        purpose: "batch",
      });
      console.log("✅ OpenAI file upload successful:", file.id);
    } catch (err) {
      console.error("❌ Failed to upload file to OpenAI:", err);
      return res.status(500).json({
        error: "Failed to upload file to OpenAI",
        details: err.message,
      });
    }

    // 5. Create batch job using uploaded file
    let batch;
    try {
      console.log("🚀 Creating OpenAI batch job...");
      batch = await openai.batches.create({
        input_file_id: file.id,
        endpoint: "/v1/chat/completions",
        completion_window: "24h",
      });
      console.log("✅ Batch job started:", batch.id);

      // 6. Save batch job info to Supabase
      try {
        await supabase.from("batch_jobs").insert([
          {
            batch_id: batch.id, // This is the correct batch ID, not the file ID
            file_id: file.id,
            job_type: "tips_generation",
            started_at: new Date().toISOString(),
            status: batch.status,
            input_count: batchRequests.length,
            total_goals: goalsToProcess.length,
          },
        ]);
        console.log("💾 Batch job info saved to database");
      } catch (insertError) {
        console.error("⚠️ Failed to save batch job info:", insertError);
      }
    } catch (err) {
      console.error("❌ Failed to create batch job:", err);
      return res.status(500).json({
        error: "Failed to create batch job",
        details: err.message,
      });
    }

    console.log("==== Batch tips generation process complete ====");

    return res.status(200).json({
      message: "Batch tips generation job started successfully",
      batch_id: batch.id,
      file_id: file.id,
      goals_processed: batchRequests.length,
      total_goals: goalsToProcess.length,
      status: batch.status,
      job_type: "tips_generation",
    });
  } catch (error) {
    console.error("💥 Batch tips generation error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
