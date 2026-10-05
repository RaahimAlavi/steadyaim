import React, { useState } from 'react';
import type { UserSettings } from '../types';
import { calculateEDPI, calculateCm360 } from '../utils/aimMath';
import {
  Target,
  ShieldAlert,
  Zap,
  Video,
  Activity,
  Sliders,
  Play,
  Cpu,
  Layers,
  Crosshair,
  Search,
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface DrillHubProps {
  settings: UserSettings;
  onSelectTab: (tab: 'whisper-grip' | 'stopping-power' | 'tile-frenzy' | 'clip-analyzer' | 'diagnostics' | 'benchmark') => void;
  openSettings: () => void;
}

type DifficultyTier = 'all' | 'basic' | 'intermediate' | 'advanced';
type CategoryFilter = 'all' | 'flicking' | 'switching' | 'clicking' | 'tracking' | 'labs';

export const DrillHub: React.FC<DrillHubProps> = ({
  settings,
  onSelectTab,
  openSettings,
}) => {
  const [tierFilter, setTierFilter] = useState<DifficultyTier>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const edpi = calculateEDPI(settings.dpi, settings.sensitivity);
  const cm360 = calculateCm360(settings.dpi, settings.sensitivity);

  const drills = [
    // BASIC (4)
    {
      id: 'whisper-grip' as const,
      tier: 'basic' as const,
      category: 'flicking' as const,
      tag: 'MICRO FLICK',
      tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      disciplineColor: '#a855f7',
      title: 'Whisper Grip 5m (Calm Micro)',
      description: '20 tactical micro-targets at 5m with 103° FOV. Eliminate finger tension and learn feather-light mouse control.',
      difficultyLabel: 'BASIC',
      difficultyBadgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      specs: '20 Targets · 5m Range · Micro Head',
      accentGlow: 'hover:border-purple-500/50 hover:shadow-purple-500/15',
      icon: Target,
    },
    {
      id: 'tile-frenzy' as const,
      tier: 'basic' as const,
      category: 'switching' as const,
      tag: 'TILE SWITCHING',
      tagColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      disciplineColor: '#f97316',
      title: 'Tile Frenzy (Rhythm & Tempo)',
      description: '30-second target destruction challenge. Build foundational rhythm and clean visual scanning across three active tiles.',
      difficultyLabel: 'BASIC',
      difficultyBadgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      specs: '30s Duration · 3 Active Tiles · Combo x3',
      accentGlow: 'hover:border-orange-500/50 hover:shadow-orange-500/15',
      icon: Zap,
    },
    {
      id: 'stopping-power' as const,
      tier: 'basic' as const,
      category: 'clicking' as const,
      tag: 'STOPPING POWER',
      tagColor: 'text-lime-400 bg-lime-500/10 border-lime-500/30',
      disciplineColor: '#84cc16',
      title: 'Stopping Power 5m (Foundation)',
      description: 'Practice progressive mouse deceleration without wrist shock. Train smooth friction braking before confirming the shot.',
      difficultyLabel: 'BASIC',
      difficultyBadgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      specs: '15 Targets · 5m Range · Stop Confirm',
      accentGlow: 'hover:border-lime-500/50 hover:shadow-lime-500/15',
      icon: ShieldAlert,
    },
    {
      id: 'benchmark' as const,
      tier: 'basic' as const,
      category: 'labs' as const,
      tag: 'CALIBRATION',
      tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      disciplineColor: '#3b82f6',
      title: 'DPI & Sens Physics Calibration',
      description: 'Universal esports mouse mass & inertia simulation (30g to 140g). Test pro gamer sensitivities with 1-click trials.',
      difficultyLabel: 'BASIC',
      difficultyBadgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      specs: 'Hardware Physics · 1000Hz Polling · eDPI Math',
      accentGlow: 'hover:border-blue-500/50 hover:shadow-blue-500/15',
      icon: Sliders,
    },

    // INTERMEDIATE (4)
    {
      id: 'stopping-power' as const,
      tier: 'intermediate' as const,
      category: 'clicking' as const,
      tag: 'WIDE SNAP',
      tagColor: 'text-lime-400 bg-lime-500/10 border-lime-500/30',
      disciplineColor: '#84cc16',
      title: 'Stopping Power 10m (Anti-Bounce)',
      description: '15 wide-angle flick targets. Overcome stop-bounce tremor and develop zero-recoil mousepad deceleration.',
      difficultyLabel: 'INTERMEDIATE',
      difficultyBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      specs: '15 Targets · 10m Range · Wide Angle',
      accentGlow: 'hover:border-lime-500/50 hover:shadow-lime-500/15',
      icon: ShieldAlert,
    },
    {
      id: 'tile-frenzy' as const,
      tier: 'intermediate' as const,
      category: 'switching' as const,
      tag: 'RAPID SWITCH',
      tagColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      disciplineColor: '#f97316',
      title: 'Tile Frenzy Dynamic (30s Speed)',
      description: 'High-tempo dynamic target sequence. Accelerate target acquisition speed while preserving clean confirmation.',
      difficultyLabel: 'INTERMEDIATE',
      difficultyBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      specs: '30s Clock · Dynamic Wall · High Pace',
      accentGlow: 'hover:border-orange-500/50 hover:shadow-orange-500/15',
      icon: Zap,
    },
    {
      id: 'whisper-grip' as const,
      tier: 'intermediate' as const,
      category: 'tracking' as const,
      tag: 'SMOOTH GLIDE',
      tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      disciplineColor: '#06b6d4',
      title: 'Smooth Micro-Glide 10m',
      description: 'Fluid micro-adjustments with zero jitter. Train steady forearm-finger coordination across subtle angle changes.',
      difficultyLabel: 'INTERMEDIATE',
      difficultyBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      specs: '20 Targets · 10m Distance · Jitter Filter',
      accentGlow: 'hover:border-cyan-500/50 hover:shadow-cyan-500/15',
      icon: Crosshair,
    },
    {
      id: 'clip-analyzer' as const,
      tier: 'intermediate' as const,
      category: 'labs' as const,
      tag: 'VOD AI HYGIENE',
      tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      disciplineColor: '#818cf8',
      title: 'Gunfight Clip VOD Analyzer',
      description: 'Inspect crosshair placement with 4x digital zoom lens, 16ms frame-stepping, and automatic duel hygiene report card.',
      difficultyLabel: 'INTERMEDIATE',
      difficultyBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      specs: 'Frame-by-Frame · 4x Zoom · Telemetry Report',
      accentGlow: 'hover:border-indigo-500/50 hover:shadow-indigo-500/15',
      icon: Video,
    },

    // ADVANCED (4)
    {
      id: 'stopping-power' as const,
      tier: 'advanced' as const,
      category: 'flicking' as const,
      tag: 'RADIANT SNAP',
      tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      disciplineColor: '#a855f7',
      title: 'Stopping Power 15m (Radiant Snap)',
      description: 'Maximum distance flick execution. Test absolute precision under rapid acceleration and sub-frame deceleration.',
      difficultyLabel: 'ADVANCED',
      difficultyBadgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      specs: '15 Targets · 15m Long Range · Extreme Snap',
      accentGlow: 'hover:border-purple-500/50 hover:shadow-purple-500/15',
      icon: Target,
    },
    {
      id: 'tile-frenzy' as const,
      tier: 'advanced' as const,
      category: 'switching' as const,
      tag: 'SPEED GATE',
      tagColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      disciplineColor: '#f97316',
      title: 'Tile Frenzy Speed Gate (Overdrive)',
      description: 'Elite speed challenge. Maintain 95%+ accuracy under extreme firing wall cadence with punishing misses.',
      difficultyLabel: 'ADVANCED',
      difficultyBadgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      specs: '30s Sprint · Punishing Accuracy · 100+ Goal',
      accentGlow: 'hover:border-orange-500/50 hover:shadow-orange-500/15',
      icon: Zap,
    },
    {
      id: 'whisper-grip' as const,
      tier: 'advanced' as const,
      category: 'flicking' as const,
      tag: 'MICRO HEADSHOT',
      tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      disciplineColor: '#a855f7',
      title: 'Pixel-Perfect Micro Headshot',
      description: 'Ultra-small target radius requiring sub-millimeter mouse control. Eliminates over-aiming on defensive angles.',
      difficultyLabel: 'ADVANCED',
      difficultyBadgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      specs: '20 Targets · 0.2m Hitbox · Strict Confirmation',
      accentGlow: 'hover:border-purple-500/50 hover:shadow-purple-500/15',
      icon: Crosshair,
    },
    {
      id: 'diagnostics' as const,
      tier: 'advanced' as const,
      category: 'labs' as const,
      tag: 'TELEMETRY LAB',
      tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      disciplineColor: '#06b6d4',
      title: 'Live Tremor & Jerk Oscilloscope',
      description: 'Raw unaccelerated mouse input telemetry. Real-time path stability scoring, velocity graphs, and tension detection.',
      difficultyLabel: 'ADVANCED',
      difficultyBadgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      specs: '1000Hz Oscilloscope · Path Jerk Math · Real-time',
      accentGlow: 'hover:border-cyan-500/50 hover:shadow-cyan-500/15',
      icon: Activity,
    },
  ];

  const basicCount = drills.filter((d) => d.tier === 'basic').length;
  const intermediateCount = drills.filter((d) => d.tier === 'intermediate').length;
  const advancedCount = drills.filter((d) => d.tier === 'advanced').length;

  const filteredDrills = drills.filter((d) => {
    if (tierFilter !== 'all' && d.tier !== tierFilter) return false;
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.tag.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleLaunch = (drillId: 'whisper-grip' | 'stopping-power' | 'tile-frenzy' | 'clip-analyzer' | 'diagnostics' | 'benchmark') => {
    audioEngine.playClick();
    if (drillId === 'tile-frenzy' || drillId === 'whisper-grip' || drillId === 'stopping-power') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }
    onSelectTab(drillId);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 select-none">
      {/* Top Banner with Active Sensitivity HUD */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0c101c] via-[#121828] to-[#0a0f1b] border border-[#212d45] rounded-3xl p-6 lg:p-7 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase font-mono tracking-widest text-blue-400">
                TACTICAL CASUAL PLAY & DRILL CATALOG
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-wide uppercase">
              CASUAL PLAY SCENARIO HUB
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Target confirmation over panic flicking. Practice individual skill components with verified 1:1 Valorant FOV and mouse deceleration.
            </p>
          </div>

          {/* Quick Hardware & Sens Widget */}
          <div className="bg-[#0f1422] border border-[#222e47] rounded-2xl p-3.5 flex items-center gap-4 shadow-xl shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <span className="text-slate-400 block font-mono text-[10px] uppercase">ACTIVE MOUSE:</span>
              <span className="font-bold text-white block">{settings.mouseModel || 'Universal Mouse'}</span>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5">
                <span className="text-blue-300 font-bold">{edpi} eDPI</span>
                <span>·</span>
                <span>{cm360} cm/360°</span>
              </div>
            </div>
            <button
              onClick={() => {
                audioEngine.playClick();
                openSettings();
              }}
              className="p-2 rounded-xl bg-[#172136] hover:bg-[#202e4d] border border-[#273757] text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Calibrate Profile"
            >
              <Sliders className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Difficulty Tier Tabs matching Benchmark Screenshot 5 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#1b253b] pb-4">
        {/* Tier Tabs: ALL, BASIC (4), INTERMEDIATE (4), ADVANCED (4) */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0d1220] border border-[#1f2b44]">
          <button
            onClick={() => {
              audioEngine.playClick();
              setTierFilter('all');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tierFilter === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#151c2e]'
            }`}
          >
            <span>ALL DRILLS</span>
            <span className="ml-1.5 text-[10px] font-mono opacity-80">({drills.length})</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              setTierFilter('basic');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tierFilter === 'basic'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#151c2e]'
            }`}
          >
            <span>BASIC</span>
            <span className="ml-1.5 text-[10px] font-mono opacity-80">({basicCount})</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              setTierFilter('intermediate');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tierFilter === 'intermediate'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#151c2e]'
            }`}
          >
            <span>INTERMEDIATE</span>
            <span className="ml-1.5 text-[10px] font-mono opacity-80">({intermediateCount})</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              setTierFilter('advanced');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tierFilter === 'advanced'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#151c2e]'
            }`}
          >
            <span>ADVANCED</span>
            <span className="ml-1.5 text-[10px] font-mono opacity-80">({advancedCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search scenarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0d1220] border border-[#1f2b44] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Discipline Filter Pills: ALL, FLICKING, SWITCHING, CLICKING, TRACKING, LABS */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            audioEngine.playClick();
            setCategoryFilter('all');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            categoryFilter === 'all'
              ? 'bg-[#182338] text-white border border-[#2b3c5e]'
              : 'text-slate-400 hover:text-white bg-[#0e1322] border border-[#192236]'
          }`}
        >
          ALL CATEGORIES
        </button>

        <button
          onClick={() => {
            audioEngine.playClick();
            setCategoryFilter('flicking');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            categoryFilter === 'flicking'
              ? 'bg-purple-950/60 text-purple-300 border border-purple-500/50'
              : 'text-slate-400 hover:text-purple-300 bg-[#0e1322] border border-[#192236]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span>FLICKING</span>
        </button>

        <button
          onClick={() => {
            audioEngine.playClick();
            setCategoryFilter('switching');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            categoryFilter === 'switching'
              ? 'bg-orange-950/60 text-orange-300 border border-orange-500/50'
              : 'text-slate-400 hover:text-orange-300 bg-[#0e1322] border border-[#192236]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          <span>SWITCHING</span>
        </button>

        <button
          onClick={() => {
            audioEngine.playClick();
            setCategoryFilter('clicking');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            categoryFilter === 'clicking'
              ? 'bg-lime-950/60 text-lime-300 border border-lime-500/50'
              : 'text-slate-400 hover:text-lime-300 bg-[#0e1322] border border-[#192236]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-lime-400" />
          <span>CLICKING</span>
        </button>

        <button
          onClick={() => {
            audioEngine.playClick();
            setCategoryFilter('tracking');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            categoryFilter === 'tracking'
              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-cyan-300 bg-[#0e1322] border border-[#192236]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>TRACKING</span>
        </button>

        <button
          onClick={() => {
            audioEngine.playClick();
            setCategoryFilter('labs');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            categoryFilter === 'labs'
              ? 'bg-blue-950/60 text-blue-300 border border-blue-500/50'
              : 'text-slate-400 hover:text-blue-300 bg-[#0e1322] border border-[#192236]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>LABS & TELEMETRY</span>
        </button>

        <div className="ml-auto hidden md:flex items-center gap-2 text-xs font-mono text-slate-400">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Showing {filteredDrills.length} Scenarios</span>
        </div>
      </div>

      {/* 16:9 Scenario Cards Grid matching Benchmark Screenshot 5 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrills.map((drill, index) => {
          return (
            <div
              key={`${drill.id}-${drill.tier}-${index}`}
              className={`group relative bg-[#0e1322] border border-[#1e2a42] rounded-2xl overflow-hidden transition-all duration-200 shadow-xl flex flex-col justify-between ${drill.accentGlow}`}
            >
              {/* Top 16:9 Visual Preview Banner with Valorant Badge & Grid */}
              <div className="relative aspect-video w-full bg-[#0a0e1a] border-b border-[#1b253b] overflow-hidden flex items-center justify-center">
                {/* Visual Grid Backdrop */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 70%),
                      linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '100% 100%, 24px 24px, 24px 24px',
                  }}
                />

                {/* Target Illustration on Canvas */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                    style={{
                      borderColor: drill.disciplineColor,
                      backgroundColor: `${drill.disciplineColor}15`,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${drill.disciplineColor}40` }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: drill.disciplineColor }}
                      />
                    </div>
                  </div>
                </div>

                {/* Top-Left Game Badge Overlay (Valorant V) matching Screenshot 5 */}
                <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
                  <div className="w-6 h-6 rounded-md bg-[#ff4655] flex items-center justify-center text-white font-black text-xs shadow-md">
                    V
                  </div>
                  <span className={`text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-md border ${drill.tagColor}`}>
                    {drill.tag}
                  </span>
                </div>

                {/* Top-Right Difficulty Badge */}
                <div className="absolute top-3 right-3 z-20">
                  <span className={`text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-md border ${drill.difficultyBadgeColor}`}>
                    {drill.difficultyLabel}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors mb-1.5">
                    {drill.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {drill.description}
                  </p>
                </div>

                {/* Specs and Launch Row */}
                <div className="pt-3 border-t border-[#1a2336] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    {drill.specs}
                  </span>

                  <button
                    onClick={() => handleLaunch(drill.id)}
                    className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
                  >
                    <span>PLAY</span>
                    <Play className="w-3 h-3 fill-white" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

