// src/components/Layout.jsx - Dark Theme with Frosted Glass Sidebar
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
import logo from "../assets/BrightReflectionaryHorizontal.svg";

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
      feature: "journaling",
      requiredTier: "free",
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
      requiredTier: "basic",
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
      icon: Heart,
      label: "Wellness",
      feature: "wellness",
      requiredTier: "standard",
    },
    {
      to: "/womens-health",
      icon: Activity,
      label: "Women's Health",
      feature: "womens_health",
      requiredTier: "premium",
    },
    {
      to: "/reflectionarian",
      icon: MessageCircle,
      label: "Reflectionarian",
      feature: "reflectionarian",
      requiredTier: "premium",
    },
  ];

  const handleNavClick = (item) => {
    if (!hasAccess(item.feature)) {
      const message = getUpgradeMessage(item.feature);
      setUpgradeMessage(message);
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  const canAccessTier = (requiredTier) => {
    const tierHierarchy = { free: 0, basic: 1, standard: 2, premium: 3 };
    const userTierLevel = tierHierarchy[tier] || 0;
    const requiredTierLevel = tierHierarchy[requiredTier] || 0;
    return userTierLevel >= requiredTierLevel;
  };

  const getMembershipDisplayInfo = () => {
    const tierColors = {
      free: "bg-gray-100 text-gray-700 border-gray-300",
      basic: "bg-blue-100 text-blue-700 border-blue-300",
      standard: "bg-purple-100 text-purple-700 border-purple-300",
      premium:
        "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent",
    };

    const tierIcons = {
      free: "🆓",
      basic: "⭐",
      standard: "💎",
      premium: "👑",
    };

    return {
      color: tierColors[tier] || tierColors.free,
      icon: tierIcons[tier] || tierIcons.free,
      label: tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : "Free",
    };
  };

  const membershipInfo = getMembershipDisplayInfo();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 items-center justify-center">
        <div className="text-purple-300">Loading your membership...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-hidden relative bg-gradient-to-r from-slate-900 via-purple-800 to-fuchsia-900">
      {/* Sidebar - Hidden on Welcome page */}
      {!isWelcomePage && (
        <aside className="relative w-72 z-10">
          {/* Frosted Glass Container */}
          <div className="fixed left-0 top-0 h-full w-72 backdrop-blur-lg bg-white/10 border-r border-white/20 shadow-2xl">
            <div className="p-2 h-full flex flex-col">
              {/* Logo */}
              {/* Logo */}
              <Link
                to="/"
                className="flex items-center justify-center mb-8 group w-full"
              >
                <div className="relative w-full">
                  <img
                    src={logo}
                    alt="Reflectionary Logo"
                    className="w-full h-auto max-h-16 object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="space-y-2 flex-1">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const userCanAccessFeature = canAccessTier(item.requiredTier);

                  if (userCanAccessFeature) {
                    return (
                      <NavLink
                        key={item.feature}
                        to={item.to}
                        className={({ isActive }) =>
                          `group flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-200 relative overflow-hidden ${
                            isActive
                              ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-lg backdrop-blur-sm border border-purple-400/50"
                              : "text-gray-300 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm hover:border-white/20 border border-transparent"
                          }`
                        }
                      >
                        <IconComponent className="h-5 w-5 relative z-10" />
                        <span className="relative z-10">{item.label}</span>
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-purple-500/20 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </NavLink>
                    );
                  } else {
                    return (
                      <button
                        key={item.feature}
                        onClick={() => handleNavClick(item)}
                        className="group flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-gray-500 hover:text-gray-400 relative border border-gray-600/30 bg-gray-800/20"
                      >
                        <IconComponent className="h-5 w-5" />
                        <span className="flex-1 text-left">{item.label}</span>
                        <Lock className="h-4 w-4 text-gray-600" />
                      </button>
                    );
                  }
                })}
              </nav>

              {/* Bottom Section */}
              <div className="space-y-4 mt-8">
                {/* Membership Badge */}
                <div
                  className={`px-4 py-3 rounded-xl border backdrop-blur-sm ${membershipInfo.color} bg-white/10`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{membershipInfo.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {membershipInfo.label} Plan
                      </div>
                      <div className="text-xs text-gray-300">{user?.email}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <NavLink
                    to="/security"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Security Settings</span>
                  </NavLink>

                  <button
                    onClick={() => {
                      lock();
                      signOut();
                    }}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 backdrop-blur-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Lock & Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 ${isWelcomePage ? "" : "px-7 py-6"} overflow-y-auto`}
      >
        <div className="min-h-screen backdrop-blur-sm bg-black/10">
          {children}
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Upgrade Required
              </h3>
              <p className="text-gray-300 mb-6">{upgradeMessage}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-500 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Maybe Later
                </button>
                <Link
                  to="/upgrade"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
