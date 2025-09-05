// frontend/src/pages/LandingPage.jsx - Pre-launch Marketing Page
import React, { useState, useEffect } from "react";
import {
  Shield,
  Brain,
  Upload,
  Network,
  MessageCircle,
  Target,
  TrendingUp,
  Zap,
  Eye,
  Star,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  Mail,
  ExternalLink,
  Sparkles,
  BookOpen,
  Clock,
} from "lucide-react";
import horizontalLogo from "../assets/BrightReflectionaryHorizontal.svg";
import squareLogo from "../assets/BrightReflectionarySquare.svg";

// Logo Component
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle external Kit signup links
  const handleWaitlistSignup = () => {
    window.open("https://reflectionary.kit.com/signup", "_blank");
  };

  const handleBlogSignup = () => {
    window.open("https://reflectionary.kit.com/blog", "_blank");
  };

  const handleBlogRedirect = () => {
    window.location.href = "/blog";
  };

  const handleSignIn = () => {
    window.location.href = "/login";
  };

  // Strategic features with competitive hints
  const strategicFeatures = [
    {
      icon: [Shield, Brain],
      title: "Privacy-First Intelligence",
      description: "End-to-end encryption meets powerful AI analysis. Your most intimate insights, completely secure, intelligently connected.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: [Upload, Clock],
      title: "Historical Import Advantage",
      description: "Start with decades of insights, not from scratch. Import years of journals, conversations, and documents to unlock hidden patterns.",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      icon: [Network],
      title: "Living Knowledge System",
      description: "Watch your insights grow and connect over time. Your personal wisdom becomes more valuable with every entry.",
      gradient: "from-green-500 to-blue-500",
    },
    {
      icon: [MessageCircle, Sparkles],
      title: "Conversational AI Companion",
      description: "An AI that truly understands you. Have meaningful conversations that adapt to your unique journey, challenges and growth patterns.",
      gradient: "from-purple-500 to-blue-500",
    },
    {
      icon: [Target, TrendingUp],
      title: "Pattern Recognition",
      description: "Connect the dots and discover patterns you never noticed before. Intelligence that evolves with your understanding.",
      gradient: "from-pink-500 to-orange-500",
    },
    {
      icon: [Zap, Eye],
      title: "Breakthrough Moment Detection",
      description: "AI identifies significant insights and growth opportunities in real-time, helping you recognize your own breakthroughs.",
      gradient: "from-red-500 to-pink-500",
    },
  ];

  // Early beta feedback testimonials
  const testimonials = [
    {
      quote: "I uploaded 5 years of journals and immediately saw patterns I'd missed for decades.",
      author: "Sarah M.",
      role: "Early Beta User"
    },
    {
      quote: "It's like having a therapist who actually remembers everything I've ever told them.",
      author: "Marcus R.",
      role: "Beta Tester"
    },
    {
      quote: "Finally, an app that gets smarter about me over time instead of treating me like a stranger.",
      author: "Priya P.",
      role: "Early Adopter"
    }
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <title>Reflectionary - Where Personal Wisdom Lives and Grows</title>
      <meta 
        name="description" 
        content="Transform scattered insights into living wisdom. Privacy-first AI journaling with historical import and intelligent pattern recognition. Join the waitlist." 
      />
      <meta name="keywords" content="AI journaling, personal growth, privacy-first, pattern recognition, consciousness evolution, wisdom, self-awareness" />
      <meta property="og:title" content="Reflectionary - Where Personal Wisdom Lives and Grows" />
      <meta property="og:description" content="Transform scattered insights into living wisdom. Privacy-first AI journaling with historical import and intelligent pattern recognition." />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
        {/* Video Background */}
        <div className="fixed inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/PurpleWave.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/70 via-purple-800/70 to-slate-700/70"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/30 to-pink-600/20"></div>
        </div>

        {/* Fallback Animated Background */}
        <div className="fixed inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/30 to-pink-600/20 animate-pulse -z-10"></div>

        {/* Navigation */}
        <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          scrolled ? "backdrop-blur-xl bg-black/20 border-b border-white/10" : ""
        }`}>
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
                <button
                  onClick={handleBlogRedirect}
                  className="text-gray-100 hover:text-white transition-colors flex items-center gap-1"
                >
                  <BookOpen className="h-4 w-4" />
                  Blog
                </button>
                <button
                  onClick={handleSignIn}
                  className="px-4 py-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={handleWaitlistSignup}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/25"
                >
                  Join Waitlist
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-200"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                  Features
                </a>
                <button
                  onClick={handleBlogRedirect}
                  className="text-left text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Blog
                </button>
                <button
                  onClick={handleSignIn}
                  className="text-left text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={handleWaitlistSignup}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Join Waitlist
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
                <ReflectionaryLogo className="h-32 w-auto mx-auto" variant="horizontal" />
              </div>

              {/* Hero Headlines */}
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Where Your Personal Wisdom Lives and Grows
              </h1>

              <p className="text-xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed">
                The evolution from basic journaling to self-understanding. Transform scattered insights into living wisdom through intelligent connection and analysis.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                  onClick={handleWaitlistSignup}
                  className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Join the Waitlist
                  <ExternalLink className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleBlogRedirect}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="h-5 w-5" />
                  Read Our Blog
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-8 text-gray-300">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-300" />
                  <span>End-to-End Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-300" />
                  <span>Privacy-First AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-300" />
                  <span>Revolutionary Technology</span>
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <ChevronDown className="h-8 w-8 text-purple-300/50" />
            </div>
          </div>
        </section>

        {/* Strategic Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Revolutionary Features That Set Us Apart
              </h2>
              <p className="text-xl text-gray-200">
                Discover what makes Reflectionary the future of personal growth technology
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {strategicFeatures.map((feature, index) => {
                const icons = Array.isArray(feature.icon) ? feature.icon : [feature.icon];
                return (
                  <div
                    key={index}
                    className="group relative backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`inline-flex p-3 bg-gradient-to-br ${feature.gradient} rounded-lg text-white relative`}>
                        {icons.map((Icon, iconIndex) => (
                          <Icon
                            key={iconIndex}
                            className={`h-5 w-5 ${iconIndex > 0 ? 'absolute top-3 right-3 opacity-60' : ''}`}
                          />
                        ))}
                      </div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-gray-200 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Early Beta Feedback</h2>
              <p className="text-xl text-gray-200">
                What our pioneering users are discovering
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="mb-6">
                    <Star className="h-5 w-5 text-yellow-400 mb-4" />
                    <blockquote className="text-gray-200 text-lg leading-relaxed mb-4">
                      "{testimonial.quote}"
                    </blockquote>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-purple-300">{testimonial.author}</div>
                    <div className="text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Integration Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
              <div className="mb-8">
                <BookOpen className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">The Self-Awareness Revolution</h2>
                <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                  Explore the science of personal growth and the future of AI-assisted self-discovery
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleBlogRedirect}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
                >
                  <BookOpen className="h-5 w-5" />
                  Read Our Blog
                  <ArrowRight className="h-5 w-5" />
                </button>
                
                <button
                  onClick={handleBlogSignup}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="h-5 w-5" />
                  Subscribe to Updates
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Waitlist CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30 shadow-lg p-12">
              <h2 className="text-3xl font-bold mb-4">Join the Early Adopters</h2>
              <p className="text-xl text-purple-100 mb-8">
                Get exclusive updates, early access, and founder's pricing when Reflectionary launches
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 text-purple-200 mb-8">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span>Early Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  <span>Founder's Pricing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span>Exclusive Updates</span>
                </div>
              </div>

              <button
                onClick={handleWaitlistSignup}
                className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mx-auto"
              >
                Join the Waitlist Now
                <ExternalLink className="h-5 w-5" />
              </button>

              <p className="text-sm text-purple-200 mt-4">
                Be among the first to experience the future of personal wisdom
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <ReflectionaryLogo className="h-12 w-12" variant="square" />
            </div>
            <p className="text-gray-200 mb-6 text-lg">
              Where your personal wisdom lives and grows.
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-200 mb-8">
              <button
                onClick={handleBlogRedirect}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <BookOpen className="h-4 w-4" />
                Blog
              </button>
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={handleWaitlistSignup}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all text-sm flex items-center gap-2"
              >
                Join Waitlist
                <ExternalLink className="h-3 w-3" />
              </button>
              <button
                onClick={handleBlogSignup}
                className="px-6 py-2 bg-white/10 text-white border border-white/20 rounded-full hover:bg-white/20 transition-all text-sm flex items-center gap-2"
              >
                Blog Updates
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
            <p className="text-xs text-gray-300">
              © 2025 Reflectionary. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}