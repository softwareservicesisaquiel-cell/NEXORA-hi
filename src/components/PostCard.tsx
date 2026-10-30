import React, { useState } from 'react';
import { Post, ReactionType } from '../types';
import { useApp } from '../context/AppContext';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Flame,
  Lightbulb,
  Rocket,
  Smile,
  Send,
  CornerDownRight,
  MapPin,
  Music2,
  ExternalLink,
  Check,
  EyeOff,
  Flag,
  Trash2,
  Sparkles,
  Film,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const {
    currentUser,
    toggleLikePost,
    addCommentToPost,
    votePoll,
    toggleBookmarkPost,
    deletePost,
    openUserProfile,
    addToast,
  } = useApp();

  const [showReactionsBar, setShowReactionsBar] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const isAuthor = currentUser?.id === post.author.id;

  const handleVote = (optionId: string) => {
    votePoll(post.id, optionId);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addCommentToPost(post.id, commentInput.trim(), replyingToId || undefined);
    setCommentInput('');
    setReplyingToId(null);
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    addToast('Ligação da publicação copiada para a área de transferência!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
    setShowMenu(false);
  };

  const handleShare = () => {
    addToast('Publicação partilhada no teu perfil Nexora!', 'success');
  };

  const reactionEmojis: { type: ReactionType; icon: React.ComponentType<{ className?: string }>; label: string; color: string }[] = [
    { type: 'like', icon: Heart, label: 'Gostar', color: 'text-rose-500 fill-rose-500' },
    { type: 'love', icon: Flame, label: 'Amei', color: 'text-amber-500 fill-amber-500' },
    { type: 'insight', icon: Lightbulb, label: 'Inspirador', color: 'text-yellow-500 fill-yellow-500' },
    { type: 'rocket', icon: Rocket, label: 'Foguete', color: 'text-blue-500 fill-blue-500' },
    { type: 'laugh', icon: Smile, label: 'Riso', color: 'text-emerald-500 fill-emerald-500' },
  ];

  const currentReactionObj = reactionEmojis.find(r => r.type === post.userReaction);

  return (
    <article className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
      
      {/* Moment / Video Badge if applicable */}
      {(post.isMoment || post.mediaType === 'moment') && (
        <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>MOMENTO 24H · Destaque Especial</span>
        </div>
      )}

      {post.mediaType === 'video' && !post.isMoment && (
        <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
          <Film className="w-3 h-3 text-blue-500" />
          <span>VÍDEO EM ALTA DEFINIÇÃO</span>
        </div>
      )}

      {/* Post Header */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => openUserProfile(post.author)}
            className="relative group shrink-0"
          >
            <img
              src={post.author.avatar}
              alt={post.author.name}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 group-hover:ring-2 group-hover:ring-blue-500/40 transition-all"
            />
          </button>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => openUserProfile(post.author)}
                className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-tight"
              >
                {post.author.name}
              </button>
              {post.author.isVerified && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                  ✓
                </span>
              )}
            </div>

            {/* Clean unboxed metadata with subtle typographic separators */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span>@{post.author.username}</span>
              <span aria-hidden="true">·</span>
              <span>{post.createdAt}</span>
              {post.location && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{post.location}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Options Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Opções da publicação"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-30 text-xs">
              <button
                onClick={handleCopyLink}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                <span>Copiar Ligação</span>
              </button>
              <button
                onClick={() => {
                  toggleBookmarkPost(post.id);
                  setShowMenu(false);
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{post.isSaved ? 'Remover dos Guardados' : 'Guardar Publicação'}</span>
              </button>
              <button
                onClick={() => {
                  addToast('Deixarás de ver publicações semelhantes a esta no feed.', 'info');
                  setShowMenu(false);
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Ocultar Semelhantes</span>
              </button>
              <button
                onClick={() => {
                  addToast('Obrigado pela tua denúncia. A equipa de segurança irá avaliar.', 'info');
                  setShowMenu(false);
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Denunciar</span>
              </button>

              {isAuthor && (
                <>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  <button
                    onClick={() => {
                      deletePost(post.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Publicação</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      {post.backgroundGradient ? (
        <div className={`mb-3.5 p-6 rounded-2xl bg-gradient-to-br ${post.backgroundGradient} text-white font-bold text-base sm:text-lg text-center flex items-center justify-center min-h-[140px] shadow-md shadow-black/10`}>
          <p className="leading-relaxed drop-shadow-sm">{post.content}</p>
        </div>
      ) : (
        <div className="mb-3.5 text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line">
          {post.content}
        </div>
      )}

      {/* Hashtags list as unboxed styled text */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3.5 text-xs font-medium text-blue-600 dark:text-blue-400">
          {post.tags.map(tag => (
            <span key={tag} className="hover:underline cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Audio Badge if present */}
      {post.audioBadge && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 text-xs mb-3.5">
          <Music2 className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-medium">{post.audioBadge}</span>
        </div>
      )}

      {/* Interactive Poll Display */}
      {post.poll && (
        <div className="mb-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-3">
            📊 {post.poll.question}
          </h4>
          <div className="space-y-2">
            {post.poll.options.map(option => {
              const hasVoted = !!post.poll?.userVotedOptionId;
              const isSelected = post.poll?.userVotedOptionId === option.id;
              const total = Math.max(1, post.poll?.totalVotes || 0);
              const percentage = Math.round((option.votes / total) * 100);

              return (
                <button
                  key={option.id}
                  disabled={hasVoted}
                  onClick={() => handleVote(option.id)}
                  className={`relative w-full text-left p-2.5 rounded-lg overflow-hidden border transition-all text-xs font-medium ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-blue-400'
                  }`}
                >
                  {/* Progress fill bar */}
                  {hasVoted && (
                    <div
                      className={`absolute top-0 bottom-0 left-0 opacity-20 ${
                        isSelected ? 'bg-blue-600' : 'bg-slate-400 dark:bg-slate-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="truncate pr-2">{option.text}</span>
                    {hasVoted && (
                      <span className="font-mono tabular-nums font-bold text-slate-600 dark:text-slate-400 text-xs">
                        {percentage}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="tabular-nums font-mono">{post.poll.totalVotes.toLocaleString()} votos</span>
            <span>{post.poll.userVotedOptionId ? 'Voto submetido' : 'Toca numa opção para votar'}</span>
          </div>
        </div>
      )}

      {/* Media Rendering (Photos / Videos / Albums) */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="mb-4 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-950">
          <div className="relative aspect-video max-h-96 w-full flex items-center justify-center bg-black">
            {(() => {
              const currentMedia = post.mediaUrls[activeMediaIndex];
              const isVideo = post.mediaType === 'video' || currentMedia.endsWith('.mp4') || currentMedia.endsWith('.webm') || currentMedia.includes('video');
              if (isVideo) {
                return (
                  <video
                    src={currentMedia}
                    controls
                    playsInline
                    className="w-full h-full object-contain max-h-96"
                  />
                );
              }
              return (
                <img
                  src={currentMedia}
                  alt="Publicação mídia"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              );
            })()}
            {post.mediaUrls.length > 1 && (
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 text-white text-[11px] font-mono tabular-nums">
                {activeMediaIndex + 1} / {post.mediaUrls.length}
              </div>
            )}
          </div>
          {/* Thumbnails if album */}
          {post.mediaUrls.length > 1 && (
            <div className="p-2 flex gap-2 overflow-x-auto bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              {post.mediaUrls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    idx === activeMediaIndex ? 'border-blue-500 scale-105' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={url} alt="Miniatura" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Link Preview Card */}
      {post.linkPreview && (
        <a
          href={post.linkPreview.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800/40 hover:border-blue-500/50 transition-colors group"
        >
          {post.linkPreview.image && (
            <div className="aspect-[2/1] max-h-48 w-full overflow-hidden">
              <img
                src={post.linkPreview.image}
                alt={post.linkPreview.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
            </div>
          )}
          <div className="p-3">
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <ExternalLink className="w-3 h-3 text-blue-500" />
              <span>{post.linkPreview.domain}</span>
            </div>
            <h5 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-500 transition-colors">
              {post.linkPreview.title}
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
              {post.linkPreview.description}
            </p>
          </div>
        </a>
      )}

      {/* Post Metrics Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 py-2 border-t border-b border-slate-100 dark:border-slate-800/80 mb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono tabular-nums">
            <span className="text-blue-500">❤️</span>
            <span>{post.likesCount.toLocaleString()} gostos</span>
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono tabular-nums">
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:underline"
          >
            {post.commentsCount} comentários
          </button>
          <span>·</span>
          <span>{post.sharesCount} partilhas</span>
        </div>
      </div>

      {/* Actions Bar (Like / Comment / Share / Save) */}
      <div className="relative flex items-center justify-between">
        
        {/* Like Button with Hoverable Reaction Bar */}
        <div
          className="relative"
          onMouseEnter={() => setShowReactionsBar(true)}
          onMouseLeave={() => setShowReactionsBar(false)}
        >
          <button
            onClick={() => toggleLikePost(post.id, post.hasLiked ? undefined : 'like')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors min-h-[44px] ${
              post.hasLiked
                ? currentReactionObj ? currentReactionObj.color : 'text-rose-500'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {currentReactionObj ? (
              <currentReactionObj.icon className="w-4 h-4" />
            ) : (
              <Heart className="w-4 h-4" />
            )}
            <span>{currentReactionObj ? currentReactionObj.label : 'Gostar'}</span>
          </button>

          {/* Floating Emoji Reactions Bar */}
          {showReactionsBar && (
            <div className="absolute bottom-full left-0 mb-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-xl flex items-center gap-1.5 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {reactionEmojis.map(({ type, icon: Icon, label, color }) => (
                <button
                  key={type}
                  onClick={() => {
                    toggleLikePost(post.id, type);
                    setShowReactionsBar(false);
                  }}
                  title={label}
                  className="p-1.5 hover:scale-125 transition-transform rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment toggle button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comentar</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
        >
          <Share2 className="w-4 h-4" />
          <span>Partilhar</span>
        </button>

        {/* Bookmark Button */}
        <button
          onClick={() => toggleBookmarkPost(post.id)}
          className={`p-2.5 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
            post.isSaved
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={post.isSaved ? 'Remover dos Guardados' : 'Guardar'}
        >
          <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          
          {/* New Comment Input */}
          <form onSubmit={handleSendComment} className="flex items-start gap-2.5 mb-4">
            <img
              src={currentUser ? currentUser.avatar : '/src/assets/images/avatar_creator_tech_1792880070535.jpg'}
              alt="Eu"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
            />
            <div className="flex-1">
              {replyingToId && (
                <div className="flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 mb-1 px-1">
                  <span>A responder ao comentário...</span>
                  <button
                    type="button"
                    onClick={() => setReplyingToId(null)}
                    className="hover:underline text-slate-500"
                  >
                    Cancelar
                  </button>
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  placeholder={replyingToId ? 'Escreve uma resposta...' : 'Adiciona um comentário construtivo...'}
                  className="w-full pl-3 pr-10 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-800 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 dark:text-blue-400 disabled:opacity-30 hover:scale-110 transition-transform"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-3">
              {post.comments.map(c => (
                <div key={c.id} className="text-xs">
                  <div className="flex items-start gap-2.5">
                    <img
                      src={c.author.avatar}
                      alt={c.author.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {c.author.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {c.text}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-500">
                        <button
                          onClick={() => setReplyingToId(c.id)}
                          className="hover:text-blue-500 font-medium"
                        >
                          Responder
                        </button>
                        <span>·</span>
                        <span className="tabular-nums font-mono">{c.likesCount} gostos</span>
                      </div>
                    </div>
                  </div>

                  {/* Replies if any */}
                  {c.replies && c.replies.length > 0 && (
                    <div className="ml-9 mt-2 space-y-2 border-l-2 border-slate-200 dark:border-slate-800 pl-3">
                      {c.replies.map(reply => (
                        <div key={reply.id} className="flex items-start gap-2 text-xs">
                          <img
                            src={reply.author.avatar}
                            alt={reply.author.name}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                          />
                          <div className="flex-1 bg-slate-100/70 dark:bg-slate-800/80 rounded-lg p-2">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-semibold text-slate-900 dark:text-white text-[11px]">
                                {reply.author.name}
                              </span>
                              <span className="text-[9px] text-slate-400">{reply.createdAt}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                              {reply.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400 py-2">
              Ainda sem comentários. Sê o primeiro a partilhar uma opinião!
            </p>
          )}

        </div>
      )}

    </article>
  );
};
