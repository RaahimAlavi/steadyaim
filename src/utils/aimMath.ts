// Valorant mouse engine constants
// Valorant m_yaw is 0.07 degrees per mouse count
export const VALORANT_M_YAW = 0.07;
export const VALORANT_HORIZONTAL_FOV = 103;

/**
 * Calculates effective DPI (eDPI)
 */
export function calculateEDPI(dpi: number, sensitivity: number): number {
  return Math.round(dpi * sensitivity);
}

/**
 * Calculates physical distance (cm) for a 360 degree turn
 */
export function calculateCm360(dpi: number, sensitivity: number): number {
  const degreesPerCount = sensitivity * VALORANT_M_YAW;
  if (degreesPerCount <= 0) return 0;
  const countsFor360 = 360 / degreesPerCount;
  const inches = countsFor360 / dpi;
  return Number((inches * 2.54).toFixed(2));
}

/**
 * Calculates angular delta (degrees) from raw mouse counts
 */
export function countsToDegrees(dx: number, dy: number, sensitivity: number): { yaw: number; pitch: number } {
  return {
    yaw: dx * sensitivity * VALORANT_M_YAW,
    pitch: dy * sensitivity * VALORANT_M_YAW,
  };
}

/**
 * Converts mouse counts to screen canvas pixels based on reference resolution & Valorant FOV
 */
export function countsToScreenPixels(
  dx: number,
  dy: number,
  sensitivity: number,
  screenWidth: number
): { pxX: number; pxY: number } {
  const { yaw, pitch } = countsToDegrees(dx, dy, sensitivity);
  // Using pinhole projection tangent approximation for 103 deg FOV
  const fovRad = (VALORANT_HORIZONTAL_FOV * Math.PI) / 180;
  const focalLength = screenWidth / (2 * Math.tan(fovRad / 2));
  
  const radYaw = (yaw * Math.PI) / 180;
  const radPitch = (pitch * Math.PI) / 180;

  return {
    pxX: Math.tan(radYaw) * focalLength,
    pxY: Math.tan(radPitch) * focalLength,
  };
}

/**
 * Provides an esports tier analysis of the player's eDPI
 */
export function analyzeSensTier(edpi: number): {
  category: 'Ultra-Low' | 'Competitive Low' | 'Standard Pro' | 'High' | 'Very High';
  description: string;
  advice: string;
} {
  if (edpi < 180) {
    return {
      category: 'Ultra-Low',
      description: 'Extremely high physical stability, requires large arm sweeps.',
      advice: 'Great for zero micro-jitter, but clearing 180° flashes or close-range jumps requires huge desk space.',
    };
  } else if (edpi <= 280) {
    return {
      category: 'Standard Pro',
      description: 'The golden median for top Valorant pros (TenZ, yay, Aspas, Chronicle).',
      advice: 'Perfect balance of steady micro-adjustments and snappy clearing. Shaking at this sens is 99% muscle tension or grip pressure.',
    };
  } else if (edpi <= 360) {
    return {
      category: 'Competitive Low',
      description: 'Slightly faster wrist-friendly speed.',
      advice: 'Good for active duelists, but requires calm finger control to avoid end-of-flick micro-wobbles.',
    };
  } else if (edpi <= 450) {
    return {
      category: 'High',
      description: 'High sensitivity zone.',
      advice: 'Fingertip micro-adjustments can easily jitter if you tense up or use a heavier mouse like the G402.',
    };
  } else {
    return {
      category: 'Very High',
      description: 'Hyper-sensitive. Micro-jitter is almost unavoidable without extreme finger dampening.',
      advice: 'Strongly recommended to lower towards the 220–280 eDPI range for tactical FPS consistency.',
    };
  }
}
