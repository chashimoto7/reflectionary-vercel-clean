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
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockAttempted, setUnlockAttempted] = useState(false); // ✅ NEW
  const [masterKey, setMasterKey] = useState(null);
  const [securitySettings, setSecuritySettings] = useState({
    autoLockEnabled: false,
    autoLockTimeout: null,
    showLockStatus: true,
  });

  const autoLockTimer = useRef(null);
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    if (!user) lock();
  }, [user]);

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

  // ✅ UPDATED: accepts email, and marks unlockAttempted
  async function unlock(email, password) {
    if (!email) throw new Error("No email provided for unlock");
    setIsUnlocking(true);
    setUnlockAttempted(true); // ✅ Mark that unlock has been attempted

    try {
      const key = await encryptionService.generateMasterKey(email, password);
      setMasterKey(key);
      setIsLocked(false);
      lastActivity.current = Date.now();
      console.log("🔓 Journal unlocked successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to unlock:", error);
      throw new Error("Invalid password");
    } finally {
      setIsUnlocking(false);
    }
  }

  function lock() {
    setIsLocked(true);
    setMasterKey(null);
    clearAutoLockTimer();
    setUnlockAttempted(true); // ✅ Also mark as attempted when locked manually
    console.log("🔒 Journal locked");
  }

  function updateSecuritySettings(newSettings) {
    setSecuritySettings((prev) => ({ ...prev, ...newSettings }));
  }

  const value = {
    isLocked,
    isUnlocking,
    unlockAttempted, // ✅ expose this
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
