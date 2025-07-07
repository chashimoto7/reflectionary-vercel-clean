// frontend/ src/pages/settings/AdvancedSettings.jsx - user settings and download for all data/analytics
import React, { useState } from "react";
import {
  Settings,
  User,
  Lock,
  CreditCard,
  Download,
  Star,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

// Import Advanced settings tabs
import AccountTab from "../../components/settings/advanced/AccountTab";
import SecurityTab from "../../components/settings/advanced/SecurityTab";
import SubscriptionTab from "../../components/settings/advanced/SubscriptionTab";
import JournalExportTab from "../../components/settings/advanced/JournalExportTab";
import AnalyticsExportTab from "../../components/settings/advanced/AnalyticsExportTab";
import GoalsExportTab from "../../components/settings/advanced/GoalsExportTab";
import WellnessExportTab from "../../components/settings/advanced/WellnessExportTab";

export default function AdvancedSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Advanced tabs configuration
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
      label: "Journal Export",
      icon: Download,
      component: JournalExportTab,
    },
    {
      id: "analytics-export",
      label: "Analytics Export",
      icon: Download,
      component: AnalyticsExportTab,
    },
    {
      id: "goals-export",
      label: "Goals Export",
      icon: Download,
      component: GoalsExportTab,
    },
    {
      id: "wellness-export",
      label: "Wellness Export",
      icon: Download,
      component: WellnessExportTab,
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Settings className="h-8 w-8" />
          Advanced Settings
          <Star className="h-6 w-6 text-yellow-500" />
        </h1>

        {/* Glass-style container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-purple-100">
          {/* Tab Navigation */}
          <div className="bg-purple-50/50 border-b border-purple-100 p-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-gray-600 hover:text-gray-900 hover:bg-purple-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
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
