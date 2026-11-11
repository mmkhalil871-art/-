import { MinisterialDecision } from '../types/decision';
import { SEED_DECISIONS } from '../data/seedDecisions';
import { sanitizeDecisionLawArticles } from './lawArticlesHelper';

const STORAGE_KEY = 'ministerial_decisions_law14_2025';
const ENFORCED_PDF_FLAG = 'filter_only_with_pdf_enforced_v1';
const SANITIZED_ARTICLES_VERSION = 'sanitized_articles_v2';

/**
 * Explicitly removes any decision with number 14 ("قرار وزاري رقم 14 لسنة 2025") as requested by the user
 */
export function purgeDecision14(list: MinisterialDecision[]): MinisterialDecision[] {
  return list.filter((d) => {
    const num = String(d.decisionNumber || '').trim();
    if (num === '14' || num === '014' || d.id === 'dec-2025-14' || d.id === 'dec-14-2025') {
      return false;
    }
    if (d.title && (d.title.includes('قرار وزاري رقم 14') || d.title.includes('قرار رقم 14 لسنة 2025'))) {
      return false;
    }
    return true;
  });
}

/**
 * Returns stored decisions, strictly preserving only decisions that have an official PDF copy (pdfAttachment),
 * purging decision 14, and ensuring all decisions are accurately linked to authentic Labor Law articles
 * rather than erroneously defaulting to "المادة 14".
 */
export function getStoredDecisions(): MinisterialDecision[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const cleanedSeed = purgeDecision14(SEED_DECISIONS).map((d) => sanitizeDecisionLawArticles(d));

    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedSeed));
      localStorage.setItem(ENFORCED_PDF_FLAG, 'true');
      localStorage.setItem(SANITIZED_ARTICLES_VERSION, 'true');
      return cleanedSeed;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Filter out non-PDF and decision 14, then sanitize all articles
      const filtered = purgeDecision14(parsed.filter((d: any) => Boolean(d.pdfAttachment)))
        .map((d) => sanitizeDecisionLawArticles(d));

      const needsResave =
        localStorage.getItem(SANITIZED_ARTICLES_VERSION) !== 'true' ||
        filtered.length !== parsed.length;

      if (needsResave) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        localStorage.setItem(SANITIZED_ARTICLES_VERSION, 'true');
      }

      return filtered.length > 0 ? filtered : cleanedSeed;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedSeed));
    localStorage.setItem(SANITIZED_ARTICLES_VERSION, 'true');
    return cleanedSeed;
  } catch (error) {
    console.error('Error reading decisions from localStorage:', error);
    return purgeDecision14(SEED_DECISIONS).map((d) => sanitizeDecisionLawArticles(d));
  }
}

/**
 * Saves decisions to localStorage, ensuring only decisions with official PDF attachments are preserved,
 * purging decision 14, and ensuring authentic Labor Law article linkages.
 */
export function saveDecisions(decisions: MinisterialDecision[]): void {
  try {
    const sanitized = decisions.map((d) => sanitizeDecisionLawArticles(d));
    const filtered = purgeDecision14(sanitized.filter((d) => Boolean(d.pdfAttachment)));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    localStorage.setItem(ENFORCED_PDF_FLAG, 'true');
    localStorage.setItem(SANITIZED_ARTICLES_VERSION, 'true');
  } catch (error) {
    console.error('Error saving decisions to localStorage:', error);
  }
}

/**
 * Explicitly removes all decisions that do not have an official scanned PDF copy and removes decision 14
 */
export function deleteDecisionsWithoutPdf(): MinisterialDecision[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: MinisterialDecision[] = raw ? JSON.parse(raw) : SEED_DECISIONS;
    const sanitized = list.map((d) => sanitizeDecisionLawArticles(d));
    const filtered = purgeDecision14(sanitized.filter((d) => Boolean(d.pdfAttachment)));
    const cleanedSeed = purgeDecision14(SEED_DECISIONS).map((d) => sanitizeDecisionLawArticles(d));
    const result = filtered.length > 0 ? filtered : cleanedSeed;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    localStorage.setItem(ENFORCED_PDF_FLAG, 'true');
    localStorage.setItem(SANITIZED_ARTICLES_VERSION, 'true');
    return result;
  } catch (error) {
    console.error('Error deleting non-pdf decisions:', error);
    return purgeDecision14(SEED_DECISIONS).map((d) => sanitizeDecisionLawArticles(d));
  }
}

/**
 * Resets storage to verified official library with official PDF copies and authentic law article linkages
 */
export function resetToSeedDecisions(): MinisterialDecision[] {
  try {
    const cleanedSeed = purgeDecision14(SEED_DECISIONS).map((d) => sanitizeDecisionLawArticles(d));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedSeed));
    localStorage.setItem(ENFORCED_PDF_FLAG, 'true');
    localStorage.setItem(SANITIZED_ARTICLES_VERSION, 'true');
    return cleanedSeed;
  } catch (error) {
    console.error('Error resetting decisions:', error);
    return purgeDecision14(SEED_DECISIONS).map((d) => sanitizeDecisionLawArticles(d));
  }
}
