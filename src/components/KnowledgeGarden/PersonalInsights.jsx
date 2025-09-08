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

export default function PersonalInsights() {
  const [insights, setInsights] = useState({
    journalGardenCorrelations: [],
    growthPatterns: [],
    breakthroughMoments: [],
    contentBreakdown: {}
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  // Mock data for development
  useEffect(() => {
    setInsights({
      journalGardenCorrelations: [
        {
          id: 1,
          journalTheme: 'Productivity Struggles',
          connectedItems: 3,
          correlation: 0.87,
          insight: 'Your journal entries about productivity struggles strongly correlate with articles on flow state and deep work.',
          suggestions: ['Review flow state principles', 'Apply deep work techniques']
        },
        {
          id: 2,
          journalTheme: 'Relationship Anxiety',
          connectedItems: 5,
          correlation: 0.72,
          insight: 'Relationship concerns in your journals connect to attachment theory and communication resources.',
          suggestions: ['Practice secure attachment', 'Implement communication tools']
        }
      ],
      growthPatterns: [
        {
          period: 'Last 3 months',
          trend: 'upward',
          description: 'Increased focus on personal development',
          metrics: {
            contentEngagement: '+45%',
            connectionCreation: '+67%',
            insightGeneration: '+23%'
          }
        }
      ],
      breakthroughMoments: [
        {
          date: '2024-01-15',
          title: 'Flow State Breakthrough',
          description: 'Connected productivity struggles with flow state research, leading to new daily practices.',
          impact: 'High',
          relatedItems: ['Flow State Article', 'Productivity Journal Entry', 'Deep Work Notes']
        },
        {
          date: '2024-01-08', 
          title: 'Communication Pattern Recognition',
          description: 'Identified recurring communication patterns through journal analysis and relationship resources.',
          impact: 'Medium',
          relatedItems: ['Communication Skills Article', 'Relationship Journal', 'Conflict Resolution Notes']
        }
      ],
      contentBreakdown: {
        articles: 12,
        journals: 28,
        conversations: 6,
        notes: 8,
        totalConnections: 47
      }
    });
  }, [selectedTimeframe]);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {insights.journalGardenCorrelations.map((correlation) => (
            <CorrelationCard key={correlation.id} correlation={correlation} />
          ))}
        </div>
      </section>

      {/* Growth Patterns */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          Growth Patterns
        </h2>
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
      </section>

      {/* Breakthrough Moments */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-400" />
          Breakthrough Moments
        </h2>
        <div className="space-y-4">
          {insights.breakthroughMoments.map((breakthrough) => (
            <BreakthroughCard key={breakthrough.date} breakthrough={breakthrough} />
          ))}
        </div>
      </section>
    </div>
  );
}