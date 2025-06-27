// src/pages/Welcome.jsx - Dark Theme with Large SVG Logo
import lightLogo from "../assets/BrightReflectionarySquare.svg";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  Sparkles,
  TrendingUp,
  Shield,
  Brain,
  Heart,
  Clock,
  Quote,
  Bell,
  BarChart3,
  Target,
  Lightbulb,
  Award,
  ArrowRight,
  Activity,
  MessageCircle,
} from "lucide-react";

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
  const [userName, setUserName] = useState("Christine");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userStats, setUserStats] = useState({
    currentStreak: 0,
    totalEntries: 0,
    insightsGenerated: 0,
    loading: true,
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

  // Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;

      try {
        // Get total entries count
        const { count: entriesCount } = await supabase
          .from("entries")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Get recent entries for streak calculation
        const { data: recentEntries } = await supabase
          .from("entries")
          .select("created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30);

        // Calculate current streak
        let streak = 0;
        if (recentEntries && recentEntries.length > 0) {
          const today = new Date();
          let currentDate = new Date(today);

          for (let i = 0; i < recentEntries.length; i++) {
            const entryDate = new Date(recentEntries[i].created_at);
            const diffTime = Math.abs(currentDate - entryDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 1) {
              streak++;
              currentDate.setDate(currentDate.getDate() - 1);
            } else {
              break;
            }
          }
        }

        // For now, insights generated is a simple calculation
        // You can replace this with actual insights count when implemented
        const insightsGenerated = Math.floor((entriesCount || 0) * 0.2);

        setUserStats({
          currentStreak: streak,
          totalEntries: entriesCount || 0,
          insightsGenerated,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
        setUserStats((prev) => ({ ...prev, loading: false }));
      }
    };
  }, []);

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

  // Quick Actions - 2x3 horizontal rectangles
  const quickActions = [
    {
      icon: Brain,
      title: "New Entry",
      href: "/journaling",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      href: "/analytics",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: Target,
      title: "Goals",
      href: "/goals",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: Activity,
      title: "Wellness",
      href: "/wellness",
      color: "from-rose-500 to-rose-600",
    },
    {
      icon: Heart,
      title: "Women's Health",
      href: "/womens-health",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: MessageCircle,
      title: "Reflectionarian",
      href: "/reflectionarian",
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const stats = [
    {
      label: "Current Streak",
      value: userStats.loading ? "..." : `${userStats.currentStreak} days`,
      icon: Award,
    },
    {
      label: "Total Entries",
      value: userStats.loading ? "..." : userStats.totalEntries.toString(),
      icon: Heart,
    },
    {
      label: "Insights Generated",
      value: userStats.loading ? "..." : userStats.insightsGenerated.toString(),
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
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/30 to-pink-600/20 animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
      </div>

      {/* Header Section - Frosted Glass Style */}
      <div className="relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-6">
            {/* Large Logo - Takes full header height */}
            <div className="flex-shrink-0">
              <img
                src={lightLogo}
                alt="Reflectionary Logo"
                className="h-40 w-40 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Header Text Content */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Reflectionary
              </h1>
              <h2 className="text-xl md:text-2xl font-medium text-gray-300 mb-1">
                {getGreeting()}
              </h2>
              <p className="text-lg text-gray-400">
                Your personal space for reflection and growth
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 p-3 rounded-lg backdrop-blur-sm border border-purple-400/30">
                      <Icon className="w-6 h-6 text-purple-200" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions - 2x3 Grid with Horizontal Layout */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className="group backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 shadow-lg hover:bg-white/15 hover:border-purple-400/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`bg-gradient-to-br ${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0 shadow-lg`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-white group-hover:text-purple-200 transition-colors">
                        {action.title}
                      </h3>
                    </div>
                  </Link>
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
                  to="/security"
                  className="text-sm text-purple-300 hover:text-purple-200 font-medium inline-flex items-center gap-2 group"
                >
                  View all updates
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
                  Reflectionary is your private space to be real, raw, and fully
                  yourself.
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
                  Last entry: 2 hours ago
                </span>
              </div>
              <Link
                to="/journaling"
                className="text-sm font-medium text-purple-300 hover:text-purple-200 transition-colors"
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
