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
  FileDown,
  Check,
  X,
  Plus,
  BookOpen,
  Scale
} from 'lucide-react';
import { MinisterialDecision } from '../types/decision';
import { exportDecisionAsWord, exportDecisionAsText } from '../utils/exportUtils';
import { useTheme } from '../context/ThemeContext';
import { useUserAccess } from '../context/UserAccessContext';
import {
  CANONICAL_LAW_ARTICLES,
  parseArticlesString,
  generateLegalBasisSummary
} from '../utils/lawArticlesHelper';

export type DecisionModalTab = 'scanned_pdf' | 'written_text' | 'summary' | 'split';

interface DecisionCardProps {
  decision: MinisterialDecision;
  onView: (decision: MinisterialDecision, initialTab?: DecisionModalTab) => void;
  onPrint: (decision: MinisterialDecision) => void;
  onEdit: (decision: MinisterialDecision) => void;
  onUpdateDecision?: (decision: MinisterialDecision) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({
  decision,
  onView,
  onPrint,
  onEdit,
  onUpdateDecision,
  onDelete,
  onToggleFavorite,
}) => {
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { activeTheme, activeAccent } = useTheme();
  const { canEditTexts, canDelete, canAddDocuments } = useUserAccess();

  // Quick edit for enacted articles in card
  const [isEditingArticles, setIsEditingArticles] = useState(false);
  const [articlesList, setArticlesList] = useState<string[]>(decision.relatedLawArticles || []);
  const [newArticleInput, setNewArticleInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const handleStartEditing = () => {
    setArticlesList([...decision.relatedLawArticles]);
    setNewArticleInput('');
    setIsEditingArticles(true);
  };

  const handleCancelEditing = () => {
    setIsEditingArticles(false);
    setShowSuggestions(false);
  };

  const handleRemoveArticle = (art: string) => {
    setArticlesList((prev) => prev.filter((a) => a !== art));
  };

  const handleAddArticle = () => {
    if (!newArticleInput.trim()) return;
    const parsed = parseArticlesString(newArticleInput);
    if (parsed.length > 0) {
      setArticlesList((prev) => Array.from(new Set([...prev, ...parsed])));
      setNewArticleInput('');
    }
  };

  const handleToggleSuggestion = (artNum: string) => {
    setArticlesList((prev) =>
      prev.includes(artNum) ? prev.filter((a) => a !== artNum) : [...prev, artNum]
    );
  };

  const handleSaveArticles = () => {
    let final = [...articlesList];
    if (newArticleInput.trim()) {
      const extra = parseArticlesString(newArticleInput);
      final = Array.from(new Set([...final, ...extra]));
    }
    if (final.length === 0) {
      final = ['قانون العمل 14 لسنة 2025'];
    }

    const updated: MinisterialDecision = {
      ...decision,
      relatedLawArticles: final,
      legalBasisSummary: generateLegalBasisSummary(final),
      updatedAt: new Date().toISOString(),
    };

    if (onUpdateDecision) {
      onUpdateDecision(updated);
    }
    setIsEditingArticles(false);
    setShowSuggestions(false);
  };

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between specular-border-t card-elevated-hover ${
        activeTheme.isDark
          ? 'bg-zinc-850/90 border-zinc-800 hover:border-zinc-700 text-zinc-100 shadow-xs'
          : activeTheme.id === 'parchment'
          ? 'bg-[#fffdf9] border-[#e6dbc9] hover:border-[#b48d61] text-[#281d14] shadow-xs'
          : 'bg-white border-stone-200/90 hover:border-stone-300 text-stone-900 shadow-xs'
      }`}
      style={{
        boxShadow: decision.isFavorite
          ? '0 4px 20px -4px rgba(245, 158, 11, 0.15)'
          : undefined,
      }}
    >
      {/* Delicate Legal Scales Watermark in background */}
      <div className="absolute -left-6 -bottom-6 pointer-events-none opacity-[0.035] group-hover:opacity-[0.075] transition-opacity duration-300 text-current">
        <Scale className="w-32 h-32 transform -rotate-12" strokeWidth={1.2} />
      </div>

      <div>
        {/* Top Kicker */}
        <div className="flex items-center justify-between text-xs opacity-80 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono tabular-nums font-bold flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                {decision.legislationType || 'قرار وزاري'}
              </span>
              <span>رقم {decision.decisionNumber} لسنة {decision.year}</span>
            </span>
            <span aria-hidden="true" className="opacity-30">·</span>
            <span className="opacity-75">{decision.category}</span>
            <span aria-hidden="true" className="opacity-30">·</span>
            <span className={`flex items-center gap-1 ${getStatusColor(decision.status)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{decision.status}</span>
            </span>
            {decision.pdfAttachment && (
              <>
                <span aria-hidden="true" className="opacity-30">·</span>
                <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/60 px-1.5 py-0.5 rounded text-[11px] font-bold">
                  ✓ PDF رسمي
                </span>
              </>
            )}
          </div>

          {/* Favorite button */}
          <button
            type="button"
            onClick={() => onToggleFavorite(decision.id)}
            className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
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
          className="text-base sm:text-lg font-bold tracking-tight mb-2.5 cursor-pointer leading-snug hover:opacity-80 transition-opacity"
        >
          {decision.title}
        </h3>

        {/* Summary or Legal Basis */}
        <p className="text-xs opacity-80 line-clamp-3 mb-4 leading-relaxed font-sans">
          {decision.legalBasisSummary || decision.executingSubject || decision.preamble}
        </p>

        {/* Metadata info: Dates & Articles */}
        <div className="space-y-2 text-xs opacity-85 mb-4 border-t border-black/5 dark:border-white/5 pt-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 opacity-60" />
            <span>تاريخ الإصدار: </span>
            <span className="font-mono tabular-nums">{decision.issueDate}</span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span>الجريدة: {decision.gazetteIssue}</span>
          </div>

          {/* Enacted Law Articles Section with inline edit */}
          <div className="space-y-1.5 pt-1 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-xs" style={{ color: activeAccent.colorHex }}>
                <Layers className="w-3.5 h-3.5" />
                <span>المواد المنفذة من قانون العمل:</span>
              </div>
              {onUpdateDecision && (
                <button
                  type="button"
                  onClick={() => (isEditingArticles ? handleCancelEditing() : handleStartEditing())}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  title="تعديل المواد المنفذة لهذا القرار"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingArticles ? 'إلغاء' : 'تعديل'}</span>
                </button>
              )}
            </div>

            {isEditingArticles ? (
              /* Inline Card Editor */
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-amber-400/50 space-y-2 text-xs">
                {/* Active chips */}
                <div className="flex flex-wrap gap-1">
                  {articlesList.map((art) => (
                    <span
                      key={art}
                      className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300/80"
                    >
                      <span>{art}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveArticle(art)}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input row */}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newArticleInput}
                    onChange={(e) => setNewArticleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddArticle()}
                    placeholder="رقم المادة (مثل: 50 أو 88)..."
                    className="flex-1 px-2 py-1 text-xs rounded border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddArticle}
                    className="px-2 py-1 bg-stone-200 dark:bg-zinc-700 hover:bg-stone-300 text-xs font-bold rounded cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="px-2 py-1 text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded border border-amber-500/30 hover:underline cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3 inline" />
                  </button>
                </div>

                {/* Suggestions tray */}
                {showSuggestions && (
                  <div className="max-h-28 overflow-y-auto p-1.5 bg-white dark:bg-zinc-800 rounded border border-stone-200 dark:border-zinc-700 space-y-1">
                    <span className="text-[10px] text-stone-400 block mb-1">انقر لإضافة/إزالة المادة:</span>
                    <div className="flex flex-wrap gap-1">
                      {CANONICAL_LAW_ARTICLES.slice(0, 25).map((item) => (
                        <button
                          key={item.articleNumber}
                          type="button"
                          onClick={() => handleToggleSuggestion(item.articleNumber)}
                          className={`text-[10px] px-1.5 py-0.5 rounded border cursor-pointer font-mono ${
                            articlesList.includes(item.articleNumber)
                              ? 'bg-amber-500 text-white border-amber-600 font-bold'
                              : 'bg-stone-100 dark:bg-zinc-700 text-stone-700 dark:text-zinc-200 border-stone-200 dark:border-zinc-600'
                          }`}
                        >
                          {item.articleNumber}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save & Cancel */}
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    className="px-2 py-1 text-[11px] text-stone-500 hover:text-stone-700 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveArticles}
                    className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>حفظ المواد</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Display badges */
              <div className="flex items-center gap-1 flex-wrap">
                {decision.relatedLawArticles && decision.relatedLawArticles.length > 0 ? (
                  decision.relatedLawArticles.map((art, idx) => (
                    <span
                      key={idx}
                      className="font-mono tabular-nums px-1.5 py-0.2 rounded text-[11px] font-semibold border cursor-pointer hover:shadow-xs transition-shadow"
                      style={{
                        backgroundColor: `${activeAccent.colorHex}15`,
                        color: activeAccent.colorHex,
                        borderColor: `${activeAccent.colorHex}35`,
                      }}
                      onClick={handleStartEditing}
                      title="انقر للتعديل"
                    >
                      {art}
                    </span>
                  ))
                ) : (
                  <span
                    onClick={handleStartEditing}
                    className="opacity-50 italic text-[11px] cursor-pointer hover:underline"
                  >
                    لم تحدد مواد (انقر للإضافة)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between gap-2 pt-3.5 border-t border-black/5 dark:border-white/5 flex-wrap">
        {/* استعراض التشريع Button */}
        <button
          type="button"
          onClick={() => onView(decision, 'summary')}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] text-xs font-bold rounded-xl border transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          style={{
            backgroundColor: `${activeAccent.colorHex}15`,
            borderColor: `${activeAccent.colorHex}35`,
            color: activeAccent.colorHex,
          }}
          title="استعراض ملخص ومواد التشريع"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>استعراض التشريع</span>
        </button>

        {/* Official Scanned PDF & Written Word Buttons */}
        <div className="flex items-center gap-1.5 relative">
          {/* Official Scanned PDF Button */}
          <button
            type="button"
            onClick={() => onView(decision, 'scanned_pdf')}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-2 min-h-[38px] text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/80 text-rose-700 dark:text-rose-300 transition-colors active:scale-95 cursor-pointer"
            title="استعراض النسخة الرسمية الممسوحة ضوئياً (PDF)"
          >
            <FileDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>PDF رسمي</span>
          </button>

          {/* Download Word Document */}
          <button
            type="button"
            onClick={() => exportDecisionAsWord(decision)}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-2 min-h-[38px] text-xs font-bold rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-950/80 text-sky-700 dark:text-sky-300 transition-colors active:scale-95 cursor-pointer"
            title="تحميل نسخة وورد (Word .doc) مكتوبة لتيسير النقل"
          >
            <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Word</span>
          </button>

          {/* More options menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSaveMenu(!showSaveMenu)}
              className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-stone-200 dark:border-zinc-700 hover:bg-black/5 dark:hover:bg-white/5 opacity-75 hover:opacity-100 transition-colors cursor-pointer"
              title="خيارات إضافية"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showSaveMenu && (
              <div
                className={`absolute left-0 bottom-full mb-2 w-48 rounded-xl shadow-xl border p-1 text-xs z-20 ${
                  activeTheme.isDark
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-200 shadow-black/60'
                    : 'bg-white border-stone-200 text-stone-800 shadow-stone-400/20'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveMenu(false);
                    onPrint(decision);
                  }}
                  className="w-full text-right px-3 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-500" />
                  <span>طباعة القرار رسمياً</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSaveMenu(false);
                    exportDecisionAsText(decision);
                  }}
                  className="w-full text-right px-3 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <span>تصدير نص القرار (.txt)</span>
                </button>

                {(canEditTexts || canDelete) && (
                  <div className="border-t border-black/5 dark:border-white/5 my-1" />
                )}

                {canEditTexts && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowSaveMenu(false);
                      onEdit(decision);
                    }}
                    className="w-full text-right px-3 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer text-sky-600 dark:text-sky-400 font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل تفاصيل القرار (صلاحية التعديل)</span>
                  </button>
                )}

                {canDelete && (
                  confirmDelete ? (
                    <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/30 text-[11px] space-y-1.5 my-1">
                      <div className="text-rose-600 dark:text-rose-400 font-bold">تأكيد حذف القرار رقم {decision.decisionNumber}؟</div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="px-2 py-0.5 rounded text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSaveMenu(false);
                            setConfirmDelete(false);
                            onDelete(decision.id);
                          }}
                          className="px-2.5 py-0.5 rounded bg-rose-600 text-white font-bold hover:bg-rose-500"
                        >
                          حذف نهائي
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="w-full text-right px-3 py-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف القرار (صلاحية الحذف)</span>
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
