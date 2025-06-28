// src/components/goals/tabs/GoalDependenciesTab.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  GitBranch,
  Network,
  Target,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  TrendingUp,
  Link2,
  Layers,
  Eye,
  EyeOff,
} from "lucide-react";

const GoalDependenciesTab = ({ goals, colors }) => {
  const [viewMode, setViewMode] = useState("network");
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const canvasRef = useRef(null);

  // Mock dependency data
  const dependencies = [
    {
      from: "Learn Python",
      to: "Build Web App",
      type: "blocks",
      strength: "strong",
    },
    {
      from: "Fitness Base",
      to: "Marathon Training",
      type: "blocks",
      strength: "strong",
    },
    {
      from: "Save Emergency Fund",
      to: "Investment Portfolio",
      type: "blocks",
      strength: "medium",
    },
    {
      from: "Morning Routine",
      to: "Productivity Goals",
      type: "enables",
      strength: "medium",
    },
    {
      from: "Meditation Practice",
      to: "Stress Management",
      type: "enables",
      strength: "strong",
    },
    {
      from: "Network Building",
      to: "Career Advancement",
      type: "enables",
      strength: "medium",
    },
  ];

  // Dependency chain analysis
  const dependencyChains = [
    {
      name: "Technical Skills Path",
      goals: ["Learn Python", "Build Web App", "Launch SaaS"],
      progress: 45,
      blockers: 1,
      critical: true,
    },
    {
      name: "Health & Fitness Journey",
      goals: ["Fitness Base", "Marathon Training", "Complete Marathon"],
      progress: 72,
      blockers: 0,
      critical: false,
    },
    {
      name: "Financial Independence",
      goals: [
        "Save Emergency Fund",
        "Investment Portfolio",
        "Financial Freedom",
      ],
      progress: 38,
      blockers: 2,
      critical: true,
    },
  ];

  // Circular dependency detection
  const circularDependencies = [
    { goals: ["Project Management", "Team Leadership"], severity: "high" },
  ];

  // Draw network visualization
  useEffect(() => {
    if (viewMode === "network" && canvasRef.current) {
      drawDependencyNetwork();
    }
  }, [viewMode, selectedGoal, showCompleted]);

  const drawDependencyNetwork = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    // Set canvas size
    canvas.width = rect.width;
    canvas.height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mock node positions
    const nodes = goals.slice(0, 8).map((goal, index) => ({
      id: goal.id,
      name: goal.decryptedTitle,
      x: 100 + (index % 4) * 150,
      y: 100 + Math.floor(index / 4) * 150,
      radius: 30,
      progress: goal.progress || 0,
      status: goal.status,
    }));

    // Draw dependencies (edges)
    ctx.strokeStyle = "rgba(139, 92, 246, 0.3)";
    ctx.lineWidth = 2;
    dependencies.forEach((dep) => {
      const fromNode = nodes.find((n) =>
        n.name?.includes(dep.from.split(" ")[0])
      );
      const toNode = nodes.find((n) => n.name?.includes(dep.to.split(" ")[0]));

      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();

        // Draw arrow
        const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
        const arrowX = toNode.x - Math.cos(angle) * (toNode.radius + 10);
        const arrowY = toNode.y - Math.sin(angle) * (toNode.radius + 10);

        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -5);
        ctx.lineTo(-10, 5);
        ctx.closePath();
        ctx.fillStyle = "rgba(139, 92, 246, 0.5)";
        ctx.fill();
        ctx.restore();
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);

      // Fill based on status
      if (node.status === "completed") {
        ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
      } else if (node.status === "active") {
        ctx.fillStyle = "rgba(139, 92, 246, 0.2)";
      } else {
        ctx.fillStyle = "rgba(107, 114, 128, 0.2)";
      }
      ctx.fill();

      // Progress ring
      ctx.strokeStyle = node.status === "completed" ? "#10B981" : "#8B5CF6";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Node label
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = node.name?.substring(0, 10) + "...";
      ctx.fillText(label, node.x, node.y);
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <GitBranch className="h-5 w-5 text-purple-400" />
          Goal Dependencies Mapping
        </h3>
        <p className="text-sm text-gray-300">
          Visualize how your goals connect and influence each other
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="network">Network View</option>
          <option value="chains">Dependency Chains</option>
          <option value="matrix">Dependency Matrix</option>
          <option value="timeline">Timeline View</option>
        </select>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            showCompleted
              ? "bg-purple-500/20 text-purple-300 border border-purple-400/30"
              : "bg-white/10 text-gray-300 border border-white/20"
          }`}
        >
          {showCompleted ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          {showCompleted ? "Hide" : "Show"} Completed
        </button>
      </div>

      {/* Alerts */}
      {circularDependencies.length > 0 && (
        <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white mb-1">
                Circular Dependencies Detected
              </h4>
              <p className="text-sm text-gray-300">
                Some goals depend on each other in a circular pattern, which may
                cause progress blockers.
              </p>
              <div className="mt-2 space-y-1">
                {circularDependencies.map((circular, index) => (
                  <div key={index} className="text-xs text-gray-400">
                    {circular.goals.join(" ↔ ")}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === "network" && (
        <>
          {/* Network Visualization */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
            <h4 className="text-md font-semibold text-white mb-4">
              Goal Dependency Network
            </h4>
            <canvas
              ref={canvasRef}
              className="w-full rounded-lg bg-black/20"
              style={{ height: "400px" }}
            />
            <div className="flex items-center justify-center gap-6 mt-4">
              <LegendItem
                icon={CheckCircle2}
                color="#10B981"
                label="Completed"
              />
              <LegendItem icon={Target} color="#8B5CF6" label="Active" />
              <LegendItem icon={Lock} color="#6B7280" label="Blocked" />
              <LegendItem icon={Link2} color="#8B5CF640" label="Dependency" />
            </div>
          </div>

          {/* Dependency Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DependencyStats
              goals={goals}
              dependencies={dependencies}
              colors={colors}
            />
            <BlockerAnalysis
              dependencies={dependencies}
              goals={goals}
              colors={colors}
            />
          </div>
        </>
      )}

      {viewMode === "chains" && (
        <div className="space-y-6">
          {/* Dependency Chains */}
          {dependencyChains.map((chain, index) => (
            <DependencyChainCard key={index} chain={chain} colors={colors} />
          ))}

          {/* Chain Insights */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
            <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
              <Network className="h-5 w-5 text-purple-400" />
              Dependency Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InsightCard
                title="Critical Path Identified"
                description="Technical Skills Path is your longest dependency chain"
                type="critical"
              />
              <InsightCard
                title="Quick Win Available"
                description="Complete 'Fitness Base' to unlock 3 dependent goals"
                type="opportunity"
              />
              <InsightCard
                title="Parallel Opportunities"
                description="4 goals can be pursued independently right now"
                type="suggestion"
              />
              <InsightCard
                title="Bottleneck Alert"
                description="'Save Emergency Fund' blocks 40% of financial goals"
                type="warning"
              />
            </div>
          </div>
        </div>
      )}

      {viewMode === "matrix" && (
        <DependencyMatrix
          goals={goals}
          dependencies={dependencies}
          colors={colors}
        />
      )}
    </div>
  );
};

// Helper Components
const LegendItem = ({ icon: Icon, color, label }) => (
  <div className="flex items-center gap-2">
    <Icon className="h-4 w-4" style={{ color }} />
    <span className="text-sm text-gray-300">{label}</span>
  </div>
);

const DependencyStats = ({ goals, dependencies, colors }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
    <h4 className="text-md font-semibold text-white mb-4">
      Dependency Statistics
    </h4>
    <div className="space-y-3">
      <StatItem
        label="Total Dependencies"
        value={dependencies.length}
        icon={Link2}
        color={colors.primary}
      />
      <StatItem
        label="Blocked Goals"
        value={Math.floor(goals.length * 0.3)}
        icon={Lock}
        color={colors.danger}
      />
      <StatItem
        label="Independent Goals"
        value={Math.floor(goals.length * 0.4)}
        icon={Unlock}
        color={colors.success}
      />
      <StatItem
        label="Chain Depth"
        value="3 levels"
        icon={Layers}
        color={colors.info}
      />
    </div>
  </div>
);

const BlockerAnalysis = ({ dependencies, goals, colors }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
    <h4 className="text-md font-semibold text-white mb-4">Blocker Analysis</h4>
    <div className="space-y-3">
      <BlockerItem
        goal="Learn Python"
        blockedCount={3}
        priority="high"
        progress={65}
        colors={colors}
      />
      <BlockerItem
        goal="Save Emergency Fund"
        blockedCount={2}
        priority="high"
        progress={40}
        colors={colors}
      />
      <BlockerItem
        goal="Fitness Base"
        blockedCount={2}
        priority="medium"
        progress={80}
        colors={colors}
      />
    </div>
  </div>
);

const StatItem = ({ label, value, icon: Icon, color }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4" style={{ color }} />
      <span className="text-sm text-gray-300">{label}</span>
    </div>
    <span className="text-sm font-medium text-white">{value}</span>
  </div>
);

const BlockerItem = ({ goal, blockedCount, priority, progress, colors }) => {
  const priorityColor = priority === "high" ? colors.danger : colors.warning;

  return (
    <div className="p-3 bg-white/5 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">{goal}</span>
        <span
          className="text-xs px-2 py-1 rounded"
          style={{
            backgroundColor: `${priorityColor}20`,
            color: priorityColor,
          }}
        >
          Blocks {blockedCount} goals
        </span>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 mt-1">{progress}% complete</span>
    </div>
  );
};

const DependencyChainCard = ({ chain, colors }) => {
  const statusColor = chain.critical ? colors.danger : colors.success;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-white">{chain.name}</h5>
        <div className="flex items-center gap-2">
          {chain.critical && (
            <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded">
              Critical Path
            </span>
          )}
          {chain.blockers > 0 && (
            <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">
              {chain.blockers} blocker{chain.blockers > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Chain Visualization */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto">
        {chain.goals.map((goal, index) => (
          <React.Fragment key={index}>
            <div className="flex-shrink-0 px-3 py-2 bg-white/10 rounded-lg text-sm text-white whitespace-nowrap">
              {goal}
            </div>
            {index < chain.goals.length - 1 && (
              <TrendingUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700/50 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${chain.progress}%`,
            backgroundColor: statusColor,
          }}
        />
      </div>
      <span className="text-xs text-gray-400 mt-1">
        {chain.progress}% complete
      </span>
    </div>
  );
};

