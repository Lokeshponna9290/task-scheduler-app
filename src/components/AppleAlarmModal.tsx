import React from 'react';
import { ActiveAlarm, VoiceAccentId } from '../types';
import { VOICE_ACCENTS } from '../utils/audio';
import { Clock, Bell, Volume2, X, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { formatTime12h } from '../utils/dateUtils';

interface AppleAlarmModalProps {
  activeAlarm: ActiveAlarm | null;
  currentTimeString: string;
  onSnooze: () => void;
  onDismiss: () => void;
}

export default function AppleAlarmModal({
  activeAlarm,
  currentTimeString,
  onSnooze,
  onDismiss,
}: AppleAlarmModalProps) {
  if (!activeAlarm) return null;

  const accentInfo = VOICE_ACCENTS[activeAlarm.accent];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-sm bg-neutral-900/90 backdrop-blur-2xl border border-white/15 text-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-5"
      >
        
        {/* Top Status */}
        <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-[#FF3B30] apple-live-dot" />
          <span className="uppercase tracking-widest text-[#FF453A] font-bold">Alarm Triggered</span>
          <span>•</span>
          <span>{currentTimeString}</span>
        </div>

        {/* Pulsing Alarm Clock Icon */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="w-20 h-20 rounded-full bg-[#FF3B30]/20 border border-[#FF3B30]/40 flex items-center justify-center text-[#FF453A] shadow-xl shadow-red-500/20"
        >
          <Bell className="w-9 h-9 animate-[bounce_1s_infinite]" />
        </motion.div>

        {/* Alarm Info */}
        <div className="space-y-1.5 w-full">
          <span className="text-xs font-mono font-bold text-[#FF453A] uppercase tracking-wider block">
            {formatTime12h(activeAlarm.time)}
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight px-2 leading-snug">
            {activeAlarm.title}
          </h2>

          <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-[11px] text-neutral-300 mt-2">
            <span>{accentInfo.flag}</span>
            <span>{accentInfo.name}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5 pt-2">
          <button
            onClick={onSnooze}
            className="w-full py-3 bg-white/15 hover:bg-white/20 active:scale-98 text-white font-semibold text-xs rounded-xl border border-white/10 transition backdrop-blur-md"
          >
            Snooze (5 min)
          </button>
          
          <button
            onClick={onDismiss}
            className="w-full py-3 bg-[#34C759] hover:bg-[#30B752] active:scale-98 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-green-500/20"
          >
            Dismiss & Mark Complete
          </button>
        </div>

      </motion.div>
    </div>
  );
}
