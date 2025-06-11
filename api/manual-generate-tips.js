// api/manual-generate-tips.js (note: /api not /pages/api)
// Vite-compatible version

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
    console.log("Request body:", req.body);

    const { goal_id, user_id } = req.body;

    if (!goal_id && !user_id) {
      return res.status(400).json({
        error:
          "Provide either goal_id for a specific goal, or user_id for all user's goals",
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

    // For now, just return success - we'll add batch triggering once basic POST works
    res.json({
      message: "Tips generation request received successfully",
      debug: {
        goal_id,
        user_id,
        method: req.method,
        hasSupabaseConfig: !!(
          process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
        ),
        framework: "Vite + Vercel",
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
