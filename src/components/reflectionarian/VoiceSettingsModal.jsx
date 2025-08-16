// src/components/reflectionarian/VoiceSettingsModal.jsx
import React, { useState } from "react";
import { Volume2, X, CheckCircle, Play, Loader2, Settings2 } from "lucide-react";
import voiceService from "../../services/reflectionarian/voiceService";

const VoiceSettingsModal = ({
  isOpen,
  onClose,
  currentVoice,
  currentRate = 1.0,
  onVoiceChange,
  onRateChange,
  userId,
}) => {
  const [selectedVoice, setSelectedVoice] = useState(currentVoice || "nova");
  const [selectedRate, setSelectedRate] = useState(currentRate);
  const [isPlaying, setIsPlaying] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // OpenAI TTS voices with descriptions
  const availableVoices = [
    {
      id: "alloy",
      name: "Alloy",
      description: "Neutral and balanced",
      sample: "Hello! I'm Alloy. I have a neutral and balanced voice perfect for general conversations.",
    },
    {
      id: "echo",
      name: "Echo",
      description: "Warm and conversational",
      sample: "Hi there! I'm Echo. My warm voice is great for friendly conversations.",
    },
    {
      id: "fable",
      name: "Fable",
      description: "Expressive and dynamic",
      sample: "Greetings! I'm Fable. I bring an expressive and dynamic quality to our conversations.",
    },
    {
      id: "onyx",
      name: "Onyx",
      description: "Deep and authoritative",
      sample: "Hello. I'm Onyx. My deep voice provides a sense of authority and confidence.",
    },
    {
      id: "nova",
      name: "Nova",
      description: "Friendly and engaging",
      sample: "Hey! I'm Nova. I have a friendly and engaging voice that's perfect for reflective conversations.",
    },
    {
      id: "shimmer",
      name: "Shimmer",
      description: "Soft and soothing",
      sample: "Hello there. I'm Shimmer. My soft, soothing voice is ideal for calm reflection.",
    },
  ];

  const playVoiceSample = async (voice) => {
    try {
      setIsPlaying(voice.id);
      
      // Stop any current playback
      voiceService.stopSpeaking();
      
      // Play the sample with the selected rate
      await voiceService.speakText(
        voice.sample,
        voice.id,
        userId,
        selectedRate
      );
      
      // Wait for playback to complete
      setTimeout(() => {
        setIsPlaying(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to play voice sample:", error);
      setIsPlaying(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save preferences to database
      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/reflectionarian/preferences",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            voice_preference: selectedVoice,
            speech_rate: selectedRate,
          }),
        }
      );

      if (response.ok) {
        onVoiceChange(selectedVoice);
        if (onRateChange) onRateChange(selectedRate);
        onClose();
      }
    } catch (error) {
      console.error("Failed to save voice preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Volume2 className="w-6 h-6" />
              Voice Settings
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Voice Selection */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              Select Voice
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableVoices.map((voice) => (
                <div
                  key={voice.id}
                  className={`relative rounded-lg border transition-all ${
                    selectedVoice === voice.id
                      ? "bg-purple-600/20 border-purple-500"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <button
                    onClick={() => setSelectedVoice(voice.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-white">{voice.name}</p>
                        <p className="text-sm text-white/60 mt-1">
                          {voice.description}
                        </p>
                      </div>
                      {selectedVoice === voice.id && (
                        <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                  
                  {/* Play Sample Button */}
                  <button
                    onClick={() => playVoiceSample(voice)}
                    disabled={isPlaying !== null}
                    className="absolute bottom-2 right-2 p-2 bg-purple-600/30 hover:bg-purple-600/40 rounded-lg transition-colors disabled:opacity-50"
                    title="Play sample"
                  >
                    {isPlaying === voice.id ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Speech Rate Control */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-white mb-4">
              Speech Rate
            </h4>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <span className="text-white/60 text-sm">Slower</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={selectedRate}
                  onChange={(e) => setSelectedRate(parseFloat(e.target.value))}
                  className="flex-1 accent-purple-600"
                />
                <span className="text-white/60 text-sm">Faster</span>
              </div>
              <div className="mt-2 text-center">
                <span className="text-white font-medium">{selectedRate}x</span>
                <span className="text-white/60 text-sm ml-2">
                  {selectedRate === 1
                    ? "(Normal)"
                    : selectedRate < 1
                    ? "(Slower)"
                    : "(Faster)"}
                </span>
              </div>
            </div>
          </div>

          {/* Test with Current Settings */}
          <div className="mb-6">
            <button
              onClick={() => {
                const testVoice = availableVoices.find(v => v.id === selectedVoice);
                if (testVoice) playVoiceSample(testVoice);
              }}
              disabled={isPlaying !== null}
              className="w-full p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPlaying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Playing Sample...
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  Test Current Settings
                </>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettingsModal;