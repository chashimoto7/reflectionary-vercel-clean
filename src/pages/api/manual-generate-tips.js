// pages/api/manual-generate-tips.js
// Fixed version with proper CORS and import handling

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
    console.log("Request body:", req.body);

    const { goal_id, user_id } = req.body;

    if (!goal_id && !user_id) {
      return res.status(400).json({
        error:
          "Provide either goal_id for a specific goal, or user_id for all user's goals",
      });
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
        baseUrl,
      },
    });
  } catch (error) {
    console.error("Manual tips generation error:", error);
    res.status(500).json({
      error: "Failed to trigger tips generation",
      details: error.message,
    });
  }
}
