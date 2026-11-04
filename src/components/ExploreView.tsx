import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  TrendingUp,
  Sparkles,
  Users,
  Film,
  Flame,
  Globe2,
  Compass,
  ArrowUpRight,
  Filter,
  Check,
  Bookmark,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { TRENDING_TOPICS } from '../data/mockData';
import { PostCard } from './PostCard';

export const ExploreView: React.FC = () => {
  const {
    posts,
    clips,
    allUsers,
    currentUser,
    communities,
    toggleJoinCommunity,
    isFollowingUser,
    toggleFollowUser,
    openUserProfile,
    setActiveTab,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeInterestFilter, setActiveInterestFilter] = useState<string>('all');

  // Categories list
  const categories = [
    { id: 'all', label: 'Tudo' },
    { id: 'tech', label: 'Tecnologia & IA' },
    { id: 'cinema', label: 'Cinema & Fotografia' },
    { id: 'design', label: 'Design & UX' },
    { id: 'security', label: 'Cibersegurança' },
    { id: 'startups', label: 'Inovação & Futuro' },
  ];

  // User's personal interests
  const userInterests = currentUser?.interests || [
    'Inteligência Artificial',
    'Design Systems',
    'Inovação',
  ];

  // Filter content based on search query, category, and personalization
  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      searchQuery === '' ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags && post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    if (!matchesSearch) return false;

    if (activeInterestFilter !== 'all') {
      const tagString = (post.tags || []).join(' ').toLowerCase() + ' ' + post.content.toLowerCase();
      if (activeInterestFilter === 'ia' && !tagString.includes('ia') && !tagString.includes('inteligência') && !tagString.includes('computação')) {
        return false;
      }
      if (activeInterestFilter === 'cinema' && !tagString.includes('cinema') && !tagString.includes('foto') && !tagString.includes('luz')) {
        return false;
      }
      if (activeInterestFilter === 'design' && !tagString.includes('design') && !tagString.includes('ux') && !tagString.includes('interface')) {
        return false;
      }
    }

    return true;
  });

  const filteredClips = clips.filter(clip => {
    return (
      searchQuery === '' ||
      clip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clip.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const filteredUsers = allUsers.filter(u => {
    if (currentUser && u.id === currentUser.id) return false;
    const q = searchQuery.toLowerCase().trim();
    return (
      q === '' ||
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.nexoraId && u.nexoraId.toLowerCase().includes(q)) ||
      (u.bio && u.bio.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Search Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/20 p-5 sm:p-8 shadow-sm overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>DESCOBERTA NEXORA</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight font-[var(--font-display)] text-slate-900 dark:text-white mb-2">
            Explora o pulso da rede
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Conteúdo curado em tempo real, tópicos de vanguarda e mentes brilhantes alinhadas com os teus interesses de pesquisa.
          </p>

          {/* Unified Global Search Bar */}
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('explore.searchPlaceholder')}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-md text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 text-xs text-slate-400 hover:text-slate-600"
              >
                {t('explore.clear')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Personalized Interests Lenses */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-[var(--font-display)]">
              Personalizado com base no teu perfil
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            {currentUser?.interests?.length || 3} tópicos ativos
          </span>
        </div>

        {/* Clean interactive filter buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveInterestFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
              activeInterestFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Todos os Tópicos
          </button>
          <button
            onClick={() => setActiveInterestFilter('ia')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
              activeInterestFilter === 'ia'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            🧠 Inteligência Artificial & Edge
          </button>
          <button
            onClick={() => setActiveInterestFilter('cinema')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
              activeInterestFilter === 'cinema'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            🎥 Cinema & Luz Natural
          </button>
          <button
            onClick={() => setActiveInterestFilter('design')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
              activeInterestFilter === 'design'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            📐 Design Systems & UX
          </button>
        </div>
      </div>

      {/* Trending Topics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white font-[var(--font-display)]">
              Tendências Emergentes
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums">Atualizado a cada 60s</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRENDING_TOPICS.map((topic, i) => (
            <div
              key={i}
              onClick={() => setSearchQuery(topic.tag.replace('#', ''))}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/50 transition-all cursor-pointer group shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">{topic.category}</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {topic.tag}
                </h4>
                <span className="text-xs text-slate-500 font-mono tabular-nums">{topic.postCount}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-950 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Creators Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white font-[var(--font-display)]">
              Criadores Recomendados para Ti
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => {
            const following = isFollowingUser(user.id);
            return (
              <div
                key={user.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <button
                      onClick={() => openUserProfile(user)}
                      className="flex items-center gap-3 text-left group"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 group-hover:ring-2 group-hover:ring-purple-500/40 transition-all select-none no-drag protected-image"
                      />
                      <div>
                        <div className="flex items-center gap-1 font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                          <span>{user.name}</span>
                          {user.isVerified && (
                            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-slate-500 font-mono">@{user.username}</span>
                          <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.2 rounded font-mono font-semibold">
                            {user.nexoraId}
                          </span>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => toggleFollowUser(user.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 min-h-[36px] ${
                        following
                          ? 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                      }`}
                    >
                      {following ? 'A seguir' : 'Seguir'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {user.bio}
                  </p>
                </div>

                {/* Unboxed metadata separator */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between font-mono tabular-nums">
                  <span>{user.followersCount.toLocaleString()} seguidores</span>
                  <span>{user.postsCount} publicações</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nexora Clips Vertical Previews */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-rose-500" />
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white font-[var(--font-display)]">
              Clips em Destaque
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('clips')}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            Ver todos os Clips →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {filteredClips.map(clip => (
            <div
              key={clip.id}
              onClick={() => setActiveTab('clips')}
              className="group relative aspect-[9/16] max-h-96 rounded-2xl overflow-hidden bg-slate-900 cursor-pointer shadow-md"
            >
              <img
                src={clip.posterUrl}
                alt={clip.description}
                referrerPolicy="no-referrer"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none no-drag protected-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-4">
                <span className="text-[10px] text-white/80 font-medium">@{clip.author.username}</span>
                <p className="text-xs font-semibold text-white line-clamp-2 mt-0.5 leading-snug">
                  {clip.description}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-white/90 font-mono tabular-nums">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    {clip.likesCount.toLocaleString()}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {clip.commentsCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Discussions / Posts Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white font-[var(--font-display)]">
              Publicações Mais Populares
            </h2>
          </div>
        </div>

        <div className="space-y-4 max-w-3xl">
          {filteredPosts.slice(0, 3).map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* Communities Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-emerald-500" />
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white font-[var(--font-display)]">
              Comunidades e Grupos em Alta
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {communities.map(comm => (
            <div
              key={comm.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={comm.iconImage}
                      alt={comm.name}
                      referrerPolicy="no-referrer"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 select-none no-drag protected-image"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {comm.name}
                      </h4>
                      <span className="text-xs text-slate-500 font-mono tabular-nums">
                        {comm.membersCount.toLocaleString()} membros · {comm.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleJoinCommunity(comm.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 min-h-[36px] ${
                      comm.isJoined
                        ? 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        : 'bg-blue-600 text-white hover:bg-blue-500'
                    }`}
                  >
                    {comm.isJoined ? 'Membro' : 'Aderir'}
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                  {comm.description}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-blue-600 dark:text-blue-400">Em debate: </span>
                {comm.recentTopic}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
