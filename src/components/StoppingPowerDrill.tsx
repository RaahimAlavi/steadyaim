import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { UserSettings, DrillResult, TargetShotDetail } from '../types';
import { FPSEngine } from '../utils/fpsEngine';
import { MotionTracker } from '../utils/motionAnalytics';
import { sounds } from '../utils/soundEffects';
import { HUDCrosshair } from './HUDCrosshair';
import { ResultModal } from './ResultModal';
import gsap from 'gsap';
import {
  ShieldAlert,
  Play,
  Crosshair,
  Maximize2,
  Minimize2,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface StoppingPowerDrillProps {
  settings: UserSettings;
  onOpenSettings: () => void;
}

export const StoppingPowerDrill: React.FC<StoppingPowerDrillProps> = ({
  settings,
  onOpenSettings,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fpsEngineRef = useRef<FPSEngine | null>(null);
  const motionTrackerRef = useRef<MotionTracker>(new MotionTracker());

  const bounceNotificationRef = useRef<HTMLDivElement | null>(null);

  const [isLocked, setIsLocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const totalTargetsInRound = 15;
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [hitsCount, setHitsCount] = useState(0);
  const [stopBouncesCount, setStopBouncesCount] = useState(0);

  const targetSpawnTimeRef = useRef<number>(0);
  const shotDetailsRef = useRef<TargetShotDetail[]>([]);
  const [lastResult, setLastResult] = useState<DrillResult | null>(null);

  // Initialize Three.js 3D FPS Engine
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

  // Listen to Fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      setTimeout(() => {
        fpsEngineRef.current?.resize();
      }, 50);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
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

  // Spawn wide flick target in 3D
  const spawnNext3DFlickTarget = useCallback((index: number) => {
    if (!fpsEngineRef.current) return;

    // Wider angle: 16 to 32 degrees (0.28 to 0.55 radians) left or right
    const dir = Math.random() > 0.5 ? 1 : -1;
    const yawOffset = dir * (0.28 + Math.random() * 0.25);
    const pitchOffset = (Math.random() - 0.5) * 0.08;
    const distance = 11 + (Math.random() - 0.5) * 2;

    fpsEngineRef.current.spawnTarget(yawOffset, pitchOffset, distance, 'flick');
    targetSpawnTimeRef.current = performance.now();
    setCurrentTargetIndex(index);
    motionTrackerRef.current.clearHistory();
  }, []);

  const finishDrill = useCallback(() => {
    setIsPlaying(false);
    sounds.playSuccess();

    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    const shots = shotDetailsRef.current;
    const hits = shots.filter((s) => s.hit).length;
    const accuracy = Math.round((hits / totalTargetsInRound) * 100);

    const avgDecel =
      shots.length > 0
        ? Math.round(shots.reduce((acc, s) => acc + s.jitterScore, 0) / shots.length)
        : 80;

    const avgReaction =
      shots.length > 0
        ? Math.round(shots.reduce((acc, s) => acc + s.timeToConfirmMs, 0) / shots.length)
        : 0;

    let grade: DrillResult['grade'] = 'A';
    if (accuracy >= 85 && stopBouncesCount <= 1) grade = 'S';
    else if (accuracy >= 70 && stopBouncesCount <= 3) grade = 'A';
    else if (accuracy >= 55) grade = 'B';
    else grade = 'C';

    const result: DrillResult = {
      id: `stopping-${Date.now()}`,
      drillType: 'stopping-power',
      timestamp: Date.now(),
      totalTargets: totalTargetsInRound,
      hits,
      misses: totalTargetsInRound - hits,
      accuracy,
      avgJitterScore: avgDecel,
      tenseAlertsCount: stopBouncesCount,
      avgTimeToConfirmMs: avgReaction,
      avgDecelerationScore: avgDecel,
      grade,
      shots,
    };

    setLastResult(result);
    setShowResultModal(true);
  }, [stopBouncesCount, totalTargetsInRound]);

  const startDrill = () => {
    setIsPlaying(true);
    setShowResultModal(false);
    setHitsCount(0);
    setStopBouncesCount(0);
    shotDetailsRef.current = [];

    requestLock();
    setTimeout(() => {
      spawnNext3DFlickTarget(1);
    }, 100);
  };

  const handleFire = useCallback(() => {
    if (!isPlaying || !fpsEngineRef.current) return;

    const confirmTime = Math.round(performance.now() - targetSpawnTimeRef.current);
    const stroke = motionTrackerRef.current.flushStroke();
    const jitter = stroke ? stroke.jitterScore : 85;
    const stopBounce = stroke ? stroke.stopBounceDetected : false;

    if (stopBounce) {
      setStopBouncesCount((prev) => prev + 1);
      sounds.playTensionAlert();

      if (bounceNotificationRef.current) {
        gsap.fromTo(
          bounceNotificationRef.current,
          { y: -15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out' }
        );
      }
    }

    const { isHit } = fpsEngineRef.current.checkHit();

    if (isHit) {
      sounds.playHeadshot();
      setHitsCount((prev) => prev + 1);

      shotDetailsRef.current.push({
        shotNumber: currentTargetIndex,
        hit: true,
        timeToConfirmMs: confirmTime,
        jitterScore: jitter,
        stopBounce,
      });

      if (currentTargetIndex >= totalTargetsInRound) {
        finishDrill();
      } else {
        spawnNext3DFlickTarget(currentTargetIndex + 1);
      }
    } else {
      sounds.playMiss();

      shotDetailsRef.current.push({
        shotNumber: currentTargetIndex,
        hit: false,
        timeToConfirmMs: confirmTime,
        jitterScore: jitter,
        stopBounce,
      });
    }
  }, [isPlaying, currentTargetIndex, totalTargetsInRound, finishDrill, spawnNext3DFlickTarget]);

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
          <div className="w-10 h-10 rounded-xl bg-[#ff4655]/20 border border-[#ff4655]/40 flex items-center justify-center text-[#ff4655] shadow-lg shadow-[#ff4655]/15">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white tracking-wide uppercase">
                3D STOPPING POWER & ANTI-BOUNCE DRILL
              </h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#00f5d4]/20 text-[#00f5d4] border border-[#00f5d4]/30 font-mono">
                1:1 CAMERA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Flick to wide angles and brake cleanly on the head without wrist rebound.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0b0e16] border border-[#1e2436] rounded-xl px-3.5 py-1.5 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Target</span>
            <span className="text-sm font-black font-mono text-white">
              {isPlaying ? `${currentTargetIndex} / ${totalTargetsInRound}` : `0 / ${totalTargetsInRound}`}
            </span>
          </div>

          <div className="bg-[#0b0e16] border border-[#1e2436] rounded-xl px-3.5 py-1.5 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Hits</span>
            <span className="text-sm font-black font-mono text-[#00f5d4]">
              {hitsCount}
            </span>
          </div>

          <div className="bg-[#0b0e16] border border-[#1e2436] rounded-xl px-3.5 py-1.5 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Stop Bounces</span>
            <span className={`text-sm font-black font-mono ${stopBouncesCount > 0 ? 'text-[#ff4655]' : 'text-[#00f5d4]'}`}>
              {stopBouncesCount}
            </span>
          </div>

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

        {/* Real-time Stop Bounce Warning Overlay */}
        <div
          ref={bounceNotificationRef}
          className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#ff4655] text-white px-5 py-2 rounded-xl text-xs font-black tracking-wider uppercase items-center gap-2 shadow-2xl shadow-[#ff4655]/60 pointer-events-none hidden"
        >
          <AlertTriangle className="w-4 h-4 text-white" />
          <span>Stop-Bounce Detected: Ease forearm braking rather than slamming wrist!</span>
        </div>

        {/* Start Overlay */}
        {!isPlaying && !showResultModal && (
          <div
            onClick={startDrill}
            className="absolute inset-0 bg-black/75 backdrop-blur-[4px] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all hover:bg-black/65"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#ff4655]/20 border border-[#ff4655]/50 flex items-center justify-center mb-4 shadow-xl shadow-[#ff4655]/30">
              <Play className="w-8 h-8 text-[#ff4655] ml-1" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-wide uppercase">
              START STOPPING POWER DRILL
            </h3>
            <p className="text-xs text-slate-300 max-w-md mb-6 leading-relaxed">
              15 wide-angle targets in 3D tactical space. Flick fast, but focus on the stop phase:
              ease into the head without rebounding or oscillating backward.
            </p>
            <div className="flex items-center gap-3">
              <div className="px-6 py-3 rounded-xl bg-[#ff4655] hover:bg-[#ff5a68] text-white text-xs font-bold tracking-wider uppercase shadow-xl shadow-[#ff4655]/35 transition-all">
                Begin 3D Flick Drill (15 Targets)
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
          <div className="bg-[#121520] border border-[#23293c] rounded-2xl p-4 flex gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-[#00f5d4]/10 text-[#00f5d4] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Critical Deceleration</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Most missed duels occur because the hand oscillates past the target and has to correct back.
              </p>
            </div>
          </div>

          <div className="bg-[#121520] border border-[#23293c] rounded-2xl p-4 flex gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-[#ff4655]/10 text-[#ff4655] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Pad Friction Braking</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Allow the mousepad surface resistance to slow your glide instead of rigidly clenching tendons.
              </p>
            </div>
          </div>

          <div className="bg-[#121520] border border-[#23293c] rounded-2xl p-4 flex gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-[#ffb703]/10 text-[#ffb703] flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Target Confirmation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Wait until the crosshair comes to a complete rest on the head hitbox before firing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
