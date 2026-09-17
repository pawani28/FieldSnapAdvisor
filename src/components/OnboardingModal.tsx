import React, { useState } from 'react';
import { 
  Camera, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Globe, 
  Sparkles, 
  PiggyBank, 
  CloudRain 
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../services/translations';

interface OnboardingModalProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  language,
  onLanguageChange,
  onComplete
}) => {
  const [step, setStep] = useState<number>(1);
  const t = translations[language];

  return (
    <div id="onboarding-modal" className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col">
        {/* Header with language picker */}
        <div className="bg-emerald-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-sm font-black tracking-tight">{t.appName}</span>
          </div>

          <div className="flex items-center gap-1 bg-emerald-800 px-2 py-1 rounded-lg border border-emerald-700">
            <Globe className="w-3.5 h-3.5 text-emerald-300" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              aria-label="Language selection"
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="en" className="text-stone-900">English</option>
              <option value="hi" className="text-stone-900">हिन्दी (Hindi)</option>
              <option value="ur" className="text-stone-900">اردو (Urdu)</option>
              <option value="sw" className="text-stone-900">Swahili</option>
              <option value="es" className="text-stone-900">Español</option>
            </select>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 text-center space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner">
                <Camera className="w-10 h-10" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                Step 1 of 3
              </span>
              <h3 className="text-xl font-black text-stone-900">
                1. Snap 2 Field Photos
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xs mx-auto">
                Take one close-up photo of the <strong>soil</strong> (30–50 cm away) and one along the <strong>crop row</strong>. Works 100% offline!
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shadow-inner">
                <HelpCircle className="w-10 h-10" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-700">
                Step 2 of 3
              </span>
              <h3 className="text-xl font-black text-stone-900">
                2. Answer 3 Simple Questions
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xs mx-auto">
                Tap large <strong>YES / NO</strong> buttons: recent rain, fertilizer history, and visible plant stress. No complicated typing needed.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-inner">
                <PiggyBank className="w-10 h-10 text-amber-700" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-700">
                Step 3 of 3
              </span>
              <h3 className="text-xl font-black text-stone-900">
                3. Clear Traffic Lights & Bachat
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xs mx-auto">
                Get clear <strong>Red / Yellow / Green</strong> advice, immediate cash savings from skipping excess fertilizer, voice audio readout, and village weather alerts!
              </p>
            </div>
          )}

          {/* Dots progress indicator */}
          <div className="flex justify-center items-center gap-1.5 pt-2">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  step === i ? 'w-6 bg-emerald-700' : 'w-2 bg-stone-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs font-bold text-stone-600 hover:text-stone-900 px-3 py-2 rounded-xl"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="text-xs font-semibold text-stone-400 hover:text-stone-700 px-3 py-2"
            >
              Skip
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span>Get Started</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
