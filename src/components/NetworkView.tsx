import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Briefcase,
  MapPin,
  Building,
  Bookmark,
  Send,
  Check,
  Search,
  Filter,
  Users,
  Award,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const NetworkView: React.FC = () => {
  const { jobs, toggleSaveJob, applyToJob, allUsers, currentUser, toggleFollowUser, isFollowingUser, openUserProfile } = useApp();

  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  const filteredJobs = jobs.filter(j => {
    const matchesType = selectedType === 'all' || j.workplaceType.toLowerCase() === selectedType.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleApply = (jobId: string) => {
    applyToJob(jobId);
    setAppliedJobIds(prev => [...prev, jobId]);
  };

  const recommendedPeers = allUsers.filter(u => currentUser && u.id !== currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      
      {/* Network Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-900/30 via-teal-900/20 to-blue-900/30 border border-emerald-500/20 p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            <span>NEXORA CONNECT · NETWORKING 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-[var(--font-display)] text-slate-900 dark:text-white mb-2">
            Oportunidades & Conexões Profissionais
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6">
            Conecta com criadores, engenheiros de topo e equipas pioneiras. Candidata-te diretamente utilizando as tuas credenciais e portfólio no Nexora.
          </p>

          {/* Search bar */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por cargo, tecnologia (Rust, UX, IA...) ou empresa..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Job Opportunities (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Workplace Filter Tabs */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
              {[
                { id: 'all', label: 'Todas as Vagas' },
                { id: 'remoto', label: 'Remoto Global' },
                { id: 'híbrido', label: 'Híbrido' },
                { id: 'presencial', label: 'Presencial' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[36px] ${
                    selectedType === t.id
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {filteredJobs.length} vagas disponíveis
            </span>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {filteredJobs.map(job => {
              const hasApplied = appliedJobIds.includes(job.id);
              return (
                <div
                  key={job.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-emerald-500/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={job.companyLogo}
                          alt={job.company}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {job.company}
                            </span>
                            <span>·</span>
                            <span>{job.location}</span>
                            <span>·</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              {job.workplaceType}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className={`p-2 rounded-xl transition-colors ${
                          job.isSaved
                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title={job.isSaved ? 'Remover dos guardados' : 'Guardar vaga'}
                      >
                        <Bookmark className={`w-4 h-4 ${job.isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {job.description}
                    </p>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Compensation & Apply Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Faixa Salarial</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                        {job.salaryRange}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 font-mono tabular-nums hidden sm:inline">
                        {job.applicantsCount} candidatos
                      </span>

                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={hasApplied}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 min-h-[38px] ${
                          hasApplied
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-500/30'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm hover:from-emerald-500 hover:to-teal-500'
                        }`}
                      >
                        {hasApplied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Candidatura Enviada</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Candidatura Rápida</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Suggested Professional Connections (4 cols on lg) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-[var(--font-display)]">
                Conexões Recomendadas
              </h3>
            </div>

            <div className="space-y-4">
              {recommendedPeers.map(peer => {
                const following = isFollowingUser(peer.id);
                return (
                  <div key={peer.id} className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => openUserProfile(peer)}
                      className="flex items-start gap-2.5 text-left min-w-0"
                    >
                      <img
                        src={peer.avatar}
                        alt={peer.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-2xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {peer.name}
                        </div>
                        <div className="text-[11px] text-blue-600 dark:text-blue-400 truncate">
                          {peer.profession || 'Especialista'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {peer.location}
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => toggleFollowUser(peer.id)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all shrink-0 min-h-[32px] ${
                        following
                          ? 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {following ? 'Conectado' : 'Conectar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};
