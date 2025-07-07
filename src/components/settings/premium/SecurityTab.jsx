// frontend/ src/components/settings/premium/SecurityTab.jsx
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
  Key,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { useSecurity } from "../../../contexts/SecurityContext";

export default function SecurityTab({ user, setError, setSuccess }) {
  const { securitySettings, updateSecuritySettings } = useSecurity();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [localSettings, setLocalSettings] = useState({
    autoLockEnabled: securitySettings?.autoLockEnabled || false,
    autoLockTimeout: securitySettings?.autoLockTimeout || 5,
    biometricEnabled: false,
    twoFactorEnabled: false,
    sessionTimeout: 60,
    deviceTrustEnabled: false,
    // Premium exclusive features
    encryptionLevel: "enhanced",
    ipWhitelisting: false,
    trustedIPs: [],
    loginNotifications: true,
    securityLogs: true,
    multiDeviceSync: true,
  });

  const timeoutOptions = [
    { value: 1, label: "1 minute" },
    { value: 3, label: "3 minutes" },
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
    { value: 10080, label: "7 days" },
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

  const handleAddTrustedIP = () => {
    const ip = prompt("Enter trusted IP address:");
    if (ip && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
      setLocalSettings({
        ...localSettings,
        trustedIPs: [...localSettings.trustedIPs, ip],
      });
    } else if (ip) {
      setError("Invalid IP address format");
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
        <Shield className="h-6 w-6 text-purple-400" />
        Premium Security Settings
      </h2>

      {/* Auto-lock Settings */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-400" />
          Auto-lock Timer
        </h3>

        <p className="text-gray-300 text-sm mb-4">
          Automatically lock the app after a period of inactivity to protect
          your privacy.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {timeoutOptions.map((option) => (
            <label
              key={option.value || "never"}
              className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
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
              <span className="text-white">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Session Timeout */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-purple-400" />
          Session Timeout
        </h3>

        <p className="text-gray-300 text-sm mb-4">
          Automatically log out after extended periods of inactivity for
          enhanced security.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sessionTimeoutOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
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
              <span className="text-white">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Advanced Security Features */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Advanced Security Features
        </h3>

        <div className="space-y-4">
          {/* Biometric Authentication */}
          <label className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
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
                <Fingerprint className="h-5 w-5 text-purple-400" />
                <span className="font-medium text-white">
                  Biometric Authentication
                </span>
              </div>
              <p className="text-sm text-gray-300 mt-1">
                Use fingerprint or face recognition to unlock the app
              </p>
            </div>
          </label>

          {/* Two-Factor Authentication */}
          <label className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
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
                <Key className="h-5 w-5 text-purple-400" />
                <span className="font-medium text-white">
                  Two-Factor Authentication
                </span>
              </div>
              <p className="text-sm text-gray-300 mt-1">
                Add an extra layer of security with 2FA for account login
              </p>
            </div>
          </label>

          {/* Login Notifications - Premium */}
          <label className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={localSettings.loginNotifications}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  loginNotifications: e.target.checked,
                })
              }
              className="mt-1 rounded text-purple-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-purple-400" />
                <span className="font-medium text-white">
                  Login Notifications
                </span>
                <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                  PREMIUM
                </span>
              </div>
              <p className="text-sm text-gray-300 mt-1">
                Get notified of all login attempts to your account
              </p>
            </div>
          </label>

          {/* Device Trust - Premium */}
          <label className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
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
                <Smartphone className="h-5 w-5 text-purple-400" />
                <span className="font-medium text-white">Trusted Devices</span>
                <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                  PREMIUM
                </span>
              </div>
              <p className="text-sm text-gray-300 mt-1">
                Remember trusted devices and skip security checks
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Premium Security Features */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          Premium Security Features
        </h3>

        <div className="space-y-4">
          {/* Encryption Level */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Encryption Level
            </label>
            <select
              value={localSettings.encryptionLevel}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  encryptionLevel: e.target.value,
                })
              }
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="standard">Standard (AES-256)</option>
              <option value="enhanced">Enhanced (AES-256 + RSA)</option>
              <option value="maximum">Maximum (Military-grade)</option>
            </select>
          </div>

          {/* IP Whitelisting */}
          <div>
            <label className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                checked={localSettings.ipWhitelisting}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    ipWhitelisting: e.target.checked,
                  })
                }
                className="rounded text-purple-600"
              />
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-400" />
                <span className="font-medium text-white">IP Whitelisting</span>
              </div>
            </label>

            {localSettings.ipWhitelisting && (
              <div className="ml-8 space-y-2">
                {localSettings.trustedIPs.map((ip, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-white/5 rounded"
                  >
                    <span className="text-gray-300">{ip}</span>
                    <button
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          trustedIPs: localSettings.trustedIPs.filter(
                            (_, i) => i !== index
                          ),
                        })
                      }
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddTrustedIP}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  + Add Trusted IP
                </button>
              </div>
            )}
          </div>

          {/* Security Logs */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localSettings.securityLogs}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  securityLogs: e.target.checked,
                })
              }
              className="rounded text-purple-600"
            />
            <span className="text-white">Enable detailed security logs</span>
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
