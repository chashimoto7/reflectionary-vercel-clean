import AnalyticsDashboard from "../components/AnalyticsDashboard";

export default function Analytics() {
  return (
    <div className="font-sans max-w-4xl mx-auto p-6 space-y-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Analytics</h1>
      <AnalyticsDashboard />
    </div>
  );
}
