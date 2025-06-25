// src/components/Layout.jsx - Updated for new tier structure
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Plus,
  Notebook,
  BarChart3,
  Target,
  User,
  LogOut,
  Heart,
  Lock,
  Crown,
  Settings,
  Activity,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useSecurity } from "../contexts/SecurityContext";
import { useMembership } from "../hooks/useMembership";
import { useState } from "react";
import logo from "../assets/FinalReflectionarySquare.png";

export default function Layout({ children }) {
  const { user, signOut } = useAuth();
  const { lock, securitySettings } = useSecurity();
  const { hasAccess, getUpgradeMessage, tier, loading } = useMembership();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const location = useLocation();

  // Check if we're on the Welcome page
  const isWelcomePage =
    location.pathname === "/welcome" || location.pathname === "/";

  // Navigation items with new tier structure
  const navigationItems = [
    {
      to: "/journaling",
      icon: Notebook,
      label: "Journaling",
      feature: "journaling", // This will route to appropriate tier automatically
      requiredTier: "free", // Minimum tier needed to show this nav item
    },
    {
      to: "/history",
      icon: Notebook,
      label: "Journal History",
      feature: "history",
      requiredTier: "free",
    },
    {
      to: "/analytics",
      icon: BarChart3,
      label: "Analytics",
      feature: "analytics",
      requiredTier: "basic", // Only show if user has basic+ tier
    },
    {
      to: "/goals",
      icon: Target,
      label: "Goals",
      feature: "goals",
      requiredTier: "standard",
    },
    {
      to: "/wellness",
      icon: Activity,
      label: "Wellness",
      feature: "wellness",
      requiredTier: "standard",
    },
    {
      to: "/womens-health",
      icon: Heart,
      label: "Women's Health",
      feature: "womens_health",
      requiredTier: "basic",
    },
    {
      to: "/reflectionarian",
      icon: MessageCircle,
      label: "Reflectionarian",
      feature: "reflectionarian",
      requiredTier: "standard",
    },
  ];

  const getMembershipDisplayInfo = () => {
    switch (tier) {
      case "premium":
        return { label: "Premium", icon: Crown, color: "text-yellow-600" };
      case "advanced":
        return { label: "Advanced", icon: Crown, color: "text-purple-600" };
      case "standard":
        return { label: "Standard", icon: Crown, color: "text-blue-600" };
      case "basic":
        return { label: "Basic", icon: User, color: "text-green-600" };
      default:
        return { label: "Free", icon: User, color: "text-gray-600" };
    }
  };

  const canAccessTier = (requiredTier) => {
    const tierOrder = ["free", "basic", "standard", "advanced", "premium"];
    const userTierIndex = tierOrder.indexOf(tier);
    const requiredTierIndex = tierOrder.indexOf(requiredTier);
    return userTierIndex >= requiredTierIndex;
  };

  const membershipInfo = getMembershipDisplayInfo();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F5F5F5] items-center justify-center">
        <div className="text-purple-600">Loading your membership...</div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F5F5F5] text-gray-800 min-h-screen overflow-hidden">
      {/* Sidebar - Hidden on Welcome page */}
      {!isWelcomePage && (
        <aside className="w-64 bg-gradient-to-b from-[#E5E3EA] to-[#D9D6DF] p-6 shadow-lg overflow-y-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center mb-8">
            <img
              src={logo}
              alt="Reflectionary Logo"
              className="w-17 h-17 hover:scale-105 transition-transform"
            />
          </Link>

          {/* All Buttons Grouped */}
          <div className="flex flex-col space-y-4">
            {/* Navigation Links */}
            <nav className="space-y-3">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const userCanAccessFeature = canAccessTier(item.requiredTier);

                if (userCanAccessFeature) {
                  return (
                    <NavLink
                      key={item.feature}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-md transform scale-105"
                            : "bg-white/20 backdrop-blur-sm text-purple-900 hover:from-purple-500 hover:to-purple-700 hover:bg-gradient-to-br hover:text-white hover:shadow-md hover:scale-102"
                        }`
                      }
                    >
                      <IconComponent size={20} />
                      {item.label}
                    </NavLink>
                  );
                } else {
                  return (
                    <button
                      key={item.feature}
                      onClick={(e) => {
                        e.preventDefault();
                        setUpgradeMessage(getUpgradeMessage(item.feature));
                        setShowUpgradeModal(true);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 bg-white/10 backdrop-blur-sm text-purple-800 hover:bg-white/20 hover:shadow-md w-full text-left opacity-75 cursor-pointer"
                    >
                      <IconComponent size={20} />
                      <span className="flex-1">{item.label}</span>
                      <Lock size={16} className="text-purple-600" />
                    </button>
                  );
                }
              })}
            </nav>

            {/* Security Settings */}
            {securitySettings.showLockStatus && (
              <NavLink
                to="/security"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-md transform scale-105"
                      : "bg-white/20 backdrop-blur-sm text-purple-900 hover:from-purple-500 hover:to-purple-700 hover:bg-gradient-to-br hover:text-white hover:shadow-md hover:scale-102"
                  }`
                }
              >
                <Settings size={20} />
                Security
              </NavLink>
            )}

            {/* Membership Status */}
            <div className="border-t border-white/20 pt-4 mt-4">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <membershipInfo.icon
                  size={20}
                  className={membershipInfo.color}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-900">
                    {membershipInfo.label} Member
                  </p>
                  {tier === "free" && (
                    <button
                      onClick={() => {
                        setUpgradeMessage("Upgrade to unlock more features!");
                        setShowUpgradeModal(true);
                      }}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Upgrade
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 bg-white/10 backdrop-blur-sm text-purple-900 hover:bg-red-500 hover:text-white hover:shadow-md"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">{children}</main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upgrade Required
            </h3>
            <p className="text-gray-600 mb-6">{upgradeMessage}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  // TODO: Navigate to pricing/upgrade page
                  window.location.href = "/pricing";
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
