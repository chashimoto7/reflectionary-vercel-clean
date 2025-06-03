// api.js - Reflectionary API Service
// This file handles all communication with your backend API

const API_BASE_URL =
  "https://reflectionary-api-christines-projects-f96499fa.vercel.app/api";

// Helper function for making API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Add authentication token if available
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    console.log("Making API request to:", url);
    const response = await fetch(url, config);

    // Check if the response is ok
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error ${response.status}: ${errorData}`);
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
}

// Authentication API calls
export const authAPI = {
  // Login user
  login: async (credentials) => {
    return await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  // Register new user
  register: async (userData) => {
    return await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Logout user
  logout: async () => {
    return await apiRequest("/auth/logout", {
      method: "POST",
    });
  },

  // Verify token
  verifyToken: async () => {
    return await apiRequest("/auth/verify");
  },
};

// Journal Entries API calls
export const entriesAPI = {
  // Get all entries for the current user
  getAll: async () => {
    return await apiRequest("/entries");
  },

  // Get a specific entry by ID
  getById: async (entryId) => {
    return await apiRequest(`/entries/${entryId}`);
  },

  // Create a new journal entry
  create: async (entryData) => {
    return await apiRequest("/entries", {
      method: "POST",
      body: JSON.stringify({
        title: entryData.title,
        content: entryData.content,
        mood: entryData.mood,
        tags: entryData.tags || [],
        date: entryData.date || new Date().toISOString(),
      }),
    });
  },

  // Update an existing entry
  update: async (entryId, entryData) => {
    return await apiRequest(`/entries/${entryId}`, {
      method: "PUT",
      body: JSON.stringify(entryData),
    });
  },

  // Delete an entry
  delete: async (entryId) => {
    return await apiRequest(`/entries/${entryId}`, {
      method: "DELETE",
    });
  },
};

// AI-powered features API calls
export const aiAPI = {
  // Generate reflection prompts
  generatePrompts: async (promptData = {}) => {
    return await apiRequest("/prompts", {
      method: "POST",
      body: JSON.stringify({
        category: promptData.category || "general",
        count: promptData.count || 3,
        mood: promptData.mood,
        previousEntries: promptData.previousEntries,
      }),
    });
  },

  // Get follow-up questions for an entry
  getFollowUpQuestions: async (entryId) => {
    return await apiRequest(`/followup/${entryId}`);
  },

  // Generate insights about goals
  getGoalInsights: async (goalData) => {
    return await apiRequest("/insights", {
      method: "POST",
      body: JSON.stringify(goalData),
    });
  },

  // Analyze mood patterns
  analyzeMoodPatterns: async (timeframe = "30days") => {
    return await apiRequest(`/analysis/mood?timeframe=${timeframe}`);
  },

  // Get writing suggestions
  getWritingSuggestions: async (partialEntry) => {
    return await apiRequest("/suggestions", {
      method: "POST",
      body: JSON.stringify({ content: partialEntry }),
    });
  },
};

// User profile API calls
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return await apiRequest("/user/profile");
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await apiRequest("/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  // Get user settings
  getSettings: async () => {
    return await apiRequest("/user/settings");
  },

  // Update user settings
  updateSettings: async (settings) => {
    return await apiRequest("/user/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },
};

// Export default API object with all services
const API = {
  auth: authAPI,
  entries: entriesAPI,
  ai: aiAPI,
  user: userAPI,
};

export default API;
