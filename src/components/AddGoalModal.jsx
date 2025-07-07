// frontend/ src/components/AddGoalModal.jsx
import React, { useState } from "react";
import {
  X,
  Target,
  Calendar,
  Folder,
  Tag,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";

const AddGoalModal = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("personal_growth");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [milestones, setMilestones] = useState([]);
  const [currentMilestone, setCurrentMilestone] = useState("");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [errors, setErrors] = useState({});

  const categories = [
    { value: "health_fitness", label: "Health & Fitness", icon: "🏃" },
    { value: "career_skills", label: "Career & Skills", icon: "💼" },
    { value: "personal_growth", label: "Personal Growth", icon: "🌱" },
    { value: "financial", label: "Financial", icon: "💰" },
    { value: "relationships", label: "Relationships", icon: "❤️" },
    { value: "learning", label: "Learning", icon: "📚" },
    { value: "other", label: "Other", icon: "✨" },
  ];

  const priorities = [
    { value: "low", label: "Low", color: "text-green-400" },
    { value: "medium", label: "Medium", color: "text-yellow-400" },
    { value: "high", label: "High", color: "text-orange-400" },
    { value: "critical", label: "Critical", color: "text-red-400" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Goal title is required";
    if (title.length > 100)
      newErrors.title = "Title must be less than 100 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newGoal = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate: dueDate || null,
      milestones: milestones.map((m, index) => ({
        title: m,
        order_index: index,
        status: "pending",
      })),
      tags,
      status: "active",
      progress: 0,
    };

    onAdd(newGoal);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("personal_growth");
    setPriority("medium");
    setDueDate("");
    setMilestones([]);
    setCurrentMilestone("");
    setTags([]);
    setCurrentTag("");
    setErrors({});
  };

  const addMilestone = () => {
    if (currentMilestone.trim() && milestones.length < 10) {
      setMilestones([...milestones, currentMilestone.trim()]);
      setCurrentMilestone("");
    }
  };

  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (
      currentTag.trim() &&
      tags.length < 5 &&
      !tags.includes(currentTag.trim())
    ) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            Create New Goal
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]"
        >
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: null });
              }}
              placeholder="e.g., Run a marathon, Learn Spanish, Save $10,000"
              className={`w-full px-4 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.title ? "border-red-400" : "border-white/20"
              }`}
              maxLength={100}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              {title.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your goal and why it matters to you..."
              rows={3}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-600 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map((cat) => (
                  <option
                    key={cat.value}
                    value={cat.value}
                    className="bg-slate-700"
                  >
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 bg-slate-600 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {priorities.map((pri) => (
                  <option
                    key={pri.value}
                    value={pri.value}
                    className="bg-slate-700"
                  >
                    {pri.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2 bg-slate-600 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Milestones */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Milestones
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentMilestone}
                onChange={(e) => setCurrentMilestone(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMilestone();
                  }
                }}
                placeholder="Add a milestone..."
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={addMilestone}
                disabled={!currentMilestone.trim() || milestones.length >= 10}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-white/5 rounded-lg"
                >
                  <CheckCircle2 className="h-4 w-4 text-purple-400" />
                  <span className="flex-1 text-sm text-gray-300">
                    {milestone}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {milestones.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                <Info className="inline h-3 w-3 mr-1" />
                Break down your goal into smaller, achievable milestones
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!currentTag.trim() || tags.length >= 5}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center gap-1"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-purple-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Create Goal
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGoalModal;
