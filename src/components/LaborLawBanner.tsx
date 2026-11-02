import React from 'react';
import { BookOpen, FileDown, Printer, Scale, RefreshCw, CheckCircle2, Upload, Trash2, AlertCircle } from 'lucide-react';
import { LaborLawInfo } from '../data/laborLawData';
import { exportLaborLawAsWord } from '../utils/exportUtils';
import { isCustomLawStored } from '../utils/lawStorage';
import { useTheme } from '../context/ThemeContext';

interface LaborLawBannerProps {
  currentLaw: LaborLawInfo | null;
  onOpenLawModal: () => void;
  onOpenSyncModal: () => void;
  onDeleteLaw?: () => void;
}

export const LaborLawBanner: React.FC<LaborLawBannerProps> = ({
  currentLaw,
  onOpenLawModal,
  onOpenSyncModal,
  onDeleteLaw,
}) => {
  const { activeAccent, activeTheme } = useTheme();

  // If law is deleted / not loaded yet
  if (!currentLaw) {
    return (
      <div
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 mb-6 no-print transition-colors duration-200 ${
          activeTheme.isDark
            ? 'bg-zinc-900/90 border-amber-500/40 text-zinc-100'
            : activeTheme.id === 'parchment'
            ? 'bg-[#fffaf0] border-amber-600/40 text-[#291e16]'
            : 'bg-amber-50/70 border-amber-300 text-stone-900'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Scale className="w-4 h-4" />
              <span>قانون العمل: تم حذف النسخة السابقة بناءً على طلبك</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              بانتظار رفع نسختك المعتمدة من قانون العمل (Word / PDF / نص)
            </h2>

            <p className="text-xs sm:text-sm opacity-85 leading-relaxed font-sans">
              فور رفع ملف القانون الخاص بك، سيتولى النظام آلياً:
              <br />
              1. <strong>استخراج الأبواب والمواد كاملة</strong> بدقة قانونية.
              <br />
              2. <strong>ربط كافة القرارات الوزارية بنصوص مواد القانون المرفوع تلقائياً</strong>.
              <br />
              3. <strong>إتاحة التعديل اليدوي الكامل</strong> في تلك الارتباطات مباشرة عبر الجدول أو البطاقات.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenSyncModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 font-bold rounded-xl text-xs sm:text-sm text-stone-950 shadow-md transition-all cursor-pointer hover:scale-[1.02]"
              style={{ backgroundColor: activeAccent.colorHex }}
            >
              <Upload className="w-4 h-4" />
              <span>رفع ملف قانون العمل والربط التلقائي 📤</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCustom = isCustomLawStored();
  const totalArticles =
    (currentLaw.chapters || []).reduce((sum, ch) => sum + (ch.articles?.length || 0), 0) +
    (currentLaw.promulgationArticles?.length || 0);

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
              التشريع الأساسي المعتمد
            </span>
            {isCustom ? (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>نسخة مرفوعة ومعتمدة ومربوطة بالقرارات</span>
              </span>
            ) : (
              <span className="bg-white/10 text-white/90 border border-white/15 px-2 py-0.5 rounded-full text-[11px]">
                مربوط بالقرارات الوزارية
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
            <span>{currentLaw.title}</span>
            <span className="text-xs bg-black/30 text-white/90 px-2.5 py-0.5 rounded border border-white/10 font-normal">
              {currentLaw.chapters?.length || 0} أبواب · {totalArticles} مادة
            </span>
          </h2>

          <p className="text-xs opacity-85 leading-relaxed">
            تم ربط القرارات الوزارية تلقائياً بنصوص مواد هذا القانون، مع إمكانية تعديل الارتباطات يدوياً في أي وقت.
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
            title="إعادة رفع القانون أو مراجعة وتنظيم مواده وربطها بالقرارات الوزارية"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث / إعادة رفع القانون</span>
          </button>

          <button
            type="button"
            onClick={() => exportLaborLawAsWord(currentLaw)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer border border-blue-400/40"
            title="تحميل قانون العمل بصيغة Microsoft Word"
          >
            <FileDown className="w-4 h-4" />
            <span>Word</span>
          </button>

          {onDeleteLaw && (
            <button
              type="button"
              onClick={onDeleteLaw}
              className="inline-flex items-center gap-1 px-3 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer border border-rose-500/30"
              title="حذف نسخة قانون العمل لإعادة رفعها"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف القانون</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
