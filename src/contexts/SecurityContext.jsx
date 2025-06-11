// src/contexts/SecurityContext.jsx
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
  const { user, loading: authLoading } = useAuth(); // Get loading state from AuthContext

  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLocked, setIsLocked] = useState(() => {
    const stored = localStorage.getItem("isLocked");
    console.log("🔒 Initial lock state from localStorage:", stored);
    return stored !== "false";
  });

  const [securitySettings, setSecuritySettings] = useState({
    autoLockEnabled: false,
    autoLockTimeout: null,
    showLockStatus: true,
  });

  const autoLockTimer = useRef(null);
  const lastActivity = useRef(Date.now());
  const hasInitialized = useRef(false); // Track if we've finished initial load

  // Lock when user logs out (but NOT during initial loading)
  useEffect(() => {
    // Wait for AuthContext to finish loading before making decisions
    if (authLoading) {
      console.log("🔄 Auth still loading, waiting...");
      return;
    }

    // Mark that we've finished initialization
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      console.log(
        "✅ Auth initialization complete, user:",
        user?.email || "none"
      );

      // If user exists but app is locked, this is likely a page refresh while logged in
      if (user && isLocked) {
        console.log(
          "🔓 User found after initialization, keeping locked state from localStorage"
        );
        // Keep the locked state as-is (from localStorage)
      } else if (!user && !isLocked) {
        console.log("🔒 No user found after initialization, locking app");
        lock();
      }
      return;
    }

    // Only lock on actual logout (after initialization is complete)
    if (!user) {
      console.log("🔒 User logged out, locking app");
      lock();
    }
  }, [user, authLoading, isLocked]);

  // Auto-lock timer setup
  useEffect(() => {
    if (
      securitySettings.autoLockEnabled &&
      securitySettings.autoLockTimeout &&
      user &&
      !isLocked &&
      hasInitialized.current
    ) {
      console.log("🔒 Starting auto-lock timer");
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
    if (
      !securitySettings.autoLockEnabled ||
      !user ||
      isLocked ||
      !hasInitialized.current
    )
      return;

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
    }, 30000);
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
    console.trace("🔄 setLocked call stack");
    setIsLocked(value);
    localStorage.setItem("isLocked", value ? "true" : "false");
    if (!value) lastActivity.current = Date.now();
  }

  function updateSecuritySettings(newSettings) {
    console.log("⚙️ Updating security settings:", newSettings);
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
