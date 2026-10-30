import React, { useState, useEffect } from 'react';
import { useApp, MainTab } from '../context/AppContext';
import {
  Sparkles,
  Sun,
  Moon,
  PlusSquare,
  Compass,
  Film,
  MessageSquare,
  Home,
  Briefcase,
  Download,
  Smartphone,
  X,
  Check,
  Share2,
  FileArchive,
  ExternalLink,
  Globe2,
  Sliders,
} from 'lucide-react';
import { downloadProjectZip } from '../utils/downloadProject';
import { InstallationHubModal } from './InstallationHubModal';

interface NavbarProps {
  onOpenCreatePost: () => void;
  onOpenSettings?: () => void;
  onOpenLanguageSelector?: () => void;
  onOpenInstallationHub?: () => void;
  currentLanguageCode?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreatePost,
  onOpenSettings,
  onOpenLanguageSelector,
  onOpenInstallationHub,
  currentLanguageCode = 'pt',
}) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    openUserProfile,
    closeUserProfile,
    theme,
    toggleTheme,
    setShowAuthModal,
    setAuthModalMode,
    addToast,
  } = useApp();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (onOpenInstallationHub) {
      onOpenInstallationHub();
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        addToast('NEXORA HI instalado com sucesso no teu dispositivo!', 'success');
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallModal(true);
    }
  };

  const navLinks: { id: MainTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'clips', label: 'Clips', icon: Film },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare },
    { id: 'explore', label: 'Explorar', icon: Compass },
    { id: 'network', label: 'Rede', icon: Briefcase },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          
          {/* Zone 1: Single text element Brand Wordmark */}
          <button
            onClick={() => {
              closeUserProfile();
              setActiveTab('feed');
            }}
            className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 min-h-[44px]"
          >
            <img
              src="/icon-192.png"
              alt="Nexora Hi"
              className="w-9 h-9 rounded-xl object-cover shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200"
            />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-[var(--font-display)] flex items-center gap-1.5">
              NEXORA <span className="text-blue-600 dark:text-blue-400 font-extrabold text-xs px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60">HI</span>
            </span>
          </button>

          {/* Zone 2: 4-5 single-line nav links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    closeUserProfile();
                    setActiveTab(id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[44px] ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action Zone */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* 1-Click Install App Button */}
            <button
              onClick={handleInstallApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all min-h-[40px]"
              title="Baixar / Instalar Aplicativo no Telemóvel"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Baixar App</span>
            </button>

            {/* Language Selector Trigger */}
            {onOpenLanguageSelector && (
              <button
                onClick={onOpenLanguageSelector}
                aria-label="Selecionar Idioma"
                title="Mais de 180 Idiomas Globais"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors min-h-[44px]"
              >
                <Globe2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="uppercase text-[11px] font-mono">{currentLanguageCode}</span>
              </button>
            )}

            {/* Settings Trigger */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                aria-label="Definições e Evolução Autônoma"
                title="Definições do NEXORA HI & Ciclo de Evolução (45d)"
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors min-h-[44px] min-w-[44px]"
              >
                <Sliders className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            )}

            {/* Theme switcher */}
            <button
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors min-h-[44px] min-w-[44px]"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {currentUser ? (
              <>
                {/* Post creator button */}
                <button
                  onClick={onOpenCreatePost}
                  className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all whitespace-nowrap shrink-0 min-h-[44px]"
                >
                  <PlusSquare className="w-4 h-4" />
                  <span>Publicar</span>
                </button>

                {/* User Avatar & Profile Trigger */}
                <button
                  onClick={() => {
                    openUserProfile(currentUser);
                  }}
                  className="flex items-center gap-2 p-1 rounded-full ring-2 ring-transparent hover:ring-blue-500/30 transition-all min-h-[44px] min-w-[44px]"
                  title="Meu Perfil"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors min-h-[44px]"
                >
                  Iniciar Sessão
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('register');
                    setShowAuthModal(true);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors whitespace-nowrap min-h-[44px]"
                >
                  Criar Conta
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Full Feature Installation & Download Hub Modal */}
      <InstallationHubModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </>
  );
};
