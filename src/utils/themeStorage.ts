import { ThemeSettings, ThemeId, AccentColorId, FontSizeScale, THEMES_LIST, ACCENTS_LIST } from '../types/theme';

const STORAGE_KEY = 'egypt_labor_law_theme_settings_v1';

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  themeId: 'classic',
  accentId: 'amber',
  fontScale: 'normal',
};

export const getStoredThemeSettings = (): ThemeSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_THEME_SETTINGS;
    const parsed = JSON.parse(raw);
    const validTheme = THEMES_LIST.some((t) => t.id === parsed.themeId) ? parsed.themeId : DEFAULT_THEME_SETTINGS.themeId;
    const validAccent = ACCENTS_LIST.some((a) => a.id === parsed.accentId) ? parsed.accentId : DEFAULT_THEME_SETTINGS.accentId;
    const validScale = ['normal', 'comfortable', 'large'].includes(parsed.fontScale) ? parsed.fontScale : DEFAULT_THEME_SETTINGS.fontScale;
    
    return {
      themeId: validTheme as ThemeId,
      accentId: validAccent as AccentColorId,
      fontScale: validScale as FontSizeScale,
    };
  } catch (e) {
    console.error('Failed to load theme settings from storage:', e);
    return DEFAULT_THEME_SETTINGS;
  }
};

export const saveStoredThemeSettings = (settings: ThemeSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    applyThemeToDocument(settings);
  } catch (e) {
    console.error('Failed to save theme settings to storage:', e);
  }
};

export const applyThemeToDocument = (settings: ThemeSettings): void => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const themeConfig = THEMES_LIST.find((t) => t.id === settings.themeId) || THEMES_LIST[0];

  // Set data attributes
  root.setAttribute('data-theme', settings.themeId);
  root.setAttribute('data-accent', settings.accentId);
  root.setAttribute('data-scale', settings.fontScale);

  // Dark class toggle
  if (themeConfig.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Update theme-color meta tag for mobile browser navigation bar
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', themeConfig.previewHeader);
  }
};
