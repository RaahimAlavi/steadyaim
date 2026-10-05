export interface SessionRecord {
  id: string;
  drillType: string;
  drillName: string;
  score: number;
  starsEarned: number;
  accuracy: number;
  avgReactionMs: number;
  jitterVariancePx: number;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  isLoggedIn: boolean;
  rankName: string;
  globalRank: number;
  leagueRank: number;
  totalStars: number;
  chaptersCompleted: number;
  sessionsCount: number;
  avatarSeed: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  country: string;
  tier: 'Radiant' | 'Immortal' | 'Ascendant' | 'Diamond';
  score: number;
  accuracy: number;
  stars: number;
  isCurrentUser?: boolean;
  isPreset?: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest_user_1',
  username: 'AimMaster',
  email: 'player@steadyaim.gg',
  isLoggedIn: false,
  rankName: 'Immortal Flight',
  globalRank: 13,
  leagueRank: 13,
  totalStars: 8,
  chaptersCompleted: 1,
  sessionsCount: 3,
  avatarSeed: 'viper',
};

const DEFAULT_SESSIONS: SessionRecord[] = [
  {
    id: 'sess_1',
    drillType: 'whisper',
    drillName: 'Micro Flick 5m',
    score: 3120,
    starsEarned: 3,
    accuracy: 94.2,
    avgReactionMs: 148,
    jitterVariancePx: 0.8,
    timestamp: Date.now() - 3600000 * 2,
  },
  {
    id: 'sess_2',
    drillType: 'stopping',
    drillName: 'Stopping Power 10m',
    score: 3450,
    starsEarned: 3,
    accuracy: 91.8,
    avgReactionMs: 162,
    jitterVariancePx: 1.1,
    timestamp: Date.now() - 3600000 * 5,
  },
  {
    id: 'sess_3',
    drillType: 'tile-frenzy',
    drillName: 'Tile Frenzy 30s',
    score: 3200,
    starsEarned: 2,
    accuracy: 88.5,
    avgReactionMs: 185,
    jitterVariancePx: 1.4,
    timestamp: Date.now() - 3600000 * 12,
  },
];

const PRESET_PLAYERS: Omit<LeaderboardEntry, 'rank'>[] = [
  { username: 'TenZ_Official', country: 'CA', tier: 'Radiant', score: 6420, accuracy: 98.8, stars: 15, isPreset: true },
  { username: 'Chronicle_Aim', country: 'EU', tier: 'Radiant', score: 6280, accuracy: 98.1, stars: 15, isPreset: true },
  { username: 'Demon1_FPS', country: 'US', tier: 'Radiant', score: 6150, accuracy: 97.6, stars: 15, isPreset: true },
  { username: 'Aspas_Duelist', country: 'BR', tier: 'Radiant', score: 5980, accuracy: 96.9, stars: 14, isPreset: true },
  { username: 'Derke_Entry', country: 'FI', tier: 'Radiant', score: 5890, accuracy: 96.4, stars: 14, isPreset: true },
  { username: 'Something_PRX', country: 'JP', tier: 'Immortal', score: 5740, accuracy: 95.8, stars: 13, isPreset: true },
  { username: 'Cryocells_100T', country: 'US', tier: 'Immortal', score: 5610, accuracy: 95.2, stars: 13, isPreset: true },
  { username: 'Boaster_IGL', country: 'UK', tier: 'Immortal', score: 5490, accuracy: 94.7, stars: 12, isPreset: true },
  { username: 'Kangkang_EDG', country: 'CN', tier: 'Immortal', score: 5380, accuracy: 94.3, stars: 12, isPreset: true },
  { username: 'ScreaM_Edshot', country: 'BE', tier: 'Immortal', score: 5250, accuracy: 93.9, stars: 11, isPreset: true },
  { username: 'Shroud_Sub', country: 'US', tier: 'Immortal', score: 5120, accuracy: 93.4, stars: 11, isPreset: true },
  { username: 'cNed_OP', country: 'TR', tier: 'Immortal', score: 4980, accuracy: 92.8, stars: 10, isPreset: true },
  { username: 'FNS_Mastermind', country: 'US', tier: 'Ascendant', score: 4720, accuracy: 91.5, stars: 9, isPreset: true },
  { username: 'Zellsis_Vibe', country: 'US', tier: 'Ascendant', score: 4610, accuracy: 90.9, stars: 9, isPreset: true },
];

