// Add Activity to the existing imports in Welcome.jsx:
import {
  Sparkles,
  TrendingUp,
  Shield,
  Brain,
  Heart,
  Clock,
  ChevronRight,
  Quote,
  Bell,
  Calendar,
  BarChart3,
  Target,
  Lightbulb,
  Award,
  ArrowRight,
  Activity, // <-- ADD THIS LINE
} from "lucide-react";

// Then replace the quickActions array with this updated version:
const quickActions = [
  {
    icon: Brain,
    title: "New Entry",
    description: "Start your reflection",
    href: "/journaling", // → Points to JournalingRouter
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "View your insights",
    href: "/analytics", // → Points to AnalyticsRouter
    color: "from-cyan-500 to-cyan-600",
  },
  {
    icon: Target,
    title: "Goals",
    description: "Track progress",
    href: "/goals", // → Points to GoalsRouter
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Activity, // <-- NEW WELLNESS ACTION
    title: "Wellness",
    description: "Track your wellbeing",
    href: "/wellness", // → Points to WellnessRouter
    color: "from-rose-500 to-rose-600",
  },
  {
    icon: Calendar,
    title: "History",
    description: "Browse entries",
    href: "/history", // → Points to HistoryRouter
    color: "from-amber-500 to-amber-600",
  },
];

// You might also want to update the grid to show 5 items nicely.
// In the Quick Actions section, change the grid classes from:
// "grid grid-cols-1 sm:grid-cols-2 gap-4"
// to:
// "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
