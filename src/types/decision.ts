export interface DecisionArticle {
  id: string;
  articleNumber: string; // e.g. "المادة الأولى", "المادة 1"
  title?: string; // e.g. "التعريفات ونطاق السريان"
  content: string; // Text of the article
}

export type DecisionStatus = 'نافذ' | 'سارٍ' | 'معدل' | 'ملغى';

export type LegislationType =
  | 'قرار وزاري'
  | 'قرار رئيس مجلس الوزراء'
  | 'لائحة تنفيذية'
  | 'قانون / تعديل تشريعي'
  | 'كتاب دوري'
  | 'منشور رسمي'
  | 'قرار إداري / تعليمات';

export const LEGISLATION_TYPES: {
  type: LegislationType;
  label: string;
  badgeClass: string;
  defaultAuthority: string;
}[] = [
  {
    type: 'قرار وزاري',
    label: 'قرار وزاري',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    defaultAuthority: 'وزير العمل',
  },
  {
    type: 'قرار رئيس مجلس الوزراء',
    label: 'قرار رئيس مجلس الوزراء',
    badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    defaultAuthority: 'رئيس مجلس الوزراء',
  },
  {
    type: 'لائحة تنفيذية',
    label: 'لائحة تنفيذية',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    defaultAuthority: 'وزير العمل',
  },
  {
    type: 'قانون / تعديل تشريعي',
    label: 'قانون / تعديل تشريعي',
    badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    defaultAuthority: 'رئيس الجمهورية',
  },
  {
    type: 'كتاب دوري',
    label: 'كتاب دوري',
    badgeClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
    defaultAuthority: 'وزارة العمل',
  },
  {
    type: 'منشور رسمي',
    label: 'منشور رسمي',
    badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    defaultAuthority: 'قطاع رعاية وحماية القوى العاملة',
  },
  {
    type: 'قرار إداري / تعليمات',
    label: 'قرار إداري / تعليمات',
    badgeClass: 'bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-500/30',
    defaultAuthority: 'رئيس الإدارة المركزية المختصة',
  },
];

export interface PdfAttachment {
  filename: string;
  size: number; // in bytes
  uploadedAt: string;
  dataUrl?: string; // Base64 data url or blob url
  storageKey?: string; // IndexedDB key
}

export interface MinisterialDecision {
  id: string;
  legislationType?: LegislationType; // نوع التشريع (قرار وزاري، لائحة تنفيذية، كتاب دوري، إلخ)
  decisionNumber: string; // e.g. "1", "14"
  year: number; // e.g. 2025
  title: string;
  issuingAuthority: string; // e.g. "وزير العمل"
  issueDate: string; // YYYY-MM-DD
  gazetteIssue: string; // e.g. "الجريدة الرسمية - العدد 12 مكرر"
  gazetteDate: string; // YYYY-MM-DD
  effectiveDate: string; // YYYY-MM-DD
  status: DecisionStatus;
  category: string;
  relatedLawArticles: string[]; // e.g. ["المادة 14", "المادة 18"] from Labor Law 14/2025
  legalBasisSummary?: string; // e.g. "صادر تنفيذاً للمواد (50، 51، 52، 53، 54) من قانون العمل رقم 14 لسنة 2025"
  executingSubject?: string; // الموضوع المنفذ بالقانون
  enactedLawArticlesDetail?: {
    articleNumber: string;
    topic: string;
    mandate: string; // نص التفويض أو ما ينظمه القرار تنفيذاً للمادة
  }[];
  preamble: string; // الديباجة الرسمية
  articles: DecisionArticle[];
  explanatoryNote?: string; // المذكرة الإيضاحية
  tags: string[];
  officialReference: string; // المرجع الإداري
  isFavorite?: boolean;
  notes?: string;
  pdfAttachment?: PdfAttachment;
  wordAttachment?: {
    filename: string;
    size: number;
    uploadedAt: string;
    storageKey?: string;
  };
  originalUploadedContent?: string; // النص الحرفي الكامل المستخرج مباشرة من المستند المرفوع دون أي تعديل أو تأليف
  sourceDocumentFilename?: string; // اسم ملف المستند الأصلي المرفوع
  sourceDocumentType?: 'pdf' | 'docx' | 'doc' | 'txt';
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'grid' | 'table';

export type ReadingTheme = 'gazette' | 'modern' | 'contrast';
