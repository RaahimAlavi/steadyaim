import React, { useState } from 'react';
import type { UserSettings } from '../types';
import { calculateEDPI, calculateCm360 } from '../utils/aimMath';
import { Sliders, Cpu, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface SensBenchmarkProps {
  settings: UserSettings;
  onUpdateSens: (newSens: number) => void;
}

export const SensBenchmark: React.FC<SensBenchmarkProps> = ({ settings, onUpdateSens }) => {
  const currentEdpi = calculateEDPI(settings.dpi, settings.sensitivity);
  const currentCm360 = calculateCm360(settings.dpi, settings.sensitivity);

  const [activeTrialSens, setActiveTrialSens] = useState<number>(settings.sensitivity);


  // Common competitive sens presets around user's 256 eDPI
  const presets = [
    {
      label: 'Ultra Steady / High Damping',
      sens: 0.25,
      edpi: 200,
      cm360: calculateCm360(800, 0.25),
      proUsage: 'yay / Chronicle style',
      description: 'Significantly dampens physical tremors. Great if your G402 feels too twitchy.',
    },
    {
      label: 'Standard Pro Median',
      sens: 0.28,
      edpi: 224,
      cm360: calculateCm360(800, 0.28),
      proUsage: 'Aspas / Derke style',
      description: 'Slightly lower than your current 0.32, gives extra headroom for calm micro-adjustments.',
    },
    {
      label: 'Your Current Sens',
      sens: 0.32,
      edpi: 256,
      cm360: currentCm360,
      proUsage: 'Balanced Hybrid',
      description: 'Solid competitive speed. If you shake here, focus on loosening muscle tension.',
      isCurrent: true,
    },
    {
      label: 'High Agility Wrist',
      sens: 0.36,
      edpi: 288,
      cm360: calculateCm360(800, 0.36),
      proUsage: 'TenZ / Jinggg style',
      description: 'Snappier 180s, but requires elite finger control to avoid end-of-flick wobbles.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#131622] border border-[#222738] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-[#ff4655]/20 text-[#ff4655]">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-wide">
              Sensitivity & Hardware Stability Guide
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Analysis tailored specifically for your <span className="text-white font-semibold">Logitech G402</span>, 
            <span className="text-white font-semibold"> 800 DPI</span>, and <span className="text-white font-semibold">{settings.sensitivity} Sensitivity</span> (256 eDPI).
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#181c28] border border-[#262e42] px-4 py-2 rounded-xl text-xs">
          <span className="text-slate-400">Current eDPI:</span>
          <span className="text-sm font-bold font-mono text-[#00f5d4]">{currentEdpi}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">cm/360:</span>
          <span className="text-sm font-bold font-mono text-slate-200">{currentCm360}cm</span>
        </div>
      </div>

      {/* Logitech G402 Hardware Mechanics Analysis */}
      <div className="bg-[#131622] border border-[#222738] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#212638]">
          <Cpu className="w-5 h-5 text-[#ff4655]" />
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            Logitech G402 (108g) Physical Mechanics & Why It Shakes
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Point 1: Weight & Stiction */}
          <div className="bg-[#0b0e16] border border-[#1d2232] rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-[#ff4655] uppercase block">
              1. Weight & Mousepad "Stiction"
            </span>
            <h4 className="text-sm font-bold text-white">Static Friction vs Dynamic Friction</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              At ~108g, the G402 is heavier than ultra-light mice (which are ~55g-63g). When resting still, the mouse skates sink into cloth pads, creating higher static friction ("stiction").
            </p>
            <p className="text-xs text-slate-300 bg-[#161a26] p-2.5 rounded-lg border border-[#23293c]">
              <strong className="text-[#00f5d4]">The Symptom:</strong> You try to make a tiny 3mm adjustment, the mouse resists, you push harder, and suddenly it snaps forward too fast. Loosen your downward palm pressure to let the mouse glide freely.
            </p>
          </div>

          {/* Point 2: Thumb Flare & Muscle Tension */}
          <div className="bg-[#0b0e16] border border-[#1d2232] rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-[#ffb703] uppercase block">
              2. The G402 Thumb Rest & Grip Tension
            </span>
            <h4 className="text-sm font-bold text-white">The "Death Pinch" Trap</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The G402 has a wide ergonomic thumb flare. Many players accidentally squeeze their thumb into the side wall while stabilizing. Squeezing your thumb fires the flexor pollicis longus tendon, which causes involuntary micro-tremors in your hand.
            </p>
            <p className="text-xs text-slate-300 bg-[#161a26] p-2.5 rounded-lg border border-[#23293c]">
              <strong className="text-[#ffb703]">The Fix:</strong> Let your thumb rest lightly on the skirt. Do not push inward into the mouse shell.
            </p>
          </div>

          {/* Point 3: Wrist Anchor vs Forearm Glide */}
          <div className="bg-[#0b0e16] border border-[#1d2232] rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-[#00f5d4] uppercase block">
              3. The Stop Bounce (Under-damping)
            </span>
            <h4 className="text-sm font-bold text-white">Wrist Braking vs Friction Braking</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When you say <em>"it moves in the end like its not stable"</em>, you are trying to brake with your wrist tendons. When you suddenly lock your wrist muscles to stop, the muscle acts like a stiff spring and vibrates.
            </p>
            <p className="text-xs text-slate-300 bg-[#161a26] p-2.5 rounded-lg border border-[#23293c]">
              <strong className="text-[#00f5d4]">The Fix:</strong> Decelerate progressively. Let the mousepad friction stop the mouse rather than clenching your muscles.
            </p>
          </div>
        </div>
      </div>

      {/* Sensitivity Presets & Comparative Trial */}
      <div className="bg-[#131622] border border-[#222738] rounded-2xl p-6 shadow-xl space-y-5">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase mb-1">
            Sensitivity Benchmark & Trial
          </h3>
          <p className="text-xs text-slate-400">
            Compare your current 0.32 sensitivity against adjacent pro benchmarks. You can switch sensitivities with one click and test how your hand reacts.
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
                    {p.cm360} cm for 360°
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {p.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#1d2232]">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Used by: {p.proUsage}
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
              Final Recommendation for your G402:
            </span>
            <p className="text-slate-300 leading-relaxed">
              Your <strong>0.32 sens (256 eDPI)</strong> is in the golden zone. You do <em>not</em> need to drastically slash your sensitivity.
              Instead, test lowering to <strong>0.28 sens (224 eDPI)</strong> for 2 days. At 224 eDPI, the weight of the G402 naturally absorbs tiny involuntary finger tremors, making calm micro-adjustments feel locked-in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
