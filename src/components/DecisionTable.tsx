import React, { useState, useRef, useEffect } from 'react';
import {
  Eye,
  Printer,
  Download,
  Star,
  Edit3,
  Trash2,
  FileText,
  FileDown,
  Check,
  X,
  Plus,
  Search,
  BookOpen,
  Layers,
  Sparkles
} from 'lucide-react';
import { MinisterialDecision } from '../types/decision';
import { exportDecisionAsWord, exportDecisionAsText, exportDecisionAsPdf } from '../utils/exportUtils';
import { useTheme } from '../context/ThemeContext';
import { useUserAccess } from '../context/UserAccessContext';
import {
  CANONICAL_LAW_ARTICLES,
  parseArticlesString,
  normalizeArticleName,
  generateLegalBasisSummary
} from '../utils/lawArticlesHelper';

export type DecisionModalTab = 'scanned_pdf' | 'written_text' | 'summary' | 'split';

interface DecisionTableProps {
  decisions: MinisterialDecision[];
  onView: (decision: MinisterialDecision, initialTab?: DecisionModalTab) => void;
  onPrint: (decision: MinisterialDecision) => void;
  onEdit: (decision: MinisterialDecision) => void;
  onUpdateDecision?: (decision: MinisterialDecision) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const DecisionTable: React.FC<DecisionTableProps> = ({
  decisions,
  onView,
  onPrint,
  onEdit,
  onUpdateDecision,
  onDelete,
  onToggleFavorite,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const { activeTheme, activeAccent } = useTheme();
  const { canEditTexts, canDelete, canAddDocuments } = useUserAccess();

  // Inline Cell Editing State for "المواد المنفذة"
  const [editingDecisionId, setEditingDecisionId] = useState<string | null>(null);
  const [currentArticles, setCurrentArticles] = useState<string[]>([]);
  const [customArticleInput, setCustomArticleInput] = useState('');
  const [showLawPicker, setShowLawPicker] = useState(false);
  const [lawSearchQuery, setLawSearchQuery] = useState('');

  const editCellRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Close editor if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (editCellRef.current && !editCellRef.current.contains(event.target as Node)) {
        // Do not auto-close on simple clicks to avoid accidental work loss, but user can cancel
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartEditArticles = (decision: MinisterialDecision) => {
    setEditingDecisionId(decision.id);
    setCurrentArticles([...decision.relatedLawArticles]);
    setCustomArticleInput('');
    setShowLawPicker(false);
    setLawSearchQuery('');
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 50);
  };

  const handleCancelEdit = () => {
    setEditingDecisionId(null);
    setCurrentArticles([]);
    setCustomArticleInput('');
    setShowLawPicker(false);
  };

  const handleSaveArticles = (decision: MinisterialDecision) => {
    // If there's text typed in the input, parse it first
    let finalArticles = [...currentArticles];
    if (customArticleInput.trim()) {
      const extra = parseArticlesString(customArticleInput);
      for (const item of extra) {
        if (!finalArticles.includes(item)) {
          finalArticles.push(item);
        }
      }
    }

    if (finalArticles.length === 0) {
      finalArticles = ['قانون العمل 14 لسنة 2025'];
    }

    const updatedDecision: MinisterialDecision = {
      ...decision,
      relatedLawArticles: finalArticles,
      legalBasisSummary: generateLegalBasisSummary(finalArticles),
      updatedAt: new Date().toISOString(),
    };

    if (onUpdateDecision) {
      onUpdateDecision(updatedDecision);
    }

    setEditingDecisionId(null);
    setCurrentArticles([]);
    setCustomArticleInput('');
    setShowLawPicker(false);
  };

  const handleRemoveArticle = (artToRemove: string) => {
    setCurrentArticles((prev) => prev.filter((a) => a !== artToRemove));
  };

  const handleToggleArticleFromPicker = (artNumber: string) => {
    setCurrentArticles((prev) => {
      if (prev.includes(artNumber)) {
        return prev.filter((a) => a !== artNumber);
      } else {
        return [...prev, artNumber];
      }
    });
  };

  const handleAddCustomArticle = () => {
    if (!customArticleInput.trim()) return;
    const parsed = parseArticlesString(customArticleInput);
    if (parsed.length > 0) {
      setCurrentArticles((prev) => {
        const set = new Set([...prev, ...parsed]);
        return Array.from(set);
      });
      setCustomArticleInput('');
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    decision: MinisterialDecision
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (customArticleInput.trim()) {
        handleAddCustomArticle();
      } else {
        handleSaveArticles(decision);
      }
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Filter canonical articles by search
  const filteredCanonicalArticles = CANONICAL_LAW_ARTICLES.filter((item) => {
    if (!lawSearchQuery.trim()) return true;
    const q = lawSearchQuery.toLowerCase();
    return (
      item.articleNumber.toLowerCase().includes(q) ||
      item.label.toLowerCase().includes(q) ||
      item.topic.toLowerCase().includes(q) ||
      item.chapter.toLowerCase().includes(q)
    );
  });

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
                ? 'bg-[#f4ebd9] border-[#e4d7c5] text-[#281d14]'
                : 'bg-stone-50 border-stone-200 text-stone-700'
            }`}
          >
            <tr>
              <th className="py-3 px-4 font-semibold">التشريع والعدد</th>
              <th className="py-3 px-4 font-semibold min-w-[260px]">
                عنوان وموضوع التشريع والجريدة
              </th>
              <th className="py-3 px-4 font-semibold">التصنيف الموضوعي</th>
              <th className="py-3 px-4 font-semibold min-w-[200px]">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span>المواد المنفذة من قانون العمل</span>
                  <span className="text-[10px] opacity-60 font-normal">
                    (انقر للتعديل المباشر)
                  </span>
                </div>
              </th>
              <th className="py-3 px-4 font-semibold">تاريخ السريان</th>
              <th className="py-3 px-4 font-semibold">الحالة</th>
              <th className="py-3 px-4 font-semibold text-center min-w-[190px]">
                الخيارات والتحميل
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-black/5 dark:divide-white/5 font-sans">
            {decisions.map((decision) => {
              const isEditingThis = editingDecisionId === decision.id;

              return (
                <tr
                  key={decision.id}
                  className={`transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02] ${
                    isEditingThis ? 'bg-amber-500/5' : ''
                  }`}
                >
                  {/* Decision Number, Year & Legislation Type */}
                  <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: `${activeAccent.colorHex}20`,
                          color: activeAccent.colorHex,
                        }}
                      >
                        {decision.decisionNumber} / {decision.year}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 opacity-80 whitespace-nowrap font-sans">
                        {decision.legislationType || 'قرار وزاري'}
                      </span>
                    </div>
                  </td>

                  {/* Title and metadata */}
                  <td className="py-3 px-4">
                    <div className="flex items-start gap-1.5">
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

                  {/* Law Articles (المواد المنفذة للقرارات) - Interactive Editable Cell */}
                  <td className="py-3 px-4 relative">
                    {isEditingThis ? (
                      /* ACTIVE INLINE CELL EDITOR */
                      <div
                        ref={editCellRef}
                        className={`min-w-[300px] sm:min-w-[360px] p-3 rounded-xl border shadow-xl z-30 flex flex-col gap-2.5 text-xs ${
                          activeTheme.isDark
                            ? 'bg-zinc-900 border-amber-500/60 text-zinc-100 shadow-black/80'
                            : 'bg-white border-amber-400 text-stone-900 shadow-stone-400/40'
                        }`}
                      >
                        {/* Editor Header */}
                        <div className="flex items-center justify-between border-b pb-1.5 border-black/10 dark:border-white/10">
                          <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 text-xs">
                            <Layers className="w-3.5 h-3.5" />
                            <span>تعديل المواد المنفذة من قانون العمل 14/2025:</span>
                          </div>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold">
                            {currentArticles.length} مواد محددة
                          </span>
                        </div>

                        {/* Selected Articles Chips Container */}
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                          {currentArticles.length > 0 ? (
                            currentArticles.map((art) => (
                              <span
                                key={art}
                                className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-md border shadow-2xs"
                                style={{
                                  backgroundColor: `${activeAccent.colorHex}20`,
                                  borderColor: `${activeAccent.colorHex}50`,
                                  color: activeAccent.colorHex,
                                }}
                              >
                                <span>{art}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveArticle(art)}
                                  className="text-stone-400 hover:text-rose-500 transition-colors p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                                  title={`إزالة ${art}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-stone-400 italic p-1">
                              لم يتم اختيار مواد بعد. أدخل أرقام المواد أدناه أو اختر من القائمة.
                            </span>
                          )}
                        </div>

