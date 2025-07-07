// frontend/ src/components/settings/advanced/SecurityTab.jsx
import React, { useState, useEffect } from "react";
import {
  Shield,
  Clock,
  Lock,
  Fingerprint,
  Smartphone,
  Save,
  Loader,
  CheckCircle,
} from "lucide-react";
import { useSecurity } from "../../../contexts/SecurityContext";

export default function SecurityTab({ user, setError, setSuccess }) {
  const { securitySettings, updateSecuritySettings } = useSecurity();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [localSettings, setLocalSettings] = useState({
    autoLockEnabled: securitySettings?.autoLockEnabled || false,
    autoLockTimeout: securitySettings?.autoLockTimeout || 5,
    biometricEnabled: false, // Advanced feature
    twoFactorEnabled: false, // Advanced feature
    sessionTimeout: 60, // Advanced feature - in minutes
    deviceTrustEnabled: false, // Advanced feature
  });

  const timeoutOptions = [
    { value: 1, label: "1 minute" },
    { value: 5, label: "5 minutes" },
    { value: 10, label: "10 minutes" },
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: null, label: "Never (manual lock only)" },
  ];

  const sessionTimeoutOptions = [
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
    { value: 120, label: "2 hours" },
    { value: 240, label: "4 hours" },
    { value: 480, label: "8 hours" },
    { value: 1440, label: "24 hours" },
  ];

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateSecuritySettings(localSettings);
      setSaved(true);
      setSuccess("Security settings updated successfully");
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError("Failed to save security settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
        <Shield className="h-6 w-6 text-purple-600" />
        Security Settings
      </h2>

      {/* Auto-lock Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-600" />
          Auto-lock Timer
        </h3>

        <p className="text-gray-600 text-sm mb-4">
          Automatically lock the app after a period of inactivity to protect
          your privacy.
        </p>

        <div className="space-y-3">
          {timeoutOptions.map((option) => (
            <label
              key={option.value || "never"}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="autoLockTimeout"
                value={option.value || ""}
                checked={localSettings.autoLockTimeout === option.value}
                onChange={() =>
                  setLocalSettings({
                    ...localSettings,
                    autoLockTimeout: option.value,
                    autoLockEnabled: option.value !== null,
                  })
                }
                className="text-purple-600"
              />
              <span className="font-medium text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Session Timeout - Advanced Feature */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-purple-600" />
          Session Timeout
        </h3>

        <p className="text-gray-600 text-sm mb-4">
          Automatically log out after extended periods of inactivity for
          enhanced security.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {sessionTimeoutOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="sessionTimeout"
                value={option.value}
                checked={localSettings.sessionTimeout === option.value}
                onChange={() =>
                  setLocalSettings({
                    ...localSettings,
                    sessionTimeout: option.value,
                  })
                }
                className="text-purple-600"
              />
              <span className="text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Advanced Security Features */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Advanced Security Features
        </h3>

        <div className="space-y-4">
          {/* Biometric Authentication */}
          <label className="flex items-start gap-3 p-4 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={localSettings.biometricEnabled}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  biometricEnabled: e.target.checked,
                })
              }
              className="mt-1 rounded text-purple-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">
                  Biometric Authentication
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Use fingerprint or face recognition to unlock the app (when
                available on your device)
              </p>
            </div>
          </label>

          {/* Two-Factor Authentication */}
          <label className="flex items-start gap-3 p-4 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={localSettings.twoFactorEnabled}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  twoFactorEnabled: e.target.checked,
                })
              }
              className="mt-1 rounded text-purple-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">
                  Two-Factor Authentication
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Add an extra layer of security with 2FA for account login
              </p>
            </div>
          </label>

          {/* Trusted Devices */}
          <label className="flex items-start gap-3 p-4 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={localSettings.deviceTrustEnabled}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  deviceTrustEnabled: e.target.checked,
                })
              }
              className="mt-1 rounded text-purple-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">
                  Trusted Devices
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Remember this device and skip extra security checks
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-all ${
            saved
              ? "bg-green-600 text-white"
              : "bg-purple-600 text-white hover:bg-purple-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {saving ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="h-5 w-5" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Security Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
