// frontend/ src/services/ReflectionarianAudioService.js
import { supabase } from "../lib/supabase";

class ReflectionarianAudioService {
  constructor() {
    // Audio state
    this.currentAudio = null;
    this.isPlaying = false;

    // Voice settings
    this.defaultVoice = "EXAVITQu4vr4xnSDxMaL"; // Bella (Eleven Labs)
    this.playbackRate = 1.0;
    this.volume = 1.0;

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
            voice: data.preferences.ttsVoice || "EXAVITQu4vr4xnSDxMaL", // Bella (Eleven Labs)
            rate: data.preferences.speechRate || 1.0
          };
        }
      }
      
      // Fallback to defaults
      return { voice: "EXAVITQu4vr4xnSDxMaL", rate: 1.0 }; // Bella (Eleven Labs)
    } catch (error) {
      console.error("Failed to load voice preferences:", error);
      return { voice: "EXAVITQu4vr4xnSDxMaL", rate: 1.0 }; // Bella (Eleven Labs)
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

      // Call Supabase edge function directly
      console.log("📢 TTS: Calling Supabase edge function directly");
      const response = await fetch(
        "https://nvcdlmfvnybsgzkpmdth.supabase.co/functions/v1/generate-audio",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            text,
            voice: finalVoice,
            model: "tts-1",
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
   * Get audio playback status
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      hasAudio: !!this.currentAudio,
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
