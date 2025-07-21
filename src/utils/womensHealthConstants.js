// frontend/src/utils/womensHealthConstants.js
import {
  Heart,
  Brain,
  Thermometer,
  Moon,
  Activity,
  Droplets,
  Flower2,
  Sun,
  Shield,
  Zap,
  Coffee,
  Wind,
  Target,
  Sparkles,
  BarChart3,
} from "lucide-react";

export const WOMENS_HEALTH_EXPERIMENT_ICONS = {
  symptom_relief: Heart,
  symptom_management: Shield,
  hormonal_balance: Thermometer,
  cycle_optimization: Flower2,
  energy_vitality: Zap,
  sleep_wellness: Moon,
  cognitive_health: Brain,
  exercise_fitness: Activity,
  nutrition_hydration: Coffee,
  stress_management: Wind,
  mood_wellness: Sun,
  bone_health: Shield,
  general: BarChart3,
  wellness: Sparkles,
};

export const LIFE_STAGE_COLORS = {
  menstrual: {
    primary: "#EC4899", // Pink
    secondary: "#F472B6",
    accent: "#F9A8D4",
    gradient: "from-pink-600 to-rose-600",
  },
  perimenopause: {
    primary: "#8B5CF6", // Purple
    secondary: "#A78BFA",
    accent: "#C4B5FD",
    gradient: "from-purple-600 to-violet-600",
  },
  menopause: {
    primary: "#0EA5E9", // Sky blue
    secondary: "#38BDF8",
    accent: "#7DD3FC",
    gradient: "from-sky-600 to-blue-600",
  },
};

export const CYCLE_PHASE_INFO = {
  menstrual: {
    name: "Menstrual",
    icon: Droplets,
    color: "text-red-400",
    bgColor: "bg-red-600/20",
    days: "1-5",
    energy: "Low",
    focus: "Rest and recovery",
    recommendations: [
      "Gentle movement like yoga or walking",
      "Iron-rich foods",
      "Extra rest and self-care",
      "Avoid intense workouts",
    ],
  },
  follicular: {
    name: "Follicular",
    icon: Flower2,
    color: "text-pink-400",
    bgColor: "bg-pink-600/20",
    days: "6-14",
    energy: "Rising",
    focus: "New beginnings",
    recommendations: [
      "Try new activities",
      "Increase workout intensity",
      "Start new projects",
      "Social activities",
    ],
  },
  ovulation: {
    name: "Ovulation",
    icon: Sun,
    color: "text-yellow-400",
    bgColor: "bg-yellow-600/20",
    days: "14-16",
    energy: "Peak",
    focus: "High performance",
    recommendations: [
      "High-intensity workouts",
      "Important meetings or presentations",
      "Social events",
      "Creative projects",
    ],
  },
  luteal: {
    name: "Luteal",
    icon: Moon,
    color: "text-purple-400",
    bgColor: "bg-purple-600/20",
    days: "17-28",
    energy: "Declining",
    focus: "Completion and preparation",
    recommendations: [
      "Moderate exercise",
      "Complete ongoing tasks",
      "Meal prep and planning",
      "Stress management",
    ],
  },
  late_luteal: {
    name: "Late Luteal (PMS)",
    icon: Shield,
    color: "text-indigo-400",
    bgColor: "bg-indigo-600/20",
    days: "24-28",
    energy: "Low",
    focus: "Self-care and symptom management",
    recommendations: [
      "Gentle movement",
      "Magnesium-rich foods",
      "Stress reduction",
      "Extra sleep",
    ],
  },
};

export const COMMON_SYMPTOMS = {
  menstrual: [
    { name: "cramps", displayName: "Cramps", icon: Heart },
    { name: "headache", displayName: "Headache", icon: Brain },
    { name: "mood_swings", displayName: "Mood Swings", icon: Brain },
    { name: "bloating", displayName: "Bloating", icon: Droplets },
    { name: "fatigue", displayName: "Fatigue", icon: Moon },
    {
      name: "breast_tenderness",
      displayName: "Breast Tenderness",
      icon: Heart,
    },
    { name: "acne", displayName: "Acne", icon: Shield },
    { name: "food_cravings", displayName: "Food Cravings", icon: Coffee },
  ],
  perimenopause: [
    { name: "hot_flashes", displayName: "Hot Flashes", icon: Thermometer },
    { name: "night_sweats", displayName: "Night Sweats", icon: Droplets },
    {
      name: "irregular_periods",
      displayName: "Irregular Periods",
      icon: Activity,
    },
    { name: "mood_changes", displayName: "Mood Changes", icon: Brain },
    { name: "sleep_issues", displayName: "Sleep Issues", icon: Moon },
    { name: "brain_fog", displayName: "Brain Fog", icon: Wind },
    { name: "weight_gain", displayName: "Weight Gain", icon: Target },
    { name: "vaginal_dryness", displayName: "Vaginal Dryness", icon: Shield },
  ],
  menopause: [
    { name: "hot_flashes", displayName: "Hot Flashes", icon: Thermometer },
    { name: "night_sweats", displayName: "Night Sweats", icon: Droplets },
    { name: "mood_changes", displayName: "Mood Changes", icon: Brain },
    {
      name: "sleep_disturbances",
      displayName: "Sleep Disturbances",
      icon: Moon,
    },
    { name: "brain_fog", displayName: "Brain Fog", icon: Wind },
    { name: "joint_pain", displayName: "Joint Pain", icon: Activity },
    { name: "vaginal_dryness", displayName: "Vaginal Dryness", icon: Shield },
    { name: "decreased_libido", displayName: "Decreased Libido", icon: Heart },
  ],
};

