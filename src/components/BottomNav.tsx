import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Compass, Film, MessageSquare, User as UserIcon } from 'lucide-react';

interface BottomNavProps {
  onOpenCreatePost?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenCreatePost }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    openUserProfile,
    closeUserProfile,
    conversations,
    t,
  } = useApp();

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 h-16 px-1 flex items-center justify-around pb-safe select-none">
      {/* 1. INÍCIO */}
      <button
        onClick={() => {
          closeUserProfile();
          setActiveTab('feed');
        }}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
          activeTab === 'feed'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Home className={`w-5 h-5 transition-transform ${activeTab === 'feed' ? 'scale-110' : ''}`} />
        <span className="text-[10px] tracking-tight mt-1">{t('nav.feed')}</span>
      </button>

      {/* 2. REELS */}
      <button
        onClick={() => {
          closeUserProfile();
          setActiveTab('clips');
        }}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
          activeTab === 'clips'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Film className={`w-5 h-5 transition-transform ${activeTab === 'clips' ? 'scale-110' : ''}`} />
        <span className="text-[10px] tracking-tight mt-1">{t('nav.reels')}</span>
      </button>

      {/* 3. MENSAGENS */}
      <button
        onClick={() => {
          closeUserProfile();
          setActiveTab('messages');
        }}
        className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
          activeTab === 'messages'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <div className="relative">
          <MessageSquare className={`w-5 h-5 transition-transform ${activeTab === 'messages' ? 'scale-110' : ''}`} />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
              {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-1">{t('nav.chat')}</span>
      </button>

      {/* 4. EXPLORAR */}
      <button
        onClick={() => {
          closeUserProfile();
          setActiveTab('explore');
        }}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
          activeTab === 'explore'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Compass className={`w-5 h-5 transition-transform ${activeTab === 'explore' ? 'scale-110' : ''}`} />
        <span className="text-[10px] tracking-tight mt-1">{t('nav.explore')}</span>
      </button>

      {/* 5. PERFIL */}
      <button
        onClick={() => {
          if (currentUser) {
            openUserProfile(currentUser);
          }
          setActiveTab('profile');
        }}
        className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer ${
          activeTab === 'profile'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <div className="relative">
          {currentUser ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className={`w-6 h-6 rounded-full object-cover border-2 transition-transform ${
                activeTab === 'profile'
                  ? 'border-blue-600 scale-110 shadow-sm'
                  : 'border-transparent'
              }`}
            />
          ) : (
            <UserIcon className={`w-5 h-5 transition-transform ${activeTab === 'profile' ? 'scale-110' : ''}`} />
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-1">{t('nav.profile')}</span>
      </button>
    </nav>
  );
};
