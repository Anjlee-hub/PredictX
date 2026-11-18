import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { BranchNavigator } from '../components/BranchNavigator';
import { FloatingCommandDock } from '../components/FloatingCommandDock';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { MissionMatrixModal } from '../components/MissionMatrixModal';
import { Footer } from '../components/Footer';

export const DashboardLayout: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [isTreeOverlayOpen, setIsTreeOverlayOpen] = useState(false);

  // Global Keyboard Shortcuts (⌘K for Omnisearch, ⌘M for Mission Matrix, ⌘B for Branch Topology)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsMatrixOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsTreeOverlayOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[#F8F7F4] dark:bg-[#08080A] text-[#111827] dark:text-[#F4F4F5] flex flex-col font-sans selection:bg-[#EA580C] selection:text-white dot-grid-canvas">
      {/* Ambient Architectural Lighting Spotlight: Warm orange ember against stealth black in dark mode */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(234,88,12,0.05),transparent)] dark:bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(234,88,12,0.12),transparent)]" 
        aria-hidden="true" 
      />

      {/* 
        NO TOP BAR & NO SIDEBAR!
        Innovative Floating Industrial Branch Topology Navigator:
        - Floating top-left Branch Pathway capsule with interactive quick-switch popover
        - Floating top-right utility suite (Omnisearch ⌘K, Notifications, Light/Dark, Profile)
        - Floating left-edge vertical branch spine with glowing circuit line & flyouts
        - Interactive full-screen SVG Branch Topology HUD (⌘B)
      */}
      <BranchNavigator
        onOpenSearch={() => setIsSearchOpen(true)}
        isTreeOverlayOpen={isTreeOverlayOpen}
        setIsTreeOverlayOpen={setIsTreeOverlayOpen}
      />

      {/* Panoramic Widescreen Content Canvas */}
      <main className="relative z-10 flex-1 w-full max-w-[1600px] mx-auto pt-20 px-4 sm:px-8 md:pl-24 pb-24 box-border overflow-x-hidden">
        <Outlet />
      </main>

      {/* Floating Tactical Command Dock */}
      <FloatingCommandDock
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMatrix={() => setIsMatrixOpen(true)}
        onOpenBranch={() => setIsTreeOverlayOpen(true)}
      />

      {/* Global Mission Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MissionMatrixModal isOpen={isMatrixOpen} onClose={() => setIsMatrixOpen(false)} />

      {/* Global Engineering Footer */}
      <Footer />
    </div>
  );
};
