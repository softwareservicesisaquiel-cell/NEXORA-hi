import React from 'react';
import { useApp, MainTab } from '../context/AppContext';
import {
  Home,
  Compass,
  Film,
  MessageSquare,
  PlusSquare,
  Menu,
  Bell,
  Sliders,
} from 'lucide-react';
import { TranslationKey } from '../i18n/translations';
import { OptimizedAvatar } from './OptimizedAvatar';

interface NavbarProps {
  onOpenCreatePost: () => void;
  onOpenMenu: () => void;
  onOpenNotifications?: () => void;
  onOpenManagement?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreatePost,
  onOpenMenu,
  onOpenNotifications,
  onOpenManagement,
}) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    openUserProfile,
    closeUserProfile,
    conversations,
    unreadNotificationsCount,
    t,
  } = useApp();

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const navLinks: { id: MainTab; labelKey: TranslationKey; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'feed', labelKey: 'nav.feed', icon: Home },
    { id: 'explore', labelKey: 'nav.explore', icon: Compass },
    { id: 'clips', labelKey: 'nav.reels', icon: Film },
    { id: 'messages', labelKey: 'nav.chat', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand Wordmark & Icon */}
        <button
          onClick={() => {
            closeUserProfile();
            setActiveTab('feed');
          }}
          title={t('navbar.brandTitle')}
          className="flex items-center gap-2.5 text-left group shrink-0 min-h-[44px] cursor-pointer"
        >
          <img
            src="/icon-192.png"
            alt={t('navbar.brandTitle')}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200"
          />
          <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent font-[var(--font-display)]">
            NEXORA
          </span>
        </button>

        {/* Central Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ id, labelKey, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  closeUserProfile();
                  setActiveTab(id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t(labelKey)}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Notifications, Messages, Publish, Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title={t('nav.notifications')}
            aria-label={t('nav.notifications')}
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[17px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-950 animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Direct Messages Shortcut */}
          <button
            onClick={() => {
              closeUserProfile();
              setActiveTab('messages');
            }}
            className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title={t('nav.chat')}
            aria-label={t('nav.chat')}
          >
            <MessageSquare className="w-5 h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[17px] h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Create Post Button */}
          <button
            onClick={onOpenCreatePost}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/25 transition-all cursor-pointer min-h-[40px]"
            title={t('nav.publish')}
          >
            <PlusSquare className="w-4 h-4" />
            <span className="hidden sm:inline">{t('nav.publish')}</span>
          </button>

          {/* Management Hub Button */}
          {onOpenManagement && (
            <button
              onClick={onOpenManagement}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer min-h-[40px]"
              title="Área de Gestão e Informação (Configurações, Ferramentas, Políticas, Ajuda)"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              <span>Gestão & Info</span>
            </button>
          )}

          {/* User Profile Shortcut (Desktop) */}
          {currentUser && (
            <button
              onClick={() => {
                openUserProfile(currentUser);
                setActiveTab('profile');
              }}
              className={`hidden md:flex items-center gap-2 p-1 rounded-full border-2 transition-all cursor-pointer min-h-[40px] min-w-[40px] ${
                activeTab === 'profile'
                  ? 'border-blue-600 shadow-sm'
                  : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              title={t('navbar.userProfile')}
            >
              <OptimizedAvatar
                src={currentUser.avatar}
                alt={currentUser.name}
                size="sm"
              />
            </button>
          )}

          {/* Menu Drawer Trigger */}
          <button
            onClick={onOpenMenu}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
            aria-label={t('navbar.openMenu')}
            title={t('navbar.openMenu')}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
