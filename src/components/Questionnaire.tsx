import React, { useState } from 'react';
import { 
  CloudRain, 
  FlaskConical, 
  Leaf, 
  Check, 
  X, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { LanguageCode, QuestionnaireAnswers } from '../types';
import { translations } from '../services/translations';

interface QuestionnaireProps {
  language: LanguageCode;
  onComplete: (answers: QuestionnaireAnswers) => void;
  onBack: () => void;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({
  language,
  onComplete,
  onBack
}) => {
  const t = translations[language];

  const [q1, setQ1] = useState<boolean | null>(null);
  const [q2, setQ2] = useState<boolean | null>(null);
  const [q3, setQ3] = useState<boolean | null>(null);

  const allAnswered = q1 !== null && q2 !== null && q3 !== null;

  const handleSubmit = () => {
    if (allAnswered) {
      onComplete({
        recentRain: q1!,
        recentFertilizer: q2!,
        visibleStress: q3!
      });
    }
  };

  return (
    <div id="field-questionnaire" className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            Step 3 of 3
          </span>
          <h2 className="text-lg font-bold text-white">
            {t.questionnaireTitle}
          </h2>
        </div>
        <button
          id="questionnaire-back-btn"
          onClick={onBack}
          className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-700/70 hover:bg-emerald-700 text-white transition-colors"
        >
          {t.cancel}
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* Q1: Rain / Irrigation */}
        <div id="q1-card" className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">
                Question 1 • Water Check
              </span>
              <p className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                {t.q1Rain}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              id="q1-yes-btn"
              type="button"
              onClick={() => setQ1(true)}
              className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                q1 === true
                  ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300'
                  : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100'
              }`}
            >
              <Check className="w-5 h-5" />
              <span>{t.yes}</span>
            </button>

            <button
              id="q1-no-btn"
              type="button"
              onClick={() => setQ1(false)}
              className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                q1 === false
                  ? 'bg-stone-800 text-white border-stone-900 shadow-md ring-2 ring-stone-400'
                  : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100'
              }`}
            >
              <X className="w-5 h-5" />
              <span>{t.no}</span>
            </button>
          </div>
        </div>

        {/* Q2: Fertilizer in last 2 weeks */}
        <div id="q2-card" className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 font-bold">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                Question 2 • Fertilizer History
              </span>
              <p className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                {t.q2Fertilizer}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              id="q2-yes-btn"
              type="button"
              onClick={() => setQ2(true)}
              className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                q2 === true
                  ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-300'
                  : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100'
              }`}
            >
              <Check className="w-5 h-5" />
              <span>{t.yes}</span>
            </button>

            <button
              id="q2-no-btn"
              type="button"
              onClick={() => setQ2(false)}
              className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                q2 === false
                  ? 'bg-stone-800 text-white border-stone-900 shadow-md ring-2 ring-stone-400'
                  : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100'
              }`}
            >
              <X className="w-5 h-5" />
              <span>{t.no}</span>
            </button>
          </div>
        </div>

        {/* Q3: Visible Crop Stress */}
        <div id="q3-card" className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-bold">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">
                Question 3 • Plant Observation
              </span>
              <p className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                {t.q3Stress}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              id="q3-yes-btn"
              type="button"
              onClick={() => setQ3(true)}
              className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                q3 === true
                  ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-300'
                  : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100'
              }`}
            >
              <Check className="w-5 h-5" />
              <span>{t.yes}</span>
            </button>

            <button
              id="q3-no-btn"
              type="button"
              onClick={() => setQ3(false)}
              className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                q3 === false
                  ? 'bg-stone-800 text-white border-stone-900 shadow-md ring-2 ring-stone-400'
                  : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100'
              }`}
            >
              <X className="w-5 h-5" />
              <span>{t.no}</span>
            </button>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            id="questionnaire-submit-btn"
            disabled={!allAnswered}
            onClick={handleSubmit}
            className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 transition-all ${
              allAnswered
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg active:scale-98 cursor-pointer'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <span>Generate Traffic-Light Advice</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
