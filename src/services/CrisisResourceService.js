// frontend/ src/services/CrisisResourceService.js
// Comprehensive crisis resource management with location-aware support

export class CrisisResourceService {
  constructor() {
    // Crisis resource database organized by geographic scope
    this.resources = {
      // Always available - global/international resources
      immediate: [
        {
          id: "global_emergency",
          name: "Local Emergency Services",
          description: "For immediate life-threatening emergencies",
          contact: "911 (US/Canada), 112 (EU), 000 (Australia)",
          type: "emergency",
          availability: "24/7",
          global: true,
          priority: 1,
        },
      ],

      // Country-specific primary resources
      country: {
        US: [
          {
            id: "us_988",
            name: "988 Suicide & Crisis Lifeline",
            description:
              "Free and confidential emotional support for people in suicidal crisis or emotional distress",
            contact: "988",
            type: "phone",
            availability: "24/7",
            languages: ["English", "Spanish"],
            priority: 1,
            website: "https://988lifeline.org",
          },
          {
            id: "us_crisis_text",
            name: "Crisis Text Line",
            description: "Free, 24/7 crisis support via text message",
            contact: "Text HOME to 741741",
            type: "text",
            availability: "24/7",
            priority: 2,
            website: "https://crisistextline.org",
          },
          {
            id: "us_trevor",
            name: "The Trevor Project",
            description:
              "Crisis intervention and suicide prevention for LGBTQ+ youth",
            contact: "1-866-488-7386",
            type: "phone",
            availability: "24/7",
            demographics: ["LGBTQ+", "Youth"],
            priority: 3,
            website: "https://thetrevorproject.org",
          },
          {
            id: "us_warmline",
            name: "SAMHSA National Helpline",
            description:
              "Treatment referral and information service for mental health and substance abuse",
            contact: "1-800-662-4357",
            type: "phone",
            availability: "24/7",
            priority: 4,
            website: "https://samhsa.gov",
          },
        ],
        CA: [
          {
            id: "ca_talk_suicide",
            name: "Talk Suicide Canada",
            description: "National suicide prevention service",
            contact: "1-833-456-4566",
            type: "phone",
            availability: "24/7",
            languages: ["English", "French"],
            priority: 1,
            website: "https://talksuicide.ca",
          },
          {
            id: "ca_crisis_text",
            name: "Crisis Text Line Canada",
            description: "Free, 24/7 crisis support via text",
            contact: "Text TALK to 686868",
            type: "text",
            availability: "24/7",
            priority: 2,
            website: "https://crisistextline.ca",
          },
          {
            id: "ca_kids_help",
            name: "Kids Help Phone",
            description: "Support for children, teens, and young adults",
            contact: "1-800-668-6868",
            type: "phone",
            availability: "24/7",
            demographics: ["Youth", "Children"],
            priority: 3,
            website: "https://kidshelpphone.ca",
          },
        ],
        UK: [
          {
            id: "uk_samaritans",
            name: "Samaritans",
            description: "Free support for anyone in emotional distress",
            contact: "116 123",
            type: "phone",
            availability: "24/7",
            priority: 1,
            website: "https://samaritans.org",
          },
          {
            id: "uk_crisis_text",
            name: "Crisis Text Line UK",
            description: "Free, 24/7 crisis support via text",
            contact: "Text SHOUT to 85258",
            type: "text",
            availability: "24/7",
            priority: 2,
            website: "https://giveusashout.org",
          },
        ],
        AU: [
          {
            id: "au_lifeline",
            name: "Lifeline Australia",
            description: "Crisis support and suicide prevention",
            contact: "13 11 14",
            type: "phone",
            availability: "24/7",
            priority: 1,
            website: "https://lifeline.org.au",
          },
          {
            id: "au_beyond_blue",
            name: "Beyond Blue",
            description:
              "Support for depression, anxiety and suicide prevention",
            contact: "1300 22 4636",
            type: "phone",
            availability: "24/7",
            priority: 2,
            website: "https://beyondblue.org.au",
          },
        ],
      },

      // State/Province specific resources
      regional: {
        "US-CA": [
          {
            id: "ca_crisis_support",
            name: "California Crisis Support Central",
            description: "Statewide crisis intervention and referral",
            contact: "1-877-727-4747",
            type: "phone",
            availability: "24/7",
            priority: 1,
          },
        ],
        "US-NY": [
          {
            id: "ny_hope_line",
            name: "NYS Crisis & Counseling Helpline",
            description: "New York State mental health crisis support",
            contact: "1-844-863-9314",
            type: "phone",
            availability: "24/7",
            priority: 1,
          },
        ],
        "US-TX": [
          {
            id: "tx_crisis_helpline",
            name: "Texas Crisis Helpline",
            description: "Statewide crisis intervention service",
            contact: "1-800-832-1901",
            type: "phone",
            availability: "24/7",
            priority: 1,
          },
        ],
        "CA-ON": [
          {
            id: "on_crisis_line",
            name: "Distress Centres of Greater Toronto",
            description: "Crisis support for Greater Toronto Area",
            contact: "416-408-4357",
            type: "phone",
            availability: "24/7",
            priority: 1,
          },
        ],
      },

      // Specialized support resources
      specialized: [
        {
          id: "domestic_violence",
          name: "National Domestic Violence Hotline",
          description: "Support for domestic violence survivors",
          contact: "1-800-799-7233",
          type: "phone",
          availability: "24/7",
          countries: ["US"],
          category: "domestic_violence",
          priority: 1,
          website: "https://thehotline.org",
        },
        {
          id: "sexual_assault",
          name: "RAINN National Sexual Assault Hotline",
          description: "Support for sexual assault survivors",
          contact: "1-800-656-4673",
          type: "phone",
          availability: "24/7",
          countries: ["US"],
          category: "sexual_assault",
          priority: 1,
          website: "https://rainn.org",
        },
        {
          id: "veterans_crisis",
          name: "Veterans Crisis Line",
          description: "Crisis support for veterans and service members",
          contact: "1-800-273-8255",
          type: "phone",
          availability: "24/7",
          countries: ["US"],
          category: "veterans",
          priority: 1,
          website: "https://veteranscrisisline.net",
        },
        {
          id: "postpartum_support",
          name: "Postpartum Support International",
          description: "Support for perinatal mood and anxiety disorders",
          contact: "1-944-944-4773",
          type: "phone",
          availability: "Business hours",
          countries: ["US", "CA"],
          category: "postpartum",
          priority: 1,
          website: "https://postpartum.net",
        },
      ],

      // Online/digital resources
      online: [
        {
          id: "psychology_today",
          name: "Find a Therapist - Psychology Today",
          description: "Directory of licensed mental health professionals",
          website: "https://psychologytoday.com/us/therapists",
          type: "directory",
          countries: ["US", "CA"],
          priority: 1,
        },
        {
          id: "betterhelp",
          name: "BetterHelp Online Therapy",
          description: "Professional online counseling platform",
          website: "https://betterhelp.com",
          type: "online_therapy",
          countries: ["US", "CA", "AU", "UK"],
          priority: 2,
        },
        {
          id: "talkspace",
          name: "Talkspace Online Therapy",
          description: "Text, audio, and video therapy sessions",
          website: "https://talkspace.com",
          type: "online_therapy",
          countries: ["US"],
          priority: 3,
        },
      ],

      // Self-care and coping resources
      selfCare: [
        {
          id: "grounding_techniques",
          name: "5-4-3-2-1 Grounding Technique",
          description: "Immediate anxiety relief technique",
          type: "technique",
          instructions:
            "5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste",
          priority: 1,
        },
        {
          id: "breathing_exercise",
          name: "Box Breathing",
          description: "Calming breathing technique",
          type: "technique",
          instructions:
            "Breathe in for 4, hold for 4, breathe out for 4, hold for 4. Repeat.",
          priority: 2,
        },
        {
          id: "safety_plan",
          name: "Creating a Safety Plan",
          description: "Steps to stay safe during a crisis",
          type: "resource",
          website: "https://suicidesafetyplan.com",
          priority: 3,
        },
      ],
    };

    // Location detection settings
    this.locationSettings = {
      enableGeolocation: true,
      fallbackToIP: true,
      cacheLocationSession: true,
      maxLocationAge: 24 * 60 * 60 * 1000, // 24 hours
      defaultCountry: "US",
    };
  }

