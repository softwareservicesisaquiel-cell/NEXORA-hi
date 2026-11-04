import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Settings,
  Wrench,
  BookOpen,
  Shield,
  Info,
  ArrowLeft,
  ChevronRight,
  Sliders,
  Sparkles,
  X,
  Smartphone,
  Globe2,
  Lock,
  Camera,
  MessageSquare,
  FileText,
  User,
  Heart,
  HelpCircle,
} from 'lucide-react';
import { SettingsSection, SettingsSubPage } from './SettingsSection';
import { ToolsSection, ToolCategory } from './ToolsSection';
import { ProceduresSection, ProcedureArticleId } from './ProceduresSection';
import { PoliciesSection, PolicyPageId } from './PoliciesSection';
import { AboutSection } from './AboutSection';
import { CameraMode } from '../CameraModal';

export type ManagementSectionId =
  | 'settings'
  | 'tools'
  | 'procedures'
  | 'policies'
  | 'about';

interface ManagementHubProps {
  onReturnToSocial: () => void;
  onOpenCreatePost: () => void;
  onOpenCreateStory: () => void;
  onOpenCreateClip: () => void;
  onOpenCamera: (mode?: CameraMode) => void;
  onOpenInstallationHub: () => void;
  onOpenLanguageSelector: () => void;
  onOpenAdminDashboard: () => void;
  initialSection?: ManagementSectionId;
}

