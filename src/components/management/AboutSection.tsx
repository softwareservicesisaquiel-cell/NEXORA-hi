import React from 'react';
import {
  Sparkles,
  Compass,
  Target,
  Eye,
  Heart,
  Layers,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AboutSection: React.FC = () => {
  const { addToast } = useApp();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('oficial@nexora.app');
    addToast('Email oficial copiado: oficial@nexora.app', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Institutional Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 p-6 sm:p-8 overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>INSTITUCIONAL · NEXORA CORP</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-[var(--font-display)]">
            A Nova Geração da Rede Social Autêntica
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            A Nexora é uma plataforma concebida para redefinir a partilha de momentos e a conexão social com arquitetura independente, respeito pela privacidade e fluidez visual de ponta a ponta.
          </p>

          <div className="pt-2 flex items-center gap-3 text-xs font-mono text-blue-300">
            <span>Versão v2.4.0 (Build 2026.11)</span>
            <span>•</span>
            <span>Canal Estável</span>
          </div>
        </div>
      </div>

      {/* Grid: História, Missão, Visão e Valores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* História */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            História da Nexora
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Fundada em 2026, a Nexora nasceu da necessidade de proporcionar uma alternativa contemporânea e transparente às redes tradicionais. Inspirando-se no melhor da cultura visual mundial, desenvolveu um ecossistema com identidade própria, código otimizado e separação total entre a convivência social e as tarefas de gestão de conta.
          </p>
        </div>

        {/* Missão */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Nossa Missão
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Conectar pessoas, criadores e comunidades através de experiências visuais enriquecedoras, ferramentas de criação acessíveis e comunicação em tempo real, sem intermediários invasivos e sem comercialização de dados pessoais.
          </p>
        </div>

        {/* Visão */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Nossa Visão
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Ser a rede social de referência global para interações humanas genuínas, destacando-se pela excelência em engenharia, respeito à autonomia individual e interface intuitiva em qualquer dispositivo.
          </p>
        </div>

        {/* Valores */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Valores Centrais
          </h3>
          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>• <strong>Privacidade por Design:</strong> Os seus dados pertencem-lhe.</li>
            <li>• <strong>Autenticidade:</strong> Espaço para criatividade sem filtros ilusórios.</li>
            <li>• <strong>Inovação Segura:</strong> Tecnologias P2P e nuvem de alta fidelidade.</li>
            <li>• <strong>Inclusão:</strong> Mais de 40 idiomas nativos e acessibilidade total.</li>
          </ul>
        </div>
      </div>

      {/* Funcionalidades da Plataforma */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-500" />
          <span>Funcionalidades Integradas da Nexora</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {[
            'Feed Social Dinâmico',
            'Histórias Efêmeras de 24 Horas',
            'Reels & Vídeos Verticais 9:16',
            'Mensagens em Abas (Principal/Geral/Pedidos)',
            'Chamadas de Áudio WebRTC P2P',
            'Chamadas de Vídeo HD P2P',
            'Transmissões Ao Vivo (Live Room)',
            'Enquetes & Votações no Feed',
            'Perfil com Destaques (Highlights)',
            'Detetor de Dispositivos & Hardware',
            'Modo Escuro & Modo Claro Adaptativo',
            'Instalação PWA Multiplataforma',
          ].map((feat, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contactos Oficiais & Direitos de Autor */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Contactos Oficiais e Direitos de Autor
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-slate-500 block uppercase">
              Endereço Oficial de Comunicação
            </span>
            <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
              oficial@nexora.app
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Atendimento para suporte, imprensa e recursos de utilizador.
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyEmail}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar Email</span>
          </button>
        </div>

        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          <p>© 2026 NEXORA Inc. Todos os direitos reservados.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            NEXORA é uma marca registada. Construída com normas modernas de segurança em nuvem.
          </p>
        </div>
      </div>
    </div>
  );
};
