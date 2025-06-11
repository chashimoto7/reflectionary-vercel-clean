// pages/api/test-endpoint.js
// Super simple test to make sure API routes work

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    return res.status(200).json({
      message: "GET test successful!",
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method === "POST") {
    return res.status(200).json({
      message: "POST test successful!",
      body: req.body,
      timestamp: new Date().toISOString(),
    });
  }

  // If we get here, method not allowed
  res.status(405).json({ error: `Method ${req.method} not allowed` });
}
