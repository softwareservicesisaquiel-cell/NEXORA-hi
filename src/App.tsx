import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { FeedView } from './components/FeedView';
import { ExploreView } from './components/ExploreView';
import { ClipsView } from './components/ClipsView';
import { MessagesView } from './components/MessagesView';
import { ProfileView } from './components/ProfileView';
import { AuthScreen } from './components/AuthScreen';
import { MenuDrawer } from './components/MenuDrawer';
import { CreatePostModal } from './components/CreatePostModal';
import { CreateStoryModal } from './components/CreateStoryModal';
import { CreateClipModal } from './components/CreateClipModal';
import { StoryViewerModal } from './components/StoryViewerModal';
import { CallModal } from './components/CallModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { ToastContainer } from './components/Toast';
import { InstallationHubModal } from './components/InstallationHubModal';
import { SettingsModal } from './components/SettingsModal';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { NotificationsModal } from './components/NotificationsModal';
import { CameraModal, CameraMode } from './components/CameraModal';
import { ManagementHub, ManagementSectionId } from './components/management/ManagementHub';
import { ShieldCheck, RefreshCw } from 'lucide-react';

const NexoraAppContent: React.FC = () => {
  const {
    activeTab,
    currentUser,
    isLoadingAuth,
    showAdminPanel,
    setShowAdminPanel,
    currentLanguage,
    setLanguage,
  } = useApp();

  // Architecture: 2 Main Independent Areas (Área Social vs Área de Gestão e Informação)
  const [currentArea, setCurrentArea] = useState<'social' | 'management'>('social');
  const [managementSection, setManagementSection] = useState<ManagementSectionId>('settings');

  // Modals & Drawers state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isCreateClipOpen, setIsCreateClipOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
  const [isInstallationHubOpen, setIsInstallationHubOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>('STORY');

  // Proteção Centralizada contra cópia de imagens, arrastamento e menu nativo
  useEffect(() => {
    // 1. Impede a abertura do menu de contexto nativo nas imagens e textos da interface
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Exceção estrita: permite o menu nativo nos campos de escrita para colar/editar
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        Boolean(target.closest('input')) ||
        Boolean(target.closest('textarea'));

      if (isInputField) {
        return;
      }

      // Impede menu nativo em fotografias de perfil, publicações, stories, reels e interface
      e.preventDefault();
    };

    // 2. Impede arrastar imagens ou vídeos para fora da aplicação
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (
        target.tagName === 'IMG' ||
        target.tagName === 'VIDEO' ||
        target.tagName === 'PICTURE' ||
        Boolean(target.closest('img')) ||
        Boolean(target.closest('.protected-image'))
      ) {
        e.preventDefault();
      }
    };

    // 3. Impede cópia não autorizada de textos comuns (nomes, menus, botões, políticas)
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Exceções permitidas: campos de entrada e balões de mensagens de conversa
      const isAllowedCopyArea =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        Boolean(target.closest('input')) ||
        Boolean(target.closest('textarea')) ||
        Boolean(target.closest('.chat-message-text')) ||
        Boolean(target.closest('.chat-message-bubble'));

      if (isAllowedCopyArea) {
        return;
      }

      // Se o utilizador tentar selecionar texto de menus, cabeçalhos, botões ou perfis, anula
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    document.addEventListener('dragstart', handleDragStart, { capture: true });
    document.addEventListener('copy', handleCopy, { capture: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('dragstart', handleDragStart, { capture: true });
      document.removeEventListener('copy', handleCopy, { capture: true });
    };
  }, []);

  const handleOpenManagement = (section: ManagementSectionId = 'settings') => {
    setManagementSection(section);
    setCurrentArea('management');
    setIsMenuOpen(false);
    setIsSettingsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToSocial = () => {
    setCurrentArea('social');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCamera = (mode: CameraMode = 'STORY') => {
    setCameraMode(mode);
    setIsCameraOpen(true);
  };

  const handleSelectLanguage = (langCode: string) => {
    setLanguage(langCode);
  };

  // 1. Initial Loading Screen while Firebase Auth initializes
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/25 animate-pulse mb-4 border border-cyan-400/30">
          <ShieldCheck className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">NEXORA</h2>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          <span>A sincronizar sessão segura com Firebase Cloud...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Screen (Strict requirement: New installations start on Auth screen)
  if (!currentUser) {
    return (
      <>
        <AuthScreen />
        <ToastContainer />
      </>
    );
  }

  // 3. Authenticated Social Network Experience & Management Hub
  return (
    <div className="w-full min-h-screen max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      
      {currentArea === 'management' ? (
        /* ========================================
           B) ÁREA DE GESTÃO E INFORMAÇÃO
           Independent management environment
           ======================================== */
        <ManagementHub
          initialSection={managementSection}
          onReturnToSocial={handleReturnToSocial}
          onOpenCreatePost={() => setIsCreatePostOpen(true)}
          onOpenCreateStory={() => setIsCreateStoryOpen(true)}
          onOpenCreateClip={() => setIsCreateClipOpen(true)}
          onOpenCamera={handleOpenCamera}
          onOpenInstallationHub={() => setIsInstallationHubOpen(true)}
          onOpenLanguageSelector={() => setIsLanguageSelectorOpen(true)}
          onOpenAdminDashboard={() => setShowAdminPanel(true)}
        />
      ) : (
        /* ========================================
           A) ÁREA SOCIAL
           Pure social network experience
           ======================================== */
        <>
          {/* Top Navbar */}
          <Navbar
            onOpenCreatePost={() => setIsCreatePostOpen(true)}
            onOpenMenu={() => setIsMenuOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenManagement={() => handleOpenManagement('settings')}
          />

          {/* Main Single-Section View: Strictly Independent Rendering */}
          <main className="flex-1 w-full max-w-full pb-20 md:pb-8">
            {activeTab === 'feed' && (
              <FeedView
                onOpenCreatePost={() => setIsCreatePostOpen(true)}
                onOpenCreateStory={() => setIsCreateStoryOpen(true)}
                onOpenCamera={handleOpenCamera}
              />
            )}
            
            {activeTab === 'explore' && <ExploreView />}
            
            {activeTab === 'clips' && (
              <ClipsView
                onOpenCreateClip={() => setIsCreateClipOpen(true)}
                onOpenCamera={handleOpenCamera}
              />
            )}
            
            {activeTab === 'messages' && <MessagesView />}
            
            {activeTab === 'profile' && (
              <ProfileView onOpenManagement={handleOpenManagement} />
            )}
          </main>

          {/* Ergonomic Mobile Bottom Navigation (Smartphones) */}
          <BottomNav onOpenCreatePost={() => setIsCreatePostOpen(true)} />
        </>
      )}

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Slide-out Menu Drawer for Settings, Language, Install, Admin, and Logout */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenSettings={() => handleOpenManagement('settings')}
        onOpenManagement={handleOpenManagement}
        onOpenLanguageSelector={() => setIsLanguageSelectorOpen(true)}
        onOpenInstallationHub={() => setIsInstallationHubOpen(true)}
        currentLanguageCode={currentLanguage}
      />

      {/* Clean Modals (Open exclusively upon user request) */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />

      <CreateStoryModal
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
      />

      <CreateClipModal
        isOpen={isCreateClipOpen}
        onClose={() => setIsCreateClipOpen(false)}
      />

      <StoryViewerModal />
      
      <CallModal />

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        initialMode={cameraMode}
      />

      <AdminDashboardModal
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />

      <InstallationHubModal
        isOpen={isInstallationHubOpen}
        onClose={() => setIsInstallationHubOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenLanguageSelector={() => setIsLanguageSelectorOpen(true)}
        onOpenInstallationHub={() => setIsInstallationHubOpen(true)}
        currentLanguageCode={currentLanguage}
      />

      <LanguageSelectorModal
        isOpen={isLanguageSelectorOpen}
        onClose={() => setIsLanguageSelectorOpen(false)}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
      />

      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <NexoraAppContent />
    </AppProvider>
  );
}

export default App;
