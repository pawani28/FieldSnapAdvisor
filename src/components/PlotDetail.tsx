import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Award, 
  ArrowLeft, 
  Clock, 
  TrendingUp, 
  PiggyBank, 
  Eye, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Volume2
} from 'lucide-react';
import { 
  CropType, 
  DiagnosisRecord, 
  LanguageCode, 
  Plot, 
  StatusColor, 
  WeatherData 
} from '../types';
import { translations } from '../services/translations';
import { getStoredDiagnoses, updateStoredPlot } from '../services/storage';
import { speechService } from '../services/speech';

interface PlotDetailProps {
  plot: Plot;
  language: LanguageCode;
  weather?: WeatherData;
  onBack: () => void;
  onStartNewCheck: () => void;
  onSelectDiagnosis: (diagnosis: DiagnosisRecord) => void;
  onPlotUpdated: (updated: Plot) => void;
}

export const PlotDetail: React.FC<PlotDetailProps> = ({
  plot,
  language,
  weather,
  onBack,
  onStartNewCheck,
  onSelectDiagnosis,
  onPlotUpdated
}) => {
  const t = translations[language];
  const diagnoses = getStoredDiagnoses(plot.id);

  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
  const [outcomeRating, setOutcomeRating] = useState<'Good' | 'Average' | 'Poor'>(
    plot.seasonOutcome?.yieldRating || 'Good'
  );
  const [approxYield, setApproxYield] = useState<string>(
    plot.seasonOutcome?.approxYieldKg ? String(plot.seasonOutcome.approxYieldKg) : ''
  );
  const [outcomeNotes, setOutcomeNotes] = useState<string>(
    plot.seasonOutcome?.notes || ''
  );
  const [outcomeSaved, setOutcomeSaved] = useState(false);

  const handleSaveOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateStoredPlot(plot.id, {
      seasonOutcome: {
        yieldRating: outcomeRating,
        approxYieldKg: approxYield ? Number(approxYield) : undefined,
        notes: outcomeNotes,
        recordedAt: new Date().toISOString()
      }
    });

    if (updated) {
      onPlotUpdated(updated);
      setOutcomeSaved(true);
      setTimeout(() => setOutcomeSaved(false), 2500);
    }
  };

  const renderBadge = (status: StatusColor) => {
    switch (status) {
      case 'red':
        return <span className="px-2 py-0.5 rounded text-[11px] font-black bg-[#D32F2F] text-white">RED</span>;
      case 'yellow':
        return <span className="px-2 py-0.5 rounded text-[11px] font-black bg-[#FBC02D] text-stone-900">YELLOW</span>;
      case 'green':
        return <span className="px-2 py-0.5 rounded text-[11px] font-black bg-[#388E3C] text-white">GREEN</span>;
    }
  };

  return (
    <div id="plot-detail-view" className="max-w-3xl mx-auto space-y-4 pb-12">
      {/* Header bar with Back button */}
      <div className="flex items-center justify-between">
        <button
          id="plot-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.myPlots}</span>
        </button>

        <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{plot.locationName}</span>
        </span>
      </div>

      {/* Plot Hero Card */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {plot.cropType}
            </span>
            <span className="text-xs font-bold text-stone-600">
              {plot.areaAcre} {t.acres}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            {plot.name}
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Registered: {new Date(plot.createdAt).toLocaleDateString()} • {diagnoses.length} Diagnoses recorded
          </p>
        </div>

        <button
          id="detail-new-check-btn"
          onClick={onStartNewCheck}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-sm font-black px-5 py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>{t.newCheck}</span>
        </button>
      </div>

      {/* End of Season Outcome Logger / Accordion */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setIsOutcomeOpen(!isOutcomeOpen)}
          className="w-full px-5 py-3.5 flex items-center justify-between bg-stone-50 hover:bg-stone-100/80 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <div>
              <span className="text-xs sm:text-sm font-black text-stone-900 block">
                {t.outcomeTitle}
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                {plot.seasonOutcome 
                  ? `Logged: ${plot.seasonOutcome.yieldRating} Harvest (${plot.seasonOutcome.approxYieldKg || 0} kg)` 
                  : 'Track your seasonal learning: Was harvest good or bad?'}
              </span>
            </div>
          </div>
          {isOutcomeOpen ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
        </button>

        {isOutcomeOpen && (
          <form onSubmit={handleSaveOutcome} className="p-5 border-t border-stone-100 space-y-3.5 bg-white">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Harvest Quality
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'Good', label: t.goodHarvest, color: 'bg-emerald-600' },
                  { value: 'Average', label: t.averageHarvest, color: 'bg-amber-600' },
                  { value: 'Poor', label: t.poorHarvest, color: 'bg-rose-600' }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setOutcomeRating(item.value as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      outcomeRating === item.value
                        ? `${item.color} text-white border-transparent shadow`
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Approximate Yield (kg or bags)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2400"
                  value={approxYield}
                  onChange={(e) => setApproxYield(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Seasonal Learning Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Saved 2 bags urea, yield stayed high"
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {outcomeSaved && (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>Harvest Outcome Saved!</span>
                </span>
              )}
              <div className="ml-auto">
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow"
                >
                  Save Season Outcome
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* History Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-700" />
            <span>{t.historyTitle}</span>
          </h3>
          <span className="text-xs font-semibold text-stone-500">
            {diagnoses.length} Records
          </span>
        </div>

        {diagnoses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-stone-300">
            <p className="text-xs sm:text-sm text-stone-600 font-medium mb-3">
              {t.noHistory}
            </p>
            <button
              onClick={onStartNewCheck}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow"
            >
              {t.newCheck}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {diagnoses.map((record) => (
              <div
                key={record.id}
                id={`history-item-${record.id}`}
                onClick={() => onSelectDiagnosis(record)}
                className="bg-white rounded-2xl p-4 border border-stone-200 hover:border-emerald-500/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                {/* Thumbnails */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-4">
                    <img 
                      src={record.soilPhotoUri} 
                      alt="Soil thumb" 
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                    />
                    <img 
                      src={record.cropPhotoUri} 
                      alt="Crop thumb" 
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-stone-900">
                        {new Date(record.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {record.synced ? (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                          Synced
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
                          Cached On-Device
                        </span>
                      )}
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-700">
                        <span>Fert:</span>
                        {renderBadge(record.result.fertilizerStatus)}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-700">
                        <span>Water:</span>
                        {renderBadge(record.result.waterStatus)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hints / Pocket savings preview */}
                <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-xs">
                    <span className="text-emerald-700 font-extrabold flex items-center sm:justify-end gap-1">
                      <PiggyBank className="w-3.5 h-3.5 text-amber-600" />
                      <span>Saved: {record.result.bachat.currencySymbol}{record.result.bachat.estimatedCashSaved}</span>
                    </span>
                    <span className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">
                      {record.result.costHint}
                    </span>
                  </div>

                  <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">View</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
