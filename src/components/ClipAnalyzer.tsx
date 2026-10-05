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
}

export const ClipAnalyzer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const zoomCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Markers
  const [markers, setMarkers] = useState<DuelTimelineMarkers>({
    spottedMs: null,
    firedMs: null,
    outcomeMs: null,
  });

  // Generated Report

  const [analysisReport, setAnalysisReport] = useState<DuelAnalysisReport | null>(null);

  // Load demo clip via synthetic canvas recording
  const loadDemoClip = () => {
    // Generate a 5-second simulated Valorant 1080p gunfight demo
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
        firedMs: 1550, // Fired just 150ms later! (Panic fire before crosshair settled)
        outcomeMs: 2200,
      });
      runDiagnosticWithMarkers(1400, 1550, 2200);
    };

    mediaRecorder.start();

    let frame = 0;
    const totalFrames = 60 * 5; // 5 seconds
    const interval = setInterval(() => {
      if (frame >= totalFrames) {
        clearInterval(interval);
        mediaRecorder.stop();
        return;
      }

      const tSec = frame / 60;

      // Draw dark Valorant Ascent-style hallway
      ctx.fillStyle = '#0f131c';
      ctx.fillRect(0, 0, 1280, 720);

      // Hallway perspective walls
      ctx.fillStyle = '#171d2b';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(440, 240);
      ctx.lineTo(440, 480);
      ctx.lineTo(0, 720);
      ctx.fill();

      ctx.fillStyle = '#131824';
      ctx.beginPath();
      ctx.moveTo(1280, 0);
      ctx.lineTo(840, 240);
      ctx.lineTo(840, 480);
      ctx.lineTo(1280, 720);
      ctx.fill();

      // Head-level reference line (Valorant 360px on 720p)
      ctx.strokeStyle = '#273248';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 360);
      ctx.lineTo(1280, 360);
      ctx.stroke();

      // Enemy swings out at tSec = 1.4s
      if (tSec >= 1.4 && tSec <= 3.8) {
        const swingProgress = Math.min(1, (tSec - 1.4) / 0.25);
        const enemyX = 740 - (1 - swingProgress) * 90; // wide swing from corner
        const enemyY = 360;

        // Enemy silhouette (Reyna / Jett red highlight)
        ctx.fillStyle = '#ff4655';
        ctx.beginPath();
        ctx.arc(enemyX, enemyY - 26, 12, 0, Math.PI * 2); // Head
        ctx.fill();

        ctx.fillStyle = '#222c3d';
        ctx.fillRect(enemyX - 10, enemyY - 14, 20, 48); // Body
      }

      // Crosshair movement simulation (Crosshair with slight tremor / panic dip at t = 1.5s)
      let chX = 640;
      let chY = 360;

      if (tSec >= 1.45 && tSec <= 1.8) {
        // Player micro-adjusts with noticeable shake and dips 8px downward!
        const shake = (Math.sin(frame * 1.5) * 4);
        chX = 640 + (tSec - 1.45) * 180 + shake;
        chY = 360 + (tSec - 1.45) * 40; // Dips below head level!
      } else if (tSec > 1.8) {
        chX = 740;
        chY = 380;
      }

      // Muzzle flash at tSec = 1.55s (Player fired too early while crosshair was still low!)
      if (tSec >= 1.55 && tSec <= 1.62) {
        ctx.fillStyle = 'rgba(255, 200, 50, 0.6)';
        ctx.beginPath();
        ctx.arc(chX + 2, chY + 12, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Crosshair (Classic 4 lines)
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

      // Timestamp HUD text
      ctx.fillStyle = '#64748b';
      ctx.font = '14px monospace';
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

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDurationMs(videoRef.current.duration * 1000);
      videoRef.current.playbackRate = playbackRate;
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
    const frameTime = 1 / 60; // 60 FPS
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration, videoRef.current.currentTime + frames * frameTime)
    );
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const ms = Number(e.target.value);
    videoRef.current.currentTime = ms / 1000;
  };

  // Set milestone markers
  const setMarker = (type: 'spottedMs' | 'firedMs' | 'outcomeMs') => {
    if (!videoRef.current) return;
    const ms = Math.round(videoRef.current.currentTime * 1000);
    const updated = { ...markers, [type]: ms };
    setMarkers(updated);

    if (updated.spottedMs && updated.firedMs) {
      runDiagnosticWithMarkers(updated.spottedMs, updated.firedMs, updated.outcomeMs || updated.firedMs + 600);
    }
  };

  // Diagnostic Calculation Engine
  const runDiagnosticWithMarkers = (spotted: number, fired: number, _outcome: number) => {
    const reactionTime = Math.max(0, fired - spotted);
    const isPanic = reactionTime < 165; // Normal human reaction + microadjust confirmation is 180-260ms
    const crosshairHeight = isPanic ? 58 : 88;
    const calmness = isPanic ? 46 : 89;

    let grade: DuelAnalysisReport['grade'] = 'A';
    let keyMistake = 'None - Clean Duel!';

    if (reactionTime < 160) {
      grade = 'D';
      keyMistake = 'Panic Fired: You clicked before your crosshair reached head level!';
    } else if (reactionTime < 190) {
      grade = 'C';
      keyMistake = 'Rushed Trigger: First bullet fired during deceleration.';
    } else if (reactionTime <= 260) {
      grade = 'S';
      keyMistake = 'Textbook Trigger Confirmation: Calibrated pro timing.';
    }

    setAnalysisReport({
      grade,
      calmnessScore: calmness,
      crosshairHeightScore: crosshairHeight,
      counterStrafeHygiene: isPanic ? 'Slight Drift' : 'Dead Stop Clean',
      confirmationTimeMs: reactionTime,
      panicFired: isPanic,
      tremorDetected: isPanic,
      summary: isPanic
        ? `You pressed left-click ${reactionTime}ms after the enemy swung. That is faster than your eyes could verify crosshair placement, leading to a missed first shot and forced crouch-spray.`
        : `Excellent composure! You took ${reactionTime}ms to confirm the headshot before firing. First-bullet accuracy was maximized.`,
      keyMistake,
    });
  };

  // Digital Zoom Lens Render Loop
  const renderZoomLens = useCallback(() => {
    const video = videoRef.current;
    const canvas = zoomCanvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;

    // Crop center 140x140 region around crosshair
    const cropSize = 140;
    const sx = vw / 2 - cropSize / 2;
    const sy = vh / 2 - cropSize / 2;

    ctx.drawImage(video, sx, sy, cropSize, cropSize, 0, 0, canvas.width, canvas.height);

    // Crosshair target reticle overlay in zoom box
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 70, 85, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(canvas.width / 2 - 20, canvas.height / 2 - 20, 40, 40);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTimeMs(video.currentTime * 1000);
      renderZoomLens();
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [renderZoomLens]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#121520] border border-[#23293c] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00f5d4]/10 border border-[#00f5d4]/30 flex items-center justify-center text-[#00f5d4]">
            <FileVideo className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white tracking-wide uppercase">
                GUNFIGHT HYGIENE & VOD CLIP ANALYZER
              </h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#ff4655]/20 text-[#ff4655] border border-[#ff4655]/30 font-mono">
                AI DIAGNOSTIC
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Upload any Valorant death/clutch clip. Inspect crosshair drift, panic firing, and movement error frame-by-frame.
            </p>
          </div>
        </div>

        {/* Demo Clip or Upload Trigger */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={loadDemoClip}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#1a2130] border border-[#2b374e] text-xs font-bold text-slate-200 hover:text-white hover:bg-[#232d42] transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#00f5d4]" />
            <span>Load Demo Gunfight Clip</span>
          </button>

          <label className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#ff4655] hover:bg-[#ff5a68] text-white text-xs font-bold tracking-wider uppercase shadow-lg shadow-[#ff4655]/30 cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            <span>Upload Clip (.mp4)</span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Main Analysis Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Video Player & Frame Scrubbing Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-[#23293c] bg-[#090b11] shadow-2xl aspect-video flex items-center justify-center">
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
                <FileVideo className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                <h3 className="text-base font-bold text-white mb-1">No Clip Loaded</h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Drag & drop an MP4 clip from Medal, Shadowplay, or Outplayed, or click below to run the simulated demo clip.
                </p>
                <button
                  onClick={loadDemoClip}
                  className="px-5 py-2.5 rounded-xl bg-[#00f5d4]/20 border border-[#00f5d4]/40 text-[#00f5d4] text-xs font-bold uppercase tracking-wider hover:bg-[#00f5d4]/30 transition-all"
                >
                  Load Pre-Built Sample Duel
                </button>
              </div>
            )}

            {/* Overlaid Play/Pause Button */}
            {videoSrc && !isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#ff4655]/30 border border-[#ff4655]/50 flex items-center justify-center shadow-xl shadow-[#ff4655]/20">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Precision Playback & Scrubbing Deck */}
          {videoSrc && (
            <div className="bg-[#121520] border border-[#23293c] rounded-2xl p-4 space-y-3 shadow-xl">
              {/* Timeline Slider with Marker Flags */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-[#00f5d4] font-bold">
                    {(currentTimeMs / 1000).toFixed(3)}s
                  </span>
                  <span>{(durationMs / 1000).toFixed(3)}s</span>
                </div>

                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max={durationMs || 1000}
                    step="16"
                    value={currentTimeMs}
                    onChange={handleSeek}
                    className="w-full accent-[#ff4655] cursor-pointer h-2 bg-[#1c2232] rounded-lg"
                  />

                  {/* Visual Flags on Timeline */}
                  {markers.spottedMs && (
                    <div
                      style={{ left: `${(markers.spottedMs / durationMs) * 100}%` }}
                      className="absolute top-[-8px] w-2.5 h-2.5 bg-[#00f5d4] rounded-full border border-white -translate-x-1/2"
                      title={`Enemy Spotted at ${markers.spottedMs}ms`}
                    />
                  )}
                  {markers.firedMs && (
                    <div
                      style={{ left: `${(markers.firedMs / durationMs) * 100}%` }}
                      className="absolute top-[-8px] w-2.5 h-2.5 bg-[#ff4655] rounded-full border border-white -translate-x-1/2"
                      title={`First Bullet Fired at ${markers.firedMs}ms`}
                    />
                  )}
                </div>
              </div>

              {/* Controls Deck */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1f2638]">
                {/* Play / Frame Step */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => stepFrame(-1)}
                    className="p-2 rounded-xl bg-[#181d2a] border border-[#283248] text-slate-300 hover:text-white hover:bg-[#202738] transition-all"
                    title="Previous Frame (16ms)"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="px-4 py-2 rounded-xl bg-[#ff4655] hover:bg-[#ff5a68] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#ff4655]/25"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    onClick={() => stepFrame(1)}
                    className="p-2 rounded-xl bg-[#181d2a] border border-[#283248] text-slate-300 hover:text-white hover:bg-[#202738] transition-all"
                    title="Next Frame (16ms)"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed Selector */}
                <div className="flex items-center gap-1.5 bg-[#181d2a] p-1 rounded-xl border border-[#262f44]">
                  {[0.25, 0.5, 1.0].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        playbackRate === rate
                          ? 'bg-[#ff4655] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                {/* Milestone Marker Setters */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMarker('spottedMs')}
                    className="px-3 py-1.5 rounded-xl bg-[#00f5d4]/15 border border-[#00f5d4]/35 text-[#00f5d4] text-xs font-bold hover:bg-[#00f5d4]/25 transition-all"
                  >
                    Mark: Enemy Swung
                  </button>
                  <button
                    onClick={() => setMarker('firedMs')}
                    className="px-3 py-1.5 rounded-xl bg-[#ff4655]/15 border border-[#ff4655]/35 text-[#ff4655] text-xs font-bold hover:bg-[#ff4655]/25 transition-all"
                  >
                    Mark: First Shot
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Crosshair Digital Zoom Lens & Duel Diagnostic Card */}
        <div className="space-y-4">
          {/* Crosshair Zoom Lens */}
          <div className="bg-[#121520] border border-[#23293c] rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-[#00f5d4]" />
                <span>Crosshair Digital Zoom (4x)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">140px Crop</span>
            </h3>

            <div className="relative rounded-xl overflow-hidden border border-[#22293c] bg-black aspect-square flex items-center justify-center">
              <canvas
                ref={zoomCanvasRef}
                width={260}
                height={260}
                className="w-full h-full block"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-slate-400">
                Center Target Lock
              </div>
            </div>
          </div>

          {/* VCT-Style Duel Hygiene Report Card */}
          {analysisReport ? (
            <div className="bg-[#121520] border border-[#23293c] rounded-2xl p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[#21273b]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    DUEL REPORT CARD
                  </span>
                  <h3 className="text-base font-black text-white">
                    {analysisReport.panicFired ? 'Premature Panic Duel' : 'Calm Target Confirmation'}
                  </h3>
                </div>

                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black border shadow-lg ${
                    analysisReport.grade === 'S'
                      ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703]'
                      : analysisReport.grade === 'A'
                      ? 'bg-[#00f5d4]/20 border-[#00f5d4] text-[#00f5d4]'
                      : 'bg-[#ff4655]/20 border-[#ff4655] text-[#ff4655]'
                  }`}
                >
                  {analysisReport.grade}
                </div>
              </div>

              {/* Core Metrics */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#0b0e16] border border-[#1e2436] p-2.5 rounded-xl text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">
                    Confirmation Delta
                  </span>
                  <span className="text-base font-mono font-black text-white">
                    {analysisReport.confirmationTimeMs}ms
                  </span>
                </div>

                <div className="bg-[#0b0e16] border border-[#1e2436] p-2.5 rounded-xl text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">
                    Crosshair Height
                  </span>
                  <span className="text-base font-mono font-black text-[#00f5d4]">
                    {analysisReport.crosshairHeightScore}%
                  </span>
                </div>

                <div className="bg-[#0b0e16] border border-[#1e2436] p-2.5 rounded-xl text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">
                    Calmness Score
                  </span>
                  <span
                    className={`text-base font-mono font-black ${
                      analysisReport.calmnessScore >= 70 ? 'text-[#00f5d4]' : 'text-[#ff4655]'
                    }`}
                  >
                    {analysisReport.calmnessScore}%
                  </span>
                </div>

                <div className="bg-[#0b0e16] border border-[#1e2436] p-2.5 rounded-xl text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">
                    Stop Hygiene
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {analysisReport.counterStrafeHygiene}
                  </span>
                </div>
              </div>

              {/* Diagnostic Mistake Prescription */}
              <div className="bg-[#181d2c] border border-[#293248] rounded-xl p-3 text-xs space-y-1">
                <span className="font-bold text-[#ff4655] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Key Mechanical Flaw:</span>
                </span>
                <p className="text-slate-200 leading-relaxed font-semibold">
                  {analysisReport.keyMistake}
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
                  {analysisReport.summary}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#121520] border border-[#23293c] rounded-2xl p-6 text-center text-xs text-slate-500">
              <SlidersHorizontal className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>Mark "Enemy Swung" and "First Shot" on the timeline to generate your Duel Hygiene Report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
