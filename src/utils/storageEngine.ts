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
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest_user_1',
  username: 'ViperAim_99',
  email: 'player@steadyaim.gg',
  isLoggedIn: false,
  rankName: 'Immortal Flight',
  globalRank: 13,
  leagueRank: 13,
  totalStars: 8,
  chaptersCompleted: 2,
  sessionsCount: 14,
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

const LEADERBOARD_PRESETS: LeaderboardEntry[] = [
  { rank: 1, username: 'TenZ_Official', country: 'CA', tier: 'Radiant', score: 6420, accuracy: 98.8, stars: 21 },
  { rank: 2, username: 'Chronicle_Aim', country: 'EU', tier: 'Radiant', score: 6280, accuracy: 98.1, stars: 21 },
  { rank: 3, username: 'Demon1_FPS', country: 'US', tier: 'Radiant', score: 6150, accuracy: 97.6, stars: 21 },
  { rank: 4, username: 'Aspas_Duelist', country: 'BR', tier: 'Radiant', score: 5980, accuracy: 96.9, stars: 20 },
  { rank: 5, username: 'Derke_Entry', country: 'FI', tier: 'Radiant', score: 5890, accuracy: 96.4, stars: 20 },
  { rank: 6, username: 'Something_PRX', country: 'JP', tier: 'Immortal', score: 5740, accuracy: 95.8, stars: 19 },
  { rank: 7, username: 'Cryocells_100T', country: 'US', tier: 'Immortal', score: 5610, accuracy: 95.2, stars: 19 },
  { rank: 8, username: 'Boaster_IGL', country: 'UK', tier: 'Immortal', score: 5490, accuracy: 94.7, stars: 18 },
  { rank: 9, username: 'Kangkang_EDG', country: 'CN', tier: 'Immortal', score: 5380, accuracy: 94.3, stars: 18 },
  { rank: 10, username: 'ScreaM_Edshot', country: 'BE', tier: 'Immortal', score: 5250, accuracy: 93.9, stars: 17 },
  { rank: 11, username: 'Shroud_Sub', country: 'US', tier: 'Immortal', score: 5120, accuracy: 93.4, stars: 17 },
  { rank: 12, username: 'cNed_OP', country: 'TR', tier: 'Immortal', score: 4980, accuracy: 92.8, stars: 16 },
  { rank: 13, username: 'ViperAim_99 (You)', country: 'US', tier: 'Immortal', score: 4850, accuracy: 92.4, stars: 15, isCurrentUser: true },
  { rank: 14, username: 'FNS_Mastermind', country: 'US', tier: 'Ascendant', score: 4720, accuracy: 91.5, stars: 14 },
  { rank: 15, username: 'Zellsis_Vibe', country: 'US', tier: 'Ascendant', score: 4610, accuracy: 90.9, stars: 14 },
];

class StorageEngine {
  private profileKey = 'steadyaim_profile';
  private sessionsKey = 'steadyaim_sessions';
  private nodeStarsKey = 'steadyaim_node_stars';

  public getProfile(): UserProfile {
    try {
      const saved = localStorage.getItem(this.profileKey);
      if (saved) return JSON.parse(saved);
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

    // Update profile
    const profile = this.getProfile();
    profile.sessionsCount += 1;
    this.saveProfile(profile);

    return newSession;
  }

  public getNodeStars(nodeId: number): number {
    try {
      const map = JSON.parse(localStorage.getItem(this.nodeStarsKey) || '{}');
      if (typeof map[nodeId] === 'number') return map[nodeId];
    } catch {
      // fallback
    }
    // Defaults matching 3D Aim Trainer screenshot
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

        // Update overall profile total stars
        const total = Object.values(map).reduce((a: number, b) => a + (Number(b) || 0), 0);
        const profile = this.getProfile();
        profile.totalStars = total;
        this.saveProfile(profile);
      }
    } catch {
      // fallback
    }
  }

  public getLeaderboard(type: 'global' | 'daily' | 'league'): LeaderboardEntry[] {
    if (type === 'daily') {
      return LEADERBOARD_PRESETS.map((p, idx) => ({
        ...p,
        rank: idx + 1,
        score: Math.round(p.score * 0.88),
      }));
    }
    if (type === 'league') {
      return LEADERBOARD_PRESETS.slice(5, 15).map((p, idx) => ({
        ...p,
        rank: idx + 10,
      }));
    }
    return LEADERBOARD_PRESETS;
  }
}

export const storageEngine = new StorageEngine();
