import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  Sparkles,
  Save,
  AlertCircle,
  FileUp,
  FileCheck,
  Paperclip
} from 'lucide-react';
import {
  MinisterialDecision,
  DecisionArticle,
  DecisionStatus,
  PdfAttachment
} from '../types/decision';
import { CATEGORIES } from '../data/seedDecisions';
import { savePdfToStorage, formatFileSize } from '../utils/pdfStorage';

interface DecisionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (decision: MinisterialDecision) => void;
  initialDecision?: MinisterialDecision | null;
}

const DEFAULT_PREAMBLE_TEMPLATE = `وزير العمل؛
بعد الاطلاع على الدستور؛
وعلى قانون العمل رقم 14 لسنة 2025، وبصفة خاصة المواد (...) منه؛
وبناءً على ما عرضه رئيس القطاع المختص بوزارة العمل؛
ولتحقيق المصلحة العامة وحماية أطراف علاقة العمل؛
قرر الآتي:`;

export const DecisionFormModal: React.FC<DecisionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDecision,
}) => {
  const isEditing = !!initialDecision;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [decisionNumber, setDecisionNumber] = useState('');
  const [year, setYear] = useState<number>(2025);
  const [title, setTitle] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('وزير العمل');
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [gazetteIssue, setGazetteIssue] = useState('الوقائع المصرية - العدد ');
  const [gazetteDate, setGazetteDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<DecisionStatus>('نافذ');
  const [category, setCategory] = useState(CATEGORIES[1]); // e.g. عقود العمل والتشغيل
  const [relatedArticlesInput, setRelatedArticlesInput] = useState('المادة 14');
  const [officialReference, setOfficialReference] = useState('');
  const [preamble, setPreamble] = useState(DEFAULT_PREAMBLE_TEMPLATE);
  const [articles, setArticles] = useState<DecisionArticle[]>([
    {
      id: 'art-1',
      articleNumber: 'المادة الأولى',
      title: 'التعريفات ونطاق السريان',
      content: '',
    },
    {
      id: 'art-2',
      articleNumber: 'المادة الثانية',
      title: 'النشر والسريان',
      content: 'يُنشر هذا القرار في الوقائع المصرية، ويُعمل به من اليوم التالي لتاريخ نشره.',
    },
  ]);
  const [explanatoryNote, setExplanatoryNote] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [legalBasisSummary, setLegalBasisSummary] = useState('');
  const [executingSubject, setExecutingSubject] = useState('');
  const [error, setError] = useState<string | null>(null);

  // PDF Upload states
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [existingPdfAttachment, setExistingPdfAttachment] =
    useState<PdfAttachment | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialDecision) {
      setDecisionNumber(initialDecision.decisionNumber);
      setYear(initialDecision.year);
      setTitle(initialDecision.title);
      setIssuingAuthority(initialDecision.issuingAuthority);
      setIssueDate(initialDecision.issueDate);
      setGazetteIssue(initialDecision.gazetteIssue);
      setGazetteDate(initialDecision.gazetteDate);
      setEffectiveDate(initialDecision.effectiveDate);
      setStatus(initialDecision.status);
      setCategory(initialDecision.category);
      setRelatedArticlesInput(initialDecision.relatedLawArticles?.join('، ') || '');
      setLegalBasisSummary(initialDecision.legalBasisSummary || '');
      setExecutingSubject(initialDecision.executingSubject || '');
      setOfficialReference(initialDecision.officialReference || '');
      setPreamble(initialDecision.preamble || DEFAULT_PREAMBLE_TEMPLATE);
      setArticles(
        initialDecision.articles && initialDecision.articles.length > 0
          ? initialDecision.articles
          : [
              {
                id: 'art-1',
                articleNumber: 'المادة الأولى',
                title: '',
                content: '',
              },
            ]
      );
      setExplanatoryNote(initialDecision.explanatoryNote || '');
      setTagsInput(initialDecision.tags?.join('، ') || '');
      setExistingPdfAttachment(initialDecision.pdfAttachment);
      setSelectedPdfFile(null);
    } else {
      // Reset form
      setDecisionNumber('');
      setYear(2025);
      setTitle('');
      setIssuingAuthority('وزير العمل');
      setIssueDate(new Date().toISOString().split('T')[0]);
      setGazetteIssue('الوقائع المصرية - العدد ');
      setGazetteDate(new Date().toISOString().split('T')[0]);
      setEffectiveDate(new Date().toISOString().split('T')[0]);
      setStatus('نافذ');
      setCategory(CATEGORIES[1]);
      setRelatedArticlesInput('المادة 14');
      setLegalBasisSummary('');
      setExecutingSubject('');
      setOfficialReference(`ق و / 14-2025 / ${Math.floor(Math.random() * 900 + 100)}`);
      setPreamble(DEFAULT_PREAMBLE_TEMPLATE);
      setArticles([
        {
          id: 'art-1',
          articleNumber: 'المادة الأولى',
          title: 'التعريفات ونطاق السريان',
          content: '',
        },
        {
          id: 'art-2',
          articleNumber: 'المادة الثانية',
          title: 'النشر والسريان',
          content: 'يُنشر هذا القرار في الوقائع المصرية، ويُعمل به من اليوم التالي لتاريخ نشره.',
        },
      ]);
      setExplanatoryNote('');
      setTagsInput('');
      setSelectedPdfFile(null);
      setExistingPdfAttachment(undefined);
    }
    setError(null);
  }, [initialDecision, isOpen]);

  if (!isOpen) return null;

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('يرجى اختيار ملف بصيغة PDF فقط.');
        return;
      }
      setSelectedPdfFile(file);
      setError(null);

      // Auto-suggest title if title is empty
      if (!title.trim()) {
        const cleanName = file.name.replace(/\.pdf$/i, '').trim();
        if (cleanName.length > 5) {
          setTitle(`بشأن ${cleanName}`);
        }
      }
    }
  };

  const handleRemovePdf = () => {
    setSelectedPdfFile(null);
    setExistingPdfAttachment(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddArticle = () => {
    const nextIdx = articles.length + 1;
    const arabicNumberWords = [
      '',
      'الأولى',
      'الثانية',
      'الثالثة',
      'الرابعة',
      'الخامسة',
      'السادسة',
      'السابعة',
      'الثامنة',
      'التاسعة',
      'العاشرة',
      'الحادية عشرة',
      'الثانية عشرة',
    ];

    const label =
      nextIdx < arabicNumberWords.length
        ? `المادة ${arabicNumberWords[nextIdx]}`
        : `المادة ${nextIdx}`;

    setArticles([
      ...articles,
      {
        id: `art-${Date.now()}-${nextIdx}`,
        articleNumber: label,
        title: '',
        content: '',
      },
    ]);
  };

  const handleRemoveArticle = (id: string) => {
    if (articles.length <= 1) {
      alert('يجب أن يتضمن القرار مادة واحدة على الأقل.');
      return;
    }
    setArticles(articles.filter((a) => a.id !== id));
  };

  const handleUpdateArticle = (
    id: string,
    field: keyof DecisionArticle,
    value: string
  ) => {
    setArticles(
      articles.map((art) => (art.id === id ? { ...art, [field]: value } : art))
    );
  };

  const handleFillSample = () => {
    setDecisionNumber('9');
    setYear(2025);
    setTitle('بشأن تنظيم ضوابط العمل عن بُعد (العمل المرن) وحماية بيانات العمال والمنشآت');
    setCategory('عقود العمل والتشغيل');
    setStatus('نافذ');
    setRelatedArticlesInput('المادة 19، المادة 24، المادة 68');
    setLegalBasisSummary('المواد 19 و 24 و 68 من قانون العمل رقم 14 لسنة 2025');
    setExecutingSubject('تنظيم العمل عن بعد وضوابط العمل المرن وتكنولوجيا المعلومات وحماية بيانات العمال');
    setOfficialReference('ق و / 14-2025 / 009');
    setPreamble(`وزير العمل؛
بعد الاطلاع على الدستور؛
وعلى قانون العمل رقم 14 لسنة 2025، لاسيما المواد المتعلقة بأنماط العمل الحديثة وتنظيم ساعات العمل؛
وعلى قانون مكافحة جرائم تقنية المعلومات وقانون حماية البيانات الشخصية؛
وبناءً على ما تقتضيه مواكبة متطلبات التحول الرقمي واقتصاد المعرفة وتوفير فرص عمل مرنة للشباب والمرأة؛
قرر الآتي:`);
    setArticles([
      {
        id: 'art-sample-1',
        articleNumber: 'المادة الأولى',
        title: 'العمل عن بُعد وحقوق العامل',
        content: `يُقصد بالعمل عن بُعد أداء العامل لمهامه الوظيفية المكلف بها خارج مقر المنشأة المعتاد باستخدام وسائل الاتصال وتكنولوجيا المعلومات.
ويتمتع العامل عن بُعد بذات الحقوق والامتيازات المقررة لأقرانه العاملين داخل مقر المنشأة، وبصفة خاصة فيما يتعلق بالأجر الأساسي والبدلات والإجازات السنوية والتأمين الاجتماعي الإلزامي والرعاية الصحية.`,
      },
      {
        id: 'art-sample-2',
        articleNumber: 'المادة الثانية',
        title: 'عقد العمل المرن وحماية الخصوصية',
        content: `يجب أن ينص عقد العمل عن بُعد صراحةً على نمط العمل ومواعيد التواجد الرقمي وآلية قياس الأداء وحماية سرية بيانات صاحب العمل.
ولا يجوز لصاحب العمل استخدام برمجيات المراقبة الرقمية بما يمس حرمة الحياة الخاصة للعامل أو يجاوز ساعات العمل المتفق عليها.`,
      },
      {
        id: 'art-sample-3',
        articleNumber: 'المادة الثالثة',
        title: 'النشر وتاريخ السريان',
        content: `يُنشر هذا القرار في الوقائع المصرية، ويُعمل به من تاريخ نشره.`,
      },
    ]);
    setExplanatoryNote('ينظم هذا القرار لأول مرة في تاريخ التشريعات العمالية المصرية العمل عن بعد والعمل الهجين تنفيذاً لمواد قانون العمل 14 لسنة 2025.');
    setTagsInput('العمل عن بعد، العمل المرن، التحول الرقمي، حماية البيانات');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionNumber.trim()) {
      setError('يرجى إدخال رقم القرار الوزاري.');
      return;
    }
    if (!title.trim()) {
      setError('يرجى إدخال عنوان وموضوع القرار.');
      return;
    }
    if (articles.some((a) => !a.content.trim())) {
      setError('يرجى التأكد من كتابة نص المواد لجميع المواد المضافة.');
      return;
    }

    setIsSaving(true);

    try {
      const decisionId = initialDecision ? initialDecision.id : `dec-${Date.now()}`;

      let pdfAttachmentData: PdfAttachment | undefined = existingPdfAttachment;

      // If user uploaded a new PDF file, save it to IndexedDB
      if (selectedPdfFile) {
        const stored = await savePdfToStorage(
          decisionId,
          selectedPdfFile,
          selectedPdfFile.name
        );
        pdfAttachmentData = {
          filename: stored.filename,
          size: stored.size,
          uploadedAt: stored.uploadedAt,
          storageKey: decisionId,
        };
      }

      const lawArticlesArray = relatedArticlesInput
        .split(/[،,]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const tagsArray = tagsInput
        .split(/[،,]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const finalDecision: MinisterialDecision = {
        id: decisionId,
        decisionNumber: decisionNumber.trim(),
        year: Number(year) || 2025,
        title: title.trim(),
        issuingAuthority: issuingAuthority.trim() || 'وزير العمل',
        issueDate: issueDate || new Date().toISOString().split('T')[0],
        gazetteIssue: gazetteIssue.trim() || 'الجريدة الرسمية',
        gazetteDate: gazetteDate || issueDate,
        effectiveDate: effectiveDate || issueDate,
        status,
        category: category || CATEGORIES[1],
        relatedLawArticles:
          lawArticlesArray.length > 0 ? lawArticlesArray : ['قانون العمل 14 لسنة 2025'],
        legalBasisSummary: legalBasisSummary.trim() || undefined,
        executingSubject: executingSubject.trim() || undefined,
        enactedLawArticlesDetail: initialDecision?.enactedLawArticlesDetail,
        preamble: preamble.trim(),
        articles,
        explanatoryNote: explanatoryNote.trim(),
        tags: tagsArray,
        officialReference:
          officialReference.trim() ||
          `ق و / 14-${year} / ${decisionNumber.padStart(3, '0')}`,
        isFavorite: initialDecision?.isFavorite || false,
        pdfAttachment: pdfAttachmentData,
        createdAt: initialDecision?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSave(finalDecision);
      onClose();
    } catch (err) {
      console.error('Error saving decision:', err);
      setError('حدث خطأ أثناء حفظ القرار أو ملف الـ PDF. يرجى المحاولة ثانية.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? 'تعديل القرار الوزاري' : 'إضافة قرار وزاري جديد'}
              </h2>
              <p className="text-xs text-stone-400">
                تنفيذاً لأحكام قانون العمل رقم 14 لسنة 2025 مع إمكانية إرفاق نسخة PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={handleFillSample}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-xs font-medium transition-colors border border-stone-700 cursor-pointer"
                title="تعبئة نموذج استرشادي تجريبي جاهز"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>نموذج استرشادي</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Section: PDF Upload (Highlight Box) */}
          <div className="bg-amber-50/50 border border-amber-200/90 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-amber-700" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                    رفع نسخة القرار الرسمية بصيغة PDF
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    يمكنك إرفاق النسخة الموقعة أو المنشورة بالجريدة الرسمية لاستعراضها وطباعتها مباشرة
                  </p>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf,.pdf"
                onChange={handlePdfChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>{selectedPdfFile || existingPdfAttachment ? 'تغيير ملف PDF' : 'اختيار ملف PDF'}</span>
              </button>
            </div>

            {/* Display attached PDF information */}
            {(selectedPdfFile || existingPdfAttachment) && (
              <div className="bg-white border border-amber-200 rounded-lg p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px]">
                    PDF
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900 block font-mono">
                      {selectedPdfFile ? selectedPdfFile.name : existingPdfAttachment?.filename}
                    </span>
                    <span className="text-stone-500 text-[11px]">
                      {selectedPdfFile
                        ? `الحجم: ${formatFileSize(selectedPdfFile.size)} · جاهز للحفظ`
                        : `الحجم: ${formatFileSize(existingPdfAttachment?.size || 0)} · مرفوع مسبقاً`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemovePdf}
                  className="text-stone-400 hover:text-rose-600 p-1 text-xs cursor-pointer"
                  title="إلغاء المرفق"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Basic Info: Number, Year, Authority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                رقم القرار الوزاري *
              </label>
              <input
                type="text"
                required
                value={decisionNumber}
                onChange={(e) => setDecisionNumber(e.target.value)}
                placeholder="مثال: 12"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                سنة الإصدار *
              </label>
              <input
                type="number"
                required
                min={2020}
                max={2030}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                جهة / صفة المصدر
              </label>
              <input
                type="text"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                placeholder="وزير العمل"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              عنوان وموضوع القرار الوزاري *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: بشأن القواعد المنظمة لساعات العمل الإضافية في قطاع الصناعات التحويلية"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-medium"
            />
          </div>

          {/* Category, Status, Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                التصنيف الموضوعي *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              >
                {CATEGORIES.filter((c) => c !== 'جميع التصنيفات').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                الحالة القانونية للقرار
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DecisionStatus)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-medium"
              >
                <option value="نافذ">نافذ</option>
                <option value="سارٍ">سارٍ</option>
                <option value="معدل">معدل</option>
                <option value="ملغى">ملغى</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                رقم المرجع الإداري
              </label>
              <input
                type="text"
                value={officialReference}
                onChange={(e) => setOfficialReference(e.target.value)}
                placeholder="ق و / 14-2025 / 009"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Dates: Issue date, Gazette, Effective Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                تاريخ صدور القرار
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                عدد وتاريخ الجريدة الرسمية
              </label>
              <input
                type="text"
                value={gazetteIssue}
                onChange={(e) => setGazetteIssue(e.target.value)}
                placeholder="العدد 12 تابع بتاريخ 2025-03-20"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                تاريخ سريان العمل به
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-mono text-emerald-800 font-semibold"
              />
            </div>
          </div>

          {/* Related Law Articles */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              المواد المنفذة من قانون العمل رقم 14 لسنة 2025 (افصل بينها بفاصلة)
            </label>
            <input
              type="text"
              value={relatedArticlesInput}
              onChange={(e) => setRelatedArticlesInput(e.target.value)}
              placeholder="مثال: المادة 14، المادة 18، المادة 32"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-mono text-stone-800"
            />
          </div>

          {/* Statutory Execution & Legal Basis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/90">
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                ⚡ السند التشريعي المباشر الصادر تنفيذاً له القرار
              </label>
              <input
                type="text"
                value={legalBasisSummary}
                onChange={(e) => setLegalBasisSummary(e.target.value)}
                placeholder="مثال: المواد 50 و 51 و 52 و 53 و 54 من قانون العمل رقم 14 لسنة 2025"
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden text-xs text-amber-950 font-medium"
              />
              <span className="text-[11px] text-amber-800/80 mt-1 block">
                تحديد مواد التفويض التشريعي بالقانون التي استوجبت إصدار هذا القرار الوزاري
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                🎯 موضوع ومجال التنفيذ التشريعي
              </label>
              <input
                type="text"
                value={executingSubject}
                onChange={(e) => setExecutingSubject(e.target.value)}
                placeholder="مثال: تشغيل النساء، حماية الأمومة، إجازات الوضع، الرضاعة وحظر التمييز"
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden text-xs text-amber-950 font-medium"
              />
              <span className="text-[11px] text-amber-800/80 mt-1 block">
                الموضوع القانوني العام الذي ينظمه القرار تنفيذاً لأحكام القانون
              </span>
            </div>
          </div>

          {/* Preamble (الديباجة) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-700">
                الديباجة والسند القانوني
              </label>
              <button
                type="button"
                onClick={() => setPreamble(DEFAULT_PREAMBLE_TEMPLATE)}
                className="text-xs text-amber-700 hover:underline cursor-pointer"
              >
                استعادة القالب الرسمي للديباجة
              </button>
            </div>
            <textarea
              rows={4}
              value={preamble}
              onChange={(e) => setPreamble(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-amiri text-base leading-relaxed"
            />
          </div>

          {/* Articles Section (المواد) */}
          <div className="border-t border-stone-200 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  مواد القرار الوزاري ({articles.length})
                </h3>
                <p className="text-xs text-stone-500">
                  أضف نصوص المواد القانونية بتسلسلها المعتمد
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddArticle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-stone-600" />
                <span>إضافة مادة أخرى</span>
              </button>
            </div>

            <div className="space-y-4">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={art.articleNumber}
                        onChange={(e) =>
                          handleUpdateArticle(
                            art.id,
                            'articleNumber',
                            e.target.value
                          )
                        }
                        placeholder="رقم المادة (المادة الأولى...)"
                        className="w-36 px-2.5 py-1.5 bg-white border border-stone-300 rounded-md font-bold text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                      />
                      <input
                        type="text"
                        value={art.title || ''}
                        onChange={(e) =>
                          handleUpdateArticle(art.id, 'title', e.target.value)
                        }
                        placeholder="عنوان المادة اختياري (مثال: التعريفات)"
                        className="flex-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    {articles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArticle(art.id)}
                        className="text-stone-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                        title="حذف هذه المادة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      required
                      value={art.content}
                      onChange={(e) =>
                        handleUpdateArticle(art.id, 'content', e.target.value)
                      }
                      placeholder="اكتب نص المادة هنا بدقة قانونية..."
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-md text-sm font-amiri leading-relaxed focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explanatory Note & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-200 pt-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                المذكرة الإيضاحية / الأثر التشريعي (اختياري)
              </label>
              <textarea
                rows={2}
                value={explanatoryNote}
                onChange={(e) => setExplanatoryNote(e.target.value)}
                placeholder="أهداف القرار وانعكاسه على سوق العمل..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs leading-relaxed focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                الكلمات الدالة والمفتاحية (مفصولة بفاصلة)
              </label>
              <textarea
                rows={2}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="عقود، أجور، تفتيش، سلامة..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs leading-relaxed focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-stone-200 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSaving
                  ? 'جارٍ الحفظ...'
                  : isEditing
                  ? 'حفظ التعديلات'
                  : 'إضافة القرار للقاعدة'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
