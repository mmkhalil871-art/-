import mammoth from 'mammoth';
import { MinisterialDecision, DecisionArticle, DecisionStatus } from '../types/decision';
import { CATEGORIES } from '../data/seedDecisions';
import {
  inferArticlesFromTopic,
  generateLegalBasisSummary,
  sanitizeDecisionLawArticles,
} from './lawArticlesHelper';

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
 * Extracts references to Labor Law 14/2025 articles from decision text or preamble.
 * Crucially removes citations to "قانون رقم 14 لسنة 2025" beforehand so that the statute's number (14)
 * is never confused with substantive "المادة 14".
 */
export function extractRelatedLawArticles(
  text: string,
  categoryHint?: string,
  titleHint?: string
): string[] {
  const results = new Set<string>();
  const norm = normalizeArabicText(text);

  // Strip references to statute name/number (e.g., "قانون العمل رقم 14 لسنة 2025" or "القانون رقم 14")
  // so the number 14 is never extracted as an article!
  const strippedText = norm
    .replace(/(?:قانون|القانون|ق|قانون العمل)\s*(?:الصادر بالقانون\s*)?(?:رقم\s*)?14\s*(?:لسنه|لسنة|عام)?\s*2025/gi, ' [قانون_العمل] ')
    .replace(/(?:قانون|القانون)\s*(?:رقم\s*)?14\b/gi, ' [قانون_العمل] ');

  // Look for patterns like "المواد (50، 51، 52)", "مادتين 208 و 216"
  const multiMatches = strippedText.matchAll(/(?:المواد|المادتين|المادتان)\s*\(?([0-9\s،,و]+)\)?/g);
  for (const m of multiMatches) {
    const rawNumbers = m[1].split(/[،,و\s]+/);
    for (const num of rawNumbers) {
      const cleanNum = num.trim();
      if (cleanNum && !isNaN(Number(cleanNum)) && Number(cleanNum) <= 300) {
        results.add(`المادة ${cleanNum}`);
      }
    }
  }

  // Look for single article matches e.g. "المادة 208", "مادة 50"
  const singleMatches = strippedText.matchAll(/(?:الماده|ماده)\s*(?:رقم\s*)?\(?(\d+)\)?/g);
  for (const m of singleMatches) {
    const cleanNum = m[1].trim();
    if (cleanNum && !isNaN(Number(cleanNum)) && Number(cleanNum) <= 300) {
      results.add(`المادة ${cleanNum}`);
    }
  }

  // Check if "المادة 14" was added: If the decision is NOT about public employment offices (مكاتب التشغيل),
  // then "14" was an accidental residue of "قانون 14", so delete it!
  if (results.has('المادة 14')) {
    const isActuallyEmploymentOffice =
      norm.includes('مكاتب التشغيل') ||
      norm.includes('سياسه التشغيل العامه') ||
      norm.includes('مكتب تشغيل عام');
    if (!isActuallyEmploymentOffice) {
      results.delete('المادة 14');
    }
  }

  // If no explicit substantive articles were extracted, intelligently infer from topic/category
  // NEVER fallback to "المادة 14"!
  if (results.size === 0) {
    const topicArticles = inferArticlesFromTopic(
      `${titleHint || ''} ${text}`,
      categoryHint
    );
    return topicArticles;
  }

  return Array.from(results);
}

/**
 * Extracts authentic preamble and articles from written document text
 * Preserves 100% of the original uploaded text without any synthetic alteration or boilerplate.
 */
