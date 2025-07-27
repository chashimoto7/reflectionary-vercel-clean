// frontend/src/services/pollyTTSService.js
// Frontend service for Amazon Polly TTS

class PollyTTSService {
  constructor() {
    this.apiBase =
      import.meta.env.VITE_API_URL || "https://reflectionary-api.vercel.app";
    this.audioCache = new Map();
    this.currentAudio = null;
    this.isPlaying = false;

    // Default voice settings for therapy
    this.defaultSettings = {
      voice: "ruth", // Calm and reassuring
      engine: "neural", // Higher quality
      ssmlStyle: "calm",
      outputFormat: "mp3",
      sampleRate: "22050",
    };
  }

  /**
   * Get available voices and options from the backend
   */
  async getVoiceOptions() {
    try {
      const response = await fetch(`${this.apiBase}/api/tts/polly`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get voice options");
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting voice options:", error);
      return null;
    }
  }

  /**
   * Generate audio from text using Amazon Polly
   * @param {string} text - Text to convert to speech
   * @param {Object} options - Voice and synthesis options
   * @returns {Promise<string>} Audio blob URL
   */
  async generateAudio(text, options = {}) {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(text, options);
      if (this.audioCache.has(cacheKey)) {
        console.log("🎵 Using cached audio");
        return this.audioCache.get(cacheKey);
      }

      const settings = { ...this.defaultSettings, ...options };

      console.log("🎵 Generating audio with Polly:", settings);

      const response = await fetch(`${this.apiBase}/api/tts/polly`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          text,
          ...settings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate audio");
      }

      // Get cost information from headers
      const costEstimate = response.headers.get("X-Cost-Estimate");
      const characterCount = response.headers.get("X-Character-Count");

      if (costEstimate) {
        console.log(
          `💰 Audio generation cost: $${costEstimate} (${characterCount} characters)`
        );
      }

      // Convert response to blob and create URL
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache the audio URL
      this.audioCache.set(cacheKey, audioUrl);

      return audioUrl;
    } catch (error) {
      console.error("Error generating audio:", error);
      throw error;
    }
  }

  /**
   * Generate therapy-optimized audio
   * @param {string} text - Therapeutic response text
   * @param {Object} options - Override options
   * @returns {Promise<string>} Audio blob URL
   */
  async generateTherapyAudio(text, options = {}) {
    return this.generateAudio(text, {
      ...options,
      isTherapy: true, // This triggers therapy optimization on backend
      voice: options.voice || "ruth",
      engine: "neural",
      ssmlStyle: options.ssmlStyle || "calm",
    });
  }

  /**
   * Play audio from URL
   * @param {string} audioUrl - Audio blob URL
   * @param {Function} onEnd - Callback when audio ends
   * @returns {Promise} Resolves when audio starts playing
   */
  async playAudio(audioUrl, onEnd = null) {
    try {
      // Stop any currently playing audio
      this.stopAudio();

      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = 0.8;

      return new Promise((resolve, reject) => {
        this.currentAudio.oncanplaythrough = () => {
          this.currentAudio
            .play()
            .then(() => {
              this.isPlaying = true;
              console.log("🎵 Audio playing");
              resolve();
            })
            .catch(reject);
        };

        this.currentAudio.onended = () => {
          this.isPlaying = false;
          console.log("🎵 Audio ended");
          if (onEnd) onEnd();
        };

        this.currentAudio.onerror = (error) => {
          this.isPlaying = false;
          console.error("🎵 Audio error:", error);
          reject(error);
        };

        this.currentAudio.load();
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      throw error;
    }
  }

  /**
   * Stop currently playing audio
   */
  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.isPlaying = false;
      console.log("🎵 Audio stopped");
    }
  }

  /**
   * Speak text immediately (generate + play)
   * @param {string} text - Text to speak
   * @param {Object} options - Voice options
   * @param {Function} onEnd - Callback when speech ends
   * @returns {Promise} Resolves when speech starts
   */
  async speak(text, options = {}, onEnd = null) {
    try {
      const audioUrl = await this.generateAudio(text, options);
      await this.playAudio(audioUrl, onEnd);
    } catch (error) {
      console.error("Error speaking text:", error);
      throw error;
    }
  }

  /**
   * Speak with therapy optimization
   * @param {string} text - Therapeutic text
   * @param {Object} options - Override options
   * @param {Function} onEnd - Callback when speech ends
   * @returns {Promise} Resolves when speech starts
   */
  async speakTherapy(text, options = {}, onEnd = null) {
    try {
      const audioUrl = await this.generateTherapyAudio(text, options);
      await this.playAudio(audioUrl, onEnd);
    } catch (error) {
      console.error("Error speaking therapy text:", error);
      throw error;
    }
  }

  /**
   * Preload common therapeutic responses
   * @param {Array} phrases - Array of common phrases to preload
   */
  async preloadCommonPhrases(phrases = []) {
    const defaultPhrases = [
      "I understand. Let me give that some thought...",
      "That sounds challenging. I'm processing what you've shared...",
      "I hear you. Give me a moment to consider this...",
      "Thank you for sharing that with me.",
      "I can sense the importance of what you're telling me...",
      "That's really meaningful. I'm thinking about how to respond...",
    ];

    const allPhrases = [...defaultPhrases, ...phrases];

    console.log("🎵 Preloading common therapeutic phrases...");

    for (const phrase of allPhrases) {
      try {
        await this.generateTherapyAudio(phrase);
      } catch (error) {
        console.error("Error preloading phrase:", phrase, error);
      }
    }

    console.log(`✅ Preloaded ${this.audioCache.size} audio responses`);
  }

  /**
   * Generate cache key for audio caching
   */
  getCacheKey(text, options) {
    const key = JSON.stringify({ text, ...options });
    return btoa(key); // Base64 encode for cache key
  }

  /**
   * Clear audio cache
   */
  clearCache() {
    // Revoke all blob URLs to free memory
    for (const audioUrl of this.audioCache.values()) {
      URL.revokeObjectURL(audioUrl);
    }
    this.audioCache.clear();
    console.log("🎵 Audio cache cleared");
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.audioCache.size,
      isPlaying: this.isPlaying,
      currentAudio: !!this.currentAudio,
    };
  }
}

export default new PollyTTSService();
