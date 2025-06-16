// src/components/womenshealth/tabs/EducationalResourcesTab.jsx
import React, { useState } from "react";
import {
  BookOpen,
  Play,
  Clock,
  Star,
  Heart,
  Brain,
  Users,
  Award,
  Search,
  Filter,
  ChevronRight,
  CheckCircle,
  Bookmark,
  Share,
  ThumbsUp,
  MessageCircle,
  Lightbulb,
  Target,
  Moon,
  Sun,
  Thermometer,
  Activity,
  Shield,
  Info,
} from "lucide-react";

const EducationalResourcesTab = ({ lifeStage, colors }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [showBookmarked, setShowBookmarked] = useState(false);

  // Educational content organized by life stage and category
  const educationalContent = {
    menstrual: [
      {
        id: 1,
        title: "Understanding Your Menstrual Cycle",
        category: "cycle-basics",
        type: "article",
        difficulty: "beginner",
        readTime: 8,
        rating: 4.8,
        bookmarked: true,
        completed: true,
        summary:
          "Comprehensive guide to the four phases of your menstrual cycle and what happens in each.",
        tags: ["hormones", "phases", "ovulation"],
        icon: Moon,
        color: colors.primary,
      },
      {
        id: 2,
        title: "Optimizing Your Diet Throughout Your Cycle",
        category: "nutrition",
        type: "guide",
        difficulty: "intermediate",
        readTime: 12,
        rating: 4.6,
        bookmarked: false,
        completed: false,
        summary:
          "Learn how to adjust your nutrition to support hormone production and manage symptoms.",
        tags: ["nutrition", "hormones", "energy"],
        icon: Heart,
        color: colors.accent,
      },
      {
        id: 3,
        title: "Exercise and Your Cycle: A Complete Guide",
        category: "fitness",
        type: "guide",
        difficulty: "intermediate",
        readTime: 15,
        rating: 4.7,
        bookmarked: true,
        completed: false,
        summary:
          "Sync your workouts with your cycle for maximum energy and results.",
        tags: ["exercise", "energy", "performance"],
        icon: Activity,
        color: colors.warning,
      },
      {
        id: 4,
        title: "Fertility Awareness Method Basics",
        category: "fertility",
        type: "course",
        difficulty: "intermediate",
        readTime: 25,
        rating: 4.9,
        bookmarked: false,
        completed: false,
        summary:
          "Master natural fertility tracking methods for family planning or health awareness.",
        tags: ["fertility", "tracking", "natural"],
        icon: Target,
        color: colors.secondary,
      },
    ],
    perimenopause: [
      {
        id: 5,
        title: "Perimenopause: What to Expect",
        category: "transition",
        type: "article",
        difficulty: "beginner",
        readTime: 10,
        rating: 4.8,
        bookmarked: true,
        completed: true,
        summary:
          "Everything you need to know about the perimenopause transition and its stages.",
        tags: ["perimenopause", "symptoms", "timeline"],
        icon: Thermometer,
        color: colors.warning,
      },
      {
        id: 6,
        title: "Managing Hot Flashes Naturally",
        category: "symptom-management",
        type: "guide",
        difficulty: "beginner",
        readTime: 8,
        rating: 4.5,
        bookmarked: false,
        completed: false,
        summary:
          "Natural strategies and lifestyle changes to reduce hot flash frequency and intensity.",
        tags: ["hot-flashes", "natural", "lifestyle"],
        icon: Sun,
        color: colors.danger,
      },
      {
        id: 7,
        title: "Hormone Replacement Therapy: Pros and Cons",
        category: "treatment",
        type: "article",
        difficulty: "advanced",
        readTime: 18,
        rating: 4.6,
        bookmarked: true,
        completed: false,
        summary:
          "Comprehensive overview of HRT options, benefits, and risks to inform your decisions.",
        tags: ["HRT", "hormones", "treatment"],
        icon: Shield,
        color: colors.secondary,
      },
    ],
    menopause: [
      {
        id: 8,
        title: "Thriving in Menopause",
        category: "wellness",
        type: "guide",
        difficulty: "beginner",
        readTime: 12,
        rating: 4.9,
        bookmarked: true,
        completed: false,
        summary:
          "Embrace this life stage with confidence and optimize your health for the years ahead.",
        tags: ["wellness", "mindset", "health"],
        icon: Sun,
        color: colors.secondary,
      },
      {
        id: 9,
        title: "Bone Health After Menopause",
        category: "health",
        type: "article",
        difficulty: "intermediate",
        readTime: 14,
        rating: 4.7,
        bookmarked: false,
        completed: false,
        summary:
          "Protect and strengthen your bones with targeted nutrition and exercise strategies.",
        tags: ["bone-health", "nutrition", "exercise"],
        icon: Shield,
        color: colors.accent,
      },
    ],
  };

  // Categories configuration
  const categories = [
    { id: "all", label: "All Topics", icon: BookOpen, count: 0 },
    { id: "cycle-basics", label: "Cycle Basics", icon: Moon, count: 0 },
    { id: "nutrition", label: "Nutrition", icon: Heart, count: 0 },
    { id: "fitness", label: "Exercise & Fitness", icon: Activity, count: 0 },
    {
      id: "symptom-management",
      label: "Symptom Management",
      icon: Shield,
      count: 0,
    },
    { id: "fertility", label: "Fertility", icon: Target, count: 0 },
    {
      id: "transition",
      label: "Life Transitions",
      icon: Thermometer,
      count: 0,
    },
    { id: "wellness", label: "Overall Wellness", icon: Star, count: 0 },
  ];

  // Get content for current life stage
  const currentContent =
    educationalContent[lifeStage] || educationalContent.menstrual;

  // Filter content based on search and category
  const filteredContent = currentContent.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" || item.difficulty === selectedDifficulty;
    const matchesBookmark = !showBookmarked || item.bookmarked;

    return (
      matchesSearch && matchesCategory && matchesDifficulty && matchesBookmark
    );
  });

  // Calculate category counts
  categories.forEach((category) => {
    if (category.id === "all") {
      category.count = currentContent.length;
    } else {
      category.count = currentContent.filter(
        (item) => item.category === category.id
      ).length;
    }
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600 bg-green-50 border-green-200";
      case "intermediate":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "advanced":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "article":
        return BookOpen;
      case "guide":
        return Lightbulb;
      case "course":
        return Play;
      default:
        return BookOpen;
    }
  };

  const lifeStageConfig = {
    menstrual: {
      title: "Reproductive Health Education",
      description: "Master your cycle and optimize your reproductive health",
      color: colors.primary,
      icon: Moon,
    },
    perimenopause: {
      title: "Transition Support Resources",
      description: "Navigate perimenopause with confidence and knowledge",
      color: colors.warning,
      icon: Thermometer,
    },
    menopause: {
      title: "Post-Menopause Wellness",
      description: "Thrive in your post-reproductive years",
      color: colors.secondary,
      icon: Sun,
    },
  };

  const currentStageConfig =
    lifeStageConfig[lifeStage] || lifeStageConfig.menstrual;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <currentStageConfig.icon
              className="w-8 h-8"
              style={{ color: currentStageConfig.color }}
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentStageConfig.title}
              </h2>
              <p className="text-gray-600">{currentStageConfig.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">
              {currentContent.length}
            </div>
            <div className="text-sm text-gray-600">Resources Available</div>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {currentContent.filter((c) => c.completed).length}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {currentContent.filter((c) => c.bookmarked).length}
            </div>
            <div className="text-xs text-gray-600">Bookmarked</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {Math.round(
                (currentContent.reduce((sum, c) => sum + c.rating, 0) /
                  currentContent.length) *
                  10
              ) / 10}
            </div>
            <div className="text-xs text-gray-600">Avg Rating</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search articles, guides, and courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <button
              onClick={() => setShowBookmarked(!showBookmarked)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showBookmarked
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Bookmarked
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {category.label}
                      </span>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredContent.map((content) => {
              const IconComponent = content.icon;
              const TypeIcon = getTypeIcon(content.type);
              const difficultyClass = getDifficultyColor(content.difficulty);

              return (
                <div
                  key={content.id}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                >
                  {/* Content Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${content.color}20` }}
                        >
                          <IconComponent
                            className="w-5 h-5"
                            style={{ color: content.color }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <TypeIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                              {content.type}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 leading-tight">
                            {content.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Bookmark
                            className={`w-4 h-4 ${
                              content.bookmarked
                                ? "fill-current text-emerald-600"
                                : "text-gray-400"
                            }`}
                          />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Share className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Content Summary */}
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {content.summary}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {content.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {content.readTime} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current text-yellow-400" />
                          {content.rating}
                        </div>
                      </div>

                      <div
                        className={`px-2 py-1 rounded-full text-xs border ${difficultyClass}`}
                      >
                        {content.difficulty}
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {content.completed && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">Completed</span>
                          </div>
                        )}
                      </div>

                      <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm">
                        {content.completed ? "Review" : "Start Reading"}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Results */}
          {filteredContent.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No content found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Try adjusting your search terms or filters to find the
                educational content you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Learning Path Recommendations */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Recommended Learning Path
        </h3>

        <div className="space-y-4">
          {lifeStage === "menstrual" && (
            <>
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-medium text-blue-900">
                    Start with Cycle Basics
                  </div>
                  <div className="text-sm text-blue-700">
                    Understand the fundamentals of your menstrual cycle and
                    hormone fluctuations
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-600" />
              </div>

              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div className="flex-1">
                  <div className="font-medium text-green-900">
                    Learn Cycle Syncing
                  </div>
                  <div className="text-sm text-green-700">
                    Optimize your nutrition and exercise based on your cycle
                    phases
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-green-600" />
              </div>

              <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-medium text-purple-900">
                    Advanced Tracking
                  </div>
                  <div className="text-sm text-purple-700">
                    Master fertility awareness and advanced symptom management
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-600" />
              </div>
            </>
          )}

          {lifeStage === "perimenopause" && (
            <>
              <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-medium text-orange-900">
                    Understand the Transition
                  </div>
                  <div className="text-sm text-orange-700">
                    Learn about perimenopause stages and what to expect
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-orange-600" />
              </div>

              <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div className="flex-1">
                  <div className="font-medium text-red-900">
                    Manage Symptoms
                  </div>
                  <div className="text-sm text-red-700">
                    Natural and medical approaches to common perimenopause
                    symptoms
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-red-600" />
              </div>

              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-medium text-blue-900">
                    Treatment Options
                  </div>
                  <div className="text-sm text-blue-700">
                    Explore HRT and other treatment approaches with
                    comprehensive information
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-600" />
              </div>
            </>
          )}

          {lifeStage === "menopause" && (
            <>
              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-medium text-amber-900">
                    Embrace the Change
                  </div>
                  <div className="text-sm text-amber-700">
                    Develop a positive mindset and celebrate this new life phase
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-600" />
              </div>

              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div className="flex-1">
                  <div className="font-medium text-green-900">
                    Optimize Health
                  </div>
                  <div className="text-sm text-green-700">
                    Focus on bone health, cardiovascular wellness, and
                    preventive care
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-green-600" />
              </div>

              <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-medium text-purple-900">Live Fully</div>
                  <div className="text-sm text-purple-700">
                    Explore new interests, relationships, and purposes in this
                    phase of life
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-600" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationalResourcesTab;
