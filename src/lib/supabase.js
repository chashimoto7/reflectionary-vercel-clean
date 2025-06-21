import { createClient } from "@supabase/supabase-js";

// Detect if this is a demo environment
function isDemoEnvironment() {
  // Check URL hostname
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const search = window.location.search;

    // Demo subdomain
    if (hostname.includes("demo.")) return true;

    // Demo parameter
    if (search.includes("demo=true")) return true;

    // Demo route
    if (window.location.pathname.startsWith("/demo")) return true;
  }

  // Check environment variable
  if (import.meta.env.VITE_APP_MODE === "demo") return true;

  return false;
}

// Get appropriate Supabase configuration
function getSupabaseConfig() {
  const isDemo = isDemoEnvironment();

  if (isDemo) {
    console.log("🎭 DEMO MODE ACTIVATED");
    return {
      url:
        import.meta.env.VITE_DEMO_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL,
      key:
        import.meta.env.VITE_DEMO_SUPABASE_ANON_KEY ||
        import.meta.env.VITE_SUPABASE_ANON_KEY,
      isDemo: true,
    };
  }

  console.log("🏠 PRODUCTION MODE");
  return {
    url: import.meta.env.VITE_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY,
    isDemo: false,
  };
}

const config = getSupabaseConfig();
export const supabase = createClient(config.url, config.key);
export const isDemo = config.isDemo;

// Helper function to handle demo database fallbacks
export const handleDemoFallback = (error, fallbackData = null) => {
  if (isDemo && error?.message?.includes("400")) {
    console.warn("Demo database missing data, using fallback:", fallbackData);
    return { data: fallbackData, error: null };
  }
  return { data: null, error };
};
