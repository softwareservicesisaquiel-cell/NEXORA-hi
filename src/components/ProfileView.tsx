import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Share2,
  MessageSquare,
  UserCheck,
  UserPlus,
  Edit3,
  Lock,
  Grid,
  Image,
  Film,
  Bookmark,
  X,
  Check,
  Sparkles,
  Plus,
  Play,
  Tag,
  CheckCircle2,
  Sliders,
  Settings,
} from 'lucide-react';
import { PostCard } from './PostCard';
import { ShareModal } from './ShareModal';

interface ProfileViewProps {
  onOpenManagement?: (section?: any) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenManagement }) => {
  const {
    currentUser,
    selectedUserProfile,
    closeUserProfile,
    isFollowingUser,
    toggleFollowUser,
    posts,
    clips,
    updateProfile,
    setActiveTab,
    addToast,
    t,
  } = useApp();

  const profileUser: User | null = selectedUserProfile || currentUser;

  const [activeProfileTab, setActiveProfileTab] = useState<'posts' | 'clips' | 'saved' | 'tagged'>('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddHighlightModal, setShowAddHighlightModal] = useState(false);
  const [newHighlightTitle, setNewHighlightTitle] = useState('');
  const [highlights, setHighlights] = useState<{ id: string; title: string; cover: string }[]>([
    { id: 'hl-1', title: 'Momentos', cover: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' },
    { id: 'hl-2', title: 'Viagens', cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80' },
    { id: 'hl-3', title: 'Nexora', cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80' },
  ]);

  // Edit form states
  const [editName, setEditName] = useState(profileUser?.name || '');
  const [editBio, setEditBio] = useState(profileUser?.bio || '');
  const [editLocation, setEditLocation] = useState(profileUser?.location || '');
  const [editWebsite, setEditWebsite] = useState(profileUser?.website || '');
  const [editIsPrivate, setEditIsPrivate] = useState(profileUser?.isPrivate || false);

  if (!profileUser) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center text-slate-500">
        A carregar perfil NEXORA...
      </div>
    );
  }

  const isOwner = currentUser?.id === profileUser.id;
  const isFollowing = isFollowingUser(profileUser.id);

  // Filter content
  const userPosts = posts.filter(p => p.author.id === profileUser.id);
  const userPhotoPosts = userPosts.filter(p => p.mediaUrls && p.mediaUrls.length > 0);
  const userClips = clips.filter(c => c.author.id === profileUser.id);
  const savedPosts = posts.filter(p => p.isSaved);

  const handleShareProfile = () => {
    setShowShareModal(true);
  };

  const handleDirectMessage = () => {
    setActiveTab('messages');
  };

  const handleOpenEdit = () => {
    setEditName(profileUser.name);
    setEditBio(profileUser.bio);
    setEditLocation(profileUser.location || '');
    setEditWebsite(profileUser.website || '');
    setEditIsPrivate(profileUser.isPrivate || false);
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: editName.trim() || profileUser.name,
      bio: editBio.trim(),
      location: editLocation.trim(),
      website: editWebsite.trim(),
      isPrivate: editIsPrivate,
    });
    setShowEditModal(false);
    addToast('Perfil atualizado com sucesso!', 'success');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      
      {/* Return to own profile if visiting someone else */}
      {selectedUserProfile && (
        <button
          onClick={closeUserProfile}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline min-h-[36px] cursor-pointer"
        >
          ← Voltar ao meu perfil
        </button>
      )}

      {/* Profile Card Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Cover Photo */}
        <div className="relative h-36 sm:h-48 w-full bg-slate-950">
          <img
            src={profileUser.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'}
            alt="Capa"
            referrerPolicy="no-referrer"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            className="w-full h-full object-cover select-none no-drag protected-image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Profile Content */}
        <div className="px-4 sm:px-6 pb-6 relative">
          
          {/* Avatar & Action Button Row */}
          <div className="flex items-end justify-between gap-3 -mt-14 sm:-mt-16 mb-4">
            
            {/* Avatar */}
            <div className="relative">
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                referrerPolicy="no-referrer"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-xl select-none no-drag protected-image"
              />
              {profileUser.isPrivate && (
                <span
                  className="absolute bottom-1 right-1 p-1.5 bg-slate-900 text-amber-400 rounded-full border border-slate-700 shadow"
                  title="Perfil Privado"
                >
                  <Lock className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isOwner ? (
                <>
                  <button
                    onClick={handleOpenEdit}
                    className="px-3.5 py-2 rounded-2xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 min-h-[38px] cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Perfil</span>
                  </button>

                  {onOpenManagement && (
                    <button
                      onClick={() => onOpenManagement('settings')}
                      className="px-3.5 py-2 rounded-2xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-1.5 min-h-[38px] cursor-pointer"
                      title="Abrir Área de Gestão e Informação da Nexora"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Gestão & Info</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => toggleFollowUser(profileUser.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all min-h-[38px] flex items-center gap-1.5 cursor-pointer ${
                      isFollowing
                        ? 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
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
                    className="px-3.5 py-2 rounded-2xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 min-h-[38px] cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Mensagem</span>
                  </button>
                </>
              )}

              <button
                onClick={handleShareProfile}
                className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                title="Partilhar Perfil"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Names & Discreet NEXORA ID */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-[var(--font-display)]">
                {profileUser.name}
              </h1>
              {profileUser.isVerified && (
                <span
                  className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold shadow-md shadow-blue-500/30"
                  title="Perfil Oficial Verificado"
                >
                  ✓
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>@{profileUser.username}</span>
              <span>•</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{profileUser.nexoraId}</span>
            </div>
          </div>

          {/* Bio */}
          {profileUser.bio && (
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              {profileUser.bio}
            </p>
          )}

          {/* Metadata details */}
          <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500 dark:text-slate-400 mb-4">
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
                  href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {profileUser.website.replace('https://', '').replace('http://', '')}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Membro desde {profileUser.joinedDate}</span>
            </div>
          </div>

          {/* Followers / Following Stats Row */}
          <div className="flex items-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
            <div>
              <span className="font-bold font-mono text-slate-900 dark:text-white mr-1.5">
                {userPosts.length}
              </span>
              <span className="text-slate-500">{t('profile.posts')}</span>
            </div>

            <div>
              <span className="font-bold font-mono text-slate-900 dark:text-white mr-1.5">
                {profileUser.followersCount.toLocaleString()}
              </span>
              <span className="text-slate-500">{t('profile.followers')}</span>
            </div>

            <div>
              <span className="font-bold font-mono text-slate-900 dark:text-white mr-1.5">
                {profileUser.followingCount}
              </span>
              <span className="text-slate-500">{t('profile.following')}</span>
            </div>
          </div>

        </div>

        {/* Stories Highlights Carousel (Instagram style) */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto no-scrollbar flex items-center gap-4 bg-slate-50/30 dark:bg-slate-900/40">
          {isOwner && (
            <button
              onClick={() => setShowAddHighlightModal(true)}
              className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Novo</span>
            </button>
          )}

          {highlights.map((hl) => (
            <button
              key={hl.id}
              onClick={() => addToast(`A reproduzir destaque: ${hl.title}`, 'info')}
              className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full p-[2px] border-2 border-slate-300 dark:border-slate-700 group-hover:border-blue-500 transition-colors overflow-hidden">
                <img
                  src={hl.cover}
                  alt={hl.title}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform select-none no-drag protected-image"
                />
              </div>
              <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium truncate max-w-[58px]">
                {hl.title}
              </span>
            </button>
          ))}
        </div>

        {/* Clean 4 Social Profile Tabs */}
        <div className="px-2 sm:px-6 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-around bg-slate-50/50 dark:bg-slate-950/40">
          <button
            onClick={() => setActiveProfileTab('posts')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeProfileTab === 'posts'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Publicações</span>
          </button>

          <button
            onClick={() => setActiveProfileTab('clips')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeProfileTab === 'clips'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Reels</span>
          </button>

          {isOwner && (
            <button
              onClick={() => setActiveProfileTab('saved')}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeProfileTab === 'saved'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Guardados</span>
            </button>
          )}

          <button
            onClick={() => setActiveProfileTab('tagged')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeProfileTab === 'tagged'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Identificados</span>
          </button>
        </div>

      </div>

      {/* Tab Content Stream */}
      <div>
        {activeProfileTab === 'posts' && (
          <div className="space-y-4">
            {userPosts.length > 0 ? (
              userPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                Ainda não há publicações neste perfil.
              </div>
            )}
          </div>
        )}

        {activeProfileTab === 'clips' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {userClips.length > 0 ? (
              userClips.map(clip => (
                <div
                  key={clip.id}
                  className="aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 relative border border-slate-200 dark:border-slate-800 group shadow-sm"
                >
                  <video
                    src={clip.videoUrl}
                    poster={clip.posterUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-2.5">
                    <div className="flex items-center justify-end">
                      <span className="flex items-center gap-1 text-[10px] text-white/90 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                        <Play className="w-3 h-3 fill-white" />
                        <span>{(clip.viewsCount ?? (clip.likesCount * 3 || 120)).toLocaleString()}</span>
                      </span>
                    </div>
                    <span className="text-white text-[11px] font-medium line-clamp-2">
                      {clip.description}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                Nenhum clip vertical publicado.
              </div>
            )}
          </div>
        )}

        {activeProfileTab === 'saved' && isOwner && (
          <div className="space-y-4">
            {savedPosts.length > 0 ? (
              savedPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                Nenhuma publicação guardada ainda.
              </div>
            )}
          </div>
        )}

        {activeProfileTab === 'tagged' && (
          <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
            <Tag className="w-8 h-8 mx-auto mb-2 text-slate-400 stroke-1" />
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fotos e vídeos em que foi identificado
            </p>
            <p className="text-[11px] text-slate-400">
              Quando outras pessoas identificarem @{profileUser.username} em publicações, elas aparecerão aqui.
            </p>
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Editar Perfil
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Biografia
                </label>
                <textarea
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  rows={3}
                  placeholder="Escreva algo sobre si..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Localização
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  placeholder="ex: Lisboa, Portugal"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Website ou Link
                </label>
                <input
                  type="text"
                  value={editWebsite}
                  onChange={e => setEditWebsite(e.target.value)}
                  placeholder="ex: portfolio.me"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Conta Privada
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Apenas seguidores aprovados vêem as tuas publicações.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={editIsPrivate}
                  onChange={e => setEditIsPrivate(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {profileUser && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={`Perfil NEXORA de ${profileUser.name} (@${profileUser.username})`}
          text={`Segue ${profileUser.name} no NEXORA! ${profileUser.bio || ''}`}
          url={`/?user=${profileUser.username || profileUser.id}`}
          itemType="profile"
          itemId={profileUser.id}
          authorName={profileUser.name}
          authorAvatar={profileUser.avatar}
          thumbnail={profileUser.avatar}
        />
      )}

      {/* ADD HIGHLIGHT MODAL */}
      {showAddHighlightModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base font-[var(--font-display)]">Novo Destaque</h3>
              <button
                onClick={() => setShowAddHighlightModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome do Destaque
                </label>
                <input
                  type="text"
                  value={newHighlightTitle}
                  onChange={(e) => setNewHighlightTitle(e.target.value)}
                  placeholder="ex: Verão 2026, Viagens, Criatividade"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-blue-500"
                  maxLength={15}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddHighlightModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newHighlightTitle.trim()) {
                      addToast('Insere um nome para o destaque', 'error');
                      return;
                    }
                    const newHl = {
                      id: `hl-${Date.now()}`,
                      title: newHighlightTitle.trim(),
                      cover: profileUser.avatar,
                    };
                    setHighlights((prev) => [...prev, newHl]);
                    setNewHighlightTitle('');
                    setShowAddHighlightModal(false);
                    addToast('Destaque criado com sucesso!', 'success');
                  }}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
