import React, { useState } from 'react';
import { storageEngine, type LeaderboardEntry } from '../utils/storageEngine';
import { Trophy, Globe, Calendar, Search, Award } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export const LeaderboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'daily' | 'league'>('global');
  const [searchQuery, setSearchQuery] = useState('');

  const entries = storageEngine.getLeaderboard(activeTab);

  const filteredEntries = entries.filter((e) =>
    e.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="w-full max-w-6xl mx-auto py-6 px-4 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              COMPETITIVE ARENA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
            LEADERBOARDS & RANKINGS
          </h1>
          <p className="text-xs text-slate-400">
            Real competitive standings verified with hardware anti-jitter telemetry.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0e121d] border border-[#212738]">
          <button
            onClick={() => {
              audioEngine.playClick();
              setActiveTab('global');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'global'
                ? 'bg-[#1b2336] text-white border border-[#2f3b58]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>GLOBAL RANK</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              setActiveTab('daily');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-[#1b2336] text-white border border-[#2f3b58]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>DAILY CHALLENGE</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              setActiveTab('league');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'league'
                ? 'bg-[#1b2336] text-white border border-[#2f3b58]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>LEAGUE FLIGHT</span>
          </button>
        </div>
      </div>

      {/* Search & Telemetry Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search player name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0e121d] border border-[#212738] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>RANKING RESET: <strong className="text-white">18H 42M</strong></span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            LIVE SERVERS
          </span>
        </div>
      </div>

      {/* Leaderboard Table (Matte, High-Contrast, Clean) */}
      <div className="w-full rounded-2xl bg-[#0c0f18] border border-[#1b2233] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101420] border-b border-[#1b2233] text-slate-400 font-mono uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Division</th>
                <th className="py-3 px-4 text-right">High Score</th>
                <th className="py-3 px-4 text-right">Accuracy</th>
                <th className="py-3 px-4 text-right">Campaign Stars</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171e2e]">
              {filteredEntries.map((player) => (
                <tr
                  key={player.username}
                  className={`transition-colors ${
                    player.isCurrentUser
                      ? 'bg-blue-950/30 border-l-4 border-l-blue-500'
                      : 'hover:bg-[#111624]'
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs ${
                        player.rank === 1
                          ? 'bg-amber-500/20 text-amber-300 font-black'
                          : player.rank === 2
                          ? 'bg-slate-300/20 text-slate-200 font-black'
                          : player.rank === 3
                          ? 'bg-amber-700/20 text-amber-400 font-black'
                          : 'text-slate-400'
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
                        BENCHMARK
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
    </div>
  );
};
