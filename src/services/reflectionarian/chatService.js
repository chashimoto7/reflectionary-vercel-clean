// src/services/reflectionarian/chatService.js
import { supabase } from "../../lib/supabase";

const API_BASE = "https://reflectionary-api.vercel.app";

class ReflectionarianChatService {
  constructor() {
    this.apiBase = API_BASE;
  }

  /**
   * Send a message in the chat
   */
  async sendMessage({ message, sessionId, userId, preferences }) {
    try {
      const response = await fetch(`${this.apiBase}/api/reflectionarian/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          session_id: sessionId,
          user_id: userId,
          preferences,
        }),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Failed to send message" }));
        throw new Error(error.error || "Failed to send message");
      }

      return response.json();
    } catch (error) {
      console.error("Chat service error:", error);
      throw error;
    }
  }

  /**
   * Start a new chat session
   */
  async startSession({ userId, preferences, sessionType = "text" }) {
    try {
      const response = await fetch(
        `${this.apiBase}/api/reflectionarian/sessions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            preferences,
            session_type: sessionType,
          }),
        }
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Failed to start session" }));
        throw new Error(error.error || "Failed to start session");
      }

      return response.json();
    } catch (error) {
      console.error("Session start error:", error);
      throw error;
    }
  }

  // End a chat session
  async endSession({ sessionId, userId, messages, generateInsights = true }) {
    try {
      console.log(
        "🔄 Ending session:",
        sessionId,
        "generateInsights:",
        generateInsights
      );

      // First, update the session status
      const sessionResponse = await fetch(
        `${this.apiBase}/api/reflectionarian/sessions?session_id=${sessionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            user_id: userId,
            messages,
            generate_ai_insights: false, // Don't generate in sessions endpoint
          }),
        }
      );

      if (!sessionResponse.ok) {
        throw new Error("Failed to update session");
      }

      const sessionData = await sessionResponse.json();
      console.log("✅ Session updated successfully");

      // Then, generate insights if requested
      let insights = null;
      if (generateInsights && messages && messages.length > 0) {
        try {
          console.log("🧠 Generating insights for session:", sessionId);

          const insightsResponse = await fetch(
            `${this.apiBase}/api/reflectionarian/insights`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                session_id: sessionId,
                user_id: userId,
                messages,
                generate_summary: true,
              }),
            }
          );

          if (insightsResponse.ok) {
            const insightsData = await insightsResponse.json();
            insights = insightsData.insights;
            console.log(
              "✅ Insights generated successfully:",
              insights ? "yes" : "no"
            );
          } else {
            console.error("❌ Insights API failed:", insightsResponse.status);
            // Generate fallback insights
            insights = this.generateFallbackInsights(messages);
          }
        } catch (insightError) {
          console.error("❌ Insight generation error:", insightError);
          insights = this.generateFallbackInsights(messages);
        }
      }

      return {
        success: true,
        session: sessionData.session,
        insights,
      };
    } catch (error) {
      console.error("❌ Session end error:", error);
      throw error;
    }
  }

  //Load all sessions for a user

  async loadSessions(userId) {
    try {
      const response = await fetch(
        `${this.apiBase}/api/reflectionarian/sessions?user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load sessions");
      }

      const data = await response.json();
      return data.sessions || [];
    } catch (error) {
      console.error("Load sessions error:", error);
      throw error;
    }
  }

  /**
   * Load messages for a specific session
   */
  async loadSessionMessages({ sessionId, userId }) {
    try {
      const response = await fetch(
        `${this.apiBase}/api/reflectionarian/messages?session_id=${sessionId}&user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      const data = await response.json();
      return {
        messages: data.messages || [],
        session: data.session || null,
      };
    } catch (error) {
      console.error("Load messages error:", error);
      throw error;
    }
  }

  /**
   * Generate session insights (for premium tier)
   */
  async generateSessionInsights({ sessionId, userId, messages }) {
    try {
      const response = await fetch(
        `${this.apiBase}/api/reflectionarian/insights`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            user_id: userId,
            messages,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate insights");
      }

      return response.json();
    } catch (error) {
      console.error("Generate insights error:", error);
      // Return fallback insights
      return this.generateFallbackInsights(messages);
    }
  }

  /**
   * Generate fallback insights when API fails
   */
  generateFallbackInsights(messages) {
    const userMessages = messages.filter((m) => m.role === "user");

    return {
      sessionSummary: {
        duration: Math.max(5, Math.floor(messages.length * 1.5)),
        messageCount: messages.length,
        userMessageCount: userMessages.length,
        date: new Date().toLocaleDateString(),
      },
      keyThemes: ["Self-reflection", "Personal growth", "Emotional awareness"],
      emotionalJourney: {
        primaryEmotion: "Thoughtful",
        intensity: "Moderate",
        progression: "Positive",
      },
      breakthroughMoments: [
        {
          message: "You showed great insight in exploring your thoughts today",
          timestamp: new Date().toISOString(),
        },
      ],
      followUpSuggestions: [
        "What resonated most with you from our conversation?",
        "How can you apply today's insights to your daily life?",
        "What would you like to explore further next time?",
      ],
      nextSteps: [
        "Continue exploring the themes that emerged today",
        "Journal about the insights you gained",
        "Consider setting specific goals based on our conversation",
        "Schedule your next session within the next week",
      ],
    };
  }

  /**
   * Export session data
   */
  async exportSession({ sessionId, userId, format = "pdf" }) {
    try {
      const response = await fetch(
        `${this.apiBase}/api/reflectionarian/export`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            session_id: sessionId,
            format,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export session");
      }

      return response.blob();
    } catch (error) {
      console.error("Export session error:", error);
      throw error;
    }
  }
}

// Export singleton instance
export default new ReflectionarianChatService();
