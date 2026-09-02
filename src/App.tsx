import React, { useState, useEffect, useRef } from 'react';
import { ScheduleEvent, CalendarViewType, VoiceAccentId, ChimeType, ActiveAlarm } from './types';
import { VOICE_ACCENTS, speakText, playChime } from './utils/audio';
import { toDateKey, isToday, formatTime12h, getWeekDays } from './utils/dateUtils';
import { checkFocusConflict, calculateFocusScore } from './utils/focusShieldUtils';
import { GoogleUser, getStoredGoogleUser } from './utils/googleAuth';
import { 
  recoverLegacyEvents, 
  fetchEventsFromDatabase, 
  saveEventsToDatabase, 
  saveProfileToDatabase,
  getActiveUserId 
} from './utils/database';
import AppleCalendarHeader from './components/AppleCalendarHeader';
import AppleCalendarSidebar from './components/AppleCalendarSidebar';
import AppleDayView from './components/views/AppleDayView';
import AppleWeekView from './components/views/AppleWeekView';
import AppleMonthView from './components/views/AppleMonthView';
import AppleYearView from './components/views/AppleYearView';
import AppleEventModal from './components/AppleEventModal';
import AppleAlarmModal from './components/AppleAlarmModal';
import AppleAccountModal, { UserProfile } from './components/AppleAccountModal';
import GoogleSignInModal from './components/GoogleSignInModal';
import FocusShieldConflictModal from './components/FocusShieldConflictModal';
import MobileBottomNav from './components/MobileBottomNav';
import VoiceSettings from './components/VoiceSettings';
import AppLogo from './components/AppLogo';
import { 
  X, Check, Clock, Calendar as CalendarIcon, 
  Volume2, Settings2, User, ShieldCheck, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Fallback seed events if database is completely empty
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
      protectionLevel: 'health',
      completed: true,
      notes: 'Drink one full glass of lukewarm water and stretch',
      enableVoice: true,
      enableNotification: true,
      accent: 'en-IN',
      chime: 'chime'
    },
    {
      id: '2',
      title: 'Product & Design Deep Work',
      date: todayKey,
      time: '09:30',
      duration: 120, // 2 hours
      category: 'work',
      protectionLevel: 'deep-work',
      completed: false,
      notes: 'Review calendar redesign and sprint backlog priorities without interruptions',
      enableVoice: true,
      enableNotification: true,
      accent: 'en-US',
      chime: 'digital'
    },
    {
      id: '3',
      title: 'Post-Lunch Walk & Recovery',
      date: todayKey,
      time: '13:30',
      duration: 30,
      category: 'health',
      protectionLevel: 'health',
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
      protectionLevel: 'flexible',
      completed: false,
      notes: 'Review native iOS deployment and audio synthesis hooks',
      enableVoice: true,
      enableNotification: true,
      accent: 'en-TE',
      chime: 'chime'
    },
    {
      id: '5',
      title: 'Evening Workout & Cardio',
      date: todayKey,
      time: '18:30',
      duration: 45,
      category: 'personal',
      protectionLevel: 'health',
      completed: false,
      notes: 'Gym session and stretch',
      enableVoice: true,
      enableNotification: true,
      accent: 'en-TA',
      chime: 'alarm'
    },
    {
      id: '6',
      title: 'Quarterly Strategy Deep Work',
      date: monKey,
      time: '10:00',
      duration: 90,
      category: 'work',
      protectionLevel: 'deep-work',
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
      duration: 30,
      category: 'health',
      protectionLevel: 'health',
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
      protectionLevel: 'flexible',
      completed: false,
      notes: 'Reserve table at restaurant',
      enableVoice: true,
      enableNotification: true,
      accent: 'en-US',
      chime: 'chime'
    }
  ];
};

const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Lokesh Reddy',
  email: 'lokeshreddyponna@gmail.com',
  avatarColor: 'linear-gradient(135deg, #0077FE 0%, #0051D4 100%)',
  membership: 'Google Cloud Pro',
  syncStatus: 'synced',
  lastSyncedAt: 'Just now',
  isGoogleConnected: true,
};

