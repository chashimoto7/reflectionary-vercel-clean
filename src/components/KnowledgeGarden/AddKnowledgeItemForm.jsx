// src/components/KnowledgeGarden/AddKnowledgeItemForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus,
  FileText,
  Link,
  BookOpen,
  Lightbulb,
  Tag,
  X,
  Save,
  Loader
} from 'lucide-react';
import KnowledgeGardenService from '../../services/KnowledgeGardenService';

export default function AddKnowledgeItemForm({ onComplete, onClose }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    item_type: 'note',
    source_url: '',
    source_author: '',
    user_notes: '',
    tags: []
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [newTag, setNewTag] = useState('');

  const itemTypes = [
    { id: 'note', label: 'Personal Note', icon: FileText, description: 'Your own thoughts and ideas' },
    { id: 'article', label: 'Article/Blog Post', icon: BookOpen, description: 'External article or blog content' },
    { id: 'insight', label: 'Insight', icon: Lightbulb, description: 'Key learning or breakthrough moment' },
    { id: 'quote', label: 'Quote/Excerpt', icon: BookOpen, description: 'Meaningful quote or passage' },
    { id: 'link', label: 'Link/Resource', icon: Link, description: 'Reference to external resource' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await KnowledgeGardenService.createKnowledgeItem(user.id, {
        ...formData,
        title: formData.title.trim(),
        content: formData.content.trim(),
        source_url: formData.source_url.trim() || null,
        source_author: formData.source_author.trim() || null,
        user_notes: formData.user_notes.trim() || null
      });

      if (response.success) {
        if (onComplete) {
          onComplete(response.data);
        }
        onClose();
      } else {
        throw new Error(response.error || 'Failed to create knowledge item');
      }
    } catch (err) {
      console.error('Error creating knowledge item:', err);
      setError(err.message || 'Failed to create knowledge item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white">Add Knowledge Item</h2>
          <p className="text-gray-400 text-sm mt-1">
            Capture and organize your insights, notes, and discoveries
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Item Type Selection */}
        <div className="space-y-3">
          <label className="text-white font-medium">Type</label>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {itemTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.item_type === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleInputChange('item_type', type.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-purple-400 bg-purple-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-purple-400' : 'text-gray-400'}`} />
                  <h4 className="text-white font-medium text-sm">{type.label}</h4>
                  <p className="text-gray-400 text-xs mt-1">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-white font-medium">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter a descriptive title..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/10"
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label htmlFor="content" className="text-white font-medium">
            Content <span className="text-red-400">*</span>
          </label>
          <textarea
            id="content"
            rows={6}
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Enter the main content, key points, or insights..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 resize-none"
          />
        </div>

        {/* Source Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="source_url" className="text-white font-medium">Source URL</label>
            <input
              id="source_url"
              type="url"
              value={formData.source_url}
              onChange={(e) => handleInputChange('source_url', e.target.value)}
              placeholder="https://example.com/article"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/10"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="source_author" className="text-white font-medium">Author/Source</label>
            <input
              id="source_author"
              type="text"
              value={formData.source_author}
              onChange={(e) => handleInputChange('source_author', e.target.value)}
              placeholder="Author name or source"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/10"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <label className="text-white font-medium">Tags</label>

          {/* Add Tag Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/10"
            />
            <button
              type="button"
              onClick={addTag}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-lg transition-colors"
            >
              <Tag className="h-4 w-4" />
            </button>
          </div>

          {/* Tag List */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <div
                  key={index}
                  className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-purple-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Personal Notes */}
        <div className="space-y-2">
          <label htmlFor="user_notes" className="text-white font-medium">Personal Notes</label>
          <textarea
            id="user_notes"
            rows={3}
            value={formData.user_notes}
            onChange={(e) => handleInputChange('user_notes', e.target.value)}
            placeholder="Your thoughts, questions, or connections to other ideas..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 resize-none"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !formData.title.trim() || !formData.content.trim()}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Item
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}