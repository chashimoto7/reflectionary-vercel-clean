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
  const [isLocked, setIsLocked] = useState(true); // 🔑 This is the main lock flag!
  const [masterKey, setMasterKey] = useState(null);
  const [securitySettings, setSecuritySettings] = useState({
    autoLockEnabled: false,
    autoLockTimeout: null,
    showLockStatus: true,
  });

  const autoLockTimer = useRef(null);
  const lastActivity = useRef(Date.now());

  // Lock whenever the user logs out or user is null
  useEffect(() => {
    if (!user) {
      setIsLocked(true);
      setMasterKey(null);
      clearAutoLockTimer();
    }
  }, [user]);

  // Auto-lock timer logic
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

  async function unlock(email, password) {
    if (!email) throw new Error("No email provided for unlock");
    setIsUnlocking(true);
    try {
      const key = await encryptionService.generateMasterKey(email, password);
      setMasterKey(key);
      setIsLocked(false);
      lastActivity.current = Date.now();
      return true;
    } catch (error) {
      throw new Error("Invalid password");
    } finally {
      setIsUnlocking(false);
    }
  }

  function lock() {
    setIsLocked(true);
    setMasterKey(null);
    clearAutoLockTimer();
  }

  function updateSecuritySettings(newSettings) {
    setSecuritySettings((prev) => ({ ...prev, ...newSettings }));
  }

  const value = {
    isUnlocking,
    isLocked,
    masterKey,
    unlock,
    lock,
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
