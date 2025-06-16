// src/App.jsx
import React from "react";
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

if (typeof window !== "undefined") {
  window.supabase = supabase;
}

// Pages
import LoginPage from "./pages/LoginPage";
import Layout from "./components/Layout";
import Welcome from "./pages/Welcome";
import SecuritySettingsPage from "./pages/SecuritySettingsPage";

// Routers that handle standard/advanced versions
import AnalyticsRouter from "./pages/AnalyticsRouter";
import JournalingRouter from "./pages/JournalingRouter";
import HistoryRouter from "./pages/HistoryRouter";
import GoalsRouter from "./pages/GoalsRouter";
import WellnessRouter from "./pages/WellnessRouter";

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { isLocked, isUnlocking } = useSecurity();
  const navigate = useNavigate();
  const location = useLocation();
  const [showedWelcome, setShowedWelcome] = React.useState(false);

  // Show /welcome **once** after unlock, not on every route change!
  React.useEffect(() => {
    // Only redirect to welcome if we're on the root path "/"
    if (user && !isLocked && !showedWelcome && location.pathname === "/") {
      setShowedWelcome(true);
      navigate("/welcome", { replace: true });
    }
    // If user logs out, reset
    if (!user) {
      setShowedWelcome(false);
    }
  }, [user, isLocked, showedWelcome, navigate, location.pathname]);

  if (authLoading || isUnlocking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (isLocked) {
    return <UnlockModal />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/journaling" element={<JournalingRouter />} />
        <Route path="/history" element={<HistoryRouter />} />
        <Route path="/goals" element={<GoalsRouter />} />
        <Route path="/security" element={<SecuritySettingsPage />} />
        <Route path="/analytics" element={<AnalyticsRouter />} />
        <Route path="/wellness" element={<WellnessRouter />} />
        <Route path="/security" element={<SecuritySettingsPage />} />
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
