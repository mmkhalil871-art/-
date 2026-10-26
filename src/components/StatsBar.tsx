import React from 'react';
import { MinisterialDecision } from '../types/decision';

interface StatsBarProps {
  decisions: MinisterialDecision[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ decisions }) => {
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
    <section className="bg-stone-900 border-b border-stone-800 text-stone-200 py-6 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-stone-800">
          <div className="pt-3 md:pt-0">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white">
              {total}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              إجمالي القرارات المنفذة المسجلة
            </div>
          </div>

          <div className="pt-3 md:pt-0 md:pr-6">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-400">
              {activeCount}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              قرارات وزارية نافذة وسارية
            </div>
          </div>

          <div className="pt-3 md:pt-0 md:pr-6">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-400">
              {lawArticlesSet.size}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              مادة مغطاة من قانون العمل 14
            </div>
          </div>

          <div className="pt-3 md:pt-0 md:pr-6">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-rose-400">
              {pdfCount}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              قرارات مرفق بها نسخ PDF رسمية
            </div>
          </div>

          <div className="pt-3 md:pt-0 md:pr-6 col-span-2 md:col-span-1">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-sky-400">
              {categoriesSet.size}
            </div>
            <div className="text-xs text-stone-400 mt-1">
              أبواب ومجالات تنظيمية معتمدة
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
