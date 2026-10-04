import type { MouseSample, StrokeAnalysis } from '../types';

/**
 * Calculates instantaneous velocity, acceleration, jerk, and jitter for incoming mouse events
 */
export class MotionTracker {
  private samples: MouseSample[] = [];
  private maxHistory: number = 300;
  private currentStroke: MouseSample[] = [];
  private lastMovementTime: number = 0;
  private strokeIdleTimeoutMs: number = 180; // stroke finishes after 180ms idle

  public addSample(dx: number, dy: number, time: number = performance.now()): {
    sample: MouseSample;
    completedStroke: StrokeAnalysis | null;
  } {
    const prev = this.samples[this.samples.length - 1];
    const dt = prev ? Math.max(1, time - prev.time) : 16.6;

    const dist = Math.hypot(dx, dy);
    const speed = dist / dt; // px/ms

    // Acceleration: change in speed / dt
    const prevSpeed = prev ? prev.speed : 0;
    const accel = (speed - prevSpeed) / dt;

    // Jerk: change in acceleration / dt
    const prevAccel = prev ? prev.acceleration : 0;
    const jerk = Math.abs((accel - prevAccel) / dt);

    // Angular deviation check
    let angleChange = 0;
    if (prev && dist > 0.5 && Math.hypot(prev.dx, prev.dy) > 0.5) {
      const angleNow = Math.atan2(dy, dx);
      const anglePrev = Math.atan2(prev.dy, prev.dx);
      angleChange = Math.abs(angleNow - anglePrev);
      if (angleChange > Math.PI) angleChange = 2 * Math.PI - angleChange;
    }

    // A sample is jittery if there's high jerk + rapid zigzag or speed spikes at low-medium speed
    const isJittery = (jerk > 0.15 && angleChange > 0.8 && dist > 1) || (jerk > 0.35 && dist > 1);

    const x = prev ? prev.x + dx : dx;
    const y = prev ? prev.y + dy : dy;

    const sample: MouseSample = {
      x,
      y,
      dx,
      dy,
      time,
      speed,
      acceleration: accel,
      jerk,
      isJittery,
    };

    this.samples.push(sample);
    if (this.samples.length > this.maxHistory) {
      this.samples.shift();
    }

    // Stroke management
    let completedStroke: StrokeAnalysis | null = null;
    if (time - this.lastMovementTime > this.strokeIdleTimeoutMs && this.currentStroke.length > 5) {
      completedStroke = this.analyzeStroke(this.currentStroke);
      this.currentStroke = [];
    }

    if (dist > 0.1) {
      this.currentStroke.push(sample);
      this.lastMovementTime = time;
    }

    return { sample, completedStroke };
  }

  public flushStroke(): StrokeAnalysis | null {
    if (this.currentStroke.length > 5) {
      const stroke = this.analyzeStroke(this.currentStroke);
      this.currentStroke = [];
      return stroke;
    }
    return null;
  }

  public getRecentSamples(count: number = 60): MouseSample[] {
    return this.samples.slice(-count);
  }

  public clearHistory(): void {
    this.samples = [];
    this.currentStroke = [];
  }

  /**
   * Deep analysis of a single movement stroke (flick, micro-adjust, or swipe)
   */
  public analyzeStroke(stroke: MouseSample[]): StrokeAnalysis {
    if (stroke.length === 0) {
      return {
        samples: [],
        startTime: 0,
        endTime: 0,
        duration: 0,
        totalDistance: 0,
        peakSpeed: 0,
        averageSpeed: 0,
        jitterScore: 100,
        stopBounceDetected: false,
        stopBounceSeverity: 0,
        decelerationQuality: 'Smooth & Controlled',
      };
    }

    const startTime = stroke[0].time;
    const endTime = stroke[stroke.length - 1].time;
    const duration = Math.max(1, endTime - startTime);

    let totalDist = 0;
    let peakSpeed = 0;
    let totalSpeed = 0;
    let jitterSamplesCount = 0;

    for (let i = 0; i < stroke.length; i++) {
      const s = stroke[i];
      const d = Math.hypot(s.dx, s.dy);
      totalDist += d;
      totalSpeed += s.speed;
      if (s.speed > peakSpeed) peakSpeed = s.speed;
      if (s.isJittery) jitterSamplesCount++;
    }

    const averageSpeed = totalSpeed / stroke.length;

    // Calculate Jitter Score (100 = glass smooth, 0 = pure tremor)
    const jitterRatio = jitterSamplesCount / stroke.length;
    let jitterScore = Math.round(Math.max(0, 100 - jitterRatio * 180));

    // Analyze the STOP phase (last 30% of samples or last 150ms)
    const stopWindowCount = Math.max(3, Math.floor(stroke.length * 0.35));
    const stopSamples = stroke.slice(-stopWindowCount);

    let stopBounceDetected = false;
    let stopBounceSeverity = 0;

    // Check for directional reversals (bounce) during deceleration
    let reversals = 0;
    for (let j = 1; j < stopSamples.length; j++) {
      const s1 = stopSamples[j - 1];
      const s2 = stopSamples[j];
      const dot = s1.dx * s2.dx + s1.dy * s2.dy;
      if (dot < -0.2 && Math.hypot(s2.dx, s2.dy) > 0.8) {
        reversals++;
      }
    }

    if (reversals >= 1) {
      stopBounceDetected = true;
      stopBounceSeverity = Math.min(1, reversals * 0.4);
      jitterScore = Math.max(0, jitterScore - reversals * 15);
    }

    let decelerationQuality: StrokeAnalysis['decelerationQuality'] = 'Smooth & Controlled';
    if (stopBounceDetected && stopBounceSeverity > 0.5) {
      decelerationQuality = 'Sudden Slam / Bounce';
    } else if (jitterScore < 75 || stopBounceDetected) {
      decelerationQuality = 'Slight Shake';
    }

    return {
      samples: stroke,
      startTime,
      endTime,
      duration,
      totalDistance: totalDist,
      peakSpeed,
      averageSpeed,
      jitterScore,
      stopBounceDetected,
      stopBounceSeverity,
      decelerationQuality,
    };
  }
}
