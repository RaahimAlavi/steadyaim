import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { UserSettings, DrillResult, TargetShotDetail } from '../types';
import { FPSEngine } from '../utils/fpsEngine';
import { MotionTracker } from '../utils/motionAnalytics';
import { sounds } from '../utils/soundEffects';
import { storageEngine } from '../utils/storageEngine';
import { PauseMenu } from './PauseMenu';
import { ResultModal } from './ResultModal';
import {
  Play,
  Maximize2,
  Star,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';

interface StoppingPowerDrillProps {
  settings: UserSettings;
  onOpenSettings: () => void;
  onExitDrill?: () => void;
}

export const StoppingPowerDrill: React.FC<StoppingPowerDrillProps> = ({
  settings,
  onOpenSettings,
  onExitDrill,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fpsEngineRef = useRef<FPSEngine | null>(null);
  const motionTrackerRef = useRef<MotionTracker>(new MotionTracker());

  const [isLocked, setIsLocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [hitmarkerActive, setHitmarkerActive] = useState(false);

  // Drill progression (15 flick targets)
  const totalTargetsInRound = 15;
  const [currentTargetIndex, setCurrentTargetIndex] = useState(1);
  const [hitsCount, setHitsCount] = useState(0);
  const [missesCount, setMissesCount] = useState(0);
  const [stopBouncesCount, setStopBouncesCount] = useState(0);
  const [score, setScore] = useState(0);

  // Stop bounce notification state
  const [isBounceAlertActive, setIsBounceAlertActive] = useState(false);
  const bounceTimerRef = useRef<number | null>(null);

  // Lock tracking ref to avoid false pause on launch
  const hasEngagedLockRef = useRef(false);

  // Telemetry
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

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      setTimeout(() => {
        fpsEngineRef.current?.resize();
      }, 60);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Lock handling
  const requestLock = useCallback(() => {
    if (canvasRef.current && !isPaused) {
      canvasRef.current.requestPointerLock();
    }
  }, [isPaused]);

  useEffect(() => {
    const handleLockChange = () => {
      const locked = document.pointerLockElement === canvasRef.current;
      setIsLocked(locked);

      if (locked) {
        hasEngagedLockRef.current = true;
      } else {
        // Only trigger pause if pointer lock was actively engaged during round
        if (hasEngagedLockRef.current && isPlaying && !showResultModal && !isPaused) {
          setIsPaused(true);
        }
        hasEngagedLockRef.current = false;
      }
    };

    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, [isPlaying, showResultModal, isPaused]);

  // Keyboard shortcut listener for Pause (Escape / Tab) and Quick Restart (Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyY' && isPlaying) {
        restartDrill();
      } else if (e.code === 'Tab' && isPlaying) {
        e.preventDefault();
        if (isPaused) {
          resumeDrill();
        } else {
          pauseDrill();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused]);

  // Spawn wide flick target in 3D arena
  const spawnNext3DFlickTarget = useCallback((index: number) => {
    if (!fpsEngineRef.current) return;

    // Wider angle: 14 to 28 degrees left or right to challenge stopping deceleration
    const dir = Math.random() > 0.5 ? 1 : -1;
    const yawOffset = dir * (0.24 + Math.random() * 0.22);
    const pitchOffset = (Math.random() - 0.5) * 0.08;
    const distance = 8.6; // In front of back wall at -9.0m

    fpsEngineRef.current.spawnTarget(yawOffset, pitchOffset, distance, 'flick');
    targetSpawnTimeRef.current = performance.now();
    setCurrentTargetIndex(index);
    motionTrackerRef.current.clearHistory();
  }, []);

  // Finish round & persist results
  const finishDrill = useCallback(() => {
    setIsPlaying(false);
    sounds.playSuccess();

    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    const shots = shotDetailsRef.current;
    const hits = hitsCount;
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

    const starsEarned = score >= 2500 ? 3 : score >= 1800 ? 2 : score >= 1000 ? 1 : 0;

    // Save session to database
    storageEngine.recordSession({
      drillType: 'stopping-power',
      drillName: 'Stopping Power Snap Deceleration',
      score,
      starsEarned,
      accuracy,
      avgReactionMs: avgReaction,
      jitterVariancePx: Number(((100 - avgDecel) * 0.05).toFixed(1)),
    });

    // Save stars to node 2
    storageEngine.saveNodeStars(2, starsEarned);

    const result: DrillResult = {
      id: `stopping-${Date.now()}`,
      drillType: 'stopping-power',
      timestamp: Date.now(),
      totalTargets: totalTargetsInRound,
      hits,
      misses: missesCount,
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
  }, [hitsCount, missesCount, stopBouncesCount, score, totalTargetsInRound]);

  // Start Drill (Auto-Fullscreen enabled)
  const startDrill = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setShowResultModal(false);
    setHitsCount(0);
    setMissesCount(0);
    setStopBouncesCount(0);
    setScore(0);
    hasEngagedLockRef.current = false;
    shotDetailsRef.current = [];

    fpsEngineRef.current?.clearTargets();

    // Auto-enter fullscreen
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => {
          setTimeout(() => {
            canvasRef.current?.requestPointerLock();
          }, 80);
        })
        .catch(() => {
          canvasRef.current?.requestPointerLock();
        });
    } else {
      canvasRef.current?.requestPointerLock();
    }

    setTimeout(() => {
      spawnNext3DFlickTarget(1);
    }, 120);
  };

  const pauseDrill = () => {
    setIsPaused(true);
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  };

  const resumeDrill = () => {
    setIsPaused(false);
    hasEngagedLockRef.current = false;
    setTimeout(() => {
      canvasRef.current?.requestPointerLock();
    }, 50);
  };

  const restartDrill = () => {
    setIsPaused(false);
    startDrill();
  };

  // Fire Weapon Handler
  const handleFire = useCallback(() => {
    if (!isPlaying || isPaused || !fpsEngineRef.current) return;

    const confirmTime = Math.round(performance.now() - targetSpawnTimeRef.current);
    const stroke = motionTrackerRef.current.flushStroke();
    const jitter = stroke ? stroke.jitterScore : 85;
    const stopBounce = stroke ? stroke.stopBounceDetected : false;

    if (stopBounce) {
      setStopBouncesCount((prev) => prev + 1);
      sounds.playTensionAlert();

      setIsBounceAlertActive(true);
      if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
      bounceTimerRef.current = window.setTimeout(() => {
        setIsBounceAlertActive(false);
      }, 450);
    }

    const { isHit } = fpsEngineRef.current.checkHit();

    if (isHit) {
      setHitsCount((prev) => prev + 1);
      // Clean deceleration gives maximum score
      const decelBonus = stopBounce ? 0 : 50;
      const speedBonus = Math.max(0, Math.round((550 - confirmTime) * 0.25));
      const pointsEarned = 150 + decelBonus + speedBonus;
      setScore((s) => s + pointsEarned);

      setHitmarkerActive(true);
      setTimeout(() => setHitmarkerActive(false), 90);

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
      setMissesCount((prev) => prev + 1);

      shotDetailsRef.current.push({
        shotNumber: currentTargetIndex,
        hit: false,
        timeToConfirmMs: confirmTime,
        jitterScore: jitter,
        stopBounce,
      });
    }
  }, [isPlaying, isPaused, currentTargetIndex, totalTargetsInRound, finishDrill, spawnNext3DFlickTarget]);

  // Mouse Movement & Tracking
  useEffect(() => {
    if (!isLocked || !isPlaying || isPaused) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!fpsEngineRef.current) return;
      fpsEngineRef.current.handleMouseMove(e.movementX, e.movementY, settings.sensitivity);
      motionTrackerRef.current.addSample(e.movementX, e.movementY, performance.now());
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        if (!isLocked) {
          requestLock();
        } else {
          handleFire();
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isLocked, isPlaying, isPaused, settings.sensitivity, handleFire, requestLock]);

  // Live Star Calculation (1 Star: 1,000, 2 Stars: 1,800, 3 Stars: 2,500)
  const currentStars = score >= 2500 ? 3 : score >= 1800 ? 2 : score >= 1000 ? 1 : 0;
  const starProgressPercent = Math.min(100, Math.round((score / 2500) * 100));

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex flex-col justify-between bg-[#080b12] text-white select-none ${
        isFullscreen
          ? 'h-screen p-0 m-0 fixed inset-0 z-50'
          : 'h-[620px] rounded-3xl border border-[#1e263d] overflow-hidden'
      }`}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onClick={!isPlaying ? startDrill : requestLock}
        className="w-full h-full cursor-none block absolute inset-0 z-0"
      />

      {/* Stop Bounce Warning Alert Pill */}
      {isBounceAlertActive && isPlaying && !isPaused && (
        <div className="absolute top-8 inset-x-0 pointer-events-none flex justify-center z-20 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase backdrop-blur-md">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>OVERSHOOT BOUNCE DETECTED - SNAP TO DEAD STOP</span>
          </div>
        </div>
      )}

      {/* Minimal Green/Cyan Crosshair '+' with Hitmarker Feedback */}
      {isPlaying && !isPaused && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Center '+' Crosshair */}
            <div className="absolute w-[12px] h-[1.75px] bg-[#00f5d4] shadow-sm" />
            <div className="absolute h-[12px] w-[1.75px] bg-[#00f5d4] shadow-sm" />

            {/* Hitmarker Flash Feedback on confirmed hit */}
            {hitmarkerActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute w-3.5 h-[1.5px] bg-amber-400 rotate-45" />
                <div className="absolute w-3.5 h-[1.5px] bg-amber-400 -rotate-45" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Center Bottom HUD matching Screenshot 2 (3D Aim Trainer benchmark) */}
      {isPlaying && !isPaused && (
        <div className="absolute bottom-6 inset-x-0 pointer-events-none flex flex-col items-center justify-end z-20">
          {/* Target Progress Counter */}
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-400 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            <span>TARGET {currentTargetIndex} / {totalTargetsInRound}</span>
          </div>

          {/* Large Bold Points Number */}
          <div className="text-4xl font-black text-white font-mono tracking-tight leading-none mb-0.5">
            {score}
          </div>
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-2">
            POINTS
          </span>

          {/* Star Progression Track matching Screenshot 2 */}
          <div className="flex flex-col items-center gap-1 w-36">
            <div className="flex items-center justify-between w-full px-2">
              {[1, 2, 3].map((starIdx) => (
                <Star
                  key={starIdx}
                  className={`w-4 h-4 transition-colors ${
                    currentStars >= starIdx
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-600 fill-transparent'
                  }`}
                />
              ))}
            </div>
            {/* Progress line underneath */}
            <div className="w-full h-1 bg-[#141b29] rounded-full overflow-hidden border border-[#222e44]">
              <div
                className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${starProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Right Telemetry Badges */}
      {isPlaying && !isPaused && (
        <div className="absolute bottom-6 right-8 pointer-events-none flex flex-col items-end gap-1.5 z-20 text-right">
          <span className="text-[10px] font-mono text-slate-400 tracking-wider">
            QUICK RESTART <strong className="text-white bg-[#1b2336] px-1.5 py-0.5 rounded border border-[#2b3956]">Y</strong>
          </span>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400">
            <span>PISTOL</span>
            <span className="text-base text-white">∞</span>
          </div>
        </div>
      )}

      {/* Pre-Drill Start Overlay */}
      {!isPlaying && !showResultModal && (
        <div
          onClick={startDrill}
          className="absolute inset-0 bg-[#070a12]/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center cursor-pointer z-30"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center mb-4">
            <Play className="w-6 h-6 text-blue-400 ml-0.5" />
          </div>
          <h3 className="text-2xl font-black text-white mb-1.5 tracking-wide uppercase">
            STOPPING POWER (15 TARGETS)
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
            Eliminate crosshair bounce and snap overshoot. Achieve crisp deceleration stopping power for pixel-perfect headshots.
          </p>
          <button
            onClick={startDrill}
            className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs tracking-widest uppercase transition-colors shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
            <span>PLAY NOW (FULLSCREEN)</span>
          </button>
        </div>
      )}

      {/* In-Game Pause Menu matching Screenshot 3 */}
      {isPaused && (
        <PauseMenu
          exerciseTitle="Chapter 1 - Exercise 2: Stopping Power"
          onResume={resumeDrill}
          onRestart={restartDrill}
          onOpenSettings={onOpenSettings}
          onExit={() => {
            setIsPlaying(false);
            setIsPaused(false);
            if (onExitDrill) onExitDrill();
          }}
        />
      )}

      {/* Result Modal */}
      <ResultModal
        isOpen={showResultModal}
        result={lastResult}
        onPlayAgain={startDrill}
        onOpenSettings={onOpenSettings}
        onClose={() => {
          setShowResultModal(false);
          if (onExitDrill) onExitDrill();
        }}
      />
    </div>
  );
};
