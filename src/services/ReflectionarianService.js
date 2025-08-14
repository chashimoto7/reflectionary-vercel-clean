// frontend/ src/services/ReflectionarianService.js
import { supabase } from "../lib/supabase";
import encryptionService from "./encryptionService";

class ReflectionarianService {
  constructor() {
    this.encryptionService = encryptionService;
    this.sessionTable = "reflectionarian_sessions";
    this.messageTable = "reflectionarian_messages";
  }

  // =============================================
  // SESSION MANAGEMENT
  // =============================================

  /**
   * Start a new Reflectionarian session
   */
  async startSession(userId, sessionTitle = null) {
    try {
      // Generate a title if none provided
      const title =
        sessionTitle || `Conversation ${new Date().toLocaleDateString()}`;

      const { data, error } = await supabase
        .from(this.sessionTable)
        .insert({
          user_id: userId,
          session_title: title,
          approach_used: "basic", // Will be 'advanced' or 'pro' for higher tiers
          conversation_type: "reflectionarian",
          session_start: new Date().toISOString(),
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      console.log("🎯 New Reflectionarian session started:", data.id);
      return { success: true, session: data };
    } catch (error) {
      console.error("Error starting Reflectionarian session:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get active session for user (or create one if none exists)
   */
  async getOrCreateActiveSession(userId) {
    try {
      // Look for an active session
      const { data: activeSession, error: sessionError } = await supabase
        .from(this.sessionTable)
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .eq("conversation_type", "reflectionarian")
        .order("last_message_at", { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle to avoid errors when no rows

      if (sessionError) throw sessionError;

      if (activeSession) {
        console.log("📝 Using existing active session:", activeSession.id);
        return { success: true, session: activeSession };
      }

      // No active session, create a new one
      console.log("🆕 No active session found, creating new one...");
      return await this.startSession(userId);
    } catch (error) {
      console.error("Error getting/creating active session:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from(this.sessionTable)
        .select("*")
        .eq("user_id", userId)
        .eq("conversation_type", "reflectionarian")
        .order("last_message_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, sessions: data || [] };
    } catch (error) {
      console.error("Error getting user sessions:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * End a session
   */
  async endSession(sessionId, userId) {
    try {
      const { data, error } = await supabase
        .from(this.sessionTable)
        .update({
          status: "completed",
          session_end: new Date().toISOString(),
        })
        .eq("id", sessionId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      console.log("✅ Session ended:", sessionId);
      return { success: true, session: data };
    } catch (error) {
      console.error("Error ending session:", error);
      return { success: false, error: error.message };
    }
  }

  // =============================================
  // MESSAGE MANAGEMENT
  // =============================================

  /**
   * Get messages for a session (decrypted)
   */
  async getSessionMessages(sessionId, userId, limit = 100) {
    try {
      const { data, error } = await supabase
        .from(this.messageTable)
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: true })
        .limit(limit);

      if (error) throw error;

      // Decrypt messages
      const masterKey = await this.encryptionService.getStaticMasterKey();
      const decryptedMessages = await Promise.all(
        (data || []).map(async (message) => {
          try {
            // Handle legacy messages that might not be encrypted yet
            if (!message.encrypted_message) {
              return {
                ...message,
                decryptedMessage: message.message || "[Legacy message]",
              };
            }

            const dataKey = await this.encryptionService.decryptKey(
              message.encrypted_data_key,
              message.data_key_iv,
              masterKey
            );

            const decryptedMessage = await this.encryptionService.decryptText(
              message.encrypted_message,
              message.message_iv,
              dataKey
            );

            return {
              ...message,
              decryptedMessage,
              // Remove encrypted fields from response for security
              encrypted_message: undefined,
              encrypted_data_key: undefined,
              message: undefined,
            };
          } catch (decryptError) {
            console.error("Error decrypting message:", decryptError);
            return {
              ...message,
              decryptedMessage: "[Error decrypting message]",
            };
          }
        })
      );

      return { success: true, messages: decryptedMessages };
    } catch (error) {
      console.error("Error getting session messages:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save a message to a session (encrypted)
   */
  async saveMessage(
    sessionId,
    userId,
    sender,
    messageContent,
    messageType = "chat"
  ) {
    try {
      // Generate encryption keys
      const masterKey = await this.encryptionService.getStaticMasterKey();
      const dataKey = await this.encryptionService.generateDataKey();

      // Encrypt the message
      const encryptedMessage = await this.encryptionService.encryptText(
        messageContent,
        dataKey
      );
      const encryptedDataKey = await this.encryptionService.encryptKey(
        dataKey,
        masterKey
      );

      const { data, error } = await supabase
        .from(this.messageTable)
        .insert({
          session_id: sessionId,
          sender: sender, // 'user' or 'bot'
          encrypted_message: encryptedMessage.encryptedData,
          message_iv: encryptedMessage.iv,
          encrypted_data_key: encryptedDataKey.encryptedData,
          data_key_iv: encryptedDataKey.iv,
          message_type: messageType,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`💬 Message saved: ${sender} in session ${sessionId}`);
      return { success: true, message: data };
    } catch (error) {
      console.error("Error saving message:", error);
      return { success: false, error: error.message };
    }
  }

  // =============================================
  // CONTEXT BUILDING (Basic Tier Features)
  // =============================================

  /**
   * Get recent journal entries for context (last 5 for Basic tier)
   */
  async getRecentEntriesContext(userId, limit = 5) {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select(
          "id, created_at, encrypted_content, content_iv, encrypted_data_key, data_key_iv"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Decrypt entries for context
      const masterKey = await this.encryptionService.getStaticMasterKey();
      const entries = await Promise.all(
        (data || []).map(async (entry) => {
          try {
            const dataKey = await this.encryptionService.decryptKey(
              entry.encrypted_data_key,
              entry.data_key_iv,
              masterKey
            );

            const content = await this.encryptionService.decryptText(
              entry.encrypted_content,
              entry.content_iv,
              dataKey
            );

            return {
              id: entry.id,
              created_at: entry.created_at,
              content:
                content.substring(0, 400) + (content.length > 400 ? "..." : ""), // Truncate for context
              date: new Date(entry.created_at).toLocaleDateString(),
            };
          } catch (decryptError) {
            console.error("Error decrypting entry for context:", decryptError);
            return null;
          }
        })
      );

      return { success: true, entries: entries.filter(Boolean) };
    } catch (error) {
      console.error("Error getting recent entries context:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Build conversation context from recent messages
   */
  buildConversationContext(messages, limit = 10) {
    // Get the last 'limit' messages for context
    const recentMessages = messages.slice(-limit);

    return recentMessages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.decryptedMessage,
    }));
  }

  // =============================================
  // AI RESPONSE GENERATION
  // =============================================

  /**
   * Generate AI response using OpenAI
   */
  async generateAIResponse(
    userMessage,
    recentEntries = [],
    conversationHistory = []
  ) {
    try {
      // Build context from recent journal entries (Basic tier feature)
      const journalContext =
        recentEntries.length > 0
          ? `Recent journal entries for context:\n${recentEntries
              .map(
                (entry, index) =>
                  `${index + 1}. ${entry.date}: ${entry.content}`
              )
              .join("\n\n")}\n\n`
          : "";

      const systemPrompt = `You are the Reflectionarian, a compassionate AI companion for journaling and personal growth. You help users reflect on their thoughts, feelings, and experiences through thoughtful conversation.

Your personality:
- Empathetic and non-judgmental
- Thoughtful and insightful  
- Encouraging but realistic
- Focused on self-discovery and growth
- Use warm, conversational language
- Ask follow-up questions to encourage deeper reflection

Guidelines for Basic tier:
- Help users identify patterns in their thoughts and behaviors
- Offer gentle insights and perspectives
- Suggest journaling prompts when appropriate
- Keep responses concise but meaningful (2-4 sentences typically)
- Always maintain a supportive, caring tone
- Focus on the present conversation and recent journal entries

${journalContext}Remember: You're a supportive companion for reflection and growth, not a therapist. Encourage self-discovery through gentle questioning and insights.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: userMessage },
      ];

      const response = await fetch("/api/openai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
          model: "gpt-4",
          temperature: 0.7,
          max_tokens: 500, // Keep responses concise for Basic tier
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        response: data.choices[0].message.content,
        tokenCount: data.usage?.total_tokens || 0,
      };
    } catch (error) {
      console.error("Error generating AI response:", error);
      return {
        success: false,
        error: error.message,
        response:
          "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
      };
    }
  }

  // =============================================
  // MAIN CONVERSATION FLOW
  // =============================================

  /**
   * Send message and get AI response (main method for Basic tier)
   */
  async sendMessage(userId, userMessage, sessionId = null) {
    try {
      // Get or create active session
      let session;
      if (sessionId) {
        const { data, error } = await supabase
          .from(this.sessionTable)
          .select("*")
          .eq("id", sessionId)
          .eq("user_id", userId)
          .single();

        if (error) throw error;
        session = data;
      } else {
        const sessionResult = await this.getOrCreateActiveSession(userId);
        if (!sessionResult.success) throw new Error(sessionResult.error);
        session = sessionResult.session;
      }

      // Save user message
      const userMessageResult = await this.saveMessage(
        session.id,
        userId,
        "user",
        userMessage,
        "chat"
      );
      if (!userMessageResult.success) throw new Error(userMessageResult.error);

      // Get conversation context
      const messagesResult = await this.getSessionMessages(session.id, userId);
      const conversationHistory = messagesResult.success
        ? this.buildConversationContext(messagesResult.messages, 8)
        : [];

      // Get recent journal entries for Basic tier context
      const contextResult = await this.getRecentEntriesContext(userId);
      const recentEntries = contextResult.success ? contextResult.entries : [];

      // Generate AI response
      const startTime = Date.now();
      const aiResult = await this.generateAIResponse(
        userMessage,
        recentEntries,
        conversationHistory
      );
      const responseTime = Date.now() - startTime;

      if (!aiResult.success) {
        // Save error response
        await this.saveMessage(
          session.id,
          userId,
          "bot",
          aiResult.response,
          "chat"
        );
        throw new Error(aiResult.error);
      }

      // Save AI response
      const aiMessageResult = await this.saveMessage(
        session.id,
        userId,
        "bot",
        aiResult.response,
        "chat"
      );
      if (!aiMessageResult.success) throw new Error(aiMessageResult.error);

      // Update the AI message with metadata
      await supabase
        .from(this.messageTable)
        .update({
          token_count: aiResult.tokenCount,
          response_time_ms: responseTime,
        })
        .eq("id", aiMessageResult.message.id);

      console.log(`🤖 Reflectionarian responded in ${responseTime}ms`);

      return {
        success: true,
        response: aiResult.response,
        sessionId: session.id,
        tokenCount: aiResult.tokenCount,
        responseTime: responseTime,
      };
    } catch (error) {
      console.error("Error in sendMessage:", error);
      return { success: false, error: error.message };
    }
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  /**
   * Generate a follow-up prompt based on conversation
   */
  async generateFollowUpPrompt(userId, sessionId) {
    try {
      // Get recent messages
      const messagesResult = await this.getSessionMessages(sessionId, userId);
      if (!messagesResult.success) throw new Error(messagesResult.error);

      const recentMessages = messagesResult.messages.slice(-4); // Last 4 messages

      if (recentMessages.length === 0) {
        return {
          success: true,
          prompt:
            "What's on your mind today? I'm here to listen and help you reflect.",
        };
      }

      // Create a prompt based on the conversation
      const conversationSummary = recentMessages
        .map((msg) => `${msg.sender}: ${msg.decryptedMessage}`)
        .join("\n");

      const promptRequest = `Based on this conversation, suggest a thoughtful follow-up question or journaling prompt that would help the user reflect deeper:

${conversationSummary}

Provide just the prompt/question, nothing else:`;

      const response = await fetch("/api/openai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: promptRequest }],
          model: "gpt-4",
          temperature: 0.8,
          max_tokens: 100,
        }),
      });

      if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

      const data = await response.json();

      return {
        success: true,
        prompt: data.choices[0].message.content.trim(),
      };
    } catch (error) {
      console.error("Error generating follow-up prompt:", error);
      return {
        success: false,
        error: error.message,
        prompt: "What would you like to explore further about this topic?",
      };
    }
  }
}

export default ReflectionarianService;
