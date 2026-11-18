import React, { useState } from 'react';
import { Menu, Search, Sun, Moon, MessageSquare } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { NotificationsPopover } from './NotificationsPopover';
import { UserMenu } from './UserMenu';
import { GlobalSearchModal } from './GlobalSearchModal';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 w-full border-b border-[#E5E5DE] dark:border-slate-800 bg-[#F8F7F4]/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
        <div className="flex h-full items-center justify-between px-4 sm:px-6">
          {/* Left: Mobile hamburger & Search bar */}
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
              title="Open Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Quick Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full sm:max-w-xs flex items-center justify-between px-3.5 py-1.5 rounded-lg border border-[#E5E5DE] dark:border-slate-800 bg-white dark:bg-slate-950/50 text-xs text-slate-600 dark:text-slate-400 hover:border-slate-400 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400 group-hover:text-[#EA580C] transition-colors" />
                <span className="truncate">Search machines, telemetry...</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <span>⌘K</span>
              </div>
            </button>
          </div>

          {/* Right: Actions, Notifications, Theme, User */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Facility Status Badge */}
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-[#E5E5DE] dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Plant Alpha: 98.4% Nominal</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 hover:text-[#111827] dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600" />
              )}
            </button>

            {/* Messages Popover */}
            <div className="relative">
              <button
                onClick={() => setIsMessagesOpen(!isMessagesOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-[#111827] dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
                title="Industrial Shift Log Messages"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EA580C]" />
              </button>

              {isMessagesOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-900 border border-[#E5E5DE] dark:border-slate-800 shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DE] dark:border-slate-800 mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Shift Team Comms</span>
                    <span className="text-[10px] text-[#EA580C] font-semibold">Bay 1-3 Live</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                        <span>Sarah Jenkins</span>
                        <span className="text-[10px] text-slate-400">12m ago</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                        Work order #8041 for Turbine #04 is 50% completed. Laser alignment looks within 0.01mm.
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
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

            {/* Industrial Notifications */}
            <NotificationsPopover />

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* User Profile */}
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
