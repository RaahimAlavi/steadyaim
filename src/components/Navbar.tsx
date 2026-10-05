import React from 'react';
import type { UserSettings } from '../types';
import { calculateEDPI, calculateCm360 } from '../utils/aimMath';
import {
  Sparkles,
  Gamepad2,
  Flame,
  Sliders,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Menu,
  Video,
  Home,
  Trophy,
  User,
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export type AppTab =
  | 'hero'
  | 'radiant'
  | 'hub'
  | 'tile-frenzy'
  | 'whisper'
  | 'stopping'
  | 'analytics'
  | 'clip-analyzer'
  | 'leaderboard'
  | 'calibrator';

interface NavbarProps {
  settings: UserSettings;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  openSettings: () => void;
  onOpenAuth: () => void;
  toggleSound: () => void;
  toggleSidebar: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeTab,
  setActiveTab,
  openSettings,
  onOpenAuth,
  toggleSound,
  toggleSidebar,
  isFullscreen,
  toggleFullscreen,
}) => {
  const edpi = calculateEDPI(settings.dpi, settings.sensitivity);
  const cm360 = calculateCm360(settings.dpi, settings.sensitivity);

  const handleTabClick = (tab: AppTab) => {
    audioEngine.playClick();
    setActiveTab(tab);
  };

  return (
    <header className="w-full bg-[#0d121f]/95 border-b border-[#1e283d] px-4 lg:px-6 py-2.5 sticky top-0 z-30 backdrop-blur-md select-none">
      <div className="w-full flex items-center justify-between gap-3">
        {/* Left: Mobile Sidebar Toggle + Mode Navigation Pills */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audioEngine.playClick();
              toggleSidebar();
            }}
            className="lg:hidden p-2 rounded-xl bg-[#111624] border border-[#20283d] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Quick Switcher Pills for Primary Modes */}
          <nav className="hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-[#0f1422] border border-[#1e263d]">
            <button
              onClick={() => handleTabClick('hero')}
              onMouseEnter={() => audioEngine.playHover()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'hero'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#161e31]'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Hero</span>
            </button>

            <button
              onClick={() => handleTabClick('radiant')}
              onMouseEnter={() => audioEngine.playHover()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'radiant'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#161e31]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Path to Radiant</span>
            </button>

            <button
              onClick={() => handleTabClick('hub')}
              onMouseEnter={() => audioEngine.playHover()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'hub'
                  ? 'bg-[#1b253b] text-white border border-[#2e3e60]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#161e31]'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-slate-300" />
              <span>Drill Hub</span>
            </button>

            <button
              onClick={() => handleTabClick('tile-frenzy')}
              onMouseEnter={() => audioEngine.playHover()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tile-frenzy'
                  ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#161e31]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Tile Frenzy</span>
            </button>

            <button
              onClick={() => handleTabClick('leaderboard')}
              onMouseEnter={() => audioEngine.playHover()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-[#1b253b] text-amber-400 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#161e31]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => handleTabClick('clip-analyzer')}
              onMouseEnter={() => audioEngine.playHover()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'clip-analyzer'
                  ? 'bg-[#1b253b] text-blue-400 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#161e31]'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-blue-400" />
              <span>VOD Analyzer</span>
            </button>
          </nav>
        </div>

        {/* Right: Telemetry, User Auth, Sound & Fullscreen Controls */}
        <div className="flex items-center gap-2">
          {/* Active Sensitivity Pill */}
          <div className="hidden md:flex items-center gap-2 bg-[#0e1320] border border-[#1d263b] rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">SENS</span>
            <span className="font-bold text-blue-400 font-mono">{settings.sensitivity}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 font-mono text-[11px]">eDPI</span>
            <span className="font-bold text-white font-mono">{edpi}</span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-slate-400 text-[11px]">{cm360}cm/360</span>
          </div>

          {/* User Account / Cloud Sync Modal Trigger */}
          <button
            onClick={() => {
              audioEngine.playClick();
              onOpenAuth();
            }}
            title="Account, Cloud Sync & Session Database"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141b2a] hover:bg-[#1c2438] border border-[#232f48] text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Sync & Cloud</span>
          </button>

          {/* Sound Synthesizer Toggle */}
          <button
            onClick={() => {
              audioEngine.enabled = !audioEngine.enabled;
              toggleSound();
            }}
            title={settings.soundEnabled ? 'Mute Tactical Sounds' : 'Enable Tactical Sounds'}
            className="p-2 rounded-xl bg-[#0f1422] border border-[#1e263d] text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-blue-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              audioEngine.playClick();
              toggleFullscreen();
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (F11)'}
            className="p-2 rounded-xl bg-[#0f1422] border border-[#1e263d] text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-amber-400" />
            ) : (
              <Maximize className="w-4 h-4 text-slate-300" />
            )}
          </button>

          {/* Quick Settings Calibration Button */}
          <button
            onClick={() => {
              audioEngine.playClick();
              openSettings();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151c2e] border border-[#242f49] hover:border-slate-500 text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{settings.dpi} DPI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
