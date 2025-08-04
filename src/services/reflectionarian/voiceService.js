// src/services/reflectionarian/voiceService.js

// Demo database configuration - replace with your production values when ready
const SUPABASE_URL = "https://nvcdlmfvnybsgzkpmdth.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52Y2RsbWZ2bnlic2d6a3BtZHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NzQ4NzgsImV4cCI6MjA2NzI1MDg3OH0.a9TOIgvxjcfXKOOyzW44_Nf286amXXalcpyfZ-Ybh2I";

const API_BASE = "https://reflectionary-api.vercel.app";

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
  }

  /**
   * Check if voice recognition is supported
   */
  isVoiceSupported() {
    return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
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
    return new Promise((resolve) => {
      const audio = new Audio(audioUrl);
      audio.volume = 0.8;

      audio.onended = () => {
        this.currentAudio = null;
        resolve();
      };

      audio.onerror = () => {
        console.error("Audio playback error");
        resolve();
      };

      this.currentAudio = audio;
      audio.play().catch((error) => {
        console.error("Play error:", error);
        resolve();
      });
    });
  }

  /**
   * Stream TTS by splitting text into sentences
   */
  async streamTTS(text, voice = "nova", userId) {
    try {
      // Stop any current speech
      this.stopSpeaking();

      // Split text into sentences for streaming
      const sentences = this.splitIntoSentences(text);
      this.audioQueue = [];
      this.isStreaming = true;

      console.log(`🎤 Streaming ${sentences.length} sentences...`);

      // Process sentences in parallel but play in sequence
      const audioPromises = sentences.map(async (sentence, index) => {
        if (!sentence.trim()) return null;

        try {
          // Start generating audio for all sentences immediately
          const response = await fetch(
            `${SUPABASE_URL}/functions/v1/generate-audio`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                text: sentence.trim(),
                voice,
                model: "tts-1", // Use faster model for streaming
                userId,
              }),
            }
          );

          if (!response.ok) throw new Error("TTS generation failed");

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);

          return { index, audioUrl, sentence };
        } catch (error) {
          console.error(
            `Failed to generate audio for sentence ${index}:`,
            error
          );
          return null;
        }
      });

      // Start playing as soon as first audio is ready
      const audioResults = await Promise.all(audioPromises);
      const validAudios = audioResults
        .filter(Boolean)
        .sort((a, b) => a.index - b.index);

      // Play audio segments in sequence
      for (const audioData of validAudios) {
        if (!this.isStreaming) break; // Stop if cancelled

        await this.playAudioSegment(audioData.audioUrl);
        URL.revokeObjectURL(audioData.audioUrl); // Clean up
      }

      this.isStreaming = false;
      return true;
    } catch (error) {
      console.error("TTS streaming failed:", error);
      // Fallback to regular TTS
      return this.speakText(text, voice, userId);
    }
  }

  /**
   * Text-to-Speech using Supabase edge function
   */
  async speakText(text, voice = "nova", userId) {
    try {
      // Use streaming for longer responses
      if (text.length > 200 && text.includes(".")) {
        return this.streamTTS(text, voice, userId);
      }

      // Original implementation for short responses
      this.stopSpeaking();
      console.log("🎤 Using OpenAI TTS system...");

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-audio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            text,
            voice,
            model: "tts-1",
            userId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "TTS generation failed" }));
        throw new Error(error.error || "TTS generation failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = 0.8;

      // Clean up blob URL when audio ends
      this.currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        this.isPaused = false;
      };

      await this.currentAudio.play();
      return this.currentAudio;
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
  }

  /**
   * Stop streaming
   */
  stopStreaming() {
    this.isStreaming = false;
    this.stopSpeaking();
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
