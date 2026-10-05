import React, { useState } from 'react';
import {
  Sparkles,
  Gamepad2,
  Activity,
  Sliders,
  Trophy,
  Calendar,
  Video,
  ChevronDown,
  ChevronRight,
  Target,
  MessageSquare,
  Award,
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { TargetLogo } from './TargetLogo';

export type NavTab =
  | 'hero'
  | 'radiant'
  | 'hub'
  | 'rank-overview'
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
  const [isSkillsExpanded, setIsSkillsExpanded] = useState(true);
  const [isGlobalRankExpanded, setIsGlobalRankExpanded] = useState(true);

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
    `relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
      isActive
        ? 'bg-[#172238] text-white shadow-[0_0_15px_rgba(59,130,246,0.15)] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-blue-500 before:rounded-r'
        : 'text-slate-400 hover:text-slate-200 hover:bg-[#131a29]'
    }`;

  const subNavItemClass = (isActive: boolean) =>
    `relative w-full flex items-center gap-2.5 pl-7 pr-3 py-2 rounded-lg text-[11px] font-semibold tracking-wide transition-all cursor-pointer ${
      isActive
        ? 'bg-[#172238] text-white before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-blue-500 before:rounded-r'
        : 'text-slate-400 hover:text-slate-200 hover:bg-[#121826]'
    }`;

  return (
    <aside
      className={`fixed lg:static top-0 left-0 z-40 h-full w-64 bg-[#0d121f] border-r border-[#1e283d] flex flex-col justify-between shrink-0 transition-transform duration-300 select-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top Header Logo */}
      <div className="p-4 border-b border-[#182236]">
        <button
          onClick={() => handleSelect('hero')}
          className="flex items-center gap-2.5 text-left group cursor-pointer w-full"
        >
          <div className="w-8 h-8 rounded-lg bg-[#141a26] border border-[#222d42] flex items-center justify-center shrink-0">
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
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* GROUP 1: TRAIN */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            TRAIN
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => handleSelect('radiant')}
              onMouseEnter={() => audioEngine.playHover()}
              className={navItemClass(activeTab === 'radiant')}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Path to Radiant</span>
            </button>

            <button
              onClick={() => handleSelect('hub')}
              onMouseEnter={() => audioEngine.playHover()}
              className={navItemClass(activeTab === 'hub')}
            >
              <Gamepad2 className="w-4 h-4 text-slate-300" />
              <span>Casual Play</span>
            </button>

            {/* Collapsible: Skills Training */}
            <div>
              <button
                onClick={() => setIsSkillsExpanded((prev) => !prev)}
                className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer rounded-xl hover:bg-[#131a29]"
              >
                <div className="flex items-center gap-2.5">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span>Skills Training</span>
                </div>
                {isSkillsExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {isSkillsExpanded && (
                <div className="mt-0.5 space-y-0.5 pl-2 border-l border-[#1a2336] ml-4">
                  <button
                    onClick={() => handleSelect('whisper')}
                    onMouseEnter={() => audioEngine.playHover()}
                    className={subNavItemClass(activeTab === 'whisper')}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Flicking (Micro)</span>
                  </button>

                  <button
                    onClick={() => handleSelect('tile-frenzy')}
                    onMouseEnter={() => audioEngine.playHover()}
                    className={subNavItemClass(activeTab === 'tile-frenzy')}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    <span>Switching (Tile)</span>
                  </button>

                  <button
                    onClick={() => handleSelect('stopping')}
                    onMouseEnter={() => audioEngine.playHover()}
                    className={subNavItemClass(activeTab === 'stopping')}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                    <span>Clicking (Stopping)</span>
                  </button>

                  <button
                    onClick={() => handleSelect('whisper')}
                    onMouseEnter={() => audioEngine.playHover()}
                    className={subNavItemClass(false)}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Tracking (Smooth)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GROUP 2: COMPETE */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            COMPETE
          </div>
          <div className="space-y-0.5">
            {/* Collapsible: Global Aim Rank */}
            <div>
              <button
                onClick={() => setIsGlobalRankExpanded((prev) => !prev)}
                className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer rounded-xl hover:bg-[#131a29]"
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Global Aim Rank</span>
                </div>
                {isGlobalRankExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {isGlobalRankExpanded && (
                <div className="mt-0.5 space-y-0.5 pl-2 border-l border-[#1a2336] ml-4">
                  <button
                    onClick={() => handleSelect('rank-overview')}
                    onMouseEnter={() => audioEngine.playHover()}
                    className={subNavItemClass(activeTab === 'rank-overview')}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>My Rank Overview</span>
                  </button>

                  <button
                    onClick={() => handleSelect('leaderboard')}
                    onMouseEnter={() => audioEngine.playHover()}
                    className={subNavItemClass(activeTab === 'leaderboard')}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>Leaderboards</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleSelect('leaderboard')}
              onMouseEnter={() => audioEngine.playHover()}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-[#131a29] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Daily Challenge</span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                ACTIVE
              </span>
            </button>

            <button
              onClick={() => handleSelect('leaderboard')}
              onMouseEnter={() => audioEngine.playHover()}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-[#131a29] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-purple-400" />
                <span>League</span>
              </div>
              <span className="text-[9px] font-mono text-purple-300 font-bold px-1.5 py-0.5 rounded bg-purple-500/20">
                SEASON 1
              </span>
            </button>
          </div>
        </div>

        {/* GROUP 3: ANALYZE */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            ANALYZE
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => handleSelect('analytics')}
              onMouseEnter={() => audioEngine.playHover()}
              className={navItemClass(activeTab === 'analytics')}
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Stats & Progress</span>
            </button>

            <button
              onClick={() => handleSelect('clip-analyzer')}
              onMouseEnter={() => audioEngine.playHover()}
              className={navItemClass(activeTab === 'clip-analyzer')}
            >
              <Video className="w-4 h-4 text-indigo-400" />
              <span>VOD Analyzer</span>
            </button>

            <button
              onClick={() => handleSelect('calibrator')}
              onMouseEnter={() => audioEngine.playHover()}
              className={navItemClass(activeTab === 'calibrator')}
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Sens Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Discord Widget matching 3D Aim Trainer Benchmark */}
      <div className="p-3 border-t border-[#182236]">
        <div className="p-3 rounded-2xl bg-[#111728] border border-[#212d45] text-left">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-md bg-[#5865f2] flex items-center justify-center text-white">
              <MessageSquare className="w-3 h-3" />
            </div>
            <span className="text-xs font-black text-white tracking-wide">
              Game on Discord!
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight mb-2.5">
            Connect with 70,000+ aimers, win rewards, and share clips.
          </p>
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              window.open('https://discord.gg', '_blank');
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#5865f2]/20"
          >
            <span>Join Discord</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

