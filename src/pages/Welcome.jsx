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
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMembership } from "../hooks/useMembership";
import { supabase } from "../lib/supabase";

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

// Upgrade modal component
function UpgradeModal({ feature, message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Unlock {feature}
          </h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={() => {
                // TODO: Navigate to membership page
                window.location.href = "/membership";
              }}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors font-medium"
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
          setStats((prev) => ({ ...prev, insightsGenerated: insights.length }));
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

  // Quick Actions - pointing to ROUTERS, not direct pages
  const quickActions = [
    {
      icon: Brain,
      title: "New Entry",
      description: "Start your reflection",
      href: "/journaling",
      color: "from-purple-500 to-purple-600",
      feature: "journaling",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "View your insights",
      href: "/analytics",
      color: "from-cyan-500 to-cyan-600",
      feature: "analytics",
    },
    {
      icon: Target,
      title: "Goals",
      description: "Track progress",
      href: "/goals",
      color: "from-emerald-500 to-emerald-600",
      feature: "goals",
    },
    {
      icon: Activity,
      title: "Wellness",
      description: "Track your wellbeing",
      href: "/wellness",
      color: "from-rose-500 to-rose-600",
      feature: "wellness",
    },
    {
      icon: Heart,
      title: "Women's Health",
      description: "Track your cycle",
      href: "/womens-health",
      color: "from-pink-500 to-pink-600",
      feature: "womens_health",
    },
    {
      icon: MessageCircle,
      title: "Reflectionarian",
      description: "AI companion chat",
      href: "/reflectionarian",
      color: "from-indigo-500 to-indigo-600",
      feature: "reflectionarian",
    },
  ];

  // Stats configuration
  const statsData = [
    {
      icon: TrendingUp,
      label: "Current Streak",
      value: loading ? "..." : `${stats.currentStreak} days`,
    },
    {
      icon: Calendar,
      label: "Total Entries",
      value: loading ? "..." : stats.totalEntries.toString(),
    },
    {
      icon: Star,
      label: "Insights Generated",
      value: loading ? "..." : stats.insightsGenerated.toString(),
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Quote */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{getGreeting()}</h1>
            <div className="max-w-2xl mx-auto">
              <blockquote className="text-lg italic mb-3 min-h-[3rem] transition-all duration-500">
                "{quote.text}"
              </blockquote>
              <p className="text-purple-200">— {quote.author}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statsData.map((stat, index) => {
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

        {/* Quick Actions - 2x3 Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const isLocked = !hasAccess(action.feature);

              return (
                <Link
                  key={index}
                  to={action.href}
                  onClick={(e) => handleQuickActionClick(action, e)}
                  className={`group bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all hover:border-purple-200 ${
                    isLocked ? "opacity-75" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`bg-gradient-to-br ${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {isLocked && <Lock className="w-5 h-5 text-gray-400" />}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity or Tips */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tips for Today
          </h2>
          <div className="space-y-3 text-gray-600">
            <p>• Take a moment to reflect on what you're grateful for today</p>
            <p>
              • Try journaling about a challenge you faced and what you learned
            </p>
            <p>• Set aside 10 minutes for mindful breathing before bed</p>
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
