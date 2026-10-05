import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Play, Flame, Shield, Crosshair, ArrowRight, Sparkles } from 'lucide-react';
import { Hero3DCanvas } from './Hero3DCanvas';
import DecryptedText from './reactbits/DecryptedText';
import CountUp from './reactbits/CountUp';
import { audioEngine } from '../utils/audioEngine';
import { storageEngine } from '../utils/storageEngine';

interface HeroLandingProps {
  onPlayNow: () => void;
  onSelectTab: (tab: 'radiant' | 'hub' | 'tile-frenzy' | 'whisper' | 'stopping') => void;
  currentEdpi: number;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onPlayNow,
  onSelectTab,
  currentEdpi,
}) => {
  const container = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);

  const sessions = storageEngine.getSessions();
  const sessionCount = sessions.length;
  const topScore = sessions.length > 0 ? Math.max(...sessions.map((s) => s.score)) : 3450;

  useGSAP(() => {
    // Staggered entrance animation for hero elements
    gsap.fromTo(
      gsap.utils.toArray('.gsap-reveal'),
      { y: 30, opacity: 0, filter: 'blur(8px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
    );
  }, { scope: container });

  const handlePlayHoverEnter = () => {
    audioEngine.playHover();
    gsap.to(playButtonRef.current, { scale: 1.03, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
  };
  const handlePlayHoverLeave = () => {
    gsap.to(playButtonRef.current, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
  };
  const handlePlayClick = () => {
    audioEngine.playClick();
    gsap.to(playButtonRef.current, { scale: 0.95, duration: 0.1, ease: 'power2.inOut', yoyo: true, repeat: 1 });
    onPlayNow();
  };

  return (
    <div ref={container} className="relative min-h-[92dvh] flex flex-col justify-between overflow-hidden bg-[#0b101d] border-b border-[#1c273c]">
      {/* Background Interactive 3D Canvas */}
      <Hero3DCanvas />

      {/* Subtle Tactical Vignette */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,_transparent_55%,_rgba(11,16,29,0.55)_100%] pointer-events-none z-10" />

      {/* Top Telemetry & Global Metrics Strip */}
      <div className="relative z-20 w-full pt-6 px-6 max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#0d111a]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#21293c] pointer-events-auto shadow-sm gsap-reveal">
          <span className="w-2 h-2 rounded-full bg-[#00f5d4] animate-pulse" />
          <span className="text-[11px] font-mono tracking-wider text-slate-300">
            ENGINE STATUS: ACTIVE · <span className="text-[#00f5d4] font-bold">eDPI {currentEdpi.toFixed(1)}</span>
          </span>
        </div>

        {/* 3 Metric Badges: Real sessions, 100% Free, Personal Best Score */}
        <div className="flex items-center gap-6 md:gap-10 pointer-events-auto gsap-reveal">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-black text-[#00f5d4] tracking-tight flex items-center justify-center">
              +<CountUp from={0} to={sessionCount} duration={1.2} className="inline" />
            </div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              Rounds Played
            </div>
          </div>

          <div className="text-center">
            <div className="text-xl md:text-2xl font-black text-[#ffb703] tracking-tight flex items-center justify-center">
              <CountUp from={0} to={100} duration={1.0} className="inline" />%
            </div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              Free & Client-Side
            </div>
          </div>

          <div className="text-center">
            <div className="text-xl md:text-2xl font-black text-[#c084fc] tracking-tight flex items-center justify-center">
              <CountUp from={0} to={topScore} duration={1.5} className="inline" />
            </div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              Personal Best
            </div>
          </div>
        </div>
      </div>

      {/* Center Hero Messaging & Main CTA */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto my-auto pointer-events-none">
        {/* Tactical Badge */}
        <div className="gsap-reveal mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4655]/15 border border-[#ff4655]/40 text-[#ff4655] text-xs font-mono tracking-widest uppercase pointer-events-auto">
          <Crosshair className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>MICRO-JITTER & RECOIL DIAGNOSTIC SUITE</span>
        </div>

        {/* Hero Title */}
        <h1 className="gsap-reveal text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase leading-[1.05] drop-shadow-lg mb-3">
          <DecryptedText
            text="THE BEST AIM TRAINER ONLINE"
            speed={40}
            maxIterations={12}
            characters="ABCD0123456789!#$"
            className="text-white"
          />
        </h1>

        <p className="gsap-reveal text-sm md:text-base text-slate-300 max-w-lg mb-8 font-normal leading-relaxed drop-shadow">
          Right from your browser. 100% free with pixel-accurate Valorant yaw and physical stop-bounce telemetry.
        </p>

        {/* Primary Play Button matching 3D Aim Trainer orange CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pointer-events-auto gsap-reveal">
          <button
            ref={playButtonRef}
            onClick={handlePlayClick}
            onMouseEnter={handlePlayHoverEnter}
            onMouseLeave={handlePlayHoverLeave}
            className="group relative flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white font-extrabold text-lg tracking-wide uppercase shadow-[0_0_28px_rgba(234,88,12,0.5)] hover:shadow-[0_0_40px_rgba(249,115,22,0.8)] border border-orange-400/40 cursor-pointer transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-black/25 flex items-center justify-center">
              <Play className="w-4 h-4 fill-white text-white translate-x-0.5 group-hover:scale-110 transition-transform" />
            </div>
            <span>Play Now</span>
            <ArrowRight className="w-5 h-5 text-orange-200 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              onSelectTab('radiant');
            }}
            onMouseEnter={() => audioEngine.playHover()}
            className="flex items-center gap-2 px-6 py-4 rounded-xl bg-[#0f1422]/90 hover:bg-[#182034] text-slate-200 hover:text-white font-bold text-sm tracking-wider uppercase border border-[#232b3f] hover:border-[#00f5d4]/50 cursor-pointer transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4 text-[#00f5d4]" />
            <span>Path to Radiant</span>
          </button>
        </div>

        {/* Quick Launch Cards */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 pointer-events-auto gsap-reveal">
          <button
            onClick={() => {
              audioEngine.playClick();
              onSelectTab('tile-frenzy');
            }}
            onMouseEnter={() => audioEngine.playHover()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0d111a]/85 border border-[#1e2538] hover:border-[#ffb703] text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-[#ffb703]" />
            <span>Tile Frenzy (30s)</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              onSelectTab('whisper');
            }}
            onMouseEnter={() => audioEngine.playHover()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0d111a]/85 border border-[#1e2538] hover:border-[#00f5d4] text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5 text-[#00f5d4]" />
            <span>Whisper Grip 5m</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              onSelectTab('stopping');
            }}
            onMouseEnter={() => audioEngine.playHover()}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#0d111a]/85 border border-[#1e2538] hover:border-[#ff4655] text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-[#ff4655]" />
            <span>Stopping Power 10m</span>
          </button>
        </div>
      </div>

      {/* Bottom Tactical Game Badges Strip */}
      <div className="relative z-20 w-full py-4 px-6 border-t border-[#181f2f] bg-[#090c14]/90 backdrop-blur-md gsap-reveal">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
            CALIBRATED SENSITIVITY ENGINE FOR
          </span>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-black tracking-wider text-slate-400">
            <span className="hover:text-[#ff4655] transition-colors cursor-default">VALORANT</span>
            <span className="text-slate-600">/</span>
            <span className="hover:text-[#ea580c] transition-colors cursor-default">COUNTER-STRIKE 2</span>
            <span className="text-slate-600">/</span>
            <span className="hover:text-[#00f5d4] transition-colors cursor-default">APEX LEGENDS</span>
            <span className="text-slate-600">/</span>
            <span className="hover:text-[#ffb703] transition-colors cursor-default">OVERWATCH 2</span>
            <span className="text-slate-600">/</span>
            <span className="hover:text-[#a855f7] transition-colors cursor-default">FORTNITE</span>
          </div>

          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
            1000HZ RAW SENSOR SYNC
          </div>
        </div>
      </div>
    </div>
  );
};
