import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Image, Type, Music, Sparkles, Upload, Trash2, Video, Loader2, CheckCircle2 } from 'lucide-react';
import { uploadVideoWithProgress, VideoUploadProgress } from '../utils/cloudflareStream';
import { MusicSelectorModal } from './MusicSelectorModal';
import { PermissionModal } from './PermissionModal';
import { hasPermission, PermissionType } from '../utils/permissionManager';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, createStory, addToast, t } = useApp();

  const [storyType, setStoryType] = useState<'text' | 'image' | 'video'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('from-blue-600 via-indigo-600 to-purple-700');
  const [mediaDataUrl, setMediaDataUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [musicTrack, setMusicTrack] = useState('');
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<VideoUploadProgress | null>(null);

  // Permission states & file refs
  const [pendingPermissionType, setPendingPermissionType] = useState<PermissionType | null>(null);
  const [onPermissionGranted, setOnPermissionGranted] = useState<(() => void) | null>(null);
  const photoFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen || !currentUser) return null;

  const gradientOptions = [
    { label: 'Cyber Violet', value: 'from-blue-600 via-indigo-600 to-purple-700' },
    { label: 'Sunset Horizon', value: 'from-amber-500 via-rose-500 to-purple-600' },
    { label: 'Obsidian Deep', value: 'from-slate-900 via-zinc-900 to-black' },
    { label: 'Emerald Quantum', value: 'from-teal-600 via-emerald-600 to-cyan-700' },
  ];

  const handleRequestPhotoUpload = () => {
    if (hasPermission('photos')) {
      photoFileInputRef.current?.click();
    } else {
      setPendingPermissionType('photos');
      setOnPermissionGranted(() => () => {
        setTimeout(() => photoFileInputRef.current?.click(), 100);
      });
    }
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMediaDataUrl(reader.result);
        setStoryType('image');
        addToast('Fotografia carregada com sucesso!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress({ progress: 0, status: 'uploading' });
      const result = await uploadVideoWithProgress(file, (p) => {
        setUploadProgress(p);
      });
      setMediaDataUrl(result.videoUrl);
      setStoryType('video');
      addToast(t('video.complete'), 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao carregar o vídeo.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (storyType === 'text' && !textContent.trim()) return;
    if ((storyType === 'image' || storyType === 'video') && !mediaDataUrl.trim()) {
      addToast('Carregue uma fotografia ou vídeo para o Story.', 'info');
      return;
    }

    setIsSubmitting(true);
    await createStory({
      mediaType: storyType === 'video' ? 'image' : storyType, // Story interface persists URL in mediaUrl
      textContent: storyType === 'text' ? textContent.trim() : undefined,
      textBackgroundGradient: selectedGradient,
      mediaUrl: storyType !== 'text' ? mediaDataUrl.trim() : undefined,
      caption: caption.trim() || undefined,
      musicTrack: musicTrack.trim() || undefined,
    });
    setIsSubmitting(false);

    setTextContent('');
    setMediaDataUrl('');
    setCaption('');
    setMusicTrack('');
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
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-[var(--font-display)]">
                {t('story.createStory')}
              </h3>
              <p className="text-[11px] text-slate-500">{t('story.expiresIn')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Type Selector */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-4 gap-1">
          <button
            type="button"
            onClick={() => setStoryType('text')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
              storyType === 'text'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>{t('feed.text')}</span>
          </button>

          <button
            type="button"
            onClick={() => setStoryType('image')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
              storyType === 'image'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>{t('feed.photo')}</span>
          </button>

          <button
            type="button"
            onClick={() => setStoryType('video')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
              storyType === 'video'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>{t('feed.video')}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {storyType === 'text' ? (
            <div>
              {/* Preview Box */}
              <div
                className={`w-full aspect-[4/5] max-h-64 rounded-2xl bg-gradient-to-br ${selectedGradient} p-6 flex items-center justify-center text-center text-white shadow-inner mb-3`}
              >
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Escreve o teu pensamento..."
                  className="w-full bg-transparent border-none text-center font-bold text-base sm:text-lg focus:outline-none placeholder-white/70 resize-none"
                  rows={4}
                  maxLength={160}
                />
              </div>

              {/* Gradient Choices */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500">Gradiente de Fundo</label>
                <div className="flex gap-2">
                  {gradientOptions.map((g) => (
                    <button
                      key={g.label}
                      type="button"
                      onClick={() => setSelectedGradient(g.value)}
                      title={g.label}
                      className={`flex-1 h-7 rounded-lg bg-gradient-to-r ${g.value} border-2 transition-all ${
                        selectedGradient === g.value ? 'border-white ring-2 ring-blue-500 scale-105' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : storyType === 'image' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('feed.photo')}
                </label>
                <input
                  ref={photoFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleRequestPhotoUpload}
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors focus:outline-none"
                >
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Escolher fotografia da galeria</span>
                  <span className="text-[10px] text-slate-400">Pede autorização para aceder às fotos do dispositivo</span>
                </button>
              </div>

              {mediaDataUrl && (
                <div className="relative aspect-[4/5] max-h-48 w-full rounded-2xl overflow-hidden bg-black border border-slate-800">
                  <img src={mediaDataUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setMediaDataUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('feed.video')}
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
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Escolher vídeo da galeria</span>
                  <span className="text-[10px] text-slate-400">Pede autorização para aceder aos vídeos do dispositivo</span>
                </button>
              </div>

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

              {mediaDataUrl && (
                <div className="relative aspect-[4/5] max-h-48 w-full rounded-2xl overflow-hidden bg-black border border-slate-800">
                  <video src={mediaDataUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setMediaDataUrl('');
                      setUploadProgress(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Caption */}
          {storyType !== 'text' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Legenda (Opcional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Adiciona uma breve descrição..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Music Track (Optional) */}
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
                value={musicTrack}
                onChange={(e) => setMusicTrack(e.target.value)}
                placeholder="Ex: Trilha Sonora · Ambient Wave"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl font-semibold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? 'A publicar Story...' : t('story.addToStory')}
          </button>
        </form>

        <MusicSelectorModal
          isOpen={showMusicModal}
          onClose={() => setShowMusicModal(false)}
          onSelectTrack={(track) => {
            if (track.title) {
              setMusicTrack(`${track.title} · ${track.artist}`);
            } else {
              setMusicTrack('');
            }
          }}
          selectedTrackTitle={musicTrack.split(' · ')[0]}
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
