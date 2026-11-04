import React, { useState } from 'react';
import {
  Shield,
  FileText,
  Lock,
  Database,
  Share2,
  KeyRound,
  UserCheck,
  CheckSquare,
  Trash2,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type PolicyPageId =
  | 'privacidade'
  | 'termos'
  | 'protecao_dados'
  | 'recolha_info'
  | 'partilha_dados'
  | 'seguranca'
  | 'direitos_utilizadores'
  | 'gestao_consentimentos'
  | 'eliminacao_dados';

interface PoliciesSectionProps {
  currentPage: PolicyPageId | null;
  onSelectPage: (page: PolicyPageId | null) => void;
}

export const PoliciesSection: React.FC<PoliciesSectionProps> = ({
  currentPage,
  onSelectPage,
}) => {
  const { addToast } = useApp();

  // Consent states for 'gestao_consentimentos'
  const [essentialCookies] = useState(true); // Always true
  const [telemetryConsent, setTelemetryConsent] = useState(false);
  const [mediaStorageConsent, setMediaStorageConsent] = useState(true);

  const policyPages: {
    id: PolicyPageId;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    updatedAt: string;
    sections: { heading: string; body: string }[];
  }[] = [
    {
      id: 'privacidade',
      title: 'Política de Privacidade',
      subtitle: 'Como a Nexora trata, armazena e protege os dados da sua conta.',
      icon: Shield,
      updatedAt: 'Novembro de 2026',
      sections: [
        {
          heading: '1. Compromisso com a Privacidade',
          body: 'A Nexora foi desenhada com privacidade em primeiro plano. Respeitamos a sua autonomia sobre o que partilha, com quem interage e como a sua presença social é apresentada ao público.',
        },
        {
          heading: '2. Dados do Perfil e Conta',
          body: 'Guardamos apenas os dados essenciais para o funcionamento do serviço: nome de exibição, nome de utilizador, email de autenticação, identificador NEXORA ID e eventuais fotografias ou biografias fornecidas voluntariamente.',
        },
        {
          heading: '3. Mensagens e Conteúdos Privados',
          body: 'As suas mensagens privadas, histórias e vídeos são processados de acordo com os filtros de audiência que definir. Não utilizamos os conteúdos das suas conversas para personalização comercial de terceiros.',
        },
      ],
    },
    {
      id: 'termos',
      title: 'Termos de Utilização',
      subtitle: 'Condições contratuais para aceder e interagir na rede social Nexora.',
      icon: FileText,
      updatedAt: 'Novembro de 2026',
      sections: [
        {
          heading: '1. Aceitação dos Termos',
          body: 'Ao criar uma conta ou utilizar a aplicação Nexora, concorda em ficar vinculado a estes Termos de Utilização e a respeitar todas as regras da comunidade.',
        },
        {
          heading: '2. Elegibilidade e Responsabilidade',
          body: 'É responsável por manter a confidencialidade da sua palavra-passe e código de recuperação, bem como por qualquer atividade realizada através da sua conta.',
        },
        {
          heading: '3. Propriedade Intelectual',
          body: 'Mantém a total titularidade dos direitos de autor sobre as fotos, vídeos e textos que publicar. Concede à Nexora apenas a licença técnica indispensável para hospedar e exibir o conteúdo aos utilizadores que selecionar.',
        },
      ],
    },
    {
      id: 'protecao_dados',
      title: 'Proteção de Dados Pessoais',
      subtitle: 'Conformidade com os padrões globais de privacidade (RGPD e LGPD).',
      icon: Lock,
      updatedAt: 'Novembro de 2026',
      sections: [
        {
          heading: '1. Princípios de Minimização',
          body: 'A Nexora recolhe unicamente a quantidade mínima de dados pessoais necessária para a prestação dos serviços sociais solicitados pelo utilizador.',
        },
        {
          heading: '2. Fundamento de Licitude',
          body: 'O tratamento de dados é baseado na execução do contrato de utilização dos serviços e no consentimento livre e informado expressado pelo titular dos dados.',
        },
        {
          heading: '3. Encriptação e Proteção Técnica',
          body: 'Os dados em trânsito são encriptados através de protocolos TLS 1.3 / SSL e as bases de dados em repouso utilizam armazenamento cifrado padrão AES-256.',
        },
      ],
    },
    {
      id: 'recolha_info',
      title: 'Recolha de Informações',
      subtitle: 'Transparência sobre que elementos técnicos e pessoais são registados.',
      icon: Database,
      updatedAt: 'Novembro de 2026',
      sections: [
        {
          heading: '1. Informações Fornecidas Diretamente',
          body: 'Inclui os dados que introduz no registo (email, nome, username), as fotos e vídeos que envia, mensagens de texto e comentários.',
        },
        {
          heading: '2. Informações de Dispositivo',
          body: 'Para garantir a segurança da sessão e prevenir invasões, recolhemos o tipo de dispositivo (telemóvel, computador ou tablet), sistema operativo e navegador utilizado.',
        },
        {
          heading: '3. Informações de Geolocalização Opcional',
          body: 'Apenas quando autoriza explicitamente através do Gestor de Permissões para associar uma cidade à sua publicação.',
        },
      ],
    },
    {
      id: 'partilha_dados',
      title: 'Partilha e Transferência de Dados',
      subtitle: 'Garantia de que os seus dados nunca são vendidos a corretores externos.',
      icon: Share2,
      updatedAt: 'Novembro de 2026',
      sections: [
        {
          heading: '1. Política Anti-Venda',
          body: 'A Nexora não vende, aluga ou comercializa os dados pessoais dos utilizadores a quaisquer anunciantes, corretores de dados ou terceiros comerciais.',
        },
        {
          heading: '2. Prestadores de Infraestrutura',
          body: 'Os dados são alojados e processados exclusivamente em fornecedores de nuvem seguros (como Firebase Cloud Firestore, Auth e CDN global) estritamente para suporte técnico da plataforma.',
        },
        {
          heading: '3. Exigências Legais Estritas',
          body: 'Apenas revelamos informações caso sejamos legalmente compelidos por ordem judicial fundamentada e em conformidade com as garantias legais aplicáveis.',
        },
      ],
    },
    {
      id: 'seguranca',
      title: 'Práticas de Segurança da Informação',
      subtitle: 'Mecanismos de salvaguarda, regras de acesso e mitigação de vulnerabilidades.',
      icon: KeyRound,
      updatedAt: 'Novembro de 2026',
      sections: [
        {
          heading: '1. Regras de Segurança no Firestore',
          body: 'Cada documento possui regras de acesso restritivas no nível de infraestrutura, garantindo que utilizadores não autenticados não acedem a recursos confidenciais.',
        },
        {
          heading: '2. Tokens de Autenticação Seguros',
          body: 'As sessões utilizam tokens criptográficos JWT com renovação automática e controlo de revogação remota.',
        },
        {
          heading: '3. Proteção WebRTC P2P',
          body: 'As chamadas de áudio e vídeo conectam diretamente os dispositivos finais via DTLS-SRTP, sem gravação de áudio ou vídeo em servidores intermediários.',
        },
      ],
    },
    {
      id: 'direitos_utilizadores',
      title: 'Direitos dos Utilizadores',
      subtitle: 'Como exercer o seu direito de acesso, retificação, oposição e portabilidade.',
      icon: UserCheck,
      updatedAt: 'Novembro de 2026',
      sections: [
        {
          heading: '1. Direito de Acesso e Portabilidade',
          body: 'Tem o direito de aceder a todos os dados registados e transferir uma cópia integral em formato estruturado JSON através da secção "Gestão da Conta".',
        },
        {
          heading: '2. Direito de Retificação',
          body: 'Pode atualizar o seu nome, username, biografia, fotografia e preferências a qualquer momento nas Configurações da sua conta.',
        },
        {
          heading: '3. Direito de Oposição e Limitação',
          body: 'Pode restringir a visibilidade do seu perfil tornando a sua conta privada ou bloqueando utilizadores específicos.',
        },
      ],
    },
    {
      id: 'gestao_consentimentos',
      title: 'Gestão de Consentimentos',
      subtitle: 'Controlo ativo sobre permissões locais, cache e telemetria.',
      icon: CheckSquare,
      updatedAt: 'Novembro de 2026',
      sections: [
        {
          heading: '1. Preferências de Consentimento',
          body: 'Pode gerir as autorizações concedidas à aplicação a qualquer instante:',
        },
      ],
    },
    {
      id: 'eliminacao_dados',
      title: 'Eliminação e Esquecimento de Dados',
      subtitle: 'Processo e prazos para a destruição irreversível da sua presença na Nexora.',
      icon: Trash2,
      updatedAt: 'Novembro de 2026',
      sections: [
        {
          heading: '1. Direito ao Apagamento',
          body: 'O utilizador tem o direito inequívoco de eliminar permanentemente a sua conta e todos os dados associados a qualquer momento.',
        },
        {
          heading: '2. Destruição Imediata',
          body: 'Quando confirma a eliminação definitiva, a conta é desvinculada do Firebase Authentication e os registos de perfil são apagados da base de dados Cloud Firestore.',
        },
        {
          heading: '3. Limpeza Local do Aparelho',
          body: 'Recomendamos também executar a "Limpeza de Cache de Imagens" nas configurações para esvaziar os ficheiros temporários do seu dispositivo.',
        },
      ],
    },
  ];

  // If no page selected, render the 9 independent policies grid
  if (!currentPage) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Política, Privacidade e Termos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Consulte os 9 documentos regulamentares e páginas institucionais de proteção de dados da Nexora.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {policyPages.map(page => {
            const Icon = page.icon;
            return (
              <button
                key={page.id}
                onClick={() => onSelectPage(page.id)}
                className="w-full text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/50 hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between min-h-[120px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {page.updatedAt}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {page.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {page.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Render individual policy document
  const activePage = policyPages.find(p => p.id === currentPage) || policyPages[0];
  const Icon = activePage.icon;

  return (
    <div className="space-y-6">
      {/* Return Button */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => onSelectPage(null)}
          className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          ← Voltar a Todas as Políticas
        </button>
        <span className="text-xs text-slate-400 font-mono">
          Documento: {activePage.id}
        </span>
      </div>

      <article className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {activePage.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Última revisão formal: {activePage.updatedAt}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 italic border-l-2 border-blue-500 pl-3">
          {activePage.subtitle}
        </p>

        {/* Regular Sections */}
        <div className="space-y-6 pt-2">
          {activePage.sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {sec.heading}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {sec.body}
              </p>
            </div>
          ))}
        </div>

        {/* Interactive consent panel if viewing 'gestao_consentimentos' */}
        {activePage.id === 'gestao_consentimentos' && (
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Sessão e Autenticação Essencial
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Tokens criptográficos estritamente necessários para manter o utilizador autenticado.
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg bg-emerald-500/10">
                Sempre Ativo
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Cache Local de Imagens & Média
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Guarda fotos no armazenamento temporário do navegador para navegação ultrarrápida.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMediaStorageConsent(!mediaStorageConsent);
                  addToast(
                    mediaStorageConsent
                      ? 'Cache local desativada. As imagens carregarão via rede contínua.'
                      : 'Cache local de imagens ativada.',
                    'info'
                  );
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  mediaStorageConsent ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    mediaStorageConsent ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Diagnósticos de Desempenho Anónimos
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Auxilia na deteção de erros de compilação sem identificação do utilizador.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTelemetryConsent(!telemetryConsent);
                  addToast(
                    telemetryConsent
                      ? 'Diagnósticos desativados.'
                      : 'Diagnósticos anónimos ativados.',
                    'info'
                  );
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  telemetryConsent ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    telemetryConsent ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </article>
    </div>
  );
};
