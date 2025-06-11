// pages/api/manual-generate-tips.js
// This is a simple endpoint for testing - you can call it manually to generate tips for a specific goal

import { createClient } from "@supabase/supabase-js";
import encryptionService from "../src/services/encryptionService";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { goal_id, user_id } = req.body;

  if (!goal_id && !user_id) {
    return res.status(400).json({
      error:
        "Provide either goal_id for a specific goal, or user_id for all user's goals",
    });
  }

  try {
    console.log("🎯 Manual tips generation triggered");

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

    // Now trigger the batch process
    const batchResponse = await fetch(
      `${
        req.headers.origin || "http://localhost:3000"
      }/api/start-batch-tips-generator`,
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
    });
  } catch (error) {
    console.error("Manual tips generation error:", error);
    res.status(500).json({
      error: "Failed to trigger tips generation",
      details: error.message,
    });
  }
}
