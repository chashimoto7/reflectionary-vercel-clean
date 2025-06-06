// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});

// Export the useAuth hook so other files can import it
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

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
  }, [authContext.lastAuthTime, authContext.isInitialLoad]); // Add dependencies to prevent stale closure issues

  // Handle user profile creation and updates
  const handleUserProfile = async (user) => {
    try {
      // Check if user profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // Error other than "not found"
        console.error("Error fetching user profile:", fetchError);
        return;
      }

      if (!existingProfile) {
        // Create new user profile
        const { error: insertError } = await supabase
          .from("user_profiles")
          .insert([
            {
              user_id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || "",
              subscription_tier: "free",
              subscription_status: "active",
              created_at: new Date().toISOString(),
            },
          ]);

        if (insertError) {
          console.error("Error creating user profile:", insertError);
        } else {
          console.log("User profile created successfully");
        }

        // Create default user settings
        const { error: settingsError } = await supabase
          .from("user_settings")
          .insert([
            {
              user_id: user.id,
              created_at: new Date().toISOString(),
            },
          ]);

        if (settingsError) {
          console.error("Error creating user settings:", settingsError);
        }
      }
    } catch (error) {
      console.error("Error handling user profile:", error);
    }
  };

  // Authentication methods that your application uses
  const signUp = async (email, password, options = {}) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: options.metadata || {},
        },
      });

      // Store password for encryption (only on successful signup)
      if (!error && data.user) {
        setUserPassword(password);
      }

      return { data, error };
    } catch (error) {
      console.error("Sign up error:", error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Store password for encryption (only on successful signin)
      if (!error && data.user) {
        setUserPassword(password);
      }

      return { data, error };
    } catch (error) {
      console.error("Sign in error:", error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      setUserPassword(null); // Clear password on sign out
      return { error };
    } catch (error) {
      console.error("Sign out error:", error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { data, error };
    } catch (error) {
      console.error("Reset password error:", error);
      return { data: null, error };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      // Update stored password for encryption
      if (!error) {
        setUserPassword(newPassword);
      }

      return { data, error };
    } catch (error) {
      console.error("Update password error:", error);
      return { data: null, error };
    }
  };

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
