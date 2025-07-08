// frontend/src/components/FollowUpModal.jsx
import React from "react";
import { MessageCircle, X, ChevronRight, Sparkles } from "lucide-react";

export default function FollowUpModal({
  isOpen,
  onClose,
  onYes,
  onNo,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 max-w-md w-full mx-4 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full">
              <MessageCircle className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <h3 className="text-xl font-semibold text-white mb-2">
            Entry Saved Successfully!
          </h3>

          <p className="text-white/80 mb-6 leading-relaxed">
            Would you like me to generate a personalized follow-up prompt to
            help you explore your thoughts deeper?
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onNo}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition disabled:opacity-50"
            >
              No, I'm done
            </button>

            <button
              onClick={onYes}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4" />
                  Yes, continue
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
