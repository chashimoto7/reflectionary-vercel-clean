// src/components/reflectionarian/modals/EndSessionModal.jsx
import React from "react";
import { Brain, X, Loader2 } from "lucide-react";
import ReflectionaryIcon from "../../../assets/ReflectionaryIcon.svg";

const EndSessionModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src={ReflectionaryIcon}
              alt="Reflectionary"
              className="w-12 h-12"
            />
          </div>

          <h3 className="text-xl font-bold text-white mb-4">End Session?</h3>

          <p className="text-gray-300 mb-6">
            Are you sure you want to end this session? We'll generate insights
            and key takeaways from your conversation.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Continue Session
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-white transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ending...
                </>
              ) : (
                "End & Generate Insights"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndSessionModal;
