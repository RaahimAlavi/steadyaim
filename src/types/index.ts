export interface MouseProfile {
  id: string;
  name: string;
  brand: string;
  weightGrams: number;
  category: 'Ultralight (<60g)' | 'Midweight (60-85g)' | 'Heavy (>85g)';
  stictionProfile: 'Low Glide Resistance' | 'Balanced Control' | 'High Stiction / Inertia';
  coachingTip: string;
}

export interface UserSettings {
  dpi: number;
  sensitivity: number;
  mouseProfileId: string;
  mouseModel: string;
  mouseWeightGrams: number;
  fov: number; // 103 for Valorant
  jitterSensitivityThreshold: number; // threshold to trigger tension warning
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  crosshairStyle: 'classic' | 'dot' | 'plus' | 'circle';
  crosshairColor: string;
  crosshairSize: number;
}

export interface MouseSample {
  x: number;
  y: number;
  dx: number;
  dy: number;
  time: number; // performance.now()
  speed: number; // px/ms
  acceleration: number;
  jerk: number;
  isJittery: boolean;
}

export interface StrokeAnalysis {
  samples: MouseSample[];
  startTime: number;
  endTime: number;
  duration: number;
  totalDistance: number;
  peakSpeed: number;
  averageSpeed: number;
  jitterScore: number; // 0 to 100 (100 = silky smooth, 0 = high tremor)
  stopBounceDetected: boolean;
  stopBounceSeverity: number; // 0 to 1
  decelerationQuality: 'Smooth & Controlled' | 'Slight Shake' | 'Sudden Slam / Bounce';
}

export interface TargetShotDetail {
  shotNumber: number;
  hit: boolean;
  timeToConfirmMs: number;
  jitterScore: number;
  stopBounce: boolean;
}

export interface DrillResult {
  id: string;
  drillType: 'whisper-grip' | 'stopping-power' | 'target-confirmation';
  timestamp: number;
  totalTargets: number;
  hits: number;
  misses: number;
  accuracy: number;
  avgJitterScore: number;
  tenseAlertsCount: number;
  avgTimeToConfirmMs: number;
  avgDecelerationScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  shots: TargetShotDetail[];
}
