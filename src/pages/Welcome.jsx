// frontend/src/pages/Welcome.jsx - Updated for new tier structure with daily check-in
import lightLogo from "../assets/BrightReflectionarySquare.svg";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import { supabase } from "../lib/supabase";
import {
  Sparkles,
  TrendingUp,
  Shield,
  Brain,
  Clock,
  Quote,
  Bell,
  BarChart3,
  ArrowRight,
  MessageCircle,
  Lock,
  Crown,
} from "lucide-react";
import DailyCheckin from "../components/DailyCheckin";

const QUOTES = [
  {
    text: "The unexamined life is not worth living.",
    author: "Socrates",
    theme: "reflection",
  },
  {
    text: "You don't have to control your thoughts. You just have to stop letting them control you.",
    author: "Dan Millman",
    theme: "mindfulness",
  },
  {
    text: "Journaling is like whispering to one's self and listening at the same time.",
    author: "Mina Murray",
    theme: "journaling",
  },
  {
    text: "The act of writing is the act of discovering what you believe.",
    author: "David Hare",
    theme: "discovery",
  },
  {
    text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    author: "Ralph Waldo Emerson",
    theme: "authenticity",
  },
  {
    text: "Your present circumstances don't determine where you can go; they merely determine where you start.",
    author: "Nido Qubein",
    theme: "growth",
  },
];

function getRandomQuote(excludeIndex) {
  let idx;
  do {
    idx = Math.floor(Math.random() * QUOTES.length);
  } while (idx === excludeIndex);
  return { ...QUOTES[idx], idx };
}

