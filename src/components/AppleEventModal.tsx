import React, { useState, useEffect } from 'react';
import { ScheduleEvent, CATEGORY_CONFIGS, VoiceAccentId, ChimeType } from '../types';
import { VOICE_ACCENTS, speakText, playChime } from '../utils/audio';
import { toDateKey, formatTime12h } from '../utils/dateUtils';
import { 
  X, Trash2, Volume2, Bell, Sparkles, 
  Calendar, Clock, Check, Play, AlignLeft, Tag 
} from 'lucide-react';
import { motion } from 'motion/react';

interface AppleEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: ScheduleEvent | null;
  defaultDate?: string;
  defaultTime?: string;
  onSaveEvent: (event: Omit<ScheduleEvent, 'id'>, existingId?: string) => void;
  onDeleteEvent?: (id: string) => void;
}

export default function AppleEventModal({
  isOpen,
  onClose,
  eventToEdit,
  defaultDate,
  defaultTime,
  onSaveEvent,
  onDeleteEvent,
}: AppleEventModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState<ScheduleEvent['category']>('work');
  const [enableVoice, setEnableVoice] = useState(true);
  const [enableNotification, setEnableNotification] = useState(true);
  const [accent, setAccent] = useState<VoiceAccentId>('en-IN');
  const [chime, setChime] = useState<ChimeType>('chime');
  const [notes, setNotes] = useState('');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDate(eventToEdit.date || defaultDate || toDateKey(new Date()));
      setTime(eventToEdit.time);
      setDuration(eventToEdit.duration);
      setCategory(eventToEdit.category);
      setEnableVoice(eventToEdit.enableVoice);
      setEnableNotification(eventToEdit.enableNotification);
      setAccent(eventToEdit.accent);
      setChime(eventToEdit.chime);
      setNotes(eventToEdit.notes || '');
    } else {
      // Default new event values
      setTitle('');
      setDate(defaultDate || toDateKey(new Date()));
      setTime(defaultTime || '09:00');
      setDuration(30);
      setCategory('work');
      setEnableVoice(true);
      setEnableNotification(true);
      setAccent('en-IN');
      setChime('chime');
      setNotes('');
    }
  }, [eventToEdit, defaultDate, defaultTime, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveEvent({
      title: title.trim(),
      date,
      time,
      duration: Number(duration),
      category,
      completed: eventToEdit ? eventToEdit.completed : false,
      notes: notes.trim() || undefined,
      enableVoice,
      enableNotification,
      accent,
      chime,
    }, eventToEdit?.id);

    onClose();
  };

  const handleTestPreview = () => {
    if (isPlayingPreview) return;
    setIsPlayingPreview(true);
    playChime(chime);
    setTimeout(() => {
      const speech = notes 
        ? `${title || 'Sample Event'}. Note: ${notes}`
        : `${title || 'Sample Event'} at ${formatTime12h(time)}`;
      speakText(speech, accent, () => {
        setIsPlayingPreview(false);
      });
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-2xl border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-black/[0.08] flex items-center justify-between bg-[#F6F6F8]/80">
          <h3 className="text-sm font-bold text-neutral-900 font-sans">
            {eventToEdit ? 'Edit Event' : 'New Event'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          
          {/* Title Input */}
          <div>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full text-base font-semibold text-neutral-900 placeholder:text-neutral-400 bg-transparent border-b border-neutral-200 pb-2 focus:outline-none focus:border-[#007AFF] transition"
            />
          </div>

          {/* Category Selector (Apple Colored Tags) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Calendar Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(CATEGORY_CONFIGS) as ScheduleEvent['category'][]).map((catKey) => {
                const cat = CATEGORY_CONFIGS[catKey];
                const isSelected = category === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    style={{
                      borderColor: isSelected ? cat.color : '#E5E5EA',
                      backgroundColor: isSelected ? `${cat.color}15` : '#FFFFFF',
                    }}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className={isSelected ? 'font-bold text-neutral-900' : 'text-neutral-600'}>
                      {cat.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date, Time & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Date */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-neutral-400" />
                <span>Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-medium text-neutral-800 bg-neutral-100/80 border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#007AFF]"
              />
            </div>

            {/* Time */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                <span>Start Time</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs font-medium text-neutral-800 bg-neutral-100/80 border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#007AFF]"
              />
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-500">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full text-xs font-medium text-neutral-800 bg-neutral-100/80 border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#007AFF]"
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          {/* Voice Accent & Speech Settings */}
          <div className="bg-neutral-50/80 rounded-xl p-3 border border-neutral-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Voice Speech Synthesis</span>
              </span>

              {/* Apple iOS Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableVoice}
                  onChange={(e) => setEnableVoice(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#34C759]"></div>
              </label>
            </div>

            {enableVoice && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Voice Accent dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-500">Accent Engine</label>
                  <select
                    value={accent}
                    onChange={(e) => setAccent(e.target.value as VoiceAccentId)}
                    className="w-full text-xs bg-white border border-neutral-200 rounded-lg px-2 py-1.5 font-medium"
                  >
                    {(Object.keys(VOICE_ACCENTS) as VoiceAccentId[]).map((accId) => (
                      <option key={accId} value={accId}>
                        {VOICE_ACCENTS[accId].flag} {VOICE_ACCENTS[accId].name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chime Sound dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-500">Alarm Chime Sound</label>
                  <select
                    value={chime}
                    onChange={(e) => setChime(e.target.value as ChimeType)}
                    className="w-full text-xs bg-white border border-neutral-200 rounded-lg px-2 py-1.5 font-medium capitalize"
                  >
                    <option value="chime">Triad Chime</option>
                    <option value="digital">Digital Beep</option>
                    <option value="gong">Zen Gong</option>
                    <option value="alarm">Alarm Pulse</option>
                    <option value="none">None (Silent)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Test Voice Speech Preview Button */}
            {enableVoice && (
              <button
                type="button"
                onClick={handleTestPreview}
                disabled={isPlayingPreview}
                className="w-full py-1.5 px-3 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-xs font-semibold text-[#007AFF] flex items-center justify-center gap-1.5 transition"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isPlayingPreview ? 'Speaking...' : 'Preview Voice Announcement'}</span>
              </button>
            )}
          </div>

          {/* Notes / Details */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1">
              <AlignLeft className="w-3 h-3 text-neutral-400" />
              <span>Notes & Speech Description</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add reminder notes or announcement speech details..."
              className="w-full text-xs text-neutral-800 bg-neutral-100/80 border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:border-[#007AFF] resize-none"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-black/[0.08] flex items-center justify-between gap-3">
            <div>
              {eventToEdit && onDeleteEvent && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteEvent(eventToEdit.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#FF3B30] hover:bg-red-50 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#007AFF] hover:bg-[#0066D6] text-white shadow-xs transition"
              >
                {eventToEdit ? 'Save Changes' : 'Add Event'}
              </button>
            </div>
          </div>

        </form>

      </motion.div>
    </div>
  );
}
