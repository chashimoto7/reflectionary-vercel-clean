// src/components/reflectionarian/VoiceSettingsModal.jsx
import React from "react";
import { Volume2, X, CheckCircle } from "lucide-react";
import voiceService from "../../services/reflectionarian/voiceService";

const VoiceSettingsModal = ({
  isOpen,
  onClose,
  currentVoice,
  onVoiceChange,
}) => {
  if (!isOpen) return null;

  const availableVoices = voiceService.getAvailableVoices();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
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

        <div className="space-y-3">
          {availableVoices.map((voice) => (
            <button
              key={voice.id}
              onClick={() => {
                onVoiceChange(voice.id);
                onClose();
              }}
              className={`w-full p-4 rounded-lg border transition-all text-left ${
                currentVoice === voice.id
                  ? "bg-purple-600/20 border-purple-500"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{voice.name}</p>
                  <p className="text-sm text-white/60">{voice.description}</p>
                </div>
                {currentVoice === voice.id && (
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default VoiceSettingsModal;
