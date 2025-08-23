// src/services/reflectionarian/voiceService.js
import { supabase } from "../../lib/supabase";

// Demo database configuration - replace with your production values when ready
const SUPABASE_URL = "https://nvcdlmfvnybsgzkpmdth.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52Y2RsbWZ2bnlic2d6a3BtZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NzQ4NzgsImV4cCI6MjA2NzI1MDg3OH0.a9TOIgvxjcfXKOOyzW44_Nf286amXXalcpyfZ-Ybh2I";

const API_BASE = "https://reflectionary-api.vercel.app/api";
const VERCEL_API_BASE = "https://reflectionary-api.vercel.app";

class VoiceService {
  constructor() {
    this.recognition = null;
    this.currentAudio = null;
    this.isPaused = false;
    this.apiBase = API_BASE;
    this.recognitionCallbacks = {
      onResult: null,
      onError: null,
      onEnd: null,
    };
    // Track cumulative transcript
    this.cumulativeFinalTranscript = "";

    // Handle tab visibility changes
    this.setupVisibilityHandlers();
  }

  /**
   * Check if voice recognition is supported
   */
  isVoiceSupported() {
    return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
  }

  /**
   * Get auth token for API calls
   */
  async getAuthToken() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");
      return session.access_token;
    } catch (error) {
      console.error("Failed to get auth token:", error);
      throw error;
    }
  }

  /**
   * Setup visibility change handlers
   */
  setupVisibilityHandlers() {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden && this.currentAudio) {
          console.log("Tab became visible, ensuring audio playback");
          // Reactivate audio context when tab becomes visible
          this.ensureAudioContext();

          // Force resume if audio is paused
          if (this.currentAudio.paused && !this.isPaused) {
            this.currentAudio.play().catch(console.error);
          }
        }
      });
    }
  }

  /**
   * Ensure audio context is active (for tab visibility issues)
   */
  async ensureAudioContext() {
    try {
      // Create a dummy audio element to wake up the audio context
      const audio = new Audio();
      audio.volume = 0;
      audio.currentTime = 0;

      // Play and immediately pause to activate audio context
      await audio.play();
      audio.pause();
      audio.remove();

      console.log("Audio context activated");
    } catch (error) {
      console.log("Audio context activation failed:", error);
      // This is expected in some browsers, not a critical error
    }
  }


  /**
   * Initialize speech recognition
   */
  initializeRecognition(callbacks = {}) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech recognition not supported");
      return null;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";

    // Store callbacks
    this.recognitionCallbacks = callbacks;

    // Set up event handlers
    this.recognition.onstart = () => {
      console.log("🎤 Speech recognition started");
      // Reset cumulative transcript when starting
      this.cumulativeFinalTranscript = "";
      if (callbacks.onStart) callbacks.onStart();
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = "";
      let newFinalTranscript = "";

      // Process results from the last result index
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          // Add to the new final transcript (without formatting)
          newFinalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      // Add new final transcript to cumulative
      if (newFinalTranscript) {
        this.cumulativeFinalTranscript += newFinalTranscript;
      }

      // Send the complete transcript (cumulative final + current interim)
      if (callbacks.onResult) {
        callbacks.onResult({
          final: this.cumulativeFinalTranscript,
          interim: interimTranscript,
          // For backward compatibility
          formattedFinal: this.cumulativeFinalTranscript,
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.error("🎤 Speech recognition error:", event.error);
      if (callbacks.onError) callbacks.onError(event);
    };

    this.recognition.onend = () => {
      console.log("🎤 Speech recognition ended");
      if (callbacks.onEnd) callbacks.onEnd();
    };

    return this.recognition;
  }

  /**
   * Start voice recording
   */
  async startRecording() {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      if (this.recognition) {
        this.recognition.start();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      throw new Error("Microphone access is required for voice recording");
    }
  }

  /**
   * Stop voice recording
   */
  stopRecording() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }




  /**
   * Load user voice preferences
   */
  async loadVoicePreferences(userId) {
    try {
      const response = await fetch(
        `${VERCEL_API_BASE}/api/reflectionarian/preferences?user_id=${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          return {
            voice: data.preferences.ttsVoice || "nova",
            rate: data.preferences.speechRate || 1.0,
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

  /**
   * Text-to-Speech using API endpoint with user preferences
   */
  async speakText(text, voice = null, userId, rate = null) {
    try {
      console.log("🎤 voiceService.speakText called with:", {
        text,
        voice,
        userId,
        rate,
      });

      // Stop any current audio
      this.stopSpeaking();

      // Load user preferences if not provided
      let finalVoice = voice;
      let finalRate = rate;

      if (!voice || !rate) {
        console.log("🎤 Loading preferences because voice or rate is missing");
        if (userId) {
          const preferences = await this.loadVoicePreferences(userId);
          console.log("🎤 Loaded preferences:", preferences);
          finalVoice = voice || preferences.voice;
          finalRate = rate || preferences.rate;
        } else {
          // Use defaults when no userId (for privacy)
          finalVoice = voice || "nova";
          finalRate = rate || 1.0;
          console.log("🎤 Using default preferences for privacy");
        }
      }

      console.log("🎤 Final voice settings:", { finalVoice, finalRate });

      const requestBody = {
        text,
        voice: finalVoice,
        model: "tts-1",
        speed: finalRate,
      };

      const authToken = await this.getAuthToken();
      console.log("🌐 Calling TTS API endpoint:", `${API_BASE}/tts/generate`);
      console.log("📤 Request body:", requestBody);

      const response = await fetch(`${API_BASE}/tts/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Response status:", response.status, response.statusText);
      console.log("📥 Response headers:", {
        contentType: response.headers.get("content-type"),
        contentLength: response.headers.get("content-length"),
      });

      if (!response.ok) {
        console.error("🚫 API Error - Response not OK:", response.status);
        try {
          const errorText = await response.text();
          console.error("🚫 Error response body:", errorText);
          const error = JSON.parse(errorText);
          throw new Error(error.error || "TTS generation failed");
        } catch (parseError) {
          console.error("🚫 Failed to parse error response:", parseError);
          throw new Error(
            `TTS API error: ${response.status} ${response.statusText}`
          );
        }
      }

      const audioBlob = await response.blob();
      console.log("🎧 Audio blob created:", {
        size: audioBlob.size,
        type: audioBlob.type,
      });

      const audioUrl = URL.createObjectURL(audioBlob);
      console.log("🎵 Audio URL created:", audioUrl);

      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = 0.8;

      console.log("🔊 Audio element created, attempting to play...");

      // Set up audio event handlers for debugging
      this.currentAudio.onended = () => {
        console.log("🎧 Audio playback ended");
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        this.isPaused = false;
      };

      this.currentAudio.onerror = (error) => {
        console.error("🚫 Audio playback error:", error);
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
      };

      this.currentAudio.oncanplay = () => {
        console.log("🎧 Audio can play - ready for playback");
      };

      this.currentAudio.onplay = () => {
        console.log("🎧 Audio playback started!");
      };

      console.log("🎵 Attempting to play audio...");
      try {
        await this.currentAudio.play();
        console.log("✅ Audio play() completed successfully");
        return this.currentAudio;
      } catch (playError) {
        console.error("🚫 Audio play() failed:", playError);
        throw playError;
      }
    } catch (error) {
      console.error("TTS failed:", error);
      // Fallback to browser TTS
      this.fallbackToBrowserTTS(text);
      throw error;
    }
  }

  /**
   * Browser TTS fallback
   */
  fallbackToBrowserTTS(text) {
    console.log("🔄 Falling back to browser TTS...");

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      // Try to use a better voice if available
      const voices = speechSynthesis.getVoices();
      const preferredVoices = voices.filter(
        (voice) =>
          voice.name.includes("Google") ||
          voice.name.includes("Microsoft") ||
          voice.name.includes("Alex") ||
          voice.name.includes("Samantha")
      );

      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
        console.log("🎭 Using enhanced browser voice:", utterance.voice.name);
      }

      window.speechSynthesis.speak(utterance);
      return true;
    } else {
      console.error("❌ No speech synthesis available");
      return false;
    }
  }

  /**
   * Pause current speech
   */
  pauseSpeaking() {
    if (this.currentAudio && !this.isPaused) {
      this.currentAudio.pause();
      this.isPaused = true;
      return true;
    }
    return false;
  }

  /**
   * Resume paused speech
   */
  resumeSpeaking() {
    if (this.currentAudio && this.isPaused) {
      this.currentAudio.play();
      this.isPaused = false;
      return true;
    }
    return false;
  }


  /**
   * Stop all speech
   */
  stopSpeaking() {
    // Stop OpenAI TTS
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // Stop browser TTS
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    this.isPaused = false;
  }


  /**
   * Check if currently speaking
   */
  isSpeaking() {
    return (
      (this.currentAudio && !this.currentAudio.paused) ||
      (window.speechSynthesis && window.speechSynthesis.speaking)
    );
  }

  /**
   * Get available voices
   */
  getAvailableVoices() {
    return [
      { id: "alloy", name: "Alloy", description: "Neutral and balanced" },
      { id: "echo", name: "Echo", description: "Male, conversational" },
      { id: "fable", name: "Fable", description: "British, expressive" },
      { id: "onyx", name: "Onyx", description: "Deep and authoritative" },
      { id: "nova", name: "Nova", description: "Warm and friendly" },
      { id: "shimmer", name: "Shimmer", description: "Soft and gentle" },
    ];
  }

  /**
   * Format recording time
   */
  formatRecordingTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
}

// Export singleton instance
export default new VoiceService();
