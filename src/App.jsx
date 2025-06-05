// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { EncryptionProvider } from "./contexts/EncryptionContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import NewEntry from "./pages/NewEntry";
import History from "./pages/history";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import EmotionalOverviewModal from "./components/EmotionalOverviewModal";
import Goals from "./pages/Goals";
import AnalyticsDashboard from "./components/AnalyticsDashboard";

function App() {
  return (
    <AuthProvider>
      <EncryptionProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/new-entry" replace />} />
            <Route path="new-entry" element={<NewEntry />} />
            <Route path="history" element={<History />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route
              path="emotional-overview"
              element={<EmotionalOverviewModal />}
            />
            <Route path="goals" element={<Goals />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Routes>
      </EncryptionProvider>
    </AuthProvider>
  );
}

export default App;
