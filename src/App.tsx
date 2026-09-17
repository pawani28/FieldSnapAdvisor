/**
 * FieldSnap Advisor
 * Smart-Offline Crop & Soil Diagnosis with Traffic-Light Guidance,
 * Bachat (Savings) Calculator, and Dynamic Localized Weather Alerts.
 */

import React, { useState, useEffect } from 'react';
import { 
  DiagnosisRecord, 
  LanguageCode, 
  Plot, 
  WeatherData 
} from './types';
import { 
  getStoredPlots, 
  addStoredPlot, 
  getStoredSettings, 
  saveStoredSettings, 
  getUnsyncedCount, 
  syncOfflineRecords 
} from './services/storage';
import { getPlotWeather } from './services/weather';
import { Navbar } from './components/Navbar';
import { PlotList } from './components/PlotList';
import { PlotDetail } from './components/PlotDetail';
import { DiagnosisWizard } from './components/DiagnosisWizard';
import { ResultScreen } from './components/ResultScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { BachatCalculatorModal } from './components/BachatCalculatorModal';
import { WeatherWidget } from './components/WeatherWidget';
import { Sparkles, WifiOff, CloudRain, PiggyBank } from 'lucide-react';
import { translations } from './services/translations';

type ViewMode = 'plots' | 'plot_detail' | 'diagnosis_wizard' | 'view_diagnosis';

