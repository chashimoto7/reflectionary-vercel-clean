// pages/api/test-endpoint.js
// Legacy Next.js compatible version

export default function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  console.log(`🔍 Received ${req.method} request`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  if (req.method === "OPTIONS") {
    console.log("✅ Handling OPTIONS request");
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    console.log("✅ Handling GET request");
    return res.status(200).json({
      message: "GET test successful!",
      timestamp: new Date().toISOString(),
      headers: req.headers,
    });
  }

  if (req.method === "POST") {
    console.log("✅ Handling POST request");
    return res.status(200).json({
      message: "POST test successful!",
      body: req.body,
      timestamp: new Date().toISOString(),
      contentType: req.headers["content-type"],
    });
  }

  // If we get here, method not allowed
  console.log(`❌ Method ${req.method} not allowed`);
  return res.status(405).json({
    error: `Method ${req.method} not allowed`,
    allowedMethods: ["GET", "POST", "OPTIONS"],
  });
}
