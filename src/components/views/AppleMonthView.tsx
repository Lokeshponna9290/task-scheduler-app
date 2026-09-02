import React from 'react';
import { ScheduleEvent, CATEGORY_CONFIGS, PROTECTION_CONFIGS } from '../../types';
import { getMonthGrid, isSameDay, isToday, formatTime12h, MONTH_NAMES } from '../../utils/dateUtils';
import { Plus } from 'lucide-react';

interface AppleMonthViewProps {
  currentDate: Date;
  events: ScheduleEvent[];
  selectedCategories: Set<ScheduleEvent['category']>;
  onSelectDate: (date: Date) => void;
  onSelectEvent: (event: ScheduleEvent) => void;
  onOpenNewEventModalForDate: (dateKey: string) => void;
  onDoubleSelectDate: (date: Date) => void;
}

export default function AppleMonthView({
  currentDate,
  events,
  selectedCategories,
  onSelectDate,
  onSelectEvent,
  onOpenNewEventModalForDate,
  onDoubleSelectDate,
}: AppleMonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 7x6 Month Matrix
  const grid = getMonthGrid(year, month, currentDate);

  const dayOfWeekHeaders = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="flex-1 flex flex-col h-full bg-white select-none overflow-hidden">
      
      {/* Weekday Table Headers */}
      <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50/70 shrink-0">
        {dayOfWeekHeaders.map((day, idx) => (
          <div
            key={idx}
            className="py-1.5 text-center text-[10px] font-bold text-neutral-400 tracking-wider border-r border-neutral-100 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 7x6 Calendar Cells Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 border-b border-neutral-200 overflow-hidden bg-neutral-200/40 gap-[1px]">
        {grid.map((day, idx) => {
          // Filter events for this day
          const dayEvents = events.filter((e) => {
            const eKey = e.date || '';
            return eKey === day.dateKey && selectedCategories.has(e.category);
          });

          const isSelected = isSameDay(day.date, currentDate);
          const isCurrentToday = isToday(day.date);

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day.date)}
              onDoubleClick={() => onDoubleSelectDate(day.date)}
              className={`p-1.5 flex flex-col justify-between transition group relative min-h-[90px] ${
                day.isCurrentMonth ? 'bg-white' : 'bg-neutral-50/60'
              } ${isSelected ? 'bg-blue-50/30 ring-1 ring-inset ring-[#007AFF]/30' : 'hover:bg-neutral-50/80'}`}
            >
              {/* Top Cell Bar: Date number & Quick Add */}
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold transition ${
                    isCurrentToday
                      ? 'bg-[#FF3B30] text-white font-bold shadow-xs'
                      : isSelected
                      ? 'bg-[#007AFF] text-white font-bold shadow-xs'
                      : day.isCurrentMonth
                      ? 'text-neutral-800'
                      : 'text-neutral-300'
                  }`}
                >
                  {day.dayNumber}
                </span>

                {/* Quick Add Button on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenNewEventModalForDate(day.dateKey);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-neutral-200 text-neutral-500 hover:text-black transition"
                  title="Add Event on this day"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Event Chips List */}
              <div className="flex-1 mt-1 space-y-1 overflow-y-auto max-h-[100px] no-scrollbar">
                {dayEvents.slice(0, 3).map((event) => {
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
                        backgroundColor: `${cat.color}18`,
                        borderLeftColor: isProtected && protConfig ? protConfig.color : cat.color,
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium border-l-2 truncate cursor-pointer hover:brightness-95 transition flex items-center gap-1 ${
                        isProtected && protConfig ? `${protConfig.borderLight}` : ''
                      } ${
                        event.completed ? 'opacity-50 line-through text-neutral-400' : 'text-neutral-900'
                      }`}
                      title={`${formatTime12h(event.time)} - ${event.title} ${isProtected ? '(Shielded)' : ''}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: isProtected && protConfig ? protConfig.color : cat.color }} />
                      <span className="font-mono font-semibold text-[9px] shrink-0 text-neutral-600">
                        {event.time}
                      </span>
                      {isProtected && protConfig && <span className="text-[9px]">{protConfig.icon}</span>}
                      <span className="truncate">{event.title}</span>
                    </div>
                  );
                })}

                {/* More events indicator */}
                {dayEvents.length > 3 && (
                  <span className="text-[9px] font-bold text-neutral-400 block px-1">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
