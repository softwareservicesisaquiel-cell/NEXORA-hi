export interface User {
  id: string; // Firebase Auth UID
  nexoraId: string; // Permanent unique NEXORA ID (e.g. NX-849271)
  name: string; // Display name
  username: string; // Unique username (e.g. alex)
  email?: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  location?: string;
  website?: string;
  profession?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified?: boolean;
  isPrivate?: boolean;
  isSuspended?: boolean;
  role?: 'user' | 'admin';
  joinedDate: string;
  recoveryCode?: string;
  recoveryCodeHash?: string;
  twoFactorEnabled?: boolean;
  interests?: string[];
}

export type ReactionType = 'like' | 'love' | 'insight' | 'rocket' | 'laugh';

export interface Comment {
  id: string;
  postId?: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    nexoraId?: string;
  };
  text: string;
  createdAt: string;
  likesCount: number;
  hasLiked?: boolean;
  replyToCommentId?: string;
  replies?: Comment[];
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  mediaUrls?: string[];
  mediaType: 'none' | 'image' | 'video' | 'album' | 'moment';
  backgroundGradient?: string;
  isMoment?: boolean;
  location?: string;
  tags?: string[];
  mentions?: string[];
  poll?: Poll;
  audioBadge?: string;
  linkPreview?: {
    title: string;
    description: string;
    domain: string;
    image?: string;
    url: string;
  };
  createdAt: string;
  likesCount: number;
  hasLiked?: boolean;
  userReaction?: ReactionType;
  reactionsSummary?: Record<ReactionType, number>;
  commentsCount: number;
  comments?: Comment[];
  sharesCount: number;
  bookmarksCount?: number;
  isSaved?: boolean;
  isPinned?: boolean;
  audience: 'public' | 'followers' | 'close_friends';
}

export interface Story {
  id: string;
  author: User;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'text';
  textBackgroundGradient?: string;
  textContent?: string;
  caption?: string;
  musicTrack?: string;
  stickers?: string[];
  createdAt: string;
  expiresAt?: number;
  expiresInHours?: number;
  viewersCount: number;
  viewerIds?: string[];
  hasSeen?: boolean;
}

export interface Clip {
  id: string;
  author: User;
  videoUrl: string;
  posterUrl?: string;
  description: string;
  tags: string[];
  musicTrack: {
    title: string;
    artist: string;
  };
  likesCount: number;
  hasLiked: boolean;
  commentsCount: number;
  comments: Comment[];
  sharesCount: number;
  bookmarksCount?: number;
  viewsCount?: number;
  isSaved?: boolean;
  quality?: 'auto' | '1080p' | '720p' | 'eco';
  createdAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'doc';
  audioDuration?: number;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  reactions: {
    emoji: string;
    userId: string;
  }[];
  readBy?: string[];
  status?: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  name?: string;
  avatar?: string;
  participants: User[];
  participantIds?: string[];
  creatorId?: string;
  lastMessage?: Message;
  unreadCount?: number;
  isPinned?: boolean;
  isMuted?: boolean;
  updatedAt?: string;
  typingUser?: string;
}

export interface FollowRequest {
  id: string;
  targetUserId: string;
  requesterUserId: string;
  requesterUsername: string;
  requesterDisplayName: string;
  requesterAvatar: string;
  requesterNexoraId: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Community {
  id: string;
  name: string;
  handle: string;
  description: string;
  bannerImage: string;
  iconImage: string;
  membersCount: number;
  category: string;
  isJoined: boolean;
  recentTopic: string;
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  workplaceType: 'Remoto' | 'Híbrido' | 'Presencial';
  salaryRange: string;
  tags: string[];
  postedTime: string;
  applicantsCount: number;
  description: string;
  companyLogo: string;
  isSaved?: boolean;
}

export interface CallSession {
  isOpen: boolean;
  callId?: string;
  targetUser: User | null;
  isVideo: boolean;
  isIncoming?: boolean;
  status: 'idle' | 'calling' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'rejected';
  durationSeconds: number;
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeakerOn: boolean;
}

export type ActivityType =
  | 'post_created'
  | 'tab_navigation'
  | 'story_created'
  | 'clip_created'
  | 'profile_updated'
  | 'reaction_added'
  | 'message_sent'
  | 'bookmark_saved'
  | 'session_login'
  | 'settings_changed';

export interface UserActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    tab?: string;
    postId?: string;
    targetName?: string;
    mediaType?: string;
    details?: string;
    provider?: string;
  };
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterUsername?: string;
  targetType: 'user' | 'post' | 'comment' | 'message';
  targetId: string;
  targetAuthorName?: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'follow_request' | 'message' | 'call' | 'mention';
  title?: string;
  message?: string;
  senderId?: string;
  senderName?: string;
  senderUsername?: string;
  senderAvatar?: string;
  actorId?: string;
  actorName?: string;
  actorUsername?: string;
  actorAvatar?: string;
  targetId?: string;
  previewContent?: string;
  createdAt: string;
  isRead: boolean;
}
