// src/components/womenshealth/tabs/HealthLibraryTab.jsx
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Heart,
  Brain,
  Activity,
  Moon,
  Sun,
  Flower2,
  Video,
  FileText,
  Download,
  ExternalLink,
  Clock,
  Star,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Info,
  AlertCircle,
  CheckCircle,
  Bookmark,
  Share2,
  Printer,
  Tag,
  Calendar,
  User,
  Lock,
  Unlock,
} from "lucide-react";
import { format } from "date-fns";

const HealthLibraryTab = ({ colors, user, lifeStage }) => {
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStage, setSelectedStage] = useState(lifeStage);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddContent, setShowAddContent] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  const [isAdmin, setIsAdmin] = useState(true); // For demo - would check actual admin status

  // Library content
  const [libraryContent, setLibraryContent] = useState([]);

  // Categories
  const categories = [
    { id: "all", name: "All Resources", icon: BookOpen, color: colors.primary },
    { id: "basics", name: "Basics", icon: Info, color: colors.secondary },
    { id: "symptoms", name: "Symptoms", icon: Activity, color: colors.accent },
    { id: "treatments", name: "Treatments", icon: Heart, color: colors.danger },
    { id: "lifestyle", name: "Lifestyle", icon: Sun, color: colors.warning },
    { id: "mental", name: "Mental Health", icon: Brain, color: colors.emerald },
    { id: "nutrition", name: "Nutrition", icon: Apple, color: colors.amber },
    { id: "research", name: "Research", icon: FileText, color: colors.rose },
  ];

  // Life stages for filtering
  const lifeStages = [
    { id: "all", name: "All Stages", icon: Heart },
    { id: "menstrual", name: "Menstrual", icon: Moon },
    { id: "perimenopause", name: "Perimenopause", icon: Sun },
    { id: "menopause", name: "Menopause", icon: Flower2 },
  ];

  // Content types
  const contentTypes = {
    article: { icon: FileText, color: "text-blue-400" },
    video: { icon: Video, color: "text-red-400" },
    guide: { icon: BookOpen, color: "text-green-400" },
    research: { icon: FileText, color: "text-purple-400" },
  };

  useEffect(() => {
    loadLibraryContent();
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const loadLibraryContent = () => {
    // Mock data - will be replaced with database
    const mockContent = [
      {
        id: 1,
        title: "Understanding Your Menstrual Cycle",
        category: "basics",
        type: "article",
        stages: ["menstrual"],
        readTime: "5 min",
        author: "Dr. Sarah Johnson",
        date: "2024-01-15",
        featured: true,
        description:
          "A comprehensive guide to understanding the four phases of your menstrual cycle and how hormones affect your body.",
        tags: ["hormones", "cycle", "basics"],
        content: "Full article content would go here...",
      },
      {
        id: 2,
        title: "Managing Hot Flashes Naturally",
        category: "symptoms",
        type: "guide",
        stages: ["perimenopause", "menopause"],
        readTime: "8 min",
        author: "Dr. Emily Chen",
        date: "2024-02-10",
        featured: true,
        description:
          "Evidence-based strategies for reducing hot flash frequency and severity without hormone therapy.",
        tags: ["hot flashes", "natural remedies", "symptoms"],
        content: "Full guide content would go here...",
      },
      {
        id: 3,
        title: "Hormone Therapy: Benefits and Risks",
        category: "treatments",
        type: "video",
        stages: ["perimenopause", "menopause"],
        duration: "12 min",
        author: "Dr. Michael Brown",
        date: "2024-01-20",
        featured: false,
        description:
          "An honest discussion about hormone replacement therapy, who it's for, and what to consider.",
        tags: ["HRT", "treatment", "hormones"],
        videoUrl: "https://example.com/video",
      },
      {
        id: 4,
        title: "Exercise During Perimenopause",
        category: "lifestyle",
        type: "guide",
        stages: ["perimenopause"],
        readTime: "10 min",
        author: "Lisa Martinez, PT",
        date: "2024-02-01",
        featured: false,
        description:
          "The best exercises for managing symptoms and maintaining bone health during perimenopause.",
        tags: ["exercise", "bone health", "strength"],
        content: "Full guide content would go here...",
      },
      {
        id: 5,
        title: "Nutrition for Menopause",
        category: "nutrition",
        type: "article",
        stages: ["menopause"],
        readTime: "7 min",
        author: "Rachel Green, RD",
        date: "2024-01-25",
        featured: true,
        description:
          "Dietary changes that can help manage menopausal symptoms and support overall health.",
        tags: ["diet", "nutrition", "calcium"],
        content: "Full article content would go here...",
      },
      {
        id: 6,
        title: "Latest Research on Perimenopause",
        category: "research",
        type: "research",
        stages: ["perimenopause"],
        readTime: "15 min",
        author: "Research Team",
        date: "2024-02-15",
        featured: false,
        description:
          "Summary of recent studies on perimenopause symptoms, treatments, and long-term health outcomes.",
        tags: ["research", "studies", "science"],
        content: "Full research summary would go here...",
      },
    ];

    setLibraryContent(mockContent);
  };

  const getFilteredContent = () => {
    return libraryContent.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesStage =
        selectedStage === "all" || item.stages.includes(selectedStage);
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesCategory && matchesStage && matchesSearch;
    });
  };

  const handleBookmark = (itemId) => {
    setBookmarkedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleDeleteContent = (itemId) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      setLibraryContent((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  const AddContentForm = () => {
    const [newContent, setNewContent] = useState({
      title: "",
      category: "basics",
      type: "article",
      stages: [],
      author: "",
      description: "",
      tags: "",
      content: "",
      featured: false,
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const content = {
        ...newContent,
        id: Date.now(),
        date: new Date().toISOString(),
        tags: newContent.tags.split(",").map((tag) => tag.trim()),
        readTime: `${Math.ceil(
          newContent.content.split(" ").length / 200
        )} min`,
      };

      setLibraryContent((prev) => [content, ...prev]);
      setShowAddContent(false);
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                Add New Resource
              </h3>
              <button
                onClick={() => setShowAddContent(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-purple-200 mb-1 block">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newContent.title}
                  onChange={(e) =>
                    setNewContent({ ...newContent, title: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-purple-200 mb-1 block">
                    Category
                  </label>
                  <select
                    value={newContent.category}
                    onChange={(e) =>
                      setNewContent({ ...newContent, category: e.target.value })
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    {categories
                      .filter((cat) => cat.id !== "all")
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-purple-200 mb-1 block">
                    Type
                  </label>
                  <select
                    value={newContent.type}
                    onChange={(e) =>
                      setNewContent({ ...newContent, type: e.target.value })
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                    <option value="guide">Guide</option>
                    <option value="research">Research</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-purple-200 mb-1 block">
                  Life Stages
                </label>
                <div className="flex gap-3">
                  {lifeStages
                    .filter((stage) => stage.id !== "all")
                    .map((stage) => (
                      <label
                        key={stage.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newContent.stages.includes(stage.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewContent({
                                ...newContent,
                                stages: [...newContent.stages, stage.id],
                              });
                            } else {
                              setNewContent({
                                ...newContent,
                                stages: newContent.stages.filter(
                                  (s) => s !== stage.id
                                ),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded bg-white/20 border-white/40 text-purple-600"
                        />
                        <span className="text-white text-sm">{stage.name}</span>
                      </label>
                    ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-purple-200 mb-1 block">
                  Author
                </label>
                <input
                  type="text"
                  required
                  value={newContent.author}
                  onChange={(e) =>
                    setNewContent({ ...newContent, author: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-purple-200 mb-1 block">
                  Description
                </label>
                <textarea
                  required
                  value={newContent.description}
                  onChange={(e) =>
                    setNewContent({
                      ...newContent,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white resize-none"
                  rows="3"
                />
              </div>

              <div>
                <label className="text-sm text-purple-200 mb-1 block">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newContent.tags}
                  onChange={(e) =>
                    setNewContent({ ...newContent, tags: e.target.value })
                  }
                  placeholder="hormone, health, wellness"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-purple-200 mb-1 block">
                  Content
                </label>
                <textarea
                  required
                  value={newContent.content}
                  onChange={(e) =>
                    setNewContent({ ...newContent, content: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white resize-none"
                  rows="6"
                  placeholder="Enter the full content here..."
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newContent.featured}
                  onChange={(e) =>
                    setNewContent({ ...newContent, featured: e.target.checked })
                  }
                  className="w-5 h-5 rounded bg-white/20 border-white/40 text-purple-600"
                />
                <span className="text-white">Feature this resource</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Resource
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddContent(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const ResourceDetail = ({ resource, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {React.createElement(contentTypes[resource.type].icon, {
                    className: `w-6 h-6 ${contentTypes[resource.type].color}`,
                  })}
                  <span className="text-purple-200 text-sm">
                    {
                      categories.find((cat) => cat.id === resource.category)
                        ?.name
                    }
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {resource.title}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-purple-200">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {resource.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(resource.date), "MMM d, yyyy")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {resource.readTime || resource.duration}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          <div
            className="p-6 overflow-y-auto"
            style={{ maxHeight: "calc(90vh - 200px)" }}
          >
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-purple-200 mb-6">
                {resource.description}
              </p>

              {resource.type === "video" ? (
                <div className="bg-black/50 rounded-lg p-8 text-center">
                  <Video className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-purple-200">
                    Video player would be embedded here
                  </p>
                  <a
                    href={resource.videoUrl}
                    className="text-purple-400 hover:text-purple-300 mt-2 inline-block"
                  >
                    Watch on external site →
                  </a>
                </div>
              ) : (
                <div className="text-purple-100 space-y-4">
                  <p>
                    {resource.content ||
                      "Full content would be displayed here..."}
                  </p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-white/20">
                <h4 className="text-white font-semibold mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/20 bg-purple-900/50">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <button
                  onClick={() => handleBookmark(resource.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    bookmarkedItems.includes(resource.id)
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 text-purple-200 hover:bg-white/20"
                  }`}
                >
                  <Bookmark className="w-5 h-5" />
                </button>
                <button className="p-2 bg-white/10 text-purple-200 hover:bg-white/20 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 bg-white/10 text-purple-200 hover:bg-white/20 rounded-lg transition-colors">
                  <Printer className="w-5 h-5" />
                </button>
              </div>

              {isAdmin && (
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white/10 text-purple-200 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteContent(resource.id);
                      onClose();
                    }}
                    className="px-4 py-2 bg-red-600/30 text-red-200 hover:bg-red-600/40 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-purple-200">Loading health library...</p>
      </div>
    );
  }

  const filteredContent = getFilteredContent();
  const featuredContent = filteredContent.filter((item) => item.featured);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Health Library</h3>
        {isAdmin && (
          <button
            onClick={() => setShowAddContent(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Resource
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-purple-300 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Life Stage Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {lifeStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  selectedStage === stage.id
                    ? "bg-purple-600 text-white"
                    : "bg-white/10 text-purple-200 hover:bg-white/20"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{stage.name}</span>
              </button>
            );
          })}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  selectedCategory === category.id
                    ? "bg-white text-purple-600"
                    : "bg-white/10 text-purple-200 hover:bg-white/20"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Resources */}
      {featuredContent.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Featured Resources
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredContent.map((resource) => {
              const TypeIcon = contentTypes[resource.type].icon;
              return (
                <div
                  key={resource.id}
                  className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => setSelectedResource(resource)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white/10`}>
                        <TypeIcon
                          className={`w-5 h-5 ${
                            contentTypes[resource.type].color
                          }`}
                        />
                      </div>
                      <span className="text-sm text-purple-300">
                        {
                          categories.find((cat) => cat.id === resource.category)
                            ?.name
                        }
                      </span>
                    </div>
                    {bookmarkedItems.includes(resource.id) && (
                      <Bookmark className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-200 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-purple-200 mb-4 line-clamp-2">
                    {resource.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-purple-300">
                    <span>{resource.readTime || resource.duration}</span>
                    <span>
                      {format(new Date(resource.date), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Resources */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">
          {selectedCategory === "all"
            ? "All Resources"
            : categories.find((cat) => cat.id === selectedCategory)?.name}
          <span className="text-sm text-purple-300 ml-2">
            ({filteredContent.length} items)
          </span>
        </h4>

        {filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-purple-200">
              No resources found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContent.map((resource) => {
              const TypeIcon = contentTypes[resource.type].icon;
              const StageIcons = resource.stages.map(
                (stage) => lifeStages.find((s) => s.id === stage)?.icon
              );

              return (
                <div
                  key={resource.id}
                  className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all cursor-pointer"
                  onClick={() => setSelectedResource(resource)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-white/10`}>
                        <TypeIcon
                          className={`w-5 h-5 ${
                            contentTypes[resource.type].color
                          }`}
                        />
                      </div>

                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">
                          {resource.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-purple-300">
                          <span>{resource.author}</span>
                          <span>{resource.readTime || resource.duration}</span>
                          <div className="flex gap-1">
                            {StageIcons.map(
                              (Icon, index) =>
                                Icon && <Icon key={index} className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmark(resource.id);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          bookmarkedItems.includes(resource.id)
                            ? "bg-purple-600 text-white"
                            : "bg-white/10 text-purple-200 hover:bg-white/20"
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Edit functionality
                            }}
                            className="p-2 bg-white/10 text-purple-200 hover:bg-white/20 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteContent(resource.id);
                            }}
                            className="p-2 bg-white/10 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <ChevronRight className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin notice */}
      {isAdmin && (
        <div className="bg-purple-600/20 rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-purple-100 font-medium mb-1">
                Admin Mode Active
              </p>
              <p className="text-xs text-purple-200">
                You can add, edit, and delete resources. Regular users will only
                see published content.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddContent && <AddContentForm />}
      {selectedResource && (
        <ResourceDetail
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </div>
  );
};

// Add Apple icon if not available
const Apple = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
    <path d="M10 2c1 .5 2 2 2 5" />
  </svg>
);

export default HealthLibraryTab;
