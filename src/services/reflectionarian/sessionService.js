// src/services/reflectionarian/sessionService.js

class SessionService {
  constructor() {
    this.sessions = new Map(); // Local cache of sessions
  }

  /**
   * Create message object with consistent format
   */
  createMessage(role, content, metadata = {}) {
    return {
      id: Date.now() + Math.random(), // Ensure unique IDs
      role,
      content,
      created_at: new Date().toISOString(),
      ...metadata,
    };
  }

  /**
   * Create loading message
   */
  createLoadingMessage() {
    return {
      id: Date.now() + 0.1,
      role: "assistant",
      content: "loading",
      created_at: new Date().toISOString(),
      isLoading: true,
    };
  }

  /**
   * Get welcome message based on session type
   * FIXED: Changed parameter order to match how it's being called
   */
  getWelcomeMessage(preferences, sessionType = "text", customMessage = null) {
    if (customMessage) return customMessage;

    const messages = {
      voice:
        "Hello! I'm your AI reflection companion. I can hear you clearly - feel free to speak naturally about whatever is on your mind. I'll respond with both voice and text to support your reflection journey today.",
      text: "Hello! I'm your AI reflection companion, here to support your personal growth and self-reflection journey. I'm not a therapist or medical professional - our conversations are for personal insight and exploration. What's on your mind today?",
    };

    return messages[sessionType] || messages.text;
  }

  /**
   * Cache session locally
   */
  cacheSession(sessionId, sessionData) {
    this.sessions.set(sessionId, {
      ...sessionData,
      cachedAt: Date.now(),
    });
  }

  /**
   * Get cached session
   */
  getCachedSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check if cache is still valid (5 minutes)
    const cacheAge = Date.now() - session.cachedAt;
    if (cacheAge > 5 * 60 * 1000) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Clear session cache
   */
  clearCache() {
    this.sessions.clear();
  }

  /**
   * Format session duration
   */
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  /**
   * Get session statistics
   */
  getSessionStats(messages) {
    const userMessages = messages.filter((m) => m.role === "user");
    const assistantMessages = messages.filter(
      (m) => m.role === "assistant" && !m.isLoading
    );

    // Estimate duration based on message count and average reading/typing time
    const estimatedDuration = Math.max(5, Math.floor(messages.length * 1.5));

    // Calculate average message length
    const avgUserMessageLength =
      userMessages.length > 0
        ? Math.floor(
            userMessages.reduce((sum, m) => sum + m.content.length, 0) /
              userMessages.length
          )
        : 0;

    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      estimatedDuration,
      avgUserMessageLength,
      startTime: messages[0]?.created_at || new Date().toISOString(),
      endTime:
        messages[messages.length - 1]?.created_at || new Date().toISOString(),
    };
  }

  /**
   * Export session for different formats
   */
  formatSessionForExport(session, messages, format = "text") {
    const stats = this.getSessionStats(messages);

    if (format === "text") {
      let output = `Reflectionarian Session\n`;
      output += `========================\n\n`;
      output += `Date: ${new Date(stats.startTime).toLocaleDateString()}\n`;
      output += `Duration: ${this.formatDuration(stats.estimatedDuration)}\n`;
      output += `Messages: ${stats.totalMessages}\n\n`;
      output += `Conversation:\n`;
      output += `-------------\n\n`;

      messages.forEach((msg) => {
        if (!msg.isLoading) {
          const role = msg.role === "user" ? "You" : "Reflectionarian";
          const time = new Date(msg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          output += `[${time}] ${role}:\n${msg.content}\n\n`;
        }
      });

      return output;
    }

    // For other formats (JSON, etc.)
    return {
      session: {
        id: session.id,
        type: session.session_type || "text",
        date: stats.startTime,
        duration: stats.estimatedDuration,
        messageCount: stats.totalMessages,
      },
      messages: messages
        .filter((m) => !m.isLoading)
        .map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.created_at,
        })),
      statistics: stats,
    };
  }

  /**
   * Group sessions by date
   */
  groupSessionsByDate(sessions) {
    const grouped = {};

    sessions.forEach((session) => {
      const date = new Date(session.created_at || session.last_message_at);
      const dateKey = date.toLocaleDateString();

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          sessions: [],
        };
      }

      grouped[dateKey].sessions.push(session);
    });

    // Sort by date (newest first)
    return Object.values(grouped).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }

  /**
   * Search sessions by content
   */
  searchSessions(sessions, query) {
    const lowercaseQuery = query.toLowerCase();

    return sessions.filter((session) => {
      // Search in session title
      if (session.title?.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }

      // Search in session metadata
      if (
        session.key_themes?.some((theme) =>
          theme.toLowerCase().includes(lowercaseQuery)
        )
      ) {
        return true;
      }

      return false;
    });
  }
}

// Export singleton instance
export default new SessionService();
