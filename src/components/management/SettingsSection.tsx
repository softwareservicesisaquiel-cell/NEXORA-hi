import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Bell,
  Sun,
  Moon,
  Globe2,
  Trash2,
  KeyRound,
  Copy,
  Check,
  CheckCircle2,
  Smartphone,
  Laptop,
  Tablet,
  AlertTriangle,
  UserX,
  Sliders,
  Sparkles,
  Download,
  Database,
  Type,
  Contrast,
  ZapOff,
  ChevronRight,
  RefreshCw,
  LogOut,
  HelpCircle,
  FileText,
  Radio,
} from 'lucide-react';
import { WORLD_LANGUAGES } from '../../i18n/languages';
import { auth, updatePassword } from '../../lib/firebase';
import {
  getActiveSessionsList,
  terminateOtherSessionsList,
  DeviceSessionInfo,
} from '../../utils/deviceDetector';
import {
  hasPermission,
  revokePermission,
  resetAllPermissions,
} from '../../utils/permissionManager';
import { clearAllImageCache } from '../../utils/imageCache';

export type SettingsSubPage =
  | 'conta'
  | 'informacoes_pessoais'
  | 'seguranca'
  | 'privacidade'
  | 'notificacoes'
  | 'aparencia'
  | 'idioma'
  | 'acessibilidade'
  | 'dispositivos'
  | 'bloqueios'
  | 'gestao_conta'
  | 'desativacao_eliminacao';

