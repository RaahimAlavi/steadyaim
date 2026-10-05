import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  Skull,
  Lock,
  Play,
  Crosshair,
  Shield,
  X,
  Target,
  Trophy,
  Info,
  Check,
  Zap,
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { storageEngine } from '../utils/storageEngine';

export interface CampaignNode {
  id: number;
  exerciseNum: number;
  title: string;
  category: 'FLICKING' | 'PRECISION' | 'SPEED GATE' | 'STABILIZATION' | 'APEX';
  starsEarned: number;
  status: 'completed' | 'current' | 'locked';
  drillType: 'whisper' | 'stopping' | 'tile-frenzy';
  targetDesc: string;
  distance: string;
}

const BASE_NODES: CampaignNode[] = [
  {
    id: 1,
    exerciseNum: 1,
    title: 'Micro Flick 5m',
    category: 'FLICKING',
    starsEarned: 3,
    status: 'completed',
    drillType: 'whisper',
    targetDesc: 'Eliminate targets at 5m head-height. Maintain zero micro-bounce during flick stops.',
    distance: '5.0m',
  },
  {
    id: 2,
    exerciseNum: 2,
    title: 'Stopping Power 10m',
    category: 'FLICKING',
    starsEarned: 3,
    status: 'completed',
    drillType: 'stopping',
    targetDesc: 'Rapid 10m snap flicks. Halt mouse inertia instantly on target with zero jitter.',
    distance: '10.0m',
  },
  {
    id: 3,
    exerciseNum: 3,
    title: 'Tile Frenzy (30s Speed Gate)',
    category: 'SPEED GATE',
    starsEarned: 2,
    status: 'completed',
    drillType: 'tile-frenzy',
    targetDesc: 'Destroy concurrent glowing sphere targets on the stadium wall within 30 seconds.',
    distance: '15.0m',
  },
  {
    id: 4,
    exerciseNum: 4,
    title: 'Jitter Stabilization Protocol',
    category: 'STABILIZATION',
    starsEarned: 0,
    status: 'current',
    drillType: 'whisper',
    targetDesc: 'Combat muscle fatigue. Keep mouse sensor trajectory under 1.5px variance while tracking.',
    distance: '12.0m',
  },
  {
    id: 5,
    exerciseNum: 5,
    title: 'Radiant Flick Apex',
    category: 'APEX',
    starsEarned: 0,
    status: 'locked',
    drillType: 'stopping',
    targetDesc: 'The ultimate tactical FPS test: combined snaps, 15m head targets, and 120ms reaction window.',
    distance: '15.0m',
  },
];

export function computeNodeStatuses(baseNodes: CampaignNode[]): CampaignNode[] {
  let foundCurrent = false;
  return baseNodes.map((node) => {
    const stars = storageEngine.getNodeStars(node.id);
    let status: CampaignNode['status'] = 'locked';

    if (stars > 0) {
      status = 'completed';
    } else if (!foundCurrent) {
      status = 'current';
      foundCurrent = true;
    } else {
      status = 'locked';
    }

    return {
      ...node,
      starsEarned: stars,
      status,
    };
  });
}

interface PathToRadiantProps {
  onLaunchDrill: (drillType: 'whisper' | 'stopping' | 'tile-frenzy', nodeId: number) => void;
  currentEdpi: number;
}

