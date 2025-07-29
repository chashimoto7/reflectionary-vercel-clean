import React, { useState } from "react";
import {
  Volume2,
  AlertCircle,
  CheckCircle,
  Loader2,
  Play,
  Settings,
} from "lucide-react";

const PollyDebugComponent = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const testPollyConnection = async () => {
    setIsLoading(true);
    setTestResults({});
    setLogs([]);

    addLog("🔍 Starting Polly TTS diagnostics...", "info");

    try {
      // Test 1: Check if backend is accessible
      addLog("📡 Testing backend connection...", "info");
      const backendUrl =
        import.meta.env.VITE_API_URL || "https://reflectionary-api.vercel.app";

      const voicesResponse = await fetch(`${backendUrl}/api/tts/polly`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${
            localStorage.getItem("token") || "test-token"
          }`,
        },
      });

      if (voicesResponse.ok) {
        const voicesData = await voicesResponse.json();
        addLog("✅ Backend connection successful", "success");
        addLog(
          `🗣️ Found ${
            Object.keys(voicesData.voices.neural).length
          } neural voices`,
          "success"
        );
        setTestResults((prev) => ({
          ...prev,
          backendConnection: true,
          voices: voicesData,
        }));
      } else {
        const errorText = await voicesResponse.text();
        addLog(
          `❌ Backend connection failed: ${voicesResponse.status}`,
          "error"
        );
        addLog(`📋 Error details: ${errorText}`, "error");
        setTestResults((prev) => ({
          ...prev,
          backendConnection: false,
          backendError: errorText,
        }));
      }

      // Test 2: Try generating actual audio
      if (voicesResponse.ok) {
        addLog("🎵 Testing audio generation with Ruth voice...", "info");

        const audioResponse = await fetch(`${backendUrl}/api/tts/polly`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem("token") || "test-token"
            }`,
          },
          body: JSON.stringify({
            text: "Hello! This is a test of the Ruth neural voice for therapy sessions.",
            voice: "ruth",
            engine: "neural",
            ssmlStyle: "calm",
            isTherapy: true,
          }),
        });

        if (audioResponse.ok) {
          const audioBlob = await audioResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob);

          addLog(
            `✅ Audio generated successfully: ${audioBlob.size} bytes`,
            "success"
          );
          addLog(
            `🎤 Voice used: ${audioResponse.headers.get("X-Voice-Used")}`,
            "info"
          );
          addLog(
            `⚙️ Engine used: ${audioResponse.headers.get("X-Engine-Used")}`,
            "info"
          );
          addLog(
            `🎭 SSML style: ${audioResponse.headers.get("X-SSML-Style")}`,
            "info"
          );

          setTestResults((prev) => ({
            ...prev,
            audioGeneration: true,
            audioUrl,
            audioSize: audioBlob.size,
            voiceUsed: audioResponse.headers.get("X-Voice-Used"),
            engineUsed: audioResponse.headers.get("X-Engine-Used"),
          }));
        } else {
          const errorData = await audioResponse.json();
          addLog(
            `❌ Audio generation failed: ${audioResponse.status}`,
            "error"
          );
          addLog(`📋 Error: ${errorData.error}`, "error");
          if (errorData.details) {
            addLog(`📝 Details: ${errorData.details}`, "error");
          }
          setTestResults((prev) => ({
            ...prev,
            audioGeneration: false,
            audioError: errorData,
          }));
        }
      }
    } catch (error) {
      addLog(`❌ Test failed: ${error.message}`, "error");
      setTestResults((prev) => ({ ...prev, error: error.message }));
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
    <div className="max-w-4xl mx-auto p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <Volume2 className="w-8 h-8 text-purple-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">
            Polly TTS Diagnostics
          </h2>
          <p className="text-gray-300">Test your Amazon Polly configuration</p>
        </div>
      </div>

      {/* Test Button */}
      <div className="mb-6">
        <button
          onClick={testPollyConnection}
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-xl text-white font-medium transition-all flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Settings className="w-5 h-5" />
          )}
          {isLoading ? "Testing..." : "Run Diagnostics"}
        </button>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Test Results</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Backend Connection */}
            <div
              className={`p-4 rounded-lg border ${
                testResults.backendConnection
                  ? "bg-green-500/10 border-green-500/50"
                  : "bg-red-500/10 border-red-500/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {testResults.backendConnection ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="font-medium text-white">
                  Backend Connection
                </span>
              </div>
              {testResults.voices && (
                <p className="text-sm text-gray-300">
                  Neural voices:{" "}
                  {Object.keys(testResults.voices.neural).join(", ")}
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
                <div className="space-y-1 text-sm text-gray-300">
                  <p>Size: {testResults.audioSize} bytes</p>
                  <p>Voice: {testResults.voiceUsed}</p>
                  <p>Engine: {testResults.engineUsed}</p>
                  <button
                    onClick={playTestAudio}
                    className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-xs flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    Play Test Audio
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Debug Logs</h3>
          <div className="bg-black/30 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`mb-1 ${
                  log.type === "error"
                    ? "text-red-400"
                    : log.type === "success"
                    ? "text-green-400"
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

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
        <h4 className="font-medium text-white mb-2">
          What to check if tests fail:
        </h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>
            • Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in your
            backend environment
          </li>
          <li>• Ensure AWS_REGION is set (usually "us-east-1")</li>
          <li>
            • Check that your AWS credentials have Amazon Polly permissions
          </li>
          <li>• Verify your backend API is accessible from the frontend</li>
          <li>• Check browser console for additional error messages</li>
        </ul>
      </div>
    </div>
  );
};

export default PollyDebugComponent;