                        {/* Direct Input Row */}
                        <div className="flex items-center gap-1.5">
                          <input
                            ref={textInputRef}
                            type="text"
                            value={customArticleInput}
                            onChange={(e) => setCustomArticleInput(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, decision)}
                            placeholder="أدخل المادة (مثال: 50 أو 88 أو 128)..."
                            className="flex-1 px-2.5 py-1.5 rounded-lg text-xs border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomArticle}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-200 dark:bg-zinc-700 hover:bg-stone-300 dark:hover:bg-zinc-600 font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 text-xs"
                            title="إضافة المادة"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>إضافة</span>
                          </button>
                        </div>

                        {/* Toggle Canonical Law Articles Picker */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setShowLawPicker(!showLawPicker)}
                            className="w-full text-right py-1 px-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center justify-between cursor-pointer bg-amber-500/10 rounded-md border border-amber-500/20"
                          >
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              <span>{showLawPicker ? 'إخفاء جدول مواد القانون 14 لسنة 2025' : 'استعراض واختيار من مواد قانون العمل الرسمية...'}</span>
                            </span>
                            <span className="font-mono text-[10px]">{CANONICAL_LAW_ARTICLES.length} مادة</span>
                          </button>

                          {/* Searchable Picker Tray */}
                          {showLawPicker && (
                            <div className="mt-2 p-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-850 space-y-2 max-h-48 overflow-y-auto">
                              <div className="relative">
                                <Search className="w-3 h-3 absolute right-2.5 top-2 opacity-50" />
                                <input
                                  type="text"
                                  value={lawSearchQuery}
                                  onChange={(e) => setLawSearchQuery(e.target.value)}
                                  placeholder="ابحث برقم المادة أو الموضوع (مثال: أجور، نساء، تفتيش)..."
                                  className="w-full pr-7 pl-2 py-1 text-[11px] rounded border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none"
                                />
                              </div>

                              <div className="grid grid-cols-1 gap-1">
                                {filteredCanonicalArticles.map((item) => {
                                  const isSelected = currentArticles.includes(item.articleNumber);
                                  return (
                                    <button
                                      key={item.articleNumber}
                                      type="button"
                                      onClick={() => handleToggleArticleFromPicker(item.articleNumber)}
                                      className={`text-right p-1.5 rounded text-[11px] flex items-center justify-between gap-1 transition-colors cursor-pointer border ${
                                        isSelected
                                          ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-400 text-amber-900 dark:text-amber-200 font-bold'
                                          : 'hover:bg-white dark:hover:bg-zinc-800 border-transparent text-stone-700 dark:text-zinc-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 overflow-hidden">
                                        <span className="font-mono font-bold shrink-0">{item.articleNumber}</span>
                                        <span className="truncate opacity-80 text-[10px]">({item.topic})</span>
                                      </div>
                                      {isSelected ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                      ) : (
                                        <span className="text-[10px] opacity-40">+</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Save & Cancel Action Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10 mt-1">
                          <span className="text-[10px] opacity-50">
                            Enter للحفظ · Esc للإلغاء
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-2.5 py-1 rounded-md text-stone-500 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              إلغاء
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveArticles(decision)}
                              className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>حفظ المواد</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* READ-ONLY DISPLAY WITH INLINE EDIT TRIGGER */
                      <div className="group flex items-center gap-1.5 flex-wrap">
                        {decision.relatedLawArticles && decision.relatedLawArticles.length > 0 ? (
                          decision.relatedLawArticles.map((art, idx) => (
                            <span
                              key={idx}
                              className="font-mono text-xs font-semibold px-2 py-0.5 rounded border inline-block cursor-pointer hover:shadow-xs transition-all"
                              style={{
                                color: activeAccent.colorHex,
                                backgroundColor: `${activeAccent.colorHex}15`,
                                borderColor: `${activeAccent.colorHex}35`,
                              }}
                              onClick={() => handleStartEditArticles(decision)}
                              title="انقر لتعديل المواد المنفذة"
                            >
                              {art}
                            </span>
                          ))
                        ) : (
                          <span
                            onClick={() => handleStartEditArticles(decision)}
                            className="opacity-40 italic text-xs cursor-pointer hover:underline"
                          >
                            لم تحدد مواد (انقر للإضافة)
                          </span>
                        )}

                        {onUpdateDecision && (
                          <button
                            type="button"
                            onClick={() => handleStartEditArticles(decision)}
                            className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-all text-xs cursor-pointer text-amber-500 hover:text-amber-600 hover:scale-110"
                            title="تعديل المواد المنفذة في هذا القرار مباشرة"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
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
                      {/* View: استعراض التشريع */}
                      <button
                        type="button"
                        onClick={() => onView(decision, 'summary')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border transition-all hover:scale-105 cursor-pointer"
                        style={{
                          backgroundColor: `${activeAccent.colorHex}15`,
                          borderColor: `${activeAccent.colorHex}35`,
                          color: activeAccent.colorHex,
                        }}
                        title="استعراض ملخص ومواد التشريع"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>استعراض</span>
                      </button>

                      {/* View: Scanned PDF Official Copy */}
                      <button
                        type="button"
                        onClick={() => onView(decision, 'scanned_pdf')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/80 text-rose-700 dark:text-rose-300 transition-colors cursor-pointer"
                        title="استعراض النسخة الرسمية الممسوحة ضوئياً (PDF)"
                      >
                        <FileDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>PDF رسمي</span>
                      </button>

                      {/* Download Word Document */}
                      <button
                        type="button"
                        onClick={() => exportDecisionAsWord(decision)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-950/80 text-sky-700 dark:text-sky-300 transition-colors cursor-pointer"
                        title="تحميل نسخة وورد (Word .doc) مكتوبة لتيسير النقل"
                      >
                        <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span>Word</span>
                      </button>

                      {/* Print */}
                      <button
                        type="button"
                        onClick={() => onPrint(decision)}
                        className="p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        title="طباعة"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {/* Favorite */}
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(decision.id)}
                        className="p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        title={decision.isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            decision.isFavorite
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-400'
                          }`}
                        />
                      </button>

                      {/* Edit full form */}
                      {canEditTexts && (
                        <button
                          type="button"
                          onClick={() => onEdit(decision)}
                          className="p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-sky-600 dark:text-sky-400"
                          title="تعديل تفاصيل القرار بالكامل (صلاحية التعديل)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete */}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(decision.id)}
                          className="p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 transition-colors cursor-pointer"
                          title="حذف القرار (صلاحية الحذف)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
