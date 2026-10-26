import { MinisterialDecision } from '../types/decision';
import { SEED_DECISIONS } from '../data/seedDecisions';

const STORAGE_KEY = 'ministerial_decisions_law14_2025';

export function getStoredDecisions(): MinisterialDecision[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DECISIONS));
      return SEED_DECISIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Check if official 2025 series (like dec-2025-148) is present
      const hasOfficialSeries = parsed.some((d: any) => d.decisionNumber === '148');
      if (!hasOfficialSeries) {
        // Upgrade/refresh with the official decisions while keeping any custom decisions the user created
        const existingIds = new Set(parsed.map((d: any) => d.id));
        const merged = [...parsed];
        for (const seed of SEED_DECISIONS) {
          if (!existingIds.has(seed.id)) {
            merged.push(seed);
          }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
    return SEED_DECISIONS;
  } catch (error) {
    console.error('Error reading decisions from localStorage:', error);
    return SEED_DECISIONS;
  }
}

export function saveDecisions(decisions: MinisterialDecision[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
  } catch (error) {
    console.error('Error saving decisions to localStorage:', error);
  }
}

export function resetToSeedDecisions(): MinisterialDecision[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DECISIONS));
    return SEED_DECISIONS;
  } catch (error) {
    console.error('Error resetting decisions:', error);
    return SEED_DECISIONS;
  }
}
