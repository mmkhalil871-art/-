import React, { useState } from 'react';
import { Eye, Printer, Download, Star, Edit3, Trash2, FileText, FileDown } from 'lucide-react';
import { MinisterialDecision } from '../types/decision';
import { exportDecisionAsWord, exportDecisionAsText, exportDecisionAsPdf } from '../utils/exportUtils';
import { useTheme } from '../context/ThemeContext';

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
  const { activeTheme, activeAccent } = useTheme();

  return (
    <div
      className={`rounded-xl border overflow-hidden shadow-2xs transition-colors duration-200 ${
        activeTheme.isDark
          ? 'bg-zinc-800/80 border-zinc-700/80 text-zinc-100'
          : activeTheme.id === 'parchment'
          ? 'bg-[#fffdf9] border-[#e4d7c5] text-[#281d14]'
          : 'bg-white border-stone-200 text-stone-800'
      }`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs sm:text-sm">
          <thead
            className={`border-b text-xs font-semibold ${
              activeTheme.isDark
                ? 'bg-zinc-900/90 border-zinc-700 text-zinc-300'
                : activeTheme.id === 'parchment'
                ? 'bg-[#f4ebe0] border-[#dcd0bf] text-[#4d3a2a]'
                : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
          >
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
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {decisions.map((decision) => (
              <tr
                key={decision.id}
                className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {/* Favorite */}
                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(decision.id)}
                    className="opacity-60 hover:opacity-100 transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        decision.isFavorite ? 'fill-amber-400 text-amber-500' : 'text-stone-400'
                      }`}
                    />
                  </button>
                </td>

                {/* Number & Year */}
                <td className="py-3 px-4 font-mono tabular-nums font-semibold whitespace-nowrap">
                  {decision.decisionNumber} / {decision.year}
                </td>

                {/* Title */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView(decision)}
                      className="text-right font-medium hover:underline cursor-pointer block line-clamp-2"
                      style={{ color: activeTheme.isDark ? '#f4f4f5' : '#1c1917' }}
                    >
                      {decision.title}
                    </button>
                    {decision.pdfAttachment && (
                      <span className="shrink-0 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 px-1.5 py-0.5 rounded border border-rose-300/60">
                        PDF
                      </span>
                    )}
                  </div>
                  {decision.executingSubject && (
                    <div
                      className="text-[11px] font-medium mt-0.5"
                      style={{ color: activeAccent.colorHex }}
                    >
                      ⚡ تنفيذاً لـ: {decision.executingSubject}
                    </div>
                  )}
                  <div className="text-xs opacity-60 mt-0.5 line-clamp-1">
                    {decision.gazetteIssue} ({decision.gazetteDate})
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-4 opacity-75 whitespace-nowrap">
                  {decision.category}
                </td>

                {/* Law Articles */}
                <td
                  className="py-3 px-4 font-mono text-xs font-semibold whitespace-nowrap"
                  style={{ color: activeAccent.colorHex }}
                >
                  {decision.relatedLawArticles.join(', ')}
                </td>

                {/* Effective Date */}
                <td className="py-3 px-4 font-mono tabular-nums opacity-75 whitespace-nowrap">
                  {decision.effectiveDate}
                </td>

                {/* Status */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={
                      decision.status === 'نافذ' || decision.status === 'سارٍ'
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : decision.status === 'معدل'
                        ? 'text-amber-600 dark:text-amber-400 font-semibold'
                        : 'text-rose-600 dark:text-rose-400 font-semibold'
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
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer"
                      style={{
                        backgroundColor: `${activeAccent.colorHex}15`,
                        borderColor: `${activeAccent.colorHex}35`,
                        color: activeAccent.colorHex,
                      }}
                      title="ملخص احكام القرار"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">ملخص الأحكام</span>
                    </button>

                    {/* Official Scanned PDF Document */}
                    <button
                      type="button"
                      onClick={() => onView(decision, 'scanned_pdf')}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                        decision.pdfAttachment
                          ? 'bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800 hover:bg-rose-100'
                          : 'opacity-70 border-black/10 dark:border-white/10 hover:opacity-100'
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
                        <span className="text-[10px] opacity-60">[رفع]</span>
                      )}
                    </button>

                    {/* Written Word Document */}
                    <button
                      type="button"
                      onClick={() => exportDecisionAsWord(decision)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-sky-700 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300/60 hover:bg-sky-100 rounded-md transition-colors cursor-pointer"
                      title="النسخة المكتوبة: تحميل بصيغة Word (.doc) لتيسير النقل منها"
                    >
                      <FileDown className="w-3.5 h-3.5 text-sky-500" />
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
                        className={`p-1.5 rounded-md transition-colors cursor-pointer opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5`}
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
                          <div
                            className={`absolute left-0 mt-1 w-48 rounded-lg shadow-xl border py-1 z-30 text-xs font-cairo ${
                              activeTheme.isDark
                                ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                                : 'bg-white border-stone-200 text-stone-800'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                exportDecisionAsWord(decision);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-right px-3 py-2 opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between cursor-pointer"
                            >
                              <span>النسخة الرسمية Word (.doc)</span>
                              <FileDown className="w-3.5 h-3.5 text-sky-500" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                exportDecisionAsPdf(decision);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-right px-3 py-2 opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between cursor-pointer"
                            >
                              <span>النسخة الرسمية PDF</span>
                              <Printer className="w-3.5 h-3.5 text-rose-500" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                exportDecisionAsText(decision);
                                setActiveMenuId(null);
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

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => onEdit(decision)}
                      className="p-1.5 opacity-60 hover:opacity-100 rounded-md transition-colors cursor-pointer"
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
                      className="p-1.5 opacity-60 hover:text-rose-500 hover:opacity-100 rounded-md transition-colors cursor-pointer"
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
