// src/components/KnowledgeGarden/SearchDiscover.jsx
import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Network,
  ArrowUpDown,
  BookOpen,
  FileText,
  MessageCircle,
  Brain,
  Calendar,
  Tag,
  Folder
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import KnowledgeGardenService from '../../services/KnowledgeGardenService';

export default function SearchDiscover() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [folders, setFolders] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all',
    folder: 'all',
    hasConnections: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'connections'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    filterAndSearchResults();
  }, [searchQuery, filters, allItems, sortBy]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadAllItems(),
        loadFolders()
      ]);

    } catch (err) {
      console.error('Error loading search data:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAllItems = async () => {
    try {
      const response = await KnowledgeGardenService.getUserKnowledgeItems(user.id, {
        limit: 1000
      });

      if (response.success) {
        const items = response.data.map(item => ({
          id: item.id,
          type: item.item_type || 'note',
          title: item.title,
          excerpt: item.content ? item.content.substring(0, 200) + '...' : 'No content preview',
          source: item.source_author || 'User created',
          date: item.created_at,
          tags: item.tags ? item.tags.map(tag => tag.name) : [],
          connections: item.connection_count || 0,
          folder: item.folder_name || null,
          folder_id: item.folder_id
        }));

        setAllItems(items);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await KnowledgeGardenService.getUserFolders(user.id);

      if (response.success) {
        setFolders(response.data);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const filterAndSearchResults = () => {
    if (!allItems.length) {
      setSearchResults([]);
      return;
    }

    let filteredResults = [...allItems];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredResults = filteredResults.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.excerpt.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (item.source && item.source.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.type !== 'all') {
      filteredResults = filteredResults.filter(item => item.type === filters.type);
    }

    if (filters.folder !== 'all') {
      filteredResults = filteredResults.filter(item => {
        if (filters.folder === 'none') {
          return !item.folder_id;
        }
        return item.folder === filters.folder;
      });
    }

    if (filters.hasConnections) {
      filteredResults = filteredResults.filter(item => item.connections > 0);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate;

      switch (filters.dateRange) {
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }

      filteredResults = filteredResults.filter(item => new Date(item.date) >= cutoffDate);
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        filteredResults.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'connections':
        filteredResults.sort((a, b) => b.connections - a.connections);
        break;
      case 'title':
        filteredResults.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'relevance':
      default:
        // For relevance, prioritize exact matches in title, then content
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filteredResults.sort((a, b) => {
            const aTitle = a.title.toLowerCase().includes(query);
            const bTitle = b.title.toLowerCase().includes(query);
            if (aTitle && !bTitle) return -1;
            if (!aTitle && bTitle) return 1;
            return 0;
          });
        }
        break;
    }

    setSearchResults(filteredResults);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'article': return BookOpen;
      case 'journal': return FileText;
      case 'conversation': return MessageCircle;
      case 'note': return Brain;
      default: return FileText;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'article': return 'text-blue-400 bg-blue-500/20';
      case 'journal': return 'text-green-400 bg-green-500/20';
      case 'conversation': return 'text-purple-400 bg-purple-500/20';
      case 'note': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const SearchResultCard = ({ result }) => {
    const TypeIcon = getTypeIcon(result.type);
    const typeColor = getTypeColor(result.type);

    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg ${typeColor}`}>
            <TypeIcon className="h-5 w-5" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white font-semibold">{result.title}</h3>
              <div className="flex items-center gap-2 text-xs">
                {result.connections > 0 && (
                  <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full flex items-center gap-1">
                    <Network className="h-3 w-3" />
                    {result.connections}
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{result.excerpt}</p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(result.date).toLocaleDateString()}
              </div>
              
              {result.folder && (
                <div className="flex items-center gap-1">
                  <Folder className="h-3 w-3" />
                  {result.folder}
                </div>
              )}
              
              {result.source && (
                <span>{result.source}</span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {result.tags.map((tag, index) => (
                <span key={index} className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your knowledge garden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-6 text-center">
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = allItems.length === 0;

  if (isEmpty) {
    return (
      <div className="p-6 text-center py-12">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-8 rounded-2xl backdrop-blur-sm border border-white/10 mb-6 mx-auto max-w-md">
          <Search className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">No Content to Search</h2>
          <p className="text-gray-300 mb-6">
            Add knowledge items to your garden to start searching and discovering connections.
          </p>
          <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-6 py-3 rounded-lg transition-colors">
            Add Your First Item
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Search Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all your knowledge..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
            showFilters
              ? 'bg-purple-500/20 border-purple-400/30 text-purple-300'
              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
          }`}
        >
          <Filter className="h-5 w-5" />
          Filters
        </button>

        <button
          onClick={() => setViewMode(viewMode === 'list' ? 'connections' : 'list')}
          className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-colors"
        >
          <Network className="h-5 w-5" />
          {viewMode === 'list' ? 'Connection View' : 'List View'}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Types</option>
                <option value="article">Articles</option>
                <option value="journal">Journals</option>
                <option value="conversation">Conversations</option>
                <option value="note">Notes</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Folder</label>
              <select
                value={filters.folder}
                onChange={(e) => setFilters({...filters, folder: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Folders</option>
                <option value="none">No Folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.name}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="connections">Connections</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center mt-4">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={filters.hasConnections}
                onChange={(e) => setFilters({...filters, hasConnections: e.target.checked})}
                className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
              />
              Only show connected items
            </label>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="text-gray-300">
          <span className="font-semibold text-white">{searchResults.length}</span> results
          {searchQuery && <span> for "{searchQuery}"</span>}
        </div>
        
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">Sorted by {sortBy}</span>
        </div>
      </div>

      {/* Search Results */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {searchResults.map((result) => (
            <SearchResultCard key={result.id} result={result} />
          ))}
          
          {searchResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No results found</h3>
              <p className="text-gray-400">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <div className="text-center">
            <Network className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Connection Visualization</h3>
            <p className="text-gray-400">Interactive connection mapping coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}