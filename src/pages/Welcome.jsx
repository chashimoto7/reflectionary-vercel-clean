//src/pages/welcome
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  TrendingUp,
  Zap,
  Activity,
  BarChart3,
  Target,
  Brain,
  Heart,
  Bell,
  MessageCircle,
  Sparkles,
  Crown,
} from "lucide-react";
import { useMembership } from "../hooks/useMembership";

// Inspirational quotes
const QUOTES = [
  {
    text: "The privilege of a lifetime is being who you are.",
    author: "Joseph Campbell",
    theme: "authenticity",
  },
  {
    text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.",
    author: "Rumi",
    theme: "growth",
  },
  {
    text: "Feelings are like waves. We can't stop them from coming but we can choose which ones to surf.",
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

export default function Welcome() {
  const [quote, setQuote] = useState(() => getRandomQuote(-1));
  const [userName, setUserName] = useState("Christine");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hasShownFeaturePrompt, setHasShownFeaturePrompt] = useState(false);

  const navigate = useNavigate();
  const {
    tier,
    selectedFeatures,
    canPickMoreFeatures,
    loading: membershipLoading,
  } = useMembership();

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

  // Standard+ Feature Selection Auto-Prompt
  useEffect(() => {
    if (
      tier === "standard_plus" &&
      selectedFeatures.length === 0 &&
      !hasShownFeaturePrompt &&
      !membershipLoading
    ) {
      const timer = setTimeout(() => {
        const shouldPrompt = window.confirm(
          "🎉 Welcome to Standard+! You can select 2 advanced features to enhance your Reflectionary experience. Would you like to choose them now?"
        );
        if (shouldPrompt) {
          navigate("/standard-plus");
        }
        setHasShownFeaturePrompt(true);
      }, 3000); // Show after 3 seconds on Welcome page

      return () => clearTimeout(timer);
    }
  }, [
    tier,
    selectedFeatures.length,
    hasShownFeaturePrompt,
    membershipLoading,
    navigate,
  ]);

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  const getGreeting = () => {
    const timeOfDay = getTimeOfDay();
    return `Good ${timeOfDay}, ${userName}`;
  };

  // Sample stats (you can replace with real data)
  const stats = [
    {
      icon: Activity,
      label: "Journal Entries",
      value: "47",
    },
    {
      icon: TrendingUp,
      label: "Insights Gained",
      value: "23",
    },
    {
      icon: Calendar,
      label: "Days Active",
      value: "42",
    },
  ];

  // Updated Quick Actions - Now 6 actions in 2 rows (3x2 grid)
  const quickActions = [
    {
      icon: Brain,
      title: "New Entry",
      description: "Start your reflection",
      href: "/journaling",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "View your insights",
      href: "/analytics",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: Target,
      title: "Goals",
      description: "Track progress",
      href: "/goals",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: Activity,
      title: "Wellness",
      description: "Track your wellbeing",
      href: "/wellness",
      color: "from-rose-500 to-rose-600",
    },
    {
      icon: Heart,
      title: "Women's Health",
      description: "Specialized tracking",
      href: "/womens-health",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: MessageCircle,
      title: "Reflectionarian",
      description: "AI companion chat",
      href: "/reflectionarian",
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  // Sample announcements
  const announcements = [
    {
      icon: Sparkles,
      type: "feature",
      title: "New Analytics Dashboard",
      description: "Discover deeper insights about your journaling patterns.",
      date: "2 days ago",
    },
    {
      icon: Zap,
      type: "update",
      title: "Improved Security",
      description: "Enhanced encryption for even better privacy protection.",
      date: "1 week ago",
    },
    {
      icon: Target,
      type: "tip",
      title: "Goal Setting Tips",
      description: "Learn how to create meaningful, achievable goals.",
      date: "2 weeks ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {getGreeting()}
            </h1>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Welcome back to your personal growth journey
            </p>

            {/* Standard+ Feature Selection Banner */}
            {tier === "standard_plus" && canPickMoreFeatures() && (
              <div className="mb-8 max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Crown className="w-6 h-6 text-yellow-300" />
                    <h3 className="text-lg font-semibold text-white">
                      Complete Your Standard+ Setup
                    </h3>
                  </div>
                  <p className="text-purple-100 mb-4">
                    You have {2 - selectedFeatures.length} advanced feature
                    {2 - selectedFeatures.length !== 1 ? "s" : ""} left to
                    select. Choose the features that matter most to your growth
                    journey.
                  </p>
                  <button
                    onClick={() => navigate("/standard-plus")}
                    className="bg-white text-purple-700 font-semibold px-6 py-3 rounded-lg hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Select Your Features
                  </button>
                </div>
              </div>
            )}

            {/* Quote Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-3xl mx-auto">
              <blockquote className="text-lg text-white font-medium italic mb-2">
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
          {stats.map((stat, index) => {
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

        {/* Quick Actions - Now in 2 rows of 3 rectangular cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.href}
                  className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all hover:border-purple-200 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`bg-gradient-to-br ${action.color} p-3 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Updates & Announcements - Full Width */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Updates & Announcements
              </h2>
              <Bell className="w-5 h-5 text-gray-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {announcements.map((announcement, index) => {
                const Icon = announcement.icon;
                const typeColors = {
                  feature: "bg-purple-100 text-purple-700",
                  update: "bg-cyan-100 text-cyan-700",
                  tip: "bg-emerald-100 text-emerald-700",
                };

                return (
                  <div key={index} className="flex gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        typeColors[announcement.type]
                      } flex-shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {announcement.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
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
          </div>
        </div>

        {/* Footer Quote Attribution */}
        <div className="text-center text-xs text-gray-400">
          <p>
            Inspirational quotes to guide your reflection • Theme:{" "}
            <span className="capitalize">{quote.theme}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
