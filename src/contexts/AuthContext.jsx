// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});

// Enhanced AuthContext that distinguishes between different types of auth events
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [userPassword, setUserPassword] = useState(null);

  // Add state to track authentication context
  const [authContext, setAuthContext] = useState({
    isInitialLoad: true,
    lastAuthEvent: null,
    lastAuthTime: null,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        setAuthContext((prev) => ({
          ...prev,
          isInitialLoad: false,
          lastAuthEvent: "INITIAL_SESSION",
          lastAuthTime: Date.now(),
        }));
      }
      setLoading(false);
    };

    getInitialSession();

    // Enhanced auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const timestamp = new Date().toISOString();
      const now = Date.now();

      console.log(
        `[${timestamp}] Auth state changed:`,
        event,
        session ? "Session exists" : "No session"
      );

      // Determine if this is a significant auth change or routine validation
      const timeSinceLastAuth = authContext.lastAuthTime
        ? now - authContext.lastAuthTime
        : Infinity;
      const isSignificantChange =
        event === "SIGNED_OUT" ||
        (event === "SIGNED_IN" && timeSinceLastAuth > 30000) || // More than 30 seconds
        authContext.isInitialLoad;

      console.log(`[${timestamp}] Auth event significance:`, {
        event,
        isSignificant: isSignificantChange,
        timeSinceLastAuth,
        isInitialLoad: authContext.isInitialLoad,
      });

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Update auth context with event information
      setAuthContext({
        isInitialLoad: false,
        lastAuthEvent: event,
        lastAuthTime: now,
        isSignificantChange,
      });

      // Clear password when user signs out
      if (event === "SIGNED_OUT") {
        console.log(`[${timestamp}] Handling sign out event`);
        setUserPassword(null);
      }

      // Handle user profile creation/update only on significant sign-in events
      if (event === "SIGNED_IN" && session?.user && isSignificantChange) {
        console.log(
          `[${timestamp}] Handling significant sign in event for user:`,
          session.user.id
        );
        await handleUserProfile(session.user);
      } else if (event === "SIGNED_IN" && !isSignificantChange) {
        console.log(`[${timestamp}] Ignoring routine auth validation event`);
      }

      // Log token refresh events specifically
      if (event === "TOKEN_REFRESHED") {
        console.log(`[${timestamp}] Token refresh occurred`);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Rest of your existing AuthContext methods remain the same...

  const value = {
    user,
    session,
    loading,
    userPassword,
    authContext, // Expose auth context information
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
