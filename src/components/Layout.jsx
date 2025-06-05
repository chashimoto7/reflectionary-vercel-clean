// src/components/Layout.jsx
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Plus,
  Notebook,
  BarChart3,
  Target,
  User,
  LogOut,
  Lock,
  Crown,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import { useState } from "react";
import logo from "../assets/reflectionary-square.png";

export default function Layout() {
  const { user, signOut } = useAuth();
  const { hasFeatureAccess, getUpgradeMessage, tier, loading } =
    useMembership();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  // Handle clicks on locked features
  const handleLockedFeatureClick = (e, featureName) => {
    e.preventDefault();
    setUpgradeMessage(getUpgradeMessage(featureName));
    setShowUpgradeModal(true);
  };

  // Define navigation items with their access requirements
  const navigationItems = [
    {
      to: "/new-entry",
      icon: Plus,
      label: "New Entry",
      feature: "journaling",
      colors: {
        bg: "bg-gradient-to-br from-purple-400 to-purple-600",
        text: "text-white",
        hover: "hover:from-purple-500 hover:to-purple-700",
      },
    },
    {
      to: "/history",
      icon: Notebook,
      label: "Journal History",
      feature: "history",
      colors: {
        bg: "bg-gradient-to-br from-blue-400 to-blue-600",
        text: "text-white",
        hover: "hover:from-blue-500 hover:to-blue-700",
      },
    },
    {
      to: "/analytics",
      icon: BarChart3,
      label: "Analytics",
      feature: "analytics",
      colors: {
        bg: "bg-gradient-to-br from-green-400 to-green-600",
        text: "text-white",
        hover: "hover:from-green-500 hover:to-green-700",
      },
    },
    {
      to: "/goals",
      icon: Target,
      label: "Goals",
      feature: "goals",
      colors: {
        bg: "bg-gradient-to-br from-orange-400 to-orange-600",
        text: "text-white",
        hover: "hover:from-orange-500 hover:to-orange-700",
      },
    },
  ];

  // Get membership display info
  const getMembershipDisplayInfo = () => {
    switch (tier) {
      case "premium":
        return { label: "Premium", icon: Crown, color: "text-yellow-600" };
      case "standard":
        return { label: "Standard", icon: Crown, color: "text-blue-600" };
      case "basic":
        return { label: "Basic", icon: User, color: "text-green-600" };
      default:
        return { label: "Free", icon: User, color: "text-gray-600" };
    }
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
    <div className="flex min-h-screen bg-[#F5F5F5] text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#A8A3B4] to-[#9B96A6] p-6 flex flex-col justify-between shadow-lg">
        <div>
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center mb-8">
            <img
              src={logo}
              alt="Reflectionary Logo"
              className="w-17 h-17 hover:scale-105 transition-transform"
            />
          </Link>

          {/* Navigation */}
          <nav className="space-y-3">
            {navigationItems.map((item) => {
              const hasAccess = hasFeatureAccess(item.feature);
              const IconComponent = item.icon;

              if (hasAccess) {
                // User has access - render normal NavLink
                return (
                  <NavLink
                    key={item.feature}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isActive
                          ? `${item.colors.bg} ${item.colors.text} shadow-md transform scale-105`
                          : `bg-white/20 backdrop-blur-sm text-purple-900 ${item.colors.hover} hover:shadow-md hover:scale-102`
                      }`
                    }
                  >
                    <IconComponent size={20} />
                    {item.label}
                  </NavLink>
                );
              } else {
                // User doesn't have access - render locked version
                return (
                  <button
                    key={item.feature}
                    onClick={(e) => handleLockedFeatureClick(e, item.feature)}
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
        </div>

        {/* User info and membership tier */}
        <div className="space-y-4">
          {/* Membership tier display */}
          <div className="px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-purple-900">
              <membershipInfo.icon size={16} className={membershipInfo.color} />
              <span className="text-sm font-medium">
                {membershipInfo.label} Member
              </span>
            </div>
          </div>

          {/* User info */}
          <div className="px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-purple-900 text-sm space-y-2">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span className="truncate">{user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>

          {/* Copyright */}
          <div className="text-xs text-purple-100 text-center">
            <p>&copy; {new Date().getFullYear()} Reflectionary</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Feature Locked
              </h3>
              <p className="text-gray-600 mb-6">{upgradeMessage}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    // Here you would navigate to your upgrade/pricing page
                    // For now, we'll just close the modal
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors font-medium"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
