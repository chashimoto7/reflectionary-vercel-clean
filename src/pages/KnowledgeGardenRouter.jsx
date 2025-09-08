// src/pages/KnowledgeGardenRouter.jsx
import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  Search, 
  Library,
  Sparkles,
  TreePine
} from 'lucide-react';

// Knowledge Garden Tab Components
import GardenOverview from '../components/KnowledgeGarden/GardenOverview';
import PersonalInsights from '../components/KnowledgeGarden/PersonalInsights';  
import SearchDiscover from '../components/KnowledgeGarden/SearchDiscover';
import LibraryTab from '../components/KnowledgeGarden/LibraryTab';

export default function KnowledgeGardenRouter() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Tab navigation configuration
  const tabs = [
    {
      id: 'overview',
      label: 'Garden Overview',
      icon: TreePine,
      path: '/knowledge-garden',
      component: GardenOverview,
      description: 'Garden health, AI insights, and suggested actions'
    },
    {
      id: 'insights', 
      label: 'Personal Insights',
      icon: Sparkles,
      path: '/knowledge-garden/insights',
      component: PersonalInsights,
      description: 'Cross-content correlations and growth patterns'
    },
    {
      id: 'search',
      label: 'Search & Discover', 
      icon: Search,
      path: '/knowledge-garden/search',
      component: SearchDiscover,
      description: 'Universal search and connection mapping'
    },
    {
      id: 'library',
      label: 'Library',
      icon: Library, 
      path: '/knowledge-garden/library',
      component: LibraryTab,
      description: 'Curated content discovery and import'
    }
  ];

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (currentPath === '/knowledge-garden') return 'overview';
    if (currentPath.includes('insights')) return 'insights';
    if (currentPath.includes('search')) return 'search';
    if (currentPath.includes('library')) return 'library';
    return 'overview';
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen">
      {/* Header Section with Garden Branding */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-500/20 to-purple-500/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
            <TreePine className="h-8 w-8 text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Knowledge Garden</h1>
            <p className="text-gray-300">Where your personal wisdom lives and grows</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2">
          <nav className="flex gap-2" role="tablist">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-green-500/30 to-purple-500/30 text-white shadow-lg border border-green-400/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  role="tab"
                  aria-selected={isActive}
                >
                  <IconComponent className={`h-5 w-5 ${isActive ? 'text-green-400' : 'group-hover:text-green-400'} transition-colors`} />
                  <span className="hidden sm:block">{tab.label}</span>
                  <span className="block sm:hidden text-xs">{tab.id}</span>
                  
                  {/* Active tab indicator */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-purple-500/10 rounded-xl" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Active Tab Description */}
        <div className="mt-4">
          {tabs.map(tab => (
            activeTab === tab.id && (
              <p key={tab.id} className="text-gray-400 text-center">
                {tab.description}
              </p>
            )
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl min-h-[600px]">
        <Routes>
          <Route path="/" element={<GardenOverview />} />
          <Route path="/insights" element={<PersonalInsights />} />
          <Route path="/search" element={<SearchDiscover />} />  
          <Route path="/library" element={<LibraryTab />} />
        </Routes>
      </div>
    </div>
  );
}