  // Main method to get crisis resources based on user location and context
  async getCrisisResources(options = {}) {
    try {
      const {
        location = null,
        crisisType = "general",
        demographics = [],
        includeOnline = true,
        includeSelfCare = true,
        forceRefresh = false,
      } = options;

      console.log("🚨 Getting crisis resources for:", {
        location,
        crisisType,
        demographics,
      });

      // Get user location
      const userLocation =
        location || (await this.getUserLocation(forceRefresh));
      console.log("📍 User location:", userLocation);

      // Build comprehensive resource list
      const resources = {
        immediate: this.getImmediateResources(userLocation),
        crisis: this.getCrisisHotlines(userLocation, demographics),
        local: await this.getLocalResources(userLocation),
        specialized: this.getSpecializedResources(crisisType, userLocation),
        online: includeOnline ? this.getOnlineResources(userLocation) : [],
        selfCare: includeSelfCare ? this.getSelfCareResources() : [],
      };

      // Sort by priority and relevance
      Object.keys(resources).forEach((category) => {
        resources[category] = this.sortResourcesByPriority(resources[category]);
      });

      console.log(
        "✅ Crisis resources compiled:",
        Object.keys(resources).map((k) => `${k}: ${resources[k].length}`)
      );

      return {
        location: userLocation,
        resources,
        totalResources: Object.values(resources).flat().length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Error getting crisis resources:", error);

      // Return fallback resources
      return {
        location: { country: this.locationSettings.defaultCountry },
        resources: {
          immediate: this.getImmediateResources(),
          crisis: this.getCrisisHotlines({
            country: this.locationSettings.defaultCountry,
          }),
          local: [],
          specialized: [],
          online: this.getOnlineResources({
            country: this.locationSettings.defaultCountry,
          }),
          selfCare: this.getSelfCareResources(),
        },
        error: "Could not determine location, showing default resources",
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Get user's current location with privacy controls
  async getUserLocation(forceRefresh = false) {
    try {
      // Check for cached location first
      if (!forceRefresh && this.locationSettings.cacheLocationSession) {
        const cached = this.getCachedLocation();
        if (cached) {
          console.log("📂 Using cached location:", cached);
          return cached;
        }
      }

      // Try geolocation first (most accurate)
      if (this.locationSettings.enableGeolocation && navigator.geolocation) {
        try {
          const geoLocation = await this.getGeolocation();
          if (geoLocation) {
            this.cacheLocation(geoLocation);
            return geoLocation;
          }
        } catch (geoError) {
          console.warn(
            "🌍 Geolocation failed, trying IP fallback:",
            geoError.message
          );
        }
      }

      // Fallback to IP-based location
      if (this.locationSettings.fallbackToIP) {
        const ipLocation = await this.getIPLocation();
        if (ipLocation) {
          this.cacheLocation(ipLocation);
          return ipLocation;
        }
      }

      // Ultimate fallback
      console.warn("⚠️ All location detection failed, using default");
      return { country: this.locationSettings.defaultCountry };
    } catch (error) {
      console.error("❌ getUserLocation error:", error);
      return { country: this.locationSettings.defaultCountry };
    }
  }

  // Get precise geolocation from browser API
  async getGeolocation() {
    return new Promise((resolve, reject) => {
      const options = {
        enableHighAccuracy: false, // Don't need GPS precision for crisis resources
        timeout: 10000, // 10 second timeout
        maximumAge: 300000, // Accept 5-minute old location
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            console.log("🎯 Got geolocation coordinates");

            // Reverse geocode to get country/region
            const location = await this.reverseGeocode(latitude, longitude);
            resolve(location);
          } catch (error) {
            console.error("❌ Reverse geocoding failed:", error);
            reject(error);
          }
        },
        (error) => {
          console.warn(
            "🚫 Geolocation permission denied or failed:",
            error.message
          );
          reject(error);
        },
        options
      );
    });
  }

  // Reverse geocode coordinates to country/region
  async reverseGeocode(latitude, longitude) {
    try {
      // Using a free geocoding service - replace with your preferred service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );

      if (!response.ok) throw new Error("Geocoding service unavailable");

      const data = await response.json();

      return {
        country: data.countryCode || this.locationSettings.defaultCountry,
        region: data.principalSubdivision || null,
        city: data.city || null,
        accuracy: "geolocation",
        coordinates: { latitude, longitude },
      };
    } catch (error) {
      console.error("❌ Reverse geocoding error:", error);
      throw error;
    }
  }

  // Get approximate location from IP address
  async getIPLocation() {
    try {
      // Using a free IP location service
      const response = await fetch("https://ipapi.co/json/");

      if (!response.ok) throw new Error("IP location service unavailable");

      const data = await response.json();

      return {
        country: data.country_code || this.locationSettings.defaultCountry,
        region: data.region_code || null,
        city: data.city || null,
        accuracy: "ip",
      };
    } catch (error) {
      console.error("❌ IP location error:", error);
      throw error;
    }
  }

  // Cache location in session storage
  cacheLocation(location) {
    try {
      const cacheData = {
        location,
        timestamp: Date.now(),
        expires: Date.now() + this.locationSettings.maxLocationAge,
      };

      sessionStorage.setItem("crisis-location", JSON.stringify(cacheData));
      console.log("💾 Location cached for session");
    } catch (error) {
      console.warn("⚠️ Failed to cache location:", error);
    }
  }

  // Get cached location if still valid
  getCachedLocation() {
    try {
      const cached = sessionStorage.getItem("crisis-location");
      if (!cached) return null;

      const cacheData = JSON.parse(cached);

      if (Date.now() > cacheData.expires) {
        sessionStorage.removeItem("crisis-location");
        return null;
      }

      return cacheData.location;
    } catch (error) {
      console.warn("⚠️ Error reading cached location:", error);
      sessionStorage.removeItem("crisis-location");
      return null;
    }
  }

  // Get immediate emergency resources
  getImmediateResources(location = {}) {
    const immediate = [...this.resources.immediate];

    // Add location-specific emergency numbers
    if (location.country) {
      const emergencyNumbers = {
        US: "911",
        CA: "911",
        UK: "999",
        AU: "000",
        DE: "112",
        FR: "112",
        ES: "112",
      };

      const localEmergency = emergencyNumbers[location.country];
      if (localEmergency && localEmergency !== "911") {
        immediate.unshift({
          id: `emergency_${location.country}`,
          name: "Emergency Services",
          description: "For immediate life-threatening emergencies",
          contact: localEmergency,
          type: "emergency",
          availability: "24/7",
          priority: 0,
        });
      }
    }

    return immediate;
  }

  // Get crisis hotlines for location and demographics
  getCrisisHotlines(location = {}, demographics = []) {
    let hotlines = [];

    // Add country-specific resources
    if (location.country && this.resources.country[location.country]) {
      hotlines = [...this.resources.country[location.country]];
    }

    // Add regional resources
    if (location.country && location.region) {
      const regionalKey = `${location.country}-${location.region}`;
      if (this.resources.regional[regionalKey]) {
        hotlines.push(...this.resources.regional[regionalKey]);
      }
    }

    // Filter by demographics if specified
    if (demographics.length > 0) {
      hotlines = hotlines.filter((resource) => {
        if (!resource.demographics) return true;
        return demographics.some((demo) =>
          resource.demographics.includes(demo)
        );
      });
    }

    return hotlines;
  }

  // Get local mental health resources (placeholder for future API integration)
  async getLocalResources(location = {}) {
    // TODO: Integrate with local resource APIs
    // - Psychology Today API
    // - SAMHSA Treatment Locator
    // - Local crisis center directories

    console.log("🏥 Local resource lookup not yet implemented");
    return [];
  }

  // Get specialized resources based on crisis type
  getSpecializedResources(crisisType = "general", location = {}) {
    if (crisisType === "general") {
      return this.resources.specialized.filter(
        (resource) =>
          !resource.countries || resource.countries.includes(location.country)
      );
    }

    return this.resources.specialized.filter(
      (resource) =>
        resource.category === crisisType &&
        (!resource.countries || resource.countries.includes(location.country))
    );
  }

  // Get online therapy and support resources
  getOnlineResources(location = {}) {
    return this.resources.online.filter(
      (resource) =>
        !resource.countries || resource.countries.includes(location.country)
    );
  }

  // Get self-care and coping resources
  getSelfCareResources() {
    return [...this.resources.selfCare];
  }

  // Sort resources by priority and relevance
  sortResourcesByPriority(resources) {
    return resources.sort((a, b) => {
      // Primary sort by priority (lower number = higher priority)
      if (a.priority !== b.priority) {
        return (a.priority || 999) - (b.priority || 999);
      }

      // Secondary sort by type (phone first, then text, then online)
      const typeOrder = { phone: 1, text: 2, online: 3, directory: 4 };
      return (typeOrder[a.type] || 999) - (typeOrder[b.type] || 999);
    });
  }

  // Clear cached location (privacy control)
  clearLocationCache() {
    try {
      sessionStorage.removeItem("crisis-location");
      console.log("🗑️ Location cache cleared");
    } catch (error) {
      console.warn("⚠️ Error clearing location cache:", error);
    }
  }

  // Format contact information for display
  formatContact(resource) {
    switch (resource.type) {
      case "phone":
        return {
          display: resource.contact,
          action: `tel:${resource.contact.replace(/\D/g, "")}`,
          actionText: "Call Now",
        };

      case "text":
        return {
          display: resource.contact,
          action: `sms:${resource.contact.match(/\d+/)?.[0] || ""}`,
          actionText: "Send Text",
        };

      case "website":
      case "directory":
      case "online_therapy":
        return {
          display: resource.website || "Visit Website",
          action: resource.website,
          actionText: "Visit Site",
        };

      default:
        return {
          display: resource.contact || "Contact",
          action: null,
          actionText: "More Info",
        };
    }
  }

  // Get crisis resources for specific demographics
  async getResourcesForDemographic(demographic, location = null) {
    const resources = await this.getCrisisResources({
      location,
      demographics: [demographic],
    });

    return resources;
  }

  // Emergency method - get basic crisis resources immediately
  getEmergencyResources(country = "US") {
    const emergency = this.getImmediateResources({ country });
    const crisis = this.getCrisisHotlines({ country });
    const selfCare = this.getSelfCareResources();

    return {
      emergency: emergency.slice(0, 2),
      crisis: crisis.slice(0, 3),
      selfCare: selfCare.slice(0, 2),
    };
  }
}

// Export singleton instance
export const crisisResourceService = new CrisisResourceService();
export default CrisisResourceService;
