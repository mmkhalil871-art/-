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
import { exportDecisionAsWord, exportDecisionAsText, exportDecisionAsPdf } from '../utils/exportUtils';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'نافذ':
      case 'سارٍ':
        return 'text-emerald-700 font-semibold';
      case 'معدل':
        return 'text-amber-700 font-semibold';
      case 'ملغى':
        return 'text-rose-700 font-semibold';
      default:
        return 'text-stone-700';
    }
  };

  return (
    <article className="group bg-white rounded-xl border border-stone-200 p-5 sm:p-6 hover:border-amber-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Kicker: Clean unboxed metadata with typographic separators */}
        <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono tabular-nums text-stone-700 font-medium">
              قرار وزاري رقم {decision.decisionNumber} لسنة {decision.year}
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="text-stone-600">{decision.category}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className={getStatusColor(decision.status)}>
              {decision.status}
            </span>
            {decision.pdfAttachment ? (
              <>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[11px] font-bold">
                  ✓ نسخة ممسوحة ضوئياً (PDF)
                </span>
              </>
            ) : (
              <>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded text-[11px]">
                  النسخة الممسوحة: لم تُرفع
                </span>
              </>
            )}
          </div>

          {/* Favorite button */}
          <button
            type="button"
            onClick={() => onToggleFavorite(decision.id)}
            className="text-stone-400 hover:text-amber-500 p-1 transition-colors cursor-pointer"
            title={decision.isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          >
            <Star
              className={`w-4 h-4 ${
                decision.isFavorite ? 'fill-amber-400 text-amber-500' : ''
              }`}
            />
          </button>
        </div>

        {/* Title: clickable link for instant view */}
        <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug group-hover:text-amber-700 transition-colors mb-3">
          <button
            type="button"
            onClick={() => onView(decision)}
            className="text-right hover:underline cursor-pointer block"
          >
            {decision.title}
          </button>
        </h3>

        {/* Preamble preview snippet */}
        <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed mb-4">
          {decision.preamble}
        </p>

        {/* Related Law Articles & Execution Info */}
        <div className="space-y-2 text-xs border-t border-stone-100 pt-3 mb-4">
          {decision.legalBasisSummary ? (
            <div className="bg-amber-50/90 border border-amber-200/90 rounded-lg p-2 text-amber-950 font-medium">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                <span>السند التشريعي المباشر:</span>
              </div>
              <div className="text-[11px] leading-relaxed text-amber-900">
                {decision.legalBasisSummary}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-stone-700 font-medium shrink-0">مواد القانون المنفذة:</span>
              <span className="text-amber-800 font-mono">
                {decision.relatedLawArticles.join(' · ')}
              </span>
            </div>
          )}

          {decision.executingSubject && (
            <div className="text-[11px] text-stone-600 flex items-center gap-1.5">
              <span className="font-bold text-stone-700">موضوع التنفيذ:</span>
              <span className="text-stone-800">{decision.executingSubject}</span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap text-stone-500 text-[11px]">
            <span>تاريخ الصدور: {decision.issueDate}</span>
            <span aria-hidden="true">·</span>
            <span>السريان: {decision.effectiveDate}</span>
            <span aria-hidden="true">·</span>
            <span>{decision.articles.length} مواد</span>
          </div>
        </div>
      </div>

      {/* Action Footer: View, Print, Save, Edit */}
      <div className="border-t border-stone-100 pt-3 flex items-center justify-between gap-2 flex-wrap">
        {/* Primary View: ملخص احكام القرار */}
        <button
          type="button"
          onClick={() => onView(decision, 'summary')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-900 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-md transition-colors cursor-pointer"
          title="ملخص احكام القرار"
        >
          <Eye className="w-3.5 h-3.5 text-amber-700" />
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
                ? 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
            title={
              decision.pdfAttachment
                ? `النسخة الرسمية: استعراض النسخة الممسوحة ضوئياً (${decision.pdfAttachment.filename})`
                : 'النسخة الرسمية: رفع واستعراض النسخة الممسوحة ضوئياً (PDF)'
            }
          >
            <Printer className="w-3.5 h-3.5 text-rose-600" />
            <span>النسخة الرسمية (PDF)</span>
            {decision.pdfAttachment ? (
              <span className="text-[10px] text-emerald-700 font-bold">✓</span>
            ) : (
              <span className="text-[10px] text-stone-400 font-normal">[رفع]</span>
            )}
          </button>

          {/* Written Word Download for Easy Copying */}
          <button
            type="button"
            onClick={() => exportDecisionAsWord(decision)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-md transition-colors cursor-pointer"
            title="النسخة المكتوبة: تحميل بصيغة Word (.doc) لتيسير النقل منها"
          >
            <FileDown className="w-3.5 h-3.5 text-sky-600" />
            <span>النسخة المكتوبة (Word)</span>
          </button>

          {/* Save Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSaveMenu(!showSaveMenu)}
              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-md transition-colors cursor-pointer"
              title="المزيد من خيارات الحفظ والاستعراض"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {showSaveMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowSaveMenu(false)}
                />
                <div className="absolute left-0 bottom-full mb-1.5 w-60 bg-white rounded-lg shadow-lg border border-stone-200 py-1 z-30 text-xs font-cairo">
                  <button
                    type="button"
                    onClick={() => {
                      exportDecisionAsWord(decision);
                      setShowSaveMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 text-stone-700 hover:bg-stone-50 flex items-center justify-between cursor-pointer"
                  >
                    <span>تحميل النسخة المكتوبة Word (.doc)</span>
                    <FileDown className="w-3.5 h-3.5 text-sky-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSaveMenu(false);
                      onView(decision, 'written_text');
                    }}
                    className="w-full text-right px-3 py-2 text-stone-700 hover:bg-stone-50 flex items-center justify-between cursor-pointer"
                  >
                    <span>استعراض النص المكتوب للنسخ</span>
                    <Eye className="w-3.5 h-3.5 text-stone-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSaveMenu(false);
                      onView(decision, 'scanned_pdf');
                    }}
                    className="w-full text-right px-3 py-2 text-stone-700 hover:bg-stone-50 flex items-center justify-between cursor-pointer border-t border-stone-100"
                  >
                    <span>استعراض / رفع النسخة الممسوحة (PDF)</span>
                    <Printer className="w-3.5 h-3.5 text-rose-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportDecisionAsText(decision);
                      setShowSaveMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 text-stone-700 hover:bg-stone-50 flex items-center justify-between cursor-pointer border-t border-stone-100"
                  >
                    <span>حفظ ملف نصي (.txt)</span>
                    <FileText className="w-3.5 h-3.5 text-stone-600" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Edit & Delete */}
          <button
            type="button"
            onClick={() => onEdit(decision)}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors cursor-pointer"
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
            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
            title="حذف القرار"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
