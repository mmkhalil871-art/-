export interface DecisionArticle {
  id: string;
  articleNumber: string; // e.g. "المادة الأولى", "المادة 1"
  title?: string; // e.g. "التعريفات ونطاق السريان"
  content: string; // Text of the article
}

export type DecisionStatus = 'نافذ' | 'سارٍ' | 'معدل' | 'ملغى';

export interface PdfAttachment {
  filename: string;
  size: number; // in bytes
  uploadedAt: string;
  dataUrl?: string; // Base64 data url or blob url
  storageKey?: string; // IndexedDB key
}

export interface MinisterialDecision {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'grid' | 'table';

export type ReadingTheme = 'gazette' | 'modern' | 'contrast';
