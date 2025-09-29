// src/components/KnowledgeGarden/GardenOverview.jsx
import React, { useState, useEffect } from 'react';
import {
  TreePine,
  TrendingUp,
  Lightbulb,
  Target,
  Activity,
  Plus,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import KnowledgeGardenService from '../../services/KnowledgeGardenService';
import AddKnowledgeItemForm from './AddKnowledgeItemForm';
import Modal from '../Modal';

export default function GardenOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gardenStats, setGardenStats] = useState({
    totalItems: 0,
    totalConnections: 0,
    itemsThisWeek: 0,
    connectionsThisWeek: 0,
    lastActivity: null
  });

  const [weeklyInsights, setWeeklyInsights] = useState([]);
  const [suggestedActions, setSuggestedActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadGardenData();
    }
  }, [user]);

  const loadGardenData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load garden statistics
      await Promise.all([
        loadGardenStats(),
        loadWeeklyInsights(),
        loadSuggestedActions()
      ]);

    } catch (err) {
      console.error('Error loading garden data:', err);
      setError('Failed to load garden data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadGardenStats = async () => {
    try {
      const response = await KnowledgeGardenService.getUserKnowledgeItems(user.id, { limit: 1000 });

      if (response.success) {
        const items = response.data;
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Calculate this week's items
        const itemsThisWeek = items.filter(item =>
          new Date(item.created_at) >= oneWeekAgo
        ).length;

        // Get latest activity
        const sortedItems = items.sort((a, b) =>
          new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
        );
        const lastActivity = sortedItems.length > 0 ?
          new Date(sortedItems[0].updated_at || sortedItems[0].created_at) : null;

        // For connections, we'll need to implement a separate API call
        // For now, estimate based on items with connections
        const totalConnections = items.reduce((sum, item) => sum + (item.connection_count || 0), 0);

        setGardenStats({
          totalItems: items.length,
          totalConnections,
          itemsThisWeek,
          connectionsThisWeek: Math.floor(totalConnections * 0.3), // Rough estimate
          lastActivity
        });
      }
    } catch (error) {
      console.error('Error loading garden stats:', error);
    }
  };

  const loadWeeklyInsights = async () => {
    // For now, show insights based on activity patterns
    // This would eventually be enhanced with AI-generated insights
    try {
      const response = await KnowledgeGardenService.getUserKnowledgeItems(user.id, {
        limit: 50,
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      if (response.success) {
        const insights = [];
        const items = response.data;

        if (items.length >= 5) {
          const recentItems = items.slice(0, 5);
          const commonTags = {};

          recentItems.forEach(item => {
            if (item.tags) {
              item.tags.forEach(tag => {
                commonTags[tag.name] = (commonTags[tag.name] || 0) + 1;
              });
            }
          });

          const mostCommonTag = Object.entries(commonTags)
            .sort(([,a], [,b]) => b - a)[0];

          if (mostCommonTag && mostCommonTag[1] >= 2) {
            insights.push({
              id: 1,
              type: 'pattern',
              title: `Growing Interest in ${mostCommonTag[0]}`,
              description: `You've added ${mostCommonTag[1]} items tagged with "${mostCommonTag[0]}" recently.`,
              action: 'Explore connections',
              confidence: 0.85
            });
          }
        }

        if (items.length > 0) {
          const now = new Date();
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

          const thisWeekCount = items.filter(item => new Date(item.created_at) >= oneWeekAgo).length;
          const lastWeekCount = items.filter(item => {
            const date = new Date(item.created_at);
            return date >= twoWeeksAgo && date < oneWeekAgo;
          }).length;

          if (thisWeekCount > lastWeekCount) {
            insights.push({
              id: 2,
              type: 'growth',
              title: 'Knowledge Growth Momentum',
              description: `You've added ${thisWeekCount} items this week compared to ${lastWeekCount} last week.`,
              action: 'View timeline',
              confidence: 0.95
            });
          }
        }

        setWeeklyInsights(insights);
      }
    } catch (error) {
      console.error('Error loading weekly insights:', error);
    }
  };

  const loadSuggestedActions = async () => {
    try {
      const response = await KnowledgeGardenService.getUserKnowledgeItems(user.id);

      if (response.success) {
        const actions = [];
        const items = response.data;

        // Suggest organizing items without folders
        const unorganizedItems = items.filter(item => !item.folder_id);
        if (unorganizedItems.length >= 5) {
          actions.push({
            id: 1,
            priority: 'medium',
            title: 'Organize items into folders',
            description: `${unorganizedItems.length} items could benefit from better organization.`,
            action: () => console.log('Navigate to organization')
          });
        }

        // Suggest connecting items with similar tags
        const tagGroups = {};
        items.forEach(item => {
          if (item.tags) {
            item.tags.forEach(tag => {
              if (!tagGroups[tag.name]) tagGroups[tag.name] = [];
              tagGroups[tag.name].push(item);
            });
          }
        });

        const largeTagGroups = Object.entries(tagGroups).filter(([, items]) => items.length >= 3);
        if (largeTagGroups.length > 0) {
          const [tagName, taggedItems] = largeTagGroups[0];
          actions.push({
            id: 2,
            priority: 'high',
            title: `Connect related ${tagName} items`,
            description: `You have ${taggedItems.length} items about ${tagName} that could be connected.`,
            action: () => console.log('Navigate to connection suggestion')
          });
        }

        // Suggest reviewing older items
        const oldItems = items.filter(item => {
          const daysSinceAccessed = item.last_accessed_at ?
            (new Date() - new Date(item.last_accessed_at)) / (1000 * 60 * 60 * 24) :
            (new Date() - new Date(item.created_at)) / (1000 * 60 * 60 * 24);
          return daysSinceAccessed > 30;
        });

        if (oldItems.length >= 3) {
          actions.push({
            id: 3,
            priority: 'low',
            title: `Review ${oldItems.length} unvisited items`,
            description: 'You have valuable content that hasn\'t been accessed recently.',
            action: () => console.log('Navigate to old items')
          });
        }

        setSuggestedActions(actions);
      }
    } catch (error) {
      console.error('Error loading suggested actions:', error);
    }
  };

  // Click handlers for buttons
  const handleAddKnowledgeItem = () => {
    setShowAddItemModal(true);
  };

  const handleBrowseLibrary = () => {
    navigate('/knowledge-garden/library');
  };

  const handleLearnMore = () => {
    setShowLearnMoreModal(true);
  };

  const handleExploreInsights = () => {
    navigate('/knowledge-garden/insights');
  };

  const handleCreateConnection = () => {
    navigate('/knowledge-garden/search');
  };

  const handleItemCreateComplete = async (createdItem) => {
    setShowAddItemModal(false);

    // Refresh garden data to show the new item
    await loadGardenData();

    // Optional: Show success message or navigate to the new item
    console.log('Knowledge item created:', createdItem);
  };

  const StatCard = ({ icon: Icon, title, value, change, changeLabel }) => (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-green-500/20 p-3 rounded-lg">
          <Icon className="h-6 w-6 text-green-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          {change !== undefined && (
            <p className="text-sm text-gray-400">
              {change > 0 ? '+' : ''}{change} {changeLabel}
            </p>
          )}
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );

  const InsightCard = ({ insight }) => (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
      <div className="flex items-start gap-4">
        <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0">
          <Sparkles className="h-5 w-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-2">{insight.title}</h3>
          <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
          <div className="flex items-center justify-between">
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
              {insight.action} <ArrowRight className="h-3 w-3" />
            </button>
            <span className="text-xs text-gray-500">
              {Math.round(insight.confidence * 100)}% confidence
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const ActionCard = ({ action }) => {
    const priorityColors = {
      high: 'border-red-400/30 bg-red-500/10',
      medium: 'border-yellow-400/30 bg-yellow-500/10',
      low: 'border-gray-400/30 bg-gray-500/10'
    };

    const priorityLabels = {
      high: 'High Priority',
      medium: 'Medium Priority', 
      low: 'Low Priority'
    };

    return (
      <div className={`bg-white/5 backdrop-blur-sm border rounded-xl p-4 hover:bg-white/10 transition-colors ${priorityColors[action.priority]}`}>
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-medium">{action.title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${
            action.priority === 'high' ? 'text-red-300 bg-red-500/20' :
            action.priority === 'medium' ? 'text-yellow-300 bg-yellow-500/20' :
            'text-gray-300 bg-gray-500/20'
          }`}>
            {priorityLabels[action.priority]}
          </span>
        </div>
        <p className="text-gray-300 text-sm mb-3">{action.description}</p>
        <button
          onClick={action.action}
          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
        >
          Take Action
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your garden...</p>
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
            onClick={loadGardenData}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate growth score based on activity
  const calculateGrowthScore = () => {
    if (gardenStats.totalItems === 0) return "0.0/10";

    let score = 0;

    // Base score from having content
    score += Math.min(gardenStats.totalItems * 0.1, 3);

    // Weekly activity bonus
    score += Math.min(gardenStats.itemsThisWeek * 0.5, 2);

    // Connections bonus
    score += Math.min(gardenStats.totalConnections * 0.05, 3);

    // Recent activity bonus
    if (gardenStats.lastActivity) {
      const daysSinceActivity = (new Date() - gardenStats.lastActivity) / (1000 * 60 * 60 * 24);
      if (daysSinceActivity < 7) score += 2;
      else if (daysSinceActivity < 30) score += 1;
    }

    return `${Math.min(score, 10).toFixed(1)}/10`;
  };

  const isEmpty = gardenStats.totalItems === 0;

  if (isEmpty) {
    return (
      <div className="p-6 space-y-8">
        {/* Empty State */}
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-green-500/20 to-purple-500/20 p-8 rounded-2xl backdrop-blur-sm border border-white/10 mb-6 mx-auto max-w-md">
            <TreePine className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Start Growing Your Knowledge Garden</h2>
            <p className="text-gray-300 mb-6">
              Your personal knowledge garden is empty. Begin by adding articles, notes, or documents to start building your wisdom collection.
            </p>
          </div>

          {/* Quick Actions for Empty State */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <button
              onClick={handleAddKnowledgeItem}
              className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-white/10 rounded-xl p-6 hover:from-green-500/30 hover:to-blue-500/30 transition-all text-center"
            >
              <Plus className="h-8 w-8 text-green-400 mb-3 mx-auto" />
              <h3 className="text-white font-medium mb-2">Add Knowledge Item</h3>
              <p className="text-gray-400 text-sm">Import article, document, or note</p>
            </button>

            <button
              onClick={handleBrowseLibrary}
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/10 rounded-xl p-6 hover:from-purple-500/30 hover:to-pink-500/30 transition-all text-center"
            >
              <TreePine className="h-8 w-8 text-purple-400 mb-3 mx-auto" />
              <h3 className="text-white font-medium mb-2">Browse Library</h3>
              <p className="text-gray-400 text-sm">Discover curated content</p>
            </button>

            <button
              onClick={handleLearnMore}
              className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-white/10 rounded-xl p-6 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all text-center"
            >
              <Lightbulb className="h-8 w-8 text-blue-400 mb-3 mx-auto" />
              <h3 className="text-white font-medium mb-2">Learn More</h3>
              <p className="text-gray-400 text-sm">How Knowledge Garden works</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Garden Health Metrics */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-400" />
          Garden Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={TreePine}
            title="Total Items"
            value={gardenStats.totalItems}
            change={gardenStats.itemsThisWeek}
            changeLabel="this week"
          />
          <StatCard
            icon={TrendingUp}
            title="Connections"
            value={gardenStats.totalConnections}
            change={gardenStats.connectionsThisWeek}
            changeLabel="this week"
          />
          <StatCard
            icon={Plus}
            title="Items Added"
            value={gardenStats.itemsThisWeek}
            changeLabel="this week"
          />
          <StatCard
            icon={Target}
            title="Growth Score"
            value={calculateGrowthScore()}
            changeLabel="improving"
          />
        </div>
      </section>

      {/* Weekly AI Insights */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-blue-400" />
          Weekly Insights
        </h2>
        {weeklyInsights.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {weeklyInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <Sparkles className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No insights yet</h3>
            <p className="text-gray-400">Add more content to generate AI-powered insights</p>
          </div>
        )}
      </section>

      {/* Suggested Actions */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-400" />
          Suggested Actions
        </h2>
        {suggestedActions.length > 0 ? (
          <div className="space-y-4">
            {suggestedActions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">All caught up!</h3>
            <p className="text-gray-400">No suggested actions right now</p>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleAddKnowledgeItem}
            className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-white/10 rounded-xl p-4 hover:from-green-500/30 hover:to-blue-500/30 transition-all text-left"
          >
            <Plus className="h-6 w-6 text-green-400 mb-2" />
            <h3 className="text-white font-medium mb-1">Add Knowledge Item</h3>
            <p className="text-gray-400 text-sm">Import article, document, or note</p>
          </button>

          <button
            onClick={handleCreateConnection}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/10 rounded-xl p-4 hover:from-purple-500/30 hover:to-pink-500/30 transition-all text-left"
          >
            <TrendingUp className="h-6 w-6 text-purple-400 mb-2" />
            <h3 className="text-white font-medium mb-1">Create Connection</h3>
            <p className="text-gray-400 text-sm">Link related items together</p>
          </button>

          <button
            onClick={handleExploreInsights}
            className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-white/10 rounded-xl p-4 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all text-left"
          >
            <Lightbulb className="h-6 w-6 text-blue-400 mb-2" />
            <h3 className="text-white font-medium mb-1">Explore Insights</h3>
            <p className="text-gray-400 text-sm">View AI-generated patterns</p>
          </button>
        </div>
      </section>

      {/* Add Knowledge Item Modal */}
      {showAddItemModal && (
        <Modal onClose={() => setShowAddItemModal(false)}>
          <AddKnowledgeItemForm
            onComplete={handleItemCreateComplete}
            onClose={() => setShowAddItemModal(false)}
          />
        </Modal>
      )}

      {/* Learn More Modal */}
      {showLearnMoreModal && (
        <Modal onClose={() => setShowLearnMoreModal(false)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto relative">
            {/* Close button */}
            <button
              onClick={() => setShowLearnMoreModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-500/20 to-purple-500/20 p-3 rounded-xl">
                <TreePine className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">How Knowledge Garden Works</h2>
                <p className="text-gray-400">Transform information into wisdom</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0">
                  <Plus className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">1. Collect Knowledge</h3>
                  <p className="text-gray-300 text-sm">
                    Import articles, documents, notes, and insights from various sources. Everything is encrypted and organized automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-500/20 p-2 rounded-lg flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">2. Discover Connections</h3>
                  <p className="text-gray-300 text-sm">
                    AI analyzes patterns between your journal entries and knowledge items, revealing hidden insights and correlations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-500/20 p-2 rounded-lg flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">3. Generate Insights</h3>
                  <p className="text-gray-300 text-sm">
                    Track your growth patterns, breakthrough moments, and receive personalized suggestions for expanding your knowledge.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-yellow-500/20 p-2 rounded-lg flex-shrink-0">
                  <Target className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">4. Take Action</h3>
                  <p className="text-gray-300 text-sm">
                    Get smart recommendations for organizing, connecting, and exploring your knowledge garden to maximize learning.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                  Your knowledge garden grows more powerful with every addition
                </p>
                <button
                  onClick={() => setShowLearnMoreModal(false)}
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-lg transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}