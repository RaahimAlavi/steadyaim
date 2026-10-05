import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import type { UserSettings, DrillResult, TargetShotDetail } from '../types';
import { FPSEngine } from '../utils/fpsEngine';
import { MotionTracker } from '../utils/motionAnalytics';
import { audioEngine } from '../utils/audioEngine';
import { PauseMenu } from './PauseMenu';
import { ResultModal } from './ResultModal';
import { storageEngine } from '../utils/storageEngine';
import { Clock, Play, Maximize2, Star, Crosshair } from 'lucide-react';

interface TileFrenzyDrillProps {
  settings: UserSettings;
  onOpenSettings: () => void;
  onExitDrill?: () => void;
  autoStart?: boolean;
}

export const TileFrenzyDrill: React.FC<TileFrenzyDrillProps> = ({
  settings,
  onOpenSettings,
  onExitDrill,
  autoStart = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fpsEngineRef = useRef<FPSEngine | null>(null);
  const motionTrackerRef = useRef<MotionTracker>(new MotionTracker());
  const scoreTextRef = useRef<HTMLDivElement>(null);

  const [isLocked, setIsLocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  // 30-Second Drill Timer
  const [timeLeft, setTimeLeft] = useState(30);
  const timerIntervalRef = useRef<number | null>(null);

  // Live Score & Stats
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hitsCount, setHitsCount] = useState(0);
  const [missesCount, setMissesCount] = useState(0);
  const [tenseFlagsCount, setTenseFlagsCount] = useState(0);

  const crosshairRef = useRef<HTMLDivElement>(null);
  const hudWrapperRef = useRef<HTMLDivElement>(null);
  const comboBadgeRef = useRef<HTMLDivElement>(null);
  const starRefs = [useRef<SVGSVGElement>(null), useRef<SVGSVGElement>(null), useRef<SVGSVGElement>(null)];

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

  // Auto-start drill when requested from stage selection
  useEffect(() => {
    if (autoStart) {
      const timer = window.setTimeout(() => {
        startDrill();
      }, 100);
      return () => window.clearTimeout(timer);
    }
  }, [autoStart]);

  const [hitmarkerActive, setHitmarkerActive] = useState(false);
  const hasEngagedLockRef = useRef(false);

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setTimeout(() => {
        fpsEngineRef.current?.resize();
      }, 60);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
        if (!timerIntervalRef.current && isPlaying && !isPaused) {
          timerIntervalRef.current = window.setInterval(() => {
            setTimeLeft((prev) => {
              if (prev <= 1) {
                finishDrill();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } else {
        // Only trigger pause if pointer lock was actively engaged during this round
        if (hasEngagedLockRef.current && isPlaying && !showResultModal && !isPaused) {
          setIsPaused(true);
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
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

  // Spawn non-overlapping random sphere targets centered at eye-level on back wall (z = -8.6m)
  const spawnRandomTile = useCallback(() => {
    if (!fpsEngineRef.current) return;
    const active = fpsEngineRef.current.getActiveTargets();
    let x = 0;
    let y = 1.65;
    let attempts = 0;

    do {
      x = (Math.random() - 0.5) * 5.6;
      y = 1.3 + Math.random() * 0.9; // Centered around 1.65m eye level
      attempts++;
    } while (
      attempts < 20 &&
      active.some((t) => Math.hypot(t.worldPosition.x - x, t.worldPosition.y - y) < 1.75)
    );

    fpsEngineRef.current.spawnTile(x, y, -8.6);
  }, []);

  // Keep 3 active targets on screen
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
    setIsPaused(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    audioEngine.playSuccess();

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

    const starsEarned = score >= 3500 ? 3 : score >= 2500 ? 2 : score >= 1500 ? 1 : 0;

    // Save session to local database
    storageEngine.recordSession({
      drillType: 'tile-frenzy',
      drillName: 'Tile Frenzy 30s',
      score,
      starsEarned,
      accuracy,
      avgReactionMs: avgReaction,
      jitterVariancePx: Number(((100 - avgJitter) * 0.05).toFixed(1)),
    });

    // Save earned stars to node 3
    storageEngine.saveNodeStars(3, starsEarned);

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
  }, [hitsCount, missesCount, tenseFlagsCount, score]);

  // Start Drill (Enters Fullscreen automatically as requested)
  const startDrill = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setShowResultModal(false);
    setTimeLeft(30);
    setScore(0);
    setCombo(0);
    setHitsCount(0);
    setMissesCount(0);
    setTenseFlagsCount(0);
    hasEngagedLockRef.current = false;
    shotDetailsRef.current = [];
    lastHitTimeRef.current = performance.now();

    fpsEngineRef.current?.clearTargets();

    // Auto-enter fullscreen as requested
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
      maintainThreeTiles();
    }, 120);

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

  const pauseDrill = () => {
    setIsPaused(true);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
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

  const restartDrill = () => {
    setIsPaused(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    startDrill();
  };

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Fire / Click Handler
  const handleFire = useCallback(() => {
    if (!isPlaying || isPaused || !fpsEngineRef.current) return;

    const now = performance.now();
    const timeDelta = Math.round(now - (lastHitTimeRef.current || now));
    lastHitTimeRef.current = now;

    const stroke = motionTrackerRef.current.flushStroke();
    const jitter = stroke ? stroke.jitterScore : 88;
    const stopBounce = stroke ? stroke.stopBounceDetected : false;

    if (stopBounce) {
      setTenseFlagsCount((prev) => prev + 1);
    }

    // Dynamic Crosshair spring bounce
    if (crosshairRef.current) {
      gsap.fromTo(crosshairRef.current, { scale: 1.35 }, { scale: 1.0, duration: 0.1, ease: 'power2.out' });
    }

    const { isHit } = fpsEngineRef.current.checkHit();

    if (isHit) {
      setHitsCount((prev) => prev + 1);

      // Screen shake on HUD overlay
      if (hudWrapperRef.current) {
        gsap.fromTo(
          hudWrapperRef.current,
          { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 5 },
          { x: 0, y: 0, duration: 0.1, ease: 'power2.out' }
        );
      }

      // Combo streak counter
      setCombo((prevCombo) => {
        const nextCombo = prevCombo + 1;
        if (comboBadgeRef.current && nextCombo >= 2) {
          gsap.fromTo(comboBadgeRef.current, { scale: 1.4 }, { scale: 1.0, duration: 0.25, ease: 'back.out(2)' });
        }
        return nextCombo;
      });

      setScore((s) => {
        const newScore = s + 100;
        if (newScore >= 1500 && s < 1500 && starRefs[0].current) {
          gsap.fromTo(starRefs[0].current, { scale: 2 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
        } else if (newScore >= 2500 && s < 2500 && starRefs[1].current) {
          gsap.fromTo(starRefs[1].current, { scale: 2 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
        } else if (newScore >= 3500 && s < 3500 && starRefs[2].current) {
          gsap.fromTo(starRefs[2].current, { scale: 2 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
        }
        return newScore;
      });

      setHitmarkerActive(true);
      setTimeout(() => setHitmarkerActive(false), 90);

      if (scoreTextRef.current) {
        gsap.fromTo(
          scoreTextRef.current,
          { scale: 1.4, color: '#00f5d4' },
          { scale: 1, color: '#ffffff', duration: 0.3, ease: 'power2.out' }
        );
      }

      shotDetailsRef.current.push({
        shotNumber: hitsCount + 1,
        hit: true,
        timeToConfirmMs: Math.min(1000, timeDelta),
        jitterScore: jitter,
        stopBounce,
      });

      // Instantly spawn replacement sphere
      spawnRandomTile();
    } else {
      setCombo(0);
      setMissesCount((prev) => prev + 1);

      shotDetailsRef.current.push({
        shotNumber: hitsCount + 1,
        hit: false,
        timeToConfirmMs: Math.min(1000, timeDelta),
        jitterScore: jitter,
        stopBounce,
      });
    }
  }, [isPlaying, isPaused, hitsCount, spawnRandomTile]);

  // Mouse Move in Canvas
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isLocked || !isPlaying || isPaused || !fpsEngineRef.current) return;
      fpsEngineRef.current.handleMouseMove(e.movementX, e.movementY, settings.sensitivity);
      motionTrackerRef.current.addSample(e.movementX, e.movementY);
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [isLocked, isPlaying, isPaused, settings.sensitivity]);

  // Click on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        if (!isLocked) {
          requestLock();
        } else {
          handleFire();
        }
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    return () => canvas.removeEventListener('mousedown', handleMouseDown);
  }, [isLocked, handleFire, requestLock]);

  // Live Star Calculation (1 Star: 1,500, 2 Stars: 2,500, 3 Stars: 3,500)
  const currentStars = score >= 3500 ? 3 : score >= 2500 ? 2 : score >= 1500 ? 1 : 0;
  const starProgressPercent = Math.min(100, Math.round((score / 3500) * 100));

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col justify-between bg-[#080b12] text-white select-none overflow-hidden"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onClick={!isPlaying ? startDrill : requestLock}
        className="w-full h-full cursor-none block absolute inset-0 z-0"
      />

      {/* Dynamic Deep Eye-Friendly Vignette during active gameplay */}
      {isPlaying && !isPaused && (
        <div className="absolute inset-0 pointer-events-none z-10 bg-radial-[circle_at_center,_transparent_35%,_rgba(3,5,10,0.92)_100%]" />
      )}

      {/* Minimal Tactical Crosshair '+' with Hitmarker Feedback */}
      {isPlaying && !isPaused && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          <div ref={crosshairRef} className="relative w-8 h-8 flex items-center justify-center">
            {/* Center '+' Crosshair (Comfortable non-glaring cyan/emerald) */}
            <div
              className="absolute w-[12px] h-[1.75px]"
              style={{ backgroundColor: settings.crosshairColor || '#38bdf8' }}
            />
            <div
              className="absolute h-[12px] w-[1.75px]"
              style={{ backgroundColor: settings.crosshairColor || '#38bdf8' }}
            />

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

      {/* Center Bottom HUD matching Screenshot 2 (3D Aim Trainer) */}
      {isPlaying && !isPaused && (
        <div ref={hudWrapperRef} className="absolute bottom-6 inset-x-0 pointer-events-none flex flex-col items-center justify-end z-20">
          {/* Combo Streak Counter Badge */}
          {combo >= 2 && (
            <div
              ref={comboBadgeRef}
              className="mb-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/25 to-orange-500/25 border border-amber-400/50 text-amber-300 font-mono text-[11px] font-black tracking-widest uppercase shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse"
            >
              {combo}x STREAK
            </div>
          )}

          {/* Timer Clock with 10s Low Time Red Pulse */}
          <div className={`flex items-center gap-1.5 text-xs font-mono font-bold mb-1 transition-colors ${
            timeLeft <= 10 ? 'text-rose-400 animate-pulse font-black' : 'text-blue-400'
          }`}>
            <Clock className={`w-3.5 h-3.5 ${timeLeft <= 10 ? 'text-rose-400' : 'text-blue-400'}`} />
            <span>00:{timeLeft.toString().padStart(2, '0')}</span>
          </div>

          {/* Large Bold Points Number */}
          <div ref={scoreTextRef} className="text-4xl font-black text-white font-mono tracking-tight leading-none mb-0.5">
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
                  ref={starRefs[starIdx - 1]}
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

      {/* Bottom Right Telemetry Badges matching Screenshot 2 */}
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

      {/* Click to Lock Aim Prompt when round is active but pointer lock needs engagement */}
      {isPlaying && !isLocked && !isPaused && (
        <div
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => {});
            }
            requestLock();
          }}
          className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer z-30"
        >
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-[#0e1320]/95 border border-blue-500/30 shadow-2xl max-w-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Crosshair className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-black text-white tracking-wider uppercase">
                CLICK TO LOCK AIM & START
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Press [ESC] at any time to pause or adjust settings
              </p>
            </div>
            <div className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold tracking-widest uppercase transition-all shadow-md mt-1">
              ENGAGE [LEFT CLICK]
            </div>
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
            TILE FRENZY (30 SECONDS)
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
            Eliminate cobalt blue sphere targets as fast as possible. Press Play to auto-fullscreen and lock cursor.
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
          exerciseTitle="Chapter 1 - Exercise 3: Tile Frenzy"
          onResume={resumeDrill}
          onRestart={restartDrill}
          onOpenSettings={onOpenSettings}
          onExit={() => {
            setIsPlaying(false);
            setIsPaused(false);
            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
            if (onExitDrill) onExitDrill();
          }}
        />
      )}

      {/* Round Finished Result Modal */}
      <ResultModal
        isOpen={showResultModal}
        result={lastResult}
        onPlayAgain={startDrill}
        onOpenSettings={onOpenSettings}
        onClose={() => {
          setShowResultModal(false);
          if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
          if (onExitDrill) onExitDrill();
        }}
      />
    </div>
  );
};
