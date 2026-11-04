import { User, Post, Story, Clip, Conversation, Community, JobOpportunity } from '../types';

// All demonstration and fake data removed as requested by NEXORA specification.
// Real data is populated exclusively via Firebase Cloud Firestore and Authentication.

export const CURRENT_USER: User | null = null;
export const MOCK_USERS: User[] = [];
export const INITIAL_POSTS: Post[] = [];
export const INITIAL_STORIES: Story[] = [];
export const INITIAL_CLIPS: Clip[] = [];
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const MOCK_COMMUNITIES: Community[] = [];
export const MOCK_JOBS: JobOpportunity[] = [];
export const TRENDING_TOPICS = [
  { tag: '#NEXORA', category: 'Ecossistema', postCount: 'Oficial' },
  { tag: '#Segurança', category: 'Criptografia', postCount: 'Alta' },
  { tag: '#WebRTC', category: 'Comunicação', postCount: 'Tempo Real' },
  { tag: '#Inovação', category: 'Tecnologia', postCount: 'Tendência' },
];
