import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, X, Loader2 } from "lucide-react";

const VoiceModal = ({
  isOpen,
  onClose,
  onTranscript,
  preferences,
  pollyTTSService,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState("");
  const [enableTTS, setEnableTTS] = useState(
    preferences?.enableSpeech || false
  );
  const [recordingDuration, setRecordingDuration] = useState(0);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOpen && "webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setError("");
        setIsRecording(true);
        setRecordingDuration(0);

        // Start timer
        timerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + " ";
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
        }
        setInterimTranscript(interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "no-speech") {
          // Continue recording even with no speech
          return;
        }
        setError(`Recognition error: ${event.error}`);
        stopRecording();
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        // Don't automatically restart if user stopped recording
        if (isRecording && recognitionRef.current) {
          try {
            recognition.start();
          } catch (error) {
            console.error("Failed to restart recognition:", error);
          }
        }
      };

      recognitionRef.current = recognition;
    } else if (isOpen && !("webkitSpeechRecognition" in window)) {
      setError(
        "Speech recognition is not supported in your browser. Please use Chrome or Edge."
      );
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen, isRecording]);

  const startRecording = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      if (recognitionRef.current) {
        setTranscript("");
        setInterimTranscript("");
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error("Microphone access error:", error);
      setError("Please allow microphone access to use voice input.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleDone = () => {
    const finalTranscript = transcript + interimTranscript;
    if (finalTranscript.trim()) {
      onTranscript(finalTranscript.trim(), enableTTS);
    }
    handleClose();
  };

  const handleClose = () => {
    stopRecording();
    setTranscript("");
    setInterimTranscript("");
    setError("");
    setRecordingDuration(0);
    onClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900/95 via-purple-800/95 to-indigo-900/95 backdrop-blur-xl rounded-2xl border border-white/20 max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Input
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Recording Status */}
        <div className="mb-6 text-center">
          {isRecording ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
                  <div className="relative w-4 h-4 bg-red-500 rounded-full" />
                </div>
                <span className="text-white font-medium">
                  Recording... {formatTime(recordingDuration)}
                </span>
              </div>
              <div className="flex justify-center">
                <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-white/70">
              Click the microphone to start recording
            </div>
          )}
        </div>

        {/* Transcript Display */}
        <div className="mb-6 bg-white/10 rounded-lg p-4 min-h-[120px] max-h-[200px] overflow-y-auto">
          <p className="text-white">
            {transcript}
            <span className="text-white/50">{interimTranscript}</span>
          </p>
          {!transcript && !interimTranscript && !isRecording && (
            <p className="text-white/40 text-center">
              Your speech will appear here...
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* TTS Option */}
        <div className="mb-6 flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-purple-300" />
            <span className="text-white">Read AI responses aloud</span>
          </div>
          <button
            onClick={() => setEnableTTS(!enableTTS)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enableTTS ? "bg-purple-600" : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enableTTS ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isRecording ? (
            <>
              <button
                onClick={startRecording}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium transition-all"
              >
                <Mic className="w-5 h-5" />
                Start Recording
              </button>
              <button
                onClick={handleDone}
                disabled={!transcript && !interimTranscript}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all"
              >
                Send Message
              </button>
            </>
          ) : (
            <>
              <button
                onClick={stopRecording}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium transition-all"
              >
                <MicOff className="w-5 h-5" />
                Stop Recording
              </button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-white/50 text-sm">
          <p>Speak naturally. You can pause while thinking.</p>
          <p>Click "Stop Recording" when you're finished.</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceModal;
