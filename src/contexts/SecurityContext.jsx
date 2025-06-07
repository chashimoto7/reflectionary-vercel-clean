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
  const { user, signOut } = useAuth();
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [masterKey, setMasterKey] = useState(null);
  const [securitySettings, setSecuritySettings] = useState({
    autoLockEnabled: false,
    autoLockTimeout: null,
    showLockStatus: true,
  });

  const autoLockTimer = useRef(null);
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    if (!user) {
      clearAutoLockTimer();
      setMasterKey(null);
    }
  }, [user]);

  useEffect(() => {
    if (
      securitySettings.autoLockEnabled &&
      securitySettings.autoLockTimeout &&
      user &&
      masterKey
    ) {
      startAutoLockTimer();
    } else {
      clearAutoLockTimer();
    }

    return () => clearAutoLockTimer();
  }, [
    securitySettings.autoLockEnabled,
    securitySettings.autoLockTimeout,
    user,
    masterKey,
  ]);

  useEffect(() => {
    if (!securitySettings.autoLockEnabled || !user) return;

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
  }, [securitySettings.autoLockEnabled, user]);

  function startAutoLockTimer() {
    clearAutoLockTimer();
    if (!securitySettings.autoLockTimeout) return;

    autoLockTimer.current = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity.current;
      const timeoutMs = securitySettings.autoLockTimeout * 60 * 1000;

      if (timeSinceActivity >= timeoutMs) {
        console.log("🔒 Auto-lock timeout reached. Signing out user.");
        signOut();
      }
    }, 30000);
  }

  function clearAutoLockTimer() {
    if (autoLockTimer.current) {
      clearInterval(autoLockTimer.current);
      autoLockTimer.current = null;
    }
  }

  async function unlock(email, password) {
    if (!email) throw new Error("No email provided for unlock");
    setIsUnlocking(true);
    try {
      const key = await encryptionService.generateMasterKey(email, password);
      setMasterKey(key);
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

  function updateSecuritySettings(newSettings) {
    setSecuritySettings((prev) => ({ ...prev, ...newSettings }));
  }

  const value = {
    isUnlocking,
    masterKey,
    securitySettings,
    unlock,
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
