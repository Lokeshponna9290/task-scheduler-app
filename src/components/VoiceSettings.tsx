import React, { useState, useEffect } from 'react';
import { VoiceAccentId, ChimeType } from '../types';
import { VOICE_ACCENTS, speakText, playChime, applyAccentPhonetics } from '../utils/audio';
import { Volume2, Bell, AlertTriangle, Play, HelpCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceSettingsProps {
  currentAccent: VoiceAccentId;
  setCurrentAccent: (accent: VoiceAccentId) => void;
  currentChime: ChimeType;
  setCurrentChime: (chime: ChimeType) => void;
  onShowSimulatedNotification: (title: string, message: string) => void;
}

export default function VoiceSettings({
  currentAccent,
  setCurrentAccent,
  currentChime,
  setCurrentChime,
  onShowSimulatedNotification,
}: VoiceSettingsProps) {
  const [testText, setTestText] = useState('Hello! Your schedule meeting is at 10 AM. Please complete your task and drink water.');
  const [isPlaying, setIsPlaying] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>('default');
  const [hasVoiceSupport, setHasVoiceSupport] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setNotifPermission(Notification.permission);
      }
      if (!window.speechSynthesis) {
        setHasVoiceSupport(false);
      }
    }
  }, []);

  const handleSpeak = () => {
    setIsPlaying(true);
    speakText(testText, currentAccent, () => {
      setIsPlaying(false);
    });
  };

  const handleChimeTest = (chime: ChimeType) => {
    setCurrentChime(chime);
    playChime(chime);
  };

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      onShowSimulatedNotification("System Limit", "Notifications are not supported in this browser environment.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        const notif = new Notification("Alert Active", {
          body: "Push alerts and accents are ready to trigger on your scheduler!",
          icon: "/favicon.ico"
        });
        playChime(currentChime);
      } else {
        // Fallback simulation
        onShowSimulatedNotification("Permission Denied", "Triggering in-app notification simulation instead!");
      }
    } catch (err) {
      onShowSimulatedNotification("Iframe Restriction", "Notifications blocked by browser/iframe environment. Using in-app banner!");
    }
  };

  const triggerTestNotification = () => {
    const textToSpeak = `Alert! ${testText.slice(0, 40)}...`;
    
    // Play Chime
    playChime(currentChime);
    
    // Speak custom voice
    speakText(textToSpeak, currentAccent);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification("Daily Reminder", {
        body: testText,
        silent: true // Custom Web Audio play handles the sound
      });
    } else {
      // Show inside virtual simulator
      onShowSimulatedNotification("Daily Reminder Alarm", testText);
    }
  };

  // Pre-configured phrases
  const presets = [
    { label: "Meeting Alarm", text: "Alert! Meeting starts now. Join the call and open schedule notes." },
    { label: "Drink Water", text: "Healthy alert! Please drink water-u and do quick body stretch." },
    { label: "Task Reminder", text: "Schedule alert! Time to complete your pending task. Focus-a!" },
  ];

  return (
    <div id="voice-settings-panel" className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight font-display">Audio & Accent Studio</h2>
          <p className="text-xs text-slate-400 mt-1">Configure Web Speech TTS accents, pitches, and alert tones.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Speech Active</span>
        </div>
      </div>

      {!hasVoiceSupport && (
        <div className="p-3 bg-amber-50 text-amber-700 text-xs rounded-xl flex items-start gap-2 border border-amber-100">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Speech synthesis not fully supported:</span> Your browser or frame limits SpeechSynthesis API. The application will use simulated visual alarms.
          </div>
        </div>
      )}

      {/* Grid of Accents */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Select Regional Voice Accent</label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(VOICE_ACCENTS).map(([id, item]) => {
            const isSelected = currentAccent === id;
            return (
              <button
                key={id}
                id={`accent-btn-${id}`}
                onClick={() => setCurrentAccent(id as VoiceAccentId)}
                className={`text-left p-3.5 rounded-2xl border transition-all duration-200 relative ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/40 shadow-sm'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                )}
                <div className="text-2xl mb-1.5">{item.flag}</div>
                <div className="font-semibold text-xs text-slate-800 truncate">{item.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-relaxed truncate">{item.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Phrase selectors */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Text Presets</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setTestText(preset.text)}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-slate-100 bg-white hover:bg-slate-50 text-slate-600 transition"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Play Test Panel */}
      <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-500">Reminders Accent Translation Preview</label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full text-sm bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 leading-relaxed text-slate-700 font-sans"
            rows={2}
          />
        </div>

        {/* Phonetic Debugger */}
        <div className="bg-slate-100/50 border border-dashed border-slate-200 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Accent Phonetics Map Output</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-md font-mono">
              Rate: {VOICE_ACCENTS[currentAccent].rate} | Pitch: {VOICE_ACCENTS[currentAccent].pitch}
            </span>
          </div>
          <p className="text-xs text-indigo-900/80 font-mono leading-relaxed bg-white/40 p-2 rounded-lg italic">
            "{applyAccentPhonetics(testText, currentAccent)}"
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSpeak}
            disabled={isPlaying}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition ${
              isPlaying 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-100'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Accent Speech</span>
          </button>

          <button
            onClick={triggerTestNotification}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition shadow-sm shadow-emerald-100"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Simulate Alarm Alert</span>
          </button>
        </div>
      </div>

      {/* Sound Chimes Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Alert Ringtone / Chime</label>
          <div className="grid grid-cols-2 gap-2">
            {(['chime', 'digital', 'gong', 'alarm'] as ChimeType[]).map((chime) => {
              const isSelected = currentChime === chime;
              return (
                <button
                  key={chime}
                  onClick={() => handleChimeTest(chime)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border text-center capitalize transition ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/30 text-emerald-700'
                      : 'border-slate-100 hover:border-slate-200 text-slate-600'
                  }`}
                >
                  {chime} Sound
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications Status */}
        <div className="flex flex-col justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Permissions</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${notifPermission === 'granted' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              <span className="text-xs font-semibold text-slate-700">
                Web Notifications: {notifPermission === 'granted' ? 'Granted' : notifPermission === 'denied' ? 'Denied' : 'Not Requested'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
              Grant permissions to receive real desktop alerts even when browsing other tabs.
            </p>
          </div>
          {notifPermission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="mt-3 w-full py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition text-center"
            >
              Request Browser Permission
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
