// frontend/ src/pages/SignupCancelled.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/ReflectionaryLogoWelcome.png";

export default function SignupCancelled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center">
        <img src={logo} alt="Reflectionary" className="mx-auto mb-6 max-w-sm h-auto" />
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏸️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h2>
          <p className="text-gray-600 mb-6">
            No worries! Your payment was cancelled and you haven't been charged. 
            You can try again anytime or start with our free plan.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/signup')}
              className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/signup?plan=free')}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Start with Free Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Additional API endpoint needed: api/stripe/verify-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      res.status(200).json({ 
        success: true, 
        session: {
          id: session.id,
          customer: session.customer,
          subscription: session.subscription,
          payment_status: session.payment_status
        }
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Payment not completed' 
      });
    }
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}