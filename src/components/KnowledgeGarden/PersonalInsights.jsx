// src/components/KnowledgeGarden/PersonalInsights.jsx
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Zap,
  Calendar,
  BookOpen,
  MessageCircle,
  Brain,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import KnowledgeGardenService from '../../services/KnowledgeGardenService';

export default function PersonalInsights() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [insights, setInsights] = useState({
    journalGardenCorrelations: [],
    growthPatterns: [],
    breakthroughMoments: [],
    contentBreakdown: {}
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user, selectedTimeframe]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadContentBreakdown(),
        loadGrowthPatterns(),
        loadCorrelations(),
        loadBreakthroughMoments()
      ]);

    } catch (err) {
      console.error('Error loading insights:', err);
      setError('Failed to load insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTimeframeDate = () => {
    const now = new Date();
    switch (selectedTimeframe) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '3months':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  };

  const loadContentBreakdown = async () => {
    try {
      const sinceDate = getTimeframeDate();
      const response = await KnowledgeGardenService.getUserKnowledgeItems(user.id, {
        limit: 1000
      });

      if (response.success) {
        const items = response.data.filter(item =>
          new Date(item.created_at) >= sinceDate
        );

        const breakdown = {
          articles: items.filter(item => item.item_type === 'article').length,
          journals: items.filter(item => item.item_type === 'journal').length,
          conversations: items.filter(item => item.item_type === 'conversation').length,
          notes: items.filter(item => item.item_type === 'note').length,
          totalConnections: items.reduce((sum, item) => sum + (item.connection_count || 0), 0)
        };

        setInsights(prev => ({ ...prev, contentBreakdown: breakdown }));
      }
    } catch (error) {
      console.error('Error loading content breakdown:', error);
    }
  };

  const loadGrowthPatterns = async () => {
    try {
      const response = await KnowledgeGardenService.getUserKnowledgeItems(user.id, {
        limit: 1000,
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      if (response.success) {
        const items = response.data;
        const now = new Date();

        // Calculate periods based on timeframe
        let currentPeriod, previousPeriod, periodLabel;

        switch (selectedTimeframe) {
          case 'week':
            currentPeriod = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            previousPeriod = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
            periodLabel = 'Last week vs. previous week';
            break;
          case 'month':
            currentPeriod = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            previousPeriod = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
            periodLabel = 'Last month vs. previous month';
            break;
          case '3months':
            currentPeriod = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            previousPeriod = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
            periodLabel = 'Last 3 months vs. previous 3 months';
            break;
          default:
            currentPeriod = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            previousPeriod = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
            periodLabel = 'Last year vs. previous year';
        }

        const currentItems = items.filter(item =>
          new Date(item.created_at) >= currentPeriod
        );

        const previousItems = items.filter(item => {
          const date = new Date(item.created_at);
          return date >= previousPeriod && date < currentPeriod;
        });

        if (currentItems.length > 0 || previousItems.length > 0) {
          const currentConnections = currentItems.reduce((sum, item) => sum + (item.connection_count || 0), 0);
          const previousConnections = previousItems.reduce((sum, item) => sum + (item.connection_count || 0), 0);

          const contentChange = previousItems.length > 0 ?
            Math.round(((currentItems.length - previousItems.length) / previousItems.length) * 100) :
            currentItems.length > 0 ? 100 : 0;

          const connectionChange = previousConnections > 0 ?
            Math.round(((currentConnections - previousConnections) / previousConnections) * 100) :
            currentConnections > 0 ? 100 : 0;

          const patterns = [{
            period: periodLabel,
            trend: currentItems.length >= previousItems.length ? 'upward' : 'downward',
            description: currentItems.length > previousItems.length ?
              'Increased knowledge acquisition and organization' :
              'Steady knowledge building and reflection',
            metrics: {
              contentEngagement: `${contentChange >= 0 ? '+' : ''}${contentChange}%`,
              connectionCreation: `${connectionChange >= 0 ? '+' : ''}${connectionChange}%`,
              totalItems: `${currentItems.length} items`
            }
          }];

          setInsights(prev => ({ ...prev, growthPatterns: patterns }));
        }
      }
    } catch (error) {
      console.error('Error loading growth patterns:', error);
    }
  };

  const loadCorrelations = async () => {
    try {
      const response = await KnowledgeGardenService.getUserKnowledgeItems(user.id);

      if (response.success) {
        const items = response.data;
        const correlations = [];

        // Group items by tags to find potential correlations
        const tagGroups = {};
        items.forEach(item => {
          if (item.tags) {
            item.tags.forEach(tag => {
              if (!tagGroups[tag.name]) tagGroups[tag.name] = [];
              tagGroups[tag.name].push(item);
            });
          }
        });

        // Find groups with multiple items
        Object.entries(tagGroups).forEach(([tagName, taggedItems], index) => {
          if (taggedItems.length >= 3) {
            const journalItems = taggedItems.filter(item => item.item_type === 'journal');
            const otherItems = taggedItems.filter(item => item.item_type !== 'journal');

            if (journalItems.length >= 1 && otherItems.length >= 2) {
              correlations.push({
                id: index + 1,
                journalTheme: `${tagName.charAt(0).toUpperCase() + tagName.slice(1)} Insights`,
                connectedItems: otherItems.length,
                correlation: Math.min(0.6 + (taggedItems.length * 0.05), 0.95),
                insight: `Your journal entries about ${tagName} connect with ${otherItems.length} related knowledge items in your garden.`,
                suggestions: [`Review ${tagName} connections`, `Explore related patterns`]
              });
            }
          }
        });

        setInsights(prev => ({ ...prev, journalGardenCorrelations: correlations.slice(0, 3) }));
      }
    } catch (error) {
      console.error('Error loading correlations:', error);
    }
  };

  const loadBreakthroughMoments = async () => {
    try {
      const response = await KnowledgeGardenService.getUserKnowledgeItems(user.id, {
        limit: 100,
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      if (response.success) {
        const items = response.data;
        const breakthroughs = [];

        // Look for days with multiple related items (potential breakthrough moments)
        const itemsByDate = {};
        items.forEach(item => {
          const date = new Date(item.created_at).toDateString();
          if (!itemsByDate[date]) itemsByDate[date] = [];
          itemsByDate[date].push(item);
        });

        Object.entries(itemsByDate).forEach(([date, dayItems]) => {
          if (dayItems.length >= 2) {
            // Check if items share tags (indicating related breakthrough)
            const allTags = dayItems.flatMap(item => item.tags || []);
            const tagCounts = {};
            allTags.forEach(tag => {
              tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
            });

            const sharedTags = Object.entries(tagCounts)
              .filter(([, count]) => count >= 2)
              .map(([tag]) => tag);

            if (sharedTags.length > 0) {
              breakthroughs.push({
                date: new Date(date).toISOString().split('T')[0],
                title: `${sharedTags[0].charAt(0).toUpperCase() + sharedTags[0].slice(1)} Connection Day`,
                description: `Connected multiple insights around ${sharedTags.join(', ')}, adding ${dayItems.length} related items to your garden.`,
                impact: dayItems.length >= 3 ? 'High' : 'Medium',
                relatedItems: dayItems.map(item => item.title).slice(0, 3)
              });
            }
          }
        });

        setInsights(prev => ({
          ...prev,
          breakthroughMoments: breakthroughs.slice(0, 5)
        }));
      }
    } catch (error) {
      console.error('Error loading breakthrough moments:', error);
    }
  };

  const CorrelationCard = ({ correlation }) => (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold mb-1">{correlation.journalTheme}</h3>
          <p className="text-gray-400 text-sm">{correlation.connectedItems} connected items</p>
        </div>
        <div className="bg-green-500/20 px-3 py-1 rounded-full">
          <span className="text-green-300 text-sm font-medium">
            {Math.round(correlation.correlation * 100)}% match
          </span>
        </div>
      </div>
      
      <p className="text-gray-300 text-sm mb-4">{correlation.insight}</p>
      
      <div className="space-y-2">
        <h4 className="text-white text-sm font-medium">Suggestions:</h4>
        <ul className="space-y-1">
          {correlation.suggestions.map((suggestion, index) => (
            <li key={index} className="text-gray-400 text-sm flex items-center gap-2">
              <Target className="h-3 w-3 text-purple-400" />
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const BreakthroughCard = ({ breakthrough }) => (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
      <div className="flex items-start gap-4">
        <div className="bg-yellow-500/20 p-2 rounded-lg flex-shrink-0">
          <Zap className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">{breakthrough.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              breakthrough.impact === 'High' ? 'text-red-300 bg-red-500/20' :
              breakthrough.impact === 'Medium' ? 'text-yellow-300 bg-yellow-500/20' :
              'text-green-300 bg-green-500/20'
            }`}>
              {breakthrough.impact} Impact
            </span>
          </div>
          
          <p className="text-gray-400 text-sm mb-1">{new Date(breakthrough.date).toLocaleDateString()}</p>
          <p className="text-gray-300 text-sm mb-3">{breakthrough.description}</p>
          
          <div>
            <h4 className="text-white text-xs font-medium mb-2">Related Items:</h4>
            <div className="flex flex-wrap gap-2">
              {breakthrough.relatedItems.map((item, index) => (
                <span key={index} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ContentOverviewCard = () => (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue-400" />
        Content Overview
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="bg-blue-500/20 p-3 rounded-lg mb-2 mx-auto w-fit">
            <BookOpen className="h-6 w-6 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{insights.contentBreakdown.articles}</p>
          <p className="text-gray-400 text-sm">Articles</p>
        </div>
        
        <div className="text-center">
          <div className="bg-green-500/20 p-3 rounded-lg mb-2 mx-auto w-fit">
            <BookOpen className="h-6 w-6 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{insights.contentBreakdown.journals}</p>
          <p className="text-gray-400 text-sm">Journals</p>
        </div>
        
        <div className="text-center">
          <div className="bg-purple-500/20 p-3 rounded-lg mb-2 mx-auto w-fit">
            <MessageCircle className="h-6 w-6 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{insights.contentBreakdown.conversations}</p>
          <p className="text-gray-400 text-sm">Conversations</p>
        </div>
        
        <div className="text-center">
          <div className="bg-yellow-500/20 p-3 rounded-lg mb-2 mx-auto w-fit">
            <Brain className="h-6 w-6 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-white">{insights.contentBreakdown.notes}</p>
          <p className="text-gray-400 text-sm">Notes</p>
        </div>
      </div>
      
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Total Connections</span>
          <span className="text-white font-semibold">{insights.contentBreakdown.totalConnections}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your insights...</p>
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
            onClick={loadInsights}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalItems = Object.values(insights.contentBreakdown).reduce((sum, val) =>
    typeof val === 'number' && val !== insights.contentBreakdown.totalConnections ? sum + val : sum, 0
  );

  const isEmpty = totalItems === 0;

  if (isEmpty) {
    return (
      <div className="p-6 space-y-8">
        {/* Timeframe Selector */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Personal Insights</h1>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-1">
            {['week', 'month', '3months', 'year'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-purple-500/30 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {timeframe === '3months' ? '3 Months' : timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-8 rounded-2xl backdrop-blur-sm border border-white/10 mb-6 mx-auto max-w-md">
            <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">No Insights Yet</h2>
            <p className="text-gray-300 mb-6">
              Add knowledge items to your garden to start generating personal insights and correlations.
            </p>
            <button
              onClick={() => navigate('/knowledge-garden/library')}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-6 py-3 rounded-lg transition-colors"
            >
              Add Your First Item
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Personal Insights</h1>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-1">
          {['week', 'month', '3months', 'year'].map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-purple-500/30 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {timeframe === '3months' ? '3 Months' : timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content Overview */}
      <ContentOverviewCard />

      {/* Cross-Content Correlations */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-400" />
          Cross-Content Correlations
        </h2>
        {insights.journalGardenCorrelations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.journalGardenCorrelations.map((correlation) => (
              <CorrelationCard key={correlation.id} correlation={correlation} />
            ))}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <TrendingUp className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No correlations found</h3>
            <p className="text-gray-400">Add more tagged content to discover connections between your knowledge and journals</p>
          </div>
        )}
      </section>

      {/* Growth Patterns */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          Growth Patterns
        </h2>
        {insights.growthPatterns.length > 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            {insights.growthPatterns.map((pattern, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className={`h-5 w-5 ${pattern.trend === 'upward' ? 'text-green-400' : 'text-red-400'}`} />
                  <h3 className="text-white font-semibold">{pattern.period}</h3>
                </div>

                <p className="text-gray-300 text-sm mb-4">{pattern.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(pattern.metrics).map(([metric, value]) => (
                    <div key={metric} className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                        {metric.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </p>
                      <p className="text-green-300 font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No growth patterns yet</h3>
            <p className="text-gray-400">Continue adding content over time to see your knowledge growth trends</p>
          </div>
        )}
      </section>

      {/* Breakthrough Moments */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          Breakthrough Moments
        </h2>
        {insights.breakthroughMoments.length > 0 ? (
          <div className="space-y-4">
            {insights.breakthroughMoments.map((breakthrough) => (
              <BreakthroughCard key={breakthrough.date} breakthrough={breakthrough} />
            ))}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <Zap className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No breakthrough moments detected</h3>
            <p className="text-gray-400">Keep adding related content to identify meaningful connection moments</p>
          </div>
        )}
      </section>
    </div>
  );
}