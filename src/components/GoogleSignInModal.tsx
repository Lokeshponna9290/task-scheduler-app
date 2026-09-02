import React, { useState } from 'react';
import { GoogleUser, authenticateGoogleUser } from '../utils/googleAuth';
import { X, ShieldCheck, Smartphone, Laptop, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: GoogleUser) => void;
  currentEmail?: string;
}

export default function GoogleSignInModal({
  isOpen,
  onClose,
  onSuccess,
  currentEmail = 'lokeshreddyponna@gmail.com',
}: GoogleSignInModalProps) {
  const [emailInput, setEmailInput] = useState(currentEmail);
  const [nameInput, setNameInput] = useState('Lokesh Reddy');
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Simulate quick secure OAuth handshake
      const user = await authenticateGoogleUser({
        email: emailInput || 'lokeshreddyponna@gmail.com',
        name: nameInput || 'Lokesh Reddy',
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameInput || 'LR')}&backgroundColor=0077FE`,
      });

      setTimeout(() => {
        setIsLoading(false);
        onSuccess(user);
        onClose();
      }, 600);
    } catch (e) {
      setIsLoading(false);
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        className="w-full max-w-md bg-white rounded-3xl border border-black/10 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            {/* Google G Logo SVG */}
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
            <div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">Sign in with Google</h3>
              <p className="text-[11px] text-neutral-500">Cross-Device Multi-Device Cloud Sync</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benefits banner */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#007AFF] shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-blue-950">Safe & Persistent Across All Devices</h5>
                <p className="text-[11px] text-blue-800/80 leading-relaxed">
                  Your tasks, schedules, and Focus Shield preferences automatically sync across iPhone, Mac, iPad, and PC.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-blue-900">
              <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5" /> Mobile</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Laptop className="w-3.5 h-3.5" /> Desktop</span>
              <span>•</span>
              <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Instant Sync</span>
            </div>
          </div>

          {/* Account Selector / Inputs */}
          {isCustomMode ? (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#007AFF] bg-neutral-50/50"
                  placeholder="Lokesh Reddy"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">Google Email Address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#007AFF] bg-neutral-50/50"
                  placeholder="name@gmail.com"
                />
              </div>
            </div>
          ) : (
            <div 
              onClick={handleGoogleSignIn}
              className="p-3.5 bg-neutral-50 hover:bg-blue-50/40 border border-neutral-200 hover:border-blue-300 rounded-2xl cursor-pointer transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0077FE] to-[#0051D4] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  LR
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 group-hover:text-[#007AFF] transition">
                    {nameInput || 'Lokesh Reddy'}
                  </h4>
                  <p className="text-[11px] text-neutral-500">{emailInput || 'lokeshreddyponna@gmail.com'}</p>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-80" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#007AFF] hover:bg-[#0062D2] active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                    />
                  </svg>
                  <span>Continue with Google Account</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="w-full py-2 text-center text-[11px] font-semibold text-neutral-500 hover:text-neutral-800 transition"
            >
              {isCustomMode ? '← Use Quick Select' : 'Use a different Google email'}
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
