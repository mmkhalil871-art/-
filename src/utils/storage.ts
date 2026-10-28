import { MinisterialDecision } from '../types/decision';

const STORAGE_KEY = 'ministerial_decisions_law14_2025';
const ENFORCED_PDF_FLAG = 'filter_only_with_pdf_enforced_v1';

/**
 * Returns stored decisions, strictly preserving only decisions that have an official PDF copy (pdfAttachment)
 */
export function getStoredDecisions(): MinisterialDecision[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem(ENFORCED_PDF_FLAG, 'true');
      return [];
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any decision that does not have an official PDF attachment
      const filtered = parsed.filter((d: any) => Boolean(d.pdfAttachment));
      if (filtered.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
      return filtered;
    }
    return [];
  } catch (error) {
    console.error('Error reading decisions from localStorage:', error);
    return [];
  }
}

/**
 * Saves decisions to localStorage, ensuring only decisions with official PDF attachments are preserved
 */
export function saveDecisions(decisions: MinisterialDecision[]): void {
  try {
    const filtered = decisions.filter((d) => Boolean(d.pdfAttachment));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    localStorage.setItem(ENFORCED_PDF_FLAG, 'true');
  } catch (error) {
    console.error('Error saving decisions to localStorage:', error);
  }
}

/**
 * Explicitly removes all decisions that do not have an official scanned PDF copy
 */
export function deleteDecisionsWithoutPdf(): MinisterialDecision[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: MinisterialDecision[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((d) => Boolean(d.pdfAttachment));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    localStorage.setItem(ENFORCED_PDF_FLAG, 'true');
    return filtered;
  } catch (error) {
    console.error('Error deleting non-pdf decisions:', error);
    return [];
  }
}

/**
 * Resets storage to an empty official library waiting for PDF uploads
 */
export function resetToSeedDecisions(): MinisterialDecision[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(ENFORCED_PDF_FLAG, 'true');
    return [];
  } catch (error) {
    console.error('Error resetting decisions:', error);
    return [];
  }
}
