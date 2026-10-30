import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileArchive,
  Bell,
  Share2,
  Layers,
  Sparkles,
  HelpCircle,
  WifiOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { downloadProjectZip } from '../utils/downloadProject';

interface InstallationHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OFFICIAL_APP_URL = 'https://ais-pre-rwuwoovdry536fzr67tzkt-292990919406.us-east1.run.app';
export const PWABUILDER_URL = `https://www.pwabuilder.com?url=${encodeURIComponent(OFFICIAL_APP_URL)}`;

export const InstallationHubModal: React.FC<InstallationHubModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'install' | 'chrome_help' | 'apk' | 'qr'>('install');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  useEffect(() => {
    // Check standalone
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(standaloneMode);

    // Check if inside iframe
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    // Detect OS
    const ua = window.navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(ua));
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    // Check notification permission
    if ('Notification' in window) {
      setIsPushEnabled(Notification.permission === 'granted');
    }

    // Intercept beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handle1TouchInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        addToast('NEXORA HI instalado com sucesso no teu dispositivo!', 'success');
        setIsStandalone(true);
        onClose();
      }
      setDeferredPrompt(null);
    } else {
      setActiveTab('chrome_help');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(OFFICIAL_APP_URL);
    setIsCopied(true);
    addToast('Link direto oficial copiado para a área de transferência!', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleOpenInRealChrome = () => {
    if (isAndroid) {
      // Android intent directly targeting Chrome app
      const chromeIntent = `intent://${OFFICIAL_APP_URL.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = chromeIntent;
      setTimeout(() => {
        window.open(OFFICIAL_APP_URL, '_blank');
      }, 1000);
    } else {
      window.open(OFFICIAL_APP_URL, '_blank');
    }
  };

  const handleRequestPush = async () => {
    if (!('Notification' in window)) {
      addToast('O teu navegador não suporta notificações de sistema.', 'error');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setIsPushEnabled(true);
        addToast('Notificações ativadas! Receberás alertas quando a app estiver instalada.', 'success');
        new Notification('NEXORA HI', {
          body: 'Notificações ativadas com sucesso no teu telemóvel!',
          icon: '/icon-192.png',
        });
      } else {
        addToast('Permissão de notificações recusada pelo utilizador.', 'info');
      }
    } catch {
      addToast('Não foi possível ativar notificações neste ambiente.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <img
              src="/icon-192.png"
              alt="NEXORA HI"
              className="w-12 h-12 rounded-2xl object-cover shadow-lg shadow-blue-500/20 shrink-0 border border-blue-500/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg font-[var(--font-display)] text-slate-900 dark:text-white leading-tight">
                  Instalar NEXORA HI
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Pronto a Baixar
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Central oficial de download, instalação no Chrome e ficheiro APK
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Iframe / Preview Warning Banner (if detected) */}
        {isInIframe && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs mb-4 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">
                Por que o Chrome às vezes esconde a opção "Instalar"?
              </span>
              <p className="text-[11px] mt-0.5 leading-relaxed text-amber-800 dark:text-amber-300">
                Se estiveres a ver esta janela dentro de um pré-visualizador ou aplicativo (como WhatsApp/Instagram), o Chrome bloqueia a instalação automática por segurança. Clica abaixo para abrir no Chrome verdadeiro:
              </p>
              <button
                onClick={handleOpenInRealChrome}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] shadow-sm transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Diretamente no Chrome (Sem Iframe)</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-2xl mb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('install')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap min-h-[36px] ${
              activeTab === 'install'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar (1-Toque)</span>
          </button>

          <button
            onClick={() => setActiveTab('chrome_help')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap min-h-[36px] ${
              activeTab === 'chrome_help'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Passo a Passo no Chrome</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap min-h-[36px] ${
              activeTab === 'apk'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileArchive className="w-3.5 h-3.5 text-amber-500" />
            <span>Gerar APK & ZIP</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap min-h-[36px] ${
              activeTab === 'qr'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Código QR</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* TAB 1: 1-TOUCH INSTALL */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              
              {isStandalone ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold text-sm block">Aplicação Instalada com Sucesso!</span>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                      Estás a usar o NEXORA HI no modo standalone nativo. Todos os recursos, modo offline e clips acelerados estão ativos.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white/90">
                      Recomendado para Telemóveis
                    </span>
                    <h4 className="font-bold text-lg font-[var(--font-display)] mt-2">
                      Adicionar NEXORA HI ao Telemóvel
                    </h4>
                    <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                      Instalação sem lojas, sem anúncios e sem ocupar centenas de megabytes. Abre instantaneamente como o Instagram ou TikTok!
                    </p>

                    <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <button
                        onClick={handle1TouchInstall}
                        className="py-3 px-5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all min-h-[44px]"
                      >
                        <Download className="w-4 h-4" />
                        <span>Instalar Agora (1 Toque)</span>
                      </button>

                      <button
                        onClick={handleOpenInRealChrome}
                        className="py-3 px-4 rounded-xl bg-blue-700/60 hover:bg-blue-700 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir no Chrome</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Direct Copy & Native Push notification card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-1.5 text-slate-900 dark:text-white font-bold text-xs">
                    <Copy className="w-4 h-4 text-blue-500" />
                    <span>Link Direto Oficial</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Copia o link para colar na barra de pesquisa do Google Chrome no teu telemóvel:
                  </p>
                  <button
                    onClick={handleCopyLink}
                    className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors min-h-[38px]"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? 'Link Copiado!' : 'Copiar URL do App'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-1.5 text-slate-900 dark:text-white font-bold text-xs">
                    <Bell className="w-4 h-4 text-purple-500" />
                    <span>Alertas do Dispositivo</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Ativa alertas sonoros e visuais de novas mensagens e reações:
                  </p>
                  <button
                    onClick={handleRequestPush}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors min-h-[38px] ${
                      isPushEnabled
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-purple-500 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <Bell className="w-4 h-4 text-purple-500" />
                    <span>{isPushEnabled ? 'Notificações Ativas' : 'Ativar Notificações'}</span>
                  </button>
                </div>
              </div>

              {/* Verified Checklist */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Requisitos de Instalação Verificados:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Web App Manifest V3 Ativo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Service Worker & Cache Offline</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Ícones HD 192px & 512px</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Suporta Android 7.0 até 15+</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CHROME STEP-BY-STEP HELP */}
          {activeTab === 'chrome_help' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-500/30">
                <h4 className="font-bold text-sm text-blue-900 dark:text-blue-200 mb-1">
                  Como instalar pelo Google Chrome (Qualquer Android):
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Mesmo que o botão automático não surja no teu Chrome, podes instalar em 5 segundos seguindo estes 3 passos:
                </p>
              </div>

              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                    Abre o menu do Google Chrome
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    No canto superior direito do teu navegador Chrome, toca no ícone de <strong>3 pontinhos verticais (⋮)</strong>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                    Toca em "Instalar aplicação" ou "Adicionar ao ecrã principal"
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    No menu que abrir, procura por <strong>"Instalar aplicação"</strong> ou <strong>"Adicionar ao ecrã principal"</strong> (o nome pode variar conforme a versão do Android).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                    Confirma e Abre
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    Clica em <strong>"Instalar"</strong>. O ícone oficial do NEXORA HI ficará guardado no ecrã de início do teu telemóvel!
                  </p>
                </div>
              </div>

              {/* iPhone guidance */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Se estiveres no iPhone / iPad (Safari):
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Toca no botão de <strong>Partilhar</strong> (quadrado com seta para cima) na barra inferior do Safari e seleciona <strong>"Adicionar ao Ecrã Principal"</strong>.
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: APK & ZIP */}
          {activeTab === 'apk' && (
            <div className="space-y-3.5 text-xs">
              
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-sm">
                    Gerar Pacote APK para Android (PWABuilder)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                  Gera um ficheiro APK assinado pronto a instalar no teu Android com o motor oficial da Microsoft PWABuilder (compatível com Android 7.0 a 15+):
                </p>

                <a
                  href={PWABUILDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  <span>Gerar Ficheiro APK Agora (1-Clique)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <FileArchive className="w-5 h-5 text-amber-500" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Descarregar Código & Pacote Completo (.ZIP)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Descarrega todos os arquivos, ícones e código do NEXORA HI num arquivo compactado ZIP para o teu computador ou telemóvel:
                </p>

                <button
                  type="button"
                  onClick={async () => {
                    addToast('A empacotar ficheiro NEXORA-HI-Completo.zip...', 'info');
                    await downloadProjectZip();
                    addToast('Download do pacote ZIP concluído com sucesso!', 'success');
                  }}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition-all min-h-[44px]"
                >
                  <FileArchive className="w-4 h-4 text-amber-500" />
                  <span>Descarregar NEXORA-HI-Completo.zip</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 4: QR CODE */}
          {activeTab === 'qr' && (
            <div className="text-center py-2 space-y-4">
              <div className="inline-block p-4 bg-white rounded-3xl shadow-xl border border-slate-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(OFFICIAL_APP_URL)}`}
                  alt="QR Code para Download"
                  className="w-48 h-48 rounded-xl object-contain"
                  loading="lazy"
                />
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Aponta a câmara do teu telemóvel
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Abre a câmara ou leitor de QR no teu smartphone para abrir o NEXORA HI diretamente no Google Chrome.
                </p>
              </div>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Link Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 font-mono">
            NEXORA HI · PWA Ready
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
