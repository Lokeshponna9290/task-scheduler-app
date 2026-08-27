import React from 'react';
import { CalendarViewType } from '../types';
import { 
  ChevronLeft, ChevronRight, Plus, Search, 
  PanelLeftClose, PanelLeft, Volume2, Smartphone, 
  Monitor, Calendar, Sparkles, Check
} from 'lucide-react';
import { MONTH_NAMES, MONTH_SHORT_NAMES, getWeekDays } from '../utils/dateUtils';

interface AppleCalendarHeaderProps {
  currentDate: Date;
  viewType: CalendarViewType;
  onViewTypeChange: (view: CalendarViewType) => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onNavigateToday: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewEventModal: () => void;
  activeTab: 'calendar' | 'voice' | 'guide';
  onTabChange: (tab: 'calendar' | 'voice' | 'guide') => void;
  frameMode: 'desktop' | 'mobile';
  onFrameModeChange: (mode: 'desktop' | 'mobile') => void;
}

export default function AppleCalendarHeader({
  currentDate,
  viewType,
  onViewTypeChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday,
  isSidebarOpen,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onOpenNewEventModal,
  activeTab,
  onTabChange,
  frameMode,
  onFrameModeChange,
}: AppleCalendarHeaderProps) {

  // Generate header title based on current view and date
  const getHeaderTitle = () => {
    const year = currentDate.getFullYear();
    const month = MONTH_NAMES[currentDate.getMonth()];
    
    if (viewType === 'year') {
      return `${year}`;
    }
    
    if (viewType === 'month') {
      return `${month} ${year}`;
    }

    if (viewType === 'week') {
      const days = getWeekDays(currentDate);
      const start = days[0];
      const end = days[6];
      if (start.getMonth() === end.getMonth()) {
        return `${MONTH_SHORT_NAMES[start.getMonth()]} ${start.getDate()} – ${end.getDate()}, ${year}`;
      }
      return `${MONTH_SHORT_NAMES[start.getMonth()]} ${start.getDate()} – ${MONTH_SHORT_NAMES[end.getMonth()]} ${end.getDate()}, ${year}`;
    }

    // Day view
    const weekday = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayNum = currentDate.getDate();
    return `${weekday}, ${month} ${dayNum}, ${year}`;
  };

  const viewOptions: { id: CalendarViewType; label: string }[] = [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
  ];

  return (
    <header className="h-14 bg-white/90 backdrop-blur-md border-b border-black/[0.08] px-4 flex items-center justify-between select-none shrink-0 z-30 transition-all">
      
      {/* Left controls: Traffic lights & Navigation Cluster */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* macOS Window Controls */}
        <div className="hidden sm:flex items-center gap-2 mr-1">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-inner hover:opacity-80 transition cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-inner hover:opacity-80 transition cursor-pointer" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-inner hover:opacity-80 transition cursor-pointer" />
        </div>

        {/* Sidebar toggle button */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100 transition"
          title={isSidebarOpen ? "Hide Calendar Sidebar" : "Show Calendar Sidebar"}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>

        {/* Navigation buttons: Today, Prev, Next */}
        <div className="flex items-center gap-1">
          <button
            onClick={onNavigateToday}
            className="px-3 py-1 rounded-md text-xs font-semibold bg-neutral-100/80 hover:bg-neutral-200/80 text-neutral-800 border border-neutral-200 transition"
          >
            Today
          </button>

          <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden bg-neutral-100/50">
            <button
              onClick={onNavigatePrev}
              className="p-1.5 hover:bg-neutral-200/70 text-neutral-700 transition"
              title="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3.5 bg-neutral-200" />
            <button
              onClick={onNavigateNext}
              className="p-1.5 hover:bg-neutral-200/70 text-neutral-700 transition"
              title="Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Date headline */}
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm md:text-base font-bold text-neutral-900 tracking-tight">
            {getHeaderTitle()}
          </h2>
        </div>
      </div>

      {/* Center: Apple Segmented View Switcher */}
      {activeTab === 'calendar' && (
        <div className="hidden lg:flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/70">
          {viewOptions.map((opt) => {
            const isActive = viewType === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onViewTypeChange(opt.id)}
                className={`px-3.5 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Right controls: Search, Quick Add, Tabs & Device Switcher */}
      <div className="flex items-center gap-2 md:gap-3">
        
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events..."
            className="w-36 lg:w-48 pl-8 pr-3 py-1 text-xs bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white border border-transparent focus:border-neutral-300 rounded-md focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-[10px]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Apple New Event Button */}
        <button
          onClick={onOpenNewEventModal}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#FF3B30] hover:bg-[#E0342A] active:scale-95 text-white text-xs font-semibold rounded-md transition shadow-xs"
          title="Create New Event (⌘N)"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Event</span>
        </button>

        <div className="w-[1px] h-4 bg-neutral-200 hidden sm:block" />

        {/* Tab Switchers: Calendar / Voice Settings / iOS Guide */}
        <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/70 text-xs">
          <button
            onClick={() => onTabChange('calendar')}
            className={`p-1.5 rounded-md transition ${
              activeTab === 'calendar' ? 'bg-white text-black shadow-xs font-semibold' : 'text-neutral-500 hover:text-black'
            }`}
            title="Calendar View"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onTabChange('voice')}
            className={`p-1.5 rounded-md transition ${
              activeTab === 'voice' ? 'bg-white text-black shadow-xs font-semibold' : 'text-neutral-500 hover:text-black'
            }`}
            title="Voice & Accent Settings"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onTabChange('guide')}
            className={`p-1.5 rounded-md transition ${
              activeTab === 'guide' ? 'bg-white text-black shadow-xs font-semibold' : 'text-neutral-500 hover:text-black'
            }`}
            title="iOS Native App Guide"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Frame Mode Switcher (Desktop vs iPhone Simulator) */}
        <div className="hidden sm:flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/70">
          <button
            onClick={() => onFrameModeChange('desktop')}
            className={`p-1.5 rounded-md transition ${
              frameMode === 'desktop' ? 'bg-white text-black shadow-xs' : 'text-neutral-400 hover:text-neutral-700'
            }`}
            title="macOS Desktop Mode"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onFrameModeChange('mobile')}
            className={`p-1.5 rounded-md transition ${
              frameMode === 'mobile' ? 'bg-white text-black shadow-xs' : 'text-neutral-400 hover:text-neutral-700'
            }`}
            title="iPhone Simulator Mode"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
