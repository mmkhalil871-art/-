import mammoth from 'mammoth';
import { MinisterialDecision, DecisionArticle, DecisionStatus } from '../types/decision';
import { CATEGORIES } from '../data/seedDecisions';

export interface IngestedDocumentInfo {
  file: File;
  id: string;
  filename: string;
  size: number;
  extension: 'pdf' | 'docx' | 'doc' | 'txt' | 'other';
  documentType: 'scanned_pdf' | 'written_word' | 'text' | 'unknown';
  extractedText?: string;
  detectedDecisionNumber?: string;
  detectedYear?: number;
  detectedTitle?: string;
  detectedCategory?: string;
  detectedRelatedArticles?: string[];
  matchedExistingDecisionId?: string;
  matchedExistingDecisionTitle?: string;
  isNewDecision: boolean;
  action: 'attach_pdf' | 'attach_word' | 'create_new_decision' | 'update_articles';
  parsedArticles?: DecisionArticle[];
  status: 'pending' | 'analyzed' | 'imported' | 'error';
  errorMessage?: string;
}

/**
 * Normalizes Arabic text for flexible matching
 */
export function normalizeArabicText(str: string): string {
  if (!str) return '';
  return str
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '') // Remove diacritics
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632)) // Arabic numerals to Western
    .trim();
}

/**
 * Extracts decision number and year from filename or text snippet
 */
export function extractDecisionNumberAndYear(
  text: string
): { decisionNumber?: string; year?: number } {
  const norm = normalizeArabicText(text);

  // Match patterns like "قرار رقم 148 لسنة 2025", "قرار 148", "قرار_148_2025", "dec-148-2025"
  const fullMatch = norm.match(/(?:قرار|رقم|dec|decree)[\s_-]*(?:وزاري[\s_-]*)?(?:رقم[\s_-]*)?\(?(\d+)\)?[\s_-]*(?:لسنه|لسنة|عام|year)?[\s_-]*\(?(202\d)\)?/i);
  if (fullMatch) {
    return {
      decisionNumber: fullMatch[1],
      year: parseInt(fullMatch[2], 10),
    };
  }

  // Match just decision number
  const numMatch = norm.match(/(?:قرار|رقم|dec)[\s_-]*(?:وزاري[\s_-]*)?(?:رقم[\s_-]*)?\(?(\d+)\)?/i);
  const yearMatch = norm.match(/\b(202\d)\b/);

  return {
    decisionNumber: numMatch ? numMatch[1] : undefined,
    year: yearMatch ? parseInt(yearMatch[1], 10) : 2025,
  };
}

/**
 * Infers category based on keywords
 */
export function detectCategoryFromText(text: string): string {
  const norm = normalizeArabicText(text);

  if (norm.includes('سلامه') || norm.includes('صحه مهنيه') || norm.includes('مخاطر') || norm.includes('تامين بيئه العمل') || norm.includes('حريق') || norm.includes('اسعاف')) {
    return 'السلامة والصحة المهنية وتأمين بيئة العمل';
  }
  if (norm.includes('اجانب') || norm.includes('ترخيص عمل') || norm.includes('غير مصريين') || norm.includes('استقدام') || norm.includes('اقامه')) {
    return 'تشغيل العمالة الأجنبية وتنظيم تراخيص العمل';
  }
  if (norm.includes('تفتيش') || norm.includes('ضبطيه قضائيه') || norm.includes('مفتش')) {
    return 'تفتيش العمل والضبطية القضائية';
  }
  if (norm.includes('نزاع') || norm.includes('منازعات') || norm.includes('وساطه') || norm.includes('تحكيم') || norm.includes('اضراب') || norm.includes('اغلاق')) {
    return 'المنازعات الجماعية والوساطة والتحكيم';
  }
  if (norm.includes('تدريب') || norm.includes('مهارات') || norm.includes('تلمذه') || norm.includes('مركز تدريب') || norm.includes('تاهيل')) {
    return 'التدريب المهني وتنمية مهارات الموارد البشرية';
  }
  if (norm.includes('نساء') || norm.includes('امومه') || norm.includes('حضانه') || norm.includes('طفل') || norm.includes('احداث') || norm.includes('فئات اولي')) {
    return 'تشغيل الفئات الأولى بالرعاية';
  }
  if (norm.includes('اجور') || norm.includes('اجر') || norm.includes('علاوه') || norm.includes('ساعات عمل') || norm.includes('اجازات') || norm.includes('تشغيل')) {
    return 'علاقات العمل وظروف وشروط التشغيل';
  }

  return 'اللوائح والقرارات التنظيمية العامة';
}

/**
 * Extracts references to Labor Law 14/2025 articles
 */
