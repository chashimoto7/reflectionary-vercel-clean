// src/components/CrisisResourceModal.jsx
// Gentle, supportive crisis resource modal with location-aware help

import React, { useState, useEffect } from "react";
import {
  Heart,
  Phone,
  MessageCircle,
  MapPin,
  Globe,
  ExternalLink,
  X,
  Shield,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { crisisResourceService } from "../services/CrisisResourceService";

const CrisisResourceModal = ({
  isOpen,
  onClose,
  analysisResult = null,
  userLocation = null,
}) => {
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState("pending");
  const [selectedLocation, setSelectedLocation] = useState(userLocation);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    immediate: true,
    crisis: true,
    online: false,
    selfCare: false,
  });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showLocationHelp, setShowLocationHelp] = useState(false);

  // Load crisis resources when modal opens
  useEffect(() => {
    if (isOpen) {
      loadResources();
      setHasInteracted(false);
    }
  }, [isOpen, selectedLocation]);

  const loadResources = async () => {
    setLoading(true);
    try {
      console.log("🚨 Loading crisis resources...");

      const resourceData = await crisisResourceService.getCrisisResources({
        location: selectedLocation,
        crisisType: analysisResult?.level || "general",
        includeOnline: true,
        includeSelfCare: true,
      });

      setResources(resourceData);
      console.log("✅ Crisis resources loaded:", resourceData);
    } catch (error) {
      console.error("❌ Error loading crisis resources:", error);

      // Load emergency fallback
      const emergency = crisisResourceService.getEmergencyResources();
      setResources({
        location: { country: "US" },
        resources: emergency,
        error: "Could not load full resources, showing emergency contacts",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationPermission = async () => {
    try {
      setLocationPermission("requesting");
      const location = await crisisResourceService.getUserLocation(true);
      setSelectedLocation(location);
      setLocationPermission("granted");
      console.log("📍 Location permission granted:", location);
    } catch (error) {
      console.warn("🚫 Location permission denied:", error);
      setLocationPermission("denied");
      setShowLocationInput(true);
    }
  };

  const handleManualLocation = () => {
    if (manualLocation.trim()) {
      // Parse manual location (simplified)
      const parts = manualLocation.split(",").map((s) => s.trim());
      const newLocation = {
        city: parts[0] || null,
        region: parts[1] || null,
        country: parts[2] || "US",
        accuracy: "manual",
      };

      setSelectedLocation(newLocation);
      setShowLocationInput(false);
      setLocationPermission("manual");
      console.log("📝 Manual location set:", newLocation);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
    setHasInteracted(true);
  };

  const handleResourceClick = (resource) => {
    setHasInteracted(true);
    const contact = crisisResourceService.formatContact(resource);

    if (contact.action) {
      window.open(contact.action, "_blank");
    }
  };

  const handleCloseModal = () => {
    setHasInteracted(true);
    onClose();
  };

  // Get appropriate icon color for crisis level
  const getIconColor = () => {
    if (!analysisResult) return "text-blue-500";

    switch (analysisResult.level) {
      case "immediate":
        return "text-red-500";
      case "escalating":
        return "text-orange-500";
      case "concerning":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getModalTitle = () => {
    if (!analysisResult) return "Support Resources";

    switch (analysisResult.level) {
      case "immediate":
        return "Immediate Support Available";
      case "escalating":
        return "Mental Health Resources";
      case "concerning":
        return "Wellness Support";
      default:
        return "Support Resources";
    }
  };

  const getModalMessage = () => {
    if (!analysisResult)
      return "Here are some resources that might be helpful.";

    switch (analysisResult.level) {
      case "immediate":
        return "We noticed some concerning patterns in your recent writing. If you're having thoughts of suicide or self-harm, please know that help is available and you're not alone.";
      case "escalating":
        return "It sounds like you're going through a particularly difficult time. Professional support can make a real difference.";
      case "concerning":
        return "Taking care of your mental health is important. Here are some resources that might help.";
      default:
        return "Here are some support resources that might be helpful.";
    }
  };

  // Get appropriate header background color for crisis level
  const getHeaderBgColor = () => {
    if (!analysisResult) return "from-blue-500 to-blue-600";

    switch (analysisResult.level) {
      case "immediate":
        return "from-red-500 to-red-600";
      case "escalating":
        return "from-orange-500 to-orange-600";
      case "concerning":
        return "from-blue-500 to-blue-600";
      default:
        return "from-purple-500 to-purple-600";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div
          className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6"
          style={{
            background:
              analysisResult?.level === "immediate"
                ? "linear-gradient(to right, #ef4444, #dc2626)"
                : analysisResult?.level === "escalating"
                ? "linear-gradient(to right, #f97316, #ea580c)"
                : analysisResult?.level === "concerning"
                ? "linear-gradient(to right, #3b82f6, #2563eb)"
                : "linear-gradient(to right, #8b5cf6, #7c3aed)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {getModalTitle()}
                </h2>
                <p className="text-white opacity-90 text-sm">
                  You're not alone - help is available 24/7
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors flex-shrink-0"
              title="Close"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Important Message */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`w-6 h-6 ${getIconColor()} mt-0.5 flex-shrink-0`}
              />
              <div>
                <p className="text-gray-800 leading-relaxed">
                  {getModalMessage()}
                </p>
                {analysisResult?.level === "immediate" && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-medium text-sm">
                      <strong>
                        If you're in immediate danger, please call emergency
                        services (911) right away.
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Get Local Resources
                </h3>
                <button
                  onClick={() => setShowLocationHelp(!showLocationHelp)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>

              {selectedLocation && (
                <span className="text-sm text-gray-600">
                  {selectedLocation.city && `${selectedLocation.city}, `}
                  {selectedLocation.region && `${selectedLocation.region}, `}
                  {selectedLocation.country}
                </span>
              )}
            </div>

            {showLocationHelp && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Why location helps:</strong> Local crisis centers
                  often have shorter wait times and understand your area's
                  specific resources. Your location is never stored - we only
                  use it to find help near you.
                </p>
              </div>
            )}

            {locationPermission === "pending" && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleLocationPermission}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Use My Location
                </button>
                <button
                  onClick={() => setShowLocationInput(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Enter Location Manually
                </button>
              </div>
            )}

            {showLocationInput && (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="City, State, Country (e.g. Seattle, WA, US)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleManualLocation()
                  }
                />
                <button
                  onClick={handleManualLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
              </div>
            )}

            {locationPermission === "denied" && !showLocationInput && (
              <div className="text-sm text-gray-600">
                Location access denied.
                <button
                  onClick={() => setShowLocationInput(true)}
                  className="text-blue-600 hover:text-blue-700 ml-1"
                >
                  Enter manually
                </button>
              </div>
            )}
          </div>

          {/* Resources Loading */}
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Finding resources near you...</p>
            </div>
          )}

          {/* Resources */}
          {!loading && resources && (
            <div className="p-6 space-y-6">
              {/* Immediate/Emergency Resources */}
              {resources.resources.immediate?.length > 0 && (
                <ResourceSection
                  title="Emergency Contacts"
                  icon={Phone}
                  resources={resources.resources.immediate}
                  expanded={expandedSections.immediate}
                  onToggle={() => toggleSection("immediate")}
                  urgent={true}
                  description="For immediate life-threatening emergencies"
                />
              )}

              {/* Crisis Hotlines */}
              {resources.resources.crisis?.length > 0 && (
                <ResourceSection
                  title="Crisis Support Hotlines"
                  icon={MessageCircle}
                  resources={resources.resources.crisis}
                  expanded={expandedSections.crisis}
                  onToggle={() => toggleSection("crisis")}
                  description="Free, confidential support available 24/7"
                />
              )}

              {/* Specialized Resources */}
              {resources.resources.specialized?.length > 0 && (
                <ResourceSection
                  title="Specialized Support"
                  icon={Users}
                  resources={resources.resources.specialized}
                  expanded={expandedSections.specialized}
                  onToggle={() => toggleSection("specialized")}
                  description="Support for specific situations and communities"
                />
              )}

              {/* Online Resources */}
              {resources.resources.online?.length > 0 && (
                <ResourceSection
                  title="Online Support & Therapy"
                  icon={Globe}
                  resources={resources.resources.online}
                  expanded={expandedSections.online}
                  onToggle={() => toggleSection("online")}
                  description="Professional help from home"
                />
              )}

              {/* Self-Care Resources */}
              {resources.resources.selfCare?.length > 0 && (
                <ResourceSection
                  title="Immediate Self-Care Techniques"
                  icon={Heart}
                  resources={resources.resources.selfCare}
                  expanded={expandedSections.selfCare}
                  onToggle={() => toggleSection("selfCare")}
                  description="Techniques you can use right now"
                />
              )}
            </div>
          )}

          {/* Error State */}
          {!loading && !resources && (
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <AlertCircle className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Could Not Load Resources
              </h3>
              <p className="text-gray-600 mb-4">
                We're having trouble loading resources right now. Here are some
                emergency contacts:
              </p>
              <div className="bg-red-50 p-4 rounded-lg text-left max-w-md mx-auto">
                <h4 className="font-semibold text-red-900 mb-2">
                  Emergency Contacts:
                </h4>
                <ul className="text-red-800 space-y-1">
                  <li>• Emergency Services: 911 (US/Canada)</li>
                  <li>• Crisis Text Line: Text HOME to 741741</li>
                  <li>• National Suicide Prevention Lifeline: 988</li>
                  <li>• Crisis Chat: suicidepreventionlifeline.org</li>
                </ul>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <strong>Important:</strong> This app is not a substitute for
                  professional medical care. If you're experiencing a mental
                  health emergency, please contact emergency services or go to
                  your nearest emergency room.
                </p>
                <p>
                  All information provided is for educational purposes only. We
                  respect your privacy - your location and interactions with
                  these resources are not stored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Resource Section Component
const ResourceSection = ({
  title,
  icon: Icon,
  resources,
  expanded,
  onToggle,
  urgent = false,
  description,
}) => {
  return (
    <div
      className={`border rounded-lg ${
        urgent ? "border-red-300 bg-red-50" : "border-gray-200"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon
            className={`w-5 h-5 ${urgent ? "text-red-600" : "text-gray-600"}`}
          />
          <div className="text-left">
            <h3
              className={`font-semibold ${
                urgent ? "text-red-900" : "text-gray-900"
              }`}
            >
              {title}
            </h3>
            {description && (
              <p
                className={`text-sm ${
                  urgent ? "text-red-700" : "text-gray-600"
                }`}
              >
                {description}
              </p>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {resources.map((resource, index) => (
            <ResourceCard key={resource.id || index} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
};

// Individual Resource Card Component
const ResourceCard = ({ resource }) => {
  const contact = crisisResourceService.formatContact(resource);

  const getResourceIcon = () => {
    switch (resource.type) {
      case "phone":
        return <Phone className="w-4 h-4" />;
      case "text":
        return <MessageCircle className="w-4 h-4" />;
      case "emergency":
        return <AlertCircle className="w-4 h-4" />;
      case "website":
      case "directory":
      case "online_therapy":
        return <ExternalLink className="w-4 h-4" />;
      case "technique":
        return <Heart className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getButtonColor = () => {
    if (resource.type === "emergency") return "bg-red-600 hover:bg-red-700";
    if (resource.type === "phone") return "bg-blue-600 hover:bg-blue-700";
    if (resource.type === "text") return "bg-green-600 hover:bg-green-700";
    return "bg-gray-600 hover:bg-gray-700";
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getResourceIcon()}
            <h4 className="font-semibold text-gray-900">{resource.name}</h4>
            {resource.availability && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {resource.availability}
              </span>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-3">{resource.description}</p>

          {/* Contact Information */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-medium text-gray-900">{contact.display}</span>
            {resource.languages && (
              <span className="text-xs text-gray-500">
                ({resource.languages.join(", ")})
              </span>
            )}
          </div>

          {/* Special Instructions for Techniques */}
          {resource.instructions && (
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <p className="text-blue-800 text-sm font-medium">How to use:</p>
              <p className="text-blue-700 text-sm">{resource.instructions}</p>
            </div>
          )}

          {/* Demographics */}
          {resource.demographics && (
            <div className="flex flex-wrap gap-1 mb-3">
              {resource.demographics.map((demo, i) => (
                <span
                  key={i}
                  className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
                >
                  {demo}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        {contact.action && (
          <button
            onClick={() =>
              window.open(
                contact.action,
                contact.action.startsWith("http") ? "_blank" : "_self"
              )
            }
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors whitespace-nowrap ${getButtonColor()}`}
          >
            {getResourceIcon()}
            {contact.actionText}
          </button>
        )}
      </div>

      {/* Website Link */}
      {resource.website && contact.action !== resource.website && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <a
            href={resource.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Learn more
          </a>
        </div>
      )}
    </div>
  );
};

export default CrisisResourceModal;
