import React, { useState } from 'react';
import { 
  PiggyBank, 
  X, 
  Sparkles, 
  Droplet, 
  TrendingUp, 
  ShieldCheck, 
  Fuel 
} from 'lucide-react';
import { CropType, LanguageCode } from '../types';
import { translations } from '../services/translations';

interface BachatCalculatorModalProps {
  language: LanguageCode;
  onClose: () => void;
}

export const BachatCalculatorModal: React.FC<BachatCalculatorModalProps> = ({
  language,
  onClose
}) => {
  const t = translations[language];

  const [crop, setCrop] = useState<CropType>('Maize');
  const [acres, setAcres] = useState<number>(1.5);
  const [overdoseLevel, setOverdoseLevel] = useState<'mild' | 'heavy'>('mild');
  const [usesDieselPump, setUsesDieselPump] = useState<boolean>(true);

  // Fertilizer costs: Urea 45kg bag ~₹280, DAP 50kg bag ~₹1,350, Diesel ~₹120/hr pump
  const ureaPerAcre = overdoseLevel === 'heavy' ? 2 : 1;
  const dapPerAcre = overdoseLevel === 'heavy' ? 0.75 : 0.25;
  const pumpHoursPerAcre = usesDieselPump ? 4 : 2;

  const totalUreaBags = Math.round(ureaPerAcre * acres);
  const totalDapBags = Math.round(dapPerAcre * acres);
  const totalPumpHours = Math.round(pumpHoursPerAcre * acres);

  const ureaCash = totalUreaBags * 280;
  const dapCash = totalDapBags * 1350;
  const pumpCash = totalPumpHours * (usesDieselPump ? 120 : 40);

  const grandTotalCash = ureaCash + dapCash + pumpCash;

  return (
    <div id="bachat-modal" className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-200 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-stone-950 text-amber-300 flex items-center justify-center font-black shadow-inner">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black leading-tight">
                {t.bachatTitle}
              </h3>
              <p className="text-xs text-stone-900 font-semibold">
                Direct cash kept in the farmer's pocket
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-950/10 hover:bg-stone-950/20 text-stone-950 flex items-center justify-center font-bold text-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Crop & Acres Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Crop
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value as CropType)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 bg-stone-50"
              >
                <option value="Maize">Maize (मक्का)</option>
                <option value="Wheat">Wheat (गेहूँ)</option>
                <option value="Rice / Paddy">Rice / Paddy (धान)</option>
                <option value="Cotton">Cotton (कपास)</option>
                <option value="Sugarcane">Sugarcane (गन्ना)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Acreage ({acres.toFixed(1)} {t.acres})
              </label>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={acres}
                onChange={(e) => setAcres(parseFloat(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer mt-2"
              />
            </div>
          </div>

          {/* Over-application scenario */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            <span className="text-xs font-bold text-stone-800 block mb-2">
              Habitual Dealer Over-Recommendation
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOverdoseLevel('mild')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  overdoseLevel === 'mild'
                    ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200'
                }`}
              >
                Mild (1 Extra Bag/Acre)
              </button>
              <button
                type="button"
                onClick={() => setOverdoseLevel('heavy')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  overdoseLevel === 'heavy'
                    ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200'
                }`}
              >
                Heavy (2+ Extra Bags)
              </button>
            </div>
          </div>

          {/* Diesel tube-well toggle */}
          <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2">
              <Fuel className="w-5 h-5 text-blue-700" />
              <div>
                <span className="text-xs font-bold text-blue-950 block">
                  Diesel Tube-well Pumping
                </span>
                <span className="text-[11px] text-blue-800">
                  Avoid watering before forecasted village rain
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={usesDieselPump}
              onChange={(e) => setUsesDieselPump(e.target.checked)}
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Pocket Savings Result Box */}
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-5 rounded-2xl shadow-xl space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Calculated Net Pocket Savings</span>
            </span>

            <div className="text-3xl sm:text-4xl font-black text-amber-300">
              ₹{grandTotalCash.toLocaleString()}
            </div>

            <p className="text-xs text-emerald-100 font-medium">
              By following FieldSnap Advisor's green threshold instead of dealer over-prescription:
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-700/60 text-center">
              <div className="bg-emerald-900/80 p-2 rounded-xl border border-emerald-700">
                <span className="text-[10px] text-emerald-300 uppercase block">Urea Bags</span>
                <span className="text-base font-black">{totalUreaBags} Bags</span>
                <span className="text-[10px] text-emerald-200 block">₹{ureaCash}</span>
              </div>

              <div className="bg-emerald-900/80 p-2 rounded-xl border border-emerald-700">
                <span className="text-[10px] text-emerald-300 uppercase block">DAP Bags</span>
                <span className="text-base font-black">{totalDapBags} Bags</span>
                <span className="text-[10px] text-emerald-200 block">₹{dapCash}</span>
              </div>

              <div className="bg-emerald-900/80 p-2 rounded-xl border border-emerald-700">
                <span className="text-[10px] text-emerald-300 uppercase block">Diesel Run</span>
                <span className="text-base font-black">~{totalPumpHours} hrs</span>
                <span className="text-[10px] text-emerald-200 block">₹{pumpCash}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-200 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Protects soil from long-term salinity, chemical runoff, and stalk lodging!</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-black py-3 rounded-xl shadow"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
