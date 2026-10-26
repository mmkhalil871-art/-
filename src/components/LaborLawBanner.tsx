import React from 'react';
import { BookOpen, FileDown, Printer, Scale, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { LaborLawInfo } from '../data/laborLawData';
import { exportLaborLawAsWord } from '../utils/exportUtils';
import { isCustomLawStored } from '../utils/lawStorage';

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
  const isCustom = isCustomLawStored();
  const totalArticles = currentLaw.chapters.reduce((sum, ch) => sum + ch.articles.length, 0) + currentLaw.promulgationArticles.length;

  return (
    <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 text-white shadow-md mb-6 no-print">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Info */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-400">
            <Scale className="w-4 h-4" />
            <span>التشريع الأساسي المعتمد · الجريدة الرسمية</span>
            {isCustom ? (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>نسخة رسمية محدثة ومراجعة بواسطة المستخدم</span>
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[11px]">
                متاح الاستبدال بالنص الرسمي الكامل
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
            <span>{currentLaw.title}</span>
            <span className="text-xs bg-stone-800 text-stone-300 px-2.5 py-0.5 rounded border border-stone-700 font-normal">
              {currentLaw.chapters.length} أبواب · {totalArticles} مادة
            </span>
          </h2>

          <p className="text-xs text-stone-300 leading-relaxed">
            النص التشريعي لقانون العمل الصادر بالجريدة الرسمية ({currentLaw.gazetteIssue})، متاح للمطالعة والتحميل الفوري
            بصيغتي <strong>Word (.doc)</strong> و <strong>PDF</strong>، مع إمكانية استبدال النص وتحديث الروابط بالقرارات فورياً.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenLawModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
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
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer border border-stone-700"
            title="تحميل وطباعة نسخة PDF"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>PDF / طباعة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

