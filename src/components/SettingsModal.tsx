import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
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
  ChevronRight,
  UserX,
  Settings,
  Image,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { WORLD_LANGUAGES } from '../i18n/languages';
import { auth, updatePassword } from '../lib/firebase';
import {
  getActiveSessionsList,
  terminateOtherSessionsList,
  DeviceSessionInfo,
} from '../utils/deviceDetector';
import {
  hasPermission,
  revokePermission,
  resetAllPermissions,
} from '../utils/permissionManager';
import { clearAllImageCache } from '../utils/imageCache';

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
  currentLanguageCode,
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
    allUsers,
    addToast,
    t,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'account' | 'privacy' | 'security' | 'appearance' | 'notifications'>('account');

  // Account form states
  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Privacy states
  const [isPrivate, setIsPrivate] = useState(currentUser?.isPrivate || false);
  const [messagePrivacy, setMessagePrivacy] = useState<'everyone' | 'following'>('everyone');
  const [commentPrivacy, setCommentPrivacy] = useState<'everyone' | 'following'>('everyone');

  // Notification states
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyCalls, setNotifyCalls] = useState(true);

  // Device sessions with exact hardware and OS detection
  const [sessions, setSessions] = useState<DeviceSessionInfo[]>([]);
  const [photosPermissionGranted, setPhotosPermissionGranted] = useState(hasPermission('photos'));
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(hasPermission('location'));

  useEffect(() => {
    if (isOpen) {
      getActiveSessionsList().then((list) => {
        setSessions(list);
      });
      setPhotosPermissionGranted(hasPermission('photos'));
      setLocationPermissionGranted(hasPermission('location'));
    }
  }, [isOpen]);

  if (!isOpen || !currentUser) return null;

  const currentLangObj = WORLD_LANGUAGES.find((l) => l.code === currentLanguageCode) || WORLD_LANGUAGES[0];

  const handleCopyNexoraId = () => {
    navigator.clipboard.writeText(currentUser.nexoraId);
    setCopiedId(true);
    addToast(`NEXORA ID ${currentUser.nexoraId} copiado!`, 'success');
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleSaveAccountInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: displayName.trim() || currentUser.name,
        username: username.trim().toLowerCase() || currentUser.username,
      });
      addToast('Informações de conta atualizadas com sucesso!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao guardar dados.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('A nova palavra-passe deve conter pelo menos 6 caracteres.', 'info');
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
        addToast('Palavra-passe alterada com sucesso no Firebase Auth!', 'success');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        throw new Error('Sessão expirada. Inicie sessão novamente.');
      }
    } catch (err: any) {
      addToast(err.message || 'Erro ao alterar palavra-passe.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleTogglePrivacy = async (privateVal: boolean) => {
    setIsPrivate(privateVal);
    await updateProfile({ isPrivate: privateVal });
    addToast(privateVal ? 'Conta alterada para Privada.' : 'Conta alterada para Pública.', 'success');
  };

  const handleTerminateOtherSessions = async () => {
    const remaining = await terminateOtherSessionsList();
    setSessions(remaining);
    addToast('Todas as outras sessões foram encerradas com segurança.', 'success');
  };

  const handleRevokePhotos = () => {
    revokePermission('photos');
    setPhotosPermissionGranted(false);
    addToast('Permissão de acesso a fotos revogada com sucesso.', 'info');
  };

  const handleRevokeLocation = () => {
    revokePermission('location');
    setLocationPermissionGranted(false);
    addToast('Permissão de localização geográfica revogada.', 'info');
  };

  const handleResetPermissions = () => {
    resetAllPermissions();
    setPhotosPermissionGranted(false);
    setLocationPermissionGranted(false);
    addToast('Todas as permissões do dispositivo foram repostas.', 'info');
  };

  const handleClearCache = async () => {
    await clearAllImageCache();
    addToast('Cache de imagens do dispositivo limpa com sucesso!', 'success');
  };

  const handleDeactivate = async () => {
    if (window.confirm('Tem a certeza que deseja desativar a sua conta NEXORA? Pode reativá-la a qualquer momento iniciando sessão.')) {
      await deactivateAccount();
      onClose();
    }
  };

  const handleDelete = async () => {
    if (window.confirm('ATENÇÃO: Deseja eliminar permanentemente a sua conta NEXORA? Esta ação é irreversível e removerá todos os seus dados.')) {
      await deleteAccount();
      onClose();
    }
  };

  const blockedUsersList = allUsers.filter((u) => blockedUserIds.includes(u.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Left Category Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3 sm:p-4 flex md:flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-base font-[var(--font-display)]">
                  {t('menu.settings')}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              <button
                onClick={() => setActiveCategory('account')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === 'account'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Conta</span>
              </button>

              <button
                onClick={() => setActiveCategory('privacy')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === 'privacy'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Privacidade</span>
              </button>

              <button
                onClick={() => setActiveCategory('security')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === 'security'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Segurança</span>
              </button>

              <button
                onClick={() => setActiveCategory('appearance')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === 'appearance'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Aparência & Idioma</span>
              </button>

              <button
                onClick={() => setActiveCategory('notifications')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === 'notifications'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Notificações</span>
              </button>
            </nav>
          </div>

          <div className="hidden md:block pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
            NEXORA Cloud • Firebase Realtime
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
          <div className="hidden md:flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500">
              {activeCategory === 'account' && 'Definições de Conta'}
              {activeCategory === 'privacy' && 'Privacidade e Acesso'}
              {activeCategory === 'security' && 'Segurança da Sessão'}
              {activeCategory === 'appearance' && 'Aparência e Idioma Global'}
              {activeCategory === 'notifications' && 'Preferências de Notificação'}
            </h4>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. CATEGORIA: CONTA */}
          {activeCategory === 'account' && (
            <div className="space-y-5">
              {/* Permanent NEXORA ID */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-blue-500/20">
                <span className="text-[11px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider block mb-1">
                  NEXORA ID Permanente
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-mono font-bold tracking-wider text-slate-900 dark:text-white">
                    {currentUser.nexoraId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNexoraId}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors cursor-pointer"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId ? 'Copiado' : 'Copiar ID'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Identificador criptográfico exclusivo gerado no momento do registo.
                </p>
              </div>

              {/* Edit Basic Info */}
              <form onSubmit={handleSaveAccountInfo} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nome de Apresentação
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nome de Utilizador (@)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? 'A guardar...' : 'Guardar Alterações'}
                </button>
              </form>

              {/* Password Change Form */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>Alteração de Palavra-passe Segura</span>
                </h5>

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nova Palavra-passe (mínimo 6 caracteres)"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirmar Nova Palavra-passe"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-blue-500"
                  />

                  <button
                    type="submit"
                    disabled={isChangingPassword || !newPassword}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isChangingPassword ? 'A atualizar...' : 'Atualizar Palavra-passe'}
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-rose-200/40 dark:border-rose-900/40 space-y-2.5">
                <h5 className="font-bold text-xs uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Zona de Risco</span>
                </h5>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleDeactivate}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Desativar Temporariamente
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Eliminar Conta Permanentemente
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. CATEGORIA: PRIVACIDADE */}
          {activeCategory === 'privacy' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Conta Privada
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Apenas utilizadores aprovados podem ver as tuas publicações e Reels.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => handleTogglePrivacy(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Interações & Contacto
                </h5>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold block">Quem pode enviar-te mensagens</span>
                    <span className="text-[11px] text-slate-500">Controla mensagens diretas de desconhecidos</span>
                  </div>
                  <select
                    value={messagePrivacy}
                    onChange={(e: any) => setMessagePrivacy(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="everyone">Todos</option>
                    <option value="following">Apenas Pessoas que Segues</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="font-semibold block">Quem pode comentar as tuas publicações</span>
                    <span className="text-[11px] text-slate-500">Filtro de comentários e interação</span>
                  </div>
                  <select
                    value={commentPrivacy}
                    onChange={(e: any) => setCommentPrivacy(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="everyone">Todos</option>
                    <option value="following">Apenas Pessoas que Segues</option>
                  </select>
                </div>
              </div>

              {/* Device & Personal Data Permissions */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>Permissões do Dispositivo & Privacidade</span>
                  </h5>
                  <button
                    type="button"
                    onClick={handleResetPermissions}
                    className="text-[11px] text-rose-500 hover:underline"
                  >
                    Repor Permissões
                  </button>
                </div>

                <div className="space-y-2.5">
                  {/* Photos / Media Permission */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Image className="w-4 h-4 text-blue-500" />
                      <div>
                        <span className="font-semibold block">Acesso a Fotografias e Ficheiros</span>
                        <span className="text-[10px] text-slate-400">
                          {photosPermissionGranted
                            ? 'Permissão concedida para upload de fotos e vídeos'
                            : 'Acesso restrito (será solicitada permissão antes de abrir a galeria)'}
                        </span>
                      </div>
                    </div>
                    {photosPermissionGranted ? (
                      <button
                        type="button"
                        onClick={handleRevokePhotos}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                      >
                        Revogar
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        Não autorizada
                      </span>
                    )}
                  </div>

                  {/* Geolocation Permission */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <div>
                        <span className="font-semibold block">Acesso à Localização Geográfica</span>
                        <span className="text-[10px] text-slate-400">
                          {locationPermissionGranted
                            ? 'Permissão concedida para identificação de cidade nas publicações'
                            : 'Acesso restrito (será solicitada autorização antes da partilha)'}
                        </span>
                      </div>
                    </div>
                    {locationPermissionGranted ? (
                      <button
                        type="button"
                        onClick={handleRevokeLocation}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                      >
                        Revogar
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        Não autorizada
                      </span>
                    )}
                  </div>

                  {/* Image Cache Cleaner */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5">
                      <RefreshCw className="w-4 h-4 text-purple-500" />
                      <div>
                        <span className="font-semibold block">Cache de Imagens do Dispositivo</span>
                        <span className="text-[10px] text-slate-400">
                          Armazenamento local para carregamento instantâneo de fotos e avatares
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearCache}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                    >
                      Limpar Cache
                    </button>
                  </div>
                </div>
              </div>

              {/* Blocked Users */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <UserX className="w-4 h-4 text-rose-500" />
                  <span>Utilizadores Bloqueados ({blockedUsersList.length})</span>
                </h5>

                {blockedUsersList.length === 0 ? (
                  <p className="text-xs text-slate-400">Nenhum utilizador bloqueado de momento.</p>
                ) : (
                  <div className="space-y-2">
                    {blockedUsersList.map((bu) => (
                      <div key={bu.id} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <img src={bu.avatar} alt={bu.name} className="w-7 h-7 rounded-full object-cover" />
                          <span className="text-xs font-semibold">@{bu.username}</span>
                        </div>
                        <span className="text-[10px] text-rose-500 font-bold uppercase">Bloqueado</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. CATEGORIA: SEGURANÇA */}
          {activeCategory === 'security' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                      Dispositivos com Sessão Iniciada ({sessions.length})
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Deteção exata de hardware, modelo e sistema operativo
                    </p>
                  </div>
                  {sessions.length > 1 && (
                    <button
                      onClick={handleTerminateOtherSessions}
                      className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline cursor-pointer"
                    >
                      Terminar Outras Sessões
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {sessions.map((s) => {
                    const DeviceIcon =
                      s.deviceType === 'desktop'
                        ? Laptop
                        : s.deviceType === 'tablet'
                        ? Tablet
                        : Smartphone;

                    return (
                      <div
                        key={s.id}
                        className={`p-3 rounded-2xl border transition-all text-xs ${
                          s.isCurrent
                            ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                              <DeviceIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {s.deviceName}
                                </span>
                                {s.isCurrent && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    Este dispositivo (Sessão Atual)
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                {s.os} · {s.browser} · {s.resolution}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                Fuso horário: {s.timeZone} · {s.lastActive}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold shrink-0">
                            Ativo
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-bold text-xs">Proteção de Sessão Ativa</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  A sua sessão está assinada criptograficamente através de tokens JWT emitidos pelo Firebase Authentication com transmissão segura TLS 1.3.
                </p>
              </div>
            </div>
          )}

          {/* 4. CATEGORIA: APARÊNCIA & IDIOMA */}
          {activeCategory === 'appearance' && (
            <div className="space-y-5">
              {/* Theme Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs block">Tema da Aplicação</span>
                    <span className="text-[11px] text-slate-500">
                      {theme === 'dark' ? 'Modo Escuro Ativo' : 'Modo Claro Ativo'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-blue-500 transition-colors cursor-pointer"
                >
                  {theme === 'dark' ? 'Mudar para Claro' : 'Mudar para Escuro'}
                </button>
              </div>

              {/* Language Selection */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">Idioma Global</span>
                    <span className="text-[11px] text-slate-500">
                      Ativo: {currentLangObj.nativeName} ({currentLangObj.name})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenLanguageSelector}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                >
                  <span>Alterar Idioma</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 5. CATEGORIA: NOTIFICAÇÕES */}
          {activeCategory === 'notifications' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold block">Gostos e Reações</span>
                    <span className="text-[11px] text-slate-500">Quando alguém gostar de uma publicação ou reel</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyLikes}
                    onChange={(e) => setNotifyLikes(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-xs font-semibold block">Comentários e Respostas</span>
                    <span className="text-[11px] text-slate-500">Quando alguém comentar nas tuas partilhas</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyComments}
                    onChange={(e) => setNotifyComments(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-xs font-semibold block">Mensagens Diretas</span>
                    <span className="text-[11px] text-slate-500">Alertas instantâneos de novas mensagens de chat</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyMessages}
                    onChange={(e) => setNotifyMessages(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-xs font-semibold block">Chamadas de Voz e Vídeo</span>
                    <span className="text-[11px] text-slate-500">Receber notificações de chamadas em tempo real</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyCalls}
                    onChange={(e) => setNotifyCalls(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={logout}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Terminar Sessão
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm cursor-pointer"
            >
              Concluir
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
