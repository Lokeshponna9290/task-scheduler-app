import React, { useState } from 'react';
import { ScheduleEvent, VoiceAccentId, ChimeType } from '../types';
import { VOICE_ACCENTS } from '../utils/audio';
import { Plus, Trash2, Check, Clock, Sparkles, MessageSquare, Bell, Heart, Briefcase, User, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleTimelineProps {
  events: ScheduleEvent[];
  onAddEvent: (event: Omit<ScheduleEvent, 'id'>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
}

export default function ScheduleTimeline({
  events,
  onAddEvent,
  onToggleComplete,
  onDeleteEvent,
}: ScheduleTimelineProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newDuration, setNewDuration] = useState(30);
  const [newCategory, setNewCategory] = useState<ScheduleEvent['category']>('work');
  const [newVoice, setNewVoice] = useState(true);
  const [newNotif, setNewNotif] = useState(true);
  const [newAccent, setNewAccent] = useState<VoiceAccentId>('en-IN');
  const [newChime, setNewChime] = useState<ChimeType>('chime');
  const [newNotes, setNewNotes] = useState('');

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const filteredEvents = activeCategoryFilter === 'all' 
    ? events 
    : events.filter(e => e.category === activeCategoryFilter);

  // Sort events by time
  const sortedEvents = [...filteredEvents].sort((a, b) => a.time.localeCompare(b.time));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddEvent({
      title: newTitle,
      time: newTime,
      duration: Number(newDuration),
      category: newCategory,
      completed: false,
      notes: newNotes || undefined,
      enableVoice: newVoice,
      enableNotification: newNotif,
      accent: newAccent,
      chime: newChime,
    });

    // Reset Form
    setNewTitle('');
    setNewNotes('');
    setShowAddForm(false);
  };

  const categories: { value: ScheduleEvent['category'] | 'all'; label: string; icon: any; color: string }[] = [
    { value: 'all', label: 'All Activities', icon: Sparkles, color: 'bg-indigo-500' },
    { value: 'work', label: 'Work & Tasks', icon: Briefcase, color: 'bg-blue-500' },
    { value: 'personal', label: 'Personal', icon: User, color: 'bg-purple-500' },
    { value: 'health', label: 'Health / Water', icon: Heart, color: 'bg-emerald-500' },
    { value: 'reminder', label: 'Reminders', icon: Bell, color: 'bg-rose-500' },
  ];

  const getCategoryColor = (cat: ScheduleEvent['category']) => {
    switch (cat) {
      case 'work': return 'border-l-blue-500 text-blue-700 bg-blue-50/40';
      case 'personal': return 'border-l-purple-500 text-purple-700 bg-purple-50/40';
      case 'health': return 'border-l-emerald-500 text-emerald-700 bg-emerald-50/40';
      case 'reminder': return 'border-l-rose-500 text-rose-700 bg-rose-50/40';
    }
  };

  return (
    <div id="schedule-timeline-container" className="space-y-6">
      {/* Category filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Day Schedule Timeline</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-full transition shadow-sm shadow-indigo-100"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Task</span>
        </button>
      </div>

      {/* Category Horizontal Filter Scroller */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategoryFilter === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategoryFilter(cat.value)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium border whitespace-nowrap transition ${
                isSelected
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Add Form Container */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-50 border border-slate-100 rounded-3xl p-5"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500">Activity Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Sync-up Meeting, Drink Water, Body Stretch"
                    className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>

                {/* Categories */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500">Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {categories.filter(c => c.value !== 'all').map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setNewCategory(cat.value as ScheduleEvent['category'])}
                        className={`py-1.5 text-xs font-medium rounded-lg border text-center transition capitalize ${
                          newCategory === cat.value
                            ? 'border-indigo-500 bg-indigo-50/30 text-indigo-700 font-semibold'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {cat.value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Start Time */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500">Alert Time</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500">Duration (mins)</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  >
                    <option value={10}>10 min</option>
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                {/* Alarm Ringtone */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500">Chime Sound</label>
                  <select
                    value={newChime}
                    onChange={(e) => setNewChime(e.target.value as ChimeType)}
                    className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 capitalize"
                  >
                    <option value="chime">Classic Chime</option>
                    <option value="digital">iOS Digital</option>
                    <option value="gong">Zen Gong</option>
                    <option value="alarm">Siren Alarm</option>
                    <option value="none">Mute</option>
                  </select>
                </div>

                {/* Voice Accent */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500">TTS Accent</label>
                  <select
                    value={newAccent}
                    onChange={(e) => setNewAccent(e.target.value as VoiceAccentId)}
                    className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  >
                    {Object.entries(VOICE_ACCENTS).map(([id, details]) => (
                      <option key={id} value={id}>
                        {details.flag} {details.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 bg-white p-3 rounded-xl border border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newVoice}
                    onChange={(e) => setNewVoice(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-xs font-medium text-slate-600">Voice TTS Alert</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newNotif}
                    onChange={(e) => setNewNotif(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-xs font-medium text-slate-600">Local Push Banner</span>
                </label>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">Alert Prompt / Message</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Additional message to read out loud (optional)"
                  className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm shadow-indigo-100"
                >
                  Save to Schedule
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sorted Events Timeline Display */}
      <div className="space-y-3 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-slate-100 p-6">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500">No scheduled activities</p>
            <p className="text-xs text-slate-400 mt-1">Change filters or click 'Schedule Task' to add your reminders.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {sortedEvents.map((event) => {
              const AccentInfo = VOICE_ACCENTS[event.accent];
              return (
                <motion.div
                  key={event.id}
                  id={`event-card-${event.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`flex gap-4 items-start relative pl-8 ${event.completed ? 'opacity-60' : ''}`}
                >
                  {/* Timeline point indicator */}
                  <div className={`absolute left-1.5 top-5 w-4.5 h-4.5 rounded-full border-4 border-white flex items-center justify-center shadow-sm transition-all duration-300 ${
                    event.completed ? 'bg-slate-400' : 'bg-indigo-600'
                  }`} />

                  {/* Card Container */}
                  <div className={`flex-1 p-4 rounded-2xl border border-slate-100 bg-white shadow-xs transition-all border-l-4 ${getCategoryColor(event.category)}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold font-mono text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded-md font-medium text-slate-500 uppercase">
                            {event.duration}m
                          </span>
                          {event.completed && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-semibold flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Done
                            </span>
                          )}
                        </div>
                        <h4 className={`font-semibold text-sm text-slate-800 ${event.completed ? 'line-through text-slate-400' : ''}`}>
                          {event.title}
                        </h4>
                        {event.notes && (
                          <p className="text-xs text-slate-500 italic mt-0.5">
                            "{event.notes}"
                          </p>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Complete Button */}
                        <button
                          onClick={() => onToggleComplete(event.id)}
                          className={`p-1.5 rounded-lg border transition ${
                            event.completed
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              : 'bg-white border-slate-100 hover:border-slate-200 text-slate-400 hover:text-slate-600'
                          }`}
                          title="Toggle Complete"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => onDeleteEvent(event.id)}
                          className="p-1.5 rounded-lg border border-slate-100 hover:border-rose-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Meta labels for Audio/Accent */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                      {event.enableVoice && (
                        <span className="flex items-center gap-1 bg-indigo-50/50 text-indigo-700 px-1.5 py-0.5 rounded">
                          <MessageSquare className="w-2.5 h-2.5" />
                          TTS Accent: {AccentInfo.flag} {AccentInfo.name.split(' ')[0]}
                        </span>
                      )}
                      {event.enableNotification && (
                        <span className="flex items-center gap-1 bg-emerald-50/50 text-emerald-700 px-1.5 py-0.5 rounded">
                          <Bell className="w-2.5 h-2.5" />
                          Push Active
                        </span>
                      )}
                      <span className="flex items-center gap-1 bg-amber-50/50 text-amber-700 px-1.5 py-0.5 rounded capitalize">
                        🔊 Sound: {event.chime}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-500 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>How alarms trigger:</strong> A timer continuously checks the current system local time. When the hour matches a schedule, the app plays your selected chime tone followed by the regional TTS voice alert speaking the activity details.
        </p>
      </div>
    </div>
  );
}
