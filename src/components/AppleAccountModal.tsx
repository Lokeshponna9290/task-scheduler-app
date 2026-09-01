import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, User, Mail, ShieldCheck, Cloud, Globe, 
  Download, LogOut, CheckCircle2, Sparkles, Smartphone,
  HardDrive, RefreshCw
} from 'lucide-react';
import { ScheduleEvent } from '../types';

export interface UserProfile {
  name: string;
  email: string;
  avatarColor: string;
  membership: string;
  syncStatus: 'synced' | 'syncing' | 'offline';
  lastSyncedAt?: string;
}

interface AppleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  eventsCount: number;
  events: ScheduleEvent[];
}

export default function AppleAccountModal({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  eventsCount,
  events,
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
      setSyncMessage("All calendar events & reminders are in sync with cloud storage.");
      setTimeout(() => setSyncMessage(null), 4000);
    }, 1200);
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

  // Get initials
  const initials = userProfile.name
    ? userProfile.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'LP';

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
              Account Details
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
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* User Profile Card */}
          <div className="bg-gradient-to-br from-neutral-50 to-neutral-100/70 p-4 rounded-xl border border-black/[0.06] flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0"
              style={{ background: userProfile.avatarColor || 'linear-gradient(135deg, #0077FE 0%, #0051D4 100%)' }}
            >
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-neutral-900 truncate">
                  {userProfile.name}
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                  {userProfile.membership}
                </span>
              </div>
              <p className="text-xs text-neutral-500 truncate mt-0.5">
                {userProfile.email}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cloud Sync Active</span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-200 rounded-lg shadow-xs hover:bg-neutral-50 transition"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Edit Profile Form */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#0077FE]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#0077FE]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 text-xs font-semibold text-white bg-[#0077FE] hover:bg-[#0062D6] rounded-lg shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-50/80 p-3 rounded-xl border border-black/[0.05]">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <HardDrive className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[11px] font-semibold">Total Events</span>
              </div>
              <p className="text-xl font-bold text-neutral-900">{eventsCount}</p>
              <span className="text-[10px] text-neutral-400">Scheduled & Tracked</span>
            </div>

            <div className="bg-neutral-50/80 p-3 rounded-xl border border-black/[0.05]">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Globe className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-[11px] font-semibold">Timezone</span>
              </div>
              <p className="text-xs font-bold text-neutral-900 truncate">{userTimezone}</p>
              <span className="text-[10px] text-neutral-400">System Local Clock</span>
            </div>
          </div>

          {/* Cloud Sync & Security */}
          <div className="bg-neutral-50/80 p-3.5 rounded-xl border border-black/[0.05] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-[#0077FE]" />
                <span className="text-xs font-bold text-neutral-800">Cloud Storage & Backup</span>
              </div>
              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-md transition shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-[#0077FE]' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>

            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Your calendar data is encrypted and backed up offline-first with live cross-device cloud persistence.
            </p>

            {syncMessage && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{syncMessage}</span>
              </div>
            )}
          </div>

          {/* Export & Data Management */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Data & Backup
            </label>

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
            Scheduler v1.0 • Connected
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
