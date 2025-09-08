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

export default function SearchDiscover() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all',
    folder: 'all',
    hasConnections: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'connections'

  // Mock search results
  const mockResults = [
    {
      id: 1,
      type: 'article',
      title: 'The Science of Flow State',
      excerpt: 'Deep dive into the psychological mechanisms behind flow state and how to achieve it consistently...',
      source: 'Psychology Today',
      date: '2024-01-15',
      tags: ['productivity', 'psychology', 'flow'],
      connections: 3,
      folder: 'Productivity'
    },
    {
      id: 2,
      type: 'journal',
      title: 'Breakthrough with Morning Routine',
      excerpt: 'Today I finally cracked the code on my morning routine. The key was starting with meditation instead of immediately checking emails...',
      date: '2024-01-14',
      tags: ['routine', 'breakthrough', 'meditation'],
      connections: 5,
      folder: null
    },
    {
      id: 3,
      type: 'conversation',
      title: 'Discussion on Goal Setting',
      excerpt: 'Reflectionarian session about SMART goals vs. systems-based approaches to personal development...',
      date: '2024-01-12',
      tags: ['goals', 'systems', 'development'],
      connections: 2,
      folder: 'Personal Development'
    },
    {
      id: 4,
      type: 'note',
      title: 'Key Insights from Deep Work',
      excerpt: 'Notes from Cal Newport\'s Deep Work book: 1) Shallow work is often busywork, 2) Deep work requires deliberate practice...',
      date: '2024-01-10',
      tags: ['deep work', 'focus', 'productivity'],
      connections: 4,
      folder: 'Productivity'
    }
  ];

  useEffect(() => {
    // Simulate search with mock data
    const filteredResults = mockResults.filter(item => {
      const matchesQuery = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = filters.type === 'all' || item.type === filters.type;
      const matchesFolder = filters.folder === 'all' || item.folder === filters.folder;
      const matchesConnections = !filters.hasConnections || item.connections > 0;

      return matchesQuery && matchesType && matchesFolder && matchesConnections;
    });

    setSearchResults(filteredResults);
  }, [searchQuery, filters]);

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
                <option value="Productivity">Productivity</option>
                <option value="Personal Development">Personal Development</option>
                <option value="Health">Health</option>
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