import React, { useEffect, useRef } from 'react';
import { ScheduleEvent, CATEGORY_CONFIGS, VoiceAccentId } from '../../types';
import { 
  getWeekDays, formatHourOnly12h, formatTime12h, 
  timeStringToMinutes, toDateKey, isToday, isSameDay, 
  minutesToTimeString, WEEKDAY_SHORT 
} from '../../utils/dateUtils';
import { Check, Volume2, Trash2 } from 'lucide-react';
import { speakText, playChime } from '../../utils/audio';

interface AppleWeekViewProps {
  currentDate: Date;
  events: ScheduleEvent[];
  selectedCategories: Set<ScheduleEvent['category']>;
  onSelectDate: (date: Date) => void;
  onSelectEvent: (event: ScheduleEvent) => void;
  onToggleComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onQuickAddAtDateAndTime: (dateKey: string, timeStr: string) => void;
}

const HOUR_HEIGHT = 56; // px per hour

export default function AppleWeekView({
  currentDate,
  events,
  selectedCategories,
  onSelectDate,
  onSelectEvent,
  onToggleComplete,
  onDeleteEvent,
  onQuickAddAtDateAndTime,
}: AppleWeekViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const weekDays = getWeekDays(currentDate);

  // Live time position
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

  // Auto-scroll to 8 AM on load
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 7.5 * HOUR_HEIGHT;
    }
  }, []);

  const liveLineTop = (nowMinutes / 60) * HOUR_HEIGHT;

  return (
    <div className="flex-1 flex flex-col h-full bg-white select-none overflow-hidden">
      
      {/* 1. Sticky Week Header Row */}
      <div className="flex border-b border-neutral-200 bg-[#F6F6F8]/80 backdrop-blur-md z-10 shrink-0">
        {/* Empty top-left corner above hour labels */}
        <div className="w-14 sm:w-16 border-r border-neutral-200 shrink-0" />

        {/* 7 Day Column Headers */}
        <div className="flex-1 grid grid-cols-7 divide-x divide-neutral-200">
          {weekDays.map((day, idx) => {
            const isDayToday = isToday(day);
            const isDaySelected = isSameDay(day, currentDate);

            return (
              <button
                key={idx}
                onClick={() => onSelectDate(day)}
                className={`py-2 px-1 text-center hover:bg-neutral-200/50 transition flex flex-col items-center justify-center gap-0.5 ${
                  isDaySelected ? 'bg-blue-50/40' : ''
                }`}
              >
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                  isDayToday ? 'text-[#FF3B30] font-bold' : 'text-neutral-500'
                }`}>
                  {WEEKDAY_SHORT[day.getDay()]}
                </span>
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition ${
                  isDayToday 
                    ? 'bg-[#FF3B30] text-white shadow-xs' 
                    : isDaySelected
                    ? 'bg-[#007AFF] text-white'
                    : 'text-neutral-800'
                }`}>
                  {day.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Scrollable 24-Hour Week Grid */}
      <div ref={containerRef} className="flex-1 overflow-y-auto relative">
        <div className="flex min-w-[700px] relative pb-16">
          
          {/* Time Labels Column */}
          <div className="w-14 sm:w-16 shrink-0 border-r border-neutral-200 select-none">
            {Array.from({ length: 24 }).map((_, hour) => (
              <div 
                key={hour}
                style={{ height: `${HOUR_HEIGHT}px` }}
                className="pr-2 text-right -translate-y-2.5"
              >
                <span className="text-[10px] font-medium text-neutral-400">
                  {formatHourOnly12h(hour)}
                </span>
              </div>
            ))}
          </div>

          {/* 7 Columns for Days */}
          <div className="flex-1 grid grid-cols-7 divide-x divide-neutral-200 relative">
            {weekDays.map((day, dayIndex) => {
              const dayDateKey = toDateKey(day);
              const isDayToday = isToday(day);
              
              // Get events for this day
              const dayEvents = events.filter(e => {
                const eKey = e.date || toDateKey(new Date());
                return eKey === dayDateKey && selectedCategories.has(e.category);
              });

              return (
                <div key={dayIndex} className="relative">
                  
                  {/* 24 Hour Rows for clicking */}
                  {Array.from({ length: 24 }).map((_, hour) => {
                    const timeStr = `${String(hour).padStart(2, '0')}:00`;
                    return (
                      <div
                        key={hour}
                        onClick={() => onQuickAddAtDateAndTime(dayDateKey, timeStr)}
                        style={{ height: `${HOUR_HEIGHT}px` }}
                        className="border-b border-neutral-100 hover:bg-blue-50/20 cursor-pointer transition"
                      />
                    );
                  })}

                  {/* Live Red Time Indicator Line (If this column is Today) */}
                  {isDayToday && (
                    <div
                      style={{ top: `${liveLineTop}px` }}
                      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#FF3B30] -ml-1 apple-live-dot" />
                      <div className="flex-1 h-[1.5px] bg-[#FF3B30]" />
                    </div>
                  )}

                  {/* Events in this day column */}
                  {dayEvents.map((event) => {
                    const startMins = timeStringToMinutes(event.time);
                    const top = (startMins / 60) * HOUR_HEIGHT;
                    const height = Math.max(26, (event.duration / 60) * HOUR_HEIGHT);
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
                          backgroundColor: `${cat.color}20`,
                          borderLeftColor: cat.color,
                        }}
                        className={`absolute left-0.5 right-0.5 border-l-3 rounded-r p-1 text-xs shadow-2xs hover:shadow-md transition cursor-pointer overflow-hidden border border-black/[0.04] group ${
                          event.completed ? 'opacity-50 line-through' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 leading-tight">
                          <span className={`font-bold text-[11px] text-neutral-900 truncate ${event.completed ? 'line-through text-neutral-500' : ''}`}>
                            {event.title}
                          </span>
                        </div>
                        {height >= 40 && (
                          <span className="text-[9px] font-semibold text-neutral-500 font-mono block">
                            {formatTime12h(event.time)}
                          </span>
                        )}
                      </div>
                    );
                  })}

                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
