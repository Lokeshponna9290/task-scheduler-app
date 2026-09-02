import React, { useState, useEffect } from 'react';
import { ScheduleEvent, CATEGORY_CONFIGS, VoiceAccentId, ChimeType, ProtectionLevel, PROTECTION_CONFIGS } from '../types';
import { VOICE_ACCENTS, speakText, playChime } from '../utils/audio';
import { toDateKey, formatTime12h } from '../utils/dateUtils';
import { 
  X, Trash2, Volume2, Bell, Sparkles, 
  Calendar, Clock, Check, Play, AlignLeft, Tag, Shield, ShieldCheck
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
  const [protectionLevel, setProtectionLevel] = useState<ProtectionLevel>('flexible');
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
      setProtectionLevel(eventToEdit.protectionLevel || 'flexible');
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
      setProtectionLevel('flexible');
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
      protectionLevel,
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          
          {/* Title Input */}
          <div>
            <input
              type="text"
              required
              autoFocus
              placeholder="Event Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base font-bold text-neutral-900 placeholder:text-neutral-400 bg-transparent border-b border-neutral-200 focus:border-[#007AFF] pb-1.5 focus:outline-none transition"
            />
          </div>

          {/* Category Chips */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>Calendar Category</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(CATEGORY_CONFIGS) as ScheduleEvent['category'][]).map((catKey) => {
                const config = CATEGORY_CONFIGS[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border ${
                      isSelected
                        ? 'border-transparent text-white shadow-xs'
                        : 'border-neutral-200 bg-neutral-50/80 text-neutral-700 hover:bg-neutral-100'
                    }`}
                    style={{
                      backgroundColor: isSelected ? config.color : undefined,
                    }}
                  >
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focus Shield Protection Level Selector */}
          <div className="bg-gradient-to-r from-indigo-50/60 to-purple-50/40 p-3.5 rounded-xl border border-indigo-100/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Focus Shield Protection</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full border border-indigo-200">
                {PROTECTION_CONFIGS[protectionLevel].badgeLabel}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(PROTECTION_CONFIGS) as ProtectionLevel[]).map((lvl) => {
                const conf = PROTECTION_CONFIGS[lvl];
                const isSelected = protectionLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setProtectionLevel(lvl)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-transparent shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-base">{conf.icon}</span>
                    <span className="text-[10px] text-center leading-tight truncate w-full">{conf.badgeLabel}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-indigo-800/80 leading-snug">
              {PROTECTION_CONFIGS[protectionLevel].description}
            </p>
          </div>

          {/* Date, Time & Duration row */}
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
                <span>Time</span>
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
                <option value={180}>3 hours</option>
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
          </div>

          {/* Notes textarea */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1">
              <AlignLeft className="w-3 h-3 text-neutral-400" />
              <span>Notes & Speaking Script</span>
            </label>
            <textarea
              rows={2}
              placeholder="Add reminder details, spoken instructions, or meeting agenda..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs font-normal text-neutral-800 placeholder:text-neutral-400 bg-neutral-100/80 border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:border-[#007AFF] resize-none"
            />
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
            {eventToEdit && onDeleteEvent ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteEvent(eventToEdit.id);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestPreview}
                disabled={isPlayingPreview}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isPlayingPreview ? 'Testing...' : 'Test Sound'}</span>
              </button>
              
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#007AFF] hover:bg-[#0062D6] active:scale-95 rounded-lg shadow-sm transition"
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
