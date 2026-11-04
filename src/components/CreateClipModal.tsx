import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Film,
  Music,
  Hash,
  Trash2,
  Video,
  Loader2,
  CheckCircle2,
  Volume2,
  Gauge,
  Palette,
} from 'lucide-react';
import { uploadVideoWithProgress, VideoUploadProgress } from '../utils/cloudflareStream';
import { MusicSelectorModal } from './MusicSelectorModal';
import { FILTER_PRESETS } from './CreatePostModal';
import { PermissionModal } from './PermissionModal';
import { hasPermission, PermissionType } from '../utils/permissionManager';

interface CreateClipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateClipModal: React.FC<CreateClipModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, createClip, addToast, t } = useApp();

  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('NEXORA, Reels, Trending');
  const [musicTitle, setMusicTitle] = useState('Áudio Original NEXORA');
  const [musicArtist, setMusicArtist] = useState(currentUser?.name || 'Membro NEXORA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<VideoUploadProgress | null>(null);

  // Reel Audio & Video Enhancements
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [videoVolume, setVideoVolume] = useState<number>(100);
  const [selectedFilter, setSelectedFilter] = useState<string>('none');

  // Permission state and video input ref
  const [pendingPermissionType, setPendingPermissionType] = useState<PermissionType | null>(null);
  const [onPermissionGranted, setOnPermissionGranted] = useState<(() => void) | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.volume = videoVolume / 100;
    }
  }, [playbackSpeed, videoVolume, videoUrl]);

  if (!isOpen || !currentUser) return null;

  const getFilterStyle = () => {
    return FILTER_PRESETS.find((f) => f.id === selectedFilter)?.css || 'none';
  };

  const handleRequestVideoUpload = () => {
    if (hasPermission('photos')) {
      videoFileInputRef.current?.click();
    } else {
      setPendingPermissionType('photos');
      setOnPermissionGranted(() => () => {
        setTimeout(() => videoFileInputRef.current?.click(), 100);
      });
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress({ progress: 0, status: 'uploading' });
      const result = await uploadVideoWithProgress(file, (p) => {
        setUploadProgress(p);
      });
      setVideoUrl(result.videoUrl);
      if (result.posterUrl) setPosterUrl(result.posterUrl);
      addToast(t('video.complete'), 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao carregar o vídeo.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !videoUrl.trim()) {
      addToast('Carregue um vídeo e adicione uma legenda.', 'info');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim().replace(/^#/, ''))
      .filter((tag) => tag.length > 0);

    setIsSubmitting(true);
    await createClip({
      videoUrl: videoUrl.trim(),
      posterUrl: posterUrl.trim() || undefined,
      description: description.trim(),
      tags,
      musicTitle: musicTitle.trim() || t('reels.audioOriginal'),
      musicArtist: musicArtist.trim() || currentUser.name,
    });
    setIsSubmitting(false);

    setVideoUrl('');
    setPosterUrl('');
    setDescription('');
    setUploadProgress(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-[var(--font-display)]">
                {t('reels.newClip')}
              </h3>
              <p className="text-[11px] text-slate-500">{t('video.uploadTitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('video.selectVideo')}
            </label>
            <input
              ref={videoFileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={uploadProgress?.status === 'uploading' || uploadProgress?.status === 'processing'}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleRequestVideoUpload}
              disabled={uploadProgress?.status === 'uploading' || uploadProgress?.status === 'processing'}
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors focus:outline-none disabled:opacity-50"
            >
              <Video className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{t('video.uploadTitle')}</span>
              <span className="text-[10px] text-slate-400">Pede autorização para aceder à galeria de vídeos</span>
            </button>
          </div>

          {/* Upload & Cloudflare Processing Progress */}
          {uploadProgress && uploadProgress.status !== 'idle' && (
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  {uploadProgress.status === 'ready' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  {uploadProgress.status === 'uploading'
                    ? t('video.uploadProgress')
                    : uploadProgress.status === 'processing'
                    ? t('video.processing')
                    : t('video.complete')}
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {uploadProgress.progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
            </div>
          )}

          {videoUrl && (
            <div className="space-y-3">
              <div className="relative aspect-[9/16] max-h-56 w-32 mx-auto rounded-2xl overflow-hidden bg-black shadow-md border border-slate-800">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  autoPlay
                  loop
                  playsInline
                  style={{ filter: getFilterStyle() }}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setVideoUrl('');
                    setPosterUrl('');
                    setUploadProgress(null);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reel Controls: Speed, Volume & Filters */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                {/* Speed Controls */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-purple-500" />
                    <span>Velocidade de Reprodução</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {[0.5, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                          playbackSpeed === speed
                            ? 'bg-purple-600 text-white font-bold'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0">
                    <Volume2 className="w-3 h-3 text-purple-500" />
                    <span>Volume</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={videoVolume}
                    onChange={(e) => setVideoVolume(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
                  />
                  <span className="text-[10px] font-mono text-slate-500 shrink-0 w-8 text-right">
                    {videoVolume}%
                  </span>
                </div>

                {/* Filter Presets */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                    <Palette className="w-3 h-3 text-purple-500" />
                    <span>Filtro de Vídeo</span>
                  </span>
                  <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {FILTER_PRESETS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedFilter(f.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors ${
                          selectedFilter === f.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Legenda do Reel
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo do seu Reel..."
              rows={2}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('explore.tags')}
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Tech, Design, Criatividade"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('reels.audioOriginal')}
              </label>
              <button
                type="button"
                onClick={() => setShowMusicModal(true)}
                className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Music className="w-3 h-3" />
                <span>Escolher da Biblioteca</span>
              </button>
            </div>
            <div className="relative">
              <Music className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                placeholder="Nome da faixa musical"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !videoUrl}
            className="w-full py-3 rounded-2xl font-semibold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? 'A carregar Reel...' : t('nav.publish')}
          </button>
        </form>

        <MusicSelectorModal
          isOpen={showMusicModal}
          onClose={() => setShowMusicModal(false)}
          onSelectTrack={(track) => {
            if (track.title) {
              setMusicTitle(track.title);
              setMusicArtist(track.artist);
            }
          }}
          selectedTrackTitle={musicTitle}
        />

        {/* Permission Consent Modal */}
        <PermissionModal
          isOpen={pendingPermissionType !== null}
          permissionType={pendingPermissionType || 'photos'}
          onClose={() => {
            setPendingPermissionType(null);
            setOnPermissionGranted(null);
          }}
          onGranted={() => {
            const callback = onPermissionGranted;
            setPendingPermissionType(null);
            setOnPermissionGranted(null);
            if (callback) callback();
          }}
        />
      </div>
    </div>
  );
};
