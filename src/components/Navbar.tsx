import React from 'react';
import { 
  Sprout, 
  Wifi, 
  WifiOff, 
  Globe, 
  RefreshCw, 
  CheckCircle2, 
  HelpCircle,
  PiggyBank
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../services/translations';

interface NavbarProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  unsyncedCount: number;
  onManualSync: () => void;
  isSyncing: boolean;
  onOpenHelp: () => void;
  onOpenBachatCalc: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  isOnline,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  unsyncedCount,
  onManualSync,
  isSyncing,
  onOpenHelp,
  onOpenBachatCalc
}) => {
  const t = translations[language];

  return (
    <header id="app-header" className="bg-emerald-900 text-white shadow-md sticky top-0 z-40">
      {/* Top Banner / Emergency Field Status */}
      <div className="bg-emerald-950/80 px-3 py-1.5 text-xs flex items-center justify-between border-b border-emerald-800/60">
        <div className="flex items-center gap-2">
          {(!isOnline || isSimulatedOffline) ? (
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <WifiOff className="w-3.5 h-3.5 animate-pulse" />
              <span>{t.offline}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
              <Wifi className="w-3.5 h-3.5" />
              <span>{t.online}</span>
            </span>
          )}

          {unsyncedCount > 0 && (
            <button
              id="sync-pending-badge"
              onClick={onManualSync}
              disabled={isSyncing || (!isOnline && isSimulatedOffline)}
              className="bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 transition-colors"
              title="Click to sync queued checks"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{unsyncedCount} {t.syncPending}</span>
            </button>
          )}

          {unsyncedCount === 0 && isOnline && !isSimulatedOffline && (
            <span className="text-emerald-400/80 text-[11px] hidden sm:flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{t.synced}</span>
            </span>
          )}
        </div>

        {/* Offline Simulation toggle for testing in field conditions */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-offline-mode"
            onClick={onToggleSimulatedOffline}
            className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
              isSimulatedOffline 
                ? 'bg-amber-400 text-stone-900 font-bold hover:bg-amber-300' 
                : 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700'
            }`}
          >
            {isSimulatedOffline ? t.switchOnline : t.switchOffline}
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-inner font-bold">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>{t.appName}</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-emerald-200 font-medium line-clamp-1">
              {t.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Bachat (Savings) Button */}
          <button
            id="nav-bachat-btn"
            onClick={onOpenBachatCalc}
            className="flex items-center gap-1 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-stone-950 px-2.5 py-1.5 rounded-lg shadow-sm transition-transform active:scale-95"
            title="Bachat (Savings) Calculator"
          >
            <PiggyBank className="w-4 h-4 text-emerald-900" />
            <span className="hidden sm:inline">Bachat</span>
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center bg-emerald-800/80 rounded-lg p-1 border border-emerald-700">
            <Globe className="w-3.5 h-3.5 text-emerald-300 ml-1.5 mr-1" />
            <select
              id="language-select"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              aria-label="Select Language"
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1 py-0.5"
            >
              <option value="en" className="text-stone-900 bg-white">English</option>
              <option value="hi" className="text-stone-900 bg-white">हिन्दी (Hindi)</option>
              <option value="ur" className="text-stone-900 bg-white">اردو (Urdu)</option>
              <option value="sw" className="text-stone-900 bg-white">Swahili</option>
              <option value="es" className="text-stone-900 bg-white">Español</option>
            </select>
          </div>

          {/* Help / Guide button */}
          <button
            id="nav-help-btn"
            onClick={onOpenHelp}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
            title="How to use FieldSnap"
            aria-label="Help and instructions"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
