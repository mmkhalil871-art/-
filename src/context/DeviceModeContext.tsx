import React, { createContext, useContext, useState, useEffect } from 'react';

export type DeviceModePreference = 'auto' | 'mobile' | 'desktop';

interface DeviceModeContextType {
  modePreference: DeviceModePreference;
  effectiveMode: 'mobile' | 'desktop';
  setModePreference: (mode: DeviceModePreference) => void;
  isMobile: boolean;
  toggleMode: () => void;
}

const STORAGE_KEY = 'egypt_labor_law_device_mode_v1';

const DeviceModeContext = createContext<DeviceModeContextType | undefined>(undefined);

export const DeviceModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modePreference, setModePreferenceState] = useState<DeviceModePreference>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'mobile' || stored === 'desktop' || stored === 'auto') {
        return stored;
      }
    } catch (e) {
      // ignore
    }
    return 'auto';
  });

  const [windowIsMobile, setWindowIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setModePreference = (mode: DeviceModePreference) => {
    setModePreferenceState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      // ignore
    }
  };

  const effectiveMode: 'mobile' | 'desktop' =
    modePreference === 'auto' ? (windowIsMobile ? 'mobile' : 'desktop') : modePreference;

  const toggleMode = () => {
    if (effectiveMode === 'mobile') {
      setModePreference('desktop');
    } else {
      setModePreference('mobile');
    }
  };

  return (
    <DeviceModeContext.Provider
      value={{
        modePreference,
        effectiveMode,
        setModePreference,
        isMobile: effectiveMode === 'mobile',
        toggleMode,
      }}
    >
      {children}
    </DeviceModeContext.Provider>
  );
};

export const useDeviceMode = (): DeviceModeContextType => {
  const context = useContext(DeviceModeContext);
  if (!context) {
    throw new Error('useDeviceMode must be used within a DeviceModeProvider');
  }
  return context;
};
