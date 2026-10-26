import { LaborLawInfo, LABOR_LAW_14_2025 } from '../data/laborLawData';

const LAW_STORAGE_KEY = 'official_labor_law_14_2025_active';

export function getStoredLaborLaw(): LaborLawInfo {
  try {
    const raw = localStorage.getItem(LAW_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LAW_STORAGE_KEY, JSON.stringify(LABOR_LAW_14_2025));
      return LABOR_LAW_14_2025;
    }
    const parsed = JSON.parse(raw);
    // If it's custom uploaded, honor the user's custom text
    if (parsed && (parsed.isCustomUploaded || parsed.customUploadedAt)) {
      return parsed;
    }
    // If it's the default seeded law and doesn't have 7 promulgation articles or latest structure, refresh it
    if (!parsed?.promulgationArticles || parsed.promulgationArticles.length < 7 || parsed.chapters?.length !== 6) {
      localStorage.setItem(LAW_STORAGE_KEY, JSON.stringify(LABOR_LAW_14_2025));
      return LABOR_LAW_14_2025;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading stored labor law:', err);
    return LABOR_LAW_14_2025;
  }
}

export function saveStoredLaborLaw(law: LaborLawInfo): void {
  try {
    localStorage.setItem(LAW_STORAGE_KEY, JSON.stringify(law));
  } catch (err) {
    console.error('Error saving stored labor law:', err);
  }
}

export function isCustomLawStored(): boolean {
  try {
    const raw = localStorage.getItem(LAW_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.isCustomUploaded || (parsed && parsed.updatedAt && parsed.title));
  } catch {
    return false;
  }
}

export function resetStoredLaborLaw(): LaborLawInfo {
  try {
    localStorage.removeItem(LAW_STORAGE_KEY);
    return LABOR_LAW_14_2025;
  } catch (err) {
    console.error('Error resetting stored labor law:', err);
    return LABOR_LAW_14_2025;
  }
}

/**
 * Extracts a flattened list of all articles in the law for easy cross-referencing
 */
export function getAllLawArticlesFlattened(law: LaborLawInfo): {
  number: string;
  title?: string;
  text: string;
  chapterNumber: string;
  chapterTitle: string;
}[] {
  const result: {
    number: string;
    title?: string;
    text: string;
    chapterNumber: string;
    chapterTitle: string;
  }[] = [];

  law.chapters.forEach((ch) => {
    ch.articles.forEach((art) => {
      result.push({
        number: art.number,
        title: art.title,
        text: art.text,
        chapterNumber: ch.chapterNumber,
        chapterTitle: ch.title,
      });
    });
  });

  return result;
}
