export type StatusColor = 'red' | 'yellow' | 'green';

export type CropType = 'Maize' | 'Rice / Paddy' | 'Wheat' | 'Cotton' | 'Soybean' | 'Sugarcane' | 'Vegetables';

export type LanguageCode = 'en' | 'hi' | 'ur' | 'sw' | 'es';

export interface QuestionnaireAnswers {
  recentRain: boolean;        // Rain/irrigation in last 3 days
  recentFertilizer: boolean;  // Fertilizer in last 2 weeks
  visibleStress: boolean;     // Yellow/stunted leaves visible
}

export interface ImageAnalysisMetrics {
  soilBrightness: number;       // 0 to 100
  soilHue: number;              // 0 to 360
  soilTextureVariance: number;  // Crack / surface roughness metric
  soilMoistureLevel: 'dry' | 'moist' | 'wet';
  cropGreennessIndex: number;   // 0 to 1 (green / total)
  cropChlorosisRatio: number;   // 0 to 1 (% yellow/pale)
  cropCanopyCoverage: number;   // 0 to 100%
}

export interface RecommendationResult {
  fertilizerStatus: StatusColor;
  fertilizerTitle: string;
  fertilizerAction: string;
  waterStatus: StatusColor;
  waterTitle: string;
  waterAction: string;
  costHint: string;
  yieldHint: string;
  bachat: {
    ureaBagsSaved: number;
    dapBagsSaved: number;
    pumpingHoursSaved: number;
    estimatedCashSaved: number; // in local currency units
    currencySymbol: string;
  };
  weatherWarning?: {
    hasHeavyRainRisk: boolean;
    rainProbability: number;
    predictedMm: number;
    alertText: string;
  };
  voiceScript: string;
}

export interface DiagnosisRecord {
  id: string;
  plotId: string;
  createdAt: string;
  soilPhotoUri: string;
  cropPhotoUri: string;
  answers: QuestionnaireAnswers;
  metrics: ImageAnalysisMetrics;
  result: RecommendationResult;
  userRating?: 'helpful' | 'neutral' | 'unhelpful';
  synced: boolean;
}

export interface Plot {
  id: string;
  name: string;
  cropType: CropType;
  areaAcre: number;
  locationName: string;
  createdAt: string;
  updatedAt: string;
  seasonOutcome?: {
    yieldRating: 'Good' | 'Average' | 'Poor';
    approxYieldKg?: number;
    notes?: string;
    recordedAt: string;
  };
}

export interface WeatherData {
  tempC: number;
  humidity: number;
  rainExpectedNext48h: boolean;
  rainProbabilityMax: number;
  rainSumMm: number;
  forecastDay1Rain: number;
  forecastDay2Rain: number;
  summary: string;
  location: string;
}
