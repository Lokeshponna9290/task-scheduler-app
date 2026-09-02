import React, { useRef, useEffect } from 'react';
import { ScheduleEvent, CATEGORY_CONFIGS, VoiceAccentId, PROTECTION_CONFIGS } from '../../types';
import { formatTime12h, formatHourOnly12h, isToday, toDateKey } from '../../utils/dateUtils';
import { speakText, playChime } from '../../utils/audio';
import { Check, Volume2, Trash2, Plus, Clock, Shield } from 'lucide-react';

interface AppleDayViewProps {
  currentDate: Date;
  events: ScheduleEvent[];
  selectedCategories: Set<ScheduleEvent['category']>;
  onSelectEvent: (event: ScheduleEvent) => void;
  onToggleComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onQuickAddAtTime: (timeStr: string) => void;
  activeAccent: VoiceAccentId;
}

const HOUR_HEIGHT = 64; // Height of 1 hour in pixels

// Convert "09:30" string to minutes from start of day
const timeStringToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

// Convert minutes to "10:15"
const minutesToTimeString = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export default function AppleDayView({
  currentDate,
  events,
  selectedCategories,
  onSelectEvent,
  onToggleComplete,
  onDeleteEvent,
  onQuickAddAtTime,
  activeAccent,
}: AppleDayViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter events for current selected date and active categories
  const targetDateKey = toDateKey(currentDate);
  const dayEvents = events.filter(e => {
    const eventDate = e.date || targetDateKey;
    return eventDate === targetDateKey && selectedCategories.has(e.category);
  });

  // Scroll to current time or 8am on mount
  useEffect(() => {
    if (containerRef.current) {
      const now = new Date();
      const currentHour = isToday(currentDate) ? now.getHours() : 8;
      const scrollPos = Math.max(0, (currentHour - 1) * HOUR_HEIGHT);
      containerRef.current.scrollTop = scrollPos;
    }
  }, [currentDate]);

  const handleSpeakEvent = (e: React.MouseEvent, event: ScheduleEvent) => {
    e.stopPropagation();
    playChime(event.chime);
    setTimeout(() => {
      const speech = event.notes 
        ? `${event.title}. Note: ${event.notes}`
        : `${event.title} at ${formatTime12h(event.time)}`;
      speakText(speech, event.accent || activeAccent);
    }, 600);
  };

  const isCurrentDayToday = isToday(currentDate);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const liveLineTop = (currentMinutes / 60) * HOUR_HEIGHT;

  return (
    <div 
      ref={containerRef}
      className="flex-1 h-full overflow-y-auto bg-white relative select-none w-full min-w-0"
    >
      <div className="w-full relative pb-20">
        
        {/* 24-Hour Timeline Grid */}
        {Array.from({ length: 24 }).map((_, hour) => {
          const timeStr = `${String(hour).padStart(2, '0')}:00`;
          return (
            <div 
              key={hour}
              style={{ height: `${HOUR_HEIGHT}px` }}
              className="flex border-b border-neutral-100 group relative w-full"
            >
              {/* Hour Label */}
              <div className="w-12 sm:w-16 pr-2 sm:pr-3 text-right shrink-0 -translate-y-2.5">
                <span className="text-[10px] sm:text-[11px] font-medium text-neutral-400">
                  {formatHourOnly12h(hour)}
                </span>
              </div>

              {/* Hour Content Canvas (Click to Quick Add) */}
              <div 
                onClick={() => onQuickAddAtTime(timeStr)}
                className="flex-1 relative border-l border-neutral-100 hover:bg-blue-50/20 cursor-pointer transition flex items-center justify-end pr-3"
              >
                {/* Subtle Plus Icon on Hover */}
                <div className="opacity-0 group-hover:opacity-60 transition text-neutral-400 flex items-center gap-1 text-[10px]">
                  <Plus className="w-3 h-3" />
                  <span className="hidden sm:inline">Add event</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Red Time Indicator Line (Apple Calendar Signature) */}
        {isCurrentDayToday && (
          <div 
            style={{ top: `${liveLineTop}px` }}
            className="absolute left-12 sm:left-16 right-0 z-20 flex items-center pointer-events-none"
          >
            {/* Red Dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] -ml-1.5 shadow-sm shadow-red-400 apple-live-dot" />
            {/* Red Line */}
            <div className="flex-1 h-[1.5px] bg-[#FF3B30]" />
          </div>
        )}

        {/* Events Overlay Container */}
        <div className="absolute top-0 left-12 sm:left-16 right-2 sm:right-4 bottom-0 pointer-events-none">
          {dayEvents.map((event) => {
            const startMins = timeStringToMinutes(event.time);
            const top = (startMins / 60) * HOUR_HEIGHT;
            const height = Math.max(34, (event.duration / 60) * HOUR_HEIGHT);
            const cat = CATEGORY_CONFIGS[event.category];
            const endMins = startMins + event.duration;
            const endTimeStr = minutesToTimeString(endMins);
            const isProtected = event.protectionLevel === 'deep-work' || event.protectionLevel === 'health';
            const protConfig = event.protectionLevel ? PROTECTION_CONFIGS[event.protectionLevel] : null;

            return (
              <div
                key={event.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEvent(event);
                }}
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  backgroundColor: `${cat.color}15`,
                  borderLeftColor: isProtected && protConfig ? protConfig.color : cat.color,
                }}
                className={`absolute left-1 right-1 border-l-4 rounded-r-xl p-2 sm:p-2.5 shadow-2xs hover:shadow-md transition-all cursor-pointer pointer-events-auto border border-black/[0.04] overflow-hidden group flex flex-col justify-between ${
                  isProtected && protConfig ? `${protConfig.borderLight} ${protConfig.glowClass}` : ''
                } ${event.completed ? 'opacity-50 line-through' : ''}`}
              >
                {/* Top: Title, Time & Actions */}
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                      {isProtected && protConfig && (
                        <span 
                          className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white/90 shadow-2xs border border-indigo-200 text-indigo-950 flex items-center gap-1 shrink-0"
                          title={`Focus Shield: ${protConfig.badgeLabel}`}
                        >
                          <span>{protConfig.icon}</span>
                          <span className="hidden xs:inline sm:inline">{protConfig.badgeLabel}</span>
                        </span>
                      )}

                      <span className={`text-xs font-bold text-neutral-900 line-clamp-1 ${event.completed ? 'line-through text-neutral-500' : ''}`}>
                        {event.title}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-semibold text-neutral-500 font-mono">
                        {formatTime12h(event.time)} – {formatTime12h(endTimeStr)}
                      </span>
                    </div>

                    {event.notes && (
                      <p className="text-[10px] sm:text-[11px] text-neutral-600 line-clamp-1 mt-0.5">
                        {event.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions on Hover / Touch */}
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 shrink-0 opacity-90 transition"
                  >
                    {/* Speak Button */}
                    {event.enableVoice && (
                      <button
                        onClick={(e) => handleSpeakEvent(e, event)}
                        className="p-1 rounded hover:bg-white/80 text-neutral-600 hover:text-black transition"
                        title="Announce with Voice"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Toggle Completion */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(event.id);
                      }}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                        event.completed 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-neutral-400 hover:border-neutral-600 bg-white/80'
                      }`}
                      title={event.completed ? "Mark pending" : "Mark completed"}
                    >
                      {event.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEvent(event.id);
                      }}
                      className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 hidden sm:block"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom info: Location / duration */}
                {height > 52 && (
                  <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-neutral-500 font-medium">
                    <span className="capitalize">{event.category}</span>
                    <span>•</span>
                    <span>{event.duration} mins</span>
                    {isProtected && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-600 font-bold">🛡️ Protected</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
