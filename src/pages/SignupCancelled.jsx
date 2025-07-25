// frontend/src/pages/SignupCancelled.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/BrightReflectionaryHorizontal.svg";

export default function SignupCancelled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background - matching your theme */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/30 to-pink-600/20 animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <img
            src={logo}
            alt="Reflectionary"
            className="mx-auto mb-6 max-w-sm h-auto"
          />
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 max-w-md">
            <div className="w-16 h-16 bg-yellow-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-400/30">
              <span className="text-3xl">⏸️</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Payment Cancelled
            </h2>
            <p className="text-gray-300 mb-6">
              No worries! Your payment was cancelled and you haven't been
              charged. You can try again anytime or start with our free plan.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/signup")}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/signup?plan=free")}
                className="w-full py-3 px-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
              >
                Start with Free Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
