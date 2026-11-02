import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  FileDown,
  CheckCircle2,
  AlertCircle,
  Link,
  Layers,
  Save,
  Trash2,
  Plus,
  RefreshCw,
  FileCheck,
  Edit3,
  BookOpen,
  ArrowRight,
  Sparkles,
  FileUp,
  Search,
  Check
} from 'lucide-react';
import { LaborLawInfo, LawChapter } from '../data/laborLawData';
import { extractTextFromDocx, parseLaborLawText } from '../utils/lawParser';
import { saveStoredLaborLaw, getAllLawArticlesFlattened } from '../utils/lawStorage';
import { savePdfToStorage, formatFileSize } from '../utils/pdfStorage';
import { MinisterialDecision } from '../types/decision';
import { autoLinkDecisionsToUploadedLaw } from '../utils/decisionLawLinker';
import { parseArticlesString, normalizeArticleName, generateLegalBasisSummary } from '../utils/lawArticlesHelper';

const DEFAULT_EMPTY_LAW: LaborLawInfo = {
  id: 'labor-law-14-2025',
  lawNumber: '14',
  year: 2025,
  title: 'قانون العمل رقم 14 لسنة 2025',
  promulgationDate: '2025-01-28',
  gazetteIssue: 'الجريدة الرسمية - العدد 4 مكرر (أ)',
  gazetteDate: '2025-02-02',
  effectiveDate: '2025-03-01',
  issuingAuthority: 'رئيس الجمهورية',
  preamble: 'باسم الشعب\nرئيس الجمهورية\nقرر مجلس النواب القانون الآتي نصه، وقد أصدرناه:',
  promulgationArticles: [],
  chapters: [],
  keyHighlights: [],
};

interface LawUploadAndSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLaw: LaborLawInfo | null;
  onLawUpdated: (newLaw: LaborLawInfo) => void;
  decisions: MinisterialDecision[];
  onDecisionsUpdated: (newDecisions: MinisterialDecision[]) => void;
}

