import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import EmotionalOverviewModal from "../components/EmotionalOverviewModal";
import {
  NotebookPen,
  AlignLeft,
  Smile,
  ListTree,
  Activity,
} from "lucide-react";

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const handleTileClick = (tile) => {
    if (tile === "emotions") {
      setModalOpen(true);
    } else {
      navigate(`/analytics/${tile}`);
    }
  };

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="flex gap-2 mb-6 justify-center">
        {["Lifetime", "Year", "Month", "Week"].map((range) => (
          <button
            key={range}
            className="px-4 py-1 border rounded-md text-sm hover:bg-gray-100"
          >
            {range}
          </button>
        ))}
      </div>

      {/* Dashboard Tiles */}
      <div className="space-y-4">
        {/* Journaling Activity */}
        <div
          onClick={() => handleTileClick("journaling-activity")}
          className="flex items-center gap-4 p-6 border rounded-lg shadow hover:bg-gray-50 cursor-pointer"
        >
          <NotebookPen size={36} className="text-purple-800" />
          <span className="text-lg font-semibold text-gray-800">
            You’ve journaled <strong>3 times this week</strong> and <strong>7 times this month</strong>
          </span>
        </div>

        {/* Word Count */}
        <div
          onClick={() => handleTileClick("word-count")}
          className="flex items-center gap-4 p-6 border rounded-lg shadow hover:bg-gray-50 cursor-pointer"
        >
          <AlignLeft size={38} className="text-purple-800" />
          <span className="text-base font-lg text-gray-800">Word Count Over Time</span>
        </div>

        {/* Emotional Overview */}
        <div
          onClick={() => handleTileClick("emotions")}
          className="flex items-center gap-4 p-6 border rounded-lg shadow hover:bg-gray-50 cursor-pointer"
        >
          <Smile size={38} className="text-purple-800" />
          <span className="text-base font-lg text-gray-800">Emotional Overview</span>
        </div>

        {/* Common Topics */}
        <div
          onClick={() => handleTileClick("topics")}
          className="flex items-center gap-4 p-6 border rounded-lg shadow hover:bg-gray-50 cursor-pointer"
        >
          <ListTree size={38} className="text-purple-800" />
          <span className="text-base font-lg text-gray-800">Common Topics</span>
        </div>

        {/* Tone Trends */}
        <div
          onClick={() => handleTileClick("tone-trends")}
          className="flex items-center gap-4 p-6 border rounded-lg shadow hover:bg-gray-50 cursor-pointer"
        >
          <Activity size={38} className="text-purple-800" />
          <span className="text-base font-lg text-gray-800">Tone Trends</span>
        </div>
      </div>

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <EmotionalOverviewModal />
        </Modal>
      )}
    </div>
  );
}
