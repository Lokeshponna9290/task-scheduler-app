import React, { useState } from 'react';
import { ScheduleEvent, CATEGORY_CONFIGS, VoiceAccentId, ChimeType } from '../types';
import { 
  ChevronLeft, ChevronRight, Check, Volume2, 
  Bell, Clock, Sparkles, Plus, Play, CheckCircle2
} from 'lucide-react';
import { 
  getMonthGrid, MONTH_NAMES, WEEKDAY_INITIALS, 
  toDateKey, isSameDay, isToday, formatTime12h 
} from '../utils/dateUtils';
import { VOICE_ACCENTS, speakText, playChime } from '../utils/audio';
import AppLogo from './AppLogo';

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
}: AppleCalendarSidebarProps) {
  const [miniCalendarMonth, setMiniCalendarMonth] = useState(currentDate.getMonth());
  const [miniCalendarYear, setMiniCalendarYear] = useState(currentDate.getFullYear());
  const [isPlayingTestAudio, setIsPlayingTestAudio] = useState(false);

  // Sync mini calendar when currentDate month/year changes
  React.useEffect(() => {
    setMiniCalendarMonth(currentDate.getMonth());
    setMiniCalendarYear(currentDate.getFullYear());
  }, [currentDate]);

  const handlePrevMiniMonth = () => {
    if (miniCalendarMonth === 0) {
      setMiniCalendarMonth(11);
      setMiniCalendarYear(miniCalendarYear - 1);
    } else {
      setMiniCalendarMonth(miniCalendarMonth - 1);
    }
  };

  const handleNextMiniMonth = () => {
    if (miniCalendarMonth === 11) {
      setMiniCalendarMonth(0);
      setMiniCalendarYear(miniCalendarYear + 1);
    } else {
      setMiniCalendarMonth(miniCalendarMonth + 1);
    }
  };

  // Generate mini calendar grid
  const miniGrid = getMonthGrid(miniCalendarYear, miniCalendarMonth, currentDate);

  // Map events to date keys to show dots on mini calendar
  const eventsByDateKey = React.useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    const todayKey = toDateKey(new Date());
    events.forEach(e => {
      const key = e.date || todayKey;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [events]);

  // Find next upcoming event
  const nextEvent = React.useMemo(() => {
    const todayKey = toDateKey(new Date());
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const todayEvents = events.filter(e => (e.date || todayKey) === todayKey && !e.completed);
    const sorted = [...todayEvents].sort((a, b) => a.time.localeCompare(b.time));
    
    const upcoming = sorted.find(e => {
      const [h, m] = e.time.split(':').map(Number);
      return h * 60 + m >= currentMins;
    });

    return upcoming || sorted[0] || events[0];
  }, [events]);

  const handleTestVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingTestAudio) return;
    setIsPlayingTestAudio(true);
    playChime(activeChime);
    setTimeout(() => {
      speakText(`Reminder preview. This is an announcement with ${VOICE_ACCENTS[activeAccent].name}.`, activeAccent, () => {
        setIsPlayingTestAudio(false);
      });
    }, 800);
  };

  return (
    <aside className="w-64 bg-[#F6F6F8] border-r border-black/[0.08] flex flex-col h-full shrink-0 select-none overflow-y-auto custom-sidebar transition-all">
      
      {/* App Branding Top Header */}
      <div className="px-4 py-3 border-b border-black/[0.06] flex items-center justify-between bg-white/60">
        <AppLogo size={26} showText={true} />
        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Pro
        </span>
      </div>

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

        {/* Day Initials Row */}
        <div className="grid grid-cols-7 text-center mb-1">
          {WEEKDAY_INITIALS.map((init, idx) => (
            <span key={idx} className="text-[10px] font-semibold text-neutral-400">
              {init}
            </span>
          ))}
        </div>

        {/* Mini Grid */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {miniGrid.map((day, idx) => {
            const hasEvents = eventsByDateKey.has(day.dateKey);
            const isSel = isSameDay(day.date, currentDate);
            const isCurrentToday = isToday(day.date);

            return (
              <button
                key={idx}
                onClick={() => onSelectDate(day.date)}
                className={`relative h-6 w-6 mx-auto flex items-center justify-center rounded-full text-[11px] font-medium transition ${
                  isCurrentToday
                    ? 'bg-[#FF3B30] text-white font-bold shadow-xs'
                    : isSel
                    ? 'bg-[#007AFF] text-white font-semibold shadow-xs'
                    : day.isCurrentMonth
                    ? 'text-neutral-800 hover:bg-neutral-200/80'
                    : 'text-neutral-300 hover:text-neutral-500'
                }`}
              >
                <span>{day.dayNumber}</span>
                {hasEvents && !isCurrentToday && !isSel && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#007AFF]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Apple "Calendars" Section */}
      <div className="p-4 border-b border-black/[0.06]">
        <div className="flex items-center justify-between mb-2">
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

        {/* List of categories styled as Apple Calendars */}
        <div className="space-y-1">
          {(Object.keys(CATEGORY_CONFIGS) as ScheduleEvent['category'][]).map((catKey) => {
            const cat = CATEGORY_CONFIGS[catKey];
            const isSelected = selectedCategories.has(catKey);
            const count = events.filter(e => e.category === catKey).length;

            return (
              <label
                key={catKey}
                className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-neutral-200/60 cursor-pointer transition text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  {/* Apple Style Checkbox Circle */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleCategory(catKey)}
                    className="sr-only"
                  />
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      onToggleCategory(catKey);
                    }}
                    style={{ backgroundColor: isSelected ? cat.color : 'transparent', borderColor: cat.color }}
                    className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </div>
                  <span className={`font-medium ${isSelected ? 'text-neutral-900' : 'text-neutral-400'}`}>
                    {cat.label}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono px-1.5 py-0.5 rounded bg-neutral-200/40">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Upcoming Reminder Live Widget */}
      {nextEvent && (
        <div className="p-4 border-b border-black/[0.06]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] apple-live-dot" />
            <span>Next Reminder</span>
          </div>

          <div 
            onClick={() => onSelectEvent(nextEvent)}
            className="bg-white rounded-xl p-3 border border-black/[0.06] shadow-2xs hover:shadow-xs hover:border-neutral-300 transition cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-[#FF3B30] font-mono block">
                  {formatTime12h(nextEvent.time)} ({nextEvent.duration}m)
                </span>
                <h4 className="text-xs font-bold text-neutral-900 line-clamp-1 mt-0.5 group-hover:text-[#007AFF] transition">
                  {nextEvent.title}
                </h4>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${CATEGORY_CONFIGS[nextEvent.category].badgeBg}`}>
                {nextEvent.category}
              </span>
            </div>

            {nextEvent.notes && (
              <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1.5 leading-snug">
                {nextEvent.notes}
              </p>
            )}

            {/* Audio Waveform status */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100 text-[10px] text-neutral-500">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-neutral-400" />
                <span>{VOICE_ACCENTS[nextEvent.accent].name.split(' ')[0]}</span>
              </span>
              <button
                onClick={handleTestVoice}
                className="text-[#007AFF] hover:underline font-semibold flex items-center gap-1"
                title="Preview Voice Alert"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Quick Audio & Voice Accent Selector Footer */}
      <div className="p-4 mt-auto">
        <div className="bg-white/80 rounded-xl p-3 border border-black/[0.06] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Voice Synthesis</span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{VOICE_ACCENTS[activeAccent].flag}</span>
              <span className="font-semibold text-neutral-800 text-[11px]">{VOICE_ACCENTS[activeAccent].name}</span>
            </div>
            <button
              onClick={handleTestVoice}
              disabled={isPlayingTestAudio}
              className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
              title="Test Voice Announcement"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingTestAudio ? 'text-[#007AFF] animate-pulse' : ''}`} />
            </button>
          </div>
        </div>
      </div>

    </aside>
  );
}
