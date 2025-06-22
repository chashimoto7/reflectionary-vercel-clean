// src/pages/Welcome.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Heart,
  Target,
  BarChart3,
  Calendar,
  Star,
  TrendingUp,
  Activity,
  Lock,
  MessageCircle,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import { supabase } from "../lib/supabase";
import logo from "../assets/FinalReflectionarySquare.png";

// Import quotes
const QUOTES = [
  {
    text: "The mind is everything. What you think you become.",
    author: "Buddha",
    theme: "mindfulness",
  },
  {
    text: "In the depths of winter, I finally learned that there was in me an invincible summer.",
    author: "Albert Camus",
    theme: "resilience",
  },
  {
    text: "You cannot swim for new horizons until you have courage to lose sight of the shore.",
    author: "William Faulkner",
    theme: "change",
  },
  {
    text: "Feelings are just visitors. Let them come and go.",
    author: "Mooji",
    theme: "emotions",
  },
  {
    text: "Waves are the practice of water.",
    author: "Suzuki Roshi",
    theme: "practice",
  },
  {
    text: "The good life is a process, not a state of being. It is a direction, not a destination.",
    author: "Carl Rogers",
    theme: "growth",
  },
  {
    text: "Between stimulus and response there is a space. In that space is our power to choose our response.",
    author: "Viktor E. Frankl",
    theme: "choice",
  },
  {
    text: "The curious paradox is that when I accept myself just as I am, then I can change.",
    author: "Carl Rogers",
    theme: "acceptance",
  },
  {
    text: "Emotions are like waves. We can't stop them from coming but we can choose which ones to surf.",
    author: "Jonatan Mårtensson",
    theme: "emotions",
  },
  {
    text: "Your present circumstances don't determine where you can go; they merely determine where you start.",
    author: "Nido Qubein",
    theme: "growth",
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
];

function getRandomQuote(excludeIndex) {
  let idx;
  do {
    idx = Math.floor(Math.random() * QUOTES.length);
  } while (idx === excludeIndex);
  return { ...QUOTES[idx], idx };
}

// Upgrade modal component with enhanced design
function UpgradeModal({ feature, message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl transform transition-all animate-slideUp">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 rounded-full blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Lock className="text-white animate-bounce" size={28} />
            </div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Unlock {feature}
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              Maybe Later
            </button>
            <button
              onClick={() => {
                window.location.href = "/membership";
              }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Welcome() {
  const { user } = useAuth();
  const {
    hasAccess,
    getUpgradeMessage,
    tier,
    loading: membershipLoading,
  } = useMembership();
  const [quote, setQuote] = useState(() => getRandomQuote(-1));
  const [userName, setUserName] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    currentStreak: 0,
    totalEntries: 0,
    insightsGenerated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalContent, setUpgradeModalContent] = useState({
    feature: "",
    message: "",
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate quote every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuote((q) => getRandomQuote(q.idx));
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user data and stats
  useEffect(() => {
    if (user && !membershipLoading) {
      fetchUserData();
    }
  }, [user, membershipLoading]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch user profile for name
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("preferred_name")
        .eq("user_id", user.id)
        .single();

      if (profile?.preferred_name) {
        setUserName(profile.preferred_name);
      } else {
        // Fallback to email username
        const emailName = user.email.split("@")[0];
        setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
      }

      // Fetch journal entries for stats
      const { data: entries } = await supabase
        .from("journal_entries")
        .select("id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (entries) {
        // Calculate total entries
        setStats((prev) => ({ ...prev, totalEntries: entries.length }));

        // Calculate current streak
        const streak = calculateStreak(entries);
        setStats((prev) => ({ ...prev, currentStreak: streak }));
      }

      // Fetch insights count (if user has access to analytics)
      if (hasAccess("analytics")) {
        const { data: insights } = await supabase
          .from("user_insights")
          .select("id")
          .eq("user_id", user.id);

        if (insights) {
          setStats((prev) => ({
            ...prev,
            insightsGenerated: insights.length,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (entries) => {
    if (!entries || entries.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    // Check each day going backwards
    for (let i = 0; i < 365; i++) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      // Check if there's an entry on this day
      const hasEntry = sortedEntries.some((entry) => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= dayStart && entryDate <= dayEnd;
      });

      if (hasEntry) {
        streak++;
      } else if (i > 0) {
        // If we've started counting and hit a day with no entry, stop
        break;
      }

      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  const getGreeting = () => {
    const timeOfDay = getTimeOfDay();
    return `Good ${timeOfDay}, ${userName || "there"}`;
  };

  const getTimeIcon = () => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 18) {
      return <Sun className="w-5 h-5" />;
    }
    return <Moon className="w-5 h-5" />;
  };

  // Quick Actions - enhanced with gradients and animations
  const quickActions = [
    {
      icon: Brain,
      title: "New Entry",
      description: "Start your reflection",
      href: "/journaling",
      gradient: "from-purple-500 via-purple-600 to-indigo-600",
      feature: "journaling",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "View your insights",
      href: "/analytics",
      gradient: "from-cyan-500 via-blue-500 to-indigo-500",
      feature: "analytics",
    },
    {
      icon: Target,
      title: "Goals",
      description: "Track progress",
      href: "/goals",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      feature: "goals",
    },
    {
      icon: Activity,
      title: "Wellness",
      description: "Track wellbeing",
      href: "/wellness",
      gradient: "from-rose-500 via-pink-500 to-purple-500",
      feature: "wellness",
    },
    {
      icon: Heart,
      title: "Women's Health",
      description: "Track your cycle",
      href: "/womens-health",
      gradient: "from-pink-500 via-rose-500 to-orange-500",
      feature: "womens_health",
    },
    {
      icon: MessageCircle,
      title: "Reflectionarian",
      description: "AI companion",
      href: "/reflectionarian",
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
      feature: "reflectionarian",
    },
  ];

  // Stats configuration with enhanced design
  const statsData = [
    {
      icon: TrendingUp,
      label: "Current Streak",
      value: loading ? "..." : `${stats.currentStreak}`,
      unit: "days",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Calendar,
      label: "Total Entries",
      value: loading ? "..." : stats.totalEntries.toString(),
      unit: "",
      gradient: "from-pink-500 to-orange-500",
    },
    {
      icon: Star,
      label: "Insights",
      value: loading ? "..." : stats.insightsGenerated.toString(),
      unit: "generated",
      gradient: "from-orange-500 to-purple-500",
    },
  ];

  const handleQuickActionClick = (action, e) => {
    if (!hasAccess(action.feature)) {
      e.preventDefault();
      setUpgradeModalContent({
        feature: action.title,
        message: getUpgradeMessage(action.feature),
      });
      setShowUpgradeModal(true);
    }
  };

  if (membershipLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8 animate-fadeIn">
              <img
                src={logo}
                alt="Reflectionary"
                className="w-24 h-24 mx-auto rounded-2xl shadow-2xl ring-4 ring-white/30 hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Greeting with time icon */}
            <div className="flex items-center justify-center gap-3 mb-6 animate-slideDown">
              <div className="text-white/80">{getTimeIcon()}</div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                {getGreeting()}
              </h1>
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>

            {/* Quote section with enhanced styling */}
            <div className="max-w-3xl mx-auto animate-fadeIn">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
                <blockquote className="text-lg md:text-xl italic text-white/90 mb-4 min-h-[3rem] transition-all duration-500">
                  "{quote.text}"
                </blockquote>
                <p className="text-white/70 font-medium">— {quote.author}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 relative z-10">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                      {stat.unit && (
                        <span className="text-lg text-gray-500">
                          {stat.unit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`bg-gradient-to-br ${stat.gradient} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Quick Actions Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              Quick Actions
            </h2>
            <div className="h-1 flex-1 ml-4 bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const isLocked = !hasAccess(action.feature);

              return (
                <Link
                  key={index}
                  to={action.href}
                  onClick={(e) => handleQuickActionClick(action, e)}
                  className={`group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden ${
                    isLocked ? "opacity-90" : ""
                  }`}
                >
                  {/* Background gradient on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`bg-gradient-to-br ${action.gradient} p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      {isLocked && (
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <Lock className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Enhanced Tips Section */}
        <div className="bg-gradient-to-br from-white via-purple-50/50 to-pink-50/50 rounded-2xl p-8 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Daily Inspiration
            </h2>
            <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 mt-2 group-hover:scale-150 transition-transform" />
                <p className="text-gray-700 leading-relaxed">
                  Take a moment to reflect on what you're grateful for today
                </p>
              </div>
            </div>
            <div className="group">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 mt-2 group-hover:scale-150 transition-transform" />
                <p className="text-gray-700 leading-relaxed">
                  Journal about a challenge you faced and what you learned
                </p>
              </div>
            </div>
            <div className="group">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 mt-2 group-hover:scale-150 transition-transform" />
                <p className="text-gray-700 leading-relaxed">
                  Set aside 10 minutes for mindful breathing before bed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          feature={upgradeModalContent.feature}
          message={upgradeModalContent.message}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
}
