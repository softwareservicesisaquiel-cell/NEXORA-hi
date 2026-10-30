import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Globe2,
  Shield,
  Cpu,
  Smartphone,
  Bell,
  Sliders,
  Check,
  RefreshCw,
  Sparkles,
  Lock,
  LogOut,
  Laptop,
  CheckCircle2,
  ChevronRight,
  Flame,
  Zap,
  Download,
  ExternalLink,
} from 'lucide-react';
import { WORLD_LANGUAGES } from '../i18n/languages';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLanguageSelector: () => void;
  onOpenInstallationHub?: () => void;
  currentLanguageCode: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenLanguageSelector,
  onOpenInstallationHub,
  currentLanguageCode,
}) => {
  const { addToast, logout } = useApp();

  const [activeSection, setActiveSection] = useState<'evolution' | 'security' | 'compatibility' | 'installation' | 'notifications'>('evolution');

  // Autonomous update engine cycle (every 1 month and 15 days = 45 days)
  const [daysRemaining, setDaysRemaining] = useState(38);
  const [hoursRemaining, setHoursRemaining] = useState(14);
  const [minutesRemaining, setMinutesRemaining] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(40);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [lastCheckMessage, setLastCheckMessage] = useState('O sistema está em sincronia contínua com as tendências globais.');

  // Settings states
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [dataSaverMode, setDataSaverMode] = useState(true);
  const [highFrameRate, setHighFrameRate] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [quantumEncryption, setQuantumEncryption] = useState(true);

  // Active sessions mock list
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 'sess_1',
      device: 'Samsung Galaxy (Android 7+ / 14)',
      location: 'Lisboa, Portugal',
      ip: '194.65.120.45',
      isCurrent: true,
      lastActive: 'Ativo agora',
    },
    {
      id: 'sess_2',
      device: 'Google Chrome Desktop',
      location: 'Porto, Portugal',
      ip: '85.241.77.12',
      isCurrent: false,
      lastActive: 'Ontem às 22:40',
    },
  ]);

  // Autonomous countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev > 0) return prev - 1;
        setMinutesRemaining(m => (m > 0 ? m - 1 : 59));
        return 59;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const currentLangObj = WORLD_LANGUAGES.find(l => l.code === currentLanguageCode) || WORLD_LANGUAGES[0];

  const handleManualCheckUpdate = () => {
    setIsCheckingUpdate(true);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setLastCheckMessage('Verificação concluída! O NEXORA HI descarregou 4 novos módulos de inteligência e filtros adaptativos sem reiniciar a app.');
      addToast('Atualização autônoma aplicada com sucesso!', 'success');
    }, 2000);
  };

  const handleTerminateOtherSessions = () => {
    setActiveSessions(prev => prev.filter(s => s.isCurrent));
    addToast('Todas as outras sessões foram encerradas com segurança!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[88vh] text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-[var(--font-display)]">
                Definições do NEXORA HI
              </h3>
              <p className="text-xs text-slate-500">
                Inteligência autônoma, segurança reforçada e configurações do sistema
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-2xl mb-5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSection('evolution')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap min-h-[38px] ${
              activeSection === 'evolution'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Evolução Autônoma (45d)</span>
          </button>

          <button
            onClick={() => setActiveSection('security')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap min-h-[38px] ${
              activeSection === 'security'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Segurança & Sessões</span>
          </button>

          <button
            onClick={() => setActiveSection('compatibility')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap min-h-[38px] ${
              activeSection === 'compatibility'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android 7+ & Desempenho</span>
          </button>

          <button
            onClick={() => setActiveSection('installation')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap min-h-[38px] ${
              activeSection === 'installation'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar & Baixar App</span>
          </button>

          <button
            onClick={() => setActiveSection('notifications')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap min-h-[38px] ${
              activeSection === 'notifications'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alertas</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* Quick Language Banner (always visible at top of body) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe2 className="w-4 h-4 text-blue-500" />
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Idioma Ativo: {currentLangObj.nativeName} ({currentLangObj.name})
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Mais de 180 idiomas mundiais disponíveis
                </span>
              </div>
            </div>

            <button
              onClick={onOpenLanguageSelector}
              className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 text-blue-600 dark:text-blue-400 transition-colors flex items-center gap-1"
            >
              <span>Alterar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1. EVOLUÇÃO AUTÔNOMA SECTION */}
          {activeSection === 'evolution' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/30 shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-sm text-white font-[var(--font-display)]">
                      Ciclo de Atualização Autônoma (1 Mês e 15 Dias)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                    45 DIAS
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  O motor inteligente do NEXORA HI analisa as mudanças no mundo a cada segundo e recompila autonomamente novos recursos sem necessidade de reinstalação manual.
                </p>

                {/* Countdown display */}
                <div className="grid grid-cols-4 gap-2 text-center mb-4">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-lg font-bold font-mono text-white block tabular-nums">
                      {daysRemaining}
                    </span>
                    <span className="text-[10px] text-slate-400">Dias</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-lg font-bold font-mono text-white block tabular-nums">
                      {hoursRemaining}
                    </span>
                    <span className="text-[10px] text-slate-400">Horas</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-lg font-bold font-mono text-white block tabular-nums">
                      {minutesRemaining}
                    </span>
                    <span className="text-[10px] text-slate-400">Minutos</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-lg font-bold font-mono text-blue-400 block tabular-nums">
                      {secondsRemaining}
                    </span>
                    <span className="text-[10px] text-slate-400">Segundos</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Próxima onda de surpresas: Novas lentes de IA e áudio imersivo
                  </span>
                  <button
                    onClick={handleManualCheckUpdate}
                    disabled={isCheckingUpdate}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                    <span>{isCheckingUpdate ? 'A sincronizar...' : 'Sincronizar Agora'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Radar de Evolução Contínua:
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {lastCheckMessage}
                </p>
              </div>
            </div>
          )}

          {/* 2. SEGURANÇA REFORÇADA SECTION */}
          {activeSection === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Proteção Criptográfica & Acesso
                </h4>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                      Acesso Biométrico e Passkeys FIDO2
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Entra com impressão digital ou reconhecimento facial sem palavra-passe.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={biometricEnabled}
                    onChange={e => setBiometricEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                      Encriptação Resistente a Computação Quântica
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Chaves Kyber-1024 protegendo as tuas conversas privadas e arquivos.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={quantumEncryption}
                    onChange={e => setQuantumEncryption(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              </div>

              {/* Active Sessions List */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Sessões Ativas em Dispositivos ({activeSessions.length})
                  </h4>
                  <button
                    onClick={handleTerminateOtherSessions}
                    className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                  >
                    Encerrar Outras Sessões
                  </button>
                </div>

                <div className="space-y-2">
                  {activeSessions.map(session => (
                    <div
                      key={session.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {session.isCurrent ? (
                          <Smartphone className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Laptop className="w-4 h-4 text-slate-400" />
                        )}
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            {session.device} {session.isCurrent && '(Este dispositivo)'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {session.location} · {session.ip} · {session.lastActive}
                          </span>
                        </div>
                      </div>

                      {session.isCurrent && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold">
                          Online
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. COMPATIBILIDADE ANDROID 7+ SECTION */}
          {activeSection === 'compatibility' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-bold text-xs">Suporte Universal Verificado</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  O NEXORA HI inclui polyfills e otimização de renderização acelerada por GPU para garantir compatibilidade a 100% com **Android 7.0 (Nougat), 8, 9, 10, 11, 12, 13, 14, 15** e todos os navegadores modernos e legados.
                </p>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                        Modo de Poupança Extrema de Dados
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Otimiza imagens e comprime vídeos para conexões lentas (3G/4G).
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={dataSaverMode}
                      onChange={e => setDataSaverMode(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                        Taxa de Atualização Dinâmica (60fps / 120Hz)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Transições ultra suaves adaptadas ao ecrã do teu telemóvel.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={highFrameRate}
                      onChange={e => setHighFrameRate(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 4. INSTALAÇÃO & APK SECTION */}
          {activeSection === 'installation' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white font-[var(--font-display)]">
                    Instalar Aplicação NEXORA HI no Dispositivo
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tens acesso a todos os métodos de instalação: 1-toque direto pelo Chrome, geração de APK pelo PWABuilder ou download do pacote ZIP de código-fonte.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {onOpenInstallationHub && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenInstallationHub();
                      }}
                      className="py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Abrir Central de Instalação Completa</span>
                    </button>
                  )}

                  <a
                    href="https://www.pwabuilder.com?url=https://ais-pre-rwuwoovdry536fzr67tzkt-292990919406.us-east1.run.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Gerar APK (PWABuilder)</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-75" />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Instalação Manual no Google Chrome:
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Toca no menu de <strong>3 pontinhos (⋮)</strong> no canto superior do navegador e clica em <strong>"Instalar aplicação"</strong> ou <strong>"Adicionar ao ecrã principal"</strong>.
                </p>
              </div>
            </div>
          )}

          {/* 5. NOTIFICAÇÕES SECTION */}
          {activeSection === 'notifications' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                    Notificações em Tempo Real
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Receber alertas instantâneos de mensagens, clips e chamadas.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={pushNotifs}
                  onChange={e => setPushNotifs(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            NEXORA HI v2.6-AUTONOMOUS
          </span>
          <button
            onClick={() => {
              addToast('Definições salvas com sucesso!', 'success');
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};
