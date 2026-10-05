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
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';

interface DrillHubProps {
  settings: UserSettings;
  onSelectTab: (tab: 'whisper-grip' | 'stopping-power' | 'tile-frenzy' | 'clip-analyzer' | 'diagnostics' | 'benchmark') => void;
  openSettings: () => void;
}

export const DrillHub: React.FC<DrillHubProps> = ({
  settings,
  onSelectTab,
  openSettings,
}) => {
  const [filter, setFilter] = useState<'all' | '3d' | 'analytics' | 'hardware'>('all');

  const edpi = calculateEDPI(settings.dpi, settings.sensitivity);
  const cm360 = calculateCm360(settings.dpi, settings.sensitivity);

  const drills = [
    {
      id: 'whisper-grip' as const,
      category: '3d',
      tag: 'CALM MICRO-ADJUST',
      tagColor: 'text-[#00f5d4] bg-[#00f5d4]/10 border-[#00f5d4]/30',
      title: '3D Whisper Grip Simulator',
      description: '20 tactical micro-targets in 3D space with exact Valorant 103° FOV. Train feather-light grip and eliminate finger tremor.',
      difficulty: 'RADIANT COMPOSURE',
      badge: 'RECOMMENDED',
      badgeColor: 'bg-[#ff4655] text-white',
      accentGlow: 'hover:border-[#00f5d4]/60 hover:shadow-[#00f5d4]/15',
      icon: Target,
    },
    {
      id: 'stopping-power' as const,
      category: '3d',
      tag: 'ANTI-BOUNCE FLICK',
      tagColor: 'text-[#ff4655] bg-[#ff4655]/10 border-[#ff4655]/30',
      title: '3D Stopping Power Drill',
      description: '15 wide-angle flick targets. Learn progressive deceleration using mousepad friction rather than stiff wrist braking.',
      difficulty: 'INTERMEDIATE',
      badge: 'POPULAR',
      badgeColor: 'bg-[#1e2538] text-slate-300',
      accentGlow: 'hover:border-[#ff4655]/60 hover:shadow-[#ff4655]/15',
      icon: ShieldAlert,
    },
    {
      id: 'tile-frenzy' as const,
      category: '3d',
      tag: 'RAPID SWITCHING',
      tagColor: 'text-[#ffb703] bg-[#ffb703]/10 border-[#ffb703]/30',
      title: 'Dynamic Tile Frenzy (30s)',
      description: '30-second rapid target destruction challenge. 3 active glowing tiles on the arena firing wall with combo multipliers.',
      difficulty: 'HIGH TEMPO',
      badge: '3D AIM TRAINER STYLE',
      badgeColor: 'bg-[#ffb703] text-black font-black',
      accentGlow: 'hover:border-[#ffb703]/60 hover:shadow-[#ffb703]/15',
      icon: Zap,
    },
    {
      id: 'clip-analyzer' as const,
      category: 'analytics',
      tag: 'VOD AI HYGIENE',
      tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      title: 'Gunfight Clip VOD Analyzer',
      description: 'Inspect crosshair placement with 4x digital zoom lens, 16ms frame-stepping, and automatic duel hygiene report card.',
      difficulty: 'CLUTCH DIAGNOSTIC',
      badge: 'AI PRECISION',
      badgeColor: 'bg-indigo-600 text-white',
      accentGlow: 'hover:border-indigo-500/60 hover:shadow-indigo-500/15',
      icon: Video,
    },
    {
      id: 'diagnostics' as const,
      category: 'analytics',
      tag: 'PHYSIOLOGY LAB',
      tagColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      title: 'Live Tremor & Jerk Oscilloscope',
      description: 'Raw unaccelerated hardware mouse input telemetry. Real-time path stability scoring, velocity graphs, and tension detection.',
      difficulty: 'TELEMETRY',
      badge: 'LIVE OSCILLOSCOPE',
      badgeColor: 'bg-[#1e2538] text-slate-300',
      accentGlow: 'hover:border-sky-400/60 hover:shadow-sky-400/15',
      icon: Activity,
    },
    {
      id: 'benchmark' as const,
      category: 'hardware',
      tag: 'HARDWARE & SENS',
      tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      title: 'Sens & Hardware Physics Lab',
      description: 'Universal esports mouse mass & inertia calibration (30g to 140g). Compare against pro sensitivities with 1-click trials.',
      difficulty: 'CALIBRATION',
      badge: 'UNIVERSAL MOUSE',
      badgeColor: 'bg-[#1e2538] text-slate-300',
      accentGlow: 'hover:border-emerald-400/60 hover:shadow-emerald-400/15',
      icon: Sliders,
    },
  ];

  const filteredDrills = drills.filter((d) => {
    if (filter === 'all') return true;
    return d.category === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Training Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0d101a] via-[#121624] to-[#0a0d15] border border-[#21283b] rounded-3xl p-6 lg:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00f5d4] animate-ping" />
              <span className="text-[10px] font-black uppercase font-mono tracking-widest text-[#00f5d4]">
                ESPORTS PERFORMANCE PROTOCOL
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-wide uppercase">
              TACTICAL FPS TRAINING & HYGIENE HUB
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Target confirmation over panic flicking. Train calm micro-adjustments, anti-death-grip composure,
              and clean deceleration in an exact 1:1 Valorant engine.
            </p>
          </div>

          {/* Quick Hardware & Sens Widget */}
          <div className="bg-[#0b0e16] border border-[#222a3d] rounded-2xl p-4 flex items-center gap-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-[#ff4655]/15 border border-[#ff4655]/30 flex items-center justify-center text-[#ff4655]">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <span className="text-slate-400 block font-mono text-[10px] uppercase">Active Profile:</span>
              <span className="font-bold text-white block">{settings.mouseModel || 'Universal Mouse'}</span>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5">
                <span className="text-[#00f5d4] font-bold">{edpi} eDPI</span>
                <span>•</span>
                <span>{cm360} cm/360°</span>
              </div>
            </div>
            <button
              onClick={openSettings}
              className="p-2 rounded-xl bg-[#161c2b] hover:bg-[#20283c] border border-[#273248] text-slate-300 hover:text-white transition-all ml-1"
              title="Calibrate Profile"
            >
              <Sliders className="w-4 h-4 text-[#00f5d4]" />
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#ff4655]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#00f5d4]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter Tabs Bar (3D Aim Trainer style) */}
      <div className="flex items-center justify-between border-b border-[#1e2436] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-[#ff4655] text-white shadow-lg shadow-[#ff4655]/25'
                : 'text-slate-400 hover:text-white bg-[#111420] border border-[#1e2538]'
            }`}
          >
            <span>ALL DRILLS</span>
            <span className="ml-1.5 text-[10px] opacity-75 font-mono">6</span>
          </button>

          <button
            onClick={() => setFilter('3d')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === '3d'
                ? 'bg-[#ff4655] text-white shadow-lg shadow-[#ff4655]/25'
                : 'text-slate-400 hover:text-white bg-[#111420] border border-[#1e2538]'
            }`}
          >
            <span>3D FPS DRILLS</span>
            <span className="ml-1.5 text-[10px] opacity-75 font-mono">3</span>
          </button>

          <button
            onClick={() => setFilter('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'analytics'
                ? 'bg-[#ff4655] text-white shadow-lg shadow-[#ff4655]/25'
                : 'text-slate-400 hover:text-white bg-[#111420] border border-[#1e2538]'
            }`}
          >
            <span>ANALYTICS & VOD</span>
            <span className="ml-1.5 text-[10px] opacity-75 font-mono">2</span>
          </button>

          <button
            onClick={() => setFilter('hardware')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'hardware'
                ? 'bg-[#ff4655] text-white shadow-lg shadow-[#ff4655]/25'
                : 'text-slate-400 hover:text-white bg-[#111420] border border-[#1e2538]'
            }`}
          >
            <span>HARDWARE LAB</span>
            <span className="ml-1.5 text-[10px] opacity-75 font-mono">1</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <Layers className="w-3.5 h-3.5 text-[#00f5d4]" />
          <span>Showing {filteredDrills.length} Training Modules</span>
        </div>
      </div>

      {/* Drill Cards Grid (Aim Lab & 3D Aim Trainer Visual Hierarchy) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrills.map((drill) => {
          const Icon = drill.icon;

          return (
            <div
              key={drill.id}
              onClick={() => onSelectTab(drill.id)}
              className={`group relative bg-[#0e121d] border border-[#21293c] rounded-3xl p-6 transition-all duration-200 cursor-pointer shadow-xl flex flex-col justify-between ${drill.accentGlow}`}
            >
              <div>
                {/* Top Tags Row */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] uppercase font-bold font-mono px-2.5 py-0.5 rounded-full border ${drill.tagColor}`}>
                    {drill.tag}
                  </span>

                  {drill.badge && (
                    <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md ${drill.badgeColor}`}>
                      {drill.badge}
                    </span>
                  )}
                </div>

                {/* Title & Icon */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#151a28] border border-[#232c40] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-[#00f5d4] transition-colors">
                      {drill.title}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                      {drill.difficulty}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {drill.description}
                </p>
              </div>

              {/* Bottom Launch Button */}
              <div className="pt-4 border-t border-[#1b2234] flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white transition-colors flex items-center gap-1">
                  <span>Enter Session</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>

                <div className="w-8 h-8 rounded-xl bg-[#161c2a] group-hover:bg-[#ff4655] border border-[#252f44] group-hover:border-[#ff4655] flex items-center justify-center text-slate-300 group-hover:text-white transition-all shadow-md">
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pro Gunfight Hygiene Pillars Footer */}
      <div className="bg-[#0b0e16] border border-[#1e2436] rounded-3xl p-6 shadow-xl">
        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#00f5d4]" />
          <span>The Three Pillars of Radiant Gunfight Hygiene</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-white block">1. Confirmation Over Panic</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prematurely clicking while your crosshair is still decelerating leads to spray inaccuracy. Settle on the head, then fire.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-white block">2. Whisper-Light Grip Pressure</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clenching the side walls with your thumb and pinky causes micro-tremors in your flexor tendons. Hold the mouse like an egg.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-white block">3. Friction-Assisted Braking</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Avoid rigidly locking your wrist to stop flicks. Let your mousepad surface absorb momentum to prevent stop-bounce recoil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
