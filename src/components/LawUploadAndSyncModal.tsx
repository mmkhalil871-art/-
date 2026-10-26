import React, { useState, useRef } from 'react';
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
  FileUp
} from 'lucide-react';
import { LaborLawInfo, LawChapter } from '../data/laborLawData';
import { extractTextFromDocx, parseLaborLawText } from '../utils/lawParser';
import { saveStoredLaborLaw, getAllLawArticlesFlattened } from '../utils/lawStorage';
import { savePdfToStorage, formatFileSize } from '../utils/pdfStorage';
import { MinisterialDecision } from '../types/decision';

interface LawUploadAndSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLaw: LaborLawInfo;
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
  const [workingLaw, setWorkingLaw] = useState<LaborLawInfo>(currentLaw);

  // PDF upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const txtInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
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
        const updatedLaw: LaborLawInfo = {
          ...currentLaw,
          title: parsed.title || currentLaw.title,
          preamble: parsed.preamble || currentLaw.preamble,
          promulgationArticles:
            parsed.promulgationArticles.length > 0
              ? parsed.promulgationArticles
              : currentLaw.promulgationArticles,
          chapters: parsed.chapters.length > 0 ? parsed.chapters : currentLaw.chapters,
        };
        setWorkingLaw(updatedLaw);
        setActiveTab('review');
        showStatus(`تم بنجاح استخراج ${parsed.totalArticlesCount} مادة قانونية من ملف Word! يمكنك مراجعتها واعتمادها.`);
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
        const updatedLaw: LaborLawInfo = {
          ...currentLaw,
          title: parsed.title || currentLaw.title,
          preamble: parsed.preamble || currentLaw.preamble,
          promulgationArticles:
            parsed.promulgationArticles.length > 0
              ? parsed.promulgationArticles
              : currentLaw.promulgationArticles,
          chapters: parsed.chapters.length > 0 ? parsed.chapters : currentLaw.chapters,
        };
        setWorkingLaw(updatedLaw);
        setActiveTab('review');
        showStatus(`تم بنجاح تحليل ملف النص واستخراج ${parsed.totalArticlesCount} مادة.`);
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
      const updatedLaw: LaborLawInfo = {
        ...currentLaw,
        title: parsed.title || currentLaw.title,
        preamble: parsed.preamble || currentLaw.preamble,
        promulgationArticles:
          parsed.promulgationArticles.length > 0
            ? parsed.promulgationArticles
            : currentLaw.promulgationArticles,
        chapters: parsed.chapters.length > 0 ? parsed.chapters : currentLaw.chapters,
      };
      setWorkingLaw(updatedLaw);
      setActiveTab('review');
      showStatus(`تم تحليل النص واستخراج ${parsed.totalArticlesCount} مادة قانونية.`);
    } catch (err) {
      showStatus('فشل معالجة النص.', 'error');
    }
  };

  // Save reviewed law and replace the active database copy
  const handleApplyAndReplaceLaw = () => {
    saveStoredLaborLaw(workingLaw);
    onLawUpdated(workingLaw);
    showStatus('تم اعتماد واستبدال نص قانون العمل رقم 14 لسنة 2025 رسمياً في قاعدة البيانات!');
  };

  // Update an article inside a chapter
  const handleUpdateArticleText = (
    chapterId: string,
    articleIdx: number,
    field: 'number' | 'title' | 'text',
    value: string
  ) => {
    setWorkingLaw((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const newArticles = [...ch.articles];
        newArticles[articleIdx] = {
          ...newArticles[articleIdx],
          [field]: value,
        };
        return { ...ch, articles: newArticles };
      }),
    }));
  };

  // Add new article to a chapter
  const handleAddArticleToChapter = (chapterId: string) => {
    setWorkingLaw((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const nextNum = ch.articles.length + 1;
        return {
          ...ch,
          articles: [
            ...ch.articles,
            {
              number: `المادة ${nextNum}`,
              title: '',
              text: '',
            },
          ],
        };
      }),
    }));
  };

  // Remove article
  const handleRemoveArticle = (chapterId: string, articleIdx: number) => {
    setWorkingLaw((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        return {
          ...ch,
          articles: ch.articles.filter((_, idx) => idx !== articleIdx),
        };
      }),
    }));
  };

  // Decision linking synchronization
  const allArticlesList = getAllLawArticlesFlattened(workingLaw);

  const handleUpdateDecisionLinks = (decisionId: string, newArticlesString: string) => {
    const arr = newArticlesString
      .split(/[،,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const updated = decisions.map((d) =>
      d.id === decisionId ? { ...d, relatedLawArticles: arr } : d
    );
    onDecisionsUpdated(updated);
    showStatus('تم تحديث ارتباط القرار بمواد القانون بنجاح.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                تحديث واستبدال نص قانون العمل رقم 14 لسنة 2025 وتنظيم المواد
              </h2>
              <p className="text-xs text-stone-400">
                رفع القانون بصيغ مختلفة (Word / PDF / نص)، مراجعته وتحديث رابطته بالقرارات الوزارية
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
        <div className="bg-stone-100 border-b border-stone-200 px-6 py-2.5 flex items-center justify-between gap-4 text-xs font-semibold shrink-0">
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
              <span>2. مراجعة وتنظيم مواد القانون</span>
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
              <span>3. تحديث ارتباط القرارات بالمواد</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleApplyAndReplaceLaw}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>اعتماد واستبدال نص القانون الآن</span>
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

        {/* Tab 1: Upload Sources */}
        {activeTab === 'upload' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 leading-relaxed">
              <span className="font-bold">استبدال النص الحالي بالنص الصحيح: </span>
              يمكنك رفع النسخة المعتمدة لديك من قانون العمل رقم 14 لسنة 2025 بملف <strong>Microsoft Word (.docx)</strong> أو <strong>ملف نصي (.txt)</strong> أو <strong>ملف PDF</strong>، أو لصق النص كاملاً مباشرة. وسيقوم التطبيق بتحليله واستخراج مواده وترتيبها لتحديث الرابطة مع القرارات الوزارية فوراً.
            </div>

            {/* Three Upload Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Word Upload */}
              <div className="bg-stone-50 border border-stone-200 hover:border-blue-400 rounded-xl p-5 flex flex-col justify-between space-y-4 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                    <FileDown className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm">رفع مستند Word (.docx)</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    استخراج نصوص المواد والأبواب ومواد الإصدار تلقائياً من ملف الوورد المعتمد لديك.
                  </p>
                </div>

                <input
                  type="file"
                  ref={docxInputRef}
                  accept=".docx,.doc"
                  onChange={handleDocxUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => docxInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'جارٍ المعالجة...' : 'اختيار ملف Word (.docx)'}
                </button>
              </div>

              {/* PDF Upload */}
              <div className="bg-stone-50 border border-stone-200 hover:border-rose-400 rounded-xl p-5 flex flex-col justify-between space-y-4 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm">رفع نسخة الجريدة الرسمية (PDF)</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    حفظ النسخة المصورة الأصلية للجريدة الرسمية لتكون متاحة دائماً للاستعراض والتنزيل.
                  </p>
                </div>

                <input
                  type="file"
                  ref={pdfInputRef}
                  accept="application/pdf,.pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => pdfInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'جارٍ الرفع...' : 'اختيار ملف PDF'}
                </button>
              </div>

              {/* Text File Upload */}
              <div className="bg-stone-50 border border-stone-200 hover:border-stone-400 rounded-xl p-5 flex flex-col justify-between space-y-4 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm">رفع ملف نصي (.txt)</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    رفع ملف نصي أو نصوص مواد مقسمة ليقوم النظام بهيكلتها وتوزيعها على الأبواب.
                  </p>
                </div>

                <input
                  type="file"
                  ref={txtInputRef}
                  accept=".txt,.md"
                  onChange={handleTxtUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => txtInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  اختيار ملف نصي (.txt)
                </button>
              </div>
            </div>

            {/* Direct Paste & Live Extraction */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    أو لصق نص القانون مباشرة (Paste Full Text)
                  </h3>
                  <p className="text-xs text-stone-500">
                    انسخ النص الصحيح لقانون العمل والصقه هنا لاستخراج مواده وأبوابه بدقة
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleProcessPastedText}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>معالجة النص واستخراج المواد</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="الصق نص قانون العمل رقم 14 لسنة 2025 هنا (مثال: الباب الأول: التعاريف... المادة 1: ... المادة 2: ...)"
                className="w-full p-3 bg-white border border-stone-300 rounded-lg text-xs font-mono leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Review and Organize Articles */}
        {activeTab === 'review' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
            <div className="flex items-center justify-between bg-stone-100 p-4 rounded-xl border border-stone-200 flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  مراجعة نصوص وأرقام المواد المستخرجة ({allArticlesList.length} مادة)
                </h3>
                <p className="text-xs text-stone-500">
                  يمكنك تعديل أي مادة أو رقم أو إضافة مواد جديدة قبل اعتماد استبدال القانون.
                </p>
              </div>
              <button
                type="button"
                onClick={handleApplyAndReplaceLaw}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ واستبدال نص القانون في التطبيق</span>
              </button>
            </div>

            {/* Chapters and Articles Accordions */}
            <div className="space-y-6">
              {workingLaw.chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm">
                        {chapter.chapterNumber}: {chapter.title}
                      </h4>
                      <span className="text-xs text-stone-500">
                        {chapter.articles.length} مواد مسجلة
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddArticleToChapter(chapter.id)}
                      className="inline-flex items-center gap-1 text-xs text-amber-800 hover:underline font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة مادة بهذا الباب</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {chapter.articles.map((art, aIdx) => (
                      <div
                        key={aIdx}
                        className="bg-white border border-stone-200 rounded-lg p-3 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={art.number}
                            onChange={(e) =>
                              handleUpdateArticleText(
                                chapter.id,
                                aIdx,
                                'number',
                                e.target.value
                              )
                            }
                            placeholder="رقم المادة (مثال: المادة 1)"
                            className="w-36 font-bold text-xs p-1.5 bg-stone-50 border border-stone-300 rounded focus:ring-1 focus:ring-amber-500"
                          />
                          <input
                            type="text"
                            value={art.title || ''}
                            onChange={(e) =>
                              handleUpdateArticleText(
                                chapter.id,
                                aIdx,
                                'title',
                                e.target.value
                              )
                            }
                            placeholder="عنوان المادة اختياري"
                            className="flex-1 text-xs p-1.5 bg-stone-50 border border-stone-300 rounded focus:ring-1 focus:ring-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveArticle(chapter.id, aIdx)}
                            className="text-stone-400 hover:text-rose-600 p-1"
                            title="حذف المادة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <textarea
                          rows={3}
                          value={art.text}
                          onChange={(e) =>
                            handleUpdateArticleText(
                              chapter.id,
                              aIdx,
                              'text',
                              e.target.value
                            )
                          }
                          placeholder="نص المادة القانونية الكامل..."
                          className="w-full text-xs p-2 bg-stone-50/50 border border-stone-300 rounded font-serif leading-relaxed focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Decision-Law Linking Synchronization */}
        {activeTab === 'linking' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-950 leading-relaxed">
              <span className="font-bold">مراجعة وتحديث ارتباط القرارات الوزارية بالمواد: </span>
              يعرض الجدول التالي كافة القرارات الوزارية المسجلة والمواد المرتبطة بها في قانون العمل رقم 14 لسنة 2025.
              يمكنك تحديث أرقام المواد المرتبطة بكل قرار لتتوافق تماماً مع النص الجديد المعتمد.
            </div>

            <div className="space-y-4">
              {decisions.map((decision) => {
                const currentLinked = decision.relatedLawArticles || [];
                return (
                  <div
                    key={decision.id}
                    className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 shadow-2xs hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-amber-800">
                          قرار وزاري رقم ({decision.decisionNumber}) لسنة {decision.year}
                        </span>
                        <h4 className="font-bold text-stone-900 text-sm mt-0.5">
                          {decision.title}
                        </h4>
                        {decision.legalBasisSummary && (
                          <div className="text-xs text-amber-900 font-medium mt-1 bg-amber-50/80 px-2.5 py-1 rounded border border-amber-200">
                            ⚡ {decision.legalBasisSummary}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded self-start">
                        {decision.category}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                      <div className="flex-1">
                        <label className="block text-stone-600 font-medium mb-1">
                          المواد المنفذة من القانون (مفصولة بفاصلة):
                        </label>
                        <input
                          type="text"
                          defaultValue={currentLinked.join('، ')}
                          onBlur={(e) =>
                            handleUpdateDecisionLinks(decision.id, e.target.value)
                          }
                          className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded font-mono text-xs focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      {/* Matching check */}
                      <div className="text-[11px] text-stone-500 sm:w-64">
                        <span className="block font-semibold text-stone-700">المطابقة في القانون الجديد:</span>
                        {currentLinked.map((art, idx) => {
                          const exists = allArticlesList.some((a) =>
                            a.number.includes(art.replace(/المادة\s*/, ''))
                          );
                          return (
                            <span
                              key={idx}
                              className={`inline-block ml-1 mt-0.5 px-1.5 py-0.5 rounded ${
                                exists
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {art} {exists ? '✓' : '(تأكد من الرقم)'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-stone-200 px-6 py-3.5 bg-stone-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-500">
            النص المعتمد يحفظ فورياً في المتصفح ويحدث جميع نوافذ الاستعراض والطباعة
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              إغلاق
            </button>
            <button
              type="button"
              onClick={handleApplyAndReplaceLaw}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>اعتماد واستبدال نص القانون</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
