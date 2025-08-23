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
    this.isStreaming = false;
    this.audioQueue = [];
    this.apiBase = API_BASE;
    this.recognitionCallbacks = {
      onResult: null,
      onError: null,
      onEnd: null,
    };
    // Track cumulative transcript
    this.cumulativeFinalTranscript = "";
    // Store the full text and position for resume capability
    this.currentFullText = "";
    this.currentVoice = "nova";
    this.currentUserId = null;
    this.currentRate = 1.0;
    this.pausedAtSentence = 0;
    this.sentencesForResume = [];

    // Add audio caching and preloading
    this.audioCache = new Map();
    this.commonPhrases = [
      "I understand.",
      "Tell me more about that.",
      "That's interesting.",
      "How did that make you feel?",
      "What do you think about that?",
      "That sounds challenging.",
      "You're making progress.",
      "Let's explore that further.",
      "I hear you.",
      "That makes sense.",
    ];

    // Preload common phrases
    this.preloadCommonPhrases();

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
   * Preload common phrases for instant playback
   */
  async preloadCommonPhrases(userId = null) {
    if (!userId) {
      console.log("🎤 Skipping preload - no userId for privacy");
      return;
    }

    console.log("🎤 Preloading common phrases for instant TTS...");
    let preloadedCount = 0;

    for (const phrase of this.commonPhrases) {
      try {
        const cacheKey = `${phrase}_${userId}`;

        // Skip if already cached
        if (this.audioCache.has(cacheKey)) continue;

        const preferences = await this.loadVoicePreferences(userId);
        const requestBody = {
          text: phrase,
          voice: preferences.voice,
          model: "tts-1",
          speed: preferences.rate,
        };

        const authToken = await this.getAuthToken();
        const response = await fetch(`${API_BASE}/tts/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          this.audioCache.set(cacheKey, audioBlob);
          preloadedCount++;
        }
      } catch (error) {
        console.error(`Failed to preload phrase: "${phrase}"`, error);
      }
    }

    console.log(`✅ Preloaded ${preloadedCount} common phrases`);
  }

  /**
   * Play a cached phrase if available, otherwise generate
   */
  async playInstantPhrase(phrase, userId) {
    if (!userId) {
      // Fallback to regular generation for privacy
      return this.speakText(phrase, null, null);
    }

    const cacheKey = `${phrase}_${userId}`;

    if (this.audioCache.has(cacheKey)) {
      console.log("🚀 Playing cached phrase instantly");
      const audioBlob = this.audioCache.get(cacheKey);
      const audioUrl = URL.createObjectURL(audioBlob);

      try {
        await this.playAudioSegment(audioUrl);
        URL.revokeObjectURL(audioUrl);
        return true;
      } catch (error) {
        console.error("Error playing cached phrase:", error);
      }
    }

    // Fallback to regular generation
    return this.speakText(phrase, null, userId);
  }

  /**
   * Smart caching for frequently used sentences
   */
  async cacheFrequentSentences(sentences, userId) {
    if (!userId) {
      console.log("🎤 Skipping cache - no userId for privacy");
      return;
    }

    for (const sentence of sentences) {
      const cacheKey = `${sentence}_${userId}`;

      if (!this.audioCache.has(cacheKey)) {
        try {
          const preferences = await this.loadVoicePreferences(userId);
          const requestBody = {
            text: sentence,
            voice: preferences.voice,
            model: "tts-1",
            speed: preferences.rate,
          };

          const authToken = await this.getAuthToken();
          const response = await fetch(`${API_BASE}/tts/generate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            const audioBlob = await response.blob();
            this.audioCache.set(cacheKey, audioBlob);
          }
        } catch (error) {
          console.error("Error caching sentence:", error);
        }
      }
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
   * Split text into sentences for streaming
   */
  splitIntoSentences(text) {
    // Improved sentence splitting with better punctuation handling
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    // Further split very long sentences at natural breaks
    const processedSentences = [];
    sentences.forEach((sentence) => {
      if (sentence.length > 150) {
        // Split at commas or semicolons for long sentences
        const parts = sentence.split(/[,;]\s+/);
        if (parts.length > 1) {
          parts.forEach((part, index) => {
            if (index < parts.length - 1) {
              processedSentences.push(part + ",");
            } else {
              processedSentences.push(part);
            }
          });
        } else {
          processedSentences.push(sentence);
        }
      } else {
        processedSentences.push(sentence);
      }
    });

    return processedSentences;
  }

  /**
   * Play a single audio segment
   */
  async playAudioSegment(audioUrl) {
    return new Promise((resolve, reject) => {
      console.log("[TTS Debug] 1. playAudioSegment called with URL:", audioUrl);
      const audio = new Audio(audioUrl);
      audio.volume = 0.8;

      console.log("[TTS Debug] 2. Audio element created:", audio);

      // Set up event handlers first
      audio.onended = () => {
        console.log(
          "[TTS Debug] 9. Audio segment finished playing (onended event)."
        );
        this.currentAudio = null;
        resolve();
      };

      audio.onerror = (error) => {
        console.error(
          "[TTS Debug] 10. Audio playback error (onerror event):",
          error
        );
        this.currentAudio = null;
        resolve(); // Resolve instead of reject to continue with next segment
      };

      audio.oncanplaythrough = async () => {
        console.log(
          "[TTS Debug] 5. Audio can play through (oncanplaythrough event). Ready to play."
        );
        try {
          console.log("[TTS Debug] 6. Calling audio.play()");
          await audio.play();
          console.log(
            "[TTS Debug] 7. Audio playback started successfully (play() promise resolved)."
          );
        } catch (playError) {
          console.error("[TTS Debug] 8. audio.play() was rejected:", playError);
          this.currentAudio = null;
          resolve();
        }
      };

      audio.onstalled = () => {
        console.warn("[TTS Debug] Audio stalled (onstalled event).");
      };

      audio.onsuspend = () => {
        console.warn("[TTS Debug] Audio suspended (onsuspend event).");
      };

      // For streaming, ensure we can interrupt
      this.currentAudio = audio;

      // Start loading the audio
      console.log("[TTS Debug] 3. Calling audio.load().");
      audio.load();
      console.log(
        "[TTS Debug] 4. audio.load() called. Current readyState:",
        audio.readyState
      );

      // Timeout fallback in case audio doesn't load
      setTimeout(() => {
        if (audio.readyState < 2) {
          // HAVE_CURRENT_DATA
          console.warn(
            `[TTS Debug] 11. Audio loading timeout. readyState is ${audio.readyState}. Skipping segment.`
          );
          this.currentAudio = null;
          resolve();
        }
      }, 10000); // 10 second timeout
    });
  }

  /**
   * Stream TTS by splitting text into sentences
   */
  async streamTTS(
    text,
    voice = null,
    userId,
    startFromSentence = 0,
    rate = null
  ) {
    try {
      console.log("🎤 streamTTS called with:", { voice, rate, userId });

      // Ensure audio context is active before playing
      await this.ensureAudioContext();

      // Load user preferences if not provided
      let finalVoice = voice;
      let finalRate = rate;

      if (!voice || !rate) {
        console.log(
          "🎤 streamTTS Loading preferences because voice or rate is missing"
        );
        if (userId) {
          const preferences = await this.loadVoicePreferences(userId);
          console.log("🎤 streamTTS Loaded preferences:", preferences);
          finalVoice = voice || preferences.voice;
          finalRate = rate || preferences.rate;
        } else {
          // Use defaults when no userId (for privacy)
          finalVoice = voice || "nova";
          finalRate = rate || 1.0;
          console.log("🎤 streamTTS Using default preferences for privacy");
        }
      }

      console.log("🎤 streamTTS Final voice settings:", {
        finalVoice,
        finalRate,
      });

      // Store for resume capability
      this.currentFullText = text;
      this.currentVoice = finalVoice;
      this.currentUserId = userId;
      this.currentRate = finalRate;

      // Stop any current speech but don't reset if resuming
      if (startFromSentence === 0) {
        this.stopSpeaking();
      }

      // Split text into sentences for streaming
      const sentences = this.splitIntoSentences(text);
      this.sentencesForResume = sentences;
      this.audioQueue = [];
      this.isStreaming = true;

      console.log(
        `🎤 Streaming ${sentences.length} sentences from sentence ${startFromSentence}...`
      );

      // Generate and play sentences sequentially for more reliability
      const sentencesToPlay = sentences.slice(startFromSentence);

      for (let i = 0; i < sentencesToPlay.length && this.isStreaming; i++) {
        const sentence = sentencesToPlay[i].trim();
        if (!sentence) continue;

        try {
          this.pausedAtSentence = startFromSentence + i;

          console.log(
            `🎵 Generating sentence ${i + 1}/${
              sentencesToPlay.length
            }: "${sentence.substring(0, 50)}..."`
          );

          const requestBody = {
            text: sentence,
            voice: finalVoice,
            model: "tts-1",
            speed: finalRate,
          };

          const authToken = await this.getAuthToken();
          const response = await fetch(`${API_BASE}/tts/generate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            console.error(
              "🚫 Streaming TTS API Error:",
              response.status,
              response.statusText
            );
            throw new Error(`TTS generation failed: ${response.status}`);
          }

          const audioBlob = await response.blob();
          console.log("🎧 Audio blob generated:", {
            size: audioBlob.size,
            type: audioBlob.type,
          });

          const audioUrl = URL.createObjectURL(audioBlob);
          console.log(
            `🔊 Playing sentence ${i + 1}: "${sentence.substring(0, 30)}..."`
          );

          // Play this sentence
          if (this.isStreaming) {
            await this.playAudioSegment(audioUrl);
          }

          // Clean up URL
          URL.revokeObjectURL(audioUrl);
        } catch (error) {
          console.error(`Failed to generate/play sentence ${i}:`, error);
          // Continue with next sentence instead of failing completely
          continue;
        }
      }

      console.log("✅ Streaming TTS completed");

      this.isStreaming = false;
      this.pausedAtSentence = 0; // Reset when complete
      return true;
    } catch (error) {
      console.error("TTS streaming failed:", error);
      // Fallback to regular TTS
      return this.speakText(text, finalVoice, userId, finalRate);
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
      console.log("🎤 speakText called with:", { voice, rate, userId });

      // Ensure audio context is active before playing
      await this.ensureAudioContext();

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

      // Use streaming for longer responses
      if (text.length > 200 && text.includes(".")) {
        return this.streamTTS(text, finalVoice, userId, 0, finalRate);
      }

      // Original implementation for short responses
      this.stopSpeaking();
      console.log(
        "🎤 Using OpenAI TTS system with voice:",
        finalVoice,
        "rate:",
        finalRate
      );

      const requestBody = {
        text,
        voice: finalVoice,
        model: "tts-1",
        speed: finalRate, // OpenAI accepts speed parameter
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
   * Restart TTS from where it was stopped
   */
  async restartSpeaking() {
    if (this.currentFullText && this.pausedAtSentence > 0) {
      // Resume from where we stopped
      this.isPaused = false;
      return this.streamTTS(
        this.currentFullText,
        this.currentVoice,
        this.currentUserId,
        this.pausedAtSentence,
        this.currentRate
      );
    } else if (this.currentFullText) {
      // Start from beginning
      this.isPaused = false;
      return this.streamTTS(
        this.currentFullText,
        this.currentVoice,
        this.currentUserId,
        0,
        this.currentRate
      );
    }
    return false;
  }

  /**
   * Stop all speech
   */
  stopSpeaking(preserveForResume = false) {
    // Stop streaming if active
    this.isStreaming = false;

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

    // Clear resume data unless preserving
    if (!preserveForResume) {
      this.currentFullText = "";
      this.pausedAtSentence = 0;
      this.sentencesForResume = [];
    }
  }

  /**
   * Stop streaming
   */
  stopStreaming() {
    this.isStreaming = false;
    this.stopSpeaking();
  }

  /**
   * Process real-time streaming text from OpenAI and convert to speech
   * Call this method as you receive chunks from OpenAI streaming
   */
  async processStreamingText(chunk, userId, voice = null, rate = null) {
    if (!this.streamingBuffer) {
      this.streamingBuffer = "";
      this.streamingSentences = [];
      this.streamingIndex = 0;
    }

    // Add chunk to buffer
    this.streamingBuffer += chunk;

    // Check for complete sentences
    const sentences = this.extractCompleteSentences(this.streamingBuffer);

    for (const sentence of sentences) {
      if (sentence.trim() && !this.streamingSentences.includes(sentence)) {
        this.streamingSentences.push(sentence);

        // Start TTS generation for this sentence immediately
        this.generateAndQueueSentence(
          sentence,
          userId,
          voice,
          rate,
          this.streamingIndex++
        );
      }
    }

    // Update buffer to remaining incomplete text
    this.streamingBuffer = this.getIncompleteText(this.streamingBuffer);
  }

  /**
   * Extract complete sentences from buffered text
   */
  extractCompleteSentences(text) {
    const sentences = [];
    const sentenceEnders = /[.!?]+/g;
    let lastIndex = 0;
    let match;

    while ((match = sentenceEnders.exec(text)) !== null) {
      const sentence = text
        .substring(lastIndex, match.index + match[0].length)
        .trim();
      if (sentence) {
        sentences.push(sentence);
      }
      lastIndex = match.index + match[0].length;
    }

    return sentences;
  }

  /**
   * Get incomplete text that doesn't end with sentence punctuation
   */
  getIncompleteText(text) {
    const lastSentenceEnd = Math.max(
      text.lastIndexOf("."),
      text.lastIndexOf("!"),
      text.lastIndexOf("?")
    );

    return lastSentenceEnd >= 0
      ? text.substring(lastSentenceEnd + 1).trim()
      : text;
  }

  /**
   * Generate and queue a single sentence for immediate playback
   */
  async generateAndQueueSentence(sentence, userId, voice, rate, index) {
    try {
      // Load preferences if not provided
      let finalVoice = voice;
      let finalRate = rate;

      if (!voice || !rate) {
        if (userId) {
          const preferences = await this.loadVoicePreferences(userId);
          finalVoice = voice || preferences.voice;
          finalRate = rate || preferences.rate;
        } else {
          // Use defaults when no userId (for privacy)
          finalVoice = voice || "nova";
          finalRate = rate || 1.0;
        }
      }

      const requestBody = {
        text: sentence.trim(),
        voice: finalVoice,
        model: "tts-1",
        speed: finalRate,
      };

      const authToken = await this.getAuthToken();
      const response = await fetch(`${API_BASE}/tts/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("TTS generation failed");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Add to streaming playback queue
      if (!this.streamingPlaybackQueue) {
        this.streamingPlaybackQueue = [];
        this.streamingCurrentIndex = 0;
        this.isStreamingPlayback = true;
      }

      this.streamingPlaybackQueue[index] = { audioUrl, sentence, index };

      // Start playback if this is the first sentence
      if (index === 0 && !this.streamingPlaybackStarted) {
        this.streamingPlaybackStarted = true;
        this.playStreamingQueue();
      }
    } catch (error) {
      console.error("Error generating streaming sentence:", error);
    }
  }

  /**
   * Play sentences from streaming queue as they become ready
   */
  async playStreamingQueue() {
    if (!this.isStreamingPlayback) return;

    const currentAudio =
      this.streamingPlaybackQueue[this.streamingCurrentIndex];

    if (currentAudio) {
      try {
        await this.playAudioSegment(currentAudio.audioUrl);
        URL.revokeObjectURL(currentAudio.audioUrl);
        this.streamingCurrentIndex++;

        // Continue to next sentence
        if (this.isStreamingPlayback) {
          this.playStreamingQueue();
        }
      } catch (error) {
        console.error("Error in streaming playback:", error);
        this.streamingCurrentIndex++;
        if (this.isStreamingPlayback) {
          this.playStreamingQueue();
        }
      }
    } else {
      // Wait for next sentence to be ready
      setTimeout(() => {
        if (this.isStreamingPlayback) {
          this.playStreamingQueue();
        }
      }, 200);
    }
  }

  /**
   * Finalize streaming - handle any remaining text
   */
  async finalizeStreamingText(userId, voice = null, rate = null) {
    if (this.streamingBuffer && this.streamingBuffer.trim()) {
      // Process any remaining incomplete text
      await this.generateAndQueueSentence(
        this.streamingBuffer,
        userId,
        voice,
        rate,
        this.streamingIndex++
      );
    }

    // Clean up streaming state after a delay to allow final playback
    setTimeout(() => {
      this.cleanupStreaming();
    }, 5000);
  }

  /**
   * Clean up streaming state
   */
  cleanupStreaming() {
    this.streamingBuffer = "";
    this.streamingSentences = [];
    this.streamingIndex = 0;
    this.streamingPlaybackQueue = [];
    this.streamingCurrentIndex = 0;
    this.streamingPlaybackStarted = false;
    this.isStreamingPlayback = false;
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
