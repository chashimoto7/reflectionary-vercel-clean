// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import supabase from "../supabaseClient";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [userPassword, setUserPassword] = useState(null); // Store for encryption

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
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Clear password when user signs out
      if (event === "SIGNED_OUT") {
        setUserPassword(null);
      }

      // Handle user profile creation/update on sign up or sign in
      if (event === "SIGNED_IN" && session?.user) {
        await handleUserProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
    userPassword, // Expose for encryption context
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
