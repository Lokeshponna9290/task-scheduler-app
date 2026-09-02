import React, { useRef, useEffect } from 'react';
import { ScheduleEvent, CATEGORY_CONFIGS, PROTECTION_CONFIGS } from '../../types';
import { getWeekDays, formatTime12h, formatHourOnly12h, isToday, toDateKey } from '../../utils/dateUtils';

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

const HOUR_HEIGHT = 58;

const timeStringToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

const minutesToTimeString = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

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

  // Scroll to 8am on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, []);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const liveLineTop = (currentMinutes / 60) * HOUR_HEIGHT;

  return (
    <div className="flex-1 flex flex-col h-full bg-white select-none overflow-hidden">
      
      {/* 7-Day Header Columns */}
      <div className="flex border-b border-neutral-200 bg-neutral-50/70 shrink-0 pl-14 sm:pl-16 pr-3">
        {weekDays.map((day, idx) => {
          const isDayToday = isToday(day);
          const isDaySelected =
            day.getDate() === currentDate.getDate() &&
            day.getMonth() === currentDate.getMonth() &&
            day.getFullYear() === currentDate.getFullYear();

          const dayLetter = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][day.getDay()];
          const dayNum = day.getDate();

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day)}
              className="flex-1 py-2 text-center cursor-pointer hover:bg-neutral-100/70 transition border-r border-neutral-100 last:border-r-0"
            >
              <span className="text-[10px] font-bold text-neutral-400 block tracking-wider">
                {dayLetter}
              </span>
              <span
                className={`inline-flex items-center justify-center w-7 h-7 mt-0.5 rounded-full text-xs font-bold transition ${
                  isDayToday
                    ? 'bg-[#FF3B30] text-white shadow-xs'
                    : isDaySelected
                    ? 'bg-[#007AFF] text-white font-bold'
                    : 'text-neutral-800'
                }`}
              >
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>

      {/* Week Timeline Canvas */}
      <div ref={containerRef} className="flex-1 overflow-y-auto relative">
        <div className="flex min-w-[700px] relative pb-20">
          
          {/* Time Labels Column */}
          <div className="w-14 sm:w-16 shrink-0 select-none">
            {Array.from({ length: 24 }).map((_, hour) => (
              <div
                key={hour}
                style={{ height: `${HOUR_HEIGHT}px` }}
                className="pr-2 text-right -translate-y-2"
              >
                <span className="text-[10px] font-medium text-neutral-400">
                  {formatHourOnly12h(hour)}
                </span>
              </div>
            ))}
          </div>

          {/* 7 Columns Grid */}
          <div className="flex-1 grid grid-cols-7 border-l border-neutral-200 relative">
            {weekDays.map((day, dayIndex) => {
              const dayDateKey = toDateKey(day);
              const isDayToday = isToday(day);

              const dayEvents = events.filter((e) => {
                const eKey = e.date || toDateKey(new Date());
                return eKey === dayDateKey && selectedCategories.has(e.category);
              });

              return (
                <div key={dayIndex} className="relative border-r border-neutral-100 last:border-r-0">
                  
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
                    const height = Math.max(28, (event.duration / 60) * HOUR_HEIGHT);
                    const cat = CATEGORY_CONFIGS[event.category];
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
                          backgroundColor: `${cat.color}20`,
                          borderLeftColor: isProtected && protConfig ? protConfig.color : cat.color,
                        }}
                        className={`absolute left-0.5 right-0.5 border-l-3 rounded-r-md p-1 text-xs shadow-2xs hover:shadow-md transition cursor-pointer overflow-hidden border border-black/[0.04] group ${
                          isProtected && protConfig ? `${protConfig.borderLight} ${protConfig.glowClass}` : ''
                        } ${event.completed ? 'opacity-50 line-through' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-0.5 leading-tight">
                          <span className={`font-bold text-[11px] text-neutral-900 truncate flex items-center gap-1 ${event.completed ? 'line-through text-neutral-500' : ''}`}>
                            {isProtected && protConfig && <span className="text-[10px]">{protConfig.icon}</span>}
                            <span>{event.title}</span>
                          </span>
                        </div>
                        {height >= 38 && (
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