export const PathToRadiant: React.FC<PathToRadiantProps> = ({
  onLaunchDrill,
  currentEdpi,
}) => {
  const [nodes, setNodes] = useState<CampaignNode[]>(() => computeNodeStatuses(BASE_NODES));
  const [selectedNode, setSelectedNode] = useState<CampaignNode | null>(null);

  // Sync stars from storage on mount and when stars update
  const syncNodesFromStorage = useCallback(() => {
    setNodes(computeNodeStatuses(BASE_NODES));
  }, []);

  useEffect(() => {
    syncNodesFromStorage();

    window.addEventListener('steadyaim:stars_updated', syncNodesFromStorage);
    window.addEventListener('focus', syncNodesFromStorage);
    return () => {
      window.removeEventListener('steadyaim:stars_updated', syncNodesFromStorage);
      window.removeEventListener('focus', syncNodesFromStorage);
    };
  }, [syncNodesFromStorage]);

  const totalStarsEarned = nodes.reduce((acc, n) => acc + n.starsEarned, 0);
  const maxPossibleStars = nodes.length * 3;

  const handleNodeClick = (node: CampaignNode) => {
    audioEngine.playClick();
    setSelectedNode(node);
  };

  const handleStartMission = (node: CampaignNode) => {
    if (node.status === 'locked') return;

    audioEngine.playClick();
    setSelectedNode(null);

    // Request fullscreen automatically as requested by user
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    onLaunchDrill(node.drillType, node.id);
  };

  return (
    <div className="relative min-h-[92dvh] bg-[#0b101c] text-slate-100 flex flex-col lg:flex-row overflow-hidden border-b border-[#1c273c] select-none">
      {/* Tactical Esports Blueprint Grid Texture (Clear, crisp, non-glaring) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.08) 1px, transparent 1px),
            radial-gradient(circle at 50% 28%, rgba(37, 99, 235, 0.12) 0%, transparent 65%)
          `,
          backgroundSize: '40px 40px, 40px 40px, 100% 100%',
        }}
      />

      {/* Center Main Stage Progression Winding Path */}
      <div className="flex-1 flex flex-col overflow-y-auto px-4 md:px-8 py-6 relative z-10">
        {/* Top Chapter Header Banner matching 3D Aim Trainer benchmark */}
        <div className="w-full max-w-4xl mx-auto mb-8 rounded-2xl bg-[#121828] border border-[#24334f] p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-sm">
              <Crosshair className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold tracking-widest text-blue-400 uppercase">
                  CHAPTER 1
                </span>
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Foundations of Accuracy
              </h2>
            </div>
          </div>

          {/* Stars Progress in Chapter */}
          <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1.5 min-w-[200px]">
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-mono font-bold text-slate-200">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
                <span>{totalStarsEarned} / {maxPossibleStars} Stars</span>
              </span>
              <span className="text-slate-400 font-semibold">
                ({Math.round((totalStarsEarned / maxPossibleStars) * 100)}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#0a0e1a] border border-[#1e2a3f] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                style={{ width: `${(totalStarsEarned / maxPossibleStars) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Winding Hexagonal Pedestal Nodes Tree */}
        <div className="relative w-full max-w-2xl mx-auto py-4 flex flex-col items-center">
          {/* Laser Conduit Connection SVG Line - Full height covering all 5 nodes */}
          <svg
            className="absolute top-8 left-0 w-full h-[1060px] pointer-events-none z-0"
            viewBox="0 0 400 1060"
            fill="none"
          >
            <defs>
              <filter id="glow-laser" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base Structural Conduit Backbone Track */}
            <path
              d="M 168 80 C 168 192, 232 192, 232 304 C 232 416, 168 416, 168 528 C 168 640, 232 640, 232 752 C 232 864, 168 864, 168 976"
              stroke="#1a2438"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Segment 1: Node 1 -> Node 2 */}
            <path
              d="M 168 80 C 168 192, 232 192, 232 304"
              stroke={nodes[1]?.status === 'completed' || nodes[1]?.status === 'current' ? '#3b82f6' : '#27344c'}
              strokeWidth="3.5"
              strokeLinecap="round"
              filter={nodes[1]?.status === 'completed' ? 'url(#glow-laser)' : undefined}
            />

            {/* Segment 2: Node 2 -> Node 3 */}
            <path
              d="M 232 304 C 232 416, 168 416, 168 528"
              stroke={nodes[2]?.status === 'completed' || nodes[2]?.status === 'current' ? '#3b82f6' : '#27344c'}
              strokeWidth="3.5"
              strokeLinecap="round"
              filter={nodes[2]?.status === 'completed' ? 'url(#glow-laser)' : undefined}
            />

            {/* Segment 3: Node 3 -> Node 4 */}
            <path
              d="M 168 528 C 168 640, 232 640, 232 752"
              stroke={
                nodes[3]?.status === 'completed'
                  ? '#3b82f6'
                  : nodes[3]?.status === 'current'
                  ? '#60a5fa'
                  : '#27344c'
              }
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={nodes[3]?.status === 'current' ? '8 6' : undefined}
              filter={nodes[3]?.status === 'completed' ? 'url(#glow-laser)' : undefined}
            />

            {/* Segment 4: Node 4 -> Node 5 */}
            <path
              d="M 232 752 C 232 864, 168 864, 168 976"
              stroke={
                nodes[4]?.status === 'completed'
                  ? '#3b82f6'
                  : nodes[4]?.status === 'current'
                  ? '#60a5fa'
                  : '#27344c'
              }
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={nodes[4]?.status === 'current' ? '8 6' : undefined}
              filter={nodes[4]?.status === 'completed' ? 'url(#glow-laser)' : undefined}
            />
          </svg>

          {/* Render Hex Nodes */}
          <div className="flex flex-col items-center gap-12 relative z-10 w-full">
            {nodes.map((node, index) => {
              const xOffset = index % 2 === 0 ? '-translate-x-8' : 'translate-x-8';
              const isCompleted = node.status === 'completed';
              const isCurrent = node.status === 'current';
              const isLocked = node.status === 'locked';

              return (
                <div
                  key={node.id}
                  className={`flex flex-col items-center transition-all ${xOffset}`}
                >
                  {/* Floating Stars */}
                  <div className="flex items-center gap-1.5 mb-2 h-6">
                    {[1, 2, 3].map((starIdx) => {
                      const hasStar = isCompleted && starIdx <= node.starsEarned;
                      return (
                        <Star
                          key={starIdx}
                          className={`w-5 h-5 transition-transform ${
                            hasStar
                              ? 'fill-amber-400 text-amber-400 scale-105 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                              : 'fill-transparent text-[#263248]'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* 3D Hexagonal Pedestal Node */}
                  <button
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={() => audioEngine.playHover()}
                    className={`relative w-24 h-24 flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 ${
                      isCompleted
                        ? 'text-slate-100'
                        : isCurrent
                        ? 'text-white'
                        : isLocked
                        ? 'text-slate-500 opacity-80 hover:opacity-100'
                        : 'text-slate-400'
                    }`}
                  >
                    {/* Metallic Hex Pedestal Background */}
                    <div
                      className={`absolute inset-0 rounded-[22px] border-2 transition-all rotate-45 ${
                        isCompleted
                          ? 'bg-[#131b2e] border-blue-500 shadow-[0_0_18px_rgba(59,130,246,0.35)]'
                          : isCurrent
                          ? 'bg-[#1e1b24] border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.4)] animate-pulse'
                          : 'bg-[#121825] border-[#25334c] shadow-sm'
                      }`}
                    />

                    {/* Node Center Insignia */}
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      {isCompleted ? (
                        <div className="w-10 h-10 rounded-full bg-blue-500/25 border border-blue-400 flex items-center justify-center text-blue-300">
                          <Target className="w-5 h-5" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-10 h-10 rounded-full bg-amber-500/25 border border-amber-400 flex items-center justify-center text-amber-300">
                          <Skull className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#182030] flex items-center justify-center text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Active Objective Pulse Ring */}
                    {isCurrent && (
                      <span className="absolute -top-3 -right-2 z-20 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-mono font-black tracking-wider uppercase shadow-md animate-bounce">
                        ACTIVE
                      </span>
                    )}
                  </button>

                  {/* Stage Label Below Pedestal */}
                  <div className="mt-3 text-center">
                    <span
                      className={`text-xs font-black uppercase tracking-wider block ${
                        isCurrent
                          ? 'text-amber-400'
                          : isCompleted
                          ? 'text-white'
                          : 'text-slate-400'
                      }`}
                    >
                      {node.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {node.distance} Range
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Progress & League Standings Sidebar matching 3D Aim Trainer benchmark */}
      <div className="w-full lg:w-80 p-6 bg-[#0f1524] border-t lg:border-t-0 lg:border-l border-[#1d273c] flex flex-col gap-6 relative z-10">
        {/* Profile Status Card */}
        <div className="p-5 rounded-2xl bg-[#141b2c] border border-[#233149] shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase">Profile Synced</h4>
              <span className="text-[10px] font-mono text-emerald-400">LOCAL CLOUD ACTIVE</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Your telemetry and micro-jitter records are continuously saved for live progress analysis.
          </p>
          <div className="text-[11px] font-mono text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 flex items-center justify-between">
            <span>ACTIVE SENS</span>
            <span className="font-bold text-white">{currentEdpi.toFixed(1)} eDPI</span>
          </div>
        </div>

        {/* My Overall Progress Card */}
        <div className="p-5 rounded-2xl bg-[#141b2c] border border-[#233149] shadow-md">
          <h4 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-4">
            CHAPTER 1 PROGRESS
          </h4>

          {/* Stars Metric */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                Stars Earned
              </span>
              <span className="font-mono text-slate-200 font-bold">
                {totalStarsEarned} / {maxPossibleStars} <span className="text-slate-400 font-normal">({Math.round((totalStarsEarned / maxPossibleStars) * 100)}%)</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#0a0e1a] border border-[#1e2a3f] overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                style={{ width: `${(totalStarsEarned / maxPossibleStars) * 100}%` }}
              />
            </div>
          </div>

          {/* Exercises Metric */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                <Shield className="w-4 h-4 text-blue-400" />
                Exercises Cleared
              </span>
              <span className="font-mono text-slate-200 font-bold">
                {nodes.filter((n) => n.status === 'completed').length} / {nodes.length} <span className="text-slate-400 font-normal">({Math.round((nodes.filter((n) => n.status === 'completed').length / nodes.length) * 100)}%)</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#0a0e1a] border border-[#1e2a3f] overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                style={{ width: `${(nodes.filter((n) => n.status === 'completed').length / nodes.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* League Standings Card */}
        <div className="p-5 rounded-2xl bg-[#141b2c] border border-[#233149] shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
              TACTICAL BENCHMARK
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-[#182238] border-2 border-blue-500/50 flex items-center justify-center text-blue-400 shadow-sm">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="text-lg font-black text-white tracking-tight">
                Radiant Path
              </div>
              <span className="text-xs text-slate-400">Micro-Glide & Recoil Mastery</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-2">
            Clear every stage with 3 stars to unlock the Radiant Grandmaster apex challenge.
          </p>
        </div>
      </div>

      {/* Stage Selection In-Place Modal Card */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#131929] border border-[#2c3b58] p-5 shadow-2xl text-left overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 z-20 text-slate-400 hover:text-white p-1 rounded-lg bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 3D Range Preview Thumbnail Header */}
            <div className="relative w-full h-36 rounded-xl bg-gradient-to-b from-[#16233b] to-[#0c121e] border border-[#23324d] overflow-hidden mb-4 flex items-center justify-center">
              <div className="relative flex items-center justify-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center shadow-md">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center shadow-md -translate-y-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center shadow-md translate-y-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                </div>
              </div>
              <span className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-slate-200 border border-[#2a3854]">
                {selectedNode.distance} Range
              </span>
            </div>

            {/* Category & Title */}
            <div className="mb-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-blue-400 uppercase">
                {selectedNode.category}
              </span>
              <h3 className="text-base font-black text-white tracking-wide">
                Chapter 1 - Exercise {selectedNode.exerciseNum}: {selectedNode.title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {selectedNode.targetDesc}
            </p>

            {/* Completion / Status Banner */}
            <div
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 mb-4 shadow-sm border ${
                selectedNode.starsEarned === 3
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : selectedNode.starsEarned > 0
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : selectedNode.status === 'current'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}
            >
              {selectedNode.starsEarned === 3 ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>PERFECT! 3 STARS ACHIEVED</span>
                </>
              ) : selectedNode.starsEarned > 0 ? (
                <>
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>{selectedNode.starsEarned} STARS EARNED (REPLAY FOR 3 STARS)</span>
                </>
              ) : selectedNode.status === 'current' ? (
                <>
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>UNLOCKED - READY TO ATTEMPT</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>LOCKED - COMPLETE EXERCISE {selectedNode.exerciseNum - 1} FIRST</span>
                </>
              )}
            </div>

            {/* Play Button */}
            <button
              onClick={() => handleStartMission(selectedNode)}
              disabled={selectedNode.status === 'locked'}
              className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-sm tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-2 ${
                selectedNode.status === 'locked'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 cursor-pointer'
              }`}
            >
              {selectedNode.status === 'locked' ? (
                <>
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Locked</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Play Drill</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
