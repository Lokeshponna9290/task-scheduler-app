import React, { useEffect, useRef } from 'react';
import { ScheduleEvent, CATEGORY_CONFIGS, VoiceAccentId } from '../../types';
import { 
  formatHourOnly12h, formatTime12h, timeStringToMinutes, 
  toDateKey, isToday, isSameDay, minutesToTimeString 
} from '../../utils/dateUtils';
import { VOICE_ACCENTS, speakText, playChime } from '../../utils/audio';
import { Check, Volume2, Trash2, Clock, MapPin, Sparkles, Plus } from 'lucide-react';

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

const HOUR_HEIGHT = 64; // px per hour

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
  const dateKey = toDateKey(currentDate);
  const isCurrentDayToday = isToday(currentDate);

  // Filter events for this day and selected categories
  const dayEvents = events.filter(e => {
    const eventDateKey = e.date || toDateKey(new Date());
    return eventDateKey === dateKey && selectedCategories.has(e.category);
  });

  // Calculate live current time position
  const [nowMinutes, setNowMinutes] = React.useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setNowMinutes(now.getHours() * 60 + now.getMinutes());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to near current time or 8 AM on initial load
  useEffect(() => {
    if (containerRef.current) {
      const targetMins = isCurrentDayToday ? Math.max(0, nowMinutes - 90) : 8 * 60;
      const targetScroll = (targetMins / 60) * HOUR_HEIGHT;
      containerRef.current.scrollTop = targetScroll;
    }
  }, [dateKey]);

  const liveLineTop = (nowMinutes / 60) * HOUR_HEIGHT;

  const handleSpeakEvent = (e: React.MouseEvent, event: ScheduleEvent) => {
    e.stopPropagation();
    playChime(event.chime);
    setTimeout(() => {
      const text = event.notes 
        ? `${event.title}. Note: ${event.notes}`
        : `${event.title} scheduled at ${formatTime12h(event.time)}`;
      speakText(text, event.accent);
    }, 600);
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 h-full overflow-y-auto bg-white relative select-none"
    >
      <div className="min-w-[500px] relative pb-20">
        
        {/* 24-Hour Timeline Grid */}
        {Array.from({ length: 24 }).map((_, hour) => {
          const timeStr = `${String(hour).padStart(2, '0')}:00`;
          return (
            <div 
              key={hour}
              style={{ height: `${HOUR_HEIGHT}px` }}
              className="flex border-b border-neutral-100 group relative"
            >
              {/* Hour Label */}
              <div className="w-16 sm:w-20 pr-3 text-right shrink-0 -translate-y-2.5">
                <span className="text-[11px] font-medium text-neutral-400">
                  {formatHourOnly12h(hour)}
                </span>
              </div>

              {/* Hour Content Canvas (Click to Quick Add) */}
              <div 
                onClick={() => onQuickAddAtTime(timeStr)}
                className="flex-1 relative border-l border-neutral-100 hover:bg-blue-50/20 cursor-pointer transition flex items-center justify-end pr-4"
              >
                {/* Subtle Plus Icon on Hover */}
                <div className="opacity-0 group-hover:opacity-60 transition text-neutral-400 flex items-center gap-1 text-[10px]">
                  <Plus className="w-3 h-3" />
                  <span>Add event</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Red Time Indicator Line (Apple Calendar Signature) */}
        {isCurrentDayToday && (
          <div 
            style={{ top: `${liveLineTop}px` }}
            className="absolute left-16 sm:left-20 right-0 z-20 flex items-center pointer-events-none"
          >
            {/* Red Dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] -ml-1.5 shadow-sm shadow-red-400 apple-live-dot" />
            {/* Red Line */}
            <div className="flex-1 h-[1.5px] bg-[#FF3B30]" />
          </div>
        )}

        {/* Events Overlay Container */}
        <div className="absolute top-0 left-16 sm:left-20 right-4 bottom-0 pointer-events-none">
          {dayEvents.map((event) => {
            const startMins = timeStringToMinutes(event.time);
            const top = (startMins / 60) * HOUR_HEIGHT;
            const height = Math.max(32, (event.duration / 60) * HOUR_HEIGHT);
            const cat = CATEGORY_CONFIGS[event.category];
            const endMins = startMins + event.duration;
            const endTimeStr = minutesToTimeString(endMins);

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
                  borderLeftColor: cat.color,
                }}
                className={`absolute left-2 right-2 border-l-4 rounded-r-lg p-2 shadow-2xs hover:shadow-md transition-all cursor-pointer pointer-events-auto border border-black/[0.04] overflow-hidden group flex flex-col justify-between ${
                  event.completed ? 'opacity-50 line-through' : ''
                }`}
              >
                {/* Top: Title, Time & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-bold text-neutral-900 line-clamp-1 ${event.completed ? 'line-through text-neutral-500' : ''}`}>
                        {event.title}
                      </span>
                      <span className="text-[10px] font-semibold text-neutral-500 font-mono">
                        {formatTime12h(event.time)} – {formatTime12h(endTimeStr)}
                      </span>
                    </div>

                    {event.notes && (
                      <p className="text-[11px] text-neutral-600 line-clamp-1 mt-0.5">
                        {event.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions on Hover */}
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition"
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
                      className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Tags if height permits */}
                {height >= 56 && (
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500">
                    <span 
                      style={{ color: cat.color }}
                      className="font-medium flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span>{cat.label}</span>
                    </span>
                    <span>•</span>
                    <span>{VOICE_ACCENTS[event.accent].flag} {VOICE_ACCENTS[event.accent].name.split(' ')[0]}</span>
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
