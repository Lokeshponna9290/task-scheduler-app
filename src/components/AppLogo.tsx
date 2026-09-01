import React from 'react';

interface AppLogoProps {
  size?: number; // size in px (e.g. 28, 36, 48)
  className?: string;
  showText?: boolean;
}

export default function AppLogo({ size = 32, className = '', showText = false }: AppLogoProps) {
  const currentDate = new Date();
  const dayNum = currentDate.getDate();
  const monthShort = currentDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Custom Distinctive Logo Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm select-none"
      >
        <defs>
          {/* Electric Blue Gradient */}
          <linearGradient id="electricBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="50%" stopColor="#0077FE" />
            <stop offset="100%" stopColor="#0051D4" />
          </linearGradient>

          {/* Red Header Gradient */}
          <linearGradient id="redHeaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF3B30" />
            <stop offset="100%" stopColor="#E02B20" />
          </linearGradient>

          {/* Inner Glow Filter */}
          <linearGradient id="gridAccent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Outer App Squircle Base */}
        <rect width="100" height="100" rx="22" fill="url(#electricBlueGrad)" />

        {/* Subtle geometric pattern / glow grid on electric blue body */}
        <path
          d="M 12 55 L 88 55 M 12 75 L 88 75 M 36 32 L 36 88 M 64 32 L 64 88"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeOpacity="0.15"
          strokeDasharray="2 3"
        />

        {/* Top Calendar Header in Red */}
        <path
          d="M 0 22 C 0 9.85 9.85 0 22 0 L 78 0 C 90.15 0 100 9.85 100 22 L 100 32 L 0 32 Z"
          fill="url(#redHeaderGrad)"
        />

        {/* Twin Metallic Binder Rings bridging red header and electric blue body (Distinctive feature) */}
        <rect x="25" y="2" width="6" height="10" rx="3" fill="#FFFFFF" opacity="0.9" />
        <rect x="69" y="2" width="6" height="10" rx="3" fill="#FFFFFF" opacity="0.9" />
        
        {/* Month text in Red Header */}
        <text
          x="50"
          y="23"
          fill="#FFFFFF"
          fontSize="13"
          fontWeight="800"
          fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
          textAnchor="middle"
          letterSpacing="1.5"
        >
          {monthShort}
        </text>

        {/* Stylized Day Number on Electric Blue */}
        <text
          x="50"
          y="77"
          fill="#FFFFFF"
          fontSize="42"
          fontWeight="900"
          fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
          textAnchor="middle"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
        >
          {dayNum}
        </text>

        {/* Electric Cyan Pulse Dot / Spark in bottom right */}
        <circle cx="80" cy="80" r="3.5" fill="#00FFFF" />
        <circle cx="80" cy="80" r="7" stroke="#00FFFF" strokeWidth="1" opacity="0.6" />

        {/* Outer border highlight */}
        <rect
          x="0.5"
          y="0.5"
          width="99"
          height="99"
          rx="21.5"
          stroke="#FFFFFF"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
      </svg>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col select-none">
          <span className="text-sm font-bold tracking-tight text-neutral-900 leading-none">
            Scheduler
          </span>
          <span className="text-[10px] font-medium text-neutral-400 mt-0.5">
            Smart Calendar
          </span>
        </div>
      )}
    </div>
  );
}
