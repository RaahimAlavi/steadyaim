import { useState, useEffect } from 'react';
import type { UserSettings } from './types';
import { Navbar } from './components/Navbar';
import { LiveDiagnostics } from './components/LiveDiagnostics';
import { WhisperGripDrill } from './components/WhisperGripDrill';
import { StoppingPowerDrill } from './components/StoppingPowerDrill';
import { SensBenchmark } from './components/SensBenchmark';
import { ClipAnalyzer } from './components/ClipAnalyzer';
import { SettingsModal } from './components/SettingsModal';
import { sounds } from './utils/soundEffects';
import { Crosshair, Shield } from 'lucide-react';


export function App() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('steadyaim_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      dpi: 800,
      sensitivity: 0.32,
      mouseModel: 'Logitech G402',
      fov: 103,
      jitterSensitivityThreshold: 1.0,
      soundEnabled: true,
      soundVolume: 0.8,
      crosshairStyle: 'classic',
      crosshairColor: '#00f5d4',
      crosshairSize: 6,
    };
  });

  const [activeTab, setActiveTab] = useState<'diagnostics' | 'whisper-grip' | 'stopping-power' | 'clip-analyzer' | 'benchmark'>('whisper-grip');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync sound setting
  useEffect(() => {
    sounds.enabled = settings.soundEnabled;
    localStorage.setItem('steadyaim_settings', JSON.stringify(settings));
  }, [settings]);

  const handleUpdateSens = (newSens: number) => {
    setSettings((prev) => ({ ...prev, sensitivity: newSens }));
  };

  const toggleSound = () => {
    setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  return (
    <div className="min-h-screen bg-[#090b11] text-slate-100 flex flex-col font-sans selection:bg-[#ff4655] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSettings={() => setIsSettingsOpen(true)}
        toggleSound={toggleSound}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {activeTab === 'whisper-grip' && (
          <WhisperGripDrill settings={settings} onOpenSettings={() => setIsSettingsOpen(true)} />
        )}
        {activeTab === 'stopping-power' && (
          <StoppingPowerDrill settings={settings} onOpenSettings={() => setIsSettingsOpen(true)} />
        )}
        {activeTab === 'clip-analyzer' && <ClipAnalyzer />}
        {activeTab === 'diagnostics' && <LiveDiagnostics settings={settings} />}
        {activeTab === 'benchmark' && (
          <SensBenchmark settings={settings} onUpdateSens={handleUpdateSens} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#0c0e16] border-t border-[#1d2232] py-6 px-4 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f5d4]" />
            <span className="font-semibold text-slate-300">STEADYAIM</span>
            <span>— Built for Calm Gunfight Execution in Valorant & Tactical FPS</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Crosshair className="w-3.5 h-3.5 text-[#ff4655]" />
              <span>Target Confirmation {'>'} Panic Flicking</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-[#00f5d4]" />
              <span>100% Anti-Cheat Safe (Standalone Web)</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Calibration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => setSettings(newSettings)}
      />
    </div>
  );
}

export default App;
