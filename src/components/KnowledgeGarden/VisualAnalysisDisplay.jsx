// src/components/KnowledgeGarden/VisualAnalysisDisplay.jsx
import React, { useState, useEffect } from 'react';
import {
  Eye,
  Sparkles,
  TrendingUp,
  Target,
  Palette,
  Brain,
  Calendar,
  BarChart3,
  ArrowRight,
  Lightbulb,
  Heart,
  Activity
} from 'lucide-react';

export default function VisualAnalysisDisplay({ documentUploadId, analysisData }) {
  const [insights, setInsights] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // overview, elements, patterns, insights

  useEffect(() => {
    if (analysisData) {
      processAnalysisData(analysisData);
    } else if (documentUploadId) {
      fetchAnalysisData();
    }
  }, [documentUploadId, analysisData]);

  const fetchAnalysisData = async () => {
    try {
      const response = await fetch(
        `/api/visual/analysis?user_id=current-user-id&action=elements&document_upload_id=${documentUploadId}`
      );
      const result = await response.json();

      if (result.success) {
        processAnalysisData(result.data);
      }
    } catch (error) {
      console.error('Error fetching analysis data:', error);
    }
  };

  const processAnalysisData = (data) => {
    // Process and organize the analysis data for display
    const processed = {
      overview: {
        totalElements: data.visualElements?.length || 0,
        mood: data.overallMood || 'neutral',
        energy: data.energyLevel || 'medium',
        confidence: 0.85
      },
      elements: data.visualElements || [],
      symbols: data.symbols || [],
      insights: data.insights || '',
      connections: data.connections || ''
    };
    setInsights(processed);
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: 'text-yellow-400 bg-yellow-500/20',
      peaceful: 'text-blue-400 bg-blue-500/20',
      energetic: 'text-orange-400 bg-orange-500/20',
      contemplative: 'text-purple-400 bg-purple-500/20',
      melancholy: 'text-gray-400 bg-gray-500/20',
      neutral: 'text-gray-300 bg-gray-500/20'
    };
    return colors[mood] || colors.neutral;
  };

  const getEnergyColor = (energy) => {
    const colors = {
      high: 'text-red-400 bg-red-500/20',
      medium: 'text-yellow-400 bg-yellow-500/20',
      low: 'text-blue-400 bg-blue-500/20'
    };
    return colors[energy] || colors.medium;
  };

  const getElementTypeIcon = (type) => {
    const icons = {
      object: Target,
      symbol: Sparkles,
      text: Eye,
      mood_indicator: Heart
    };
    return icons[type] || Target;
  };

  if (!insights) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Loading visual analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="h-5 w-5 text-blue-400" />
            <span className="text-white font-medium">Elements Detected</span>
          </div>
          <div className="text-2xl font-bold text-white">{insights.overview.totalElements}</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-5 w-5 text-pink-400" />
            <span className="text-white font-medium">Overall Mood</span>
          </div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getMoodColor(insights.overview.mood)}`}>
            {insights.overview.mood}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-green-400" />
            <span className="text-white font-medium">Energy Level</span>
          </div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEnergyColor(insights.overview.energy)}`}>
            {insights.overview.energy}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      {insights.insights && (
        <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-blue-300 font-semibold mb-2">AI Insights</h3>
              <p className="text-blue-100 leading-relaxed">{insights.insights}</p>
            </div>
          </div>
        </div>
      )}

      {/* Connections */}
      {insights.connections && (
        <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-purple-300 font-semibold mb-2">Potential Connections</h3>
              <p className="text-purple-100 leading-relaxed">{insights.connections}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const ElementsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Detected Elements ({insights.elements.length})</h3>
      </div>

      <div className="space-y-3">
        {insights.elements.map((element, index) => {
          const Icon = getElementTypeIcon(element.element_type);
          return (
            <div
              key={index}
              className={`bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors ${
                selectedElement === index ? 'ring-2 ring-purple-400/50' : ''
              }`}
              onClick={() => setSelectedElement(selectedElement === index ? null : index)}
            >
              <div className="flex items-start gap-4">
                <div className="bg-purple-500/20 p-2 rounded-lg flex-shrink-0">
                  <Icon className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-medium">{element.element_name}</h4>
                      <span className="text-sm text-gray-400 capitalize">{element.element_type}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-purple-300">
                        {Math.round(element.confidence_score * 100)}% confidence
                      </div>
                    </div>
                  </div>

                  {selectedElement === index && element.significance && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg">
                      <h5 className="text-gray-300 font-medium mb-1">Significance</h5>
                      <p className="text-gray-400 text-sm">{element.significance}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const SymbolsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Recurring Symbols ({insights.symbols.length})</h3>
      </div>

      {insights.symbols.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.symbols.map((symbol, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-yellow-500/20 p-2 rounded-lg">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                </div>
                <h4 className="text-white font-medium">{symbol}</h4>
              </div>
              <p className="text-gray-400 text-sm">
                This symbol appears to represent personal meaning or emotional significance in your visual expression.
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No recurring symbols detected in this image.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <Eye className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Visual Analysis</h2>
              <p className="text-gray-400 text-sm">AI-powered analysis of visual elements and patterns</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Confidence</div>
            <div className="text-white font-semibold">
              {Math.round(insights.overview.confidence * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-white/10">
        <div className="flex">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'elements', label: 'Elements', icon: Target },
            { id: 'symbols', label: 'Symbols', icon: Sparkles }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                viewMode === id
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'overview' && <OverviewTab />}
        {viewMode === 'elements' && <ElementsTab />}
        {viewMode === 'symbols' && <SymbolsTab />}
      </div>
    </div>
  );
}