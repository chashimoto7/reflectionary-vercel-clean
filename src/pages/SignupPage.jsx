// src/pages/SignupPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronLeft,
  Crown,
  Sparkles,
} from "lucide-react";
import logo from "../assets/BrightReflectionaryHorizontal.svg";

// Define subscription plans
const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    billing: "forever",
    features: ["Basic Journaling", "Basic History", "Crisis detection"],
    description: "Start your journey",
    icon: "✨",
    popular: false,
  },
  basic: {
    name: "Basic",
    price: 8,
    billing: "month",
    features: [
      "Basic Journaling",
      "Basic History",
      "Basic Analytics",
      "Basic Women's Health",
      "Crisis Detection",
    ],
    description: "Essential features",
    icon: "📝",
    popular: false,
    yearlyPrice: 80, // Pay for 10 months
  },
  standard: {
    name: "Standard",
    price: 18,
    billing: "month",
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
    description: "Most popular choice",
    icon: "⭐",
    popular: true,
    yearlyPrice: 180, // Pay for 10 months
  },
  advanced: {
    name: "Advanced",
    price: 28,
    billing: "month",
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
    description: "Power user features",
    icon: "🚀",
    popular: false,
    yearlyPrice: 280, // Pay for 10 months
  },
  premium: {
    name: "Premium",
    price: 38,
    billing: "month",
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
    description: "Complete wellness suite",
    icon: "👑",
    popular: false,
    yearlyPrice: 380, // Pay for 10 months
  },
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("standard");
  const [isAnnual, setIsAnnual] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Plan selection, 2: Account details, 3: Payment

  const { signUp } = useAuth();

  const handlePlanSelect = (planKey) => {
    setSelectedPlan(planKey);
    if (planKey === "free") {
      setStep(2); // Skip payment for free plan
    } else {
      setStep(2); // Go to account details
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (selectedPlan === "free") {
      // Handle free signup directly
      await handleFreeSignup();
    } else {
      // Go to payment step
      setStep(3);
    }
  };

  const handleFreeSignup = async () => {
    setLoading(true);
    try {
      // Create Supabase user
      const { data, error } = await signUp(email, password);

      if (error) throw error;

      // Create user profile with free tier
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: data.user.id,
          email: email,
          username: fullName,
          subscription_tier: "free",
          created_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Show success message
      setStep(4); // Success step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStripeCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("🚀 Starting Stripe checkout process...");

      // First create the Supabase user
      const authData = await signUp(email, password);

      console.log("📋 SignUp response:", { authData });

      // Add validation for authData structure
      if (!authData) {
        console.error("❌ No authData returned from signUp");
        throw new Error("Authentication failed - no data returned");
      }

      // Check if user exists in the expected structure
      const userId = authData.user?.id;

      if (!userId) {
        console.error("❌ No user ID found in authData:", authData);
        throw new Error("Authentication failed - no user ID found");
      }

      console.log("✅ User created successfully with ID:", userId);

      // Create user profile with pending status
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: userId,
          email: email,
          username: fullName,
          subscription_tier: "free", // Will be updated after successful payment
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("❌ Profile creation error:", profileError);
        throw profileError;
      }

      console.log("✅ User profile created successfully");

      // Get the correct price ID based on billing period
      const plan = SUBSCRIPTION_PLANS[selectedPlan];

      if (!plan) {
        throw new Error(`Invalid plan selected: ${selectedPlan}`);
      }

      const priceId = isAnnual ? plan.stripePriceYearly : plan.stripePrice;

      if (!priceId) {
        throw new Error(
          `No price ID found for plan ${selectedPlan} (annual: ${isAnnual})`
        );
      }

      console.log("💳 Creating Stripe checkout session with:", {
        priceId,
        userId,
        userEmail: email,
        planName: selectedPlan,
      });

      // Create Stripe checkout session
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: priceId,
          userId: userId,
          userEmail: email,
          planName: selectedPlan,
        }),
      });

      const responseData = await response.json();
      console.log("🔗 Stripe API response:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.error || `HTTP error! status: ${response.status}`
        );
      }

      const { sessionId, error: stripeError } = responseData;

      if (stripeError) {
        console.error("❌ Stripe error:", stripeError);
        throw new Error(stripeError);
      }

      if (!sessionId) {
        throw new Error("No session ID returned from Stripe");
      }

      console.log("✅ Stripe session created:", sessionId);

      // Redirect to Stripe checkout
      const stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

      if (!stripe) {
        throw new Error("Stripe not loaded. Check your publishable key.");
      }

      console.log("🔄 Redirecting to Stripe checkout...");

      const { error: redirectError } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (redirectError) {
        console.error("❌ Stripe redirect error:", redirectError);
        throw redirectError;
      }
    } catch (err) {
      console.error("❌ Complete error in handleStripeCheckout:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Plan Selection
  if (step === 1) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background - matching Premium pages */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/30 to-pink-600/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-7xl">
            {/* Back to landing */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors backdrop-blur-md bg-white/5 px-4 py-2 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to home
            </button>

            {/* Header */}
            <div className="text-center mb-12">
              <img
                src={logo}
                alt="Reflectionary"
                className="mx-auto mb-6 max-w-sm h-auto"
              />
              <h1 className="text-4xl font-bold text-white mb-4">
                Choose Your Journey
              </h1>
              <p className="text-gray-300 text-lg mb-8">
                Select the plan that best fits your personal growth goals
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span
                  className={`text-sm ${
                    !isAnnual ? "text-white" : "text-gray-400"
                  }`}
                >
                  Monthly
                </span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="relative inline-flex h-8 w-14 items-center rounded-full bg-white/20 backdrop-blur-md transition-colors"
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-gradient-to-r from-purple-600 to-pink-600 transition ${
                      isAnnual ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`text-sm ${
                    isAnnual ? "text-white" : "text-gray-400"
                  }`}
                >
                  Annual{" "}
                  <span className="text-green-400">(Save up to 25%)</span>
                </span>
              </div>
            </div>

            {/* Plan Cards - Properly Centered */}
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl">
                {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
                  const monthlyTotal = plan.price * 12;
                  const yearlyPrice = plan.yearlyPrice || 0;
                  const savings = monthlyTotal - yearlyPrice;

                  return (
                    <div
                      key={key}
                      onClick={() => handlePlanSelect(key)}
                      className={`relative backdrop-blur-xl border rounded-2xl p-6 cursor-pointer transition-all transform hover:scale-105 ${
                        selectedPlan === key
                          ? "bg-white/20 border-purple-400/50 shadow-2xl shadow-purple-500/20"
                          : "bg-white/10 border-white/20 hover:bg-white/15"
                      } ${plan.popular ? "md:scale-105" : ""}`}
                    >
                      {/* Popular Badge */}
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            MOST POPULAR
                          </div>
                        </div>
                      )}

                      {/* Plan Content */}
                      <div className="flex flex-col h-full">
                        {/* Icon and Name */}
                        <div className="text-center mb-4">
                          <div className="text-4xl mb-2">{plan.icon}</div>
                          <h3 className="text-xl font-bold text-white">
                            {plan.name}
                          </h3>
                        </div>

                        {/* Price */}
                        <div className="text-center mb-4">
                          <div className="flex items-baseline justify-center">
                            <span className="text-2xl font-bold text-white">
                              $
                            </span>
                            <span className="text-4xl font-bold text-white">
                              {isAnnual && plan.yearlyPrice
                                ? Math.floor(plan.yearlyPrice / 12)
                                : plan.price}
                            </span>
                            {key !== "free" && (
                              <span className="text-gray-300 ml-1">/mo</span>
                            )}
                          </div>
                          {isAnnual && key !== "free" && plan.yearlyPrice && (
                            <div className="text-sm text-gray-300 mt-1">
                              ${plan.yearlyPrice}/year
                            </div>
                          )}
                          {isAnnual && savings > 0 && (
                            <div className="text-xs text-green-400 font-medium mt-1">
                              Save ${savings} (2 months free!)
                            </div>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {plan.description}
                          </p>
                        </div>

                        {/* Features */}
                        <ul className="space-y-2 mb-6 flex-grow">
                          {plan.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm"
                            >
                              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Select Button */}
                        <button
                          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-colors ${
                            selectedPlan === key
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                              : "bg-white/10 text-white hover:bg-white/20"
                          }`}
                        >
                          {selectedPlan === key ? "Selected" : "Select Plan"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Continue Button */}
            <div className="text-center mt-12">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedPlan}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                Continue with {SUBSCRIPTION_PLANS[selectedPlan]?.name} Plan
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Account Details
  if (step === 2) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/30 to-pink-600/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <img
                src={logo}
                alt="Reflectionary"
                className="mx-auto mb-4 max-w-sm h-auto"
              />
              <h2 className="text-2xl font-bold text-white">
                Create Your Account
              </h2>
              <p className="text-gray-300 mt-2">
                {SUBSCRIPTION_PLANS[selectedPlan].name} Plan - $
                {isAnnual && SUBSCRIPTION_PLANS[selectedPlan].yearlyPrice
                  ? SUBSCRIPTION_PLANS[selectedPlan].yearlyPrice + "/year"
                  : SUBSCRIPTION_PLANS[selectedPlan].price +
                    "/" +
                    SUBSCRIPTION_PLANS[selectedPlan].billing}
              </p>
            </div>

            {/* Account Form - Frosted Glass */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
              <form onSubmit={handleAccountSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-lg p-4">
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 shadow-lg hover:shadow-purple-500/25 transition-all"
                  >
                    {loading
                      ? "Creating..."
                      : selectedPlan === "free"
                      ? "Create Account"
                      : "Continue to Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Payment (for paid plans)
  if (step === 3) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/30 to-pink-600/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <img
                src={logo}
                alt="Reflectionary"
                className="mx-auto mb-4 max-w-sm h-auto"
              />
              <h2 className="text-2xl font-bold text-white">
                Complete Your Subscription
              </h2>
              <p className="text-gray-300 mt-2">
                {SUBSCRIPTION_PLANS[selectedPlan].name} Plan - $
                {isAnnual && SUBSCRIPTION_PLANS[selectedPlan].yearlyPrice
                  ? SUBSCRIPTION_PLANS[selectedPlan].yearlyPrice + "/year"
                  : SUBSCRIPTION_PLANS[selectedPlan].price +
                    "/" +
                    SUBSCRIPTION_PLANS[selectedPlan].billing}
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 text-center">
              {error && (
                <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <div className="mb-6">
                <div className="text-3xl mb-4">
                  {SUBSCRIPTION_PLANS[selectedPlan].icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {SUBSCRIPTION_PLANS[selectedPlan].name}
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  You'll be redirected to Stripe to complete your payment
                  securely.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 px-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleStripeCheckout}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  {loading ? "Processing..." : "Complete Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Success
  if (step === 4) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/30 to-pink-600/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome to Reflectionary!
              </h2>
              <p className="text-gray-300 mb-6">
                Your account has been created successfully. Check your email for
                verification instructions.
              </p>
              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
