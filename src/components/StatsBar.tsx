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
      className="border-b py-3.5 no-print transition-colors duration-200"
      style={{
        backgroundColor:
          activeTheme.id === 'oled'
            ? '#050505'
            : activeTheme.id === 'night-amber'
            ? '#16120e'
            : activeTheme.id === 'sepia'
            ? '#443527'
            : activeTheme.id === 'midnight'
            ? '#0a1222'
            : activeTheme.id === 'e-ink'
            ? '#1c1c1c'
            : activeTheme.id === 'emerald'
            ? '#03231a'
            : activeTheme.id === 'navy'
            ? '#0a162b'
            : activeTheme.id === 'parchment'
            ? '#1f1610'
            : activeTheme.isDark
            ? '#121216'
            : '#24201e',
        borderColor:
          activeTheme.id === 'oled'
            ? '#151515'
            : activeTheme.id === 'sepia'
            ? '#5a4634'
            : 'rgba(255, 255, 255, 0.08)',
        color:
          activeTheme.id === 'night-amber'
            ? '#f6e0c0'
            : activeTheme.id === 'sepia'
            ? '#faedd9'
            : '#e5e7eb',
      }}
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

