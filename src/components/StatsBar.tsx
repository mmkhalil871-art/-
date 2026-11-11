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
      className="relative border-b py-3.5 sm:py-4.5 no-print transition-colors duration-200 overflow-hidden"
      style={{
        backgroundColor:
          activeTheme.id === 'oled'
            ? '#000000'
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
            ? '#1a1a1a'
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
      {/* Graphical background lattice / dot-matrix */}
      <div className="absolute inset-0 bg-dot-matrix opacity-40 pointer-events-none" />

      <div className="relative w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            const pct = total > 0 ? Math.min(100, Math.round((m.value / total) * 100)) : 0;
            return (
              <div
                key={m.label}
                className={`relative group p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xs specular-border-t transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex flex-col justify-between overflow-hidden ${
                  idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                {/* Subtle corner glow in metric color */}
                <div
                  className="absolute -top-10 -left-10 w-28 h-28 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                  style={{ backgroundColor: `${m.color}30` }}
                />

                <div className="flex items-center gap-3 mb-2.5">
                  <div
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundColor: `${m.color}20`,
                      color: m.color,
                      border: `1px solid ${m.color}35`,
                      boxShadow: `0 0 16px -2px ${m.color}30`,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-white tracking-tight">
                      {m.value}
                    </div>
                    <div className="text-xs font-bold text-white/95 truncate">
                      {m.label}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] opacity-70 truncate font-sans">
                    {m.sub}
                  </div>
                  {/* Micro Progress Indicator with subtle glow */}
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-[1px]">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out shadow-xs"
                      style={{
                        width: `${Math.max(12, pct)}%`,
                        backgroundColor: m.color,
                        boxShadow: `0 0 8px ${m.color}`,
                      }}
                    />
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