export default function App() {
  const [settings, setSettings] = useState(getStoredSettings());
  const [language, setLanguage] = useState<LanguageCode>(settings.language || 'en');
  const [plots, setPlots] = useState<Plot[]>([]);
  const [activePlot, setActivePlot] = useState<Plot | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('plots');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisRecord | null>(null);

  // Network & Sync State
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(
    settings.forcedOffline || false
  );
  const [unsyncedCount, setUnsyncedCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);

  // Weather & Modals
  const [weather, setWeather] = useState<WeatherData | undefined>(undefined);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(!settings.onboarded);
  const [isBachatModalOpen, setIsBachatModalOpen] = useState<boolean>(false);

  const t = translations[language];

  // Effective online status
  const effectiveOnline = isBrowserOnline && !isSimulatedOffline;

  // Initialize data on mount
  useEffect(() => {
    const loadedPlots = getStoredPlots();
    setPlots(loadedPlots);
    if (loadedPlots.length > 0) {
      setActivePlot(loadedPlots[0]);
    }
    setUnsyncedCount(getUnsyncedCount());

    // Fetch hyper-local weather
    getPlotWeather().then(w => setWeather(w));

    // Online / Offline event listeners
    const handleOnline = () => {
      setIsBrowserOnline(true);
      triggerBackgroundSync();
    };
    const handleOffline = () => {
      setIsBrowserOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update language
  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    saveStoredSettings({ language: newLang });
  };

  // Toggle simulated offline mode
  const handleToggleSimulatedOffline = () => {
    const nextState = !isSimulatedOffline;
    setIsSimulatedOffline(nextState);
    saveStoredSettings({ forcedOffline: nextState });

    // If switching back to online, trigger auto-sync!
    if (!nextState && isBrowserOnline) {
      triggerBackgroundSync();
    }
  };

  // Background sync worker
  const triggerBackgroundSync = async () => {
    setIsSyncing(true);
    try {
      const count = await syncOfflineRecords();
      setUnsyncedCount(getUnsyncedCount());
      if (count > 0) {
        setSyncSuccessToast(`Background sync complete! ${count} diagnosis records uploaded to cloud.`);
        setTimeout(() => setSyncSuccessToast(null), 4000);
      }
    } catch (e) {
      console.log('Sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Create new plot
  const handleAddPlot = (newPlotData: Omit<Plot, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPlot = addStoredPlot(newPlotData);
    setPlots(getStoredPlots());
    setActivePlot(newPlot);
    setViewMode('plot_detail');
  };

  // Select plot
  const handleSelectPlot = (plot: Plot) => {
    setActivePlot(plot);
    setViewMode('plot_detail');
  };

  // Start diagnosis check
  const handleStartCheck = (plot: Plot) => {
    setActivePlot(plot);
    setViewMode('diagnosis_wizard');
  };

  // View historical diagnosis
  const handleSelectDiagnosis = (diagnosis: DiagnosisRecord) => {
    setSelectedDiagnosis(diagnosis);
    setViewMode('view_diagnosis');
  };

  const handleFinishDiagnosis = () => {
    setPlots(getStoredPlots());
    setUnsyncedCount(getUnsyncedCount());

    // Auto-sync if online
    if (effectiveOnline) {
      triggerBackgroundSync();
    }

    if (activePlot) {
      setViewMode('plot_detail');
    } else {
      setViewMode('plots');
    }
  };

  const handleCompleteOnboarding = () => {
    setIsOnboardingOpen(false);
    saveStoredSettings({ onboarded: true });
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col selection:bg-emerald-200">
      {/* Top Navigation */}
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        isOnline={effectiveOnline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={handleToggleSimulatedOffline}
        unsyncedCount={unsyncedCount}
        onManualSync={triggerBackgroundSync}
        isSyncing={isSyncing}
        onOpenHelp={() => setIsOnboardingOpen(true)}
        onOpenBachatCalc={() => setIsBachatModalOpen(true)}
      />

      {/* Sync Toast Notification */}
      {syncSuccessToast && (
        <div className="bg-emerald-700 text-white text-xs font-bold py-2 px-4 text-center shadow-md animate-fadeIn">
          {syncSuccessToast}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-5">
        {/* Dynamic Weather Summary Bar if on Home / Plots View */}
        {viewMode === 'plots' && weather && (
          <div className="mb-4">
            <WeatherWidget weather={weather} />
          </div>
        )}

        {/* View 1: Plot List */}
        {viewMode === 'plots' && (
          <PlotList
            plots={plots}
            language={language}
            onSelectPlot={handleSelectPlot}
            onStartCheck={handleStartCheck}
            onAddPlot={handleAddPlot}
          />
        )}

        {/* View 2: Plot Detail */}
        {viewMode === 'plot_detail' && activePlot && (
          <PlotDetail
            plot={activePlot}
            language={language}
            weather={weather}
            onBack={() => setViewMode('plots')}
            onStartNewCheck={() => setViewMode('diagnosis_wizard')}
            onSelectDiagnosis={handleSelectDiagnosis}
            onPlotUpdated={(updated) => {
              setPlots(getStoredPlots());
              setActivePlot(updated);
            }}
          />
        )}

        {/* View 3: Diagnosis Flow */}
        {viewMode === 'diagnosis_wizard' && activePlot && (
          <DiagnosisWizard
            plot={activePlot}
            language={language}
            weather={weather}
            isOnline={effectiveOnline}
            onDone={handleFinishDiagnosis}
          />
        )}

        {/* View 4: Historical Diagnosis Detail View */}
        {viewMode === 'view_diagnosis' && selectedDiagnosis && activePlot && (
          <ResultScreen
            diagnosis={selectedDiagnosis}
            plot={activePlot}
            language={language}
            onSaveToHistory={() => {}}
            onDone={() => setViewMode('plot_detail')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-200/80 text-stone-600 text-xs py-3 px-4 text-center border-t border-stone-300/80">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>FieldSnap Advisor</strong> • Smart-Offline Smallholder Feedback Loop
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBachatModalOpen(true)}
              className="hover:text-emerald-800 font-bold underline"
            >
              Pocket Bachat Calculator
            </button>
            <span>•</span>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="hover:text-emerald-800 font-medium"
            >
              How it Works
            </button>
          </div>
        </div>
      </footer>

      {/* Onboarding Dialog */}
      {isOnboardingOpen && (
        <OnboardingModal
          language={language}
          onLanguageChange={handleLanguageChange}
          onComplete={handleCompleteOnboarding}
        />
      )}

      {/* Bachat Pocket Savings Calculator Modal */}
      {isBachatModalOpen && (
        <BachatCalculatorModal
          language={language}
          onClose={() => setIsBachatModalOpen(false)}
        />
      )}
    </div>
  );
}