interface SettingsSectionProps {
  currentSubPage: SettingsSubPage | null;
  onSelectSubPage: (subPage: SettingsSubPage | null) => void;
  onOpenLanguageSelector: () => void;
  onOpenInstallationHub: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  currentSubPage,
  onSelectSubPage,
  onOpenLanguageSelector,
  onOpenInstallationHub,
}) => {
  const {
    currentUser,
    updateProfile,
    deleteAccount,
    deactivateAccount,
    logout,
    theme,
    toggleTheme,
    blockedUserIds,
    unblockUser,
    allUsers,
    addToast,
    currentLanguage,
    setLanguage,
  } = useApp();

  // Account form
  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedRecovery, setCopiedRecovery] = useState(false);

  // Personal info
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [website, setWebsite] = useState(currentUser?.website || '');
  const [profession, setProfession] = useState('Engenheiro de Software & Criador');
  const [isSavingPersonalInfo, setIsSavingPersonalInfo] = useState(false);

  // Security
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Privacy
  const [isPrivate, setIsPrivate] = useState(currentUser?.isPrivate || false);
  const [messagePrivacy, setMessagePrivacy] = useState<'everyone' | 'following'>('everyone');
  const [commentPrivacy, setCommentPrivacy] = useState<'everyone' | 'following'>('everyone');
  const [storiesPrivacy, setStoriesPrivacy] = useState<'everyone' | 'following'>('everyone');

  // Notifications
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyCalls, setNotifyCalls] = useState(true);
  const [notifySystemAnnouncements, setNotifySystemAnnouncements] = useState(true);

  // Appearance
  const [displayDensity, setDisplayDensity] = useState<'comfortable' | 'compact'>('comfortable');

  // Accessibility
  const [fontSize, setFontSize] = useState<'normal' | 'medium' | 'large'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Devices & Sessions
  const [sessions, setSessions] = useState<DeviceSessionInfo[]>([]);
  const [isTerminatingSessions, setIsTerminatingSessions] = useState(false);

  // Deletion confirm
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Image cache
  const [isClearingCache, setIsClearingCache] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.name);
      setUsername(currentUser.username);
      setBio(currentUser.bio || '');
      setLocation(currentUser.location || '');
      setWebsite(currentUser.website || '');
      setIsPrivate(currentUser.isPrivate || false);
    }
  }, [currentUser]);

  useEffect(() => {
    getActiveSessionsList().then(list => setSessions(list));
  }, []);

  const handleCopyNexoraId = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.nexoraId);
    setCopiedId(true);
    addToast(`NEXORA ID copiado: ${currentUser.nexoraId}`, 'success');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyRecoveryCode = () => {
    if (!currentUser?.recoveryCode) return;
    navigator.clipboard.writeText(currentUser.recoveryCode);
    setCopiedRecovery(true);
    addToast('Código de recuperação copiado com segurança!', 'success');
    setTimeout(() => setCopiedRecovery(false), 2000);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!displayName.trim()) {
      addToast('O nome não pode estar vazio.', 'error');
      return;
    }
    setIsSavingAccount(true);
    try {
      await updateProfile({
        name: displayName.trim(),
        username: username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, ''),
      });
      addToast('Dados da conta guardados com sucesso!', 'success');
    } catch {
      addToast('Erro ao atualizar a conta.', 'error');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSavingPersonalInfo(true);
    try {
      await updateProfile({
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim(),
      });
      addToast('Informações pessoais atualizadas!', 'success');
    } catch {
      addToast('Erro ao atualizar informações pessoais.', 'error');
    } finally {
      setIsSavingPersonalInfo(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('A palavra-passe deve ter pelo menos 6 caracteres.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      addToast('As palavras-passe não coincidem.', 'error');
      return;
    }
    setIsChangingPassword(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        addToast('Palavra-passe alterada com sucesso!', 'success');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        addToast('Sessão expirada. Inicie sessão novamente.', 'error');
      }
    } catch (err: any) {
      addToast(err?.message || 'Erro ao alterar a palavra-passe.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleTogglePrivacy = async (privateVal: boolean) => {
    setIsPrivate(privateVal);
    try {
      await updateProfile({ isPrivate: privateVal });
      addToast(privateVal ? 'Conta alterada para Privada.' : 'Conta alterada para Pública.', 'success');
    } catch {
      addToast('Erro ao atualizar privacidade.', 'error');
    }
  };

  const handleTerminateOtherSessions = async () => {
    setIsTerminatingSessions(true);
    try {
      const remaining = await terminateOtherSessionsList();
      setSessions(remaining);
      addToast('Todas as outras sessões foram encerradas com sucesso!', 'success');
    } catch {
      addToast('Erro ao encerrar sessões.', 'error');
    } finally {
      setIsTerminatingSessions(false);
    }
  };

  const handleClearImageCache = async () => {
    setIsClearingCache(true);
    try {
      await clearAllImageCache();
      addToast('Cache de imagens limpa com sucesso!', 'success');
    } catch {
      addToast('Erro ao limpar a cache.', 'error');
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleExportData = () => {
    if (!currentUser) return;
    const exportPayload = {
      user: currentUser,
      exportedAt: new Date().toISOString(),
      platform: 'NEXORA Cloud 2026',
      version: 'v2.4.0',
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora_backup_${currentUser.username}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Ficheiro de dados da conta descarregado!', 'success');
  };

  const handleDeactivate = async () => {
    if (confirm('Tem a certeza de que pretende desativar temporariamente a sua conta Nexora? Pode reativá-la iniciando sessão.')) {
      setIsDeactivating(true);
      try {
        await deactivateAccount();
        addToast('Conta desativada temporariamente.', 'info');
      } finally {
        setIsDeactivating(false);
      }
    }
  };

  const handleDeletePermanent = async () => {
    if (deleteConfirmationText !== currentUser?.username) {
      addToast(`Escreva "${currentUser?.username}" exatamente para confirmar.`, 'error');
      return;
    }
    if (confirm('Atenção: Esta ação é definitiva e irreversível. Todos os seus dados serão apagados permanentemente.')) {
      setIsDeleting(true);
      try {
        await deleteAccount();
      } catch (err: any) {
        addToast(err?.message || 'Erro ao eliminar a conta.', 'error');
        setIsDeleting(false);
      }
    }
  };

  const blockedUsers = allUsers.filter(u => blockedUserIds.includes(u.id));

  // 12 Defined Categories
  const categories: {
    id: SettingsSubPage;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    {
      id: 'conta',
      title: 'Conta',
      description: 'Nome, nome de utilizador, email e identificador Nexora ID',
      icon: User,
    },
    {
      id: 'informacoes_pessoais',
      title: 'Informações Pessoais',
      description: 'Biografia, profissão, website e localização',
      icon: Sliders,
    },
    {
      id: 'seguranca',
      title: 'Segurança',
      description: 'Palavra-passe, autenticação de dois fatores e código de recuperação',
      icon: Shield,
    },
    {
      id: 'privacidade',
      title: 'Privacidade',
      description: 'Visibilidade da conta, quem pode enviar mensagens e interações',
      icon: Lock,
    },
    {
      id: 'notificacoes',
      title: 'Notificações',
      description: 'Alertas de gostos, comentários, mensagens e chamadas',
      icon: Bell,
    },
    {
      id: 'aparencia',
      title: 'Aparência',
      description: 'Modo escuro / claro e densidade da interface',
      icon: Sun,
    },
    {
      id: 'idioma',
      title: 'Idioma',
      description: 'Seleção entre mais de 40 idiomas globais com suporte completo',
      icon: Globe2,
      badge: currentLanguage.toUpperCase(),
    },
    {
      id: 'acessibilidade',
      title: 'Acessibilidade',
      description: 'Tamanho de texto, alto contraste e redução de movimentos',
      icon: Contrast,
    },
    {
      id: 'dispositivos',
      title: 'Dispositivos Conectados',
      description: 'Detetor de hardware, sessões ativas e encerramento remoto',
      icon: Smartphone,
      badge: `${sessions.length} ativas`,
    },
    {
      id: 'bloqueios',
      title: 'Bloqueios',
      description: 'Gestão de contas restritas e lista de utilizadores bloqueados',
      icon: UserX,
      badge: blockedUsers.length > 0 ? `${blockedUsers.length}` : undefined,
    },
    {
      id: 'gestao_conta',
      title: 'Gestão da Conta',
      description: 'Exportação de dados JSON e limpeza de cache de imagens',
      icon: Database,
    },
    {
      id: 'desativacao_eliminacao',
      title: 'Desativação e Eliminação',
      description: 'Pausa temporária de utilização ou eliminação definitiva da conta',
      icon: Trash2,
    },
  ];

  // If no sub-page selected, show the 12 categories grid
  if (!currentSubPage) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Configurações da Nexora
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Selecione uma categoria para gerir os seus controlos, preferências e parâmetros de segurança.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectSubPage(cat.id)}
                className="w-full text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/50 hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between min-h-[110px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  {cat.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {cat.badge}
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {cat.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {cat.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Render individual sub-pages
  return (
    <div className="space-y-6">
      {/* Subpage Header with Return Button */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => onSelectSubPage(null)}
          className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          ← Voltar a Todas as Configurações
        </button>
        <span className="text-xs text-slate-400 font-mono uppercase">
          Configuração: {currentSubPage.replace('_', ' ')}
        </span>
      </div>

      {/* 1. CONTA */}
      {currentSubPage === 'conta' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Conta e Identidade</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gerencie a sua identificação oficial na rede social Nexora.
            </p>
          </div>

          <form onSubmit={handleSaveAccount} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Nome de Exibição
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Nome de Utilizador (@handle)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Email Registado
              </label>
              <input
                type="text"
                disabled
                value={currentUser?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm text-slate-500 cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                O email autenticado na Cloud não pode ser alterado diretamente por questões de segurança.
              </span>
            </div>

            {/* NEXORA ID */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block">
                    NEXORA ID Oficial
                  </span>
                  <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
                    {currentUser?.nexoraId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyNexoraId}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId ? 'Copiado!' : 'Copiar ID'}</span>
                </button>
              </div>
              <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-2">
                O seu identificador único no ecossistema Nexora para verificação e transferências.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingAccount}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-md shadow-blue-500/20"
              >
                {isSavingAccount ? 'A guardar...' : 'Guardar Alterações da Conta'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. INFORMAÇÕES PESSOAIS */}
      {currentSubPage === 'informacoes_pessoais' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Informações Pessoais</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detalhes visíveis no seu perfil público para outros membros da Nexora.
            </p>
          </div>

          <form onSubmit={handleSavePersonalInfo} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Biografia
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Escreva uma breve apresentação sobre si..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Profissão / Título
              </label>
              <input
                type="text"
                value={profession}
                onChange={e => setProfession(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Localização (Cidade, País)
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ex: Lisboa, Portugal"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Website ou Link Principal
              </label>
              <input
                type="text"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://o-seu-portfolio.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingPersonalInfo}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-md shadow-blue-500/20"
              >
                {isSavingPersonalInfo ? 'A guardar...' : 'Guardar Informações'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. SEGURANÇA */}
      {currentSubPage === 'seguranca' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Segurança e Acesso</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Proteja a sua conta com autenticação forte e palavra-passe segura.
            </p>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="space-y-4 p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-500" />
              <span>Alterar Palavra-passe</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Nova Palavra-passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Confirmar Nova Palavra-passe
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                placeholder="Repita a nova palavra-passe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword || !newPassword}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              {isChangingPassword ? 'A atualizar...' : 'Atualizar Palavra-passe'}
            </button>
          </form>

          {/* 2FA Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Autenticação de Dois Fatores (2FA)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Exige confirmação por token ao iniciar sessão a partir de novos dispositivos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setTwoFactorEnabled(!twoFactorEnabled);
                addToast(twoFactorEnabled ? '2FA desativado.' : '2FA ativado para novos acessos.', 'info');
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                twoFactorEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Recovery Code */}
          {currentUser?.recoveryCode && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Código de Recuperação Master</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyRecoveryCode}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedRecovery ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRecovery ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 break-all select-all">
                {currentUser.recoveryCode}
              </p>
              <p className="text-[11px] text-slate-500">
                Guarde este código num local seguro. Ele permite recuperar o acesso caso perca as suas credenciais.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. PRIVACIDADE */}
      {currentSubPage === 'privacidade' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Privacidade e Visibilidade</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Escolha quem pode ver as suas publicações e interagir consigo.
            </p>
          </div>

          <div className="space-y-4">
            {/* Account Visibility */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Conta Privada
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Quando a conta é privada, apenas utilizadores que aprovar podem ver fotos, vídeos e histórias.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePrivacy(!isPrivate)}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  isPrivate ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isPrivate ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Who can send DMs */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="text-sm font-bold text-slate-900 dark:text-white block">
                Quem Pode Enviar Mensagens Privadas
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMessagePrivacy('everyone')}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    messagePrivacy === 'everyone'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Todos os Membros
                </button>
                <button
                  type="button"
                  onClick={() => setMessagePrivacy('following')}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    messagePrivacy === 'following'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Apenas Quem Sigo
                </button>
              </div>
            </div>

            {/* Who can comment */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="text-sm font-bold text-slate-900 dark:text-white block">
                Quem Pode Comentar nas Suas Publicações
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCommentPrivacy('everyone')}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    commentPrivacy === 'everyone'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setCommentPrivacy('following')}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    commentPrivacy === 'following'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Apenas Seguidores
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. NOTIFICAÇÕES */}
      {currentSubPage === 'notificacoes' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Preferências de Notificações</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Escolha que alertas pretende receber em tempo real no seu dispositivo.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Gostos e Reações',
                desc: 'Alertar quando alguém gostar das suas fotos, publicações ou Reels.',
                val: notifyLikes,
                setVal: setNotifyLikes,
              },
              {
                title: 'Comentários',
                desc: 'Alertar sobre novos comentários e respostas às suas conversas.',
                val: notifyComments,
                setVal: setNotifyComments,
              },
              {
                title: 'Mensagens Diretas',
                desc: 'Alertar sobre mensagens recebidas nas abas Principal e Geral.',
                val: notifyMessages,
                setVal: setNotifyMessages,
              },
              {
                title: 'Chamadas de Áudio e Vídeo',
                desc: 'Tocar quando receber uma chamada WebRTC P2P.',
                val: notifyCalls,
                setVal: setNotifyCalls,
              },
              {
                title: 'Atualizações Oficiais da Nexora',
                desc: 'Comunicados de segurança e novidades do perfil verificado @nexora.',
                val: notifySystemAnnouncements,
                setVal: setNotifySystemAnnouncements,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800"
              >
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    {item.title}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {item.desc}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    item.setVal(!item.val);
                    addToast(`Notificação "${item.title}" ${!item.val ? 'ativada' : 'desativada'}.`, 'info');
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    item.val ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      item.val ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. APARÊNCIA */}
      {currentSubPage === 'aparencia' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aparência e Tema</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalize o ambiente visual da aplicação Nexora.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                Tema do Sistema
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (theme === 'dark') toggleTheme();
                  }}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                    theme === 'light'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  <Sun className="w-6 h-6 text-amber-500" />
                  <span className="text-xs font-bold">Modo Claro</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (theme === 'light') toggleTheme();
                  }}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                    theme === 'dark'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  <Moon className="w-6 h-6 text-indigo-400" />
                  <span className="text-xs font-bold">Modo Escuro</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                Densidade de Visualização
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDisplayDensity('comfortable')}
                  className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                    displayDensity === 'comfortable'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Confortável (Padrão)
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayDensity('compact')}
                  className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                    displayDensity === 'compact'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Compacta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. IDIOMA */}
      {currentSubPage === 'idioma' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Idioma da Plataforma</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Suporte nativo internacional em mais de 40 línguas globais.
              </p>
            </div>
            <button
              onClick={onOpenLanguageSelector}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors cursor-pointer"
            >
              Abrir Seletor Completo
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
            {WORLD_LANGUAGES.slice(0, 15).map(lang => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    addToast(`Idioma alterado para ${lang.name} (${lang.nativeName})`, 'success');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs truncate">{lang.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{lang.nativeName}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. ACESSIBILIDADE */}
      {currentSubPage === 'acessibilidade' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Acessibilidade</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Opções de legibilidade e facilidade de navegação para todos os utilizadores.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                Tamanho da Tipografia
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'Normal' },
                  { id: 'medium', label: 'Médio (+15%)' },
                  { id: 'large', label: 'Grande (+30%)' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFontSize(opt.id as any)}
                    className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                      fontSize === opt.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Modo Alto Contraste
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Aumenta a distinção de bordas, ícones e textos para facilitar a visualização.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHighContrast(!highContrast)}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  highContrast ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    highContrast ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Reduzir Movimento e Animações
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Desativa transições dinâmicas para evitar desconforto visual.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReduceMotion(!reduceMotion)}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  reduceMotion ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    reduceMotion ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. DISPOSITIVOS CONECTADOS */}
      {currentSubPage === 'dispositivos' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dispositivos Conectados</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sessões ativas no seu telemóvel, tablet e computador com deteção de hardware.
              </p>
            </div>
            {sessions.length > 1 && (
              <button
                type="button"
                onClick={handleTerminateOtherSessions}
                disabled={isTerminatingSessions}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isTerminatingSessions ? 'A encerrar...' : 'Terminar Outras Sessões'}</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {sessions.map(sess => (
              <div
                key={sess.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  sess.isCurrent
                    ? 'border-blue-500/50 bg-blue-50/40 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                    {sess.deviceType === 'mobile' ? (
                      <Smartphone className="w-5 h-5" />
                    ) : sess.deviceType === 'tablet' ? (
                      <Tablet className="w-5 h-5" />
                    ) : (
                      <Laptop className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {sess.deviceName}
                      </span>
                      {sess.isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold uppercase">
                          Sessão Atual
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {sess.browser} • {sess.os} • {sess.timeZone}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Último acesso: {sess.lastActive}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. BLOQUEIOS */}
      {currentSubPage === 'bloqueios' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Utilizadores Bloqueados</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Contas que bloqueou não podem ver o seu perfil, publicações nem enviar mensagens.
            </p>
          </div>

          {blockedUsers.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Não tem utilizadores bloqueados
              </p>
              <p className="text-xs text-slate-500 mt-1">
                A sua experiência social está livre de restrições ativas.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => unblockUser(user.id)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Desbloquear
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 11. GESTÃO DA CONTA */}
      {currentSubPage === 'gestao_conta' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gestão da Conta e Dados</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Exporte as suas informações ou otimize o armazenamento local do seu dispositivo.
            </p>
          </div>

          <div className="space-y-4">
            {/* Export data */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Exportar Cópia de Dados (JSON)
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Descarregue todos os dados do seu perfil, identificadores e configurações em formato universal.
                </span>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
              </button>
            </div>

            {/* Clear Image Cache */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Limpar Cache de Imagens Local
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Liberta espaço em disco removendo miniaturas temporárias guardadas no navegador.
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearImageCache}
                disabled={isClearingCache}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isClearingCache ? 'animate-spin' : ''}`} />
                <span>{isClearingCache ? 'A limpar...' : 'Limpar Cache'}</span>
              </button>
            </div>

            {/* Installation Hub link */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Aplicação Nativa e PWA
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Instale a aplicação no seu ecrã principal Android, iOS ou ambiente de trabalho.
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenInstallationHub}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Hub de Instalação</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. DESATIVAÇÃO E ELIMINAÇÃO */}
      {currentSubPage === 'desativacao_eliminacao' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">
              Desativação e Eliminação da Conta
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Escolha entre pausar temporariamente a sua presença ou apagar definitivamente os seus dados.
            </p>
          </div>

          <div className="space-y-4">
            {/* Deactivation */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Desativação Temporária
              </h4>
              <p className="text-xs text-slate-500">
                O seu perfil, fotos e comentários ficarão ocultos até voltar a iniciar sessão. Nenhuma publicação será apagada.
              </p>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={isDeactivating}
                className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold transition-colors cursor-pointer"
              >
                {isDeactivating ? 'A desativar...' : 'Desativar Conta Temporariamente'}
              </button>
            </div>

            {/* Permanent deletion */}
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
              <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Eliminação Definitiva da Conta</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Esta ação é irreversível. Todas as suas publicações, mensagens, histórias e conexões serão removidas permanentemente dos servidores em nuvem da Nexora.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Para confirmar, escreva o seu nome de utilizador <span className="font-mono text-rose-600">{currentUser?.username}</span>:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={e => setDeleteConfirmationText(e.target.value)}
                  placeholder={currentUser?.username}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleDeletePermanent}
                disabled={isDeleting || deleteConfirmationText !== currentUser?.username}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                {isDeleting ? 'A eliminar permanentemente...' : 'Eliminar Conta Definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
