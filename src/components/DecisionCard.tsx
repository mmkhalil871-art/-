import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Star,
  Eye,
  Calendar,
  Layers,
  ChevronDown,
  Edit3,
  Trash2,
  FileDown
} from 'lucide-react';
import { MinisterialDecision } from '../types/decision';
import { exportDecisionAsWord, exportDecisionAsText } from '../utils/exportUtils';
import { useTheme } from '../context/ThemeContext';

export type DecisionModalTab = 'scanned_pdf' | 'written_text' | 'summary' | 'split';

interface DecisionCardProps {
  decision: MinisterialDecision;
  onView: (decision: MinisterialDecision, initialTab?: DecisionModalTab) => void;
  onPrint: (decision: MinisterialDecision) => void;
  onEdit: (decision: MinisterialDecision) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({
  decision,
  onView,
  onPrint,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const { activeTheme, activeAccent } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'نافذ':
      case 'سارٍ':
        return 'text-emerald-600 dark:text-emerald-400 font-semibold';
      case 'معدل':
        return 'text-amber-600 dark:text-amber-400 font-semibold';
      case 'ملغى':
        return 'text-rose-600 dark:text-rose-400 font-semibold';
      default:
        return 'opacity-75';
    }
  };

  return (
    <article
      className={`group rounded-xl border p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-md ${
        activeTheme.isDark
          ? 'bg-zinc-800/80 border-zinc-700/80 hover:border-zinc-500 text-zinc-100'
          : activeTheme.id === 'parchment'
          ? 'bg-[#fffdf9] border-[#e4d7c5] hover:border-[#b48d61] text-[#281d14]'
          : 'bg-white border-stone-200 hover:border-stone-400 text-stone-900'
      }`}
    >
      <div>
        {/* Top Kicker: Clean unboxed metadata with typographic separators */}
        <div className="flex items-center justify-between text-xs opacity-75 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono tabular-nums font-semibold">
              قرار وزاري رقم {decision.decisionNumber} لسنة {decision.year}
            </span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span>{decision.category}</span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span className={getStatusColor(decision.status)}>
              {decision.status}
            </span>
            {decision.pdfAttachment ? (
              <>
                <span aria-hidden="true" className="opacity-40">·</span>
                <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/60 px-1.5 py-0.5 rounded text-[11px] font-bold">
                  ✓ نسخة ممسوحة ضوئياً (PDF)
                </span>
              </>
            ) : (
              <>
                <span aria-hidden="true" className="opacity-40">·</span>
                <span className="opacity-60 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded text-[11px]">
                  النسخة الممسوحة: لم تُرفع
                </span>
              </>
            )}
          </div>

          {/* Favorite button */}
          <button
            type="button"
            onClick={() => onToggleFavorite(decision.id)}
            className="p-1 rounded-md opacity-60 hover:opacity-100 transition-colors cursor-pointer"
            title={decision.isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          >
            <Star
              className={`w-4 h-4 ${
                decision.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-stone-400'
              }`}
            />
          </button>
        </div>

        {/* Title */}
        <h3
          onClick={() => onView(decision, 'summary')}
          className="text-base font-bold tracking-tight mb-2 cursor-pointer leading-snug hover:opacity-85 transition-opacity"
        >
          {decision.title}
        </h3>

        {/* Summary or Legal Basis */}
        <p className="text-xs opacity-80 line-clamp-3 mb-4 leading-relaxed font-sans">
          {decision.legalBasisSummary || decision.executingSubject || decision.preamble}
        </p>

        {/* Metadata info: Dates & Articles */}
        <div className="space-y-1.5 text-xs opacity-70 mb-4 border-t border-black/5 dark:border-white/5 pt-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 opacity-60" />
            <span>تاريخ الإصدار: </span>
            <span className="font-mono tabular-nums">{decision.issueDate}</span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span>الجريدة: {decision.gazetteIssue}</span>
          </div>

          {decision.relatedLawArticles && decision.relatedLawArticles.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Layers className="w-3.5 h-3.5 opacity-60" />
              <span>المواد المنفذة:</span>
              <div className="flex items-center gap-1 flex-wrap">
                {decision.relatedLawArticles.map((art, idx) => (
                  <span
                    key={idx}
                    className="font-mono tabular-nums px-1.5 py-0.2 rounded text-[11px] font-semibold border"
                    style={{
                      backgroundColor: `${activeAccent.colorHex}15`,
                      color: activeAccent.colorHex,
                      borderColor: `${activeAccent.colorHex}35`,
                    }}
                  >
                    {art}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-black/5 dark:border-white/5 flex-wrap">
        {/* ملخص احكام القرار Button */}
        <button
          type="button"
          onClick={() => onView(decision, 'summary')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer"
          style={{
            backgroundColor: `${activeAccent.colorHex}15`,
            borderColor: `${activeAccent.colorHex}35`,
            color: activeAccent.colorHex,
          }}
          title="ملخص احكام القرار"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>ملخص احكام القرار</span>
        </button>

        {/* Official Scanned PDF & Written Word Buttons */}
        <div className="flex items-center gap-1.5 relative flex-wrap">
          {/* Official Scanned PDF Button */}
          <button
            type="button"
            onClick={() => onView(decision, 'scanned_pdf')}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
              decision.pdfAttachment
                ? 'bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800 hover:bg-rose-100'
                : 'opacity-80 border-black/10 dark:border-white/10 hover:opacity-100'
            }`}
            title={
              decision.pdfAttachment
                ? `النسخة الرسمية: استعراض النسخة الممسوحة ضوئياً (${decision.pdfAttachment.filename})`
                : 'النسخة الرسمية: رفع واستعراض النسخة الممسوحة ضوئياً (PDF)'
            }
          >
            <Printer className="w-3.5 h-3.5 text-rose-500" />
            <span>النسخة الرسمية (PDF)</span>
            {decision.pdfAttachment ? (
              <span className="text-[10px] text-emerald-600 font-bold">✓</span>
            ) : (
              <span className="text-[10px] opacity-60 font-normal">[رفع]</span>
            )}
          </button>

          {/* Written Word Download for Easy Copying */}
          <button
            type="button"
            onClick={() => exportDecisionAsWord(decision)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300/60 hover:bg-sky-100 rounded-md transition-colors cursor-pointer"
            title="النسخة المكتوبة: تحميل بصيغة Word (.doc) لتيسير النقل منها"
          >
            <FileDown className="w-3.5 h-3.5 text-sky-500" />
            <span>النسخة المكتوبة (Word)</span>
          </button>

          {/* Save Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSaveMenu(!showSaveMenu)}
              className={`inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium border rounded-md transition-colors cursor-pointer ${
                activeTheme.isDark
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
              title="المزيد من خيارات الحفظ والاستعراض"
            >
              <Download className="w-3.5 h-3.5 opacity-75" />
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showSaveMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowSaveMenu(false)}
                />
                <div
                  className={`absolute left-0 bottom-full mb-1.5 w-60 rounded-lg shadow-xl border py-1 z-30 text-xs font-cairo ${
                    activeTheme.isDark
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                      : 'bg-white border-stone-200 text-stone-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      exportDecisionAsWord(decision);
                      setShowSaveMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between cursor-pointer"
                  >
                    <span>تحميل النسخة المكتوبة Word (.doc)</span>
                    <FileDown className="w-3.5 h-3.5 text-sky-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSaveMenu(false);
                      onView(decision, 'written_text');
                    }}
                    className="w-full text-right px-3 py-2 opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between cursor-pointer"
                  >
                    <span>استعراض النص المكتوب للنسخ</span>
                    <Eye className="w-3.5 h-3.5 opacity-60" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSaveMenu(false);
                      onView(decision, 'scanned_pdf');
                    }}
                    className="w-full text-right px-3 py-2 opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between cursor-pointer border-t border-black/5 dark:border-white/5"
                  >
                    <span>استعراض / رفع النسخة الممسوحة (PDF)</span>
                    <Printer className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportDecisionAsText(decision);
                      setShowSaveMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between cursor-pointer border-t border-black/5 dark:border-white/5"
                  >
                    <span>حفظ ملف نصي (.txt)</span>
                    <FileText className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Edit & Delete */}
          <button
            type="button"
            onClick={() => onEdit(decision)}
            className="p-1.5 opacity-60 hover:opacity-100 rounded-md transition-colors cursor-pointer"
            title="تعديل القرار"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`هل أنت متأكد من حذف قرار رقم (${decision.decisionNumber}) لسنة ${decision.year}؟`)) {
                onDelete(decision.id);
              }
            }}
            className="p-1.5 opacity-60 hover:text-rose-500 hover:opacity-100 rounded-md transition-colors cursor-pointer"
            title="حذف القرار"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
