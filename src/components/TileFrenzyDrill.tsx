import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { UserSettings, DrillResult, TargetShotDetail } from '../types';
import { FPSEngine } from '../utils/fpsEngine';
import { MotionTracker } from '../utils/motionAnalytics';
import { sounds } from '../utils/soundEffects';
import { HUDCrosshair } from './HUDCrosshair';
import { ResultModal } from './ResultModal';
import gsap from 'gsap';
import {
  Zap,
  Play,
  RotateCcw,
  Crosshair,
  Flame,
  Maximize2,
  Minimize2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface TileFrenzyDrillProps {
  settings: UserSettings;
  onOpenSettings: () => void;
}

export const TileFrenzyDrill: React.FC<TileFrenzyDrillProps> = ({
  settings,
  onOpenSettings,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fpsEngineRef = useRef<FPSEngine | null>(null);
  const motionTrackerRef = useRef<MotionTracker>(new MotionTracker());

  const streakBadgeRef = useRef<HTMLDivElement | null>(null);
  const scoreCounterRef = useRef<HTMLSpanElement | null>(null);

  const [isLocked, setIsLocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  // 30-Second Drill Timer
  const [timeLeft, setTimeLeft] = useState(30);
  const timerIntervalRef = useRef<number | null>(null);

  // Live Score & Stats
  const [score, setScore] = useState(0);
  const [hitsCount, setHitsCount] = useState(0);
  const [missesCount, setMissesCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [tenseFlagsCount, setTenseFlagsCount] = useState(0);

  // Telemetry
  const shotDetailsRef = useRef<TargetShotDetail[]>([]);
  const lastHitTimeRef = useRef<number>(0);
  const [lastResult, setLastResult] = useState<DrillResult | null>(null);

  // Initialize FPSEngine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new FPSEngine(canvasRef.current);
    fpsEngineRef.current = engine;

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
      fpsEngineRef.current = null;
    };
  }, []);

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      setTimeout(() => {
        fpsEngineRef.current?.resize();
      }, 50);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const requestLock = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.requestPointerLock();
    }
  }, []);

  useEffect(() => {
    const handleLockChange = () => {
      setIsLocked(document.pointerLockElement === canvasRef.current);
    };
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, []);

  // Spawn random glowing tile in 3D firing range
  const spawnRandomTile = useCallback(() => {
    if (!fpsEngineRef.current) return;
    // Spread tiles across front sector (X: -4 to 4, Y: 1.0 to 2.4, Z: -14 to -18)
    const x = (Math.random() - 0.5) * 8.5;
    const y = 1.0 + Math.random() * 1.35;
    const z = -14 - Math.random() * 3.5;
    fpsEngineRef.current.spawnTile(x, y, z);
  }, []);

  // Keep 3 active tiles on screen
  const maintainThreeTiles = useCallback(() => {
    if (!fpsEngineRef.current) return;
    const active = fpsEngineRef.current.getActiveTargetsCount();
    for (let i = active; i < 3; i++) {
      spawnRandomTile();
    }
  }, [spawnRandomTile]);

  // Finish round
  const finishDrill = useCallback(() => {
    setIsPlaying(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    sounds.playSuccess();

    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    fpsEngineRef.current?.clearTargets();

    const shots = shotDetailsRef.current;
    const totalShots = hitsCount + missesCount;
    const accuracy = totalShots > 0 ? Math.round((hitsCount / totalShots) * 100) : 0;

    const avgJitter =
      shots.length > 0
        ? Math.round(shots.reduce((acc, s) => acc + s.jitterScore, 0) / shots.length)
        : 82;

    const avgReaction =
      shots.length > 0
        ? Math.round(shots.reduce((acc, s) => acc + s.timeToConfirmMs, 0) / shots.length)
        : 350;

    let grade: DrillResult['grade'] = 'A';
    if (hitsCount >= 42 && accuracy >= 88) grade = 'S';
    else if (hitsCount >= 32 && accuracy >= 75) grade = 'A';
    else if (hitsCount >= 22) grade = 'B';
    else grade = 'C';

    const result: DrillResult = {
      id: `tile-frenzy-${Date.now()}`,
      drillType: 'tile-frenzy',
      timestamp: Date.now(),
      totalTargets: hitsCount,
      hits: hitsCount,
      misses: missesCount,
      accuracy,
      avgJitterScore: avgJitter,
      tenseAlertsCount: tenseFlagsCount,
      avgTimeToConfirmMs: avgReaction,
      avgDecelerationScore: Math.round(avgJitter * 0.94),
      grade,
      shots,
    };

    setLastResult(result);
    setShowResultModal(true);
  }, [hitsCount, missesCount, tenseFlagsCount]);

  // Start 30s Drill
  const startDrill = () => {
    setIsPlaying(true);
    setShowResultModal(false);
    setTimeLeft(30);
    setScore(0);
    setHitsCount(0);
    setMissesCount(0);
    setCurrentStreak(0);
    setTenseFlagsCount(0);
    shotDetailsRef.current = [];
    lastHitTimeRef.current = performance.now();

    fpsEngineRef.current?.clearTargets();
    requestLock();

    setTimeout(() => {
      maintainThreeTiles();
    }, 150);

    // 30s countdown loop
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishDrill();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Fire / Click Handler
  const handleFire = useCallback(() => {
    if (!isPlaying || !fpsEngineRef.current) return;

    const now = performance.now();
    const timeDelta = Math.round(now - (lastHitTimeRef.current || now));
    lastHitTimeRef.current = now;

    const stroke = motionTrackerRef.current.flushStroke();
    const jitter = stroke ? stroke.jitterScore : 88;
    const stopBounce = stroke ? stroke.stopBounceDetected : false;

    if (stopBounce) {
      setTenseFlagsCount((prev) => prev + 1);
    }

    const { isHit } = fpsEngineRef.current.checkHit();

    if (isHit) {
      sounds.playHeadshot();
      setHitsCount((prev) => prev + 1);

      // Score bonus based on streak
      setCurrentStreak((prev) => {
        const next = prev + 1;
        const multiplier = Math.min(4, 1 + Math.floor(next / 5));
        const pts = 100 * multiplier;

        setScore((s) => {
          const newScore = s + pts;
          if (scoreCounterRef.current) {
            gsap.fromTo(
              scoreCounterRef.current,
              { scale: 1.25, color: '#00f5d4' },
              { scale: 1.0, color: '#ffffff', duration: 0.25 }
            );
          }
          return newScore;
        });

        if (streakBadgeRef.current && next >= 4) {
          gsap.fromTo(
            streakBadgeRef.current,
            { scale: 1.3, rotate: -2 },
            { scale: 1.0, rotate: 0, duration: 0.25, ease: 'back.out(2)' }
          );
        }
        return next;
      });

      shotDetailsRef.current.push({
        shotNumber: hitsCount + 1,
        hit: true,
        timeToConfirmMs: Math.min(1000, timeDelta),
        jitterScore: jitter,
        stopBounce,
      });

      // Instantly spawn replacement tile to keep 3 active
      spawnRandomTile();
    } else {
      sounds.playMiss();
      setMissesCount((prev) => prev + 1);
      setCurrentStreak(0);

      shotDetailsRef.current.push({
        shotNumber: hitsCount + 1,
        hit: false,
        timeToConfirmMs: Math.min(1000, timeDelta),
        jitterScore: jitter,
        stopBounce,
      });
    }
  }, [isPlaying, hitsCount, spawnRandomTile]);

  // Raw mouse listener
  useEffect(() => {
    if (!isLocked) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!fpsEngineRef.current) return;
      fpsEngineRef.current.handleMouseMove(e.movementX, e.movementY, settings.sensitivity);
      motionTrackerRef.current.addSample(e.movementX, e.movementY, performance.now());
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && isPlaying) {
        handleFire();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isLocked, isPlaying, settings.sensitivity, handleFire]);

  return (
    <div
      ref={containerRef}
      className={`space-y-6 transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen bg-[#07090e] p-4 flex flex-col justify-between space-y-0 overflow-hidden'
          : ''
      }`}
    >
      {/* Top Banner */}
      <div className="bg-[#121520] border border-[#23293c] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffb703] to-[#ff7b00] flex items-center justify-center text-[#090b11] shadow-lg shadow-[#ffb703]/25 font-black">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white tracking-wide uppercase">
                DYNAMIC TILE FRENZY (30 SECONDS)
              </h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#ffb703]/20 text-[#ffb703] border border-[#ffb703]/30 font-mono">
                RAPID SWITCHING
              </span>
            </div>
            <p className="text-xs text-slate-400">
              30-second rapid target destruction. Destroy tiles and decelerate cleanly on every stop.
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2.5">
          {/* Timer Clock */}
          <div className="bg-[#0b0e16] border border-[#1e2436] rounded-xl px-4 py-1.5 text-center flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ff4655] animate-pulse" />
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">
                Time
              </span>
              <span className={`text-sm font-black font-mono ${timeLeft <= 5 ? 'text-[#ff4655]' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Score Counter */}
          <div className="bg-[#0b0e16] border border-[#1e2436] rounded-xl px-3.5 py-1.5 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">
              Score
            </span>
            <span ref={scoreCounterRef} className="text-sm font-black font-mono text-[#00f5d4]">
              {score}
            </span>
          </div>

          {/* Hits Counter */}
          <div className="bg-[#0b0e16] border border-[#1e2436] rounded-xl px-3.5 py-1.5 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">
              Hits
            </span>
            <span className="text-sm font-black font-mono text-white">
              {hitsCount}
            </span>
          </div>

          {currentStreak >= 4 && (
            <div
              ref={streakBadgeRef}
              className="bg-[#ff4655]/20 border border-[#ff4655]/50 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-[#ff4655] shadow-lg shadow-[#ff4655]/25"
            >
              <Flame className="w-3.5 h-3.5 text-[#ff4655]" />
              <span>{currentStreak} COMBO</span>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a2133] hover:bg-[#232b40] border border-[#2b3752] text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md ml-1"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Aim Lab Fullscreen Focus Mode'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-[#00f5d4]" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-[#00f5d4]" />
                <span className="hidden sm:inline">Fullscreen Focus</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3D Viewport */}
      <div
        className={`relative overflow-hidden border border-[#222738] shadow-2xl bg-[#0a0c13] ${
          isFullscreen ? 'flex-1 rounded-2xl w-full my-2' : 'rounded-3xl'
        }`}
      >
        <canvas
          ref={canvasRef}
          onClick={!isPlaying ? startDrill : requestLock}
          className={`w-full cursor-none block ${isFullscreen ? 'h-full' : 'h-[540px]'}`}
        />

        <HUDCrosshair settings={settings} isTense={false} />

        {/* Start Overlay */}
        {!isPlaying && !showResultModal && (
          <div
            onClick={startDrill}
            className="absolute inset-0 bg-black/75 backdrop-blur-[4px] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all hover:bg-black/65"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#ffb703]/20 border border-[#ffb703]/50 flex items-center justify-center mb-4 shadow-xl shadow-[#ffb703]/30">
              <Play className="w-8 h-8 text-[#ffb703] ml-1" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-wide uppercase">
              START TILE FRENZY (30 SECONDS)
            </h3>
            <p className="text-xs text-slate-300 max-w-md mb-6 leading-relaxed">
              3 Active neon tiles on the arena firing wall. As soon as you hit a tile, a new one spawns.
              Test raw target acquisition and clean deceleration.
            </p>
            <div className="flex items-center gap-3">
              <div className="px-6 py-3 rounded-xl bg-[#ffb703] hover:bg-[#ffc633] text-black text-xs font-black tracking-wider uppercase shadow-xl shadow-[#ffb703]/35 transition-all">
                Start 30s Challenge
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                  startDrill();
                }}
                className="px-5 py-3 rounded-xl bg-[#1b2234] hover:bg-[#252f48] border border-[#2d3a56] text-white text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2"
              >
                <Maximize2 className="w-4 h-4 text-[#00f5d4]" />
                <span>Fullscreen Focus</span>
              </button>
            </div>
          </div>
        )}

        {/* Unlocked Resume Notice */}
        {isPlaying && !isLocked && !showResultModal && (
          <div
            onClick={requestLock}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#00f5d4]/20 border border-[#00f5d4]/40 flex items-center justify-center mb-3">
              <Crosshair className="w-6 h-6 text-[#00f5d4]" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Click to Resume Aim Lock</h4>
            <p className="text-xs text-slate-400">Cursor was unlocked. Click anywhere to re-lock.</p>
          </div>
        )}
      </div>

      <ResultModal
        isOpen={showResultModal}
        result={lastResult}
        onPlayAgain={startDrill}
        onOpenSettings={onOpenSettings}
        onClose={() => setShowResultModal(false)}
      />

      {!isFullscreen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#121520] border border-[#222738] rounded-2xl p-4 flex gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-[#ffb703]/10 text-[#ffb703] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Rapid Path Economy</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Move your crosshair directly along the straightest line between tiles with minimal overshoot.
              </p>
            </div>
          </div>

          <div className="bg-[#121520] border border-[#222738] rounded-2xl p-4 flex gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-[#00f5d4]/10 text-[#00f5d4] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Relaxed Tempo</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rushing leads to misses and tensed tendons. Build a consistent rhythm: flick, stop, click, next.
              </p>
            </div>
          </div>

          <div className="bg-[#121520] border border-[#222738] rounded-2xl p-4 flex gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-[#ff4655]/10 text-[#ff4655] flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Zero Panic Clicking</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Missed shots reset your multiplier streak. Confirm your crosshair on the tile before pulling the trigger.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
