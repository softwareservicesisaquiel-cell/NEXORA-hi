import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Post,
  Story,
  Clip,
  Conversation,
  Community,
  JobOpportunity,
  CallSession,
  ReactionType,
  Message,
  UserActivity,
  ActivityType,
} from '../types';
import {
  CURRENT_USER,
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_CLIPS,
  INITIAL_CONVERSATIONS,
  MOCK_COMMUNITIES,
  MOCK_JOBS,
  MOCK_USERS,
} from '../data/mockData';

export type MainTab = 'feed' | 'clips' | 'messages' | 'explore' | 'network' | 'profile';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  selectedUserProfile: User | null;
  openUserProfile: (user: User) => void;
  closeUserProfile: () => void;
  posts: Post[];
  stories: Story[];
  clips: Clip[];
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  login: (email: string, password?: string) => Promise<boolean>;
  loginWithSocial: (provider: 'google' | 'facebook', profileData?: { name?: string; email?: string; avatar?: string }) => Promise<boolean>;
  register: (data: { name: string; username: string; email: string; password?: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updated: Partial<User>) => void;
  deleteAccount: () => void;
  deactivateAccount: () => void;
  createPost: (postData: {
    content: string;
    mediaUrls?: string[];
    mediaType?: 'none' | 'image' | 'video' | 'album' | 'moment';
    backgroundGradient?: string;
    isMoment?: boolean;
    tags?: string[];
    poll?: { question: string; options: string[] };
    audience?: 'public' | 'followers' | 'close_friends';
    location?: string;
  }) => void;
  toggleLikePost: (postId: string, reaction?: ReactionType) => void;
  addCommentToPost: (postId: string, text: string, replyToCommentId?: string) => void;
  votePoll: (postId: string, optionId: string) => void;
  toggleBookmarkPost: (postId: string) => void;
  deletePost: (postId: string) => void;
  createStory: (storyData: {
    mediaUrl?: string;
    mediaType: 'image' | 'video' | 'text';
    textContent?: string;
    textBackgroundGradient?: string;
    caption?: string;
    musicTrack?: string;
  }) => void;
  activeViewingStoryIndex: number | null;
  setActiveViewingStoryIndex: (idx: number | null) => void;
  markStoryAsSeen: (storyId: string) => void;
  followingUserIds: string[];
  toggleFollowUser: (userId: string) => void;
  isFollowingUser: (userId: string) => boolean;
  createClip: (clipData: {
    posterUrl: string;
    description: string;
    tags: string[];
    musicTitle: string;
    musicArtist: string;
  }) => void;
  toggleLikeClip: (clipId: string) => void;
  toggleBookmarkClip: (clipId: string) => void;
  sendMessage: (
    conversationId: string,
    text: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video' | 'audio' | 'doc',
    replyToId?: string
  ) => void;
  addReactionToMessage: (conversationId: string, messageId: string, emoji: string) => void;
  activeCall: CallSession;
  startCall: (targetUser: User, isVideo: boolean) => void;
  updateActiveCall: (updates: Partial<CallSession>) => void;
  endCall: () => void;
  communities: Community[];
  toggleJoinCommunity: (communityId: string) => void;
  jobs: JobOpportunity[];
  toggleSaveJob: (jobId: string) => void;
  applyToJob: (jobId: string) => void;
  toasts: ToastItem[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  allUsers: User[];
  activities: UserActivity[];
  logActivity: (activity: Omit<UserActivity, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_ACTIVITIES: UserActivity[] = [
  {
    id: 'act_seed_1',
    type: 'session_login',
    title: 'Sessão Segura Iniciada',
    description: 'Autenticação biométrica FIDO2 / Passkey efetuada com sucesso.',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    metadata: { details: 'Dispositivo verificado • Android 7+ / Web' },
  },
  {
    id: 'act_seed_2',
    type: 'tab_navigation',
    title: 'Navegou para Feed Principal',
    description: 'Visualizou o fluxo de publicações e tendências da rede.',
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    metadata: { tab: 'feed' },
  },
  {
    id: 'act_seed_3',
    type: 'reaction_added',
    title: 'Reagiu a uma publicação',
    description: 'Adicionou reação na publicação de Dra. Inês Valente.',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    metadata: { targetName: 'Dra. Inês Valente' },
  },
  {
    id: 'act_seed_4',
    type: 'tab_navigation',
    title: 'Navegou para Clips & Reels',
    description: 'Explorou conteúdos e vídeos curtos verticais de alta definição.',
    timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    metadata: { tab: 'clips' },
  },
  {
    id: 'act_seed_5',
    type: 'bookmark_saved',
    title: 'Publicação guardada nos favoritos',
    description: 'Guardou um artigo técnico na sua coleção privada.',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    metadata: { details: 'Coleção: Tecnologia & Inovação' },
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('nexora_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('nexora_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nexora_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return CURRENT_USER;
      }
    }
    return CURRENT_USER; // Default to active session for preview experience
  });

  // Client-side Activity Tracker state
  const [activities, setActivities] = useState<UserActivity[]>(() => {
    const saved = localStorage.getItem('nexora_activities');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved activities:', e);
      }
    }
    return INITIAL_ACTIVITIES;
  });

  useEffect(() => {
    localStorage.setItem('nexora_activities', JSON.stringify(activities));
  }, [activities]);

  const logActivity = (activityData: Omit<UserActivity, 'id' | 'timestamp'>) => {
    const newActivity: UserActivity = {
      ...activityData,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 99)]);
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.removeItem('nexora_activities');
    addToast('Histórico de atividade recente limpo com sucesso.', 'info');
  };

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTabRaw] = useState<MainTab>('feed');

  const setActiveTab = (tab: MainTab) => {
    if (tab !== activeTab) {
      const tabLabels: Record<MainTab, string> = {
        feed: 'Feed Principal',
        clips: 'Clips & Reels',
        messages: 'Mensagens & Chat',
        explore: 'Explorar & Descoberta',
        network: 'Rede & Emprego',
        profile: 'Perfil de Utilizador',
      };
      logActivity({
        type: 'tab_navigation',
        title: `Navegou para ${tabLabels[tab] || tab}`,
        description: `Acedeu à secção de ${tabLabels[tab] || tab} no NEXORA HI.`,
        metadata: { tab },
      });
    }
    setActiveTabRaw(tab);
  };

  const [selectedUserProfile, setSelectedUserProfile] = useState<User | null>(null);

  // Entities state
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('nexora_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('nexora_stories');
    return saved ? JSON.parse(saved) : INITIAL_STORIES;
  });

  const [clips, setClips] = useState<Clip[]>(() => {
    const saved = localStorage.getItem('nexora_clips');
    return saved ? JSON.parse(saved) : INITIAL_CLIPS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('nexora_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv_lucas');
  const [followingUserIds, setFollowingUserIds] = useState<string[]>(['user_lucas_rocha', 'user_nexora_official']);
  const [activeViewingStoryIndex, setActiveViewingStoryIndex] = useState<number | null>(null);

  const [communities, setCommunities] = useState<Community[]>(MOCK_COMMUNITIES);
  const [jobs, setJobs] = useState<JobOpportunity[]>(MOCK_JOBS);
  const [allUsers] = useState<User[]>(MOCK_USERS);

  // Call session state
  const [activeCall, setActiveCall] = useState<CallSession>({
    isOpen: false,
    targetUser: null,
    isVideo: false,
    status: 'connecting',
    durationSeconds: 0,
    isMuted: false,
    isCameraOff: false,
    isSpeakerOn: true,
  });

  // Call timer effect
  useEffect(() => {
    let interval: any;
    if (activeCall.isOpen && activeCall.status === 'connected') {
      interval = setInterval(() => {
        setActiveCall(prev => ({ ...prev, durationSeconds: prev.durationSeconds + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall.isOpen, activeCall.status]);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync state helpers
  useEffect(() => {
    localStorage.setItem('nexora_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('nexora_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('nexora_clips', JSON.stringify(clips));
  }, [clips]);

  useEffect(() => {
    localStorage.setItem('nexora_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('nexora_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('nexora_user');
    }
  }, [currentUser]);

  // Authentication actions
  const login = async (email: string): Promise<boolean> => {
    // Check if matching mock user or fallback
    const matched = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    const userToLogin = matched || {
      ...CURRENT_USER,
      email,
      name: email.split('@')[0],
      username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
    };
    setCurrentUser(userToLogin);
    setShowAuthModal(false);
    logActivity({
      type: 'session_login',
      title: 'Sessão Iniciada',
      description: `Iniciou sessão na conta de ${userToLogin.name} (@${userToLogin.username}).`,
      metadata: { targetName: userToLogin.name },
    });
    addToast(`Bem-vindo(a) de volta, ${userToLogin.name}!`, 'success');
    return true;
  };

  const register = async (data: { name: string; username: string; email: string }): Promise<boolean> => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: data.name,
      username: data.username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      email: data.email,
      avatar: '/src/assets/images/avatar_creator_tech_1792880070535.jpg',
      coverImage: '/src/assets/images/hero_nexora_network_1792880070116.jpg',
      bio: 'Novo membro da rede Nexora. A explorar o futuro da comunicação.',
      location: 'Portugal',
      followersCount: 0,
      followingCount: 2,
      postsCount: 0,
      joinedDate: 'Hoje',
      twoFactorEnabled: false,
    };
    setCurrentUser(newUser);
    setShowAuthModal(false);
    logActivity({
      type: 'session_login',
      title: 'Nova Conta Registada',
      description: `Conta criada com o utilizador @${newUser.username}.`,
      metadata: { targetName: newUser.name },
    });
    addToast(`Conta criada com sucesso! Bem-vindo à Nexora.`, 'success');
    return true;
  };

  const loginWithSocial = async (
    provider: 'google' | 'facebook',
    profileData?: { name?: string; email?: string; avatar?: string }
  ): Promise<boolean> => {
    const isGoogle = provider === 'google';
    const providerName = isGoogle ? 'Google' : 'Facebook';

    const email = profileData?.email || (isGoogle ? 'softwareservicesisaquiel@gmail.com' : 'usuario.meta@facebook.com');
    const name = profileData?.name || (isGoogle ? 'Utilizador Google' : 'Utilizador Facebook');
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
    const avatar = profileData?.avatar || (isGoogle
      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80');

    const socialUser: User = {
      id: `usr_${provider}_${Date.now()}`,
      name,
      username: baseUsername || `user_${provider}`,
      email,
      avatar,
      coverImage: '/src/assets/images/hero_nexora_network_1792880070116.jpg',
      bio: `Membro verificado via autenticação ${providerName} Secure com Ultra Segurança criptográfica Kyber-1024 ativa.`,
      location: 'Portugal',
      followersCount: 12,
      followingCount: 15,
      postsCount: 0,
      isVerified: true,
      joinedDate: 'Hoje',
      twoFactorEnabled: true,
    };

    setCurrentUser(socialUser);
    localStorage.setItem('nexora_user', JSON.stringify(socialUser));
    setShowAuthModal(false);

    logActivity({
      type: 'session_login',
      title: `Conta Conectada via ${providerName}`,
      description: `Autenticação ultra-segura com ${providerName} Identity e chaves criptográficas pós-quânticas.`,
      metadata: { targetName: socialUser.name, provider },
    });

    addToast(`Conta ${providerName} autenticada com Ultra Segurança! Bem-vindo(a), ${socialUser.name}.`, 'success');
    return true;
  };

  const logout = () => {
    logActivity({
      type: 'session_login',
      title: 'Sessão Terminada',
      description: 'Terminou a sessão ativa no dispositivo.',
    });
    setCurrentUser(null);
    addToast('Sessão terminada.', 'info');
  };

  const updateProfile = (updated: Partial<User>) => {
    if (!currentUser) return;
    const next = { ...currentUser, ...updated };
    setCurrentUser(next);
    logActivity({
      type: 'profile_updated',
      title: 'Perfil Atualizado',
      description: 'As informações públicas e detalhes do teu perfil foram atualizados.',
    });
    addToast('Perfil atualizado com sucesso!', 'success');
  };

  const deleteAccount = () => {
    setCurrentUser(null);
    localStorage.clear();
    addToast('Conta eliminada permanentemente.', 'info');
  };

  const deactivateAccount = () => {
    setCurrentUser(null);
    addToast('Conta desativada temporariamente.', 'info');
  };

  const openUserProfile = (user: User) => {
    setSelectedUserProfile(user);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeUserProfile = () => {
    setSelectedUserProfile(null);
  };

  // Follow actions
  const toggleFollowUser = (userId: string) => {
    setFollowingUserIds(prev => {
      const exists = prev.includes(userId);
      if (exists) {
        addToast('Deixou de seguir o perfil.', 'info');
        return prev.filter(id => id !== userId);
      } else {
        addToast('A seguir este perfil!', 'success');
        return [...prev, userId];
      }
    });
  };

  const isFollowingUser = (userId: string) => {
    return followingUserIds.includes(userId);
  };

  // Posts actions
  const createPost = (postData: {
    content: string;
    mediaUrls?: string[];
    mediaType?: 'none' | 'image' | 'video' | 'album' | 'moment';
    backgroundGradient?: string;
    isMoment?: boolean;
    tags?: string[];
    poll?: { question: string; options: string[] };
    audience?: 'public' | 'followers' | 'close_friends';
    location?: string;
  }) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    let createdPoll = undefined;
    if (postData.poll && postData.poll.options.length >= 2) {
      createdPoll = {
        id: `poll_${Date.now()}`,
        question: postData.poll.question,
        options: postData.poll.options.map((opt, i) => ({
          id: `opt_${i}`,
          text: opt,
          votes: 0,
        })),
        totalVotes: 0,
      };
    }

    const isMoment = postData.isMoment || postData.mediaType === 'moment';
    const isVideo = postData.mediaType === 'video' || (postData.mediaUrls && postData.mediaUrls.some(u => u.endsWith('.mp4') || u.endsWith('.webm')));
    const effectiveMediaType = postData.mediaType || (isMoment ? 'moment' : isVideo ? 'video' : postData.mediaUrls && postData.mediaUrls.length > 1 ? 'album' : postData.mediaUrls && postData.mediaUrls.length === 1 ? 'image' : 'none');

    const newPost: Post = {
      id: `post_${Date.now()}`,
      author: currentUser,
      content: postData.content,
      mediaUrls: postData.mediaUrls || [],
      mediaType: effectiveMediaType,
      backgroundGradient: postData.backgroundGradient,
      isMoment,
      location: postData.location,
      tags: postData.tags || [],
      poll: createdPoll,
      createdAt: 'Agora mesmo',
      likesCount: 0,
      hasLiked: false,
      reactionsSummary: {
        like: 0,
        love: 0,
        insight: 0,
        rocket: 0,
        laugh: 0,
      },
      commentsCount: 0,
      comments: [],
      sharesCount: 0,
      bookmarksCount: 0,
      isSaved: false,
      audience: postData.audience || 'public',
    };

    if (isMoment) {
      createStory({
        mediaType: postData.mediaUrls && postData.mediaUrls.length > 0 ? (isVideo ? 'video' : 'image') : 'text',
        mediaUrl: postData.mediaUrls?.[0],
        textContent: postData.content,
        textBackgroundGradient: postData.backgroundGradient || 'from-indigo-600 via-purple-600 to-pink-600',
        caption: postData.content,
      });
    }

    setPosts(prev => [newPost, ...prev]);
    if (currentUser) {
      setCurrentUser({ ...currentUser, postsCount: currentUser.postsCount + 1 });
    }
    logActivity({
      type: 'post_created',
      title: isMoment ? 'Momento Publicado' : isVideo ? 'Vídeo Publicado' : 'Publicação Criada',
      description: postData.content.length > 60 ? `${postData.content.substring(0, 60)}...` : postData.content,
      metadata: {
        postId: newPost.id,
        details: `${postData.mediaUrls?.length || 0} ficheiro(s) anexado(s) • Tipo: ${effectiveMediaType}`,
      },
    });
    addToast(isMoment ? 'Momento partilhado no feed e stories!' : 'Publicação partilhada com sucesso!', 'success');
  };

  const toggleLikePost = (postId: string, reaction: ReactionType = 'like') => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const wasLiked = p.hasLiked;
        const currentReaction = p.userReaction;

        if (wasLiked && currentReaction === reaction) {
          // Remove reaction
          const nextSummary = { ...p.reactionsSummary };
          nextSummary[reaction] = Math.max(0, nextSummary[reaction] - 1);
          return {
            ...p,
            hasLiked: false,
            userReaction: undefined,
            likesCount: Math.max(0, p.likesCount - 1),
            reactionsSummary: nextSummary,
          };
        } else {
          // Add or change reaction
          const nextSummary = { ...p.reactionsSummary };
          if (wasLiked && currentReaction) {
            nextSummary[currentReaction] = Math.max(0, nextSummary[currentReaction] - 1);
          }
          nextSummary[reaction] = (nextSummary[reaction] || 0) + 1;
          return {
            ...p,
            hasLiked: true,
            userReaction: reaction,
            likesCount: wasLiked ? p.likesCount : p.likesCount + 1,
            reactionsSummary: nextSummary,
          };
        }
      })
    );
  };

  const addCommentToPost = (postId: string, text: string, replyToCommentId?: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    const newComment = {
      id: `comm_${Date.now()}`,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      text,
      createdAt: 'Agora mesmo',
      likesCount: 0,
    };

    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        if (replyToCommentId) {
          const nextComments = p.comments.map(c => {
            if (c.id === replyToCommentId) {
              return {
                ...c,
                replies: [...(c.replies || []), newComment],
              };
            }
            return c;
          });
          return {
            ...p,
            comments: nextComments,
            commentsCount: p.commentsCount + 1,
          };
        } else {
          return {
            ...p,
            comments: [newComment, ...p.comments],
            commentsCount: p.commentsCount + 1,
          };
        }
      })
    );
    addToast('Comentário publicado!', 'success');
  };

  const votePoll = (postId: string, optionId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId || !p.poll) return p;
        if (p.poll.userVotedOptionId) return p; // already voted

        const nextOptions = p.poll.options.map(opt => {
          if (opt.id === optionId) {
            return { ...opt, votes: opt.votes + 1 };
          }
          return opt;
        });

        return {
          ...p,
          poll: {
            ...p.poll,
            options: nextOptions,
            totalVotes: p.poll.totalVotes + 1,
            userVotedOptionId: optionId,
          },
        };
      })
    );
    addToast('Voto contabilizado!', 'success');
  };

  const toggleBookmarkPost = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const nextSaved = !p.isSaved;
        if (nextSaved) {
          logActivity({
            type: 'bookmark_saved',
            title: 'Item Guardado nos Favoritos',
            description: p.content.length > 50 ? `Guardou "${p.content.substring(0, 50)}..."` : `Guardou publicação de ${p.author.name}`,
            metadata: { postId, targetName: p.author.name },
          });
        }
        addToast(nextSaved ? 'Publicação guardada nos itens salvos.' : 'Publicação removida dos itens salvos.', 'info');
        return {
          ...p,
          isSaved: nextSaved,
          bookmarksCount: nextSaved ? p.bookmarksCount + 1 : Math.max(0, p.bookmarksCount - 1),
        };
      })
    );
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    addToast('Publicação eliminada.', 'info');
  };

  // Stories actions
  const createStory = (storyData: {
    mediaUrl?: string;
    mediaType: 'image' | 'video' | 'text';
    textContent?: string;
    textBackgroundGradient?: string;
    caption?: string;
    musicTrack?: string;
  }) => {
    if (!currentUser) return;
    const newStory: Story = {
      id: `story_${Date.now()}`,
      author: currentUser,
      mediaUrl: storyData.mediaUrl,
      mediaType: storyData.mediaType,
      textContent: storyData.textContent,
      textBackgroundGradient: storyData.textBackgroundGradient || 'from-blue-600 via-indigo-600 to-purple-700',
      caption: storyData.caption,
      musicTrack: storyData.musicTrack,
      createdAt: 'Agora mesmo',
      expiresInHours: 24,
      viewersCount: 0,
      hasSeen: true,
    };
    setStories(prev => [newStory, ...prev]);
    logActivity({
      type: 'story_created',
      title: 'Story Publicado',
      description: storyData.caption || 'Novo story partilhado no perfil (ativo durante 24 horas).',
      metadata: { mediaType: storyData.mediaType },
    });
    addToast('Story partilhado! Estará visível durante 24h.', 'success');
  };

  const markStoryAsSeen = (storyId: string) => {
    setStories(prev =>
      prev.map(s => {
        if (s.id === storyId && !s.hasSeen) {
          return { ...s, hasSeen: true, viewersCount: s.viewersCount + 1 };
        }
        return s;
      })
    );
  };

  // Clips actions
  const createClip = (clipData: {
    posterUrl: string;
    description: string;
    tags: string[];
    musicTitle: string;
    musicArtist: string;
  }) => {
    if (!currentUser) return;
    const newClip: Clip = {
      id: `clip_${Date.now()}`,
      author: currentUser,
      posterUrl: clipData.posterUrl,
      description: clipData.description,
      tags: clipData.tags,
      musicTrack: {
        title: clipData.musicTitle,
        artist: clipData.musicArtist,
      },
      likesCount: 1,
      hasLiked: true,
      commentsCount: 0,
      comments: [],
      sharesCount: 0,
      bookmarksCount: 0,
      isSaved: false,
      quality: '1080p',
    };
    setClips(prev => [newClip, ...prev]);
    logActivity({
      type: 'clip_created',
      title: 'Clip Vertical Publicado',
      description: clipData.description || 'Novo vídeo vertical adicionado aos Clips.',
      metadata: { details: `${clipData.musicTitle} • ${clipData.musicArtist}` },
    });
    addToast('Nexora Clip publicado com sucesso!', 'success');
  };

  const toggleLikeClip = (clipId: string) => {
    setClips(prev =>
      prev.map(c => {
        if (c.id !== clipId) return c;
        const nextLiked = !c.hasLiked;
        return {
          ...c,
          hasLiked: nextLiked,
          likesCount: nextLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1),
        };
      })
    );
  };

  const toggleBookmarkClip = (clipId: string) => {
    setClips(prev =>
      prev.map(c => {
        if (c.id !== clipId) return c;
        const nextSaved = !c.isSaved;
        addToast(nextSaved ? 'Clip adicionado aos favoritos!' : 'Clip removido dos favoritos.', 'info');
        return {
          ...c,
          isSaved: nextSaved,
          bookmarksCount: nextSaved ? c.bookmarksCount + 1 : Math.max(0, c.bookmarksCount - 1),
        };
      })
    );
  };

  // Direct messaging actions
  const sendMessage = (
    conversationId: string,
    text: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video' | 'audio' | 'doc',
    replyToId?: string
  ) => {
    if (!currentUser) return;

    let replyContext: Message['replyTo'] = undefined;
    const currentConv = conversations.find(c => c.id === conversationId);
    if (replyToId && currentConv?.lastMessage?.id === replyToId) {
      replyContext = {
        id: replyToId,
        text: currentConv.lastMessage.text,
        senderName: currentConv.lastMessage.senderName,
      };
    }

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text,
      mediaUrl,
      mediaType,
      audioDuration: mediaType === 'audio' ? 14 : undefined,
      replyTo: replyContext,
      reactions: [],
      status: 'sent',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations(prev =>
      prev.map(conv => {
        if (conv.id !== conversationId) return conv;
        return {
          ...conv,
          lastMessage: newMsg,
        };
      })
    );

    // Simulate automatic response in direct chats for high interactivity
    if (currentConv && !currentConv.isGroup) {
      const otherParticipant = currentConv.participants.find(p => p.id !== currentUser.id);
      if (otherParticipant) {
        setTimeout(() => {
          // Show delivered tick
          setConversations(p =>
            p.map(conv => {
              if (conv.id !== conversationId || !conv.lastMessage) return conv;
              return {
                ...conv,
                lastMessage: { ...conv.lastMessage, status: 'read' },
              };
            })
          );
        }, 1200);

        setTimeout(() => {
          const replies = [
            'Concordo perfeitamente contigo! Vamos alinhar isso ainda hoje.',
            'Excelente perspetiva! A interface do Nexora está cada vez mais fluida.',
            'Acabei de ver! Fantástico resultado.',
            'Estou a rever isso agora mesmo. Envio novidades em instantes!',
          ];
          const autoReplyText = replies[Math.floor(Math.random() * replies.length)];
          const replyMsg: Message = {
            id: `msg_reply_${Date.now()}`,
            conversationId,
            senderId: otherParticipant.id,
            senderName: otherParticipant.name,
            senderAvatar: otherParticipant.avatar,
            text: autoReplyText,
            reactions: [],
            status: 'read',
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setConversations(p =>
            p.map(conv => {
              if (conv.id !== conversationId) return conv;
              return {
                ...conv,
                lastMessage: replyMsg,
              };
            })
          );
        }, 3200);
      }
    }
  };

  const addReactionToMessage = (conversationId: string, messageId: string, emoji: string) => {
    if (!currentUser) return;
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id !== conversationId || !conv.lastMessage) return conv;
        if (conv.lastMessage.id === messageId) {
          const existingReactions = conv.lastMessage.reactions || [];
          const userIdx = existingReactions.findIndex(r => r.userId === currentUser.id && r.emoji === emoji);
          let nextReactions = [...existingReactions];
          if (userIdx >= 0) {
            nextReactions.splice(userIdx, 1);
          } else {
            nextReactions.push({ emoji, userId: currentUser.id });
          }
          return {
            ...conv,
            lastMessage: {
              ...conv.lastMessage,
              reactions: nextReactions,
            },
          };
        }
        return conv;
      })
    );
  };

  // Call actions
  const startCall = (targetUser: User, isVideo: boolean) => {
    setActiveCall({
      isOpen: true,
      targetUser,
      isVideo,
      status: 'connecting',
      durationSeconds: 0,
      isMuted: false,
      isCameraOff: false,
      isSpeakerOn: true,
    });

    // Simulate pickup after 2.5s
    setTimeout(() => {
      setActiveCall(prev => {
        if (prev.isOpen) {
          return { ...prev, status: 'connected' };
        }
        return prev;
      });
      addToast('Chamada conectada com encriptação E2E de alta fidelidade.', 'success');
    }, 2500);
  };

  const updateActiveCall = (updates: Partial<CallSession>) => {
    setActiveCall(prev => ({ ...prev, ...updates }));
  };

  const endCall = () => {
    setActiveCall(prev => ({ ...prev, isOpen: false, status: 'ended' }));
    addToast('Chamada terminada.', 'info');
  };

  // Communities actions
  const toggleJoinCommunity = (communityId: string) => {
    setCommunities(prev =>
      prev.map(c => {
        if (c.id !== communityId) return c;
        const nextJoined = !c.isJoined;
        addToast(nextJoined ? `Aderiu à comunidade ${c.name}!` : `Saiu de ${c.name}.`, 'info');
        return {
          ...c,
          isJoined: nextJoined,
          membersCount: nextJoined ? c.membersCount + 1 : c.membersCount - 1,
        };
      })
    );
  };

  // Jobs actions
  const toggleSaveJob = (jobId: string) => {
    setJobs(prev =>
      prev.map(j => {
        if (j.id !== jobId) return j;
        const nextSaved = !j.isSaved;
        addToast(nextSaved ? 'Oportunidade guardada nas tuas vagas!' : 'Vaga removida dos itens guardados.', 'info');
        return {
          ...j,
          isSaved: nextSaved,
        };
      })
    );
  };

  const applyToJob = (jobId: string) => {
    setJobs(prev =>
      prev.map(j => {
        if (j.id !== jobId) return j;
        return {
          ...j,
          applicantsCount: j.applicantsCount + 1,
        };
      })
    );
    addToast('Candidatura enviada com o teu perfil Nexora! Boa sorte.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        activeTab,
        setActiveTab,
        selectedUserProfile,
        openUserProfile,
        closeUserProfile,
        posts,
        stories,
        clips,
        conversations,
        activeConversationId,
        setActiveConversationId,
        theme,
        toggleTheme,
        showAuthModal,
        setShowAuthModal,
        authModalMode,
        setAuthModalMode,
        login,
        loginWithSocial,
        register,
        logout,
        updateProfile,
        deleteAccount,
        deactivateAccount,
        createPost,
        toggleLikePost,
        addCommentToPost,
        votePoll,
        toggleBookmarkPost,
        deletePost,
        createStory,
        activeViewingStoryIndex,
        setActiveViewingStoryIndex,
        markStoryAsSeen,
        followingUserIds,
        toggleFollowUser,
        isFollowingUser,
        createClip,
        toggleLikeClip,
        toggleBookmarkClip,
        sendMessage,
        addReactionToMessage,
        activeCall,
        startCall,
        updateActiveCall,
        endCall,
        communities,
        toggleJoinCommunity,
        jobs,
        toggleSaveJob,
        applyToJob,
        toasts,
        addToast,
        removeToast,
        allUsers,
        activities,
        logActivity,
        clearActivities,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
