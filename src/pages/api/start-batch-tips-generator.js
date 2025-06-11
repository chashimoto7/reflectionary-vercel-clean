// pages/api/start-batch-tips-generator.js

import { createClient } from "@supabase/supabase-js";
import encryptionService from "../src/services/encryptionService";
import OpenAI from "openai";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- CONFIG ---
const CONFIG = {
  DAYS_BACK: 90, // 3 months
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
  MODEL: "gpt-4o-mini",
  MAX_CONTENT_LENGTH: 15000, // More content for better tips
  DEBUG_MODE: false,
};

// --- SUPABASE ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// --- FETCH GOALS THAT NEED TIP UPDATES ---
async function getGoalsNeedingTips() {
  // Get goals that either:
  // 1. Have never had tips generated (encrypted_tips is null)
  // 2. Haven't been updated in 7+ days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: goals, error } = await supabase
    .from("user_goals")
    .select(
      "id, user_id, encrypted_goal, goal_iv, encrypted_data_key, data_key_iv, tips_last_generated"
    )
    .or(
      `encrypted_tips.is.null,tips_last_generated.lt.${sevenDaysAgo.toISOString()}`
    );

  if (error) {
    throw new Error(`Failed to fetch goals: ${error.message}`);
  }

  return goals || [];
}

