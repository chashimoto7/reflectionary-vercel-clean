// frontend/src/components/wellness/experiments/AIRequestModal.jsx
import React, { useState } from "react";
import { XCircle, Bot, Wand2 } from "lucide-react";

const AIRequestModal = ({ onClose, onRequest }) => {
  const [aiRequest, setAiRequest] = useState("");
  const [requesting, setRequesting] = useState(false);

  const handleRequest = async () => {
    if (!aiRequest.trim()) return;

    setRequesting(true);
    try {
      await onRequest(aiRequest);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-900 rounded-xl p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-purple-400" />
            Request AI Experiment
          </h3>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <p className="text-purple-200 text-sm mb-4">
          Tell me what you'd like to work on and I'll create a personalized
          experiment for you.
        </p>

        <textarea
          value={aiRequest}
          onChange={(e) => setAiRequest(e.target.value)}
          placeholder="e.g., I want to improve my afternoon energy slumps, I'd like to reduce my anxiety before important meetings, I want to build a consistent morning routine..."
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 h-32 resize-none mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={handleRequest}
            disabled={!aiRequest.trim() || requesting}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            {requesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                Generate Experiment
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIRequestModal;
