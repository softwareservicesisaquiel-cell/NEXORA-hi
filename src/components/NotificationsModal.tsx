import React from 'react';
import {
  X,
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  PhoneMissed,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NotificationItem } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    t,
    setActiveTab,
    openUserProfile,
    allUsers,
  } = useApp();

  if (!isOpen) return null;

  const handleNotificationClick = (notif: NotificationItem) => {
    markNotificationAsRead(notif.id);
    if (notif.type === 'message') {
      setActiveTab('messages');
      onClose();
    } else if (notif.type === 'follow' || notif.type === 'follow_request') {
      const actorId = notif.actorId || notif.senderId;
      const foundUser = allUsers.find((u) => u.id === actorId);
      if (foundUser) {
        openUserProfile(foundUser);
        onClose();
      }
    } else {
      setActiveTab('feed');
      onClose();
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />;
      case 'follow':
      case 'follow_request':
        return <UserPlus className="w-3.5 h-3.5 text-emerald-500" />;
      case 'call':
        return <PhoneMissed className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-purple-500" />;
    }
  };

  const getMessage = (notif: NotificationItem) => {
    switch (notif.type) {
      case 'like':
        return t('notif.likedPost');
      case 'comment':
        return `${t('notif.commentedPost')}${notif.previewContent ? `: "${notif.previewContent}"` : ''}`;
      case 'follow':
      case 'follow_request':
        return t('notif.followedYou');
      case 'message':
        return t('notif.sentMessage');
      case 'call':
        return t('notif.missedCall');
      default:
        return notif.previewContent || notif.message || '';
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diffSecs < 60) return 'agora';
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m`;
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h`;
      return `${Math.floor(diffSecs / 86400)}d`;
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg h-full sm:h-auto sm:max-h-[85vh] flex flex-col bg-slate-900 border border-slate-800 sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-xl text-purple-400 border border-purple-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {t('notif.title')}
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-rose-500 text-white rounded-full">
                    {unreadNotificationsCount}
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {unreadNotificationsCount > 0 && (
              <button
                onClick={() => markAllNotificationsAsRead()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                title={t('notif.markAllRead')}
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">{t('notif.markAllRead')}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 sm:p-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-500 mb-4 border border-slate-700/50">
                <Bell className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="text-base font-semibold text-slate-200 mb-1">{t('notif.title')}</h3>
              <p className="text-sm text-slate-400 max-w-xs">{t('notif.empty')}</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`flex items-start gap-3.5 p-3 rounded-xl cursor-pointer transition-all ${
                  notif.isRead
                    ? 'hover:bg-slate-800/40 opacity-80'
                    : 'bg-purple-950/20 hover:bg-purple-950/35 border border-purple-800/30 shadow-sm'
                }`}
              >
                {/* Avatar with type badge */}
                <div className="relative shrink-0">
                  <img
                    src={
                      notif.actorAvatar ||
                      notif.senderAvatar ||
                      `https://api.dicebear.com/7.x/identicon/svg?seed=${notif.actorUsername || notif.senderUsername || 'nexora'}`
                    }
                    alt={notif.actorName || notif.senderName || 'Utilizador'}
                    className="w-11 h-11 rounded-full object-cover border border-slate-700/80"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-slate-700">
                    {getIcon(notif.type)}
                  </div>
                </div>

                {/* Text info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 leading-snug">
                    <span className="font-semibold text-white mr-1">
                      {notif.actorName || notif.senderName || notif.actorUsername || notif.senderUsername || 'Utilizador'}
                    </span>
                    <span className="text-slate-300">{getMessage(notif)}</span>
                  </p>
                  <span className="text-xs text-slate-500 mt-1 inline-block">
                    {formatTime(notif.createdAt)}
                  </span>
                </div>

                {/* Read indicator or click hint */}
                <div className="shrink-0 flex items-center self-center pl-1">
                  {!notif.isRead ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
