// api/process-batch-tips-results.js
// Process completed batch results for Vite

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

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

async function getTipsBatchJobsToProcess() {
  const { data, error } = await supabase
    .from("batch_jobs")
    .select("*")
    .eq("job_type", "tips_generation")
    .in("status", ["completed", "finalizing"]);

  if (error) throw error;
  return data;
}

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
      return res.status(200).json({
        message: "No completed tips batch jobs to process.",
      });
    }

    // For now, just return the job count - we'll implement processing next
    return res.status(200).json({
      message: "Tips batch processor started successfully",
      jobs_found: jobs.length,
      next_step: "Implement full result processing",
      debug: {
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasSupabase: !!process.env.SUPABASE_URL,
      },
    });
  } catch (error) {
    console.error("Tips batch processing error:", error);
    return res.status(500).json({
      error: "Failed to process tips batch results",
      details: error.message,
    });
  }
}
