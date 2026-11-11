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
        className={`border-2 border-dashed rounded-2xl p-5 sm:p-7 md:p-8 mb-6 no-print transition-colors duration-200 ${
          activeTheme.isDark
            ? 'bg-zinc-900/90 border-amber-500/30 text-zinc-100'
            : activeTheme.id === 'parchment'
            ? 'bg-[#fffaf0] border-amber-600/30 text-[#291e16]'
            : 'bg-amber-50/70 border-amber-300/80 text-stone-900'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Scale className="w-4 h-4 shrink-0" />
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
              className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] font-bold rounded-xl text-xs sm:text-sm text-stone-950 shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
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
    <section
      className={`relative overflow-hidden specular-border-t border rounded-2xl p-5 sm:p-7 shadow-sm mb-6 no-print transition-all duration-300 hover:shadow-md ${
        activeTheme.isDark
          ? 'bg-zinc-850/90 border-zinc-700/80 text-zinc-100'
          : activeTheme.id === 'navy'
          ? 'bg-slate-900 border-slate-800 text-white'
          : activeTheme.id === 'emerald'
          ? 'bg-[#052b21] border-[#0c4a3a] text-white'
          : activeTheme.id === 'parchment'
          ? 'bg-[#291e16] border-[#3d2f23] text-amber-50'
          : 'bg-stone-900 border-stone-800 text-white'
      }`}
    >
      {/* Background lattice & ambient glow */}
      <div className="absolute inset-0 bg-arabic-lattice opacity-25 pointer-events-none" />
      <div className="absolute -left-12 -bottom-16 opacity-[0.04] text-white pointer-events-none">
        <BookOpen className="w-64 h-64 transform -rotate-12" strokeWidth={1} />
      </div>

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        {/* Info */}
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <Scale className="w-4 h-4 shrink-0" style={{ color: activeAccent.colorHex }} />
            <span style={{ color: activeAccent.colorHex }}>
              التشريع الأساسي المعتمد
            </span>
            {isCustom ? (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1 font-sans">
                <CheckCircle2 className="w-3 h-3" />
                <span>نسخة مرفوعة ومربوطة بالقرارات</span>
              </span>
            ) : (
              <span className="bg-white/10 text-white/90 border border-white/15 px-2.5 py-0.5 rounded-full text-[11px] font-sans">
                مربوط بالقرارات الوزارية
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3 flex-wrap">
            <span>{currentLaw.title}</span>
            <span className="text-xs bg-black/40 text-white/90 px-3 py-1 rounded-xl border border-white/15 font-mono">
              {currentLaw.chapters?.length || 0} أبواب · {totalArticles} مادة
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans">
            تم ربط القرارات الوزارية تلقائياً بنصوص مواد هذا القانون، مع إمكانية تعديل الارتباطات يدوياً والبحث الفوري في أي وقت.
          </p>
        </div>

        {/* Actions with modern touch-friendly buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenLawModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] font-extrabold rounded-2xl text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-white"
            style={{ backgroundColor: activeAccent.colorHex }}
          >
            <BookOpen className="w-4 h-4" />
            <span>استعراض مواد القانون</span>
          </button>

          <button
            type="button"
            onClick={onOpenSyncModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border border-emerald-400/40 shadow-xs"
            title="إعادة رفع القانون أو مراجعة وتنظيم مواده وربطها بالقرارات الوزارية"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث / إعادة رفع</span>
          </button>

          <button
            type="button"
            onClick={() => exportLaborLawAsWord(currentLaw)}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border border-sky-400/40 shadow-xs"
            title="تحميل قانون العمل بصيغة Microsoft Word"
          >
            <FileDown className="w-4 h-4" />
            <span>Word</span>
          </button>

          {onDeleteLaw && (
            <button
              type="button"
              onClick={onDeleteLaw}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 min-h-[44px] bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 font-semibold rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer border border-rose-500/30"
              title="حذف نسخة قانون العمل لإعادة رفعها"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
