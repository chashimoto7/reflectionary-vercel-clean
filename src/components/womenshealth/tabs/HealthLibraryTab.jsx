// frontend/src/components/womenshealth/tabs/HealthLibraryTab.jsx
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
  Database,
  Upload,
} from "lucide-react";
import { format } from "date-fns";

const HealthLibraryTab = ({ colors, user, lifeStage, onRefreshData }) => {
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddContent, setShowAddContent] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  const [libraryContent, setLibraryContent] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

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
    checkAdminStatus();
    loadLibraryContent();
    loadBookmarks();
  }, [user]);

  // Check if user is admin
  const checkAdminStatus = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/admin-status?user_id=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.isAdmin || false);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  // Load library content from backend
  const loadLibraryContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/womens-health/library`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLibraryContent(data.resources || []);
      }
    } catch (error) {
      console.error("Error loading library content:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load user's bookmarks
  const loadBookmarks = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/womens-health/bookmarks?user_id=${
          user.id
        }`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookmarkedItems(data.bookmarks || []);
      }
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    }
  };

  // Handle bookmark toggle
  const handleBookmark = async (resourceId) => {
    try {
      const isBookmarked = bookmarkedItems.includes(resourceId);
      const method = isBookmarked ? "DELETE" : "POST";

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/womens-health/bookmarks`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.access_token}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            resource_id: resourceId,
          }),
        }
      );

      if (response.ok) {
        if (isBookmarked) {
          setBookmarkedItems(bookmarkedItems.filter((id) => id !== resourceId));
        } else {
          setBookmarkedItems([...bookmarkedItems, resourceId]);
        }
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  // Handle content creation
  const handleAddContent = async (contentData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/womens-health/library`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.access_token}`,
          },
          body: JSON.stringify({
            ...contentData,
            author_id: user.id,
            created_at: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        setShowAddContent(false);
        loadLibraryContent();
      }
    } catch (error) {
      console.error("Error adding content:", error);
      alert("Failed to add content. Please try again.");
    }
  };

  // Handle content update
  const handleUpdateContent = async (resourceId, updates) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/womens-health/library/${resourceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.access_token}`,
          },
          body: JSON.stringify({
            ...updates,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        setEditingResource(null);
        loadLibraryContent();
      }
    } catch (error) {
      console.error("Error updating content:", error);
      alert("Failed to update content. Please try again.");
    }
  };

  // Handle content deletion
  const handleDeleteContent = async (resourceId) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/womens-health/library/${resourceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (response.ok) {
        loadLibraryContent();
        setSelectedResource(null);
      }
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("Failed to delete content. Please try again.");
    }
  };

  // Filter content based on search and filters
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

      return matchesCategory && matchesStage && matchesSearch && item.published;
    });
  };

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <Database className="w-16 h-16 text-purple-300 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">
        No Resources Found
      </h3>
      <p className="text-purple-200 max-w-md mb-6">
        {searchQuery || selectedCategory !== "all" || selectedStage !== "all"
          ? "Try adjusting your filters or search terms."
          : "The health library is being built. Check back soon for valuable resources!"}
      </p>
      {isAdmin && (
        <button
          onClick={() => setShowAddContent(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add First Resource
        </button>
      )}
    </div>
  );

  // Add/Edit Content Form Component
  const ContentForm = ({ resource = null, onClose }) => {
    const [formData, setFormData] = useState({
      title: resource?.title || "",
      description: resource?.description || "",
      content: resource?.content || "",
      category: resource?.category || "basics",
      type: resource?.type || "article",
      stages: resource?.stages || [lifeStage],
      tags: resource?.tags || [],
      featured: resource?.featured || false,
      published: resource?.published || false,
      videoUrl: resource?.videoUrl || "",
      downloadUrl: resource?.downloadUrl || "",
      readTime: resource?.readTime || "5 min",
      author: resource?.author || user.email,
    });

    const [tagInput, setTagInput] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (resource) {
        await handleUpdateContent(resource.id, formData);
      } else {
        await handleAddContent(formData);
      }
      onClose();
    };

    const addTag = () => {
      if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()],
        });
        setTagInput("");
      }
    };

    const removeTag = (tag) => {
      setFormData({
        ...formData,
        tags: formData.tags.filter((t) => t !== tag),
      });
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-xl w-full max-w-2xl my-8">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {resource ? "Edit Resource" : "Add New Resource"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm text-purple-200 mb-1 block">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-400"
                placeholder="Enter resource title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-purple-200 mb-1 block">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-400 resize-none"
                placeholder="Brief description of the resource"
                rows="3"
                required
              />
            </div>

            {/* Type and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-purple-200 mb-1 block">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  {Object.entries(contentTypes).map(([key, type]) => (
                    <option key={key} value={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-purple-200 mb-1 block">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
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
            </div>

            {/* Life Stages */}
            <div>
              <label className="text-sm text-purple-200 mb-2 block">
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
                        checked={formData.stages.includes(stage.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              stages: [...formData.stages, stage.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              stages: formData.stages.filter(
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

            {/* Content */}
            {formData.type === "article" || formData.type === "guide" ? (
              <div>
                <label className="text-sm text-purple-200 mb-1 block">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-400 resize-none"
                  placeholder="Main content of the resource"
                  rows="8"
                  required
                />
              </div>
            ) : formData.type === "video" ? (
              <div>
                <label className="text-sm text-purple-200 mb-1 block">
                  Video URL *
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-400"
                  placeholder="https://..."
                  required
                />
              </div>
            ) : null}

            {/* Download URL (optional) */}
            <div>
              <label className="text-sm text-purple-200 mb-1 block">
                Download URL (optional)
              </label>
              <input
                type="url"
                value={formData.downloadUrl}
                onChange={(e) =>
                  setFormData({ ...formData, downloadUrl: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-400"
                placeholder="Link to PDF or other downloadable content"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm text-purple-200 mb-1 block">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-400"
                  placeholder="Add tags..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Read Time and Author */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-purple-200 mb-1 block">
                  Read Time
                </label>
                <input
                  type="text"
                  value={formData.readTime}
                  onChange={(e) =>
                    setFormData({ ...formData, readTime: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  placeholder="5 min"
                />
              </div>

              <div>
                <label className="text-sm text-purple-200 mb-1 block">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Author name"
                />
              </div>
            </div>

            {/* Flags */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="w-4 h-4 rounded bg-white/20 border-white/40 text-purple-600"
                />
                <span className="text-white">Featured Resource</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.checked })
                  }
                  className="w-4 h-4 rounded bg-white/20 border-white/40 text-purple-600"
                />
                <span className="text-white">Published</span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {resource ? "Update Resource" : "Add Resource"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Resource Detail Modal
  const ResourceDetail = ({ resource, onClose }) => {
    if (!resource) return null;

    const TypeIcon = contentTypes[resource.type].icon;
    const categoryInfo = categories.find((cat) => cat.id === resource.category);
    const stageIcons = resource.stages
      .map((stageId) => lifeStages.find((stage) => stage.id === stageId))
      .filter(Boolean);

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-xl w-full max-w-3xl my-8">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-white/10`}>
                    <TypeIcon
                      className={`w-5 h-5 ${contentTypes[resource.type].color}`}
                    />
                  </div>
                  <span className="text-purple-300">{categoryInfo?.name}</span>
                  {resource.featured && (
                    <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">
                      Featured
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {resource.title}
                </h2>
                <p className="text-purple-200">{resource.description}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-4"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm text-purple-300">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{resource.readTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{resource.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(new Date(resource.created_at), "MMM d, yyyy")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              {stageIcons.map((stage) => {
                const Icon = stage.icon;
                return (
                  <div
                    key={stage.id}
                    className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full"
                  >
                    <Icon className="w-3 h-3 text-purple-300" />
                    <span className="text-xs text-purple-200">
                      {stage.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            <div className="prose prose-invert max-w-none">
              {resource.type === "video" ? (
                <div className="bg-black/50 rounded-lg p-8 text-center">
                  <Video className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-purple-200 mb-4">Video content</p>
                  <a
                    href={resource.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Watch Video
                  </a>
                </div>
              ) : (
                <div className="text-purple-100 space-y-4 whitespace-pre-wrap">
                  {resource.content}
                </div>
              )}

              {resource.downloadUrl && (
                <div className="mt-6 p-4 bg-white/10 rounded-lg">
                  <a
                    href={resource.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Additional Resources
                  </a>
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
                  title={
                    bookmarkedItems.includes(resource.id)
                      ? "Remove bookmark"
                      : "Bookmark"
                  }
                >
                  <Bookmark className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: resource.title,
                        text: resource.description,
                        url: window.location.href,
                      });
                    }
                  }}
                  className="p-2 bg-white/10 text-purple-200 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-2 bg-white/10 text-purple-200 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Printer className="w-5 h-5" />
                </button>
              </div>

              {isAdmin && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditingResource(resource);
                      onClose();
                    }}
                    className="px-4 py-2 bg-white/10 text-purple-200 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
                  >
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

  const filteredContent = getFilteredContent();
  const featuredContent = filteredContent.filter((item) => item.featured);

  return (
    <div className="space-y-6">
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
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Stage Filter */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            {lifeStages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
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

      {/* Content Display */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-200">Loading health library...</p>
        </div>
      ) : filteredContent.length === 0 ? (
        <EmptyState />
      ) : (
        <>
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
                  const categoryInfo = categories.find(
                    (cat) => cat.id === resource.category
                  );

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
                            {categoryInfo?.name}
                          </span>
                        </div>
                        {bookmarkedItems.includes(resource.id) && (
                          <Bookmark className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>

                      <h5 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-200 transition-colors">
                        {resource.title}
                      </h5>
                      <p className="text-purple-200 text-sm mb-3 line-clamp-2">
                        {resource.description}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3 text-purple-300">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{resource.readTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{resource.author}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
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
                : categories.find((c) => c.id === selectedCategory)?.name}
            </h4>
            <div className="space-y-3">
              {filteredContent
                .filter((item) => !item.featured)
                .map((resource) => {
                  const TypeIcon = contentTypes[resource.type].icon;
                  const categoryInfo = categories.find(
                    (cat) => cat.id === resource.category
                  );

                  return (
                    <div
                      key={resource.id}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
                      onClick={() => setSelectedResource(resource)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`p-2 rounded-lg bg-white/10 flex-shrink-0`}
                          >
                            <TypeIcon
                              className={`w-4 h-4 ${
                                contentTypes[resource.type].color
                              }`}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-white group-hover:text-purple-200 transition-colors truncate">
                              {resource.title}
                            </h5>
                            <div className="flex items-center gap-3 text-sm text-purple-300 mt-1">
                              <span>{categoryInfo?.name}</span>
                              <span>•</span>
                              <span>{resource.readTime}</span>
                              <span>•</span>
                              <span>{resource.author}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {bookmarkedItems.includes(resource.id) && (
                              <Bookmark className="w-4 h-4 text-yellow-400" />
                            )}
                            <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}

      {/* Admin Notice */}
      {isAdmin && (
        <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-100 font-medium mb-1">Admin Mode</p>
              <p className="text-yellow-200 text-sm">
                You can add, edit, and delete resources. Only published
                resources are visible to users.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddContent && (
        <ContentForm onClose={() => setShowAddContent(false)} />
      )}

      {editingResource && (
        <ContentForm
          resource={editingResource}
          onClose={() => setEditingResource(null)}
        />
      )}

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
