// frontend/ src/services/ReflectionarianAudioService.js
import { supabase } from "../lib/supabase";

class ReflectionarianAudioService {
  constructor() {
    // Audio state
    this.audioCache = new Map();
    this.currentAudio = null;
    this.audioQueue = [];
    this.isPlaying = false;

    // Voice settings
    this.defaultVoice = "nova";
    this.playbackRate = 1.0;
    this.volume = 1.0;

    // Pre-generated responses for instant playback
    this.transitionalResponses = {
      understanding: [
        "I hear you...",
        "That's really insightful...",
        "Let me think about that for a moment...",
        "I'm listening...",
        "I understand...",
        "That makes sense...",
        "I see what you mean...",
      ],
      empathy: [
        "That sounds challenging...",
        "I can understand why that would be difficult...",
        "Thank you for sharing that with me...",
        "That takes courage to express...",
        "I appreciate you opening up about this...",
        "That must be hard for you...",
        "I can hear the emotion in what you're sharing...",
      ],
      reflection: [
        "Hmm, interesting perspective...",
        "Let me reflect on what you've shared...",
        "I'm considering what you've said...",
        "That's a profound observation...",
        "There's a lot to unpack there...",
        "What you're describing is significant...",
      ],
      encouragement: [
        "You're doing important work here...",
        "That's a valuable insight...",
        "You're making progress...",
        "That's an important thought to explore...",
        "You're on the right track...",
      ],
    };

    // Speech recognition setup (if supported)
    this.recognition = null;
    this.initializeSpeechRecognition();
  }

  // =============================================
  // INITIALIZATION
  // =============================================

