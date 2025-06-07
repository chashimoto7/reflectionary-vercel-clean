import React, { useState } from "react";
import { useSecurity } from "../contexts/SecurityContext";
import { useAuth } from "../contexts/AuthContext";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function UnlockModal() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  const { unlock, isLocked } = useSecurity();
  const { user, signOut } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsUnlocking(true);

    try {
      // Use the current user's email for unlock
      await unlock(user.email, password);
    } catch (err) {
      setError("Incorrect password. Please try again.");
    } finally {
      setIsUnlocking(false);
      setPassword("");
    }
  };

  // Don’t render if not locked or not logged in
  if (!isLocked || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Journal Locked
          </h2>
          <p className="text-sm text-gray-600">
            Enter your password to unlock your encrypted journal entries.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isUnlocking || !password}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUnlocking ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Unlocking...
              </div>
            ) : (
              "Unlock Journal"
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t">
          <button
            onClick={signOut}
            className="w-full text-gray-600 hover:text-gray-800 text-sm transition-colors"
          >
            Sign out instead
          </button>
        </div>
      </div>
    </div>
  );
}
