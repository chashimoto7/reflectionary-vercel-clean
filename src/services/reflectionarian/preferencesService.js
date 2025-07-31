// src/services/reflectionarian/preferencesService.js

const API_BASE = "https://reflectionary-api.vercel.app";

class PreferencesService {
  constructor() {
    this.apiBase = API_BASE;
    this.defaultPreferences = {
      tier: "premium",
      therapy_approach: "Integrative",
      communication_style: "Warm and Insightful",
      primary_focus: "Holistic Growth",
      session_structure: "Structured",
      voice_enabled: true,
      weekly_reports: true,
      enableSpeech: false,
      ttsVoice: "nova",
      ttsEngine: "openai",
      ttsStyle: "calm",
    };
  }

  /**
   * Get default preferences
   */
  getDefaultPreferences() {
    return { ...this.defaultPreferences };
  }

  /**
   * Load user preferences
   */
  async loadPreferences(userId) {
    try {
      const response = await fetch(
        `${this.apiBase}/api/reflectionarian/preferences?user_id=${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.preferences && data.preferences.onboarding_completed) {
          return {
            preferences: { ...this.defaultPreferences, ...data.preferences },
            isNewUser: false,
          };
        }
      }

      // No preferences found or onboarding not completed
      return {
        preferences: this.defaultPreferences,
        isNewUser: true,
      };
    } catch (error) {
      console.error("Error loading preferences:", error);
      return {
        preferences: this.defaultPreferences,
        isNewUser: true,
      };
    }
  }

  /**
   * Save user preferences
   */
  async savePreferences(userId, preferences) {
    try {
      const response = await fetch(
        `${this.apiBase}/api/reflectionarian/preferences`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            preferences,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      return true;
    } catch (error) {
      console.error("Error saving preferences:", error);
      return false;
    }
  }

  /**
   * Update specific preference
   */
  async updatePreference(userId, key, value) {
    try {
      // First load current preferences
      const { preferences } = await this.loadPreferences(userId);

      // Update the specific preference
      const updatedPreferences = {
        ...preferences,
        [key]: value,
      };

      // Save back
      return this.savePreferences(userId, updatedPreferences);
    } catch (error) {
      console.error("Error updating preference:", error);
      return false;
    }
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(userId, onboardingPreferences) {
    const updatedPreferences = {
      ...this.defaultPreferences,
      ...onboardingPreferences,
      onboarding_completed: true,
    };

    return this.savePreferences(userId, updatedPreferences);
  }

  /**
   * Skip onboarding
   */
  async skipOnboarding(userId) {
    const updatedPreferences = {
      ...this.defaultPreferences,
      onboarding_completed: true,
    };

    return this.savePreferences(userId, updatedPreferences);
  }

  /**
   * Get therapy approaches
   */
  getTherapyApproaches() {
    return [
      {
        id: "cbt",
        name: "Cognitive Behavioral",
        description: "Focus on thoughts and behaviors",
      },
      {
        id: "mindfulness",
        name: "Mindfulness-Based",
        description: "Present-moment awareness",
      },
      {
        id: "psychodynamic",
        name: "Psychodynamic",
        description: "Explore unconscious patterns",
      },
      {
        id: "humanistic",
        name: "Humanistic",
        description: "Personal growth and self-actualization",
      },
      {
        id: "integrative",
        name: "Integrative",
        description: "Combination of approaches",
      },
    ];
  }

  /**
   * Get communication styles
   */
  getCommunicationStyles() {
    return [
      {
        id: "warm",
        name: "Warm and Insightful",
        description: "Empathetic and understanding",
      },
      {
        id: "direct",
        name: "Direct and Practical",
        description: "Clear and solution-focused",
      },
      {
        id: "gentle",
        name: "Gentle and Supportive",
        description: "Soft and encouraging",
      },
      {
        id: "analytical",
        name: "Analytical and Thoughtful",
        description: "Deep and reflective",
      },
      {
        id: "motivational",
        name: "Motivational and Energetic",
        description: "Inspiring and uplifting",
      },
    ];
  }

  /**
   * Get focus areas
   */
  getFocusAreas() {
    return [
      { id: "anxiety", name: "Anxiety Management", icon: "🌊" },
      { id: "depression", name: "Mood Improvement", icon: "☀️" },
      { id: "relationships", name: "Relationship Issues", icon: "💝" },
      { id: "self-esteem", name: "Self-Esteem Building", icon: "💪" },
      { id: "stress", name: "Stress Management", icon: "🧘" },
      { id: "trauma", name: "Trauma Processing", icon: "🌱" },
      { id: "growth", name: "Personal Growth", icon: "🌟" },
      { id: "holistic", name: "Holistic Wellness", icon: "🎯" },
    ];
  }
}

// Export singleton instance
export default new PreferencesService();
