import React, { useState, useEffect } from 'react';
import type { UserSettings } from '../types';
import { calculateEDPI, calculateCm360, analyzeSensTier } from '../utils/aimMath';
import { MOUSE_DATABASE, analyzeWeightDynamics } from '../utils/mouseProfiles';
import { X, Check, Info, Sliders, Crosshair, Cpu } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'sens' | 'crosshair'>('sens');

  const [dpi, setDpi] = useState(settings.dpi);
  const [sensitivity, setSensitivity] = useState(settings.sensitivity);
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
    { label: 'Green', hex: '#00ff66' },
    { label: 'Gold', hex: '#ffb703' },
    { label: 'White', hex: '#ffffff' },
    { label: 'Purple', hex: '#b5179e' },
  ];

  const handleSelectMouse = (id: string) => {
    setMouseProfileId(id);
    const found = MOUSE_DATABASE.find((m) => m.id === id);
    if (found) {
      setMouseModel(found.name);
      setMouseWeightGrams(found.weightGrams);
    }
  };

  const handleSave = () => {
    onSave({
      ...settings,
      dpi: Number(dpi),
      sensitivity: Number(sensitivity),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0f121b] border border-[#23293c] rounded-3xl shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#21273b]">
          <div>
            <h3 className="text-lg font-black text-white tracking-wide uppercase">
              SETTINGS & CALIBRATION
            </h3>
            <p className="text-xs text-slate-400">Match Valorant settings & customize HUD crosshair</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1f2436] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-[#151926] rounded-xl border border-[#242b3e]">
          <button
            onClick={() => setActiveTab('sens')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'sens'
                ? 'bg-[#ff4655] text-white shadow-md shadow-[#ff4655]/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Sensitivity & Hardware</span>
          </button>

          <button
            onClick={() => setActiveTab('crosshair')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'crosshair'
                ? 'bg-[#ff4655] text-white shadow-md shadow-[#ff4655]/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>HUD Crosshair</span>
          </button>
        </div>

        <div className="space-y-5 py-5 max-h-[60vh] overflow-y-auto pr-1">
          {activeTab === 'sens' ? (
            <>
              {/* DPI & Sens Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Mouse DPI
                  </label>
                  <input
                    type="number"
                    min="200"
                    max="6400"
                    step="50"
                    value={dpi}
                    onChange={(e) => setDpi(Math.max(100, Number(e.target.value)))}
                    className="w-full bg-[#161a26] border border-[#273046] rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#ff4655]"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Esports standard: 800 or 1600</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Valorant Sensitivity
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    max="5.0"
                    step="0.01"
                    value={sensitivity}
                    onChange={(e) => setSensitivity(Math.max(0.01, Number(e.target.value)))}
                    className="w-full bg-[#161a26] border border-[#273046] rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#ff4655]"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Exact in-game sensitivity</span>
                </div>
              </div>

              {/* Hardware Mouse Profile Selection */}
              <div className="space-y-3 bg-[#131722] border border-[#22283a] p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#ff4655]" />
                    <span>Mouse Hardware Profile</span>
                  </label>
                  <span className="text-[11px] font-mono text-[#00f5d4]">{mouseWeightGrams}g Mass</span>
                </div>

                <select
                  value={mouseProfileId}
                  onChange={(e) => handleSelectMouse(e.target.value)}
                  className="w-full bg-[#181d2a] border border-[#283248] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#ff4655]"
                >
                  {MOUSE_DATABASE.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.weightGrams}g)
                    </option>
                  ))}
                </select>

                {mouseProfileId === 'custom' && (
                  <div>
                    <input
                      type="text"
                      value={mouseModel}
                      onChange={(e) => setMouseModel(e.target.value)}
                      placeholder="Enter custom mouse model name"
                      className="w-full bg-[#181d2a] border border-[#283248] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff4655]"
                    />
                  </div>
                )}

                {/* Weight Slider */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Physical Weight Calibration:</span>
                    <span className="font-mono text-white font-bold">{mouseWeightGrams} grams</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="140"
                    step="1"
                    value={mouseWeightGrams}
                    onChange={(e) => setMouseWeightGrams(Number(e.target.value))}
                    className="w-full accent-[#ff4655] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
                    <span>30g Ultralight</span>
                    <span>70g Mid</span>
                    <span>140g Heavy</span>
                  </div>
                </div>

                {/* Dynamic Physics Card */}
                <div className="bg-[#0e111a] border border-[#1e2436] rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Class:</span>
                    <span className="font-bold text-[#00f5d4]">{weightDynamics.category}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {weightDynamics.stoppingAdvice}
                  </p>
                </div>
              </div>

              {/* Calculated eDPI Card */}
              <div className="bg-[#141824] border border-[#23293c] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Calculated eDPI</span>
                  <span className="text-base font-black text-[#00f5d4]">{currentEdpi} eDPI</span>
                </div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="text-slate-400">Physical distance for 360° turn:</span>
                  <span className="font-mono text-slate-200">{currentCm360} cm</span>
                </div>
                <div className="bg-[#1a2030] rounded-xl p-3 flex items-start gap-2.5 text-xs">
                  <Info className="w-4 h-4 text-[#ff4655] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white mr-1.5">Tier: {sensAnalysis.category}.</span>
                    <span className="text-slate-300">{sensAnalysis.advice}</span>
                  </div>
                </div>
              </div>

              {/* Tension Sensitivity Threshold */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Tension Detector Sensitivity
                  </label>
                  <span className="text-xs text-[#00f5d4] font-mono">{jitterSensitivityThreshold}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={jitterSensitivityThreshold}
                  onChange={(e) => setJitterSensitivityThreshold(Number(e.target.value))}
                  className="w-full accent-[#ff4655] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Forgiving</span>
                  <span>Strict (Pro Standard)</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Crosshair Style */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Crosshair Style
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {(['classic', 'dot', 'plus', 'circle'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setCrosshairStyle(s)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                        crosshairStyle === s
                          ? 'bg-[#ff4655]/20 border-[#ff4655] text-white shadow-lg shadow-[#ff4655]/20'
                          : 'bg-[#161a26] border-[#252c3e] text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crosshair Color */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Crosshair Color
                </label>
                <div className="flex items-center gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setCrosshairColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        crosshairColor === c.hex ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Crosshair Size */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Crosshair Size
                  </label>
                  <span className="text-xs text-[#00f5d4] font-mono">{crosshairSize}px</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="1"
                  value={crosshairSize}
                  onChange={(e) => setCrosshairSize(Number(e.target.value))}
                  className="w-full accent-[#ff4655] cursor-pointer"
                />
              </div>

              {/* Preview Box */}
              <div className="bg-[#0b0e16] border border-[#21273b] rounded-2xl h-24 flex items-center justify-center relative">
                <span className="absolute top-2 left-3 text-[10px] uppercase font-bold text-slate-500">
                  HUD Preview
                </span>
                <div
                  style={{
                    width: crosshairStyle === 'dot' ? `${crosshairSize}px` : undefined,
                    height: crosshairStyle === 'dot' ? `${crosshairSize}px` : undefined,
                    backgroundColor: crosshairStyle === 'dot' ? crosshairColor : undefined,
                  }}
                  className={crosshairStyle === 'dot' ? 'rounded-full' : ''}
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
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#21273b]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#1a1e2b] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#ff4655] hover:bg-[#ff5a68] text-white uppercase tracking-wider shadow-lg shadow-[#ff4655]/25 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Apply Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
