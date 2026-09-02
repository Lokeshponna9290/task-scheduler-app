import React from 'react';
import { CalendarViewType } from '../types';
import { Calendar, CalendarDays, Grid3X3, Layers, Shield, SlidersHorizontal } from 'lucide-react';

interface MobileBottomNavProps {
  viewType: CalendarViewType;
  onViewTypeChange: (view: CalendarViewType) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  focusScorePercent: number;
}

export default function MobileBottomNav({
  viewType,
  onViewTypeChange,
  onToggleSidebar,
  isSidebarOpen,
  focusScorePercent,
}: MobileBottomNavProps) {
  const tabs: { id: CalendarViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'day', label: 'Day', icon: <Calendar className="w-4 h-4" /> },
    { id: 'week', label: 'Week', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'month', label: 'Month', icon: <Grid3X3 className="w-4 h-4" /> },
    { id: 'year', label: 'Year', icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <nav className="sm:hidden h-14 bg-white/95 backdrop-blur-xl border-t border-black/[0.08] px-3 flex items-center justify-around select-none shrink-0 z-40 safe-bottom">
      {tabs.map((tab) => {
        const isActive = viewType === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onViewTypeChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-[#007AFF] font-bold scale-105'
                : 'text-neutral-500 hover:text-neutral-900 font-medium'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#007AFF] absolute -bottom-1 left-1/2 -translate-x-1/2" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}

      {/* Sidebar & Focus Shield Drawer Toggle */}
      <button
        onClick={onToggleSidebar}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
          isSidebarOpen
            ? 'text-indigo-600 font-bold scale-105'
            : 'text-neutral-500 hover:text-neutral-900 font-medium'
        }`}
        title="Calendars & Focus Shield"
      >
        <div className="relative">
          <Shield className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 text-[8px] font-extrabold bg-indigo-600 text-white rounded-full w-3 h-3 flex items-center justify-center">
            {focusScorePercent > 0 ? `${focusScorePercent}%`.slice(0, 2) : '•'}
          </span>
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Shield</span>
      </button>
    </nav>
  );
}
