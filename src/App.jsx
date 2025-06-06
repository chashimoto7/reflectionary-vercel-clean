// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SecurityProvider, useSecurity } from "./contexts/SecurityContext";

// Components
import LoginPage from "./pages/LoginPage";
import UnlockModal from "./components/UnlockModal";
import Layout from "./components/Layout";

// Pages
import NewEntryPage from "./pages/NewEntry";
import HistoryPage from "./pages/history";
import GoalsPage from "./pages/Goals";
import SecuritySettingsPage from "./pages/SecuritySettingsPage";

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { isLocked, isUnlocking } = useSecurity(); // added isUnlocking

  // Show loading during initial auth check
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
        <Route path="/" element={<Navigate to="/new-entry" replace />} />
        <Route path="/new-entry" element={<NewEntryPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/security" element={<SecuritySettingsPage />} />
        <Route path="*" element={<Navigate to="/new-entry" replace />} />
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
