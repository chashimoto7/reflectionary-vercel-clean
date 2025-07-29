import React, { useState } from "react";
import {
  Bug,
  AlertTriangle,
  Loader2,
  Server,
  Code,
  CheckCircle,
  XCircle,
} from "lucide-react";

const BackendErrorDebugger = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const debugBackendError = async () => {
    setIsLoading(true);
    setTestResults({});
    setLogs([]);

    addLog("🐛 Starting backend error diagnosis...", "info");

    try {
      const backendUrl =
        import.meta.env.VITE_API_URL || "https://reflectionary-api.vercel.app";
      const token = localStorage.getItem("token");

      addLog(`🌐 Backend URL: ${backendUrl}`, "info");
      addLog(`🔑 Token present: ${!!token}`, "info");

      // Test 1: Check if the endpoint exists at all
      addLog("📡 Testing if Polly endpoint exists...", "info");
      try {
        const response = await fetch(`${backendUrl}/api/tts/polly`, {
          method: "OPTIONS", // Just check if endpoint exists
        });

        addLog(
          `📊 OPTIONS request status: ${response.status}`,
          response.ok ? "success" : "error"
        );

        if (response.status === 404) {
          addLog("❌ Endpoint not found - deployment issue", "error");
          setTestResults((prev) => ({ ...prev, endpointExists: false }));
          return;
        } else {
          addLog("✅ Endpoint exists", "success");
          setTestResults((prev) => ({ ...prev, endpointExists: true }));
        }
      } catch (error) {
        addLog(`❌ Endpoint test failed: ${error.message}`, "error");
        setTestResults((prev) => ({
          ...prev,
          endpointExists: false,
          endpointError: error.message,
        }));
      }

      // Test 2: Detailed POST request with response inspection
      addLog("🔍 Testing POST request with detailed error capture...", "info");
      try {
        const response = await fetch(`${backendUrl}/api/tts/polly`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || "test-token"}`,
          },
          body: JSON.stringify({
            text: "Hello test",
            voice: "ruth",
            engine: "neural",
            isTherapy: true,
          }),
        });

        addLog(
          `📊 POST Response Status: ${response.status} ${response.statusText}`,
          response.ok ? "success" : "error"
        );

        // Log all response headers
        addLog("📋 Response Headers:", "info");
        for (const [key, value] of response.headers.entries()) {
          addLog(`   ${key}: ${value}`, "info");
        }

        const contentType = response.headers.get("content-type");
        addLog(`📄 Content-Type: ${contentType}`, "info");

        let responseData;
        let isAudio = false;

        if (contentType && contentType.includes("audio")) {
          // It's audio - success!
          responseData = await response.blob();
          isAudio = true;
          addLog(`✅ Received audio: ${responseData.size} bytes`, "success");
          setTestResults((prev) => ({
            ...prev,
            audioGeneration: true,
            audioSize: responseData.size,
            audioUrl: URL.createObjectURL(responseData),
          }));
        } else if (contentType && contentType.includes("json")) {
          // JSON response (likely error)
          responseData = await response.json();
          addLog("📋 JSON Response:", "info");
          addLog(JSON.stringify(responseData, null, 2), "info");

          if (!response.ok) {
            addLog("❌ Backend returned JSON error:", "error");
            addLog(
              `   Error: ${responseData.error || "Unknown error"}`,
              "error"
            );
            if (responseData.details) {
              addLog(`   Details: ${responseData.details}`, "error");
            }
            setTestResults((prev) => ({
              ...prev,
              audioGeneration: false,
              backendError: responseData,
            }));
          }
        } else {
          // Text response (likely error)
          responseData = await response.text();
          addLog("📋 Text Response:", "info");
          addLog(responseData, "info");

          if (!response.ok) {
            addLog("❌ Backend returned text error:", "error");
            setTestResults((prev) => ({
              ...prev,
              audioGeneration: false,
              backendError: responseData,
            }));
          }
        }

        // Analyze specific error patterns
        if (!isAudio && !response.ok) {
          const errorStr = JSON.stringify(responseData).toLowerCase();

          if (
            errorStr.includes("module not found") ||
            errorStr.includes("cannot resolve")
          ) {
            addLog("🔍 ISSUE: Missing dependency in backend", "error");
            addLog("   👉 Likely: AWS SDK not installed properly", "error");
          } else if (
            errorStr.includes("credentials") ||
            errorStr.includes("access key")
          ) {
            addLog("🔍 ISSUE: AWS credentials problem", "error");
            addLog("   👉 Check: Environment variables in Vercel", "error");
          } else if (errorStr.includes("region")) {
            addLog("🔍 ISSUE: AWS region problem", "error");
            addLog("   👉 Check: AWS_REGION environment variable", "error");
          } else if (
            errorStr.includes("timeout") ||
            errorStr.includes("network")
          ) {
            addLog("🔍 ISSUE: Network/timeout problem", "error");
            addLog("   👉 Vercel function might be timing out", "error");
          } else if (
            errorStr.includes("syntax") ||
            errorStr.includes("parse")
          ) {
            addLog("🔍 ISSUE: Code syntax error in backend", "error");
            addLog("   👉 Check: Backend deployment logs", "error");
          } else {
            addLog("🔍 ISSUE: Unknown backend error", "error");
            addLog("   👉 Check: Vercel function logs for details", "error");
          }
        }
      } catch (fetchError) {
        addLog(`❌ Network error: ${fetchError.message}`, "error");
        setTestResults((prev) => ({
          ...prev,
          audioGeneration: false,
          networkError: fetchError.message,
        }));
      }

      // Test 3: Try a minimal request to isolate the issue
      addLog("🧪 Testing minimal request to isolate issue...", "info");
      try {
        const minimalResponse = await fetch(`${backendUrl}/api/tts/polly`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer test-token`,
          },
          body: JSON.stringify({
            text: "Hi",
          }),
        });

        addLog(
          `📊 Minimal request status: ${minimalResponse.status}`,
          minimalResponse.ok ? "success" : "error"
        );

        if (minimalResponse.status !== 500) {
          addLog(
            "💡 Different status with minimal request - input validation issue?",
            "warning"
          );
        }
      } catch (minimalError) {
        addLog(`❌ Minimal request failed: ${minimalError.message}`, "error");
      }
    } catch (error) {
      addLog(`❌ Complete test failed: ${error.message}`, "error");
      setTestResults((prev) => ({
        ...prev,
        completeFailure: true,
        error: error.message,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const playTestAudio = () => {
    if (testResults.audioUrl) {
      const audio = new Audio(testResults.audioUrl);
      audio.play().catch((error) => {
        addLog(`❌ Playback failed: ${error.message}`, "error");
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <Bug className="w-8 h-8 text-orange-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">
            Backend Error Debugger
          </h2>
          <p className="text-gray-300">
            Deep dive into the 500 Internal Server Error
          </p>
        </div>
      </div>

      {/* Test Button */}
      <div className="mb-6">
        <button
          onClick={debugBackendError}
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 rounded-xl text-white font-medium transition-all flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Bug className="w-5 h-5" />
          )}
          {isLoading ? "Debugging Backend..." : "Debug 500 Error"}
        </button>
      </div>

      {/* Quick Status Cards */}
      {Object.keys(testResults).length > 0 && (
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Backend Status</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Endpoint Exists */}
            <div
              className={`p-4 rounded-lg border ${
                testResults.endpointExists
                  ? "bg-green-500/10 border-green-500/50"
                  : "bg-red-500/10 border-red-500/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {testResults.endpointExists ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="font-medium text-white">
                  Endpoint Deployed
                </span>
              </div>
            </div>

            {/* Audio Generation */}
            <div
              className={`p-4 rounded-lg border ${
                testResults.audioGeneration
                  ? "bg-green-500/10 border-green-500/50"
                  : "bg-red-500/10 border-red-500/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {testResults.audioGeneration ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="font-medium text-white">Audio Generation</span>
              </div>
              {testResults.audioSize && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-300">
                    Size: {testResults.audioSize} bytes
                  </p>
                  <button
                    onClick={playTestAudio}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-xs"
                  >
                    Play
                  </button>
                </div>
              )}
            </div>

            {/* Overall Status */}
            <div
              className={`p-4 rounded-lg border ${
                testResults.audioGeneration
                  ? "bg-green-500/10 border-green-500/50"
                  : "bg-orange-500/10 border-orange-500/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-5 h-5 text-white" />
                <span className="font-medium text-white">
                  {testResults.audioGeneration
                    ? "All Working!"
                    : "Issue Detected"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Details */}
      {(testResults.backendError || testResults.networkError) && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <h4 className="font-medium text-white mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Backend Error Details
          </h4>
          {testResults.backendError && (
            <pre className="text-xs text-gray-300 bg-black/30 p-3 rounded overflow-x-auto mb-2">
              {typeof testResults.backendError === "string"
                ? testResults.backendError
                : JSON.stringify(testResults.backendError, null, 2)}
            </pre>
          )}
          {testResults.networkError && (
            <p className="text-sm text-red-300">
              Network Error: {testResults.networkError}
            </p>
          )}
        </div>
      )}

      {/* Detailed Logs */}
      {logs.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Debug Logs</h3>
          <div className="bg-black/30 rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`mb-1 ${
                  log.type === "error"
                    ? "text-red-400"
                    : log.type === "success"
                    ? "text-green-400"
                    : log.type === "warning"
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              >
                <span className="text-gray-500">[{log.timestamp}]</span>{" "}
                {log.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
        <h4 className="font-medium text-white mb-2">
          🔧 Common 500 Error Causes:
        </h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>
            • <strong>Missing AWS SDK:</strong> @aws-sdk/client-polly not
            installed in backend
          </li>
          <li>
            • <strong>Environment Variables:</strong> Missing or incorrect AWS
            credentials in Vercel
          </li>
          <li>
            • <strong>Import Errors:</strong> Incorrect require/import
            statements in backend
          </li>
          <li>
            • <strong>Syntax Errors:</strong> Code compilation issues in
            deployed functions
          </li>
          <li>
            • <strong>Timeout:</strong> AWS requests taking too long (Vercel 10s
            limit)
          </li>
          <li>
            • <strong>Memory Limit:</strong> Function running out of memory
          </li>
        </ul>
        <p className="text-sm text-yellow-300 mt-2">
          💡 <strong>Next:</strong> Check your Vercel function logs at
          vercel.com → your-project → Functions tab
        </p>
      </div>
    </div>
  );
};

export default BackendErrorDebugger;