export const ManagementHub: React.FC<ManagementHubProps> = ({
  onReturnToSocial,
  onOpenCreatePost,
  onOpenCreateStory,
  onOpenCreateClip,
  onOpenCamera,
  onOpenInstallationHub,
  onOpenLanguageSelector,
  onOpenAdminDashboard,
  initialSection = 'settings',
}) => {
  const { currentUser, setActiveTab, t } = useApp();

  // Active section (Configurações, Ferramentas, Procedimentos, Políticas, Sobre)
  const [activeSection, setActiveSection] = useState<ManagementSectionId>(initialSection);

  // Subpages states for each section
  const [settingsSubPage, setSettingsSubPage] = useState<SettingsSubPage | null>(null);
  const [toolCategory, setToolCategory] = useState<ToolCategory | null>(null);
  const [procedureArticle, setProcedureArticle] = useState<ProcedureArticleId | null>(null);
  const [policyPage, setPolicyPage] = useState<PolicyPageId | null>(null);

  // Global Search bar state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Search Index covering all 6 sections
  const searchableItems = useMemo(() => [
    // Settings (12)
    { id: 'conta', title: 'Conta e Identidade', section: 'settings' as const, subPage: 'conta' as const, keywords: 'nome username email nexora id identificador' },
    { id: 'informacoes_pessoais', title: 'Informações Pessoais', section: 'settings' as const, subPage: 'informacoes_pessoais' as const, keywords: 'bio biografia profissao website cidade localizacao' },
    { id: 'seguranca', title: 'Segurança e Acesso', section: 'settings' as const, subPage: 'seguranca' as const, keywords: 'palavra-passe password 2fa autenticacao dois fatores recuperacao' },
    { id: 'privacidade', title: 'Privacidade e Visibilidade', section: 'settings' as const, subPage: 'privacidade' as const, keywords: 'conta privada mensagens comentarios quem pode ver' },
    { id: 'notificacoes', title: 'Notificações e Alertas', section: 'settings' as const, subPage: 'notificacoes' as const, keywords: 'gostos curtidas comentarios alertas push mensagens chamadas' },
    { id: 'aparencia', title: 'Aparência e Temas', section: 'settings' as const, subPage: 'aparencia' as const, keywords: 'tema modo escuro claro cores densidade' },
    { id: 'idioma', title: 'Idioma da Plataforma', section: 'settings' as const, subPage: 'idioma' as const, keywords: 'lingua portugues ingles espanhol traducoes 40 idiomas' },
    { id: 'acessibilidade', title: 'Acessibilidade', section: 'settings' as const, subPage: 'acessibilidade' as const, keywords: 'tamanho texto fonte alto contraste reducao movimento animacoes' },
    { id: 'dispositivos', title: 'Dispositivos Conectados', section: 'settings' as const, subPage: 'dispositivos' as const, keywords: 'hardware telemovel computador sessoes ativas terminar logout remoto' },
    { id: 'bloqueios', title: 'Bloqueios e Restrições', section: 'settings' as const, subPage: 'bloqueios' as const, keywords: 'utilizadores bloqueados bloquear desbloquear contas restritas' },
    { id: 'gestao_conta', title: 'Gestão da Conta e Dados', section: 'settings' as const, subPage: 'gestao_conta' as const, keywords: 'exportar json descarregar backup limpar cache imagens pwa instalacao' },
    { id: 'desativacao_eliminacao', title: 'Desativação e Eliminação', section: 'settings' as const, subPage: 'desativacao_eliminacao' as const, keywords: 'apagar conta desativar excluir permanente eliminar' },

    // Tools (7)
    { id: 'criacao', title: 'Criação de Conteúdos', section: 'tools' as const, category: 'criacao' as const, keywords: 'camara criar post publicacao stories historias reels clips verticais' },
    { id: 'edicao', title: 'Edição de Fotos e Vídeos', section: 'tools' as const, category: 'edicao' as const, keywords: 'filtros cinematicos vivid preto e branco golden corte 9:16 proporcao' },
    { id: 'musica', title: 'Biblioteca Musical', section: 'tools' as const, category: 'musica' as const, keywords: 'musica trilha sonora audio faixas som reel audio original' },
    { id: 'comunicacao', title: 'Ferramentas de Comunicação', section: 'tools' as const, category: 'comunicacao' as const, keywords: 'mensagens diretas chat abas principal geral pedidos chamadas voz video webrtc' },
    { id: 'publicacao', title: 'Ferramentas de Publicação', section: 'tools' as const, category: 'publicacao' as const, keywords: 'audiencia amigos proximos enquetes votacoes momentos efemeros 24h' },
    { id: 'criadores', title: 'Ferramentas para Criadores', section: 'tools' as const, category: 'criadores' as const, keywords: 'live transmissao ao vivo direto destaques highlights perfil permissoes' },
    { id: 'outras_ferramentas', title: 'Outras Ferramentas e Utilitários', section: 'tools' as const, category: 'outras' as const, keywords: 'instalacao pwa cache limpeza idiomas painel admin comunicados' },

    // Procedures / Regras (10)
    { id: 'como_utilizar', title: 'Como utilizar a Nexora', section: 'procedures' as const, article: 'como_utilizar' as const, keywords: 'guia manual navegacao feed social perfil' },
    { id: 'como_publicar', title: 'Como publicar fotos e vídeos', section: 'procedures' as const, article: 'como_publicar' as const, keywords: 'passo a passo carrossel legenda hashtags enquete post' },
    { id: 'como_criar_stories_reels', title: 'Como criar histórias e reels', section: 'procedures' as const, article: 'como_criar_stories_reels' as const, keywords: 'stories historias 24h duracao reels clips verticais musica' },
    { id: 'como_enviar_mensagens', title: 'Como enviar mensagens privadas', section: 'procedures' as const, article: 'como_enviar_mensagens' as const, keywords: 'chat direto principal geral pedidos solicitacoes mensagens voz' },
    { id: 'como_realizar_chamadas', title: 'Como realizar chamadas de áudio e vídeo', section: 'procedures' as const, article: 'como_realizar_chamadas' as const, keywords: 'ligacoes telefonicas videochamadas webrtc p2p alta definicao' },
    { id: 'como_utilizar_ferramentas', title: 'Como utilizar as ferramentas da Nexora', section: 'procedures' as const, article: 'como_utilizar_ferramentas' as const, keywords: 'biblioteca ferramentas filtros destaques optimizacao' },
    { id: 'regras_comunidade', title: 'Regras da Comunidade Nexora', section: 'procedures' as const, article: 'regras_comunidade' as const, keywords: 'normas convivencia respeito autenticidade seguranca' },
    { id: 'conteudos_proibidos', title: 'Conteúdos Proibidos', section: 'procedures' as const, article: 'conteudos_proibidos' as const, keywords: 'proibido odio violencia nudez spam fraude armas' },
    { id: 'denuncias', title: 'Como fazer denúncias', section: 'procedures' as const, article: 'denuncias' as const, keywords: 'denunciar reporte queixa abuso sinalizacao violacao' },
    { id: 'restricoes_penalizacoes', title: 'Restrições e Penalizações', section: 'procedures' as const, article: 'restricoes_penalizacoes' as const, keywords: 'avisos suspensoes penalizacoes bloqueio de conta recurso' },

    // Policies (9)
    { id: 'privacidade_policy', title: 'Política de Privacidade', section: 'policies' as const, page: 'privacidade' as const, keywords: 'privacidade tratamento dados perfil criptografia sigilo' },
    { id: 'termos_policy', title: 'Termos de Utilização', section: 'policies' as const, page: 'termos' as const, keywords: 'termos condicoes contrato direitos autor responsabilidades' },
    { id: 'protecao_dados_policy', title: 'Proteção de Dados Pessoais', section: 'policies' as const, page: 'protecao_dados' as const, keywords: 'rgpd lgpd conformidade criptografia tls aes dados minimizacao' },
    { id: 'recolha_info_policy', title: 'Recolha de Informações', section: 'policies' as const, page: 'recolha_info' as const, keywords: 'dados registados dispositivo geolocalizacao ficheiros logs' },
    { id: 'partilha_dados_policy', title: 'Partilha e Transferência de Dados', section: 'policies' as const, page: 'partilha_dados' as const, keywords: 'nao vendemos dados sem terceiros cloud firebase infraestrutura' },
    { id: 'seguranca_policy', title: 'Práticas de Segurança da Informação', section: 'policies' as const, page: 'seguranca' as const, keywords: 'regras firestore tokens jwt dtls srtp webrtc' },
    { id: 'direitos_utilizadores_policy', title: 'Direitos dos Utilizadores', section: 'policies' as const, page: 'direitos_utilizadores' as const, keywords: 'acesso portabilidade retificacao oposicao dados direitos' },
    { id: 'gestao_consentimentos_policy', title: 'Gestão de Consentimentos', section: 'policies' as const, page: 'gestao_consentimentos' as const, keywords: 'cookies cache telemetria permissoes locais' },
    { id: 'eliminacao_dados_policy', title: 'Eliminação e Esquecimento de Dados', section: 'policies' as const, page: 'eliminacao_dados' as const, keywords: 'direito ao esquecimento apagar conta destruicao permanente' },

    // About (1)
    { id: 'sobre_nexora', title: 'Sobre a Nexora (Apresentação, História, Missão e Contactos)', section: 'about' as const, keywords: 'sobre institucional historia missao visao valores versao v2.4.0 contacto oficial@nexora.app copyright' },
  ], []);

  // Filter search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return searchableItems.filter(item =>
      item.title.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q)
    );
  }, [searchQuery, searchableItems]);

  const handleSelectSearchResult = (result: (typeof searchableItems)[0]) => {
    setActiveSection(result.section);
    if (result.section === 'settings') {
      setSettingsSubPage((result as any).subPage || null);
    } else if (result.section === 'tools') {
      setToolCategory((result as any).category || null);
    } else if (result.section === 'procedures') {
      setProcedureArticle((result as any).article || null);
    } else if (result.section === 'policies') {
      setPolicyPage((result as any).page || null);
    }
    setSearchQuery('');
    setIsSearchActive(false);
  };

  const handleReturnToSocialTab = (tab: 'feed' | 'clips' | 'messages' | 'explore' | 'profile') => {
    setActiveTab(tab);
    onReturnToSocial();
  };

  // Main Section Navigation Definition
  const sectionsList: {
    id: ManagementSectionId;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'settings',
      title: 'Configurações',
      subtitle: '12 categorias da conta, segurança e preferências',
      icon: Settings,
    },
    {
      id: 'tools',
      title: 'Ferramentas da Nexora',
      subtitle: 'Biblioteca centralizada de criação, edição e sistema',
      icon: Wrench,
    },
    {
      id: 'procedures',
      title: 'Procedimentos e Regras',
      subtitle: 'Central de ajuda, guias de utilização e normas',
      icon: BookOpen,
    },
    {
      id: 'policies',
      title: 'Política e Privacidade',
      subtitle: '9 documentos regulamentares e proteção de dados',
      icon: Shield,
    },
    {
      id: 'about',
      title: 'Sobre a Nexora',
      subtitle: 'Apresentação institucional, missão e contactos oficiais',
      icon: Info,
    },
  ];

  // Breadcrumbs text helper
  const getBreadcrumb = () => {
    const sectionName = sectionsList.find(s => s.id === activeSection)?.title || 'Área de Gestão';
    let subName = '';

    if (activeSection === 'settings' && settingsSubPage) {
      subName = ` > ${settingsSubPage.replace('_', ' ')}`;
    } else if (activeSection === 'tools' && toolCategory) {
      subName = ` > ${toolCategory}`;
    } else if (activeSection === 'procedures' && procedureArticle) {
      subName = ` > ${procedureArticle.replace(/_/g, ' ')}`;
    } else if (activeSection === 'policies' && policyPage) {
      subName = ` > ${policyPage.replace(/_/g, ' ')}`;
    }

    return `Área de Gestão > ${sectionName}${subName}`;
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      
      {/* 1. TOP HEADER & BREADCRUMBS */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Top Row: Back to Social Button & Breadcrumb Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={onReturnToSocial}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Voltar à Área Social (Feed, Reels, Mensagens)"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Área Social</span>
            </button>

            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider block">
                Gestão e Informação Nexora
              </span>
              <div className="text-xs text-slate-500 truncate capitalize font-medium">
                {getBreadcrumb()}
              </div>
            </div>
          </div>

          {/* 2. BARRA DE PESQUISA (Search Bar Across All Management Content) */}
          <div className="relative w-full md:w-80">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchActive(true)}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Pesquisar em configurações, ferramentas, regras..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Resultados da Pesquisa ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    Nenhum resultado encontrado para &quot;{searchQuery}&quot;.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {searchResults.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectSearchResult(item)}
                        className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-mono mt-0.5">
                            Secção: {item.section}
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. SECTION SWITCHER TABS (Desktop & Mobile Scrollable) */}
        <div className="max-w-6xl mx-auto px-4 mt-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 pb-2">
            {sectionsList.map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id);
                    // Reset subpage states when clicking main section
                    if (sec.id === 'settings') setSettingsSubPage(null);
                    if (sec.id === 'tools') setToolCategory(null);
                    if (sec.id === 'procedures') setProcedureArticle(null);
                    if (sec.id === 'policies') setPolicyPage(null);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 4. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        
        {/* Section 1: CONFIGURAÇÕES */}
        {activeSection === 'settings' && (
          <SettingsSection
            currentSubPage={settingsSubPage}
            onSelectSubPage={setSettingsSubPage}
            onOpenLanguageSelector={onOpenLanguageSelector}
            onOpenInstallationHub={onOpenInstallationHub}
          />
        )}

        {/* Section 2: FERRAMENTAS DA NEXORA */}
        {activeSection === 'tools' && (
          <ToolsSection
            currentCategory={toolCategory}
            onSelectCategory={setToolCategory}
            onOpenCreatePost={onOpenCreatePost}
            onOpenCreateStory={onOpenCreateStory}
            onOpenCreateClip={onOpenCreateClip}
            onOpenCamera={onOpenCamera}
            onOpenInstallationHub={onOpenInstallationHub}
            onOpenLanguageSelector={onOpenLanguageSelector}
            onOpenAdminDashboard={onOpenAdminDashboard}
            onReturnToSocialTab={handleReturnToSocialTab}
          />
        )}

        {/* Section 3: PROCEDIMENTOS E REGRAS */}
        {activeSection === 'procedures' && (
          <ProceduresSection
            currentArticle={procedureArticle}
            onSelectArticle={setProcedureArticle}
          />
        )}

        {/* Section 4: POLÍTICA E PRIVACIDADE */}
        {activeSection === 'policies' && (
          <PoliciesSection
            currentPage={policyPage}
            onSelectPage={setPolicyPage}
          />
        )}

        {/* Section 5: SOBRE A NEXORA */}
        {activeSection === 'about' && <AboutSection />}

      </main>

      {/* Bottom return bar for smartphones */}
      <div className="md:hidden sticky bottom-0 left-0 right-0 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-between z-30">
        <button
          onClick={onReturnToSocial}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à Área Social (Feed & Mensagens)</span>
        </button>
      </div>

    </div>
  );
};
