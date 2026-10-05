import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    targetDesc: 'Destroy 3 concurrent glowing sphere targets on the stadium wall within 30 seconds.',
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
    targetDesc: 'The ultimate tactical FPS test: combined 180 degree snaps, 15m head targets, and 120ms reaction window.',
    distance: '15.0m',
  },
];

interface PathToRadiantProps {
  onLaunchDrill: (drillType: 'whisper' | 'stopping' | 'tile-frenzy') => void;
  currentEdpi: number;
}

export const PathToRadiant: React.FC<PathToRadiantProps> = ({
  onLaunchDrill,
  currentEdpi,
}) => {
  const [nodes, setNodes] = useState<CampaignNode[]>(BASE_NODES);
  const [selectedNode, setSelectedNode] = useState<CampaignNode | null>(null);

  // Sync stars from storage
  useEffect(() => {
    setNodes(
      BASE_NODES.map((n) => ({
        ...n,
        starsEarned: storageEngine.getNodeStars(n.id),
        status:
          storageEngine.getNodeStars(n.id) > 0
            ? 'completed'
            : n.id === 4
            ? 'current'
            : n.id < 4
            ? 'completed'
            : 'locked',
      }))
    );
  }, []);

  const totalStarsEarned = nodes.reduce((acc, n) => acc + n.starsEarned, 0);
  const maxPossibleStars = nodes.length * 3;

  const handleNodeClick = (node: CampaignNode) => {
    audioEngine.playClick();
    setSelectedNode(node);
  };

  const handleStartMission = (node: CampaignNode) => {
    audioEngine.playClick();
    setSelectedNode(null);

    // Request fullscreen automatically as requested by user
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    onLaunchDrill(node.drillType);
  };

  return (
    <div className="relative min-h-[92dvh] bg-[#090c14] text-slate-100 flex flex-col lg:flex-row overflow-hidden border-b border-[#1b2130] select-none">
      {/* Background Subtle Grid Pattern (Matte, non-shiny) */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Center Main Stage Progression Winding Path */}
      <div className="flex-1 flex flex-col overflow-y-auto px-4 md:px-8 py-6 relative z-10">
        {/* Top Chapter Header Banner matching 3D Aim Trainer benchmark */}
        <div className="w-full max-w-4xl mx-auto mb-8 rounded-2xl bg-[#0f1422] border border-[#1e263d] p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Crosshair className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold tracking-widest text-blue-400 uppercase">
                  CHAPTER 1
                </span>
                <Info className="w-3.5 h-3.5 text-slate-500 cursor-pointer" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Foundations of Accuracy
              </h2>
            </div>
          </div>

          {/* Stars Progress in Chapter */}
          <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1.5 min-w-[180px]">
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-mono font-bold text-slate-300">
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {totalStarsEarned} / {maxPossibleStars}
              </span>
              <span className="text-slate-500">
                ({Math.round((totalStarsEarned / maxPossibleStars) * 100)}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#080b12] border border-[#1c2438] overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500 rounded-full"
                style={{ width: `${(totalStarsEarned / maxPossibleStars) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Winding Hexagonal Pedestal Nodes Tree */}
        <div className="relative w-full max-w-2xl mx-auto py-6 flex flex-col items-center">
          {/* Laser Conduit Connection SVG Line */}
          <svg
            className="absolute top-10 left-0 w-full h-[640px] pointer-events-none z-0"
            viewBox="0 0 400 640"
            fill="none"
          >
            <path
              d="M 200 40 C 260 110, 140 170, 200 240 C 260 310, 140 370, 200 440 C 260 510, 140 570, 200 620"
              stroke="#182033"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 200 40 C 260 110, 140 170, 200 240 C 260 310, 140 370, 200 440"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="6 6"
            />
          </svg>

          {/* Render Hex Nodes */}
          <div className="flex flex-col items-center gap-14 relative z-10 w-full">
            {nodes.map((node, index) => {
              const xOffset = index % 2 === 0 ? '-translate-x-6' : 'translate-x-6';
              const isCompleted = node.status === 'completed';
              const isCurrent = node.status === 'current';

              return (
                <div
                  key={node.id}
                  className={`flex flex-col items-center transition-all ${xOffset}`}
                >
                  {/* Floating Stars */}
                  <div className="flex items-center gap-1.5 mb-2 h-7">
                    {[1, 2, 3].map((starIdx) => {
                      const hasStar = isCompleted && starIdx <= node.starsEarned;
                      return (
                        <Star
                          key={starIdx}
                          className={`w-5 h-5 transition-transform ${
                            hasStar
                              ? 'fill-amber-400 text-amber-400 scale-105'
                              : 'fill-transparent text-[#222a3d]'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* 3D Hexagonal Pedestal Node (Matte Esports Metal) */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={() => audioEngine.playHover()}
                    className={`relative w-24 h-24 flex items-center justify-center cursor-pointer transition-all ${
                      isCompleted
                        ? 'text-slate-100'
                        : isCurrent
                        ? 'text-white'
                        : 'text-slate-600 opacity-60'
                    }`}
                  >
                    {/* Metallic Hex Pedestal Background */}
                    <div
                      className={`absolute inset-0 rounded-[22px] border-2 transition-all rotate-45 ${
                        isCompleted
                          ? 'bg-[#141b2a] border-blue-500/80 shadow-md'
                          : isCurrent
                          ? 'bg-[#1a1714] border-amber-500 shadow-md animate-pulse'
                          : 'bg-[#0e121d] border-[#1d2538]'
                      }`}
                    />

                    {/* Node Center Insignia */}
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      {isCompleted ? (
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400">
                          <Target className="w-5 h-5" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
                          <Skull className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#141824] flex items-center justify-center text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </motion.button>

                  {/* Stage Label Below Pedestal */}
                  <div className="mt-3 text-center">
                    <span
                      className={`text-xs font-black uppercase tracking-wider block ${
                        isCurrent
                          ? 'text-amber-400'
                          : isCompleted
                          ? 'text-slate-200'
                          : 'text-slate-500'
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
      <div className="w-full lg:w-80 p-6 bg-[#0a0d16] border-t lg:border-t-0 lg:border-l border-[#1a2133] flex flex-col gap-6 relative z-10">
        {/* Profile Status Card */}
        <div className="p-5 rounded-2xl bg-[#0f1424] border border-[#1e273d] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase">Profile Synced</h4>
              <span className="text-[10px] font-mono text-slate-400">LOCAL CLOUD ACTIVE</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Your telemetry and micro-jitter records are continuously saved for live progress analysis.
          </p>
          <div className="text-[11px] font-mono text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 flex items-center justify-between">
            <span>ACTIVE SENS</span>
            <span className="font-bold">{currentEdpi.toFixed(1)} eDPI</span>
          </div>
        </div>

        {/* My Overall Progress Card */}
        <div className="p-5 rounded-2xl bg-[#0f1424] border border-[#1e273d] shadow-sm">
          <h4 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-4">
            MY OVERALL PROGRESS
          </h4>

          {/* Stars Metric */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                Stars
              </span>
              <span className="font-mono text-slate-300 font-bold">
                {totalStarsEarned} / 315 <span className="text-slate-500 font-normal">({Math.round((totalStarsEarned / 315) * 100)}%)</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#080b12] border border-[#192236] overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${(totalStarsEarned / 315) * 100}%` }}
              />
            </div>
          </div>

          {/* Chapters Metric */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                <Shield className="w-4 h-4 text-blue-400" />
                Chapters
              </span>
              <span className="font-mono text-slate-300 font-bold">
                2 / 15 <span className="text-slate-500 font-normal">(13%)</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#080b12] border border-[#192236] overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '13%' }} />
            </div>
          </div>
        </div>

        {/* League Standings Card */}
        <div className="p-5 rounded-2xl bg-[#0f1424] border border-[#1e273d] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
              LEAGUE DIVISION
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              PROMOTION ZONE
            </span>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-[#172033] border-2 border-blue-500/40 flex items-center justify-center text-blue-400 shadow-sm">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="text-lg font-black text-white tracking-tight">
                Rank <span className="text-blue-400">#13</span>
              </div>
              <span className="text-xs text-slate-400">Immortal Flight</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-2">
            Hold your rank to get promoted to the Radiant Grandmaster bracket on round reset!
          </p>
        </div>
      </div>

      {/* Stage Selection In-Place Card matching Screenshot 1 */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-sm rounded-2xl bg-[#141a27] border border-[#26334d] p-5 shadow-2xl text-left overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 z-20 text-slate-400 hover:text-white p-1 rounded-lg bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* 3D Range Preview Thumbnail Header */}
              <div className="relative w-full h-36 rounded-xl bg-[#090d16] border border-[#1e283d] overflow-hidden mb-4 flex items-center justify-center">
                {/* Visual Simulation of the 3D Shooting Tunnel */}
                <div className="absolute inset-0 bg-radial-[circle_at_center,_#162035_0%,_#090d16_80%]" />
                {/* Simulated Blue Sphere Targets matching Screenshot 2 */}
                <div className="relative flex items-center justify-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center shadow-md">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center shadow-md -translate-y-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center shadow-md translate-y-3">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                  </div>
                </div>
                {/* Distance Badge */}
                <span className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-slate-300 border border-[#222e47]">
                  {selectedNode.distance} Range
                </span>
              </div>

              {/* Category & Title matching Screenshot 1 */}
              <div className="mb-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                  {selectedNode.category}
                </span>
                <h3 className="text-base font-black text-white tracking-wide">
                  Chapter 1 - Exercise {selectedNode.exerciseNum}
                </h3>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {selectedNode.targetDesc}
              </p>

              {/* Completion Banner matching Screenshot 1 */}
              <div className="w-full py-2 px-3 rounded-lg bg-[#303f9f] text-white text-xs font-bold flex items-center justify-center gap-2 mb-4 shadow-sm">
                <Check className="w-4 h-4 text-emerald-300" />
                <span>
                  {selectedNode.starsEarned === 3
                    ? 'PERFECT! (3 STARS)'
                    : selectedNode.starsEarned > 0
                    ? `${selectedNode.starsEarned} STARS EARNED`
                    : 'UNLOCKED - READY TO ATTEMPT'}
                </span>
              </div>

              {/* Play Button matching Screenshot 1 */}
              <button
                onClick={() => handleStartMission(selectedNode)}
                className="w-full py-3.5 px-6 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white font-extrabold text-sm tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Play</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
