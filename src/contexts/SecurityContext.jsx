import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";

const SecurityContext = createContext({});

export function SecurityProvider({ children }) {
  const { user } = useAuth();

  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLocked, setIsLocked] = useState(
    () => localStorage.getItem("isLocked") !== "false"
  );

  const [securitySettings, setSecuritySettings] = useState({
    autoLockEnabled: false,
    autoLockTimeout: null,
    showLockStatus: true,
  });

  const autoLockTimer = useRef(null);
  const lastActivity = useRef(Date.now());

  // Lock when user logs out
  useEffect(() => {
    if (!user) {
      lock();
    }
  }, [user]);

  // Auto-lock timer setup
  useEffect(() => {
    if (
      securitySettings.autoLockEnabled &&
      securitySettings.autoLockTimeout &&
      user &&
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
    user,
    isLocked,
  ]);

  // Activity tracking for auto-lock
  useEffect(() => {
    if (!securitySettings.autoLockEnabled || !user || isLocked) return;

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
  }, [securitySettings.autoLockEnabled, user, isLocked]);

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

  function unlock() {
    setIsLocked(false);
    localStorage.setItem("isLocked", "false");
    lastActivity.current = Date.now();
  }

  function lock() {
    setIsLocked(true);
    localStorage.setItem("isLocked", "true");
    clearAutoLockTimer();
  }

  function setLocked(value) {
    setIsLocked(value);
    localStorage.setItem("isLocked", value ? "true" : "false");
    if (!value) lastActivity.current = Date.now();
  }

  function updateSecuritySettings(newSettings) {
    setSecuritySettings((prev) => ({ ...prev, ...newSettings }));
  }

  const value = {
    isUnlocking,
    isLocked,
    unlock,
    lock,
    setLocked,
    securitySettings,
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
