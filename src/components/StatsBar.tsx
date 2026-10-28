import React from 'react';
import { MinisterialDecision } from '../types/decision';
import { useTheme } from '../context/ThemeContext';

interface StatsBarProps {
  decisions: MinisterialDecision[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ decisions }) => {
  const { activeTheme, activeAccent } = useTheme();

  const total = decisions.length;
  const activeCount = decisions.filter(
    (d) => d.status === 'نافذ' || d.status === 'سارٍ'
  ).length;

  const pdfCount = decisions.filter((d) => !!d.pdfAttachment).length;

  // Extract unique law articles covered
  const lawArticlesSet = new Set<string>();
  decisions.forEach((d) => {
    d.relatedLawArticles?.forEach((art) => lawArticlesSet.add(art.trim()));
  });

  const categoriesSet = new Set<string>();
  decisions.forEach((d) => {
    if (d.category) categoriesSet.add(d.category);
  });

  return (
    <section
      className={`border-b border-black/20 dark:border-white/10 text-stone-200 py-6 no-print transition-colors duration-200 ${
        activeTheme.isDark
          ? 'bg-zinc-950/70 text-zinc-200'
          : activeTheme.id === 'navy'
          ? 'bg-slate-900 text-slate-200'
          : activeTheme.id === 'emerald'
          ? 'bg-[#04241b] text-emerald-100'
          : activeTheme.id === 'parchment'
          ? 'bg-[#211710] text-amber-100'
          : 'bg-stone-900 text-stone-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-white/10">
          <div className="pt-3 md:pt-0">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white">
              {total}
            </div>
            <div className="text-xs opacity-75 mt-1">
              إجمالي القرارات المنفذة المسجلة
            </div>
          </div>

          <div className="pt-3 md:pt-0 md:pr-6">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-400">
              {activeCount}
            </div>
            <div className="text-xs opacity-75 mt-1">
              قرارات وزارية نافذة وسارية
            </div>
          </div>

          <div className="pt-3 md:pt-0 md:pr-6">
            <div
              className="text-2xl sm:text-3xl font-bold font-mono tabular-nums"
              style={{ color: activeAccent.colorHex }}
            >
              {lawArticlesSet.size}
            </div>
            <div className="text-xs opacity-75 mt-1">
              مادة مغطاة من قانون العمل 14
            </div>
          </div>

          <div className="pt-3 md:pt-0 md:pr-6">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-rose-400">
              {pdfCount}
            </div>
            <div className="text-xs opacity-75 mt-1">
              قرارات مرفق بها نسخ PDF رسمية
            </div>
          </div>

          <div className="pt-3 md:pt-0 md:pr-6 col-span-2 md:col-span-1">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-sky-400">
              {categoriesSet.size}
            </div>
            <div className="text-xs opacity-75 mt-1">
              أبواب ومجالات تنظيمية معتمدة
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
