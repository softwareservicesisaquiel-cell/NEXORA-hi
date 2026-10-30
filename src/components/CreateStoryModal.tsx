import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Image, Type, Music, Sparkles } from 'lucide-react';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, createStory } = useApp();

  const [storyType, setStoryType] = useState<'text' | 'image'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('from-blue-600 via-indigo-600 to-purple-700');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [musicTrack, setMusicTrack] = useState('');

  if (!isOpen || !currentUser) return null;

  const gradientOptions = [
    { label: 'Cyber Violet', value: 'from-blue-600 via-indigo-600 to-purple-700' },
    { label: 'Sunset Horizon', value: 'from-amber-500 via-rose-500 to-purple-600' },
    { label: 'Obsidian Deep', value: 'from-slate-900 via-zinc-900 to-black' },
    { label: 'Emerald Quantum', value: 'from-teal-600 via-emerald-600 to-cyan-700' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (storyType === 'text' && !textContent.trim()) return;
    if (storyType === 'image' && !imageUrl.trim()) return;

    createStory({
      mediaType: storyType,
      textContent: storyType === 'text' ? textContent.trim() : undefined,
      textBackgroundGradient: selectedGradient,
      mediaUrl: storyType === 'image' ? imageUrl.trim() : undefined,
      caption: caption.trim() || undefined,
      musicTrack: musicTrack.trim() || undefined,
    });

    setTextContent('');
    setImageUrl('');
    setCaption('');
    setMusicTrack('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base font-[var(--font-display)]">Novo Story (24h)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Type Selector */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setStoryType('text')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              storyType === 'text'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Story em Texto</span>
          </button>

          <button
            type="button"
            onClick={() => setStoryType('image')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              storyType === 'image'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Story com Imagem</span>
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
                  onChange={e => setTextContent(e.target.value)}
                  placeholder="Escreve o teu pensamento ou pergunta..."
                  className="w-full bg-transparent border-none text-center font-bold text-base sm:text-lg focus:outline-none placeholder-white/60 resize-none"
                  rows={4}
                  maxLength={160}
                />
              </div>

              {/* Gradient Choices */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500">Gradiente de Fundo</label>
                <div className="flex gap-2">
                  {gradientOptions.map(g => (
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
          ) : (
            <div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    URL da Fotografia
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://exemplo.com/story.jpg"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('/src/assets/images/clip_showcase_tech_1792880071682.jpg')}
                    className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Usar foto de demonstração de alta qualidade
                  </button>
                </div>

                {imageUrl && (
                  <div className="aspect-[4/5] max-h-48 w-full rounded-xl overflow-hidden bg-black">
                    <img src={imageUrl} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Legenda (Opcional)
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="Adiciona uma breve descrição..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Music Track (Optional) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Música de Fundo (Opcional)
            </label>
            <div className="relative">
              <Music className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={musicTrack}
                onChange={e => setMusicTrack(e.target.value)}
                placeholder="Ex: Synthesized Horizons · Ambient Wave"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all"
          >
            Partilhar Story no Nexora
          </button>
        </form>

      </div>
    </div>
  );
};