export default function Welcome() {
  const { user } = useAuth();
  const { tier, hasAccess, getUpgradeMessage } = useMembership();
  const [quote, setQuote] = useState(() => getRandomQuote(-1));
  const [userName, setUserName] = useState("Guest");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  // Auto-rotate quote every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuote((q) => getRandomQuote(q.idx));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user name
  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from("user_profiles")
          .select("username")
          .eq("user_id", user.id)
          .single();

        if (data?.username) {
          setUserName(data.username);
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUserName();
  }, [user]);

  const handleFeatureClick = (feature, href) => {
    if (!hasAccess(feature)) {
      const message = getUpgradeMessage(feature);
      setUpgradeMessage(message);
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  // Quick Actions - Updated for new tier structure
  const quickActions = [
    {
      icon: Brain,
      title: "New Journal Entry",
      href: "/journaling",
      feature: "journaling",
      color: "from-purple-500 to-purple-600",
      requiredTier: "growth",
    },
    {
      icon: BarChart3,
      title: "Knowledge Garden",
      href: "/knowledge-garden",
      feature: "knowledge_garden", 
      color: "from-emerald-500 to-emerald-600",
      requiredTier: "growth",
    },
    {
      icon: MessageCircle,
      title: "Reflectionarian",
      href: "/reflectionarian",
      feature: "reflectionarian",
      color: "from-indigo-500 to-indigo-600",
      requiredTier: "premium",
    },
  ];

  const announcements = [
    {
      type: "feature",
      title: "Knowledge Garden Now Live",
      description:
        "Your personal knowledge management system connects all your insights",
      icon: Sparkles,
      date: "New Feature",
    },
    {
      type: "update", 
      title: "Simplified Membership Tiers",
      description:
        "We've streamlined to Growth ($15) and Premium ($25) for clearer value",
      icon: TrendingUp,
      date: "Recently Updated",
    },
    {
      type: "tip",
      title: "Privacy First, Always",
      description:
        "Your reflections are end-to-end encrypted and visible only to you",
      icon: Shield,
      date: "Core Promise",
    },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/30 to-pink-600/20 animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
      </div>

      {/* Header Section - Simplified */}
      <div className="relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src={lightLogo}
                alt="Reflectionary Logo"
                className="h-32 w-32 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Reflectionary
              </h1>
              <p className="text-lg text-purple-200">
                Your consciousness evolution platform
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Daily Check-in Section */}
          <DailyCheckin userName={userName} />

          {/* Quick Actions - Simplified */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const canAccess = hasAccess(action.feature);
                
                return (
                  <div key={index} className="relative">
                    {canAccess ? (
                      <Link
                        to={action.href}
                        className="group backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg hover:bg-white/15 hover:border-purple-400/50 transition-all duration-300 block"
                      >
                        <div className="flex flex-col items-center text-center gap-4">
                          <div
                            className={`bg-gradient-to-br ${action.color} p-4 rounded-lg group-hover:scale-110 transition-transform shadow-lg`}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-purple-200 transition-colors text-lg">
                              {action.title}
                            </h3>
                            <p className="text-sm text-gray-300 mt-1">
                              {action.requiredTier === 'growth' ? 'Growth Feature' : 'Premium Feature'}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleFeatureClick(action.feature, action.href)}
                        className="group backdrop-blur-xl bg-white/5 rounded-xl p-6 border border-white/10 shadow-lg hover:bg-white/10 transition-all duration-300 w-full relative"
                      >
                        <div className="flex flex-col items-center text-center gap-4">
                          <div className="bg-gray-600/30 p-4 rounded-lg shadow-lg relative">
                            <Icon className="w-8 h-8 text-gray-400" />
                            <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
                              <Lock className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-400 text-lg">
                              {action.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Requires {action.requiredTier === 'growth' ? 'Growth' : 'Premium'} Plan
                            </p>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Updates & Announcements */}
          <div className="mb-8">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Updates & Announcements
                </h2>
                <Bell className="w-5 h-5 text-gray-300" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {announcements.map((announcement, index) => {
                  const Icon = announcement.icon;
                  const typeColors = {
                    feature:
                      "bg-purple-500/20 text-purple-200 border-purple-400/30",
                    update: "bg-cyan-500/20 text-cyan-200 border-cyan-400/30",
                    tip: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
                  };

                  return (
                    <div key={index} className="flex gap-4">
                      <div
                        className={`p-2 rounded-lg backdrop-blur-sm border ${
                          typeColors[announcement.type]
                        } flex-shrink-0`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">
                          {announcement.title}
                        </h3>
                        <p className="text-sm text-gray-300 mt-1">
                          {announcement.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {announcement.date}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-white/20 text-center">
                <Link
                  to="/settings"
                  className="text-sm text-purple-300 hover:text-purple-200 font-medium inline-flex items-center gap-2 group"
                >
                  View settings
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quote and Privacy Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Daily Inspiration */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-purple-600/80 to-pink-600/80 backdrop-blur-xl rounded-2xl p-8 text-white shadow-2xl border border-purple-400/30">
                <div className="flex items-start gap-4">
                  <Quote className="w-8 h-8 opacity-70 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <blockquote className="text-xl font-medium mb-4 leading-relaxed">
                      "{quote.text}"
                    </blockquote>
                    <cite className="text-purple-100 text-sm flex items-center gap-2">
                      <span className="w-8 h-px bg-purple-300"></span>
                      {quote.author}
                    </cite>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Section */}
            <div>
              <div className="backdrop-blur-xl bg-purple-500/20 rounded-xl p-6 border border-purple-400/30 h-fit">
                <h4 className="text-lg font-semibold text-purple-200 mb-3">
                  🔒 Your Privacy Matters
                </h4>
                <p className="text-sm text-purple-100 leading-relaxed">
                  Your journal is personal — and we treat it that way. All your
                  reflections are end-to-end encrypted so no one else can read
                  your words. Not our team. Not our servers. Just you.
                  Reflectionary is your private space for consciousness evolution.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity Footer */}
          <div className="mt-12 backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-300" />
                <span className="text-sm text-gray-300">
                  Ready to continue your consciousness evolution journey?
                </span>
              </div>
              <Link
                to="/journaling"
                className="text-sm font-medium text-purple-300 hover:text-purple-200 transition-colors"
              >
                Start journaling →
              </Link>
            </div>
          </div>
        </div>
      </div>

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
                  to="/signup"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-center"
                  onClick={() => setShowUpgradeModal(false)}
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