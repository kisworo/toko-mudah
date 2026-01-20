import { useState, useEffect } from 'react';
import { StoreSettings, ThemeTone } from '@/types';

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'TokoKu',
  storeAddress: '',
  storePhone: '',
  themeTone: 'green',
  backgroundImage: undefined,
};

const THEME_COLORS: Record<ThemeTone, { primary: string; accent: string; ring: string }> = {
  green: {
    primary: '142 70% 40%',
    accent: '142 60% 95%',
    ring: '142 70% 40%',
  },
  blue: {
    primary: '217 91% 50%',
    accent: '217 60% 95%',
    ring: '217 91% 50%',
  },
  purple: {
    primary: '262 83% 58%',
    accent: '262 60% 95%',
    ring: '262 83% 58%',
  },
  orange: {
    primary: '25 95% 53%',
    accent: '25 60% 95%',
    ring: '25 95% 53%',
  },
  rose: {
    primary: '346 77% 50%',
    accent: '346 60% 95%',
    ring: '346 77% 50%',
  },
};

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('store-settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Apply theme colors to CSS variables
  useEffect(() => {
    const colors = THEME_COLORS[settings.themeTone];
    const root = document.documentElement;
    
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--ring', colors.ring);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-foreground', colors.primary.replace(/\d+%$/, '30%'));
    
    // For sidebar
    root.style.setProperty('--sidebar-primary', colors.primary);
    root.style.setProperty('--sidebar-accent', colors.accent);
    root.style.setProperty('--sidebar-ring', colors.ring);
  }, [settings.themeTone]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('store-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const setBackgroundImage = (imageData: string | undefined) => {
    updateSettings({ backgroundImage: imageData });
  };

  const setThemeTone = (tone: ThemeTone) => {
    updateSettings({ themeTone: tone });
  };

  return {
    settings,
    updateSettings,
    setBackgroundImage,
    setThemeTone,
    themeColors: THEME_COLORS,
  };
}
