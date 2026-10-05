import React, { useState } from 'react';
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
} from 'lucide-react';
import SpotlightCard from './reactbits/SpotlightCard';
import { audioEngine } from '../utils/audioEngine';

export interface CampaignNode {
  id: number;
  title: string;
  subtitle: string;
  starsEarned: number; // 0 to 3
  status: 'completed' | 'current' | 'locked';
  drillType: 'whisper' | 'stopping' | 'tile-frenzy';
  targetDesc: string;
  distance: string;
  oneStarScore: number;
  twoStarScore: number;
  threeStarScore: number;
}

const CAMPAIGN_NODES: CampaignNode[] = [
  {
    id: 1,
    title: 'Micro Flick 5m',
    subtitle: 'Head-Level Precision',
    starsEarned: 3,
    status: 'completed',
    drillType: 'whisper',
    targetDesc: 'Eliminate 15 bots at 5m head-height. Maintain zero jitter during micro-corrections.',
    distance: '5.0m',
    oneStarScore: 1200,
    twoStarScore: 2200,
    threeStarScore: 3000,
  },
  {
    id: 2,
    title: 'Stopping Power 10m',
    subtitle: 'Zero Overshoot Deceleration',
    starsEarned: 3,
    status: 'completed',
    drillType: 'stopping',
    targetDesc: 'Rapid 10m snap flicks. Halt mouse inertia instantly on target with zero micro-bounce.',
    distance: '10.0m',
    oneStarScore: 1500,
    twoStarScore: 2500,
    threeStarScore: 3400,
  },
  {
    id: 3,
    title: 'Tile Frenzy (30s Speed Gate)',
    subtitle: 'Target Acquisition Tempo',
    starsEarned: 2,
    status: 'completed',
    drillType: 'tile-frenzy',
    targetDesc: 'Destroy 3 concurrent glowing neon tiles on the stadium wall within 30 seconds.',
    distance: '15.0m',
    oneStarScore: 2000,
    twoStarScore: 3200,
    threeStarScore: 4200,
  },
  {
    id: 4,
    title: 'Jitter Stabilization Protocol',
    subtitle: 'High-Stress Micro Adjustments',
    starsEarned: 0,
    status: 'current',
    drillType: 'whisper',
    targetDesc: 'Combat muscle fatigue. Keep mouse sensor trajectory under 1.5px variance while tracking.',
    distance: '12.0m',
    oneStarScore: 1800,
    twoStarScore: 2800,
    threeStarScore: 3800,
  },
  {
    id: 5,
    title: 'Radiant Flick Apex',
    subtitle: 'Immortal Benchmark Evaluation',
    starsEarned: 0,
    status: 'locked',
    drillType: 'stopping',
    targetDesc: 'The ultimate tactical FPS test: combined 180 degree snaps, 15m head targets, and 120ms reaction window.',
    distance: '15.0m',
    oneStarScore: 2500,
    twoStarScore: 3800,
    threeStarScore: 5000,
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
  const [selectedNode, setSelectedNode] = useState<CampaignNode | null>(null);

  const totalStarsEarned = CAMPAIGN_NODES.reduce((acc, n) => acc + n.starsEarned, 0);
  const maxPossibleStars = CAMPAIGN_NODES.length * 3;

  const handleNodeClick = (node: CampaignNode) => {
    audioEngine.playClick();
    setSelectedNode(node);
  };

  return (
    <div className="relative min-h-[92dvh] bg-[#07090e] text-slate-100 flex flex-col lg:flex-row overflow-hidden border-b border-[#1b202e]">
      {/* Background Hexagonal Grid Mesh */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #00f5d4 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Center Main Stage Progression Winding Path */}
      <div className="flex-1 flex flex-col overflow-y-auto px-4 md:px-8 py-6 relative z-10">
        {/* Top Chapter Header Banner matching 3D Aim Trainer reference */}
        <div className="w-full max-w-4xl mx-auto mb-8 rounded-2xl bg-gradient-to-r from-[#111728] via-[#161f36] to-[#0f1422] border border-[#212c47] p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#ff4655]/15 border border-[#ff4655]/40 flex items-center justify-center text-[#ff4655] shadow-inner">
              <Crosshair className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold tracking-widest text-[#00f5d4] uppercase">
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
          <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1.5 min-w-[180px]">
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-mono font-bold text-slate-300">
              <span className="flex items-center gap-1 text-[#ffb703]">
                <Star className="w-4 h-4 fill-[#ffb703]" />
                {totalStarsEarned} / {maxPossibleStars}
              </span>
              <span className="text-slate-500">
                ({Math.round((totalStarsEarned / maxPossibleStars) * 100)}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#0a0d15] border border-[#1e273d] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ffb703] to-[#00f5d4] transition-all duration-500 rounded-full"
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
              stroke="#1b253b"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 200 40 C 260 110, 140 170, 200 240 C 260 310, 140 370, 200 440"
              stroke="#00f5d4"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="8 8"
              className="animate-pulse"
            />
          </svg>

          {/* Render Hex Nodes */}
          <div className="flex flex-col items-center gap-14 relative z-10 w-full">
            {CAMPAIGN_NODES.map((node, index) => {
              // Calculate slight horizontal wave offset to match 3D Aim Trainer's winding path
              const xOffset = index % 2 === 0 ? '-translate-x-6' : 'translate-x-6';
              const isCompleted = node.status === 'completed';
              const isCurrent = node.status === 'current';

              return (
                <div
                  key={node.id}
                  className={`flex flex-col items-center transition-all ${xOffset}`}
                >
                  {/* Floating Stars for completed / active nodes */}
                  <div className="flex items-center gap-1.5 mb-2 h-7">
                    {[1, 2, 3].map((starIdx) => {
                      const hasStar = isCompleted && starIdx <= node.starsEarned;
                      return (
                        <Star
                          key={starIdx}
                          className={`w-5 h-5 transition-transform ${
                            hasStar
                              ? 'fill-[#ffb703] text-[#ffb703] drop-shadow-[0_0_8px_rgba(255,183,3,0.8)] scale-110'
                              : 'fill-transparent text-[#2b354d]'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* 3D Hexagonal Pedestal Node */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
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
                      className={`absolute inset-0 rounded-[24px] border-2 transition-all rotate-45 ${
                        isCompleted
                          ? 'bg-gradient-to-br from-[#243352] to-[#121929] border-[#00f5d4] shadow-[0_0_24px_rgba(0,245,212,0.35)]'
                          : isCurrent
                          ? 'bg-gradient-to-br from-[#854d0e] to-[#2c1d07] border-[#ffb703] shadow-[0_0_30px_rgba(255,183,3,0.6)] animate-pulse'
                          : 'bg-[#101420] border-[#1f283d]'
                      }`}
                    />

                    {/* Node Center Insignia */}
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      {isCompleted ? (
                        <div className="w-10 h-10 rounded-full bg-[#00f5d4]/20 border border-[#00f5d4]/60 flex items-center justify-center text-[#00f5d4]">
                          <Target className="w-5 h-5" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-10 h-10 rounded-full bg-[#ffb703]/25 border border-[#ffb703] flex items-center justify-center text-[#ffb703]">
                          <Skull className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#182033] flex items-center justify-center text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Radar Pulse Ring for Current Active Stage */}
                    {isCurrent && (
                      <span className="absolute inset-0 rounded-[28px] border-2 border-[#00f5d4] animate-ping pointer-events-none opacity-40 rotate-45" />
                    )}
                  </motion.button>

                  {/* Stage Label Below Pedestal */}
                  <div className="mt-3 text-center">
                    <span
                      className={`text-xs font-black uppercase tracking-wider block ${
                        isCurrent
                          ? 'text-[#ffb703]'
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
      <div className="w-full lg:w-80 p-6 bg-[#090c14] border-t lg:border-t-0 lg:border-l border-[#1a2133] flex flex-col gap-6 relative z-10">
        {/* Save Progress Card */}
        <SpotlightCard
          spotlightColor="rgba(0, 245, 212, 0.15)"
          className="p-5 rounded-2xl bg-[#0f1424] border border-[#212d48]"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-[#00f5d4]/15 border border-[#00f5d4]/30 flex items-center justify-center text-[#00f5d4]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase">Profile Synced</h4>
              <span className="text-[10px] font-mono text-slate-400">LOCAL CLOUD ACTIVE</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            Your telemetry and micro-jitter records are continuously saved for live progress analysis.
          </p>
          <div className="text-[11px] font-mono text-[#00f5d4] bg-[#00f5d4]/10 px-3 py-1.5 rounded-lg border border-[#00f5d4]/20 flex items-center justify-between">
            <span>ACTIVE SENS</span>
            <span className="font-bold">{currentEdpi.toFixed(1)} eDPI</span>
          </div>
        </SpotlightCard>

        {/* My Overall Progress Card */}
        <div className="p-5 rounded-2xl bg-[#0f1424] border border-[#1d263b] shadow-md">
          <h4 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-4">
            MY OVERALL PROGRESS
          </h4>

          {/* Stars Metric */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                <Star className="w-4 h-4 fill-[#ffb703] text-[#ffb703]" />
                Stars
              </span>
              <span className="font-mono text-slate-300 font-bold">
                {totalStarsEarned} / 315 <span className="text-slate-500 font-normal">(3%)</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#080b12] border border-[#192236] overflow-hidden">
              <div
                className="h-full bg-[#ffb703] rounded-full"
                style={{ width: `${(totalStarsEarned / 315) * 100}%` }}
              />
            </div>
          </div>

          {/* Chapters Metric */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                <Shield className="w-4 h-4 text-[#00f5d4]" />
                Chapters
              </span>
              <span className="font-mono text-slate-300 font-bold">
                2 / 15 <span className="text-slate-500 font-normal">(13%)</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#080b12] border border-[#192236] overflow-hidden">
              <div className="h-full bg-[#00f5d4] rounded-full" style={{ width: '13%' }} />
            </div>
          </div>
        </div>

        {/* League Standings Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#141b2f] to-[#0c101c] border border-[#232f4b] shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold tracking-widest text-[#ffb703] uppercase">
              LEAGUE DIVISION
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              PROMOTION ZONE
            </span>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] border-2 border-[#60a5fa] flex items-center justify-center text-white shadow-[0_0_16px_rgba(59,130,246,0.4)]">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="text-lg font-black text-white tracking-tight">
                Rank <span className="text-[#00f5d4]">#16</span>
              </div>
              <span className="text-xs text-slate-400">Immortal Flight</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-2">
            Hold your rank to get promoted to the Radiant Grandmaster bracket on round reset!
          </p>
        </div>
      </div>

      {/* Stage Mission Briefing Modal */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#0c101c] border-2 border-[#222e49] p-6 shadow-2xl text-left overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded bg-[#00f5d4]/15 border border-[#00f5d4]/40 text-[#00f5d4] text-[10px] font-mono font-bold uppercase tracking-wider">
                  MISSION #{selectedNode.id}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Target Range: {selectedNode.distance}
                </span>
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight mb-1">
                {selectedNode.title}
              </h3>
              <p className="text-xs text-[#00f5d4] font-mono uppercase tracking-wider mb-4">
                {selectedNode.subtitle}
              </p>

              <div className="p-4 rounded-xl bg-[#121829] border border-[#1f2940] mb-5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedNode.targetDesc}
                </p>
              </div>

              {/* Star Score Targets */}
              <div className="mb-6">
                <h5 className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase mb-2">
                  STAR THRESHOLDS
                </h5>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#080b12] border border-[#1b2338] text-center">
                    <div className="flex justify-center mb-1">
                      <Star className="w-4 h-4 fill-[#ffb703] text-[#ffb703]" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-200 block">
                      {selectedNode.oneStarScore.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase">Qualifying</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#080b12] border border-[#1b2338] text-center">
                    <div className="flex justify-center gap-0.5 mb-1">
                      <Star className="w-4 h-4 fill-[#ffb703] text-[#ffb703]" />
                      <Star className="w-4 h-4 fill-[#ffb703] text-[#ffb703]" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-200 block">
                      {selectedNode.twoStarScore.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase">Proficient</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#080b12] border border-[#1b2338] text-center">
                    <div className="flex justify-center gap-0.5 mb-1">
                      <Star className="w-4 h-4 fill-[#ffb703] text-[#ffb703]" />
                      <Star className="w-4 h-4 fill-[#ffb703] text-[#ffb703]" />
                      <Star className="w-4 h-4 fill-[#ffb703] text-[#ffb703]" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#00f5d4] block">
                      {selectedNode.threeStarScore.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-[#00f5d4] uppercase">Radiant</span>
                  </div>
                </div>
              </div>

              {/* Launch Mission CTA */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    audioEngine.playClick();
                    setSelectedNode(null);
                    onLaunchDrill(selectedNode.drillType);
                  }}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#ff4655] to-[#e03140] hover:from-[#e03140] hover:to-[#ff4655] text-white font-black text-sm tracking-widest uppercase shadow-[0_0_24px_rgba(255,70,85,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START STAGE MISSION</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
