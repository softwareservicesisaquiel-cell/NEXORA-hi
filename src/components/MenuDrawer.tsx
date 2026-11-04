import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  User as UserIcon,
  Settings,
  ShieldAlert,
  Download,
  Globe2,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  Shield,
  Sparkles,
  Sliders,
  Wrench,
} from 'lucide-react';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenManagement?: (section?: any) => void;
  onOpenLanguageSelector: () => void;
  onOpenInstallationHub: () => void;
  currentLanguageCode: string;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenManagement,
  onOpenLanguageSelector,
  onOpenInstallationHub,
  currentLanguageCode,
}) => {
  const {
    currentUser,
    openUserProfile,
    closeUserProfile,
    setActiveTab,
    theme,
    toggleTheme,
    isAdmin,
    setShowAdminPanel,
    logout,
    t,
  } = useApp();

  if (!isOpen) return null;

  const handleProfileClick = () => {
    if (currentUser) {
      openUserProfile(currentUser);
      setActiveTab('profile');
    }
    onClose();
  };

  const handleAdminClick = () => {
    setShowAdminPanel(true);
    onClose();
  };

  const handleSettingsClick = () => {
    onOpenSettings();
    onClose();
  };

  const handleLanguageClick = () => {
    onOpenLanguageSelector();
    onClose();
  };

  const handleInstallClick = () => {
    onOpenInstallationHub();
    onClose();
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 text-slate-900 dark:text-slate-100">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-lg bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              NEXORA
            </span>
            <span className="text-[11px] text-slate-500 font-medium">{t('menu.title')}</span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={t('profile.cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Mini Profile Header */}
        {currentUser && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center gap-3 text-left group"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md group-hover:scale-105 transition-transform shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {currentUser.name}
                </div>
                <div className="text-xs text-slate-500 truncate font-mono">
                  @{currentUser.username}
                </div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                  {t('menu.id')}: {currentUser.nexoraId}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>
        )}

        {/* Menu Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          
          <button
            onClick={handleProfileClick}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <span className="flex-1 text-left">{t('menu.myProfile')}</span>
          </button>

          {/* Área de Gestão e Informação */}
          {onOpenManagement && (
            <button
              onClick={() => {
                onOpenManagement('settings');
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40 transition-colors text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                <Sliders className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-bold text-xs sm:text-sm truncate">Gestão & Informação</div>
                <div className="text-[10px] text-slate-500 truncate">Configurações, Ferramentas, Políticas, Ajuda</div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400 shrink-0" />
            </button>
          )}

          <button
            onClick={handleSettingsClick}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            <span className="flex-1 text-left">{t('menu.settings')}</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleAdminClick}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold hover:bg-amber-500/10 transition-colors text-amber-600 dark:text-amber-400 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="flex-1 text-left">{t('menu.adminPanel')}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold uppercase">
                Admin
              </span>
            </button>
          )}

          <div className="my-2 border-t border-slate-200 dark:border-slate-800/80" />

          <button
            onClick={handleInstallClick}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold hover:bg-emerald-500/10 transition-colors text-emerald-600 dark:text-emerald-400 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <span className="flex-1 text-left">{t('menu.installApp')}</span>
          </button>

          <button
            onClick={handleLanguageClick}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Globe2 className="w-4 h-4" />
            </div>
            <span className="flex-1 text-left">{t('menu.language')}</span>
            <span className="text-xs uppercase font-mono text-slate-400">
              {currentLanguageCode}
            </span>
          </button>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </div>
            <span className="flex-1 text-left">
              {theme === 'dark' ? t('menu.lightMode') : t('menu.darkMode')}
            </span>
          </button>

        </div>

        {/* Drawer Footer with Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('menu.logout')}</span>
          </button>

          <div className="text-center text-[11px] text-slate-500">
            {t('menu.footerTag')}
          </div>
        </div>

      </div>
    </div>
  );
};
