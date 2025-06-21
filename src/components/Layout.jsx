// src/components/Layout.jsx
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
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
  Sparkles,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useSecurity } from "../contexts/SecurityContext";
import { useMembership } from "../hooks/useMembership";
import { useState } from "react";
import logo from "../assets/FinalReflectionarySquare.png";

export default function Layout({ children }) {
  const { user, signOut } = useAuth();
  const { lock, securitySettings } = useSecurity();
  const {
    hasAccess,
    getUpgradeMessage,
    tier,
    loading,
    canPickMoreFeatures,
    selectedFeatures,
  } = useMembership();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're on the Welcome page
  const isWelcomePage =
    location.pathname === "/welcome" || location.pathname === "/";

  const navigationItems = [
    {
      to: "/journaling",
      icon: Notebook,
      label: "Journaling",
      feature: "journaling",
    },
    {
      to: "/history",
      icon: Notebook,
      label: "Journal History",
      feature: "history",
    },
    {
      to: "/analytics",
      icon: BarChart3,
      label: "Analytics",
      feature: "analytics",
    },
    {
      to: "/goals",
      icon: Target,
      label: "Goals",
      feature: "goals",
    },
    {
      to: "/wellness",
      icon: Activity,
      label: "Wellness",
      feature: "wellness",
    },
    {
      to: "/womens-health",
      icon: Heart,
      label: "Women's Health",
      feature: "womens_health",
    },
    {
      to: "/reflectionarian",
      icon: MessageCircle,
      label: "Reflectionarian",
      feature: "reflectionarian",
    },
  ];

  const getMembershipDisplayInfo = () => {
    switch (tier) {
      case "pro":
        return {
          label: "Pro",
          icon: Crown,
          color: "text-yellow-600",
          bgColor: "bg-gradient-to-r from-yellow-100 to-orange-100",
          borderColor: "border-yellow-300",
        };
      case "premium":
        return {
          label: "Premium",
          icon: Crown,
          color: "text-purple-600",
          bgColor: "bg-gradient-to-r from-purple-100 to-pink-100",
          borderColor: "border-purple-300",
        };
      case "standard_plus":
        return {
          label: "Standard+",
          icon: Sparkles,
          color: "text-blue-600",
          bgColor: "bg-gradient-to-r from-blue-100 to-indigo-100",
          borderColor: "border-blue-300",
        };
      case "standard":
        return {
          label: "Standard",
          icon: Crown,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "basic":
        return {
          label: "Basic",
          icon: User,
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
        };
      default:
        return {
          label: "Free",
          icon: User,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  // Standard+ Navigation Item Component
  const StandardPlusNavItem = () => {
    if (tier !== "standard_plus") return null;

    return (
      <NavLink
        to="/standard-plus"
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
            isActive
              ? "bg-white/30 text-purple-900 shadow-md"
              : "bg-white/20 backdrop-blur-sm text-purple-900 hover:bg-white/30 hover:shadow-md"
          }`
        }
      >
        <Sparkles size={20} />
        <span>My Features</span>
        {canPickMoreFeatures() && (
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
        )}
      </NavLink>
    );
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
                const userHasAccess = hasAccess(item.feature);

                if (userHasAccess) {
                  return (
                    <NavLink
                      key={item.feature}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-white/30 text-purple-900 shadow-md"
                            : "bg-white/20 backdrop-blur-sm text-purple-900 hover:bg-white/30 hover:shadow-md"
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
                      onClick={() => {
                        setUpgradeMessage(getUpgradeMessage(item.feature));
                        setShowUpgradeModal(true);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 bg-white/10 text-purple-700 hover:bg-white/20 w-full text-left opacity-75"
                    >
                      <IconComponent size={20} />
                      {item.label}
                      <Lock size={16} className="ml-auto" />
                    </button>
                  );
                }
              })}

              {/* Standard+ Features Navigation Item */}
              <StandardPlusNavItem />
            </nav>

            {/* Security Settings Link */}
            {securitySettings && (
              <NavLink
                to="/security"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/30 text-purple-900 shadow-md"
                      : "bg-white/20 backdrop-blur-sm text-purple-900 hover:bg-white/30 hover:shadow-md"
                  }`
                }
              >
                <Settings size={20} />
                Security Settings
              </NavLink>
            )}

            {/* Manual Lock Button */}
            <button
              onClick={lock}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 bg-white/20 backdrop-blur-sm text-purple-900 hover:bg-white/30 hover:shadow-md w-full text-left"
              title="Lock your journal for security"
            >
              <Lock size={20} />
              Lock Journal
            </button>

            {/* Enhanced Membership Info */}
            <div
              className={`px-4 py-3 rounded-lg border-2 ${membershipInfo.bgColor} ${membershipInfo.borderColor}`}
            >
              <div className="flex items-center gap-2 text-purple-900">
                <membershipInfo.icon
                  size={16}
                  className={membershipInfo.color}
                />
                <span className="text-sm font-medium">
                  {membershipInfo.label} Member
                </span>
              </div>

              {/* Standard+ Feature Progress */}
              {tier === "standard_plus" && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <div className="text-xs text-blue-700">
                    Features: {selectedFeatures.length}/2 selected
                  </div>
                  <div className="mt-1 w-full bg-blue-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${(selectedFeatures.length / 2) * 100}%`,
                      }}
                    />
                  </div>
                  {canPickMoreFeatures() && (
                    <button
                      onClick={() => navigate("/standard-plus")}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Select Features
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* User Info & Sign Out */}
            <div className="px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-purple-900 text-sm space-y-2">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span className="truncate">{user?.email}</span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>

            {/* Footer */}
            <div className="text-xs text-purple-700 text-center pt-2">
              <p>&copy; {new Date().getFullYear()} Reflectionary</p>
            </div>
          </div>
        </aside>
      )}

      {/* Main content - Adjust padding based on sidebar presence */}
      <main className={`flex-1 ${isWelcomePage ? "" : "ml-0"} overflow-auto`}>
        {children}
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upgrade Required
            </h3>
            <p className="text-gray-600 mb-6">{upgradeMessage}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate("/membership");
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
