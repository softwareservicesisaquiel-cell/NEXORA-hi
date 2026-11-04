import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Camera,
  RotateCw,
  Zap,
  ZapOff,
  Clock,
  Sparkles,
  Image as ImageIcon,
  Radio,
  Play,
  Square,
  Check,
  Film,
  Compass,
} from 'lucide-react';
import { hasPermission } from '../utils/permissionManager';
import { PermissionModal } from './PermissionModal';
import { LiveRoomModal } from './LiveRoomModal';

export type CameraMode = 'STORY' | 'REEL' | 'LIVE';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: CameraMode;
  onCaptureStory?: (mediaDataUrl: string) => void;
  onCaptureReel?: (videoBlob: Blob, videoUrl: string) => void;
}

const FILTERS = [
  { id: 'normal', name: 'Normal', filterStyle: 'none' },
  { id: 'vivid', name: 'Vívido', filterStyle: 'contrast(1.2) saturate(1.3)' },
  { id: 'mono', name: 'B&W', filterStyle: 'grayscale(1) contrast(1.1)' },
  { id: 'warm', name: 'Dourado', filterStyle: 'sepia(0.3) saturate(1.4) hue-rotate(-10deg)' },
  { id: 'cyber', name: 'Cyber', filterStyle: 'hue-rotate(180deg) saturate(1.5)' },
  { id: 'emerald', name: 'Esmeralda', filterStyle: 'hue-rotate(70deg) contrast(1.15)' },
];

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'STORY',
  onCaptureStory,
  onCaptureReel,
}) => {
  const { addToast } = useApp();

  const [mode, setMode] = useState<CameraMode>(initialMode);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<0 | 3 | 10>(0);
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const [activeFilterIndex, setActiveFilterIndex] = useState(0);
  const [showFiltersMenu, setShowFiltersMenu] = useState(false);

  // Recording state for Reels/Stories
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);

  // Permission handling
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionTypeToRequest, setPermissionTypeToRequest] = useState<'photos' | 'camera'>('camera');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live room trigger
  const [isLiveActive, setIsLiveActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync mode with initialMode
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Request & attach camera hardware stream
  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode,
              width: { ideal: 1080 },
              height: { ideal: 1920 },
            },
            audio: mode !== 'STORY',
          });

          if (active && videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
        }
      } catch (err) {
        console.warn('Hardware camera stream unavailable:', err);
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, facingMode, mode]);

  if (!isOpen) return null;

  const currentFilter = FILTERS[activeFilterIndex];

  // Flip front/back camera
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Toggle flash
  const handleToggleFlash = async () => {
    const nextState = !flashEnabled;
    setFlashEnabled(nextState);

    // Apply torch if track capability supports it
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        try {
          const capabilities = (videoTrack.getCapabilities?.() as any) || {};
          if (capabilities.torch) {
            await (videoTrack as any).applyConstraints({
              advanced: [{ torch: nextState }],
            });
          }
        } catch {
          // Torch not supported on some platforms
        }
      }
    }
    addToast(nextState ? 'Flash ativado' : 'Flash desativado', 'info');
  };

  // Cycle timer
  const handleCycleTimer = () => {
    if (timerSeconds === 0) setTimerSeconds(3);
    else if (timerSeconds === 3) setTimerSeconds(10);
    else setTimerSeconds(0);
  };

  // Open device photo gallery
  const handleOpenGallery = () => {
    if (!hasPermission('photos')) {
      setPermissionTypeToRequest('photos');
      setShowPermissionModal(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        if (onCaptureStory) {
          onCaptureStory(result);
        }
        onClose();
        addToast('Mídia selecionada da galeria!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Capture photo from video frame
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 1920;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (currentFilter.filterStyle !== 'none') {
      ctx.filter = currentFilter.filterStyle;
    }

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    if (onCaptureStory) {
      onCaptureStory(dataUrl);
    }
    onClose();
    addToast('Fotografia capturada com sucesso!', 'success');
  };

  // Trigger capture or recording
  const handleShutterPress = () => {
    if (mode === 'LIVE') {
      setIsLiveActive(true);
      return;
    }

    if (timerSeconds > 0 && countdownRemaining === null) {
      let count = timerSeconds;
      setCountdownRemaining(count);
      const interval = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(interval);
          setCountdownRemaining(null);
          executeShutter();
        } else {
          setCountdownRemaining(count);
        }
      }, 1000);
      return;
    }

    executeShutter();
  };

  const executeShutter = () => {
    if (mode === 'STORY') {
      capturePhoto();
    } else if (mode === 'REEL') {
      if (!isRecording) {
        startRecording();
      } else {
        stopRecording();
      }
    }
  };

  const startRecording = () => {
    if (!streamRef.current) {
      addToast('Câmara não disponível para gravação', 'error');
      return;
    }

    try {
      videoChunksRef.current = [];
      const recorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9,opus',
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          videoChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        if (onCaptureReel) {
          onCaptureReel(blob, videoUrl);
        }
        onClose();
        addToast('Reel gravado com sucesso!', 'success');
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordedSeconds(0);

      // Duration interval up to 60s
      const timer = setInterval(() => {
        setRecordedSeconds((prev) => {
          if (prev >= 60) {
            clearInterval(timer);
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('Erro ao iniciar MediaRecorder, a utilizar formato de compatibilidade', err);
      // Fallback capture
      capturePhoto();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden animate-in fade-in duration-200">
      {/* Hidden File Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFilePicked}
        className="hidden"
      />

      {/* Main Viewfinder Container (Full-height 9:16 mobile frame) */}
      <div className="relative w-full h-full max-w-md mx-auto bg-slate-950 flex flex-col justify-between overflow-hidden">
        
        {/* Real Live Hardware Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ filter: currentFilter.filterStyle }}
          className={`absolute inset-0 w-full h-full object-cover ${
            facingMode === 'user' ? '-scale-x-100' : ''
          }`}
        />

        {/* Fallback Viewfinder if no camera */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

        {/* Countdown Overlay */}
        {countdownRemaining !== null && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
            <span className="text-8xl font-black text-white drop-shadow-2xl animate-ping">
              {countdownRemaining}
            </span>
          </div>
        )}

        {/* TOP CAMERA CONTROLS */}
        <div className="relative z-30 p-4 pt-safe flex items-center justify-between text-white">
          {/* Close */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors cursor-pointer"
            title="Fechar Câmara"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Flash Toggle */}
          <button
            onClick={handleToggleFlash}
            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-colors cursor-pointer ${
              flashEnabled
                ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-400/30'
                : 'bg-black/40 text-white border-white/10 hover:bg-black/60'
            }`}
            title="Flash"
          >
            {flashEnabled ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
          </button>

          {/* Timer Cycle (Off, 3s, 10s) */}
          <button
            onClick={handleCycleTimer}
            className={`px-3 h-10 rounded-full backdrop-blur-md flex items-center gap-1 text-xs font-bold border transition-colors cursor-pointer ${
              timerSeconds > 0
                ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                : 'bg-black/40 text-white border-white/10 hover:bg-black/60'
            }`}
            title="Temporizador"
          >
            <Clock className="w-4 h-4" />
            <span>{timerSeconds === 0 ? 'Off' : `${timerSeconds}s`}</span>
          </button>

          {/* Filters Selector Toggle */}
          <button
            onClick={() => setShowFiltersMenu(!showFiltersMenu)}
            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-colors cursor-pointer ${
              showFiltersMenu
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-black/40 text-white border-white/10 hover:bg-black/60'
            }`}
            title="Efeitos e Filtros"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Invert Camera */}
          <button
            onClick={handleFlipCamera}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 text-white transition-transform active:rotate-180 duration-300 cursor-pointer"
            title="Inverter Câmara"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* RECORDING TIME BADGE (If recording Reel) */}
        {isRecording && (
          <div className="relative z-30 mx-auto -mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-600/90 text-white text-xs font-bold shadow-lg animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
            <span>00:{recordedSeconds.toString().padStart(2, '0')} / 01:00</span>
          </div>
        )}

        {/* HORIZONTAL FILTERS CAROUSEL (If open) */}
        {showFiltersMenu && (
          <div className="relative z-30 px-4 py-2 flex items-center gap-2.5 overflow-x-auto no-scrollbar">
            {FILTERS.map((f, idx) => (
              <button
                key={f.id}
                onClick={() => setActiveFilterIndex(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition-all shrink-0 cursor-pointer ${
                  activeFilterIndex === idx
                    ? 'bg-white text-black border-white shadow-lg'
                    : 'bg-black/50 text-white/80 border-white/10 hover:bg-black/70'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        )}

        {/* BOTTOM SECTION: SHUTTER CONTROLS & MODE SELECTOR */}
        <div className="relative z-30 p-6 pb-safe space-y-5 text-white">
          
          {/* Main Shutter Row */}
          <div className="flex items-center justify-around">
            {/* Gallery Picker Button */}
            <button
              onClick={handleOpenGallery}
              className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-all cursor-pointer"
              title="Abrir Galeria"
            >
              <ImageIcon className="w-6 h-6" />
            </button>

            {/* Central Shutter Button */}
            <div className="relative flex items-center justify-center">
              {/* Outer Ring */}
              <div
                className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                  mode === 'LIVE'
                    ? 'border-rose-500 shadow-lg shadow-rose-500/40'
                    : mode === 'REEL'
                    ? isRecording
                      ? 'border-rose-500 scale-110'
                      : 'border-white'
                    : 'border-white'
                }`}
              >
                {/* Inner Shutter Action Button */}
                <button
                  onClick={handleShutterPress}
                  className={`w-16 h-16 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                    mode === 'LIVE'
                      ? 'bg-gradient-to-tr from-rose-600 to-pink-600 hover:scale-105 active:scale-95'
                      : mode === 'REEL'
                      ? isRecording
                        ? 'w-8 h-8 rounded-lg bg-rose-600 animate-pulse'
                        : 'bg-rose-500 hover:scale-105 active:scale-95'
                      : 'bg-white hover:scale-105 active:scale-95'
                  }`}
                  title={
                    mode === 'LIVE'
                      ? 'Transmitir em Direto'
                      : mode === 'REEL'
                      ? isRecording
                        ? 'Parar Gravação'
                        : 'Gravar Reel'
                      : 'Tirar Foto'
                  }
                >
                  {mode === 'LIVE' && <Radio className="w-7 h-7 text-white" />}
                  {mode === 'REEL' && !isRecording && <Film className="w-7 h-7 text-white" />}
                  {mode === 'REEL' && isRecording && <Square className="w-5 h-5 text-white fill-white" />}
                </button>
              </div>
            </div>

            {/* Invert Camera Shortcut */}
            <button
              onClick={handleFlipCamera}
              className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-all cursor-pointer"
              title="Inverter Câmara"
            >
              <RotateCw className="w-6 h-6" />
            </button>
          </div>

          {/* Mode Switcher Tabs (STORY | REEL | LIVE) */}
          <div className="flex items-center justify-center gap-6 text-xs font-black tracking-wider uppercase">
            <button
              onClick={() => {
                if (isRecording) stopRecording();
                setMode('STORY');
              }}
              className={`pb-1 transition-all cursor-pointer ${
                mode === 'STORY'
                  ? 'text-white border-b-2 border-white scale-110'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              STORY
            </button>

            <button
              onClick={() => setMode('REEL')}
              className={`pb-1 transition-all cursor-pointer ${
                mode === 'REEL'
                  ? 'text-white border-b-2 border-white scale-110'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              REEL
            </button>

            <button
              onClick={() => {
                if (isRecording) stopRecording();
                setMode('LIVE');
              }}
              className={`pb-1 transition-all cursor-pointer ${
                mode === 'LIVE'
                  ? 'text-rose-400 border-b-2 border-rose-500 scale-110 font-black'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              AO VIVO
            </button>
          </div>

        </div>

      </div>

      {/* Permission Modal */}
      <PermissionModal
        isOpen={showPermissionModal}
        type={permissionTypeToRequest}
        permissionType={permissionTypeToRequest}
        onGranted={() => {
          setShowPermissionModal(false);
          if (permissionTypeToRequest === 'photos') {
            fileInputRef.current?.click();
          }
        }}
        onClose={() => setShowPermissionModal(false)}
      />

      {/* Live Stream Room */}
      <LiveRoomModal
        isOpen={isLiveActive}
        onClose={() => {
          setIsLiveActive(false);
          onClose();
        }}
        isHost={true}
        streamTitle="Transmissão ao Vivo NEXORA"
      />
    </div>
  );
};
