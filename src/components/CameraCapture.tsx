import React, { useRef, useState, useEffect } from 'react';
import { 
  Camera, 
  RefreshCw, 
  Upload, 
  Check, 
  RotateCcw, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../services/translations';
import { 
  SAMPLE_SOIL_DRY, 
  SAMPLE_SOIL_MOIST, 
  SAMPLE_CROP_YELLOW, 
  SAMPLE_CROP_LUSH 
} from '../services/storage';

interface CameraCaptureProps {
  type: 'soil' | 'crop';
  language: LanguageCode;
  onPhotoCaptured: (photoUri: string) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  type,
  language,
  onPhotoCaptured,
  onCancel
}) => {
  const t = translations[language];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Start live camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      try {
        setCameraError(null);
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(e => console.warn('Video play error:', e));
        }
      } catch (err: any) {
        console.warn('Camera access error:', err);
        setCameraError('Camera access not granted or not available on this device. You can upload a photo or pick a sample field photo below.');
      }
    }

    if (!previewPhoto) {
      startCamera();
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, previewPhoto]);

  // Flip camera between front & rear
  const handleToggleFacing = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Capture current video frame to canvas
  const handleSnap = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPreviewPhoto(dataUrl);
      }
    } catch (err) {
      console.error('Snap error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  // File upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Pre-loaded sample photo pick
  const handlePickSample = (sampleUri: string) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setPreviewPhoto(sampleUri);
  };

  const handleRetake = () => {
    setPreviewPhoto(null);
  };

  const handleConfirm = () => {
    if (previewPhoto) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      onPhotoCaptured(previewPhoto);
    }
  };

  const isSoil = type === 'soil';

  return (
    <div id={`camera-capture-${type}`} className="bg-stone-900 text-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-w-xl mx-auto border border-stone-700">
      {/* Header bar */}
      <div className="bg-stone-800/90 px-4 py-3 flex items-center justify-between border-b border-stone-700">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
            {isSoil ? 'Step 1 of 3' : 'Step 2 of 3'}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            {isSoil ? t.takeSoilPhoto : t.takeCropPhoto}
          </h2>
        </div>
        <button
          id="camera-cancel-btn"
          onClick={onCancel}
          className="text-stone-400 hover:text-white text-xs font-semibold px-2.5 py-1 rounded bg-stone-700/50 hover:bg-stone-700"
        >
          {t.cancel}
        </button>
      </div>

      {/* Guide instruction banner */}
      <div className="bg-emerald-950/70 text-emerald-200 px-4 py-2 text-xs flex items-center gap-2 border-b border-emerald-900/40">
        <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <p className="font-medium">
          {isSoil ? t.soilPhotoPrompt : t.cropPhotoPrompt}
        </p>
      </div>

      {/* Viewfinder area */}
      <div className="relative aspect-4/3 w-full bg-black flex items-center justify-center overflow-hidden">
        {previewPhoto ? (
          // Photo Preview State
          <div className="relative w-full h-full">
            <img 
              src={previewPhoto} 
              alt="Field preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-black/70 text-white text-[11px] font-bold px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSoil ? 'Soil Frame Captured' : 'Crop Row Captured'}</span>
            </div>
          </div>
        ) : (
          // Live Camera Stream
          <>
            {cameraError ? (
              <div className="p-6 text-center max-w-sm text-stone-300 flex flex-col items-center">
                <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                <p className="text-xs mb-4 text-stone-300 leading-relaxed">{cameraError}</p>
                <button
                  id="camera-error-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo from Device</span>
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />
            )}

            {/* Viewfinder Alignment Reticles */}
            {!cameraError && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {isSoil ? (
                  // Soil 30-50cm close-up circle target
                  <div className="relative w-52 h-52 sm:w-64 sm:h-64 border-2 border-emerald-400/70 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 border-t-2 border-l-2 border-emerald-400 absolute top-2 left-2" />
                    <div className="w-3 h-3 border-t-2 border-r-2 border-emerald-400 absolute top-2 right-2" />
                    <div className="w-3 h-3 border-b-2 border-l-2 border-emerald-400 absolute bottom-2 left-2" />
                    <div className="w-3 h-3 border-b-2 border-r-2 border-emerald-400 absolute bottom-2 right-2" />
                    <span className="text-[11px] bg-black/60 text-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                      30–50 cm Target
                    </span>
                  </div>
                ) : (
                  // Crop row perspective guidelines
                  <div className="relative w-full h-full flex flex-col items-center justify-between p-6">
                    <div className="w-3/4 h-0.5 border-t border-dashed border-emerald-400/60" />
                    <div className="relative w-full flex justify-center">
                      <div className="w-48 h-40 border-2 border-dashed border-emerald-400/70 rounded-lg flex items-center justify-center">
                        <span className="text-[11px] bg-black/60 text-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                          Align Along Crop Row
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-0.5 border-t border-emerald-400/60" />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Controls */}
      <div className="p-4 bg-stone-900 border-t border-stone-800">
        {previewPhoto ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              id="retake-photo-btn"
              onClick={handleRetake}
              className="py-3 px-4 rounded-xl font-bold text-sm bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center gap-2 border border-stone-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.retake}</span>
            </button>

            <button
              id="confirm-photo-btn"
              onClick={handleConfirm}
              className="py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98"
            >
              <Check className="w-4 h-4 text-emerald-200" />
              <span>{t.confirm}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            {/* Gallery Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              id="upload-photo-btn"
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-xl bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 border border-stone-700 transition-colors"
              title="Upload photo from device"
              aria-label="Upload photo"
            >
              <Upload className="w-5 h-5" />
            </button>

            {/* Big Shutter Button */}
            <button
              id="shutter-snap-btn"
              disabled={isCapturing}
              onClick={handleSnap}
              className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 border-4 border-stone-900 ring-4 ring-emerald-500/40 flex items-center justify-center shadow-xl transition-all"
              title="Take Photo"
              aria-label="Take Photo"
            >
              <Camera className="w-7 h-7 text-stone-950" />
            </button>

            {/* Flip Camera */}
            <button
              id="flip-camera-btn"
              onClick={handleToggleFacing}
              className="w-12 h-12 rounded-xl bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 border border-stone-700 transition-colors"
              title="Flip camera"
              aria-label="Switch front or back camera"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Quick Sample Photos for Rapid Testing */}
        <div className="mt-3 pt-3 border-t border-stone-800">
          <p className="text-[11px] font-semibold text-stone-400 mb-1.5">
            {t.useSamplePhoto}
          </p>
          <div className="flex flex-wrap gap-2">
            {isSoil ? (
              <>
                <button
                  id="sample-dry-soil-btn"
                  onClick={() => handlePickSample(SAMPLE_SOIL_DRY)}
                  className="text-[11px] font-bold bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 border border-amber-700/50 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  🏜️ {t.sampleDrySoil}
                </button>
                <button
                  id="sample-moist-soil-btn"
                  onClick={() => handlePickSample(SAMPLE_SOIL_MOIST)}
                  className="text-[11px] font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  💧 {t.sampleMoistSoil}
                </button>
              </>
            ) : (
              <>
                <button
                  id="sample-yellow-crop-btn"
                  onClick={() => handlePickSample(SAMPLE_CROP_YELLOW)}
                  className="text-[11px] font-bold bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 border border-amber-700/50 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  🍂 {t.sampleYellowMaize}
                </button>
                <button
                  id="sample-healthy-crop-btn"
                  onClick={() => handlePickSample(SAMPLE_CROP_LUSH)}
                  className="text-[11px] font-bold bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  🌿 {t.sampleHealthyCrop}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
