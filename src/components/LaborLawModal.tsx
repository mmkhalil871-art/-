import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  BookOpen,
  FileDown,
  FileText,
  FileUp,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Layers,
  Scale,
  CheckCircle2,
  Paperclip,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { LaborLawInfo, LABOR_LAW_14_2025 } from '../data/laborLawData';
import {
  exportLaborLawAsWord,
  exportLaborLawAsText
} from '../utils/exportUtils';
import {
  getPdfFromStorage,
  savePdfToStorage,
  formatFileSize
} from '../utils/pdfStorage';
import { isCustomLawStored } from '../utils/lawStorage';

interface LaborLawModalProps {
  isOpen: boolean;
  onClose: () => void;
  law?: LaborLawInfo;
  onOpenSyncModal?: () => void;
}

export const LaborLawModal: React.FC<LaborLawModalProps> = ({
  isOpen,
  onClose,
  law = LABOR_LAW_14_2025,
  onOpenSyncModal,
}) => {
  const [fontSize, setFontSize] = useState<number>(16);
  const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{ filename: string; size: number } | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCustom = isCustomLawStored();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Load existing PDF if user previously uploaded a PDF copy of Law 14/2025
  useEffect(() => {
    if (isOpen) {
      getPdfFromStorage('labor-law-14-2025').then((res) => {
        if (res && res.url) {
          setPdfUrl(res.url);
          setPdfInfo({ filename: res.filename, size: res.size });
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    exportLaborLawAsWord(law);
  };

  const handleDownloadText = () => {
    exportLaborLawAsText(law);
  };

  const handleUploadLawPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoadingPdf(true);
      const stored = await savePdfToStorage('labor-law-14-2025', file, file.name);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setPdfInfo({ filename: stored.filename, size: stored.size });
      setActiveTab('pdf');
    } catch (err) {
      console.error('Failed to save Law PDF', err);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col border border-stone-200 overflow-hidden relative print-container">
        {/* Top Header Bar (Hidden in Print) */}
        <div className="bg-stone-900 text-stone-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 border-b border-stone-800 no-print shrink-0 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 block">التشريع الأساسي المعتمد</span>
                {isCustom && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono">
                    نسخة رسمية محدثة
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-white">
                {law.title} (النص الكامل)
              </span>
            </div>
          </div>

          {/* Tab Switcher: Text vs PDF */}
          <div className="flex items-center bg-stone-800 p-0.5 rounded-lg border border-stone-700 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'text'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>النص المبوب ({law.chapters.length} أبواب)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!pdfUrl) {
                  fileInputRef.current?.click();
                } else {
                  setActiveTab('pdf');
                }
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pdf'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <FileDown className="w-3.5 h-3.5 text-rose-400" />
              <span>{pdfUrl ? 'نسخة PDF الرسمية' : 'رفع نسخة PDF +'}</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf,.pdf"
              onChange={handleUploadLawPdf}
              className="hidden"
            />
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Font size adjustments */}
            {activeTab === 'text' && (
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

            {/* Replace / Sync Law Button */}
            {onOpenSyncModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSyncModal();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer border border-emerald-400/30"
                title="تحديث واستبدال نص القانون بصيغة Word أو PDF ومراجعة روابط المواد بالقرارات"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تحديث واستبدال النص ومراجعة الروابط</span>
              </button>
            )}

            {/* Direct Word (.doc) Download */}
            <button
              type="button"
              onClick={handleDownloadWord}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
              title="تحميل قانون العمل كاملاً بصيغة Microsoft Word"
            >
              <FileDown className="w-4 h-4" />
              <span>Word</span>
            </button>

            {/* Direct PDF / Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
              title="طباعة أو حفظ القانون بصيغة PDF"
            >
              <Printer className="w-4 h-4" />
              <span>PDF / طباعة</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {activeTab === 'pdf' ? (
          /* PDF Viewer Tab */
          <div className="flex-1 overflow-hidden bg-stone-900 flex flex-col items-stretch p-2 sm:p-4">
            {loadingPdf ? (
              <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">
                جارٍ معالجة ملف PDF...
              </div>
            ) : pdfUrl ? (
              <div className="flex-1 flex flex-col bg-stone-800 rounded-xl overflow-hidden border border-stone-700">
                <div className="p-3 bg-stone-800 border-b border-stone-700 flex items-center justify-between text-xs text-stone-300">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">النسخة الرسمية للجريدة الرسمية (PDF):</span>
                    <span className="font-mono text-amber-300">{pdfInfo?.filename}</span>
                    {pdfInfo?.size && (
                      <span className="text-stone-400">({formatFileSize(pdfInfo.size)})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={pdfUrl}
                      download={pdfInfo?.filename || 'قانون_العمل_رقم_14_لسنة_2025.pdf'}
                      className="inline-flex items-center gap-1 text-emerald-400 hover:underline px-2 py-1 rounded bg-stone-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تنزيل الملف</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-stone-400 hover:text-white text-xs underline cursor-pointer"
                    >
                      استبدال الملف
                    </button>
                  </div>
                </div>
                <iframe
                  src={pdfUrl}
                  title="عرض قانون العمل رقم 14 لسنة 2025 بصيغة PDF"
                  className="w-full flex-1 border-0 bg-white"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-stone-400 space-y-3">
                <FileDown className="w-12 h-12 text-stone-600" />
                <h4 className="text-base font-bold text-white">
                  لم يتم رفع نسخة PDF مصورة لقانون العمل بعد
                </h4>
                <p className="text-xs text-stone-400 max-w-sm">
                  يمكنك رفع النسخة الرسمية الصادرة في الجريدة الرسمية لتكون متاحة دائماً للعرض والتنزيل بجانب النسخة النصية ونسخة الـ Word.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  <FileUp className="w-4 h-4" />
                  <span>رفع نسخة الجريدة الرسمية (PDF)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Official Legal Text Tab */
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 md:p-12 print-document bg-[#FAF8F5]">
            <div className="max-w-3xl mx-auto space-y-8 font-amiri leading-relaxed text-stone-900">
              {/* Official Gazette Header */}
              <div className="text-center border-b-2 border-stone-800 pb-6 space-y-1">
                <div className="flex items-center justify-between text-xs font-cairo text-stone-600 mb-2">
                  <div className="text-right">
                    <div className="font-bold text-stone-900">جمهورية مصر العربية</div>
                    <div>الجريدة الرسمية</div>
                    <div className="text-stone-500">{law.gazetteIssue}</div>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-stone-400 flex items-center justify-center p-2 text-stone-800">
                    <Scale className="w-7 h-7" />
                  </div>
                  <div className="text-left font-mono tabular-nums">
                    <div>تاريخ الإصدار: {law.promulgationDate}</div>
                    <div>تاريخ النشر: {law.gazetteDate}</div>
                    <div>تاريخ السريان: {law.effectiveDate}</div>
                  </div>
                </div>

                <div className="pt-3">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mb-2 font-cairo">
                    {law.title}
                  </h1>
                  <p className="text-xs font-cairo text-stone-600">
                    التشريع الأساسي المنظم لعلاقات العمل الفردية والجماعية والسلامة والصحة المهنية
                  </p>
                </div>
              </div>

              {/* Quick Download Banner Inside Text Viewer */}
              <div className="no-print bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-cairo">
                <div className="flex items-center gap-2.5">
                  <FileDown className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-bold text-stone-900 block">
                      القانون متاح للتحميل بالكامل بصيغتي Word و PDF:
                    </span>
                    <span className="text-stone-600 text-[11px]">
                      يمكنك حفظ القانون كملف وورد منسق بالكامل أو تنزيل ملف PDF أو طباعته رسمياً.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadWord}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>تحميل Word (.doc)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>حفظ PDF</span>
                  </button>
                </div>
              </div>

              {/* Key Highlights */}
              {law.keyHighlights && law.keyHighlights.length > 0 && (
                <div className="bg-stone-100/80 border border-stone-200 rounded-xl p-5 font-cairo text-xs space-y-2">
                  <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>أهم الملامح الجوهرية لقانون العمل رقم 14 لسنة 2025:</span>
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700 pt-1 leading-relaxed">
                    {law.keyHighlights.map((hl, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">▪</span>
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Table of Chapters Navigation */}
              <div className="no-print bg-stone-50 border border-stone-200 rounded-lg p-3 font-cairo text-xs">
                <div className="font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-stone-500" />
                  <span>فهرس أبواب القانون ({law.chapters.length} باب):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {law.chapters.map((ch) => (
                    <a
                      key={ch.id}
                      href={`#law-${ch.id}`}
                      className="px-2.5 py-1 bg-white hover:bg-amber-100 hover:text-amber-900 border border-stone-200 rounded text-stone-700 transition-colors"
                    >
                      {ch.chapterNumber}: {ch.title}
                    </a>
                  ))}
                </div>
              </div>

              {/* Preamble */}
              {law.preamble && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold font-cairo text-stone-600 border-b border-stone-200 pb-1">
                    الديباجة:
                  </h3>
                  <p style={{ fontSize: `${fontSize}px` }} className="text-justify font-serif">
                    {law.preamble}
                  </p>
                </div>
              )}

              {/* Promulgation Articles (مواد الإصدار) */}
              {law.promulgationArticles && law.promulgationArticles.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-stone-200">
                  <div className="text-center">
                    <div className="inline-block border-y-2 border-stone-900 py-1 px-8 font-bold text-base font-cairo">
                      ( مـــواد الإصـــدار )
                    </div>
                  </div>

                  <div className="space-y-4">
                    {law.promulgationArticles.map((art, idx) => (
                      <div key={idx} className="space-y-1">
                        <h4 className="text-sm font-bold font-cairo text-stone-900">
                          {art.number}
                        </h4>
                        <p
                          style={{ fontSize: `${fontSize}px` }}
                          className="text-justify text-stone-800 leading-relaxed font-serif"
                        >
                          {art.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chapters */}
              <div className="space-y-10 pt-6">
                <div className="text-center">
                  <div className="inline-block border-y-2 border-stone-900 py-1 px-10 font-bold text-lg font-cairo">
                    ( قـــانـــون العـــمـــل المـــرافـــق )
                  </div>
                </div>

                {law.chapters.map((chapter) => (
                  <div
                    id={`law-${chapter.id}`}
                    key={chapter.id}
                    className="space-y-4 pt-4 border-t-2 border-stone-300 scroll-mt-20 print-break-inside-avoid"
                  >
                    <div className="bg-stone-100 p-3 rounded-lg border border-stone-200 flex flex-col gap-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="text-base font-bold font-cairo text-amber-900">
                            {chapter.chapterNumber}: {chapter.title}
                          </h3>
                          {chapter.summary && <p className="text-xs text-stone-600 mt-0.5">{chapter.summary}</p>}
                        </div>
                        <span className="font-mono text-xs text-stone-700 bg-white px-2 py-0.5 rounded border border-stone-200 font-medium">
                          {chapter.articlesRange || `${chapter.articles.length} مادة`}
                        </span>
                      </div>

                      {chapter.subTopics && chapter.subTopics.length > 0 && (
                        <div className="pt-2 border-t border-stone-200/80 flex items-center gap-1.5 flex-wrap text-[11px] text-stone-600 font-cairo">
                          <span className="font-bold text-stone-700">الموضوعات الفرعية:</span>
                          {chapter.subTopics.map((topic, tIdx) => (
                            <span key={tIdx} className="bg-white px-2 py-0.5 rounded border border-stone-200 text-stone-700">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-5 pr-2">
                      {chapter.articles.map((article, aIdx) => (
                        <div key={aIdx} className="space-y-1.5 border-r-2 border-amber-500 pr-3">
                          <h4 className="text-sm font-bold font-cairo text-stone-900 flex items-center justify-between flex-wrap gap-2">
                            <span>
                              {article.number} {article.title ? `- ${article.title}` : ''}
                            </span>
                          </h4>
                          <p
                            style={{ fontSize: `${fontSize}px` }}
                            className="whitespace-pre-line text-justify text-stone-800 leading-relaxed font-serif"
                          >
                            {article.text}
                          </p>

                          {article.executingDecisions && article.executingDecisions.length > 0 && (
                            <div className="mt-2 flex items-center gap-2 flex-wrap text-xs bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-md font-cairo">
                              <span className="font-bold text-amber-900 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                القرارات الصادرة تنفيذاً لهذه المادة:
                              </span>
                              <span className="font-mono text-amber-800 font-medium">
                                {article.executingDecisions.join(' · ')}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Law Official Seal Footer */}
              <div className="pt-8 mt-12 border-t-2 border-stone-900 flex items-center justify-between print-break-inside-avoid font-cairo">
                <div className="text-right">
                  <div className="text-xs text-stone-500">صدر برئاسة الجمهورية</div>
                  <div className="text-sm font-bold font-mono text-stone-900">
                    {law.promulgationDate}
                  </div>
                  <div className="text-xs text-stone-500 mt-1">الجريدة الرسمية للدولة</div>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-stone-400 flex flex-col items-center justify-center p-2 text-stone-600 bg-amber-50/30">
                    <Scale className="w-5 h-5 text-stone-500 mb-0.5" />
                    <span className="text-[8px] font-bold">خاتم الدولة</span>
                    <span className="text-[8px] font-mono">14 / 2025</span>
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-sm font-bold text-stone-900">
                    {law.issuingAuthority}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">رئيس الجمهورية</div>
                  <div className="text-xs text-stone-400 mt-1 font-mono">[مصدق ونافذ]</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
