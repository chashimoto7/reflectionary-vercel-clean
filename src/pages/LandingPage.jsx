// frontend/ src/pages/LandingPage.jsx
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
import horizontalLogo from "../assets/BrightReflectionaryHorizontal.svg";
import squareLogo from "../assets/BrightReflectionarySquare.svg";

// Logo Component - Replace this with your actual logo when implementing
const ReflectionaryLogo = ({ className, variant = "horizontal" }) => (
  <img
    src={variant === "square" ? squareLogo : horizontalLogo}
    alt="Reflectionary"
    className={className}
  />
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
      features: ["Basic Journaling", "Basic History", "Crisis detection"],
      cta: "Start Free",
      popular: false,
    },
    {
      name: "Basic",
      price: "$8",
      yearlyPrice: "$100",
      features: [
        "Basic Journaling",
        "Basic History",
        "Basic Analytics",
        "Basic Women's Health",
        "Crisis Detection",
      ],
      cta: "Go Basic",
      popular: false,
    },
    {
      name: "Standard",
      price: "$18",
      yearlyPrice: "$180",
      features: [
        "Standard Journaling",
        "Standard History",
        "Standard Analytics",
        "Standard Goals",
        "Standard Wellness",
        "Standard Women's Health",
        "Standard Reflectionarian",
        "Crisis Detection",
      ],
      cta: "Go Standard",
      popular: true,
    },
    {
      name: "Advanced",
      price: "$28",
      yearlyPrice: "$280",
      features: [
        "Advanced Journaling",
        "Advanced History",
        "Advanced Analytics",
        "Advanced Goals",
        "Advanced Wellness",
        "Advanced Women's Health",
        "Advanced Reflectionarian",
        "Crisis Detection",
      ],
      cta: "Go Advanced",
      popular: false,
    },
    {
      name: "Premium",
      price: "$38",
      yearlyPrice: "$380",
      features: [
        "Premium Journaling",
        "Premium History",
        "Premium Analytics",
        "Premium Goals",
        "Premium Wellness",
        "Premium Women's Health",
        "Premium Reflectionarian",
        "Crisis Detection",
      ],
      cta: "Go Premium",
      popular: false,
    },
  ];

  const demoPersonas = [
    {
      name: "Emma Chen",
      age: 24,
      role: "Young Professional",
      description: "Balancing career growth with personal development",
      membership: "Basic",
      color: "from-purple-600 to-pink-600",
    },
    {
      name: "Marcus Rodriguez",
      age: 34,
      role: "IT Project Manager",
      description:
        "Managing personal and professional responsibilities with a young family",
      membership: "Standard",
      color: "from-blue-600 to-purple-600",
    },
    {
      name: "Priya Patel",
      age: 30,
      role: "Corporate Executive",
      description: "High achiever working to manage perfectionism and anxiety",
      membership: "Advanced",
      color: "from-pink-600 to-red-600",
    },
    {
      name: "Sarah Mitchell",
      age: 42,
      role: "Physiotherapist",
      description:
        "Recently divorced, navigating co-parenting with two teenagers",
      membership: "Premium",
      color: "from-green-600 to-blue-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
      {/* Video Background - Using public folder path */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/PurpleWave.mp4" type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
          Your browser does not support the video tag.
        </video>

        {/* Overlay to darken/tint the video */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/70 via-purple-800/70 to-slate-700/70"></div>

        {/* Additional gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/30 to-pink-600/20"></div>
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
              <ReflectionaryLogo className="h-12 w-auto" variant="horizontal" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-100 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#demo"
                className="text-gray-200 hover:text-white transition-colors"
              >
                Try Demo
              </a>
              <a
                href="#pricing"
                className="text-gray-100 hover:text-white transition-colors"
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
              className="md:hidden p-2 text-gray-200"
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Main Logo */}
            <div className="mb-12">
              <ReflectionaryLogo
                className="h-32 w-auto mx-auto"
                variant="horizontal"
              />
            </div>

            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Your personalized AI-powered journaling and wellness app for
              deeper self-awareness, emotional intelligence, and personal
              growth.
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
            <div className="flex flex-wrap justify-center gap-8 text-gray-300">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-300" />
                <span>End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-300" />
                <span>10,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-300" />
                <span>4.9/5 User Rating</span>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-8 w-8 text-purple-300/50" />
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
            <p className="text-xl text-gray-200">
              Powerful features designed to help you understand yourself better
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`inline-flex p-2 bg-gradient-to-br ${feature.gradient} rounded-lg text-white`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-gray-200 text-sm">{feature.description}</p>
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
            <p className="text-xl text-gray-200">
              Choose a demo persona to explore the app's features
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
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
                  {/* Placeholder for persona image */}
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4 mx-auto flex items-center justify-center border border-purple-400/30">
                    <span className="text-xs text-purple-200 text-center">
                      Image
                      <br />
                      Placeholder
                    </span>
                  </div>
                  {/* In your actual app, replace with:
                      <img src={persona.image} alt={persona.name} className="w-24 h-24 rounded-xl object-cover mb-4 mx-auto" />
                  */}

                  <h3 className="text-lg font-semibold mb-1">{persona.name}</h3>
                  <p className="text-sm text-purple-200 mb-1">
                    Age {persona.age}
                  </p>
                  <p className="text-sm text-gray-100 mb-2">{persona.role}</p>
                  <p className="text-gray-200 text-sm mb-4">
                    {persona.description}
                  </p>
                  <div className="text-xs text-purple-200 mb-4">
                    {persona.membership} Membership
                  </div>
                  <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg group-hover:from-purple-700 group-hover:to-pink-700 transition-all">
                    Try as {persona.name.split(" ")[0]}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activeDemo && (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
              <p className="text-gray-100">
                Demo experience for{" "}
                <span className="text-purple-200 font-semibold">
                  {activeDemo.name}
                </span>{" "}
                coming soon!
              </p>
              <p className="text-gray-200 mt-2">
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
            <p className="text-xl text-gray-200">
              Transparent pricing, no hidden fees
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className={`relative backdrop-blur-xl bg-white/5 rounded-2xl p-6 border ${
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
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {tier.price}
                    <span className="text-sm text-gray-200 font-normal">
                      /month
                    </span>
                  </div>
                  {tier.yearlyPrice && (
                    <div className="text-sm text-gray-200 mt-1">
                      {tier.yearlyPrice}/year
                    </div>
                  )}
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-4 w-4 text-green-300 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-100">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleGetStarted}
                  className={`w-full py-2 rounded-lg font-semibold transition-all text-sm ${
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
            <ReflectionaryLogo className="h-12 w-12" variant="square" />
          </div>
          <p className="text-gray-200 mb-4">
            Your journey to self-discovery starts here.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-200">
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
          <p className="text-xs text-gray-300 mt-8">
            © 2025 Reflectionary. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
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
