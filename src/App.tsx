import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { FeedView } from './components/FeedView';
import { ExploreView } from './components/ExploreView';
import { ClipsView } from './components/ClipsView';
import { MessagesView } from './components/MessagesView';
import { NetworkView } from './components/NetworkView';
import { ProfileView } from './components/ProfileView';
import { WelcomeLanding } from './components/WelcomeLanding';
import { AuthModal } from './components/AuthModal';
import { CreatePostModal } from './components/CreatePostModal';
import { CreateStoryModal } from './components/CreateStoryModal';
import { CreateClipModal } from './components/CreateClipModal';
import { StoryViewerModal } from './components/StoryViewerModal';
import { CallModal } from './components/CallModal';
import { ToastContainer } from './components/Toast';
import { InstallPromptBanner } from './components/InstallPromptBanner';
import { InstallationHubModal } from './components/InstallationHubModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SettingsModal } from './components/SettingsModal';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';

const NexoraAppContent: React.FC = () => {
  const { activeTab, currentUser } = useApp();

  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(() => {
    return localStorage.getItem('nexora_welcome_seen') === 'true';
  });

  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isCreateClipOpen, setIsCreateClipOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
  const [isInstallationHubOpen, setIsInstallationHubOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('nexora_lang') || 'pt';
  });

  const handleDismissWelcome = () => {
    setHasSeenWelcome(true);
    localStorage.setItem('nexora_welcome_seen', 'true');
  };

  const handleSelectLanguage = (langCode: string) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('nexora_lang', langCode);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-blue-500 selection:text-white">
      
      {/* Top Bar Contract (3 zones) */}
      <Navbar
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLanguageSelector={() => setIsLanguageSelectorOpen(true)}
        onOpenInstallationHub={() => setIsInstallationHubOpen(true)}
        currentLanguageCode={currentLanguage}
      />

      {/* Main Content View Container */}
      <main className="flex-1 pb-20 md:pb-8">
        {!hasSeenWelcome && !currentUser ? (
          <WelcomeLanding onDismiss={handleDismissWelcome} />
        ) : (
          <>
            {activeTab === 'feed' && (
              <FeedView
                onOpenCreatePost={() => setIsCreatePostOpen(true)}
                onOpenCreateStory={() => setIsCreateStoryOpen(true)}
              />
            )}
            {activeTab === 'explore' && <ExploreView />}
            {activeTab === 'clips' && (
              <ClipsView onOpenCreateClip={() => setIsCreateClipOpen(true)} />
            )}
            {activeTab === 'messages' && <MessagesView />}
            {activeTab === 'network' && <NetworkView />}
            {activeTab === 'profile' && <ProfileView />}
          </>
        )}
      </main>

      {/* Mobile Ergonomic Bottom Navigation Bar */}
      <BottomNav onOpenInstallationHub={() => setIsInstallationHubOpen(true)} />

      {/* Modals & Overlays */}
      <AuthModal />
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
      <InstallPromptBanner onOpenHub={() => setIsInstallationHubOpen(true)} />
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
      <OfflineIndicator />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <NexoraAppContent />
    </AppProvider>
  );
}
