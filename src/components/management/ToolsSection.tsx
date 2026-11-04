import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  Image,
  Film,
  PlusSquare,
  Music,
  MessageSquare,
  Phone,
  Video,
  Mic,
  Sliders,
  Sparkles,
  Radio,
  Bookmark,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  Globe2,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Layers,
  Wand2,
  Users,
  Eye,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { clearAllImageCache } from '../../utils/imageCache';
import { CameraMode } from '../CameraModal';

export type ToolCategory =
  | 'criacao'
  | 'edicao'
  | 'musica'
  | 'comunicacao'
  | 'publicacao'
  | 'criadores'
  | 'outras';

interface ToolsSectionProps {
  currentCategory: ToolCategory | null;
  onSelectCategory: (cat: ToolCategory | null) => void;
  onOpenCreatePost: () => void;
  onOpenCreateStory: () => void;
  onOpenCreateClip: () => void;
  onOpenCamera: (mode?: CameraMode) => void;
  onOpenInstallationHub: () => void;
  onOpenLanguageSelector: () => void;
  onOpenAdminDashboard: () => void;
  onReturnToSocialTab: (tab: 'feed' | 'clips' | 'messages' | 'explore' | 'profile') => void;
}

export const ToolsSection: React.FC<ToolsSectionProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenCreatePost,
  onOpenCreateStory,
  onOpenCreateClip,
  onOpenCamera,
  onOpenInstallationHub,
  onOpenLanguageSelector,
  onOpenAdminDashboard,
  onReturnToSocialTab,
}) => {
  const { isAdmin, addToast } = useApp();
  const [clearingCache, setClearingCache] = useState(false);

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await clearAllImageCache();
      addToast('Cache de imagens do dispositivo foi limpa com sucesso!', 'success');
    } catch {
      addToast('Erro ao limpar cache.', 'error');
    } finally {
      setClearingCache(false);
    }
  };

  // Tool categories metadata
  const categoriesList: {
    id: ToolCategory;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
  }[] = [
    {
      id: 'criacao',
      title: 'Criação de Conteúdos',
      description: 'Câmara integrada, criador de publicações, histórias e Reels verticais',
      icon: Camera,
      count: 4,
    },
    {
      id: 'edicao',
      title: 'Edição de Fotografias e Vídeos',
      description: 'Filtros visuais avançados, enquadramento 9:16 e ajustes gráficos',
      icon: Wand2,
      count: 3,
    },
    {
      id: 'musica',
      title: 'Biblioteca Musical',
      description: 'Pesquisa e seleção de faixas sonoras com pré-escuta para histórias e clips',
      icon: Music,
      count: 2,
    },
    {
      id: 'comunicacao',
      title: 'Ferramentas de Comunicação',
      description: 'Mensagens em abas, chamadas de áudio e vídeo WebRTC P2P e notas de voz',
      icon: MessageSquare,
      count: 4,
    },
    {
      id: 'publicacao',
      title: 'Ferramentas de Publicação',
      description: 'Seletor de audiência, enquetes interativas e publicações de 24 horas',
      icon: PlusSquare,
      count: 3,
    },
    {
      id: 'criadores',
      title: 'Ferramentas para Criadores',
      description: 'Transmissão Ao Vivo (Live Room), destaques no perfil e gestão de permissões',
      icon: Radio,
      count: 3,
    },
    {
      id: 'outras',
      title: 'Outras Ferramentas Disponíveis',
      description: 'Hub de instalação PWA, limpeza de cache, idiomas e painel administrativo',
      icon: Layers,
      count: isAdmin ? 5 : 4,
    },
  ];

  // If no category is selected, render categories overview grid
  if (!currentCategory) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Biblioteca de Ferramentas da Nexora
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Aceda centralizadamente a todas as ferramentas operacionais de criação, comunicação, edição e sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoriesList.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="w-full text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/50 hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between min-h-[120px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {cat.count} ferramentas
                  </span>
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

  return (
    <div className="space-y-6">
      {/* Subpage Header with Return */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => onSelectCategory(null)}
          className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          ← Voltar à Biblioteca de Ferramentas
        </button>
        <span className="text-xs text-slate-400 font-mono uppercase">
          Categoria: {currentCategory}
        </span>
      </div>

      {/* 1. CRIAÇÃO DE CONTEÚDOS */}
      {currentCategory === 'criacao' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Ferramentas de Criação de Conteúdos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instrumentos para capturar, formatar e partilhar conteúdos originais no ecossistema Nexora.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Camera */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <Camera className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Câmara Integrada Nexora
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Captura direta em alta definição com modos dedicados para História, Reel, Publicação e Transmissão Ao Vivo.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => onOpenCamera('STORY')}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  Abrir Câmara
                </button>
              </div>
            </div>

            {/* Post Creator */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <PlusSquare className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Criador de Publicações
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Publicação de fotos, vídeos com suporte a carrossel multimédia, descrições ricas, hashtags e audiência.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={onOpenCreatePost}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  Criar Publicação
                </button>
              </div>
            </div>

            {/* Stories Creator */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <Image className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Criador de Histórias (24h)
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Partilha momentos espontâneos com anéis visuais de gradiente, expiração automática e controlo de quem viu.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={onOpenCreateStory}
                  className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  Criar História
                </button>
              </div>
            </div>

            {/* Reels / Clips */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                  <Film className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Criador de Reels Verticais
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Vídeos verticais de alta imersão proporção 9:16 com reprodução em fluxo contínuo e sincronização musical.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={onOpenCreateClip}
                  className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  Criar Reel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIÇÃO DE FOTOGRAFIAS E VÍDEOS */}
      {currentCategory === 'edicao' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Edição de Fotografias e Vídeos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ferramentas de pós-processamento, estilo visual e composição gráfica integradas no fluxo da Nexora.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Filtros Cinemáticos</h4>
              <p className="text-xs text-slate-500">
                5 filtros profissionais integrados: Vivid, Preto e Branco, Golden Hour, Cyberpunk e Esmeralda.
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenCreatePost}
                  className="w-full py-2 px-3 rounded-xl border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 text-xs font-semibold hover:bg-cyan-500/10 transition-colors cursor-pointer"
                >
                  Aplicar num Post
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Film className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Enquadramento 9:16</h4>
              <p className="text-xs text-slate-500">
                Ajuste automático para ecrãs inteiros móveis com corte vertical sem distorção.
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenCreateClip}
                  className="w-full py-2 px-3 rounded-xl border border-blue-500/40 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-500/10 transition-colors cursor-pointer"
                >
                  Abrir nos Reels
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Wand2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Tipografia & Gradientes</h4>
              <p className="text-xs text-slate-500">
                Sobreposição tipográfica de texto com gradientes coloridos e contraste dinâmico.
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenCreateStory}
                  className="w-full py-2 px-3 rounded-xl border border-purple-500/40 text-purple-600 dark:text-purple-400 text-xs font-semibold hover:bg-purple-500/10 transition-colors cursor-pointer"
                >
                  Criar com Texto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BIBLIOTECA MUSICAL */}
      {currentCategory === 'musica' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Biblioteca Musical</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Catálogo de áudio e faixas sonoras disponíveis para sonorização de Histórias e Reels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Seletor de Bandas Sonoras
              </h4>
              <p className="text-xs text-slate-500">
                Navegação e pré-escuta de faixas com identificação de artista, tempo e metadados de reprodução.
              </p>
              <button
                onClick={onOpenCreateClip}
                className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Adicionar Música num Reel
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Áudio Original do Utilizador
              </h4>
              <p className="text-xs text-slate-500">
                Grave áudio original através do microfone durante a captura da câmara ou notas de voz.
              </p>
              <button
                onClick={() => onOpenCamera('REEL')}
                className="w-full py-2 px-3 rounded-xl border border-indigo-500/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-500/10 transition-colors cursor-pointer"
              >
                Gravar com Áudio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FERRAMENTAS DE COMUNICAÇÃO */}
      {currentCategory === 'comunicacao' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Ferramentas de Comunicação
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Protocolos de conversação privada, chamadas de áudio e vídeo e notas de voz.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Mensagens Diretas com Abas
              </h4>
              <p className="text-xs text-slate-500">
                Organização em 3 abas independentes: Principal (conversas habituais), Geral (mensagens informativas) e Pedidos (solicitações de novos membros).
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onReturnToSocialTab('messages')}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Abrir Mensagens Privadas
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Chamadas de Áudio WebRTC P2P
              </h4>
              <p className="text-xs text-slate-500">
                Ligações telefónicas cifradas de ponta a ponta sem intermediação de servidores externos.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onReturnToSocialTab('messages')}
                  className="w-full py-2 px-3 rounded-xl border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/10 transition-colors cursor-pointer"
                >
                  Ir para Chat para Chamar
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Chamadas de Vídeo HD P2P
              </h4>
              <p className="text-xs text-slate-500">
                Transmissão de câmara em tempo real com comutação de microfone e câmara frontal/traseira.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onReturnToSocialTab('messages')}
                  className="w-full py-2 px-3 rounded-xl border border-purple-500/40 text-purple-600 dark:text-purple-400 text-xs font-semibold hover:bg-purple-500/10 transition-colors cursor-pointer"
                >
                  Abrir Videochamada
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Notas de Voz
              </h4>
              <p className="text-xs text-slate-500">
                Gravação de mensagens de áudio com indicador de forma de onda e reprodução pausável.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onReturnToSocialTab('messages')}
                  className="w-full py-2 px-3 rounded-xl border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/10 transition-colors cursor-pointer"
                >
                  Gravar no Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. FERRAMENTAS DE PUBLICAÇÃO */}
      {currentCategory === 'publicacao' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Ferramentas de Publicação
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Controlos de audiência, interação por votações e momentos efêmeros.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Seletor de Audiência</h4>
              <p className="text-xs text-slate-500">
                Público, Apenas Seguidores ou Amigos Próximos configurável em cada publicação.
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenCreatePost}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Configurar no Post
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Enquetes e Votações</h4>
              <p className="text-xs text-slate-500">
                Criação de opções de resposta com cálculo percentual em tempo real nas publicações.
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenCreatePost}
                  className="w-full py-2 px-3 rounded-xl border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/10 transition-colors cursor-pointer"
                >
                  Criar Enquete
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Momentos Efêmeros</h4>
              <p className="text-xs text-slate-500">
                Partilha instantânea que desaparece após 24 horas mantendo o feed desimpedido.
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenCreateStory}
                  className="w-full py-2 px-3 rounded-xl border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/10 transition-colors cursor-pointer"
                >
                  Publicar Momento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. FERRAMENTAS PARA CRIADORES */}
      {currentCategory === 'criadores' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Ferramentas para Criadores
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Recursos de transmissão, fixação de destaques e gestão de permissões.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Transmissão Ao Vivo (Live Room)
              </h4>
              <p className="text-xs text-slate-500">
                Emissão em direto com contagem de espetadores e animação de corações flutuantes.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onOpenCamera('LIVE')}
                  className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Iniciar Emissão
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Bookmark className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Destaques no Perfil (Highlights)
              </h4>
              <p className="text-xs text-slate-500">
                Fixação permanente de histórias no topo do perfil com capas e títulos personalizados.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onReturnToSocialTab('profile')}
                  className="w-full py-2 px-3 rounded-xl border border-blue-500/40 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-500/10 transition-colors cursor-pointer"
                >
                  Gerir no Meu Perfil
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Gestor de Permissões
              </h4>
              <p className="text-xs text-slate-500">
                Estado dos acessos à câmara, microfone, fotos da galeria e localização do aparelho.
              </p>
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 py-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Hardware Integrado Conforme</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. OUTRAS FERRAMENTAS */}
      {currentCategory === 'outras' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Outras Ferramentas do Sistema
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Utilitários operacionais para o funcionamento, idioma e manutenção do cliente Nexora.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PWA Hub */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Hub de Instalação PWA
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Instalação nativa em Android (APK/WebAPK), iOS (Adicionar ao Ecrã Principal) e Windows/macOS.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={onOpenInstallationHub}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Abrir Hub de Instalação
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-3">
                  <Globe2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Seletor de 40+ Idiomas Globais
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Tradução completa da interface em português, inglês, espanhol, francês, japonês e outros.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={onOpenLanguageSelector}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Selecionar Idioma
                </button>
              </div>
            </div>

            {/* Clear image cache */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-3">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Otimizador & Limpeza de Cache
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Liberta armazenamento local removendo ficheiros temporários guardados pelo Service Worker.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleClearCache}
                  disabled={clearingCache}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${clearingCache ? 'animate-spin' : ''}`} />
                  <span>{clearingCache ? 'A limpar...' : 'Limpar Cache de Imagens'}</span>
                </button>
              </div>
            </div>

            {/* Admin panel if admin */}
            {isAdmin && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Painel Administrativo Nexora
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Gestão de relatórios, envio de comunicados oficiais pelo @nexora e telemetria de rede.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={onOpenAdminDashboard}
                    className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Abrir Painel Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