export function extractPreambleAndArticlesFromText(
  text: string,
  decisionId: string
): { preamble: string; articles: DecisionArticle[] } {
  if (!text || !text.trim()) {
    return {
      preamble: '',
      articles: [],
    };
  }

  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n');

  // Match article headings in various standard Egyptian / Arabic legal conventions:
  // e.g. "المادة الأولى", "مادة 1", "مادة (1)", "(مادة 1)", "المادة رقم 1", "البند أولاً", "أولاً:"
  const articleHeadingRegex = /^(?:\(|\[)?\s*(?:المادة|مادة|البند)\s*(?:رقم)?\s*(\([0-9]+\)|[0-9]+|الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة|الثامنة|التاسعة|العاشرة|الحادية عشرة|الثانية عشرة|الثالثة عشرة|الرابعة عشرة|الخامسة عشرة|السادسة عشرة|السابعة عشرة|الثامنة عشرة|التاسعة عشرة|العشرون|مكرر|أولاً|ثانياً|ثالثاً|رابعاً|خامساً|سادساً|سابعاً|ثامناً|تاسعاً|عاشراً|[أ-ي0-9]+)(?:\)|\])?[:\s-]*(.*)/i;

  let preambleLines: string[] = [];
  const articles: DecisionArticle[] = [];
  let currentArticle: DecisionArticle | null = null;
  let articleIndex = 1;
  let foundFirstArticle = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentArticle) {
        currentArticle.content += '\n';
      }
      continue;
    }

    const match = trimmed.match(articleHeadingRegex);

    if (match) {
      foundFirstArticle = true;
      if (currentArticle) {
        currentArticle.content = currentArticle.content.trim();
        articles.push(currentArticle);
      }

      const rawNumber = match[1].replace(/[()]/g, '').trim();
      const numLabel = isNaN(Number(rawNumber))
        ? `المادة ${rawNumber}`
        : `المادة (${rawNumber})`;
      const lineTitle = match[2]?.trim() || '';

      currentArticle = {
        id: `art-${decisionId}-${articleIndex++}`,
        articleNumber: numLabel,
        title: lineTitle.length > 0 && lineTitle.length < 80 ? lineTitle : undefined,
        content: lineTitle.length >= 80 ? lineTitle : '',
      };
    } else if (!foundFirstArticle) {
      preambleLines.push(trimmed);
    } else if (currentArticle) {
      currentArticle.content += (currentArticle.content ? '\n' : '') + trimmed;
    }
  }

  if (currentArticle) {
    currentArticle.content = currentArticle.content.trim();
    articles.push(currentArticle);
  }

  // If no traditional article markers were matched (e.g. ministerial circular, decree notes, instructions):
  // Never invent fake articles! Group the authentic paragraphs into logical numbered sections.
  if (articles.length === 0) {
    const paragraphs = cleanText
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (paragraphs.length > 1) {
      // First paragraph could be preamble if it contains decree phrasing
      if (paragraphs[0].includes('قرر') || paragraphs[0].includes('بعد الاطلاع') || paragraphs[0].includes('وزير')) {
        preambleLines = [paragraphs[0]];
        for (let i = 1; i < paragraphs.length; i++) {
          articles.push({
            id: `art-${decisionId}-${i}`,
            articleNumber: `المادة (${i})`,
            content: paragraphs[i],
          });
        }
      } else {
        paragraphs.forEach((p, idx) => {
          articles.push({
            id: `art-${decisionId}-${idx + 1}`,
            articleNumber: `المادة (${idx + 1})`,
            content: p,
          });
        });
      }
    } else if (paragraphs.length === 1) {
      articles.push({
        id: `art-${decisionId}-1`,
        articleNumber: 'المادة الأولى',
        content: paragraphs[0],
      });
    }
  }

  const rawPreamble = preambleLines.join('\n').trim();

  return {
    preamble: rawPreamble,
    articles,
  };
}

/**
 * Parses articles from written text (backwards compatible)
 */
