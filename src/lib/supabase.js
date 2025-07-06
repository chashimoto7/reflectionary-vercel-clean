import { createClient } from "@supabase/supabase-js";

// Determine which database to use based on demo mode
const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

const supabaseUrl = isDemoMode
  ? import.meta.env.VITE_DEMO_SUPABASE_URL
  : import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey = isDemoMode
  ? import.meta.env.VITE_DEMO_SUPABASE_ANON_KEY
  : import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log which database we're using (helpful for debugging)
if (isDemoMode) {
  console.log("🎭 DEMO MODE: Using demo database");
} else {
  console.log("🏠 Using production database");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Expose to window for debugging
if (typeof window !== "undefined") {
  window.supabase = supabase;
  window.isDemoMode = isDemoMode;
}
