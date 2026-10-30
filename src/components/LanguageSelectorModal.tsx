import React, { useState } from 'react';
import { WORLD_LANGUAGES, LanguageItem } from '../i18n/languages';
import { Search, X, Check, Globe2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  onSelectLanguage: (code: string) => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
}) => {
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLanguages = WORLD_LANGUAGES.filter(
    lang =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (lang: LanguageItem) => {
    onSelectLanguage(lang.code);
    addToast(`Idioma alterado para ${lang.nativeName} (${lang.name})!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh] text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-[var(--font-display)]">
                Selecionar Idioma Global
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {WORLD_LANGUAGES.length} idiomas suportados no NEXORA HI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time search */}
        <div className="my-3.5 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome, escrita nativa ou código (ex: Português, 简体中文, 日本語, Русский...)"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 dark:text-white"
            autoFocus
          />
        </div>

        {/* Languages list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 pr-1 space-y-0.5">
          {filteredLanguages.length > 0 ? (
            filteredLanguages.map(lang => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang)}
                  className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{lang.nativeName}</span>
                      <span className="text-xs text-slate-400">({lang.name})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">{lang.region}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                      {lang.code}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhum idioma encontrado para "{searchQuery}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>O NEXORA HI adapta a escrita e direção do texto em tempo real.</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">100% Internacional</span>
        </div>

      </div>
    </div>
  );
};
