export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  coverImage: string;
  bio: string;
  location?: string;
  website?: string;
  profession?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified?: boolean;
  isPrivate?: boolean;
  joinedDate: string;
  interests?: string[];
  twoFactorEnabled?: boolean;
}

export type ReactionType = 'like' | 'love' | 'insight' | 'rocket' | 'laugh';

export interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
  likesCount: number;
  hasLiked?: boolean;
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
  linkPreview?: {
    title: string;
    description: string;
    domain: string;
    image?: string;
    url: string;
  };
  audioBadge?: string;
  createdAt: string;
  likesCount: number;
  hasLiked?: boolean;
  userReaction?: ReactionType;
  reactionsSummary: Record<ReactionType, number>;
  commentsCount: number;
  comments: Comment[];
  sharesCount: number;
  bookmarksCount: number;
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
  expiresInHours: number;
  viewersCount: number;
  hasSeen?: boolean;
}

export interface Highlight {
  id: string;
  title: string;
  coverImage: string;
  storiesCount: number;
}

export interface Clip {
  id: string;
  author: User;
  videoUrl?: string;
  posterUrl: string;
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
  bookmarksCount: number;
  isSaved: boolean;
  quality: 'auto' | '1080p' | '720p' | 'eco';
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
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  name?: string;
  avatar?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  typingUser?: string;
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
  targetUser: User | null;
  isVideo: boolean;
  status: 'connecting' | 'connected' | 'ended';
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
  timestamp: string; // ISO String
  metadata?: {
    tab?: string;
    postId?: string;
    targetName?: string;
    mediaType?: string;
    details?: string;
    provider?: string;
  };
}
