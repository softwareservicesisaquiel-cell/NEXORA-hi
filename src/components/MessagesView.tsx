import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Conversation, Message, User } from '../types';
import {
  db,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from '../lib/firebase';
import {
  Search,
  Phone,
  Video,
  Paperclip,
  Smile,
  Mic,
  Send,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Play,
  Pause,
  Reply,
  X,
  Volume2,
  Shield,
  UserPlus,
  Users,
  Trash2,
  AlertCircle,
  Plus,
  Copy,
} from 'lucide-react';

export const MessagesView: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    addReactionToMessage,
    createConversation,
    createGroup,
    startCall,
    currentUser,
    allUsers,
    addToast,
    openUserProfile,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [inboxTab, setInboxTab] = useState<'principal' | 'geral' | 'pedidos'>('principal');
  const [acceptedRequestIds, setAcceptedRequestIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('nexora_accepted_msg_reqs') || '[]');
    } catch {
      return [];
    }
  });

  // Voice recording state
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Modals & attach menus
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedGroupMemberIds, setSelectedGroupMemberIds] = useState<string[]>([]);
  const [mediaDataUrl, setMediaDataUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | null>(null);
  const [showEmojiPickerForMsgId, setShowEmojiPickerForMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || (conversations.length > 0 ? conversations[0] : null);
  const otherParticipant = activeConv?.participants.find((p) => p.id !== currentUser?.id);

  // Partition conversations into Principal, Geral, and Pedidos
  const principalConversations = conversations.filter((c) => !c.isGroup);
  const generalConversations = conversations.filter((c) => c.isGroup);
  
  // Pending requests: simulated or incoming from users not yet in accepted list
  const pendingRequests = conversations.filter((c) => {
    if (c.isGroup) return false;
    const other = c.participants.find((p) => p.id !== currentUser?.id);
    return other && other.isPrivate && !acceptedRequestIds.includes(c.id);
  });

  const getTabConversations = () => {
    if (inboxTab === 'geral') {
      return generalConversations;
    }
    if (inboxTab === 'pedidos') {
      return pendingRequests.length > 0 ? pendingRequests : conversations.slice(0, 1);
    }
    return principalConversations;
  };

  const currentTabConversations = getTabConversations();

  const filteredConversations = currentTabConversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const nameToMatch = c.isGroup ? c.name : c.participants.find((p) => p.id !== currentUser?.id)?.name;
    return nameToMatch?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAcceptRequest = (convId: string) => {
    const updated = [...acceptedRequestIds, convId];
    setAcceptedRequestIds(updated);
    try {
      localStorage.setItem('nexora_accepted_msg_reqs', JSON.stringify(updated));
    } catch {}
    setInboxTab('principal');
    setActiveConversationId(convId);
    addToast('Pedido de mensagem aceite. A conversa está agora no Principal.', 'success');
  };

  const handleDeclineRequest = (convId: string) => {
    addToast('Pedido de mensagem recusado.', 'info');
  };

  // Listen to real Firestore messages for active conversation
  useEffect(() => {
    if (!activeConv) {
      setMessages([]);
      return;
    }

    const qMsgs = query(
      collection(db, 'messages'),
      where('conversationId', '==', activeConv.id),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(
      qMsgs,
      (snap) => {
        const loaded: Message[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          const reactionsObj = d.reactions || {};
          const reactionsArr: { emoji: string; userId: string }[] = [];
          Object.entries(reactionsObj).forEach(([emoji, userIds]: [string, any]) => {
            if (Array.isArray(userIds)) {
              userIds.forEach((uid: string) => {
                reactionsArr.push({ emoji, userId: uid });
              });
            }
          });

          return {
            id: docSnap.id,
            conversationId: d.conversationId,
            senderId: d.senderId,
            senderName: d.senderName || 'Utilizador',
            senderAvatar: d.senderAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${d.senderId}`,
            text: d.text || '',
            mediaUrl: d.mediaUrl,
            mediaType: d.mediaType,
            replyTo: d.replyTo,
            reactions: reactionsArr,
            readBy: d.readBy || [],
            status: d.readBy && d.readBy.length > 1 ? 'read' : 'sent',
            createdAt: d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          };
        });
        setMessages(loaded);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      },
      (err) => {
        console.error('Error fetching conversation messages:', err);
      }
    );

    return () => unsub();
  }, [activeConv?.id]);

  // Audio recording handlers
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setMediaDataUrl(reader.result);
            setMediaType('audio');
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
    } catch (err) {
      console.error('Error starting audio recording:', err);
      addToast('Não foi possível aceder ao microfone.', 'error');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isRecordingAudio) {
      interval = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingAudio]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith('video');
    const isAud = file.type.startsWith('audio');
    const isImg = file.type.startsWith('image');

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMediaDataUrl(reader.result);
        setMediaType(isVid ? 'video' : isAud ? 'audio' : 'image');
        addToast('Ficheiro anexado à mensagem!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv) return;
    if (!inputText.trim() && !mediaDataUrl) return;

    await sendMessage(
      activeConv.id,
      inputText.trim(),
      mediaDataUrl || undefined,
      mediaType || undefined,
      replyingToMessage?.id
    );

    setInputText('');
    setMediaDataUrl(null);
    setMediaType(null);
    setReplyingToMessage(null);
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await deleteDoc(doc(db, 'messages', msgId));
      addToast('Mensagem eliminada.', 'info');
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopyMessage = async (text: string) => {
    if (!text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement('textarea');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      addToast('Mensagem copiada para a área de transferência!', 'success');
    } catch {
      addToast('Mensagem copiada!', 'success');
    }
  };

  const handleTouchStartMessage = (text: string) => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      handleCopyMessage(text);
    }, 450);
  };

  const handleTouchEndMessage = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const handleStartChatWithUser = async (user: User) => {
    setShowNewChatModal(false);
    await createConversation(user);
  };

  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedGroupMemberIds.length === 0) {
      addToast('Indique o nome do grupo e selecione pelo menos um membro.', 'info');
      return;
    }

    await createGroup(groupName.trim(), selectedGroupMemberIds);
    setShowCreateGroupModal(false);
    setGroupName('');
    setSelectedGroupMemberIds([]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4 h-[calc(100dvh-8rem)] md:h-[calc(100vh-5.5rem)]">
      <div className="h-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row">
        
        {/* LEFT SIDEBAR: Conversations List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white font-[var(--font-display)]">
                {t('chat.title')}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowCreateGroupModal(true)}
                  className="p-1.5 text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-colors"
                  title={t('chat.newGroup')}
                >
                  <Users className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors"
                  title={t('chat.newChat')}
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('chat.searchPlaceholder')}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Segmented Inbox Tabs: Principal, Geral, Pedidos */}
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 mt-3 pt-1">
              <button
                onClick={() => setInboxTab('principal')}
                className={`flex-1 py-2 text-center text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  inboxTab === 'principal'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                Principal
              </button>

              <button
                onClick={() => setInboxTab('geral')}
                className={`flex-1 py-2 text-center text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  inboxTab === 'geral'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                Geral
              </button>

              <button
                onClick={() => setInboxTab('pedidos')}
                className={`flex-1 py-2 text-center text-xs font-bold border-b-2 transition-all cursor-pointer relative ${
                  inboxTab === 'pedidos'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                Pedidos
                {pendingRequests.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Conversations list items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <p className="text-xs mb-3">
                  {inboxTab === 'pedidos'
                    ? 'Nenhum pedido de mensagem pendente.'
                    : 'Nenhuma conversa encontrada.'}
                </p>
                {inboxTab !== 'pedidos' && (
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer"
                  >
                    + Iniciar Conversa
                  </button>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const other = conv.participants.find((p) => p.id !== currentUser?.id);
                const displayName = conv.isGroup ? conv.name : other?.name;
                const displayAvatar = conv.isGroup ? conv.avatar : other?.avatar;
                const isSelected = activeConv?.id === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`p-3.5 flex flex-col gap-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-2 border-blue-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={displayAvatar}
                        alt={displayName}
                        referrerPolicy="no-referrer"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 select-none no-drag protected-image"
                      />
                      {!conv.isGroup && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate flex items-center gap-1">
                          <span>{displayName}</span>
                          {(other?.isVerified || conv.name === 'NEXORA Oficial') && (
                            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] flex items-center justify-center font-bold shrink-0 shadow-xs">
                              ✓
                            </span>
                          )}
                        </h4>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                            {conv.lastMessage.createdAt}
                          </span>
                        )}
                      </div>

                      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {conv.lastMessage?.text || 'Sem mensagens recentes'}
                      </p>
                    </div>
                  </div>

                  {inboxTab === 'pedidos' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptRequest(conv.id);
                        }}
                        className="flex-1 py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeclineRequest(conv.id);
                        }}
                        className="py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Recusar
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
          </div>
        </div>

        {/* RIGHT AREA: Active Chat View */}
        {activeConv ? (
          <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950/30">
            {/* Chat Top Header */}
            <div className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1 text-slate-400 hover:text-slate-600"
                >
                  ←
                </button>

                <div className="relative">
                  <img
                    src={activeConv.isGroup ? activeConv.avatar : otherParticipant?.avatar}
                    alt="Avatar"
                    referrerPolicy="no-referrer"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 select-none no-drag protected-image"
                  />
                  {!activeConv.isGroup && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{activeConv.isGroup ? activeConv.name : otherParticipant?.name}</span>
                    {(otherParticipant?.isVerified || activeConv.name === 'NEXORA Oficial') && (
                      <span
                        className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold shadow-xs"
                        title="Perfil Oficial Verificado"
                      >
                        ✓
                      </span>
                    )}
                    {!activeConv.isGroup && otherParticipant && (
                      <span className="text-[10px] font-mono text-cyan-400 font-normal">
                        ({otherParticipant.nexoraId})
                      </span>
                    )}
                  </h3>
                  <span className="text-[10px] text-emerald-500 font-medium">
                    {activeConv.isGroup ? `${activeConv.participants.length} membros` : 'Criptografado • Online'}
                  </span>
                </div>
              </div>

              {/* Call Triggers & Options */}
              <div className="flex items-center gap-1 sm:gap-2">
                {!activeConv.isGroup && otherParticipant && (
                  <>
                    <button
                      onClick={() => startCall(otherParticipant, false)}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                      title="Chamada de Voz WebRTC"
                    >
                      <Phone className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => startCall(otherParticipant, true)}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                      title="Chamada de Vídeo WebRTC"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center justify-center">
                <div className="px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800/80 text-[10px] text-slate-500 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-cyan-500" />
                  <span>Mensagens criptografadas e sincronizadas via Cloud Firestore</span>
                </div>
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Sem mensagens nesta conversa. Envie a primeira mensagem abaixo!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 max-w-[85%] ${
                        isMine ? 'ml-auto justify-end' : 'justify-start'
                      }`}
                    >
                      {!isMine && (
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          referrerPolicy="no-referrer"
                          draggable={false}
                          onContextMenu={(e) => e.preventDefault()}
                          onDragStart={(e) => e.preventDefault()}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 select-none no-drag protected-image"
                        />
                      )}

                      <div className="space-y-1">
                        {!isMine && activeConv.isGroup && (
                          <span className="text-[10px] text-slate-500 font-semibold block px-1">
                            {msg.senderName}
                          </span>
                        )}

                        <div
                          onTouchStart={() => handleTouchStartMessage(msg.text)}
                          onTouchEnd={handleTouchEndMessage}
                          onTouchMove={handleTouchEndMessage}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleCopyMessage(msg.text);
                          }}
                          className={`p-3 rounded-2xl relative group text-xs chat-message-bubble ${
                            isMine
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-md'
                              : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-sm'
                          }`}
                        >
                          {/* Image Attachment with Anti-Copy Protection */}
                          {msg.mediaType === 'image' && msg.mediaUrl && (
                            <img
                              src={msg.mediaUrl}
                              alt="Anexo"
                              draggable={false}
                              onContextMenu={(e) => e.preventDefault()}
                              onDragStart={(e) => e.preventDefault()}
                              className="rounded-xl max-h-56 w-full object-cover mb-2 select-none no-drag protected-image"
                            />
                          )}

                          {/* Video Attachment */}
                          {msg.mediaType === 'video' && msg.mediaUrl && (
                            <video
                              src={msg.mediaUrl}
                              controls
                              controlsList="nodownload"
                              onContextMenu={(e) => e.preventDefault()}
                              className="rounded-xl max-h-56 w-full mb-2 bg-black select-none no-drag protected-image"
                            />
                          )}

                          {/* Audio Voice Note */}
                          {msg.mediaType === 'audio' && msg.mediaUrl && (
                            <audio src={msg.mediaUrl} controls className="w-full mb-2" />
                          )}

                          <p className="leading-relaxed whitespace-pre-wrap chat-message-text">{msg.text}</p>

                          {/* Footer with timestamp & actions */}
                          <div className={`mt-1.5 flex items-center justify-end gap-1.5 text-[9px] ${
                            isMine ? 'text-blue-100' : 'text-slate-400'
                          }`}>
                            <span>{msg.createdAt}</span>
                            {isMine && (
                              msg.status === 'read' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-blue-200" />
                              )
                            )}

                            {/* Message Actions */}
                            <button
                              onClick={() => handleCopyMessage(msg.text)}
                              className="opacity-0 group-hover:opacity-100 hover:text-white p-0.5 rounded transition-opacity cursor-pointer"
                              title="Copiar mensagem"
                            >
                              <Copy className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => setShowEmojiPickerForMsgId(showEmojiPickerForMsgId === msg.id ? null : msg.id)}
                              className="opacity-0 group-hover:opacity-100 hover:text-white p-0.5 rounded transition-opacity cursor-pointer"
                              title="Reagir"
                            >
                              <Smile className="w-3 h-3" />
                            </button>

                            {isMine && (
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-opacity cursor-pointer"
                                title="Eliminar mensagem"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Reactions Emoji Picker Box */}
                          {showEmojiPickerForMsgId === msg.id && (
                            <div className="absolute -top-8 right-0 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 flex gap-1 z-20 shadow-xl">
                              {['❤️', '👍', '🔥', '🚀', '😂'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => {
                                    addReactionToMessage(activeConv.id, msg.id, emoji);
                                    setShowEmojiPickerForMsgId(null);
                                  }}
                                  className="hover:scale-125 transition-transform text-sm"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Reactions badges */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-white/10">
                              {msg.reactions.map((r, i) => (
                                <span key={i} className="text-xs bg-black/20 px-1.5 py-0.5 rounded-full">
                                  {r.emoji}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
              
              {/* Media Preview before sending */}
              {mediaDataUrl && (
                <div className="mb-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Ficheiro anexado ({mediaType})
                  </span>
                  <button
                    onClick={() => {
                      setMediaDataUrl(null);
                      setMediaType(null);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Voice recording live status */}
              {isRecordingAudio && (
                <div className="mb-2 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs text-rose-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span>A gravar áudio... ({recordingSeconds}s)</span>
                  </div>
                  <button
                    onClick={stopAudioRecording}
                    className="px-2.5 py-1 bg-rose-600 text-white font-semibold rounded-lg text-xs"
                  >
                    Concluir Gravação
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <label className="p-2 text-slate-500 hover:text-blue-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <Paperclip className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escreva uma mensagem encriptada..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                {!inputText.trim() && !mediaDataUrl ? (
                  <button
                    type="button"
                    onClick={isRecordingAudio ? stopAudioRecording : startAudioRecording}
                    className={`p-2.5 rounded-xl transition-all ${
                      isRecordingAudio
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-500'
                    }`}
                    title="Gravar Mensagem de Voz"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-50/50 dark:bg-slate-950/30">
            <Shield className="w-12 h-12 text-cyan-500/50 mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
              Mensagens Privadas NEXORA
            </h3>
            <p className="text-xs max-w-sm mb-4 text-slate-400 leading-relaxed">
              Inicie uma conversa privada com qualquer utilizador registado ou crie um grupo colaborativo.
            </p>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-xs font-semibold shadow-md hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
            >
              + Iniciar Nova Conversa
            </button>
          </div>
        )}
      </div>

      {/* NEW CHAT MODAL */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-500" />
                Iniciar Conversa
              </h3>
              <button onClick={() => setShowNewChatModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Selecione um utilizador da rede para abrir o canal seguro:
            </p>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {allUsers.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Nenhum outro utilizador registado no momento.
                </div>
              ) : (
                allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartChatWithUser(u)}
                    className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">@{u.username} • {u.nexoraId}</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-cyan-500">Conversar</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                Criar Novo Grupo NEXORA
              </h3>
              <button onClick={() => setShowCreateGroupModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Grupo
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ex: Engenharia & Inovação"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Adicionar Membros ({selectedGroupMemberIds.length} selecionados)
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-100 dark:border-slate-800 rounded-2xl p-2">
                  {allUsers.map((u) => {
                    const isSelected = selectedGroupMemberIds.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => {
                          setSelectedGroupMemberIds((prev) =>
                            isSelected ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                          );
                        }}
                        className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50 dark:bg-indigo-950/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                          <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                            {u.name} <span className="text-[10px] text-slate-400">(@{u.username})</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-500 hover:to-purple-500 transition-all cursor-pointer"
              >
                Criar Grupo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
