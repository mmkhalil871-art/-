import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ThemeSettings,
  ThemeId,
  AccentColorId,
  FontSizeScale,
  ThemeConfig,
  AccentConfig,
  THEMES_LIST,
  ACCENTS_LIST,
} from '../types/theme';
import {
  getStoredThemeSettings,
  saveStoredThemeSettings,
  applyThemeToDocument,
  DEFAULT_THEME_SETTINGS,
} from '../utils/themeStorage';

interface ThemeContextType {
  settings: ThemeSettings;
  activeTheme: ThemeConfig;
  activeAccent: AccentConfig;
  setTheme: (themeId: ThemeId) => void;
  setAccent: (accentId: AccentColorId) => void;
  setFontScale: (fontScale: FontSizeScale) => void;
  resetTheme: () => void;
  toggleDarkMode: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    const initial = getStoredThemeSettings();
    applyThemeToDocument(initial);
    return initial;
  });

  useEffect(() => {
    applyThemeToDocument(settings);
  }, [settings]);

  const activeTheme =
    THEMES_LIST.find((t) => t.id === settings.themeId) || THEMES_LIST[0];

  const activeAccent =
    ACCENTS_LIST.find((a) => a.id === settings.accentId) || ACCENTS_LIST[0];

  const setTheme = (themeId: ThemeId) => {
    const newSettings = { ...settings, themeId };
    setSettings(newSettings);
    saveStoredThemeSettings(newSettings);
  };

  const setAccent = (accentId: AccentColorId) => {
    const newSettings = { ...settings, accentId };
    setSettings(newSettings);
    saveStoredThemeSettings(newSettings);
  };

  const setFontScale = (fontScale: FontSizeScale) => {
    const newSettings = { ...settings, fontScale };
    setSettings(newSettings);
    saveStoredThemeSettings(newSettings);
  };

  const resetTheme = () => {
    setSettings(DEFAULT_THEME_SETTINGS);
    saveStoredThemeSettings(DEFAULT_THEME_SETTINGS);
  };

  const toggleDarkMode = () => {
    const newThemeId: ThemeId = settings.themeId === 'dark' ? 'classic' : 'dark';
    setTheme(newThemeId);
  };

  return (
    <ThemeContext.Provider
      value={{
        settings,
        activeTheme,
        activeAccent,
        setTheme,
        setAccent,
        setFontScale,
        resetTheme,
        toggleDarkMode,
        isDark: activeTheme.isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
