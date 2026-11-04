import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Copy,
  Check,
  Send,
  Share2,
  ExternalLink,
  MessageCircle,
  Repeat,
  Sparkles,
  Search,
} from 'lucide-react';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  text?: string;
  url: string;
  itemType: 'post' | 'clip' | 'profile' | 'story';
  itemId?: string;
  authorName?: string;
  authorAvatar?: string;
  thumbnail?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title = 'Partilhar no NEXORA',
  text = '',
  url,
  itemType,
  itemId,
  authorName,
  authorAvatar,
  thumbnail,
}) => {
  const { conversations, currentUser, sendMessage, addToast, createStory, t } = useApp();
  const [copied, setCopied] = useState(false);
  const [searchContact, setSearchContact] = useState('');
  const [sentConversations, setSentConversations] = useState<Record<string, boolean>>({});
  const [isReposterStory, setIsReposterStory] = useState(false);

  if (!isOpen) return null;

  const fullShareUrl = url.startsWith('http')
    ? url
    : `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullShareUrl);
      setCopied(true);
      addToast('Ligação copiada para a área de transferência!', 'success');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = fullShareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      addToast('Ligação copiada!', 'success');
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'NEXORA',
          text: text ? `${text}\n` : 'Confira isto no NEXORA:',
          url: fullShareUrl,
        });
        onClose();
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          addToast('Não foi possível abrir o menu nativo de partilha.', 'info');
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSendToConversation = async (conversationId: string, recipientName: string) => {
    try {
      const shareMessage = `Partilhou um ${
        itemType === 'post' ? 'post' : itemType === 'clip' ? 'reel' : itemType === 'story' ? 'story' : 'perfil'
      }: ${fullShareUrl}${text ? `\n"${text}"` : ''}`;

      await sendMessage(conversationId, shareMessage);
      setSentConversations((prev) => ({ ...prev, [conversationId]: true }));
      addToast(`Enviado com sucesso para ${recipientName}!`, 'success');
    } catch {
      addToast('Erro ao enviar mensagem direta.', 'error');
    }
  };

  const handleShareToOwnStory = async () => {
    if (!currentUser) return;
    try {
      setIsReposterStory(true);
      await createStory({
        mediaType: thumbnail ? 'image' : 'text',
        mediaUrl: thumbnail || undefined,
        textContent: !thumbnail ? `${title}\n\n${text || fullShareUrl}` : undefined,
        textBackgroundGradient: 'from-blue-600 via-indigo-600 to-purple-700',
        caption: `Partilhado de @${authorName || 'Nexora'}: ${text || ''}`,
      });
      addToast('Partilhado no teu Story NEXORA!', 'success');
      onClose();
    } catch {
      addToast('Erro ao partilhar no Story.', 'error');
    } finally {
      setIsReposterStory(false);
    }
  };

  // External share links
  const shareMessageEncoded = encodeURIComponent(`${text ? `${text} - ` : ''}${fullShareUrl}`);
  const externalPlatforms = [
    {
      name: 'WhatsApp',
      icon: '💬',
      bgColor: 'bg-emerald-600 hover:bg-emerald-500',
      href: `https://api.whatsapp.com/send?text=${shareMessageEncoded}`,
    },
    {
      name: 'Telegram',
      icon: '✈️',
      bgColor: 'bg-sky-500 hover:bg-sky-400',
      href: `https://t.me/share/url?url=${encodeURIComponent(fullShareUrl)}&text=${encodeURIComponent(text || title)}`,
    },
    {
      name: 'X (Twitter)',
      icon: '𝕏',
      bgColor: 'bg-neutral-900 hover:bg-neutral-800 text-white',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullShareUrl)}&text=${encodeURIComponent(text || title)}`,
    },
    {
      name: 'Email',
      icon: '✉️',
      bgColor: 'bg-slate-700 hover:bg-slate-600',
      href: `mailto:?subject=${encodeURIComponent(title || 'NEXORA')}&body=${shareMessageEncoded}`,
    },
  ];

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (!searchContact) return true;
    const term = searchContact.toLowerCase();
    const other = c.participants.find((p) => p.id !== currentUser?.id);
    const name = c.isGroup ? c.name : other?.name || other?.username || '';
    return name?.toLowerCase().includes(term);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-[var(--font-display)] text-slate-900 dark:text-white">
                Partilhar
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {itemType === 'post'
                  ? 'Publicação'
                  : itemType === 'clip'
                  ? 'Reel / Clipe'
                  : itemType === 'profile'
                  ? 'Perfil'
                  : 'Story'}{' '}
                · NEXORA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Preview Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 mb-5">
          {thumbnail ? (
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
              <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : authorAvatar ? (
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
              <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 font-bold">
              NX
            </div>
          )}
          <div className="min-w-0 flex-1">
            {authorName && (
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {authorName}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {text || title || fullShareUrl}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons: Copy Link & Add to Story */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            onClick={handleCopyLink}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border ${
              copied
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado! ✓' : 'Copiar Ligação'}</span>
          </button>

          {itemType !== 'story' ? (
            <button
              onClick={handleShareToOwnStory}
              disabled={isReposterStory}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isReposterStory ? 'A adicionar...' : 'No meu Story'}</span>
            </button>
          ) : (
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-500/20"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Partilhar no Aparelho</span>
            </button>
          )}
        </div>

        {/* Send via Direct Message in NEXORA */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>Enviar por Mensagem Direta</span>
            </span>
            <span className="text-[11px] text-slate-400">NEXORA Chat</span>
          </div>

          {conversations.length > 3 && (
            <div className="relative mb-2.5">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar conversa..."
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          )}

          {filteredConversations.length > 0 ? (
            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 -mr-1">
              {filteredConversations.map((conv) => {
                const other = conv.participants.find((p) => p.id !== currentUser?.id);
                const title = conv.isGroup ? conv.name : other?.name || other?.username || 'Utilizador';
                const avatar = conv.avatar || other?.avatar;
                const isSent = !!sentConversations[conv.id];

                return (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={title}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {conv.isGroup ? 'Grupo NEXORA' : `@${other?.username || 'utilizador'}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendToConversation(conv.id, title || 'contacto')}
                      disabled={isSent}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-w-[70px] flex items-center justify-center gap-1 ${
                        isSent
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                      }`}
                    >
                      {isSent ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Enviado</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>Enviar</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-3 text-center">
              Nenhuma conversa encontrada. Inicie uma conversa no separador Mensagens!
            </p>
          )}
        </div>

        {/* External Social Share Buttons */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
            Partilhar noutras aplicações
          </span>
          <div className="grid grid-cols-4 gap-2">
            {externalPlatforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center p-3 rounded-2xl text-white ${platform.bgColor} transition-transform hover:scale-105 shadow-sm text-center`}
              >
                <span className="text-lg leading-none mb-1">{platform.icon}</span>
                <span className="text-[10px] font-medium truncate w-full">{platform.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