  /**
   * Initialize speech recognition if available
   */
  initializeSpeechRecognition() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";
    }
  }

  /**
   * Set user's voice preferences
   */
  setVoicePreferences(voice, rate = 1.0, volume = 1.0) {
    this.defaultVoice = voice;
    this.playbackRate = rate;
    this.volume = volume;
  }

  /**
   * Load user voice preferences from API
   */
  async loadVoicePreferences(userId) {
    try {
      const response = await fetch(
        `https://reflectionary-api.vercel.app/api/reflectionarian/preferences?user_id=${userId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          return {
            voice: data.preferences.ttsVoice || "nova",
            rate: data.preferences.speechRate || 1.0
          };
        }
      }
      
      // Fallback to defaults
      return { voice: "nova", rate: 1.0 };
    } catch (error) {
      console.error("Failed to load voice preferences:", error);
      return { voice: "nova", rate: 1.0 };
    }
  }

  // =============================================
  // PRE-GENERATED RESPONSES
  // =============================================

  /**
   * Get a random transitional response
   */
  getRandomTransitionalResponse(category = null) {
    let responses;

    if (category && this.transitionalResponses[category]) {
      responses = this.transitionalResponses[category];
    } else {
      // Get from all categories
      responses = Object.values(this.transitionalResponses).flat();
    }

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Pre-load common responses as audio
   */
  async preloadCommonResponses(userId = null) {
    const commonPhrases = [
      "I hear you...",
      "Tell me more about that...",
      "That sounds challenging...",
      "Thank you for sharing that with me...",
      "Let me think about that for a moment...",
    ];

    for (const phrase of commonPhrases) {
      try {
        const audioUrl = await this.generateAudioFromText(
          phrase,
          this.defaultVoice,
          userId
        );
        if (audioUrl) {
          this.audioCache.set(phrase, audioUrl);
        }
      } catch (error) {
        console.error("Error preloading phrase:", phrase, error);
      }
    }

    console.log("✅ Preloaded", this.audioCache.size, "common responses");
  }

  /**
   * Play a transitional response immediately
   */
  async playTransitionalResponse(category = null, userId = null) {
    const response = this.getRandomTransitionalResponse(category);

    // Check if we have it cached
    if (this.audioCache.has(response)) {
      await this.playAudio(this.audioCache.get(response));
      return response;
    }

    // Otherwise, generate and play
    try {
      const audioUrl = await this.generateAudioFromText(
        response,
        this.defaultVoice,
        userId
      );
      if (audioUrl) {
        this.audioCache.set(response, audioUrl);
        await this.playAudio(audioUrl);
      }
      return response;
    } catch (error) {
      console.error("Error playing transitional response:", error);
      return null;
    }
  }

  // =============================================
  // TEXT-TO-SPEECH
  // =============================================

  /**
   * Generate audio from text using OpenAI TTS
   */
  async generateAudioFromText(text, voice = null, userId = null) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      // Load user preferences if userId provided
      let finalVoice = voice || this.defaultVoice;
      let finalRate = this.playbackRate;
      
      if (userId) {
        try {
          const preferences = await this.loadVoicePreferences(userId);
          finalVoice = voice || preferences.voice;
          finalRate = preferences.rate;
        } catch (error) {
          console.error("Failed to load voice preferences, using defaults:", error);
        }
      }

      // Use your API endpoint which properly handles authentication
      const response = await fetch(
        "https://reflectionary-api.vercel.app/api/tts/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            text,
            voice: finalVoice,
            model: "tts-1", // Use standard model for lower latency
            userId: userId, // Pass userId so backend can load preferences
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate audio");
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error("Error generating audio:", error);
      return null;
    }
  }

  /**
   * Stream audio response sentence by sentence
   */
  async streamAudioResponse(text, voice = null, userId = null) {
    // Split text into sentences
    const sentences = this.splitIntoSentences(text);
    const audioUrls = [];

    // Generate audio for each sentence
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;

      try {
        const audioUrl = await this.generateAudioFromText(sentence, voice, userId);
        if (audioUrl) {
          audioUrls.push(audioUrl);

          // Start playing first sentence immediately
          if (i === 0) {
            this.playAudio(audioUrl);
          } else {
            // Queue subsequent sentences
            this.audioQueue.push(audioUrl);
          }
        }
      } catch (error) {
        console.error("Error generating sentence audio:", error);
      }
    }

    return audioUrls;
  }

  /**
   * Split text into sentences for streaming
   */
  splitIntoSentences(text) {
    // Simple sentence splitting - can be improved with better NLP
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences.map((s) => s.trim());
  }

  // =============================================
  // AUDIO PLAYBACK
  // =============================================

  /**
   * Play audio from URL
   */
  async playAudio(audioUrl) {
    return new Promise((resolve, reject) => {
      try {
        // Stop current audio if playing
        if (this.currentAudio) {
          this.currentAudio.pause();
          this.currentAudio = null;
        }

        const audio = new Audio(audioUrl);
        audio.volume = this.volume;
        audio.playbackRate = this.playbackRate;

        audio.onended = () => {
          this.isPlaying = false;
          this.currentAudio = null;

          // Check if there are queued audio files
          if (this.audioQueue.length > 0) {
            const nextAudio = this.audioQueue.shift();
            this.playAudio(nextAudio);
          }

          resolve();
        };

        audio.onerror = (error) => {
          this.isPlaying = false;
          this.currentAudio = null;
          reject(error);
        };

        this.currentAudio = audio;
        this.isPlaying = true;
        audio.play();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop current audio playback
   */
  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
      this.isPlaying = false;
    }

    // Clear audio queue
    this.audioQueue = [];
  }

  /**
   * Pause/Resume audio
   */
  togglePlayback() {
    if (this.currentAudio) {
      if (this.isPlaying) {
        this.currentAudio.pause();
        this.isPlaying = false;
      } else {
        this.currentAudio.play();
        this.isPlaying = true;
      }
    }
  }

  // =============================================
  // SPEECH-TO-TEXT
  // =============================================

  /**
   * Start listening for speech input
   */
  startListening(onResult, onError) {
    if (!this.recognition) {
      onError("Speech recognition not supported in this browser");
      return;
    }

    let finalTranscript = "";
    let interimTranscript = "";

    this.recognition.onresult = (event) => {
      interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
          onResult({
            transcript: finalTranscript.trim(),
            isFinal: true,
          });
        } else {
          interimTranscript += transcript;
          onResult({
            transcript: interimTranscript,
            isFinal: false,
          });
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      onError(event.error);
    };

    this.recognition.onend = () => {
      // Auto-restart if needed
      if (this.isListening) {
        this.recognition.start();
      }
    };

    this.isListening = true;
    this.recognition.start();
  }

  /**
   * Stop listening for speech
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  /**
   * Clear audio cache
   */
  clearCache() {
    // Revoke all cached URLs to free memory
    this.audioCache.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    this.audioCache.clear();
    this.audioQueue = [];
  }

  /**
   * Get audio playback status
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      hasAudio: !!this.currentAudio,
      queueLength: this.audioQueue.length,
      cacheSize: this.audioCache.size,
      isListening: this.isListening,
    };
  }

  /**
   * Analyze text to determine appropriate transitional response category
   */
  analyzeResponseCategory(userMessage) {
    const lower = userMessage.toLowerCase();

    // Check for emotional content
    if (
      lower.includes("feel") ||
      lower.includes("hurt") ||
      lower.includes("sad") ||
      lower.includes("angry") ||
      lower.includes("scared") ||
      lower.includes("worried")
    ) {
      return "empathy";
    }

    // Check for insights or realizations
    if (
      lower.includes("realize") ||
      lower.includes("understand") ||
      lower.includes("think") ||
      lower.includes("believe") ||
      lower.includes("notice")
    ) {
      return "reflection";
    }

    // Check for progress or achievements
    if (
      lower.includes("better") ||
      lower.includes("improve") ||
      lower.includes("progress") ||
      lower.includes("success") ||
      lower.includes("accomplish")
    ) {
      return "encouragement";
    }

    // Default to understanding
    return "understanding";
  }
}

// Export singleton instance
export default new ReflectionarianAudioService();
