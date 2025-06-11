// pages/api/process-batch-tips-results.js

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import encryptionService from "../src/services/encryptionService";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- HELPER FUNCTIONS ---

async function getTipsBatchJobsToProcess() {
  const { data, error } = await supabase
    .from("batch_jobs")
    .select("*")
    .eq("job_type", "tips_generation") // Only process tip generation jobs
    .in("status", ["completed", "finalizing"]);

  if (error) throw error;
  return data;
}

async function fetchBatchResultsFromFile(file_id) {
  const response = await fetch(
    `https://api.openai.com/v1/files/${file_id}/content`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch batch results from file");
  const text = await response.text();
  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

// --- ENCRYPT AND STORE TIPS ---
async function encryptAndStoreTips(goalId, tips, masterKey) {
  try {
    // Get the goal's data key for encryption
    const { data: goal, error } = await supabase
      .from("user_goals")
      .select("encrypted_data_key, data_key_iv")
      .eq("id", goalId)
      .single();

    if (error || !goal) {
      throw new Error(`Failed to fetch goal ${goalId} for encryption`);
    }

    // Decrypt the data key
    const dataKey = await encryptionService.decryptKey(
      { encryptedData: goal.encrypted_data_key, iv: goal.data_key_iv },
      masterKey
    );

    // Encrypt the tips
    const tipsText = JSON.stringify(tips);
    const { encryptedData, iv } = await encryptionService.encryptText(
      tipsText,
      dataKey
    );

    // Update the goal with encrypted tips
    const { error: updateError } = await supabase
      .from("user_goals")
      .update({
        encrypted_tips: encryptedData,
        tips_iv: iv,
        tips_last_generated: new Date().toISOString(),
      })
      .eq("id", goalId);

    if (updateError) {
      throw new Error(`Failed to save encrypted tips: ${updateError.message}`);
    }

    console.log(
      `✅ Successfully stored ${tips.length} tips for goal ${goalId}`
    );
    return true;
  } catch (err) {
    console.error(
      `❌ Failed to encrypt and store tips for goal ${goalId}:`,
      err.message
    );
    return false;
  }
}

// --- MAIN HANDLER ---
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    console.log("==== Processing tips batch results... ====");

    const jobs = await getTipsBatchJobsToProcess();
    if (!jobs.length) {
      res
        .status(200)
        .json({ message: "No completed tips batch jobs to process." });
      return;
    }

    const masterKey = await encryptionService.getStaticMasterKey();
    let totalTipsGenerated = 0;
    let successfulGoals = 0;
    let failedGoals = 0;

    for (const job of jobs) {
      console.log(`Processing batch job ${job.batch_id}...`);

      // Get the output file ID - for tips jobs, we use the same file_id for output
      const file_id = job.file_id;
      if (!file_id) {
        console.warn(`No file_id for batch job ${job.batch_id}. Skipping.`);
        continue;
      }

      // Check if batch is actually completed
      let batchStatus;
      try {
        const batchInfo = await openai.batches.retrieve(job.batch_id);
        batchStatus = batchInfo.status;

        if (batchStatus !== "completed") {
          console.log(
            `Batch ${job.batch_id} status is ${batchStatus}, skipping.`
          );
          continue;
        }

        // Update our database with the final status
        await supabase
          .from("batch_jobs")
          .update({ status: batchStatus })
          .eq("batch_id", job.batch_id);

        // Use the output file ID if available
        const outputFileId = batchInfo.output_file_id || file_id;

        // Download and process results
        const results = await fetchBatchResultsFromFile(outputFileId);
        console.log(
          `Retrieved ${results.length} results from batch ${job.batch_id}`
        );

        for (const result of results) {
          const { custom_id, response } = result;

          // Extract goal ID from custom_id (format: "goal_123")
          const goalId = custom_id.replace("goal_", "");

          try {
            if (response.body.choices && response.body.choices[0]) {
              const content = response.body.choices[0].message.content;
              let tips = [];

              try {
                const parsed = JSON.parse(content);

                // Handle different response formats
                if (Array.isArray(parsed)) {
                  tips = parsed;
                } else if (parsed.tips && Array.isArray(parsed.tips)) {
                  tips = parsed.tips;
                } else {
                  throw new Error("Unexpected response format");
                }

                // Validate tips
                tips = tips
                  .filter(
                    (tip) =>
                      tip && typeof tip === "string" && tip.trim().length > 0
                  )
                  .map((tip) => tip.trim())
                  .slice(0, 6); // Ensure max 6 tips

                if (tips.length === 0) {
                  throw new Error("No valid tips extracted from response");
                }

                // Encrypt and store the tips
                const success = await encryptAndStoreTips(
                  goalId,
                  tips,
                  masterKey
                );

                if (success) {
                  successfulGoals++;
                  totalTipsGenerated += tips.length;
                  console.log(
                    `✅ Goal ${goalId}: Generated ${tips.length} tips`
                  );
                } else {
                  failedGoals++;
                }
              } catch (parseError) {
                console.error(
                  `❌ Failed to parse tips for goal ${goalId}:`,
                  parseError.message
                );
                console.error("Raw response:", content);
                failedGoals++;
              }
            } else {
              console.error(`❌ No response body for goal ${goalId}`);
              failedGoals++;
            }
          } catch (err) {
            console.error(
              `❌ Error processing result for goal ${goalId}:`,
              err.message
            );
            failedGoals++;
          }
        }

        // Mark batch job as processed
        await supabase
          .from("batch_jobs")
          .update({
            status: "processed",
            finished_at: new Date().toISOString(),
          })
          .eq("batch_id", job.batch_id);

        console.log(`✅ Batch job ${job.batch_id} processed successfully`);
      } catch (err) {
        console.error(
          `❌ Failed to process batch job ${job.batch_id}:`,
          err.message
        );

        // Mark as failed
        await supabase
          .from("batch_jobs")
          .update({
            status: "failed",
            finished_at: new Date().toISOString(),
          })
          .eq("batch_id", job.batch_id);
      }
    }

    console.log("==== Tips batch processing complete ====");
    console.log(`✅ Successful goals: ${successfulGoals}`);
    console.log(`❌ Failed goals: ${failedGoals}`);
    console.log(`📝 Total tips generated: ${totalTipsGenerated}`);

    res.status(200).json({
      message: "Tips batch processing completed",
      successful_goals: successfulGoals,
      failed_goals: failedGoals,
      total_tips_generated: totalTipsGenerated,
      jobs_processed: jobs.length,
    });
  } catch (err) {
    console.error("❌ Tips batch processing error:", err);
    res.status(500).json({
      error: "Failed to process tips batch results",
      details: err.message,
    });
  }
}
