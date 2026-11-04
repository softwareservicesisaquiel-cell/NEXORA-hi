import React from 'react';
import {
  HelpCircle,
  BookOpen,
  Image,
  Film,
  MessageSquare,
  Phone,
  Wrench,
  Shield,
  AlertOctagon,
  Flag,
  Ban,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export type ProcedureArticleId =
  | 'como_utilizar'
  | 'como_publicar'
  | 'como_criar_stories_reels'
  | 'como_enviar_mensagens'
  | 'como_realizar_chamadas'
  | 'como_utilizar_ferramentas'
  | 'regras_comunidade'
  | 'conteudos_proibidos'
  | 'denuncias'
  | 'restricoes_penalizacoes';

interface ProceduresSectionProps {
  currentArticle: ProcedureArticleId | null;
  onSelectArticle: (article: ProcedureArticleId | null) => void;
}

export const ProceduresSection: React.FC<ProceduresSectionProps> = ({
  currentArticle,
  onSelectArticle,
}) => {
  const articles: {
    id: ProcedureArticleId;
    title: string;
    summary: string;
    icon: React.ComponentType<{ className?: string }>;
    category: 'utilizacao' | 'regras';
    content: {
      intro: string;
      steps?: { title: string; desc: string }[];
      bulletPoints?: string[];
      notes?: string;
    };
  }[] = [
    {
      id: 'como_utilizar',
      title: 'Como utilizar a Nexora',
      summary: 'Visão geral da plataforma, fluxo de navegação, feed social e perfil pessoal.',
      icon: BookOpen,
      category: 'utilizacao',
      content: {
        intro:
          'A Nexora foi desenvolvida com base numa arquitetura limpa e orientada à conexão humana autêntica. A plataforma divide-se em duas experiências independentes: a Área Social (para interação, publicações e multimédia) e a Área de Gestão e Informação (para parâmetros da conta, regras e documentação institucional).',
        steps: [
          {
            title: '1. Navegação Principal',
            desc: 'Utilize a barra inferior no smartphone ou a barra superior no computador para transitar entre Início (Feed), Explorar, Reels (Vídeos Verticais), Mensagens e o seu Perfil.',
          },
          {
            title: '2. Feed Dinâmico',
            desc: 'O feed apresenta conteúdos de criadores recomendados e membros que segue. Pode filtrar rapidamente entre Recomendados, A Seguir e Mais Recentes.',
          },
          {
            title: '3. Acesso à Gestão',
            desc: 'Aceda à Área de Gestão e Informação a qualquer momento através do seu perfil ou do menu lateral para ajustar definições, ferramentas ou consultar regras.',
          },
        ],
        notes:
          'Dica: Adicione a Nexora ao ecrã inicial do seu telemóvel através do Hub de Instalação para uma experiência nativa de ecrã inteiro.',
      },
    },
    {
      id: 'como_publicar',
      title: 'Como publicar fotos e vídeos',
      summary: 'Passo a passo para partilhar fotografias, carrosséis, legendas e enquetes.',
      icon: Image,
      category: 'utilizacao',
      content: {
        intro:
          'Criar uma publicação no feed da Nexora é simples e suporta fotografias em alta resolução, carrosséis de imagens, legendas expressivas, etiquetas e enquetes interativas.',
        steps: [
          {
            title: '1. Iniciar Criação',
            desc: 'Prima o botão "+" no feed ou na barra de ferramentas e selecione "Criar Publicação".',
          },
          {
            title: '2. Selecionar Multimédia',
            desc: 'Escolha uma ou mais imagens do seu dispositivo ou utilize a câmara nativa. Pode aplicar filtros cinemáticos como Vivid ou Golden.',
          },
          {
            title: '3. Legenda e Enquetes',
            desc: 'Escreva a descrição do seu momento, adicione hashtags temáticas e, se desejar, ative uma enquete com opções para a comunidade votar.',
          },
          {
            title: '4. Definir Audiência e Publicar',
            desc: 'Defina se o post será Público, Apenas Seguidores ou Amigos Próximos e confirme a publicação.',
          },
        ],
      },
    },
    {
      id: 'como_criar_stories_reels',
      title: 'Como criar histórias e reels',
      summary: 'Diferenças entre momentos de 24 horas e vídeos verticais imersivos 9:16.',
      icon: Film,
      category: 'utilizacao',
      content: {
        intro:
          'A Nexora disponibiliza dois formatos dinâmicos de vídeo e imagem rápida: Histórias (Stories) que expiram ao fim de 24 horas e Reels (Clips) que permanecem no seu catálogo de vídeos.',
        steps: [
          {
            title: 'Histórias (Stories de 24h)',
            desc: 'Prima "A sua história" no topo do feed. Capture com a câmara ou selecione uma imagem. Adicione texto com gradientes coloridos e publique. Os seus seguidores verão o anel gradiente ao redor da sua foto.',
          },
          {
            title: 'Reels e Vídeos Curtos',
            desc: 'Aceda à aba Reels ou abra o criador de Reels. Carregue vídeos no formato vertical 9:16, adicione uma trilha sonora da biblioteca musical e publique para ser descoberto na aba Explorar.',
          },
        ],
      },
    },
    {
      id: 'como_enviar_mensagens',
      title: 'Como enviar mensagens privadas',
      summary: 'Comunicação direta, conversas de grupo e organização em abas.',
      icon: MessageSquare,
      category: 'utilizacao',
      content: {
        intro:
          'O sistema de mensagens diretas da Nexora foi desenhado para manter as suas conversas focadas e protegidas contra contactos indesejados através de três abas inteligentes.',
        steps: [
          {
            title: 'Aba Principal',
            desc: 'Conversas ativas com os seus amigos e contactos frequentes.',
          },
          {
            title: 'Aba Geral',
            desc: 'Conversas de grupos, projetos e contactos profissionais.',
          },
          {
            title: 'Aba Pedidos',
            desc: 'Mensagens enviadas por utilizadores que ainda não segue. Pode aceitar a solicitação para mover para a caixa principal ou eliminar sem notificar o remetente.',
          },
        ],
        notes:
          'Pode enviar mensagens de texto, imagens, notas de voz e reagir com emojis instantâneos tocando duas vezes em qualquer balão.',
      },
    },
    {
      id: 'como_realizar_chamadas',
      title: 'Como realizar chamadas de áudio e vídeo',
      summary: 'Ligações WebRTC ponto a ponto de alta fidelidade e encriptadas.',
      icon: Phone,
      category: 'utilizacao',
      content: {
        intro:
          'As chamadas da Nexora utilizam o protocolo WebRTC, permitindo transmissões de áudio e vídeo fluidas de baixa latência e ligação direta ponto a ponto entre os utilizadores.',
        steps: [
          {
            title: '1. Iniciar Chamada',
            desc: 'Abra a conversa com o membro pretendido na aba de Mensagens.',
          },
          {
            title: '2. Escolher Áudio ou Vídeo',
            desc: 'Prima o ícone do telefone para chamada de voz ou o ícone da câmara de filmar para chamada com vídeo HD.',
          },
          {
            title: '3. Controlos durante a ligação',
            desc: 'Pode silenciar o microfone, desligar a câmara ou alternar entre câmaras durante a chamada com um único toque.',
          },
        ],
        notes:
          'Certifique-se de que autorizou o acesso ao microfone e câmara quando solicitado pelo navegador ou aplicação.',
      },
    },
    {
      id: 'como_utilizar_ferramentas',
      title: 'Como utilizar as ferramentas da Nexora',
      summary: 'Guia para a biblioteca de utilitários, câmara, áudio e limpeza de dados.',
      icon: Wrench,
      category: 'utilizacao',
      content: {
        intro:
          'A Biblioteca Centralizada de Ferramentas concentra todos os utilitários da plataforma num catálogo navegável para que nunca perca tempo à procura de recursos.',
        bulletPoints: [
          'Criação: Use a Câmara Integrada para alternar rapidamente entre Story, Reel, Post e Live.',
          'Música: Explore a Biblioteca Musical para encontrar faixas antes de publicar clips.',
          'Destaques: No seu perfil, agrupe as suas melhores histórias em destaques permanentes.',
          'Otimização: Utilize a ferramenta Limpeza de Cache para manter a aplicação rápida e leve no dispositivo.',
          'Instalação: Aceda ao Hub de Instalação para configurar o atalho PWA nativo.',
        ],
      },
    },
    {
      id: 'regras_comunidade',
      title: 'Regras da Comunidade Nexora',
      summary: 'Normas de convivência, autenticidade, respeito mútuo e integridade.',
      icon: Shield,
      category: 'regras',
      content: {
        intro:
          'A Nexora é construída sob o princípio fundamental do respeito e da transparência. Para assegurar um ambiente seguro e agradável para todos os membros, exigimos o cumprimento integral das seguintes normas:',
        bulletPoints: [
          'Autenticidade e Identidade: Seja você mesmo. Não crie perfis falsos nem assuma a identidade de terceiros sem autorização.',
          'Respeito Mútuo: Trate outros membros com cortesia. Não é tolerado assédio, intimidação, difamação ou ataques pessoais.',
          'Direitos de Autor: Publique apenas conteúdos dos quais possua os direitos de autor ou autorização de uso.',
          'Privacidade de Terceiros: Não divulgue dados pessoais, números de telefone ou imagens íntimas de outras pessoas sem consentimento prévio por escrito.',
        ],
      },
    },
    {
      id: 'conteudos_proibidos',
      title: 'Conteúdos Proibidos',
      summary: 'Material expressamente vedado na rede social sob pena de eliminação imediata.',
      icon: AlertOctagon,
      category: 'regras',
      content: {
        intro:
          'A tolerância para com as seguintes categorias de conteúdo é estritamente zero na plataforma Nexora:',
        bulletPoints: [
          'Discurso de ódio, discriminação racial, religiosa, de género, etnia ou orientação sexual.',
          'Nudez não consentida, exploração sexual de menores ou conteúdos de violência explícita.',
          'Incentivo à automutilação, suicídio ou práticas perigosas à integridade física.',
          'Venda ilegal de substâncias controladas, armas ou esquemas fraudulentos de enriquecimento.',
          'Spam massivo, automação não autorizada e manipulação artificial de métricas.',
        ],
      },
    },
    {
      id: 'denuncias',
      title: 'Como fazer denúncias',
      summary: 'Processo de sinalização de publicações abusivas e proteção da comunidade.',
      icon: Flag,
      category: 'regras',
      content: {
        intro:
          'Se encontrar uma publicação, comentário, mensagem ou perfil que infrinja as regras da Nexora, pode e deve sinalizar imediatamente para a nossa equipa de moderação.',
        steps: [
          {
            title: '1. Abrir Menu da Publicação',
            desc: 'Toque nos três pontos no canto superior direito do post ou perfil em causa.',
          },
          {
            title: '2. Selecionar "Denunciar"',
            desc: 'Indique a categoria da infração (Spam, Conteúdo Impróprio, Assédio ou Outro).',
          },
          {
            title: '3. Análise Confidencial',
            desc: 'A denúncia é registada de forma totalmente confidencial. O utilizador denunciado não sabe quem efetuou a queixa.',
          },
        ],
        notes:
          'Pode também bloquear o utilizador imediatamente nas opções de Bloqueio da sua conta.',
      },
    },
    {
      id: 'restricoes_penalizacoes',
      title: 'Restrições e Penalizações',
      summary: 'Medidas disciplinares aplicadas a contas que violam as regras da plataforma.',
      icon: Ban,
      category: 'regras',
      content: {
        intro:
          'As violações das nossas diretrizes são tratadas com proporcionalidade, garantindo a integridade e segurança de todos os membros.',
        bulletPoints: [
          'Aviso Educativo: Para primeiras infrações de menor gravidade, é emitido um comunicado oficial pela conta @nexora.',
          'Restrição Temporária: Suspensão do direito de comentar, publicar ou iniciar chamadas durante 24 a 72 horas.',
          'Remoção de Conteúdo: Exclusão permanente da publicação ou história em falta.',
          'Suspensão Definitiva: Bloqueio permanente da conta e do identificador Nexora ID em casos de infrações graves ou reincidentes.',
        ],
        notes:
          'Utilizadores suspensos podem requerer recurso através do canal oficial de suporte oficial@nexora.app.',
      },
    },
  ];

  // If no article selected, show articles index
  if (!currentArticle) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Procedimentos de Utilização e Regras
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Central de ajuda organizada por artigos oficiais para orientar a sua experiência na Nexora.
          </p>
        </div>

        {/* Section 1: Utilização */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Manuais de Utilização (6 Artigos)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {articles
              .filter(a => a.category === 'utilizacao')
              .map(art => {
                const Icon = art.icon;
                return (
                  <button
                    key={art.id}
                    onClick={() => onSelectArticle(art.id)}
                    className="w-full text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/50 hover:shadow-md transition-all group cursor-pointer flex items-start gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {art.title}
                        </h4>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {art.summary}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Section 2: Regras e Diretrizes */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Regras, Segurança e Denúncias (4 Artigos)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {articles
              .filter(a => a.category === 'regras')
              .map(art => {
                const Icon = art.icon;
                return (
                  <button
                    key={art.id}
                    onClick={() => onSelectArticle(art.id)}
                    className="w-full text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-rose-500/50 hover:shadow-md transition-all group cursor-pointer flex items-start gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {art.title}
                        </h4>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {art.summary}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    );
  }

  // Render specific article view
  const activeArt = articles.find(a => a.id === currentArticle) || articles[0];
  const Icon = activeArt.icon;

  return (
    <div className="space-y-6">
      {/* Return Button */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => onSelectArticle(null)}
          className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          ← Voltar à Central de Artigos
        </button>
        <span className="text-xs text-slate-400 font-mono">
          Artigo: {activeArt.id}
        </span>
      </div>

      {/* Article Detail Card */}
      <article className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {activeArt.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Documentação Oficial Nexora · Atualizado em 2026
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {activeArt.content.intro}
        </p>

        {/* Steps if available */}
        {activeArt.content.steps && (
          <div className="space-y-3 pt-2">
            {activeArt.content.steps.map((st, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-1"
              >
                <h5 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>{st.title}</span>
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Bullet points if available */}
        {activeArt.content.bulletPoints && (
          <div className="space-y-2.5 pt-2">
            {activeArt.content.bulletPoints.map((pt, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        )}

        {/* Notes callout */}
        {activeArt.content.notes && (
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
              {activeArt.content.notes}
            </p>
          </div>
        )}
      </article>
    </div>
  );
};
