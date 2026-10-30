import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Clip } from '../types';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music,
  Plus,
  Send,
  X,
  Check,
  ShieldAlert,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface ClipsViewProps {
  onOpenCreateClip: () => void;
}

export const ClipsView: React.FC<ClipsViewProps> = ({ onOpenCreateClip }) => {
  const {
    clips,
    toggleLikeClip,
    toggleBookmarkClip,
    isFollowingUser,
    toggleFollowUser,
    openUserProfile,
    currentUser,
    addToast,
  } = useApp();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [quality, setQuality] = useState<'1080p' | '720p' | 'eco'>('1080p');

  const currentClip = clips[activeIndex] || clips[0];

  const handleNextClip = () => {
    if (activeIndex < clips.length - 1) {
      setActiveIndex(activeIndex + 1);
      setIsPlaying(true);
    }
  };

  const handlePrevClip = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      setIsPlaying(true);
    }
  };

  const handleShare = () => {
    addToast('Ligação do Nexora Clip copiada para partilha!', 'success');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentUser) return;
    currentClip.comments.unshift({
      id: `cc_${Date.now()}`,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      text: commentInput.trim(),
      createdAt: 'Agora',
      likesCount: 0,
    });
    currentClip.commentsCount += 1;
    setCommentInput('');
    addToast('Comentário publicado no Clip!', 'success');
  };

  if (!currentClip) {
    return (
      <div className="max-w-md mx-auto p-8 text-center text-slate-500">
        Nenhum clip disponível de momento.
      </div>
    );
  }

  const isFollowing = isFollowingUser(currentClip.author.id);

  return (
    <div className="relative max-w-4xl mx-auto px-2 sm:px-4 py-4 flex flex-col items-center">
      
      {/* Top Controls Bar */}
      <div className="w-full max-w-sm flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white font-[var(--font-display)]">
            NEXORA CLIPS
          </span>
          <select
            value={quality}
            onChange={e => {
              setQuality(e.target.value as any);
              addToast(`Qualidade de reprodução alterada para ${e.target.value}.`, 'info');
            }}
            className="text-[10px] bg-slate-100 dark:bg-slate-800 border-none rounded-md px-1.5 py-0.5 text-slate-600 dark:text-slate-300 focus:outline-none"
          >
            <option value="1080p">HD 1080p 60fps</option>
            <option value="720p">720p Padrão</option>
            <option value="eco">Poupança de Dados</option>
          </select>
        </div>

        <button
          onClick={onOpenCreateClip}
          className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 transition-all min-h-[36px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Clip</span>
        </button>
      </div>

      {/* Main Vertical Player Frame */}
      <div className="relative w-full max-w-sm aspect-[9/16] max-h-[750px] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center select-none group">
        
        {/* Background Video / Visual */}
        <img
          src={currentClip.posterUrl}
          alt={currentClip.description}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isPlaying ? 'scale-100' : 'scale-105 brightness-75'
          }`}
          onClick={() => setIsPlaying(!isPlaying)}
        />

        {/* Play/Pause Center Indicator */}
        {!isPlaying && (
          <div
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Play className="w-8 h-8 ml-1" />
            </div>
          </div>
        )}

        {/* Sound toggle top-right */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
          title={isMuted ? 'Ativar som' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Right Floating Interaction Buttons */}
        <div className="absolute right-3 bottom-20 z-30 flex flex-col items-center gap-4">
          
          {/* Creator Avatar with follow badge */}
          <div className="relative mb-1">
            <button
              onClick={() => openUserProfile(currentClip.author)}
              className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-md block"
            >
              <img
                src={currentClip.author.avatar}
                alt={currentClip.author.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
            {currentUser?.id !== currentClip.author.id && (
              <button
                onClick={() => toggleFollowUser(currentClip.author.id)}
                className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md transition-all ${
                  isFollowing ? 'bg-slate-700' : 'bg-rose-500 hover:scale-110'
                }`}
                title={isFollowing ? 'A seguir' : 'Seguir criador'}
              >
                {isFollowing ? '✓' : '+'}
              </button>
            )}
          </div>

          {/* Like Button */}
          <button
            onClick={() => toggleLikeClip(currentClip.id)}
            className="flex flex-col items-center text-white group/btn"
          >
            <div
              className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                currentClip.hasLiked
                  ? 'bg-rose-500/80 text-white scale-110'
                  : 'bg-black/40 hover:bg-black/60 text-white'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${currentClip.hasLiked ? 'fill-current text-white' : ''}`}
              />
            </div>
            <span className="text-[11px] font-mono tabular-nums mt-1 font-semibold drop-shadow">
              {currentClip.likesCount.toLocaleString()}
            </span>
          </button>

          {/* Comments Button */}
          <button
            onClick={() => setShowCommentsDrawer(true)}
            className="flex flex-col items-center text-white"
          >
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono tabular-nums mt-1 font-semibold drop-shadow">
              {currentClip.commentsCount}
            </span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => toggleBookmarkClip(currentClip.id)}
            className="flex flex-col items-center text-white"
          >
            <div
              className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                currentClip.isSaved
                  ? 'bg-amber-500/80 text-white'
                  : 'bg-black/40 hover:bg-black/60 text-white'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${currentClip.isSaved ? 'fill-current' : ''}`} />
            </div>
            <span className="text-[11px] font-mono tabular-nums mt-1 font-semibold drop-shadow">
              Guardar
            </span>
          </button>

          {/* Share Button */}
          <button onClick={handleShare} className="flex flex-col items-center text-white">
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono tabular-nums mt-1 font-semibold drop-shadow">
              Partilhar
            </span>
          </button>
        </div>

        {/* Bottom Overlay Content (Creator, Description, Sound) */}
        <div className="absolute bottom-0 left-0 right-14 z-20 p-4 bg-gradient-to-t from-black via-black/60 to-transparent text-white">
          <div className="flex items-center gap-2 mb-1.5">
            <button
              onClick={() => openUserProfile(currentClip.author)}
              className="font-bold text-xs sm:text-sm hover:underline"
            >
              @{currentClip.author.username}
            </button>
            {currentClip.author.isVerified && (
              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] flex items-center justify-center font-bold">
                ✓
              </span>
            )}
          </div>

          <p className="text-xs text-slate-100 line-clamp-2 leading-relaxed mb-2 drop-shadow">
            {currentClip.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {currentClip.tags.map(tag => (
              <span key={tag} className="text-[11px] font-semibold text-blue-400">
                #{tag}
              </span>
            ))}
          </div>

          {/* Music track ticker */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[11px] text-slate-200">
            <Music className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" />
            <span className="truncate max-w-[200px]">
              {currentClip.musicTrack.title} · {currentClip.musicTrack.artist}
            </span>
          </div>
        </div>

        {/* Video Scrubber timeline */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
          <div className="h-full bg-blue-500 w-2/3" />
        </div>
      </div>

      {/* Vertical Navigation Pill (Desktop & Tablet) */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handlePrevClip}
          disabled={activeIndex === 0}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 transition-colors"
        >
          Anterior
        </button>
        <span className="text-xs text-slate-500 font-mono tabular-nums">
          {activeIndex + 1} de {clips.length}
        </span>
        <button
          onClick={handleNextClip}
          disabled={activeIndex === clips.length - 1}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition-colors"
        >
          Próximo
        </button>
      </div>

      {/* Slide-Up Comments Drawer */}
      {showCommentsDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[75vh] flex flex-col border border-slate-200 dark:border-slate-800">
            
            {/* Grab handle */}
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white font-[var(--font-display)]">
                Comentários ({currentClip.commentsCount})
              </h4>
              <button
                onClick={() => setShowCommentsDrawer(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {currentClip.comments.length > 0 ? (
                currentClip.comments.map(c => (
                  <div key={c.id} className="flex items-start gap-2.5 text-xs">
                    <img
                      src={c.author.avatar}
                      alt={c.author.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {c.author.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{c.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-slate-400 py-8">
                  Sê o primeiro a comentar este Nexora Clip!
                </p>
              )}
            </div>

            {/* Comment input */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                placeholder="Adiciona um comentário..."
                className="flex-1 px-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
