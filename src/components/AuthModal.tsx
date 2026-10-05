import React, { useState } from 'react';
import { storageEngine, type UserProfile, type SessionRecord } from '../utils/storageEngine';
import { User, LogIn, Database, X, Check, Star, Shield, Clock } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<UserProfile>(() => storageEngine.getProfile());
  const [sessions, setSessions] = useState<SessionRecord[]>(() => storageEngine.getSessions());
  const [activeTab, setActiveTab] = useState<'profile' | 'sessions'>('profile');

  const [usernameInput, setUsernameInput] = useState(profile.username);
  const [emailInput, setEmailInput] = useState(profile.email);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    audioEngine.playClick();
    const updated: UserProfile = {
      ...profile,
      username: usernameInput.trim() || 'TacticalPlayer',
      email: emailInput.trim() || 'player@steadyaim.gg',
      isLoggedIn: true,
    };
    storageEngine.saveProfile(updated);
    setProfile(updated);
    setIsSuccess(true);
    if (onProfileUpdated) onProfileUpdated();
    setTimeout(() => setIsSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0c101c] border border-[#212b40] p-6 shadow-2xl text-left overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-wide">
              PLAYER PROFILE & CLOUD DATABASE
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              LOCAL STORAGE PERSISTENCE ACTIVE
            </span>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#101524] border border-[#1e273d] mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-[#1b2338] text-white border border-[#2d3a58]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>ACCOUNT & SYNC</span>
          </button>

          <button
            onClick={() => {
              setSessions(storageEngine.getSessions());
              setActiveTab('sessions');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'sessions'
                ? 'bg-[#1b2338] text-white border border-[#2d3a58]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>SESSION DATABASE ({sessions.length})</span>
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#101422] border border-[#1d263b]">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-0.5">
                  CURRENT LEAGUE
                </span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  {profile.rankName} (Rank #{profile.leagueRank})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#101422] border border-[#1d263b]">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-0.5">
                  TOTAL STARS
                </span>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {profile.totalStars} Stars Earned
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                Player Call-sign / Username
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="e.g. TenZ, Viper_FPS"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101422] border border-[#20293f] text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                Email Address (Local Cloud Backup)
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="player@steadyaim.gg"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101422] border border-[#20293f] text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {isSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Profile successfully synced and authenticated!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md mt-2"
            >
              <Check className="w-4 h-4" />
              <span>SAVE & SYNC PROGRESS</span>
            </button>
          </form>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 mb-2">
              Every training session is logged with raw micro-jitter scores and star ratings.
            </p>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3 rounded-xl bg-[#101422] border border-[#1c2438] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{sess.drillName}</span>
                      <span className="text-amber-400 font-mono text-[11px]">
                        {'★'.repeat(sess.starsEarned)}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(sess.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>·</span>
                      <span>Reaction: {sess.avgReactionMs}ms</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-white text-sm">
                      {sess.score.toLocaleString()} pts
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400">
                      {sess.accuracy}% Acc · {sess.jitterVariancePx}px Jitter
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
