import React, { useState, useEffect } from "react";
import {
  Shield,
  Brain,
  Heart,
  TrendingUp,
  Star,
  ArrowRight,
  Check,
  Menu,
  X,
  Sparkles,
  Lock,
  Users,
  BarChart3,
  Target,
  Activity,
  MessageCircle,
  ChevronDown,
  Eye,
  Zap,
} from "lucide-react";
import video from "../../public/preview.mp4";

// Logo Component - Replace this with your actual logo when implementing
const ReflectionaryLogo = ({ className }) => (
  <div className={`relative ${className}`}>
    <Brain className="w-full h-full text-purple-400" />
    {/* In your actual app, replace this div with:
        <img src={logo} alt="Reflectionary" className="w-full h-full object-contain" />
    */}
  </div>
);

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation handlers - these would connect to your router in the real app
  const handleSignIn = () => {
    window.location.href = "/login";
  };

  const handleGetStarted = () => {
    window.location.href = "/signup";
  };

  const features = [
    {
      icon: Shield,
      title: "Privacy First",
      description:
        "End-to-end encryption ensures your thoughts remain yours alone",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description:
        "Discover patterns and gain deeper self-awareness through intelligent analysis",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      icon: TrendingUp,
      title: "Track Your Growth",
      description:
        "Visualize your emotional journey with beautiful, intuitive analytics",
      gradient: "from-pink-500 to-orange-500",
    },
    {
      icon: Heart,
      title: "Wellness Integration",
      description: "Connect your mental health with physical wellness tracking",
      gradient: "from-red-500 to-pink-500",
    },
    {
      icon: Target,
      title: "Goal Achievement",
      description:
        "Set, track, and celebrate your personal development milestones",
      gradient: "from-green-500 to-blue-500",
    },
    {
      icon: MessageCircle,
      title: "AI Companion",
      description: "Chat with Reflectionarian, your personal AI wellness coach",
      gradient: "from-purple-500 to-blue-500",
    },
  ];

  const tiers = [
    {
      name: "Free",
      price: "$0",
      features: [
        "3 journal entries per week",
        "Basic mood tracking",
        "Simple insights",
        "Data export",
      ],
      cta: "Start Free",
      popular: false,
    },
    {
      name: "Basic",
      price: "$4.99",
      features: [
        "Unlimited journal entries",
        "Advanced mood tracking",
        "Weekly AI insights",
        "Priority support",
      ],
      cta: "Go Basic",
      popular: false,
    },
    {
      name: "Standard",
      price: "$9.99",
      features: [
        "Everything in Basic",
        "Goal tracking system",
        "Wellness correlations",
        "Custom prompts",
        "Advanced analytics",
      ],
      cta: "Go Standard",
      popular: true,
    },
    {
      name: "Premium",
      price: "$19.99",
      features: [
        "Everything in Standard",
        "Women's health tracking",
        "AI companion chat",
        "Professional therapy tools",
        "API access",
      ],
      cta: "Go Premium",
      popular: false,
    },
  ];

  const demoPersonas = [
    {
      name: "Sarah Chen",
      role: "Working Professional",
      description: "Balancing career growth with personal wellness",
      color: "from-purple-600 to-pink-600",
    },
    {
      name: "Maria Rodriguez",
      role: "New Mother",
      description: "Navigating postpartum wellness and self-care",
      color: "from-pink-600 to-red-600",
    },
    {
      name: "Alex Thompson",
      role: "Student",
      description: "Managing academic stress and mental health",
      color: "from-blue-600 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
      {preview.mp4}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="video" type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Original Animated Background as Fallback */}
      <div className="fixed inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/30 to-pink-600/20 animate-pulse -z-10"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent -z-10"></div>

      {/* Navigation */}
      <nav
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl bg-black/20 border-b border-white/10"
            : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ReflectionaryLogo className="h-10 w-10" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Reflectionary
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#demo"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Try Demo
              </a>
              <a
                href="#pricing"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </a>
              <button
                onClick={handleSignIn}
                className="px-4 py-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleGetStarted}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/25"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="fixed top-16 right-0 w-64 h-full bg-slate-900/95 backdrop-blur-xl border-l border-white/10 p-6">
            <div className="flex flex-col space-y-4">
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#demo"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Try Demo
              </a>
              <a
                href="#pricing"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </a>
              <button
                onClick={handleSignIn}
                className="text-left text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleGetStarted}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Get Started
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Hero Section with Water Reflection */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Logo with Water Reflection Effect */}
            <div className="relative mx-auto mb-8 w-64 h-64">
              {/* Main Logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <ReflectionaryLogo className="w-48 h-48 drop-shadow-2xl" />
                  <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                    <ReflectionaryLogo className="w-48 h-48 opacity-50 blur-sm" />
                  </div>
                </div>
              </div>

              {/* Water Reflection */}
              <div className="absolute top-full left-0 right-0 h-32 overflow-hidden opacity-30">
                <div className="relative transform scale-y-[-1]">
                  <ReflectionaryLogo className="w-48 h-48 mx-auto" />
                  {/* Ripple Effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/50 to-purple-900"></div>
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "repeating-linear-gradient(to right, transparent, transparent 10px, rgba(168, 85, 247, 0.2) 10px, rgba(168, 85, 247, 0.2) 20px)",
                      animation: "ripple 3s linear infinite",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <h1
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
              style={{
                backgroundSize: "200% 200%",
                animation: "gradient 6s ease infinite",
              }}
            >
              Reflectionary
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              Say what you feel.{" "}
              <span className="text-pink-400">Discover what it means.</span>
            </p>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Your private AI-powered journal for deeper self-awareness,
              emotional intelligence, and personal growth.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={handleGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5"
              >
                Start Your Journey
                <ArrowRight className="inline ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("demo")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-all"
              >
                <Eye className="inline mr-2 h-5 w-5" />
                Try Demo First
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-400" />
                <span>End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                <span>10,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-400" />
                <span>4.9/5 User Rating</span>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-8 w-8 text-purple-400/50" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need for Meaningful Reflection
            </h2>
            <p className="text-xl text-gray-400">
              Powerful features designed to help you understand yourself better
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div
                    className={`inline-flex p-3 bg-gradient-to-br ${feature.gradient} rounded-lg text-white mb-4`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section
        id="demo"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Experience Reflectionary
            </h2>
            <p className="text-xl text-gray-400">
              Choose a demo persona to explore the app's features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {demoPersonas.map((persona, index) => (
              <div
                key={index}
                className="group relative backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer hover:transform hover:-translate-y-1"
                onClick={() => setActiveDemo(persona)}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${persona.color} rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity`}
                />
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {persona.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{persona.name}</h3>
                  <p className="text-sm text-purple-400 mb-2">{persona.role}</p>
                  <p className="text-gray-400 text-sm mb-4">
                    {persona.description}
                  </p>
                  <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg group-hover:from-purple-700 group-hover:to-pink-700 transition-all">
                    Try as {persona.name.split(" ")[0]}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activeDemo && (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
              <p className="text-gray-300">
                Demo experience for{" "}
                <span className="text-purple-400 font-semibold">
                  {activeDemo.name}
                </span>{" "}
                coming soon!
              </p>
              <p className="text-gray-400 mt-2">
                This will showcase personalized journal prompts, analytics, and
                insights tailored to {activeDemo.role.toLowerCase()} needs.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Choose Your Journey</h2>
            <p className="text-xl text-gray-400">
              Transparent pricing, no hidden fees
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className={`relative backdrop-blur-xl bg-white/5 rounded-2xl p-8 border ${
                  tier.popular ? "border-purple-500" : "border-white/10"
                } hover:border-white/20 transition-all duration-300 hover:transform hover:-translate-y-1`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {tier.price}
                  <span className="text-lg text-gray-400 font-normal">
                    /month
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleGetStarted}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    tier.popular
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <ReflectionaryLogo className="h-10 w-10" />
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Reflectionary
            </span>
          </div>
          <p className="text-gray-400 mb-4">
            Your journey to self-discovery starts here.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Support
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-8">
            © 2025 Reflectionary. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes ripple {
          0% {
            transform: translateX(-100%) scaleY(-1);
          }
          100% {
            transform: translateX(100%) scaleY(-1);
          }
        }
        
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
