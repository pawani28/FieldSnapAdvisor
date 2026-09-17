import { DiagnosisRecord, LanguageCode, Plot } from '../types';

const PLOTS_KEY = 'fieldsnap_plots_v1';
const DIAGNOSES_KEY = 'fieldsnap_diagnoses_v1';
const SETTINGS_KEY = 'fieldsnap_settings_v1';

export interface AppSettings {
  language: LanguageCode;
  onboarded: boolean;
  forcedOffline: boolean;
  activePlotId?: string;
}

// Sample field image SVG data URIs for instant testing & demo without requiring real camera in emulator
export const SAMPLE_SOIL_DRY = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#d4b483" />
  <path d="M20,40 Q80,120 120,60 T220,110 T350,70" stroke="#8d6e40" stroke-width="4" fill="none" opacity="0.7"/>
  <path d="M50,180 Q130,220 180,160 T310,240" stroke="#7a5829" stroke-width="5" fill="none" opacity="0.6"/>
  <path d="M140,80 L190,170 M230,120 L270,180" stroke="#8d6e40" stroke-width="3" fill="none" opacity="0.7"/>
  <circle cx="90" cy="140" r="15" fill="#c49f6b" opacity="0.8"/>
  <circle cx="280" cy="90" r="22" fill="#c49f6b" opacity="0.8"/>
  <text x="20" y="280" fill="#4a371c" font-family="sans-serif" font-size="14" font-weight="bold">DRY CRACKED SOIL SAMPLE (Light, Moisture: Deficit)</text>
</svg>`);

export const SAMPLE_SOIL_MOIST = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#4a3728" />
  <ellipse cx="140" cy="110" rx="90" ry="60" fill="#3b2b1e" opacity="0.6"/>
  <ellipse cx="290" cy="180" rx="80" ry="50" fill="#2d2116" opacity="0.7"/>
  <circle cx="80" cy="220" r="30" fill="#36281c" opacity="0.5"/>
  <circle cx="240" cy="80" r="25" fill="#3a2a1c" opacity="0.6"/>
  <text x="20" y="280" fill="#e2cbb2" font-family="sans-serif" font-size="14" font-weight="bold">RICH MOIST LOAM SAMPLE (Dark, Moisture: Good)</text>
</svg>`);

export const SAMPLE_CROP_YELLOW = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#6d583b" />
  <!-- Crop Row: Yellowing, Chlorosis -->
  <path d="M120,290 Q140,160 110,60" stroke="#bfa632" stroke-width="14" stroke-linecap="round" fill="none"/>
  <path d="M130,190 Q60,150 40,140" stroke="#d4c038" stroke-width="10" stroke-linecap="round" fill="none"/>
  <path d="M130,130 Q210,100 230,80" stroke="#c9b334" stroke-width="9" stroke-linecap="round" fill="none"/>
  
  <path d="M260,290 Q270,170 250,70" stroke="#a19b3a" stroke-width="12" stroke-linecap="round" fill="none"/>
  <path d="M260,180 Q330,140 350,120" stroke="#d1c447" stroke-width="9" stroke-linecap="round" fill="none"/>
  <path d="M260,120 Q190,100 180,80" stroke="#8c912e" stroke-width="8" stroke-linecap="round" fill="none"/>
  <text x="20" y="280" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold">MAIZE: NITROGEN DEFICIENCY (Yellow Chlorosis)</text>
</svg>`);

export const SAMPLE_CROP_LUSH = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#36291a" />
  <!-- Vibrant Healthy Green Canopy -->
  <path d="M110,290 Q120,150 90,50" stroke="#2e7d32" stroke-width="16" stroke-linecap="round" fill="none"/>
  <path d="M110,180 Q30,140 10,120" stroke="#388e3c" stroke-width="14" stroke-linecap="round" fill="none"/>
  <path d="M110,130 Q190,90 220,70" stroke="#2e7d32" stroke-width="12" stroke-linecap="round" fill="none"/>
  
  <path d="M240,290 Q250,140 230,40" stroke="#1b5e20" stroke-width="18" stroke-linecap="round" fill="none"/>
  <path d="M240,190 Q320,150 360,130" stroke="#2e7d32" stroke-width="15" stroke-linecap="round" fill="none"/>
  <path d="M240,120 Q160,80 140,60" stroke="#43a047" stroke-width="14" stroke-linecap="round" fill="none"/>
  <path d="M250,70 Q310,40 340,30" stroke="#4caf50" stroke-width="12" stroke-linecap="round" fill="none"/>
  <text x="20" y="280" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold">HEALTHY CANOPY (High Greenness, Optimal Nitrogen)</text>
</svg>`);

