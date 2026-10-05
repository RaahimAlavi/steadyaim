import { useState, useEffect } from 'react';
import type { UserSettings } from './types';
import { Navbar, type AppTab } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HeroLanding } from './components/HeroLanding';
import { PathToRadiant } from './components/PathToRadiant';
import { DrillHub } from './components/DrillHub';
import { LiveDiagnostics } from './components/LiveDiagnostics';
import { WhisperGripDrill } from './components/WhisperGripDrill';
import { StoppingPowerDrill } from './components/StoppingPowerDrill';
import { TileFrenzyDrill } from './components/TileFrenzyDrill';
import { SensBenchmark } from './components/SensBenchmark';
import { ClipAnalyzer } from './components/ClipAnalyzer';
import { LeaderboardView } from './components/LeaderboardView';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import ClickSpark from './components/reactbits/ClickSpark';
import { calculateEDPI } from './utils/aimMath';
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
      mouseProfileId: 'custom',
      mouseModel: 'Custom / Other Mouse',
      mouseWeightGrams: 70,
      fov: 103,
      jitterSensitivityThreshold: 1.0,
      soundEnabled: true,
      soundVolume: 0.8,
      crosshairStyle: 'classic',
      crosshairColor: '#00f5d4',
      crosshairSize: 6,
    };
  });

  const [activeTab, setActiveTab] = useState<AppTab>('hero');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    localStorage.setItem('steadyaim_settings', JSON.stringify(settings));
  }, [settings]);

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleUpdateSens = (newSens: number) => {
    setSettings((prev) => ({ ...prev, sensitivity: newSens }));
  };

  const toggleSound = () => {
    setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const currentEdpi = calculateEDPI(settings.dpi, settings.sensitivity);

  return (
    <ClickSpark sparkColor="#3b82f6" sparkSize={8} sparkRadius={18} sparkCount={7} duration={300}>
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex overflow-hidden font-sans selection:bg-blue-600 selection:text-white select-none">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Mobile Backdrop Overlay when sidebar is open */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden cursor-pointer"
          />
        )}

        {/* Right Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          {/* Top Esports Navbar */}
          <Navbar
            settings={settings}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openSettings={() => setIsSettingsOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            toggleSound={toggleSound}
            toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
          />

          {/* Primary View Router */}
          <main className="flex-1 w-full">
            {activeTab === 'hero' && (
              <HeroLanding
                onPlayNow={() => setActiveTab('radiant')}
                onSelectTab={(tab) => setActiveTab(tab)}
                currentEdpi={currentEdpi}
              />
            )}

            {activeTab === 'radiant' && (
              <PathToRadiant
                onLaunchDrill={(drill) => setActiveTab(drill)}
                currentEdpi={currentEdpi}
              />
            )}

            {activeTab === 'leaderboard' && <LeaderboardView />}

            {activeTab === 'hub' && (
              <div className="max-w-7xl mx-auto p-4 lg:p-8">
                <DrillHub
                  settings={settings}
                  onSelectTab={(tab) => {
                    if (tab === 'whisper-grip') setActiveTab('whisper');
                    else if (tab === 'stopping-power') setActiveTab('stopping');
                    else if (tab === 'tile-frenzy') setActiveTab('tile-frenzy');
                    else if (tab === 'clip-analyzer') setActiveTab('clip-analyzer');
                    else if (tab === 'diagnostics') setActiveTab('analytics');
                    else if (tab === 'benchmark') setActiveTab('calibrator');
                  }}
                  openSettings={() => setIsSettingsOpen(true)}
                />
              </div>
            )}

            {activeTab === 'tile-frenzy' && (
              <div className="max-w-7xl mx-auto p-4 lg:p-8">
                <TileFrenzyDrill
                  settings={settings}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onExitDrill={() => setActiveTab('hub')}
                />
              </div>
            )}

            {activeTab === 'whisper' && (
              <div className="max-w-7xl mx-auto p-4 lg:p-8">
                <WhisperGripDrill
                  settings={settings}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              </div>
            )}

            {activeTab === 'stopping' && (
              <div className="max-w-7xl mx-auto p-4 lg:p-8">
                <StoppingPowerDrill
                  settings={settings}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="max-w-7xl mx-auto p-4 lg:p-8">
                <LiveDiagnostics settings={settings} />
              </div>
            )}

            {activeTab === 'clip-analyzer' && (
              <div className="max-w-7xl mx-auto p-4 lg:p-8">
                <ClipAnalyzer />
              </div>
            )}

            {activeTab === 'calibrator' && (
              <div className="max-w-7xl mx-auto p-4 lg:p-8">
                <SensBenchmark
                  settings={settings}
                  onUpdateSens={handleUpdateSens}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              </div>
            )}
          </main>

          {/* Persistent Footer */}
          <footer className="w-full bg-[#07090e] border-t border-[#161d2d] py-5 px-6 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="font-semibold text-slate-300">STEADYAIM PRO</span>
                <span>: Anti-Jitter & Calm Gunfight Execution Suite for Tactical FPS</span>
              </div>

              <div className="flex items-center gap-6 text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Crosshair className="w-3.5 h-3.5 text-rose-500" />
                  <span>Target Confirmation {'>'} Panic Flicking</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>100% Anti-Cheat Safe (Native WebGL)</span>
                </span>
              </div>
            </div>
          </footer>
        </div>

        {/* Sensitivity & Mouse Calibration Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSave={(newSettings) => setSettings(newSettings)}
        />

        {/* Player Profile & Cloud Sync Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />
      </div>
    </ClickSpark>
  );
}

export default App;
