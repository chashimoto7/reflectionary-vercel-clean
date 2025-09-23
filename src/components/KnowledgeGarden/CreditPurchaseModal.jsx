// src/components/KnowledgeGarden/CreditPurchaseModal.jsx
import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Package,
  Zap,
  Star,
  Crown,
  X,
  Loader,
  CheckCircle,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function CreditPurchaseModal({ onClose, onPurchaseComplete }) {
  const [creditBalance, setCreditBalance] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const packages = {
    starter: {
      name: "Starter Pack",
      price: 10.00,
      credits: 200,
      pricePerCredit: 0.05,
      description: "Perfect for a few old journals",
      icon: Package,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-400/30",
      popular: false
    },
    standard: {
      name: "Standard Pack",
      price: 25.00,
      credits: 600,
      pricePerCredit: 0.042,
      description: "Great for several years of journals",
      icon: Zap,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-400/30",
      popular: true,
      savings: "Best Value"
    },
    bulk: {
      name: "Bulk Pack",
      price: 50.00,
      credits: 1400,
      pricePerCredit: 0.036,
      description: "Digitize your entire collection",
      icon: Crown,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-400/30",
      popular: false,
      savings: "Maximum Savings"
    }
  };

  useEffect(() => {
    fetchCreditBalance();
  }, []);

  const fetchCreditBalance = async () => {
    try {
      const response = await fetch('/api/ocr/credits?user_id=current-user-id&action=balance');
      const result = await response.json();

      if (result.success) {
        setCreditBalance(result.data.credits_balance || 0);
      }
    } catch (error) {
      console.error('Error fetching credit balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ocr/credits?user_id=current-user-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'purchase',
          package_type: selectedPackage,
          success_url: `${window.location.origin}/knowledge-garden?payment=success`,
          cancel_url: `${window.location.origin}/knowledge-garden?payment=cancelled`
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to Stripe Checkout
        window.location.href = result.data.sessionUrl;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PackageCard = ({ packageKey, packageData }) => {
    const Icon = packageData.icon;
    const isSelected = selectedPackage === packageKey;

    return (
      <div
        onClick={() => setSelectedPackage(packageKey)}
        className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
          isSelected
            ? `${packageData.borderColor} ${packageData.bgColor}`
            : 'border-white/10 bg-white/5 hover:bg-white/10'
        }`}
      >
        {packageData.popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Most Popular
            </span>
          </div>
        )}

        {packageData.savings && (
          <div className="absolute -top-3 right-4">
            <span className={`${packageData.bgColor} ${packageData.color} px-2 py-1 rounded-full text-xs font-semibold border ${packageData.borderColor}`}>
              {packageData.savings}
            </span>
          </div>
        )}

        <div className="text-center">
          <div className={`${packageData.bgColor} p-3 rounded-lg inline-block mb-4`}>
            <Icon className={`h-8 w-8 ${packageData.color}`} />
          </div>

          <h3 className="text-white font-bold text-lg mb-2">{packageData.name}</h3>
          <p className="text-gray-400 text-sm mb-4">{packageData.description}</p>

          <div className="space-y-2 mb-4">
            <div className="text-3xl font-bold text-white">
              ${packageData.price}
            </div>
            <div className={`text-sm ${packageData.color} font-medium`}>
              {packageData.credits.toLocaleString()} credits
            </div>
            <div className="text-xs text-gray-500">
              ${packageData.pricePerCredit.toFixed(3)} per credit
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Process ~{Math.floor(packageData.credits / 2)} pages
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Never expires
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Premium OCR accuracy
            </div>
          </div>

          {isSelected && (
            <div className="mt-4">
              <div className={`w-full h-1 ${packageData.bgColor} rounded-full`} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Purchase OCR Credits</h2>
            <p className="text-gray-400 text-sm mt-1">
              Digitize your handwritten journals and scanned documents
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Balance */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Current Balance</h3>
                <p className="text-gray-400 text-sm">Available OCR credits</p>
              </div>
              <div className="text-right">
                {loadingBalance ? (
                  <Loader className="h-5 w-5 text-gray-400 animate-spin" />
                ) : (
                  <div className="text-2xl font-bold text-white">
                    {creditBalance.toLocaleString()}
                  </div>
                )}
                <p className="text-gray-400 text-sm">credits</p>
              </div>
            </div>
          </div>

          {/* Package Selection */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Choose a Credit Package</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(packages).map(([key, packageData]) => (
                <PackageCard key={key} packageKey={key} packageData={packageData} />
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
            <h4 className="text-blue-300 font-medium mb-3">How OCR Credits Work</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-200">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-semibold">1 credit</span>
                  <span>= Basic OCR for 1 page</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-semibold">2 credits</span>
                  <span>= Enhanced OCR with AI cleanup</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Process handwritten journals</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Digitize scanned documents</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-gray-300 font-medium mb-1">Secure Payment</h4>
                <p className="text-gray-400 text-sm">
                  Payments are processed securely through Stripe. We never store your payment information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {selectedPackage && (
                <div>
                  Selected: <span className="text-white font-medium">
                    {packages[selectedPackage].name}
                  </span> - ${packages[selectedPackage].price}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={!selectedPackage || loading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}