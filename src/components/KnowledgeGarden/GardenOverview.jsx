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
  Sparkles
} from 'lucide-react';

export default function GardenOverview() {
  const [gardenStats, setGardenStats] = useState({
    totalItems: 0,
    totalConnections: 0,
    itemsThisWeek: 0,
    connectionsThisWeek: 0,
    lastActivity: null
  });

  const [weeklyInsights, setWeeklyInsights] = useState([]);
  const [suggestedActions, setSuggestedActions] = useState([]);

  // Mock data for development - will be replaced with real API calls
  useEffect(() => {
    // Simulate loading garden stats
    setGardenStats({
      totalItems: 23,
      totalConnections: 47,
      itemsThisWeek: 3,
      connectionsThisWeek: 8,
      lastActivity: new Date()
    });

    // Mock weekly insights
    setWeeklyInsights([
      {
        id: 1,
        type: 'pattern',
        title: 'Journal-Garden Connection Pattern Detected',
        description: 'Your recent journal entries about productivity correlate with 3 saved articles on flow state.',
        action: 'Explore connections',
        confidence: 0.87
      },
      {
        id: 2,
        type: 'growth',
        title: 'Knowledge Growth Momentum',
        description: 'You\'ve added 40% more content this month compared to last month.',
        action: 'View timeline',
        confidence: 0.95
      }
    ]);

    // Mock suggested actions
    setSuggestedActions([
      {
        id: 1,
        priority: 'high',
        title: 'Connect recent journal to saved articles',
        description: 'Your Tuesday journal entry mentions themes found in 2 unconnected articles.',
        action: () => console.log('Navigate to connection suggestion')
      },
      {
        id: 2,
        priority: 'medium',
        title: 'Review 3 unread library saves',
        description: 'You have quality content waiting to be integrated into your garden.',
        action: () => console.log('Navigate to library')
      },
      {
        id: 3,
        priority: 'low',
        title: 'Organize items into folders',
        description: '12 items could benefit from better organization.',
        action: () => console.log('Navigate to organization')
      }
    ]);
  }, []);

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
            value="8.2/10"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {weeklyInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </section>

      {/* Suggested Actions */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-400" />
          Suggested Actions
        </h2>
        <div className="space-y-4">
          {suggestedActions.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-white/10 rounded-xl p-4 hover:from-green-500/30 hover:to-blue-500/30 transition-all text-left">
            <Plus className="h-6 w-6 text-green-400 mb-2" />
            <h3 className="text-white font-medium mb-1">Add Knowledge Item</h3>
            <p className="text-gray-400 text-sm">Import article, document, or note</p>
          </button>
          
          <button className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/10 rounded-xl p-4 hover:from-purple-500/30 hover:to-pink-500/30 transition-all text-left">
            <TrendingUp className="h-6 w-6 text-purple-400 mb-2" />
            <h3 className="text-white font-medium mb-1">Create Connection</h3>
            <p className="text-gray-400 text-sm">Link related items together</p>
          </button>
          
          <button className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-white/10 rounded-xl p-4 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all text-left">
            <Lightbulb className="h-6 w-6 text-blue-400 mb-2" />
            <h3 className="text-white font-medium mb-1">Explore Insights</h3>
            <p className="text-gray-400 text-sm">View AI-generated patterns</p>
          </button>
        </div>
      </section>
    </div>
  );
}