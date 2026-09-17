import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Droplet, 
  Sparkles, 
  PiggyBank, 
  CloudRain, 
  Check, 
  Save, 
  ThumbsUp, 
  ThumbsDown, 
  Smile, 
  TrendingUp, 
  AlertTriangle,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { 
  DiagnosisRecord, 
  LanguageCode, 
  Plot, 
  RecommendationResult, 
  StatusColor 
} from '../types';
import { translations } from '../services/translations';
import { speechService } from '../services/speech';

interface ResultScreenProps {
  diagnosis: DiagnosisRecord;
  plot: Plot;
  language: LanguageCode;
  onSaveToHistory: (record: DiagnosisRecord) => void;
  onDone: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  diagnosis,
  plot,
  language,
  onSaveToHistory,
  onDone
}) => {
  const t = translations[language];
  const { result, metrics, answers } = diagnosis;

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<'helpful' | 'neutral' | 'unhelpful' | null>(
    diagnosis.userRating || null
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Acreage multiplier for Bachat (Savings) Calculator
  const [plotArea, setPlotArea] = useState<number>(plot.areaAcre || 1.0);

  // Re-calculate bachat dynamically as farmer adjusts acreage slider
  const ureaBags = Math.round(result.bachat.ureaBagsSaved * (plotArea / (plot.areaAcre || 1)));
  const dapBags = Math.round(result.bachat.dapBagsSaved * (plotArea / (plot.areaAcre || 1)));
  const pumpHours = Math.round(result.bachat.pumpingHoursSaved * (plotArea / (plot.areaAcre || 1)));
  const cashSaved = Math.round(result.bachat.estimatedCashSaved * (plotArea / (plot.areaAcre || 1)));

  // Voice player handler
  const handleToggleVoice = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      speechService.speak(
        result.voiceScript,
        language,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  const handleRate = (rating: 'helpful' | 'neutral' | 'unhelpful') => {
    setUserRating(rating);
    diagnosis.userRating = rating;
  };

  const handleSave = () => {
    setIsSaved(true);
    onSaveToHistory(diagnosis);
  };

  const renderStatusBadge = (status: StatusColor) => {
    switch (status) {
      case 'red':
        return (
          <div className="flex items-center gap-1.5 bg-[#D32F2F] text-white px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span>CRITICAL (लाल / RED)</span>
          </div>
        );
      case 'yellow':
        return (
          <div className="flex items-center gap-1.5 bg-[#FBC02D] text-stone-950 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-950" />
            <span>CAUTION (पीला / YELLOW)</span>
          </div>
        );
      case 'green':
        return (
          <div className="flex items-center gap-1.5 bg-[#388E3C] text-white px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
            <span>OPTIMAL (हरा / GREEN)</span>
          </div>
        );
    }
  };

  const getStatusBorderClass = (status: StatusColor) => {
    switch (status) {
      case 'red': return 'border-l-8 border-l-[#D32F2F] border-stone-200 bg-rose-50/40';
      case 'yellow': return 'border-l-8 border-l-[#FBC02D] border-stone-200 bg-amber-50/40';
      case 'green': return 'border-l-8 border-l-[#388E3C] border-stone-200 bg-emerald-50/40';
    }
  };

  return (
    <div id="traffic-light-result-screen" className="max-w-2xl mx-auto space-y-4 pb-12">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <button
          id="back-to-plots-btn"
          onClick={onDone}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.myPlots}</span>
        </button>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
          {plot.name} • {plot.cropType}
        </span>
      </div>

      {/* Voice Advice Player Banner */}
      <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 border border-emerald-700">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            id="play-voice-btn"
            onClick={handleToggleVoice}
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-stone-950 transition-all active:scale-95 flex-shrink-0 ${
              isSpeaking 
                ? 'bg-amber-400 ring-4 ring-amber-300/40 animate-pulse' 
                : 'bg-emerald-400 hover:bg-emerald-300'
            }`}
            title="Listen to diagnosis audio"
            aria-label="Listen audio advice"
          >
            {isSpeaking ? (
              <VolumeX className="w-6 h-6 text-stone-950" />
            ) : (
              <Volume2 className="w-6 h-6 text-stone-950" />
            )}
          </button>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-300 flex items-center gap-1">
              <span>🎙️ Voice Recommendation</span>
              {isSpeaking && <span className="text-white font-normal">(Playing Audio...)</span>}
            </span>
            <p className="text-xs text-emerald-100 line-clamp-2">
              {result.voiceScript}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleVoice}
          className="w-full sm:w-auto text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl border border-emerald-600/70 whitespace-nowrap"
        >
          {isSpeaking ? t.stopVoice : t.listenVoice}
        </button>
      </div>

      {/* DYNAMIC LOCALIZED WEATHER ALERT (If upcoming rain in 24-48h) */}
      {result.weatherWarning && (
        <div id="dynamic-weather-alert" className="bg-sky-50 border-2 border-sky-400 rounded-2xl p-4 shadow-md flex items-start gap-3.5 animate-fadeIn">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow">
            <CloudRain className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-sky-900 uppercase tracking-wide">
                {t.weatherAlertTitle}
              </span>
              <span className="bg-sky-200 text-sky-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {result.weatherWarning.rainProbability}% Rain Forecast
              </span>
            </div>
            <p className="text-sm font-bold text-sky-950 leading-snug">
              {result.weatherWarning.alertText}
            </p>
            <p className="text-xs font-semibold text-sky-800">
              💡 {t.pauseWatering}
            </p>
          </div>
        </div>
      )}

      {/* --- TRAFFIC LIGHT CARD 1: FERTILIZER --- */}
      <div id="fertilizer-result-card" className={`rounded-2xl p-4 sm:p-5 shadow-md border ${getStatusBorderClass(result.fertilizerStatus)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <h3 className="text-base font-extrabold text-stone-900 uppercase tracking-tight">
              {t.fertilizer}
            </h3>
          </div>
          {renderStatusBadge(result.fertilizerStatus)}
        </div>

        <div className="mt-2 space-y-2">
          <h4 className="text-lg sm:text-xl font-black text-stone-950">
            {result.fertilizerTitle}
          </h4>
          <p className="text-sm font-medium text-stone-800 leading-relaxed bg-white/80 p-3 rounded-xl border border-stone-200/60">
            👉 <strong>Action:</strong> {result.fertilizerAction}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div className="bg-white/90 p-2.5 rounded-xl border border-stone-200 text-xs">
              <span className="text-[10px] font-bold uppercase text-stone-500 block mb-0.5">
                Yield Impact Hint
              </span>
              <span className="text-stone-900 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{result.yieldHint}</span>
              </span>
            </div>

            <div className="bg-white/90 p-2.5 rounded-xl border border-stone-200 text-xs">
              <span className="text-[10px] font-bold uppercase text-stone-500 block mb-0.5">
                Cost & Spending Hint
              </span>
              <span className="text-stone-900 font-semibold flex items-center gap-1">
                <PiggyBank className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>{result.costHint}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- TRAFFIC LIGHT CARD 2: WATER / MOISTURE --- */}
      <div id="water-result-card" className={`rounded-2xl p-4 sm:p-5 shadow-md border ${getStatusBorderClass(result.waterStatus)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center">
              <Droplet className="w-4 h-4 text-blue-200" />
            </div>
            <h3 className="text-base font-extrabold text-stone-900 uppercase tracking-tight">
              {t.water}
            </h3>
          </div>
          {renderStatusBadge(result.waterStatus)}
        </div>

        <div className="mt-2 space-y-2">
          <h4 className="text-lg sm:text-xl font-black text-stone-950">
            {result.waterTitle}
          </h4>
          <p className="text-sm font-medium text-stone-800 leading-relaxed bg-white/80 p-3 rounded-xl border border-stone-200/60">
            👉 <strong>Action:</strong> {result.waterAction}
          </p>
        </div>
      </div>

      {/* --- BACHAT (SAVINGS) CALCULATOR MODULE --- */}
      <div id="bachat-calculator-section" className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl p-4 sm:p-5 border-2 border-amber-300 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-sm">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-950">
                {t.bachatTitle}
              </h3>
              <p className="text-xs text-amber-900 font-medium">
                {t.bachatSubtitle}
              </p>
            </div>
          </div>

          <span className="text-xs font-black text-amber-800 bg-amber-200/80 px-2.5 py-1 rounded-full">
            ₹ Pocket Relief
          </span>
        </div>

        {/* Acreage adjustment slider */}
        <div className="bg-white/80 p-3 rounded-xl border border-amber-200/70 my-3">
          <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1.5">
            <span>Adjust Plot Size: <strong>{plotArea.toFixed(1)} {t.acres}</strong></span>
            <span className="text-stone-500">Live recalculation</span>
          </div>
          <input
            type="range"
            min="0.25"
            max="10"
            step="0.25"
            value={plotArea}
            onChange={(e) => setPlotArea(parseFloat(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
        </div>

        {/* Savings Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm">
            <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
              {t.ureaBags}
            </span>
            <span className="text-xl font-black text-emerald-700">
              {ureaBags > 0 ? `${ureaBags} Bags` : 'Optimal'}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm">
            <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
              {t.dapBags}
            </span>
            <span className="text-xl font-black text-emerald-700">
              {dapBags > 0 ? `${dapBags} Bags` : '0 Bags'}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm">
            <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
              {t.dieselHours}
            </span>
            <span className="text-xl font-black text-blue-700">
              {pumpHours > 0 ? `~${pumpHours} hrs` : '0 hrs'}
            </span>
          </div>

          <div className="bg-amber-500 text-stone-950 p-3 rounded-xl shadow-md border border-amber-600">
            <span className="text-[10px] font-extrabold uppercase block mb-1 text-stone-900">
              {t.totalSavings}
            </span>
            <span className="text-xl font-black">
              {result.bachat.currencySymbol}{cashSaved.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Captured Image Thumbnails & Measured Metrics */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-stone-600" />
          <span>Analyzed Field Frames & Signals</span>
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative rounded-xl overflow-hidden aspect-4/3 border border-stone-200 bg-stone-100">
            <img 
              src={diagnosis.soilPhotoUri} 
              alt="Soil sample" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-stone-950/80 text-white p-1.5 text-[11px] font-semibold flex items-center justify-between">
              <span>Soil Texture</span>
              <span className="capitalize text-emerald-300 font-bold">{metrics.soilMoistureLevel}</span>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden aspect-4/3 border border-stone-200 bg-stone-100">
            <img 
              src={diagnosis.cropPhotoUri} 
              alt="Crop row sample" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-stone-950/80 text-white p-1.5 text-[11px] font-semibold flex items-center justify-between">
              <span>Green Index</span>
              <span className="text-emerald-300 font-bold">{(metrics.cropGreennessIndex * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Helpful Rating Intercept */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs sm:text-sm font-bold text-stone-800">
          {t.helpfulQuestion}
        </span>
        <div className="flex items-center gap-2">
          <button
            id="rate-helpful-btn"
            onClick={() => handleRate('helpful')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              userRating === 'helpful'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Yes (काम आया)</span>
          </button>

          <button
            id="rate-unhelpful-btn"
            onClick={() => handleRate('unhelpful')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              userRating === 'unhelpful'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>No</span>
          </button>
        </div>
      </div>

      {/* Save Action */}
      <div className="pt-2">
        <button
          id="save-result-to-history-btn"
          onClick={handleSave}
          disabled={isSaved}
          className={`w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
            isSaved
              ? 'bg-stone-800 text-stone-200 cursor-default'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-98'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Saved in Plot History (सुरक्षित)</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5 text-emerald-200" />
              <span>{t.saveToHistory}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
