import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FolderOpen,
  FileText,
  FileDown,
  Printer,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  Trash2,
  Eye,
  FileCheck,
  Search,
  Filter,
  Check,
  RotateCcw,
  BookOpen,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { MinisterialDecision } from '../types/decision';
import { LaborLawInfo } from '../data/laborLawData';
import {
  IngestedDocumentInfo,
  analyzeUploadedDocument,
  buildOrganizedLibraryDecisions
} from '../utils/decisionDocumentParser';
import {
  savePdfToStorage,
  getPdfFromStorage,
  formatFileSize,
  getDocumentsLibraryList,
  StoredDocumentItem
} from '../utils/documentLibraryStorage';
import { exportDecisionAsWord, exportDecisionAsPdf } from '../utils/exportUtils';
import { useTheme } from '../context/ThemeContext';

interface DocumentLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisions: MinisterialDecision[];
  onDecisionsUpdated: (newDecisions: MinisterialDecision[]) => void;
  law?: LaborLawInfo | null;
  onViewDecision: (decision: MinisterialDecision, initialTab?: 'scanned_pdf' | 'written_text' | 'summary') => void;
}

export const DocumentLibraryModal: React.FC<DocumentLibraryModalProps> = ({
  isOpen,
  onClose,
  decisions,
  onDecisionsUpdated,
  law,
  onViewDecision,
}) => {
  const { activeTheme, activeAccent } = useTheme();

  const [activeTab, setActiveTab] = useState<'upload' | 'repository' | 'coverage'>('upload');
  const [ingestedFiles, setIngestedFiles] = useState<IngestedDocumentInfo[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizationSuccessMessage, setOrganizationSuccessMessage] = useState<string | null>(null);

  // Repository search & filter
  const [repoSearch, setRepoSearch] = useState('');
  const [repoTypeFilter, setRepoTypeFilter] = useState<'all' | 'pdf' | 'word'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle multi-file selection
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsAnalyzing(true);
    setOrganizationSuccessMessage(null);

    const analyzedList: IngestedDocumentInfo[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const analyzed = await analyzeUploadedDocument(file, decisions);
        analyzedList.push(analyzed);
      } catch (err) {
        console.error('Error analyzing file:', file.name, err);
        analyzedList.push({
          file,
          id: `doc-err-${Date.now()}-${i}`,
          filename: file.name,
          size: file.size,
          extension: (file.name.split('.').pop()?.toLowerCase() || 'other') as any,
          documentType: 'unknown',
          isNewDecision: true,
          action: 'create_new_decision',
          status: 'error',
          errorMessage: 'تعذر استخراج بيانات الملف تلقائياً',
        });
      }
    }

    setIngestedFiles((prev) => [...prev, ...analyzedList]);
    setIsAnalyzing(false);
    if (e.target) e.target.value = '';
  };

  // Remove a file from pending ingest queue
  const handleRemovePendingFile = (id: string) => {
    setIngestedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Execute Auto-Organization on behalf of the user
  const handleExecuteAutoOrganization = async () => {
    if (ingestedFiles.length === 0) return;

    setIsOrganizing(true);

    try {
      // 1. Build organized decisions
      const { updatedDecisions, newCount, updatedCount } = buildOrganizedLibraryDecisions(
        ingestedFiles,
        decisions
      );

      // 2. Save any PDF attachments to IndexedDB storage
      for (const doc of ingestedFiles) {
        if (doc.documentType === 'scanned_pdf' || doc.extension === 'pdf') {
          const decNumber = doc.detectedDecisionNumber || '1';
          const decYear = doc.detectedYear || 2025;
          const targetId = doc.matchedExistingDecisionId || `dec-${decYear}-${decNumber}`;
          try {
            await savePdfToStorage(targetId, doc.file, doc.filename);
          } catch (storageErr) {
            console.error('Failed to store PDF in IndexedDB:', doc.filename, storageErr);
          }
        }
      }

      // 3. Save updated decisions in parent and storage
      onDecisionsUpdated(updatedDecisions);

      // 4. Mark all items as imported
      setIngestedFiles((prev) =>
        prev.map((item) => ({ ...item, status: 'imported' }))
      );

      setOrganizationSuccessMessage(
        `تم تنظيم ${ingestedFiles.length} مستند بنجاح! تم إنشاء (${newCount}) قرار جديد، وتحديث (${updatedCount}) قرار قائم وإرفاق النسخ الرسمية بها.`
      );
    } catch (err) {
      console.error('Error during auto-organization:', err);
      setOrganizationSuccessMessage('تعذر استكمال تنظيم المستندات، يرجى التحقق من الملفات والمحاولة مجدداً.');
    } finally {
      setIsOrganizing(false);
    }
  };

  // Get current stored documents list
  const storedDocuments = getDocumentsLibraryList(decisions);

  // Filtered repository documents
  const filteredRepositoryDocs = storedDocuments.filter((doc) => {
    if (repoTypeFilter === 'pdf' && doc.docType !== 'scanned_pdf') return false;
    if (repoTypeFilter === 'word' && doc.docType !== 'written_word') return false;

    if (repoSearch.trim()) {
      const q = repoSearch.trim().toLowerCase();
      const matchName = doc.filename.toLowerCase().includes(q);
      const matchNum = doc.decisionNumber.toLowerCase().includes(q);
      const matchTitle = doc.decisionTitle.toLowerCase().includes(q);
      const matchCat = doc.category.toLowerCase().includes(q);
      const matchArt = doc.relatedLawArticles.some((a) => a.toLowerCase().includes(q));
      return matchName || matchNum || matchTitle || matchCat || matchArt;
    }
    return true;
  });

  const pdfCount = storedDocuments.filter((d) => d.docType === 'scanned_pdf').length;
  const wordCount = storedDocuments.filter((d) => d.docType === 'written_word').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 font-cairo">
      <div
        className={`w-full max-w-5xl rounded-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)] border overflow-hidden transition-colors flex flex-col max-h-[92vh] specular-border-t ${
          activeTheme.isDark
            ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4.5 border-b shrink-0 ${
            activeTheme.isDark
              ? 'bg-zinc-950/90 border-zinc-800'
              : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: activeAccent.colorHex }}
            >
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                <span>مكتبة وثائق القرارات والرفع الذكي</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                  تنظيم آلي نيابة عنك
                </span>
              </h2>
              <p
                className={`text-xs ${
                  activeTheme.isDark ? 'text-zinc-400' : 'text-stone-500'
                }`}
              >
                ارفع جميع المستندات (PDF رسمية ممسوحة، وورد Word) وسيقوم النظام بتنظيمها وتصنيفها وربطها بالقرارات تلقائياً
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              activeTheme.isDark
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
            }`}
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Banner */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3 border-b text-xs shrink-0 ${
            activeTheme.isDark ? 'bg-zinc-850 border-zinc-800' : 'bg-stone-100/70 border-stone-200'
          }`}
        >
          <div>
            <span className="opacity-70">إجمالي وثائق المكتبة: </span>
            <span className="font-bold font-mono tabular-nums">{storedDocuments.length}</span>
          </div>
          <div>
            <span className="opacity-70">النسخ الرسمية الممسوحة (PDF): </span>
            <span className="font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
              {pdfCount}
            </span>
          </div>
          <div>
            <span className="opacity-70">النسخ المكتوبة (Word): </span>
            <span className="font-bold text-sky-600 dark:text-sky-400 font-mono tabular-nums">
              {wordCount}
            </span>
          </div>
          <div>
            <span className="opacity-70">القرارات المنظمة: </span>
            <span
              className="font-bold font-mono tabular-nums"
              style={{ color: activeAccent.colorHex }}
            >
              {decisions.length}
            </span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div
          className={`flex items-center gap-2 px-6 pt-3 border-b shrink-0 ${
            activeTheme.isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-b-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={
              activeTab === 'upload'
                ? { borderBottomColor: activeAccent.colorHex, color: activeAccent.colorHex }
                : undefined
            }
          >
            <Upload className="w-4 h-4" />
            <span>الرفع والتنظيم التلقائي للمستندات</span>
            {ingestedFiles.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-600 font-mono">
                {ingestedFiles.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('repository')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'repository'
                ? 'border-b-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={
              activeTab === 'repository'
                ? { borderBottomColor: activeAccent.colorHex, color: activeAccent.colorHex }
                : undefined
            }
          >
            <FolderOpen className="w-4 h-4" />
            <span>مستودع الوثائق والمكتبة المعتمدة ({storedDocuments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coverage')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'coverage'
                ? 'border-b-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={
              activeTab === 'coverage'
                ? { borderBottomColor: activeAccent.colorHex, color: activeAccent.colorHex }
                : undefined
            }
          >
            <BookOpen className="w-4 h-4" />
            <span>فحص تغطية مواد قانون العمل 14</span>
          </button>
        </div>

        {/* Tab 1: Smart Upload & Auto-Organize */}
        {activeTab === 'upload' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Success notification */}
            {organizationSuccessMessage && (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  <span className="font-semibold">{organizationSuccessMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('repository')}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 cursor-pointer whitespace-nowrap"
                >
                  استعراض المكتبة الآن ←
                </button>
              </div>
            )}

            {/* Drag & Drop Multi-file Upload Box */}
            <div
              className={`relative overflow-hidden group p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center transition-all ${
                activeTheme.isDark
                  ? 'border-zinc-700 bg-zinc-850 hover:border-zinc-500'
                  : 'border-stone-300 bg-stone-50 hover:border-stone-400 hover:bg-stone-100/60'
              }`}
            >
              {/* Subtle dot matrix pattern */}
              <div className="absolute inset-0 bg-dot-matrix opacity-30 pointer-events-none" />

              <div
                className="relative w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-md transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: activeAccent.colorHex,
                  boxShadow: `0 0 20px -2px ${activeAccent.colorHex}45`,
                }}
              >
                <Upload className="w-7 h-7" />
              </div>

              <h3 className="relative text-base sm:text-lg font-bold mb-1">
                اسحب وأفلت كافة مستندات القرارات الوزارية هنا
              </h3>
              <p
                className={`relative text-xs max-w-xl mx-auto mb-5 leading-relaxed ${
                  activeTheme.isDark ? 'text-zinc-400' : 'text-stone-500'
                }`}
              >
                يدعم النظام رفع <strong>ملفات متعددة دفعة واحدة</strong>: النسخ الرسمية الممسوحة ضوئياً (PDF)، مستندات
                Word (.docx, .doc)، والملفات النصية (.txt). يقوم المحرك الذكي بقراءة نصوص المستندات، استخراج رقم وسنة القرار،
                تصنيفها تلقائياً، وربطها بمواد قانون العمل رقم 14 لسنة 2025.
              </p>

              <div className="relative flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-shimmer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-transform active:scale-95 cursor-pointer"
                  style={{ backgroundColor: activeAccent.colorHex }}
                >
                  <FileText className="w-4 h-4" />
                  <span>اختيار ملفات ومستندات متعددة</span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain"
                  onChange={handleFilesSelected}
                  className="hidden"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] opacity-75">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>PDF ممسوح ضوئياً</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>Word مكتوب</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>ربط تلقائي بقانون العمل 14</span>
                </span>
              </div>
            </div>

            {/* Loading analysis spinner */}
            {isAnalyzing && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center flex items-center justify-center gap-3 text-xs sm:text-sm text-amber-700 dark:text-amber-400">
                <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                <span>جارٍ فحص المستندات واستخراج أرقام القرارات ومطابقتها لمواد قانون العمل...</span>
              </div>
            )}

            {/* List of Analyzed Documents Ready for Organization */}
            {ingestedFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" style={{ color: activeAccent.colorHex }} />
                    <h4 className="text-sm font-bold">
                      المستندات المحللة والمعدة للتنظيم التلقائي ({ingestedFiles.length})
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIngestedFiles([])}
                      className="px-3 py-1.5 rounded-lg text-xs opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      مسح القائمة
                    </button>

                    <button
                      type="button"
                      onClick={handleExecuteAutoOrganization}
                      disabled={isOrganizing}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: activeAccent.colorHex }}
                    >
                      {isOrganizing ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin" />
                          <span>جارٍ التنظيم في المكتبة...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>تنظيم واعتماد كافة المستندات في المكتبة آلياً</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="border rounded-xl overflow-hidden divide-y divide-black/5 dark:divide-white/5">
                  {ingestedFiles.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                        doc.status === 'imported'
                          ? 'bg-emerald-500/5'
                          : doc.status === 'error'
                          ? 'bg-red-500/5'
                          : ''
                      }`}
                    >
                      {/* Document Details */}
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                            doc.extension === 'pdf'
                              ? 'bg-rose-600'
                              : doc.extension === 'docx' || doc.extension === 'doc'
                              ? 'bg-sky-600'
                              : 'bg-stone-600'
                          }`}
                        >
                          {doc.extension.toUpperCase()}
                        </div>

                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm">
                              {doc.filename}
                            </span>
                            <span className="text-[11px] opacity-60 font-mono">
                              ({formatFileSize(doc.size)})
                            </span>

                            {doc.status === 'imported' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                ✓ نُظّم في المكتبة
                              </span>
                            ) : doc.action === 'attach_pdf' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                إرفاق نسخة رسمية لقرار قائم
                              </span>
                            ) : doc.action === 'attach_word' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                                تحديث نص قرار قائم
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                + إنشاء قرار وزاري جديد
                              </span>
                            )}
                          </div>

                          {/* Extracted Details */}
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              قرار رقم {doc.detectedDecisionNumber || '1'} لسنة {doc.detectedYear || 2025}
                            </span>
                            <span aria-hidden="true" className="opacity-40">·</span>
                            <span className="opacity-80">{doc.detectedCategory}</span>
                            <span aria-hidden="true" className="opacity-40">·</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                              {(doc.detectedRelatedArticles || []).join('، ')}
                            </span>
                          </div>

                          <div className="text-xs opacity-70 line-clamp-1">
                            {doc.detectedTitle}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {(() => {
                          const matchedDec = decisions.find(
                            (d) =>
                              d.id === doc.matchedExistingDecisionId ||
                              (d.decisionNumber === doc.detectedDecisionNumber &&
                                String(d.year) === String(doc.detectedYear))
                          );
                          if (!matchedDec) return null;
                          return (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onViewDecision(
                                  matchedDec,
                                  doc.extension === 'pdf' ? 'scanned_pdf' : 'written_text'
                                );
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
                              title="استعراض هذا التشريع فوراً"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>استعراض القرار</span>
                            </button>
                          );
                        })()}

                        <button
                          type="button"
                          onClick={() => handleRemovePendingFile(doc.id)}
                          className="p-1.5 opacity-60 hover:opacity-100 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                          title="حذف من قائمة الرفع"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Repository of Stored Documents */}
        {activeTab === 'repository' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute right-3 top-2.5 opacity-50" />
                <input
                  type="text"
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  placeholder="ابحث باسم المستند، رقم القرار، أو المادة القانونية..."
                  className={`w-full pr-9 pl-4 py-2 rounded-lg border text-xs focus:outline-hidden ${
                    activeTheme.isDark
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                      : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div
                className={`flex items-center p-0.5 rounded-lg border shrink-0 ${
                  activeTheme.isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-stone-100 border-stone-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setRepoTypeFilter('all')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    repoTypeFilter === 'all'
                      ? 'bg-white dark:bg-zinc-700 shadow-2xs font-bold'
                      : 'opacity-70'
                  }`}
                >
                  الكل ({storedDocuments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRepoTypeFilter('pdf')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    repoTypeFilter === 'pdf'
                      ? 'bg-white dark:bg-zinc-700 shadow-2xs font-bold text-rose-600'
                      : 'opacity-70'
                  }`}
                >
                  نسخ PDF ممسوحة ({pdfCount})
                </button>
                <button
                  type="button"
                  onClick={() => setRepoTypeFilter('word')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    repoTypeFilter === 'word'
                      ? 'bg-white dark:bg-zinc-700 shadow-2xs font-bold text-sky-600'
                      : 'opacity-70'
                  }`}
                >
                  نسخ Word مكتوبة ({wordCount})
                </button>
              </div>
            </div>

            {/* Guidance banner for clicking */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-semibold">
                  يمكنك النقر مباشرة على أي صف أو اسم مستند أو رقم تشريع لاستعراضه فوراً بالنسخ الرسمية (PDF / Word) وقراءة مواده.
                </span>
              </div>
              <span className="text-[11px] opacity-75 hidden sm:inline whitespace-nowrap">
                💡 اضغط على أي سطر لفتحه
              </span>
            </div>

            {/* Documents List Table */}
            {filteredRepositoryDocs.length === 0 ? (
              <div className="p-12 text-center opacity-60">
                <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>لا توجد وثائق مطابقة لخيارات البحث</p>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-right text-xs">
                  <thead
                    className={`border-b font-semibold ${
                      activeTheme.isDark
                        ? 'bg-zinc-850 border-zinc-700 text-zinc-300'
                        : 'bg-stone-100/80 border-stone-200 text-stone-600'
                    }`}
                  >
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">النوع</th>
                      <th className="py-3 px-4">اسم المستند والملف</th>
                      <th className="py-3 px-4 w-36">القرار المرتبط</th>
                      <th className="py-3 px-4 w-36">التصنيف</th>
                      <th className="py-3 px-4 w-28">مواد القانون</th>
                      <th className="py-3 px-4 w-24">الحجم</th>
                      <th className="py-3 px-4 w-48 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {filteredRepositoryDocs.map((doc) => {
                      const matchedDecision = decisions.find((d) => d.id === doc.decisionId);
                      return (
                        <tr
                          key={doc.id}
                          onClick={() => {
                            if (matchedDecision) {
                              onClose();
                              onViewDecision(
                                matchedDecision,
                                doc.docType === 'scanned_pdf' ? 'scanned_pdf' : 'written_text'
                              );
                            }
                          }}
                          className={`cursor-pointer transition-colors group ${
                            activeTheme.isDark
                              ? 'hover:bg-amber-500/10'
                              : 'hover:bg-amber-50/80'
                          }`}
                          title={`انقر لاستعراض قرار رقم (${doc.decisionNumber}) - ${doc.decisionTitle}`}
                        >
                          <td className="py-3 px-4 text-center">
                            {doc.docType === 'scanned_pdf' ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                PDF
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                                Word
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            <div className="flex items-center gap-2">
                              <Eye className="w-3.5 h-3.5 text-amber-500 shrink-0 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                              <span className="group-hover:underline group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                {doc.filename}
                              </span>
                            </div>
                            <div className="text-[11px] opacity-70 line-clamp-1 mt-0.5 pr-5.5 font-sans">
                              {doc.decisionTitle}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (matchedDecision) {
                                  onClose();
                                  onViewDecision(matchedDecision, 'summary');
                                }
                              }}
                              className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                              title="استعراض ملخص ومواد هذا القرار"
                            >
                              <span>قرار رقم {doc.decisionNumber}</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </button>
                          </td>
                          <td className="py-3 px-4 opacity-75 whitespace-nowrap">
                            {doc.category}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            {doc.relatedLawArticles.join(', ')}
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums opacity-60 whitespace-nowrap">
                            {formatFileSize(doc.size)}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              {matchedDecision && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onClose();
                                      onViewDecision(
                                        matchedDecision,
                                        doc.docType === 'scanned_pdf' ? 'scanned_pdf' : 'written_text'
                                      );
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs ${
                                      doc.docType === 'scanned_pdf'
                                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                        : 'bg-sky-600 hover:bg-sky-500 text-white'
                                    }`}
                                    title={doc.docType === 'scanned_pdf' ? 'استعراض النسخة الممسوحة PDF' : 'استعراض النص الحرفي/المكتوب'}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{doc.docType === 'scanned_pdf' ? 'استعراض PDF' : 'استعراض النص'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (matchedDecision) {
                                        if (doc.docType === 'scanned_pdf') {
                                          const pdfRecord = await getPdfFromStorage(matchedDecision.id);
                                          if (pdfRecord?.url) {
                                            const link = document.createElement('a');
                                            link.href = pdfRecord.url;
                                            link.download = pdfRecord.filename || doc.filename;
                                            link.click();
                                          } else {
                                            exportDecisionAsPdf(matchedDecision);
                                          }
                                        } else {
                                          exportDecisionAsWord(matchedDecision);
                                        }
                                      }
                                    }}
                                    className="p-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                    title={`تنزيل ملف ${doc.docType === 'scanned_pdf' ? 'PDF' : 'Word'}`}
                                  >
                                    <FileDown className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Coverage of Labor Law */}
        {activeTab === 'coverage' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 leading-relaxed">
              <strong>خريطة تغطية وتوثيق مواد قانون العمل:</strong> يوضح هذا التقرير الأبواب والموضوعات
              التشريعية التي تم تنظيم وثائق وقرارات وزارية لها في المكتبة مع بيان حالة النسخ الرسمية الممسوحة (PDF) والنسخ المكتوبة (Word).
            </div>

            {!law || !law.chapters || law.chapters.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed rounded-xl border-amber-400/40 bg-amber-500/5 space-y-2">
                <BookOpen className="w-8 h-8 text-amber-500 mx-auto" />
                <div className="text-sm font-bold">بانتظار رفع نص قانون العمل</div>
                <div className="text-xs opacity-75">
                  تم حذف قانون العمل السابق. عند رفعك لنسخة القانون، سيتم إنشاء خريطة الربط والتغطية التشريعية تلقائياً.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {law.chapters.map((chapter) => {
                const chapterDecisions = decisions.filter((d) =>
                  chapter.articles.some((art) => d.relatedLawArticles.includes(art.number))
                );

                return (
                  <div
                    key={chapter.id}
                    className="p-4 rounded-xl border divide-y divide-black/5 dark:divide-white/5 space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="font-bold text-sm">
                          {chapter.title}
                        </div>
                        <div className="opacity-70 text-[11px] mt-0.5">
                          {chapter.articles.length} مادة تشريعية ({chapter.articles[0]?.number} إلى{' '}
                          {chapter.articles[chapter.articles.length - 1]?.number})
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          chapterDecisions.length > 0
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-stone-500/15 text-stone-600 dark:text-stone-400 border-stone-500/30'
                        }`}
                      >
                        {chapterDecisions.length > 0
                          ? `✓ مغطى بـ ${chapterDecisions.length} قرار وزاري`
                          : 'بانتظار إضافة القرارات المنفذة'}
                      </span>
                    </div>

                    {chapterDecisions.length > 0 && (
                      <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {chapterDecisions.map((dec) => (
                          <div
                            key={dec.id}
                            onClick={() => {
                              onClose();
                              onViewDecision(dec, 'summary');
                            }}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition-all hover:scale-[1.01] group shadow-2xs ${
                              activeTheme.isDark
                                ? 'bg-zinc-800/60 border-zinc-700/60 hover:border-amber-500/50 hover:bg-amber-500/10'
                                : 'bg-stone-50 border-stone-200/80 hover:border-amber-500/50 hover:bg-amber-50/80'
                            }`}
                            title="انقر لاستعراض هذا القرار ومواده والنسخة الرسمية فوراً"
                          >
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="font-bold text-xs flex items-center gap-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                <Eye className="w-3.5 h-3.5 text-amber-500 shrink-0 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                                <span className="truncate">قرار رقم {dec.decisionNumber} لسنة {dec.year}</span>
                                <span className="text-[10px] opacity-75 font-normal shrink-0">
                                  ({dec.legislationType || 'قرار وزاري'})
                                </span>
                              </div>
                              <div className="opacity-75 text-[11px] line-clamp-1 font-sans">
                                {dec.title}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onViewDecision(dec, 'summary');
                                }}
                                className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 cursor-pointer flex items-center gap-1 shadow-2xs"
                                title="استعراض القرار"
                              >
                                <Eye className="w-3 h-3" />
                                <span>استعراض</span>
                              </button>

                              {dec.pdfAttachment ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onViewDecision(dec, 'scanned_pdf');
                                  }}
                                  className="text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold px-1.5 py-1 rounded-lg hover:bg-rose-200 cursor-pointer border border-rose-300/40"
                                  title="استعراض النسخة الرسمية PDF"
                                >
                                  PDF ✓
                                </button>
                              ) : null}

                              <button
                                type="button"
                                onClick={() => exportDecisionAsWord(dec)}
                                className="text-[10px] bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold px-1.5 py-1 rounded-lg hover:bg-sky-200 cursor-pointer border border-sky-300/40"
                                title="تحميل نسخة Word مكتوبة"
                              >
                                Word
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-t shrink-0 ${
            activeTheme.isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="text-xs opacity-75">
            المكتبة المركزية للقرارات الوزارية · قانون العمل رقم 14 لسنة 2025
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-sm cursor-pointer"
            style={{ backgroundColor: activeAccent.colorHex }}
          >
            إغلاق المكتبة
          </button>
        </div>
      </div>
    </div>
  );
};
