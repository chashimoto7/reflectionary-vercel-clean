//src/pages/LandingPage.jsx
import React, { useState, useEffect } from "react";
import {
  Brain,
  Shield,
  Sparkles,
  Lock,
  TrendingUp,
  Heart,
  Users,
  ArrowRight,
  Star,
  Check,
  Menu,
  X,
  BookOpen,
  Target,
  Moon,
  Eye,
  EyeOff,
  ChevronRight,
  Zap,
  Award,
  BarChart3,
} from "lucide-react";

const LandingPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const demoPersonas = [
    {
      id: "sarah",
      name: "Sarah Chen",
      role: "Tech Professional",
      tier: "Premium",
      avatar: "👩‍💻",
      description: "Tracking work-life balance and stress patterns",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "michael",
      name: "Michael Brooks",
      role: "Creative Writer",
      tier: "Standard",
      avatar: "✍️",
      description: "Exploring creativity blocks and inspiration",
      color: "from-cyan-500 to-blue-500",
    },
    {
      id: "emma",
      name: "Emma Williams",
      tier: "Advanced",
      role: "Wellness Coach",
      avatar: "🧘‍♀️",
      description: "Deep emotional intelligence insights",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Privacy First",
      description:
        "End-to-end encryption ensures your thoughts remain yours alone",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description:
        "Discover patterns and gain deeper self-awareness through intelligent analysis",
      gradient: "from-cyan-500 to-cyan-600",
    },
    {
      icon: TrendingUp,
      title: "Track Your Growth",
      description:
        "Visualize your emotional journey with beautiful, intuitive analytics",
      gradient: "from-emerald-500 to-emerald-600",
    },
  ];

  const tiers = [
    {
      name: "Standard",
      price: "$9.99",
      features: [
        "Unlimited journal entries",
        "Basic mood tracking",
        "Weekly insights",
        "Export your data",
        "Email support",
      ],
      color: "border-gray-300",
      buttonColor: "bg-gray-600 hover:bg-gray-700",
    },
    {
      name: "Premium",
      price: "$19.99",
      popular: true,
      features: [
        "Everything in Standard",
        "Advanced AI insights",
        "Daily pattern analysis",
        "Custom prompts",
        "Priority support",
        "Wellness correlations",
      ],
      color: "border-purple-500",
      buttonColor:
        "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800",
    },
    {
      name: "Advanced",
      price: "$29.99",
      features: [
        "Everything in Premium",
        "Professional therapy tools",
        "Goal tracking system",
        "Women's health features",
        "API access",
        "White-glove support",
      ],
      color: "border-emerald-500",
      buttonColor:
        "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800",
    },
  ];

  const handleLogin = () => {
    // Login logic here
    console.log("Login with:", email, password);
  };

  const handleDemoLogin = (persona) => {
    // Demo login logic here
    console.log("Demo login as:", persona);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
          style={{ transform: `translateY(${-scrollY * 0.2}px)` }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
          style={{
            transform: `translate(-50%, -50%) translateY(${scrollY * 0.1}px)`,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Reflectionary
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-purple-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#demo"
                className="text-gray-700 hover:text-purple-600 transition-colors"
              >
                Try Demo
              </a>
              <a
                href="#pricing"
                className="text-gray-700 hover:text-purple-600 transition-colors"
              >
                Pricing
              </a>
              <button
                onClick={() => setIsLoginMode(true)}
                className="px-4 py-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                Sign In
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg">
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#features"
                className="block px-3 py-2 text-gray-700 hover:text-purple-600"
              >
                Features
              </a>
              <a
                href="#demo"
                className="block px-3 py-2 text-gray-700 hover:text-purple-600"
              >
                Try Demo
              </a>
              <a
                href="#pricing"
                className="block px-3 py-2 text-gray-700 hover:text-purple-600"
              >
                Pricing
              </a>
              <button
                onClick={() => setIsLoginMode(true)}
                className="block w-full text-left px-3 py-2 text-purple-600 font-medium"
              >
                Sign In
              </button>
              <button className="block w-full text-left px-3 py-2 bg-purple-600 text-white rounded-lg">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
                Your AI-Powered
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                Journey to Self
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover patterns, track growth, and unlock deeper self-awareness
              through intelligent journaling with complete privacy protection.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Start Your Journey
                <ArrowRight className="inline ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("demo")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 bg-white text-purple-600 border-2 border-purple-200 rounded-lg font-semibold hover:bg-purple-50 transition-all"
              >
                Try Demo First
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span>End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>10,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-600" />
                <span>4.9/5 User Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">
              Everything You Need for Meaningful Reflection
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed to help you understand yourself better
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}
                  />
                  <div
                    className={`inline-flex p-3 bg-gradient-to-br ${feature.gradient} rounded-lg text-white mb-4`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">
              Experience Reflectionary Firsthand
            </h2>
            <p className="text-xl text-gray-600">
              Explore real user journeys with our demo accounts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {demoPersonas.map((persona) => (
              <div
                key={persona.id}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-200"
                onClick={() => handleDemoLogin(persona)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">{persona.avatar}</div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${persona.color} text-white`}
                  >
                    {persona.tier}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-1">{persona.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{persona.role}</p>
                <p className="text-gray-600 text-sm mb-4">
                  {persona.description}
                </p>
                <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-purple-700 group-hover:text-white transition-all">
                  Try as {persona.name.split(" ")[0]}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">
              Choose Your Journey
            </h2>
            <p className="text-xl text-gray-600">
              Transparent pricing, no hidden fees
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-2 ${
                  tier.color
                } ${tier.popular ? "transform scale-105" : ""}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="text-4xl font-bold mb-6">
                  {tier.price}
                  <span className="text-lg text-gray-500 font-normal">
                    /month
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${tier.buttonColor}`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-purple-400" />
            <span className="ml-2 text-xl font-bold">Reflectionary</span>
          </div>
          <p className="text-gray-400 mb-4">
            Your journey to self-discovery starts here
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
              Blog
            </a>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {isLoginMode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <button
                onClick={() => setIsLoginMode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-purple-600" />
                  <span className="ml-2 text-sm text-gray-600">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  Forgot password?
                </a>
              </div>

              <button
                onClick={handleLogin}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all"
              >
                Sign In
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