// --- FETCH RELEVANT JOURNAL ENTRIES FOR A GOAL ---
async function getRelevantJournalEntries(userId, goalId, masterKey) {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setDate(threeMonthsAgo.getDate() - CONFIG.DAYS_BACK);

  // Find entries that reference this goal in the last 3 months
  const { data: entries, error } = await supabase
    .from("journal_entries")
    .select(
      "id, encrypted_content, content_iv, encrypted_data_key, data_key_iv, created_at"
    )
    .eq("user_id", userId)
    .contains("goal_ids", [goalId])
    .gte("created_at", threeMonthsAgo.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching entries for goal ${goalId}:`, error);
    return [];
  }

  if (!entries || entries.length === 0) {
    console.log(
      `No journal entries found for goal ${goalId} in last ${CONFIG.DAYS_BACK} days`
    );
    return [];
  }

  // Decrypt the journal entries
  const decryptedEntries = [];
  for (const entry of entries) {
    try {
      if (
        !entry.encrypted_data_key ||
        !entry.data_key_iv ||
        !entry.encrypted_content ||
        !entry.content_iv
      ) {
        console.warn(`Missing encryption fields for entry ${entry.id}`);
        continue;
      }

      const dataKey = await encryptionService.decryptKey(
        { encryptedData: entry.encrypted_data_key, iv: entry.data_key_iv },
        masterKey
      );

      let content = await encryptionService.decryptText(
        entry.encrypted_content,
        entry.content_iv,
        dataKey
      );

      // Truncate if too long
      if (content.length > CONFIG.MAX_CONTENT_LENGTH) {
        content = content.substring(0, CONFIG.MAX_CONTENT_LENGTH) + "...";
      }

      decryptedEntries.push({
        id: entry.id,
        content,
        created_at: entry.created_at,
      });
    } catch (err) {
      console.warn(`Failed to decrypt entry ${entry.id}:`, err.message);
    }
  }

  return decryptedEntries;
}

// --- CREATE BATCH REQUEST FOR TIP GENERATION ---
async function createTipGenerationRequest(goal, goalTitle, entries, masterKey) {
  if (entries.length === 0) {
    // No entries to base tips on - use generic approach
    const prompt = `
Generate 4-6 personalized, specific, and actionable tips for someone whose goal is: "${goalTitle}"

Guidelines:
- Make tips specific and actionable (not vague like "stay motivated")
- Include psychological insights where relevant
- Focus on practical strategies
- Consider common challenges people face with this type of goal
- Format as a JSON array of strings: ["tip1", "tip2", "tip3", "tip4", "tip5", "tip6"]

Return ONLY the JSON array, no other text.
    `.trim();

    return {
      custom_id: `goal_${goal.id}`,
      method: "POST",
      url: "/v1/chat/completions",
      body: {
        model: CONFIG.MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an expert life coach specializing in personalized goal achievement strategies. Always return valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: CONFIG.TEMPERATURE,
        max_tokens: CONFIG.MAX_TOKENS,
        response_format: { type: "json_object" },
      },
    };
  }

  // Create context from journal entries
  const entryContext = entries
    .map((entry) => `[${entry.created_at.split("T")[0]}] ${entry.content}`)
    .join("\n\n---\n\n");

  const prompt = `
Based on the following journal entries about the goal "${goalTitle}", generate 4-6 personalized, specific, and actionable tips.

GOAL: ${goalTitle}

JOURNAL ENTRIES (last 3 months):
${entryContext}

Guidelines:
- Address specific challenges, patterns, or situations mentioned in the journal entries
- Build on what's working and help overcome what's not working
- Reference specific contexts from the entries when relevant
- Make tips actionable and specific to this person's experience
- Include psychological insights that relate to their specific situation
- Format as a JSON object: {"tips": ["tip1", "tip2", "tip3", "tip4", "tip5", "tip6"]}

Return ONLY the JSON object, no other text.
  `.trim();

  return {
    custom_id: `goal_${goal.id}`,
    method: "POST",
    url: "/v1/chat/completions",
    body: {
      model: CONFIG.MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert life coach and psychologist specializing in personalized goal achievement strategies. Analyze the provided journal entries to create highly personalized tips. Always return valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: CONFIG.TEMPERATURE,
      max_tokens: CONFIG.MAX_TOKENS,
      response_format: { type: "json_object" },
    },
  };
}

// --- MAIN HANDLER ---
export default async function handler(req, res) {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: "Supabase configuration missing" });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("==== Starting batch tips generator process... ====");

    // 1. Get goals that need tip updates
    const goals = await getGoalsNeedingTips();

    if (!goals || goals.length === 0) {
      console.log("No goals need tip updates");
      return res.status(200).json({ message: "No goals need tip updates." });
    }

    console.log(`Found ${goals.length} goals that need tip updates`);

    // 2. Get master key for decryption
    const masterKey = await encryptionService.getStaticMasterKey();

    // 3. Process each goal to create batch requests
    const batchRequests = [];
    const goalMeta = {}; // Store metadata for processing results later

    for (const goal of goals) {
      try {
        // Decrypt goal title
        const dataKey = await encryptionService.decryptKey(
          { encryptedData: goal.encrypted_data_key, iv: goal.data_key_iv },
          masterKey
        );
        const goalTitle = await encryptionService.decryptText(
          goal.encrypted_goal,
          goal.goal_iv,
          dataKey
        );

        // Get relevant journal entries
        const entries = await getRelevantJournalEntries(
          goal.user_id,
          goal.id,
          masterKey
        );

        console.log(
          `Goal "${goalTitle}": Found ${entries.length} relevant journal entries`
        );

        // Create batch request
        const request = await createTipGenerationRequest(
          goal,
          goalTitle,
          entries,
          masterKey
        );

        batchRequests.push(request);
        goalMeta[`goal_${goal.id}`] = {
          goal_id: goal.id,
          user_id: goal.user_id,
          title: goalTitle,
          entry_count: entries.length,
        };

        // Debug mode: only process one goal
        if (CONFIG.DEBUG_MODE) {
          console.log("DEBUG MODE: Processing only one goal");
          break;
        }
      } catch (err) {
        console.error(`Failed to process goal ${goal.id}:`, err.message);
      }
    }

    if (batchRequests.length === 0) {
      return res
        .status(500)
        .json({ error: "No valid batch requests could be created" });
    }

    // 4. Write batch input to file
    const filePath = path.join("/tmp", `tips_batch_${Date.now()}.jsonl`);
    const jsonlContent = batchRequests
      .map((req) => JSON.stringify(req))
      .join("\n");
    await fsp.writeFile(filePath, jsonlContent, "utf8");
    console.log(`Wrote batch input to file: ${filePath}`);

    // 5. Upload file to OpenAI
    let file;
    try {
      file = await openai.files.create({
        file: fs.createReadStream(filePath),
        purpose: "batch",
      });
      console.log("OpenAI file upload response:", file);
    } catch (err) {
      console.error("Failed to upload file to OpenAI:", err);
      return res.status(500).json({
        error: "Failed to upload file to OpenAI",
        details: err.message,
      });
    }

    if (!file || !file.id) {
      return res.status(500).json({
        error: "File upload failed, no file id",
        details: file,
      });
    }

    // 6. Create batch job
    let batch;
    try {
      batch = await openai.batches.create({
        input_file_id: file.id,
        endpoint: "/v1/chat/completions",
        completion_window: "24h",
      });
      console.log("Batch job started:", batch);
    } catch (err) {
      console.error("Failed to create batch job:", err);
      return res.status(500).json({
        error: "Failed to create batch job",
        details: err.message,
      });
    }

    // 7. Store batch job info in database
    try {
      await supabase.from("batch_jobs").insert([
        {
          batch_id: batch.id,
          file_id: file.id,
          started_at: new Date().toISOString(),
          status: batch.status,
          input_count: batchRequests.length,
          total_entries: goals.length,
          job_type: "tips_generation", // New field to distinguish job types
          metadata: goalMeta, // Store goal metadata for result processing
        },
      ]);
      console.log("Tips batch job info inserted into batch_jobs table.");
    } catch (insertError) {
      console.error("Failed to save batch job info:", insertError);
    }

    return res.status(200).json({
      message: "Tips generation batch job started successfully",
      batch_id: batch.id,
      file_id: file.id,
      goals_processed: batchRequests.length,
      total_goals: goals.length,
      status: batch.status,
    });
  } catch (error) {
    console.error("Tips batch processing error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
