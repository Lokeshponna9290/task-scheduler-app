/**
 * Types and interfaces for the Daily Schedule & Reminder Application.
 */

export interface ScheduleEvent {
  id: string;
  title: string;
  date?: string; // YYYY-MM-DD (defaults to today if undefined)
  time: string; // HH:MM (24-hour format)
  duration: number; // in minutes
  category: 'work' | 'personal' | 'health' | 'reminder';
  completed: boolean;
  notes?: string;
  location?: string;
  enableVoice: boolean;
  enableNotification: boolean;
  accent: VoiceAccentId;
  chime: ChimeType;
}

export type CalendarViewType = 'day' | 'week' | 'month' | 'year';

export type VoiceAccentId = 
  | 'en-US' 
  | 'en-IN' 
  | 'en-TE' // Telugu style English
  | 'en-TA' // Tamil style English
  | 'en-KA'; // Kannada style English

export interface VoiceAccent {
  id: VoiceAccentId;
  name: string;
  flag: string;
  description: string;
  langCode: string;
  pitch: number;
  rate: number;
  phoneticMap?: Record<string, string>;
}

export type ChimeType = 'digital' | 'chime' | 'gong' | 'alarm' | 'none';

export interface ActiveAlarm {
  eventId: string;
  title: string;
  time: string;
  accent: VoiceAccentId;
  chime: ChimeType;
  date?: string;
}

export interface DeploymentConfig {
  appId: string;
  appName: string;
  webUrl: string;
  enablePush: boolean;
  enableBackgroundAudio: boolean;
}

export interface CategoryConfig {
  id: ScheduleEvent['category'];
  label: string;
  color: string; // Hex or CSS color
  bgLight: string;
  borderLight: string;
  badgeBg: string;
  textDark: string;
  dotColor: string;
}

export const CATEGORY_CONFIGS: Record<ScheduleEvent['category'], CategoryConfig> = {
  work: {
    id: 'work',
    label: 'Work & Tasks',
    color: '#007AFF',
    bgLight: 'bg-blue-500/10 hover:bg-blue-500/15 text-blue-900 border-l-blue-500',
    borderLight: 'border-blue-200',
    badgeBg: 'bg-blue-500 text-white',
    textDark: 'text-blue-600',
    dotColor: '#007AFF',
  },
  personal: {
    id: 'personal',
    label: 'Personal',
    color: '#AF52DE',
    bgLight: 'bg-purple-500/10 hover:bg-purple-500/15 text-purple-900 border-l-purple-500',
    borderLight: 'border-purple-200',
    badgeBg: 'bg-purple-500 text-white',
    textDark: 'text-purple-600',
    dotColor: '#AF52DE',
  },
  health: {
    id: 'health',
    label: 'Health & Wellness',
    color: '#34C759',
    bgLight: 'bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-900 border-l-emerald-500',
    borderLight: 'border-emerald-200',
    badgeBg: 'bg-emerald-500 text-white',
    textDark: 'text-emerald-600',
    dotColor: '#34C759',
  },
  reminder: {
    id: 'reminder',
    label: 'Reminders',
    color: '#FF3B30',
    bgLight: 'bg-red-500/10 hover:bg-red-500/15 text-red-900 border-l-red-500',
    borderLight: 'border-red-200',
    badgeBg: 'bg-red-500 text-white',
    textDark: 'text-red-600',
    dotColor: '#FF3B30',
  }
};
