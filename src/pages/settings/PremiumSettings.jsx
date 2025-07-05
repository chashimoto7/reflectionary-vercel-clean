// src/pages/settings/PremiumSettings.jsx
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
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

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
  const [activeTab, setActiveTab] = useState("account");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
      icon: Download,
      component: CompleteExportTab,
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="h-10 w-10" />
            Premium Settings
            <Crown className="h-8 w-8 text-yellow-400" />
          </h1>
          <p className="text-gray-300">
            Manage your account, security, subscription, and export your data
            with advanced customization options.
          </p>
        </div>

        {/* Glass container with tabs */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Tab Navigation - Two rows for Premium */}
          <div className="bg-white/5 border-b border-white/10 p-4">
            {/* First row - 5 tabs */}
            <div className="flex flex-wrap gap-2 mb-2">
              {tabs.slice(0, 5).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all flex-1 min-w-0 ${
                      activeTab === tab.id
                        ? "bg-purple-600 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Second row - remaining tabs */}
            <div className="flex flex-wrap gap-2">
              {tabs.slice(5).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all flex-1 min-w-0 ${
                      activeTab === tab.id
                        ? "bg-purple-600 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            {/* Success/Error Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3 text-green-200">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Render Active Tab Component */}
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
    </div>
  );
}
