/**
 * Client Database Synchronization Engine
 * Handles immediate server database connection, legacy data recovery, and offline-first fallback.
 */

import { ScheduleEvent } from '../types';
import { UserProfile } from '../components/AppleAccountModal';

// Storage keys across all application versions for complete data recovery
const ALL_STORAGE_KEYS = [
  'apple_calendar_events_v3',
  'apple_calendar_events_v2',
  'apple_calendar_events',
  'task_scheduler_events',
  'daily_schedule_events',
  'scheduler_events',
  'schedule_events',
  'events',
];

const PRIMARY_EVENTS_KEY = 'apple_calendar_events_v3';
const PRIMARY_PROFILE_KEY = 'scheduler_user_profile';

/**
 * Recovers all previously stored events from every historical localStorage key.
 */
export function recoverLegacyEvents(): ScheduleEvent[] {
  if (typeof window === 'undefined') return [];

  const foundEventsMap = new Map<string, ScheduleEvent>();

  for (const key of ALL_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          for (const item of parsed) {
            if (item && item.id && item.title) {
              // Normalize event fields if older version
              const normalized: ScheduleEvent = {
                id: String(item.id),
                title: String(item.title),
                date: item.date,
                time: item.time || '09:00',
                duration: Number(item.duration) || 30,
                category: item.category || 'work',
                completed: Boolean(item.completed),
                notes: item.notes,
                location: item.location,
                enableVoice: item.enableVoice !== false,
                enableNotification: item.enableNotification !== false,
                accent: item.accent || 'en-IN',
                chime: item.chime || 'chime',
                protectionLevel: item.protectionLevel || (item.category === 'health' ? 'health' : 'flexible'),
              };
              foundEventsMap.set(normalized.id, normalized);
            }
          }
        }
      }
    } catch (e) {
      console.warn(`Error reading key ${key}:`, e);
    }
  }

  const result = Array.from(foundEventsMap.values());
  if (result.length > 0) {
    // Write recovered data back into primary key immediately
    localStorage.setItem(PRIMARY_EVENTS_KEY, JSON.stringify(result));
  }
  return result;
}

/**
 * Fetches events from the backend database server with fallback to recovered local data.
 */
export async function fetchEventsFromDatabase(): Promise<{ events: ScheduleEvent[]; source: 'database' | 'local' }> {
  try {
    const res = await fetch('/api/events', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        // Persist to local storage
        localStorage.setItem(PRIMARY_EVENTS_KEY, JSON.stringify(json.data));
        return { events: json.data, source: 'database' };
      }
    }
  } catch (err) {
    console.log('Database server offline or local dev, falling back to persistent local storage:', err);
  }

  // Fallback: Recover from all localStorage keys
  const localRecovered = recoverLegacyEvents();
  return { events: localRecovered, source: 'local' };
}

/**
 * Immediately saves events to the persistent database and local storage.
 * Triggered on every create, update, delete, and toggle event action.
 */
export async function saveEventsToDatabase(events: ScheduleEvent[]): Promise<boolean> {
  // 1. Immediately persist to localStorage for instant UI response & offline support
  if (typeof window !== 'undefined') {
    localStorage.setItem(PRIMARY_EVENTS_KEY, JSON.stringify(events));
    // Also save in fallback key for safety
    localStorage.setItem('apple_calendar_events_v2', JSON.stringify(events));
  }

  // 2. Immediately send to backend database
  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(events),
    });

    if (res.ok) {
      const data = await res.json();
      return data.success;
    }
  } catch (err) {
    console.warn('Could not reach backend database, saved to persistent local storage:', err);
  }

  return false;
}

/**
 * Saves user profile to database and local storage immediately.
 */
export async function saveProfileToDatabase(profile: UserProfile): Promise<boolean> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PRIMARY_PROFILE_KEY, JSON.stringify(profile));
  }

  try {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}
