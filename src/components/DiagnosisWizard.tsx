import React, { useState } from 'react';
import { 
  DiagnosisRecord, 
  LanguageCode, 
  Plot, 
  QuestionnaireAnswers, 
  WeatherData 
} from '../types';
import { translations } from '../services/translations';
import { CameraCapture } from './CameraCapture';
import { Questionnaire } from './Questionnaire';
import { ResultScreen } from './ResultScreen';
import { runOfflineImageAnalysis } from '../services/imageAnalysis';
import { evaluateFieldDiagnosis } from '../services/ruleEngine';
import { saveDiagnosis } from '../services/storage';
import { Sparkles, Cpu, CheckCircle } from 'lucide-react';

interface DiagnosisWizardProps {
  plot: Plot;
  language: LanguageCode;
  weather?: WeatherData;
  isOnline: boolean;
  onDone: () => void;
}

type Step = 'soil_photo' | 'crop_photo' | 'questionnaire' | 'analyzing' | 'result';

export const DiagnosisWizard: React.FC<DiagnosisWizardProps> = ({
  plot,
  language,
  weather,
  isOnline,
  onDone
}) => {
  const t = translations[language];

  const [currentStep, setCurrentStep] = useState<Step>('soil_photo');
  const [soilPhoto, setSoilPhoto] = useState<string | null>(null);
  const [cropPhoto, setCropPhoto] = useState<string | null>(null);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiagnosisRecord | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<string>('Reading pixel values...');

  // Step 1: Soil captured
  const handleSoilCaptured = (photoUri: string) => {
    setSoilPhoto(photoUri);
    setCurrentStep('crop_photo');
  };

  // Step 2: Crop captured
  const handleCropCaptured = (photoUri: string) => {
    setCropPhoto(photoUri);
    setCurrentStep('questionnaire');
  };

  // Step 3: Questionnaire answered -> Run analysis pipeline!
  const handleQuestionnaireCompleted = async (answers: QuestionnaireAnswers) => {
    if (!soilPhoto || !cropPhoto) return;

    setCurrentStep('analyzing');
    setAnalysisProgress('Scanning soil HSV brightness & surface cracks...');

    try {
      // 1. Run local on-device image analysis (100% offline)
      const metrics = await runOfflineImageAnalysis(soilPhoto, cropPhoto);
      setAnalysisProgress('Calculating crop canopy greenness index (G / R+G+B)...');

      // Small delay for smooth UX transition
      await new Promise(r => setTimeout(r, 600));
      setAnalysisProgress('Running agronomic decision tree & Bachat calculator...');

      // 2. Evaluate rules
      let result = evaluateFieldDiagnosis(
        metrics,
        answers,
        plot.cropType,
        plot.areaAcre,
        weather,
        language
      );

      // Optional online AI cloud check if online
      if (isOnline) {
        try {
          const aiRes = await fetch('/api/diagnose-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cropType: plot.cropType,
              answers,
              heuristics: {
                soilMoisture: metrics.soilMoistureLevel,
                greennessIndex: (metrics.cropGreennessIndex * 100).toFixed(0) + '%',
                canopyCoverage: metrics.cropCanopyCoverage + '%'
              },
              language
            })
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            if (aiData.success && aiData.analysis?.voiceScript) {
              result = {
                ...result,
                voiceScript: aiData.analysis.voiceScript,
                costHint: aiData.analysis.costHint || result.costHint,
                yieldHint: aiData.analysis.yieldHint || result.yieldHint
              };
            }
          }
        } catch (e) {
          console.log('Online AI audit skipped; using on-device rules:', e);
        }
      }

      // Create new diagnosis record
      const newRecord: DiagnosisRecord = {
        id: 'diag-' + Date.now(),
        plotId: plot.id,
        createdAt: new Date().toISOString(),
        soilPhotoUri: soilPhoto,
        cropPhotoUri: cropPhoto,
        answers,
        metrics,
        result,
        synced: false // will auto-sync when online
      };

      // Save locally to on-device storage immediately
      saveDiagnosis(newRecord);
      setCurrentDiagnosis(newRecord);
      setCurrentStep('result');
    } catch (err) {
      console.error('Diagnosis processing failed:', err);
      // Fallback result
      setCurrentStep('result');
    }
  };

  const handleSaveToHistory = (record: DiagnosisRecord) => {
    saveDiagnosis(record);
  };

  return (
    <div id="diagnosis-wizard-flow" className="w-full">
      {/* Step Progress Indicators */}
      {currentStep !== 'result' && (
        <div className="max-w-xl mx-auto mb-4 px-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-2">
            <span className={currentStep === 'soil_photo' ? 'text-emerald-700 font-extrabold' : ''}>
              1. Soil Close-up
            </span>
            <span className={currentStep === 'crop_photo' ? 'text-emerald-700 font-extrabold' : ''}>
              2. Crop Row
            </span>
            <span className={currentStep === 'questionnaire' ? 'text-emerald-700 font-extrabold' : ''}>
              3. 3 Questions
            </span>
          </div>
          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{
                width: currentStep === 'soil_photo' ? '33%' :
                       currentStep === 'crop_photo' ? '66%' :
                       currentStep === 'questionnaire' ? '90%' : '100%'
              }}
            />
          </div>
        </div>
      )}

      {/* Step 1: Soil Camera */}
      {currentStep === 'soil_photo' && (
        <CameraCapture
          type="soil"
          language={language}
          onPhotoCaptured={handleSoilCaptured}
          onCancel={onDone}
        />
      )}

      {/* Step 2: Crop Camera */}
      {currentStep === 'crop_photo' && (
        <CameraCapture
          type="crop"
          language={language}
          onPhotoCaptured={handleCropCaptured}
          onCancel={() => setCurrentStep('soil_photo')}
        />
      )}

      {/* Step 3: Questionnaire */}
      {currentStep === 'questionnaire' && (
        <Questionnaire
          language={language}
          onComplete={handleQuestionnaireCompleted}
          onBack={() => setCurrentStep('crop_photo')}
        />
      )}

      {/* Step 4: Analyzing State */}
      {currentStep === 'analyzing' && (
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 text-center shadow-xl border border-stone-200 space-y-4 my-8">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping opacity-50" />
            <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg animate-pulse">
              <Cpu className="w-10 h-10" />
            </div>
          </div>

          <h3 className="text-xl font-black text-stone-900">
            {t.analyzing}
          </h3>
          <p className="text-xs text-stone-600 font-medium">
            {t.analyzingSub}
          </p>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs font-mono text-emerald-800">
            {analysisProgress}
          </div>
        </div>
      )}

      {/* Step 5: Result Screen */}
      {currentStep === 'result' && currentDiagnosis && (
        <ResultScreen
          diagnosis={currentDiagnosis}
          plot={plot}
          language={language}
          onSaveToHistory={handleSaveToHistory}
          onDone={onDone}
        />
      )}
    </div>
  );
};
