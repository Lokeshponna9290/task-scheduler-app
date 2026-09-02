/**
 * Focus Shield Intelligence Utilities:
 * Conflict Detection, Smart Slot Suggestion, Focus Score Engine, and Daily Insights.
 */

import { ScheduleEvent, ProtectionLevel } from '../types';
import { toDateKey, formatTime12h } from './dateUtils';

export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTimeString(minutes: number): string {
  const norm = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface FocusConflictResult {
  hasConflict: boolean;
  conflictingEvents: ScheduleEvent[];
  suggestedSlot?: string;
  suggestedEndTime?: string;
}

/**
 * Checks if candidate event collides with any protected event (deep-work or health) on the same date.
 */
export function checkFocusConflict(
  candidate: { date?: string; time: string; duration: number; id?: string; protectionLevel?: ProtectionLevel },
  allEvents: ScheduleEvent[]
): FocusConflictResult {
  const candidateDate = candidate.date || toDateKey(new Date());
  const candStart = timeStringToMinutes(candidate.time);
  const candEnd = candStart + (candidate.duration || 30);

  // Filter existing protected events on the same day (excluding itself if editing)
  const protectedEventsOnDay = allEvents.filter(e => {
    if (candidate.id && e.id === candidate.id) return false;
    const eventDate = e.date || toDateKey(new Date());
    if (eventDate !== candidateDate) return false;
    return e.protectionLevel === 'deep-work' || e.protectionLevel === 'health';
  });

  const conflicts = protectedEventsOnDay.filter(e => {
    const eStart = timeStringToMinutes(e.time);
    const eEnd = eStart + e.duration;
    // Overlap condition: start < otherEnd && end > otherStart
    return candStart < eEnd && candEnd > eStart;
  });

  if (conflicts.length === 0) {
    return { hasConflict: false, conflictingEvents: [] };
  }

  // Find next available free slot that doesn't conflict with any protected block
  const suggestedSlot = suggestNextFreeSlot(candidate, allEvents);
  const suggestedEndMins = timeStringToMinutes(suggestedSlot) + (candidate.duration || 30);
  const suggestedEndTime = minutesToTimeString(suggestedEndMins);

  return {
    hasConflict: true,
    conflictingEvents: conflicts,
    suggestedSlot,
    suggestedEndTime,
  };
}

/**
 * Finds the next available non-conflicting time slot on the candidate's date starting after the conflicting blocks.
 */
export function suggestNextFreeSlot(
  candidate: { date?: string; time: string; duration: number; id?: string },
  allEvents: ScheduleEvent[]
): string {
  const candidateDate = candidate.date || toDateKey(new Date());
  const duration = candidate.duration || 30;
  const startMins = timeStringToMinutes(candidate.time);

  // Get all protected events for this day, sorted chronologically
  const protectedBlocks = allEvents
    .filter(e => {
      if (candidate.id && e.id === candidate.id) return false;
      const eventDate = e.date || toDateKey(new Date());
      return eventDate === candidateDate && (e.protectionLevel === 'deep-work' || e.protectionLevel === 'health');
    })
    .map(e => ({
      start: timeStringToMinutes(e.time),
      end: timeStringToMinutes(e.time) + e.duration,
    }))
    .sort((a, b) => a.start - b.start);

  // Find maximum end time of any colliding block starting around startMins
  let candidateSlot = startMins;

  for (const block of protectedBlocks) {
    // If candidateSlot overlaps with this block, move candidateSlot to end of block
    if (candidateSlot < block.end && (candidateSlot + duration) > block.start) {
      candidateSlot = block.end;
      // Round up to nearest 5 or 15 minute boundary if desired
      const remainder = candidateSlot % 15;
      if (remainder !== 0) {
        candidateSlot += (15 - remainder);
      }
    }
  }

  // Ensure slot doesn't exceed 23:59 (e.g. max 23:30)
  if (candidateSlot + duration > 1440) {
    return '14:00'; // fallback afternoon slot
  }

  return minutesToTimeString(candidateSlot);
}

export interface FocusScoreMetrics {
  totalProtectedMinutes: number;
  completedProtectedMinutes: number;
  totalProtectedHours: number;
  completedProtectedHours: number;
  focusScorePercent: number;
  deepWorkMinutes: number;
  healthMinutes: number;
  protectedEventsCount: number;
  completedCount: number;
}

/**
 * Computes Focus Score metrics for the specified day.
 */
export function calculateFocusScore(events: ScheduleEvent[], targetDate: Date = new Date()): FocusScoreMetrics {
  const dateKey = toDateKey(targetDate);
  const dayEvents = events.filter(e => (e.date || dateKey) === dateKey);

  const protectedEvents = dayEvents.filter(
    e => e.protectionLevel === 'deep-work' || e.protectionLevel === 'health'
  );

  let totalProtectedMins = 0;
  let completedProtectedMins = 0;
  let deepWorkMins = 0;
  let healthMins = 0;
  let completedCount = 0;

  for (const e of protectedEvents) {
    totalProtectedMins += e.duration;
    if (e.protectionLevel === 'deep-work') deepWorkMins += e.duration;
    if (e.protectionLevel === 'health') healthMins += e.duration;
    
    if (e.completed) {
      completedProtectedMins += e.duration;
      completedCount++;
    }
  }

  // Calculate score percentage (if no protected blocks scheduled, baseline 100% or based on overall tasks)
  let focusScorePercent = 0;
  if (totalProtectedMins > 0) {
    // Score combines protected completion with total focus dedication
    const completionRatio = completedProtectedMins / totalProtectedMins;
    focusScorePercent = Math.min(100, Math.round(completionRatio * 100));
  } else {
    // If no protected events scheduled yet today, show 100% ready state
    focusScorePercent = 100;
  }

  return {
    totalProtectedMinutes: totalProtectedMins,
    completedProtectedMinutes: completedProtectedMins,
    totalProtectedHours: +(totalProtectedMins / 60).toFixed(1),
    completedProtectedHours: +(completedProtectedMins / 60).toFixed(1),
    focusScorePercent,
    deepWorkMinutes: deepWorkMins,
    healthMinutes: healthMins,
    protectedEventsCount: protectedEvents.length,
    completedCount,
  };
}

export interface FocusInsight {
  headline: string;
  description: string;
  peakFocusWindow: string;
  badge: string;
}

/**
 * Generates an end-of-day or real-time focus insight card.
 */
export function generateFocusInsight(events: ScheduleEvent[], targetDate: Date = new Date()): FocusInsight {
  const metrics = calculateFocusScore(events, targetDate);
  const dateKey = toDateKey(targetDate);
  
  // Find peak focus window from all deep-work blocks on this day
  const deepWorkBlocks = events
    .filter(e => (e.date || dateKey) === dateKey && e.protectionLevel === 'deep-work')
    .sort((a, b) => b.duration - a.duration);

  let peakFocusWindow = '9:30 AM – 11:30 AM';
  if (deepWorkBlocks.length > 0) {
    const peak = deepWorkBlocks[0];
    const startMins = timeStringToMinutes(peak.time);
    const endMins = startMins + peak.duration;
    peakFocusWindow = `${formatTime12h(peak.time)} – ${formatTime12h(minutesToTimeString(endMins))}`;
  }

  if (metrics.totalProtectedHours === 0) {
    return {
      headline: 'Shield Unlocked',
      description: 'Mark important time blocks as 🛡️ Deep Work or 💚 Health to protect your focus flow.',
      peakFocusWindow,
      badge: 'Ready',
    };
  }

  if (metrics.focusScorePercent >= 80) {
    return {
      headline: 'Unstoppable Flow State',
      description: `You protected ${metrics.totalProtectedHours} hrs of deep focus today. Your strongest focus window is ${peakFocusWindow}.`,
      peakFocusWindow,
      badge: 'Optimal',
    };
  }

  if (metrics.completedCount > 0) {
    return {
      headline: 'Focus Momentum Building',
      description: `Completed ${metrics.completedProtectedHours} of ${metrics.totalProtectedHours} protected hours. Keep your peak window ${peakFocusWindow} guarded.`,
      peakFocusWindow,
      badge: 'In Progress',
    };
  }

  return {
    headline: `${metrics.totalProtectedHours}h Protected Today`,
    description: `Your calendar is shielded for deep flow. Strongest planned window: ${peakFocusWindow}.`,
    peakFocusWindow,
    badge: 'Shielded',
  };
}
