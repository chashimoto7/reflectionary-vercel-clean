// frontend/src/App.jsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SecurityProvider, useSecurity } from "./contexts/SecurityContext";
import { supabase } from "./lib/supabase";
import UnlockModal from "./components/UnlockModal";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Layout from "./components/Layout";
import Welcome from "./pages/Welcome";

// Routers
import AnalyticsRouter from "./pages/AnalyticsRouter";
import JournalingRouter from "./pages/JournalingRouter";
import HistoryRouter from "./pages/HistoryRouter";
import GoalsRouter from "./pages/GoalsRouter";
import WellnessRouter from "./pages/WellnessRouter";
import WomensHealthRouter from "./pages/WomensHealthRouter";
import ReflectionarianRouter from "./pages/ReflectionarianRouter";
import SettingsRouter from "./pages/SettingsRouter";

if (typeof window !== "undefined") {
  window.supabase = supabase;
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { isLocked, isUnlocking } = useSecurity();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasNavigatedToWelcome, setHasNavigatedToWelcome] = useState(false);

  // Handle authentication state changes
  useEffect(() => {
    // Don't do anything while auth is loading
    if (authLoading) return;

    // If user is not logged in and trying to access protected routes
    if (
      !user &&
      location.pathname !== "/" &&
      location.pathname !== "/login" &&
      location.pathname !== "/signup"
    ) {
      navigate("/login");
      return;
    }

    // Navigate to welcome page only once after successful login
    if (
      user &&
      !isLocked &&
      !hasNavigatedToWelcome &&
      (location.pathname === "/" || location.pathname === "/login")
    ) {
      setHasNavigatedToWelcome(true);
      navigate("/welcome", { replace: true });
    }
  }, [
    user,
    isLocked,
    authLoading,
    location.pathname,
    navigate,
    hasNavigatedToWelcome,
  ]);

  // Reset navigation flag when user logs out
  useEffect(() => {
    if (!user) {
      setHasNavigatedToWelcome(false);
    }
  }, [user]);

  // Show loading state while auth is initializing
  if (authLoading || isUnlocking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your secure journal...</p>
        </div>
      </div>
    );
  }

  // Public routes (no authentication required)
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Show unlock modal if app is locked
  if (isLocked) {
    return <UnlockModal />;
  }

  // Authenticated routes
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/journaling/*" element={<JournalingRouter />} />
        <Route path="/history/*" element={<HistoryRouter />} />
        <Route path="/goals/*" element={<GoalsRouter />} />
        <Route path="/analytics/*" element={<AnalyticsRouter />} />
        <Route path="/wellness/*" element={<WellnessRouter />} />
        <Route path="/womens-health/*" element={<WomensHealthRouter />} />
        <Route path="/reflectionarian/*" element={<ReflectionarianRouter />} />
        <Route path="/settings/*" element={<SettingsRouter />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SecurityProvider>
          <AppContent />
        </SecurityProvider>
      </AuthProvider>
    </Router>
  );
}
