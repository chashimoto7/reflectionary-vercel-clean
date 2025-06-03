// utils.js - Utility functions for Reflectionary frontend

// Authentication utilities
export const auth = {
  // Save authentication token
  saveToken: (token) => {
    localStorage.setItem("authToken", token);
  },

  // Get authentication token
  getToken: () => {
    return localStorage.getItem("authToken");
  },

  // Remove authentication token
  removeToken: () => {
    localStorage.removeItem("authToken");
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem("authToken");
    return token !== null && token !== undefined;
  },
};

// UI utilities
export const ui = {
  // Show loading state
  showLoading: (elementId, loadingText = "Loading...") => {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<div class="loading">${loadingText}</div>`;
    }
  },

  // Show error message
  showError: (elementId, errorMessage) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<div class="error">${errorMessage}</div>`;
    }
  },

  // Show success message
  showSuccess: (elementId, successMessage) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<div class="success">${successMessage}</div>`;
    }
  },

  // Create toast notification
  showToast: (message, type = "success", duration = 3000) => {
    // Create toast element
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Style the toast
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      z-index: 10000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
      max-width: 300px;
    `;

    // Set background color based on type
    const colors = {
      success: "#4CAF50",
      error: "#f44336",
      warning: "#ff9800",
      info: "#2196F3",
    };
    toast.style.backgroundColor = colors[type] || colors.success;

    // Add to page
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(0)";
    }, 100);

    // Remove after duration
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  },
};

// Form utilities
export const forms = {
  // Get form data as object
  getFormData: (formElement) => {
    const formData = new FormData(formElement);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    return data;
  },

  // Clear form
  clearForm: (formElement) => {
    formElement.reset();
  },

  // Validate required fields
  validateRequired: (formElement) => {
    const requiredFields = formElement.querySelectorAll("[required]");
    const errors = [];

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        errors.push(`${field.name || field.id} is required`);
        field.classList.add("error");
      } else {
        field.classList.remove("error");
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  },
};

// Date utilities
export const dates = {
  // Format date for display
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  // Format date and time
  formatDateTime: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // Get relative time (e.g., "2 days ago")
  getRelativeTime: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  },
};

// Entry utilities
export const entries = {
  // Create entry preview (truncated content)
  createPreview: (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  },

  // Get mood emoji
  getMoodEmoji: (mood) => {
    const moodEmojis = {
      positive: "😊",
      negative: "😔",
      neutral: "😐",
      excited: "🎉",
      peaceful: "😌",
      anxious: "😰",
      grateful: "🙏",
      motivated: "💪",
      reflective: "🤔",
    };
    return moodEmojis[mood] || "😐";
  },

  // Sort entries by date (newest first)
  sortByDate: (entries) => {
    return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  },
};

// Error handling utilities
export const errors = {
  // Handle API errors gracefully
  handleApiError: (error, fallbackMessage = "Something went wrong") => {
    console.error("API Error:", error);

    if (error.message.includes("401")) {
      // Unauthorized - redirect to login
      auth.removeToken();
      window.location.href = "/auth";
      return "Please log in again";
    }

    if (error.message.includes("Network")) {
      return "Network error. Please check your connection.";
    }

    return error.message || fallbackMessage;
  },
};

// Local storage utilities for offline support
export const storage = {
  // Save data to localStorage
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  },

  // Get data from localStorage
  get: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to get from localStorage:", error);
      return null;
    }
  },

  // Remove data from localStorage
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to remove from localStorage:", error);
    }
  },
};
