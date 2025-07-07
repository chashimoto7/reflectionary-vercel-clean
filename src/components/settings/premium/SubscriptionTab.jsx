// frontend/ src/components/settings/premium/SubscriptionTab.jsx
import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Calendar,
  Crown,
  Sparkles,
  Gift,
  ExternalLink,
  CheckCircle,
  Star,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function SubscriptionTab({ user, setError, setSuccess }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly");

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setSubscription(data);
      setBillingCycle(data?.billing_cycle || "monthly");
    } catch (err) {
      setError("Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleManageSubscription = () => {
    window.open("https://billing.stripe.com/portal", "_blank");
  };

  const handleSwitchBilling = async (newCycle) => {
    setLoading(true);
    try {
      // This would integrate with your payment processor
      setBillingCycle(newCycle);
      setSuccess(`Switched to ${newCycle} billing`);
    } catch (err) {
      setError("Failed to switch billing cycle");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-purple-400" />
        Premium Subscription
      </h2>

      {/* Premium Status Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Crown className="h-64 w-64" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Premium Plan</h3>
                  <p className="text-purple-100">
                    The ultimate journaling experience
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm text-purple-100">
                      Current Period
                    </span>
                  </div>
                  <p className="font-semibold">
                    {subscription?.current_period_start
                      ? formatDate(subscription.current_period_start)
                      : "N/A"}{" "}
                    -
                    {subscription?.current_period_end
                      ? formatDate(subscription.current_period_end)
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="h-4 w-4" />
                    <span className="text-sm text-purple-100">
                      Member Benefits
                    </span>
                  </div>
                  <p className="font-semibold">All Features Unlocked</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-4xl font-bold mb-1">
                {billingCycle === "monthly" ? "$29.99" : "$299.99"}
              </div>
              <div className="text-purple-100">
                per {billingCycle === "monthly" ? "month" : "year"}
              </div>
              {billingCycle === "yearly" && (
                <div className="mt-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold inline-block">
                  Save $60/year!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Billing Options */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4">Billing Cycle</h3>

        <div className="grid grid-cols-2 gap-4">
          <label
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
              billingCycle === "monthly"
                ? "border-purple-500 bg-purple-500/20"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            <input
              type="radio"
              name="billing"
              value="monthly"
              checked={billingCycle === "monthly"}
              onChange={() => handleSwitchBilling("monthly")}
              className="sr-only"
            />
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">$29.99</div>
              <div className="text-gray-300">Monthly</div>
            </div>
          </label>

          <label
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
              billingCycle === "yearly"
                ? "border-purple-500 bg-purple-500/20"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            <input
              type="radio"
              name="billing"
              value="yearly"
              checked={billingCycle === "yearly"}
              onChange={() => handleSwitchBilling("yearly")}
              className="sr-only"
            />
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">$299.99</div>
              <div className="text-gray-300">Yearly</div>
              <div className="mt-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                2 months free!
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Payment Information
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300">Payment Method</label>
            <div className="mt-1 flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-400" />
              <span className="text-white">•••• •••• •••• 4242</span>
              <span className="text-gray-400">Expires 12/25</span>
            </div>
          </div>

          <button
            onClick={handleManageSubscription}
            className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-2"
          >
            Update Payment Method
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Premium Features */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          Your Premium Features
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Unlimited journal entries with no limits",
            "AI-powered Reflectionarian assistant",
            "Advanced analytics & deep insights",
            "Complete data export in any format",
            "Custom PDF reports with branding",
            "Advanced filtering & search",
            "Premium templates & prompts",
            "Priority customer support",
            "Early access to new features",
            "Multi-device sync & backup",
            "Advanced security features",
            "API access for developers",
          ].map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Program - Premium Exclusive */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5 text-purple-400" />
          Premium Referral Program
        </h3>

        <p className="text-gray-300 mb-4">
          Share the gift of reflection! For every friend who joins Premium, you
          both get a month free.
        </p>

        <div className="flex items-center gap-4">
          <div className="flex-1 p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Your referral code</p>
            <p className="text-white font-mono">
              REFLECT-{user?.id?.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `REFLECT-${user?.id?.slice(0, 8).toUpperCase()}`
              );
              setSuccess("Referral code copied to clipboard!");
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Copy Code
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-xs text-gray-400">Friends Referred</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-2xl font-bold text-green-400">$89.97</p>
            <p className="text-xs text-gray-400">Total Saved</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-2xl font-bold text-purple-400">2</p>
            <p className="text-xs text-gray-400">Months Earned</p>
          </div>
        </div>
      </div>

      {/* Manage Subscription */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={handleManageSubscription}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          Manage Subscription
          <ExternalLink className="h-4 w-4" />
        </button>

        <button className="text-gray-400 hover:text-gray-300">
          Pause Subscription
        </button>
      </div>
    </div>
  );
}
