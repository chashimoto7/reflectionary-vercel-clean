// frontend/src/components/AudioPlayer.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  X,
  Volume2,
  VolumeX,
  Loader,
  AlertCircle,
} from "lucide-react";

const AudioPlayer = ({ entryId, onClose, position = "bottom-right" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [voice, setVoice] = useState("nova");
  const [textStats, setTextStats] = useState(null);

  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  // OpenAI TTS voices with descriptions
  const voices = [
    { id: "alloy", name: "Alloy", description: "Neutral and balanced" },
    { id: "echo", name: "Echo", description: "Smooth and calm" },
    { id: "fable", name: "Fable", description: "Expressive and dynamic" },
    { id: "onyx", name: "Onyx", description: "Deep and authoritative" },
    { id: "nova", name: "Nova", description: "Warm and friendly" },
    { id: "shimmer", name: "Shimmer", description: "Soft and pleasant" },
  ];

  const speeds = [
    { value: 0.75, label: "0.75x" },
    { value: 1, label: "1x" },
    { value: 1.25, label: "1.25x" },
    { value: 1.5, label: "1.5x" },
  ];

  // Position classes for the floating player
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    center: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
  };

  // Generate audio using backend endpoints
  const generateAudio = async (voiceId) => {
    try {
      setIsLoading(true);
      setError(null);

      // First, get the prepared text from backend
      const backendUrl =
        import.meta.env.VITE_API_URL ||
        "https://reflectionary-api.vercel.app/api";
      const textResponse = await fetch(`${backendUrl}/api/tts/prepare-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ entryId }),
      });

      if (!textResponse.ok) {
        const errorData = await textResponse.json();
        throw new Error(errorData.error || "Failed to prepare text");
      }

      const { text, wordCount, characterCount } = await textResponse.json();
      setTextStats({ wordCount, characterCount });

      // Then generate audio with the text
      const audioResponse = await fetch(`${backendUrl}/api/tts/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          text,
          voice: voiceId,
          model: "tts-1", // or 'tts-1-hd' for higher quality
        }),
      });

      if (!audioResponse.ok) {
        const errorData = await audioResponse.json();
        throw new Error(errorData.error || "Failed to generate audio");
      }

      const audioBlob = await audioResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Clean up previous audio URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }

      audioUrlRef.current = audioUrl;
      return audioUrl;
    } catch (err) {
      console.error("Error generating audio:", err);
      setError(err.message || "Failed to generate audio. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      const audioUrl = await generateAudio(voice);

      if (audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = speed;
        audioRef.current.volume = isMuted ? 0 : volume;
      }
    };

    initAudio();

    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [entryId]); // Only re-init when entry changes

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle audio events
  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Format time display
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Regenerate audio with new voice
  const handleVoiceChange = async (newVoice) => {
    setVoice(newVoice);
    const wasPlaying = isPlaying;

    if (wasPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    const audioUrl = await generateAudio(newVoice);

    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = speed;

      if (wasPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Add backdrop for center position
  const showBackdrop = position === "center";

  return (
    <>
      {/* Backdrop for center position */}
      {showBackdrop && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      {/* Audio Player */}
      <div
        className={`fixed ${positionClasses[position]} z-50 bg-slate-800 border border-white/20 rounded-lg shadow-xl p-4 w-80`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-white">Audio Player</h3>
            {textStats && (
              <p className="text-xs text-gray-400 mt-0.5">
                {textStats.wordCount} words • ~
                {Math.ceil(textStats.wordCount / 150)} min
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-3 flex items-center justify-center py-4">
            <Loader className="h-6 w-6 text-purple-400 animate-spin" />
            <span className="ml-2 text-sm text-gray-300">
              Generating audio...
            </span>
          </div>
        )}

        {/* Player Controls */}
        {!isLoading && (
          <>
            {/* Main Controls */}
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={togglePlayPause}
                disabled={isLoading || error}
                className="w-10 h-10 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </button>

              <div className="flex-1">
                {/* Progress Bar */}
                <div
                  className="h-2 bg-white/20 rounded-full cursor-pointer relative"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                  />
                </div>

                {/* Time Display */}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">
                    {formatTime(currentTime)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Volume Control */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-400">Speed:</span>
              <div className="flex gap-1">
                {speeds.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSpeed(s.value)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      speed === s.value
                        ? "bg-purple-600 text-white"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Voice:</span>
              <select
                value={voice}
                onChange={(e) => handleVoiceChange(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-2 py-1 text-xs bg-slate-700 border border-white/20 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
    </>
  );
};

export default AudioPlayer;
