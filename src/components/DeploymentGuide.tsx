import React, { useState } from 'react';
import { DeploymentConfig } from '../types';
import { Terminal, Copy, Check, FileCode, Cpu, Chrome, Smartphone, RefreshCw, Volume2, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export default function DeploymentGuide() {
  const [config, setConfig] = useState<DeploymentConfig>({
    appId: 'com.dailyschedule.ios',
    appName: 'Daily Schedule & Reminder',
    webUrl: 'https://daily-schedule-remind.vercel.app',
    enablePush: true,
    enableBackgroundAudio: true,
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [webPlatform, setWebPlatform] = useState<'vercel' | 'render'>('render');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const updateField = (key: keyof DeploymentConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Generated configs
  const capConfigText = `import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '${config.appId}',
  appName: '${config.appName}',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#4F46E5",
      sound: "chime.wav",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    // Safe area and native styling configurations
    StatusBar: {
      style: "DARK",
      overlaysWebView: true,
    },
  },
};

export default config;`;

  const vercelConfigText = `{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}`;

  const manifestText = `{
  "short_name": "Scheduler",
  "name": "${config.appName}",
  "icons": [
    {
      "src": "icon-192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "icon-512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": "/",
  "background_color": "#F8FAFC",
  "theme_color": "#4F46E5",
  "display": "standalone",
  "orientation": "portrait"
}`;

  const infoPlistSnippet = `<!-- Background audio playback & push notifications entitlements in Info.plist -->
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
  <string>remote-notification</string>
</array>

<!-- Audio & Speech recognition permission descriptions -->
<key>NSMicrophoneUsageDescription</key>
  <string>This app requires access to microphone for voice command and scheduling alarms.</string>
<key>NSSpeechRecognitionUsageDescription</key>
  <string>This app uses speech synthesis to read your daily activity alerts aloud.</string>`;

  const appDelegateSnippet = `// Add audio background mode support to AppDelegate.swift
import AVFoundation

func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
  let audioSession = AVAudioSession.sharedInstance()
  do {
    try audioSession.setCategory(.playback, mode: .default, options: [.mixWithOthers, .allowBluetooth])
    try audioSession.setActive(true)
  } catch {
    print("Failed to set audio session category.")
  }
  return true
}`;

  return (
    <div id="deployment-guide-panel" className="space-y-8 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight font-display">Web & iOS Native Console</h2>
          <p className="text-xs text-slate-400 mt-1">Configure and export production files for Vercel hosting and Xcode iOS native builds.</p>
        </div>
        <div className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 font-mono">
          <Terminal className="w-3.5 h-3.5" />
          <span>iOS + Web Target</span>
        </div>
      </div>

      {/* Interactive config settings */}
      <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Configure App Identity & Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-500">App Name (iOS/PWA)</label>
            <input
              type="text"
              value={config.appName}
              onChange={(e) => updateField('appName', e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-500">Bundle Identifier (App ID)</label>
            <input
              type="text"
              value={config.appId}
              onChange={(e) => updateField('appId', e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-500">Production Web URL</label>
            <input
              type="text"
              value={config.webUrl}
              onChange={(e) => updateField('webUrl', e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-mono"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-150/80">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-800 block">APNs Native Push Entitlements</span>
              <span className="text-[10px] text-slate-400 block">Required for remote Apple Push Notification service.</span>
            </div>
            <button
              onClick={() => updateField('enablePush', !config.enablePush)}
              className={`w-10 h-6 rounded-full p-1 transition-all ${config.enablePush ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${config.enablePush ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-150/80">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-800 block">Background Audio Entitlement</span>
              <span className="text-[10px] text-slate-400 block">Ensures regional TTS alarms play even when screen is locked.</span>
            </div>
            <button
              onClick={() => updateField('enableBackgroundAudio', !config.enableBackgroundAudio)}
              className={`w-10 h-6 rounded-full p-1 transition-all ${config.enableBackgroundAudio ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${config.enableBackgroundAudio ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of config exporters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* iOS Native Build Center */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Smartphone className="w-5 h-5" />
            <h3 className="font-bold text-sm tracking-tight font-display">1. Capacitor iOS Configuration</h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Create a file called <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-600">capacitor.config.ts</code> in your root directory and copy the contents below:
          </p>

          <div className="relative">
            <pre className="bg-slate-950 text-slate-300 text-[10px] p-4 rounded-xl font-mono overflow-x-auto max-h-60 no-scrollbar leading-relaxed">
              {capConfigText}
            </pre>
            <button
              onClick={() => handleCopy('capacitor', capConfigText)}
              className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
              title="Copy Code"
            >
              {copiedId === 'capacitor' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Terminal Commands for iOS packaging
            </h4>
            <div className="space-y-1 font-mono text-[10px] text-slate-600 leading-normal">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400"># Install native iOS engine dependencies</span>
                <br /><strong className="text-slate-800">npm install @capacitor/core @capacitor/ios @capacitor/cli</strong>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400"># Initialise Capacitor configuration</span>
                <br /><strong className="text-slate-800">npx cap init "{config.appName}" "{config.appId}"</strong>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400"># Add Native Apple iOS platform wrapper</span>
                <br /><strong className="text-slate-800">npx cap add ios</strong>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400"># Compile app & synchronize files to iOS target</span>
                <br /><strong className="text-slate-800">npm run build && npx cap sync ios</strong>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400"># Boot project in Apple Xcode for simulator run</span>
                <br /><strong className="text-slate-800">npx cap open ios</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Web Production deployment config */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600">
              <Chrome className="w-5 h-5" />
              <h3 className="font-bold text-sm tracking-tight font-display">2. Production Web Hosting</h3>
            </div>
            {/* Tab togglers */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold shrink-0">
              <button
                onClick={() => setWebPlatform('render')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${webPlatform === 'render' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Render
              </button>
              <button
                onClick={() => setWebPlatform('vercel')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${webPlatform === 'vercel' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Vercel
              </button>
            </div>
          </div>

          {webPlatform === 'render' ? (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-500 leading-relaxed">
                Render is a powerful, developer-friendly cloud platform. To deploy this React & Vite app for free as a <strong>Static Site</strong>:
              </p>
              
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-150 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Render Setup Parameters</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-mono">SITE TYPE</span>
                    <strong className="text-xs text-slate-800 font-sans">Static Site</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-mono">BUILD COMMAND</span>
                    <strong className="text-xs text-indigo-600 font-mono">npm run build</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-mono">PUBLISH DIRECTORY</span>
                    <strong className="text-xs text-indigo-600 font-mono">dist</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-mono">NODE VERSION</span>
                    <strong className="text-xs text-slate-800 font-sans">20.x or higher</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Redirects & Rewrite Rule (Required for client routing)</span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  In your Render Static Site Dashboard, navigate to <strong>Redirects/Rewrites</strong> and add:
                </p>
                <div className="bg-slate-950 text-slate-300 text-[10px] p-3.5 rounded-xl font-mono space-y-1">
                  <div><span className="text-slate-500">Source Path:</span> /*</div>
                  <div><span className="text-slate-500">Destination Path:</span> /index.html</div>
                  <div><span className="text-slate-500">Action:</span> Rewrite</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-500 leading-relaxed">
                Create a file called <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-600">vercel.json</code> in your root directory to ensure routing/headers are secure and optimized:
              </p>

              <div className="relative">
                <pre className="bg-slate-950 text-slate-300 text-[10px] p-4 rounded-xl font-mono overflow-x-auto max-h-40 no-scrollbar leading-relaxed">
                  {vercelConfigText}
                </pre>
                <button
                  onClick={() => handleCopy('vercel', vercelConfigText)}
                  className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  {copiedId === 'vercel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            Create a file called <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-600">public/manifest.json</code> to enable full progressive offline PWA functionality:
          </p>

          <div className="relative">
            <pre className="bg-slate-950 text-slate-300 text-[10px] p-4 rounded-xl font-mono overflow-x-auto max-h-40 no-scrollbar leading-relaxed">
              {manifestText}
            </pre>
            <button
              onClick={() => handleCopy('manifest', manifestText)}
              className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            >
              {copiedId === 'manifest' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Native Swift Integrations */}
      <div className="pt-6 border-t border-slate-150/70 space-y-4">
        <div className="flex items-center gap-2 text-indigo-600">
          <Volume2 className="w-5 h-5" />
          <h3 className="font-bold text-sm tracking-tight font-display">3. Audio & Background Alerts (Critical Xcode Setup)</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          On iOS, background playback must be declared explicitly in Xcode. If omitted, sound and text-to-speech alarms will be muted once the screen goes idle.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Info.plist file configurations */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">App/iOS/Info.plist Config</span>
              <button
                onClick={() => handleCopy('plist', infoPlistSnippet)}
                className="text-[10px] flex items-center gap-1 text-indigo-600 font-semibold"
              >
                {copiedId === 'plist' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-300 text-[10px] p-3 rounded-xl font-mono overflow-x-auto max-h-40 no-scrollbar leading-relaxed">
              {infoPlistSnippet}
            </pre>
          </div>

          {/* AppDelegate.swift configuration */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">App/iOS/AppDelegate.swift Override</span>
              <button
                onClick={() => handleCopy('delegate', appDelegateSnippet)}
                className="text-[10px] flex items-center gap-1 text-indigo-600 font-semibold"
              >
                {copiedId === 'delegate' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-300 text-[10px] p-3 rounded-xl font-mono overflow-x-auto max-h-40 no-scrollbar leading-relaxed">
              {appDelegateSnippet}
            </pre>
          </div>
        </div>
      </div>

      {/* Safety & Design guidelines */}
      <div className="p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-100 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <strong className="block text-amber-900 font-semibold">Important iOS Touch Target & Safe Area Rules</strong>
          <p className="leading-relaxed text-amber-800/90">
            For native iPhone packaging, make sure your layout declares <code className="bg-white/70 px-1 py-0.5 rounded font-mono">viewport-fit=cover</code> in index.html (already implemented in this template) and handles safe-area-inset top and bottom padding using Tailwind classes like <code className="bg-white/70 px-1 py-0.5 rounded font-mono">pt-[env(safe-area-inset-top)]</code> to protect interactive headers and navigation buttons from getting cropped by the dynamic island or bottom home indicator.
          </p>
        </div>
      </div>
    </div>
  );
}
