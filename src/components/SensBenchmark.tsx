import React, { useState } from 'react';
import type { UserSettings } from '../types';
import { calculateEDPI, calculateCm360 } from '../utils/aimMath';
import { analyzeWeightDynamics } from '../utils/mouseProfiles';
import { Sliders, Cpu, ArrowRight, ShieldCheck, Check, Settings2, Feather } from 'lucide-react';

interface SensBenchmarkProps {
  settings: UserSettings;
  onUpdateSens: (newSens: number) => void;
  onOpenSettings?: () => void;
}

export const SensBenchmark: React.FC<SensBenchmarkProps> = ({
  settings,
  onUpdateSens,
  onOpenSettings,
}) => {
  const currentEdpi = calculateEDPI(settings.dpi, settings.sensitivity);
  const currentCm360 = calculateCm360(settings.dpi, settings.sensitivity);
  const weight = settings.mouseWeightGrams || 70;
  const dynamics = analyzeWeightDynamics(weight);

  const [activeTrialSens, setActiveTrialSens] = useState<number>(settings.sensitivity);

  // Compute 4 dynamic presets scaled relative to the user's current sensitivity
  const lowerSens = Number((settings.sensitivity * 0.8).toFixed(2));
  const medianSens = Number((settings.sensitivity * 0.9).toFixed(2));
  const agileSens = Number((settings.sensitivity * 1.15).toFixed(2));

  const presets = [
    {
      label: 'Ultra Steady / High Damping',
      sens: lowerSens,
      edpi: calculateEDPI(settings.dpi, lowerSens),
      cm360: calculateCm360(settings.dpi, lowerSens),
      proUsage: 'yay / Chronicle (~200 eDPI)',
      description: 'Significantly dampens physical tremors. Calms jitter if your crosshair shakes during micro-adjustments.',
    },
    {
      label: 'Tactical Pro Median',
      sens: medianSens,
      edpi: calculateEDPI(settings.dpi, medianSens),
      cm360: calculateCm360(settings.dpi, medianSens),
      proUsage: 'Aspas / Derke (~230 eDPI)',
      description: 'Provides extra headroom for smooth micro-glides while maintaining crisp crosshair placement.',
    },
    {
      label: 'Your Current Sens',
      sens: settings.sensitivity,
      edpi: currentEdpi,
      cm360: currentCm360,
      proUsage: 'Balanced Tactical Hybrid',
      description: 'Your calibrated speed. If you experience tremor here, prioritize loosening muscle tension and finger grip.',
      isCurrent: true,
    },
    {
      label: 'High Agility Wrist',
      sens: agileSens,
      edpi: calculateEDPI(settings.dpi, agileSens),
      cm360: calculateCm360(settings.dpi, agileSens),
      proUsage: 'TenZ / Jinggg (~280+ eDPI)',
      description: 'Snappier 180 degree clearance, but requires elite finger damping to prevent end-of-flick micro-wobbles.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#131622] border border-[#222738] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-[#ff4655]/20 text-[#ff4655]">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-wide">
              Hardware Dynamics & Sensitivity Benchmark
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Calibrated for <span className="text-white font-semibold">{settings.mouseModel || 'Universal Mouse'}</span> ({weight}g),{' '}
            <span className="text-white font-semibold">{settings.dpi} DPI</span>, and{' '}
            <span className="text-white font-semibold">{settings.sensitivity} Sens</span> ({currentEdpi} eDPI).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-[#181c28] border border-[#262e42] px-4 py-2 rounded-xl text-xs">
            <span className="text-slate-400">eDPI:</span>
            <span className="text-sm font-bold font-mono text-[#00f5d4]">{currentEdpi}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">cm/360:</span>
            <span className="text-sm font-bold font-mono text-slate-200">{currentCm360}cm</span>
          </div>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1b2133] hover:bg-[#232b40] border border-[#2c3650] text-xs font-semibold text-slate-200 transition-all"
            >
              <Settings2 className="w-3.5 h-3.5 text-[#ff4655]" />
              <span>Change Mouse</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Mouse Hardware Physics Analysis */}
      <div className="bg-[#131622] border border-[#222738] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#212638]">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#ff4655]" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              {settings.mouseModel || 'Universal Mouse'} ({weight}g) Physical Mechanics
            </h3>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#00f5d4]/10 text-[#00f5d4] border border-[#00f5d4]/30">
            {dynamics.category}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Mass & Inertia */}
          <div className="bg-[#0b0e16] border border-[#1d2232] rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-[#ff4655] uppercase block flex items-center gap-1.5">
              <Feather className="w-3.5 h-3.5" />
              <span>1. Mass & Mousepad Friction</span>
            </span>
            <h4 className="text-sm font-bold text-white">Inertia & Static Friction (Stiction)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {dynamics.inertiaDescription}
            </p>
            <p className="text-xs text-slate-300 bg-[#161a26] p-2.5 rounded-lg border border-[#23293c]">
              <strong className="text-[#00f5d4]">The Symptom:</strong> If you try to make tiny micro-corrections and the crosshair stutters, you are pressing downward. Ease downward palm pressure so the PTFE skates glide effortlessly.
            </p>
          </div>

          {/* Card 2: Grip Tension */}
          <div className="bg-[#0b0e16] border border-[#1d2232] rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-[#ffb703] uppercase block">
              2. The "Death Grip" Muscle Trap
            </span>
            <h4 className="text-sm font-bold text-white">Flexor Tendon Tremor</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When an enemy swings, adrenaline causes players to involuntarily squeeze the side walls with thumb and pinky. Squeezing activates flexor muscles in your forearm, producing visible crosshair vibration.
            </p>
            <p className="text-xs text-slate-300 bg-[#161a26] p-2.5 rounded-lg border border-[#23293c]">
              <strong className="text-[#ffb703]">The Fix:</strong> Hold the mouse like an egg. Keep fingertips relaxed in contact with the shell without pinching inward.
            </p>
          </div>

          {/* Card 3: Stop-Bounce */}
          <div className="bg-[#0b0e16] border border-[#1d2232] rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-[#00f5d4] uppercase block">
              3. The Stop Bounce (Under-damping)
            </span>
            <h4 className="text-sm font-bold text-white">Tendon Braking vs Pad Friction</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {dynamics.stoppingAdvice}
            </p>
            <p className="text-xs text-slate-300 bg-[#161a26] p-2.5 rounded-lg border border-[#23293c]">
              <strong className="text-[#00f5d4]">The Fix:</strong> Decelerate progressively into the target. Imagine gliding the crosshair gently to rest rather than hitting an invisible brick wall.
            </p>
          </div>
        </div>
      </div>

      {/* Sensitivity Presets & Comparative Trial */}
      <div className="bg-[#131622] border border-[#222738] rounded-2xl p-6 shadow-xl space-y-5">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase mb-1">
            Sensitivity Trial & Calibration
          </h3>
          <p className="text-xs text-slate-400">
            Compare your current sensitivity against adjacent competitive tiers. Test each preset with 1-click and evaluate how your hand responds in the 3D drills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {presets.map((p, idx) => {
            const isSelected = activeTrialSens === p.sens;
            const isCurrent = settings.sensitivity === p.sens;

            return (
              <div
                key={idx}
                className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#181d2c] border-[#ff4655] shadow-lg shadow-[#ff4655]/20'
                    : 'bg-[#0b0e16] border-[#1d2232] hover:border-[#2b334a]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {p.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#00f5d4]/20 text-[#00f5d4] border border-[#00f5d4]/30">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-black font-mono text-white">{p.sens}</span>
                    <span className="text-xs text-slate-400 font-mono">({p.edpi} eDPI)</span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono mb-3">
                    {p.cm360} cm for 360° turn
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {p.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#1d2232]">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Tier: {p.proUsage}
                  </span>

                  <button
                    onClick={() => {
                      setActiveTrialSens(p.sens);
                      onUpdateSens(p.sens);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? 'bg-[#1f2538] text-slate-400 cursor-default'
                        : 'bg-[#ff4655] hover:bg-[#ff5a68] text-white shadow-md shadow-[#ff4655]/30'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#00f5d4]" />
                        <span>Applied in App</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Apply {p.sens} Sens</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coach Summary Box */}
        <div className="bg-[#161a26] border border-[#273046] rounded-xl p-4 flex items-start gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-[#00f5d4] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-1">
              Esports Coach Diagnostics for {settings.mouseModel || 'your mouse'}:
            </span>
            <p className="text-slate-300 leading-relaxed">
              Your <strong>{settings.sensitivity} sensitivity ({currentEdpi} eDPI)</strong> is within the competitive sweet spot. You do <em>not</em> need to drastically slash your sensitivity.
              Focus primarily on feather-light grip pressure. If micro-tremors persist during clutch rounds, testing a 10% lower sensitivity ({medianSens}) can provide extra natural physical damping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
