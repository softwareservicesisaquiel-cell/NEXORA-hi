import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';
import { PullToRefresh } from './PullToRefresh';
import { OptimizedAvatar } from './OptimizedAvatar';
import {
  Sparkles,
  Clock,
  UserCheck,
  Plus,
  Image,
  Film,
  Type,
  RefreshCw,
} from 'lucide-react';

interface FeedViewProps {
  onOpenCreatePost: () => void;
  onOpenCreateStory: () => void;
  onOpenCamera?: (mode?: 'STORY' | 'REEL' | 'LIVE') => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  onOpenCreatePost,
  onOpenCreateStory,
  onOpenCamera,
}) => {
  const {
    posts,
    stories,
    currentUser,
    setActiveViewingStoryIndex,
    followingUserIds,
    refetchFeed,
    t,
  } = useApp();

  const [feedFilter, setFeedFilter] = useState<'recommended' | 'following' | 'recent'>('recommended');
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    await refetchFeed();
    setTimeout(() => setIsManualRefreshing(false), 400);
  };

  // Filter posts based on active feed filter
  const filteredPosts = [...posts]
    .filter((p) => {
      if (feedFilter === 'following') {
        return followingUserIds.includes(p.author.id) || (currentUser && p.author.id === currentUser.id);
      }
      return true;
    })
    .sort((a, b) => {
      if (feedFilter === 'recent') {
        return b.id.localeCompare(a.id);
      }
      return b.likesCount - a.likesCount;
    });

  return (
    <PullToRefresh onRefresh={refetchFeed} className="min-h-[80vh]">
      <div className="w-full max-w-xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* 1. STORIES CAROUSEL */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-3 sm:p-4 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-0.5">
            {/* Add Own Story Button */}
            {currentUser && (
              <button
                onClick={() => (onOpenCamera ? onOpenCamera('STORY') : onOpenCreateStory())}
                className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none cursor-pointer"
              >
                <div className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-full p-0.5 border-2 border-dashed border-blue-500 flex items-center justify-center group-hover:border-blue-400 transition-all">
                  <OptimizedAvatar
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    size="lg"
                    className="w-full h-full group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md border-2 border-white dark:border-slate-900">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[64px]">
                  {t('feed.yourStory')}
                </span>
              </button>
            )}

            {/* Real Stories from registered users */}
            {stories.map((story, idx) => (
              <button
                key={story.id}
                onClick={() => setActiveViewingStoryIndex(idx)}
                className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none cursor-pointer"
              >
                <div
                  className={`relative w-15 h-15 sm:w-16 sm:h-16 rounded-full p-[2.5px] transition-all group-hover:scale-105 ${
                    story.hasSeen
                      ? 'border-2 border-slate-300 dark:border-slate-700'
                      : 'bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600'
                  }`}
                >
                  <OptimizedAvatar
                    src={story.author.avatar}
                    alt={story.author.name}
                    size="lg"
                    className="w-full h-full border-2 border-white dark:border-slate-900"
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[64px]">
                  {story.author.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 2. COMPACT CREATOR TRIGGER BOX */}
        {currentUser && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-3.5 shadow-sm space-y-2.5">
            <div className="flex items-center gap-3">
              <OptimizedAvatar
                src={currentUser.avatar}
                alt={currentUser.name}
                size="sm"
                className="shrink-0"
              />
              <button
                onClick={onOpenCreatePost}
                className="flex-1 text-left px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs sm:text-sm text-slate-500 dark:text-slate-400 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
              >
                {t('feed.shareThoughts')}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={onOpenCreatePost}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <Type className="w-4 h-4 text-blue-500" />
                <span>{t('feed.text')}</span>
              </button>

              <button
                type="button"
                onClick={onOpenCreatePost}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                <Image className="w-4 h-4 text-emerald-500" />
                <span>{t('feed.photo')}</span>
              </button>

              <button
                type="button"
                onClick={onOpenCreatePost}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 transition-colors cursor-pointer"
              >
                <Film className="w-4 h-4 text-purple-500" />
                <span>{t('feed.video')}</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. CLEAN FEED FILTER TABS */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setFeedFilter('recommended')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                feedFilter === 'recommended'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('feed.forYou')}</span>
            </button>

            <button
              onClick={() => setFeedFilter('following')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                feedFilter === 'following'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t('feed.following')}</span>
            </button>

            <button
              onClick={() => setFeedFilter('recent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                feedFilter === 'recent'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{t('feed.recent')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isManualRefreshing}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isManualRefreshing ? 'animate-spin text-blue-500' : ''}`} />
            </button>
            <span className="text-[11px] text-slate-400 font-mono">
              {filteredPosts.length} {t('feed.postsCount')}
            </span>
          </div>
        </div>

        {/* 4. REAL PUBLICATIONS STREAM */}
        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 space-y-2">
              <Sparkles className="w-8 h-8 text-blue-500 mx-auto opacity-70" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {t('feed.noPostsTitle')}
              </p>
              <p className="text-xs text-slate-400">
                {t('feed.noPostsDesc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
};
