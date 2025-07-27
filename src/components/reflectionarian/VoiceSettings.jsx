// frontend/src/components/reflectionarian/VoiceSettings.jsx
// Voice settings component for Amazon Polly TTS preferences

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Loader2 } from "lucide-react";
import pollyTTSService from "../../services/pollyTTSService";

const VoiceSettings = ({ preferences, onPreferencesChange }) => {
  const [voiceOptions, setVoiceOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testingVoice, setTestingVoice] = useState(null);

  useEffect(() => {
    loadVoiceOptions();
  }, []);

  const loadVoiceOptions = async () => {
    try {
      const options = await pollyTTSService.getVoiceOptions();
      setVoiceOptions(options);
    } catch (error) {
      console.error("Error loading voice options:", error);
    } finally {
      setLoading(false);
    }
  };

  const testVoice = async (voiceId, engine) => {
    try {
      setTestingVoice(voiceId);

      const testText =
        "Hello, I'm your AI companion. This is how I sound during our therapy sessions.";

      await pollyTTSService.speakTherapy(
        testText,
        {
          voice: voiceId,
          engine: engine,
          ssmlStyle: "calm",
        },
        () => {
          setTestingVoice(null);
        }
      );
    } catch (error) {
      console.error("Error testing voice:", error);
      setTestingVoice(null);
    }
  };

  const updatePreference = (key, value) => {
    const updatedPreferences = {
      ...preferences,
      [key]: value,
    };
    onPreferencesChange(updatedPreferences);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        <span className="ml-2 text-gray-300">Loading voice options...</span>
      </div>
    );
  }

  if (!voiceOptions) {
    return (
      <div className="p-6 text-center text-gray-400">
        <VolumeX className="w-12 h-12 mx-auto mb-4" />
        <p>Voice options not available</p>
        <p className="text-sm">Check your AWS Polly configuration</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Voice Engine Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Voice Quality
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              preferences.ttsEngine === "standard"
                ? "border-purple-500 bg-purple-500/10"
                : "border-gray-600 hover:border-gray-500"
            }`}
            onClick={() => updatePreference("ttsEngine", "standard")}
          >
            <h4 className="font-medium text-white">Standard</h4>
            <p className="text-sm text-gray-400">$4 per million characters</p>
            <p className="text-xs text-gray-500 mt-1">
              Good quality, cost-effective
            </p>
          </div>

          <div
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              preferences.ttsEngine === "neural"
                ? "border-purple-500 bg-purple-500/10"
                : "border-gray-600 hover:border-gray-500"
            }`}
            onClick={() => updatePreference("ttsEngine", "neural")}
          >
            <h4 className="font-medium text-white">Neural</h4>
            <p className="text-sm text-gray-400">$16 per million characters</p>
            <p className="text-xs text-gray-500 mt-1">
              Premium quality, more natural
            </p>
          </div>
        </div>
      </div>

      {/* Voice Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Voice Selection
        </label>

        {["neural", "standard"].map((engine) => (
          <div
            key={engine}
            className={engine === preferences.ttsEngine ? "block" : "hidden"}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(voiceOptions.voices[engine] || {}).map(
                ([voiceId, voice]) => (
                  <div
                    key={voiceId}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      preferences.ttsVoice === voiceId
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                    onClick={() => updatePreference("ttsVoice", voiceId)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{voice.id}</h4>
                        <p className="text-sm text-gray-400">
                          {voice.gender} • {voice.language}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {voice.description}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          testVoice(voiceId, engine);
                        }}
                        disabled={testingVoice === voiceId}
                        className="ml-2 p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition-colors"
                      >
                        {testingVoice === voiceId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Therapy Style */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Therapeutic Speaking Style
        </label>
        <div className="grid grid-cols-2 gap-3">
          {voiceOptions.therapyStyles.map((style) => (
            <div
              key={style}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                preferences.ttsStyle === style
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-gray-600 hover:border-gray-500"
              }`}
              onClick={() => updatePreference("ttsStyle", style)}
            >
              <h4 className="font-medium text-white capitalize">{style}</h4>
              <p className="text-xs text-gray-500 mt-1">
                {style === "calm" && "Gentle and reassuring pace"}
                {style === "slow" && "Slower pace for reflection"}
                {style === "empathetic" && "Soft and understanding tone"}
                {style === "encouraging" && "Uplifting and supportive"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-speak Settings */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-white">Auto-speak Responses</h4>
          <p className="text-sm text-gray-400">
            Automatically read AI responses aloud
          </p>
        </div>
        <button
          onClick={() =>
            updatePreference("enableSpeech", !preferences.enableSpeech)
          }
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            preferences.enableSpeech ? "bg-purple-600" : "bg-gray-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              preferences.enableSpeech ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Cost Information */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Volume2 className="w-5 h-5 text-blue-400" />
          <h4 className="font-medium text-blue-300">Voice Costs</h4>
        </div>
        <div className="text-sm text-blue-200 space-y-1">
          <p>• Standard voices: ~$0.008 per therapy response</p>
          <p>• Neural voices: ~$0.032 per therapy response</p>
          <p>• Audio is cached to avoid repeat costs</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettings;
