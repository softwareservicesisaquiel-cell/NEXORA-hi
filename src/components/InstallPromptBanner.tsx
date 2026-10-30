import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InstallationHubModal } from './InstallationHubModal';

interface InstallPromptBannerProps {
  onOpenHub?: () => void;
}

export const InstallPromptBanner: React.FC<InstallPromptBannerProps> = ({ onOpenHub }) => {
  const { addToast } = useApp();
  const [isStandalone, setIsStandalone] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showHubModal, setShowHubModal] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode (already installed on phone)
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(standaloneMode);

    // If already installed, don't show prompt
    if (standaloneMode) return;

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('nexora_install_prompt_dismissed');
    if (!isDismissed) {
      // Delay slightly for smooth non-blocking entry
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone && !sessionStorage.getItem('nexora_install_prompt_dismissed')) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, [isStandalone]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('nexora_install_prompt_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        addToast('NEXORA HI instalado com sucesso no teu dispositivo!', 'success');
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      if (onOpenHub) {
        onOpenHub();
      } else {
        setShowHubModal(true);
      }
    }
  };

  // If running as standalone app, render nothing
  if (isStandalone || !isVisible) {
    return showHubModal ? (
      <InstallationHubModal isOpen={showHubModal} onClose={() => setShowHubModal(false)} />
    ) : null;
  }

  return (
    <>
      {/* Floating Bottom Toast / Notification Bar */}
      <aside
        aria-label="Sugestão de instalação da aplicação"
        className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <div className="relative p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-blue-500/30 dark:border-blue-500/25 shadow-2xl shadow-blue-500/10 text-slate-900 dark:text-slate-100">
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            aria-label="Fechar sugestão de instalação"
            className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            {/* Nexora Official App Icon */}
            <img
              src="/icon-192.png"
              alt="Nexora Hi Icon"
              className="w-11 h-11 rounded-xl object-cover shadow-md shadow-blue-500/20 shrink-0 border border-blue-500/20"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Instalação Rápida
                </span>
              </div>
              <h4 className="font-bold text-xs sm:text-sm leading-tight text-slate-900 dark:text-white">
                Instalar o NEXORA HI no Telemóvel
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Adiciona ao teu ecrã principal para teres o aplicativo completo, tela cheia sem barras e com suporte offline.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all min-h-[40px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar / Baixar App</span>
            </button>

            <button
              onClick={handleDismiss}
              className="py-2 px-3 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[40px]"
            >
              Mais tarde
            </button>
          </div>

        </div>
      </aside>

      {/* Installation Hub Modal */}
      {showHubModal && (
        <InstallationHubModal
          isOpen={showHubModal}
          onClose={() => setShowHubModal(false)}
        />
      )}
    </>
  );
};
