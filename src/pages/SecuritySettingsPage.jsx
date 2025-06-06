// src/pages/SecuritySettingsPage.jsx
import React, { useState } from "react";
import { useSecurity } from "../contexts/SecurityContext";
import { Shield, Clock, Eye, EyeOff, Save } from "lucide-react";

export default function SecuritySettingsPage() {
  const { securitySettings, updateSecuritySettings } = useSecurity();
  const [localSettings, setLocalSettings] = useState(securitySettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const timeoutOptions = [
    { value: null, label: "Never (manual lock only)" },
    { value: 15, label: "15 minutes" },
    { value: 60, label: "1 hour" },
    { value: 240, label: "4 hours" },
    { value: 480, label: "8 hours" },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      updateSecuritySettings(localSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Security Settings
          </h1>
        </div>

        <div className="space-y-6">
          {/* Auto-lock Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Automatic Locking
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Choose when your journal should automatically lock. You can always
              lock manually.
            </p>

            <div className="space-y-3">
              {timeoutOptions.map((option) => (
                <label
                  key={option.value || "never"}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="autoLockTimeout"
                    value={option.value || ""}
                    checked={localSettings.autoLockTimeout === option.value}
                    onChange={() =>
                      handleSettingChange("autoLockTimeout", option.value)
                    }
                    className="text-purple-600"
                  />
                  <span className="font-medium text-gray-900">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Enable/disable toggle */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    localSettings.autoLockEnabled &&
                    localSettings.autoLockTimeout !== null
                  }
                  onChange={(e) =>
                    handleSettingChange("autoLockEnabled", e.target.checked)
                  }
                  disabled={localSettings.autoLockTimeout === null}
                  className="rounded text-purple-600"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    Enable automatic locking
                  </div>
                  <div className="text-sm text-gray-600">
                    Temporarily disable auto-lock without changing your timeout
                    setting
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Display Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Display Options
            </h3>

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.showLockStatus}
                onChange={(e) =>
                  handleSettingChange("showLockStatus", e.target.checked)
                }
                className="rounded text-purple-600"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Show security controls in sidebar
                </div>
                <div className="text-sm text-gray-600">
                  Display lock button and security settings link
                </div>
              </div>
              {localSettings.showLockStatus ? (
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
              className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                saved
                  ? "bg-green-600 text-white"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Shield className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
