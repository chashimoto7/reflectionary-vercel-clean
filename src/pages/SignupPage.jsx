// src/pages/SignupPage.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Eye, EyeOff, Check, Crown, Star, Sparkles } from "lucide-react";
import logo from "../assets/ReflectionaryLogoWelcome.png";

const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    billing: "Forever",
    stripePrice: null,
    features: [
      "Basic journaling (6 entries/month)",
      "1 AI prompt per week",
      "12-month history",
      "Crisis detection",
    ],
    description: "New Users",
    icon: "📝",
    popular: false,
    yearlyPrice: null,
  },
  basic: {
    name: "Basic",
    price: 7,
    billing: "per month",
    stripePrice: "price_1Rb8mwAeDe4AZUSajo9X0crR",
    stripePriceYearly: "price_1Rb8wKAeDe4AZUSaZhEpqoie",
    features: [
      "Unlimited basic journaling",
      "Unlimited random prompts",
      "1 subject prompt per week",
      "1 follow-up per entry",
      "Full basic history",
      "Basic analytics",
      "Crisis detection",
    ],
    description: "Beginning Journalers",
    icon: "✨",
    popular: false,
    yearlyPrice: 70,
  },
  standard: {
    name: "Standard",
    price: 14,
    billing: "per month",
    stripePrice: "price_1Rb93hAeDe4AZUSafqwnB3C6",
    stripePriceYearly: "price_1Rb95KAeDe4AZUSawS4EOR7F",
    features: [
      "Everything in Basic",
      "Unlimited journal entries",
      "Unlimited follow-up prompts",
      "Advanced search & filters",
      "Standard goals tracking",
      "Enhanced analytics",
      "Download capability",
    ],
    description: "Reflective Achievers",
    icon: "🚀",
    popular: true,
    yearlyPrice: 140,
  },
  standard_plus: {
    name: "Standard+",
    price: 20,
    billing: "per month",
    stripePrice: "price_1Rb968AeDe4AZUSaYbhDLIT9", // Replace with your Stripe price ID
    stripePriceYearly: "price_1Rb96QAeDe4AZUSaIbFJSFPT", // Replace with your Stripe yearly price ID
    features: [
      "Everything in Standard",
      "Basic Reflectionarian AI companion",
      "Choose 2 advanced features:",
      "• Advanced History OR Analytics",
      "• Advanced Goals OR Wellness",
      "• Advanced Women's Health",
    ],
    description: "Focused Deep Divers",
    icon: "⭐",
    popular: false,
    yearlyPrice: 200,
  },
  premium: {
    name: "Premium",
    price: 27,
    billing: "per month",
    stripePrice: "price_1Rb97KAeDe4AZUSaYu12M3V9", // Replace with your Stripe price ID
    stripePriceYearly: "price_1Rb97kAeDe4AZUSaMpBUD4JN", // Replace with your Stripe yearly price ID
    features: [
      "Everything in Standard",
      "Advanced Reflectionarian AI companion",
      "ALL advanced features included:",
      "• Advanced journaling with folders",
      "• Advanced analytics & insights",
      "• Advanced goals with AI suggestions",
      "• Advanced women's health tracking",
      "• Priority support",
    ],
    description: "Power Users",
    icon: "👑",
    popular: false,
    yearlyPrice: 270,
  },
  pro: {
    name: "Pro",
    price: 35,
    billing: "per month",
    stripePrice: "price_1Rb98JAeDe4AZUSaHprJgreX", // Replace with your Stripe price ID
    stripePriceYearly: "price_1Rb98aAeDe4AZUSaT0ozoquy", // Replace with your Stripe yearly price ID
    features: [
      "Everything in Premium",
      "Pro Reflectionarian AI companion",
      "Advanced therapy-style sessions",
      "Growth timeline reviews",
      "Personalized content recommendations",
      "Priority feature requests",
      "1-on-1 setup consultation",
    ],
    description: "Superfans & Deep Growers",
    icon: "🏆",
    popular: false,
    yearlyPrice: 350,
  },
};

