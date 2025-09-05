// Blog page component matching Reflectionary's design system
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Tag,
  Star,
  ExternalLink,
  Mail,
  Search,
  Filter
} from 'lucide-react';
import blogService from '../services/blogService';
import PublicBlogLayout from '../components/PublicBlogLayout';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    loadBlogData();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedTag, searchTerm]);

  const loadBlogData = async () => {
    try {
      const [allPosts, featured, allTags] = await Promise.all([
        blogService.getAllPosts(),
        blogService.getFeaturedPosts(),
        blogService.getAllTags()
      ]);

      setPosts(allPosts);
      setFeaturedPosts(featured);
      setTags(allTags);
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(post => 
        post.tags && post.tags.includes(selectedTag)
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        (post.tags && post.tags.some(tag => 
          tag.toLowerCase().includes(term)
        ))
      );
    }

    setFilteredPosts(filtered);
  };

  const handleEmailSignup = () => {
    window.open('https://reflectionary.kit.com/blog', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-200">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <PublicBlogLayout>
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header Section */}
      <div className="backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Reflectionary Development Blog
            </h1>
            <p className="text-xl text-purple-200 mb-8 max-w-3xl mx-auto">
              Insights on journaling, consciousness evolution, and personal transformation. 
              Stay connected to your growth journey.
            </p>
            
            {/* Email Signup CTA */}
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-lg p-6 max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-purple-300" />
                <h3 className="text-lg font-semibold text-white">
                  Never Miss a Post
                </h3>
              </div>
              <p className="text-sm text-purple-200 mb-4">
                Get new consciousness insights delivered to your inbox
              </p>
              <button
                onClick={handleEmailSignup}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium flex items-center justify-center gap-2"
              >
                Subscribe to Blog Updates
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              Featured Articles
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-lg hover:bg-white/15 hover:border-purple-400/50 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-yellow-400 p-1 rounded-full">
                        <Star className="w-3 h-3 text-yellow-900" />
                      </div>
                      <span className="text-sm font-medium text-yellow-400">Featured</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-300 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {blogService.formatDate(post.publishedDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>
                      <span className="text-purple-300 font-medium">
                        {post.author}
                      </span>
                    </div>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-purple-500/20 text-purple-200 px-2 py-1 rounded-full text-xs border border-purple-400/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 backdrop-blur-sm"
                />
              </div>
              
              {/* Tag Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400/50 backdrop-blur-sm appearance-none min-w-40"
                >
                  <option value="">All Topics</option>
                  {tags.map((tag) => (
                    <option key={tag} value={tag} className="bg-slate-800">
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Active Filters */}
            {(selectedTag || searchTerm) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/20">
                <span className="text-sm text-gray-300">Active filters:</span>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag('')}
                    className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-sm border border-purple-400/30 hover:bg-purple-500/30 transition-colors flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {selectedTag}
                    <span className="ml-1 text-xs">×</span>
                  </button>
                )}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm border border-blue-400/30 hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                  >
                    <Search className="w-3 h-3" />
                    "{searchTerm}"
                    <span className="ml-1 text-xs">×</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            {selectedTag || searchTerm ? 'Filtered Posts' : 'All Articles'} 
            <span className="text-lg font-normal text-gray-400 ml-2">
              ({filteredPosts.length})
            </span>
          </h2>
          
          {filteredPosts.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-lg p-12 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No posts found</h3>
              <p className="text-gray-300">
                Try adjusting your search terms or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-lg hover:bg-white/15 hover:border-purple-400/50 transition-all duration-300"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-200 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-300 mb-4 text-sm line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {blogService.formatDate(post.publishedDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-300 font-medium">
                        {post.author}
                      </span>
                      {post.featured && (
                        <div className="bg-yellow-400 p-1 rounded-full">
                          <Star className="w-3 h-3 text-yellow-900" />
                        </div>
                      )}
                    </div>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded-full text-xs border border-purple-400/30"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{post.tags.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter Signup Footer */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30 shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Join the Consciousness Community
          </h3>
          <p className="text-purple-200 mb-6 max-w-2xl mx-auto">
            Get weekly insights on journaling, personal growth, and consciousness evolution 
            delivered straight to your inbox. Join thousands of fellow travelers on the path to self-discovery.
          </p>
          <button
            onClick={handleEmailSignup}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium inline-flex items-center gap-2 shadow-lg"
          >
            <Mail className="w-5 h-5" />
            Subscribe Now
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    </PublicBlogLayout>
  );
}