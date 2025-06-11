// api/debug-env.js
// Debug endpoint to check environment variables

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check which environment variables are available
  const envCheck = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    // Show first/last 4 chars for verification without exposing secrets
    SUPABASE_URL_PREVIEW: process.env.SUPABASE_URL
      ? `${process.env.SUPABASE_URL.substring(
          0,
          4
        )}...${process.env.SUPABASE_URL.slice(-4)}`
      : "Not set",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };

  console.log("Environment variables check:", envCheck);

  return res.status(200).json({
    message: "Environment variables debug",
    environment: envCheck,
    timestamp: new Date().toISOString(),
  });
}
