import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Image as ImageIcon,
  Film,
  Sparkles,
  Type,
  BarChart3,
  MapPin,
  Smile,
  Globe,
  Users,
  Lock,
  Plus,
  Trash2,
  Upload,
  Play,
  Palette,
  Check,
} from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'text' | 'photo' | 'video' | 'moment';
}

const GRADIENT_PRESETS = [
  { id: 'grad_none', label: 'Padrão', value: '' },
  { id: 'grad_blue', label: 'Oceano', value: 'from-blue-600 via-indigo-600 to-cyan-600' },
  { id: 'grad_sunset', label: 'Pôr do Sol', value: 'from-amber-500 via-rose-600 to-purple-700' },
  { id: 'grad_purple', label: 'Neon Cyber', value: 'from-violet-600 via-purple-700 to-fuchsia-600' },
  { id: 'grad_emerald', label: 'Esmeralda', value: 'from-emerald-600 via-teal-700 to-cyan-800' },
  { id: 'grad_dark', label: 'Obsidiana', value: 'from-slate-900 via-neutral-900 to-zinc-950' },
];

const SAMPLE_MEDIA = {
  photos: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    '/src/assets/images/clip_showcase_tech_1792880071682.jpg',
  ],
  videos: [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  ],
};

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'text',
}) => {
  const { currentUser, createPost, addToast } = useApp();

  const [activePublishTab, setActivePublishTab] = useState<'text' | 'photo' | 'video' | 'moment'>('text');
  const [content, setContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('');
  const [audience, setAudience] = useState<'public' | 'followers' | 'close_friends'>('public');
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  
  // Media states
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [tempMediaInput, setTempMediaInput] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);

  // Poll states
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  if (!isOpen || !currentUser) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (isVideo || activePublishTab === 'video') {
            setVideoUrl(reader.result);
            setActivePublishTab('video');
            addToast('Vídeo carregado com sucesso!', 'success');
          } else {
            setMediaUrls(prev => [...prev, reader.result as string]);
            if (activePublishTab === 'text') setActivePublishTab('photo');
            addToast('Foto adicionada com sucesso!', 'success');
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePollOptionChange = (text: string, index: number) => {
    const updated = [...pollOptions];
    updated[index] = text;
    setPollOptions(updated);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isMoment = activePublishTab === 'moment';
    const isVideo = activePublishTab === 'video';

    if (!content.trim() && mediaUrls.length === 0 && !videoUrl && !pollQuestion.trim()) {
      addToast('Escreve algo ou adiciona um arquivo para publicar.', 'info');
      return;
    }

    // Extract hashtags
    const tagMatches = content.match(/#[a-z0-9A-Z_À-ÿ]+/g);
    const tags = tagMatches ? tagMatches.map(t => t.replace('#', '')) : [];

    let pollData = undefined;
    const cleanPollOptions = pollOptions.filter(o => o.trim().length > 0);
    if (showPollCreator && pollQuestion.trim() && cleanPollOptions.length >= 2) {
      pollData = {
        question: pollQuestion.trim(),
        options: cleanPollOptions,
      };
    }

    const effectiveMediaUrls = isVideo && videoUrl
      ? [videoUrl]
      : mediaUrls;

    const effectiveMediaType = isMoment
      ? 'moment'
      : isVideo
      ? 'video'
      : effectiveMediaUrls.length > 1
      ? 'album'
      : effectiveMediaUrls.length === 1
      ? 'image'
      : 'none';

    createPost({
      content: content.trim(),
      mediaUrls: effectiveMediaUrls,
      mediaType: effectiveMediaType,
      backgroundGradient: activePublishTab === 'text' || isMoment ? (selectedGradient || undefined) : undefined,
      isMoment,
      tags,
      poll: pollData,
      audience,
      location: location.trim() || undefined,
    });

    // Reset state
    setContent('');
    setSelectedGradient('');
    setLocation('');
    setShowLocationInput(false);
    setShowPollCreator(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setMediaUrls([]);
    setVideoUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 dark:text-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-[var(--font-display)] text-slate-900 dark:text-white leading-tight">
                Nova Publicação no NEXORA HI
              </h3>
              <p className="text-[11px] text-slate-500">
                Momentos, vídeos em HD, fotos e textos com ultra segurança
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Dedicated Publication Type Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => setActivePublishTab('text')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
              activePublishTab === 'text'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Texto</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePublishTab('photo')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
              activePublishTab === 'photo'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Fotos</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePublishTab('video')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
              activePublishTab === 'video'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Vídeos</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePublishTab('moment')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
              activePublishTab === 'moment'
                ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Momento</span>
          </button>
        </div>

        {/* User Author Bar & Audience Picker */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <div>
              <span className="font-semibold text-xs text-slate-900 dark:text-white block leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500">@{currentUser.username}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setAudience('public')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                audience === 'public'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Público</span>
            </button>
            <button
              type="button"
              onClick={() => setAudience('followers')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                audience === 'followers'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Seguidores</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Moment / Text with Gradient Preview Box */}
          {selectedGradient && (activePublishTab === 'text' || activePublishTab === 'moment') ? (
            <div className={`p-6 rounded-2xl bg-gradient-to-br ${selectedGradient} text-white shadow-lg min-h-[160px] flex flex-col justify-center`}>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={
                  activePublishTab === 'moment'
                    ? 'Partilha o teu momento de hoje (desaparece em 24h)...'
                    : 'Escreve o teu pensamento ou publicação estilizada...'
                }
                rows={4}
                className="w-full bg-transparent border-0 text-white placeholder-white/70 text-base sm:text-lg font-bold text-center focus:outline-none resize-none"
                autoFocus
              />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={
                activePublishTab === 'text'
                  ? 'O que está a acontecer no teu mundo? Partilha ideias, debates ou novidades...'
                  : activePublishTab === 'photo'
                  ? 'Escreve uma legenda para as tuas fotos (#hashtags, contexto)...'
                  : activePublishTab === 'video'
                  ? 'Adiciona uma descrição atraente ao teu vídeo...'
                  : 'Partilha o teu momento (visível no Feed e Stories por 24 horas)...'
              }
              rows={activePublishTab === 'text' ? 5 : 3}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none"
            />
          )}

          {/* Color Gradient Presets for Text & Moments */}
          {(activePublishTab === 'text' || activePublishTab === 'moment') && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-2">
                <Palette className="w-3.5 h-3.5" />
                <span>Cores de Fundo e Estilo</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                {GRADIENT_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedGradient(preset.value)}
                    className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center transition-all ${
                      preset.value
                        ? `bg-gradient-to-br ${preset.value}`
                        : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600'
                    } ${selectedGradient === preset.value ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' : ''}`}
                    title={preset.label}
                  >
                    {selectedGradient === preset.value && (
                      <Check className="w-3 h-3 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PHOTOS MANAGER */}
          {activePublishTab === 'photo' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 text-center">
                <input
                  type="file"
                  id="photo-upload-input"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Carregar Fotos do Dispositivo
                  </span>
                  <span className="text-[10px] text-slate-400">
                    JPG, PNG, WebP (Seleciona 1 ou várias para criar um Álbum)
                  </span>
                </label>
              </div>

              {/* Sample Photo Presets */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Ou usa uma foto de exemplo:</span>
                <button
                  type="button"
                  onClick={() => setMediaUrls([...mediaUrls, SAMPLE_MEDIA.photos[0]])}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  + Foto Abstrata HD
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setMediaUrls([...mediaUrls, SAMPLE_MEDIA.photos[1]])}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  + Arte Digital
                </button>
              </div>

              {/* Photos Preview Grid */}
              {mediaUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  {mediaUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                      <img src={url} alt={`Pré-visualização ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(i)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: VIDEO MANAGER */}
          {activePublishTab === 'video' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 text-center">
                <input
                  type="file"
                  id="video-upload-input"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="video-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Film className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Carregar Vídeo do Dispositivo
                  </span>
                  <span className="text-[10px] text-slate-400">
                    MP4, WebM, MOV em Alta Definição
                  </span>
                </label>
              </div>

              {/* Sample Video Presets */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Ou usa um vídeo de demonstração:</span>
                <button
                  type="button"
                  onClick={() => setVideoUrl(SAMPLE_MEDIA.videos[0])}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                >
                  + Vídeo de Ação HD
                </button>
              </div>

              {/* Video Player Preview */}
              {videoUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black aspect-video">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setVideoUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: MOMENT DETAILS */}
          {activePublishTab === 'moment' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Momento de 24h:</strong> Esta publicação aparecerá destacada no topo do Feed e nos Stories de todos os teus seguidores durante 24 horas.
              </span>
            </div>
          )}

          {/* Interactive Poll Builder */}
          {showPollCreator && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Criar Enquete Interativa</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPollCreator(false)}
                  className="text-[11px] text-rose-500 hover:underline"
                >
                  Cancelar Enquete
                </button>
              </div>

              <input
                type="text"
                value={pollQuestion}
                onChange={e => setPollQuestion(e.target.value)}
                placeholder="Faz uma pergunta à comunidade..."
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />

              <div className="space-y-2">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={e => handlePollOptionChange(e.target.value, i)}
                      placeholder={`Opção ${i + 1}`}
                      className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePollOption(i)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {pollOptions.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddPollOption}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar mais uma opção</span>
                </button>
              )}
            </div>
          )}

          {/* Location input */}
          {showLocationInput && (
            <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Adicionar localização (ex.: Lisboa, Portugal)"
                className="flex-1 bg-transparent border-0 text-xs focus:outline-none text-slate-800 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={() => setShowLocationInput(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Action Tools & Add-ons Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPollCreator(!showPollCreator)}
                className={`p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  showPollCreator ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/50' : ''
                }`}
                title="Enquete"
              >
                <BarChart3 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowLocationInput(!showLocationInput)}
                className={`p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  showLocationInput ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/50' : ''
                }`}
                title="Localização"
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all min-h-[40px]"
            >
              <span>
                {activePublishTab === 'moment'
                  ? 'Publicar Momento'
                  : activePublishTab === 'video'
                  ? 'Publicar Vídeo'
                  : activePublishTab === 'photo'
                  ? 'Publicar Fotos'
                  : 'Publicar'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
