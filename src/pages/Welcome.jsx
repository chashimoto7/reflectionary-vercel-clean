// src/pages/Welcome.jsx
import logo from "../assets/ReflectionaryWordWelcome.png";
import squarelogo from "../assets/FinalReflectionarySquare.png";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  TrendingUp,
  Shield,
  Brain,
  Heart,
  Clock,
  ChevronRight,
  Quote,
  Bell,
  Calendar,
  BarChart3,
  Target,
  Lightbulb,
  Award,
  ArrowRight,
  Activity,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

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
    text: "Sometimes the most productive thing you can do is relax.",
    author: "Mark Black",
    theme: "wellness",
  },
  {
    text: "Feelings are much like waves. We can't stop them from coming but we can choose which ones to surf.",
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
  const { user } = useAuth();
  const [quote, setQuote] = useState(() => getRandomQuote(-1));
  const [userName, setUserName] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    currentStreak: 0,
    totalEntries: 0,
    insightsGenerated: 0,
  });
  const [loading, setLoading] = useState(true);

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
    if (user) {
      fetchUserData();
    }
  }, [user]);

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
        const totalEntries = entries.length;

        // Calculate current streak
        const streak = calculateStreak(entries);

        // For insights, use a simple calculation for now
        const insightsCount = Math.floor(totalEntries * 0.2); // Rough estimate

        setStats({
          currentStreak: streak,
          totalEntries: totalEntries,
          insightsGenerated: insightsCount,
        });
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

  // Quick Actions - now including Reflectionarian
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
      description: "Track your cycle & health",
      href: "/womens-health",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: MessageCircle,
      title: "Reflectionarian",
      description: "AI companion",
      href: "/reflectionarian",
      color: "from-indigo-500 to-purple-600",
    },
  ];

  const statsDisplay = [
    {
      label: "Current Streak",
      value: loading ? "..." : `${stats.currentStreak} days`,
      icon: Award,
    },
    {
      label: "Total Entries",
      value: loading ? "..." : stats.totalEntries.toString(),
      icon: Heart,
    },
    {
      label: "Insights Generated",
      value: loading ? "..." : stats.insightsGenerated.toString(),
      icon: Lightbulb,
    },
  ];

  const announcements = [
    {
      type: "feature",
      title: "Deep Dives Coming Soon",
      description:
        "Explore focused self-discovery modules tailored to your journey",
      icon: Sparkles,
      date: "Coming Fall 2025",
    },
    {
      type: "update",
      title: "Enhanced Analytics Now Live",
      description:
        "Discover new insights with our advanced intelligence dashboard",
      icon: TrendingUp,
      date: "Released this week",
    },
    {
      type: "tip",
      title: "Privacy First, Always",
      description:
        "Your reflections are end-to-end encrypted and visible only to you",
      icon: Shield,
      date: "Core promise",
    },
  ];

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-t from-[#8B5CF6]/50 to-[#8B5CF6]/10" />
      <div className="relative z-10">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <img
                src={squarelogo}
                alt="Reflectionary logo"
                className="w-29 h-29 md:w-40 md:h-40 flex-shrink-0"
              />
              {/* Text content - left aligned */}
              <div className="flex-1">
                <img
                  src={logo}
                  alt="Reflectionary"
                  className="h-18 md:h-20 w-auto mb-2"
                />
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  {getGreeting()}
                </h2>
                <p className="text-lg md:text-xl text-gray-600 mt-1">
                  Your personal space for reflection and growth
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
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

          {/* Quick Actions - 2x3 Grid with inline text */}
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
                        <p className="text-xs text-gray-600">
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
                        <p className="text-xs text-gray-500 mt-2">
                          {announcement.date}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <Link
                  to="/security"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-2 group"
                >
                  View all updates
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quote and Privacy Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Daily Inspiration - Left Side */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-8 text-white shadow-lg">
                <div className="flex items-start gap-4">
                  <Quote className="w-8 h-8 opacity-50 flex-shrink-0 mt-1" />
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

            {/* Privacy Section - Right Side */}
            <div>
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-100 h-fit">
                <h4 className="text-lg font-semibold text-purple-900 mb-3">
                  🔒 Your Privacy Matters
                </h4>
                <p className="text-sm text-purple-700 leading-relaxed">
                  Your journal is personal — and we treat it that way. All your
                  reflections are end-to-end encrypted so no one else can read
                  your words. Not our team. Not our servers. Just you.
                  Reflectionary is your private space to be real, raw, and fully
                  yourself.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity Footer */}
          <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Last entry: 2 hours ago
                </span>
              </div>
              <Link
                to="/journaling"
                className="text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                Continue your journey →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
