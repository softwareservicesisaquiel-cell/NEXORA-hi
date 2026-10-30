import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Film, Music, Sparkles, Hash } from 'lucide-react';

interface CreateClipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateClipModal: React.FC<CreateClipModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, createClip } = useApp();

  const [posterUrl, setPosterUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('Tech, Inovação, 2026');
  const [musicTitle, setMusicTitle] = useState('Cyber Waveflow');
  const [musicArtist, setMusicArtist] = useState('Nexora Sounds');

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !posterUrl.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(t => t.length > 0);

    createClip({
      posterUrl: posterUrl.trim(),
      description: description.trim(),
      tags,
      musicTitle: musicTitle.trim() || 'Áudio Original',
      musicArtist: musicArtist.trim() || currentUser.name,
    });

    setPosterUrl('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base font-[var(--font-display)]">Novo Nexora Clip</h3>
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
              URL da Capa ou Vídeo Vertical (9:16)
            </label>
            <input
              type="url"
              value={posterUrl}
              onChange={e => setPosterUrl(e.target.value)}
              placeholder="https://exemplo.com/video_frame.jpg"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setPosterUrl('/src/assets/images/clip_showcase_tech_1792880071682.jpg')}
              className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Usar captura vertical de estúdio
            </button>
          </div>

          {posterUrl && (
            <div className="aspect-[9/16] max-h-48 w-32 mx-auto rounded-xl overflow-hidden bg-black shadow-md">
              <img src={posterUrl} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Descrição do Clip
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explica o que estás a demonstrar..."
              rows={3}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Hashtags (separadas por vírgula)
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="Cinema, Timelapse, Tech"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nome da Música
              </label>
              <input
                type="text"
                value={musicTitle}
                onChange={e => setMusicTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Artista / Produtor
              </label>
              <input
                type="text"
                value={musicArtist}
                onChange={e => setMusicArtist(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all"
          >
            Publicar no Nexora Clips
          </button>
        </form>

      </div>
    </div>
  );
};
