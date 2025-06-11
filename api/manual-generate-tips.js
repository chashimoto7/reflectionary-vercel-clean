// api/manual-generate-tips.js (note: /api not /pages/api)
// Vite-compatible version with proper body parsing

import { createClient } from "@supabase/supabase-js";

// Debug environment variables
console.log("Environment check:", {
  hasSupabaseUrl: !!process.env.SUPABASE_URL,
  hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
  hasOpenAIKey: !!process.env.OPENAI_API_KEY,
  // Don't log actual values for security
});

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL environment variable is required");
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_SERVICE_KEY environment variable is required");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Helper function to parse JSON body for Vercel serverless
async function parseBody(req) {
  if (req.body) {
    // Body is already parsed (newer Vercel runtime)
    return req.body;
  }

  // Manual parsing for older runtime or edge cases
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error(`Invalid JSON: ${error.message}`));
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  console.log(`🔍 Received ${req.method} request to manual-generate-tips`);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      allowedMethods: ["POST"],
      receivedMethod: req.method,
    });
  }

  try {
    console.log("🎯 Manual tips generation triggered");

    // Parse the request body properly
    const body = await parseBody(req);
    console.log("Request body:", body);

    const { goal_id, user_id } = body;

    if (!goal_id && !user_id) {
      return res.status(400).json({
        error:
          "Provide either goal_id for a specific goal, or user_id for all user's goals",
        received: { goal_id, user_id },
        bodyType: typeof body,
      });
    }

    // Test Supabase connection first
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error("Supabase environment variables not configured");
    }

    // If specific goal_id provided, update just that goal
    if (goal_id) {
      const { error } = await supabase
        .from("user_goals")
        .update({ tips_last_generated: null }) // Force regeneration
        .eq("id", goal_id);

      if (error) throw error;
      console.log(`✅ Forced regeneration for goal ${goal_id}`);
    }

    // If user_id provided, update all their goals
    if (user_id && !goal_id) {
      const { error } = await supabase
        .from("user_goals")
        .update({ tips_last_generated: null }) // Force regeneration
        .eq("user_id", user_id);

      if (error) throw error;
      console.log(`✅ Forced regeneration for all goals of user ${user_id}`);
    }

    // Determine the base URL for the batch API call
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    console.log(
      `Making batch request to: ${baseUrl}/api/start-batch-tips-generator`
    );

    // Now trigger the batch process
    const batchResponse = await fetch(
      `${baseUrl}/api/start-batch-tips-generator`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const batchData = await batchResponse.json();

    if (!batchResponse.ok) {
      throw new Error(batchData.error || "Failed to start batch process");
    }

    res.json({
      message: "Tips generation started successfully",
      batch_info: batchData,
      debug: {
        goal_id,
        user_id,
        method: req.method,
        hasSupabaseConfig: !!(
          process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
        ),
        framework: "Vite + Vercel",
        bodyParsed: true,
      },
    });
  } catch (error) {
    console.error("Manual tips generation error:", error);
    res.status(500).json({
      error: "Failed to trigger tips generation",
      details: error.message,
      stack: error.stack,
    });
  }
}
