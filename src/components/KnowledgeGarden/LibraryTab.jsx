// src/components/KnowledgeGarden/LibraryTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  Library, 
  BookOpen, 
  Video, 
  Headphones, 
  FileText,
  Star,
  Clock,
  User,
  Plus,
  Filter,
  TrendingUp,
  Heart,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LibraryContentService from '../../services/LibraryContentService';

export default function LibraryTab() {
  const { user } = useAuth();
  const [libraryContent, setLibraryContent] = useState([]);
  const [savedContent, setSavedContent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('library'); // 'library' or 'saved'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    contentType: 'all',
    difficulty: 'all',
    readingTime: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Load library content and categories
  useEffect(() => {
    loadLibraryContent();
    loadCategories();
    if (user) {
      loadSavedContent();
    }
  }, [activeCategory, filters, user]);

  const loadLibraryContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams = {
        category: activeCategory,
        content_type: filters.contentType,
        difficulty_level: filters.difficulty,
        max_reading_time: filters.readingTime !== 'all' ? filters.readingTime : undefined,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
        user_id: user?.id,
        limit: 20
      };

      const response = await LibraryContentService.getApprovedContent(filterParams);
      
      if (response.success) {
        // Transform data to match component expectations
        const transformedContent = response.data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          author: item.author,
          contentType: item.content_type,
          category: item.primary_category,
          difficulty: item.difficulty_level,
          readingTime: item.reading_time_minutes,
          qualityScore: item.quality_score ? (item.quality_score * 5) : 4.5, // Convert 0-1 to 0-5 scale
          saves: item.save_count || 0,
          tags: item.tags || [],
          url: item.content_url,
          isSaved: item.is_saved || false
        }));
        
        setLibraryContent(transformedContent);
      }
    } catch (err) {
      console.error('Error loading library content:', err);
      setError('Failed to load library content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await LibraryContentService.getLibraryCategories();
      
      if (response.success) {
        const categoryList = [
          { id: 'all', label: 'All Categories', count: response.data.reduce((sum, cat) => sum + cat.count, 0) },
          ...response.data.map(cat => ({
            id: cat.name,
            label: cat.name,
            count: cat.count
          }))
        ];
        
        setCategories(categoryList);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadSavedContent = async () => {
    try {
      const response = await LibraryContentService.getUserSavedContent(user.id);
      
      if (response.success) {
        const transformedSaved = response.data.map(save => ({
          id: save.library_content.id,
          title: save.library_content.title,
          description: save.library_content.description,
          author: save.library_content.author,
          contentType: save.library_content.content_type,
          category: save.library_content.primary_category,
          difficulty: save.library_content.difficulty_level,
          readingTime: save.library_content.reading_time_minutes,
          qualityScore: save.library_content.quality_score ? (save.library_content.quality_score * 5) : 4.5,
          saves: save.library_content.save_count || 0,
          tags: save.library_content.tags || [],
          url: save.library_content.content_url,
          isSaved: true,
          userNotes: save.user_notes,
          userRating: save.user_rating
        }));
        
        setSavedContent(transformedSaved);
      }
    } catch (err) {
      console.error('Error loading saved content:', err);
    }
  };

  const getContentIcon = (type) => {
    switch(type) {
      case 'article': return BookOpen;
      case 'video': return Video;
      case 'podcast': return Headphones;
      case 'research_paper': return FileText;
      default: return BookOpen;
    }
  };

  const getContentTypeLabel = (type) => {
    switch(type) {
      case 'research_paper': return 'Research Paper';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getDifficultyLabel = (level) => {
    const labels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
    return labels[level] || 'Unknown';
  };

  const getDifficultyColor = (level) => {
    switch(level) {
      case 1: return 'text-green-400 bg-green-500/20';
      case 2: return 'text-yellow-400 bg-yellow-500/20';
      case 3: return 'text-orange-400 bg-orange-500/20';
      case 4: return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleSaveContent = async (contentId) => {
    if (!user) {
      setError('Please log in to save content');
      return;
    }

    try {
      const content = libraryContent.find(item => item.id === contentId);
      if (!content) return;

      if (content.isSaved) {
        // Unsave content
        await LibraryContentService.unsaveContentFromGarden(user.id, contentId);
        
        // Update local state
        setLibraryContent(prev => prev.map(item => 
          item.id === contentId ? { ...item, isSaved: false, saves: Math.max(item.saves - 1, 0) } : item
        ));
        setSavedContent(prev => prev.filter(item => item.id !== contentId));
      } else {
        // Save content
        await LibraryContentService.saveContentToGarden(user.id, contentId, '');
        
        // Update local state
        setLibraryContent(prev => prev.map(item => 
          item.id === contentId ? { ...item, isSaved: true, saves: item.saves + 1 } : item
        ));
        
        // Add to saved content
        setSavedContent(prev => [...prev, { ...content, isSaved: true }]);
      }
    } catch (err) {
      console.error('Error saving/unsaving content:', err);
      setError(err.message || 'Failed to save content. Please try again.');
    }
  };

  const ContentCard = ({ content, showSaveButton = true }) => {
    const ContentIcon = getContentIcon(content.contentType);
    const difficultyColor = getDifficultyColor(content.difficulty);

    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500/20 p-3 rounded-lg flex-shrink-0">
            <ContentIcon className="h-6 w-6 text-blue-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white font-semibold">{content.title}</h3>
              {showSaveButton && (
                <button
                  onClick={() => handleSaveContent(content.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    content.isSaved
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-white/5 text-gray-400 hover:bg-purple-500/20 hover:text-purple-300'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <p className="text-gray-300 text-sm mb-4">{content.description}</p>
            
            <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {content.author}
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {content.readingTime} min
              </div>
              
              <div className={`px-2 py-1 rounded ${difficultyColor}`}>
                {getDifficultyLabel(content.difficulty)}
              </div>
              
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400" />
                {content.qualityScore}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Heart className="h-3 w-3" />
                  {content.saves} saves
                </div>
                
                <a
                  href={content.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="h-3 w-3" />
                  Read
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Content Library</h1>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setViewMode('library')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'library'
                ? 'bg-purple-500/30 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Browse Library
          </button>
          <button
            onClick={() => setViewMode('saved')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'saved'
                ? 'bg-purple-500/30 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Saved Content
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4">
          <p className="text-red-300 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300 text-xs mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {viewMode === 'library' ? (
        <>
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-purple-500/30 text-white border border-purple-400/30'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {category.label}
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {category.count}
                </span>
              </button>
            ))}
          </div>

          {/* Recommended Section */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              Recommended for You
            </h2>
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/20 rounded-xl p-4 mb-6">
              <p className="text-gray-300 text-sm">
                Based on your recent journal entries about productivity, we recommend exploring flow state resources.
              </p>
            </div>
          </section>

          {/* Library Content */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {activeCategory === 'all' ? 'All Content' : activeCategory}
              </h2>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select 
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  value={`${filters.sortBy}_${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('_');
                    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                  }}
                >
                  <option value="save_count_desc">Most Popular</option>
                  <option value="created_at_desc">Newest</option>
                  <option value="quality_score_desc">Highest Rated</option>
                  <option value="reading_time_minutes_asc">Shortest</option>
                  <option value="created_at_asc">Oldest</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading content...</p>
                </div>
              ) : libraryContent.length > 0 ? (
                libraryContent.map((content) => (
                  <ContentCard key={content.id} content={content} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Library className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No content found</h3>
                  <p className="text-gray-400">Try adjusting your filters or browse different categories</p>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Your Saved Content</h2>
          
          {savedContent.length > 0 ? (
            <div className="space-y-4">
              {savedContent.map((content) => (
                <ContentCard key={content.id} content={content} showSaveButton={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Library className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No saved content yet</h3>
              <p className="text-gray-400 mb-4">Start building your personal library by saving articles and resources</p>
              <button
                onClick={() => setViewMode('library')}
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-lg transition-colors"
              >
                Browse Library
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}