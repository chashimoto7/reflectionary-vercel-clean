// api/process-batch-tips-results.js
// Process completed batch results for tips generation

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

// Get tips batch jobs that need processing
async function getTipsBatchJobsToProcess() {
  // Get ALL tips batch jobs, regardless of status
  const { data, error } = await supabase
    .from("batch_jobs")
    .select("*")
    .eq("job_type", "tips_generation")
    .order("started_at", { ascending: false });

  if (error) throw error;

  const jobsToProcess = [];

  // Check each job's real status at OpenAI
  for (const job of data || []) {
    try {
      console.log(
        `🔍 Checking OpenAI status for tips batch ${job.batch_id} (DB says: ${job.status})`
      );

      const openAIBatch = await openai.batches.retrieve(job.batch_id);
      console.log(`   OpenAI says: ${openAIBatch.status}`);

      // Update our DB if status changed
      if (job.status !== openAIBatch.status) {
        console.log(`   📝 Updating DB: ${job.status} → ${openAIBatch.status}`);

        await supabase
          .from("batch_jobs")
          .update({
            status: openAIBatch.status,
            file_id: openAIBatch.output_file_id || job.file_id,
          })
          .eq("batch_id", job.batch_id);

        // Update the job object for processing
        job.status = openAIBatch.status;
        job.file_id = openAIBatch.output_file_id || job.file_id;
      }

      // Only add completed jobs that haven't been processed yet
      if (openAIBatch.status === "completed" && job.status !== "processed") {
        console.log(`   ✅ Adding completed tips job to processing queue`);
        jobsToProcess.push(job);
      }
    } catch (error) {
      console.warn(
        `Failed to check tips batch ${job.batch_id}:`,
        error.message
      );
    }
  }

  console.log(
    `Found ${jobsToProcess.length} completed tips jobs ready for processing`
  );
  return jobsToProcess;
}

// Fetch batch results from OpenAI file
async function fetchBatchResultsFromFile(file_id) {
  const response = await fetch(
    `https://api.openai.com/v1/files/${file_id}/content`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch batch results from file");

  const text = await response.text();
  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

// Process and save tips for a goal
async function saveTipsToGoal(goalId, tips, masterKeyHex) {
  try {
    // Get the goal's data key for encryption
    const { data: goal, error } = await supabase
      .from("user_goals")
      .select("encrypted_data_key, data_key_iv, encrypted_goal, goal_iv")
      .eq("id", goalId)
      .single();

    if (error || !goal) {
      throw new Error(
        `Failed to fetch goal ${goalId}: ${error?.message || "Not found"}`
      );
    }

    // Decrypt the goal's data key
    const dataKey = decryptDataKey(
      goal.encrypted_data_key,
      goal.data_key_iv,
      masterKeyHex
    );

    // Encrypt the tips
    const tipsJson = JSON.stringify(tips);
    const encryptedTips = encryptText(tipsJson, dataKey);

    // Save to database
    const { error: updateError } = await supabase
      .from("user_goals")
      .update({
        encrypted_tips: encryptedTips.encryptedData,
        tips_iv: encryptedTips.iv,
        tips_last_generated: new Date().toISOString(),
      })
      .eq("id", goalId);

    if (updateError) {
      throw new Error(
        `Failed to save tips for goal ${goalId}: ${updateError.message}`
      );
    }

    console.log(
      `   ✅ Successfully saved ${tips.length} tips for goal ${goalId}`
    );
    return true;
  } catch (error) {
    console.error(
      `   ❌ Failed to save tips for goal ${goalId}:`,
      error.message
    );
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
    console.log("==== Processing tips batch results... ====");

    const jobs = await getTipsBatchJobsToProcess();
    if (!jobs.length) {
      console.log("No tips batch jobs pending results.");
      return res
        .status(200)
        .json({ message: "No tips batch jobs pending results." });
    }

    console.log(`Found ${jobs.length} completed tips batch jobs to process`);

    // Get master key
    const masterKeyHex =
      process.env.VITE.MASTER_DECRYPTION_KEY ||
      process.env.VITE.MASTER_ENCRYPTION_KEY;
    if (!masterKeyHex) {
      throw new Error(
        "Master decryption key not found in environment variables"
      );
    }

    let totalGoalsProcessed = 0;
    let totalTipsGenerated = 0;

    for (const job of jobs) {
      console.log(
        `\n🔄 Processing completed tips batch job ${job.batch_id}...`
      );
      console.log(`   Output file: ${job.file_id}`);

      const file_id = job.file_id;
      if (!file_id) {
        console.warn(
          `No output file_id for tips batch job ${job.batch_id}. Skipping.`
        );
        continue;
      }

      // Download and process results from output file
      let results;
      try {
        console.log(`   📥 Downloading tips results from file ${file_id}...`);
        results = await fetchBatchResultsFromFile(file_id);
        console.log(
          `   Found ${results.length} tip generation results in file`
        );
      } catch (err) {
        console.error(
          `Failed to fetch tips batch results for file_id ${file_id}:`,
          err.message
        );
        continue;
      }

      let jobGoalsProcessed = 0;
      let jobTipsGenerated = 0;

      for (const result of results) {
        const { custom_id, response } = result;

        try {
          // Parse the AI-generated tips
          const content = response.body.choices[0].message.content.trim();
          const tips = JSON.parse(content);

          if (!Array.isArray(tips) || tips.length === 0) {
            console.warn(`   ⚠️ Invalid tips format for goal ${custom_id}`);
            continue;
          }

          console.log(
            `   📝 Processing ${tips.length} tips for goal ${custom_id}`
          );

          // Save encrypted tips to the goal
          const saved = await saveTipsToGoal(custom_id, tips, masterKeyHex);

          if (saved) {
            jobGoalsProcessed++;
            jobTipsGenerated += tips.length;
          }
        } catch (parseError) {
          console.warn(
            `Failed to parse tips response for goal ${custom_id}:`,
            parseError.message
          );
          continue;
        }
      }

      // Update batch job as processed
      await supabase
        .from("batch_jobs")
        .update({
          status: "processed",
          finished_at: new Date().toISOString(),
        })
        .eq("batch_id", job.batch_id);

      console.log(`✅ Tips batch job ${job.batch_id} completed:`);
      console.log(`   - ${jobGoalsProcessed} goals processed`);
      console.log(`   - ${jobTipsGenerated} tips generated`);

      totalGoalsProcessed += jobGoalsProcessed;
      totalTipsGenerated += jobTipsGenerated;
    }

    console.log("\n==== Tips batch processing complete ====");
    console.log(`📊 Total results:`);
    console.log(`   - ${totalGoalsProcessed} goals processed`);
    console.log(`   - ${totalTipsGenerated} tips generated`);

    return res.status(200).json({
      message: "Tips batch jobs processed successfully",
      results: {
        jobs_processed: jobs.length,
        goals_processed: totalGoalsProcessed,
        tips_generated: totalTipsGenerated,
      },
    });
  } catch (err) {
    console.error("💥 Fatal tips batch processing error:", err);
    return res.status(500).json({ error: err.message });
  }
}
