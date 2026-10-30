import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Post, Clip, UserActivity } from '../types';
import {
  MapPin,
  Link as LinkIcon,
  Briefcase,
  Calendar,
  Share2,
  MessageSquare,
  UserCheck,
  UserPlus,
  Edit3,
  Lock,
  Globe,
  Shield,
  Trash2,
  Power,
  Grid,
  Image,
  Film,
  Bookmark,
  Info,
  Check,
  X,
  Sparkles,
  Activity,
  Clock,
  Compass,
  Download,
  Search,
  ChevronRight,
  RotateCcw,
  KeyRound,
  Heart,
  Layers,
  PlusSquare,
  ShieldCheck,
} from 'lucide-react';
import { PostCard } from './PostCard';

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 45) return 'Agora mesmo';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Há ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Há ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ontem';
    return `Há ${diffDays} dias`;
  } catch {
    return 'Recentemente';
  }
}

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    selectedUserProfile,
    closeUserProfile,
    isFollowingUser,
    toggleFollowUser,
    posts,
    clips,
    updateProfile,
    deleteAccount,
    deactivateAccount,
    setActiveTab,
    setActiveConversationId,
    addToast,
    activities,
    clearActivities,
  } = useApp();

  const profileUser: User = selectedUserProfile || currentUser || {
    id: 'user_ines_valente',
    name: 'Dra. Inês Valente',
    username: 'inesvalente',
    email: 'ines@nexora.net',
    avatar: '/src/assets/images/avatar_creator_tech_1792880070535.jpg',
    coverImage: '/src/assets/images/hero_nexora_network_1792880070116.jpg',
    bio: 'Arquiteta de Sistemas & Investigadora em IA.',
    followersCount: 14820,
    followingCount: 394,
    postsCount: 128,
    isVerified: true,
    joinedDate: 'Março 2024',
  };

  const isOwner = currentUser?.id === profileUser.id;
  const isFollowing = isFollowingUser(profileUser.id);

  const [activeProfileTab, setActiveProfileTab] = useState<
    'posts' | 'photos' | 'videos' | 'reels' | 'saved' | 'activity' | 'about'
  >('posts');

  const [activityFilter, setActivityFilter] = useState<'all' | 'navigation' | 'posts' | 'saved' | 'security'>('all');
  const [activitySearch, setActivitySearch] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(profileUser.name);
  const [editBio, setEditBio] = useState(profileUser.bio);
  const [editLocation, setEditLocation] = useState(profileUser.location || '');
  const [editWebsite, setEditWebsite] = useState(profileUser.website || '');
  const [editProfession, setEditProfession] = useState(profileUser.profession || '');
  const [editIsPrivate, setEditIsPrivate] = useState(profileUser.isPrivate || false);
  const [edit2FA, setEdit2FA] = useState(profileUser.twoFactorEnabled || false);

  // Filter content for this user
  const userPosts = posts.filter(p => p.author.id === profileUser.id);
  const userPhotoPosts = userPosts.filter(p => p.mediaUrls && p.mediaUrls.length > 0);
  const userClips = clips.filter(c => c.author.id === profileUser.id);
  const savedPosts = posts.filter(p => p.isSaved);

  const handleShareProfile = () => {
    addToast(`Ligação do perfil @${profileUser.username} copiada!`, 'success');
  };

  const handleDirectMessage = () => {
    setActiveTab('messages');
  };

  const handleExportActivities = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activities, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `nexora_atividade_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast('Registo de atividade exportado em JSON com sucesso!', 'success');
    } catch {
      addToast('Não foi possível exportar a atividade.', 'error');
    }
  };

  const filteredActivities = activities.filter(act => {
    if (activityFilter === 'navigation' && act.type !== 'tab_navigation') return false;
    if (activityFilter === 'posts' && !['post_created', 'story_created', 'clip_created'].includes(act.type)) return false;
    if (activityFilter === 'saved' && !['bookmark_saved', 'reaction_added'].includes(act.type)) return false;
    if (activityFilter === 'security' && !['session_login', 'profile_updated', 'settings_changed'].includes(act.type)) return false;

    if (activitySearch.trim()) {
      const q = activitySearch.toLowerCase();
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchDesc = act.description.toLowerCase().includes(q);
      const matchMeta = act.metadata?.tab?.toLowerCase().includes(q) ||
        act.metadata?.targetName?.toLowerCase().includes(q) ||
        act.metadata?.details?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchMeta) return false;
    }

    return true;
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName,
      bio: editBio,
      location: editLocation,
      website: editWebsite,
      profession: editProfession,
      isPrivate: editIsPrivate,
      twoFactorEnabled: edit2FA,
    });
    setShowEditModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Back button if viewing another user */}
      {selectedUserProfile && (
        <button
          onClick={closeUserProfile}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline min-h-[36px]"
        >
          ← Voltar ao meu perfil
        </button>
      )}

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Cover Banner */}
        <div className="relative h-44 sm:h-64 w-full bg-slate-900">
          <img
            src={profileUser.coverImage}
            alt="Capa de perfil"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Profile Info Container */}
        <div className="px-5 sm:px-8 pb-6 relative">
          
          {/* Avatar and Top Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            
            {/* Avatar */}
            <div className="relative">
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                referrerPolicy="no-referrer"
                className="w-28 sm:w-36 h-28 sm:h-36 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-xl"
              />
              {profileUser.isPrivate && (
                <span className="absolute bottom-1 right-1 p-1.5 bg-slate-900 text-amber-400 rounded-full border border-slate-700 shadow" title="Perfil Privado">
                  <Lock className="w-4 h-4" />
                </span>
              )}
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {isOwner ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 min-h-[40px]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Perfil & Privacidade</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => toggleFollowUser(profileUser.id)}
                    className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all min-h-[40px] flex items-center gap-1.5 ${
                      isFollowing
                        ? 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>A seguir</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Seguir</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDirectMessage}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 min-h-[40px]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Mensagem</span>
                  </button>
                </>
              )}

              <button
                onClick={handleShareProfile}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Partilhar Perfil"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Names & Bio */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-[var(--font-display)]">
                {profileUser.name}
              </h1>
              {profileUser.isVerified && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                  ✓
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 font-mono">@{profileUser.username}</span>

            {profileUser.profession && (
              <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{profileUser.profession}</span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-2.5 leading-relaxed max-w-2xl">
              {profileUser.bio}
            </p>
          </div>

          {/* Metadata Row: Clean Unboxed Text with Separators */}
          <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500 dark:text-slate-400 mb-5">
            {profileUser.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{profileUser.location}</span>
              </div>
            )}
            {profileUser.website && (
              <div className="flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                <a
                  href={profileUser.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {profileUser.website.replace('https://', '')}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Membro desde {profileUser.joinedDate}</span>
            </div>
          </div>

          {/* Follow Stats Bar */}
          <div className="flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="font-bold font-mono tabular-nums text-slate-900 dark:text-white mr-1">
                {profileUser.postsCount}
              </span>
              <span className="text-slate-500">publicações</span>
            </div>
            <div>
              <span className="font-bold font-mono tabular-nums text-slate-900 dark:text-white mr-1">
                {profileUser.followersCount.toLocaleString()}
              </span>
              <span className="text-slate-500">seguidores</span>
            </div>
            <div>
              <span className="font-bold font-mono tabular-nums text-slate-900 dark:text-white mr-1">
                {profileUser.followingCount}
              </span>
              <span className="text-slate-500">a seguir</span>
            </div>
          </div>

          {/* Quick Recent Activity Callout for Owner */}
          {isOwner && activities.length > 0 && (
            <button
              onClick={() => setActiveProfileTab('activity')}
              className="w-full mt-4 flex items-center justify-between p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-left hover:bg-blue-100/60 dark:hover:bg-blue-900/30 transition-all group min-h-[44px]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[11px] font-semibold text-blue-900 dark:text-blue-200 block truncate">
                    Atividade Recente: <span className="font-normal text-slate-700 dark:text-slate-300">{activities[0]?.title}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formatRelativeTime(activities[0]?.timestamp)} • {activities.length} ações no cliente
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0 ml-2">
                <span className="hidden sm:inline">Histórico Completo</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          )}

        </div>

        {/* PROFILE TABS */}
        <div className="px-4 sm:px-8 border-t border-slate-200/80 dark:border-slate-800/80 flex gap-2 overflow-x-auto no-scrollbar bg-slate-50/50 dark:bg-slate-950/20">
          {[
            { id: 'posts', label: 'Publicações', icon: Grid },
            { id: 'photos', label: 'Fotografias', icon: Image },
            { id: 'videos', label: 'Vídeos', icon: Film },
            { id: 'reels', label: 'Clips', icon: Sparkles },
            ...(isOwner ? [{ id: 'saved', label: 'Guardados', icon: Bookmark }] : []),
            ...(isOwner ? [{ id: 'activity', label: 'Atividade Recente', icon: Activity }] : []),
            { id: 'about', label: 'Sobre & Segurança', icon: Info },
          ].map(tab => {
            const isActive = activeProfileTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveProfileTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap shrink-0 min-h-[44px] ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Tab Contents Area */}
      <div>
        {/* 1. Publicações Tab */}
        {activeProfileTab === 'posts' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            {userPosts.length > 0 ? (
              userPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                Ainda não há publicações neste perfil.
              </div>
            )}
          </div>
        )}

        {/* 2. Fotografias Tab */}
        {activeProfileTab === 'photos' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {userPhotoPosts.length > 0 ? (
              userPhotoPosts.flatMap((p, idx) =>
                (p.mediaUrls || []).map((url, i) => (
                  <div
                    key={`${idx}-${i}`}
                    className="aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 group relative"
                  >
                    <img
                      src={url}
                      alt="Foto"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))
              )
            ) : (
              <div className="col-span-full p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                Nenhuma fotografia publicada até ao momento.
              </div>
            )}
          </div>
        )}

        {/* 3. Vídeos Tab */}
        {activeProfileTab === 'videos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 relative group">
              <img
                src="/src/assets/images/hero_nexora_network_1792880070116.jpg"
                alt="Vídeo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-xs font-semibold px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md">
                  Apresentação de Arquitetura 2026 (12:40)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Reels (Clips) Tab */}
        {activeProfileTab === 'reels' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {userClips.length > 0 ? (
              userClips.map(clip => (
                <div
                  key={clip.id}
                  className="aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 relative group"
                >
                  <img
                    src={clip.posterUrl}
                    alt={clip.description}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 text-white">
                    <p className="text-xs line-clamp-2 leading-tight">{clip.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                Ainda sem clips verticais criados.
              </div>
            )}
          </div>
        )}

        {/* 5. Conteúdos Guardados (Privado ao Utilizador) */}
        {activeProfileTab === 'saved' && isOwner && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 rounded-xl text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Esta secção é privada e visível apenas para ti.</span>
            </div>
            {savedPosts.length > 0 ? (
              savedPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
              <p className="text-center text-xs text-slate-400 py-8">
                Nenhuma publicação guardada nos teus marcadores.
              </p>
            )}
          </div>
        )}

        {/* 6. Sobre & Segurança Tab */}
        {activeProfileTab === 'about' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 max-w-2xl mx-auto">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                Biografia & Especialidade
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {profileUser.bio}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                Áreas de Interesse
              </h3>
              <div className="flex flex-wrap gap-2">
                {(profileUser.interests || ['Tecnologia', 'Inovação']).map(i => (
                  <span
                    key={i}
                    className="text-xs text-slate-700 dark:text-slate-300 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>

            {isOwner && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-sm text-rose-600 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Zona de Gestão de Conta</span>
                </h3>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={deactivateAccount}
                    className="px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Power className="w-4 h-4" />
                    <span>Desativar Temporariamente</span>
                  </button>

                  <button
                    onClick={deleteAccount}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar Conta Definitivamente</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. Atividade Recente (Client-side Activity Tracker) */}
        {activeProfileTab === 'activity' && (
          <div className="space-y-5 max-w-3xl mx-auto animate-in fade-in duration-200">
            {/* Top Overview & Action Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white font-[var(--font-display)] flex items-center gap-2">
                      <span>Atividade Recente</span>
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                        {activities.length} registos
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Registo local das tuas interações no NEXORA HI para conveniência e navegação rápida (QoL).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportActivities}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors min-h-[38px]"
                    title="Exportar registo em formato JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar</span>
                  </button>

                  <button
                    onClick={clearActivities}
                    disabled={activities.length === 0}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-40 disabled:pointer-events-none min-h-[38px]"
                    title="Limpar histórico de atividades"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar</span>
                  </button>
                </div>
              </div>

              {/* KPI Quality of Life Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 block mb-1">Total de Ações</span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    {activities.length}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 block mb-1">Navegações</span>
                  <span className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {activities.filter(a => a.type === 'tab_navigation').length}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 block mb-1">Criações</span>
                  <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                    {activities.filter(a => ['post_created', 'story_created', 'clip_created'].includes(a.type)).length}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 block mb-1">Privacidade</span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>100% Local</span>
                  </span>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={activitySearch}
                    onChange={e => setActivitySearch(e.target.value)}
                    placeholder="Pesquisar nas tuas ações (ex: feed, publicação, login)..."
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[38px]"
                  />
                  {activitySearch && (
                    <button
                      onClick={() => setActivitySearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'Todas' },
                    { id: 'navigation', label: 'Navegação' },
                    { id: 'posts', label: 'Publicações' },
                    { id: 'saved', label: 'Favoritos' },
                    { id: 'security', label: 'Sessão' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setActivityFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                        activityFilter === f.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Activities Timeline List */}
            <div className="space-y-3">
              {filteredActivities.length > 0 ? (
                filteredActivities.map(act => {
                  const getIconAndStyle = () => {
                    switch (act.type) {
                      case 'post_created':
                        return {
                          icon: PlusSquare,
                          bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
                          badgeText: 'Publicação',
                        };
                      case 'tab_navigation':
                        return {
                          icon: Compass,
                          bg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60',
                          badgeText: 'Navegação',
                        };
                      case 'story_created':
                        return {
                          icon: Sparkles,
                          bg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60',
                          badgeText: 'Story',
                        };
                      case 'clip_created':
                        return {
                          icon: Film,
                          bg: 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/60',
                          badgeText: 'Clip',
                        };
                      case 'profile_updated':
                        return {
                          icon: UserCheck,
                          bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
                          badgeText: 'Perfil',
                        };
                      case 'bookmark_saved':
                        return {
                          icon: Bookmark,
                          bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
                          badgeText: 'Favorito',
                        };
                      case 'reaction_added':
                        return {
                          icon: Heart,
                          bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
                          badgeText: 'Reação',
                        };
                      case 'session_login':
                        return {
                          icon: KeyRound,
                          bg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/60',
                          badgeText: 'Segurança',
                        };
                      default:
                        return {
                          icon: Activity,
                          bg: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                          badgeText: 'Ação',
                        };
                    }
                  };

                  const { icon: Icon, bg, badgeText } = getIconAndStyle();

                  return (
                    <div
                      key={act.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${bg}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                              {act.title}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {badgeText}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {act.description}
                          </p>

                          {act.metadata?.details && (
                            <p className="text-[11px] text-slate-500 font-mono">
                              {act.metadata.details}
                            </p>
                          )}

                          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>{formatRelativeTime(act.timestamp)}</span>
                            <span>•</span>
                            <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quality of life quick navigate button if tab navigation */}
                      {act.metadata?.tab && (
                        <button
                          onClick={() => setActiveTab(act.metadata!.tab as any)}
                          className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-1 transition-all min-h-[34px]"
                          title={`Ir para ${act.metadata.tab}`}
                        >
                          <span>Visitar</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Nenhuma atividade encontrada
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    {activitySearch
                      ? `Não encontramos resultados para "${activitySearch}". Tenta outra pesquisa.`
                      : 'Nenhuma ação deste tipo foi registada ainda. Cria uma publicação ou navega entre abas para veres o histórico atualizar em tempo real.'}
                  </p>
                  {activitySearch && (
                    <button
                      onClick={() => setActivitySearch('')}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Limpar pesquisa
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Privacy & QoL Guarantee Note */}
            <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-3 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Este registo de atividade é gerado em tempo real no lado do cliente (navegador) e guardado exclusivamente no armazenamento local do teu dispositivo (Local Storage). Não é transmitido para terceiros e serve para enriquecer a tua experiência de navegação e controlo pessoal.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100 max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-base font-[var(--font-display)]">
                Editar Perfil & Privacidade
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Profissão ou Cargo
                </label>
                <input
                  type="text"
                  value={editProfession}
                  onChange={e => setEditProfession(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Biografia
                </label>
                <textarea
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={e => setEditLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Website Pessoal
                  </label>
                  <input
                    type="url"
                    value={editWebsite}
                    onChange={e => setEditWebsite(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Privacy switches */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold block text-slate-900 dark:text-white">
                      Perfil Privado
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Apenas seguidores aprovados podem ver as tuas publicações e clips.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsPrivate}
                    onChange={e => setEditIsPrivate(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 ml-3"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold block text-slate-900 dark:text-white">
                      Autenticação de Dois Fatores (2FA)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Exigir código OTP em cada novo início de sessão.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={edit2FA}
                    onChange={e => setEdit2FA(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 ml-3"
                  />
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
