// frontend/src/components/goals/tabs/DependenciesTab.jsx
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
  Flag,
  Clock,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  GitCommit,
  ArrowRight,
  Edit3,
  Plus,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Cell,
  ComposedChart,
  ReferenceLine,
} from "recharts";

const DependenciesTab = ({ goals, colors, onEditMilestones }) => {
  const [viewMode, setViewMode] = useState("network");
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [milestoneView, setMilestoneView] = useState("timeline");
  const canvasRef = useRef(null);

  // Calculate milestone statistics
  const milestoneStats = calculateMilestoneStats(goals);

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
  ];

  // Dependency chain analysis
  const dependencyChains = [
    {
      name: "Technical Skills Path",
      goals: ["Learn Python", "Build Web App", "Launch SaaS"],
      progress: 45,
      blockers: 1,
      critical: true,
      milestones: 12,
      completedMilestones: 5,
    },
    {
      name: "Health & Fitness Journey",
      goals: ["Fitness Base", "Marathon Training", "Complete Marathon"],
      progress: 72,
      blockers: 0,
      critical: false,
      milestones: 15,
      completedMilestones: 11,
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
      milestones: 10,
      completedMilestones: 4,
    },
  ];

  // Milestone completion timeline
  const completionTimeline = [
    { month: "Jan", planned: 12, completed: 10, overdue: 2 },
    { month: "Feb", planned: 15, completed: 14, overdue: 1 },
    { month: "Mar", planned: 18, completed: 16, overdue: 3 },
    { month: "Apr", planned: 20, completed: 19, overdue: 2 },
    { month: "May", planned: 16, completed: 15, overdue: 1 },
    { month: "Jun", planned: 22, completed: 20, overdue: 3 },
  ];

  // Milestone velocity by goal
  const goalMilestoneVelocity = goals.slice(0, 6).map((goal) => ({
    id: goal.id,
    name: goal.decryptedTitle?.substring(0, 15) + "...",
    velocity: Math.random() * 5 + 1,
    completed: goal.milestones?.filter((m) => m.completed).length || 0,
    total: goal.milestones?.length || 0,
    remaining:
      (goal.milestones?.length || 0) -
      (goal.milestones?.filter((m) => m.completed).length || 0),
    onTrack: Math.random() > 0.3,
    dependencies: Math.floor(Math.random() * 3),
  }));

  // Bottleneck analysis
  const bottlenecks = [
    {
      milestone: "Portfolio Review",
      goalName: "Career Advancement",
      daysStuck: 15,
      impact: "high",
      blockers: ["Waiting for feedback", "Resource constraints"],
      dependentGoals: 2,
    },
    {
      milestone: "API Integration",
      goalName: "Tech Project",
      daysStuck: 12,
      impact: "high",
      blockers: ["Technical dependencies", "Documentation gaps"],
      dependentGoals: 3,
    },
    {
      milestone: "User Testing",
      goalName: "Product Launch",
      daysStuck: 8,
      impact: "medium",
      blockers: ["Participant recruitment", "Schedule conflicts"],
      dependentGoals: 1,
    },
  ];

  // Draw network visualization
  useEffect(() => {
    if (viewMode === "network" && canvasRef.current) {
      drawDependencyNetwork();
    }
  }, [viewMode, selectedGoal, showCompleted, goals]);

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
      milestones: goal.milestones?.length || 0,
      completedMilestones:
        goal.milestones?.filter((m) => m.completed).length || 0,
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
      // Skip completed goals if showCompleted is false
      if (!showCompleted && node.status === "completed") return;

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
      ctx.fillText(label, node.x, node.y - 10);

      // Milestone indicator
      if (node.milestones > 0) {
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "#9CA3AF";
        ctx.fillText(
          `${node.completedMilestones}/${node.milestones}`,
          node.x,
          node.y + 10
        );
      }
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <GitBranch className="h-5 w-5 text-purple-400" />
          Dependencies & Milestones
        </h3>
        <p className="text-sm text-gray-300">
          Visualize goal connections and track milestone progress
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
          <option value="milestones">Milestone Analytics</option>
          <option value="bottlenecks">Bottleneck Analysis</option>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <MetricCard
          icon={CheckCircle2}
          value={milestoneStats.totalCompleted}
          label="Completed"
          subtitle="Milestones"
          color={colors.success}
        />
        <MetricCard
          icon={Clock}
          value={milestoneStats.inProgress}
          label="In Progress"
          subtitle="Active milestones"
          color={colors.info}
        />
        <MetricCard
          icon={AlertCircle}
          value={milestoneStats.overdue}
          label="Overdue"
          subtitle="Need attention"
          color={colors.danger}
        />
        <MetricCard
          icon={GitBranch}
          value={dependencies.length}
          label="Dependencies"
          subtitle="Goal connections"
          color={colors.primary}
        />
        <MetricCard
          icon={Zap}
          value={`${milestoneStats.avgVelocity} days`}
          label="Avg Completion"
          subtitle="Time to complete"
          color={colors.secondary}
        />
      </div>

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
            <DependencyChainCard
              key={index}
              chain={chain}
              colors={colors}
              onEditMilestones={onEditMilestones}
            />
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

      {viewMode === "milestones" && (
        <>
          {/* Milestone Timeline & Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
              <h4 className="text-md font-semibold text-white mb-4">
                Milestone Completion Timeline
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionTimeline}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      dataKey="month"
                      stroke="#9CA3AF"
                      tick={{ fill: "#9CA3AF" }}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="completed"
                      stackId="a"
                      fill={colors.success}
                    />
                    <Bar dataKey="overdue" stackId="a" fill={colors.danger} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Goal Milestone Velocity */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
              <h4 className="text-md font-semibold text-white mb-4">
                Milestone Velocity by Goal
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {goalMilestoneVelocity.map((goal) => (
                  <GoalVelocityCard
                    key={goal.id}
                    goal={goal}
                    colors={colors}
                    onEditMilestones={() =>
                      onEditMilestones?.(goals.find((g) => g.id === goal.id))
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Milestone Health Score */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
            <h4 className="text-md font-semibold text-white mb-4">
              Overall Milestone Health
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <HealthMetric
                label="Planning Accuracy"
                value={78}
                description="Estimation vs actual"
                color={colors.primary}
              />
              <HealthMetric
                label="Completion Consistency"
                value={85}
                description="On-time delivery rate"
                color={colors.success}
              />
              <HealthMetric
                label="Bottleneck Recovery"
                value={72}
                description="Speed of unblocking"
                color={colors.warning}
              />
            </div>
          </div>
        </>
      )}

      {viewMode === "bottlenecks" && (
        <>
          {/* Bottleneck Detection */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4 mb-6">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Bottleneck Analysis
            </h4>
            <div className="space-y-3">
              {bottlenecks.map((bottleneck, index) => (
                <BottleneckCard
                  key={index}
                  bottleneck={bottleneck}
                  colors={colors}
                />
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-lg border border-purple-400/30 p-4">
            <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-400" />
              Bottleneck Resolution Strategies
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <StrategyCard
                title="Break Down Complex Milestones"
                description="Split milestones taking >30 days into 2-week sprints"
                impact="Reduce completion time by 40%"
              />
              <StrategyCard
                title="Parallel Processing"
                description="Identify independent milestones that can run simultaneously"
                impact="Increase velocity by 25%"
              />
              <StrategyCard
                title="Resource Reallocation"
                description="Shift focus from low-impact to high-impact milestones"
                impact="Improve success rate by 30%"
              />
              <StrategyCard
                title="Weekly Reviews"
                description="Implement weekly milestone health checks"
                impact="Catch delays 60% earlier"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper Functions
function calculateMilestoneStats(goals) {
  let totalCompleted = 0;
  let inProgress = 0;
  let overdue = 0;
  let totalMilestones = 0;

  goals.forEach((goal) => {
    if (goal.milestones) {
      goal.milestones.forEach((milestone) => {
        totalMilestones++;
        if (milestone.completed) totalCompleted++;
        else if (milestone.dueDate && new Date(milestone.dueDate) < new Date())
          overdue++;
        else inProgress++;
      });
    }
  });

  return {
    totalCompleted,
    inProgress,
    overdue,
    completionRate:
      totalMilestones > 0
        ? Math.round((totalCompleted / totalMilestones) * 100)
        : 0,
    avgVelocity: 12, // Mock average days to complete
  };
}

// Helper Components
const MetricCard = ({ icon: Icon, value, label, subtitle, color }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
    <div className="flex items-center justify-between mb-2">
      <Icon className="h-5 w-5" style={{ color }} />
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-sm font-medium text-gray-300">{label}</p>
    <p className="text-xs text-gray-400">{subtitle}</p>
  </div>
);

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

const DependencyChainCard = ({ chain, colors, onEditMilestones }) => {
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
          <button
            onClick={() => onEditMilestones?.()}
            className="p-1 text-gray-400 hover:text-purple-400 rounded transition-colors"
            title="Edit Milestones"
          >
            <Edit3 className="h-4 w-4" />
          </button>
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
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Milestone Progress */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span>
          Milestones: {chain.completedMilestones}/{chain.milestones}
        </span>
        <span>
          {Math.round((chain.completedMilestones / chain.milestones) * 100)}%
          complete
        </span>
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
    </div>
  );
};

const GoalVelocityCard = ({ goal, colors, onEditMilestones }) => {
  const statusColor = goal.onTrack ? colors.success : colors.danger;

  return (
    <div className="p-3 bg-white/5 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white truncate">
          {goal.name}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-medium px-2 py-1 rounded"
            style={{
              backgroundColor: `${statusColor}20`,
              color: statusColor,
            }}
          >
            {goal.onTrack ? "On Track" : "At Risk"}
          </span>
          <button
            onClick={onEditMilestones}
            className="p-1 text-gray-400 hover:text-purple-400 rounded transition-colors"
            title="Edit Milestones"
          >
            <Edit3 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div>
          <span className="text-gray-400">Velocity</span>
          <p className="text-white font-medium">
            {goal.velocity.toFixed(1)}/week
          </p>
        </div>
        <div>
          <span className="text-gray-400">Completed</span>
          <p className="text-white font-medium">{goal.completed}</p>
        </div>
        <div>
          <span className="text-gray-400">Total</span>
          <p className="text-white font-medium">{goal.total}</p>
        </div>
        <div>
          <span className="text-gray-400">Deps</span>
          <p className="text-white font-medium">{goal.dependencies}</p>
        </div>
      </div>
      {/* Milestone progress bar */}
      <div className="mt-2">
        <div className="w-full bg-gray-700/50 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            style={{
              width: `${
                goal.total > 0 ? (goal.completed / goal.total) * 100 : 0
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const BottleneckCard = ({ bottleneck, colors }) => {
  const impactColor =
    bottleneck.impact === "high"
      ? colors.danger
      : bottleneck.impact === "medium"
      ? colors.warning
      : colors.info;

  return (
    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="font-medium text-white">{bottleneck.milestone}</h5>
          <span className="text-xs text-gray-400">
            {bottleneck.goalName} • Stuck for {bottleneck.daysStuck} days
          </span>
        </div>
        <span
          className="text-xs font-medium px-2 py-1 rounded"
          style={{
            backgroundColor: `${impactColor}20`,
            color: impactColor,
          }}
        >
          {bottleneck.impact} impact
        </span>
      </div>
      <div className="space-y-1 mb-2">
        <p className="text-xs text-gray-400">Blockers:</p>
        {bottleneck.blockers.map((blocker, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-xs text-gray-300"
          >
            <Flag className="h-3 w-3 text-red-400" />
            {blocker}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">
          Affects {bottleneck.dependentGoals} dependent goal
          {bottleneck.dependentGoals !== 1 ? "s" : ""}
        </span>
        <button className="text-purple-400 hover:text-purple-300">
          Resolve →
        </button>
      </div>
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

const StrategyCard = ({ title, description, impact }) => (
  <div className="p-3 bg-white/5 rounded-lg">
    <h5 className="font-medium text-white text-sm mb-1">{title}</h5>
    <p className="text-xs text-gray-300 mb-2">{description}</p>
    <p className="text-xs text-purple-400 font-medium">{impact}</p>
  </div>
);

const HealthMetric = ({ label, value, description, color }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-white">{label}</span>
      <span className="text-sm font-bold text-white">{value}%</span>
    </div>
    <div className="w-full bg-gray-700/50 rounded-full h-2 mb-2">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{
          width: `${value}%`,
          backgroundColor: color,
        }}
      />
    </div>
    <p className="text-xs text-gray-400">{description}</p>
  </div>
);

export default DependenciesTab;
