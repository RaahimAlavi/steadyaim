import React from 'react';
import { storageEngine } from '../utils/storageEngine';
import { Trophy, Zap, Crosshair, Target, Shield, ArrowUpRight, Flame } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface RankOverviewProps {
  onLaunchDiscipline: (discipline: 'whisper' | 'stopping' | 'tile-frenzy') => void;
  currentEdpi: number;
}

export const RankOverview: React.FC<RankOverviewProps> = ({
  onLaunchDiscipline,
  currentEdpi,
}) => {
  const profile = storageEngine.getProfile();
  const sessions = storageEngine.getSessions();
  const totalStars = storageEngine.getTotalStars();

  const bestScore = sessions.length > 0 ? Math.max(...sessions.map((s) => s.score)) : 3450;
  const avgAccuracy = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length)
    : 92;

  // Disciplines configuration matching benchmark Screenshot 7
  const disciplines = [
    {
      id: 'flicking',
      title: 'Flicking',
      drillType: 'whisper' as const,
      color: '#a855f7',
      bgGlow: 'rgba(168, 85, 247, 0.15)',
      border: 'border-purple-500/40',
      text: 'text-purple-400',
      rankTier: bestScore >= 3000 ? 'RADIANT' : 'IMMORTAL',
      score: Math.round(bestScore * 0.96),
      accuracy: avgAccuracy,
      subNodes: [
        { name: 'Micro Flick 5m', cleared: true },
        { name: 'Wide Snap 15m', cleared: true },
      ],
      pos: 'col-start-1 row-start-1',
    },
    {
      id: 'switching',
      title: 'Switching',
      drillType: 'tile-frenzy' as const,
      color: '#f97316',
      bgGlow: 'rgba(249, 115, 22, 0.15)',
      border: 'border-orange-500/40',
      text: 'text-orange-400',
      rankTier: bestScore >= 2500 ? 'IMMORTAL' : 'ASCENDANT',
      score: Math.round(bestScore * 0.91),
      accuracy: Math.max(75, avgAccuracy - 4),
      subNodes: [
        { name: 'Tile Frenzy 30s', cleared: true },
        { name: 'Speed Gate', cleared: false },
      ],
      pos: 'col-start-3 row-start-1',
    },
    {
      id: 'clicking',
      title: 'Clicking',
      drillType: 'stopping' as const,
      color: '#84cc16',
      bgGlow: 'rgba(132, 204, 22, 0.15)',
      border: 'border-lime-500/40',
      text: 'text-lime-400',
      rankTier: 'IMMORTAL',
      score: Math.round(bestScore * 0.94),
      accuracy: Math.min(98, avgAccuracy + 2),
      subNodes: [
        { name: 'Stopping Power', cleared: true },
        { name: 'Target Confirm', cleared: true },
      ],
      pos: 'col-start-1 row-start-3',
    },
    {
      id: 'tracking',
      title: 'Tracking',
      drillType: 'whisper' as const,
      color: '#06b6d4',
      bgGlow: 'rgba(6, 182, 212, 0.15)',
      border: 'border-cyan-500/40',
      text: 'text-cyan-400',
      rankTier: 'ASCENDANT',
      score: Math.round(bestScore * 0.88),
      accuracy: Math.max(70, avgAccuracy - 6),
      subNodes: [
        { name: 'Smooth Micro-Glide', cleared: true },
        { name: 'Jitter Stabilizer', cleared: false },
      ],
      pos: 'col-start-3 row-start-3',
    },
  ];

  const handleLaunch = (drillType: 'whisper' | 'stopping' | 'tile-frenzy') => {
    audioEngine.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    onLaunchDiscipline(drillType);
  };

  return (
    <div className="relative min-h-[92dvh] bg-[#0c101c] text-slate-100 p-4 md:p-8 overflow-y-auto select-none">
      {/* Background Circuit Grid Texture matching Screenshot 7 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 65%),
            linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 48px 48px, 48px 48px',
        }}
      />

      <div className="relative max-w-6xl mx-auto z-10 flex flex-col items-center">
        {/* Top Header */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">
                COMPETITIVE SKILL CONSTELLATION
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide uppercase">
              MY RANK OVERVIEW
            </h1>
            <p className="text-xs text-slate-400">
              Discipline proficiency network verified through anti-jitter hardware tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-[#131929] border border-[#24334f] text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">ACTIVE SENSITIVITY</span>
              <span className="text-xs font-mono font-black text-blue-300">{currentEdpi.toFixed(1)} eDPI</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-[#131929] border border-[#24334f] text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">TOTAL STARS</span>
              <span className="text-xs font-mono font-black text-amber-400">{totalStars} / 15 ★</span>
            </div>
          </div>
        </div>

        {/* 5-Node Constellation Circuit Grid matching Screenshot 7 */}
        <div className="relative w-full max-w-5xl py-8">
          {/* Circuit Conduit SVG Lines Connecting Satellites to Central Hub */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 1000 700"
            fill="none"
          >
            {/* Top Left -> Center */}
            <path d="M 280 180 L 420 180 L 420 350 L 500 350" stroke="#25324d" strokeWidth="4" />
            <path d="M 280 180 L 420 180 L 420 350 L 500 350" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 6" />

            {/* Top Right -> Center */}
            <path d="M 720 180 L 580 180 L 580 350 L 500 350" stroke="#25324d" strokeWidth="4" />
            <path d="M 720 180 L 580 180 L 580 350 L 500 350" stroke="#f97316" strokeWidth="2" strokeDasharray="6 6" />

            {/* Bottom Left -> Center */}
            <path d="M 280 520 L 420 520 L 420 350 L 500 350" stroke="#25324d" strokeWidth="4" />
            <path d="M 280 520 L 420 520 L 420 350 L 500 350" stroke="#84cc16" strokeWidth="2" strokeDasharray="6 6" />

            {/* Bottom Right -> Center */}
            <path d="M 720 520 L 580 520 L 580 350 L 500 350" stroke="#25324d" strokeWidth="4" />
            <path d="M 720 520 L 580 520 L 580 350 L 500 350" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 6" />

            {/* Circuit Hub Connection Rings */}
            <circle cx="420" cy="180" r="5" fill="#a855f7" />
            <circle cx="580" cy="180" r="5" fill="#f97316" />
            <circle cx="420" cy="520" r="5" fill="#84cc16" />
            <circle cx="580" cy="520" r="5" fill="#06b6d4" />
            <circle cx="500" cy="350" r="8" fill="#3b82f6" />
          </svg>

          {/* Grid Layout: 3 Columns x 3 Rows */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 items-center">
            {/* Top Left: Flicking */}
            <div className="p-5 rounded-2xl bg-[#121828] border border-purple-500/40 shadow-lg relative group transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase">
                  DISCIPLINE 01
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {disciplines[0].rankTier}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
                  <Crosshair className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Flicking</h3>
                  <span className="text-xs font-mono text-slate-400">{disciplines[0].score} PTS · {disciplines[0].accuracy}% ACC</span>
                </div>
              </div>

              {/* Sub-node Radar Pins */}
              <div className="space-y-1.5 mb-4">
                {disciplines[0].subNodes.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-mono bg-[#0c101c] p-2 rounded-lg border border-[#1e2a3f]">
                    <span className="text-slate-300">{s.name}</span>
                    <span className="text-[10px] text-purple-300 font-bold">CLEARED</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleLaunch(disciplines[0].drillType)}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Practice Flicking</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Empty Center-Top Space for Layout Balance */}
            <div className="hidden md:block" />

            {/* Top Right: Switching */}
            <div className="p-5 rounded-2xl bg-[#121828] border border-orange-500/40 shadow-lg relative group transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold tracking-widest text-orange-400 uppercase">
                  DISCIPLINE 02
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  {disciplines[1].rankTier}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-md">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Switching</h3>
                  <span className="text-xs font-mono text-slate-400">{disciplines[1].score} PTS · {disciplines[1].accuracy}% ACC</span>
                </div>
              </div>

              {/* Sub-node Radar Pins */}
              <div className="space-y-1.5 mb-4">
                {disciplines[1].subNodes.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-mono bg-[#0c101c] p-2 rounded-lg border border-[#1e2a3f]">
                    <span className="text-slate-300">{s.name}</span>
                    <span className={`text-[10px] font-bold ${s.cleared ? 'text-orange-300' : 'text-slate-500'}`}>
                      {s.cleared ? 'CLEARED' : 'UNLOCKED'}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleLaunch(disciplines[1].drillType)}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Practice Switching</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Center Row: Empty Left Space */}
            <div className="hidden md:block" />

            {/* Center Hub: MY GLOBAL AIM RANK */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#162035] to-[#101726] border-2 border-blue-500 shadow-2xl relative text-center flex flex-col items-center">
              <span className="text-[11px] font-mono font-bold tracking-widest text-blue-400 uppercase mb-3">
                CENTRAL HUB
              </span>

              {/* Hexagonal Tier Medal Icon */}
              <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                <div className="absolute inset-0 rounded-2xl bg-blue-500/20 border-2 border-blue-400 rotate-45 shadow-[0_0_30px_rgba(59,130,246,0.4)] animate-pulse" />
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <Trophy className="w-12 h-12 text-blue-300 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-white tracking-wide uppercase mb-1">
                MY GLOBAL AIM RANK
              </h2>
              <div className="text-base font-black text-amber-400 uppercase tracking-widest mb-2">
                {profile.rankName || 'IMMORTAL FLIGHT'}
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-300 mb-5">
                <span>GLOBAL RANK #{profile.globalRank || 13}</span>
                <span>·</span>
                <span className="text-emerald-400 font-bold">TOP 3.8%</span>
              </div>

              <div className="w-full bg-[#0a0e1a] p-3 rounded-xl border border-[#1e2a3f] text-xs font-mono flex items-center justify-between mb-4">
                <span className="text-slate-400">BEST VERIFIED SCORE</span>
                <span className="text-white font-black">{bestScore} PTS</span>
              </div>

              <button
                onClick={() => handleLaunch('tile-frenzy')}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Flame className="w-4 h-4 fill-white" />
                <span>PLAY RANK ASSESSMENT</span>
              </button>
            </div>

            {/* Center Row: Empty Right Space */}
            <div className="hidden md:block" />

            {/* Bottom Left: Clicking */}
            <div className="p-5 rounded-2xl bg-[#121828] border border-lime-500/40 shadow-lg relative group transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold tracking-widest text-lime-400 uppercase">
                  DISCIPLINE 03
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lime-500/20 text-lime-300 border border-lime-500/30">
                  {disciplines[2].rankTier}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center text-lime-400 shadow-md">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Clicking</h3>
                  <span className="text-xs font-mono text-slate-400">{disciplines[2].score} PTS · {disciplines[2].accuracy}% ACC</span>
                </div>
              </div>

              {/* Sub-node Radar Pins */}
              <div className="space-y-1.5 mb-4">
                {disciplines[2].subNodes.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-mono bg-[#0c101c] p-2 rounded-lg border border-[#1e2a3f]">
                    <span className="text-slate-300">{s.name}</span>
                    <span className="text-[10px] text-lime-300 font-bold">CLEARED</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleLaunch(disciplines[2].drillType)}
                className="w-full py-2.5 rounded-xl bg-lime-600 hover:bg-lime-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Practice Clicking</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Empty Center-Bottom Space for Layout Balance */}
            <div className="hidden md:block" />

            {/* Bottom Right: Tracking */}
            <div className="p-5 rounded-2xl bg-[#121828] border border-cyan-500/40 shadow-lg relative group transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  DISCIPLINE 04
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {disciplines[3].rankTier}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Tracking</h3>
                  <span className="text-xs font-mono text-slate-400">{disciplines[3].score} PTS · {disciplines[3].accuracy}% ACC</span>
                </div>
              </div>

              {/* Sub-node Radar Pins */}
              <div className="space-y-1.5 mb-4">
                {disciplines[3].subNodes.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-mono bg-[#0c101c] p-2 rounded-lg border border-[#1e2a3f]">
                    <span className="text-slate-300">{s.name}</span>
                    <span className={`text-[10px] font-bold ${s.cleared ? 'text-cyan-300' : 'text-slate-500'}`}>
                      {s.cleared ? 'CLEARED' : 'UNLOCKED'}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleLaunch(disciplines[3].drillType)}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Practice Tracking</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