export default function SignupPage() {
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
      // First create the Supabase user
      const { data: authData, error: authError } = await signUp(
        email,
        password
      );

      if (authError) throw authError;

      // Create user profile with pending status
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: authData.user.id,
          email: email,
          username: fullName,
          subscription_tier: "free", // Will be updated after successful payment
          created_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Get the correct price ID based on billing period
      const plan = SUBSCRIPTION_PLANS[selectedPlan];
      const priceId = isAnnual ? plan.stripePriceYearly : plan.stripePrice;

      // Create Stripe checkout session
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: priceId,
          userId: authData.user.id,
          userEmail: email,
          planName: selectedPlan,
        }),
      });

      const { sessionId, error: stripeError } = await response.json();

      if (stripeError) throw new Error(stripeError);

      // Redirect to Stripe checkout
      const stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      const { error: redirectError } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (redirectError) throw redirectError;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Plan Selection
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <img
              src={logo}
              alt="Reflectionary"
              className="mx-auto mb-6 max-w-md h-auto"
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Journey
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start with any plan and upgrade anytime. All plans include our
              core privacy-first journaling.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  !isAnnual
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-md font-medium transition-colors relative ${
                  isAnnual
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Annual
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded-full">
                  Save!
                </span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
              const currentPrice =
                isAnnual && plan.yearlyPrice ? plan.yearlyPrice : plan.price;
              const billingPeriod =
                isAnnual && plan.yearlyPrice ? "year" : plan.billing;
              const savings =
                isAnnual && plan.yearlyPrice
                  ? plan.price * 12 - plan.yearlyPrice
                  : 0;

              return (
                <div
                  key={key}
                  className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                    selectedPlan === key
                      ? "border-purple-500 ring-4 ring-purple-200"
                      : "border-gray-200 hover:border-purple-300"
                  } ${plan.popular ? "ring-2 ring-yellow-400" : ""}`}
                  onClick={() => handlePlanSelect(key)}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-4">
                    {/* Plan Header */}
                    <div className="text-center mb-4">
                      <div className="text-2xl mb-2">{plan.icon}</div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {plan.name}
                      </h3>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-purple-600">
                          ${currentPrice}
                        </span>
                        {currentPrice > 0 && (
                          <span className="text-gray-500 text-sm ml-1">
                            /{billingPeriod === "year" ? "year" : "month"}
                          </span>
                        )}
                      </div>
                      {savings > 0 && (
                        <div className="text-xs text-green-600 font-medium mt-1">
                          Save ${savings}!
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        {plan.description}
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-xs"
                        >
                          <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Select Button */}
                    <button
                      className={`w-full py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
                        selectedPlan === key
                          ? "bg-purple-600 text-white"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                    >
                      {selectedPlan === key ? "Selected" : "Select Plan"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedPlan}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue with {SUBSCRIPTION_PLANS[selectedPlan]?.name}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Account Details
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="Reflectionary"
              className="mx-auto mb-4 max-w-sm h-auto"
            />
            <h2 className="text-2xl font-bold text-gray-900">
              Create Your Account
            </h2>
            <p className="text-gray-600 mt-2">
              {SUBSCRIPTION_PLANS[selectedPlan].name} Plan - $
              {isAnnual && SUBSCRIPTION_PLANS[selectedPlan].yearlyPrice
                ? SUBSCRIPTION_PLANS[selectedPlan].yearlyPrice + "/year"
                : SUBSCRIPTION_PLANS[selectedPlan].price +
                  "/" +
                  SUBSCRIPTION_PLANS[selectedPlan].billing}
            </p>
          </div>

          {/* Account Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
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
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
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
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
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
    );
  }

  // Step 3: Payment (for paid plans)
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="Reflectionary"
              className="mx-auto mb-4 max-w-sm h-auto"
            />
            <h2 className="text-2xl font-bold text-gray-900">
              Complete Your Subscription
            </h2>
            <p className="text-gray-600 mt-2">
              {SUBSCRIPTION_PLANS[selectedPlan].name} Plan - $
              {isAnnual && SUBSCRIPTION_PLANS[selectedPlan].yearlyPrice
                ? SUBSCRIPTION_PLANS[selectedPlan].yearlyPrice + "/year"
                : SUBSCRIPTION_PLANS[selectedPlan].price +
                  "/" +
                  SUBSCRIPTION_PLANS[selectedPlan].billing}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <div className="mb-6">
              <div className="text-3xl mb-4">
                {SUBSCRIPTION_PLANS[selectedPlan].icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {SUBSCRIPTION_PLANS[selectedPlan].name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                You'll be redirected to Stripe to complete your payment
                securely.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleStripeCheckout}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Complete Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Success
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Reflectionary!
            </h2>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. Check your email for
              verification instructions.
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }
}
