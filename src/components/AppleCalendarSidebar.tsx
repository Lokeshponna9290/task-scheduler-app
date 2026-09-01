import React, { useState } from 'react';
import { ScheduleEvent, VoiceAccentId, ChimeType, CATEGORY_CONFIGS } from '../types';
import { MONTH_NAMES, getMonthGrid, toDateKey } from '../utils/dateUtils';
import { VOICE_ACCENTS, speakText, playChime } from '../utils/audio';
import { 
  ChevronLeft, ChevronRight, Plus, 
  Volume2, Play, User, Check
} from 'lucide-react';
import { UserProfile } from './AppleAccountModal';

interface AppleCalendarSidebarProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  events: ScheduleEvent[];
  selectedCategories: Set<ScheduleEvent['category']>;
  onToggleCategory: (category: ScheduleEvent['category']) => void;
  onOpenNewEventModal: () => void;
  onSelectEvent: (event: ScheduleEvent) => void;
  activeAccent: VoiceAccentId;
  onChangeAccent: (accent: VoiceAccentId) => void;
  activeChime: ChimeType;
  onChangeChime: (chime: ChimeType) => void;
  userProfile?: UserProfile;
  onOpenAccount?: () => void;
}

export default function AppleCalendarSidebar({
  currentDate,
  onSelectDate,
  events,
  selectedCategories,
  onToggleCategory,
  onOpenNewEventModal,
  onSelectEvent,
  activeAccent,
  onChangeAccent,
  activeChime,
  onChangeChime,
  userProfile = {
    name: 'Lokesh Reddy',
    email: 'lokeshreddyponna@gmail.com',
    avatarColor: 'linear-gradient(135deg, #0077FE 0%, #0051D4 100%)',
    membership: 'Pro Member',
    syncStatus: 'synced',
  },
  onOpenAccount,
}: AppleCalendarSidebarProps) {
  // Mini calendar month/year state (allows browsing months in the sidebar independently)
  const [miniCalendarMonth, setMiniCalendarMonth] = useState(currentDate.getMonth());
  const [miniCalendarYear, setMiniCalendarYear] = useState(currentDate.getFullYear());
  const [isPlayingTestAudio, setIsPlayingTestAudio] = useState(false);

  // Month grid matrix for mini calendar
  const miniGrid = getMonthGrid(miniCalendarYear, miniCalendarMonth, currentDate);

  const handlePrevMiniMonth = () => {
    if (miniCalendarMonth === 0) {
      setMiniCalendarMonth(11);
      setMiniCalendarYear(prev => prev - 1);
    } else {
      setMiniCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMiniMonth = () => {
    if (miniCalendarMonth === 11) {
      setMiniCalendarMonth(0);
      setMiniCalendarYear(prev => prev + 1);
    } else {
      setMiniCalendarMonth(prev => prev + 1);
    }
  };

  // Find nearest upcoming event
  const todayKey = toDateKey(new Date());
  const todayEvents = events
    .filter(e => (e.date || todayKey) === todayKey && !e.completed)
    .sort((a, b) => a.time.localeCompare(b.time));
  
  const nextEvent = todayEvents[0];

  const handleTestVoice = () => {
    if (isPlayingTestAudio) return;
    setIsPlayingTestAudio(true);
    playChime(activeChime);
    setTimeout(() => {
      speakText(`Reminder preview with ${VOICE_ACCENTS[activeAccent].name}.`, activeAccent, () => {
        setIsPlayingTestAudio(false);
      });
    }, 800);
  };

  const initials = userProfile.name
    ? userProfile.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'LP';

  return (
    <aside className="w-64 bg-[#F6F6F8] border-r border-black/[0.08] flex flex-col h-full shrink-0 select-none overflow-y-auto custom-sidebar transition-all">
      
      {/* 1. Mini Month Calendar Picker */}
      <div className="p-4 border-b border-black/[0.06]">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-bold text-neutral-800 tracking-tight">
            {MONTH_NAMES[miniCalendarMonth]} {miniCalendarYear}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMiniMonth}
              className="p-1 hover:bg-neutral-200/80 rounded text-neutral-600 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextMiniMonth}
              className="p-1 hover:bg-neutral-200/80 rounded text-neutral-600 transition"
              title="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 text-center mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <span key={idx} className="text-[10px] font-semibold text-neutral-400">
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
          {miniGrid.map((dayObj, idx) => {
            const hasEvents = dayObj.isCurrentMonth && events.some(e => (e.date || todayKey) === dayObj.dateKey);

            return (
              <button
                key={idx}
                onClick={() => {
                  if (dayObj.isCurrentMonth) {
                    onSelectDate(dayObj.date);
                  }
                }}
                disabled={!dayObj.isCurrentMonth}
                className={`w-7 h-7 mx-auto flex flex-col items-center justify-center rounded-full text-xs transition relative ${
                  !dayObj.isCurrentMonth
                    ? 'text-neutral-300 cursor-default'
                    : dayObj.isSelected
                    ? 'bg-[#007AFF] text-white font-bold shadow-xs'
                    : dayObj.isToday
                    ? 'bg-[#FF3B30] text-white font-bold shadow-xs'
                    : 'text-neutral-700 hover:bg-neutral-200/80 font-medium'
                }`}
              >
                <span>{dayObj.dayNumber}</span>
                {hasEvents && !dayObj.isSelected && !dayObj.isToday && (
                  <span className="w-1 h-1 rounded-full bg-[#007AFF] absolute bottom-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Apple Calendar Categories / Groups */}
      <div className="p-4 border-b border-black/[0.06] flex-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Calendars
          </span>
          <button
            onClick={onOpenNewEventModal}
            className="p-1 hover:bg-neutral-200/80 rounded text-neutral-500 hover:text-black transition"
            title="Add Event"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1">
          {(Object.keys(CATEGORY_CONFIGS) as ScheduleEvent['category'][]).map((catKey) => {
            const config = CATEGORY_CONFIGS[catKey];
            const isChecked = selectedCategories.has(catKey);
            const count = events.filter(e => e.category === catKey).length;

            return (
              <div
                key={catKey}
                onClick={() => onToggleCategory(catKey)}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-black/[0.04] cursor-pointer transition text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-[5px] flex items-center justify-center transition border ${
                      isChecked
                        ? 'border-transparent text-white'
                        : 'border-neutral-300 bg-white'
                    }`}
                    style={{
                      backgroundColor: isChecked ? config.color : 'white',
                    }}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="font-medium text-neutral-800">
                    {config.label}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 font-normal">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Next Upcoming Reminder Alert Widget */}
      {nextEvent && (
        <div className="p-4 border-t border-black/[0.06]">
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Next Reminder
            </span>
          </div>

          <div
            onClick={() => onSelectEvent(nextEvent)}
            className="p-3 bg-white rounded-xl border border-black/[0.06] hover:shadow-apple-card transition cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#FF3B30]">
                {nextEvent.time}
              </span>
              <span 
                className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: CATEGORY_CONFIGS[nextEvent.category].bgLight,
                  color: CATEGORY_CONFIGS[nextEvent.category].color,
                }}
              >
                {nextEvent.category}
              </span>
            </div>

            <h5 className="text-xs font-bold text-neutral-900 truncate group-hover:text-[#007AFF] transition">
              {nextEvent.title}
            </h5>

            {nextEvent.notes && (
              <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                {nextEvent.notes}
              </p>
            )}
          </div>
        </div>
      )}

    </aside>
  );
}
