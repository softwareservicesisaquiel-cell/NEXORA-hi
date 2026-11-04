import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  db,
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  onSnapshot,
} from '../lib/firebase';
import {
  ShieldAlert,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Ban,
  X,
  RefreshCw,
  Search,
  Check,
} from 'lucide-react';
import { User, ReportItem } from '../types';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, isAdmin, addToast, sendOfficialUpdate, officialNexoraUser } = useApp();

  const [activeTab, setActiveTab] = useState<'stats' | 'reports' | 'users' | 'updates'>('stats');
  const [officialUpdateText, setOfficialUpdateText] = useState('');
  const [officialUpdateMediaUrl, setOfficialUpdateMediaUrl] = useState('');
  const [isSendingOfficialUpdate, setIsSendingOfficialUpdate] = useState(false);
  const [stats, setStats] = useState({
    usersCount: 0,
    postsCount: 0,
    storiesCount: 0,
    reelsCount: 0,
    reportsCount: 0,
  });
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !isAdmin) return;

    // Load statistics
    const loadStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const postsSnap = await getDocs(collection(db, 'posts'));
        const storiesSnap = await getDocs(collection(db, 'stories'));
        const reelsSnap = await getDocs(collection(db, 'reels'));
        const reportsSnap = await getDocs(collection(db, 'reports'));

        setStats({
          usersCount: usersSnap.size,
          postsCount: postsSnap.size,
          storiesCount: storiesSnap.size,
          reelsCount: reelsSnap.size,
          reportsCount: reportsSnap.size,
        });

        const usersData: User[] = usersSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            nexoraId: data.nexoraId || 'NX-000000',
            username: data.username || 'user',
            name: data.displayName || data.name || data.username,
            avatar: data.avatarUrl || data.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${data.username}`,
            bio: data.bio || '',
            followersCount: data.followersCount || 0,
            followingCount: data.followingCount || 0,
            postsCount: data.postsCount || 0,
            isPrivate: !!data.isPrivate,
            isSuspended: !!data.isSuspended,
            role: data.role || 'user',
            joinedDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Recente',
          };
        });
        setUserList(usersData);
      } catch (err) {
        console.error('Error fetching admin statistics:', err);
      }
    };

    loadStats();

    // Listen to real-time reports
    const qReports = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(qReports, (snap) => {
      const repList: ReportItem[] = snap.docs.map((d) => ({
        id: d.id,
        reporterId: d.data().reporterId,
        reporterUsername: d.data().reporterUsername,
        targetType: d.data().targetType,
        targetId: d.data().targetId,
        targetAuthorName: d.data().targetAuthorName,
        reason: d.data().reason,
        status: d.data().status || 'pending',
        createdAt: d.data().createdAt,
      }));
      setReports(repList);
    });

    return () => unsub();
  }, [isOpen, isAdmin]);

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Acesso Restrito</h2>
          <p className="text-xs text-slate-400 mb-5">
            O Painel de Administração do NEXORA requer privilégios de Administrador verificados no servidor.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const handleResolveReport = async (reportId: string) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), { status: 'resolved' });
      addToast('Denúncia marcada como resolvida.', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), { status: 'dismissed' });
      addToast('Denúncia arquivada/ignorada.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveReportedContent = async (report: ReportItem) => {
    try {
      if (report.targetType === 'post') {
        await deleteDoc(doc(db, 'posts', report.targetId));
      } else if (report.targetType === 'comment') {
        await deleteDoc(doc(db, 'comments', report.targetId));
      }
      await updateDoc(doc(db, 'reports', report.id), { status: 'resolved' });
      addToast('Conteúdo denunciado removido com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Erro ao remover conteúdo.', 'error');
    }
  };

  const handleToggleSuspendUser = async (user: User) => {
    try {
      const nextStatus = !user.isSuspended;
      await updateDoc(doc(db, 'users', user.id), { isSuspended: nextStatus });
      setUserList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isSuspended: nextStatus } : u))
      );
      addToast(
        nextStatus ? `Conta de @${user.username} suspensa.` : `Conta de @${user.username} reativada.`,
        nextStatus ? 'error' : 'success'
      );
    } catch (err) {
      console.error(err);
      addToast('Erro ao atualizar suspensão.', 'error');
    }
  };

  const filteredUsers = userList.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nexoraId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Painel Administrativo NEXORA
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono uppercase">
                  Admin Master
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gestão de estatísticas, utilizadores e moderação de conteúdos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-5 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'stats'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Estatísticas Gerais
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Denúncias & Moderação
            {reports.filter((r) => r.status === 'pending').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {reports.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Gestão de Utilizadores
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'updates'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Atualizações Oficiais</span>
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] flex items-center justify-center font-bold">✓</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: STATISTICS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
                    <Users className="w-4 h-4" />
                    Utilizadores Reais
                  </div>
                  <div className="text-2xl font-bold text-white">{stats.usersCount}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Registados no Firestore</p>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold mb-1">
                    <FileText className="w-4 h-4" />
                    Publicações no Feed
                  </div>
                  <div className="text-2xl font-bold text-white">{stats.postsCount}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Fotos, vídeos e textos</p>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
                    <RefreshCw className="w-4 h-4" />
                    Stories (24h)
                  </div>
                  <div className="text-2xl font-bold text-white">{stats.storiesCount}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Momentos temporários</p>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    Denúncias Registadas
                  </div>
                  <div className="text-2xl font-bold text-white">{stats.reportsCount}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Fila de moderação</p>
                </div>
              </div>

              <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-2">Políticas de Segurança NEXORA</h3>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>Todos os dados são persistidos de forma segura no Cloud Firestore.</li>
                  <li>Códigos de recuperação de palavra-passe são estritamente cifrados via SHA-256.</li>
                  <li>Contas privadas têm pedidos de aprovação obrigatórios antes do acesso às publicações.</li>
                  <li>Vídeos e stories expiram aos 24h cronologicamente do banco de dados.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Nenhuma denúncia registada no sistema. A comunidade está em conformidade.
                </div>
              ) : (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md">
                          {report.targetType}
                        </span>
                        <span className="text-xs text-slate-400">
                          Denunciado por: <strong className="text-white">@{report.reporterUsername || 'anónimo'}</strong>
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          report.status === 'resolved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : report.status === 'dismissed'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white mt-1">
                        Motivo: "{report.reason}"
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        Target ID: {report.targetId} • {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRemoveReportedContent(report)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remover Conteúdo
                          </button>
                          <button
                            onClick={() => handleResolveReport(report.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Resolver
                          </button>
                          <button
                            onClick={() => handleDismissReport(report.id)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                          >
                            Arquivar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: USERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por username, nome ou NEXORA ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-white truncate">{u.name}</span>
                          <span className="text-[11px] text-cyan-400 font-mono">@{u.username}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                            {u.nexoraId}
                          </span>
                          {u.role === 'admin' && (
                            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold uppercase">
                              Admin
                            </span>
                          )}
                          {u.isSuspended && (
                            <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-bold uppercase">
                              Suspenso
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {u.followersCount} seguidores • {u.postsCount} publicações • Criada em {u.joinedDate}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSuspendUser(u)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          u.isSuspended
                            ? 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                            : 'bg-rose-600/20 text-rose-300 hover:bg-rose-600/30'
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{u.isSuspended ? 'Reativar' : 'Suspender'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL UPDATES BROADCAST */}
          {activeTab === 'updates' && (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border border-blue-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="/icon-192.png"
                      alt="NEXORA Oficial"
                      className="w-12 h-12 rounded-2xl object-cover shadow-lg border border-blue-400/40"
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-slate-900 shadow">
                      ✓
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-white">{officialNexoraUser?.name || 'NEXORA Oficial'}</h3>
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                        ✓
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>@{officialNexoraUser?.username || 'nexora'}</span>
                      <span>•</span>
                      <span className="text-blue-400 font-semibold">{officialNexoraUser?.nexoraId || 'NX-000001'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Canal Oficial de Transmissão
                  </span>
                </div>
              </div>

              {/* Compose Box */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Conteúdo da Atualização Oficial
                  </label>
                  <textarea
                    rows={4}
                    value={officialUpdateText}
                    onChange={(e) => setOfficialUpdateText(e.target.value)}
                    placeholder="Escreve aqui o anúncio, notas de versão ou comunicado para todos os utilizadores da NEXORA..."
                    className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    URL de Imagem / Banner (Opcional)
                  </label>
                  <input
                    type="url"
                    value={officialUpdateMediaUrl}
                    onChange={(e) => setOfficialUpdateMediaUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400">
                    A publicação será assinada com o perfil oficial e crachá de verificação azul.
                  </span>

                  <button
                    disabled={!officialUpdateText.trim() || isSendingOfficialUpdate}
                    onClick={async () => {
                      if (!officialUpdateText.trim()) return;
                      setIsSendingOfficialUpdate(true);
                      await sendOfficialUpdate(
                        officialUpdateText,
                        officialUpdateMediaUrl.trim() ? [officialUpdateMediaUrl.trim()] : []
                      );
                      setOfficialUpdateText('');
                      setOfficialUpdateMediaUrl('');
                      setIsSendingOfficialUpdate(false);
                      onClose();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{isSendingOfficialUpdate ? 'A enviar...' : 'Transmitir Atualização Oficial'}</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-white text-blue-600 text-[8px] flex items-center justify-center font-bold">✓</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
