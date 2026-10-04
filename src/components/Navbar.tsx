import React from 'react';
import type { UserSettings } from '../types';

import { calculateEDPI, calculateCm360 } from '../utils/aimMath';
import { Activity, Target, ShieldAlert, Sliders, Volume2, VolumeX, MousePointer2 } from 'lucide-react';

interface NavbarProps {
  settings: UserSettings;
  activeTab: 'diagnostics' | 'whisper-grip' | 'stopping-power' | 'benchmark';
  setActiveTab: (tab: 'diagnostics' | 'whisper-grip' | 'stopping-power' | 'benchmark') => void;
  openSettings: () => void;
  toggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeTab,
  setActiveTab,
  openSettings,
  toggleSound,
}) => {
  const edpi = calculateEDPI(settings.dpi, settings.sensitivity);
  const cm360 = calculateCm360(settings.dpi, settings.sensitivity);

  return (
    <header className="w-full bg-[#0d0f17] border-b border-[#1f2433] px-4 lg:px-8 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff4655] to-[#ff7582] flex items-center justify-center shadow-lg shadow-[#ff4655]/20">
            <MousePointer2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white">STEADYAIM</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#ff4655]/20 text-[#ff4655] border border-[#ff4655]/30">
                PRO DIAGNOSTICS
              </span>
            </div>
            <p className="text-xs text-slate-400">FPS Mouse Stability & Anti-Jitter Trainer</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-[#131622] p-1 rounded-xl border border-[#222738] shadow-inner">
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'diagnostics'
                ? 'bg-[#ff4655] text-white shadow-md shadow-[#ff4655]/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1c2132]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Diagnostics Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('whisper-grip')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'whisper-grip'
                ? 'bg-[#ff4655] text-white shadow-md shadow-[#ff4655]/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1c2132]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Whisper Grip Drill</span>
          </button>

          <button
            onClick={() => setActiveTab('stopping-power')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'stopping-power'
                ? 'bg-[#ff4655] text-white shadow-md shadow-[#ff4655]/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1c2132]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Stopping Power</span>
          </button>

          <button
            onClick={() => setActiveTab('benchmark')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'benchmark'
                ? 'bg-[#ff4655] text-white shadow-md shadow-[#ff4655]/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1c2132]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Sens & G402 Guide</span>
          </button>
        </nav>

        {/* Quick Info & Action Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-[#131622] border border-[#222738] rounded-lg px-3 py-1.5 text-xs">
            <span className="text-slate-400">eDPI:</span>
            <span className="font-bold text-[#00f5d4]">{edpi}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">360°:</span>
            <span className="font-mono text-slate-300">{cm360}cm</span>
          </div>

          <button
            onClick={toggleSound}
            title={settings.soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            className="p-2 rounded-lg bg-[#131622] border border-[#222738] text-slate-300 hover:text-white hover:bg-[#1b2030] transition-colors"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-[#00f5d4]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={openSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1f2e] border border-[#2a324b] text-xs font-medium text-slate-200 hover:text-white hover:border-[#ff4655]/50 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-[#ff4655]" />
            <span>{settings.dpi} DPI / {settings.sensitivity} Sens</span>
          </button>
        </div>
      </div>
    </header>
  );
};
