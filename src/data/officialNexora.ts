import { User, Post, Conversation } from '../types';
import { doc, getDoc, setDoc, Firestore } from '../lib/firebase';

export const NEXORA_OFFICIAL_USER: User = {
  id: 'nexora_official_system_uid',
  nexoraId: 'NX-000001',
  name: 'NEXORA Oficial',
  username: 'nexora',
  email: 'oficial@nexora.app',
  avatar: '/icon-192.png',
  coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  bio: 'Perfil Oficial da NEXORA. Atualizações da plataforma, novidades, lançamentos e anúncios oficiais para a comunidade.',
  location: 'Rede Global NEXORA',
  website: 'nexora.app',
  profession: 'Plataforma Oficial',
  followersCount: 148200,
  followingCount: 1,
  postsCount: 1,
  isVerified: true,
  isPrivate: false,
  role: 'admin',
  joinedDate: 'Janeiro de 2026',
};

export const NEXORA_OFFICIAL_INITIAL_POST: Post = {
  id: 'post_nexora_official_v2',
  author: NEXORA_OFFICIAL_USER,
  content: '🚀 Bem-vindos à nova versão da NEXORA! \n\n✨ Novas Funcionalidades Ativas:\n• 📸 Nova Câmara Integrada com modos Story, Reel e Ao Vivo com filtros visuais;\n• 💬 Mensagens organizadas em Principal, Geral e Pedidos;\n• 🌟 Destaques de Stories no Perfil;\n• 🛡️ Gestor de Permissões e Segurança de Dispositivos;\n• 📲 Experiência PWA ultrarrápida em ecrã completo.\n\nFiquem atentos a este perfil para todas as atualizações!',
  mediaUrls: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'],
  mediaType: 'image',
  likesCount: 1420,
  commentsCount: 95,
  comments: [],
  sharesCount: 48,
  createdAt: 'Recente',
  audience: 'public',
};

export const NEXORA_OFFICIAL_CONVERSATION: Conversation = {
  id: 'conv_nexora_official',
  name: 'NEXORA Oficial',
  avatar: '/icon-192.png',
  participants: [
    NEXORA_OFFICIAL_USER,
  ],
  isGroup: false,
  unreadCount: 1,
  lastMessage: {
    id: 'msg_nexora_welcome',
    conversationId: 'conv_nexora_official',
    senderId: NEXORA_OFFICIAL_USER.id,
    senderName: NEXORA_OFFICIAL_USER.name,
    senderAvatar: NEXORA_OFFICIAL_USER.avatar,
    text: 'Olá! Bem-vindo(a) à NEXORA. Este é o canal oficial de atualizações e suporte para a nossa comunidade.',
    createdAt: 'Agora',
    reactions: [],
  },
};

/**
 * Ensures the official NEXORA profile is persisted in Firestore
 */
export async function ensureNexoraOfficialProfile(db: Firestore): Promise<void> {
  try {
    const officialRef = doc(db, 'users', NEXORA_OFFICIAL_USER.id);
    const snap = await getDoc(officialRef);

    if (!snap.exists()) {
      await setDoc(officialRef, {
        nexoraId: NEXORA_OFFICIAL_USER.nexoraId,
        username: NEXORA_OFFICIAL_USER.username,
        displayName: NEXORA_OFFICIAL_USER.name,
        name: NEXORA_OFFICIAL_USER.name,
        avatarUrl: NEXORA_OFFICIAL_USER.avatar,
        avatar: NEXORA_OFFICIAL_USER.avatar,
        bio: NEXORA_OFFICIAL_USER.bio,
        coverImage: NEXORA_OFFICIAL_USER.coverImage,
        location: NEXORA_OFFICIAL_USER.location,
        website: NEXORA_OFFICIAL_USER.website,
        profession: NEXORA_OFFICIAL_USER.profession,
        isVerified: true,
        isPrivate: false,
        isSuspended: false,
        role: 'admin',
        followersCount: NEXORA_OFFICIAL_USER.followersCount,
        followingCount: NEXORA_OFFICIAL_USER.followingCount,
        postsCount: NEXORA_OFFICIAL_USER.postsCount,
        createdAt: '2026-01-01T00:00:00.000Z',
      });

      await setDoc(doc(db, 'usernames', NEXORA_OFFICIAL_USER.username), {
        uid: NEXORA_OFFICIAL_USER.id,
        nexoraId: NEXORA_OFFICIAL_USER.nexoraId,
      });

      await setDoc(doc(db, 'nexoraIds', NEXORA_OFFICIAL_USER.nexoraId), {
        uid: NEXORA_OFFICIAL_USER.id,
        username: NEXORA_OFFICIAL_USER.username,
      });
    }

    // Ensure the announcement post exists in posts collection
    const postRef = doc(db, 'posts', NEXORA_OFFICIAL_INITIAL_POST.id);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) {
      await setDoc(postRef, {
        authorId: NEXORA_OFFICIAL_USER.id,
        author: {
          id: NEXORA_OFFICIAL_USER.id,
          name: NEXORA_OFFICIAL_USER.name,
          username: NEXORA_OFFICIAL_USER.username,
          avatar: NEXORA_OFFICIAL_USER.avatar,
          nexoraId: NEXORA_OFFICIAL_USER.nexoraId,
          isVerified: true,
        },
        content: NEXORA_OFFICIAL_INITIAL_POST.content,
        mediaUrls: NEXORA_OFFICIAL_INITIAL_POST.mediaUrls,
        mediaType: NEXORA_OFFICIAL_INITIAL_POST.mediaType,
        likesCount: NEXORA_OFFICIAL_INITIAL_POST.likesCount,
        commentsCount: NEXORA_OFFICIAL_INITIAL_POST.commentsCount,
        sharesCount: NEXORA_OFFICIAL_INITIAL_POST.sharesCount,
        audience: 'public',
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Silent note: official profile sync deferred:', err);
  }
}
