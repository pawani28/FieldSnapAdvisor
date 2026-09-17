import React, { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  Award,
  Layers
} from 'lucide-react';
import { CropType, LanguageCode, Plot } from '../types';
import { translations } from '../services/translations';
import { getStoredDiagnoses } from '../services/storage';

interface PlotListProps {
  plots: Plot[];
  language: LanguageCode;
  onSelectPlot: (plot: Plot) => void;
  onStartCheck: (plot: Plot) => void;
  onAddPlot: (plot: Omit<Plot, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const CROP_OPTIONS: CropType[] = [
  'Maize',
  'Rice / Paddy',
  'Wheat',
  'Cotton',
  'Soybean',
  'Sugarcane',
  'Vegetables'
];

export const PlotList: React.FC<PlotListProps> = ({
  plots,
  language,
  onSelectPlot,
  onStartCheck,
  onAddPlot
}) => {
  const t = translations[language];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState<CropType>('Maize');
  const [areaAcre, setAreaAcre] = useState(1.0);
  const [locationName, setLocationName] = useState('Village Sector');

  const handleCreatePlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddPlot({
      name: name.trim(),
      cropType,
      areaAcre: Number(areaAcre) || 1.0,
      locationName: locationName.trim() || 'Village Sector'
    });

    setName('');
    setIsAddModalOpen(false);
  };

  const handleApplyPreset = (presetName: string) => {
    setName(presetName);
  };

  return (
    <div id="plot-list-container" className="max-w-3xl mx-auto space-y-4">
      {/* Header with Add Plot button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {t.myPlots}
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Manage your fields and seasonal crop records
          </p>
        </div>

        <button
          id="add-plot-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addPlot}</span>
        </button>
      </div>

      {/* Plot cards list */}
      <div className="space-y-3">
        {plots.map((plot) => {
          const plotDiagnoses = getStoredDiagnoses(plot.id);
          const latestDiagnosis = plotDiagnoses[0];

          return (
            <div
              key={plot.id}
              id={`plot-card-${plot.id}`}
              className="bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-500/70 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Plot info */}
              <div 
                className="cursor-pointer flex-1"
                onClick={() => onSelectPlot(plot)}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {plot.cropType}
                  </span>
                  <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{plot.locationName}</span>
                  </span>
                  <span className="text-xs font-semibold text-stone-500">
                    • {plot.areaAcre} {t.acres}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-stone-900 group-hover:text-emerald-700">
                  {plot.name}
                </h3>

                {/* Latest Check Summary or Outcome */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-600">
                  {latestDiagnosis ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Last: {new Date(latestDiagnosis.createdAt).toLocaleDateString()}</span>
                      </span>

                      {/* Mini Traffic Lights */}
                      <span className="flex items-center gap-1 text-[11px] font-bold">
                        <span>Fertilizer:</span>
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          latestDiagnosis.result.fertilizerStatus === 'green' ? 'bg-[#388E3C]' :
                          latestDiagnosis.result.fertilizerStatus === 'yellow' ? 'bg-[#FBC02D]' : 'bg-[#D32F2F]'
                        }`} />
                      </span>

                      <span className="flex items-center gap-1 text-[11px] font-bold">
                        <span>Water:</span>
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          latestDiagnosis.result.waterStatus === 'green' ? 'bg-[#388E3C]' :
                          latestDiagnosis.result.waterStatus === 'yellow' ? 'bg-[#FBC02D]' : 'bg-[#D32F2F]'
                        }`} />
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                      No diagnosis yet • Ready for first check
                    </span>
                  )}

                  {plot.seasonOutcome && (
                    <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-600" />
                      <span>Outcome: {plot.seasonOutcome.yieldRating} Harvest</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <button
                  id={`start-check-plot-${plot.id}`}
                  onClick={() => onStartCheck(plot)}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>{t.newCheck}</span>
                </button>

                <button
                  onClick={() => onSelectPlot(plot)}
                  className="p-2.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
                  title="View plot history"
                  aria-label="View history"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Plot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-lg font-black text-stone-900">
                {t.addPlot}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlot} className="space-y-3.5">
              {/* Quick Presets */}
              <div>
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Quick Name Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Field 1 (खेत 1)', 'Back Field', 'Canal Road', 'Well Plot', 'Roadside'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="text-xs bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 px-2.5 py-1 rounded-lg border border-stone-200"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  {t.plotName}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Back Field - Maize"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Crop Type */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  {t.crop}
                </label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value as CropType)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {CROP_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Area & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {t.plotArea} ({t.acres})
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.1"
                    max="100"
                    value={areaAcre}
                    onChange={(e) => setAreaAcre(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Village / Sector
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
