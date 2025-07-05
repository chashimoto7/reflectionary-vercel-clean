// src/components/settings/advanced/SubscriptionTab.jsx
import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Calendar,
  Package,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Crown,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function SubscriptionTab({ user, setError, setSuccess }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

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
    // This would typically open Stripe customer portal or similar
    window.open("https://billing.stripe.com/portal", "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-purple-600" />
        Subscription Management
      </h2>

      {/* Current Plan */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Advanced Plan</h3>
            <p className="text-purple-100 mb-4">
              Enjoy full access to advanced features, PDF exports, and analytics
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>
                  Status: <span className="font-semibold">Active</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Next billing:{" "}
                  {subscription?.next_billing_date
                    ? formatDate(subscription.next_billing_date)
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold">$19.99</div>
            <div className="text-purple-100">per month</div>
          </div>
        </div>
      </div>

      {/* Billing Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Billing Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600">Payment Method</label>
            <div className="mt-1 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900">•••• •••• •••• 4242</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Billing Cycle</label>
            <p className="text-gray-900 mt-1">Monthly</p>
          </div>

          <div>
            <label className="text-sm text-gray-600">Member Since</label>
            <p className="text-gray-900 mt-1">{formatDate(user.created_at)}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600">Next Payment</label>
            <p className="text-gray-900 mt-1">
              {subscription?.next_billing_date
                ? formatDate(subscription.next_billing_date)
                : "N/A"}
            </p>
          </div>
        </div>

        <button
          onClick={handleManageSubscription}
          className="mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          Update Payment Method
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      {/* Features Included */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Included Features
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Unlimited journal entries",
            "Advanced analytics & insights",
            "Custom date range exports",
            "PDF & CSV export formats",
            "Starred/pinned filtering",
            "Goals & wellness tracking",
            "Mood & emotion analytics",
            "Custom tags & folders",
            "Priority support",
            "Monthly summary reports",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Prompt */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-start gap-4">
          <Crown className="h-8 w-8 text-purple-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Ready for Premium?
            </h4>
            <p className="text-gray-600 mb-4">
              Unlock AI-powered insights with Reflectionarian, complete data
              exports, and advanced customization options.
            </p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Upgrade to Premium →
            </button>
          </div>
        </div>
      </div>

      {/* Manage Subscription */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={handleManageSubscription}
          className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
        >
          Manage Subscription
          <ExternalLink className="h-4 w-4" />
        </button>

        <button className="text-gray-500 hover:text-gray-700">
          Cancel Subscription
        </button>
      </div>
    </div>
  );
}
