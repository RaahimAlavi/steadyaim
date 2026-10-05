import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { UserSettings, StrokeAnalysis } from '../types';
import { MotionTracker } from '../utils/motionAnalytics';
import { countsToScreenPixels } from '../utils/aimMath';
import { audioEngine } from '../utils/audioEngine';
import { Activity, Sparkles, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';


interface LiveDiagnosticsProps {
  settings: UserSettings;
}

export const LiveDiagnostics: React.FC<LiveDiagnosticsProps> = ({ settings }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const motionTrackerRef = useRef<MotionTracker>(new MotionTracker());
  const [isLocked, setIsLocked] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<StrokeAnalysis | null>(null);
  const [instantSpeed, setInstantSpeed] = useState<number>(0);
  const [instantJerk, setInstantJerk] = useState<number>(0);
  const [isCurrentlyJittery, setIsCurrentlyJittery] = useState<boolean>(false);
  const [virtualPos, setVirtualPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // History of recent strokes
  const [strokeHistory, setStrokeHistory] = useState<StrokeAnalysis[]>([]);

  // Telemetry buffer for oscilloscopes
  const telemetryHistoryRef = useRef<{ speed: number; jerk: number; time: number }[]>([]);

  // Request pointer lock
  const requestLock = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.requestPointerLock();
    }
  }, []);

  // Handle pointer lock change
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

  // Reset canvas virtual position to center on lock or resize
  useEffect(() => {
    if (canvasRef.current) {
      setVirtualPos({
        x: canvasRef.current.width / 2,
        y: canvasRef.current.height / 2,
      });
    }
  }, []);

  // Handle raw mouse events
  useEffect(() => {
    if (!isLocked) return;

    let animFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const scale = countsToScreenPixels(e.movementX, e.movementY, settings.sensitivity, canvas.width);
      const dx = scale.pxX;
      const dy = scale.pxY;
      const now = performance.now();

      const { sample, completedStroke } = motionTrackerRef.current.addSample(dx, dy, now);

      setInstantSpeed(sample.speed);
      setInstantJerk(sample.jerk);
      setIsCurrentlyJittery(sample.isJittery);

      // Play alert if jittery and user is moving
      if (sample.isJittery && sample.speed > 0.3) {
        audioEngine.playTensionAlert();
      }

      // Add to telemetry
      telemetryHistoryRef.current.push({ speed: sample.speed, jerk: sample.jerk, time: now });
      if (telemetryHistoryRef.current.length > 120) {
        telemetryHistoryRef.current.shift();
      }

      setVirtualPos((prev) => {
        const nextX = Math.max(20, Math.min(canvas.width - 20, prev.x + dx));
        const nextY = Math.max(20, Math.min(canvas.height - 20, prev.y + dy));
        return { x: nextX, y: nextY };
      });

      if (completedStroke) {
        setCurrentStroke(completedStroke);
        setStrokeHistory((prev) => [completedStroke, ...prev.slice(0, 9)]);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Render loop
    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawDiagnostics(ctx, canvas.width, canvas.height);
        }
      }
      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameId);
    };
  }, [isLocked, settings.sensitivity]);

  const drawDiagnostics = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Background
    ctx.fillStyle = '#0e111a';
    ctx.fillRect(0, 0, width, height);

    // Subtle tactical grid
    ctx.strokeStyle = '#181d2a';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center crosshairs
    const cx = width / 2;
    const cy = height / 2;
    ctx.strokeStyle = '#273046';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw active trail samples
    const samples = motionTrackerRef.current.getRecentSamples(90);
    if (samples.length > 1) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < samples.length; i++) {
        const s1 = samples[i - 1];
        const s2 = samples[i];
        const alpha = (i / samples.length);

        ctx.beginPath();
        // Offset relative to current virtual position
        const p1x = virtualPos.x + (s1.x - samples[samples.length - 1].x);
        const p1y = virtualPos.y + (s1.y - samples[samples.length - 1].y);
        const p2x = virtualPos.x + (s2.x - samples[samples.length - 1].x);
        const p2y = virtualPos.y + (s2.y - samples[samples.length - 1].y);

        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);

        if (s2.isJittery) {
          ctx.strokeStyle = `rgba(255, 70, 85, ${alpha * 0.9})`; // Red jitter spike
          ctx.lineWidth = 4.5;
        } else if (s2.speed > 1.8) {
          ctx.strokeStyle = `rgba(0, 245, 212, ${alpha * 0.8})`; // Cyan high-speed glide
          ctx.lineWidth = 3.5;
        } else {
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.7})`; // Blue-teal smooth micro-movement
          ctx.lineWidth = 2.5;
        }
        ctx.stroke();
      }
    }

    // Draw Crosshair at virtualPos
    const vx = virtualPos.x;
    const vy = virtualPos.y;
    const chSize = 7;
    const chGap = 3;

    ctx.strokeStyle = isCurrentlyJittery ? '#ff4655' : '#00f5d4';
    ctx.lineWidth = 2;

    // Outer glow if jittery
    if (isCurrentlyJittery) {
      ctx.fillStyle = 'rgba(255, 70, 85, 0.2)';
      ctx.beginPath();
      ctx.arc(vx, vy, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top
    ctx.beginPath();
    ctx.moveTo(vx, vy - chGap);
    ctx.lineTo(vx, vy - chGap - chSize);
    // Bottom
    ctx.moveTo(vx, vy + chGap);
    ctx.lineTo(vx, vy + chGap + chSize);
    // Left
    ctx.moveTo(vx - chGap, vy);
    ctx.lineTo(vx - chGap - chSize, vy);
    // Right
    ctx.moveTo(vx + chGap, vy);
    ctx.lineTo(vx + chGap + chSize, vy);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = isCurrentlyJittery ? '#ff4655' : '#ffffff';
    ctx.beginPath();
    ctx.arc(vx, vy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleClear = () => {
    motionTrackerRef.current.clearHistory();
    telemetryHistoryRef.current = [];
    setCurrentStroke(null);
    setStrokeHistory([]);
    if (canvasRef.current) {
      setVirtualPos({
        x: canvasRef.current.width / 2,
        y: canvasRef.current.height / 2,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Insight */}
      <div className="bg-[#131622] border border-[#222738] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-[#ff4655]/20 text-[#ff4655]">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-wide">
              Live Tremor & Deceleration Oscilloscope
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Click into the canvas to capture raw unaccelerated mouse input. Make flicks, micro-adjustments, and stops to see real-time jitter analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1f2e] border border-[#273044] text-xs text-slate-300 hover:text-white hover:bg-[#22293d] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Canvas</span>
          </button>
        </div>
      </div>

      {/* Main Diagnostic Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-[#222738] shadow-2xl bg-[#0b0d14]">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              onClick={requestLock}
              className="w-full h-[450px] cursor-crosshair block"
            />

            {/* Pointer Lock Overlay */}
            {!isLocked && (
              <div
                onClick={requestLock}
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all hover:bg-black/50"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#ff4655]/20 border border-[#ff4655]/40 flex items-center justify-center mb-3 shadow-lg shadow-[#ff4655]/20">
                  <Activity className="w-7 h-7 text-[#ff4655] animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Click Anywhere to Lock Aim</h3>
                <p className="text-xs text-slate-300 max-w-sm mb-4">
                  Uses raw relative hardware counts (exact Valorant {settings.sensitivity} sensitivity / {settings.dpi} DPI) without Windows pointer curves.
                </p>
                <div className="px-3.5 py-1.5 rounded-lg bg-[#161a26] border border-[#262c3f] text-[11px] text-slate-400 font-mono">
                  Press ESC anytime to unlock cursor
                </div>
              </div>
            )}

            {/* Real-time Status Overlay in corner */}
            {isLocked && (
              <div className="absolute top-4 left-4 flex items-center gap-3 bg-[#111420]/80 backdrop-blur-md border border-[#23293c] px-3.5 py-2 rounded-xl text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCurrentlyJittery ? 'bg-[#ff4655] animate-ping' : 'bg-[#00f5d4]'
                    }`}
                  />
                  <span className="font-semibold text-white">
                    {isCurrentlyJittery ? 'Tension Detected!' : 'Smooth Motion'}
                  </span>
                </div>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400 font-mono">
                  {(instantSpeed * 100).toFixed(0)} px/s
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400 font-mono text-[10px]">
                  Jerk: {(instantJerk * 10).toFixed(1)}
                </span>
              </div>
            )}

            {/* Visual Legend */}
            <div className="absolute bottom-3 left-4 flex items-center gap-4 text-[11px] bg-[#111420]/80 backdrop-blur-md border border-[#23293c] px-3 py-1.5 rounded-lg">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00f5d4]" />
                <span className="text-slate-300">Clean Glide</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff4655]" />
                <span className="text-slate-300">Tremor / Jerk Spike</span>
              </div>
            </div>
          </div>

          {/* Oscilloscope Mini-Panel */}
          <div className="bg-[#121520] border border-[#222738] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#00f5d4]" />
                Micro-Jerk & Muscle Tension Oscilloscope
              </span>
              <span className="text-slate-400 font-mono text-[11px]">Last 120 samples</span>
            </div>

            {/* Waveform Canvas */}
            <div className="h-16 w-full bg-[#0a0c12] rounded-lg border border-[#1b1f2c] overflow-hidden flex items-end px-1 gap-[2px]">
              {telemetryHistoryRef.current.slice(-60).map((t, idx) => {
                const heightPercent = Math.min(100, Math.max(5, t.jerk * 180));
                const isHigh = t.jerk > 0.3;
                return (
                  <div
                    key={idx}
                    style={{ height: `${heightPercent}%` }}
                    className={`flex-1 rounded-t-sm transition-all duration-75 ${
                      isHigh ? 'bg-[#ff4655]' : 'bg-[#00f5d4]/60'
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
              <span>Relaxed baseline</span>
              <span className="text-[#ff4655]">Red spikes = Tensed grip vibration</span>
            </div>
          </div>
        </div>

        {/* Right Col: Instant Stroke Analysis & Feedback */}
        <div className="space-y-4">
          {/* Latest Stroke Diagnosis */}
          <div className="bg-[#131622] border border-[#222738] rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white tracking-wide mb-3 flex items-center justify-between">
              <span>Last Stroke Diagnostic</span>
              {currentStroke && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#1e2436] text-slate-300">
                  {currentStroke.duration.toFixed(0)} ms
                </span>
              )}
            </h3>

            {currentStroke ? (
              <div className="space-y-4">
                {/* Jitter Stability Score Gauge */}
                <div className="bg-[#0b0d14] rounded-xl p-4 border border-[#1f2435]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Path Stability Score</span>
                    <span
                      className={`text-2xl font-black font-mono ${
                        currentStroke.jitterScore >= 80
                          ? 'text-[#00f5d4]'
                          : currentStroke.jitterScore >= 60
                          ? 'text-[#ffb703]'
                          : 'text-[#ff4655]'
                      }`}
                    >
                      {currentStroke.jitterScore}%
                    </span>
                  </div>

                  <div className="w-full bg-[#181c28] h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${currentStroke.jitterScore}%` }}
                      className={`h-full transition-all duration-300 ${
                        currentStroke.jitterScore >= 80
                          ? 'bg-[#00f5d4]'
                          : currentStroke.jitterScore >= 60
                          ? 'bg-[#ffb703]'
                          : 'bg-[#ff4655]'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Unstable / Tense</span>
                    <span>Silky Smooth</span>
                  </div>
                </div>

                {/* Stopping Behavior Check */}
                <div className="bg-[#0b0d14] rounded-xl p-3.5 border border-[#1f2435] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Stopping Damping:</span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        currentStroke.stopBounceDetected ? 'text-[#ff4655]' : 'text-[#00f5d4]'
                      }`}
                    >
                      {currentStroke.stopBounceDetected ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Stop Bounce Detected</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Clean Controlled Stop</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Deceleration Profile:</span>
                    <span className="font-mono text-slate-200">
                      {currentStroke.decelerationQuality}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Peak Velocity:</span>
                    <span className="font-mono text-slate-200">
                      {(currentStroke.peakSpeed * 100).toFixed(0)} px/s
                    </span>
                  </div>
                </div>

                {/* Targeted Advice for the Stroke */}
                <div className="bg-[#181d2c] border border-[#2b334a] rounded-xl p-3.5 text-xs">
                  <span className="font-semibold text-white block mb-1">
                    💡 Coach Feedback:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {currentStroke.stopBounceDetected
                      ? 'When bringing the mouse to a halt, your hand rebounded backward! That rebound is the classic "locked wrist" reflex. Imagine easing the mouse into a pillow rather than hitting a brick wall.'
                      : currentStroke.jitterScore < 70
                      ? `Tremor detected during the micro-movement. Check your thumb and pinky grip on your ${settings.mouseModel || 'mouse'}: if you are pinching the sides too hard, loosen by 20%.`
                      : 'Excellent relaxed stroke! The glide was smooth with zero rebound at the stop.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-4 bg-[#0b0d14] rounded-xl border border-[#1f2435]">
                <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-bounce" />
                <p className="text-xs text-slate-400 font-medium">No movement stroke recorded yet</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Click the canvas and make a quick flick or micro-adjustment to trigger diagnosis.
                </p>
              </div>
            )}
          </div>

          {/* Stroke History Mini-Log */}
          <div className="bg-[#131622] border border-[#222738] rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Recent Stroke History
            </h4>
            {strokeHistory.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {strokeHistory.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-[#0b0d14] px-3 py-1.5 rounded-lg text-xs border border-[#1b1f2c]"
                  >
                    <span className="text-slate-400">#{strokeHistory.length - idx}</span>
                    <span className="font-mono text-slate-300">{(s.totalDistance).toFixed(0)}px</span>
                    <span
                      className={`font-mono font-bold ${
                        s.jitterScore >= 80
                          ? 'text-[#00f5d4]'
                          : s.jitterScore >= 60
                          ? 'text-[#ffb703]'
                          : 'text-[#ff4655]'
                      }`}
                    >
                      {s.jitterScore}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {s.stopBounceDetected ? 'Bounce ⚠️' : 'Smooth ✓'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">History will record here as you train.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
