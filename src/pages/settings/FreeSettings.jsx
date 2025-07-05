// src/pages/settings/FreeSettings.jsx
import React, { useState, useEffect } from "react";
import {
  Settings,
  Lock,
  Eye,
  EyeOff,
  Shield,
  User,
  Crown,
  Clock,
  Key,
  AlertCircle,
  CheckCircle,
  Loader,
  Save,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useSecurity } from "../../contexts/SecurityContext";
import { supabase } from "../../lib/supabase";

export default function FreeSettings() {
  const { user } = useAuth();
  const { securitySettings, updateSecuritySettings } = useSecurity();

  const [activeSection, setActiveSection] = useState("account");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [localSecuritySettings, setLocalSecuritySettings] = useState({
    autoLockEnabled: securitySettings?.autoLockEnabled || false,
    autoLockTimeout: securitySettings?.autoLockTimeout || 5,
    showLockStatus: securitySettings?.showLockStatus || true,
  });

  // Timeout options
  const timeoutOptions = [
    { value: 5, label: "5 minutes" },
    { value: 10, label: "10 minutes" },
    { value: 15, label: "15 minutes" },
    { value: null, label: "Never (manual lock only)" },
  ];

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setSuccess("Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  // Handle security settings save
  const handleSecuritySave = async () => {
    setSaving(true);
    try {
      await updateSecuritySettings(localSecuritySettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError("Failed to save security settings");
    } finally {
      setSaving(false);
    }
  };

  // Section navigation (limited for free tier)
  const sections = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <Settings className="h-8 w-8" />
        Settings
      </h1>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${
                  activeSection === section.id
                    ? "bg-purple-50 text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* Account Section */}
        {activeSection === "account" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Account Information
              </h2>

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-8">
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="text-gray-900 font-medium">{user?.email}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Member Since</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(user?.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Membership</label>
                  <p className="text-gray-900 font-medium">Free</p>
                </div>
              </div>

              {/* Change Password */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    disabled={
                      saving ||
                      !passwordForm.currentPassword ||
                      !passwordForm.newPassword
                    }
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Upgrade Prompt */}
              <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-purple-900">
                      Unlock Data Export
                    </h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Upgrade to Basic or higher to export your journal entries
                      and access advanced features.
                    </p>
                    <button className="mt-2 text-sm font-medium text-purple-600 hover:text-purple-700">
                      View Upgrade Options →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Section */}
        {activeSection === "security" && (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Security Settings
            </h2>

            {/* Auto-lock Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Auto-lock Timer
              </h3>

              <p className="text-gray-600 text-sm mb-4">
                Automatically lock the app after a period of inactivity.
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
                      checked={
                        localSecuritySettings.autoLockTimeout === option.value
                      }
                      onChange={() =>
                        setLocalSecuritySettings({
                          ...localSecuritySettings,
                          autoLockTimeout: option.value,
                        })
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
                      localSecuritySettings.autoLockEnabled &&
                      localSecuritySettings.autoLockTimeout !== null
                    }
                    onChange={(e) =>
                      setLocalSecuritySettings({
                        ...localSecuritySettings,
                        autoLockEnabled: e.target.checked,
                      })
                    }
                    disabled={localSecuritySettings.autoLockTimeout === null}
                    className="rounded text-purple-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      Enable automatic locking
                    </div>
                    <div className="text-sm text-gray-600">
                      Temporarily disable auto-lock without changing your
                      timeout setting
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSecuritySave}
                disabled={saving}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  saved
                    ? "bg-green-600 text-white"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
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
        )}
      </div>
    </div>
  );
}
