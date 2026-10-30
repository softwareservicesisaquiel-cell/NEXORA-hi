import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Conversation, Message } from '../types';
import {
  Search,
  Phone,
  Video,
  MoreVertical,
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
  UserX,
  BellOff,
  Archive,
} from 'lucide-react';

export const MessagesView: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    addReactionToMessage,
    startCall,
    currentUser,
    addToast,
    openUserProfile,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioSeconds, setAudioSeconds] = useState(0);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];

  const filteredConversations = conversations.filter(c => {
    if (!searchQuery.trim()) return true;
    const nameToMatch = c.isGroup ? c.name : c.participants.find(p => p.id !== currentUser?.id)?.name;
    return nameToMatch?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const otherParticipant = activeConv?.participants.find(p => p.id !== currentUser?.id);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    sendMessage(
      activeConv.id,
      inputText.trim(),
      undefined,
      undefined,
      replyingToMessage?.id
    );

    setInputText('');
    setReplyingToMessage(null);
  };

  const handleSendAudioNote = () => {
    if (!activeConv) return;
    setIsRecordingAudio(false);
    sendMessage(
      activeConv.id,
      'Mensagem de voz (0:14)',
      undefined,
      'audio'
    );
    addToast('Nota de voz enviada com áudio de alta fidelidade!', 'success');
  };

  const handleSendSampleImage = () => {
    if (!activeConv) return;
    setShowAttachMenu(false);
    sendMessage(
      activeConv.id,
      'Partilhou uma imagem de estúdio.',
      '/src/assets/images/clip_showcase_tech_1792880071682.jpg',
      'image'
    );
    addToast('Fotografia enviada na conversa!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4 h-[calc(100vh-5rem)]">
      <div className="h-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row">
        
        {/* LEFT SIDEBAR: Conversations List (1/3 on md) */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col ${
          activeConversationId && 'hidden md:flex'
        }`}>
          
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white font-[var(--font-display)]">
                Mensagens Diretas
              </h2>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Ligado ao servidor em tempo real" />
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Pesquisar conversas..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Conversations list items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
            {filteredConversations.map(conv => {
              const other = conv.participants.find(p => p.id !== currentUser?.id);
              const displayName = conv.isGroup ? conv.name : other?.name;
              const displayAvatar = conv.isGroup ? conv.avatar : other?.avatar;
              const isSelected = activeConv?.id === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-2 border-blue-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    {!conv.isGroup && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {displayName}
                      </h4>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                          {conv.lastMessage.createdAt}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <p className="truncate text-[11px]">
                        {conv.lastMessage?.text || 'Sem mensagens recentes'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
                    className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  {!activeConv.isGroup && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{activeConv.isGroup ? activeConv.name : otherParticipant?.name}</span>
                    {otherParticipant?.isVerified && (
                      <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] flex items-center justify-center font-bold">
                        ✓
                      </span>
                    )}
                  </h3>
                  <span className="text-[10px] text-emerald-500 font-medium">
                    {activeConv.isGroup ? `${activeConv.participants.length} participantes` : 'Ativo agora'}
                  </span>
                </div>
              </div>

              {/* Call Triggers & Chat Options */}
              <div className="flex items-center gap-1 sm:gap-2">
                {!activeConv.isGroup && otherParticipant && (
                  <>
                    <button
                      onClick={() => startCall(otherParticipant, false)}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Chamada de Voz HD"
                    >
                      <Phone className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => startCall(otherParticipant, true)}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Chamada de Vídeo HD"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => addToast('Notificações silenciadas para esta conversa.', 'info')}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Silenciar"
                >
                  <BellOff className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* E2E Security Notice */}
              <div className="flex items-center justify-center">
                <div className="px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800/80 text-[10px] text-slate-500 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-blue-500" />
                  <span>Mensagens protegidas por encriptação criptográfica Zero Knowledge</span>
                </div>
              </div>

              {/* Initial Conversation Messages */}
              <div className="flex items-start gap-2.5 max-w-[80%]">
                <img
                  src={otherParticipant?.avatar}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-1"
                />
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl rounded-tl-sm text-xs text-slate-800 dark:text-slate-200 shadow-sm">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 block mb-1">
                    {otherParticipant?.name}
                  </span>
                  <p className="leading-relaxed">
                    Olá Inês! Estive a testar o fluxo dos novos clips e a estabilidade das chamadas. O tempo de resposta está inferior a 150ms!
                  </p>
                  <div className="mt-1.5 flex items-center justify-end text-[10px] text-slate-400 font-mono tabular-nums">
                    14:10
                  </div>
                </div>
              </div>

              {/* User Reply Bubble */}
              <div className="flex items-end justify-end gap-2 ml-auto max-w-[80%]">
                <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm text-xs shadow-md">
                  <p className="leading-relaxed">
                    Excelente notícia! A infraestrutura distribuída em nós periféricos em Lisboa e Porto está a render a 100%.
                  </p>
                  <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-blue-100 font-mono tabular-nums">
                    <span>14:15</span>
                    <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
                  </div>
                </div>
              </div>

              {/* Dynamic Last Message if present */}
              {activeConv.lastMessage && (
                <div
                  className={`flex items-end gap-2 max-w-[80%] ${
                    activeConv.lastMessage.senderId === currentUser?.id
                      ? 'ml-auto justify-end'
                      : 'justify-start'
                  }`}
                >
                  {activeConv.lastMessage.senderId !== currentUser?.id && (
                    <img
                      src={activeConv.lastMessage.senderAvatar}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                    />
                  )}

                  <div
                    className={`p-3 rounded-2xl text-xs shadow-sm relative group ${
                      activeConv.lastMessage.senderId === currentUser?.id
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                    }`}
                  >
                    {/* Audio format bubble */}
                    {activeConv.lastMessage.mediaType === 'audio' ? (
                      <div className="flex items-center gap-3 py-1">
                        <button
                          onClick={() =>
                            setPlayingAudioId(
                              playingAudioId === activeConv.lastMessage?.id ? null : activeConv.lastMessage?.id || null
                            )
                          }
                          className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0"
                        >
                          {playingAudioId === activeConv.lastMessage.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-1 h-4">
                            {[40, 70, 90, 50, 100, 30, 80, 60, 40].map((h, i) => (
                              <div
                                key={i}
                                className="w-1 bg-white/70 rounded-full"
                                style={{ height: `${h}%` }}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-mono tabular-nums opacity-80">
                            0:14
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="leading-relaxed">{activeConv.lastMessage.text}</p>
                    )}

                    {/* Media image if present */}
                    {activeConv.lastMessage.mediaUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden max-h-48">
                        <img
                          src={activeConv.lastMessage.mediaUrl}
                          alt="Anexo"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Reactions display */}
                    {activeConv.lastMessage.reactions && activeConv.lastMessage.reactions.length > 0 && (
                      <div className="mt-1 flex gap-1">
                        {activeConv.lastMessage.reactions.map((r, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]"
                          >
                            {r.emoji}
                          </span>
                        ))}
                      </div>
                    )}

                    <div
                      className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] font-mono tabular-nums ${
                        activeConv.lastMessage.senderId === currentUser?.id
                          ? 'text-blue-100'
                          : 'text-slate-400'
                      }`}
                    >
                      <span>{activeConv.lastMessage.createdAt}</span>
                      {activeConv.lastMessage.senderId === currentUser?.id && (
                        <CheckCheck
                          className={`w-3.5 h-3.5 ${
                            activeConv.lastMessage.status === 'read' ? 'text-white' : 'text-blue-200'
                          }`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Replying context bar */}
            {replyingToMessage && (
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Reply className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    A responder a {replyingToMessage.senderName}:
                  </span>
                  <span className="truncate text-slate-500">{replyingToMessage.text}</span>
                </div>
                <button onClick={() => setReplyingToMessage(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Composer Bar */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80 relative">
              
              {/* Attachment options popup */}
              {showAttachMenu && (
                <div className="absolute bottom-full left-4 mb-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-20 flex flex-col gap-1 text-xs">
                  <button
                    onClick={handleSendSampleImage}
                    className="px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
                  >
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                    <span>Enviar Foto / Captura</span>
                  </button>
                </div>
              )}

              {/* Live recording UI or standard input */}
              {isRecordingAudio ? (
                <div className="flex items-center justify-between px-3 py-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-600 dark:text-rose-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-semibold">A gravar áudio HD... (0:14)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRecordingAudio(false)}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSendAudioNote}
                      className="px-3 py-1 bg-rose-600 text-white rounded-xl text-xs font-semibold"
                    >
                      Enviar Áudio
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className="p-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Anexar ficheiro ou imagem"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Mensagem encriptada..."
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={() => setIsRecordingAudio(true)}
                    className="p-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Gravar nota de voz"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 disabled:opacity-40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shadow-md shadow-blue-500/20"
                    title="Enviar mensagem"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}

            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <p className="text-sm">Seleciona uma conversa para começar.</p>
          </div>
        )}

      </div>
    </div>
  );
};
