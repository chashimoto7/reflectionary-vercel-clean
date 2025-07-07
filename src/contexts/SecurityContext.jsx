// frontend/ src/contexts/SecurityContext.jsx
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
  const { user, loading: authLoading } = useAuth();

  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLocked, setIsLocked] = useState(() => {
    // Check if there's a valid session
    const hasSession = localStorage.getItem("hasActiveSession") === "true";
    const storedLockState = localStorage.getItem("isLocked");

    // If no session exists, app should be locked
    if (!hasSession) {
      return true;
    }

    // Otherwise, respect the stored lock state
    return storedLockState === "true";
  });

  const [securitySettings, setSecuritySettings] = useState(() => {
    const stored = localStorage.getItem("securitySettings");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fallback to defaults
      }
    }
    return {
      autoLockEnabled: false,
      autoLockTimeout: null,
      showLockStatus: true,
    };
  });

  const autoLockTimer = useRef(null);
  const lastActivity = useRef(Date.now());
  const hasInitialized = useRef(false);

  // Handle browser/tab close - mark session as ended
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("hasActiveSession");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Initialize security state after auth loads
  useEffect(() => {
    if (authLoading) return;

    if (!hasInitialized.current) {
      hasInitialized.current = true;

      if (user) {
        // User is logged in
        const hasSession = localStorage.getItem("hasActiveSession") === "true";

        if (!hasSession) {
          // This is a fresh login or return after browser close
          console.log("🔒 No active session found, locking for security");
          lock();
        } else {
          // Active session exists, respect stored lock state
          const storedLockState = localStorage.getItem("isLocked") === "true";
          setIsLocked(storedLockState);
        }

        // Mark session as active
        localStorage.setItem("hasActiveSession", "true");
      } else {
        // No user, ensure app is locked
        lock();
      }
    }
  }, [user, authLoading]);

  // Lock when user logs out
  useEffect(() => {
    if (hasInitialized.current && !user) {
      console.log("🔒 User logged out, locking app");
      lock();
      localStorage.removeItem("hasActiveSession");
    }
  }, [user]);

  // Auto-lock timer setup
  useEffect(() => {
    if (
      securitySettings.autoLockEnabled &&
      securitySettings.autoLockTimeout &&
      user &&
      !isLocked &&
      hasInitialized.current
    ) {
      console.log("⏱️ Starting auto-lock timer");
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
        console.log("🔒 Auto-lock triggered due to inactivity");
        lock();
      }
    }, 30000); // Check every 30 seconds
  }

  function clearAutoLockTimer() {
    if (autoLockTimer.current) {
      clearInterval(autoLockTimer.current);
      autoLockTimer.current = null;
    }
  }

  function unlock() {
    console.log("🔓 Unlocking app");
    setIsLocked(false);
    localStorage.setItem("isLocked", "false");
    localStorage.setItem("hasActiveSession", "true");
    lastActivity.current = Date.now();
  }

  function lock() {
    console.log("🔒 Locking app");
    setIsLocked(true);
    localStorage.setItem("isLocked", "true");
    clearAutoLockTimer();
  }

  function setLocked(value) {
    console.log("🔄 setLocked called with:", value);
    setIsLocked(value);
    localStorage.setItem("isLocked", value ? "true" : "false");
    if (!value) {
      lastActivity.current = Date.now();
      localStorage.setItem("hasActiveSession", "true");
    }
  }

  function updateSecuritySettings(newSettings) {
    console.log("⚙️ Updating security settings:", newSettings);
    const updated = { ...securitySettings, ...newSettings };
    setSecuritySettings(updated);
    localStorage.setItem("securitySettings", JSON.stringify(updated));
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
