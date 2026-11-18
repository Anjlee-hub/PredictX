import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAlerts } from '../context/AlertContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { criticalCount } = useAlerts();

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Machines', path: '/machines', icon: Cpu },
    { title: 'Predictions', path: '/predictions', icon: Sparkles },
    { title: 'Explainability', path: '/explainability', icon: SearchCheck },
    { title: 'Survival Analysis', path: '/survival-analysis', icon: HeartPulse },
    { title: 'Factory Analytics', path: '/factory-analytics', icon: BarChart3 },
    { title: 'Maintenance', path: '/maintenance', icon: Wrench },
    { title: 'Alerts', path: '/alerts', icon: AlertTriangle, badge: criticalCount > 0 ? criticalCount : undefined },
    { title: 'Simulation', path: '/simulation', icon: Sliders },
    { title: 'Reports', path: '/reports', icon: FileBarChart },
    { title: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#FBFBFA] dark:bg-[#121215] text-slate-700 dark:text-slate-300 border-r border-[#E5E5DE] dark:border-[#272730] transition-all duration-300 shadow-xs ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#E5E5DE] dark:border-slate-800/80">
          <Link
            to="/dashboard"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EA580C] text-white font-mono font-bold text-sm shadow-xs">
              PX
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-[#111827] dark:text-white flex items-center gap-1.5">
                  PREDICT<span className="text-[#EA580C]">X</span>
                  <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300/80 dark:border-slate-700">
                    PRO
                  </span>
                </span>
                <span className="text-[10px] tracking-tight text-slate-500 dark:text-slate-400 font-mono">
                  Factory Intelligence
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle for Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Platform Modules
            </div>
          )}

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#111827] text-white font-semibold dark:bg-slate-800 shadow-xs'
                      : 'text-slate-600 hover:text-[#111827] hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105`} />
                {!isCollapsed && (
                  <span className="flex-1 truncate tracking-tight">{item.title}</span>
                )}
                {!isCollapsed && item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold font-mono rounded-full bg-[#EA580C] text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
                {isCollapsed && item.badge !== undefined && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#EA580C]" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Industrial Status Card in Footer */}
        {!isCollapsed && (
          <div className="p-3 m-3 rounded-lg bg-white dark:bg-slate-900/80 border border-[#E5E5DE] dark:border-slate-800 text-xs shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Edge Gateway</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[11px] text-[#111827] dark:text-white font-mono font-medium">MQTT Online (14ms)</div>
            <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">Model: XGB-RUL v3.4</div>
          </div>
        )}
      </aside>
    </>
  );
};
