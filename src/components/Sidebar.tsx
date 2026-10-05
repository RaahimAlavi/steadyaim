import React from 'react';
import {
  Sparkles,
  Gamepad2,
  Flame,
  Crosshair,
  Shield,
  Activity,
  Sliders,
  Trophy,
  Zap,
  Globe,
  Calendar,
  Video,
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { TargetLogo } from './TargetLogo';

export type NavTab =
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

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
}) => {
  const handleSelect = (tab: NavTab) => {
    audioEngine.playClick();
    if (tab === 'tile-frenzy' || tab === 'whisper' || tab === 'stopping') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const navItemClass = (isActive: boolean) =>
    `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
      isActive
        ? 'bg-[#151c2e] text-[#00f5d4] border border-[#00f5d4]/40 shadow-[0_0_16px_rgba(0,245,212,0.2)]'
        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b2c] border border-transparent'
    }`;

  return (
    <aside
      className={`fixed lg:static top-0 left-0 z-40 h-full w-64 bg-[#0d121f] border-r border-[#1e283d] flex flex-col justify-between shrink-0 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top Header Logo */}
      <div className="p-5 border-b border-[#182236]">
        <button
          onClick={() => handleSelect('hero')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#141a26] border border-[#222d42] flex items-center justify-center">
            <TargetLogo size={20} />
          </div>
          <div>
            <div className="font-black text-sm tracking-widest text-white uppercase flex items-center gap-1.5">
              STEADYAIM
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-500/20 text-blue-300">
                PRO
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">TACTICAL AIM LAB</div>
          </div>
        </button>
      </div>

      {/* Nav Groups matching 3D Aim Trainer Benchmark */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* GROUP 1: TRAIN */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            TRAIN
          </div>
          <div className="space-y-1">
            <button
              onClick={() => handleSelect('radiant')}
              onMouseEnter={() => audioEngine.playHover()}
              className={navItemClass(activeTab === 'radiant')}
            >
              <Sparkles className="w-4 h-4 text-[#00f5d4]" />
              <span>Path to Radiant</span>
            </button>

            <button
              onClick={() => handleSelect('hub')}
              onMouseEnter={() => audioEngine.playHover()}
              className={navItemClass(activeTab === 'hub')}
            >
              <Gamepad2 className="w-4 h-4 text-slate-300" />
              <span>Drill Hub</span>
            </button>

            <button
              onClick={() => handleSelect('tile-frenzy')}
              onMouseEnter={() => audioEngine.playHover()}
              className={navItemClass(activeTab === 'tile-frenzy')}
            >
              <Flame className="w-4 h-4 text-[#ffb703]" />
              <span>Tile Frenzy (30s)</span>
            </button>

            <button
              onClick={() => handleSelect('whisper')}
              onMouseEnter={() => audioEngine.playHover()}
              className={navItemClass(activeTab === 'whisper')}
            >
              <Crosshair className="w-4 h-4 text-[#00f5d4]" />
              <span>Whisper Grip 5m</span>
            </button>

            <button
              onClick={() => handleSelect('stopping')}
              onMouseEnter={() => audioEngine.playHover()}
              className={navItemClass(activeTab === 'stopping')}
            >
              <Shield className="w-4 h-4 text-[#ff4655]" />
              <span>Stopping Power 10m</span>
            </button>
          </div>
        </div>

        {/* GROUP 2: COMPETE */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            COMPETE
          </div>
          <div className="space-y-1">
            <button
              onClick={() => handleSelect('leaderboard')}
              onMouseEnter={() => audioEngine.playHover()}
              className={navItemClass(activeTab === 'leaderboard')}
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Global Standings</span>
            </button>

            <button
              onClick={() => handleSelect('leaderboard')}
              onMouseEnter={() => audioEngine.playHover()}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-[#0f1422] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Daily Practice</span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                ACTIVE
              </span>
            </button>

            <button
              onClick={() => handleSelect('leaderboard')}
              onMouseEnter={() => audioEngine.playHover()}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-[#0f1422] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Tier Bracket</span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 font-bold">IMMORTAL</span>
            </button>
          </div>
        </div>

        {/* GROUP 3: ANALYZE */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            ANALYZE
          </div>
          <div className="space-y-1">
            <button
              onClick={() => handleSelect('analytics')}
              onMouseEnter={() => audioEngine.playHover()}
              className={navItemClass(activeTab === 'analytics')}
            >
              <Activity className="w-4 h-4 text-[#00f5d4]" />
              <span>Telemetry & Heatmap</span>
            </button>

            <button
              onClick={() => handleSelect('clip-analyzer')}
              onMouseEnter={() => audioEngine.playHover()}
              className={navItemClass(activeTab === 'clip-analyzer')}
            >
              <Video className="w-4 h-4 text-[#00f5d4]" />
              <span>VOD & Clip Analyzer</span>
            </button>
          </div>
        </div>

        {/* GROUP 4: HARDWARE */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            HARDWARE
          </div>
          <div className="space-y-1">
            <button
              onClick={() => handleSelect('calibrator')}
              onMouseEnter={() => audioEngine.playHover()}
              className={navItemClass(activeTab === 'calibrator')}
            >
              <Sliders className="w-4 h-4 text-[#ffb703]" />
              <span>DPI & Sens Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Gaming Hub Banner matching 3D Aim Trainer benchmark */}
      <div className="p-3 border-t border-[#141a29]">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#121929] to-[#0a0f1c] border border-[#1e2a44] text-left">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="w-4 h-4 text-[#ffb703]" />
            <span className="text-[11px] font-black text-white uppercase tracking-wider">
              GAMING HUB
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
            Hardware acceleration sync and 1000Hz polling active.
          </p>
          <button
            onClick={() => handleSelect('calibrator')}
            className="w-full py-1.5 px-3 rounded-lg bg-[#00f5d4]/15 hover:bg-[#00f5d4]/25 text-[#00f5d4] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#00f5d4]/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sliders className="w-3 h-3" />
            <span>CALIBRATE HARDWARE</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
