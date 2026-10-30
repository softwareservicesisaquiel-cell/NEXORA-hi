import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';
import {
  Sparkles,
  Clock,
  UserCheck,
  Plus,
  Flame,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  Image,
  Film,
  Type,
} from 'lucide-react';
import { TRENDING_TOPICS } from '../data/mockData';

interface FeedViewProps {
  onOpenCreatePost: () => void;
  onOpenCreateStory: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({ onOpenCreatePost, onOpenCreateStory }) => {
  const {
    posts,
    stories,
    currentUser,
    setActiveViewingStoryIndex,
    allUsers,
    isFollowingUser,
    toggleFollowUser,
    openUserProfile,
    followingUserIds,
    communities,
    toggleJoinCommunity,
  } = useApp();

  const [feedFilter, setFeedFilter] = useState<'recommended' | 'recent' | 'following'>('recommended');

  // Filter posts based on tab
  const filteredPosts = [...posts].filter(p => {
    if (feedFilter === 'following') {
      return followingUserIds.includes(p.author.id) || (currentUser && p.author.id === currentUser.id);
    }
    return true;
  }).sort((a, b) => {
    if (feedFilter === 'recent') {
      return b.id.localeCompare(a.id);
    }
    // Recommended sorts by likes and activity
    return b.likesCount - a.likesCount;
  });

  const suggestedUsers = allUsers.filter(u => currentUser && u.id !== currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Feed Column (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STORIES BAR */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
              
              {/* Add Story Button */}
              {currentUser && (
                <button
                  onClick={onOpenCreateStory}
                  className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
                >
                  <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-blue-500/80 flex items-center justify-center group-hover:border-blue-600 transition-all">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[68px]">
                    O teu Story
                  </span>
                </button>
              )}

              {/* Stories List */}
              {stories.map((story, idx) => (
                <button
                  key={story.id}
                  onClick={() => setActiveViewingStoryIndex(idx)}
                  className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
                >
                  <div
                    className={`relative w-16 h-16 rounded-full p-[2.5px] transition-all group-hover:scale-105 ${
                      story.hasSeen
                        ? 'border-2 border-slate-300 dark:border-slate-700'
                        : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600'
                    }`}
                  >
                    <img
                      src={story.author.avatar}
                      alt={story.author.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-900"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[68px]">
                    {story.author.name.split(' ')[0]}
                  </span>
                </button>
              ))}

            </div>
          </section>

          {/* Quick Creator Trigger Box with 4 Publishing Modes */}
          {currentUser && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <button
                  onClick={onOpenCreatePost}
                  className="flex-1 text-left px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                >
                  No que estás a pensar, {currentUser.name.split(' ')[0]}?
                </button>
              </div>

              {/* 4 Dedicated Quick Publication Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onOpenCreatePost}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-colors"
                >
                  <Type className="w-4 h-4 text-blue-500" />
                  <span className="hidden sm:inline">Texto</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenCreatePost}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition-colors"
                >
                  <Image className="w-4 h-4 text-emerald-500" />
                  <span className="hidden sm:inline">Fotos</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenCreatePost}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 transition-colors"
                >
                  <Film className="w-4 h-4 text-purple-500" />
                  <span className="hidden sm:inline">Vídeos</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenCreateStory}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="hidden sm:inline">Momentos</span>
                </button>
              </div>
            </div>
          )}

          {/* Feed Filter Segmented Controls */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
              <button
                onClick={() => setFeedFilter('recommended')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                  feedFilter === 'recommended'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recomendados</span>
              </button>

              <button
                onClick={() => setFeedFilter('recent')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                  feedFilter === 'recent'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Mais Recentes</span>
              </button>

              <button
                onClick={() => setFeedFilter('following')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                  feedFilter === 'following'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>A Seguir</span>
              </button>
            </div>

            <span className="text-xs text-slate-500 font-mono tabular-nums hidden sm:inline">
              {filteredPosts.length} publicações
            </span>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
                <p className="text-sm font-medium">Nenhuma publicação encontrada nesta aba.</p>
                <p className="text-xs mt-1">Experimenta seguir mais criadores ou voltar aos Recomendados.</p>
              </div>
            )}
          </div>

        </div>

        {/* Sidebar Column (4 cols on lg, Desktop) */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6">
          
          {/* Trending Topics Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-[var(--font-display)]">
                Assuntos do Momento
              </h3>
            </div>

            <div className="space-y-3.5">
              {TRENDING_TOPICS.map((topic, i) => (
                <div key={i} className="group cursor-pointer">
                  <span className="text-[10px] text-slate-400 block">{topic.category}</span>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {topic.tag}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                    {topic.postCount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Creators Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-[var(--font-display)]">
                Quem Seguir
              </h3>
            </div>

            <div className="space-y-3.5">
              {suggestedUsers.map(user => {
                const following = isFollowingUser(user.id);
                return (
                  <div key={user.id} className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => openUserProfile(user)}
                      className="flex items-center gap-2.5 text-left min-w-0"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          @{user.username}
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => toggleFollowUser(user.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 min-h-[36px] ${
                        following
                          ? 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-500 hover:text-rose-500'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {following ? 'A seguir' : 'Seguir'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Communities Spotlight */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-[var(--font-display)]">
                Comunidades Ativas
              </h3>
            </div>

            <div className="space-y-3">
              {communities.slice(0, 3).map(comm => (
                <div key={comm.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs truncate text-slate-900 dark:text-white">
                      {comm.name}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                      {comm.membersCount.toLocaleString()} membros
                    </span>
                  </div>
                  <button
                    onClick={() => toggleJoinCommunity(comm.id)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors shrink-0 ${
                      comm.isJoined
                        ? 'text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700'
                        : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100'
                    }`}
                  >
                    {comm.isJoined ? 'Membro' : 'Entrar'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
};
