// src/pages/Welcome.jsx - Updated for new tier structure
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMembership } from "../hooks/useMembership";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  BookOpen,
  BarChart3,
  Target,
  Heart,
  MessageCircle,
  Activity,
  PlusCircle,
  Calendar,
  TrendingUp,
  Lock,
  Crown,
} from "lucide-react";

export default function Welcome() {
  const { user } = useAuth();
  const { tier, canAccessTier, getTierDisplayName, loading } = useMembership();
  const [stats, setStats] = useState({
    totalEntries: 0,
    currentStreak: 0,
    totalWords: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      // Get basic journal stats
      const { data: entries } = await supabase
        .from("journal_entries")
        .select("created_at, word_count")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (entries) {
        const totalEntries = entries.length;
        const totalWords = entries.reduce(
          (sum, entry) => sum + (entry.word_count || 0),
          0
        );

        // Calculate streak (simplified)
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < entries.length; i++) {
          const entryDate = new Date(entries[i].created_at);
          entryDate.setHours(0, 0, 0, 0);

          const daysDiff = Math.floor(
            (today - entryDate) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff === currentStreak) {
            currentStreak++;
          } else {
            break;
          }
        }

        setStats({ totalEntries, currentStreak, totalWords });
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Quick actions based on membership tier
  const getQuickActions = () => {
    const baseActions = [
      {
        title: "Write New Entry",
        description: "Start journaling today",
        href: "/journaling",
        icon: PlusCircle,
        color: "from-purple-500 to-purple-600",
        available: true,
      },
      {
        title: "View History",
        description: "Browse past entries",
        href: "/history",
        icon: Calendar,
        color: "from-blue-500 to-blue-600",
        available: true,
      },
    ];

    const conditionalActions = [
      {
        title: "Analytics",
        description: "Track your progress",
        href: "/analytics",
        icon: BarChart3,
        color: "from-green-500 to-green-600",
        available: canAccessTier("basic"),
        requiredTier: "Basic",
      },
      {
        title: "Women's Health",
        description: "Track cycle & symptoms",
        href: "/womens-health",
        icon: Heart,
        color: "from-pink-500 to-pink-600",
        available: canAccessTier("basic"),
        requiredTier: "Basic",
      },
      {
        title: "Goals",
        description: "Set and track goals",
        href: "/goals",
        icon: Target,
        color: "from-orange-500 to-orange-600",
        available: canAccessTier("standard"),
        requiredTier: "Standard",
      },
      {
        title: "Wellness",
        description: "Holistic health tracking",
        href: "/wellness",
        icon: Activity,
        color: "from-emerald-500 to-emerald-600",
        available: canAccessTier("standard"),
        requiredTier: "Standard",
      },
      {
        title: "Reflectionarian",
        description: "AI-powered insights",
        href: "/reflectionarian",
        icon: MessageCircle,
        color: "from-indigo-500 to-indigo-600",
        available: canAccessTier("standard"),
        requiredTier: "Standard",
      },
    ];

    return [...baseActions, ...conditionalActions];
  };

  const handleLockedFeatureClick = (action) => {
    setUpgradeMessage(
      `Upgrade to ${action.requiredTier} membership to access ${action.title} and unlock more features!`
    );
    setShowUpgradeModal(true);
  };

  const quickActions = getQuickActions();

  const statsDisplay = [
    {
      label: "Total Entries",
      value: isLoadingStats ? "..." : stats.totalEntries,
      icon: BookOpen,
    },
    {
      label: "Day Streak",
      value: isLoadingStats ? "..." : stats.currentStreak,
      icon: Calendar,
    },
    {
      label: "Words Written",
      value: isLoadingStats ? "..." : stats.totalWords.toLocaleString(),
      icon: TrendingUp,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Ready to continue your journaling journey?
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm">
              {tier === "premium" && (
                <Crown className="w-5 h-5 text-yellow-500" />
              )}
              {tier === "advanced" && (
                <Crown className="w-5 h-5 text-purple-500" />
              )}
              {tier === "standard" && (
                <Crown className="w-5 h-5 text-blue-500" />
              )}
              {tier === "basic" && <Crown className="w-5 h-5 text-green-500" />}
              <span className="font-medium text-gray-900">
                {getTierDisplayName()} Member
              </span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statsDisplay.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;

              if (action.available) {
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className="group bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all hover:border-purple-200"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`bg-gradient-to-br ${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              } else {
                return (
                  <button
                    key={index}
                    onClick={() => handleLockedFeatureClick(action)}
                    className="group bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all hover:border-orange-200 opacity-75"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-3 rounded-lg flex-shrink-0 relative">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <Lock className="w-3 h-3 text-orange-500 absolute -top-1 -right-1" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {action.description} • Requires {action.requiredTier}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              }
            })}
          </div>
        </div>

        {/* Upgrade CTA for Free users */}
        {tier === "free" && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Unlock More Features
                </h3>
                <p className="text-purple-100">
                  Upgrade to Basic for analytics, women's health tracking, and
                  more!
                </p>
              </div>
              <button
                onClick={() => (window.location.href = "/pricing")}
                className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}
      </div>

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
