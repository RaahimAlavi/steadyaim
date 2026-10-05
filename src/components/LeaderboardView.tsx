import React, { useState } from 'react';
import { storageEngine, type LeaderboardEntry } from '../utils/storageEngine';
import { Trophy, Globe, Search, Award, MessageSquare, Zap, Crosshair, Target, CheckCircle2 } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

type LeaderboardCategory = 'global' | 'flicking' | 'switching' | 'clicking' | 'tracking';

export const LeaderboardView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>('global');
  const [searchQuery, setSearchQuery] = useState('');

  const entries = storageEngine.getLeaderboard(activeCategory);
  const profile = storageEngine.getProfile();

  const filteredEntries = entries.filter((e) =>
    e.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentUserEntry = entries.find((e) => e.isCurrentUser);

  const tierBadgeClass = (tier: LeaderboardEntry['tier']) => {
    switch (tier) {
      case 'Radiant':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Immortal':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'Ascendant':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 select-none space-y-6">
      {/* Top Header with Discipline Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              COMPETITIVE STANDINGS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
            GLOBAL LEADERBOARDS
          </h1>
          <p className="text-xs text-slate-400">
            Hardware verified telemetry standings across official competitive aim disciplines.
          </p>
        </div>

        {/* Category Tabs matching Benchmark Screenshot 8 */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#0c101c] border border-[#1f2b42]">
          <button
            onClick={() => {
              audioEngine.playClick();
              setActiveCategory('global');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'global'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b2c]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-300" />
            <span>GLOBAL RANK</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              setActiveCategory('flicking');
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'flicking'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-purple-300 hover:bg-[#141b2c]'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-purple-400" />
            <span>FLICKING</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              setActiveCategory('switching');
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'switching'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'text-slate-400 hover:text-orange-300 hover:bg-[#141b2c]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <span>SWITCHING</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              setActiveCategory('clicking');
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'clicking'
                ? 'bg-lime-600 text-white shadow-lg shadow-lime-600/30'
                : 'text-slate-400 hover:text-lime-300 hover:bg-[#141b2c]'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-lime-400" />
            <span>CLICKING</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              setActiveCategory('tracking');
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'tracking'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-[#141b2c]'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>TRACKING</span>
          </button>
        </div>
      </div>

      {/* Hero "Join The Leaderboard" Banner matching Benchmark Screenshot 8 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#12192b] via-[#162035] to-[#0e1424] border border-[#233352] p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Trophy className="w-7 h-7 text-blue-300" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-black" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase font-black">
                VERIFIED PROFILE
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                TOP 3.8% NATIONWIDE
              </span>
            </div>
            <h3 className="text-lg font-black text-white uppercase">
              {profile.username || 'TacticalAimer'} · {profile.rankName || 'IMMORTAL FLIGHT'}
            </h3>
            <p className="text-xs text-slate-400">
              Your standings update in real-time as you complete verified campaign & casual drills.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-xl bg-[#0a0f1b] border border-[#1e2a44] text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">YOUR RANK</span>
            <span className="text-base font-mono font-black text-amber-400">
              #{currentUserEntry ? currentUserEntry.rank : 13}
            </span>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-[#0a0f1b] border border-[#1e2a44] text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">BEST SCORE</span>
            <span className="text-base font-mono font-black text-white">
              {currentUserEntry ? currentUserEntry.score.toLocaleString() : '3,450'}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Reset Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search competitor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0c101c] border border-[#1e283d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>COMPETITIVE RESET: <strong className="text-white">18H 42M</strong></span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            ESPORTS TELEMETRY ONLINE
          </span>
        </div>
      </div>

      {/* Standings Table with Shiny Top-3 Medals */}
      <div className="w-full rounded-2xl bg-[#0c101c] border border-[#1e283d] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101626] border-b border-[#1e283d] text-slate-400 font-mono uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Division</th>
                <th className="py-3 px-4 text-right">High Score</th>
                <th className="py-3 px-4 text-right">Accuracy</th>
                <th className="py-3 px-4 text-right">Campaign Stars</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172033]">
              {filteredEntries.map((player) => (
                <tr
                  key={player.username}
                  className={`transition-colors ${
                    player.isCurrentUser
                      ? 'bg-blue-950/40 border-l-4 border-l-blue-500'
                      : 'hover:bg-[#121828]'
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black shadow-md ${
                        player.rank === 1
                          ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-black shadow-amber-500/30 ring-1 ring-amber-300'
                          : player.rank === 2
                          ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-black shadow-slate-400/30 ring-1 ring-slate-200'
                          : player.rank === 3
                          ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-amber-700/30 ring-1 ring-amber-600'
                          : 'bg-[#141b2c] text-slate-400'
                      }`}
                    >
                      #{player.rank}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161d2d] text-slate-400 border border-[#232d44]">
                      {player.country}
                    </span>
                    <span className={player.isCurrentUser ? 'text-blue-300 font-extrabold' : ''}>
                      {player.username}
                    </span>
                    {player.isCurrentUser && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        YOU
                      </span>
                    )}
                    {player.isPreset && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#131926] text-slate-400 border border-[#222c42]">
                        PRO
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${tierBadgeClass(
                        player.tier
                      )}`}
                    >
                      {player.tier}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                    {player.score.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">
                    {player.accuracy.toFixed(1)}%
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-amber-400 font-bold">
                    ★ {player.stars}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discord Community Widget Footer matching Benchmark Screenshot 8 */}
      <div className="rounded-2xl bg-[#111728] border border-[#212d45] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5865f2] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#5865f2]/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">Join the SteadyAim Competitive Discord</h4>
            <p className="text-xs text-slate-400">Share your clip telemetry, challenge top aimers, and unlock custom crosshair packs.</p>
          </div>
        </div>

        <a
          href="https://discord.gg"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            window.open('https://discord.gg', '_blank');
          }}
          className="py-2 px-5 rounded-xl bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-[#5865f2]/25 shrink-0"
        >
          <span>Join Discord Community</span>
        </a>
      </div>
    </div>
  );
};
