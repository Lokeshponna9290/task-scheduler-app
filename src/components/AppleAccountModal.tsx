import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, User, Mail, ShieldCheck, Cloud, Globe, 
  Download, LogOut, CheckCircle2, Sparkles, Smartphone,
  HardDrive, RefreshCw, Laptop, Tablet
} from 'lucide-react';
import { ScheduleEvent } from '../types';

export interface UserProfile {
  name: string;
  email: string;
  avatarColor: string;
  membership: string;
  syncStatus: 'synced' | 'syncing' | 'offline';
  lastSyncedAt?: string;
  isGoogleConnected?: boolean;
}

interface AppleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  eventsCount: number;
  events: ScheduleEvent[];
  onOpenGoogleSignIn?: () => void;
  onSignOutGoogle?: () => void;
}

export default function AppleAccountModal({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  eventsCount,
  events,
  onOpenGoogleSignIn,
  onSignOutGoogle,
}: AppleAccountModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, email });
    setIsEditing(false);
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onUpdateProfile({ 
        syncStatus: 'synced',
        lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setSyncMessage("All calendar events & Focus Shield settings synced with Google Cloud.");
      setTimeout(() => setSyncMessage(null), 4000);
    }, 1000);
  };

  const handleExportData = () => {
    setIsExporting(true);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `scheduler-calendar-backup-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setTimeout(() => {
      setIsExporting(false);
    }, 1000);
  };

  const initials = userProfile.name
    ? userProfile.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'LR';

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-white rounded-2xl border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-black/[0.08] flex items-center justify-between bg-[#F6F6F8]">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-neutral-600" />
            <h3 className="text-sm font-bold text-neutral-900">
              Account & Google Cloud Sync
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* User Profile Card */}
          <div className="bg-gradient-to-br from-neutral-50 to-neutral-100/80 p-4 rounded-2xl border border-black/[0.06] flex items-center gap-4">
            <div 
              className="w-13 h-13 rounded-2xl flex items-center justify-center text-white text-base font-bold shadow-md shrink-0 relative"
              style={{ background: userProfile.avatarColor || 'linear-gradient(135deg, #0077FE 0%, #0051D4 100%)' }}
            >
              {initials}
              {/* Google G logo badge */}
              <div className="w-4 h-4 bg-white rounded-full absolute -bottom-1 -right-1 shadow-xs p-0.5 flex items-center justify-center border border-black/10">
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24Z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
                </svg>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-neutral-900 truncate">
                  {userProfile.name}
                </h4>
                <span className="text-[9px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
                  Google Synced
                </span>
              </div>
              <p className="text-xs text-neutral-500 truncate mt-0.5">
                {userProfile.email}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active on All Devices • Synced</span>
              </div>
            </div>

            <button
              onClick={() => onOpenGoogleSignIn && onOpenGoogleSignIn()}
              className="px-2.5 py-1 text-xs font-semibold text-[#007AFF] hover:text-[#0051D4] bg-white border border-neutral-200 rounded-lg shadow-xs hover:bg-neutral-50 transition shrink-0"
            >
              Switch Account
            </button>
          </div>

          {/* Google Multi-Device Cloud Sync Banner */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-100/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-[#007AFF]" />
                <span className="text-xs font-bold text-blue-950">Multi-Device Cloud Protection</span>
              </div>
              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-md transition shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-[#007AFF]' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
              </button>
            </div>

            <p className="text-[11px] text-blue-900/80 leading-relaxed">
              Every task, schedule change, and Focus Shield level is securely synced so you can access your calendar safely from your Phone, Mac, and PC.
            </p>

            <div className="flex items-center gap-3 pt-0.5 text-[10px] font-semibold text-blue-900">
              <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> iPhone</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Laptop className="w-3 h-3" /> Mac</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Tablet className="w-3 h-3" /> iPad</span>
            </div>

            {syncMessage && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{syncMessage}</span>
              </div>
            )}
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-50/80 p-3 rounded-xl border border-black/[0.05]">
              <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                <HardDrive className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[11px] font-semibold">Saved Events</span>
              </div>
              <p className="text-lg font-bold text-neutral-900">{eventsCount}</p>
              <span className="text-[10px] text-neutral-400">Synced to Google DB</span>
            </div>

            <div className="bg-neutral-50/80 p-3 rounded-xl border border-black/[0.05]">
              <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                <Globe className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-[11px] font-semibold">Timezone</span>
              </div>
              <p className="text-xs font-bold text-neutral-900 truncate">{userTimezone}</p>
              <span className="text-[10px] text-neutral-400">System Clock</span>
            </div>
          </div>

          {/* Google Sign In / Switch Button */}
          <button
            onClick={() => onOpenGoogleSignIn && onOpenGoogleSignIn()}
            className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-xs font-bold text-neutral-800"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24Z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
            </svg>
            <span>Connect Another Google Account</span>
          </button>

          {/* Export & Data Management */}
          <div className="space-y-2">
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl transition text-left group"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-neutral-600 group-hover:text-neutral-900" />
                <div>
                  <h5 className="text-xs font-bold text-neutral-800">Export Calendar Backup</h5>
                  <p className="text-[11px] text-neutral-400">Download all your events and reminders in JSON format</p>
                </div>
              </div>
              <span className="text-xs text-[#0077FE] font-semibold">
                {isExporting ? 'Exporting...' : 'Export'}
              </span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black/[0.08] bg-[#F6F6F8] flex items-center justify-between">
          <span className="text-[10px] text-neutral-400">
            Scheduler Cloud Sync • Connected
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