export const EXPERIMENT_DIFFICULTY_LEVELS = {
  easy: {
    label: "Easy",
    description: "5-15 minutes daily, simple protocols",
    color: "text-emerald-400",
    bgColor: "bg-emerald-600/20",
    borderColor: "border-emerald-600/30",
  },
  medium: {
    label: "Medium",
    description: "15-30 minutes daily, moderate complexity",
    color: "text-amber-400",
    bgColor: "bg-amber-600/20",
    borderColor: "border-amber-600/30",
  },
  hard: {
    label: "Hard",
    description: "30+ minutes daily, requires dedication",
    color: "text-red-400",
    bgColor: "bg-red-600/20",
    borderColor: "border-red-600/30",
  },
};

export const EXPERIMENT_CATEGORIES = {
  symptom_relief: {
    name: "Symptom Relief",
    description: "Target specific symptoms for immediate relief",
    icon: Heart,
    color: "#EC4899",
  },
  hormonal_balance: {
    name: "Hormonal Balance",
    description: "Support natural hormone regulation",
    icon: Thermometer,
    color: "#8B5CF6",
  },
  cycle_optimization: {
    name: "Cycle Optimization",
    description: "Work with your natural rhythms",
    icon: Flower2,
    color: "#F472B6",
  },
  sleep_wellness: {
    name: "Sleep & Recovery",
    description: "Improve sleep quality and restoration",
    icon: Moon,
    color: "#6366F1",
  },
  cognitive_health: {
    name: "Brain & Focus",
    description: "Enhance mental clarity and memory",
    icon: Brain,
    color: "#3B82F6",
  },
  bone_health: {
    name: "Bone & Muscle",
    description: "Strengthen bones and maintain muscle",
    icon: Shield,
    color: "#10B981",
  },
};

export const PHASE_INTENSITY_MODIFIERS = {
  menstrual: {
    intensity: 0.7,
    focus: "gentle",
    modifications: [
      "Reduce intensity by 30%",
      "Focus on gentle movements",
      "Prioritize rest and recovery",
      "Listen to your body",
    ],
  },
  follicular: {
    intensity: 1.0,
    focus: "building",
    modifications: [
      "Full intensity appropriate",
      "Good time for new challenges",
      "Energy typically higher",
      "Build new habits",
    ],
  },
  ovulation: {
    intensity: 1.2,
    focus: "peak",
    modifications: [
      "Can handle maximum intensity",
      "Ideal for challenging protocols",
      "Social activities favored",
      "Peak performance window",
    ],
  },
  luteal: {
    intensity: 0.8,
    focus: "maintaining",
    modifications: [
      "Reduce intensity by 20%",
      "Focus on consistency",
      "Account for PMS symptoms",
      "Moderate activities",
    ],
  },
  late_luteal: {
    intensity: 0.6,
    focus: "supportive",
    modifications: [
      "Significantly reduce intensity",
      "Prioritize symptom management",
      "Extra self-care needed",
      "Gentle, nurturing approach",
    ],
  },
};

export const TRACKING_METRICS = {
  mood: {
    name: "Mood",
    icon: Brain,
    unit: "1-10",
    type: "scale",
  },
  energy: {
    name: "Energy",
    icon: Zap,
    unit: "1-10",
    type: "scale",
  },
  stress: {
    name: "Stress",
    icon: Wind,
    unit: "1-10",
    type: "scale",
  },
  sleep_hours: {
    name: "Sleep Hours",
    icon: Moon,
    unit: "hours",
    type: "number",
  },
  sleep_quality: {
    name: "Sleep Quality",
    icon: Moon,
    unit: "1-10",
    type: "scale",
  },
  hot_flash_count: {
    name: "Hot Flashes",
    icon: Thermometer,
    unit: "count",
    type: "number",
  },
  cramp_severity: {
    name: "Cramp Severity",
    icon: Heart,
    unit: "1-10",
    type: "scale",
  },
  symptom_count: {
    name: "Symptoms",
    icon: Shield,
    unit: "count",
    type: "number",
  },
};
