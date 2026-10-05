import React, { useState, useEffect } from 'react';
import type { UserSettings } from '../types';
import { calculateEDPI, calculateCm360, analyzeSensTier } from '../utils/aimMath';
import { MOUSE_DATABASE, analyzeWeightDynamics } from '../utils/mouseProfiles';
import { X, Check, Info, Sliders, Crosshair, Cpu, Gamepad2 } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
}

const GAME_PRESETS = [
  { id: 'valorant', name: 'Valorant', defaultFov: 103, yawMultiplier: 1.0 },
  { id: 'cs2', name: 'Counter-Strike 2 / CS:GO', defaultFov: 106, yawMultiplier: 3.1818 },
  { id: 'apex', name: 'Apex Legends', defaultFov: 110, yawMultiplier: 3.1818 },
  { id: 'overwatch', name: 'Overwatch 2', defaultFov: 103, yawMultiplier: 10.606 },
  { id: 'cod', name: 'Call of Duty: Warzone', defaultFov: 103, yawMultiplier: 3.1818 },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'sens' | 'crosshair'>('sens');
  const [selectedGame, setSelectedGame] = useState('valorant');

  const [dpi, setDpi] = useState(settings.dpi);
  const [sensitivity, setSensitivity] = useState(settings.sensitivity);
  const [fov, setFov] = useState(settings.fov || 103);
  const [mouseProfileId, setMouseProfileId] = useState(settings.mouseProfileId || 'custom');
  const [mouseModel, setMouseModel] = useState(settings.mouseModel || 'Custom / Other Mouse');
  const [mouseWeightGrams, setMouseWeightGrams] = useState(settings.mouseWeightGrams || 70);
  const [jitterSensitivityThreshold, setJitterSensitivityThreshold] = useState(
    settings.jitterSensitivityThreshold
  );

  const [crosshairStyle, setCrosshairStyle] = useState<UserSettings['crosshairStyle']>(
    settings.crosshairStyle || 'classic'
  );
  const [crosshairColor, setCrosshairColor] = useState(settings.crosshairColor || '#00f5d4');
  const [crosshairSize, setCrosshairSize] = useState(settings.crosshairSize || 6);

  useEffect(() => {
    setDpi(settings.dpi);
    setSensitivity(settings.sensitivity);
    setFov(settings.fov || 103);
    setMouseProfileId(settings.mouseProfileId || 'custom');
    setMouseModel(settings.mouseModel || 'Custom / Other Mouse');
    setMouseWeightGrams(settings.mouseWeightGrams || 70);
    setJitterSensitivityThreshold(settings.jitterSensitivityThreshold);
    setCrosshairStyle(settings.crosshairStyle || 'classic');
    setCrosshairColor(settings.crosshairColor || '#00f5d4');
    setCrosshairSize(settings.crosshairSize || 6);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const currentEdpi = calculateEDPI(dpi, sensitivity);
  const currentCm360 = calculateCm360(dpi, sensitivity);
  const sensAnalysis = analyzeSensTier(currentEdpi);
  const weightDynamics = analyzeWeightDynamics(mouseWeightGrams);

  const colors = [
    { label: 'Cyan', hex: '#00f5d4' },
    { label: 'Valorant Red', hex: '#ff4655' },
    { label: 'Emerald Green', hex: '#00ff66' },
    { label: 'Gold', hex: '#ffb703' },
    { label: 'Clean White', hex: '#ffffff' },
    { label: 'Electric Purple', hex: '#b5179e' },
  ];

  const handleSelectGame = (gameId: string) => {
    setSelectedGame(gameId);
    const game = GAME_PRESETS.find((g) => g.id === gameId);
    if (game) {
      setFov(game.defaultFov);
    }
  };

  const handleSelectMouse = (id: string) => {
    setMouseProfileId(id);
    const found = MOUSE_DATABASE.find((m) => m.id === id);
    if (found) {
      setMouseModel(found.name);
      setMouseWeightGrams(found.weightGrams);
    }
  };

  const handleSave = () => {
    audioEngine.playClick();
    onSave({
      ...settings,
      dpi: Number(dpi),
      sensitivity: Number(sensitivity),
      fov: Number(fov),
      mouseProfileId,
      mouseModel,
      mouseWeightGrams: Number(mouseWeightGrams),
      jitterSensitivityThreshold: Number(jitterSensitivityThreshold),
      crosshairStyle,
      crosshairColor,
      crosshairSize: Number(crosshairSize),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#0c101c] border border-[#212d45] rounded-3xl shadow-2xl p-6 text-slate-200 text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1c273e]">
          <div>
            <h3 className="text-lg font-black text-white tracking-wide uppercase">
              SETTINGS & CALIBRATION
            </h3>
            <p className="text-xs text-slate-400">Match FPS sensitivity & customize tactical HUD crosshair</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a2338] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-[#101626] rounded-xl border border-[#1e2a42]">
          <button
            onClick={() => {
              audioEngine.playClick();
              setActiveTab('sens');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'sens'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Sensitivity & Game Engine</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              setActiveTab('crosshair');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'crosshair'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>HUD Crosshair</span>
          </button>
        </div>

        <div className="space-y-4 py-4 max-h-[62vh] overflow-y-auto pr-1">
          {activeTab === 'sens' ? (
            <>
              {/* Game Preset Dropdown matching Benchmark Screenshot 3 */}
              <div className="bg-[#101626] border border-[#1e2a42] p-3.5 rounded-2xl">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Target Game Engine</span>
                  </label>
                  <span className="text-[10px] font-mono text-blue-400">Exact Yaw Ratio</span>
                </div>

                <select
                  value={selectedGame}
                  onChange={(e) => handleSelectGame(e.target.value)}
                  className="w-full bg-[#141b2e] border border-[#23314d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {GAME_PRESETS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.defaultFov}° FOV)
                    </option>
                  ))}
                </select>
              </div>

              {/* In-Game Sensitivity: Slider + Exact Number Box */}
              <div className="bg-[#101626] border border-[#1e2a42] p-3.5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    In-Game Sensitivity
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0.01"
                      max="5.0"
                      step="0.01"
                      value={sensitivity}
                      onChange={(e) => setSensitivity(Math.max(0.01, Number(e.target.value)))}
                      className="w-20 bg-[#162035] border border-[#2b3c5e] rounded-lg px-2 py-1 text-xs text-white font-mono text-right focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min="0.05"
                  max="2.5"
                  step="0.01"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>0.05 (Low)</span>
                  <span>0.35 (Esports Avg)</span>
                  <span>2.50 (High)</span>
                </div>
              </div>

              {/* Mouse DPI: Slider + Number Box + Quick Pills */}
              <div className="bg-[#101626] border border-[#1e2a42] p-3.5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    Hardware Mouse DPI
                  </label>
                  <input
                    type="number"
                    min="200"
                    max="6400"
                    step="50"
                    value={dpi}
                    onChange={(e) => setDpi(Math.max(100, Number(e.target.value)))}
                    className="w-20 bg-[#162035] border border-[#2b3c5e] rounded-lg px-2 py-1 text-xs text-white font-mono text-right focus:outline-none focus:border-blue-500"
                  />
                </div>

                <input
                  type="range"
                  min="400"
                  max="3200"
                  step="100"
                  value={dpi}
                  onChange={(e) => setDpi(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />

                <div className="flex items-center gap-1.5 mt-2">
                  {[400, 800, 1600, 3200].map((val) => (
                    <button
                      key={val}
                      onClick={() => setDpi(val)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        dpi === val
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#141b2e] text-slate-400 hover:text-white border border-[#23314d]'
                      }`}
                    >
                      {val} DPI
                    </button>
                  ))}
                </div>
              </div>

              {/* Field of View (FOV) Slider */}
              <div className="bg-[#101626] border border-[#1e2a42] p-3.5 rounded-2xl">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    Horizontal FOV
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-400">{fov}°</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="120"
                  step="1"
                  value={fov}
                  onChange={(e) => setFov(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Hardware Mouse Profile Selection */}
              <div className="space-y-3 bg-[#101626] border border-[#1e2a42] p-3.5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-400" />
                    <span>Mouse Hardware Profile</span>
                  </label>
                  <span className="text-[11px] font-mono text-cyan-400">{mouseWeightGrams}g Mass</span>
                </div>

                <select
                  value={mouseProfileId}
                  onChange={(e) => handleSelectMouse(e.target.value)}
                  className="w-full bg-[#141b2e] border border-[#23314d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {MOUSE_DATABASE.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.weightGrams}g)
                    </option>
                  ))}
                </select>

                {/* Dynamic Physics Card */}
                <div className="bg-[#0b0e1a] border border-[#1a2336] rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Class:</span>
                    <span className="font-bold text-blue-400">{weightDynamics.category}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {weightDynamics.stoppingAdvice}
                  </p>
                </div>
              </div>

              {/* Calculated eDPI Card */}
              <div className="bg-[#12192b] border border-[#212f4c] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300">Effective DPI (eDPI)</span>
                  <span className="text-base font-black text-blue-400">{currentEdpi} eDPI</span>
                </div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="text-slate-400">Physical distance for 360° turn:</span>
                  <span className="font-mono text-slate-200 font-bold">{currentCm360} cm</span>
                </div>

                <div className="bg-[#0b0e1a] border border-[#1b253b] rounded-xl p-3 flex items-start gap-2.5 text-xs">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white mr-1.5">Tier: {sensAnalysis.category}.</span>
                    <span className="text-slate-300">{sensAnalysis.advice}</span>
                  </div>
                </div>
              </div>

              {/* Tension Sensitivity Threshold */}
              <div className="bg-[#101626] border border-[#1e2a42] p-3.5 rounded-2xl">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    Tension & Jitter Threshold
                  </label>
                  <span className="text-xs text-cyan-400 font-mono">{jitterSensitivityThreshold}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={jitterSensitivityThreshold}
                  onChange={(e) => setJitterSensitivityThreshold(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Forgiving</span>
                  <span>Strict (Esports Standard)</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Crosshair Style */}
              <div className="bg-[#101626] border border-[#1e2a42] p-3.5 rounded-2xl">
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Crosshair Style
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['classic', 'dot', 'plus', 'circle'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        audioEngine.playClick();
                        setCrosshairStyle(s);
                      }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                        crosshairStyle === s
                          ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-600/30'
                          : 'bg-[#141b2e] border-[#222f49] text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crosshair Color */}
              <div className="bg-[#101626] border border-[#1e2a42] p-3.5 rounded-2xl">
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Crosshair Color
                </label>
                <div className="flex items-center gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => {
                        audioEngine.playClick();
                        setCrosshairColor(c.hex);
                      }}
                      style={{ backgroundColor: c.hex }}
                      className={`w-8 h-8 rounded-full transition-transform cursor-pointer ${
                        crosshairColor === c.hex ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Crosshair Size */}
              <div className="bg-[#101626] border border-[#1e2a42] p-3.5 rounded-2xl">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    Crosshair Size
                  </label>
                  <span className="text-xs text-blue-400 font-mono font-bold">{crosshairSize}px</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="1"
                  value={crosshairSize}
                  onChange={(e) => setCrosshairSize(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Live Target Preview Swatch */}
              <div className="relative bg-[#080c16] border border-[#1d273d] rounded-2xl h-32 flex items-center justify-center overflow-hidden">
                <span className="absolute top-2 left-3 text-[10px] uppercase font-bold text-slate-500 font-mono">
                  HUD TARGET PREVIEW
                </span>

                {/* Background Target Rings */}
                <div className="w-20 h-20 rounded-full border border-blue-500/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-blue-500/30 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20" />
                  </div>
                </div>

                {/* Centered Rendered Crosshair */}
                <div
                  style={{
                    width: crosshairStyle === 'dot' ? `${crosshairSize}px` : undefined,
                    height: crosshairStyle === 'dot' ? `${crosshairSize}px` : undefined,
                    backgroundColor: crosshairStyle === 'dot' ? crosshairColor : undefined,
                  }}
                  className={`absolute pointer-events-none ${crosshairStyle === 'dot' ? 'rounded-full shadow-[0_0_8px_currentColor]' : ''}`}
                >
                  {crosshairStyle === 'classic' && (
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <div style={{ height: `${crosshairSize}px`, backgroundColor: crosshairColor }} className="w-[2px] absolute top-0" />
                      <div style={{ height: `${crosshairSize}px`, backgroundColor: crosshairColor }} className="w-[2px] absolute bottom-0" />
                      <div style={{ width: `${crosshairSize}px`, backgroundColor: crosshairColor }} className="h-[2px] absolute left-0" />
                      <div style={{ width: `${crosshairSize}px`, backgroundColor: crosshairColor }} className="h-[2px] absolute right-0" />
                    </div>
                  )}
                  {crosshairStyle === 'plus' && (
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      <div style={{ width: `${crosshairSize * 2}px`, backgroundColor: crosshairColor }} className="h-[2px] absolute" />
                      <div style={{ height: `${crosshairSize * 2}px`, backgroundColor: crosshairColor }} className="w-[2px] absolute" />
                    </div>
                  )}
                  {crosshairStyle === 'circle' && (
                    <div
                      style={{
                        width: `${crosshairSize * 2.5}px`,
                        height: `${crosshairSize * 2.5}px`,
                        borderColor: crosshairColor,
                      }}
                      className="rounded-full border-2"
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1c273e]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#151c2e] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

