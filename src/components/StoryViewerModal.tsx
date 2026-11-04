import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Send,
  Music,
  Eye,
  Pause,
  Play,
  Flame,
  Sparkles,
} from 'lucide-react';

export const StoryViewerModal: React.FC = () => {
  const {
    stories,
    activeViewingStoryIndex,
    setActiveViewingStoryIndex,
    markStoryAsSeen,
    sendMessage,
    conversations,
    currentUser,
    addToast,
  } = useApp();

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');

  const activeStory =
    activeViewingStoryIndex !== null && stories[activeViewingStoryIndex]
      ? stories[activeViewingStoryIndex]
      : null;

  // Mark story as viewed
  useEffect(() => {
    if (activeStory) {
      markStoryAsSeen(activeStory.id);
      setProgress(0);
    }
  }, [activeViewingStoryIndex, activeStory]);

  // Story auto-advance timer
  useEffect(() => {
    if (!activeStory || isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Go to next story or close
          if (activeViewingStoryIndex !== null && activeViewingStoryIndex < stories.length - 1) {
            setActiveViewingStoryIndex(activeViewingStoryIndex + 1);
            return 0;
          } else {
            setActiveViewingStoryIndex(null);
            return 100;
          }
        }
        return prev + 2; // ~5 seconds duration
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeViewingStoryIndex, activeStory, isPaused, stories.length]);

  if (!activeStory || activeViewingStoryIndex === null) return null;

  const handleNext = () => {
    if (activeViewingStoryIndex < stories.length - 1) {
      setActiveViewingStoryIndex(activeViewingStoryIndex + 1);
    } else {
      setActiveViewingStoryIndex(null);
    }
  };

  const handlePrev = () => {
    if (activeViewingStoryIndex > 0) {
      setActiveViewingStoryIndex(activeViewingStoryIndex - 1);
    }
  };

  const handleSendReaction = (emoji: string) => {
    addToast(`Reação enviada: ${emoji}`, 'success');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser) return;

    // Find conversation with story author or notify
    const existingConv = conversations.find(
      c => !c.isGroup && c.participants.some(p => p.id === activeStory.author.id)
    );
    if (existingConv) {
      sendMessage(existingConv.id, `Em resposta ao story: "${replyText.trim()}"`);
    }
    addToast(`Resposta enviada para @${activeStory.author.username}!`, 'success');
    setReplyText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Container simulating smartphone / vertical viewport */}
      <div className="relative w-full max-w-sm h-full max-h-[820px] bg-slate-900 rounded-none sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10 select-none">
        
        {/* Progress Bar Header */}
        <div className="absolute top-0 left-0 right-0 z-30 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Segmented Progress bars */}
          <div className="flex items-center gap-1.5 mb-3">
            {stories.map((st, idx) => {
              let width = '0%';
              if (idx < activeViewingStoryIndex) width = '100%';
              else if (idx === activeViewingStoryIndex) width = `${progress}%`;

              return (
                <div key={st.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{ width }}
                  />
                </div>
              );
            })}
          </div>

          {/* Author Details and Controls */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <img
                src={activeStory.author.avatar}
                alt={activeStory.author.name}
                referrerPolicy="no-referrer"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-full object-cover border-2 border-white/60 select-none no-drag protected-image"
              />
              <div>
                <h4 className="font-bold text-xs leading-none drop-shadow flex items-center gap-1">
                  <span>{activeStory.author.name}</span>
                  {activeStory.author.isVerified && (
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] flex items-center justify-center font-bold">
                      ✓
                    </span>
                  )}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-white/80 mt-1">
                  <span>@{activeStory.author.username}</span>
                  <span>·</span>
                  <span>{activeStory.createdAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setActiveViewingStoryIndex(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Music Track Badge if present */}
        {activeStory.musicTrack && (
          <div className="absolute top-16 left-3 z-30 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px]">
            <Music className="w-3 h-3 animate-spin text-blue-400" />
            <span className="truncate max-w-[200px]">{activeStory.musicTrack}</span>
          </div>
        )}

        {/* Story Body Canvas */}
        <div
          onClick={e => {
            // Click left third for prev, right two-thirds for next
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX < rect.width * 0.35) {
              handlePrev();
            } else {
              handleNext();
            }
          }}
          className="relative flex-1 flex items-center justify-center cursor-pointer"
        >
          {activeStory.mediaType === 'image' && activeStory.mediaUrl && (
            <img
              src={activeStory.mediaUrl}
              alt="Story"
              referrerPolicy="no-referrer"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              className="w-full h-full object-cover select-none no-drag protected-image"
            />
          )}

          {activeStory.mediaType === 'text' && (
            <div
              className={`w-full h-full bg-gradient-to-br ${
                activeStory.textBackgroundGradient || 'from-blue-600 to-purple-700'
              } flex items-center justify-center p-8 text-center text-white`}
            >
              <p className="text-xl sm:text-2xl font-bold font-[var(--font-display)] leading-relaxed drop-shadow-md">
                {activeStory.textContent}
              </p>
            </div>
          )}

          {/* Stickers overlay */}
          {activeStory.stickers && (
            <div className="absolute bottom-28 left-4 flex flex-wrap gap-2 z-20">
              {activeStory.stickers.map((stk, i) => (
                <div
                  key={i}
                  className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white text-xs font-semibold shadow-lg"
                >
                  {stk}
                </div>
              ))}
            </div>
          )}

          {/* Caption banner if present */}
          {activeStory.caption && (
            <div className="absolute bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
              <p className="text-xs text-white drop-shadow leading-relaxed">
                {activeStory.caption}
              </p>
            </div>
          )}

          {/* Prev/Next overlay controls */}
          {activeViewingStoryIndex > 0 && (
            <button
              onClick={e => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white/80 hover:text-white backdrop-blur-sm z-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={e => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white/80 hover:text-white backdrop-blur-sm z-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Interactive Bar (Viewers + Quick Reply + Emojis) */}
        <div className="relative z-30 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
          {/* Quick emoji reactions */}
          <div className="flex items-center justify-around mb-2.5 px-2">
            {['❤️', '🔥', '👏', '😮', '😂', '🚀'].map(emoji => (
              <button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                className="text-lg hover:scale-130 transition-transform active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder={`Enviar mensagem a @${activeStory.author.username}...`}
              className="flex-1 px-3.5 py-2 text-xs bg-white/15 border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-white"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="p-2 text-white bg-blue-600 disabled:opacity-40 rounded-full hover:bg-blue-500 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Viewers count badge */}
          <div className="mt-2 text-center text-[10px] text-white/70 flex items-center justify-center gap-1 font-mono tabular-nums">
            <Eye className="w-3 h-3" />
            <span>{activeStory.viewersCount} visualizações</span>
          </div>
        </div>

      </div>
    </div>
  );
};
