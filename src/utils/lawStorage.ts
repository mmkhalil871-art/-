import { LaborLawInfo, LawChapter, LABOR_LAW_14_2025 } from '../data/laborLawData';

const LAW_STORAGE_KEY = 'official_labor_law_14_2025_active';
const LAW_DELETED_FLAG = 'official_labor_law_is_deleted_by_user_flag';

/**
 * Returns stored labor law, or null if deleted / not uploaded yet.
 */
export function getStoredLaborLaw(): LaborLawInfo | null {
  try {
    const isDeleted = localStorage.getItem(LAW_DELETED_FLAG);
    if (isDeleted === 'true') {
      return null;
    }

    const raw = localStorage.getItem(LAW_STORAGE_KEY);
    if (!raw) {
      // By default after user's request to delete the law, mark it as deleted
      localStorage.setItem(LAW_DELETED_FLAG, 'true');
      return null;
    }

    const parsed = JSON.parse(raw);
    if (parsed && (parsed.isCustomUploaded || parsed.chapters?.length > 0)) {
      return parsed;
    }

    return null;
  } catch (err) {
    console.error('Error reading stored labor law:', err);
    return null;
  }
}

/**
 * Saves a newly uploaded/updated labor law
 */
export function saveStoredLaborLaw(law: LaborLawInfo): void {
  try {
    localStorage.removeItem(LAW_DELETED_FLAG);
    const enrichedLaw: LaborLawInfo = {
      ...law,
      isCustomUploaded: true,
      customUploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LAW_STORAGE_KEY, JSON.stringify(enrichedLaw));
  } catch (err) {
    console.error('Error saving stored labor law:', err);
  }
}

/**
 * Deletes the stored labor law as requested by the user
 */
export function deleteStoredLaborLaw(): void {
  try {
    localStorage.removeItem(LAW_STORAGE_KEY);
    localStorage.setItem(LAW_DELETED_FLAG, 'true');
  } catch (err) {
    console.error('Error deleting labor law:', err);
  }
}

/**
 * Checks if custom law is stored
 */
export function isCustomLawStored(): boolean {
  try {
    const isDeleted = localStorage.getItem(LAW_DELETED_FLAG);
    if (isDeleted === 'true') return false;
    const raw = localStorage.getItem(LAW_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.isCustomUploaded || (parsed && parsed.updatedAt));
  } catch {
    return false;
  }
}

/**
 * Resets to default template law if explicitly requested by user
 */
export function resetStoredLaborLaw(): LaborLawInfo {
  try {
    localStorage.removeItem(LAW_DELETED_FLAG);
    localStorage.setItem(LAW_STORAGE_KEY, JSON.stringify(LABOR_LAW_14_2025));
    return LABOR_LAW_14_2025;
  } catch (err) {
    console.error('Error resetting stored labor law:', err);
    return LABOR_LAW_14_2025;
  }
}

/**
 * Extracts a flattened list of all articles in the law for easy cross-referencing
 */
export function getAllLawArticlesFlattened(law: LaborLawInfo | null | undefined): {
  number: string;
  title?: string;
  text: string;
  chapterNumber: string;
  chapterTitle: string;
}[] {
  if (!law || !law.chapters) return [];

  const result: {
    number: string;
    title?: string;
    text: string;
    chapterNumber: string;
    chapterTitle: string;
  }[] = [];

  // Add promulgation articles if present
  if (law.promulgationArticles && law.promulgationArticles.length > 0) {
    law.promulgationArticles.forEach((art) => {
      result.push({
        number: art.number,
        title: 'مادة إصدار',
        text: art.text,
        chapterNumber: 'مواد الإصدار',
        chapterTitle: 'أحكام إصدار القانون',
      });
    });
  }

  // Add regular chapter articles
  law.chapters.forEach((ch) => {
    if (ch.articles) {
      ch.articles.forEach((art) => {
        result.push({
          number: art.number,
          title: art.title,
          text: art.text,
          chapterNumber: ch.chapterNumber,
          chapterTitle: ch.title,
        });
      });
    }
  });

  return result;
}
