// frontend/ src/pages/SignupSuccess.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { CheckCircle, Loader2 } from "lucide-react";
import logo from "../assets/BrightReflectionaryHorizontal.svg";

export default function SignupSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'error'
  const [error, setError] = useState("");

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setStatus("error");
      setError("No session ID provided");
      setLoading(false);
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      // Verify the Stripe session
      const response = await fetch("/api/stripe/verify-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("success");
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setStatus("error");
        setError(result.error || "Payment verification failed");
      }
    } catch (err) {
      setStatus("error");
      setError("Failed to verify payment");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <img
            src={logo}
            alt="Reflectionary"
            className="mx-auto mb-6 max-w-sm h-auto"
          />
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verifying your payment...
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your subscription.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <img
            src={logo}
            alt="Reflectionary"
            className="mx-auto mb-6 max-w-sm h-auto"
          />
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Reflectionary! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Your subscription has been activated successfully. Check your
              email for confirmation and next steps.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
              >
                Go to Login
              </button>
              <p className="text-sm text-gray-500">
                Redirecting automatically in 3 seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <img
            src={logo}
            alt="Reflectionary"
            className="mx-auto mb-6 max-w-sm h-auto"
          />
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Payment Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/signup")}
                className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
