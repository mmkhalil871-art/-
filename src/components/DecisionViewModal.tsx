import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  Star,
  Edit3,
  ZoomIn,
  ZoomOut,
  FileText,
  FileDown,
  Scale,
  Layers,
  ChevronLeft,
  BookOpen,
  FileUp,
  FileCheck,
  ExternalLink,
  Trash2,
  RefreshCw,
  Columns,
  Plus
} from 'lucide-react';
import { MinisterialDecision } from '../types/decision';
import {
  exportDecisionAsWord,
  exportDecisionAsText,
  exportDecisionAsPdf,
  formatDecisionTextForCopy
} from '../utils/exportUtils';
import {
  getPdfFromStorage,
  savePdfToStorage,
  formatFileSize
} from '../utils/pdfStorage';
import {
  CANONICAL_LAW_ARTICLES,
  parseArticlesString,
  generateLegalBasisSummary
} from '../utils/lawArticlesHelper';

import mammoth from 'mammoth';
import { useUserAccess } from '../context/UserAccessContext';

export type DecisionModalTab = 'scanned_pdf' | 'written_text' | 'summary' | 'split';

interface DecisionViewModalProps {
  decision: MinisterialDecision | null;
  initialTab?: DecisionModalTab;
  onClose: () => void;
  onEdit: (decision: MinisterialDecision) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSelectLawArticle?: (articleNumber: string) => void;
  onUpdateDecision?: (updated: MinisterialDecision) => void;
}

