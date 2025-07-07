// frontend/ src/pages/settings/PremiumSettings.jsx - user settings and data/analytics download for all features
import React, { useState } from "react";
import {
  Settings,
  User,
  Lock,
  CreditCard,
  Download,
  MessageCircle,
  Crown,
  Star,
  Shield,
  Info,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useMembership } from "../../hooks/useMembership";

// Import all Premium settings tabs
import AccountTab from "../../components/settings/premium/AccountTab";
import SecurityTab from "../../components/settings/premium/SecurityTab";
import SubscriptionTab from "../../components/settings/premium/SubscriptionTab";
import JournalExportTab from "../../components/settings/premium/JournalExportTab";
import AnalyticsExportTab from "../../components/settings/premium/AnalyticsExportTab";
import GoalsExportTab from "../../components/settings/premium/GoalsExportTab";
import WellnessExportTab from "../../components/settings/premium/WellnessExportTab";
import ReflectionarianTab from "../../components/settings/premium/ReflectionarianTab";
import CompleteExportTab from "../../components/settings/premium/CompleteExportTab";

export default function PremiumSettings() {
  const { user } = useAuth();
  const { hasAccess, tier } = useMembership();
  const [activeTab, setActiveTab] = useState("account");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  // Premium tabs configuration
  const tabs = [
    { id: "account", label: "Account", icon: User, component: AccountTab },
    { id: "security", label: "Security", icon: Lock, component: SecurityTab },
    {
      id: "subscription",
      label: "Subscription",
      icon: CreditCard,
      component: SubscriptionTab,
    },
    {
      id: "journal-export",
      label: "Journal Reports",
      icon: Download,
      component: JournalExportTab,
    },
    {
      id: "analytics-export",
      label: "Analytics Reports",
      icon: Download,
      component: AnalyticsExportTab,
    },
    {
      id: "goals-export",
      label: "Goals Reports",
      icon: Download,
      component: GoalsExportTab,
    },
    {
      id: "wellness-export",
      label: "Wellness Reports",
      icon: Download,
      component: WellnessExportTab,
    },
    {
      id: "reflectionarian",
      label: "Reflectionarian",
      icon: MessageCircle,
      component: ReflectionarianTab,
    },
    {
      id: "complete-export",
      label: "Complete Export",
      icon: Star,
      component: CompleteExportTab,
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  // Clear messages after 5 seconds
  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Settings className="w-8 h-8" />
                Premium Settings
                <Crown className="w-6 h-6 text-yellow-400" />
              </h1>
              <p className="text-purple-200">
                Manage your account, security, and data exports
              </p>
            </div>

            <button
              onClick={() => setShowPrivacyInfo(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-purple-200"
              title="Privacy Information"
            >
              <Shield className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-green-300 flex items-center gap-2">
              <Star className="w-5 h-5" />
              {success}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-300 flex items-center gap-2">
              <Info className="w-5 h-5" />
              {error}
            </p>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-3">
            <nav className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-purple-600 text-white shadow-lg"
                          : "text-purple-200 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                      {tab.id === "complete-export" && (
                        <Star className="w-4 h-4 ml-auto text-yellow-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Premium Badge */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-white">
                    Premium Member
                  </span>
                </div>
                <p className="text-sm text-purple-200">
                  You have access to all premium features and exports
                </p>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              {ActiveComponent && (
                <ActiveComponent
                  user={user}
                  setError={setError}
                  setSuccess={setSuccess}
                />
              )}
            </div>
          </div>
        </div>

        {/* Privacy Info Modal */}
        {showPrivacyInfo && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
                <h3 className="text-xl font-bold text-white">
                  Data Export Privacy
                </h3>
              </div>

              <div className="space-y-4 text-gray-300">
                <p>All data exports are handled securely:</p>

                <ul className="space-y-2 list-disc list-inside">
                  <li>Data is decrypted on our secure servers</li>
                  <li>Exports are generated in memory and streamed to you</li>
                  <li>No decrypted data is stored during export</li>
                  <li>Exported files can be password-protected</li>
                  <li>Export logs are kept for security auditing</li>
                </ul>

                <div className="bg-purple-600/20 rounded-lg p-3 border border-purple-600/30">
                  <p className="text-sm">
                    <strong className="text-purple-300">Note:</strong> Your
                    encryption keys never leave our secure backend. All
                    decryption for exports happens server-side to maintain
                    maximum security.
                  </p>
                </div>

                <p className="text-sm">
                  You can export your data at any time. We recommend keeping
                  secure backups of your exported data.
                </p>
              </div>

              <button
                onClick={() => setShowPrivacyInfo(false)}
                className="mt-6 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
