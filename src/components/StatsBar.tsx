import React from 'react';
import { MinisterialDecision } from '../types/decision';
import { useTheme } from '../context/ThemeContext';
import { FileCheck, BookOpen, Layers, CheckCircle, Scale } from 'lucide-react';

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

  const metrics = [
    {
      label: 'إجمالي التشريعات',
      value: total,
      sub: 'مسجلة بالمنظومة',
      icon: Scale,
      color: activeAccent.colorHex,
    },
    {
      label: 'تشريعات سارية ونافذة',
      value: activeCount,
      sub: 'واجبة النفاذ والعمل',
      icon: CheckCircle,
      color: '#10b981',
    },
    {
      label: 'نسخ PDF رسمية ممسوحة',
      value: pdfCount,
      sub: 'موثقة ومرفوعة',
      icon: FileCheck,
      color: '#f43f5e',
    },
    {
      label: 'مواد قانون العمل المنفذة',
      value: lawArticlesSet.size,
      sub: 'ارتباط مباشر بالمواد',
      icon: Layers,
      color: '#0ea5e9',
    },
    {
      label: 'الأبواب والتصنيفات',
      value: categoriesSet.size,
      sub: 'مجال تنظيمي معتمد',
      icon: BookOpen,
      color: '#a855f7',
    },
  ];

  return (
    <section
      className={`border-b text-stone-200 py-3.5 no-print transition-colors duration-200 ${
        activeTheme.isDark
          ? 'bg-zinc-950/60 border-zinc-850 text-zinc-300'
          : activeTheme.id === 'navy'
          ? 'bg-slate-950/70 border-slate-900 text-slate-300'
          : activeTheme.id === 'emerald'
          ? 'bg-[#032018]/80 border-[#063327] text-emerald-100'
          : activeTheme.id === 'parchment'
          ? 'bg-[#1e150e]/80 border-[#2f2117] text-amber-100'
          : 'bg-stone-900/90 border-stone-800 text-stone-300'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className={`p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors flex items-center gap-3 ${
                  idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${m.color}20`,
                    color: m.color,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                      {m.value}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-white/90 truncate">
                    {m.label}
                  </div>
                  <div className="text-[10px] opacity-60 truncate">
                    {m.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

