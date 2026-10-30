import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Globe2,
  Users,
  Film,
  MessageCircle,
  Briefcase,
  CheckCircle,
} from 'lucide-react';

interface WelcomeLandingProps {
  onDismiss: () => void;
}

export const WelcomeLanding: React.FC<WelcomeLandingProps> = ({ onDismiss }) => {
  const { setShowAuthModal, setAuthModalMode } = useApp();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent pointer-events-none blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-md mb-6">
            <img
              src="/icon-192.png"
              alt="NEXORA HI"
              className="w-7 h-7 rounded-lg object-cover shadow-sm"
            />
            <span className="text-xs font-bold tracking-wide text-slate-800 dark:text-slate-200">
              NEXORA HI ECOSYSTEM 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-[var(--font-display)] leading-[1.15] mb-6">
            Um mundo inteiro.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Uma nova forma de te conectares.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto mb-8">
            A convergência definitiva entre conversas autênticas, vídeos verticais em alta definição, mensagens encriptadas e oportunidades profissionais globais. Sem ruído. Sem anúncios intrusivos.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
            <button
              onClick={() => {
                setAuthModalMode('register');
                setShowAuthModal(true);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2"
            >
              <span>Criar Conta Gratuita</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setAuthModalMode('login');
                setShowAuthModal(true);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
            >
              Iniciar Sessão
            </button>

            <button
              onClick={onDismiss}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-medium text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explorar Plataforma</span>
            </button>
          </div>
        </div>

        {/* Hero Visual Preview */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl mb-16 bg-slate-900">
          <img
            src="/src/assets/images/hero_nexora_network_1792880070116.jpg"
            alt="Nexora Network Architecture"
            referrerPolicy="no-referrer"
            className="w-full h-64 sm:h-96 object-cover object-center brightness-90 hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex items-end p-6 sm:p-8">
            <div className="max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1 block">
                Arquitetura Descentralizada & Alta Performance
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 font-[var(--font-display)]">
                Conexões instantâneas entre criadores, pensadores e comunidades.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Alimentada por motores de recomendação transparentes, respeitando a tua atenção e tempo.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Grid - The 5 Pillars of Nexora */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold tracking-tight mb-2 font-[var(--font-display)]">
              Cinco dimensões. Um único ecossistema fluido.
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Inspirado no que há de melhor no mundo social, redesenhado com elegância e integridade.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Feed & Comunidades */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">
                Feed Inteligente & Comunidades
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Publicações multimédia, votações em tempo real, tópicos especializados e espaços comunitários moderados com seriedade.
              </p>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                <span>Sem algoritmos de polarização</span>
              </div>
            </div>

            {/* 2. Nexora Clips */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-purple-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Film className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">
                NEXORA CLIPS Verticais
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Vídeos curtos cinematográficos a 60fps com consumo eficiente de dados, controlo total do áudio e criatividade sem limites.
              </p>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-purple-500" />
                <span>Modo de poupança inteligente</span>
              </div>
            </div>

            {/* 3. Mensagens & Chamadas */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">
                Mensagens Diretas & Chamadas HD
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Conversas individuais e em grupo, notas de voz interativas, transferências seguras e chamadas de voz e vídeo encriptadas.
              </p>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                <span>Encriptação de ponta a ponta</span>
              </div>
            </div>

            {/* 4. Stories & Momentos */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">
                Stories Efêmeros & Destaques
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Partilha momentos instantâneos com expiração automática após 24h ou preserva as tuas memórias em coleções permanentes.
              </p>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-500" />
                <span>Visualizadores detalhados</span>
              </div>
            </div>

            {/* 5. Nexora Connect / Carreiras */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">
                Networking & Oportunidades
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Conecta com equipas pioneiras, acede a vagas em tecnologia e criatividade, e valida competências reais com o teu perfil.
              </p>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Candidaturas com 1 toque</span>
              </div>
            </div>

            {/* 6. Segurança e Soberania */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-rose-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">
                Soberania & Proteção 2FA
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Gestão rigorosa de sessões ativas, autenticação de dois fatores, desativação temporária ou eliminação imediata sem truques.
              </p>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Exportação e controlo de dados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links required by brief */}
        <footer className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">NEXORA</span>
            <span>·</span>
            <span>© 2026 Nexora Technologies Inc. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={() => alert('Termos de Serviço da Nexora: Respeitamos a integridade, liberdade criativa e propriedade intelectual dos utilizadores.')}
              className="hover:text-blue-500 transition-colors"
            >
              Termos de Serviço
            </button>
            <button
              onClick={() => alert('Política de Privacidade da Nexora: Encriptação rigorosa e sem comercialização de dados pessoais.')}
              className="hover:text-blue-500 transition-colors"
            >
              Privacidade
            </button>
            <button
              onClick={() => alert('Centro de Ajuda Nexora: Suporte disponível para todos os membros da rede 24/7.')}
              className="hover:text-blue-500 transition-colors"
            >
              Centro de Ajuda
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};
