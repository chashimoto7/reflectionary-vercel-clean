// pages/api/manual-generate-tips.js
// Simplified version to test POST functionality first

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  console.log(`Received ${req.method} request to manual-generate-tips`);

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

    // For now, just return success without actually doing the work
    // We'll add the real functionality once POST is working
    res.json({
      message: "Tips generation request received successfully",
      debug: {
        goal_id,
        user_id,
        method: req.method,
        hasSupabaseConfig: !!(
          process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
        ),
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

export default handler;
