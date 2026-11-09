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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5 lg:gap-4">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            // Calculate a visual completion percentage for the micro bar
            const pct = total > 0 ? Math.min(100, Math.round((m.value / total) * 100)) : 0;
            return (
              <div
                key={m.label}
                className={`relative group p-3 sm:p-3.5 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] specular-border-t card-elevated-hover transition-all flex flex-col justify-between overflow-hidden ${
                  idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                {/* Subtle corner glow in metric color */}
                <div
                  className="absolute -top-10 -left-10 w-24 h-24 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                  style={{ backgroundColor: `${m.color}25` }}
                />

                <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-110"
                    style={{
                      backgroundColor: `${m.color}22`,
                      color: m.color,
                      boxShadow: `0 0 16px -2px ${m.color}35`,
                    }}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg sm:text-2xl font-black font-mono tabular-nums text-white tracking-tight">
                        {m.value}
                      </span>
                    </div>
                    <div className="text-[11px] sm:text-xs font-bold text-white/95 truncate">
                      {m.label}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] opacity-65 truncate font-sans">
                    {m.sub}
                  </div>
                  {/* Graphical Micro Progress Bar */}
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.max(14, pct)}%`,
                        backgroundColor: m.color,
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