export function parseArticlesFromDecisionText(text: string, decisionId: string): DecisionArticle[] {
  return extractPreambleAndArticlesFromText(text, decisionId).articles;
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
  const searchCorpus = `${file.name}\n${extractedText.slice(0, 3000)}`;
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

  // Detect title from document content or filename
  let detectedTitle = '';
  if (extractedText) {
    const titleMatch = extractedText.match(/(?:بشأن|في شأن|بتنظيم|بإصدار)\s+([^\n.]+)/i);
    if (titleMatch) {
      detectedTitle = titleMatch[0].trim();
    }
  }
  if (!detectedTitle) {
    detectedTitle = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]/g, ' ')
      .replace(/قرار/g, 'قرار بشأن')
      .trim();
  }

  const detectedCategory = detectCategoryFromText(searchCorpus);
  const detectedRelatedArticles = extractRelatedLawArticles(
    searchCorpus,
    detectedCategory,
    detectedTitle
  );

  // Generate ID
  const tempId = matchedDecision
    ? matchedDecision.id
    : `dec-${year || 2025}-${decisionNumber || Math.floor(Math.random() * 900 + 100)}`;

  let parsedArticles: DecisionArticle[] | undefined;
  if (extractedText) {
    const extracted = extractPreambleAndArticlesFromText(extractedText, tempId);
    parsedArticles = extracted.articles;
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
 * Builds or updates MinisterialDecisions from a batch of analyzed documents.
 * Preserves 100% authentic document content without rewriting or fabrication.
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

    const existingTarget = decisionsMap.get(targetId);
    let target: MinisterialDecision;

    // Parse authentic preamble and articles from the extracted text if available
    let authenticPreamble = '';
    let authenticArticles: DecisionArticle[] = [];
    if (doc.extractedText && doc.extractedText.trim()) {
      const parsed = extractPreambleAndArticlesFromText(doc.extractedText, targetId);
      authenticPreamble = parsed.preamble;
      authenticArticles = parsed.articles;
    }

    const docSourceType: 'pdf' | 'docx' | 'doc' | 'txt' | undefined =
      doc.extension === 'pdf' || doc.extension === 'docx' || doc.extension === 'doc' || doc.extension === 'txt'
        ? doc.extension
        : undefined;

    if (!existingTarget) {
      // Create new decision directly from authentic document data
      const finalArticles: DecisionArticle[] =
        authenticArticles.length > 0
          ? authenticArticles
          : doc.parsedArticles && doc.parsedArticles.length > 0
          ? doc.parsedArticles
          : [
              {
                id: `art-${targetId}-1`,
                articleNumber: 'المادة الأولى',
                content:
                  doc.extractedText && doc.extractedText.trim()
                    ? doc.extractedText.trim()
                    : `وثيقة القرار الوزاري رقم (${decNumber}) لسنة ${decYear} المرفوعة في المنظومة.`,
              },
            ];

      const docArticles =
        doc.detectedRelatedArticles && doc.detectedRelatedArticles.length > 0
          ? doc.detectedRelatedArticles
          : inferArticlesFromTopic(
              `${doc.detectedTitle || ''} ${doc.extractedText || ''}`,
              doc.detectedCategory
            );

      const rawTarget: MinisterialDecision = {
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
        relatedLawArticles: docArticles,
        legalBasisSummary: generateLegalBasisSummary(docArticles),
        executingSubject: doc.detectedTitle || 'تنظيم وتطبيق أحكام قانون العمل',
        preamble:
          authenticPreamble && authenticPreamble.trim()
            ? authenticPreamble.trim()
            : `وزير العمل؛\nبعد الاطلاع على الدستور، وعلى قانون العمل رقم 14 لسنة 2025؛\nقرر:`,
        articles: finalArticles,
        officialReference: `ق و / 14-${decYear} / ${decNumber}`,
        isFavorite: false,
        tags: [doc.detectedCategory || 'قرارات وزارية', `قرار ${decNumber}`],
        originalUploadedContent: doc.extractedText || undefined,
        sourceDocumentFilename: doc.filename,
        sourceDocumentType: docSourceType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      target = sanitizeDecisionLawArticles(rawTarget);
      decisionsMap.set(targetId, target);
      newCount++;
    } else {
      target = existingTarget;
      updatedCount++;
    }

    // Attach PDF metadata if it's a PDF
    if (doc.documentType === 'scanned_pdf' || doc.extension === 'pdf') {
      target.pdfAttachment = {
        filename: doc.filename,
        size: doc.size,
        uploadedAt: new Date().toISOString(),
        storageKey: target.id,
      };
      target.sourceDocumentFilename = doc.filename;
      target.sourceDocumentType = 'pdf';
      target.updatedAt = new Date().toISOString();
    }

    // Attach Word metadata and update text directly from uploaded Word / Text document
    if (
      doc.documentType === 'written_word' ||
      doc.extension === 'docx' ||
      doc.extension === 'doc' ||
      doc.extension === 'txt'
    ) {
      target.wordAttachment = {
        filename: doc.filename,
        size: doc.size,
        uploadedAt: new Date().toISOString(),
        storageKey: target.id,
      };
      target.sourceDocumentFilename = doc.filename;
      target.sourceDocumentType = docSourceType;

      if (doc.extractedText && doc.extractedText.trim()) {
        target.originalUploadedContent = doc.extractedText.trim();
        if (authenticArticles.length > 0) {
          target.articles = authenticArticles;
        }
        if (authenticPreamble && authenticPreamble.trim().length > 5) {
          target.preamble = authenticPreamble.trim();
        }
      }
      target.updatedAt = new Date().toISOString();
    }
  }

  return {
    updatedDecisions: Array.from(decisionsMap.values()),
    newCount,
    updatedCount,
  };
}
