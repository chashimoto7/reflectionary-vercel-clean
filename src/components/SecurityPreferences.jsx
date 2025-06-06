// src/components/SecurityPreferences.jsx
import React, { useState } from "react";
import { useEncryption } from "../contexts/EncryptionContext";
import { Shield, Lock, Clock, Eye, EyeOff } from "lucide-react";

const SecurityPreferences = () => {
  const { securityPreferences, updateSecurityPreferences } = useEncryption();
  const [saving, setSaving] = useState(false);
  const [localPreferences, setLocalPreferences] = useState(securityPreferences);

  // Predefined timeout options that cover most user needs
  const timeoutOptions = [
    {
      value: null,
      label: "Never (manual lock only)",
      description: "Application stays unlocked until you manually lock it",
    },
    {
      value: 15,
      label: "15 minutes",
      description: "Good for public spaces or shared computers",
    },
    {
      value: 60,
      label: "1 hour",
      description: "Balanced security for most situations",
    },
    {
      value: 240,
      label: "4 hours",
      description: "Minimal interruption for private environments",
    },
    {
      value: 480,
      label: "8 hours",
      description: "Lock only at end of work day",
    },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSecurityPreferences(localPreferences);
      // Show success feedback to user
    } catch (error) {
      console.error("Failed to save security preferences:", error);
      // Show error feedback to user
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-semibold text-gray-900">
          Security Preferences
        </h2>
      </div>

      <div className="space-y-6">
        {/* Auto-lock Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Automatic Locking
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Choose when your journal should automatically lock for security. You
            can always lock manually regardless of this setting.
          </p>

          <div className="space-y-3">
            {timeoutOptions.map((option) => (
              <label
                key={option.value || "never"}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="autoLockTimeout"
                  value={option.value || ""}
                  checked={localPreferences.autoLockTimeout === option.value}
                  onChange={() =>
                    handlePreferenceChange("autoLockTimeout", option.value)
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Enable/disable toggle for auto-lock */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  localPreferences.autoLockEnabled &&
                  localPreferences.autoLockTimeout !== null
                }
                onChange={(e) =>
                  handlePreferenceChange("autoLockEnabled", e.target.checked)
                }
                disabled={localPreferences.autoLockTimeout === null}
                className="rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Enable automatic locking
                </div>
                <div className="text-sm text-gray-600">
                  Temporarily disable automatic locking without changing your
                  timeout setting
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Visual Preferences */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Display Options
          </h3>

          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={localPreferences.showSecurityStatus}
              onChange={(e) =>
                handlePreferenceChange("showSecurityStatus", e.target.checked)
              }
              className="rounded"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                Show security status
              </div>
              <div className="text-sm text-gray-600">
                Display lock status and time remaining in the interface
              </div>
            </div>
            {localPreferences.showSecurityStatus ? (
              <Eye className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeOff className="h-5 w-5 text-gray-400" />
            )}
          </label>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Save Security Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityPreferences;
