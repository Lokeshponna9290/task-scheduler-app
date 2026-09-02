import React, { useState } from 'react';
import { CalendarViewType } from '../types';
import { 
  ChevronLeft, ChevronRight, Plus, Search, 
  PanelLeftClose, PanelLeft, Settings2, X
} from 'lucide-react';
import { MONTH_NAMES, MONTH_SHORT_NAMES, getWeekDays } from '../utils/dateUtils';
import AppLogo from './AppLogo';
import { UserProfile } from './AppleAccountModal';

interface AppleCalendarHeaderProps {
  currentDate: Date;
  viewType: CalendarViewType;
  onViewTypeChange: (view: CalendarViewType) => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onNavigateToday: () => void;
  onNavigateHome: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewEventModal: () => void;
  onOpenPreferences?: () => void;
  userProfile?: UserProfile;
  onOpenAccount?: () => void;
}

export default function AppleCalendarHeader({
  currentDate,
  viewType,
  onViewTypeChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday,
  onNavigateHome,
  isSidebarOpen,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onOpenNewEventModal,
  onOpenPreferences,
  userProfile,
  onOpenAccount,
}: AppleCalendarHeaderProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Generate header title based on current view and date
  const getHeaderTitle = (isMobile: boolean = false) => {
    const year = currentDate.getFullYear();
    const month = MONTH_NAMES[currentDate.getMonth()];
    const monthShort = MONTH_SHORT_NAMES[currentDate.getMonth()];
    
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
        return isMobile 
          ? `${MONTH_SHORT_NAMES[start.getMonth()]} ${start.getDate()}–${end.getDate()}`
          : `${MONTH_SHORT_NAMES[start.getMonth()]} ${start.getDate()} – ${end.getDate()}, ${year}`;
      }
      return `${MONTH_SHORT_NAMES[start.getMonth()]} ${start.getDate()} – ${MONTH_SHORT_NAMES[end.getMonth()]} ${end.getDate()}`;
    }

    // Day view
    const weekday = currentDate.toLocaleDateString('en-US', { weekday: isMobile ? 'short' : 'long' });
    const dayNum = currentDate.getDate();
    return isMobile ? `${weekday}, ${monthShort} ${dayNum}` : `${weekday}, ${month} ${dayNum}, ${year}`;
  };

  const viewOptions: { id: CalendarViewType; label: string }[] = [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
  ];

  const initials = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'LP';

  return (
    <header className="h-13 sm:h-14 bg-white/95 backdrop-blur-md border-b border-black/[0.08] px-2.5 sm:px-4 flex items-center justify-between select-none shrink-0 z-30 transition-all">
      
      {/* Mobile Search Overlay Bar */}
      {isMobileSearchOpen ? (
        <div className="flex-1 flex items-center gap-2 py-1">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events..."
            className="flex-1 text-xs bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200 focus:bg-white focus:outline-none focus:border-[#007AFF]"
          />
          <button
            onClick={() => {
              setIsMobileSearchOpen(false);
              onSearchChange('');
            }}
            className="p-1.5 text-neutral-500 hover:text-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Left controls: Clickable Home Logo, Sidebar Toggle & Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            
            {/* Single Main Brand Logo (Works as Home Button) */}
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-neutral-100 active:scale-95 transition cursor-pointer group shrink-0"
              title="Scheduler Home (Today)"
            >
              <AppLogo size={26} />
              <span className="text-sm font-bold tracking-tight text-neutral-900 font-sans group-hover:text-[#007AFF] transition hidden md:inline">
                Scheduler
              </span>
            </button>

            {/* Sidebar toggle button */}
            <button
              onClick={onToggleSidebar}
              className={`p-1.5 rounded-lg transition shrink-0 ${
                isSidebarOpen ? 'bg-neutral-100 text-[#007AFF]' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
              title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>

            {/* Navigation buttons: Today, Prev, Next */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={onNavigateToday}
                className="px-2 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs font-semibold bg-neutral-100/90 hover:bg-neutral-200/80 text-neutral-800 border border-neutral-200 transition active:scale-95"
              >
                Today
              </button>

              <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden bg-neutral-100/50">
                <button
                  onClick={onNavigatePrev}
                  className="p-1 sm:p-1.5 hover:bg-neutral-200/70 text-neutral-700 transition"
                  title="Previous"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-3.5 bg-neutral-200" />
                <button
                  onClick={onNavigateNext}
                  className="p-1 sm:p-1.5 hover:bg-neutral-200/70 text-neutral-700 transition"
                  title="Next"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dynamic Date headline */}
            <div className="min-w-0 truncate pl-1 hidden xs:block sm:block">
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-neutral-900 tracking-tight truncate">
                <span className="sm:hidden">{getHeaderTitle(true)}</span>
                <span className="hidden sm:inline">{getHeaderTitle(false)}</span>
              </h2>
            </div>
          </div>

          {/* Center: Apple Segmented View Switcher (Desktop / Tablet) */}
          <div className="hidden sm:flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/70 shrink-0">
            {viewOptions.map((opt) => {
              const isActive = viewType === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onViewTypeChange(opt.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
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

          {/* Right controls: Search, Quick Add, Settings & User Account */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Desktop Search Bar */}
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="w-28 lg:w-40 pl-8 pr-3 py-1 text-xs bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white border border-transparent focus:border-neutral-300 rounded-md focus:outline-none transition"
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

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden p-1.5 rounded-md text-neutral-500 hover:text-black hover:bg-neutral-100 transition"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Apple New Event Button */}
            <button
              onClick={onOpenNewEventModal}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-[#FF3B30] hover:bg-[#E0342A] active:scale-95 text-white text-xs font-semibold rounded-lg sm:rounded-md transition shadow-xs"
              title="Create New Event (⌘N)"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">New Event</span>
            </button>

            {/* Preferences Gear */}
            {onOpenPreferences && (
              <button
                onClick={onOpenPreferences}
                className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-black transition"
                title="Audio & Voice Preferences"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            )}

            {/* User Account Avatar Button */}
            {onOpenAccount && (
              <button
                onClick={onOpenAccount}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-xs hover:ring-2 hover:ring-[#0077FE] active:scale-95 transition"
                style={{ background: userProfile?.avatarColor || 'linear-gradient(135deg, #0077FE 0%, #0051D4 100%)' }}
                title={`Account: ${userProfile?.name || 'User'}`}
              >
                {initials}
              </button>
            )}
          </div>
        </>
      )}

    </header>
  );
}