export function extractRelatedLawArticles(text: string): string[] {
  const results = new Set<string>();
  const norm = normalizeArabicText(text);

  // Look for patterns like "المواد (50، 51، 52)", "المادة 14", "مادة 208"
  const multiMatches = norm.matchAll(/(?:المواد|المادتين|المادتان)\s*\(?([0-9\s،,و]+)\)?/g);
  for (const m of multiMatches) {
    const rawNumbers = m[1].split(/[،,و\s]+/);
    for (const num of rawNumbers) {
      const cleanNum = num.trim();
      if (cleanNum && !isNaN(Number(cleanNum)) && Number(cleanNum) <= 300) {
        results.add(`المادة ${cleanNum}`);
      }
    }
  }

  const singleMatches = norm.matchAll(/(?:الماده|ماده)\s*\(?(\d+)\)?/g);
  for (const m of singleMatches) {
    const cleanNum = m[1].trim();
    if (cleanNum && !isNaN(Number(cleanNum)) && Number(cleanNum) <= 300) {
      results.add(`المادة ${cleanNum}`);
    }
  }

  // Fallback defaults if none detected
  if (results.size === 0) {
    results.add('المادة 14');
  }

  return Array.from(results);
}

/**
 * Parses articles from written text
 */
export function parseArticlesFromDecisionText(text: string, decisionId: string): DecisionArticle[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const articles: DecisionArticle[] = [];
  let currentArticle: DecisionArticle | null = null;
  let articleIndex = 1;

  for (const line of lines) {
    const match = line.match(/^(?:المادة|مادة)\s*(\([0-9]+\)|[0-9]+|الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|الثامنة|التاسعة|العاشرة|الحادية عشرة|الثانية عشرة|مكرر|أ|ب)[:\s-]*(.*)/i);
    if (match) {
      if (currentArticle) {
        articles.push(currentArticle);
      }
      const rawNumber = match[1].replace(/[()]/g, '');
      const numLabel = isNaN(Number(rawNumber)) ? `المادة ${rawNumber}` : `المادة (${rawNumber})`;
      const lineTitle = match[2]?.trim() || '';

      currentArticle = {
        id: `art-${decisionId}-${articleIndex++}`,
        articleNumber: numLabel,
        title: lineTitle.length < 60 ? lineTitle : undefined,
        content: lineTitle.length >= 60 ? lineTitle : '',
      };
    } else if (currentArticle) {
      currentArticle.content += (currentArticle.content ? '\n' : '') + line;
    }
  }

  if (currentArticle) {
    articles.push(currentArticle);
  }

  return articles;
}

/**
 * Analyzes an individual uploaded file (PDF, Word docx, Text)
 */
export async function analyzeUploadedDocument(
  file: File,
  existingDecisions: MinisterialDecision[]
): Promise<IngestedDocumentInfo> {
  const extension = (file.name.split('.').pop()?.toLowerCase() || 'other') as
    | 'pdf'
    | 'docx'
    | 'doc'
    | 'txt'
    | 'other';

  const docType: IngestedDocumentInfo['documentType'] =
    extension === 'pdf'
      ? 'scanned_pdf'
      : extension === 'docx' || extension === 'doc'
      ? 'written_word'
      : extension === 'txt'
      ? 'text'
      : 'unknown';

  let extractedText = '';

  if (extension === 'docx') {
    try {
      const buffer = await file.arrayBuffer();
      const res = await mammoth.extractRawText({ arrayBuffer: buffer });
      extractedText = res.value || '';
    } catch (e) {
      console.warn('Could not extract text from docx via mammoth, falling back to filename analysis:', e);
    }
  } else if (extension === 'txt') {
    try {
      extractedText = await file.text();
    } catch (e) {
      console.warn('Could not read txt file:', e);
    }
  }

  // Combined corpus of filename and extracted text
  const searchCorpus = `${file.name}\n${extractedText.slice(0, 2000)}`;
  const { decisionNumber, year } = extractDecisionNumberAndYear(searchCorpus);

  // Search for matching decision in library
  let matchedDecision: MinisterialDecision | undefined;
  if (decisionNumber) {
    matchedDecision = existingDecisions.find(
      (d) =>
        d.decisionNumber === decisionNumber &&
        (!year || d.year === year)
    );
  }

  // Detect title
  let detectedTitle = '';
  if (extractedText) {
    const titleMatch = extractedText.match(/(?:بشأن|في شأن|بتنظيم|بإصدار)\s+([^\n.]+)/i);
    if (titleMatch) {
      detectedTitle = titleMatch[0].trim();
    }
  }
  if (!detectedTitle) {
    // Generate clean Arabic title from filename
    detectedTitle = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]/g, ' ')
      .replace(/قرار/g, 'قرار بشأن')
      .trim();
  }

  const detectedCategory = detectCategoryFromText(searchCorpus);
  const detectedRelatedArticles = extractRelatedLawArticles(searchCorpus);

  // Generate ID
  const tempId = matchedDecision
    ? matchedDecision.id
    : `dec-${year || 2025}-${decisionNumber || Math.floor(Math.random() * 900 + 100)}`;

  let parsedArticles: DecisionArticle[] | undefined;
  if (extractedText) {
    parsedArticles = parseArticlesFromDecisionText(extractedText, tempId);
  }

  let action: IngestedDocumentInfo['action'] = 'create_new_decision';
  if (matchedDecision) {
    if (docType === 'scanned_pdf') {
      action = 'attach_pdf';
    } else {
      action = 'attach_word';
    }
  }

  return {
    file,
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    filename: file.name,
    size: file.size,
    extension,
    documentType: docType,
    extractedText,
    detectedDecisionNumber: decisionNumber || (matchedDecision ? matchedDecision.decisionNumber : undefined),
    detectedYear: year || (matchedDecision ? matchedDecision.year : 2025),
    detectedTitle: matchedDecision ? matchedDecision.title : detectedTitle,
    detectedCategory: matchedDecision ? matchedDecision.category : detectedCategory,
    detectedRelatedArticles: matchedDecision ? matchedDecision.relatedLawArticles : detectedRelatedArticles,
    matchedExistingDecisionId: matchedDecision?.id,
    matchedExistingDecisionTitle: matchedDecision?.title,
    isNewDecision: !matchedDecision,
    action,
    parsedArticles: parsedArticles && parsedArticles.length > 0 ? parsedArticles : undefined,
    status: 'analyzed',
  };
}

