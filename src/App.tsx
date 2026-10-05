import { useState, useEffect, useRef } from 'react';
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
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Wrapper for smooth enter animations using GSAP
function PageWrapper({ children, tabKey }: { children: React.ReactNode; tabKey: string }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      container.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
    );
  }, [tabKey]); // Re-run animation when tab changes

  return <div ref={container} className="w-full h-full">{children}</div>;
}

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

  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as AppTab;
      const validTabs: AppTab[] = [
        'hero',
        'radiant',
        'hub',
        'tile-frenzy',
        'whisper',
        'stopping',
        'analytics',
        'clip-analyzer',
        'leaderboard',
        'calibrator',
      ];
      if (validTabs.includes(hash)) return hash;
    }
    return 'hero';
  });
  const [activeCampaignNodeId, setActiveCampaignNodeId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = activeTab;
    }
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('steadyaim_settings', JSON.stringify(settings));
  }, [settings]);

  // Dynamic Page Title
  useEffect(() => {
    switch (activeTab) {
      case 'tile-frenzy':
        document.title = 'SteadyAim · Tile Frenzy (Live)';
        break;
      case 'whisper':
        document.title = 'SteadyAim · Whisper Grip 5m (Live)';
        break;
      case 'stopping':
        document.title = 'SteadyAim · Stopping Power 10m (Live)';
        break;
      case 'radiant':
        document.title = 'SteadyAim · Path to Radiant';
        break;
      case 'hub':
        document.title = 'SteadyAim · Drill Hub';
        break;
      case 'leaderboard':
        document.title = 'SteadyAim · Competitive Standings';
        break;
      case 'analytics':
        document.title = 'SteadyAim · Telemetry & Heatmap';
        break;
      case 'clip-analyzer':
        document.title = 'SteadyAim · VOD & Clip Analyzer';
        break;
      case 'calibrator':
        document.title = 'SteadyAim · DPI & Sens Lab';
        break;
      default:
        document.title = 'SteadyAim | Tactical FPS Aim Trainer';
    }
  }, [activeTab]);

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

  const isDrillActive =
    activeTab === 'tile-frenzy' ||
    activeTab === 'whisper' ||
    activeTab === 'stopping';

  // Dedicated Full-Screen Viewport for Tactical Aiming Drills (No Sidebar, No Navbar, No Void)
  if (isDrillActive) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#0a0e1a] select-none z-50">
        {activeTab === 'tile-frenzy' && (
          <TileFrenzyDrill
            settings={settings}
            nodeId={activeCampaignNodeId ?? 3}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onExitDrill={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              setActiveCampaignNodeId(null);
              setActiveTab('radiant');
            }}
            autoStart={true}
          />
        )}

        {activeTab === 'whisper' && (
          <WhisperGripDrill
            settings={settings}
            nodeId={activeCampaignNodeId ?? 1}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onExitDrill={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              setActiveCampaignNodeId(null);
              setActiveTab('radiant');
            }}
            autoStart={true}
          />
        )}

        {activeTab === 'stopping' && (
          <StoppingPowerDrill
            settings={settings}
            nodeId={activeCampaignNodeId ?? 2}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onExitDrill={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              setActiveCampaignNodeId(null);
              setActiveTab('radiant');
            }}
            autoStart={true}
          />
        )}

        {/* Settings Modal accessible from in-game pause menu */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSave={(newSettings) => setSettings(newSettings)}
        />
      </div>
    );
  }

  return (
    <ClickSpark sparkColor="#3b82f6" sparkSize={8} sparkRadius={18} sparkCount={7} duration={300}>
      <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex overflow-hidden font-sans selection:bg-blue-600 selection:text-white select-none">
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
            <PageWrapper tabKey={activeTab}>
              {activeTab === 'hero' && (
                <HeroLanding
                  onPlayNow={() => setActiveTab('radiant')}
                  onSelectTab={(tab) => setActiveTab(tab)}
                  currentEdpi={currentEdpi}
                />
              )}

              {activeTab === 'radiant' && (
                <PathToRadiant
                  onLaunchDrill={(drill, nodeId) => {
                    setActiveCampaignNodeId(nodeId);
                    setActiveTab(drill);
                  }}
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
            </PageWrapper>
          </main>

          {/* Persistent Footer */}
          <footer className="w-full bg-[#0d121f] border-t border-[#1a2436] py-5 px-6 text-xs text-slate-500">
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
