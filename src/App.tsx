import React, { useState, useEffect, useRef } from 'react';
import { ScheduleEvent, CalendarViewType, VoiceAccentId, ChimeType, ActiveAlarm, CATEGORY_CONFIGS } from './types';
import { VOICE_ACCENTS, speakText, playChime } from './utils/audio';
import { toDateKey, isToday, formatTime12h, getWeekDays } from './utils/dateUtils';
import AppleCalendarHeader from './components/AppleCalendarHeader';
import AppleCalendarSidebar from './components/AppleCalendarSidebar';
import AppleDayView from './components/views/AppleDayView';
import AppleWeekView from './components/views/AppleWeekView';
import AppleMonthView from './components/views/AppleMonthView';
import AppleYearView from './components/views/AppleYearView';
import AppleEventModal from './components/AppleEventModal';
import AppleAlarmModal from './components/AppleAlarmModal';
import VoiceSettings from './components/VoiceSettings';
import DeploymentGuide from './components/DeploymentGuide';
import AppLogo from './components/AppLogo';
import { 
  Bell, X, Smartphone, Check, Clock, Calendar as CalendarIcon, 
  Volume2, Sparkles, Wifi, Battery, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pre-populate with realistic events distributed across today and this week
const getInitialEvents = (): ScheduleEvent[] => {
  const today = new Date();
  const todayKey = toDateKey(today);

  // Get other days in the current week
  const weekDays = getWeekDays(today);
  const monKey = toDateKey(weekDays[1]);
  const wedKey = toDateKey(weekDays[3]);
  const friKey = toDateKey(weekDays[5]);

  return [
    {
      id: '1',
      title: 'Morning Yoga & Hydrate',
      date: todayKey,
      time: '08:00',
      duration: 30,
      category: 'health',
      completed: false,
      notes: 'Drink one full glass of lukewarm water and stretch',
      enableVoice: true,
      enableNotification: true,
      accent: 'en-IN',
      chime: 'chime'
    },
    {
      id: '2',
      title: 'Product & Design Standup',
      date: todayKey,
      time: '09:30',
      duration: 45,
      category: 'work',
      completed: false,
      notes: 'Review calendar redesign and sprint backlog priorities',
      enableVoice: true,
      enableNotification: true,
      accent: 'en-US',
      chime: 'digital'
    },
    {
      id: '3',
      title: 'Post-Lunch Walk & Relax',
      date: todayKey,
      time: '13:30',
      duration: 20,
      category: 'health',
      completed: false,
      notes: 'Take a brief walk outside for fresh air',
      enableVoice: true,
      enableNotification: true,
      accent: 'en-KA',
      chime: 'gong'
    },
    {
      id: '4',
      title: 'Team Architecture Sync',
      date: todayKey,
      time: '15:00',
      duration: 60,
      category: 'work',
      completed: false,
      notes: 'Review native iOS deployment and audio synthesis hooks',
      enableVoice: true,
      enableNotification: true,
      accent: 'en-TE',
      chime: 'chime'
    },
    {
      id: '5',
      title: 'Grocery & Evening Workout',
      date: todayKey,
      time: '18:30',
      duration: 45,
      category: 'personal',
      completed: false,
      notes: 'Gym session and pick up organic fruits',
      enableVoice: true,
      enableNotification: true,
      accent: 'en-TA',
      chime: 'alarm'
    },
    {
      id: '6',
      title: 'Weekly Strategy Planning',
      date: monKey,
      time: '10:00',
      duration: 60,
      category: 'work',
      completed: false,
      notes: 'Quarterly roadmap alignment',
      enableVoice: true,
      enableNotification: true,
      accent: 'en-US',
      chime: 'chime'
    },
    {
      id: '7',
      title: 'Meditation & Breathwork',
      date: wedKey,
      time: '07:30',
      duration: 25,
      category: 'health',
      completed: false,
      notes: 'Mindfulness breathing practice',
      enableVoice: true,
      enableNotification: true,
      accent: 'en-IN',
      chime: 'gong'
    },
    {
      id: '8',
      title: 'Family Dinner & Social',
      date: friKey,
      time: '19:30',
      duration: 90,
      category: 'personal',
      completed: false,
      notes: 'Reserve table at restaurant',
      enableVoice: true,
      enableNotification: true,
      accent: 'en-US',
      chime: 'chime'
    }
  ];
};

export default function App() {
  // Calendar Events state
  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apple_calendar_events_v2');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse stored events", e);
        }
      }
    }
    return getInitialEvents();
  });

  // Calendar Navigation & Views
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>('day');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<Set<ScheduleEvent['category']>>(
    new Set(['work', 'personal', 'health', 'reminder'])
  );
  const [searchQuery, setSearchQuery] = useState('');

  // App Level Tabs & Modes
  const [activeTab, setActiveTab] = useState<'calendar' | 'voice' | 'guide'>('calendar');
  const [frameMode, setFrameMode] = useState<'desktop' | 'mobile'>('desktop');

  // Active Voice & Chime defaults
  const [currentAccent, setCurrentAccent] = useState<VoiceAccentId>('en-IN');
  const [currentChime, setCurrentChime] = useState<ChimeType>('chime');

  // Event Modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<ScheduleEvent | null>(null);
  const [modalPresetDate, setModalPresetDate] = useState<string | undefined>(undefined);
  const [modalPresetTime, setModalPresetTime] = useState<string | undefined>(undefined);

  // Alarms & Notifications
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(null);
  const [simulatedNotification, setSimulatedNotification] = useState<{ title: string; message: string } | null>(null);
  const triggeredMinutes = useRef<Set<string>>(new Set());

  // Local storage persistence
  useEffect(() => {
    localStorage.setItem('apple_calendar_events_v2', JSON.stringify(events));
  }, [events]);

  // Live Timer and Alarm Trigger
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${mins}`;
      const todayDateKey = toDateKey(now);
      const secondNum = now.getSeconds();

      // Check during the first 10 seconds of each minute
      if (secondNum < 10) {
        events.forEach(event => {
          const eventDate = event.date || todayDateKey;
          const triggerKey = `${event.id}-${eventDate}-${timeStr}`;

          if (eventDate === todayDateKey && event.time === timeStr && !triggeredMinutes.current.has(triggerKey)) {
            triggeredMinutes.current.add(triggerKey);
            triggerAlarm(event);
          }
        });
      }

      // Cleanup memory at midnight
      if (timeStr === '00:00' && triggeredMinutes.current.size > 0) {
        triggeredMinutes.current.clear();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [events]);

  const triggerAlarm = (event: ScheduleEvent) => {
    setActiveAlarm({
      eventId: event.id,
      title: event.title,
      time: event.time,
      accent: event.accent,
      chime: event.chime,
      date: event.date,
    });

    // Play Chime sound
    if (event.chime !== 'none') {
      playChime(event.chime);
    }

    // Speak Accent Voice Alert
    if (event.enableVoice) {
      const speechText = event.notes 
        ? `Alert! Time for ${event.title}. Note: ${event.notes}`
        : `Alert! It is ${formatTime12h(event.time)}. Time to start ${event.title}`;
      
      setTimeout(() => {
        speakText(speechText, event.accent);
      }, 800);
    }

    // Slide down iOS / macOS push notification
    if (event.enableNotification) {
      setSimulatedNotification({
        title: `Calendar Alert • ${formatTime12h(event.time)}`,
        message: event.title,
      });

      setTimeout(() => {
        setSimulatedNotification(null);
      }, 7000);
    }
  };

  // Handlers for Event actions
  const handleSaveEvent = (eventData: Omit<ScheduleEvent, 'id'>, existingId?: string) => {
    if (existingId) {
      setEvents(prev => prev.map(e => e.id === existingId ? { ...eventData, id: existingId } : e));
    } else {
      const newEvent: ScheduleEvent = {
        ...eventData,
        id: Date.now().toString(),
      };
      setEvents(prev => [...prev, newEvent]);
    }
  };

  const handleToggleComplete = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, completed: !e.completed } : e));
    playChime('digital');
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // Alarm actions
  const handleSnoozeAlarm = () => {
    if (!activeAlarm) return;
    
    // Add 5 mins snooze
    const [h, m] = activeAlarm.time.split(':').map(Number);
    let newM = m + 5;
    let newH = h;
    if (newM >= 60) {
      newM = newM % 60;
      newH = (newH + 1) % 24;
    }
    const snoozedTimeStr = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;

    setEvents(prev => prev.map(e => {
      if (e.id === activeAlarm.eventId) {
        return { ...e, time: snoozedTimeStr };
      }
      return e;
    }));

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setActiveAlarm(null);

    setSimulatedNotification({
      title: 'Alert Snoozed',
      message: `Alarm rescheduled to trigger in 5 minutes at ${formatTime12h(snoozedTimeStr)}.`
    });
    setTimeout(() => setSimulatedNotification(null), 4000);
  };

  const handleDismissAlarm = () => {
    if (!activeAlarm) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    handleToggleComplete(activeAlarm.eventId);
    setActiveAlarm(null);
  };

  // Navigation handlers
  const handleNavigateToday = () => {
    setCurrentDate(new Date());
  };

  const handleNavigatePrev = () => {
    const d = new Date(currentDate);
    if (viewType === 'day') {
      d.setDate(d.getDate() - 1);
    } else if (viewType === 'week') {
      d.setDate(d.getDate() - 7);
    } else if (viewType === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewType === 'year') {
      d.setFullYear(d.getFullYear() - 1);
    }
    setCurrentDate(d);
  };

  const handleNavigateNext = () => {
    const d = new Date(currentDate);
    if (viewType === 'day') {
      d.setDate(d.getDate() + 1);
    } else if (viewType === 'week') {
      d.setDate(d.getDate() + 7);
    } else if (viewType === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewType === 'year') {
      d.setFullYear(d.getFullYear() + 1);
    }
    setCurrentDate(d);
  };

  // Category toggle in sidebar
  const handleToggleCategory = (category: ScheduleEvent['category']) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        if (next.size > 1) next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Filter events by search query
  const filteredEvents = React.useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(e => 
      e.title.toLowerCase().includes(q) || 
      (e.notes && e.notes.toLowerCase().includes(q)) ||
      e.category.toLowerCase().includes(q)
    );
  }, [events, searchQuery]);

  // Quick Add helpers
  const handleOpenNewEvent = (dateKey?: string, timeStr?: string) => {
    setEventToEdit(null);
    setModalPresetDate(dateKey || toDateKey(currentDate));
    setModalPresetTime(timeStr || '09:00');
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEventToEdit(event);
    setIsEventModalOpen(true);
  };

  // Clock display strings
  const formattedHours = String(currentTime.getHours()).padStart(2, '0');
  const formattedMins = String(currentTime.getMinutes()).padStart(2, '0');
  const clockString = `${formattedHours}:${formattedMins}`;

  return (
    <div className="min-h-screen bg-[#ECECF0] flex flex-col justify-center items-center p-0 sm:p-4 md:p-6 select-none font-sans text-neutral-900">
      
      {/* iOS / macOS Push Notification Slide-Down Toast */}
      <AnimatePresence>
        {simulatedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -70, scale: 0.95 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-2 left-1/2 -translate-x-1/2 z-[120] w-11/12 max-w-sm"
          >
            <div className="bg-neutral-900/90 backdrop-blur-xl border border-white/20 text-white p-3.5 rounded-2xl shadow-2xl flex gap-3 items-start">
              <AppLogo size={32} />
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Scheduly Alert</span>
                  <span className="text-[10px] text-neutral-400">now</span>
                </div>
                <h5 className="text-xs font-bold text-white truncate">{simulatedNotification.title}</h5>
                <p className="text-xs text-neutral-300 leading-snug">{simulatedNotification.message}</p>
              </div>
              <button 
                onClick={() => setSimulatedNotification(null)}
                className="text-neutral-400 hover:text-white transition p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apple Active Alarm Fullscreen / Sheet Modal */}
      <AnimatePresence>
        {activeAlarm && (
          <AppleAlarmModal
            activeAlarm={activeAlarm}
            currentTimeString={clockString}
            onSnooze={handleSnoozeAlarm}
            onDismiss={handleDismissAlarm}
          />
        )}
      </AnimatePresence>

      {/* Main Container: macOS App Window or iPhone Simulator Frame */}
      {frameMode === 'desktop' ? (
        
        /* --- macOS Window Frame --- */
        <div className="w-full max-w-[1440px] h-[92vh] max-h-[920px] bg-white rounded-2xl border border-black/10 shadow-apple-card flex flex-col overflow-hidden relative">
          
          {/* macOS Apple Calendar Header Toolbar */}
          <AppleCalendarHeader
            currentDate={currentDate}
            viewType={viewType}
            onViewTypeChange={setViewType}
            onNavigatePrev={handleNavigatePrev}
            onNavigateNext={handleNavigateNext}
            onNavigateToday={handleNavigateToday}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenNewEventModal={() => handleOpenNewEvent()}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            frameMode={frameMode}
            onFrameModeChange={setFrameMode}
          />

          {/* Main Content Workspace */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Collapsible Apple Sidebar */}
            {isSidebarOpen && (
              <AppleCalendarSidebar
                currentDate={currentDate}
                onSelectDate={setCurrentDate}
                events={events}
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                onOpenNewEventModal={() => handleOpenNewEvent()}
                onSelectEvent={handleEditEvent}
                activeAccent={currentAccent}
                onChangeAccent={setCurrentAccent}
                activeChime={currentChime}
                onChangeChime={setCurrentChime}
              />
            )}

            {/* Views Router */}
            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
              {activeTab === 'calendar' && (
                <>
                  {viewType === 'day' && (
                    <AppleDayView
                      currentDate={currentDate}
                      events={filteredEvents}
                      selectedCategories={selectedCategories}
                      onSelectEvent={handleEditEvent}
                      onToggleComplete={handleToggleComplete}
                      onDeleteEvent={handleDeleteEvent}
                      onQuickAddAtTime={(timeStr) => handleOpenNewEvent(toDateKey(currentDate), timeStr)}
                      activeAccent={currentAccent}
                    />
                  )}

                  {viewType === 'week' && (
                    <AppleWeekView
                      currentDate={currentDate}
                      events={filteredEvents}
                      selectedCategories={selectedCategories}
                      onSelectDate={setCurrentDate}
                      onSelectEvent={handleEditEvent}
                      onToggleComplete={handleToggleComplete}
                      onDeleteEvent={handleDeleteEvent}
                      onQuickAddAtDateAndTime={(dateKey, timeStr) => handleOpenNewEvent(dateKey, timeStr)}
                    />
                  )}

                  {viewType === 'month' && (
                    <AppleMonthView
                      currentDate={currentDate}
                      events={filteredEvents}
                      selectedCategories={selectedCategories}
                      onSelectDate={setCurrentDate}
                      onSelectEvent={handleEditEvent}
                      onOpenNewEventModalForDate={(dateKey) => handleOpenNewEvent(dateKey)}
                      onDoubleSelectDate={(d) => {
                        setCurrentDate(d);
                        setViewType('day');
                      }}
                    />
                  )}

                  {viewType === 'year' && (
                    <AppleYearView
                      currentDate={currentDate}
                      events={filteredEvents}
                      selectedCategories={selectedCategories}
                      onSelectDateAndSwitchToDay={(d) => {
                        setCurrentDate(d);
                        setViewType('month');
                      }}
                    />
                  )}
                </>
              )}

              {activeTab === 'voice' && (
                <div className="flex-1 p-6 overflow-y-auto bg-[#F6F6F8]/50">
                  <div className="max-w-4xl mx-auto">
                    <VoiceSettings
                      currentAccent={currentAccent}
                      setCurrentAccent={setCurrentAccent}
                      currentChime={currentChime}
                      setCurrentChime={setCurrentChime}
                      onShowSimulatedNotification={(title, message) => {
                        setSimulatedNotification({ title, message });
                        setTimeout(() => setSimulatedNotification(null), 5000);
                      }}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'guide' && (
                <div className="flex-1 p-6 overflow-y-auto bg-[#F6F6F8]/50">
                  <div className="max-w-4xl mx-auto">
                    <DeploymentGuide />
                  </div>
                </div>
              )}
            </main>

          </div>
        </div>

      ) : (

        /* --- iPhone 16 Pro Simulator Frame --- */
        <div className="w-[390px] h-[844px] bg-black rounded-[52px] p-3.5 shadow-2xl border-[4px] border-neutral-700 relative overflow-hidden flex flex-col">
          
          {/* iPhone Glass Screen */}
          <div className="w-full h-full bg-white rounded-[44px] overflow-hidden flex flex-col relative">
            
            {/* iOS Dynamic Island & Status Bar */}
            <div className="h-11 bg-white flex items-center justify-between px-7 shrink-0 select-none z-40 relative">
              <span className="text-xs font-bold font-sans text-neutral-900">{clockString}</span>
              
              {/* Dynamic Island Pill */}
              <div className="w-24 h-6 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-2 flex items-center justify-between px-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
                <div className="w-2 h-2 rounded-full bg-blue-900/40" />
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5 text-neutral-900">
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* Mobile Header Bar */}
            <div className="px-4 py-2 bg-[#F6F6F8] border-b border-black/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AppLogo size={28} />
                <div>
                  <span className="text-[10px] font-bold text-[#FF3B30] uppercase tracking-wider block">
                    {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <h3 className="text-sm font-bold text-neutral-900 leading-tight">
                    {currentDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenNewEvent()}
                  className="w-7 h-7 rounded-full bg-[#FF3B30] text-white flex items-center justify-center shadow-xs"
                >
                  <span className="text-base font-bold leading-none">+</span>
                </button>
                <button
                  onClick={() => setFrameMode('desktop')}
                  className="px-2 py-1 rounded bg-neutral-200 text-[10px] font-semibold text-neutral-700"
                >
                  Exit Frame
                </button>
              </div>
            </div>

            {/* Mobile Segmented View Control */}
            <div className="px-4 py-1.5 bg-[#F6F6F8] border-b border-black/[0.06] flex gap-1">
              {(['day', 'week', 'month'] as CalendarViewType[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewType(v)}
                  className={`flex-1 py-1 rounded-md text-xs font-semibold capitalize transition ${
                    viewType === v ? 'bg-white text-black shadow-xs' : 'text-neutral-500'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Mobile Calendar Body */}
            <div className="flex-1 overflow-y-auto bg-white">
              {viewType === 'day' && (
                <AppleDayView
                  currentDate={currentDate}
                  events={filteredEvents}
                  selectedCategories={selectedCategories}
                  onSelectEvent={handleEditEvent}
                  onToggleComplete={handleToggleComplete}
                  onDeleteEvent={handleDeleteEvent}
                  onQuickAddAtTime={(timeStr) => handleOpenNewEvent(toDateKey(currentDate), timeStr)}
                  activeAccent={currentAccent}
                />
              )}
              {viewType === 'week' && (
                <AppleWeekView
                  currentDate={currentDate}
                  events={filteredEvents}
                  selectedCategories={selectedCategories}
                  onSelectDate={setCurrentDate}
                  onSelectEvent={handleEditEvent}
                  onToggleComplete={handleToggleComplete}
                  onDeleteEvent={handleDeleteEvent}
                  onQuickAddAtDateAndTime={(dateKey, timeStr) => handleOpenNewEvent(dateKey, timeStr)}
                />
              )}
              {viewType === 'month' && (
                <AppleMonthView
                  currentDate={currentDate}
                  events={filteredEvents}
                  selectedCategories={selectedCategories}
                  onSelectDate={setCurrentDate}
                  onSelectEvent={handleEditEvent}
                  onOpenNewEventModalForDate={(dateKey) => handleOpenNewEvent(dateKey)}
                  onDoubleSelectDate={(d) => {
                    setCurrentDate(d);
                    setViewType('day');
                  }}
                />
              )}
            </div>

            {/* iOS Bottom Navigation Bar */}
            <div className="h-16 bg-[#F6F6F8] border-t border-black/[0.08] px-6 flex items-center justify-around shrink-0">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
                  activeTab === 'calendar' ? 'text-[#FF3B30]' : 'text-neutral-400'
                }`}
              >
                <CalendarIcon className="w-5 h-5" />
                <span>Today</span>
              </button>

              <button
                onClick={() => setActiveTab('voice')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
                  activeTab === 'voice' ? 'text-[#FF3B30]' : 'text-neutral-400'
                }`}
              >
                <Volume2 className="w-5 h-5" />
                <span>Voice</span>
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
                  activeTab === 'guide' ? 'text-[#FF3B30]' : 'text-neutral-400'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>iOS</span>
              </button>
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="h-4 bg-[#F6F6F8] flex items-center justify-center shrink-0">
              <div className="w-32 h-1 bg-black rounded-full" />
            </div>

          </div>
        </div>

      )}

      {/* Apple Event Create / Edit Inspector Modal */}
      <AppleEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        eventToEdit={eventToEdit}
        defaultDate={modalPresetDate}
        defaultTime={modalPresetTime}
        onSaveEvent={handleSaveEvent}
        onDeleteEvent={handleDeleteEvent}
      />

    </div>
  );
}
