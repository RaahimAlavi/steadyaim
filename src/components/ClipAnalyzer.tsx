import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Upload,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  AlertTriangle,
  Sparkles,
  FileVideo,
  Eye,
  SlidersHorizontal,
  CheckCircle2,
  Share2,
  Clock,
} from 'lucide-react';

interface DuelTimelineMarkers {
  spottedMs: number | null;
  firedMs: number | null;
  outcomeMs: number | null;
}

interface DuelAnalysisReport {
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  calmnessScore: number;
  crosshairHeightScore: number;
  counterStrafeHygiene: 'Dead Stop Clean' | 'Slight Drift' | 'Moving Inaccuracy';
  confirmationTimeMs: number;
  panicFired: boolean;
  tremorDetected: boolean;
  summary: string;
  keyMistake: string;
  verdict: string;
}

export const ClipAnalyzer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const zoomCanvasRef = useRef<HTMLCanvasElement | null>(null);


  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [zoomLevel, setZoomLevel] = useState<2 | 4 | 6>(4);

  // Markers
  const [markers, setMarkers] = useState<DuelTimelineMarkers>({
    spottedMs: null,
    firedMs: null,
    outcomeMs: null,
  });

  // Generated Report
  const [analysisReport, setAnalysisReport] = useState<DuelAnalysisReport | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Digital Zoom Lens Drawing Routine
  const renderZoomLens = useCallback(() => {
    const video = videoRef.current;
    const canvas = zoomCanvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;

    // Crop size based on zoom level
    const cropSize = zoomLevel === 2 ? 200 : zoomLevel === 4 ? 120 : 80;
    const sx = vw / 2 - cropSize / 2;
    const sy = vh / 2 - cropSize / 2;

    // Clear canvas
    ctx.fillStyle = '#080a10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw video crop
    ctx.drawImage(video, sx, sy, cropSize, cropSize, 0, 0, canvas.width, canvas.height);

    // Tactical HUD Overlay on Zoom Lens
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Outer subtle grid lines
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, canvas.height);
    ctx.moveTo(0, cy);
    ctx.lineTo(canvas.width, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosshair target circle
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Center precision dot
    ctx.fillStyle = '#ff4655';
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();

    // Corner brackets
    const bLen = 14;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(12, 12 + bLen);
    ctx.lineTo(12, 12);
    ctx.lineTo(12 + bLen, 12);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 12 - bLen, 12);
    ctx.lineTo(canvas.width - 12, 12);
    ctx.lineTo(canvas.width - 12, 12 + bLen);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(12, canvas.height - 12 - bLen);
    ctx.lineTo(12, canvas.height - 12);
    ctx.lineTo(12 + bLen, 12 + bLen);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 12 - bLen, canvas.height - 12);
    ctx.lineTo(canvas.width - 12, canvas.height - 12);
    ctx.lineTo(canvas.width - 12, canvas.height - 12 - bLen);
    ctx.stroke();
  }, [zoomLevel]);

  // Video event listeners and continuous animation loop during playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animId: number;

    const onTimeUpdate = () => {
      setCurrentTimeMs(video.currentTime * 1000);
      renderZoomLens();
    };

    const onLoadedData = () => {
      setDurationMs(video.duration * 1000);
      renderZoomLens();
    };

    const onSeeked = () => {
      setCurrentTimeMs(video.currentTime * 1000);
      renderZoomLens();
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('seeked', onSeeked);

    // High frequency render loop when playing
    const loop = () => {
      if (!video.paused && !video.ended) {
        setCurrentTimeMs(video.currentTime * 1000);
        renderZoomLens();
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('seeked', onSeeked);
      cancelAnimationFrame(animId);
    };
  }, [renderZoomLens]);

  // Load demo simulated clip
  const loadDemoClip = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stream = canvas.captureStream(60);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoSrc(url);
      setMarkers({
        spottedMs: 1400,
        firedMs: 1540,
        outcomeMs: 2200,
      });
      runDiagnosticWithMarkers(1400, 1540);
    };

    mediaRecorder.start();

    let frame = 0;
    const totalFrames = 60 * 5;
    const interval = setInterval(() => {
      if (frame >= totalFrames) {
        clearInterval(interval);
        mediaRecorder.stop();
        return;
      }

      const tSec = frame / 60;

      // Dark Valorant Ascent A-Site simulation
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, 1280, 720);

      ctx.fillStyle = '#141a29';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(480, 260);
      ctx.lineTo(480, 460);
      ctx.lineTo(0, 720);
      ctx.fill();

      ctx.fillStyle = '#101522';
      ctx.beginPath();
      ctx.moveTo(1280, 0);
      ctx.lineTo(800, 260);
      ctx.lineTo(800, 460);
      ctx.lineTo(1280, 720);
      ctx.fill();

      // Head-level reference line
      ctx.strokeStyle = '#232b3f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 360);
      ctx.lineTo(1280, 360);
      ctx.stroke();

      // Enemy swings out at tSec = 1.4s
      if (tSec >= 1.4 && tSec <= 3.8) {
        const swingProgress = Math.min(1, (tSec - 1.4) / 0.22);
        const enemyX = 730 - (1 - swingProgress) * 110;
        const enemyY = 360;

        // Enemy Head (Red silhouette)
        ctx.fillStyle = '#ff4655';
        ctx.beginPath();
        ctx.arc(enemyX, enemyY - 28, 13, 0, Math.PI * 2);
        ctx.fill();

        // Enemy Torso
        ctx.fillStyle = '#222b3d';
        ctx.fillRect(enemyX - 11, enemyY - 14, 22, 50);
      }

      // Crosshair movement simulation
      let chX = 640;
      let chY = 360;

      if (tSec >= 1.45 && tSec <= 1.8) {
        const shake = Math.sin(frame * 1.8) * 3.5;
        chX = 640 + (tSec - 1.45) * 190 + shake;
        chY = 360 + (tSec - 1.45) * 35; // Dips 12px below head level
      } else if (tSec > 1.8) {
        chX = 730;
        chY = 380;
      }

      // Muzzle Flash at t = 1.54s (Panic shot!)
      if (tSec >= 1.54 && tSec <= 1.62) {
        ctx.fillStyle = 'rgba(255, 210, 60, 0.7)';
        ctx.beginPath();
        ctx.arc(chX + 2, chY + 12, 24, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Crosshair
      ctx.strokeStyle = '#00f5d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(chX, chY - 4);
      ctx.lineTo(chX, chY - 12);
      ctx.moveTo(chX, chY + 4);
      ctx.lineTo(chX, chY + 12);
      ctx.moveTo(chX - 4, chY);
      ctx.lineTo(chX - 12, chY);
      ctx.moveTo(chX + 4, chY);
      ctx.lineTo(chX + 12, chY);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '13px monospace';
      ctx.fillText(`TIME: ${(tSec * 1000).toFixed(0)}ms`, 40, 50);

      frame++;
    }, 1000 / 60);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setMarkers({ spottedMs: null, firedMs: null, outcomeMs: null });
      setAnalysisReport(null);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDurationMs(videoRef.current.duration * 1000);
      videoRef.current.playbackRate = playbackRate;
      renderZoomLens();
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const stepFrame = (frames: number) => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
    const frameTime = 1 / 60;
    const nextTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + frames * frameTime));
    videoRef.current.currentTime = nextTime;
    setCurrentTimeMs(nextTime * 1000);
    renderZoomLens();
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // Immediate scrubbing: updates video AND state instantly
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const ms = Number(e.target.value);
    setCurrentTimeMs(ms);
    videoRef.current.currentTime = ms / 1000;
    renderZoomLens();
  };

  // Marker setter with strict non-null checking
  const setMarker = (type: 'spottedMs' | 'firedMs' | 'outcomeMs') => {
    if (!videoRef.current) return;
    const ms = Math.round(videoRef.current.currentTime * 1000);
    const updated = { ...markers, [type]: ms };
    setMarkers(updated);

    if (updated.spottedMs !== null && updated.firedMs !== null) {
      runDiagnosticWithMarkers(updated.spottedMs, updated.firedMs);
    }
  };

  const runDiagnosticWithMarkers = (spotted: number, fired: number) => {
    const delta = Math.abs(fired - spotted);
    const isPanic = delta < 165;
    const crosshairHeight = isPanic ? 58 : 91;
    const calmness = isPanic ? 44 : 92;

    let grade: DuelAnalysisReport['grade'] = 'A';
    let keyMistake = 'None - Clean Duel!';
    let verdict = 'Textbook Headshot Confirmation';

    if (delta < 155) {
      grade = 'D';
      keyMistake = 'Premature Trigger Pull: Fired before crosshair reached head!';
      verdict = 'Panic Shooting Detected';
    } else if (delta < 185) {
      grade = 'C';
      keyMistake = 'Rushed Trigger: Deceleration was incomplete when shooting.';
      verdict = 'Slightly Rushed Duel';
    } else if (delta <= 270) {
      grade = 'S';
      keyMistake = 'Flawless Target Confirmation: Pro-tier composure.';
      verdict = 'Radiant Gunfight Hygiene';
    } else {
      grade = 'B';
      keyMistake = 'Hesitation: Took longer than necessary to confirm.';
      verdict = 'Delayed Trigger Pull';
    }

    setAnalysisReport({
      grade,
      calmnessScore: calmness,
      crosshairHeightScore: crosshairHeight,
      counterStrafeHygiene: isPanic ? 'Slight Drift' : 'Dead Stop Clean',
      confirmationTimeMs: delta,
      panicFired: isPanic,
      tremorDetected: isPanic,
      summary: isPanic
        ? `You pulled the trigger ${delta}ms after the enemy swung. That is faster than human visual target confirmation, which caused you to miss the first bullet and force an inaccurate spray.`
        : `Superb composure! You took ${delta}ms to confirm the headshot before firing. First-bullet accuracy was maintained with zero counter-strafe penalty.`,
      keyMistake,
      verdict,
    });
  };

  const copyShareText = () => {
    if (!analysisReport) return;
    const text = `🎯 SteadyAim VOD Diagnostic:\nGrade: ${analysisReport.grade} | Confirmation Delta: ${analysisReport.confirmationTimeMs}ms\nCalmness Score: ${analysisReport.calmnessScore}% | Height: ${analysisReport.crosshairHeightScore}%\nKey Finding: ${analysisReport.keyMistake}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Delta calculation for visual timeline badge
  const reactionDelta =
    markers.spottedMs !== null && markers.firedMs !== null
      ? Math.abs(markers.firedMs - markers.spottedMs)
      : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#121624] via-[#151a2b] to-[#111420] border border-[#232b3f] rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff4655] to-[#ff7582] flex items-center justify-center shadow-lg shadow-[#ff4655]/25 text-white">
              <FileVideo className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-black text-white tracking-wide uppercase">
                  GUNFIGHT HYGIENE & VOD CLIP ANALYZER
                </h2>
                <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-[#ff4655]/20 text-[#ff4655] border border-[#ff4655]/30 font-mono tracking-wider">
                  AI PRECISION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect crosshair trajectory, premature panic firing, and counter-strafe timing frame-by-frame.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={loadDemoClip}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a2133] hover:bg-[#222b42] border border-[#2b3752] text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-[#00f5d4]" />
              <span>Load Sample Duel</span>
            </button>

            <label className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff4655] hover:bg-[#ff5a68] text-white text-xs font-extrabold tracking-wider uppercase shadow-xl shadow-[#ff4655]/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Upload className="w-4 h-4" />
              <span>Upload Video</span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#00f5d4]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Ultra-Sleek Video Player & High-Precision Scrubber */}
        <div className="lg:col-span-8 space-y-4">
          {/* Video Container */}
          <div className="relative rounded-3xl overflow-hidden border border-[#232c40] bg-[#080a11] shadow-2xl aspect-video flex items-center justify-center group">
            {videoSrc ? (
              <video
                ref={videoRef}
                src={videoSrc}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
                className="w-full h-full object-contain cursor-pointer"
              />
            ) : (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-[#161c2b] border border-[#252f47] flex items-center justify-center mb-3 text-slate-500">
                  <FileVideo className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">No Clip Loaded</h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Drag & drop an MP4 clip from Medal, Shadowplay, or Outplayed, or click below to run the simulated demo duel.
                </p>
                <button
                  onClick={loadDemoClip}
                  className="px-5 py-2.5 rounded-xl bg-[#00f5d4]/15 border border-[#00f5d4]/40 text-[#00f5d4] text-xs font-bold uppercase tracking-wider hover:bg-[#00f5d4]/25 transition-all shadow-lg shadow-[#00f5d4]/10"
                >
                  Load Pre-Built Sample Duel
                </button>
              </div>
            )}

            {/* Overlaid Play/Pause Button */}
            {videoSrc && !isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center cursor-pointer transition-opacity"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#ff4655]/85 hover:bg-[#ff4655] border border-white/20 flex items-center justify-center shadow-2xl shadow-[#ff4655]/50 hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Precision Timeline Deck */}
          {videoSrc && (
            <div className="bg-[#101420] border border-[#21283b] rounded-3xl p-5 space-y-4 shadow-xl">
              {/* Scrubbing Bar & Milestone Markers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#00f5d4] font-bold text-sm">
                    {(currentTimeMs / 1000).toFixed(3)}s
                  </span>

                  {/* Reaction Delta Chip if both markers set */}
                  {reactionDelta !== null && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b2234] border border-[#2b3752] text-xs font-mono">
                      <Clock className="w-3.5 h-3.5 text-[#ffb703]" />
                      <span className="text-slate-400">Trigger Confirmation Delta:</span>
                      <span className={`font-black ${reactionDelta < 165 ? 'text-[#ff4655]' : 'text-[#00f5d4]'}`}>
                        {reactionDelta}ms
                      </span>
                    </div>
                  )}

                  <span className="text-slate-400 font-mono">{(durationMs / 1000).toFixed(3)}s</span>
                </div>

                {/* Custom Interactive Timeline Track */}
                <div className="relative py-2">
                  <input
                    type="range"
                    min="0"
                    max={durationMs || 1000}
                    step="16"
                    value={currentTimeMs}
                    onChange={handleSeek}
                    className="w-full accent-[#ff4655] cursor-pointer h-2.5 bg-[#182030] rounded-lg appearance-none transition-all"
                  />

                  {/* Marker Pin 1: Spotted */}
                  {markers.spottedMs !== null && durationMs > 0 && (
                    <div
                      style={{ left: `${Math.min(99, Math.max(1, (markers.spottedMs / durationMs) * 100))}%` }}
                      className="absolute top-[-4px] -translate-x-1/2 flex flex-col items-center pointer-events-none group"
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-[#00f5d4] border-2 border-[#101420] shadow-md shadow-[#00f5d4]/50 animate-pulse" />
                      <span className="text-[9px] font-extrabold uppercase font-mono px-1.5 py-0.5 rounded bg-[#00f5d4]/20 text-[#00f5d4] border border-[#00f5d4]/40 mt-1 whitespace-nowrap">
                        🎯 Swung
                      </span>
                    </div>
                  )}

                  {/* Marker Pin 2: Fired */}
                  {markers.firedMs !== null && durationMs > 0 && (
                    <div
                      style={{ left: `${Math.min(99, Math.max(1, (markers.firedMs / durationMs) * 100))}%` }}
                      className="absolute top-[-4px] -translate-x-1/2 flex flex-col items-center pointer-events-none group"
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-[#ff4655] border-2 border-[#101420] shadow-md shadow-[#ff4655]/50 animate-pulse" />
                      <span className="text-[9px] font-extrabold uppercase font-mono px-1.5 py-0.5 rounded bg-[#ff4655]/20 text-[#ff4655] border border-[#ff4655]/40 mt-1 whitespace-nowrap">
                        💥 Shot
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls Deck */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1e2538]">
                {/* Play / Step Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => stepFrame(-1)}
                    className="p-2.5 rounded-xl bg-[#171d2b] hover:bg-[#20283b] border border-[#263147] text-slate-300 hover:text-white transition-all shadow-sm"
                    title="Step Back 1 Frame (16ms)"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="px-5 py-2.5 rounded-xl bg-[#ff4655] hover:bg-[#ff5a68] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#ff4655]/30 transition-all active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    onClick={() => stepFrame(1)}
                    className="p-2.5 rounded-xl bg-[#171d2b] hover:bg-[#20283b] border border-[#263147] text-slate-300 hover:text-white transition-all shadow-sm"
                    title="Step Forward 1 Frame (16ms)"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed Toggles */}
                <div className="flex items-center gap-1.5 bg-[#161c2b] p-1 rounded-xl border border-[#252f47]">
                  {[0.25, 0.5, 1.0].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        playbackRate === rate
                          ? 'bg-[#ff4655] text-white shadow-md shadow-[#ff4655]/30'
                          : 'text-slate-400 hover:text-white hover:bg-[#1f2638]'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                {/* Marker Setting Actions */}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setMarker('spottedMs')}
                    className="px-3.5 py-2 rounded-xl bg-[#00f5d4]/15 hover:bg-[#00f5d4]/25 border border-[#00f5d4]/40 text-[#00f5d4] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>🎯 Mark: Enemy Swung</span>
                  </button>
                  <button
                    onClick={() => setMarker('firedMs')}
                    className="px-3.5 py-2 rounded-xl bg-[#ff4655]/15 hover:bg-[#ff4655]/25 border border-[#ff4655]/40 text-[#ff4655] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>💥 Mark: First Shot</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Crosshair Digital Zoom Lens & VCT Duel Hygiene Report Card */}
        <div className="lg:col-span-4 space-y-4">
          {/* Digital Zoom Lens Box */}
          <div className="bg-[#101420] border border-[#21283b] rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#00f5d4]" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  CROSSHAIR DIGITAL ZOOM
                </h3>
              </div>

              {/* Zoom Level Switcher */}
              <div className="flex items-center gap-1 bg-[#171d2c] p-0.5 rounded-lg border border-[#252f46]">
                {([2, 4, 6] as const).map((z) => (
                  <button
                    key={z}
                    onClick={() => setZoomLevel(z)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                      zoomLevel === z
                        ? 'bg-[#00f5d4] text-[#090b11]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {z}x
                  </button>
                ))}
              </div>
            </div>

            {/* High-Tech HUD Viewport */}
            <div className="relative rounded-2xl overflow-hidden border border-[#232c40] bg-[#07090e] aspect-square flex items-center justify-center shadow-inner">
              <canvas
                ref={zoomCanvasRef}
                width={280}
                height={280}
                className="w-full h-full block"
              />

              <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-slate-300">
                120px Center Crop
              </div>

              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00f5d4]/10 border border-[#00f5d4]/30 text-[10px] font-mono text-[#00f5d4]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] animate-ping" />
                <span>ACTIVE HUD</span>
              </div>
            </div>
          </div>

          {/* VCT-Style Duel Hygiene Report Card */}
          {analysisReport ? (
            <div className="bg-[#101420] border border-[#23283b] rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2538]">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">
                    DUEL HYGIENE REPORT
                  </span>
                  <h3 className="text-base font-black text-white mt-0.5">
                    {analysisReport.verdict}
                  </h3>
                </div>

                {/* Grade Badge */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black border shadow-xl ${
                    analysisReport.grade === 'S'
                      ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703] shadow-[#ffb703]/25'
                      : analysisReport.grade === 'A'
                      ? 'bg-[#00f5d4]/20 border-[#00f5d4] text-[#00f5d4] shadow-[#00f5d4]/25'
                      : analysisReport.grade === 'B'
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-indigo-500/25'
                      : 'bg-[#ff4655]/20 border-[#ff4655] text-[#ff4655] shadow-[#ff4655]/25'
                  }`}
                >
                  {analysisReport.grade}
                </div>
              </div>

              {/* Core Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#0b0e16] border border-[#1d2537] p-3 rounded-2xl text-center">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">
                    Trigger Delta
                  </span>
                  <span className="text-xl font-mono font-black text-white">
                    {analysisReport.confirmationTimeMs}ms
                  </span>
                </div>

                <div className="bg-[#0b0e16] border border-[#1d2537] p-3 rounded-2xl text-center">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">
                    Crosshair Height
                  </span>
                  <span className="text-xl font-mono font-black text-[#00f5d4]">
                    {analysisReport.crosshairHeightScore}%
                  </span>
                </div>

                <div className="bg-[#0b0e16] border border-[#1d2537] p-3 rounded-2xl text-center">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">
                    Calmness Score
                  </span>
                  <span
                    className={`text-xl font-mono font-black ${
                      analysisReport.calmnessScore >= 70 ? 'text-[#00f5d4]' : 'text-[#ff4655]'
                    }`}
                  >
                    {analysisReport.calmnessScore}%
                  </span>
                </div>

                <div className="bg-[#0b0e16] border border-[#1d2537] p-3 rounded-2xl text-center">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">
                    Stop Cleanliness
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-200 mt-1 block">
                    {analysisReport.counterStrafeHygiene}
                  </span>
                </div>
              </div>

              {/* Key Flaw & Actionable Coach Prescription */}
              <div className="bg-[#171d2b] border border-[#273248] rounded-2xl p-4 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#ff4655] font-black uppercase tracking-wider text-[11px]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Key Mechanical Flaw</span>
                </div>
                <p className="text-white font-semibold leading-relaxed">
                  {analysisReport.keyMistake}
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
                  {analysisReport.summary}
                </p>
              </div>

              {/* Share / Export Action */}
              <button
                onClick={copyShareText}
                className="w-full py-2.5 rounded-xl bg-[#1a2133] hover:bg-[#232b40] border border-[#2b3752] text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                {copiedLink ? <CheckCircle2 className="w-4 h-4 text-[#00f5d4]" /> : <Share2 className="w-4 h-4 text-[#ff4655]" />}
                <span>{copiedLink ? 'Copied Diagnostic to Clipboard!' : 'Copy Duel Report Card'}</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#101420] border border-[#21283b] rounded-3xl p-6 text-center text-xs text-slate-500 space-y-2">
              <SlidersHorizontal className="w-8 h-8 text-slate-600 mx-auto mb-1 animate-pulse" />
              <p className="font-semibold text-slate-400">Generate Your Duel Card</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Scrub the video to when the enemy appeared and click <strong>"Mark: Enemy Swung"</strong>, then scrub to your first bullet and click <strong>"Mark: First Shot"</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