export const DecisionViewModal: React.FC<DecisionViewModalProps> = ({
  decision,
  initialTab,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onSelectLawArticle,
  onUpdateDecision,
}) => {
  const { canEditTexts, canAddDocuments, canDelete, isSuperAdmin } = useUserAccess();
  const [fontSize, setFontSize] = useState<number>(16);
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedArticleId, setCopiedArticleId] = useState<string | null>(null);

  // Direct in-modal text editing states
  const [isDirectEditingText, setIsDirectEditingText] = useState(false);
  const [editTextTitle, setEditTextTitle] = useState(decision?.title || '');
  const [editTextNumber, setEditTextNumber] = useState(decision?.decisionNumber || '');
  const [editTextYear, setEditTextYear] = useState<number>(decision?.year || 2025);
  const [editTextPreamble, setEditTextPreamble] = useState(decision?.preamble || '');
  const [editTextArticles, setEditTextArticles] = useState(decision?.articles || []);
  const [editTextExplanatoryNote, setEditTextExplanatoryNote] = useState(decision?.explanatoryNote || '');
  const [editTextOfficialReference, setEditTextOfficialReference] = useState(decision?.officialReference || '');
  const [textSaveSuccess, setTextSaveSuccess] = useState(false);
  const wordImportInputRef = useRef<HTMLInputElement>(null);

  // Active Tab: 'scanned_pdf' | 'written_text' | 'summary' | 'split'
  const [activeTab, setActiveTab] = useState<DecisionModalTab>(
    initialTab || (decision?.pdfAttachment ? 'scanned_pdf' : 'summary')
  );
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Quick edit for enacted articles in summary tab
  const [isEditingModalArticles, setIsEditingModalArticles] = useState(false);
  const [modalArticlesList, setModalArticlesList] = useState<string[]>(decision?.relatedLawArticles || []);
  const [modalNewInput, setModalNewInput] = useState('');
  const [showModalArticlesPicker, setShowModalArticlesPicker] = useState(false);

  // Sync direct edit fields when decision changes
  useEffect(() => {
    if (decision) {
      setEditTextTitle(decision.title);
      setEditTextNumber(decision.decisionNumber);
      setEditTextYear(decision.year);
      setEditTextPreamble(decision.preamble);
      setEditTextArticles(decision.articles || []);
      setEditTextExplanatoryNote(decision.explanatoryNote || '');
      setEditTextOfficialReference(decision.officialReference || '');
      setIsDirectEditingText(false);
    }
  }, [decision?.id]);

  const handleSaveModalArticles = () => {
    if (!decision) return;
    let final = [...modalArticlesList];
    if (modalNewInput.trim()) {
      const extra = parseArticlesString(modalNewInput);
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
    setIsEditingModalArticles(false);
    setShowModalArticlesPicker(false);
  };

  const handleSaveDirectTextEdits = () => {
    if (!decision) return;
    const updated: MinisterialDecision = {
      ...decision,
      title: editTextTitle.trim(),
      decisionNumber: editTextNumber.trim(),
      year: Number(editTextYear) || decision.year,
      preamble: editTextPreamble.trim(),
      articles: editTextArticles,
      explanatoryNote: editTextExplanatoryNote.trim(),
      officialReference: editTextOfficialReference.trim(),
      updatedAt: new Date().toISOString(),
    };
    if (onUpdateDecision) {
      onUpdateDecision(updated);
    }
    setTextSaveSuccess(true);
    setTimeout(() => setTextSaveSuccess(false), 3000);
    setIsDirectEditingText(false);
  };

  const handleAddNewArticle = () => {
    const nextNum = editTextArticles.length + 1;
    const newArt = {
      id: `art-new-${Date.now()}-${nextNum}`,
      articleNumber: `المادة (${nextNum})`,
      title: '',
      content: '',
    };
    setEditTextArticles((prev) => [...prev, newArt]);
  };

  const handleRemoveArticle = (id: string) => {
    setEditTextArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateArticleField = (id: string, field: string, val: string) => {
    setEditTextArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: val } : a))
    );
  };

  const handleWordDocxImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !decision) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const res = await mammoth.extractRawText({ arrayBuffer });
      const raw = res.value;
      if (raw && raw.trim()) {
        setEditTextPreamble((prev) =>
          prev ? `${prev}\n\n[مستند Word مرفوع]:\n${raw.slice(0, 600)}` : raw.slice(0, 600)
        );
        setIsDirectEditingText(true);
        setActiveTab('written_text');
      }
    } catch (err) {
      console.error('Error importing Word document:', err);
    }
    if (e.target) e.target.value = '';
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Sync initialTab when props change
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, decision?.id]);

  // Load PDF when decision changes
  useEffect(() => {
    let currentObjectUrl: string | null = null;

    if (decision?.pdfAttachment) {
      setLoadingPdf(true);
      getPdfFromStorage(decision.id).then((result) => {
        if (result && result.url) {
          currentObjectUrl = result.url;
          setPdfUrl(result.url);
        } else if (decision.pdfAttachment?.dataUrl) {
          setPdfUrl(decision.pdfAttachment.dataUrl);
        }
        setLoadingPdf(false);
      });
    } else {
      setPdfUrl(null);
    }

    return () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [decision]);

  if (!decision) return null;

  const handleCopyFull = async () => {
    try {
      const text = formatDecisionTextForCopy(decision);
      await navigator.clipboard.writeText(text);
      setCopiedFull(true);
      setTimeout(() => setCopiedFull(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCopyArticle = async (articleId: string, articleText: string) => {
    try {
      await navigator.clipboard.writeText(articleText);
      setCopiedArticleId(articleId);
      setTimeout(() => setCopiedArticleId(null), 2000);
    } catch (err) {
      console.error('Failed to copy article', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleQuickUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !decision) return;

    try {
      setLoadingPdf(true);
      const stored = await savePdfToStorage(decision.id, file, file.name);
      const newUrl = URL.createObjectURL(file);
      setPdfUrl(newUrl);

      const updated: MinisterialDecision = {
        ...decision,
        pdfAttachment: {
          filename: file.name,
          size: file.size,
          uploadedAt: stored.uploadedAt,
          storageKey: decision.id,
        },
      };

      if (onUpdateDecision) {
        onUpdateDecision(updated);
      }
      setActiveTab('scanned_pdf');
    } catch (err) {
      console.error('Failed to upload PDF', err);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleRemovePdf = async () => {
    if (!decision) return;
    if (confirm('هل ترغب بإزالة النسخة الممسوحة ضوئياً المرفقة لهذا القرار؟')) {
      const updated: MinisterialDecision = {
        ...decision,
        pdfAttachment: undefined,
      };
      setPdfUrl(null);
      if (onUpdateDecision) {
        onUpdateDecision(updated);
      }
    }
  };

  /* Render Scanned PDF View */
  const renderScannedPdfView = () => (
    <div className="flex-1 overflow-hidden bg-stone-900 flex flex-col items-stretch p-3 sm:p-5">
      {loadingPdf ? (
        <div className="flex-1 flex items-center justify-center text-stone-300 text-sm font-cairo">
          جارٍ تحميل النسخة الممسوحة ضوئياً...
        </div>
      ) : pdfUrl || decision.pdfAttachment ? (
        <div className="flex-1 flex flex-col bg-stone-800 rounded-xl overflow-hidden border border-stone-700 shadow-xl">
          {/* Top Scanned PDF Info and Action Bar */}
          <div className="p-3 bg-stone-850 border-b border-stone-700 flex items-center justify-between gap-3 text-xs text-stone-300 flex-wrap font-cairo">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>النسخة الرسمية الممسوحة ضوئياً:</span>
              </span>
              <span className="font-mono text-amber-300 font-medium">
                {decision.pdfAttachment?.filename || 'وثيقة القرار الوزاري.pdf'}
              </span>
              {decision.pdfAttachment?.size && (
                <span className="text-stone-400 text-[11px]">
                  ({formatFileSize(decision.pdfAttachment.size)})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  download={decision.pdfAttachment?.filename || `قرار_${decision.decisionNumber}.pdf`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-md transition-colors"
                  title="تنزيل النسخة الممسوحة"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل PDF</span>
                </a>
              )}
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-md transition-colors"
                >
                  <span>فتح بنافذة كاملة</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-md transition-colors cursor-pointer"
                title="استبدال النسخة الممسوحة بملف آخر"
              >
                <RefreshCw className="w-3 h-3 text-amber-400" />
                <span>استبدال</span>
              </button>
              <button
                type="button"
                onClick={handleRemovePdf}
                className="inline-flex items-center gap-1 p-1 text-stone-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                title="إزالة النسخة الممسوحة"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Notice to Use Written Word for Easy Copying */}
          <div className="bg-sky-950/80 border-b border-sky-800/80 px-4 py-2 flex items-center justify-between gap-3 text-xs font-cairo text-sky-200 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
              <span>
                💡 <strong>لتيسير النقل والاقتباس:</strong> تم إعداد النسخة المكتوبة الكاملة بصيغة Word لتتمكن من نسخ المواد دون الحاجة لإعادة كتابتها من الصورة الممسوحة.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => exportDecisionAsWord(decision)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-md transition-colors cursor-pointer shadow-xs"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>تحميل Word المكتوب</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('written_text')}
                className="inline-flex items-center gap-1 text-sky-300 hover:text-white underline cursor-pointer"
              >
                <span>استعراض النص المكتوب</span>
              </button>
            </div>
          </div>

          {/* PDF Viewer Iframe */}
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="عرض النسخة الرسمية الممسوحة ضوئياً"
              className="w-full flex-1 border-0 bg-stone-900"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <p className="text-sm">جاري تهيئة عارض ملف الـ PDF...</p>
            </div>
          )}
        </div>
      ) : (
        /* Empty State: Prompt User to Upload the Scanned PDF */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-12 text-stone-300 space-y-4 max-w-xl mx-auto font-cairo">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-inner">
            <FileUp className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">
              النسخة الرسمية الممسوحة ضوئياً لهذا القرار لم تُرفع بعد
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              وفقاً للنظام، النسخة الرسمية للقرار هي النسخة الممسوحة ضوئياً من الجريدة الرسمية أو الوقائع المصرية بصيغة PDF. قم برفعها لتكون معتمدة ومتاحة للمعاينة والتنزيل دائماً.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md cursor-pointer"
            >
              <FileUp className="w-4 h-4" />
              <span>اختيار ورفع النسخة الممسوحة (PDF) الآن</span>
            </button>

            <button
              type="button"
              onClick={() => exportDecisionAsPdf(decision)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              title="معاينة أو طباعة كـ PDF بديلاً مؤقتاً لحين رفع النسخة الممسوحة"
            >
              <Printer className="w-4 h-4 text-stone-400" />
              <span>معاينة إلكترونية كـ PDF مؤقتاً</span>
            </button>
          </div>

          <div className="bg-stone-800/80 border border-stone-700 rounded-xl p-3.5 text-xs text-stone-300 w-full text-right flex items-center justify-between gap-3 mt-4">
            <div>
              <div className="font-bold text-white text-xs">هل تبحث عن نص القرار للنقل والاقتباس؟</div>
              <div className="text-[11px] text-stone-400 mt-0.5">النسخة المكتوبة الكاملة متوفرة بصيغة Word وجاهزة للتحميل الفوري.</div>
            </div>
            <button
              type="button"
              onClick={() => exportDecisionAsWord(decision)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>تحميل Word</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  /* Render Written Word Legal Document View (مع توفير نسخة مكتوبة منها بصيغة وورد لتيسير النقل منها) */
  const renderWrittenWordView = (compact = false) => (
    <div className={`flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 bg-white print-document font-cairo`}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Banner highlighting Word Written Copy for Easy Quoting & Copying */}
        <div className="no-print bg-gradient-to-r from-sky-50 via-sky-100/60 to-stone-50 border-2 border-sky-300/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-200 text-sky-900 font-mono">
                  نسخة مكتوبة ومدققة
                </span>
                <span className="text-xs font-semibold text-sky-900">
                  مهيأة لتيسير النقل والاقتباس وصياغة المذكرات
                </span>
              </div>
              <p className="text-xs text-stone-600">
                يمكنك تحميل هذا القرار بصيغة Word (.doc) أو نسخ أي مادة بضغطة زر واحدة.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {canEditTexts && (
                <button
                  type="button"
                  onClick={() => setIsDirectEditingText(!isDirectEditingText)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer ${
                    isDirectEditingText
                      ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                      : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                  }`}
                  title="تعديل نصوص القرار مباشرة (الديباجة، المواد، المذكرة، العنوان)"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isDirectEditingText ? 'إلغاء وضع التحرير' : 'تحرير النصوص المباشر ✍️'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => exportDecisionAsWord(decision)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
                title="تحميل النسخة المكتوبة Word (.doc)"
              >
                <FileDown className="w-4 h-4" />
                <span>تحميل النسخة المكتوبة (Word)</span>
              </button>

              <button
                type="button"
                onClick={handleCopyFull}
                className="inline-flex items-center gap-1 px-3 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="نسخ نص القرار كاملاً"
              >
                {copiedFull ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">تم نسخ النص كاملاً</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-600" />
                    <span>نسخ نص القرار كاملاً</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {textSaveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2 font-bold animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>تم حفظ كافة التعديلات في نصوص القرار بنجاح وتحديث القاعدة!</span>
          </div>
        )}

        {/* DIRECT EDITING MODE */}
        {isDirectEditingText ? (
          <div className="space-y-6 p-5 bg-amber-500/5 rounded-2xl border-2 border-amber-400/50 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3 border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm sm:text-base">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <span>تحرير نصوص القرار (صلاحيات كاملة للمسؤول)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDirectEditingText(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold hover:bg-stone-100 cursor-pointer"
                >
                  إلغاء التحرير
                </button>
                <button
                  type="button"
                  onClick={handleSaveDirectTextEdits}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التعديلات في النصوص 💾</span>
                </button>
              </div>
            </div>

            {/* Quick Metadata fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">رقم القرار</label>
                <input
                  type="text"
                  value={editTextNumber}
                  onChange={(e) => setEditTextNumber(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-mono font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">سنة الإصدار</label>
                <input
                  type="number"
                  value={editTextYear}
                  onChange={(e) => setEditTextYear(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-mono font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">المرجع الإداري</label>
                <input
                  type="text"
                  value={editTextOfficialReference}
                  onChange={(e) => setEditTextOfficialReference(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">عنوان وموضوع القرار الرسمي</label>
              <input
                type="text"
                value={editTextTitle}
                onChange={(e) => setEditTextTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-white font-bold focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Preamble */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">الديباجة والسند القانوني</label>
              <textarea
                rows={5}
                value={editTextPreamble}
                onChange={(e) => setEditTextPreamble(e.target.value)}
                className="w-full p-3 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white font-serif leading-relaxed focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Articles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2 border-stone-300">
                <span className="font-bold text-xs sm:text-sm text-stone-900">
                  نصوص مواد القرار ({editTextArticles.length} مادة):
                </span>
                <button
                  type="button"
                  onClick={handleAddNewArticle}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة مادة جديدة</span>
                </button>
              </div>

              {editTextArticles.map((art) => (
                <div key={art.id} className="p-4 rounded-xl border border-stone-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={art.articleNumber}
                        onChange={(e) => handleUpdateArticleField(art.id, 'articleNumber', e.target.value)}
                        className="w-32 px-2.5 py-1 text-xs rounded border border-stone-300 font-bold"
                        placeholder="المادة الأولى"
                      />
                      <input
                        type="text"
                        value={art.title || ''}
                        onChange={(e) => handleUpdateArticleField(art.id, 'title', e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs rounded border border-stone-300 font-medium"
                        placeholder="عنوان المادة (اختياري)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveArticle(art.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="حذف هذه المادة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={art.content}
                    onChange={(e) => handleUpdateArticleField(art.id, 'content', e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm rounded border border-stone-300 font-serif leading-relaxed focus:ring-2 focus:ring-amber-500"
                    placeholder="نص المادة..."
                  />
                </div>
              ))}
            </div>

            {/* Explanatory Note */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">المذكرة الإيضاحية والأثر التشريعي</label>
              <textarea
                rows={3}
                value={editTextExplanatoryNote}
                onChange={(e) => setEditTextExplanatoryNote(e.target.value)}
                className="w-full p-2.5 text-xs rounded border border-stone-300 bg-white"
                placeholder="المذكرة الإيضاحية..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-500/30">
              <button
                type="button"
                onClick={handleSaveDirectTextEdits}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>حفظ التعديلات في نصوص القرار 💾</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Ministry Letterhead */}
            <div className="text-center border-b-2 border-stone-800 pb-5 space-y-1 font-amiri">
              <div className="flex items-center justify-between text-xs font-cairo text-stone-600 mb-2">
                <div className="text-right">
                  <div className="font-bold text-stone-900">جمهورية مصر العربية</div>
                  <div>وزارة العمل</div>
                  <div className="text-stone-500">مكتب السيد الوزير</div>
                </div>
                <div className="w-10 h-10 rounded-full border border-stone-400/80 flex items-center justify-center p-2 text-stone-800">
                  <Scale className="w-6 h-6" />
                </div>
                <div className="text-left font-mono tabular-nums">
                  <div>المرجع: {decision.officialReference}</div>
                  <div>الجريدة الرسمية: {decision.gazetteIssue}</div>
                  <div>تاريخ النشر: {decision.gazetteDate}</div>
                </div>
              </div>

              <div className="pt-2 font-cairo">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                    {decision.legislationType || 'قرار وزاري'} رقم ({decision.decisionNumber}) لسنة {decision.year}
                  </h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    {decision.legislationType || 'قرار وزاري'}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-medium text-stone-800 max-w-2xl mx-auto leading-snug">
                  {decision.title}
                </h2>
                <div className="text-xs text-amber-900 mt-1 font-medium">
                  تنفيذاً لأحكام قانون العمل رقم 14 لسنة 2025 ({decision.relatedLawArticles.join(' · ')})
                </div>
              </div>
            </div>

            {/* Preamble */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-stone-600 border-b border-stone-200 pb-1">
                [ الديباجة والسند القانوني ]:
              </h3>
              <p
                style={{ fontSize: `${fontSize}px` }}
                className="whitespace-pre-line text-justify text-stone-800 leading-relaxed font-serif"
              >
                {decision.preamble}
              </p>
            </div>

            {/* Formal Decree Transition */}
            <div className="text-center py-1">
              <div className="inline-block border-y-2 border-stone-900 py-1 px-8 font-bold text-base">
                ( قـــــرّر )
              </div>
            </div>

            {/* Full Articles with 1-click Copy for Easy Quoting */}
            <div className="space-y-6">
              {decision.articles.map((article) => (
                <div
                  id={`article-${article.id}`}
                  key={article.id}
                  className="group relative pt-4 border-t border-stone-200/80 scroll-mt-20 print-break-inside-avoid"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-bold text-stone-900">
                      {article.articleNumber}
                      {article.title && (
                        <span className="font-medium text-stone-700 mr-2 text-sm">
                          - {article.title}
                        </span>
                      )}
                    </h4>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopyArticle(
                          article.id,
                          `${article.articleNumber}${
                            article.title ? ` - ${article.title}` : ''
                          }\n${article.content}`
                        )
                      }
                      className="no-print p-1.5 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 rounded-md text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      title="نسخ نص هذه المادة لتيسير النقل"
                    >
                      {copiedArticleId === article.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[11px] text-emerald-600 font-bold">تم نسخ المادة</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">نسخ المادة</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p
                    style={{ fontSize: `${fontSize}px` }}
                    className="whitespace-pre-line text-justify text-stone-800 leading-relaxed font-serif"
                  >
                    {article.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Explanatory Note */}
            {decision.explanatoryNote && (
              <div className="bg-stone-100/80 border border-stone-200 rounded-xl p-4 space-y-1.5 print-break-inside-avoid">
                <h4 className="text-xs font-bold text-stone-700">
                  المذكرة الإيضاحية والأثر التشريعي للقرار:
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {decision.explanatoryNote}
                </p>
              </div>
            )}
          </>
        )}

        {/* Sign-off */}
        <div className="pt-8 mt-10 border-t-2 border-stone-900 flex items-center justify-between print-break-inside-avoid">
          <div className="text-right">
            <div className="text-xs text-stone-500">صدر بديوان عام الوزارة في:</div>
            <div className="text-sm font-bold font-mono tabular-nums text-stone-900">
              {decision.issueDate}
            </div>
          </div>

          <div className="text-left">
            <div className="text-sm font-bold text-stone-900">
              {decision.issuingAuthority}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">وزير العمل</div>
            <div className="text-[11px] text-stone-400 mt-1 font-mono">
              [معتمد وموقع رقمياً]
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col border border-stone-200 overflow-hidden relative print-container">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="bg-stone-900 text-stone-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 border-b border-stone-800 no-print shrink-0 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-amber-400 font-semibold block">
                النسخة الممسوحة ضوئياً (PDF) والنسخة المكتوبة (Word)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {decision.legislationType || 'قرار وزاري'} رقم ({decision.decisionNumber}) لسنة {decision.year}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-sans">
                  {decision.legislationType || 'قرار وزاري'}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Switcher: Scanned PDF vs Written Word vs Summary vs Split */}
          <div className="flex items-center bg-stone-800 p-0.5 rounded-lg border border-stone-700 text-xs overflow-x-auto max-w-full">
            {/* Scanned Official PDF */}
            <button
              type="button"
              onClick={() => setActiveTab('scanned_pdf')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'scanned_pdf'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <FileDown className="w-3.5 h-3.5 text-rose-300" />
              <span>النسخة الرسمية الممسوحة ضوئياً (PDF)</span>
              {decision.pdfAttachment && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="مرفقة ومحفوظة" />
              )}
            </button>

            {/* Written Word Copy */}
            <button
              type="button"
              onClick={() => setActiveTab('written_text')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'written_text'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-sky-300" />
              <span>النسخة المكتوبة (Word) لتيسير النقل</span>
            </button>

            {/* Summary */}
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ملخص أحكام القرار</span>
            </button>

            {/* Split Comparison */}
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`hidden md:flex px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'split'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
              title="عرض مقارن بين النسخة الممسوحة ضوئياً والنسخة المكتوبة"
            >
              <Columns className="w-3.5 h-3.5 text-emerald-300" />
              <span>عرض المقارنة</span>
            </button>

            <input
              type="file"
              ref={uploadInputRef}
              accept="application/pdf,.pdf"
              onChange={handleQuickUploadPdf}
              className="hidden"
            />
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Font size adjustments (in written text mode) */}
            {activeTab === 'written_text' && (
              <div className="hidden sm:flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700">
                <button
                  type="button"
                  onClick={() => setFontSize((s) => Math.max(s - 2, 13))}
                  className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-700 rounded transition-colors cursor-pointer"
                  title="تصغير الخط"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-mono tabular-nums text-stone-300">
                  {fontSize}px
                </span>
                <button
                  type="button"
                  onClick={() => setFontSize((s) => Math.min(s + 2, 24))}
                  className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-700 rounded transition-colors cursor-pointer"
                  title="تكبير الخط"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Word Download */}
            <button
              type="button"
              onClick={() => exportDecisionAsWord(decision)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-950/90 hover:bg-sky-900 text-sky-200 border border-sky-600/70 font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
              title="تحميل النسخة المكتوبة بصيغة Word (.doc) لتيسير النقل منها"
            >
              <FileDown className="w-3.5 h-3.5 text-sky-400" />
              <span>تحميل Word</span>
            </button>

            {/* Print button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
              title="طباعة القرار رسمياً"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">طباعة</span>
            </button>

            {/* Favorite */}
            <button
              type="button"
              onClick={() => onToggleFavorite(decision.id)}
              className="p-1.5 text-stone-300 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer border border-stone-700"
              title={decision.isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <Star
                className={`w-4 h-4 ${
                  decision.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>

            {/* Direct Text Editing Mode Toggle */}
            {canEditTexts && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('written_text');
                  setIsDirectEditingText(!isDirectEditingText);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  isDirectEditingText
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-900/90'
                }`}
                title="تعديل نصوص القرار مباشرة (الديباجة، المواد، العناوين)"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isDirectEditingText ? 'إنهاء التحرير' : 'تحرير النصوص ✍️'}</span>
              </button>
            )}

            {/* Quick Upload Official PDF */}
            {canAddDocuments && (
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-600/70 font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                title="رفع أو استبدال النسخة الرسمية الممسوحة ضوئياً (PDF)"
              >
                <FileUp className="w-3.5 h-3.5 text-rose-400" />
                <span>رفع PDF 📤</span>
              </button>
            )}

            {/* Quick Word Import */}
            {canAddDocuments && (
              <>
                <button
                  type="button"
                  onClick={() => wordImportInputRef.current?.click()}
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 bg-sky-950/80 hover:bg-sky-900 text-sky-200 border border-sky-600/70 font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                  title="استيراد وتفريغ نصوص من ملف وورد (.docx)"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>استيراد Word</span>
                </button>
                <input
                  type="file"
                  ref={wordImportInputRef}
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleWordDocxImport}
                  className="hidden"
                />
              </>
            )}

            {/* Edit Full Form */}
            {canEditTexts && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(decision);
                }}
                className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer border border-stone-700"
                title="تعديل تفاصيل القرار واستمارته بالكامل"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {/* Delete Decision */}
            {canDelete && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      `هل أنت متأكد من حذف القرار الوزاري رقم (${decision.decisionNumber}) لسنة ${decision.year} نهائياً؟`
                    )
                  ) {
                    onDelete(decision.id);
                    onClose();
                  }
                }}
                className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-900/60 rounded-lg transition-colors cursor-pointer border border-rose-700/60"
                title="حذف هذا القرار نهائياً من المنظومة (صلاحية الحذف)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer ml-1"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        {activeTab === 'scanned_pdf' ? (
          renderScannedPdfView()
        ) : activeTab === 'written_text' ? (
          renderWrittenWordView()
        ) : activeTab === 'split' ? (
          /* Split View: Scanned PDF on one side + Written Word text on the other side */
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-stone-700">
            <div className="w-full md:w-1/2 flex flex-col h-[50vh] md:h-auto">
              <div className="bg-stone-800 text-stone-200 px-4 py-2 text-xs font-bold font-cairo flex items-center justify-between border-b border-stone-700">
                <span>النسخة الرسمية الممسوحة ضوئياً (PDF)</span>
                <button
                  type="button"
                  onClick={() => uploadInputRef.current?.click()}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  {decision.pdfAttachment ? 'استبدال' : 'رفع ملف +'}
                </button>
              </div>
              {renderScannedPdfView()}
            </div>
            <div className="w-full md:w-1/2 flex flex-col h-[50vh] md:h-auto overflow-y-auto">
              <div className="bg-sky-900 text-sky-100 px-4 py-2 text-xs font-bold font-cairo flex items-center justify-between border-b border-sky-850">
                <span>النسخة المكتوبة (Word) لتيسير النقل</span>
                <button
                  type="button"
                  onClick={() => exportDecisionAsWord(decision)}
                  className="text-[11px] bg-sky-700 hover:bg-sky-600 px-2 py-0.5 rounded text-white font-bold cursor-pointer"
                >
                  تحميل Word (.doc)
                </button>
              </div>
              {renderWrittenWordView(true)}
            </div>
          </div>
        ) : (
          /* Summary of Rulings Tab (ملخص أحكام القرار ومطابقته لقانون العمل) */
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-50 font-cairo">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header Box with Direct Links to Scanned PDF & Written Word */}
              <div className="bg-white border-2 border-amber-300/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        قرار وزاري رقم ({decision.decisionNumber}) لسنة {decision.year}
                      </span>
                      <span className="text-xs text-stone-500">· ملخص الأحكام والمطابقة القانونية</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                      {decision.title}
                    </h2>
                    <p className="text-xs text-stone-600">
                      الصادر عن {decision.issuingAuthority} - تنفيذاً لأحكام قانون العمل رقم 14 لسنة 2025
                    </p>
                  </div>

                  {/* Scanned PDF & Written Word Fast Action Buttons */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                    <button
                      type="button"
                      onClick={() => setActiveTab('scanned_pdf')}
                      className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer ${
                        decision.pdfAttachment ? 'bg-rose-600 hover:bg-rose-500' : 'bg-stone-800 hover:bg-stone-700'
                      }`}
                    >
                      <FileDown className="w-4 h-4 text-rose-200" />
                      <span>{decision.pdfAttachment ? 'استعراض النسخة الممسوحة (PDF)' : 'رفع النسخة الممسوحة (PDF)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => exportDecisionAsWord(decision)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      title="تحميل النسخة المكتوبة Word (.doc) لتيسير النقل"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>تحميل Word المكتوب</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('written_text')}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>استعراض النص</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Legal Mandate & Linked Labor Law 14/2025 Articles */}
              <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-800 shrink-0" />
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-amber-950">
                        السند التشريعي المباشر ومواد قانون العمل رقم 14 لسنة 2025 المنفذة:
                      </h3>
                      <p className="text-xs text-amber-800/90">
                        المواد التي فوّضت وزير العمل في إصدار هذا القرار والأحكام التي أتى تنفيذاً لها
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-xs font-mono font-bold bg-amber-200/80 text-amber-900 rounded-full">
                      {decision.relatedLawArticles.join(' · ')}
                    </span>
                    {onUpdateDecision && (
                      <button
                        type="button"
                        onClick={() => setIsEditingModalArticles(!isEditingModalArticles)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                        title="تعديل المواد المنفذة لهذا القرار"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isEditingModalArticles ? 'إلغاء' : 'تعديل المواد'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Editor if active */}
                {isEditingModalArticles && (
                  <div className="p-4 bg-white rounded-xl border border-amber-400/80 shadow-sm space-y-3">
                    <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-700" />
                      <span>تعديل وحفظ المواد المنفذة للقرار ({decision.decisionNumber}):</span>
                    </div>

                    {/* Active chips with delete */}
                    <div className="flex flex-wrap gap-1.5 p-2 bg-stone-50 rounded-lg border border-stone-200">
                      {modalArticlesList.map((art) => (
                        <span
                          key={art}
                          className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300"
                        >
                          <span>{art}</span>
                          <button
                            type="button"
                            onClick={() => setModalArticlesList((prev) => prev.filter((a) => a !== art))}
                            className="hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Input row */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={modalNewInput}
                        onChange={(e) => setModalNewInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (modalNewInput.trim()) {
                              const parsed = parseArticlesString(modalNewInput);
                              setModalArticlesList((prev) => Array.from(new Set([...prev, ...parsed])));
                              setModalNewInput('');
                            }
                          }
                        }}
                        placeholder="أدخل المادة (مثال: 50 أو 88 أو 128)..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (modalNewInput.trim()) {
                            const parsed = parseArticlesString(modalNewInput);
                            setModalArticlesList((prev) => Array.from(new Set([...prev, ...parsed])));
                            setModalNewInput('');
                          }
                        }}
                        className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowModalArticlesPicker(!showModalArticlesPicker)}
                        className="px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg border border-amber-300 cursor-pointer flex items-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>اختيار من القانون</span>
                      </button>
                    </div>

                    {/* Quick suggestion tags */}
                    {showModalArticlesPicker && (
                      <div className="max-h-36 overflow-y-auto p-2 bg-stone-50 rounded-lg border border-stone-200 space-y-1.5">
                        <span className="text-[11px] text-stone-500 font-bold block">
                          انقر لإضافة أي مادة من قانون العمل 14 لسنة 2025:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {CANONICAL_LAW_ARTICLES.map((item) => {
                            const isSelected = modalArticlesList.includes(item.articleNumber);
                            return (
                              <button
                                key={item.articleNumber}
                                type="button"
                                onClick={() => {
                                  setModalArticlesList((prev) =>
                                    isSelected
                                      ? prev.filter((a) => a !== item.articleNumber)
                                      : [...prev, item.articleNumber]
                                  );
                                }}
                                className={`text-[11px] px-2 py-0.5 rounded-md border font-mono cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-amber-500 text-white border-amber-600 font-bold'
                                    : 'bg-white text-stone-700 border-stone-200 hover:border-amber-400'
                                }`}
                              >
                                {item.articleNumber}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Save actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                      <button
                        type="button"
                        onClick={() => setIsEditingModalArticles(false)}
                        className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800 cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveModalArticles}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>حفظ التعديلات</span>
                      </button>
                    </div>
                  </div>
                )}

                {decision.legalBasisSummary && (
                  <div className="bg-white/80 rounded-xl p-3 text-xs sm:text-sm text-stone-800 leading-relaxed border border-amber-200/60 font-medium">
                    {decision.legalBasisSummary}
                  </div>
                )}

                {/* Detailed Breakdown of each executed article */}
                {decision.enactedLawArticlesDetail && decision.enactedLawArticlesDetail.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-bold text-amber-950 flex items-center gap-1">
                      <span>مطابقة أحكام القرار لمواد القانون والتفويض التشريعي:</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {decision.enactedLawArticlesDetail.map((detail, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-amber-200/80 rounded-xl p-3 text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:border-amber-400 transition-colors shadow-2xs"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="font-bold text-amber-900 font-mono shrink-0 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md text-xs">
                              {detail.articleNumber}
                            </span>
                            <div className="space-y-0.5">
                              <div className="font-bold text-stone-900 text-sm">
                                {detail.topic}
                              </div>
                              <div className="text-stone-700 leading-relaxed text-xs">
                                {detail.mandate}
                              </div>
                            </div>
                          </div>
                          {onSelectLawArticle && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onSelectLawArticle(detail.articleNumber);
                              }}
                              className="text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg shrink-0 self-end sm:self-auto cursor-pointer flex items-center gap-1 transition-colors"
                            >
                              <span>عرض بنص القانون</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Execution Scope & Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-white border border-stone-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-stone-500 block text-[11px]">موضوع التنفيذ:</span>
                  <span className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-2">
                    {decision.executingSubject || decision.title}
                  </span>
                </div>
                <div className="bg-white border border-stone-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-stone-500 block text-[11px]">تاريخ الصدور وبدء السريان:</span>
                  <span className="font-bold font-mono text-stone-900">
                    {decision.issueDate} <span className="text-stone-400">·</span> {decision.effectiveDate}
                  </span>
                </div>
                <div className="bg-white border border-stone-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-stone-500 block text-[11px]">الجريدة الرسمية والوقائع:</span>
                  <span className="font-bold text-stone-900">
                    {decision.gazetteIssue} ({decision.gazetteDate})
                  </span>
                </div>
                <div className="bg-white border border-stone-200 rounded-xl p-3.5 space-y-1">
                  <span className="text-stone-500 block text-[11px]">النسخة الممسوحة (PDF):</span>
                  {decision.pdfAttachment ? (
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>مرفوعة ({formatFileSize(decision.pdfAttachment.size)})</span>
                    </span>
                  ) : (
                    <span className="font-bold text-amber-700">لم تُرفع بعد</span>
                  )}
                </div>
              </div>

              {/* Rulings Catalog (فهرس وموجز أحكام مواد القرار) */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <h3 className="font-bold text-sm sm:text-base text-stone-900">
                      فهرس وموجز أحكام مواد القرار ({decision.articles.length} مادة):
                    </h3>
                  </div>
                  <span className="text-xs text-stone-500">
                    انقر على أي مادة لنسخها أو الانتقال إليها بالنص المكتوب
                  </span>
                </div>

                <div className="space-y-3">
                  {decision.articles.map((art) => (
                    <div
                      key={art.id}
                      className="border border-stone-200/90 hover:border-amber-400 rounded-xl p-3.5 transition-all bg-stone-50/40 hover:bg-amber-50/20"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-xs bg-stone-200 text-stone-800 px-2 py-0.5 rounded">
                            {art.articleNumber}
                          </span>
                          {art.title && (
                            <span className="font-bold text-stone-900 text-xs sm:text-sm">
                              {art.title}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('written_text');
                              setTimeout(() => {
                                const el = document.getElementById(`article-${art.id}`);
                                el?.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            }}
                            className="text-xs font-semibold text-sky-900 hover:text-sky-950 bg-sky-100/70 hover:bg-sky-200/80 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>استعراض بالنص المكتوب</span>
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyArticle(art.id, `${art.articleNumber} ${art.title ? `- ${art.title}` : ''}\n${art.content}`)}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors cursor-pointer"
                            title="نسخ نص المادة لتيسير النقل"
                          >
                            {copiedArticleId === art.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed line-clamp-3">
                        {art.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanatory Note */}
              {decision.explanatoryNote && (
                <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 sm:p-5 space-y-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-amber-950">
                    المذكرة الإيضاحية والأثر التشريعي للقرار:
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                    {decision.explanatoryNote}
                  </p>
                </div>
              )}

              {/* Bottom Jump Options */}
              <div className="bg-stone-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                <div>
                  <h4 className="font-bold text-sm sm:text-base">النسخ الرسمية والمكتوبة</h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    استعرض النسخة الرسمية الممسوحة ضوئياً (PDF) أو حمّل النسخة المكتوبة Word لتيسير النقل منها
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveTab('scanned_pdf')}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>النسخة الممسوحة (PDF)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => exportDecisionAsWord(decision)}
                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    title="تحميل النسخة المكتوبة Word (.doc)"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>تحميل Word المكتوب</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('written_text')}
                    className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer border border-stone-700"
                  >
                    استعراض النص المكتوب
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
