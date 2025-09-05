// frontend/ src/pages/settings/GrowthSettings.jsx - user settings and download for all data/analytics
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

// Import Growth settings tabs
import AccountTab from "../../components/settings/advanced/AccountTab";
import SecurityTab from "../../components/settings/advanced/SecurityTab";
import SubscriptionTab from "../../components/settings/advanced/SubscriptionTab";
import JournalExportTab from "../../components/settings/advanced/JournalExportTab";

export default function GrowthSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Growth tabs configuration
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
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-8 flex items-center gap-3">
          <Settings className="h-8 w-8" />
          Growth Settings
          <Star className="h-6 w-6 text-yellow-500" />
        </h1>

        {/* Glass-style container */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Tab Navigation */}
          <div className="bg-purple-600/20 backdrop-blur-sm border-b border-white/20 p-4">
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
                        : "text-purple-300 hover:text-white hover:bg-white/20"
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
