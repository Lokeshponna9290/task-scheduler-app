import { VoiceAccentId, ChimeType } from '../types';

// Define the voice accent configurations
export const VOICE_ACCENTS: Record<VoiceAccentId, {
  name: string;
  flag: string;
  description: string;
  langCode: string;
  pitch: number;
  rate: number;
  phoneticMap?: Record<string, string>;
}> = {
  'en-US': {
    name: 'American English',
    flag: '🇺🇸',
    description: 'Standard American accent with crisp pronunciation',
    langCode: 'en-US',
    pitch: 1.0,
    rate: 1.0,
  },
  'en-IN': {
    name: 'Indian English',
    flag: '🇮🇳',
    description: 'Clear general Indian English accent',
    langCode: 'en-IN',
    pitch: 1.05,
    rate: 0.9,
  },
  'en-TE': {
    name: 'Telugu Style English',
    flag: '🌾',
    description: 'Rhythmic Telugu-influenced English with vowel extensions',
    langCode: 'en-IN',
    pitch: 1.15,
    rate: 0.85,
    phoneticMap: {
      'schedule': 'scheduloo',
      'task': 'taskoo',
      'meeting': 'meetingee',
      'reminder': 'reminder-u',
      'completed': 'complateed',
      'time': 'time-u',
      'health': 'healthoo',
      'work': 'workoo',
      'personal': 'personaloo',
      'gym': 'gymoo',
      'breakfast': 'brakefastoo',
      'lunch': 'lunch-u',
      'dinner': 'dinner-u',
      'water': 'water-u',
      'exercise': 'exercisoo',
    }
  },
  'en-TA': {
    name: 'Tamil Style English',
    flag: '🌅',
    description: 'Retroflex-dense, syllable-timed Tamil English style',
    langCode: 'en-IN',
    pitch: 0.98,
    rate: 0.92,
    phoneticMap: {
      'schedule': 'shedule',
      'task': 'taask',
      'meeting': 'meetting',
      'reminder': 'remynder',
      'completed': 'combleted',
      'time': 'taim',
      'health': 'helth',
      'work': 'vark',
      'personal': 'personnal',
      'gym': 'jim',
      'breakfast': 'braykfast',
      'lunch': 'lanch',
      'dinner': 'dinnar',
      'water': 'vaatar',
      'exercise': 'exarsise',
    }
  },
  'en-KA': {
    name: 'Kannada Style English',
    flag: '⛰️',
    description: 'Melodic Kannada-accented English with soft final releases',
    langCode: 'en-IN',
    pitch: 1.10,
    rate: 0.88,
    phoneticMap: {
      'schedule': 'schedule-a',
      'task': 'task-a',
      'meeting': 'meeting-a',
      'reminder': 'reminder-a',
      'completed': 'complete-a',
      'time': 'time-a',
      'health': 'health-a',
      'work': 'vork-a',
      'personal': 'personal-a',
      'gym': 'gym-a',
      'breakfast': 'breakfast-a',
      'lunch': 'lunch-a',
      'dinner': 'dinner-a',
      'water': 'water-a',
      'exercise': 'exercise-a',
    }
  }
};

/**
 * Phonetically translates a normal English string into an accented string based on the chosen accent.
 */
export function applyAccentPhonetics(text: string, accentId: VoiceAccentId): string {
  const accent = VOICE_ACCENTS[accentId];
  if (!accent || !accent.phoneticMap) return text;

  let words = text.toLowerCase().split(/\s+/);
  const mappedWords = words.map(word => {
    // Strip punctuation
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    const mapping = accent.phoneticMap?.[cleanWord];
    if (mapping) {
      // Re-add punctuation if it was there
      const punctuation = word.slice(cleanWord.length);
      return mapping + punctuation;
    }
    return word;
  });

  return mappedWords.join(' ');
}

/**
 * Web Audio API Synth to play high-quality sounds programmatically
 */
export function playChime(type: ChimeType) {
  if (typeof window === 'undefined') return;
  
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const now = ctx.currentTime;

  switch (type) {
    case 'digital': {
      // Classic quick high-pitch beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    }
    case 'chime': {
      // Elegant C-Major high triad chime (C5, E5, G5)
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08); // Arpeggiated
        
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.3);
      });
      break;
    }
    case 'gong': {
      // Deep resonant Zen gong sound
      const baseFreq = 160;
      const partials = [1, 1.5, 2.1, 2.7, 3.4];
      
      partials.forEach((mult) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq * mult, now);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.1);
      });
      break;
    }
    case 'alarm': {
      // Pulsing alert alarm
      const duration = 1.6;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(580, now);
      // frequency modulation
      for (let t = 0; t < duration; t += 0.2) {
        osc.frequency.setValueAtTime(580, now + t);
        osc.frequency.linearRampToValueAtTime(880, now + t + 0.1);
        osc.frequency.linearRampToValueAtTime(580, now + t + 0.2);
      }
      
      gain.gain.setValueAtTime(0, now);
      for (let t = 0; t < duration; t += 0.2) {
        gain.gain.setValueAtTime(0.2, now + t);
        gain.gain.setValueAtTime(0, now + t + 0.18);
      }
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
      break;
    }
    default:
      break;
  }
}

/**
 * Text to Speech using Web Speech API with accent modifications
 */
export function speakText(text: string, accentId: VoiceAccentId, onEnd?: () => void) {
  if (typeof window === 'undefined') return;
  const synth = window.speechSynthesis;
  if (!synth) {
    onEnd?.();
    return;
  }

  // Cancel any ongoing speech
  synth.cancel();

  // Convert text phonetically first to capture regional slang/vocal traits
  const phoneticText = applyAccentPhonetics(text, accentId);
  const utterance = new SpeechSynthesisUtterance(phoneticText);
  const accent = VOICE_ACCENTS[accentId];

  // Set parameters
  utterance.rate = accent.rate;
  utterance.pitch = accent.pitch;

  // Try to match the best system voice matching the language code
  const voices = synth.getVoices();
  const matchingVoice = voices.find(v => 
    v.lang.toLowerCase().startsWith(accent.langCode.toLowerCase())
  );
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  synth.speak(utterance);
}
