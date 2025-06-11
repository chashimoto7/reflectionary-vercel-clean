// api/start-batch-tips-generator.js
// Main tips generation batch processor for Vite

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

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
  DAYS_BACK: 90, // 3 months
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
  MODEL: "gpt-4o-mini",
  MAX_CONTENT_LENGTH: 15000,
  DEBUG_MODE: false,
};

// Get goals that need tip updates
async function getGoalsNeedingTips() {
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

// Simple encryption service mock (you'll need to import your real one)
const encryptionService = {
  async getStaticMasterKey() {
    // You'll need to implement this based on your encryption setup
    const STATIC_MASTER_KEY_HEX =
      process.env.VITE_MASTER_DECRYPTION_KEY ||
      process.env.MASTER_DECRYPTION_KEY;
    if (!STATIC_MASTER_KEY_HEX) {
      throw new Error("Master decryption key not found");
    }
    return Buffer.from(STATIC_MASTER_KEY_HEX, "hex");
  },

  async decryptKey(encryptedKey, masterKey) {
    // Simplified - you'll need your actual decryption logic
    return Buffer.from("dummy-key"); // Replace with real implementation
  },

  async decryptText(encryptedText, iv, dataKey) {
    // Simplified - you'll need your actual decryption logic
    return "Dummy Goal Title"; // Replace with real implementation
  },
};

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
    console.log("==== Starting batch tips generator process... ====");

    // 1. Get goals that need tip updates
    const goals = await getGoalsNeedingTips();

    if (!goals || goals.length === 0) {
      console.log("No goals need tip updates");
      return res.status(200).json({ message: "No goals need tip updates." });
    }

    console.log(`Found ${goals.length} goals that need tip updates`);

    // For now, just return the count - we'll implement the full batch logic next
    return res.status(200).json({
      message: "Tips batch generator started successfully",
      goals_found: goals.length,
      next_step: "Implement full batch processing",
      debug: {
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasSupabase: !!process.env.SUPABASE_URL,
        config: CONFIG,
      },
    });
  } catch (error) {
    console.error("Tips batch processing error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
