import React, { useState } from "react";
import { useEncryption } from "../contexts/EncryptionContext";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function EncryptionUnlockModal({ onClose, message }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { unlockEncryption } = useEncryption();

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError("");
    setIsUnlocking(true);

    try {
      await unlockEncryption(password);
      onClose();
    } catch (err) {
      setError("Incorrect password. Please try again.");
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Unlock Your Journal
          </h2>
          <p className="text-sm text-gray-600">
            {message ||
              "Enter your password to decrypt and access your private journal entries"}
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
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
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-700">
              <strong>Privacy Note:</strong> Your journal entries are encrypted
              with your password. If you forget your password, your entries
              cannot be recovered.
            </p>
          </div>

          <button
            type="submit"
            disabled={isUnlocking || !password}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            This uses the same password as your account
          </p>
        </div>
      </div>
    </div>
  );
}
