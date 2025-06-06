// src/contexts/SecurityContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import encryptionService from "../services/encryptionService";

const SecurityContext = createContext({});

export function SecurityProvider({ children }) {
  const { user } = useAuth();
  const [isLocked, setIsLocked] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false); // ✅ NEW STATE
  const [masterKey, setMasterKey] = useState(null);
  const [securitySettings, setSecuritySettings] = useState({
    autoLockEnabled: false,
    autoLockTimeout: null, // minutes
    showLockStatus: true,
  });

  const autoLockTimer = useRef(null);
  const lastActivity = useRef(Date.now());

  // Lock when user changes (logout)
  useEffect(() => {
    if (!user) {
      lock();
    }
  }, [user]);

  // Set up auto-lock if enabled
  useEffect(() => {
    if (
      securitySettings.autoLockEnabled &&
      securitySettings.autoLockTimeout &&
      !isLocked
    ) {
      startAutoLockTimer();
    } else {
      clearAutoLockTimer();
    }

    return () => clearAutoLockTimer();
  }, [
    securitySettings.autoLockEnabled,
    securitySettings.autoLockTimeout,
    isLocked,
  ]);

  // Activity tracking for auto-lock
  useEffect(() => {
    if (!securitySettings.autoLockEnabled || isLocked) return;

    const handleActivity = () => {
      lastActivity.current = Date.now();
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) =>
      document.addEventListener(event, handleActivity, true)
    );

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, handleActivity, true)
      );
    };
  }, [securitySettings.autoLockEnabled, isLocked]);

  function startAutoLockTimer() {
    clearAutoLockTimer();
    if (!securitySettings.autoLockTimeout) return;

    autoLockTimer.current = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity.current;
      const timeoutMs = securitySettings.autoLockTimeout * 60 * 1000;

      if (timeSinceActivity >= timeoutMs) {
        lock();
      }
    }, 30000);
  }

  function clearAutoLockTimer() {
    if (autoLockTimer.current) {
      clearInterval(autoLockTimer.current);
      autoLockTimer.current = null;
    }
  }

  async function unlock(password) {
    if (!user) throw new Error("No user logged in");

    setIsUnlocking(true); // ✅ Start unlock delay
    try {
      const key = await encryptionService.generateMasterKey(
        user.email,
        password
      );
      setMasterKey(key);
      setIsLocked(false);
      lastActivity.current = Date.now();
      console.log("🔓 Journal unlocked successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to unlock:", error);
      throw new Error("Invalid password");
    } finally {
      setIsUnlocking(false); // ✅ Done unlocking
    }
  }

  function lock() {
    setIsLocked(true);
    setMasterKey(null);
    clearAutoLockTimer();
    console.log("🔒 Journal locked");
  }

  function updateSecuritySettings(newSettings) {
    setSecuritySettings((prev) => ({ ...prev, ...newSettings }));
  }

  const value = {
    isLocked,
    isUnlocking, // ✅ Expose this for App.jsx
    masterKey,
    securitySettings,
    unlock,
    lock,
    updateSecuritySettings,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error("useSecurity must be used within a SecurityProvider");
  }
  return context;
}
