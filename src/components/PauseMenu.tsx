import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Download, Sliders, RotateCcw, Play, LogOut, Keyboard, MousePointer } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface PauseMenuProps {
  exerciseTitle?: string;
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onExit: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  exerciseTitle = 'Chapter 1 - Exercise 1',
  onResume,
  onRestart,
  onOpenSettings,
  onExit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        '.pause-menu-item',
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, stagger: 0.06, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.pause-right-card',
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, delay: 0.15, ease: 'back.out(1.2)' }
      );
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-50 bg-[#07090e]/85 backdrop-blur-md flex flex-col justify-between p-6 sm:p-10 select-none animate-in fade-in duration-200"
    >
      {/* Top Left Header matching 3D Aim Trainer Pause Screen */}
      <div>
        <div className="flex flex-col">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase mb-1">
            GAME PAUSED
          </h2>
          <span className="text-xs sm:text-sm text-slate-400 font-mono tracking-wide">
            {exerciseTitle}
          </span>
        </div>
        {/* Thin accent line */}
        <div className="w-full max-w-xl h-[1.5px] bg-gradient-to-r from-blue-600 via-blue-500/40 to-transparent mt-3" />
      </div>

      {/* Middle Section: Menu Buttons & Tactical Controls Guide */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 my-auto max-w-4xl w-full">
        {/* Left Menu Stacked Buttons */}
        <div className="flex flex-col gap-2.5 w-full max-w-xs">
          <button
            onClick={() => {
              audioEngine.playClick();
              onResume();
            }}
            onMouseEnter={() => audioEngine.playHover()}
            className="pause-menu-item group flex items-center justify-between px-5 py-3 rounded-xl bg-[#141b2b] hover:bg-[#1d273e] text-white font-extrabold text-sm tracking-widest uppercase border border-[#232f48] hover:border-blue-500/60 transition-all cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <Play className="w-4 h-4 text-blue-400" />
              <span>CONTINUE</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e283d] text-slate-300 border border-[#2d3a54]">
              ESC / TAB
            </span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              onRestart();
            }}
            onMouseEnter={() => audioEngine.playHover()}
            className="pause-menu-item flex items-center justify-between px-5 py-3 rounded-xl bg-[#141b2b] hover:bg-[#1d273e] text-slate-200 hover:text-white font-extrabold text-sm tracking-widest uppercase border border-[#232f48] hover:border-blue-500/60 transition-all cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>RESTART</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e283d] text-slate-300 border border-[#2d3a54]">
              Y
            </span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              onOpenSettings();
            }}
            onMouseEnter={() => audioEngine.playHover()}
            className="pause-menu-item flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#141b2b] hover:bg-[#1d273e] text-slate-200 hover:text-white font-extrabold text-sm tracking-widest uppercase border border-[#232f48] hover:border-blue-500/60 transition-all cursor-pointer shadow-md"
          >
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>SETTINGS</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              onExit();
            }}
            onMouseEnter={() => audioEngine.playHover()}
            className="pause-menu-item flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#141b2b] hover:bg-[#201720] text-slate-300 hover:text-rose-300 font-extrabold text-sm tracking-widest uppercase border border-[#232f48] hover:border-rose-500/40 transition-all cursor-pointer shadow-md"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>EXIT DRILL</span>
          </button>
        </div>

        {/* Keyboard & Controls Reference Guide */}
        <div className="pause-right-card w-full max-w-xs p-4 rounded-2xl bg-[#0e121d] border border-[#1f283d] shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Keyboard className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              KEYBOARD & CONTROLS
            </h4>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between py-1 border-b border-[#182033]">
              <span className="text-slate-400">Pause / Resume</span>
              <span className="px-1.5 py-0.5 rounded bg-[#182136] text-white text-[11px] border border-[#283654]">
                ESC / TAB
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#182033]">
              <span className="text-slate-400">Quick Restart</span>
              <span className="px-1.5 py-0.5 rounded bg-[#182136] text-white text-[11px] border border-[#283654]">
                Y
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#182033]">
              <span className="text-slate-400">Fire Weapon</span>
              <span className="px-1.5 py-0.5 rounded bg-[#182136] text-white text-[11px] border border-[#283654] flex items-center gap-1">
                <MousePointer className="w-3 h-3 text-blue-400" />
                M1 (Left Click)
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Aim / Look</span>
              <span className="px-1.5 py-0.5 rounded bg-[#182136] text-white text-[11px] border border-[#283654]">
                Raw Mouse
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right Gaming Hub Card */}
      <div className="pause-right-card self-end max-w-xs p-4 rounded-2xl bg-[#0f1422] border border-[#1e273d] shadow-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-orange-400 uppercase">
            CALIBRATION & SENS LAB
          </span>
        </div>
        <h4 className="text-xs font-bold text-white mb-1">Lag or Sens Issues?</h4>
        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
          Calibrate raw mouse input and remove Windows pointer precision.
        </p>
        <button
          onClick={() => {
            audioEngine.playClick();
            onOpenSettings();
          }}
          className="w-full py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>OPEN CALIBRATOR</span>
        </button>
      </div>
    </div>
  );
};