const InsightCard = ({ title, description, type }) => {
  const typeStyles = {
    critical: "bg-red-500/10 border-red-400/30 text-red-400",
    opportunity: "bg-green-500/10 border-green-400/30 text-green-400",
    suggestion: "bg-blue-500/10 border-blue-400/30 text-blue-400",
    warning: "bg-yellow-500/10 border-yellow-400/30 text-yellow-400",
  };

  return (
    <div className={`p-3 rounded-lg border ${typeStyles[type]}`}>
      <h5 className="font-medium text-white text-sm mb-1">{title}</h5>
      <p className="text-xs text-gray-300">{description}</p>
    </div>
  );
};

const DependencyMatrix = ({ goals, dependencies, colors }) => {
  const matrixGoals = goals.slice(0, 6);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
      <h4 className="text-md font-semibold text-white mb-4">
        Dependency Matrix
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs text-gray-400">From / To</th>
              {matrixGoals.map((goal, index) => (
                <th
                  key={index}
                  className="p-2 text-xs text-gray-400 font-normal"
                >
                  <div className="truncate w-20" title={goal.decryptedTitle}>
                    {goal.decryptedTitle?.substring(0, 8)}...
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixGoals.map((fromGoal, fromIndex) => (
              <tr key={fromIndex}>
                <td className="p-2 text-xs text-white font-medium">
                  <div
                    className="truncate w-20"
                    title={fromGoal.decryptedTitle}
                  >
                    {fromGoal.decryptedTitle?.substring(0, 8)}...
                  </div>
                </td>
                {matrixGoals.map((toGoal, toIndex) => (
                  <td key={toIndex} className="p-2 text-center">
                    {fromIndex !== toIndex && Math.random() > 0.7 && (
                      <div className="w-6 h-6 mx-auto rounded bg-purple-500/30 flex items-center justify-center">
                        <Link2 className="h-3 w-3 text-purple-400" />
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-4 text-center">
        Dependencies flow from rows to columns
      </p>
    </div>
  );
};

export default GoalDependenciesTab;
