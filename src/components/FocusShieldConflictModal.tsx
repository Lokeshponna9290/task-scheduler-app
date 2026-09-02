import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ArrowRight, X, AlertTriangle, ShieldCheck, Clock, Check } from 'lucide-react';
import { ScheduleEvent, PROTECTION_CONFIGS } from '../types';
import { formatTime12h } from '../utils/dateUtils';

interface FocusShieldConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateEvent: {
    title: string;
    time: string;
    duration: number;
    date?: string;
  } | null;
  conflictingEvents: ScheduleEvent[];
  suggestedSlot?: string;
  suggestedEndTime?: string;
  onAutoReschedule: (newTime: string) => void;
  onOverride: () => void;
}

export default function FocusShieldConflictModal({
  isOpen,
  onClose,
  candidateEvent,
  conflictingEvents,
  suggestedSlot,
  suggestedEndTime,
  onAutoReschedule,
  onOverride,
}: FocusShieldConflictModalProps) {
  if (!isOpen || !candidateEvent) return null;

  const firstConflict = conflictingEvents[0];
  const protConfig = firstConflict ? PROTECTION_CONFIGS[firstConflict.protectionLevel || 'deep-work'] : null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl border border-black/10 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header with Shield Alert Banner */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500/10 via-red-500/10 to-indigo-500/10 border-b border-black/[0.06] flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-md shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full border border-indigo-200">
                Focus Shield Alert
              </span>
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mt-1">
              Time Block Protected
            </h3>
            <p className="text-xs text-neutral-600 mt-0.5 leading-snug">
              This schedule overlaps with an active high-focus protection zone.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-200/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conflict Comparison Box */}
        <div className="p-5 space-y-4">
          
          {/* Conflicting Protected Events List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Protected Event Conflict
            </span>

            {conflictingEvents.map((conflict) => {
              const confProt = PROTECTION_CONFIGS[conflict.protectionLevel || 'deep-work'];
              return (
                <div
                  key={conflict.id}
                  className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">{confProt.icon}</span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-indigo-950 truncate">
                        {conflict.title}
                      </h4>
                      <p className="text-[11px] text-indigo-700 font-medium">
                        {formatTime12h(conflict.time)} • {conflict.duration} min ({confProt.badgeLabel})
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-800 bg-white/90 px-2 py-0.5 rounded-full border border-indigo-200 shrink-0">
                    Shielded
                  </span>
                </div>
              );
            })}
          </div>

          {/* New Event Attempt */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Attempting to Schedule
              </span>
              <h5 className="font-bold text-neutral-800 mt-0.5 truncate max-w-[240px]">
                {candidateEvent.title}
              </h5>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-neutral-700">
                {formatTime12h(candidateEvent.time)}
              </span>
              <span className="text-[11px] text-neutral-400 block">
                {candidateEvent.duration} min
              </span>
            </div>
          </div>

          {/* Smart Suggestion Banner */}
          {suggestedSlot && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-300/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Smart Conflict-Free Slot Recommended</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-normal">
                Move to <strong className="font-bold text-emerald-900">{formatTime12h(suggestedSlot)}</strong> {suggestedEndTime ? `(${formatTime12h(suggestedSlot)} – ${formatTime12h(suggestedEndTime)})` : ''} to maintain protected deep flow.
              </p>
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-[#F6F6F8] border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onOverride}
              className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-100/90 hover:bg-amber-200/90 rounded-xl border border-amber-300 transition shadow-xs"
              title="Override focus protection and schedule anyway"
            >
              Override Protection
            </button>

            {suggestedSlot && (
              <button
                type="button"
                onClick={() => onAutoReschedule(suggestedSlot)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0077FE] hover:bg-[#0062D6] active:scale-95 rounded-xl shadow-md transition"
              >
                <span>Reschedule to {formatTime12h(suggestedSlot)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
