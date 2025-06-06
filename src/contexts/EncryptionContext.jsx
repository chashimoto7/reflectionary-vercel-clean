// src/contexts/EncryptionContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import encryptionService from "../services/encryptionService";

const EncryptionContext = createContext({});

export const useEncryption = () => {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error("useEncryption must be used within an EncryptionProvider");
  }
  return context;
};

export const EncryptionProvider = ({ children }) => {
  const { user, userPassword } = useAuth();
  const [masterKey, setMasterKey] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // User-controlled security state
  const [securityPreferences, setSecurityPreferences] = useState({
    autoLockTimeout: null, // minutes, null means disabled
    autoLockEnabled: false,
    showSecurityStatus: true,
  });

  // Track activity for auto-lock functionality
  const [lastActivity, setLastActivity] = useState(Date.now());
  const autoLockTimerRef = useRef(null);

  // Initialize encryption service support check
  useEffect(() => {
    if (!encryptionService.isSupported()) {
      console.error("Web Crypto API not supported in this browser");
      return;
    }
    setEncryptionReady(true);
  }, []);

  // Load user security preferences when user changes
  useEffect(() => {
    if (user) {
      loadSecurityPreferences();
    } else {
      // Reset preferences when user signs out
      setSecurityPreferences({
        autoLockTimeout: null,
        autoLockEnabled: false,
        showSecurityStatus: true,
      });
    }
  }, [user]);

  // Simple auto-unlock on initial login (no complex coordination)
  useEffect(() => {
    const attemptAutoUnlock = async () => {
      // Only auto-unlock if we have user, password, encryption is ready, and we're not already unlocked
      if (user && userPassword && encryptionReady && !isUnlocked) {
        try {
          console.log("Attempting auto-unlock on login...");
          await unlockEncryption(userPassword);
        } catch (error) {
          console.error(
            "Auto-unlock failed, user will need to unlock manually:",
            error
          );
          setShowUnlockModal(true);
        }
      }
    };

    attemptAutoUnlock();
  }, [user, userPassword, encryptionReady]); // Removed isUnlocked to prevent loops

  // Auto-lock timer management
  useEffect(() => {
    // Clear any existing timer
    if (autoLockTimerRef.current) {
      clearTimeout(autoLockTimerRef.current);
      autoLockTimerRef.current = null;
    }

    // Only set up auto-lock if user is unlocked and has auto-lock enabled
    if (
      isUnlocked &&
      securityPreferences.autoLockEnabled &&
      securityPreferences.autoLockTimeout
    ) {
      const timeoutMs = securityPreferences.autoLockTimeout * 60 * 1000; // Convert minutes to milliseconds

      autoLockTimerRef.current = setTimeout(() => {
        console.log("Auto-locking due to inactivity timeout");
        lockEncryption();
      }, timeoutMs);
    }

    // Cleanup function
    return () => {
      if (autoLockTimerRef.current) {
        clearTimeout(autoLockTimerRef.current);
        autoLockTimerRef.current = null;
      }
    };
  }, [
    isUnlocked,
    securityPreferences.autoLockEnabled,
    securityPreferences.autoLockTimeout,
    lastActivity,
  ]);

  // Activity tracking (simplified approach)
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    // Only track activity if auto-lock is enabled
    if (securityPreferences.autoLockEnabled && isUnlocked) {
      // Listen for user activity indicators
      document.addEventListener("mousedown", updateActivity);
      document.addEventListener("keydown", updateActivity);
      document.addEventListener("scroll", updateActivity);

      return () => {
        document.removeEventListener("mousedown", updateActivity);
        document.removeEventListener("keydown", updateActivity);
        document.removeEventListener("scroll", updateActivity);
      };
    }
  }, [securityPreferences.autoLockEnabled, isUnlocked]);

  // Load user's security preferences from database
  const loadSecurityPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("auto_lock_timeout, auto_lock_enabled, show_security_status")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error loading security preferences:", error);
        return;
      }

      if (data) {
        setSecurityPreferences({
          autoLockTimeout: data.auto_lock_timeout,
          autoLockEnabled: data.auto_lock_enabled || false,
          showSecurityStatus: data.show_security_status !== false, // Default to true
        });
      }
    } catch (error) {
      console.error("Failed to load security preferences:", error);
    }
  };

  // Save security preferences to database
  const updateSecurityPreferences = async (newPreferences) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          auto_lock_timeout: newPreferences.autoLockTimeout,
          auto_lock_enabled: newPreferences.autoLockEnabled,
          show_security_status: newPreferences.showSecurityStatus,
          security_preferences_updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error saving security preferences:", error);
        throw error;
      }

      setSecurityPreferences(newPreferences);
      console.log("Security preferences updated successfully");
    } catch (error) {
      console.error("Failed to save security preferences:", error);
      throw error;
    }
  };

  // Manual lock function
  const lockEncryption = () => {
    setMasterKey(null);
    setIsUnlocked(false);
    setShowUnlockModal(false);
    sessionStorage.removeItem("encryption_unlocked");
    console.log("Encryption locked (manual or auto-timeout)");
  };

  // Enhanced unlock function
  const unlockEncryption = async (password) => {
    if (!user || !encryptionReady) {
      throw new Error("User not authenticated or encryption not ready");
    }

    try {
      console.log("Unlocking encryption for user:", user.email);
      const key = await encryptionService.generateMasterKey(
        user.email,
        password
      );
      setMasterKey(key);
      setIsUnlocked(true);
      setShowUnlockModal(false);
      setLastActivity(Date.now()); // Reset activity timer
      sessionStorage.setItem("encryption_unlocked", "true");
      console.log("Encryption unlocked successfully");
      return true;
    } catch (error) {
      console.error("Failed to unlock encryption:", error);
      throw new Error("Failed to unlock encryption");
    }
  };

  // Your existing encryption methods (encryptJournalEntry, decryptJournalEntry, etc.)
  // I'll include the essential ones here for completeness
  const encryptJournalEntry = async (entryData) => {
    if (!masterKey) {
      throw new Error("Encryption not unlocked");
    }

    const dataKey = await encryptionService.generateDataKey();

    const [encryptedContent, encryptedHtml, encryptedPrompt, encryptedDataKey] =
      await Promise.all([
        encryptionService.encryptText(entryData.content, dataKey),
        entryData.content
          ? encryptionService.encryptText(entryData.content, dataKey)
          : { encryptedData: "", iv: "" },
        entryData.prompt
          ? encryptionService.encryptText(entryData.prompt, dataKey)
          : { encryptedData: "", iv: "" },
        encryptionService.encryptKey(dataKey, masterKey),
      ]);

    return {
      encrypted_content: encryptedContent.encryptedData,
      content_iv: encryptedContent.iv,
      encrypted_html_content: encryptedHtml.encryptedData,
      html_content_iv: encryptedHtml.iv,
      encrypted_prompt: encryptedPrompt.encryptedData,
      prompt_iv: encryptedPrompt.iv,
      encrypted_data_key: encryptedDataKey.encryptedData,
      data_key_iv: encryptedDataKey.iv,
      word_count: entryData.content
        ? entryData.content.split(/\s+/).filter((word) => word.length > 0)
            .length
        : 0,
    };
  };

  const decryptJournalEntry = async (encryptedEntry) => {
    if (!masterKey) {
      throw new Error("Encryption not unlocked");
    }

    try {
      const dataKey = await encryptionService.decryptKey(
        {
          encryptedData: encryptedEntry.encrypted_data_key,
          iv: encryptedEntry.data_key_iv,
        },
        masterKey
      );

      const content = await encryptionService.decryptText(
        encryptedEntry.encrypted_content,
        encryptedEntry.content_iv,
        dataKey
      );

      let htmlContent = "";
      if (
        encryptedEntry.encrypted_html_content &&
        encryptedEntry.html_content_iv
      ) {
        htmlContent = await encryptionService.decryptText(
          encryptedEntry.encrypted_html_content,
          encryptedEntry.html_content_iv,
          dataKey
        );
      }

      let prompt = "";
      if (encryptedEntry.encrypted_prompt && encryptedEntry.prompt_iv) {
        prompt = await encryptionService.decryptText(
          encryptedEntry.encrypted_prompt,
          encryptedEntry.prompt_iv,
          dataKey
        );
      }

      return {
        ...encryptedEntry,
        content,
        html_content: htmlContent,
        prompt,
      };
    } catch (error) {
      console.error("Decryption failed for entry:", encryptedEntry.id, error);
      throw new Error(`Failed to decrypt journal entry: ${error.message}`);
    }
  };

  // Clear all state when user signs out
  useEffect(() => {
    if (!user) {
      setMasterKey(null);
      setIsUnlocked(false);
      setShowUnlockModal(false);
      setLastActivity(Date.now());
      sessionStorage.removeItem("encryption_unlocked");

      // Clear any active timers
      if (autoLockTimerRef.current) {
        clearTimeout(autoLockTimerRef.current);
        autoLockTimerRef.current = null;
      }
    }
  }, [user]);

  const value = {
    isUnlocked,
    encryptionReady,
    unlockEncryption,
    lockEncryption,
    encryptJournalEntry,
    decryptJournalEntry,
    showUnlockModal,
    setShowUnlockModal,

    // Security preference management
    securityPreferences,
    updateSecurityPreferences,
    lastActivity,

    // Additional encryption methods you might have
    encryptGoal: async (goalText, description = "") => {
      // Implementation would be similar to encryptJournalEntry
      // Add this if you need goal encryption functionality
    },
    decryptGoal: async (encryptedGoal) => {
      // Implementation would be similar to decryptJournalEntry
      // Add this if you need goal decryption functionality
    },
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
};
