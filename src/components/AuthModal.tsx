import React, { useState } from 'react';
import { storageEngine, type UserProfile, type SessionRecord } from '../utils/storageEngine';
import { User, LogIn, Database, X, Check, Star, Shield, Clock, Zap, Target, MessageSquare } from 'lucide-react';
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

  const handleSocialMock = (platform: string) => {
    audioEngine.playClick();
    const updated: UserProfile = {
      ...profile,
      username: `${platform}Aimer`,
      email: `${platform.toLowerCase()}@steadyaim.gg`,
      isLoggedIn: true,
    };
    storageEngine.saveProfile(updated);
    setProfile(updated);
    setUsernameInput(updated.username);
    setEmailInput(updated.email);
    setIsSuccess(true);
    if (onProfileUpdated) onProfileUpdated();
    setTimeout(() => setIsSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* 50/50 Split Modal Dialog matching Benchmark Screenshot 2 */}
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0c101c] border border-[#212d45] shadow-2xl text-left overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Stylized Cyber Bot Hero Artwork matching Screenshot 2 */}
        <div className="relative p-8 bg-gradient-to-br from-[#12192c] via-[#0d1424] to-[#080c18] border-b md:border-b-0 md:border-r border-[#1f2b42] flex flex-col justify-between overflow-hidden">
          {/* Subtle Circuit Blueprint Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: `
                radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.25) 0%, transparent 60%),
                linear-gradient(to right, rgba(59, 130, 246, 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(59, 130, 246, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 32px 32px, 32px 32px',
            }}
          />

          <div className="relative z-10">
            {/* Top Badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-blue-400 uppercase">
                STEADYAIM NETWORK · CLOUD SYNC
              </span>
            </div>

            {/* Stylized Cyber Bot Avatar Badge */}
            <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/20 rotate-6 border border-blue-400/40 shadow-[0_0_30px_rgba(59,130,246,0.3)] animate-pulse" />
              <div className="relative w-24 h-24 rounded-2xl bg-[#0e1424] border-2 border-blue-400 flex flex-col items-center justify-center text-blue-300 shadow-xl">
                <Target className="w-10 h-10 text-blue-400 mb-1" />
                <span className="text-[9px] font-mono font-black text-blue-300 uppercase tracking-wider">
                  CYBER BOT
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-white uppercase tracking-wide text-center mb-2">
              LEVEL UP YOUR AIM
            </h2>
            <p className="text-xs text-slate-300 text-center leading-relaxed max-w-sm mx-auto mb-6">
              Unlock verified rank constellation, global leaderboards, and personalized anti-tremor analytics.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-2.5 max-w-xs mx-auto">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                <span>1:1 Valorant FOV & mouse deceleration</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Hardware anti-jitter telemetry scoring</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Star className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Campaign star progression & rank badges</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-[#1b253b] text-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              100% CLIENT-SIDE & SECURE
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Auth Form & Social Logins matching Screenshot 2 */}
        <div className="p-8 flex flex-col justify-between">
          <div>
            {/* Modal Sub-Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wide">
                  PLAYER AUTHENTICATION
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Sync settings & telemetry records
                </span>
              </div>
            </div>

            {/* Tab switchers: Account vs Sessions */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0e1322] border border-[#1e273d] mb-5">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
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
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'sessions'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>SESSIONS ({sessions.length})</span>
              </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                {/* Social Login Buttons matching Benchmark */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleSocialMock('Discord')}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#5865f2]/20"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Continue with Discord</span>
                  </button>

                  <button
                    onClick={() => handleSocialMock('Google')}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#131929] hover:bg-[#1a2338] text-slate-200 border border-[#232f4a] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4 text-blue-400" />
                    <span>Continue with Google</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-[#1e273d] w-full" />
                  <span className="bg-[#0c101c] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest absolute">
                    OR SYNC CALL-SIGN
                  </span>
                </div>

                <form onSubmit={handleSave} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">
                      Player Call-sign / Username
                    </label>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="e.g. TenZ, Viper_FPS"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-[#0e1322] border border-[#1e273d] text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">
                      Email Address (Cloud Sync)
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="player@steadyaim.gg"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-[#0e1322] border border-[#1e273d] text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {isSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Profile synced and authenticated!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 mt-3"
                  >
                    <Check className="w-4 h-4" />
                    <span>START TRAINING NOW</span>
                  </button>
                </form>
              </div>
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
                      className="p-3 rounded-xl bg-[#0e1322] border border-[#1c2438] flex items-center justify-between text-xs"
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
      </div>
    </div>
  );
};
