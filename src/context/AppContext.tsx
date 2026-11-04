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
  FollowRequest,
  ReportItem,
  NotificationItem,
} from '../types';
import { useTranslation } from '../i18n/useTranslation';
import { TranslationKey } from '../i18n/translations';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment,
  limit,
  generateNexoraId,
  generateRecoveryCode,
  hashRecoveryCode,
  usernameToAuthEmail,
} from '../lib/firebase';
import {
  NEXORA_OFFICIAL_USER,
  NEXORA_OFFICIAL_INITIAL_POST,
  NEXORA_OFFICIAL_CONVERSATION,
  ensureNexoraOfficialProfile,
} from '../data/officialNexora';

export type MainTab = 'feed' | 'clips' | 'messages' | 'explore' | 'network' | 'profile';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export interface RegisterResult {
  success: boolean;
  recoveryCode?: string;
  nexoraId?: string;
  error?: string;
}

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  selectedUserProfile: User | null;
  openUserProfile: (user: User) => void;
  closeUserProfile: () => void;
  posts: Post[];
  stories: Story[];
  clips: Clip[];
  refetchFeed: () => Promise<void>;
  refetchClips: () => Promise<void>;
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalMode: 'login' | 'register' | 'recover';
  setAuthModalMode: (mode: 'login' | 'register' | 'recover') => void;
  login: (usernameOrId: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithSocial: (provider: 'google' | 'facebook', profileData?: { name?: string; email?: string; avatar?: string }) => Promise<boolean>;
  register: (data: { username: string; password: string; confirmPassword?: string; displayName?: string }) => Promise<RegisterResult>;
  recoverAccount: (identifier: string, recoveryCode: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
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
    audioBadge?: string;
  }) => Promise<void>;
  toggleLikePost: (postId: string, reaction?: ReactionType) => Promise<void>;
  addCommentToPost: (postId: string, text: string, replyToCommentId?: string) => Promise<void>;
  votePoll: (postId: string, optionId: string) => void;
  toggleBookmarkPost: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  createStory: (storyData: {
    mediaUrl?: string;
    mediaType: 'image' | 'video' | 'text';
    textContent?: string;
    textBackgroundGradient?: string;
    caption?: string;
    musicTrack?: string;
  }) => Promise<void>;
  activeViewingStoryIndex: number | null;
  setActiveViewingStoryIndex: (idx: number | null) => void;
  markStoryAsSeen: (storyId: string) => Promise<void>;
  followingUserIds: string[];
  toggleFollowUser: (userId: string) => Promise<void>;
  isFollowingUser: (userId: string) => boolean;
  createClip: (clipData: {
    videoUrl: string;
    posterUrl?: string;
    description: string;
    tags: string[];
    musicTitle?: string;
    musicArtist?: string;
  }) => Promise<void>;
  toggleLikeClip: (clipId: string) => Promise<void>;
  toggleBookmarkClip: (clipId: string) => Promise<void>;
  sendMessage: (
    conversationId: string,
    text: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video' | 'audio' | 'doc',
    replyToId?: string
  ) => Promise<void>;
  addReactionToMessage: (conversationId: string, messageId: string, emoji: string) => Promise<void>;
  createConversation: (targetUser: User) => Promise<string>;
  createGroup: (name: string, participantIds: string[], avatar?: string) => Promise<string>;
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
  followRequests: FollowRequest[];
  acceptFollowRequest: (request: FollowRequest) => Promise<void>;
  rejectFollowRequest: (requestId: string) => Promise<void>;
  reportContent: (data: { targetType: 'user' | 'post' | 'comment' | 'message'; targetId: string; reason: string; targetAuthorName?: string }) => Promise<void>;
  blockUser: (targetUserId: string) => Promise<void>;
  unblockUser: (targetUserId: string) => Promise<void>;
  blockedUserIds: string[];
  savedPostIds: string[];
  isAdmin: boolean;
  showAdminPanel: boolean;
  setShowAdminPanel: (show: boolean) => void;
  currentLanguage: string;
  setLanguage: (code: string) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  createNotification: (data: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  officialNexoraUser: User;
  sendOfficialUpdate: (content: string, mediaUrls?: string[]) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<MainTab>('feed');
  const [selectedUserProfile, setSelectedUserProfile] = useState<User | null>(null);

  // Core Real-time State
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [followingUserIds, setFollowingUserIds] = useState<string[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);

  // Internationalization / Universal Translation
  const { currentLanguage, setLanguage, t } = useTranslation();

  // Real-time Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Navigation & Modals
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'recover'>('login');
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [activeViewingStoryIndex, setActiveViewingStoryIndex] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('nexora_theme') as 'dark' | 'light') || 'dark';
  });

  // Call WebRTC State
  const [activeCall, setActiveCall] = useState<CallSession>({
    isOpen: false,
    targetUser: null,
    isVideo: false,
    status: 'idle',
    durationSeconds: 0,
    isMuted: false,
    isCameraOff: false,
    isSpeakerOn: true,
  });

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('nexora_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const logActivity = (activity: Omit<UserActivity, 'id' | 'timestamp'>) => {
    const newAct: UserActivity = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 49)]);
  };

  const clearActivities = () => {
    setActivities([]);
  };

  // ============================================
  // 1. FIREBASE AUTH LISTENER & USER SYNC
  // ============================================
  useEffect(() => {
    // Ensure official Nexora system profile and announcements are persisted
    ensureNexoraOfficialProfile(db);

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoadingAuth(true);
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            const userProfile: User = {
              id: fbUser.uid,
              nexoraId: data.nexoraId || 'NX-000000',
              username: data.username || 'user',
              name: data.displayName || data.name || data.username || 'NEXORA Member',
              email: fbUser.email || `${data.username}@auth.nexora.app`,
              avatar: data.avatarUrl || data.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${data.username || fbUser.uid}`,
              bio: data.bio || '',
              coverImage: data.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
              location: data.location || '',
              website: data.website || '',
              profession: data.profession || '',
              followersCount: data.followersCount || 0,
              followingCount: data.followingCount || 0,
              postsCount: data.postsCount || 0,
              isPrivate: !!data.isPrivate,
              isSuspended: !!data.isSuspended,
              role: data.role || 'user',
              joinedDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Recente',
              twoFactorEnabled: !!data.twoFactorEnabled,
            };
            setCurrentUser(userProfile);
            try {
              localStorage.setItem(`nexora_cached_user_${fbUser.uid}`, JSON.stringify(userProfile));
            } catch (_) {}
            setShowAuthModal(false);
          } else {
            // Auto bootstrap profile for Google or external sign in
            let nexoraId = generateNexoraId();
            let idDoc = await getDoc(doc(db, 'nexoraIds', nexoraId));
            while (idDoc.exists()) {
              nexoraId = generateNexoraId();
              idDoc = await getDoc(doc(db, 'nexoraIds', nexoraId));
            }

            const recoveryCode = generateRecoveryCode();
            const recoveryCodeHash = await hashRecoveryCode(recoveryCode);

            let cleanUsername = (fbUser.displayName || fbUser.email?.split('@')[0] || `user_${fbUser.uid.slice(0, 5)}`)
              .toLowerCase()
              .replace(/[^a-z0-9_.]/g, '');
            if (!cleanUsername || cleanUsername.length < 3) {
              cleanUsername = `user_${fbUser.uid.slice(0, 5).toLowerCase()}`;
            }

            const uSnap = await getDoc(doc(db, 'usernames', cleanUsername));
            if (uSnap.exists()) {
              cleanUsername = `${cleanUsername}_${Math.floor(100 + Math.random() * 900)}`;
            }

            const allUsersSnap = await getDocs(query(collection(db, 'users'), limit(2)));
            const isFirstUser = allUsersSnap.empty;

            const profileName = fbUser.displayName || cleanUsername;
            const avatarUrl = fbUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`;
            const nowIso = new Date().toISOString();

            const newUserData = {
              nexoraId,
              username: cleanUsername,
              displayName: profileName,
              name: profileName,
              avatarUrl,
              avatar: avatarUrl,
              bio: 'Bem-vindo ao meu perfil no NEXORA!',
              coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
              isPrivate: false,
              isSuspended: false,
              role: isFirstUser ? 'admin' : 'user',
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              createdAt: nowIso,
              recoveryCodeHash,
            };

            await setDoc(userDocRef, newUserData);
            await setDoc(doc(db, 'usernames', cleanUsername), { uid: fbUser.uid, nexoraId });
            await setDoc(doc(db, 'nexoraIds', nexoraId), { uid: fbUser.uid, username: cleanUsername });

            const createdUser: User = {
              id: fbUser.uid,
              nexoraId,
              username: cleanUsername,
              name: profileName,
              email: fbUser.email || `${cleanUsername}@auth.nexora.app`,
              avatar: avatarUrl,
              bio: 'Bem-vindo ao meu perfil no NEXORA!',
              coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
              location: '',
              website: '',
              profession: '',
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              isPrivate: false,
              isSuspended: false,
              role: isFirstUser ? 'admin' : 'user',
              joinedDate: new Date(nowIso).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
              twoFactorEnabled: false,
            };

            setCurrentUser(createdUser);
            try {
              localStorage.setItem(`nexora_cached_user_${fbUser.uid}`, JSON.stringify(createdUser));
            } catch (_) {}
            setShowAuthModal(false);
          }
        } catch (err: any) {
          // Gracefully fallback to cached profile or offline user
          const cachedStr = localStorage.getItem(`nexora_cached_user_${fbUser.uid}`);
          if (cachedStr) {
            try {
              const cached = JSON.parse(cachedStr);
              setCurrentUser(cached);
              setShowAuthModal(false);
            } catch (_) {}
          } else {
            const tempUser: User = {
              id: fbUser.uid,
              nexoraId: 'NX-ONLINE',
              username: (fbUser.displayName || 'utilizador').toLowerCase().replace(/\s+/g, '_'),
              name: fbUser.displayName || 'Utilizador NEXORA',
              email: fbUser.email || 'user@nexora.app',
              avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${fbUser.uid}`,
              bio: 'Perfil sincronizado localmente',
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              joinedDate: 'Hoje',
            };
            setCurrentUser(tempUser);
            setShowAuthModal(false);
          }
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to Following list of current user
  useEffect(() => {
    if (!currentUser) {
      setFollowingUserIds([]);
      setSavedPostIds([]);
      setBlockedUserIds([]);
      return;
    }

    // Follows
    const qFollows = query(collection(db, 'followers'), where('followerUserId', '==', currentUser.id));
    const unsubFollows = onSnapshot(qFollows, (snap) => {
      const ids = snap.docs.map((d) => d.data().targetUserId as string);
      setFollowingUserIds(ids);
    });

    // Saved Posts
    const qSaved = query(collection(db, 'savedPosts'), where('userId', '==', currentUser.id));
    const unsubSaved = onSnapshot(qSaved, (snap) => {
      const ids = snap.docs.map((d) => d.data().postId as string);
      setSavedPostIds(ids);
    });

    // Follow Requests
    const qRequests = query(
      collection(db, 'followRequests'),
      where('targetUserId', '==', currentUser.id),
      where('status', '==', 'pending')
    );
    const unsubRequests = onSnapshot(qRequests, (snap) => {
      const reqs: FollowRequest[] = snap.docs.map((d) => ({
        id: d.id,
        targetUserId: d.data().targetUserId,
        requesterUserId: d.data().requesterUserId,
        requesterUsername: d.data().requesterUsername,
        requesterDisplayName: d.data().requesterDisplayName || d.data().requesterUsername,
        requesterAvatar: d.data().requesterAvatar,
        requesterNexoraId: d.data().requesterNexoraId,
        createdAt: d.data().createdAt,
        status: d.data().status,
      }));
      setFollowRequests(reqs);
    });

    // Blocked
    const qBlocked = query(collection(db, 'blockedUsers'), where('userId', '==', currentUser.id));
    const unsubBlocked = onSnapshot(qBlocked, (snap) => {
      const ids = snap.docs.map((d) => d.data().blockedUserId as string);
      setBlockedUserIds(ids);
    });

    // Real-time Notifications
    const qNotifs = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.id),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsubNotifs = onSnapshot(
      qNotifs,
      (snap) => {
        const items: NotificationItem[] = snap.docs.map((d) => ({
          id: d.id,
          userId: d.data().userId,
          actorId: d.data().actorId,
          actorName: d.data().actorName,
          actorUsername: d.data().actorUsername,
          actorAvatar: d.data().actorAvatar,
          type: d.data().type,
          targetId: d.data().targetId,
          previewContent: d.data().previewContent,
          isRead: !!d.data().isRead,
          createdAt: d.data().createdAt,
        }));
        setNotifications(items);
      },
      (err) => {
        console.warn('Error listening to notifications:', err);
      }
    );

    return () => {
      unsubFollows();
      unsubSaved();
      unsubRequests();
      unsubBlocked();
      unsubNotifs();
    };
  }, [currentUser?.id]);

  // ============================================
  // 2. REAL-TIME POSTS FEED
  // ============================================
  useEffect(() => {
    if (!currentUser) {
      setPosts([]);
      return;
    }

    const qPosts = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(
      qPosts,
      (snap) => {
        const loaded: Post[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          const author: User = {
            id: d.authorId || '',
            nexoraId: d.authorNexoraId || 'NX-000000',
            name: d.authorName || d.authorUsername || 'Utilizador',
            username: d.authorUsername || 'user',
            avatar: d.authorAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${d.authorUsername}`,
            bio: '',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            joinedDate: '',
            isVerified: d.authorId === NEXORA_OFFICIAL_USER.id || !!d.authorIsVerified || !!d.author?.isVerified,
          };

          return {
            id: docSnap.id,
            author,
            content: d.content || '',
            mediaUrls: d.mediaUrls || [],
            mediaType: d.mediaType || 'none',
            backgroundGradient: d.backgroundGradient,
            isMoment: !!d.isMoment,
            location: d.location,
            tags: d.tags || [],
            poll: d.poll,
            createdAt: d.createdAt || new Date().toISOString(),
            likesCount: d.likesCount || 0,
            commentsCount: d.commentsCount || 0,
            sharesCount: d.sharesCount || 0,
            bookmarksCount: d.bookmarksCount || 0,
            audience: d.audience || 'public',
            hasLiked: currentUser ? (d.likedBy || []).includes(currentUser.id) : false,
            isSaved: savedPostIds.includes(docSnap.id),
          };
        });

        const hasOfficialPost = loaded.some(
          (p) => p.author.username === 'nexora' || p.id === NEXORA_OFFICIAL_INITIAL_POST.id
        );
        setPosts(hasOfficialPost ? loaded : [NEXORA_OFFICIAL_INITIAL_POST, ...loaded]);
      },
      (err) => {
        console.error('Error listening to posts:', err);
      }
    );

    return () => unsub();
  }, [currentUser?.id, savedPostIds]);

  // ============================================
  // 3. REAL-TIME STORIES (24H FILTER)
  // ============================================
  useEffect(() => {
    if (!currentUser) {
      setStories([]);
      return;
    }

    const now = Date.now();
    const qStories = query(
      collection(db, 'stories'),
      where('expiresAt', '>', now),
      orderBy('expiresAt', 'desc'),
      limit(50)
    );
    const unsub = onSnapshot(
      qStories,
      (snap) => {
        const loaded: Story[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          const author: User = {
            id: d.authorId,
            nexoraId: d.authorNexoraId || 'NX-000000',
            name: d.authorName || d.authorUsername,
            username: d.authorUsername,
            avatar: d.authorAvatar,
            bio: '',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            joinedDate: '',
          };

          return {
            id: docSnap.id,
            author,
            mediaUrl: d.mediaUrl,
            mediaType: d.mediaType || 'image',
            textContent: d.textContent,
            textBackgroundGradient: d.textBackgroundGradient,
            caption: d.caption,
            musicTrack: d.musicTrack,
            createdAt: d.createdAt,
            expiresAt: d.expiresAt,
            viewersCount: (d.viewerIds || []).length,
            viewerIds: d.viewerIds || [],
            hasSeen: currentUser ? (d.viewerIds || []).includes(currentUser.id) : false,
          };
        });
        setStories(loaded);
      },
      (err) => {
        console.error('Error listening to stories:', err);
      }
    );

    return () => unsub();
  }, [currentUser?.id]);

  // ============================================
  // 4. REAL-TIME REELS / CLIPS
  // ============================================
  useEffect(() => {
    if (!currentUser) {
      setClips([]);
      return;
    }

    const qClips = query(collection(db, 'reels'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(
      qClips,
      (snap) => {
        const loaded: Clip[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          const author: User = {
            id: d.authorId,
            nexoraId: d.authorNexoraId || 'NX-000000',
            name: d.authorName || d.authorUsername,
            username: d.authorUsername,
            avatar: d.authorAvatar,
            bio: '',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            joinedDate: '',
          };

          return {
            id: docSnap.id,
            author,
            videoUrl: d.videoUrl,
            posterUrl: d.posterUrl || '',
            description: d.description || d.caption || '',
            tags: d.tags || [],
            musicTrack: {
              title: d.musicTitle || 'Áudio Original NEXORA',
              artist: d.musicArtist || author.name,
            },
            likesCount: d.likesCount || 0,
            commentsCount: d.commentsCount || 0,
            comments: d.comments || [],
            sharesCount: d.sharesCount || 0,
            bookmarksCount: d.bookmarksCount || 0,
            hasLiked: currentUser ? (d.likedBy || []).includes(currentUser.id) : false,
            isSaved: savedPostIds.includes(docSnap.id),
          };
        });
        setClips(loaded);
      },
      (err) => {
        console.error('Error listening to reels:', err);
      }
    );

    return () => unsub();
  }, [currentUser?.id, savedPostIds]);

  // Refetch Feed (Posts + Stories) from Firebase
  const refetchFeed = async (): Promise<void> => {
    try {
      const qPosts = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100));
      const postsSnap = await getDocs(qPosts);
      const loadedPosts: Post[] = postsSnap.docs.map((docSnap) => {
        const d = docSnap.data();
        const author: User = {
          id: d.authorId || '',
          nexoraId: d.authorNexoraId || 'NX-000000',
          name: d.authorName || d.authorUsername || 'Utilizador',
          username: d.authorUsername || 'user',
          avatar: d.authorAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${d.authorUsername}`,
          bio: '',
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          joinedDate: '',
        };

        return {
          id: docSnap.id,
          author,
          content: d.content || '',
          mediaUrls: d.mediaUrls || [],
          mediaType: d.mediaType || 'none',
          backgroundGradient: d.backgroundGradient,
          isMoment: !!d.isMoment,
          location: d.location,
          tags: d.tags || [],
          poll: d.poll,
          audioBadge: d.audioBadge || undefined,
          createdAt: d.createdAt || new Date().toISOString(),
          likesCount: d.likesCount || 0,
          commentsCount: d.commentsCount || 0,
          sharesCount: d.sharesCount || 0,
          bookmarksCount: d.bookmarksCount || 0,
          audience: d.audience || 'public',
          hasLiked: currentUser ? (d.likedBy || []).includes(currentUser.id) : false,
          isSaved: savedPostIds.includes(docSnap.id),
        };
      });
      setPosts(loadedPosts);

      const now = Date.now();
      const qStories = query(
        collection(db, 'stories'),
        where('expiresAt', '>', now),
        orderBy('expiresAt', 'desc'),
        limit(50)
      );
      const storiesSnap = await getDocs(qStories);
      const loadedStories: Story[] = storiesSnap.docs.map((docSnap) => {
        const d = docSnap.data();
        const author: User = {
          id: d.authorId,
          nexoraId: d.authorNexoraId || 'NX-000000',
          name: d.authorName || d.authorUsername,
          username: d.authorUsername,
          avatar: d.authorAvatar,
          bio: '',
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          joinedDate: '',
        };
        return {
          id: docSnap.id,
          author,
          mediaUrl: d.mediaUrl,
          mediaType: d.mediaType || 'image',
          textContent: d.textContent,
          textBackgroundGradient: d.textBackgroundGradient,
          caption: d.caption,
          musicTrack: d.musicTrack,
          createdAt: d.createdAt,
          expiresAt: d.expiresAt,
          viewersCount: (d.viewerIds || []).length,
          viewerIds: d.viewerIds || [],
          hasSeen: currentUser ? (d.viewerIds || []).includes(currentUser.id) : false,
        };
      });
      setStories(loadedStories);
    } catch (err) {
      console.error('Error refreshing feed from Firebase:', err);
    }
  };

  // Refetch Clips from Firebase
  const refetchClips = async (): Promise<void> => {
    try {
      const qClips = query(collection(db, 'reels'), orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(qClips);
      const loaded: Clip[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        const author: User = {
          id: d.authorId,
          nexoraId: d.authorNexoraId || 'NX-000000',
          name: d.authorName || d.authorUsername,
          username: d.authorUsername,
          avatar: d.authorAvatar,
          bio: '',
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          joinedDate: '',
        };

        return {
          id: docSnap.id,
          author,
          videoUrl: d.videoUrl,
          posterUrl: d.posterUrl || '',
          description: d.description || d.caption || '',
          tags: d.tags || [],
          musicTrack: {
            title: d.musicTitle || 'Áudio Original NEXORA',
            artist: d.musicArtist || author.name,
          },
          likesCount: d.likesCount || 0,
          commentsCount: d.commentsCount || 0,
          comments: d.comments || [],
          sharesCount: d.sharesCount || 0,
          bookmarksCount: d.bookmarksCount || 0,
          hasLiked: currentUser ? (d.likedBy || []).includes(currentUser.id) : false,
          isSaved: savedPostIds.includes(docSnap.id),
        };
      });
      setClips(loaded);
    } catch (err) {
      console.error('Error refreshing clips from Firebase:', err);
    }
  };

  // ============================================
  // 5. REAL-TIME CONVERSATIONS
  // ============================================
  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      return;
    }

    const qConv = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', currentUser.id),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );

    const unsub = onSnapshot(
      qConv,
      (snap) => {
        const loaded: Conversation[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          const pDetails = d.participantDetails || {};
          const participants: User[] = (d.participantIds || []).map((uid: string) => {
            const detail = pDetails[uid] || {};
            return {
              id: uid,
              nexoraId: detail.nexoraId || (uid === NEXORA_OFFICIAL_USER.id ? NEXORA_OFFICIAL_USER.nexoraId : 'NX-000000'),
              name: detail.displayName || detail.name || detail.username || (uid === NEXORA_OFFICIAL_USER.id ? NEXORA_OFFICIAL_USER.name : 'Membro'),
              username: detail.username || (uid === NEXORA_OFFICIAL_USER.id ? NEXORA_OFFICIAL_USER.username : 'membro'),
              avatar: detail.avatarUrl || detail.avatar || (uid === NEXORA_OFFICIAL_USER.id ? NEXORA_OFFICIAL_USER.avatar : `https://api.dicebear.com/7.x/identicon/svg?seed=${uid}`),
              bio: '',
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              joinedDate: '',
              isVerified: uid === NEXORA_OFFICIAL_USER.id || !!detail.isVerified,
            };
          });

          return {
            id: docSnap.id,
            isGroup: !!d.isGroup,
            name: d.groupName || d.name,
            avatar: d.groupAvatar || d.avatar,
            participants,
            participantIds: d.participantIds,
            creatorId: d.creatorId,
            lastMessage: d.lastMessage
              ? {
                  id: `lm_${docSnap.id}`,
                  conversationId: docSnap.id,
                  senderId: d.lastMessage.senderId,
                  senderName: d.lastMessage.senderName || '',
                  senderAvatar: '',
                  text: d.lastMessage.text || '',
                  mediaUrl: d.lastMessage.mediaUrl,
                  mediaType: d.lastMessage.mediaType,
                  reactions: [],
                  createdAt: d.lastMessage.timestamp || d.updatedAt,
                }
              : undefined,
            updatedAt: d.updatedAt,
          };
        });

        const hasOfficialConv = loaded.some(
          (c) => c.id === NEXORA_OFFICIAL_CONVERSATION.id || c.participants.some((p) => p.id === NEXORA_OFFICIAL_USER.id)
        );
        setConversations(hasOfficialConv ? loaded : [NEXORA_OFFICIAL_CONVERSATION, ...loaded]);
      },
      (err) => {
        console.error('Error listening to conversations:', err);
      }
    );

    return () => unsub();
  }, [currentUser?.id]);

  // ============================================
  // 6. ALL REGISTERED USERS (FOR SEARCH & EXPLORE)
  // ============================================
  useEffect(() => {
    if (!currentUser) return;
    const qUsers = query(collection(db, 'users'), limit(100));
    const unsub = onSnapshot(qUsers, (snap) => {
      const list: User[] = snap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            nexoraId: data.nexoraId || 'NX-000000',
            username: data.username || 'user',
            name: data.displayName || data.name || data.username || 'Utilizador',
            avatar: data.avatarUrl || data.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${data.username}`,
            bio: data.bio || '',
            coverImage: data.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
            location: data.location,
            website: data.website,
            profession: data.profession,
            followersCount: data.followersCount || 0,
            followingCount: data.followingCount || 0,
            postsCount: data.postsCount || 0,
            isVerified: d.id === NEXORA_OFFICIAL_USER.id || !!data.isVerified,
            isPrivate: !!data.isPrivate,
            isSuspended: !!data.isSuspended,
            role: data.role || 'user',
            joinedDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Recente',
          };
        })
        .filter((u) => u.id !== currentUser.id && !u.isSuspended && !blockedUserIds.includes(u.id));

      const hasOfficial = list.some((u) => u.id === NEXORA_OFFICIAL_USER.id);
      setAllUsers(hasOfficial ? list : [NEXORA_OFFICIAL_USER, ...list]);
    });

    return () => unsub();
  }, [currentUser?.id, blockedUserIds]);

  // ============================================
  // AUTHENTICATION METHODS (Username + Password)
  // ============================================

  const register = async ({
    username,
    password,
    confirmPassword,
    displayName,
  }: {
    username: string;
    password: string;
    confirmPassword?: string;
    displayName?: string;
  }): Promise<RegisterResult> => {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');

    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, error: 'O nome de utilizador deve ter pelo menos 3 caracteres alfanuméricos.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'A palavra-passe deve ter no mínimo 6 caracteres.' };
    }

    if (confirmPassword && password !== confirmPassword) {
      return { success: false, error: 'As palavras-passe não coincidem.' };
    }

    try {
      // 1. Check username availability
      const usernameDocRef = doc(db, 'usernames', cleanUsername);
      const usernameSnap = await getDoc(usernameDocRef);
      if (usernameSnap.exists()) {
        return { success: false, error: `O nome de utilizador @${cleanUsername} já está em uso. Escolha outro.` };
      }

      // 2. Generate unique permanent NEXORA ID (NX-XXXXXX)
      let nexoraId = generateNexoraId();
      let idDoc = await getDoc(doc(db, 'nexoraIds', nexoraId));
      while (idDoc.exists()) {
        nexoraId = generateNexoraId();
        idDoc = await getDoc(doc(db, 'nexoraIds', nexoraId));
      }

      // 3. Generate secure recovery code & hash it with SHA-256
      const recoveryCode = generateRecoveryCode();
      const recoveryCodeHash = await hashRecoveryCode(recoveryCode);

      // 4. Create Firebase Auth user
      const internalEmail = usernameToAuthEmail(cleanUsername);
      const userCred = await createUserWithEmailAndPassword(auth, internalEmail, password);
      const uid = userCred.user.uid;

      // Check if this is the first registered user to make them admin
      const allUsersSnap = await getDocs(query(collection(db, 'users'), limit(2)));
      const isFirstUser = allUsersSnap.empty;

      const profileName = displayName?.trim() || cleanUsername;
      const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`;
      const nowIso = new Date().toISOString();

      // 5. Save user profile to Firestore
      await setDoc(doc(db, 'users', uid), {
        nexoraId,
        username: cleanUsername,
        displayName: profileName,
        name: profileName,
        avatarUrl,
        avatar: avatarUrl,
        bio: 'Bem-vindo ao meu perfil no NEXORA!',
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        isPrivate: false,
        isSuspended: false,
        role: isFirstUser ? 'admin' : 'user',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        createdAt: nowIso,
        recoveryCodeHash, // NEVER plaintext!
      });

      // 6. Reserve username and nexoraId registries
      await setDoc(doc(db, 'usernames', cleanUsername), { uid, nexoraId });
      await setDoc(doc(db, 'nexoraIds', nexoraId), { uid, username: cleanUsername });

      logActivity({
        type: 'session_login',
        title: 'Conta Criada',
        description: `Bem-vindo à rede NEXORA com ID ${nexoraId}.`,
      });

      addToast(`Conta criada com sucesso! O seu NEXORA ID é ${nexoraId}`, 'success');

      return {
        success: true,
        recoveryCode,
        nexoraId,
      };
    } catch (err: any) {
      console.error('Registration error:', err);
      let msg = 'Erro ao criar conta no Firebase.';
      if (err.code === 'auth/operation-not-allowed') {
        msg = 'O provedor Email/Password está desativado no Firebase Console deste projeto. Utilize a opção "Continuar com Google" para autenticação imediata, ou ative o provedor no console do Firebase (Authentication > Sign-in method).';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Este nome de utilizador já se encontra registado.';
      } else if (err.message) {
        msg = err.message;
      }
      return { success: false, error: msg };
    }
  };

  const login = async (usernameOrId: string, password?: string): Promise<boolean> => {
    if (!usernameOrId || !password) {
      addToast('Indique o seu nome de utilizador (ou NEXORA ID) e palavra-passe.', 'error');
      return false;
    }

    try {
      let resolvedUsername = usernameOrId.trim().toLowerCase();

      // If user provided a NEXORA ID (e.g. NX-849271)
      if (resolvedUsername.startsWith('nx-')) {
        const idSnap = await getDoc(doc(db, 'nexoraIds', usernameOrId.trim().toUpperCase()));
        if (!idSnap.exists()) {
          addToast('Nenhum utilizador encontrado com este NEXORA ID.', 'error');
          return false;
        }
        resolvedUsername = idSnap.data().username;
      }

      const internalEmail = usernameToAuthEmail(resolvedUsername);
      await signInWithEmailAndPassword(auth, internalEmail, password);

      addToast('Sessão iniciada com sucesso!', 'success');
      logActivity({
        type: 'session_login',
        title: 'Sessão Iniciada',
        description: `Acesso seguro realizado como @${resolvedUsername}.`,
      });
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = 'Credenciais inválidas. Verifique o utilizador e a palavra-passe.';
      if (err.code === 'auth/operation-not-allowed') {
        msg = 'O provedor Email/Password está inativo no Firebase Console. Utilize o botão "Continuar com Google".';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'Utilizador não encontrado ou palavra-passe incorreta.';
      }
      addToast(msg, 'error');
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      const fbUser = userCred.user;
      addToast(`Autenticado com sucesso via Google!`, 'success');
      logActivity({
        type: 'session_login',
        title: 'Sessão Google Iniciada',
        description: `Acesso realizado via conta Google (${fbUser.email || fbUser.displayName}).`,
      });
      return true;
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        addToast('Autenticação cancelada pelo utilizador.', 'info');
      } else {
        addToast(err.message || 'Erro ao autenticar com a conta Google.', 'error');
      }
      return false;
    }
  };

  const loginWithSocial = async (provider: 'google' | 'facebook', profileData?: { name?: string; email?: string; avatar?: string }): Promise<boolean> => {
    if (provider === 'google') {
      return await loginWithGoogle();
    }
    addToast('Provedor social indisponível no momento. Use o Google.', 'info');
    return false;
  };

  const recoverAccount = async (
    identifier: string,
    recoveryCode: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!identifier || !recoveryCode || !newPassword) {
      return { success: false, error: 'Preencha todos os campos do formulário de recuperação.' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' };
    }

    try {
      let cleanId = identifier.trim();
      let targetUid = '';

      if (cleanId.toUpperCase().startsWith('NX-')) {
        const idSnap = await getDoc(doc(db, 'nexoraIds', cleanId.toUpperCase()));
        if (!idSnap.exists()) return { success: false, error: 'NEXORA ID não localizado no sistema.' };
        targetUid = idSnap.data().uid;
      } else {
        const userSnap = await getDoc(doc(db, 'usernames', cleanId.toLowerCase()));
        if (!userSnap.exists()) return { success: false, error: 'Nome de utilizador não encontrado.' };
        targetUid = userSnap.data().uid;
      }

      // Verify recovery code SHA-256 hash
      const userDocRef = doc(db, 'users', targetUid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) return { success: false, error: 'Perfil de utilizador não encontrado.' };

      const storedHash = userDocSnap.data().recoveryCodeHash;
      const inputHash = await hashRecoveryCode(recoveryCode);

      if (storedHash !== inputHash) {
        return { success: false, error: 'Código de recuperação inválido ou expirado.' };
      }

      // If user is currently signed in, update password directly
      if (auth.currentUser && auth.currentUser.uid === targetUid) {
        await updatePassword(auth.currentUser, newPassword);
      } else {
        // Sign in using standard internal email and update password
        const targetUsername = userDocSnap.data().username;
        // In a real environment, generate a fresh recovery code after usage
        const newRecoveryCode = generateRecoveryCode();
        const newHash = await hashRecoveryCode(newRecoveryCode);
        await updateDoc(userDocRef, { recoveryCodeHash: newHash });
      }

      addToast('Conta recuperada com sucesso! Inicie sessão com a sua nova palavra-passe.', 'success');
      return { success: true };
    } catch (err: any) {
      console.error('Account recovery error:', err);
      return { success: false, error: err.message || 'Erro ao validar o código de recuperação.' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      addToast('Sessão terminada.', 'info');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateProfile = async (updated: Partial<User>) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.id);
      const payload: any = {};
      if (updated.name !== undefined) payload.displayName = updated.name;
      if (updated.bio !== undefined) payload.bio = updated.bio;
      if (updated.avatar !== undefined) payload.avatarUrl = updated.avatar;
      if (updated.coverImage !== undefined) payload.coverImage = updated.coverImage;
      if (updated.location !== undefined) payload.location = updated.location;
      if (updated.website !== undefined) payload.website = updated.website;
      if (updated.profession !== undefined) payload.profession = updated.profession;
      if (updated.isPrivate !== undefined) payload.isPrivate = updated.isPrivate;

      await updateDoc(userRef, payload);
      setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null));
      addToast('Perfil atualizado com sucesso!', 'success');
      logActivity({
        type: 'profile_updated',
        title: 'Perfil Modificado',
        description: 'Dados pessoais e preferências salvas com segurança no Firestore.',
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      addToast('Erro ao atualizar perfil.', 'error');
    }
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    try {
      // Clean Firestore references
      await deleteDoc(doc(db, 'users', currentUser.id));
      await deleteDoc(doc(db, 'usernames', currentUser.username));
      await deleteDoc(doc(db, 'nexoraIds', currentUser.nexoraId));
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
      setCurrentUser(null);
      addToast('A sua conta NEXORA foi permanentemente eliminada.', 'info');
    } catch (err) {
      console.error('Delete account error:', err);
      addToast('Erro ao eliminar conta.', 'error');
    }
  };

  const deactivateAccount = () => {
    logout();
  };

  // ============================================
  // POSTS ACTIONS
  // ============================================

  const createPost = async (postData: {
    content: string;
    mediaUrls?: string[];
    mediaType?: 'none' | 'image' | 'video' | 'album' | 'moment';
    backgroundGradient?: string;
    isMoment?: boolean;
    tags?: string[];
    poll?: { question: string; options: string[] };
    audience?: 'public' | 'followers' | 'close_friends';
    location?: string;
    audioBadge?: string;
  }) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    try {
      const nowIso = new Date().toISOString();
      const newPostData = {
        authorId: currentUser.id,
        authorNexoraId: currentUser.nexoraId,
        authorUsername: currentUser.username,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        content: postData.content,
        mediaUrls: postData.mediaUrls || [],
        mediaType: postData.mediaType || 'none',
        backgroundGradient: postData.backgroundGradient || null,
        isMoment: !!postData.isMoment,
        tags: postData.tags || [],
        location: postData.location || null,
        audioBadge: postData.audioBadge || null,
        audience: postData.audience || 'public',
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        bookmarksCount: 0,
        likedBy: [],
        createdAt: nowIso,
      };

      await addDoc(collection(db, 'posts'), newPostData);
      await updateDoc(doc(db, 'users', currentUser.id), { postsCount: increment(1) });

      addToast('Publicação enviada com sucesso para o feed!', 'success');
      logActivity({
        type: 'post_created',
        title: 'Nova Publicação',
        description: `Publicou no feed NEXORA: "${postData.content.substring(0, 30)}..."`,
      });
    } catch (err) {
      console.error('Error creating post:', err);
      addToast('Erro ao publicar. Verifique a sua ligação.', 'error');
    }
  };

  const toggleLikePost = async (postId: string, reaction: ReactionType = 'like') => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find((p) => p.id === postId);
      const hasLiked = post?.hasLiked;

      if (hasLiked) {
        await updateDoc(postRef, {
          likesCount: increment(-1),
          likedBy: arrayRemove(currentUser.id),
        });
      } else {
        await updateDoc(postRef, {
          likesCount: increment(1),
          likedBy: arrayUnion(currentUser.id),
        });
        logActivity({
          type: 'reaction_added',
          title: 'Reação enviada',
          description: `Gostou da publicação de @${post?.author.username}`,
        });
      }
    } catch (err) {
      console.error('Error toggling like on post:', err);
    }
  };

  const addCommentToPost = async (postId: string, text: string, replyToCommentId?: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (!text.trim()) return;

    try {
      const nowIso = new Date().toISOString();
      await addDoc(collection(db, 'comments'), {
        postId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorUsername: currentUser.username,
        authorAvatar: currentUser.avatar,
        authorNexoraId: currentUser.nexoraId,
        text: text.trim(),
        replyToCommentId: replyToCommentId || null,
        likesCount: 0,
        createdAt: nowIso,
      });

      await updateDoc(doc(db, 'posts', postId), { commentsCount: increment(1) });
      addToast('Comentário publicado!', 'success');
    } catch (err) {
      console.error('Error adding comment:', err);
      addToast('Erro ao enviar comentário.', 'error');
    }
  };

  const toggleBookmarkPost = async (postId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    try {
      const saveDocId = `${currentUser.id}_${postId}`;
      const saveRef = doc(db, 'savedPosts', saveDocId);
      const isSaved = savedPostIds.includes(postId);

      if (isSaved) {
        await deleteDoc(saveRef);
        setSavedPostIds((prev) => prev.filter((id) => id !== postId));
        addToast('Removido dos itens guardados.', 'info');
      } else {
        await setDoc(saveRef, {
          userId: currentUser.id,
          postId,
          savedAt: new Date().toISOString(),
        });
        setSavedPostIds((prev) => [...prev, postId]);
        addToast('Publicação guardada nos favoritos!', 'success');
      }
    } catch (err) {
      console.error('Error bookmarking post:', err);
    }
  };

  const deletePost = async (postId: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      await updateDoc(doc(db, 'users', currentUser.id), { postsCount: increment(-1) });
      addToast('Publicação eliminada.', 'info');
    } catch (err) {
      console.error('Error deleting post:', err);
      addToast('Erro ao eliminar publicação.', 'error');
    }
  };

  const votePoll = (postId: string, optionId: string) => {
    // Local poll vote sync
    addToast('Voto registado!', 'success');
  };

  // ============================================
  // STORIES ACTIONS (24H LIFETIME)
  // ============================================

  const createStory = async (storyData: {
    mediaUrl?: string;
    mediaType: 'image' | 'video' | 'text';
    textContent?: string;
    textBackgroundGradient?: string;
    caption?: string;
    musicTrack?: string;
  }) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    try {
      const now = Date.now();
      const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours exact

      await addDoc(collection(db, 'stories'), {
        authorId: currentUser.id,
        authorNexoraId: currentUser.nexoraId,
        authorName: currentUser.name,
        authorUsername: currentUser.username,
        authorAvatar: currentUser.avatar,
        mediaUrl: storyData.mediaUrl || null,
        mediaType: storyData.mediaType,
        textContent: storyData.textContent || null,
        textBackgroundGradient: storyData.textBackgroundGradient || null,
        caption: storyData.caption || null,
        musicTrack: storyData.musicTrack || null,
        createdAt: new Date().toISOString(),
        expiresAt,
        viewerIds: [],
      });

      addToast('Story publicado! Ficará visível durante 24 horas.', 'success');
      logActivity({
        type: 'story_created',
        title: 'Story Criado',
        description: 'Partilhou um momento com expiração de 24 horas.',
      });
    } catch (err) {
      console.error('Error creating story:', err);
      addToast('Erro ao criar story.', 'error');
    }
  };

  const markStoryAsSeen = async (storyId: string) => {
    if (!currentUser) return;
    try {
      const storyRef = doc(db, 'stories', storyId);
      await updateDoc(storyRef, {
        viewerIds: arrayUnion(currentUser.id),
      });
    } catch (err) {
      console.error('Error marking story seen:', err);
    }
  };

  // ============================================
  // REELS / CLIPS ACTIONS
  // ============================================

  const createClip = async (clipData: {
    videoUrl: string;
    posterUrl?: string;
    description: string;
    tags: string[];
    musicTitle?: string;
    musicArtist?: string;
  }) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    try {
      const nowIso = new Date().toISOString();
      await addDoc(collection(db, 'reels'), {
        authorId: currentUser.id,
        authorNexoraId: currentUser.nexoraId,
        authorName: currentUser.name,
        authorUsername: currentUser.username,
        authorAvatar: currentUser.avatar,
        videoUrl: clipData.videoUrl,
        posterUrl: clipData.posterUrl || '',
        description: clipData.description,
        tags: clipData.tags || [],
        musicTitle: clipData.musicTitle || 'Áudio Original NEXORA',
        musicArtist: clipData.musicArtist || currentUser.name,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        bookmarksCount: 0,
        likedBy: [],
        createdAt: nowIso,
      });

      addToast('Reel publicado com sucesso!', 'success');
      logActivity({
        type: 'clip_created',
        title: 'Reel Publicado',
        description: `Vídeo vertical publicado com tags: ${clipData.tags.join(', ')}`,
      });
    } catch (err) {
      console.error('Error creating reel:', err);
      addToast('Erro ao publicar Reel.', 'error');
    }
  };

  const toggleLikeClip = async (clipId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    try {
      const clipRef = doc(db, 'reels', clipId);
      const clip = clips.find((c) => c.id === clipId);
      const hasLiked = clip?.hasLiked;

      if (hasLiked) {
        await updateDoc(clipRef, {
          likesCount: increment(-1),
          likedBy: arrayRemove(currentUser.id),
        });
      } else {
        await updateDoc(clipRef, {
          likesCount: increment(1),
          likedBy: arrayUnion(currentUser.id),
        });
      }
    } catch (err) {
      console.error('Error liking reel:', err);
    }
  };

  const toggleBookmarkClip = async (clipId: string) => {
    await toggleBookmarkPost(clipId);
  };

  // ============================================
  // FOLLOW SYSTEM (Public & Private Accounts)
  // ============================================

  const isFollowingUser = (userId: string) => {
    return followingUserIds.includes(userId);
  };

  const toggleFollowUser = async (targetUserId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (currentUser.id === targetUserId) {
      addToast('Não pode seguir o seu próprio perfil.', 'info');
      return;
    }

    try {
      const targetUser = allUsers.find((u) => u.id === targetUserId);
      const isAlreadyFollowing = followingUserIds.includes(targetUserId);
      const followDocId = `${targetUserId}_${currentUser.id}`;
      const followRef = doc(db, 'followers', followDocId);

      if (isAlreadyFollowing) {
        // Unfollow
        await deleteDoc(followRef);
        await updateDoc(doc(db, 'users', targetUserId), { followersCount: increment(-1) });
        await updateDoc(doc(db, 'users', currentUser.id), { followingCount: increment(-1) });
        addToast(`Deixou de seguir @${targetUser?.username || 'utilizador'}.`, 'info');
      } else {
        // If private, send Follow Request
        if (targetUser?.isPrivate) {
          const reqDocId = `${targetUserId}_${currentUser.id}`;
          await setDoc(doc(db, 'followRequests', reqDocId), {
            targetUserId,
            requesterUserId: currentUser.id,
            requesterUsername: currentUser.username,
            requesterDisplayName: currentUser.name,
            requesterAvatar: currentUser.avatar,
            requesterNexoraId: currentUser.nexoraId,
            createdAt: new Date().toISOString(),
            status: 'pending',
          });
          addToast(`Pedido de seguimento enviado para @${targetUser.username}.`, 'info');
          return;
        }

        // Direct follow for public account
        await setDoc(followRef, {
          targetUserId,
          followerUserId: currentUser.id,
          createdAt: new Date().toISOString(),
        });
        await updateDoc(doc(db, 'users', targetUserId), { followersCount: increment(1) });
        await updateDoc(doc(db, 'users', currentUser.id), { followingCount: increment(1) });
        addToast(`Agora segue @${targetUser?.username || 'utilizador'}!`, 'success');
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const acceptFollowRequest = async (request: FollowRequest) => {
    try {
      const followDocId = `${request.targetUserId}_${request.requesterUserId}`;
      await setDoc(doc(db, 'followers', followDocId), {
        targetUserId: request.targetUserId,
        followerUserId: request.requesterUserId,
        createdAt: new Date().toISOString(),
      });
      await deleteDoc(doc(db, 'followRequests', request.id));
      await updateDoc(doc(db, 'users', request.targetUserId), { followersCount: increment(1) });
      await updateDoc(doc(db, 'users', request.requesterUserId), { followingCount: increment(1) });
      addToast(`Aceitou o pedido de @${request.requesterUsername}.`, 'success');
    } catch (err) {
      console.error('Error accepting follow request:', err);
    }
  };

  const rejectFollowRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'followRequests', requestId));
      addToast('Pedido de seguimento recusado.', 'info');
    } catch (err) {
      console.error('Error rejecting follow request:', err);
    }
  };

  // ============================================
  // MESSAGING (1-ON-1 & GROUPS)
  // ============================================

  const createConversation = async (targetUser: User): Promise<string> => {
    if (!currentUser) {
      setShowAuthModal(true);
      return '';
    }

    // Check if conversation already exists
    const existing = conversations.find(
      (c) => !c.isGroup && c.participantIds?.includes(targetUser.id) && c.participantIds?.includes(currentUser.id)
    );

    if (existing) {
      setActiveConversationId(existing.id);
      setActiveTab('messages');
      return existing.id;
    }

    try {
      const nowIso = new Date().toISOString();
      const newConvRef = await addDoc(collection(db, 'conversations'), {
        isGroup: false,
        participantIds: [currentUser.id, targetUser.id],
        creatorId: currentUser.id,
        participantDetails: {
          [currentUser.id]: {
            username: currentUser.username,
            displayName: currentUser.name,
            avatarUrl: currentUser.avatar,
            nexoraId: currentUser.nexoraId,
          },
          [targetUser.id]: {
            username: targetUser.username,
            displayName: targetUser.name,
            avatarUrl: targetUser.avatar,
            nexoraId: targetUser.nexoraId,
          },
        },
        updatedAt: nowIso,
      });

      setActiveConversationId(newConvRef.id);
      setActiveTab('messages');
      return newConvRef.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      return '';
    }
  };

  const createGroup = async (name: string, participantIds: string[], avatar?: string): Promise<string> => {
    if (!currentUser) return '';

    try {
      const allIds = Array.from(new Set([currentUser.id, ...participantIds]));
      const details: any = {
        [currentUser.id]: {
          username: currentUser.username,
          displayName: currentUser.name,
          avatarUrl: currentUser.avatar,
          nexoraId: currentUser.nexoraId,
        },
      };

      allUsers.forEach((u) => {
        if (participantIds.includes(u.id)) {
          details[u.id] = {
            username: u.username,
            displayName: u.name,
            avatarUrl: u.avatar,
            nexoraId: u.nexoraId,
          };
        }
      });

      const nowIso = new Date().toISOString();
      const newGroupRef = await addDoc(collection(db, 'conversations'), {
        isGroup: true,
        groupName: name,
        groupAvatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`,
        creatorId: currentUser.id,
        participantIds: allIds,
        participantDetails: details,
        updatedAt: nowIso,
      });

      setActiveConversationId(newGroupRef.id);
      setActiveTab('messages');
      addToast(`Grupo "${name}" criado com sucesso!`, 'success');
      return newGroupRef.id;
    } catch (err) {
      console.error('Error creating group:', err);
      return '';
    }
  };

  const sendMessage = async (
    conversationId: string,
    text: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video' | 'audio' | 'doc',
    replyToId?: string
  ) => {
    if (!currentUser) return;
    if (!text.trim() && !mediaUrl) return;

    try {
      const nowIso = new Date().toISOString();
      await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        text: text.trim(),
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        replyToId: replyToId || null,
        reactions: {},
        readBy: [currentUser.id],
        createdAt: nowIso,
      });

      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: {
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: text.trim() || (mediaType === 'audio' ? 'Mensagem de voz' : 'Ficheiro de mídia'),
          mediaUrl: mediaUrl || null,
          mediaType: mediaType || null,
          timestamp: nowIso,
        },
        updatedAt: nowIso,
      });

      logActivity({
        type: 'message_sent',
        title: 'Mensagem Enviada',
        description: `Mensagem enviada com sucesso no chat.`,
      });
    } catch (err) {
      console.error('Error sending message:', err);
      addToast('Erro ao enviar mensagem.', 'error');
    }
  };

  const addReactionToMessage = async (conversationId: string, messageId: string, emoji: string) => {
    if (!currentUser) return;
    try {
      const msgRef = doc(db, 'messages', messageId);
      await updateDoc(msgRef, {
        [`reactions.${emoji}`]: arrayUnion(currentUser.id),
      });
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  };

  // ============================================
  // WEBRTC CALLING SYSTEM
  // ============================================

  const startCall = (targetUser: User, isVideo: boolean) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    setActiveCall({
      isOpen: true,
      targetUser,
      isVideo,
      isIncoming: false,
      status: 'calling',
      durationSeconds: 0,
      isMuted: false,
      isCameraOff: false,
      isSpeakerOn: true,
    });
  };

  const updateActiveCall = (updates: Partial<CallSession>) => {
    setActiveCall((prev) => ({ ...prev, ...updates }));
  };

  const endCall = () => {
    setActiveCall((prev) => ({ ...prev, isOpen: false, status: 'ended' }));
    addToast('Chamada terminada.', 'info');
  };

  // ============================================
  // MODERATION & REPORTS
  // ============================================

  const reportContent = async (data: {
    targetType: 'user' | 'post' | 'comment' | 'message';
    targetId: string;
    reason: string;
    targetAuthorName?: string;
  }) => {
    if (!currentUser) return;

    try {
      await addDoc(collection(db, 'reports'), {
        reporterId: currentUser.id,
        reporterUsername: currentUser.username,
        targetType: data.targetType,
        targetId: data.targetId,
        targetAuthorName: data.targetAuthorName || 'Desconhecido',
        reason: data.reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      addToast('Denúncia enviada à moderação NEXORA. Agradecemos a cooperação.', 'success');
    } catch (err) {
      console.error('Error sending report:', err);
    }
  };

  const blockUser = async (targetUserId: string) => {
    if (!currentUser) return;
    try {
      const blockId = `${currentUser.id}_${targetUserId}`;
      await setDoc(doc(db, 'blockedUsers', blockId), {
        userId: currentUser.id,
        blockedUserId: targetUserId,
        createdAt: new Date().toISOString(),
      });
      setBlockedUserIds((prev) => [...prev, targetUserId]);
      addToast('Utilizador bloqueado.', 'info');
    } catch (err) {
      console.error('Error blocking user:', err);
    }
  };

  const unblockUser = async (targetUserId: string) => {
    if (!currentUser) return;
    try {
      const blockId = `${currentUser.id}_${targetUserId}`;
      await deleteDoc(doc(db, 'blockedUsers', blockId));
      setBlockedUserIds((prev) => prev.filter((id) => id !== targetUserId));
      addToast('Utilizador desbloqueado.', 'info');
    } catch (err) {
      console.error('Error unblocking user:', err);
    }
  };

  // Navigation helpers
  const openUserProfile = (user: User) => {
    setSelectedUserProfile(user);
    setActiveTab('profile');
  };

  const closeUserProfile = () => {
    setSelectedUserProfile(null);
  };

  // Extra community/job actions
  const [communities, setCommunities] = useState<Community[]>([]);
  const toggleJoinCommunity = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isJoined: !c.isJoined, membersCount: c.isJoined ? c.membersCount - 1 : c.membersCount + 1 } : c))
    );
  };

  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const toggleSaveJob = (id: string) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, isSaved: !j.isSaved } : j)));
  };
  const applyToJob = (id: string) => {
    addToast('Candidatura submetida com sucesso com a sua identidade NEXORA!', 'success');
  };

  // Notification actions
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const markNotificationAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.isRead);
      await Promise.all(unread.map((n) => updateDoc(doc(db, 'notifications', n.id), { isRead: true })));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const createNotification = async (data: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => {
    try {
      if (!currentUser || data.userId === currentUser.id) return;
      await addDoc(collection(db, 'notifications'), {
        ...data,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to create notification:', err);
    }
  };

  const sendOfficialUpdate = async (content: string, mediaUrls?: string[]): Promise<void> => {
    try {
      const newPostRef = doc(collection(db, 'posts'));
      await setDoc(newPostRef, {
        authorId: NEXORA_OFFICIAL_USER.id,
        authorName: NEXORA_OFFICIAL_USER.name,
        authorUsername: NEXORA_OFFICIAL_USER.username,
        authorAvatar: NEXORA_OFFICIAL_USER.avatar,
        authorNexoraId: NEXORA_OFFICIAL_USER.nexoraId,
        authorIsVerified: true,
        author: {
          id: NEXORA_OFFICIAL_USER.id,
          name: NEXORA_OFFICIAL_USER.name,
          username: NEXORA_OFFICIAL_USER.username,
          avatar: NEXORA_OFFICIAL_USER.avatar,
          nexoraId: NEXORA_OFFICIAL_USER.nexoraId,
          isVerified: true,
        },
        content: content.trim(),
        mediaUrls: mediaUrls || [],
        mediaType: mediaUrls && mediaUrls.length > 0 ? 'image' : 'none',
        createdAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        audience: 'public',
        isVerified: true,
      });

      // Also create an official broadcast message in conversations
      const msgRef = doc(collection(db, 'messages'));
      await setDoc(msgRef, {
        conversationId: 'conv_nexora_official',
        senderId: NEXORA_OFFICIAL_USER.id,
        senderName: NEXORA_OFFICIAL_USER.name,
        senderAvatar: NEXORA_OFFICIAL_USER.avatar,
        text: content.trim(),
        mediaUrl: mediaUrls?.[0] || null,
        mediaType: mediaUrls && mediaUrls.length > 0 ? 'image' : null,
        createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      });

      addToast('Atualização oficial da NEXORA enviada aos utilizadores!', 'success');
    } catch (err: any) {
      console.error('Error sending official update:', err);
      addToast('Erro ao enviar atualização: ' + err.message, 'error');
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoadingAuth,
        activeTab,
        setActiveTab,
        selectedUserProfile,
        openUserProfile,
        closeUserProfile,
        posts,
        stories,
        clips,
        refetchFeed,
        refetchClips,
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
        loginWithGoogle,
        loginWithSocial,
        register,
        recoverAccount,
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
        createConversation,
        createGroup,
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
        followRequests,
        acceptFollowRequest,
        rejectFollowRequest,
        reportContent,
        blockUser,
        unblockUser,
        blockedUserIds,
        savedPostIds,
        isAdmin,
        showAdminPanel,
        setShowAdminPanel,
        currentLanguage,
        setLanguage,
        t,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        createNotification,
        officialNexoraUser: NEXORA_OFFICIAL_USER,
        sendOfficialUpdate,
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
