// frontend/src/App.jsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SecurityProvider, useSecurity } from "./contexts/SecurityContext";
import { supabase } from "./lib/supabase";
import UnlockModal from "./components/UnlockModal";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SignupSuccess from "./pages/SignupSuccess";
import SignupCancelled from "./pages/SignupCancelled";
import Layout from "./components/Layout";
import Welcome from "./pages/Welcome";

// Routers - Updated for new tier structure (Growth $15, Premium $25)
// Removed: Analytics, Goals, Wellness, Women's Health
import JournalingRouter from "./pages/JournalingRouter";
import HistoryRouter from "./pages/HistoryRouter";
import ReflectionarianRouter from "./pages/ReflectionarianRouter";
import SettingsRouter from "./pages/SettingsRouter";
import BlogRouter from "./pages/BlogRouter";

if (typeof window !== "undefined") {
  window.supabase = supabase;
}

// Separate component for public routes - no hooks used here
function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/blog/*" element={<BlogRouter />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signup-success" element={<SignupSuccess />} />
      <Route path="/signup-cancelled" element={<SignupCancelled />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Separate component for authenticated routes
function AuthenticatedRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isLocked } = useSecurity();
  const [hasNavigatedToWelcome, setHasNavigatedToWelcome] = useState(false);

  // Handle initial navigation after login
  useEffect(() => {
    if (
      user &&
      !isLocked &&
      !hasNavigatedToWelcome &&
      (location.pathname === "/" || location.pathname === "/login")
    ) {
      setHasNavigatedToWelcome(true);
      navigate("/welcome", { replace: true });
    }
  }, [user, isLocked, location.pathname, navigate, hasNavigatedToWelcome]);

  // Show unlock modal if app is locked
  if (isLocked) {
    return <UnlockModal />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/blog/*" element={<BlogRouter />} />
        <Route path="/journaling/*" element={<JournalingRouter />} />
        <Route path="/history/*" element={<HistoryRouter />} />
        <Route path="/knowledge-garden/*" element={<div>Knowledge Garden - Coming Soon</div>} />
        <Route path="/reflectionarian/*" element={<ReflectionarianRouter />} />
        <Route path="/settings/*" element={<SettingsRouter />} />
        {/* Legacy redirects for removed features */}
        <Route path="/analytics/*" element={<Navigate to="/welcome" replace />} />
        <Route path="/goals/*" element={<Navigate to="/welcome" replace />} />
        <Route path="/wellness/*" element={<Navigate to="/welcome" replace />} />
        <Route path="/womens-health/*" element={<Navigate to="/welcome" replace />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </Layout>
  );
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { isUnlocking } = useSecurity();
  const location = useLocation();

  // Handle authentication state changes - redirect without useNavigate
  useEffect(() => {
    // Don't do anything while auth is loading
    if (authLoading) return;

    // If user is not logged in and trying to access protected routes
    if (
      !user &&
      location.pathname !== "/" &&
      location.pathname !== "/login" &&
      location.pathname !== "/signup" &&
      location.pathname !== "/signup-success" &&
      location.pathname !== "/signup-cancelled" &&
      !location.pathname.startsWith("/blog")
    ) {
      window.location.href = "/login";
      return;
    }
  }, [user, authLoading, location.pathname]);

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

  // Render appropriate routes based on auth state
  if (!user) {
    return <PublicRoutes />;
  }

  return <AuthenticatedRoutes />;
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