export const LawUploadAndSyncModal: React.FC<LawUploadAndSyncModalProps> = ({
  isOpen,
  onClose,
  currentLaw,
  onLawUpdated,
  decisions,
  onDecisionsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'review' | 'linking'>('upload');
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Editable law working copy
  const [workingLaw, setWorkingLaw] = useState<LaborLawInfo>(currentLaw || DEFAULT_EMPTY_LAW);

  // Editable decisions working copy
  const [workingDecisions, setWorkingDecisions] = useState<MinisterialDecision[]>(decisions);

  // Search filter for decisions in linking tab
  const [linkingSearch, setLinkingSearch] = useState('');

  // Per-decision article input state
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  // PDF upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const txtInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setWorkingLaw(currentLaw || DEFAULT_EMPTY_LAW);
      setWorkingDecisions(decisions);
      setActiveTab('upload');
    }
  }, [isOpen, currentLaw, decisions]);

  if (!isOpen) return null;

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Process text and link decisions automatically
  const processAndAutoLinkLaw = (parsedLaw: LaborLawInfo) => {
    setWorkingLaw(parsedLaw);

    // Automatically cross-reference ministerial decisions against the new law's articles
    const linked = autoLinkDecisionsToUploadedLaw(workingDecisions, parsedLaw);
    setWorkingDecisions(linked);

    setActiveTab('review');
    const totalArts = (parsedLaw.chapters || []).reduce((s, c) => s + (c.articles?.length || 0), 0);
    showStatus(`تم بنجاح تحليل القانون واستخراج ${totalArts} مادة، ورُبطت القرارات الوزارية بالمواد تلقائياً! يمكنك مراجعتها وتعديلها يدوياً.`);
  };

  // Handle Word (.docx) upload
  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const text = await extractTextFromDocx(buffer);
      setRawText(text);

      const parsed = parseLaborLawText(text);
      if (parsed.chapters.length === 0 && parsed.promulgationArticles.length === 0) {
        showStatus('تم استخراج النص، ولكن يرجى التحقق من صياغة المواد في تبويب المراجعة.', 'error');
      } else {
        const baseLaw = currentLaw || DEFAULT_EMPTY_LAW;
        const updatedLaw: LaborLawInfo = {
          ...baseLaw,
          title: parsed.title || 'قانون العمل رقم 14 لسنة 2025',
          preamble: parsed.preamble || baseLaw.preamble,
          promulgationArticles: parsed.promulgationArticles,
          chapters: parsed.chapters,
          isCustomUploaded: true,
          customUploadedAt: new Date().toISOString(),
        };

        processAndAutoLinkLaw(updatedLaw);
      }
    } catch (err: any) {
      console.error(err);
      showStatus(err.message || 'حدث خطأ أثناء قراءة ملف Word.', 'error');
    } finally {
      setIsProcessing(false);
      if (docxInputRef.current) docxInputRef.current.value = '';
    }
  };

  // Handle plain text file upload
  const handleTxtUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setRawText(text);
        const parsed = parseLaborLawText(text);
        const baseLaw = currentLaw || DEFAULT_EMPTY_LAW;
        const updatedLaw: LaborLawInfo = {
          ...baseLaw,
          title: parsed.title || 'قانون العمل رقم 14 لسنة 2025',
          preamble: parsed.preamble || baseLaw.preamble,
          promulgationArticles: parsed.promulgationArticles,
          chapters: parsed.chapters,
          isCustomUploaded: true,
          customUploadedAt: new Date().toISOString(),
        };

        processAndAutoLinkLaw(updatedLaw);
      } catch (err) {
        showStatus('فشل تحليل ملف النص.', 'error');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
    if (txtInputRef.current) txtInputRef.current.value = '';
  };

  // Handle PDF file upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      await savePdfToStorage('labor-law-14-2025', file, file.name);
      setPdfFile(file);
      showStatus(`تم حفظ وتحديث النسخة الرسمية PDF (${file.name}) بنجاح!`);
    } catch (err) {
      showStatus('فشل حفظ ملف PDF.', 'error');
    } finally {
      setIsProcessing(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  // Handle manual parse from pasted text
  const handleProcessPastedText = () => {
    if (!rawText.trim()) {
      showStatus('يرجى لصق نص القانون أولاً.', 'error');
      return;
    }

    try {
      const parsed = parseLaborLawText(rawText);
      const baseLaw = currentLaw || DEFAULT_EMPTY_LAW;
      const updatedLaw: LaborLawInfo = {
        ...baseLaw,
        title: parsed.title || 'قانون العمل رقم 14 لسنة 2025',
        preamble: parsed.preamble || baseLaw.preamble,
        promulgationArticles: parsed.promulgationArticles,
        chapters: parsed.chapters,
        isCustomUploaded: true,
        customUploadedAt: new Date().toISOString(),
      };

      processAndAutoLinkLaw(updatedLaw);
    } catch (err) {
      showStatus('فشل معالجة النص.', 'error');
    }
  };

  // Re-run automatic linking explicitly
  const handleRunAutoLinking = () => {
    if (!workingLaw.chapters || workingLaw.chapters.length === 0) {
      showStatus('يرجى رفع واستخراج نصوص مواد القانون أولاً قبل الربط.', 'error');
      return;
    }
    const linked = autoLinkDecisionsToUploadedLaw(workingDecisions, workingLaw);
    setWorkingDecisions(linked);
    showStatus('تمت إعادة ربط كافة القرارات الوزارية بنصوص مواد القانون المرفوع بنجاح!');
  };

  // Save reviewed law & decisions and replace active database copy
  const handleApplyAndReplaceLaw = () => {
    if (!workingLaw.chapters || workingLaw.chapters.length === 0) {
      showStatus('يرجى رفع ملف القانون واستخراج مواده أولاً قبل الاعتماد.', 'error');
      return;
    }

    saveStoredLaborLaw(workingLaw);
    onLawUpdated(workingLaw);

    // Save and commit updated decision linkages
    onDecisionsUpdated(workingDecisions);

    showStatus('تم اعتماد واستبدال نص قانون العمل وربط كافة القرارات الوزارية بنصوص مواده بنجاح!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Manual decision linkage adjustments
  const handleRemoveArticleFromDecision = (decisionId: string, articleToRemove: string) => {
    setWorkingDecisions((prev) =>
      prev.map((d) => {
        if (d.id !== decisionId) return d;
        const newArticles = (d.relatedLawArticles || []).filter((a) => a !== articleToRemove);
        return {
          ...d,
          relatedLawArticles: newArticles,
          legalBasisSummary: generateLegalBasisSummary(newArticles),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleAddArticleToDecision = (decisionId: string, articleToAdd: string) => {
    const norm = normalizeArticleName(articleToAdd);
    if (!norm) return;

    setWorkingDecisions((prev) =>
      prev.map((d) => {
        if (d.id !== decisionId) return d;
        const current = d.relatedLawArticles || [];
        if (current.includes(norm)) return d;
        const newArticles = [...current, norm];
        return {
          ...d,
          relatedLawArticles: newArticles,
          legalBasisSummary: generateLegalBasisSummary(newArticles),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const allArticlesList = getAllLawArticlesFlattened(workingLaw);

  // Filter decisions in linking tab
  const filteredDecisions = workingDecisions.filter((d) => {
    if (!linkingSearch.trim()) return true;
    const q = linkingSearch.toLowerCase();
    return (
      d.decisionNumber.includes(q) ||
      d.title.toLowerCase().includes(q) ||
      (d.relatedLawArticles || []).some((a) => a.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col border border-stone-200 overflow-hidden font-cairo">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                رفع قانون العمل والربط التلقائي بالقرارات الوزارية مع إتاحة التعديل اليدوي
              </h2>
              <p className="text-xs text-stone-400">
                رفع القانون (Word / PDF / نص)، استخراج المواد، ربط القرارات الوزارية بها تلقائياً، وإتاحة التعديل اليدوي الكامل
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-stone-100 border-b border-stone-200 px-6 py-2.5 flex items-center justify-between gap-4 text-xs font-semibold shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 bg-white border border-stone-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>1. رفع ملف القانون (Word / PDF / نص)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('review')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'review'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 bg-white border border-stone-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>2. مراجعة مواد القانون المستخرجة ({allArticlesList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('linking')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'linking'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 bg-white border border-stone-200'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>3. مراجعة وتعديل ارتباط القرارات بالمواد يدوياً</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleApplyAndReplaceLaw}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>اعتماد واستبدال نص القانون والارتباطات الآن</span>
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab 1: Upload */}
        {activeTab === 'upload' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-4 text-xs text-amber-950 leading-relaxed space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>رفع قانون العمل والربط الآلي:</span>
              </span>
              <p>
                ارفع نسختك الرسمية المعتمدة من قانون العمل (بصيغة <strong>Word .docx</strong> أو <strong>PDF</strong> أو <strong>ملف نصي</strong>).
                سيقوم النظام فوراً باستخراج نصوص مواده وأبوابه، وربط القرارات الوزارية المسجلة بنصوص مواده تلقائياً، مع إمكانية تعديل كافة الروابط يدوياً في الخطوة الثالثة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option A: Word .docx */}
              <div className="border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-2xl p-6 text-center space-y-3 bg-sky-50/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">ملف Microsoft Word (.docx)</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    الخيار الأفضل لاستخراج وتنسيق كافة الأبواب والمواد بدقة تامة
                  </p>
                </div>
                <input
                  type="file"
                  ref={docxInputRef}
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleDocxUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => docxInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isProcessing ? 'جارٍ التحليل...' : 'اختيار ملف Word (.docx)'}
                </button>
              </div>

              {/* Option B: Scanned PDF */}
              <div className="border-2 border-dashed border-rose-300 hover:border-rose-500 rounded-2xl p-6 text-center space-y-3 bg-rose-50/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <FileDown className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">النسخة الرسمية PDF</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    لحفظ النسخة المصورة من الجريدة الرسمية للطباعة والمطالعة
                  </p>
                </div>
                <input
                  type="file"
                  ref={pdfInputRef}
                  accept=".pdf,application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {pdfFile ? `تم رفع (${pdfFile.name})` : 'اختيار ملف PDF'}
                </button>
              </div>

              {/* Option C: Plain Text */}
              <div className="border-2 border-dashed border-stone-300 hover:border-stone-500 rounded-2xl p-6 text-center space-y-3 bg-stone-50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center mx-auto">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">ملف نصي (.txt)</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    تحميل ملف نصي يحتوي على نصوص القانون
                  </p>
                </div>
                <input
                  type="file"
                  ref={txtInputRef}
                  accept=".txt,text/plain"
                  onChange={handleTxtUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => txtInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  اختيار ملف نصي (.txt)
                </button>
              </div>
            </div>

            {/* Paste Plain Text Box */}
            <div className="space-y-2 border-t pt-5 border-stone-200">
              <label className="block text-xs font-bold text-stone-800">
                أو الصق النص الكامل لقانون العمل مباشرة هنا:
              </label>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="الصق نصوص أبواب ومواد قانون العمل هنا..."
                className="w-full p-3 text-xs border border-stone-300 rounded-xl font-mono focus:ring-1 focus:ring-amber-500 leading-relaxed bg-white"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleProcessPastedText}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  معالجة واستخراج المواد من النص الملصوق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Review Law Articles */}
        {activeTab === 'review' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {workingLaw.title || 'قانون العمل'}
                </h3>
                <p className="text-xs text-stone-500">
                  {workingLaw.chapters?.length || 0} أبواب · {allArticlesList.length} مادة مستخرجة
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('linking')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>الانتقال لمراجعة وتعديل الارتباطات بالقرارات ←</span>
                </button>
              </div>
            </div>

            {/* Chapters & Articles List */}
            <div className="space-y-6">
              {(workingLaw.chapters || []).map((ch) => (
                <div key={ch.id} className="border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-stone-100 p-3 flex items-center justify-between border-b border-stone-200">
                    <span className="font-bold text-xs text-stone-800">
                      {ch.chapterNumber}: {ch.title} ({ch.articlesRange || `${ch.articles?.length || 0} مادة`})
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      {ch.articles?.length || 0} مواد
                    </span>
                  </div>

                  <div className="p-3 divide-y divide-stone-100 space-y-3">
                    {(ch.articles || []).map((art, aIdx) => (
                      <div key={aIdx} className="pt-2 first:pt-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            {art.number}
                          </span>
                          {art.title && (
                            <span className="text-xs font-semibold text-stone-800">
                              {art.title}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-600 font-serif leading-relaxed line-clamp-3">
                          {art.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Manual Linking & Review */}
        {activeTab === 'linking' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-sky-950">
              <div className="space-y-1">
                <span className="font-bold block text-sm">
                  مراجعة وتعديل ارتباط القرارات الوزارية بمواد القانون يدوياً:
                </span>
                <p className="leading-relaxed">
                  تم إجراء مطابقة آلية للقرارات الوزارية مع نصوص مواد القانون المرفوع. يمكنك الآن تعديل أي ارتباط يدوياً بإضافة أو حذف أرقام المواد.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunAutoLinking}
                className="px-3.5 py-2 bg-sky-700 hover:bg-sky-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                title="إعادة تطبيق خوارزمية الربط الذكية"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>إعادة الربط التلقائي بمواد القانون</span>
              </button>
            </div>

            {/* Search filter for decisions */}
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-2.5 opacity-50" />
              <input
                type="text"
                value={linkingSearch}
                onChange={(e) => setLinkingSearch(e.target.value)}
                placeholder="ابحث عن قرار برقم القرار أو الموضوع لتعديل ارتباطاته بمواد القانون..."
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Decisions List with manual linkage editor */}
            <div className="space-y-4">
              {filteredDecisions.map((decision) => {
                const currentLinked = decision.relatedLawArticles || [];
                const customVal = customInputs[decision.id] || '';

                return (
                  <div
                    key={decision.id}
                    className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-2xs hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            قرار وزاري رقم ({decision.decisionNumber}) لسنة {decision.year}
                          </span>
                          <span className="text-xs text-stone-500">· {decision.category}</span>
                        </div>
                        <h4 className="font-bold text-stone-900 text-sm mt-1">
                          {decision.title}
                        </h4>
                      </div>

                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                        {currentLinked.length} مواد مرتبطة
                      </span>
                    </div>

                    {/* Linked Articles Chips */}
                    <div className="space-y-1.5 pt-2 border-t border-stone-100">
                      <label className="block text-xs font-bold text-stone-700">
                        المواد المنفذة من قانون العمل:
                      </label>

                      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-stone-50 rounded-lg border border-stone-200">
                        {currentLinked.length > 0 ? (
                          currentLinked.map((art) => (
                            <span
                              key={art}
                              className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300"
                            >
                              <span>{art}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveArticleFromDecision(decision.id, art)}
                                className="hover:text-rose-600 cursor-pointer"
                                title={`إزالة ${art}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-stone-400 italic">
                            لم يتم ربط هذا القرار بأي مادة بعد. أدخل رقم المادة أدناه.
                          </span>
                        )}
                      </div>

                      {/* Add new article input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={customVal}
                          onChange={(e) =>
                            setCustomInputs({ ...customInputs, [decision.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (customVal.trim()) {
                                handleAddArticleToDecision(decision.id, customVal);
                                setCustomInputs({ ...customInputs, [decision.id]: '' });
                              }
                            }
                          }}
                          placeholder="أدخل رقم المادة (مثال: 50 أو المادة 88)..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customVal.trim()) {
                              handleAddArticleToDecision(decision.id, customVal);
                              setCustomInputs({ ...customInputs, [decision.id]: '' });
                            }
                          }}
                          className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة المادة</span>
                        </button>
                      </div>

                      {/* Quick Suggestions from uploaded law */}
                      {allArticlesList.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] text-stone-400 block mb-1">
                            مقترحات سريعة من مواد القانون المرفوع (انقر للإضافة الفورية):
                          </span>
                          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                            {allArticlesList.slice(0, 30).map((item) => {
                              const isLinked = currentLinked.includes(item.number);
                              return (
                                <button
                                  key={item.number}
                                  type="button"
                                  onClick={() =>
                                    isLinked
                                      ? handleRemoveArticleFromDecision(decision.id, item.number)
                                      : handleAddArticleToDecision(decision.id, item.number)
                                  }
                                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border cursor-pointer transition-colors ${
                                    isLinked
                                      ? 'bg-amber-500 text-white border-amber-600 font-bold'
                                      : 'bg-white text-stone-600 border-stone-200 hover:border-amber-400'
                                  }`}
                                >
                                  {item.number} {isLinked ? '✓' : '+'}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-stone-200 px-6 py-3.5 bg-stone-50 flex items-center justify-between shrink-0 flex-wrap gap-2">
          <span className="text-xs text-stone-500">
            النص المعتمد والارتباطات تحفظ فورياً وتحدث جميع الشاشات ونوافذ الطباعة والاستعراض
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleApplyAndReplaceLaw}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>اعتماد واستبدال نص القانون والارتباطات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
