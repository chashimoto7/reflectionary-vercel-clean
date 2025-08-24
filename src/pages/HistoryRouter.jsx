// frontend/ src/pages/HistoryRouter.jsx - Redirects to journaling pages (history is now integrated)
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMembership } from "../hooks/useMembership";

const HistoryRouter = () => {
  const { tier, loading } = useMembership();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && tier) {
      // Redirect to the appropriate journaling page with history tab active
      // Since history is now integrated into journaling pages
      console.log("📖 HistoryRouter: Redirecting to journaling page with history tab");
      
      // Add a URL parameter to indicate we want the history tab active
      navigate(`/journal?tab=history`, { replace: true });
    }
  }, [tier, loading, navigate]);

  // Show loading while membership is being determined or redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-purple-300">Redirecting to your journal history...</p>
      </div>
    </div>
  );
};

export default HistoryRouter;