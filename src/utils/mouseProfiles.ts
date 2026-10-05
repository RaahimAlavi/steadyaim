import type { MouseProfile } from '../types';

export const MOUSE_DATABASE: MouseProfile[] = [
  {
    id: 'g-pro-superlight-2',
    name: 'Logitech G Pro X Superlight 2',
    brand: 'Logitech',
    weightGrams: 60,
    category: 'Ultralight (<60g)',
    stictionProfile: 'Low Glide Resistance',
    coachingTip:
      'Low mass has minimal static friction. If your crosshair trembles, you are gripping too tightly with your fingertips. Relax finger flexion to allow the PTFE skates to glide naturally.',
  },
  {
    id: 'g-pro-superlight',
    name: 'Logitech G Pro X Superlight',
    brand: 'Logitech',
    weightGrams: 60,
    category: 'Ultralight (<60g)',
    stictionProfile: 'Low Glide Resistance',
    coachingTip:
      'Very low inertia. Requires clean deceleration so you do not overshoot tiny micro-adjustments. Train relaxed forearm stopping power.',
  },
  {
    id: 'viper-v3-pro',
    name: 'Razer Viper V3 Pro',
    brand: 'Razer',
    weightGrams: 54,
    category: 'Ultralight (<60g)',
    stictionProfile: 'Low Glide Resistance',
    coachingTip:
      'Hyper-low weight registers fine motor tremors instantly. Maintain a relaxed, neutral wrist arch so your hand does not vibrate during micro-corrections.',
  },
  {
    id: 'deathadder-v3-pro',
    name: 'Razer DeathAdder V3 Pro',
    brand: 'Razer',
    weightGrams: 63,
    category: 'Midweight (60-85g)',
    stictionProfile: 'Balanced Control',
    coachingTip:
      'Ergonomic palm curve provides balanced palm stability. Ensure you do not press your palm down into the mousepad during flicks.',
  },
  {
    id: 'zowie-ec2-cw',
    name: 'BenQ Zowie EC2-CW',
    brand: 'Zowie',
    weightGrams: 77,
    category: 'Midweight (60-85g)',
    stictionProfile: 'Balanced Control',
    coachingTip:
      'Classical tactical FPS weight. Provides high stopping stability. Let mousepad friction brake your motion rather than locking your wrist tendons.',
  },
  {
    id: 'finalmouse-ulx',
    name: 'Finalmouse UltralightX',
    brand: 'Finalmouse',
    weightGrams: 35,
    category: 'Ultralight (<60g)',
    stictionProfile: 'Low Glide Resistance',
    coachingTip:
      'Extremely light. Zero physical inertia. Any finger tension causes noticeable crosshair shudder. Focus entirely on feather-light touch.',
  },
  {
    id: 'g402',
    name: 'Logitech G402 Hyperion Fury',
    brand: 'Logitech',
    weightGrams: 108,
    category: 'Heavy (>85g)',
    stictionProfile: 'High Stiction / Inertia',
    coachingTip:
      'Heavier mass creates higher static friction against cloth pads. Avoid death-gripping or pinching the thumb skirt inward. Ease downward pressure so the skates break friction smoothly.',
  },
  {
    id: 'g502',
    name: 'Logitech G502 HERO / X',
    brand: 'Logitech',
    weightGrams: 121,
    category: 'Heavy (>85g)',
    stictionProfile: 'High Stiction / Inertia',
    coachingTip:
      'High mass provides steady tracking but requires smooth deceleration. Do not try to brake abruptly with your wrist tendons to avoid rebound vibration.',
  },
  {
    id: 'custom',
    name: 'Custom / Other Mouse',
    brand: 'Custom',
    weightGrams: 70,
    category: 'Midweight (60-85g)',
    stictionProfile: 'Balanced Control',
    coachingTip:
      'Adjust the weight slider to your exact mouse specification to calibrate your custom inertia and friction diagnostics.',
  },
];

export function getMouseProfile(id: string): MouseProfile {
  const found = MOUSE_DATABASE.find((m) => m.id === id);
  return found || MOUSE_DATABASE[0];
}

export function analyzeWeightDynamics(weightGrams: number): {
  category: MouseProfile['category'];
  inertiaDescription: string;
  stoppingAdvice: string;
} {
  if (weightGrams < 62) {
    return {
      category: 'Ultralight (<60g)',
      inertiaDescription: 'Minimal physical inertia. Micro-swipes start and stop effortlessly.',
      stoppingAdvice:
        'Because the mouse will not brake itself, you must decelerate with controlled finger damping rather than slamming your wrist.',
    };
  } else if (weightGrams <= 85) {
    return {
      category: 'Midweight (60-85g)',
      inertiaDescription: 'Optimal tactical balance between agility and natural friction damping.',
      stoppingAdvice:
        'Balanced stopping power. Keep grip pressure light and allow the mousepad texture to assist in bringing the crosshair to rest.',
    };
  } else {
    return {
      category: 'Heavy (>85g)',
      inertiaDescription: 'Higher physical inertia and cloth mousepad static friction (stiction).',
      stoppingAdvice:
        'To prevent the mouse from sticking on tiny micro-adjustments, avoid pressing down into the pad. Relax downward palm pressure.',
    };
  }
}