class StorageEngine {
  private profileKey = 'steadyaim_profile';
  private sessionsKey = 'steadyaim_sessions';
  private nodeStarsKey = 'steadyaim_node_stars';

  public getProfile(): UserProfile {
    try {
      const saved = localStorage.getItem(this.profileKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const sessions = this.getSessions();
        const totalStars = this.getTotalStars();
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          sessionsCount: sessions.length,
          totalStars,
        };
      }
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  }

  public saveProfile(profile: UserProfile) {
    localStorage.setItem(this.profileKey, JSON.stringify(profile));
  }

  public getSessions(): SessionRecord[] {
    try {
      const saved = localStorage.getItem(this.sessionsKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_SESSIONS;
  }

  public recordSession(session: Omit<SessionRecord, 'id' | 'timestamp'>): SessionRecord {
    const sessions = this.getSessions();
    const newSession: SessionRecord = {
      ...session,
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    sessions.unshift(newSession);
    localStorage.setItem(this.sessionsKey, JSON.stringify(sessions));

    // Update profile session count
    const profile = this.getProfile();
    profile.sessionsCount = sessions.length;
    this.saveProfile(profile);

    return newSession;
  }

  public getTotalStars(): number {
    try {
      const map = JSON.parse(localStorage.getItem(this.nodeStarsKey) || '{}');
      return [1, 2, 3, 4, 5].reduce((sum, id) => sum + (typeof map[id] === 'number' ? map[id] : id <= 3 ? [3, 3, 2][id - 1] : 0), 0);
    } catch {
      return 8;
    }
  }

  public getNodeStars(nodeId: number): number {
    try {
      const map = JSON.parse(localStorage.getItem(this.nodeStarsKey) || '{}');
      if (typeof map[nodeId] === 'number') return map[nodeId];
    } catch {
      // fallback
    }
    // Realistic initial defaults for nodes 1-3
    if (nodeId === 1) return 3;
    if (nodeId === 2) return 3;
    if (nodeId === 3) return 2;
    return 0;
  }

  public saveNodeStars(nodeId: number, stars: number) {
    try {
      const map = JSON.parse(localStorage.getItem(this.nodeStarsKey) || '{}');
      if (stars > (map[nodeId] || 0)) {
        map[nodeId] = stars;
        localStorage.setItem(this.nodeStarsKey, JSON.stringify(map));

        const profile = this.getProfile();
        profile.totalStars = this.getTotalStars();
        this.saveProfile(profile);
      }
    } catch {
      // fallback
    }
  }

  public getLeaderboard(type: 'global' | 'daily' | 'league'): LeaderboardEntry[] {
    const sessions = this.getSessions();
    const profile = this.getProfile();
    const totalStars = this.getTotalStars();

    const bestScore = sessions.length > 0 ? Math.max(...sessions.map((s) => s.score)) : 3450;
    const avgAccuracy = sessions.length > 0
      ? Number((sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length).toFixed(1))
      : 92.4;

    const userTier: LeaderboardEntry['tier'] =
      bestScore >= 6000 ? 'Radiant' : bestScore >= 5000 ? 'Immortal' : bestScore >= 4000 ? 'Ascendant' : 'Diamond';

    // Assemble current user's genuine record
    const userEntry: Omit<LeaderboardEntry, 'rank'> = {
      username: `${profile.username} (You)`,
      country: 'LOCAL',
      tier: userTier,
      score: bestScore,
      accuracy: avgAccuracy,
      stars: totalStars,
      isCurrentUser: true,
      isPreset: false,
    };

    // Combine preset benchmarks and real user, sort descending by score
    const all = [...PRESET_PLAYERS, userEntry];

    if (type === 'daily') {
      return all
        .map((p) => ({
          ...p,
          score: Math.round(p.score * 0.88),
        }))
        .sort((a, b) => b.score - a.score)
        .map((p, idx) => ({ ...p, rank: idx + 1 }));
    }

    if (type === 'league') {
      return all
        .slice(4, 15)
        .sort((a, b) => b.score - a.score)
        .map((p, idx) => ({ ...p, rank: idx + 1 }));
    }

    return all
      .sort((a, b) => b.score - a.score)
      .map((p, idx) => ({ ...p, rank: idx + 1 }));
  }
}

export const storageEngine = new StorageEngine();
