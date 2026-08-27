import React from 'react';
import { ScheduleEvent } from '../../types';
import { 
  getMonthGrid, MONTH_NAMES, WEEKDAY_INITIALS, 
  toDateKey, isSameDay, isToday 
} from '../../utils/dateUtils';

interface AppleYearViewProps {
  currentDate: Date;
  events: ScheduleEvent[];
  selectedCategories: Set<ScheduleEvent['category']>;
  onSelectDateAndSwitchToDay: (date: Date) => void;
}

export default function AppleYearView({
  currentDate,
  events,
  selectedCategories,
  onSelectDateAndSwitchToDay,
}: AppleYearViewProps) {
  const currentYear = currentDate.getFullYear();

  // Index events by date key
  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, number>();
    const todayKey = toDateKey(new Date());

    events.forEach(e => {
      if (selectedCategories.has(e.category)) {
        const key = e.date || todayKey;
        map.set(key, (map.get(key) || 0) + 1);
      }
    });

    return map;
  }, [events, selectedCategories]);

  return (
    <div className="flex-1 bg-white p-6 overflow-y-auto select-none">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, monthIndex) => {
          const monthDate = new Date(currentYear, monthIndex, 1);
          const grid = getMonthGrid(currentYear, monthIndex, currentDate);

          return (
            <div 
              key={monthIndex}
              className="p-3 bg-[#FBFBFC] rounded-2xl border border-black/[0.04] shadow-2xs hover:shadow-xs transition"
            >
              {/* Month Headline */}
              <h3 
                onClick={() => onSelectDateAndSwitchToDay(monthDate)}
                className="text-xs font-bold text-neutral-800 mb-2 px-1 hover:text-[#007AFF] cursor-pointer transition"
              >
                {MONTH_NAMES[monthIndex]}
              </h3>

              {/* Day Initials */}
              <div className="grid grid-cols-7 text-center mb-1">
                {WEEKDAY_INITIALS.map((init, idx) => (
                  <span key={idx} className="text-[9px] font-semibold text-neutral-400">
                    {init}
                  </span>
                ))}
              </div>

              {/* Mini Days Grid */}
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {grid.map((day, dIdx) => {
                  if (!day.isCurrentMonth) {
                    return <div key={dIdx} className="h-5" />; // Empty slot for clean alignment
                  }

                  const hasEvents = eventsByDate.has(day.dateKey);
                  const isDayToday = isToday(day.date);
                  const isSelected = isSameDay(day.date, currentDate);

                  return (
                    <button
                      key={dIdx}
                      onClick={() => onSelectDateAndSwitchToDay(day.date)}
                      className={`h-5 w-5 mx-auto rounded-full flex flex-col items-center justify-center text-[10px] font-medium relative transition ${
                        isDayToday
                          ? 'bg-[#FF3B30] text-white font-bold'
                          : isSelected
                          ? 'bg-[#007AFF] text-white'
                          : 'text-neutral-700 hover:bg-neutral-200/70'
                      }`}
                      title={`${day.dayNumber} ${MONTH_NAMES[monthIndex]} ${hasEvents ? `(${eventsByDate.get(day.dateKey)} events)` : ''}`}
                    >
                      <span>{day.dayNumber}</span>
                      {hasEvents && !isDayToday && !isSelected && (
                        <span className="w-1 h-1 rounded-full bg-[#007AFF] absolute -bottom-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
