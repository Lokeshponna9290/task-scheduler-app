import React, { useState } from 'react';
import { ScheduleEvent } from '../types';
import { calculateFocusScore, generateFocusInsight } from '../utils/focusShieldUtils';
import { Shield, Sparkles, CheckCircle2, ChevronRight, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FocusScoreWidgetProps {
  events: ScheduleEvent[];
  currentDate?: Date;
}

export default function FocusScoreWidget({ events, currentDate = new Date() }: FocusScoreWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const metrics = calculateFocusScore(events, currentDate);
  const insight = generateFocusInsight(events, currentDate);

  // SVG circular gauge geometry
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (metrics.focusScorePercent / 100) * circumference;

  return (
    <div className="p-3 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/60 rounded-2xl border border-indigo-100/90 shadow-xs select-none">
      
      {/* Widget Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          {/* Circular Progress Gauge */}
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <svg className="w-10 h-10 transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r={radius}
                className="text-indigo-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="20"
                cy="20"
                r={radius}
                className="text-indigo-600 transition-all duration-700 ease-out"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[10px] font-extrabold text-indigo-950">
              {metrics.focusScorePercent}%
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-900 group-hover:text-indigo-600 transition flex items-center gap-1">
                <span>Focus Score</span>
              </span>
              <span className="text-[9px] font-bold uppercase text-indigo-700 bg-indigo-100/80 px-1.5 py-0.2 rounded-full">
                Shield
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              {metrics.totalProtectedHours > 0 ? `${metrics.completedProtectedHours}h / ${metrics.totalProtectedHours}h protected` : 'No blocks shielded'}
            </p>
          </div>
        </div>

        <button 
          className="p-1 text-neutral-400 group-hover:text-neutral-700 transition"
          title={isExpanded ? "Collapse Focus Breakdown" : "Expand Focus Breakdown"}
        >
          <ChevronRight className={`w-3.5 h-3.5 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* End-of-Day Dynamic Focus Insight Card */}
      <div className="mt-2.5 p-2.5 bg-white/90 rounded-xl border border-black/[0.05] shadow-xs">
        <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 mb-1">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>{insight.headline}</span>
          </span>
          <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-100">
            {insight.badge}
          </span>
        </div>
        <p className="text-[11px] text-neutral-600 leading-snug">
          {insight.description}
        </p>
      </div>

      {/* Expanded Breakdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-2.5 space-y-2 text-xs border-t border-indigo-100/60 mt-2.5"
          >
            <div className="grid grid-cols-2 gap-1.5">
              <div className="p-2 bg-indigo-100/50 rounded-lg">
                <span className="text-[10px] font-bold uppercase text-indigo-900 block">🛡️ Deep Work</span>
                <span className="text-xs font-extrabold text-indigo-950">{(metrics.deepWorkMinutes / 60).toFixed(1)} hrs</span>
              </div>
              <div className="p-2 bg-emerald-100/50 rounded-lg">
                <span className="text-[10px] font-bold uppercase text-emerald-900 block">💚 Recovery</span>
                <span className="text-xs font-extrabold text-emerald-950">{(metrics.healthMinutes / 60).toFixed(1)} hrs</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-1.5 bg-white/60 rounded-lg text-[11px] text-neutral-600">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3 text-indigo-600" />
                <span>Peak Focus Window</span>
              </span>
              <span className="font-bold text-neutral-900">{insight.peakFocusWindow}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
