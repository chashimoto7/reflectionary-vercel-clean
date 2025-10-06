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
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load ElevenLabs widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
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
      description: "Your most intimate thoughts and insights, completely private, intelligently connected.",
      gradient: "from-purple-500 to-pink-500",
      details: {
        headline: "Four-Layer Privacy Protection",
        features: [
          "End-to-end encryption - Your entries are encrypted before leaving your device",
          "Ephemeral mapping - Anonymous AI requests that can't be traced back to you",
          "Row-level security - Database isolation ensures only you can access your data",
          "Private mode - Mark any entry as private to exclude from AI analysis entirely"
        ],
        description: "We've built the most comprehensive privacy system in the industry. Your journal entries, documents, and personal insights are protected by multiple layers of encryption and security. Even our AI systems can't connect your identity to your data during analysis."
      }
    },
    {
      icon: [Upload, Clock],
      title: "Rich Media Library",
      description: "Import and analyze journals, documents, images, artwork, and more to build your personal knowledge base.",
      gradient: "from-blue-500 to-purple-500",
      details: {
        headline: "Comprehensive Document & Image Analysis",
        features: [
          "Import decades of journals - Upload old entries dating back 10+ years",
          "Document analysis - PDFs, Word docs, text files automatically processed",
          "Visual analysis - Upload artwork, sketches, photos for AI interpretation",
          "Historical backfill - Newly uploaded old journals automatically integrated into your growth timeline",
          "Multi-format support - Text, images, documents all work together"
        ],
        description: "Start with everything you've already written or created. Our advanced AI analyzes not just text, but visual content too - understanding themes in your artwork, patterns in your sketches, and meanings in your images. Your entire creative and written history becomes part of your journey."
      }
    },
    {
      icon: [Network],
      title: "Knowledge Garden",
      description: "A revolutionary system that transforms scattered insights into connected wisdom that grows with you.",
      gradient: "from-green-500 to-blue-500",
      details: {
        headline: "Your Personal Wisdom Ecosystem",
        features: [
          "Intelligent connections - Automatically links related insights across all your content",
          "Growing knowledge base - Your wisdom becomes more valuable over time",
          "Pattern discovery - Uncovers hidden themes and breakthrough moments",
          "Cross-content analysis - Connects journals, documents, and visual content",
          "Evolving intelligence - The system learns your unique patterns and growth style"
        ],
        description: "More than just storage - it's a living system that helps your insights evolve. Watch as connections emerge between seemingly unrelated entries, themes strengthen over time, and your personal wisdom network grows richer with each contribution."
      }
    },
    {
      icon: [MessageCircle, Sparkles],
      title: "Conversational AI Companion",
      description: "An AI that truly understands you, adapting to your unique journey, challenges, and growth patterns.",
      gradient: "from-purple-500 to-blue-500",
      details: {
        headline: "Your Personal Growth Partner",
        features: [
          "Context-aware conversations - Remembers your entire history and patterns",
          "Adaptive guidance - Responses tailored to your current situation and past experiences",
          "Follow-up prompts - Intelligent questions that deepen your reflection",
          "Voice & text support - Choose how you want to interact",
          "24/7 availability - Your companion is always there when you need it"
        ],
        description: "Unlike generic chatbots, this AI knows your story. It understands your patterns, remembers your breakthroughs, and adapts its guidance based on your unique journey. Have deep, meaningful conversations that actually help you grow."
      }
    },
    {
      icon: [Target, TrendingUp],
      title: "Advanced Pattern Recognition",
      description: "Discover emotional patterns, behavioral trends, and growth trajectories you never noticed before.",
      gradient: "from-pink-500 to-orange-500",
      details: {
        headline: "Deep Insights Into Your Patterns",
        features: [
          "Emotional pattern detection - Track mood trends and emotional cycles",
          "Behavioral analysis - Identify habits and recurring patterns",
          "Visual theme recognition - Patterns in artwork and creative expression",
          "Cross-content connections - Links between different types of entries",
          "Growth trajectory tracking - See how you're evolving over time"
        ],
        description: "Our AI analyzes your journals, documents, wellness data, and visual content to reveal patterns you might miss. From emotional cycles to creative themes, from behavioral trends to breakthrough moments - see yourself with new clarity."
      }
    },
    {
      icon: [Shield, Star],
      title: "Wellness & Crisis Support",
      description: "Comprehensive wellness tracking with intelligent crisis detection to keep you supported and safe.",
      gradient: "from-red-500 to-pink-500",
      details: {
        headline: "Your Mental Health Safety Net",
        features: [
          "Daily wellness check-ins - Track mood, energy, sleep, stress levels",
          "Real-time crisis detection - Immediate analysis flags concerning patterns",
          "Deep pattern analysis - Daily batch processing catches subtle warning signs",
          "Privacy-conscious alerts - Crisis detection respects private entries",
          "Comprehensive tracking - Monitor nutrition, exercise, and overall wellbeing"
        ],
        description: "Advanced AI monitors your entries for signs of emotional distress, using both real-time and deep analysis to ensure nothing slips through. Your wellness data integrates with your journaling to provide holistic insights while keeping you safe."
      }
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
            <div className="flex justify-end items-center h-16">
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
        <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              {/* Main Logo */}
              <div className="mb-8">
                <ReflectionaryLogo className="h-32 w-auto mx-auto" variant="horizontal" />
              </div>

              {/* Hero Headlines */}
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Where Your Personal Wisdom Lives and Grows
              </h1>

              <p className="text-xl text-gray-200 mb-6 max-w-4xl mx-auto leading-relaxed">
                The evolution from basic journaling to self-understanding. Transform scattered insights into living wisdom through intelligent connection and analysis.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
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
                  <span>Four-Layer Privacy Protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-300" />
                  <span>Advanced AI Analytics</span>
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

        {/* Waitlist CTA Section - Moved above features */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30 shadow-lg p-12">
              <h2 className="text-3xl font-bold mb-4">Join the Early Adopters</h2>
              <p className="text-xl text-purple-100 mb-4">
                Get exclusive updates, early access, and founder's pricing when Reflectionary launches
              </p>
              <p className="text-lg text-purple-200 mb-8">
                Space is limited. Secure your spot now!
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

        {/* Strategic Features Section */}
        <section id="features" className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
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
                  <button
                    key={index}
                    onClick={() => setSelectedFeature(feature)}
                    className="group relative backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:-translate-y-1 text-left w-full cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-3 mb-4 relative z-10">
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
                    <p className="text-gray-200 leading-relaxed relative z-10">{feature.description}</p>
                    <div className="mt-4 text-purple-300 text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                      <span>Learn more</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
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
        <section className="py-12 px-4 sm:px-6 lg:px-8">
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

        {/* ElevenLabs Conversational AI Agent */}
        <elevenlabs-convai agent-id="agent_5801k6tmc51re3vsptq6a8jcrjqk"></elevenlabs-convai>

        {/* Feature Details Modal */}
        {selectedFeature && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelectedFeature(null)}
            />

            {/* Modal Content */}
            <div className="relative bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-purple-400/30 shadow-2xl">
              {/* Close Button */}
              <button
                onClick={() => setSelectedFeature(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              {/* Header */}
              <div className={`bg-gradient-to-br ${selectedFeature.gradient} p-8 rounded-t-2xl`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-white/20 rounded-xl">
                    {(() => {
                      const icons = Array.isArray(selectedFeature.icon) ? selectedFeature.icon : [selectedFeature.icon];
                      const Icon = icons[0];
                      return <Icon className="h-8 w-8 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">{selectedFeature.title}</h3>
                    <p className="text-white/90 text-lg mt-1">{selectedFeature.details.headline}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-gray-200 text-lg leading-relaxed mb-8">
                  {selectedFeature.details.description}
                </p>

                <h4 className="text-xl font-semibold text-white mb-4">Key Features:</h4>
                <div className="space-y-3">
                  {selectedFeature.details.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                      </div>
                      <p className="text-gray-200 leading-relaxed">{feature}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <button
                    onClick={handleWaitlistSignup}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
                  >
                    Join the Waitlist to Get Early Access
                    <ExternalLink className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}