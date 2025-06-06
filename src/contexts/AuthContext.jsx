// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event, session?.user?.email);

      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        if (session?.user) {
          setUser(session.user);
          console.log("User set:", session.user.email);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        console.log("User signed out");
      }
      // Ignore TOKEN_REFRESHED to avoid complexity
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Session check error:", error);
        setUser(null);
      } else if (session?.user) {
        setUser(session.user);
        console.log("Session found for:", session.user.email);
      } else {
        setUser(null);
        console.log("No active session");
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    console.log("Attempting sign in for:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error);
      throw error;
    }

    console.log("Sign in successful:", data.user?.email);
    // User state will be updated by the auth listener
    return { user: data.user, password }; // Return password for encryption
  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async function signOut() {
    console.log("Signing out user");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
    }
    // User state will be updated by the auth listener
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
