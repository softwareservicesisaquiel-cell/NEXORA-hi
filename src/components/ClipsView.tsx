import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Clip } from '../types';
import { PullToRefresh } from './PullToRefresh';
import { ShareModal } from './ShareModal';
import { OptimizedAvatar } from './OptimizedAvatar';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Music,
  Plus,
  Send,
  X,
  Check,
  Camera,
} from 'lucide-react';

interface ClipsViewProps {
  onOpenCreateClip: () => void;
  onOpenCamera?: (mode?: 'STORY' | 'REEL' | 'LIVE') => void;
}

export const ClipsView: React.FC<ClipsViewProps> = ({ onOpenCreateClip, onOpenCamera }) => {
  const {
    clips,
    toggleLikeClip,
    toggleBookmarkClip,
    isFollowingUser,
    toggleFollowUser,
    openUserProfile,
    currentUser,
    followingUserIds,
    addToast,
    refetchClips,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [progress, setProgress] = useState(25);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastTapRef = useRef<number>(0);

  // Filter clips based on active tab
  const displayedClips = clips.filter((c) => {
    if (activeTab === 'following') {
      return followingUserIds.includes(c.author.id) || (currentUser && c.author.id === currentUser.id);
    }
    return true;
  });

  const currentClip: Clip | undefined = displayedClips[activeIndex] || displayedClips[0] || clips[0];

  // Video playback control
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isMuted, activeIndex]);

  // Video progress scrub simulation
  useEffect(() => {
    const timer = setInterval(() => {
      if (isPlaying) {
        setProgress((prev) => (prev >= 99 ? 0 : prev + 1));
      }
    }, 250);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 320;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (currentClip && !currentClip.hasLiked) {
        toggleLikeClip(currentClip.id);
      }
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 650);
    } else {
      setIsPlaying((prev) => !prev);
    }
    lastTapRef.current = now;
  };

  const handleNextClip = () => {
    if (activeIndex < displayedClips.length - 1) {
      setActiveIndex(activeIndex + 1);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const handlePrevClip = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentUser || !currentClip) return;
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
    addToast('Comentário publicado no Reel!', 'success');
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  if (!currentClip) {
    return (
      <div className="max-w-md mx-auto p-12 text-center text-slate-500">
        <p className="mb-4">Nenhum Reel disponível nesta secção.</p>
        <button
          onClick={onOpenCreateClip}
          className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-semibold text-xs shadow-md"
        >
          Criar o Primeiro Reel
        </button>
      </div>
    );
  }

  const isFollowing = isFollowingUser(currentClip.author.id);

  return (
    <PullToRefresh
      onRefresh={refetchClips}
      pullText="Puxa para atualizar Reels"
      releaseText="Larga para carregar novos Reels"
      refreshingText="A sincronizar Reels..."
      className="min-h-[85vh] flex justify-center pb-20"
    >
      <div className="relative w-full max-w-xl mx-auto px-2 sm:px-4 py-2 flex flex-col items-center select-none">
        
        {/* Immersive Vertical Reel Container */}
        <div className="relative w-full aspect-[9/16] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-800 flex items-center justify-center group">
          
          {/* Visual Reel Video / Poster Frame */}
          <div
            onClick={handleDoubleTap}
            className="absolute inset-0 cursor-pointer overflow-hidden flex items-center justify-center bg-black"
          >
            {currentClip.videoUrl && currentClip.videoUrl.endsWith('.mp4') ? (
              <video
                ref={videoRef}
                src={currentClip.videoUrl}
                poster={currentClip.posterUrl}
                playsInline
                loop
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full object-cover transition-transform duration-500 select-none protected-image no-drag"
              />
            ) : (
              <img
                src={currentClip.posterUrl || currentClip.videoUrl}
                alt={currentClip.description}
                referrerPolicy="no-referrer"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="w-full h-full object-cover transition-transform duration-500 select-none protected-image no-drag"
              />
            )}

            {/* Soft Ambient Depth Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

            {/* Play/Pause Center Indicator */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xl scale-110">
                  <Play className="w-8 h-8 ml-1" />
                </div>
              </div>
            )}

            {/* Double Tap Heart Burst Animation */}
            <div
              className={`absolute inset-0 flex items-center justify-center pointer-events-none z-30 transition-all duration-300 ${
                showHeartBurst ? 'opacity-100 scale-125' : 'opacity-0 scale-50'
              }`}
            >
              <div className="w-24 h-24 rounded-full bg-rose-500/30 backdrop-blur-md flex items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.7)] animate-bounce">
                <Heart className="w-14 h-14 text-rose-500 fill-rose-500" />
              </div>
            </div>
          </div>

          {/* Top Overlay Controls Bar */}
          <div className="absolute top-0 inset-x-0 p-3 sm:p-4 flex items-center justify-between z-20 backdrop-blur-[2px]">
            
            {/* Tab Selector: A Seguir / Para Ti */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('following');
                  setActiveIndex(0);
                }}
                className={`text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTab === 'following'
                    ? 'text-white bg-white/20 shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                A Seguir
              </button>

              <span className="w-1 h-1 rounded-full bg-white/20" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('forYou');
                  setActiveIndex(0);
                }}
                className={`text-xs font-bold px-3 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'forYou'
                    ? 'text-cyan-400 bg-white/20 shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span>Para Ti</span>
                {activeTab === 'forYou' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </button>
            </div>

            {/* Quick Utility Icons: Sound & Camera */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
                className="w-10 h-10 rounded-full bg-black/40 text-white backdrop-blur-md flex items-center justify-center hover:bg-black/60 active:scale-90 transition-transform shadow-md border border-white/10"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenCamera) {
                    onOpenCamera('REEL');
                  } else {
                    onOpenCreateClip();
                  }
                }}
                aria-label="Criar Reel"
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
                title="Criar novo Reel"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right-Hand Floating Engagement Rail */}
          <div className="absolute right-3.5 bottom-20 flex flex-col items-center gap-4 sm:gap-5 z-20">
            
            {/* Creator Avatar with Quick Add Follow Badge */}
            <div className="relative flex flex-col items-center">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  openUserProfile(currentClip.author);
                }}
                className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 shadow-md cursor-pointer hover:scale-105 transition-transform"
              >
                <OptimizedAvatar
                  src={currentClip.author.avatar}
                  alt={currentClip.author.name}
                  size="md"
                  className="w-full h-full rounded-full"
                />
              </div>

              {currentUser?.id !== currentClip.author.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollowUser(currentClip.author.id);
                  }}
                  aria-label="Seguir criador"
                  className={`absolute -bottom-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-md active:scale-75 transition-all ${
                    isFollowing ? 'bg-cyan-500' : 'bg-rose-500 hover:scale-110'
                  }`}
                >
                  {isFollowing ? <Check className="w-3 h-3" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Like Button */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLikeClip(currentClip.id);
                }}
                aria-label="Gostar"
                className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center active:scale-75 shadow-md border border-white/10 transition-all ${
                  currentClip.hasLiked
                    ? 'bg-rose-500 text-white scale-110'
                    : 'bg-black/40 text-white hover:text-rose-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${currentClip.hasLiked ? 'fill-current' : ''}`} />
              </button>
              <span className="text-[11px] font-mono tabular-nums text-white font-bold drop-shadow">
                {formatCount(currentClip.likesCount)}
              </span>
            </div>

            {/* Comment Button */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCommentsDrawer(true);
                }}
                aria-label="Comentar"
                className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:text-cyan-400 active:scale-75 transition-transform shadow-md border border-white/10"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <span className="text-[11px] font-mono tabular-nums text-white font-bold drop-shadow">
                {formatCount(currentClip.commentsCount)}
              </span>
            </div>

            {/* Save / Bookmark Button */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmarkClip(currentClip.id);
                }}
                aria-label="Guardar"
                className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center active:scale-75 shadow-md border border-white/10 transition-all ${
                  currentClip.isSaved
                    ? 'bg-amber-500 text-white'
                    : 'bg-black/40 text-white hover:text-amber-400'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${currentClip.isSaved ? 'fill-current' : ''}`} />
              </button>
              <span className="text-[11px] font-mono tabular-nums text-white font-bold drop-shadow">
                {currentClip.isSaved ? 'Guardado' : 'Guardar'}
              </span>
            </div>

            {/* Share Button */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                aria-label="Partilhar"
                className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:text-cyan-400 active:scale-75 transition-transform shadow-md border border-white/10"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <span className="text-[11px] font-mono tabular-nums text-white font-bold drop-shadow">
                {t('reels.share')}
              </span>
            </div>

            {/* Rotating Vinyl Audio Disc */}
            <div className="relative pt-1">
              <div
                className={`w-10 h-10 rounded-full bg-slate-900 p-1 shadow-[0_0_15px_rgba(76,215,246,0.35)] flex items-center justify-center border border-slate-700 ${
                  isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
                }`}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-950 via-slate-800 to-cyan-500 flex items-center justify-center">
                  <Music className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              </div>
              <Music className="w-3 h-3 text-cyan-400 absolute -top-1 -left-2 opacity-75 animate-bounce" />
            </div>

          </div>

          {/* Bottom Contextual Information Overlay */}
          <div className="absolute bottom-3 inset-x-0 px-4 pr-20 z-20 flex flex-col gap-2 text-left">
            
            {/* Creator Identity Line */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openUserProfile(currentClip.author);
                }}
                className="font-bold text-sm text-white hover:underline flex items-center gap-1 drop-shadow"
              >
                <span>@{currentClip.author.username}</span>
                {currentClip.author.isVerified && (
                  <span className="w-4 h-4 rounded-full bg-cyan-500 text-black text-[9px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCreateClip();
                }}
                className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-cyan-300 text-[11px] font-semibold active:scale-95 transition-all"
              >
                Remix
              </button>
            </div>

            {/* Caption with Toggle Expansion */}
            <div className="relative">
              <p
                className={`text-xs text-white leading-relaxed drop-shadow-sm ${
                  isCaptionExpanded ? '' : 'line-clamp-2'
                }`}
              >
                {currentClip.description}
              </p>
              {currentClip.description.length > 80 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCaptionExpanded(!isCaptionExpanded);
                  }}
                  className="text-[11px] text-white/70 font-semibold hover:text-white mt-0.5"
                >
                  {isCaptionExpanded ? 'menos' : 'mais'}
                </button>
              )}
            </div>

            {/* Hashtags */}
            {currentClip.tags && currentClip.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {currentClip.tags.map((tag) => (
                  <span key={tag} className="text-[11px] font-bold text-cyan-400 drop-shadow">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Audio Track Chip with Marquee Vibe */}
            <div className="flex items-center gap-2 bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-full w-fit max-w-[240px] border border-white/10 shadow-sm">
              <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <p className="text-[11px] text-white truncate font-medium">
                {currentClip.musicTrack.title} • {currentClip.musicTrack.artist} • Em alta
              </p>
            </div>

          </div>

          {/* Bottom Scrub Progress Track */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-30">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

        </div>

        {/* Vertical Navigation Pill (Desktop & Tablets) */}
        <div className="flex items-center justify-between w-full max-w-sm mt-3 px-1 text-xs">
          <button
            onClick={handlePrevClip}
            disabled={activeIndex === 0}
            className="px-4 py-2 rounded-xl font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ← Anterior
          </button>
          <span className="font-mono text-slate-500">
            {activeIndex + 1} de {displayedClips.length}
          </span>
          <button
            onClick={handleNextClip}
            disabled={activeIndex === displayedClips.length - 1}
            className="px-4 py-2 rounded-xl font-semibold bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition-colors cursor-pointer shadow-sm"
          >
            Próximo →
          </button>
        </div>

        {/* Interactive Slide-Up Quick Comments Sheet */}
        {showCommentsDrawer && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[75vh] flex flex-col border border-slate-200 dark:border-slate-800">
              
              {/* Grab handle */}
              <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white font-[var(--font-display)]">
                    Comentários
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-bold">
                    {currentClip.commentsCount}
                  </span>
                </div>
                <button
                  onClick={() => setShowCommentsDrawer(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comments list */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {currentClip.comments.length > 0 ? (
                  currentClip.comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2.5 text-xs">
                      <OptimizedAvatar
                        src={c.author.avatar}
                        alt={c.author.name}
                        size="xs"
                        className="shrink-0 mt-0.5"
                      />
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800">
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
                    Sê o primeiro a comentar este Nexora Reel!
                  </p>
                )}
              </div>

              {/* Comment input bar */}
              <form
                onSubmit={handleAddComment}
                className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
              >
                <OptimizedAvatar
                  src={currentUser?.avatar || ''}
                  alt={currentUser?.name || ''}
                  size="xs"
                />
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Adiciona um comentário..."
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 transition-all shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          </div>
        )}

        {currentClip && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            title={`Reel de ${currentClip.author.name} (@${currentClip.author.username})`}
            text={currentClip.description}
            url={`/?clip=${currentClip.id}`}
            itemType="clip"
            itemId={currentClip.id}
            authorName={currentClip.author.name}
            authorAvatar={currentClip.author.avatar}
            thumbnail={currentClip.posterUrl || currentClip.author.avatar}
          />
        )}

      </div>
    </PullToRefresh>
  );
};
