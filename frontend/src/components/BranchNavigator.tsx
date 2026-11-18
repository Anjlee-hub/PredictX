import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  GitBranch,
  Network,
  LayoutDashboard,
  Cpu,
  Sparkles,
  SearchCheck,
  HeartPulse,
  BarChart3,
  Wrench,
  AlertTriangle,
  Sliders,
  FileBarChart,
  Settings,
  Search,
  X,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Check,
  Zap,
  Activity,
  Radio,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAlerts } from '../context/AlertContext';
import { useMachines } from '../context/MachineContext';
import { NotificationsPopover } from './NotificationsPopover';
import { UserMenu } from './UserMenu';

interface BranchNavigatorProps {
  onOpenSearch: () => void;
  isTreeOverlayOpen?: boolean;
  setIsTreeOverlayOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface BranchNode {
  id: string;
  title: string;
  path: string;
  icon: any;
  metric: string;
  badge?: string;
  isCritical?: boolean;
}

interface BranchCluster {
  id: string;
  name: string;
  code: string;
  color: string;
  description: string;
  nodes: BranchNode[];
}

export const BranchNavigator: React.FC<BranchNavigatorProps> = ({
  onOpenSearch,
  isTreeOverlayOpen: externalTreeOpen,
  setIsTreeOverlayOpen: setExternalTreeOpen,
}) => {
  const { theme } = useTheme();
  const { criticalCount } = useAlerts();
  const { machines } = useMachines();
  const location = useLocation();
  const navigate = useNavigate();

  const [internalTreeOpen, setInternalTreeOpen] = useState(false);
  const isTreeOverlayOpen = externalTreeOpen !== undefined ? externalTreeOpen : internalTreeOpen;
  const setIsTreeOverlayOpen = setExternalTreeOpen !== undefined ? setExternalTreeOpen : setInternalTreeOpen;

  const [activeHoverCluster, setActiveHoverCluster] = useState<string | null>(null);
  const [isBreadcrumbMenuOpen, setIsBreadcrumbMenuOpen] = useState(false);
  const [treeSearchQuery, setTreeSearchQuery] = useState('');
  const breadcrumbRef = useRef<HTMLDivElement>(null);

  // Close breadcrumb dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (breadcrumbRef.current && !breadcrumbRef.current.contains(e.target as Node)) {
        setIsBreadcrumbMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard shortcut: ⌘B or Ctrl+B toggles the visual Branch Topology
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsTreeOverlayOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isTreeOverlayOpen) {
        setIsTreeOverlayOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTreeOverlayOpen, setIsTreeOverlayOpen]);

  // Define the 4 Main Industrial Branch Clusters
  const branchClusters: BranchCluster[] = [
    {
      id: 'fleet',
      name: 'Fleet Telemetry Branch',
      code: 'BRANCH-01',
      color: '#2563EB',
      description: 'Continuous 100Hz vibration, torque, and thermal telemetry',
      nodes: [
        {
          id: 'dashboard',
          title: 'Mission Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          metric: '10 Core KPIs',
        },
        {
          id: 'machines',
          title: 'Fleet Directory',
          path: '/machines',
          icon: Cpu,
          metric: `${machines.length} Machines`,
          badge: `${machines.length}`,
        },
      ],
    },
    {
      id: 'ai',
      name: 'AI Prognostics Branch',
      code: 'BRANCH-02',
      color: '#EA580C',
      description: 'Multi-sensor XGBoost failure classification & TreeSHAP attributions',
      nodes: [
        {
          id: 'predictions',
          title: 'Prediction Studio',
          path: '/predictions',
          icon: Sparkles,
          metric: 'XGBoost v3.4',
        },
        {
          id: 'explainability',
          title: 'TreeSHAP Explainer',
          path: '/explainability',
          icon: SearchCheck,
          metric: 'Game Theory',
        },
        {
          id: 'survival',
          title: 'Survival PHM',
          path: '/survival-analysis',
          icon: HeartPulse,
          metric: 'Kaplan-Meier S(t)',
        },
      ],
    },
    {
      id: 'operations',
      name: 'Plant Operations Branch',
      code: 'BRANCH-03',
      color: '#10B981',
      description: 'TPM efficiency, prescriptive work orders, and ISA-18.2 alarm dispatch',
      nodes: [
        {
          id: 'analytics',
          title: 'Factory OEE',
          path: '/factory-analytics',
          icon: BarChart3,
          metric: '86.4% OEE',
        },
        {
          id: 'maintenance',
          title: 'CMMS Maintenance',
          path: '/maintenance',
          icon: Wrench,
          metric: '12 Orders',
        },
        {
          id: 'alerts',
          title: 'Alert Command',
          path: '/alerts',
          icon: AlertTriangle,
          metric: `${criticalCount} Alarms`,
          badge: criticalCount > 0 ? `${criticalCount}` : undefined,
          isCritical: criticalCount > 0,
        },
      ],
    },
    {
      id: 'engineering',
      name: 'Engineering Governance Branch',
      code: 'BRANCH-04',
      color: '#8B5CF6',
      description: 'Monte Carlo digital twin simulations and ISO 13374 regulatory audits',
      nodes: [
        {
          id: 'simulation',
          title: 'Digital Twin Sim',
          path: '/simulation',
          icon: Sliders,
          metric: 'Monte Carlo',
        },
        {
          id: 'reports',
          title: 'Audit Reports',
          path: '/reports',
          icon: FileBarChart,
          metric: 'ISO-13374 Ready',
        },
        {
          id: 'settings',
          title: 'System Settings',
          path: '/settings',
          icon: Settings,
          metric: 'FastAPI Bridge',
        },
      ],
    },
  ];

  // Find active cluster and active node
  const activeCluster = branchClusters.find((c) =>
    c.nodes.some((n) => n.path === location.pathname)
  ) || branchClusters[0];

  const activeNode = activeCluster.nodes.find((n) => n.path === location.pathname) || activeCluster.nodes[0];

  // Filtered clusters for the HUD search
  const filteredClusters = branchClusters.map((cluster) => {
    if (!treeSearchQuery.trim()) return cluster;
    const q = treeSearchQuery.toLowerCase();
    const matchingNodes = cluster.nodes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.metric.toLowerCase().includes(q)
    );
    const clusterMatches = cluster.name.toLowerCase().includes(q) || cluster.description.toLowerCase().includes(q);
    return {
      ...cluster,
      nodes: clusterMatches ? cluster.nodes : matchingNodes,
    };
  }).filter((c) => c.nodes.length > 0);

  return (
    <>
      {/* ──────────────────────────────────────────────────────────────────────────
          1. TOP-LEFT FLOATING BRANCH BREADCRUMB CAPSULE (NO FULL TOP BAR)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="fixed top-4 left-4 sm:left-6 z-40 flex items-center gap-2">
        {/* Brand Monogram Origin Button */}
        <div
          onClick={() => navigate('/dashboard')}
          className="relative group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#EA580C] to-[#C2410C] text-white font-mono font-extrabold text-sm shadow-md shadow-[#EA580C]/25 cursor-pointer hover:scale-105 active:scale-95 transition-all ring-1 ring-white/20"
          title="PredictX Platform Origin (Jump to Dashboard)"
        >
          <span className="tracking-tighter">PX</span>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300 ring-1 ring-white"></span>
          </span>
        </div>

        {/* Branch Breadcrumb Capsule: Trunk ➔ Branch ➔ Active Node */}
        <div ref={breadcrumbRef} className="relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl glass-capsule text-xs shadow-md glow-subtle">
          {/* Trunk Origin Trigger */}
          <button
            onClick={() => setIsTreeOverlayOpen(true)}
            className="flex items-center gap-1.5 font-bold text-[#111827] dark:text-white hover:text-[#EA580C] transition-colors cursor-pointer group"
            title="Inspect Full Branch Topology Schematic (⌘B)"
          >
            <GitBranch className="h-3.5 w-3.5 text-[#EA580C] group-hover:rotate-12 transition-transform" />
            <span className="font-mono text-[11px] uppercase tracking-wider font-extrabold">TRUNK</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700 font-mono text-xs">/</span>

          {/* Interactive Cluster Selector Pill with Dropdown */}
          <button
            onClick={() => setIsBreadcrumbMenuOpen(!isBreadcrumbMenuOpen)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-slate-700 dark:text-slate-300 hover:text-[#EA580C] dark:hover:text-[#EA580C] hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
            title="Switch Branch Cluster"
          >
            <span className="truncate max-w-[110px] sm:max-w-[150px]">
              {activeCluster.name.replace(' Branch', '')}
            </span>
            <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isBreadcrumbMenuOpen ? 'rotate-180 text-[#EA580C]' : ''}`} />
          </button>

          <span className="text-slate-300 dark:text-slate-700 font-mono text-xs hidden sm:inline">/</span>

          {/* Active Node with Pulsing Burnt Orange Indicator */}
          <div className="flex items-center gap-1.5 pl-0.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EA580C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EA580C]"></span>
            </span>
            <span className="font-extrabold text-[#111827] dark:text-white truncate max-w-[130px] sm:max-w-none">
              {activeNode.title}
            </span>
          </div>

          {/* Branch Topology HUD Trigger Button with Chiclet Keycap */}
          <button
            onClick={() => setIsTreeOverlayOpen(!isTreeOverlayOpen)}
            className="ml-1 flex items-center gap-1 p-1 rounded-md text-slate-400 hover:text-[#EA580C] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Open Interactive Branch Circuit Schematic (⌘B)"
          >
            <Network className="h-3.5 w-3.5 text-[#EA580C]" />
            <span className="chiclet-key hidden md:inline">⌘B</span>
          </button>

          {/* Fast Switcher Popover for Sibling Clusters & Nodes */}
          {isBreadcrumbMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl glass-capsule shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 border border-[#E5E5DE] dark:border-slate-800">
              <div className="px-2 py-1.5 border-b border-[#E5E5DE] dark:border-slate-800 mb-1 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Branch
                </span>
                <span className="text-[10px] font-mono font-bold text-[#EA580C]">
                  4 Clusters
                </span>
              </div>
              <div className="space-y-1">
                {branchClusters.map((cluster) => {
                  const isCur = cluster.id === activeCluster.id;
                  return (
                    <div key={cluster.id} className="space-y-0.5">
                      <button
                        onClick={() => {
                          navigate(cluster.nodes[0].path);
                          setIsBreadcrumbMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                          isCur
                            ? 'bg-[#F8F7F4] dark:bg-slate-800/80 text-[#EA580C]'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: cluster.color }}
                          />
                          <span className="font-mono text-[11px] font-bold text-slate-400">
                            {cluster.code.split('-')[1]}
                          </span>
                          <span>{cluster.name.replace(' Branch', '')}</span>
                        </div>
                        {isCur && <Check className="h-3 w-3 text-[#EA580C]" />}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 pt-1.5 border-t border-[#E5E5DE] dark:border-slate-800 px-1">
                <button
                  onClick={() => {
                    setIsBreadcrumbMenuOpen(false);
                    setIsTreeOverlayOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] font-mono font-bold text-[#EA580C] hover:underline cursor-pointer"
                >
                  <Network className="h-3 w-3" />
                  <span>Open Full Schematic HUD (⌘B)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. TOP-RIGHT FLOATING UTILITY CAPSULE (SEARCH, ALERTS, THEME, PROFILE)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="fixed top-4 right-4 sm:right-6 z-40 flex items-center gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass-capsule shadow-md glow-subtle">
          {/* Quick Omnisearch Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-[#111827] dark:hover:text-white hover:bg-[#F8F7F4] dark:hover:bg-slate-800 transition-all cursor-pointer group"
            title="Search telemetry, machines, pages (⌘K)"
          >
            <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#EA580C] transition-colors" />
            <span className="chiclet-key">⌘K</span>
          </button>

          <span className="h-4 w-px bg-[#E5E5DE] dark:bg-slate-800" />

          {/* Alerts Notification Popover */}
          <NotificationsPopover />

          <span className="h-4 w-px bg-[#E5E5DE] dark:bg-slate-800" />

          {/* Operator Profile Menu (Includes Dedicated Display Mode Shifting & Account Settings) */}
          <UserMenu />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. SLEEK FLOATING VERTICAL BRANCH SPINE (RAIL ALONG LEFT EDGE)
      ────────────────────────────────────────────────────────────────────────── */}
      <aside className="fixed left-4 sm:left-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center">
        {/* Precision Glass Rail Capsule */}
        <div className="relative flex flex-col items-center p-1.5 rounded-full glass-capsule shadow-xl glow-subtle">
          {/* Trunk Origin Node */}
          <button
            onClick={() => setIsTreeOverlayOpen(true)}
            className="p-2 rounded-full text-slate-500 hover:text-[#EA580C] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer relative group"
            title="Open Branch Circuit Schematic (⌘B)"
          >
            <GitBranch className="h-4 w-4 text-[#EA580C]" />
            <span className="absolute left-full ml-3 px-2 py-1 rounded bg-[#111827] text-white text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-50">
              Branch HUD (⌘B)
            </span>
          </button>

          {/* Vertical Connecting Circuit Line with Animated Pulse */}
          <div className="relative w-0.5 h-6 bg-gradient-to-b from-[#EA580C]/50 via-slate-300 dark:via-slate-700 to-[#EA580C]/50 overflow-hidden">
            <span className="absolute top-0 left-0 w-full h-2 bg-[#EA580C] animate-pulse" />
          </div>

          {/* 4 Branch Cluster Nodes */}
          <div className="flex flex-col gap-2 relative">
            {branchClusters.map((cluster) => {
              const isCurrentActive = activeCluster.id === cluster.id;
              const isHovered = activeHoverCluster === cluster.id;

              return (
                <div
                  key={cluster.id}
                  className="relative group"
                  onMouseEnter={() => setActiveHoverCluster(cluster.id)}
                  onMouseLeave={() => setActiveHoverCluster(null)}
                >
                  <button
                    onClick={() => {
                      navigate(cluster.nodes[0].path);
                    }}
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all cursor-pointer border ${
                      isCurrentActive
                        ? 'bg-[#111827] text-white dark:bg-[#1C1C21] dark:text-[#EA580C] border-[#111827] dark:border-[#EA580C] shadow-md scale-105 glow-orange'
                        : 'bg-white dark:bg-[#121215] text-slate-600 dark:text-slate-400 border-[#E5E5DE] dark:border-[#272730] hover:border-[#EA580C] hover:text-[#EA580C]'
                    }`}
                    title={cluster.name}
                  >
                    {cluster.code.split('-')[1]}

                    {/* Active Pop Dot on the cluster */}
                    {isCurrentActive && (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#EA580C] ring-2 ring-white dark:ring-[#121215]" />
                    )}
                  </button>

                  {/* Flyout Sub-Branch Menu on Hover */}
                  {isHovered && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-64 rounded-2xl glass-capsule shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-left-2 duration-150 border border-[#E5E5DE] dark:border-slate-800">
                      <div className="px-2 py-1.5 border-b border-[#E5E5DE] dark:border-slate-800 mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: cluster.color }}
                          />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {cluster.code}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-[#EA580C]">
                          {cluster.nodes.length} nodes
                        </span>
                      </div>

                      <div className="space-y-1">
                        {cluster.nodes.map((node) => {
                          const Icon = node.icon;
                          const isNodeActive = location.pathname === node.path;
                          return (
                            <NavLink
                              key={node.id}
                              to={node.path}
                              onClick={() => setActiveHoverCluster(null)}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                isNodeActive
                                  ? 'bg-[#F8F7F4] dark:bg-slate-800 text-[#EA580C] font-bold shadow-2xs'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Icon className={`h-3.5 w-3.5 ${isNodeActive ? 'text-[#EA580C]' : 'text-slate-400'}`} />
                                <span className="truncate">{node.title}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {node.badge && (
                                  <span
                                    className={`px-1 rounded text-[9px] font-mono ${
                                      node.isCritical
                                        ? 'bg-rose-500 text-white'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                    }`}
                                  >
                                    {node.badge}
                                  </span>
                                )}
                                {isNodeActive && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#EA580C] shrink-0" />
                                )}
                              </div>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="relative w-0.5 h-6 bg-gradient-to-b from-[#EA580C]/50 via-slate-300 dark:via-slate-700 to-[#EA580C]/50" />

          {/* Live Telemetry Equalizer Dot */}
          <div className="p-1.5 cursor-pointer" title="Edge Telemetry: 100Hz QoS-1 Nominal">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. FULL-SCREEN INTERACTIVE BRANCH TOPOLOGY MAP (SVG SCHEMATIC HUD)
      ────────────────────────────────────────────────────────────────────────── */}
      {isTreeOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
            onClick={() => setIsTreeOverlayOpen(false)}
          />

          {/* Interactive Topology Container */}
          <div className="relative w-full max-w-5xl bg-[#F8F7F4] dark:bg-[#111113] border border-[#E5E5DE] dark:border-[#272730] rounded-3xl shadow-2xl z-10 overflow-hidden my-4 schematic-box">
            {/* Header with Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-[#E5E5DE] dark:border-[#272730] bg-white dark:bg-[#141417] gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#EA580C] to-[#C2410C] text-white font-mono font-bold text-base shadow-sm ring-1 ring-white/20">
                  PX
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-[#111827] dark:text-white tracking-tight">
                      PredictX Industrial Branch Topology
                    </h2>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/30">
                      CIRCUIT HUD
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Dynamic non-linear branch hierarchy connecting edge workcells to ML prognostics and operations.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* HUD Filter Input */}
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={treeSearchQuery}
                    onChange={(e) => setTreeSearchQuery(e.target.value)}
                    placeholder="Filter branches & nodes..."
                    className="w-48 sm:w-56 pl-8 pr-3 py-1.5 rounded-lg text-xs bg-[#F8F7F4] dark:bg-[#18181C] border border-[#E5E5DE] dark:border-[#2A2A33] text-[#111827] dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                  />
                  {treeSearchQuery && (
                    <button
                      onClick={() => setTreeSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsTreeOverlayOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E1E24] transition-colors cursor-pointer"
                  title="Close Branch Map (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Live Trunk Status Strip */}
            <div className="px-6 py-2 bg-[#F0EFEB] dark:bg-[#0B0B0E] border-b border-[#E5E5DE] dark:border-[#272730] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-bold text-[#111827] dark:text-white">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Trunk Root: Detroit Plant Alpha</span>
                </span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {machines.length} Telemetry Workcells Online
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-emerald-500" />
                  <span>100 Hz Stream</span>
                </span>
                <span className="dark:text-slate-700">•</span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-[#EA580C]" />
                  <span>14ms Edge MQTT</span>
                </span>
                <span className="dark:text-slate-700">•</span>
                <span className="flex items-center gap-1">
                  <Radio className="h-3 w-3 text-[#EA580C]" />
                  <span>XGBoost v3.4 Active</span>
                </span>
              </div>
            </div>

            {/* ─── VISUAL INTERACTIVE SVG SCHEMATIC CANVAS ─── */}
            <div className="px-4 sm:px-6 pt-4 pb-2 bg-gradient-to-b from-white to-[#F8F7F4] dark:from-[#141417] dark:to-[#08080A] border-b border-[#E5E5DE] dark:border-[#272730] overflow-hidden">
              <div className="w-full py-1">
                <svg
                  viewBox="0 0 880 140"
                  className="w-full h-auto drop-shadow-xs"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Circuit Grid Subtle Markers */}
                  <defs>
                    <linearGradient id="activeTraceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EA580C" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#EA580C" stopOpacity="1" />
                      <stop offset="100%" stopColor="#EA580C" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>

                  {/* Bezier Circuit Lines Connecting Trunk (x=440, y=28) to the 4 Branches */}
                  {/* Branch 01 (x=110, y=105) */}
                  <path
                    d="M 440 32 C 440 68, 110 68, 110 102"
                    fill="none"
                    stroke={activeCluster.id === 'fleet' ? '#EA580C' : theme === 'dark' ? '#2A2A33' : '#CBD5E1'}
                    strokeWidth={activeCluster.id === 'fleet' ? '2.5' : '1.5'}
                    className={activeCluster.id === 'fleet' ? 'animate-circuit' : ''}
                  />

                  {/* Branch 02 (x=330, y=105) */}
                  <path
                    d="M 440 32 C 440 68, 330 68, 330 102"
                    fill="none"
                    stroke={activeCluster.id === 'ai' ? '#EA580C' : theme === 'dark' ? '#2A2A33' : '#CBD5E1'}
                    strokeWidth={activeCluster.id === 'ai' ? '2.5' : '1.5'}
                    className={activeCluster.id === 'ai' ? 'animate-circuit' : ''}
                  />

                  {/* Branch 03 (x=550, y=105) */}
                  <path
                    d="M 440 32 C 440 68, 550 68, 550 102"
                    fill="none"
                    stroke={activeCluster.id === 'operations' ? '#EA580C' : theme === 'dark' ? '#2A2A33' : '#CBD5E1'}
                    strokeWidth={activeCluster.id === 'operations' ? '2.5' : '1.5'}
                    className={activeCluster.id === 'operations' ? 'animate-circuit' : ''}
                  />

                  {/* Branch 04 (x=770, y=105) */}
                  <path
                    d="M 440 32 C 440 68, 770 68, 770 102"
                    fill="none"
                    stroke={activeCluster.id === 'engineering' ? '#EA580C' : theme === 'dark' ? '#2A2A33' : '#CBD5E1'}
                    strokeWidth={activeCluster.id === 'engineering' ? '2.5' : '1.5'}
                    className={activeCluster.id === 'engineering' ? 'animate-circuit' : ''}
                  />

                  {/* Root Trunk Node Pill in Center Top */}
                  <g transform="translate(340, 10)">
                    <rect
                      x="0"
                      y="0"
                      width="200"
                      height="34"
                      rx="8"
                      className="fill-white dark:fill-[#16161A] stroke-slate-300 dark:stroke-[#2A2A33]"
                      strokeWidth="1.5"
                    />
                    <circle cx="18" cy="17" r="5" fill="#EA580C" />
                    <circle cx="18" cy="17" r="8" fill="#EA580C" fillOpacity="0.25" className="animate-ping" />
                    <text
                      x="32"
                      y="21"
                      className="font-mono text-[11px] font-extrabold fill-slate-800 dark:fill-slate-100"
                    >
                      DETROIT ROOT TRUNK
                    </text>
                  </g>

                  {/* 4 Cluster Hub Nodes at Bottom */}
                  {branchClusters.map((cluster, idx) => {
                    const xs = [110, 330, 550, 770];
                    const cx = xs[idx];
                    const cy = 112;
                    const isCur = cluster.id === activeCluster.id;

                    return (
                      <g
                        key={cluster.id}
                        transform={`translate(${cx - 85}, ${cy - 16})`}
                        onClick={() => navigate(cluster.nodes[0].path)}
                        className="cursor-pointer group"
                      >
                        <rect
                          x="0"
                          y="0"
                          width="170"
                          height="32"
                          rx="8"
                          className={
                            isCur
                              ? 'fill-[#111827] dark:fill-[#1C1C21] stroke-[#EA580C]'
                              : 'fill-white dark:fill-[#141417] stroke-slate-200 dark:stroke-[#272730] hover:stroke-[#EA580C]'
                          }
                          strokeWidth={isCur ? '2' : '1'}
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r="4"
                          fill={isCur ? '#EA580C' : cluster.color}
                        />
                        <text
                          x="28"
                          y="19"
                          className={`font-mono text-[10px] font-bold ${
                            isCur
                              ? 'fill-white dark:fill-[#EA580C] font-extrabold'
                              : 'fill-slate-700 dark:fill-slate-300'
                          }`}
                        >
                          {cluster.code} · {cluster.name.split(' ')[0]}
                        </text>
                        {isCur && (
                          <circle cx="155" cy="16" r="3" fill="#EA580C" />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Tree Branch Visual Map Cards */}
            <div className="p-6 max-h-[55vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClusters.map((cluster) => {
                  const isCurrentActive = activeCluster.id === cluster.id;
                  return (
                    <div
                      key={cluster.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrentActive
                          ? 'border-[#EA580C] bg-white dark:bg-slate-900 shadow-md ring-1 ring-[#EA580C]/25 glow-subtle'
                          : 'border-[#E5E5DE] dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 hover:border-slate-400'
                      }`}
                    >
                      {/* Cluster Header */}
                      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#E5E5DE] dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: isCurrentActive ? '#EA580C' : cluster.color }}
                          />
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#111827] dark:text-white font-mono">
                            {cluster.name}
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold">
                          {cluster.code}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-snug">
                        {cluster.description}
                      </p>

                      {/* Branch Child Nodes */}
                      <div className="space-y-2">
                        {cluster.nodes.map((node) => {
                          const Icon = node.icon;
                          const isNodeActive = location.pathname === node.path;
                          return (
                            <div
                              key={node.id}
                              onClick={() => {
                                navigate(node.path);
                                setIsTreeOverlayOpen(false);
                              }}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                                isNodeActive
                                  ? 'border-[#EA580C] bg-[#F8F7F4] dark:bg-slate-800 text-[#111827] dark:text-white font-semibold shadow-xs'
                                  : 'border-[#E5E5DE]/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-[#EA580C]/60 hover:bg-[#F8F7F4]/60'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`p-1.5 rounded-lg transition-transform group-hover:scale-105 ${
                                    isNodeActive
                                      ? 'bg-[#EA580C] text-white shadow-xs'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-[#EA580C]'
                                  }`}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                                    <span>{node.title}</span>
                                    {isNodeActive && (
                                      <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-[#EA580C] text-white">
                                        ACTIVE
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    {node.metric}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {node.badge && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                      node.isCritical
                                        ? 'bg-rose-500 text-white animate-pulse'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                    }`}
                                  >
                                    {node.badge}
                                  </span>
                                )}
                                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#EA580C] group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer with Quick Jump Action */}
            <div className="px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-[#E5E5DE] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>ISO 13374 Condition Telemetry & SCADA Node Governance</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigate('/predictions');
                    setIsTreeOverlayOpen(false);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Branch to AI Prognostics</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

