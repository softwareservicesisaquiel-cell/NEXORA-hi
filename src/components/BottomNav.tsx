import React from 'react';
import { useApp, MainTab } from '../context/AppContext';
import { Home, Film, MessageSquare, Compass, Briefcase, User as UserIcon, Download } from 'lucide-react';

interface BottomNavProps {
  onOpenInstallationHub?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenInstallationHub }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    openUserProfile,
    closeUserProfile,
    selectedUserProfile,
  } = useApp();

  const isProfileActive = activeTab === 'profile' && !selectedUserProfile;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 h-16 px-2 flex items-center justify-around pb-safe">
      <button
        onClick={() => {
          closeUserProfile();
          setActiveTab('feed');
        }}
        className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 transition-colors ${
          activeTab === 'feed'
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] tracking-tight mt-0.5">Feed</span>
      </button>

      <button
        onClick={() => {
          closeUserProfile();
          setActiveTab('clips');
        }}
        className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 transition-colors ${
          activeTab === 'clips'
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Film className="w-5 h-5" />
        <span className="text-[10px] tracking-tight mt-0.5">Clips</span>
      </button>

      <button
        onClick={() => {
          closeUserProfile();
          setActiveTab('messages');
        }}
        className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 transition-colors ${
          activeTab === 'messages'
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[10px] tracking-tight mt-0.5">Chat</span>
      </button>

      <button
        onClick={() => {
          closeUserProfile();
          setActiveTab('explore');
        }}
        className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 transition-colors ${
          activeTab === 'explore'
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] tracking-tight mt-0.5">Explorar</span>
      </button>

      <button
        onClick={() => {
          closeUserProfile();
          setActiveTab('network');
        }}
        className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 transition-colors ${
          activeTab === 'network'
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Briefcase className="w-5 h-5" />
        <span className="text-[10px] tracking-tight mt-0.5">Rede</span>
      </button>

      {currentUser ? (
        <button
          onClick={() => {
            openUserProfile(currentUser);
          }}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 transition-colors ${
            isProfileActive
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className={`w-5 h-5 rounded-full object-cover ${
              isProfileActive ? 'ring-2 ring-blue-500' : ''
            }`}
          />
          <span className="text-[10px] tracking-tight mt-0.5">Perfil</span>
        </button>
      ) : (
        <button
          onClick={onOpenInstallationHub}
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 transition-colors text-emerald-600 dark:text-emerald-400 font-semibold"
          title="Instalar / Baixar Aplicativo"
        >
          <Download className="w-5 h-5 animate-bounce" />
          <span className="text-[10px] tracking-tight mt-0.5">Baixar</span>
        </button>
      )}
    </nav>
  );
};
