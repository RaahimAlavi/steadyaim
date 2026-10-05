import React from 'react';
import type { DrillResult } from '../types';
import { Award, RotateCcw, Sliders, X } from 'lucide-react';


interface ResultModalProps {
  isOpen: boolean;
  result: DrillResult | null;
  onPlayAgain: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  result,
  onPlayAgain,
  onOpenSettings,
  onClose,
}) => {
  if (!isOpen || !result) return null;

  // Compute Grade based on Accuracy and Jitter score
  let gradeBadge = {
    grade: 'A',
    title: 'Immortal Stability',
    color: 'text-[#00f5d4]',
    border: 'border-[#00f5d4]/40',
    bg: 'bg-[#00f5d4]/10',
    shadow: 'shadow-[#00f5d4]/20',
  };

  if (result.accuracy >= 90 && result.avgJitterScore >= 80 && result.tenseAlertsCount <= 1) {
    gradeBadge = {
      grade: 'S',
      title: 'Radiant Composure',
      color: 'text-[#ffb703]',
      border: 'border-[#ffb703]/50',
      bg: 'bg-[#ffb703]/15',
      shadow: 'shadow-[#ffb703]/30',
    };
  } else if (result.accuracy >= 75 && result.avgJitterScore >= 65) {
    gradeBadge = {
      grade: 'A',
      title: 'Ascendant Precision',
      color: 'text-[#00f5d4]',
      border: 'border-[#00f5d4]/40',
      bg: 'bg-[#00f5d4]/10',
      shadow: 'shadow-[#00f5d4]/20',
    };
  } else if (result.accuracy >= 60) {
    gradeBadge = {
      grade: 'B',
      title: 'Diamond Potential',
      color: 'text-indigo-400',
      border: 'border-indigo-500/40',
      bg: 'bg-indigo-500/10',
      shadow: 'shadow-indigo-500/20',
    };
  } else {
    gradeBadge = {
      grade: 'C',
      title: 'High Tension Strain',
      color: 'text-[#ff4655]',
      border: 'border-[#ff4655]/50',
      bg: 'bg-[#ff4655]/15',
      shadow: 'shadow-[#ff4655]/30',
    };
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()} // Prevent accidental dismissals
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl bg-[#0e111a] border border-[#23293c] rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Top Header */}
        <div className="relative bg-gradient-to-r from-[#141926] via-[#161a29] to-[#121522] border-b border-[#21273b] p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl ${gradeBadge.bg} border ${gradeBadge.border} flex items-center justify-center font-black text-2xl ${gradeBadge.color} shadow-lg ${gradeBadge.shadow}`}
            >
              {gradeBadge.grade}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wide">PERFORMANCE REPORT</h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#ff4655]/20 text-[#ff4655] border border-[#ff4655]/30">
                  {result.drillType === 'whisper-grip' ? 'WHISPER GRIP' : 'STOPPING POWER'}
                </span>
              </div>
              <p className={`text-xs font-semibold ${gradeBadge.color}`}>
                Tier: {gradeBadge.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1f2436] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Stats Grid */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Accuracy */}
            <div className="bg-[#131622] border border-[#222738] rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Headshot Accuracy
              </span>
              <span className="text-2xl font-black font-mono text-[#00f5d4]">
                {result.accuracy}%
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                {result.hits} / {result.totalTargets} Confirmed
              </span>
            </div>

            {/* Calmness / Jitter */}
            <div className="bg-[#131622] border border-[#222738] rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Calmness Score
              </span>
              <span
                className={`text-2xl font-black font-mono ${
                  result.avgJitterScore >= 75 ? 'text-[#00f5d4]' : 'text-[#ff4655]'
                }`}
              >
                {result.avgJitterScore}%
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Path Stability
              </span>
            </div>

            {/* Time to Confirm */}
            <div className="bg-[#131622] border border-[#222738] rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Avg Confirm Time
              </span>
              <span className="text-2xl font-black font-mono text-white">
                {result.avgTimeToConfirmMs}ms
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Reaction + Micro-glide
              </span>
            </div>

            {/* Tension Flags */}
            <div className="bg-[#131622] border border-[#222738] rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Tension Spikes
              </span>
              <span
                className={`text-2xl font-black font-mono ${
                  result.tenseAlertsCount > 2 ? 'text-[#ff4655]' : 'text-[#00f5d4]'
                }`}
              >
                {result.tenseAlertsCount}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Grip Alerts Flagged
              </span>
            </div>
          </div>

          {/* Target-by-Target Shot Breakdown Timeline */}
          {result.shots && result.shots.length > 0 && (
            <div className="bg-[#131622] border border-[#222738] rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white tracking-wide">
                  SHOT-BY-SHOT BREAKDOWN ({result.shots.length} TARGETS)
                </span>
                <span className="text-slate-400 text-[11px]">Hover or inspect each duel</span>
              </div>

              <div className="flex gap-1.5 overflow-x-auto py-2">
                {result.shots.map((shot, idx) => (
                  <div
                    key={idx}
                    title={`Shot #${shot.shotNumber}: ${shot.hit ? 'HIT' : 'MISS'} | ${shot.timeToConfirmMs}ms | Stability: ${shot.jitterScore}%`}
                    className={`flex-1 min-w-[20px] h-9 rounded-lg flex flex-col items-center justify-center border text-[10px] font-mono transition-all hover:scale-110 ${
                      shot.hit
                        ? shot.jitterScore >= 75
                          ? 'bg-[#00f5d4]/20 border-[#00f5d4]/50 text-[#00f5d4]'
                          : 'bg-[#ffb703]/20 border-[#ffb703]/50 text-[#ffb703]'
                        : 'bg-[#ff4655]/20 border-[#ff4655]/50 text-[#ff4655]'
                    }`}
                  >
                    <span>{shot.shotNumber}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00f5d4]" />
                  <span>Calm Hit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ffb703]" />
                  <span>Tense Hit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff4655]" />
                  <span>Missed</span>
                </div>
              </div>
            </div>
          )}

          {/* Coach Insight Box */}
          <div className="bg-[#151926] border border-[#262e44] rounded-2xl p-4 text-xs text-slate-300 space-y-1.5">
            <span className="font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#00f5d4]" />
              <span>Coach Analysis:</span>
            </span>
            <p className="leading-relaxed">
              {result.tenseAlertsCount === 0 && result.accuracy >= 80 ? (
                <span>
                  🔥 Exceptional calm! You navigated all {result.totalTargets} duels with fluid deceleration. Your wrist stayed loose and your mouse did not fight mousepad stiction.
                </span>
              ) : result.tenseAlertsCount > 3 ? (
                <span>
                  ⚠️ You triggered <strong>{result.tenseAlertsCount} tension warnings</strong>. Notice how your fingers squeeze the mouse when trying to stop right on the head. Loosen your pinky and thumb pressure by 25% before starting the next round.
                </span>
              ) : (
                <span>
                  Solid execution! A couple of micro-adjustments had slight bounce at the stop point. Remember: let the mouse glide gently into the head: never slam your wrist like hitting a brake wall.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-[#121520] border-t border-[#21273b] p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onOpenSettings}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1f2e] border border-[#2b3348] text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#22293d] transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-[#00f5d4]" />
            <span>Calibrate Sens & Hardware</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#1a1f2e] transition-all"
            >
              Close
            </button>
            <button
              onClick={onPlayAgain}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#ff4655] hover:bg-[#ff5a68] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#ff4655]/30 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
