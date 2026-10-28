import React from 'react';
import { BookOpen, FileDown, Printer, Scale, RefreshCw, CheckCircle2 } from 'lucide-react';
import { LaborLawInfo } from '../data/laborLawData';
import { exportLaborLawAsWord } from '../utils/exportUtils';
import { isCustomLawStored } from '../utils/lawStorage';
import { useTheme } from '../context/ThemeContext';

interface LaborLawBannerProps {
  currentLaw: LaborLawInfo;
  onOpenLawModal: () => void;
  onOpenSyncModal: () => void;
}

export const LaborLawBanner: React.FC<LaborLawBannerProps> = ({
  currentLaw,
  onOpenLawModal,
  onOpenSyncModal,
}) => {
  const { activeAccent, activeTheme } = useTheme();
  const isCustom = isCustomLawStored();
  const totalArticles =
    currentLaw.chapters.reduce((sum, ch) => sum + ch.articles.length, 0) +
    currentLaw.promulgationArticles.length;

  return (
    <div
      className={`border rounded-2xl p-5 sm:p-6 shadow-md mb-6 no-print transition-colors duration-200 ${
        activeTheme.isDark
          ? 'bg-zinc-850 border-zinc-700 text-zinc-100'
          : activeTheme.id === 'navy'
          ? 'bg-slate-900 border-slate-800 text-white'
          : activeTheme.id === 'emerald'
          ? 'bg-[#052b21] border-[#0c4a3a] text-white'
          : activeTheme.id === 'parchment'
          ? 'bg-[#291e16] border-[#3d2f23] text-amber-50'
          : 'bg-stone-900 border-stone-800 text-white'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Info */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <Scale className="w-4 h-4" style={{ color: activeAccent.colorHex }} />
            <span style={{ color: activeAccent.colorHex }}>
              التشريع الأساسي المعتمد · الجريدة الرسمية
            </span>
            {isCustom ? (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>نسخة رسمية محدثة ومراجعة بواسطة المستخدم</span>
              </span>
            ) : (
              <span className="bg-white/10 text-white/90 border border-white/15 px-2 py-0.5 rounded-full text-[11px]">
                متاح الاستبدال بالنص الرسمي الكامل
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
            <span>{currentLaw.title}</span>
            <span className="text-xs bg-black/30 text-white/90 px-2.5 py-0.5 rounded border border-white/10 font-normal">
              {currentLaw.chapters.length} أبواب · {totalArticles} مادة
            </span>
          </h2>

          <p className="text-xs opacity-85 leading-relaxed">
            النص التشريعي لقانون العمل الصادر بالجريدة الرسمية ({currentLaw.gazetteIssue})، متاح للمطالعة والتحميل الفوري
            بصيغتي <strong>Word (.doc)</strong> و <strong>PDF</strong>، مع إمكانية استبدال النص وتحديث الروابط بالقرارات فورياً.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenLawModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-transform active:scale-95 cursor-pointer text-white"
            style={{ backgroundColor: activeAccent.colorHex }}
          >
            <BookOpen className="w-4 h-4" />
            <span>استعراض مواد القانون</span>
          </button>

          <button
            type="button"
            onClick={onOpenSyncModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer border border-emerald-400/40 shadow-xs"
            title="رفع نسخة القانون بصيغة Word أو PDF ومراجعة تنظيم المواد وربطها بالقرارات الوزارية"
          >
            <RefreshCw className="w-4 h-4" />
            <span>استبدال القانون وتحديث الروابط</span>
          </button>

          <button
            type="button"
            onClick={() => exportLaborLawAsWord(currentLaw)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer border border-blue-400/40"
            title="تحميل قانون العمل بصيغة Microsoft Word"
          >
            <FileDown className="w-4 h-4" />
            <span>تحميل Word</span>
          </button>

          <button
            type="button"
            onClick={onOpenLawModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer border border-white/20"
            title="تحميل وطباعة نسخة PDF"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>PDF / طباعة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
