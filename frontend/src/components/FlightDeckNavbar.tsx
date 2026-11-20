import React, { useState } from 'react';
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
  Search,
  Sun,
  Moon,
  MessageSquare,
  Grid3X3,
  ChevronDown,
  Building,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAlerts } from '../context/AlertContext';
import { useMachines } from '../context/MachineContext';
import { NotificationsPopover } from './NotificationsPopover';
import { UserMenu } from './UserMenu';

interface FlightDeckNavbarProps {
  onOpenSearch: () => void;
  onOpenMatrix: () => void;
}

interface NavItem {
  title: string;
  path: string;
  icon: any;
  badge?: string;
  isCriticalBadge?: boolean;
}

interface NavCluster {
  group: string;
  items: NavItem[];
}

export const FlightDeckNavbar: React.FC<FlightDeckNavbarProps> = ({
  onOpenSearch,
  onOpenMatrix,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { criticalCount } = useAlerts();
  const { machines } = useMachines();

  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState('Factory Alpha (Detroit Hub)');
  const [isPlantDropdownOpen, setIsPlantDropdownOpen] = useState(false);

  const plantOptions = [
    { name: 'Factory Alpha (Detroit Hub)', code: 'DET-01', status: '98.4% Nominal' },
    { name: 'Factory Beta (Munich Gigaplant)', code: 'MUC-02', status: '99.1% Nominal' },
    { name: 'Factory Gamma (Yokohama Plant)', code: 'YOK-03', status: '97.6% Nominal' },
    { name: 'Factory Delta (Austin Facility)', code: 'ATX-04', status: '99.5% Nominal' },
  ];

  // 4 Categorized Flight Navigation Clusters
  const navClusters: NavCluster[] = [
    {
      group: 'Fleet Monitor',
      items: [
        { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { title: 'Fleet Directory', path: '/machines', icon: Cpu, badge: `${machines.length}` },
      ],
    },
    {
      group: 'AI Prognostics',
      items: [
        { title: 'Predictive Studio', path: '/predictions', icon: Sparkles },
        { title: 'SHAP Explainability', path: '/explainability', icon: SearchCheck },
        { title: 'Survival (PHM)', path: '/survival-analysis', icon: HeartPulse },
      ],
    },
    {
      group: 'Operations',
      items: [
        { title: 'Factory OEE', path: '/factory-analytics', icon: BarChart3 },
        { title: 'Maintenance CMMS', path: '/maintenance', icon: Wrench },
        {
          title: 'Alert Center',
          path: '/alerts',
          icon: AlertTriangle,
          badge: criticalCount > 0 ? `${criticalCount}` : undefined,
          isCriticalBadge: criticalCount > 0,
        },
      ],
    },
    {
      group: 'Engineering',
      items: [
        { title: 'Digital Twin Sim', path: '/simulation', icon: Sliders },
        { title: 'Reports & Audit', path: '/reports', icon: FileBarChart },
        { title: 'System Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E5E5DE] dark:border-slate-800 bg-[#F8F7F4]/95 dark:bg-[#08080A]/95 backdrop-blur-md transition-colors shadow-2xs">
      {/* Upper Deck: Brand Identity, SCADA Ticker, Facility Selector, Quick Actions */}
      <div className="border-b border-[#E5E5DE]/80 dark:border-slate-800/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
          {/* Left: Brand Monogram & Plant Selector */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EA580C] text-white font-mono font-extrabold text-sm shadow-xs group-hover:scale-105 transition-transform">
                PX
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-[#111827] dark:text-white flex items-center gap-1.5 leading-none">
                  PREDICT<span className="text-[#EA580C]">X</span>
                  <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300/80 dark:border-slate-700">
                    PRO
                  </span>
                </span>
                <span className="text-[10px] tracking-tight text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Factory Intelligence Platform
                </span>
              </div>
            </Link>

            <span className="h-5 w-px bg-[#E5E5DE] dark:bg-slate-800 hidden md:block" />

            {/* Plant Facility Selector Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsPlantDropdownOpen(!isPlantDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E5DE] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-2xs cursor-pointer"
              >
                <Building className="h-3.5 w-3.5 text-[#EA580C]" />
                <span className="font-medium truncate max-w-[170px]">{selectedPlant}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {isPlantDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-72 rounded-xl bg-white dark:bg-slate-900 border border-[#E5E5DE] dark:border-slate-800 shadow-xl z-50 p-2">
                  <div className="px-2 py-1 text-[10px] uppercase font-mono font-bold text-slate-400">
                    Switch Connected Facility
                  </div>
                  {plantOptions.map((plant) => (
                    <button
                      key={plant.code}
                      onClick={() => {
                        setSelectedPlant(plant.name);
                        setIsPlantDropdownOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#F8F7F4] dark:hover:bg-slate-800 transition-colors flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-[#111827] dark:text-white">{plant.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{plant.code}</div>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {plant.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Live SCADA Telemetry Stream Ticker */}
          <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-[#E5E5DE] dark:border-slate-800 text-xs font-mono shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">SCADA Online</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-500 dark:text-slate-400">Sampling: 100 Hz</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-500 dark:text-slate-400">Edge: 14ms MQTT</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-[#EA580C] font-semibold">Model: RUL-XGBoost v3.4</span>
          </div>

          {/* Right: Quick Search, Mission Matrix HUD, Notifications, Theme, User */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Omnisearch Trigger */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E5DE] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 hover:border-slate-400 transition-all shadow-2xs group cursor-pointer"
              title="Search telemetry, work orders, pages (⌘K)"
            >
              <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#EA580C] transition-colors" />
              <span className="hidden xl:inline text-slate-500">Quick Search...</span>
              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 border border-[#E5E5DE] dark:border-slate-700">
                ⌘K
              </span>
            </button>

            {/* Mission Matrix HUD Button */}
            <button
              onClick={onOpenMatrix}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5DE] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-[#EA580C] transition-all shadow-2xs cursor-pointer group"
              title="Open Flight Deck Mission Matrix (⌘M)"
            >
              <Grid3X3 className="h-3.5 w-3.5 text-[#EA580C] group-hover:rotate-45 transition-transform" />
              <span className="hidden sm:inline">Matrix</span>
              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded text-slate-400 border border-[#E5E5DE] dark:border-slate-700 hidden lg:inline">
                ⌘M
              </span>
            </button>

            {/* Notifications Popover */}
            <NotificationsPopover />

            {/* Messages / Shift Logs */}
            <div className="relative">
              <button
                onClick={() => setIsMessagesOpen(!isMessagesOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-[#111827] dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Industrial Shift Team Messages"
              >
                <MessageSquare className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EA580C]" />
              </button>

              {isMessagesOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-900 border border-[#E5E5DE] dark:border-slate-800 shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DE] dark:border-slate-800 mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Shift Team Comms</span>
                    <span className="text-[10px] text-[#EA580C] font-semibold">Bay 1-3 Live</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-[#F8F7F4] dark:bg-slate-800/60 border border-[#E5E5DE] dark:border-slate-800">
                      <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                        <span>Sarah Jenkins</span>
                        <span className="text-[10px] text-slate-400">12m ago</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                        Work order #8041 for Turbine #04 is 50% completed. Laser alignment looks within 0.01mm.
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F8F7F4] dark:bg-slate-800/60 border border-[#E5E5DE] dark:border-slate-800">
                      <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                        <span>Kenji Sato</span>
                        <span className="text-[10px] text-slate-400">35m ago</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                        Hydraulic press carbide inserts prepared for shift changeover at 14:00.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Switcher Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 hover:text-[#111827] dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4.5 w-4.5 text-amber-400" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-slate-600" />
              )}
            </button>

            {/* Operator Menu */}
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Lower Operational Command Ribbon: Categorized Module Navigation Pills */}
      <div className="px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 min-w-max">
          <nav className="flex items-center gap-1 sm:gap-2">
            {navClusters.map((cluster, cIdx) => (
              <React.Fragment key={cluster.group}>
                {cIdx > 0 && (
                  <span className="h-4 w-px bg-[#E5E5DE] dark:bg-slate-800 mx-1 shrink-0" />
                )}

                <div className="flex items-center gap-1">
                  {cluster.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all group shrink-0 ${
                            isActive
                              ? 'bg-white dark:bg-slate-800 text-[#111827] dark:text-white border border-[#E5E5DE] dark:border-slate-700 shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-[#111827] dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60 border border-transparent'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon
                              className={`h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110 ${
                                isActive ? 'text-[#EA580C]' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                              }`}
                            />
                            <span className="tracking-tight">{item.title}</span>

                            {/* Active dot indicator */}
                            {isActive && (
                              <span className="h-1.5 w-1.5 rounded-full bg-[#EA580C] shrink-0" />
                            )}

                            {/* Optional count or critical badge */}
                            {item.badge && (
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                                  item.isCriticalBadge
                                    ? 'bg-[#EA580C] text-white animate-pulse'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-[#E5E5DE] dark:border-slate-700'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
