import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { UserSettings, DrillResult, TargetShotDetail } from '../types';
import { FPSEngine } from '../utils/fpsEngine';
import { MotionTracker } from '../utils/motionAnalytics';
import { sounds } from '../utils/soundEffects';
import { HUDCrosshair } from './HUDCrosshair';
import { ResultModal } from './ResultModal';
import { Target, Play, RotateCcw, AlertCircle, Crosshair, Flame, Shield } from 'lucide-react';

interface WhisperGripDrillProps {
  settings: UserSettings;
  onOpenSettings: () => void;
}

export const WhisperGripDrill: React.FC<WhisperGripDrillProps> = ({
  settings,
  onOpenSettings,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fpsEngineRef = useRef<FPSEngine | null>(null);
  const motionTrackerRef = useRef<MotionTracker>(new MotionTracker());

  const [isLocked, setIsLocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  // Drill progression
  const totalTargetsInRound = 20;
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [hitsCount, setHitsCount] = useState(0);
  const [tenseFlagsCount, setTenseFlagsCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Real-time tension state
  const [isCurrentlyTense, setIsCurrentlyTense] = useState(false);
  const tenseTimerRef = useRef<number | null>(null);

  // Round telemetry
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

  // Pointer Lock handling
  const requestLock = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.requestPointerLock();
    }
  }, []);

  useEffect(() => {
    const handleLockChange = () => {
      const locked = document.pointerLockElement === canvasRef.current;
      setIsLocked(locked);
    };

    document.addEventListener('pointerlockchange', handleLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, []);

  // Spawn 3D micro-target relative to current camera orientation
  const spawnNext3DTarget = useCallback((index: number) => {
    if (!fpsEngineRef.current) return;

    // Valorant micro-adjustment angle range: 3 to 9 degrees (0.05 to 0.16 radians)
    // Target appears near where you are currently looking, NEVER resetting your crosshair!
    const yawOffset = (Math.random() - 0.5) * 0.28; // ~8 degrees left or right
    const pitchOffset = (Math.random() - 0.5) * 0.10; // ~3 degrees up or down (maintaining head height)
    const distance = 12 + (Math.random() - 0.5) * 2; // ~12 meters distance

    fpsEngineRef.current.spawnTarget(yawOffset, pitchOffset, distance, 'micro');
    targetSpawnTimeRef.current = performance.now();
    setCurrentTargetIndex(index);
    motionTrackerRef.current.clearHistory();
  }, []);

  // Complete round & display persistent results
  const finishDrill = useCallback(() => {
    setIsPlaying(false);
    sounds.playSuccess();

    // Release pointer lock so user can interact with the results modal cleanly
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    const shots = shotDetailsRef.current;
    const hits = shots.filter((s) => s.hit).length;
    const accuracy = Math.round((hits / totalTargetsInRound) * 100);

    const avgJitter =
      shots.length > 0
        ? Math.round(shots.reduce((acc, s) => acc + s.jitterScore, 0) / shots.length)
        : 85;

    const avgReaction =
      shots.length > 0
        ? Math.round(shots.reduce((acc, s) => acc + s.timeToConfirmMs, 0) / shots.length)
        : 0;

    let grade: DrillResult['grade'] = 'A';
    if (accuracy >= 90 && avgJitter >= 80 && tenseFlagsCount <= 1) grade = 'S';
    else if (accuracy >= 75 && avgJitter >= 65) grade = 'A';
    else if (accuracy >= 60) grade = 'B';
    else if (accuracy >= 45) grade = 'C';
    else grade = 'D';

    const result: DrillResult = {
      id: `drill-${Date.now()}`,
      drillType: 'whisper-grip',
      timestamp: Date.now(),
      totalTargets: totalTargetsInRound,
      hits,
      misses: totalTargetsInRound - hits,
      accuracy,
      avgJitterScore: avgJitter,
      tenseAlertsCount: tenseFlagsCount,
      avgTimeToConfirmMs: avgReaction,
      avgDecelerationScore: Math.round(avgJitter * 0.95),
      grade,
      shots,
    };

    setLastResult(result);
    setShowResultModal(true);
  }, [tenseFlagsCount, totalTargetsInRound]);

  // Start / Restart Drill
  const startDrill = () => {
    setIsPlaying(true);
    setShowResultModal(false);
    setHitsCount(0);
    setTenseFlagsCount(0);
    setCurrentStreak(0);
    shotDetailsRef.current = [];

    requestLock();
    // Short delay to let pointer lock engage smoothly
    setTimeout(() => {
      spawnNext3DTarget(1);
    }, 100);
  };

  // Shoot / Click Handler
  const handleFire = useCallback(() => {
    if (!isPlaying || !fpsEngineRef.current) return;

    const confirmTime = Math.round(performance.now() - targetSpawnTimeRef.current);
    const stroke = motionTrackerRef.current.flushStroke();
    const jitter = stroke ? stroke.jitterScore : 90;
    const stopBounce = stroke ? stroke.stopBounceDetected : false;

    const { isHit } = fpsEngineRef.current.checkHit();

    if (isHit) {
      sounds.playHeadshot();
      setHitsCount((prev) => prev + 1);
      setCurrentStreak((prev) => prev + 1);

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
        spawnNext3DTarget(currentTargetIndex + 1);
      }
    } else {
      sounds.playMiss();
      setCurrentStreak(0);

      shotDetailsRef.current.push({
        shotNumber: currentTargetIndex,
        hit: false,
        timeToConfirmMs: confirmTime,
        jitterScore: jitter,
        stopBounce,
      });
    }
  }, [isPlaying, currentTargetIndex, totalTargetsInRound, finishDrill, spawnNext3DTarget]);

  // Mouse movement & clicks listener
  useEffect(() => {
    if (!isLocked) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!fpsEngineRef.current) return;

      // 1:1 Valorant Camera Rotation
      fpsEngineRef.current.handleMouseMove(e.movementX, e.movementY, settings.sensitivity);

      // Track physical motion for tension analysis
      const now = performance.now();
      const dist = Math.hypot(e.movementX, e.movementY);
      const { sample } = motionTrackerRef.current.addSample(e.movementX, e.movementY, now);

      // Strict tension trigger threshold (scaled by user settings)
      const isTremor =
        sample.isJittery && dist > 1.2 && (sample.speed * settings.jitterSensitivityThreshold > 0.35);

      if (isTremor) {
        setIsCurrentlyTense(true);
        fpsEngineRef.current.updateTargetTensionState(true);

        if (tenseTimerRef.current) clearTimeout(tenseTimerRef.current);
        tenseTimerRef.current = window.setTimeout(() => {
          setIsCurrentlyTense(false);
          fpsEngineRef.current?.updateTargetTensionState(false);
        }, 350);

        if (isPlaying) {
          setTenseFlagsCount((prev) => prev + 1);
          sounds.playTensionAlert();
        }
      }
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
  }, [isLocked, isPlaying, settings.sensitivity, settings.jitterSensitivityThreshold, handleFire]);

  return (
    <div className="space-y-6">
      {/* Top Tactical HUD Bar */}
      <div className="bg-[#121520] border border-[#23293c] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff4655]/20 border border-[#ff4655]/40 flex items-center justify-center text-[#ff4655]">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white tracking-wide uppercase">
                3D WHISPER GRIP SIMULATOR
              </h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#00f5d4]/20 text-[#00f5d4] border border-[#00f5d4]/30 font-mono">
                1:1 VALORANT ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Exact 103° FOV & camera rotation. Crosshair stays in position—targets spawn in space.
            </p>
          </div>
        </div>

        {/* Live Counters & Streak */}
        <div className="flex items-center gap-2.5">
          <div className="bg-[#0b0e16] border border-[#1e2436] rounded-xl px-3.5 py-1.5 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">
              Duel
            </span>
            <span className="text-sm font-black font-mono text-white">
              {isPlaying ? `${currentTargetIndex} / ${totalTargetsInRound}` : `0 / ${totalTargetsInRound}`}
            </span>
          </div>

          <div className="bg-[#0b0e16] border border-[#1e2436] rounded-xl px-3.5 py-1.5 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">
              Hits
            </span>
            <span className="text-sm font-black font-mono text-[#00f5d4]">
              {hitsCount}
            </span>
          </div>

          <div className="bg-[#0b0e16] border border-[#1e2436] rounded-xl px-3.5 py-1.5 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">
              Tension Flags
            </span>
            <span
              className={`text-sm font-black font-mono ${
                tenseFlagsCount > 0 ? 'text-[#ff4655]' : 'text-slate-400'
              }`}
            >
              {tenseFlagsCount}
            </span>
          </div>

          {currentStreak >= 3 && (
            <div className="bg-[#ff4655]/20 border border-[#ff4655]/50 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-[#ff4655] animate-pulse">
              <Flame className="w-3.5 h-3.5 text-[#ff4655]" />
              <span>{currentStreak} STREAK</span>
            </div>
          )}
        </div>
      </div>

      {/* Main 3D Viewport */}
      <div className="relative rounded-3xl overflow-hidden border border-[#222738] shadow-2xl bg-[#0a0c13]">
        <canvas
          ref={canvasRef}
          onClick={!isPlaying ? startDrill : requestLock}
          className="w-full h-[540px] cursor-none block"
        />

        {/* 3D Center HUD Crosshair */}
        <HUDCrosshair settings={settings} isTense={isCurrentlyTense} />

        {/* Real-time Tension Alarm Overlay */}
        {isCurrentlyTense && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#ff4655] text-white px-5 py-2 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-2 shadow-2xl shadow-[#ff4655]/60 animate-bounce pointer-events-none">
            <AlertCircle className="w-4 h-4 text-white" />
            <span>Tense Grip / Tremor Detected! Relax Fingers & Wrist!</span>
          </div>
        )}

        {/* Live Bottom Composure Meter */}
        {isLocked && isPlaying && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#0d101a]/85 backdrop-blur-md border border-[#23293c] px-4 py-2 rounded-2xl text-xs pointer-events-none">
            <span className="text-slate-400 font-mono text-[11px]">GRIP STATUS:</span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isCurrentlyTense ? 'bg-[#ff4655] animate-ping' : 'bg-[#00f5d4]'
                }`}
              />
              <span className={`font-bold uppercase ${isCurrentlyTense ? 'text-[#ff4655]' : 'text-[#00f5d4]'}`}>
                {isCurrentlyTense ? 'Tensed Death Grip' : 'Relaxed / Whisper Grip'}
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono text-[11px]">
              {settings.dpi} DPI @ {settings.sensitivity} Sens
            </span>
          </div>
        )}

        {/* Click to Start Overlay */}
        {!isPlaying && !showResultModal && (
          <div
            onClick={startDrill}
            className="absolute inset-0 bg-black/70 backdrop-blur-[3px] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all hover:bg-black/60"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#ff4655]/20 border border-[#ff4655]/50 flex items-center justify-center mb-4 shadow-xl shadow-[#ff4655]/30">
              <Play className="w-8 h-8 text-[#ff4655] ml-1" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-wide">
              START 3D WHISPER GRIP DRILL
            </h3>
            <p className="text-xs text-slate-300 max-w-md mb-6 leading-relaxed">
              20 Micro-targets in 3D tactical space. Exact Valorant sensitivity and 103° FOV.
              Your crosshair stays in place—smoothly glide to each head without locking your wrist.
            </p>
            <div className="flex items-center gap-3">
              <div className="px-6 py-3 rounded-xl bg-[#ff4655] hover:bg-[#ff5a68] text-white text-xs font-bold tracking-wider uppercase shadow-xl shadow-[#ff4655]/35 transition-all">
                Enter Tactical Range (20 Targets)
              </div>
            </div>
          </div>
        )}

        {/* Unlocked Notification Overlay if paused */}
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

      {/* Persistent End-of-Round Results Modal */}
      <ResultModal
        isOpen={showResultModal}
        result={lastResult}
        onPlayAgain={startDrill}
        onOpenSettings={onOpenSettings}
        onClose={() => setShowResultModal(false)}
      />

      {/* Philosophy / Coaching Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121520] border border-[#222738] rounded-2xl p-4 flex gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#00f5d4]/10 text-[#00f5d4] flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white mb-0.5">Continuous Crosshair Flow</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              In real gunfights, your crosshair stays where you last shot. Micro-adjust smoothly from that position to the new threat.
            </p>
          </div>
        </div>

        <div className="bg-[#121520] border border-[#222738] rounded-2xl p-4 flex gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#ff4655]/10 text-[#ff4655] flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white mb-0.5">Relaxed Finger Pressure</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              If your G402 feels sticky on micro-movements, you are pushing downward. Hold the mouse like an egg; let the skates glide freely.
            </p>
          </div>
        </div>

        <div className="bg-[#121520] border border-[#222738] rounded-2xl p-4 flex gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#ffb703]/10 text-[#ffb703] flex items-center justify-center shrink-0">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white mb-0.5">Target Confirmation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Do not click on reaction time alone. Confirm the crosshair has settled on the head hitbox, then fire.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