/**
 * Builds or updates MinisterialDecisions from a batch of analyzed documents
 */
export function buildOrganizedLibraryDecisions(
  ingestedDocs: IngestedDocumentInfo[],
  currentDecisions: MinisterialDecision[]
): {
  updatedDecisions: MinisterialDecision[];
  newCount: number;
  updatedCount: number;
} {
  const decisionsMap = new Map<string, MinisterialDecision>();

  // Clone current decisions into map
  for (const dec of currentDecisions) {
    decisionsMap.set(dec.id, { ...dec });
  }

  let newCount = 0;
  let updatedCount = 0;

  for (const doc of ingestedDocs) {
    const decNumber = doc.detectedDecisionNumber || '1';
    const decYear = doc.detectedYear || 2025;
    const targetId = doc.matchedExistingDecisionId || `dec-${decYear}-${decNumber}`;

    let target = decisionsMap.get(targetId);

    if (!target) {
      // Create new decision
      const newArticles: DecisionArticle[] =
        doc.parsedArticles && doc.parsedArticles.length > 0
          ? doc.parsedArticles
          : [
              {
                id: `art-${targetId}-1`,
                articleNumber: 'المادة الأولى',
                title: 'نطاق وسريان القرار',
                content:
                  doc.extractedText && doc.extractedText.length > 50
                    ? doc.extractedText.slice(0, 400) + '...'
                    : `تُطبق أحكام هذا القرار تنفيذاً لأحكام قانون العمل رقم 14 لسنة 2025 بشأن (${doc.detectedTitle || 'الموضوع المنظم'}).`,
              },
            ];

      target = {
        id: targetId,
        decisionNumber: decNumber,
        year: decYear,
        title: doc.detectedTitle || `قرار وزير العمل رقم (${decNumber}) لسنة ${decYear}`,
        issuingAuthority: 'وزير العمل',
        issueDate: `${decYear}-01-15`,
        gazetteIssue: `الجريدة الرسمية - العدد ${decNumber}`,
        gazetteDate: `${decYear}-01-20`,
        effectiveDate: `${decYear}-02-01`,
        status: 'نافذ',
        category: doc.detectedCategory || CATEGORIES[1] || 'علاقات العمل وظروف وشروط التشغيل',
        relatedLawArticles: doc.detectedRelatedArticles || ['المادة 14'],
        legalBasisSummary: `صادر تنفيذاً لأحكام قانون العمل رقم 14 لسنة 2025 (${(doc.detectedRelatedArticles || ['المادة 14']).join('، ')})`,
        executingSubject: doc.detectedTitle || 'تنظيم وتطبيق أحكام قانون العمل',
        preamble: `وزير العمل؛\nبعد الاطلاع على الدستور؛\nوعلى قانون العمل الصادر بالقانون رقم 14 لسنة 2025؛\nقرر:`,
        articles: newArticles,
        officialReference: `ق و / 14-${decYear} / ${decNumber}`,
        isFavorite: false,
        tags: [doc.detectedCategory || 'قرارات وزارية', `قرار ${decNumber}`],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      decisionsMap.set(targetId, target);
      newCount++;
    } else {
      updatedCount++;
    }

    // Attach PDF if it's a PDF
    if (doc.documentType === 'scanned_pdf' || doc.extension === 'pdf') {
      target.pdfAttachment = {
        filename: doc.filename,
        size: doc.size,
        uploadedAt: new Date().toISOString(),
        storageKey: target.id,
      };
      target.updatedAt = new Date().toISOString();
    }

    // Update articles if it's Word/Text with parsed articles
    if (doc.parsedArticles && doc.parsedArticles.length > 0) {
      target.articles = doc.parsedArticles;
      target.updatedAt = new Date().toISOString();
    }
  }

  return {
    updatedDecisions: Array.from(decisionsMap.values()),
    newCount,
    updatedCount,
  };
}
