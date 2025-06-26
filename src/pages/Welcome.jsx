// src/pages/Welcome.jsx - Dark Theme with Logo Reveal Animation
import logoWhite from "../assets/ReflectionaryLight.png"; // Your white logo
import squarelogo from "../assets/LightReflectionarySquare.svg";
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

// Logo Reveal Animation Component
const LogoReveal = ({ onComplete }) => {
  const [stage, setStage] = useState("hidden"); // hidden -> revealing -> revealed

  useEffect(() => {
    // Start the animation sequence
    const timer1 = setTimeout(() => setStage("revealing"), 200);
    const timer2 = setTimeout(() => setStage("revealed"), 2000);
    const timer3 = setTimeout(() => onComplete?.(), 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark overlay that fades out */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-1000 ${
          stage === "revealed" ? "opacity-0 pointer-events-none" : "opacity-90"
        }`}
      />

      {/* Logo container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Main logo with light sweep effect */}
        <div className="relative">
          <img
            src={squarelogo}
            alt="Reflectionary"
            className={`w-42 h-42 transition-all duration-2000 ${
              stage === "hidden"
                ? "opacity-0 scale-75"
                : "opacity-100 scale-100"
            }`}
          />

          {/* Light sweep effect */}
          {stage === "revealing" && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-sweep" />
            </div>
          )}

          {/* Glow effect */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/30 to-pink-400/20 rounded-full blur-2xl transition-opacity duration-2000 ${
              stage === "revealing" ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* Text reveal */}
        <div
          className={`mt-6 text-center transition-all duration-1000 delay-1000 ${
            stage === "revealed"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Reflectionary</h1>
          <p className="text-gray-300">Where your voice finds meaning</p>
        </div>
      </div>
    </div>
  );
};

export default function Welcome() {
  const [quote, setQuote] = useState(() => getRandomQuote(-1));
  const [userName, setUserName] = useState("Christine");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLogo, setShowLogo] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

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

  const handleLogoComplete = () => {
    setShowLogo(false);
    setContentVisible(true);
  };

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

  // Quick Actions
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
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/30 to-pink-600/20 animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
      </div>

      {/* Logo Reveal Animation */}
      {showLogo && <LogoReveal onComplete={handleLogoComplete} />}

      {/* Main Content */}
      <div
        className={`relative z-10 transition-all duration-1000 ${
          contentVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Header Section */}
        <div className="backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <img
                src={squarelogo}
                alt="Reflectionary logo"
                className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 drop-shadow-2xl"
              />
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                  Reflectionary
                </h1>
                <h2 className="text-xl md:text-2xl font-medium text-gray-300">
                  {getGreeting()}
                </h2>
                <p className="text-lg text-gray-400 mt-1">
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

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className="group backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 shadow-lg hover:bg-white/15 hover:border-purple-400/50 transition-all duration-300"
                  >
                    <div className="text-center">
                      <div
                        className={`bg-gradient-to-br ${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform mx-auto mb-3 w-fit shadow-lg`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-white group-hover:text-purple-200 transition-colors mb-1">
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-300">
                        {action.description}
                      </p>
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

      {/* CSS for sweep animation */}
      <style jsx>{`
        @keyframes sweep {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(300%) skewX(-12deg);
          }
        }
        .animate-sweep {
          animation: sweep 2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