export default function App() {
  // Calendar Events state with legacy data recovery
  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    const legacy = recoverLegacyEvents();
    if (legacy && legacy.length > 0) {
      return legacy;
    }
    return getInitialEvents();
  });

  // User Profile Account state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const savedGoogleUser = getStoredGoogleUser();
      const saved = localStorage.getItem('scheduler_user_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (savedGoogleUser) {
            return {
              ...parsed,
              name: savedGoogleUser.name || parsed.name,
              email: savedGoogleUser.email || parsed.email,
              isGoogleConnected: true,
            };
          }
          return parsed;
        } catch (e) {
          console.error("Failed to parse user profile", e);
        }
      }
    }
    return DEFAULT_USER_PROFILE;
  });

  // Account modal state & Google Sign-In modal state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isGoogleSignInOpen, setIsGoogleSignInOpen] = useState(false);

  // Focus Shield Conflict Interception State
  const [conflictModalData, setConflictModalData] = useState<{
    candidate: Omit<ScheduleEvent, 'id'> & { id?: string };
    existingId?: string;
    conflictingEvents: ScheduleEvent[];
    suggestedSlot?: string;
    suggestedEndTime?: string;
  } | null>(null);

  // Calendar Navigation & Views
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>('day');
  
  // Responsive sidebar state (open on desktop, closed on mobile by default)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  const [selectedCategories, setSelectedCategories] = useState<Set<ScheduleEvent['category']>>(
    new Set(['work', 'personal', 'health', 'reminder'])
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Preferences modal
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

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

  // Listen to window resize for responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  // Immediate Initial Connection to Persistent Cloud Database on Mount
  useEffect(() => {
    let isMounted = true;
    fetchEventsFromDatabase().then(({ events: fetchedEvents }) => {
      if (isMounted && fetchedEvents && fetchedEvents.length > 0) {
        setEvents(fetchedEvents);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to cloud database & localStorage whenever events change
  useEffect(() => {
    saveEventsToDatabase(events);
  }, [events]);

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const newProf = { ...userProfile, ...updated };
    setUserProfile(newProf);
    saveProfileToDatabase(newProf);
  };

  // Google Sign-In Success Handler
  const handleGoogleAuthSuccess = async (googleUser: GoogleUser) => {
    const updatedProf: UserProfile = {
      ...userProfile,
      name: googleUser.name,
      email: googleUser.email,
      isGoogleConnected: true,
      membership: 'Google Cloud Pro',
      syncStatus: 'synced',
      lastSyncedAt: 'Just now',
    };
    setUserProfile(updatedProf);
    saveProfileToDatabase(updatedProf, googleUser.email);

    // Fetch user cloud events for this Google account
    const { events: cloudEvents } = await fetchEventsFromDatabase(googleUser.email);
    if (cloudEvents && cloudEvents.length > 0) {
      setEvents(cloudEvents);
    } else {
      // Sync current events into this new Google cloud profile
      saveEventsToDatabase(events, googleUser.email);
    }

    setSimulatedNotification({
      title: 'Google Cloud Connected',
      message: `Signed in as ${googleUser.email}. All schedules are backed up and synced across all your devices.`,
    });
    setTimeout(() => setSimulatedNotification(null), 5500);
  };

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

  // Handlers for Event actions with Focus Shield conflict interception and Immediate DB Sync
  const handleSaveEvent = (
    eventData: Omit<ScheduleEvent, 'id'>, 
    existingId?: string, 
    forceOverride: boolean = false
  ) => {
    // Check for focus conflicts if not forced
    if (!forceOverride) {
      const conflictResult = checkFocusConflict({ ...eventData, id: existingId }, events);
      if (conflictResult.hasConflict) {
        setConflictModalData({
          candidate: { ...eventData, id: existingId },
          existingId,
          conflictingEvents: conflictResult.conflictingEvents,
          suggestedSlot: conflictResult.suggestedSlot,
          suggestedEndTime: conflictResult.suggestedEndTime,
        });
        return;
      }
    }

    let nextEvents: ScheduleEvent[];
    if (existingId) {
      nextEvents = events.map(e => e.id === existingId ? { ...eventData, id: existingId } : e);
    } else {
      const newEvent: ScheduleEvent = {
        ...eventData,
        id: Date.now().toString(),
      };
      nextEvents = [...events, newEvent];
    }

    setEvents(nextEvents);
    saveEventsToDatabase(nextEvents);
  };

  // Reschedule to suggested conflict-free slot
  const handleAutoRescheduleConflict = (newTime: string) => {
    if (!conflictModalData) return;
    const candidate = { ...conflictModalData.candidate, time: newTime };
    const id = conflictModalData.existingId;
    setConflictModalData(null);
    handleSaveEvent(candidate, id, true);

    setSimulatedNotification({
      title: 'Shield Protection Active',
      message: `Event rescheduled to conflict-free window at ${formatTime12h(newTime)}.`,
    });
    setTimeout(() => setSimulatedNotification(null), 4500);
  };

  // Override focus conflict
  const handleOverrideConflict = () => {
    if (!conflictModalData) return;
    const candidate = conflictModalData.candidate;
    const id = conflictModalData.existingId;
    setConflictModalData(null);
    handleSaveEvent(candidate, id, true);
  };

  const handleToggleComplete = (id: string) => {
    const updated = events.map(e => e.id === id ? { ...e, completed: !e.completed } : e);
    setEvents(updated);
    saveEventsToDatabase(updated);
    playChime('digital');
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    saveEventsToDatabase(updated);
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

    const updated = events.map(e => {
      if (e.id === activeAlarm.eventId) {
        return { ...e, time: snoozedTimeStr };
      }
      return e;
    });

    setEvents(updated);
    saveEventsToDatabase(updated);

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

  const handleNavigateHome = () => {
    setCurrentDate(new Date());
    setViewType('day');
    setSearchQuery('');
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

  const focusMetrics = calculateFocusScore(events, currentDate);

  return (
    <div className="h-[100dvh] sm:min-h-screen bg-[#ECECF0] flex flex-col justify-center items-center p-0 sm:p-3 md:p-6 select-none font-sans text-neutral-900 overflow-hidden">
      
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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Scheduler Alert</span>
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

      {/* Main Container: Native iOS edge-to-edge on mobile, macOS window on desktop */}
      <div className="w-full max-w-[1440px] h-full sm:h-[92vh] sm:max-h-[920px] bg-white sm:rounded-2xl border-0 sm:border sm:border-black/10 shadow-none sm:shadow-apple-card flex flex-col overflow-hidden relative">
        
        {/* Apple Calendar Header Toolbar */}
        <AppleCalendarHeader
          currentDate={currentDate}
          viewType={viewType}
          onViewTypeChange={setViewType}
          onNavigatePrev={handleNavigatePrev}
          onNavigateNext={handleNavigateNext}
          onNavigateToday={handleNavigateToday}
          onNavigateHome={handleNavigateHome}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNewEventModal={() => handleOpenNewEvent()}
          onOpenPreferences={() => setIsPreferencesOpen(true)}
          userProfile={userProfile}
          onOpenAccount={() => setIsAccountModalOpen(true)}
        />

        {/* Main Content Workspace */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Desktop Fixed Sidebar */}
          <div className="hidden md:flex shrink-0">
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
                userProfile={userProfile}
              />
            )}
          </div>

          {/* Mobile Sliding Drawer Sidebar with Backdrop */}
          <AnimatePresence>
            {isSidebarOpen && (
              <div className="md:hidden fixed inset-0 z-50 flex">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                />

                {/* Sliding Drawer Container */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                  className="relative z-10 w-72 h-full bg-[#F6F6F8] shadow-2xl flex flex-col overflow-hidden"
                >
                  <div className="p-3 border-b border-black/[0.08] flex items-center justify-between bg-white/80">
                    <span className="text-xs font-bold text-neutral-900">Calendars & Focus Shield</span>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <AppleCalendarSidebar
                      currentDate={currentDate}
                      onSelectDate={(d) => {
                        setCurrentDate(d);
                        setIsSidebarOpen(false);
                      }}
                      events={events}
                      selectedCategories={selectedCategories}
                      onToggleCategory={handleToggleCategory}
                      onOpenNewEventModal={() => {
                        setIsSidebarOpen(false);
                        handleOpenNewEvent();
                      }}
                      onSelectEvent={(e) => {
                        setIsSidebarOpen(false);
                        handleEditEvent(e);
                      }}
                      activeAccent={currentAccent}
                      onChangeAccent={setCurrentAccent}
                      activeChime={currentChime}
                      onChangeChime={setCurrentChime}
                      userProfile={userProfile}
                    />
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Core Calendar Views */}
          <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
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
          </main>

        </div>

        {/* Native iOS Bottom Navigation Bar for Mobile */}
        <MobileBottomNav
          viewType={viewType}
          onViewTypeChange={setViewType}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          focusScorePercent={focusMetrics.focusScorePercent}
        />

      </div>

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

      {/* Focus Shield Conflict Warning Interception Modal */}
      <FocusShieldConflictModal
        isOpen={!!conflictModalData}
        onClose={() => setConflictModalData(null)}
        candidateEvent={conflictModalData ? conflictModalData.candidate : null}
        conflictingEvents={conflictModalData ? conflictModalData.conflictingEvents : []}
        suggestedSlot={conflictModalData?.suggestedSlot}
        suggestedEndTime={conflictModalData?.suggestedEndTime}
        onAutoReschedule={handleAutoRescheduleConflict}
        onOverride={handleOverrideConflict}
      />

      {/* Apple User Account Details Modal */}
      <AppleAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        eventsCount={events.length}
        events={events}
        onOpenGoogleSignIn={() => {
          setIsAccountModalOpen(false);
          setIsGoogleSignInOpen(true);
        }}
      />

      {/* Google Sign-In & Multi-Device Sync Modal */}
      <GoogleSignInModal
        isOpen={isGoogleSignInOpen}
        onClose={() => setIsGoogleSignInOpen(false)}
        onSuccess={handleGoogleAuthSuccess}
        currentEmail={userProfile.email}
      />

      {/* Apple Preferences / Audio Studio Modal */}
      <AnimatePresence>
        {isPreferencesOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-white rounded-2xl border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="px-5 py-3.5 border-b border-black/[0.08] flex items-center justify-between bg-[#F6F6F8]">
                <h3 className="text-sm font-bold text-neutral-900">
                  Voice & Audio Preferences
                </h3>
                <button
                  onClick={() => setIsPreferencesOpen(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
