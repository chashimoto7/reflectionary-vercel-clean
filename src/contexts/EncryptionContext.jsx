// src/contexts/EncryptionContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
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
  const { user, session, userPassword } = useAuth();
  const [masterKey, setMasterKey] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Add state tracking for coordination with other systems
  const [authenticationStable, setAuthenticationStable] = useState(false);
  const [unlockInProgress, setUnlockInProgress] = useState(false);

  useEffect(() => {
    if (!encryptionService.isSupported()) {
      console.error("Web Crypto API not supported in this browser");
      return;
    }
    setEncryptionReady(true);
  }, []);

  // Enhanced effect that coordinates authentication stability detection
  useEffect(() => {
    let stabilityTimer;

    // Reset stability when authentication state changes
    setAuthenticationStable(false);

    // Set a timer to mark authentication as stable after a brief delay
    // This prevents rapid state changes from triggering multiple unlock attempts
    if (user && session) {
      stabilityTimer = setTimeout(() => {
        setAuthenticationStable(true);
      }, 200); // Wait for authentication state to stabilize
    }

    return () => {
      if (stabilityTimer) {
        clearTimeout(stabilityTimer);
      }
    };
  }, [user, session]);

  // Modified auto-unlock effect that waits for authentication stability
  useEffect(() => {
    const attemptAutoUnlock = async () => {
      // Only proceed if authentication is stable and all conditions are met
      if (
        authenticationStable &&
        user &&
        userPassword &&
        encryptionReady &&
        !isUnlocked &&
        !unlockInProgress
      ) {
        setUnlockInProgress(true);
        try {
          console.log(
            "Auto-unlocking encryption after authentication stabilized..."
          );
          await unlockEncryption(userPassword);
        } catch (error) {
          console.error("Auto-unlock failed:", error);
          // If auto-unlock fails and we have a user but no password, show the modal
          if (user && !userPassword) {
            setShowUnlockModal(true);
          }
        } finally {
          setUnlockInProgress(false);
        }
      }
    };

    attemptAutoUnlock();
  }, [
    authenticationStable,
    user,
    userPassword,
    encryptionReady,
    isUnlocked,
    unlockInProgress,
  ]);

  // Enhanced modal logic that only shows when appropriate
  useEffect(() => {
    // Only consider showing the modal if authentication is stable
    if (!authenticationStable) {
      setShowUnlockModal(false);
      return;
    }

    // Show modal only if we have a user, encryption is ready,
    // but we don't have a password and aren't unlocked
    if (
      user &&
      encryptionReady &&
      !userPassword &&
      !isUnlocked &&
      !unlockInProgress
    ) {
      setShowUnlockModal(true);
    } else {
      setShowUnlockModal(false);
    }
  }, [
    authenticationStable,
    user,
    encryptionReady,
    userPassword,
    isUnlocked,
    unlockInProgress,
  ]);

  // Clear state when user signs out
  useEffect(() => {
    if (!user) {
      setMasterKey(null);
      setIsUnlocked(false);
      setAuthenticationStable(false);
      setUnlockInProgress(false);
      setShowUnlockModal(false);
      sessionStorage.removeItem("encryption_unlocked");
    }
  }, [user]);

  // Enhanced unlock function that coordinates with the state management
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
      setShowUnlockModal(false); // Explicitly hide modal on successful unlock
      sessionStorage.setItem("encryption_unlocked", "true");
      console.log("Encryption unlocked successfully");
      return true;
    } catch (error) {
      console.error("Failed to unlock encryption:", error);
      throw new Error("Failed to unlock encryption");
    }
  };

  // Rest of your existing encryption methods remain the same...

  const value = {
    isUnlocked,
    encryptionReady,
    authenticationStable, // Expose this for other components to use
    unlockEncryption,
    lockEncryption,
    encryptJournalEntry,
    decryptJournalEntry,
    encryptGoal,
    decryptGoal,
    showUnlockModal,
    setShowUnlockModal,
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
};