// Default Initial Seed Plots
const DEFAULT_PLOTS: Plot[] = [
  {
    id: 'plot-1',
    name: 'Canal Road Field (नहर वाला खेत)',
    cropType: 'Maize',
    areaAcre: 1.5,
    locationName: 'North Canal Block',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    seasonOutcome: {
      yieldRating: 'Good',
      approxYieldKg: 2800,
      notes: 'Followed green recommendation, avoided 2 bags urea overdosing.',
      recordedAt: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  },
  {
    id: 'plot-2',
    name: 'Well Plot (कुएं वाला खेत)',
    cropType: 'Wheat',
    areaAcre: 2.0,
    locationName: 'Village East Well',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

const DEFAULT_DIAGNOSES: DiagnosisRecord[] = [
  {
    id: 'diag-seed-1',
    plotId: 'plot-1',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    soilPhotoUri: SAMPLE_SOIL_MOIST,
    cropPhotoUri: SAMPLE_CROP_LUSH,
    answers: {
      recentRain: true,
      recentFertilizer: false,
      visibleStress: false
    },
    metrics: {
      soilBrightness: 32,
      soilHue: 32,
      soilTextureVariance: 11,
      soilMoistureLevel: 'moist',
      cropGreennessIndex: 0.46,
      cropChlorosisRatio: 0.04,
      cropCanopyCoverage: 84
    },
    result: {
      fertilizerStatus: 'green',
      fertilizerTitle: 'Good fertilizer balance',
      fertilizerAction: 'Canopy greenness index is optimal. Maintain current schedule without extra purchases.',
      waterStatus: 'green',
      waterTitle: 'Good moisture balance',
      waterAction: 'Soil profile has adequate moisture. Keep pumps off to save fuel.',
      costHint: 'No additional fertilizer purchase needed this week.',
      yieldHint: 'You are on track to protect full projected harvest yield.',
      bachat: {
        ureaBagsSaved: 2,
        dapBagsSaved: 0,
        pumpingHoursSaved: 4,
        estimatedCashSaved: 1040,
        currencySymbol: '₹'
      },
      voiceScript: 'FieldSnap check: Fertilizer is Green and balanced. Water is Green. Keep current practice!'
    },
    userRating: 'helpful',
    synced: true
  }
];

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return {
    language: 'en',
    onboarded: false,
    forcedOffline: false,
    activePlotId: 'plot-1'
  };
}

export function saveStoredSettings(settings: Partial<AppSettings>) {
  const current = getStoredSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
  return updated;
}

export function getStoredPlots(): Plot[] {
  try {
    const raw = localStorage.getItem(PLOTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  // Initialize with seeds
  saveStoredPlots(DEFAULT_PLOTS);
  return DEFAULT_PLOTS;
}

export function saveStoredPlots(plots: Plot[]) {
  try {
    localStorage.setItem(PLOTS_KEY, JSON.stringify(plots));
  } catch (e) {
    console.error(e);
  }
}

export function addStoredPlot(plot: Omit<Plot, 'id' | 'createdAt' | 'updatedAt'>): Plot {
  const plots = getStoredPlots();
  const newPlot: Plot = {
    ...plot,
    id: 'plot-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  plots.unshift(newPlot);
  saveStoredPlots(plots);
  return newPlot;
}

export function updateStoredPlot(id: string, updates: Partial<Plot>): Plot | null {
  const plots = getStoredPlots();
  const idx = plots.findIndex(p => p.id === id);
  if (idx === -1) return null;
  plots[idx] = {
    ...plots[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveStoredPlots(plots);
  return plots[idx];
}

export function getStoredDiagnoses(plotId?: string): DiagnosisRecord[] {
  try {
    const raw = localStorage.getItem(DIAGNOSES_KEY);
    const all: DiagnosisRecord[] = raw ? JSON.parse(raw) : DEFAULT_DIAGNOSES;
    if (plotId) {
      return all.filter(d => d.plotId === plotId);
    }
    return all;
  } catch (e) {
    console.error(e);
    return DEFAULT_DIAGNOSES;
  }
}

export function saveDiagnosis(diagnosis: DiagnosisRecord) {
  try {
    const raw = localStorage.getItem(DIAGNOSES_KEY);
    const all: DiagnosisRecord[] = raw ? JSON.parse(raw) : [...DEFAULT_DIAGNOSES];
    all.unshift(diagnosis);
    localStorage.setItem(DIAGNOSES_KEY, JSON.stringify(all));
  } catch (e) {
    console.error(e);
  }
}

export function updateDiagnosisRating(id: string, rating: 'helpful' | 'neutral' | 'unhelpful') {
  try {
    const raw = localStorage.getItem(DIAGNOSES_KEY);
    if (!raw) return;
    const all: DiagnosisRecord[] = JSON.parse(raw);
    const target = all.find(d => d.id === id);
    if (target) {
      target.userRating = rating;
      localStorage.setItem(DIAGNOSES_KEY, JSON.stringify(all));
    }
  } catch (e) {
    console.error(e);
  }
}

export function getUnsyncedCount(): number {
  const all = getStoredDiagnoses();
  return all.filter(d => !d.synced).length;
}

export async function syncOfflineRecords(): Promise<number> {
  const all = getStoredDiagnoses();
  const unsynced = all.filter(d => !d.synced);
  if (unsynced.length === 0) return 0;

  try {
    const plots = getStoredPlots();
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        diagnoses: unsynced.map(d => ({ ...d, soilPhotoUri: '[compressed_field_photo]', cropPhotoUri: '[compressed_crop_photo]' })),
        plots
      })
    });

    if (res.ok) {
      const updated = all.map(d => ({ ...d, synced: true }));
      localStorage.setItem(DIAGNOSES_KEY, JSON.stringify(updated));
      return unsynced.length;
    }
  } catch (err) {
    console.log('Background sync waiting for network:', err);
  }
  return 0;
}
