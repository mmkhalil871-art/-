import React, { useState } from 'react';
import { Eye, Printer, Download, Star, Edit3, Trash2, ChevronDown, FileText, FileDown } from 'lucide-react';
import { MinisterialDecision } from '../types/decision';
import { exportDecisionAsWord, exportDecisionAsText, exportDecisionAsPdf } from '../utils/exportUtils';

export type DecisionModalTab = 'scanned_pdf' | 'written_text' | 'summary' | 'split';

interface DecisionTableProps {
  decisions: MinisterialDecision[];
  onView: (decision: MinisterialDecision, initialTab?: DecisionModalTab) => void;
  onPrint: (decision: MinisterialDecision) => void;
  onEdit: (decision: MinisterialDecision) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const DecisionTable: React.FC<DecisionTableProps> = ({
  decisions,
  onView,
  onPrint,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs sm:text-sm text-stone-800">
          <thead className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-600">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">المفضلة</th>
              <th className="py-3.5 px-4 w-28">رقم القرار</th>
              <th className="py-3.5 px-4">عنوان القرار والموضوع</th>
              <th className="py-3.5 px-4 w-40">التصنيف</th>
              <th className="py-3.5 px-4 w-32">المواد المنفذة</th>
              <th className="py-3.5 px-4 w-28">تاريخ السريان</th>
              <th className="py-3.5 px-4 w-24">الحالة</th>
              <th className="py-3.5 px-4 w-44 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {decisions.map((decision) => (
              <tr
                key={decision.id}
                className="hover:bg-stone-50/80 transition-colors"
              >
                {/* Favorite */}
                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(decision.id)}
                    className="text-stone-300 hover:text-amber-500 transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        decision.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                      }`}
                    />
                  </button>
                </td>

                {/* Number & Year */}
                <td className="py-3 px-4 font-mono tabular-nums font-semibold text-stone-900 whitespace-nowrap">
                  {decision.decisionNumber} / {decision.year}
                </td>

                {/* Title */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView(decision)}
                      className="text-right font-medium text-stone-900 hover:text-amber-700 hover:underline cursor-pointer block line-clamp-2"
                    >
                      {decision.title}
                    </button>
                    {decision.pdfAttachment && (
                      <span className="shrink-0 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        PDF
                      </span>
                    )}
                  </div>
                  {decision.executingSubject && (
                    <div className="text-[11px] text-amber-800 font-medium mt-0.5">
                      ⚡ تنفيذاً لـ: {decision.executingSubject}
                    </div>
                  )}
                  <div className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                    {decision.gazetteIssue} ({decision.gazetteDate})
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                  {decision.category}
                </td>

                {/* Law Articles */}
                <td className="py-3 px-4 font-mono text-xs text-amber-800 whitespace-nowrap">
                  {decision.relatedLawArticles.join(', ')}
                </td>

                {/* Effective Date */}
                <td className="py-3 px-4 font-mono tabular-nums text-stone-600 whitespace-nowrap">
                  {decision.effectiveDate}
                </td>

                {/* Status */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={
                      decision.status === 'نافذ' || decision.status === 'سارٍ'
                        ? 'text-emerald-700 font-semibold'
                        : decision.status === 'معدل'
                        ? 'text-amber-700 font-semibold'
                        : 'text-rose-700 font-semibold'
                    }
                  >
                    {decision.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5">
                    {/* View: ملخص احكام القرار */}
                    <button
                      type="button"
                      onClick={() => onView(decision, 'summary')}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-stone-800 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-md transition-colors cursor-pointer"
                      title="ملخص احكام القرار"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-700" />
                      <span className="hidden md:inline">ملخص الأحكام</span>
                    </button>

                    {/* Official Scanned PDF Document */}
                    <button
                      type="button"
                      onClick={() => onView(decision, 'scanned_pdf')}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
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
                        <span className="text-[10px] text-stone-400">[رفع]</span>
                      )}
                    </button>

                    {/* Written Word Document */}
                    <button
                      type="button"
                      onClick={() => exportDecisionAsWord(decision)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-md transition-colors cursor-pointer"
                      title="النسخة المكتوبة: تحميل بصيغة Word (.doc) لتيسير النقل منها"
                    >
                      <FileDown className="w-3.5 h-3.5 text-sky-600" />
                      <span>النسخة المكتوبة (Word)</span>
                    </button>

                    {/* Save Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuId(
                            activeMenuId === decision.id ? null : decision.id
                          )
                        }
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                        title="خيارات الحفظ الإضافية"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {activeMenuId === decision.id && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-stone-200 py-1 z-30 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                exportDecisionAsWord(decision);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-right px-3 py-2 text-stone-700 hover:bg-stone-50 flex items-center justify-between cursor-pointer"
                            >
                              <span>النسخة الرسمية Word (.doc)</span>
                              <FileDown className="w-3.5 h-3.5 text-blue-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                exportDecisionAsPdf(decision);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-right px-3 py-2 text-stone-700 hover:bg-stone-50 flex items-center justify-between cursor-pointer"
                            >
                              <span>النسخة الرسمية PDF (طباعة وحفظ)</span>
                              <Printer className="w-3.5 h-3.5 text-rose-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                exportDecisionAsText(decision);
                                setActiveMenuId(null);
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

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => onEdit(decision)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                      title="تعديل القرار"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            `هل ترغب بحذف قرار رقم (${decision.decisionNumber})؟`
                          )
                        ) {
                          onDelete(decision.id);
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
