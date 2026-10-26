import mammoth from 'mammoth';
import { LaborLawInfo, LawChapter } from '../data/laborLawData';

export interface ParsedLawResult {
  title: string;
  lawNumber: string;
  year: number;
  promulgationDate: string;
  gazetteIssue: string;
  gazetteDate: string;
  effectiveDate: string;
  preamble: string;
  promulgationArticles: { number: string; text: string }[];
  chapters: LawChapter[];
  totalArticlesCount: number;
}

/**
 * Extracts plain text from an ArrayBuffer of a .docx file using mammoth
 */
export async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value || '';
  } catch (error) {
    console.error('Error extracting text from docx:', error);
    throw new Error('فشل استخراج النص من ملف Word. يرجى التأكد من أن الملف سليم.');
  }
}

/**
 * Parses raw Arabic legal text into structured chapters and articles.
 * Matches patterns like:
 * "الباب الأول: ...", "الفصل الأول..."
 * "المادة 1", "المادة (1)", "مادة 1:", "مادة (1) - ..."
 * "مواد الإصدار: المادة الأولى..."
 */
export function parseLaborLawText(rawText: string): ParsedLawResult {
  const normalized = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .trim();

  const lines = normalized.split('\n');

  let title = 'قانون العمل رقم 14 لسنة 2025';
  let lawNumber = '14';
  let year = 2025;
  let promulgationDate = '2025';
  let gazetteIssue = 'الجريدة الرسمية';
  let gazetteDate = '2025';
  let effectiveDate = '2025';
  let preamble = '';

  const promulgationArticles: { number: string; text: string }[] = [];
  const chapters: LawChapter[] = [];

  let currentChapter: LawChapter | null = null;
  let currentArticle: { number: string; title?: string; text: string } | null = null;
  let isInsidePromulgation = false;
  let isInsidePreamble = true;
  let totalArticles = 0;

  // Regex patterns
  const chapterRegex = /^(الباب\s+(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر|\d+)|الفصل\s+(الأول|الثاني|الثالث|الرابع|الخامس|\d+))/;
  const articleRegex = /^(المادة\s*(\(\d+\)|\d+|[أ-ي]+)|مادة\s*(\(\d+\)|\d+|[أ-ي]+))\s*[:\-\.]?\s*(.*)$/;
  const promulgationKeywordRegex = /(مواد الإصدار|مادة إصدار|قانون الإصدار)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect title from first few lines if mentioned
    if (i < 5 && (line.includes('قانون العمل') || line.includes('قانون رقم'))) {
      title = line;
      const numMatch = line.match(/رقم\s*(\d+)/);
      if (numMatch) lawNumber = numMatch[1];
      const yearMatch = line.match(/لسنة\s*(\d{4})/);
      if (yearMatch) year = parseInt(yearMatch[1], 10);
      continue;
    }

    // Detect Promulgation section
    if (promulgationKeywordRegex.test(line)) {
      isInsidePromulgation = true;
      isInsidePreamble = false;
      continue;
    }

    // Check if line is a Chapter header
    if (chapterRegex.test(line)) {
      isInsidePromulgation = false;
      isInsidePreamble = false;

      // Close previous article
      if (currentArticle && currentChapter) {
        currentChapter.articles.push({ ...currentArticle });
        currentArticle = null;
      }

      // Close previous chapter
      if (currentChapter) {
        chapters.push(currentChapter);
      }

      const chapterParts = line.split(/[:\-–—]/);
      const chapterNumber = chapterParts[0]?.trim() || `الباب ${chapters.length + 1}`;
      const chapterTitle = chapterParts.slice(1).join(' - ').trim() || line;

      currentChapter = {
        id: `ch-${chapters.length + 1}`,
        chapterNumber,
        title: chapterTitle,
        articlesRange: '',
        summary: '',
        articles: [],
      };
      continue;
    }

    // Check if line is an Article header
    const artMatch = line.match(articleRegex);
    if (artMatch) {
      isInsidePreamble = false;

      if (isInsidePromulgation) {
        // Promulgation article
        promulgationArticles.push({
          number: artMatch[1],
          text: artMatch[4] ? artMatch[4] : '',
        });
        continue;
      }

      // Main law article
      if (!currentChapter) {
        currentChapter = {
          id: `ch-${chapters.length + 1}`,
          chapterNumber: 'الباب الأول',
          title: 'الأحكام العامة ومواد القانون',
          articlesRange: '',
          summary: '',
          articles: [],
        };
      }

      // Push previous article
      if (currentArticle) {
        currentChapter.articles.push({ ...currentArticle });
      }

      totalArticles++;
      const artHeader = artMatch[1];
      const remainder = artMatch[4]?.trim() || '';

      currentArticle = {
        number: artHeader,
        title: remainder.length < 50 && remainder.length > 2 ? remainder : undefined,
        text: remainder.length >= 50 ? remainder : '',
      };
      continue;
    }

    // Append to ongoing section
    if (isInsidePromulgation && promulgationArticles.length > 0) {
      const lastP = promulgationArticles[promulgationArticles.length - 1];
      lastP.text += (lastP.text ? '\n' : '') + line;
    } else if (currentArticle) {
      currentArticle.text += (currentArticle.text ? '\n' : '') + line;
    } else if (isInsidePreamble) {
      preamble += (preamble ? '\n' : '') + line;
    } else if (currentChapter) {
      if (!currentChapter.summary) {
        currentChapter.summary = line;
      }
    }
  }

  // Push last article and chapter
  if (currentArticle && currentChapter) {
    currentChapter.articles.push({ ...currentArticle });
  }
  if (currentChapter) {
    chapters.push(currentChapter);
  }

  // Calculate article ranges for chapters
  chapters.forEach((ch) => {
    if (ch.articles.length > 0) {
      ch.articlesRange = `المواد من ${ch.articles[0].number} إلى ${
        ch.articles[ch.articles.length - 1].number
      }`;
    }
  });

  return {
    title,
    lawNumber,
    year,
    promulgationDate,
    gazetteIssue,
    gazetteDate,
    effectiveDate,
    preamble: preamble || 'باسم الشعب، رئيس الجمهورية، أصدرنا القانون الآتي:',
    promulgationArticles,
    chapters,
    totalArticlesCount: totalArticles,
  };
}
