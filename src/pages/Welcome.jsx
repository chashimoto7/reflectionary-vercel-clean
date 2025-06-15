import logo from "../assets/ReflectionaryWordWelcome.png";
import squarelogo from "../assets/FinalReflectionarySquare.png";
import React, { useState, useEffect } from "react";
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
  const [quote, setQuote] = useState(() => getRandomQuote(-1));
  const [userName, setUserName] = useState("Sarah"); // Replace with actual user name from auth context
  const [currentTime, setCurrentTime] = useState(new Date());

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

  const quickActions = [
    {
      icon: Brain,
      title: "New Entry",
      description: "Start your reflection",
      href: "/new-entry",
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
      icon: Calendar,
      title: "History",
      description: "Browse entries",
      href: "/history",
      color: "from-amber-500 to-amber-600",
    },
  ];

  const stats = [
    { label: "Current Streak", value: "7 days", icon: Award },
    { label: "Total Entries", value: "142", icon: Heart },
    { label: "Insights Generated", value: "28", icon: Lightbulb },
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-6">
            {/* Logo placeholder - replace with your actual round logo */}
            <img
              src={squarelogo}
              alt="Reflectionary logo"
              className="w-25 h-25 md:w-30 md:h-30 flex-shrink-0"
            />

            {/* Text content - left aligned */}
            <div className="flex-1">
              {/* Reflectionary text placeholder - replace with your actual image */}
              <img
                src={logo}
                alt="Reflectionary"
                className="h-25 md:h-28 w-auto mb-2"
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions and Quote */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <a
                      key={index}
                      href={action.href}
                      className="group bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all hover:border-purple-200"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`bg-gradient-to-br ${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {action.description}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors mt-1" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Daily Inspiration */}
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

          {/* Right Column - Updates */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Updates & Announcements
                </h2>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-6">
                {announcements.map((announcement, index) => {
                  const Icon = announcement.icon;
                  const typeColors = {
                    feature: "bg-purple-100 text-purple-700",
                    update: "bg-cyan-100 text-cyan-700",
                    tip: "bg-emerald-100 text-emerald-700",
                  };

                  return (
                    <div key={index} className="relative">
                      {index !== announcements.length - 1 && (
                        <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200"></div>
                      )}
                      <div className="flex gap-4">
                        <div
                          className={`p-2 rounded-lg ${
                            typeColors[announcement.type]
                          } flex-shrink-0`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 pb-2">
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
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <a
                  href="/settings"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 group"
                >
                  View all updates
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Privacy Reminder */}
            <div className="mt-6 bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-purple-900">
                    Your Privacy Matters
                  </h4>
                  <p className="text-sm text-purple-700 mt-1">
                    All your reflections are end-to-end encrypted and accessible
                    only by you.
                  </p>
                </div>
              </div>
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
            <a
              href="/new-entry"
              className="text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              Continue your journey →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
