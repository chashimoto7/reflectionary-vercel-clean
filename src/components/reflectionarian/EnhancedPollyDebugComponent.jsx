import React, { useState } from "react";
import {
  Volume2,
  AlertCircle,
  CheckCircle,
  Loader2,
  Play,
  Settings,
  Wifi,
  WifiOff,
  Server,
} from "lucide-react";

const EnhancedPollyDebug = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const testBackendHealth = async () => {
    setIsLoading(true);
    setTestResults({});
    setLogs([]);

    addLog("🔍 Starting comprehensive Polly diagnostics...", "info");

    try {
      const backendUrl =
        import.meta.env.VITE_API_URL || "https://reflectionary-api.vercel.app";
      addLog(`🌐 Backend URL: ${backendUrl}`, "info");

      // Test 1: Basic connectivity
      addLog("📡 Testing basic backend connectivity...", "info");
      try {
        const healthResponse = await fetch(`${backendUrl}/api/health`, {
          method: "GET",
        });

        if (healthResponse.ok) {
          addLog("✅ Backend is reachable", "success");
          setTestResults((prev) => ({ ...prev, connectivity: true }));
        } else {
          addLog(
            `⚠️ Backend health check failed: ${healthResponse.status}`,
            "warning"
          );
          setTestResults((prev) => ({ ...prev, connectivity: false }));
        }
      } catch (healthError) {
        addLog(
          `❌ Backend connectivity failed: ${healthError.message}`,
          "error"
        );
        setTestResults((prev) => ({ ...prev, connectivity: false }));
      }

      // Test 2: Auth token
      const token = localStorage.getItem("token");
      addLog(
        `🔑 Auth token present: ${!!token}`,
        token ? "success" : "warning"
      );
      if (token) {
        addLog(`🔑 Token length: ${token.length} characters`, "info");
        addLog(`🔑 Token starts with: ${token.substring(0, 20)}...`, "info");
      }

      // Test 3: Polly GET endpoint (voice options)
      addLog("🗣️ Testing Polly voice options endpoint...", "info");
      try {
        const voicesResponse = await fetch(`${backendUrl}/api/tts/polly`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token || "test-token"}`,
          },
        });

        addLog(
          `📊 Voice options response status: ${voicesResponse.status}`,
          voicesResponse.ok ? "success" : "error"
        );

        if (voicesResponse.ok) {
          const voicesData = await voicesResponse.json();
          addLog(
            `✅ Neural voices available: ${
              Object.keys(voicesData.voices.neural).length
            }`,
            "success"
          );
          addLog(
            `📋 Neural voices: ${Object.keys(voicesData.voices.neural).join(
              ", "
            )}`,
            "info"
          );
          setTestResults((prev) => ({
            ...prev,
            voicesEndpoint: true,
            voices: voicesData,
          }));
        } else {
          const errorText = await voicesResponse.text();
          addLog(`❌ Voice options failed: ${errorText}`, "error");
          setTestResults((prev) => ({
            ...prev,
            voicesEndpoint: false,
            voicesError: errorText,
          }));
        }
      } catch (voicesError) {
        addLog(
          `❌ Voice options request failed: ${voicesError.message}`,
          "error"
        );
        setTestResults((prev) => ({
          ...prev,
          voicesEndpoint: false,
          voicesError: voicesError.message,
        }));
      }

      // Test 4: Minimal audio generation
      addLog("🎵 Testing minimal audio generation...", "info");
      try {
        const audioResponse = await fetch(`${backendUrl}/api/tts/polly`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || "test-token"}`,
          },
          body: JSON.stringify({
            text: "Test",
            voice: "ruth",
            engine: "neural",
            isTherapy: true,
          }),
        });

        addLog(
          `📊 Audio generation status: ${audioResponse.status}`,
          audioResponse.ok ? "success" : "error"
        );

        // Log response headers for debugging
        addLog(`📋 Response headers:`, "info");
        for (const [key, value] of audioResponse.headers.entries()) {
          addLog(`   ${key}: ${value}`, "info");
        }

        if (audioResponse.ok) {
          const audioBlob = await audioResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob);

          addLog(`✅ Audio generated: ${audioBlob.size} bytes`, "success");
          addLog(
            `🎤 Voice: ${
              audioResponse.headers.get("X-Voice-Used") || "unknown"
            }`,
            "info"
          );
          addLog(
            `⚙️ Engine: ${
              audioResponse.headers.get("X-Engine-Used") || "unknown"
            }`,
            "info"
          );

          setTestResults((prev) => ({
            ...prev,
            audioGeneration: true,
            audioUrl,
            audioSize: audioBlob.size,
          }));
        } else {
          // Get detailed error response
          const contentType = audioResponse.headers.get("content-type");
          let errorDetails;

          if (contentType && contentType.includes("application/json")) {
            errorDetails = await audioResponse.json();
          } else {
            errorDetails = await audioResponse.text();
          }

          addLog(`❌ Audio generation failed:`, "error");
          addLog(
            `📋 Error details: ${JSON.stringify(errorDetails, null, 2)}`,
            "error"
          );
          setTestResults((prev) => ({
            ...prev,
            audioGeneration: false,
            audioError: errorDetails,
          }));
        }
      } catch (audioError) {
        addLog(
          `❌ Audio generation request failed: ${audioError.message}`,
          "error"
        );
        setTestResults((prev) => ({
          ...prev,
          audioGeneration: false,
          audioError: audioError.message,
        }));
      }

      // Test 5: Environment variables check (client-side detection)
      addLog("🔧 Environment check...", "info");
      addLog(
        `🌍 VITE_API_URL: ${import.meta.env.VITE_API_URL || "not set"}`,
        "info"
      );
      addLog(
        `🔐 Backend likely needs: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION`,
        "info"
      );
    } catch (error) {
      addLog(`❌ Complete test failed: ${error.message}`, "error");
      setTestResults((prev) => ({ ...prev, error: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const playTestAudio = () => {
    if (testResults.audioUrl) {
      addLog("🔊 Playing test audio...", "info");
      const audio = new Audio(testResults.audioUrl);
      audio
        .play()
        .then(() => addLog("✅ Audio playback started", "success"))
        .catch((error) =>
          addLog(`❌ Playback failed: ${error.message}`, "error")
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <Volume2 className="w-8 h-8 text-purple-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">
            Enhanced Polly Diagnostics
          </h2>
          <p className="text-gray-300">
            Deep debugging for 500 Internal Server Error
          </p>
        </div>
      </div>

      {/* Test Button */}
      <div className="mb-6">
        <button
          onClick={testBackendHealth}
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-xl text-white font-medium transition-all flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Settings className="w-5 h-5" />
          )}
          {isLoading ? "Running Deep Diagnostics..." : "Run Full Diagnostics"}
        </button>
      </div>

      {/* Test Results Grid */}
      {Object.keys(testResults).length > 0 && (
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Test Results</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Connectivity */}
            <div
              className={`p-4 rounded-lg border ${
                testResults.connectivity
                  ? "bg-green-500/10 border-green-500/50"
                  : "bg-red-500/10 border-red-500/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {testResults.connectivity ? (
                  <Wifi className="w-5 h-5 text-green-400" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-400" />
                )}
                <span className="font-medium text-white">
                  Backend Connectivity
                </span>
              </div>
            </div>

            {/* Voices Endpoint */}
            <div
              className={`p-4 rounded-lg border ${
                testResults.voicesEndpoint
                  ? "bg-green-500/10 border-green-500/50"
                  : "bg-red-500/10 border-red-500/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {testResults.voicesEndpoint ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="font-medium text-white">Voices Endpoint</span>
              </div>
              {testResults.voices && (
                <p className="text-xs text-gray-300">
                  Neural: {Object.keys(testResults.voices.neural).join(", ")}
                </p>
              )}
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
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="font-medium text-white">Audio Generation</span>
              </div>
              {testResults.audioGeneration && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-300">
                    Size: {testResults.audioSize} bytes
                  </p>
                  <button
                    onClick={playTestAudio}
                    className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-xs flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    Test Audio
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Details */}
      {(testResults.voicesError || testResults.audioError) && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <h4 className="font-medium text-white mb-2 flex items-center gap-2">
            <Server className="w-5 h-5" />
            Backend Error Details
          </h4>
          {testResults.voicesError && (
            <div className="mb-2">
              <p className="text-sm font-medium text-red-400">
                Voices Endpoint Error:
              </p>
              <pre className="text-xs text-gray-300 bg-black/30 p-2 rounded mt-1 overflow-x-auto">
                {typeof testResults.voicesError === "string"
                  ? testResults.voicesError
                  : JSON.stringify(testResults.voicesError, null, 2)}
              </pre>
            </div>
          )}
          {testResults.audioError && (
            <div>
              <p className="text-sm font-medium text-red-400">
                Audio Generation Error:
              </p>
              <pre className="text-xs text-gray-300 bg-black/30 p-2 rounded mt-1 overflow-x-auto">
                {typeof testResults.audioError === "string"
                  ? testResults.audioError
                  : JSON.stringify(testResults.audioError, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Detailed Logs
          </h3>
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
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
        <h4 className="font-medium text-white mb-2">
          If you see 500 errors, check:
        </h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>
            • <strong>Vercel Environment Variables:</strong> AWS_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY, AWS_REGION
          </li>
          <li>
            • <strong>AWS Permissions:</strong> Your keys need
            "polly:SynthesizeSpeech" permission
          </li>
          <li>
            • <strong>Backend Logs:</strong> Check Vercel function logs for the
            actual error
          </li>
          <li>
            • <strong>Network:</strong> Ensure your backend can reach AWS
            services
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedPollyDebug;
