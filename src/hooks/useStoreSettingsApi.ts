import { useState, useEffect } from 'react';
import { StoreSettings, ThemeTone } from '@/types';
import { api } from '@/lib/api';

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Toko Mudah',
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

export function useStoreSettingsApi() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await api.getSettings();
        const convertedSettings: StoreSettings = {
          storeName: data.store_name,
          storeAddress: data.store_address || undefined,
          storePhone: data.store_phone || undefined,
          themeTone: data.theme_tone as ThemeTone,
          backgroundImage: data.background_image || undefined,
        };
        setSettings(convertedSettings);

        // Also save to localStorage for theme application on page load
        localStorage.setItem('store-settings', JSON.stringify(convertedSettings));
      } catch (error: any) {
        console.error('Error fetching settings:', error.message);
        // Fallback to localStorage if API fails
        const saved = localStorage.getItem('store-settings');
        if (saved) {
          try {
            setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
          } catch {
            setSettings(DEFAULT_SETTINGS);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

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

  const updateSettings = async (updates: Partial<StoreSettings>) => {
    try {
      const apiData = {
        storeName: updates.storeName,
        storeAddress: updates.storeAddress,
        storePhone: updates.storePhone,
        themeTone: updates.themeTone,
        backgroundImage: updates.backgroundImage,
      };

      const result = await api.updateSettings(apiData);

      const convertedSettings: StoreSettings = {
        storeName: result.store_name,
        storeAddress: result.store_address || undefined,
        storePhone: result.store_phone || undefined,
        themeTone: result.theme_tone as ThemeTone,
        backgroundImage: result.background_image || undefined,
      };

      setSettings(convertedSettings);
      localStorage.setItem('store-settings', JSON.stringify(convertedSettings));
    } catch (error: any) {
      console.error('Error updating settings:', error.message);
      throw error;
    }
  };

  const setBackgroundImage = (imageData: string | undefined) => {
    updateSettings({ backgroundImage: imageData });
  };

  const setThemeTone = (tone: ThemeTone) => {
    updateSettings({ themeTone: tone });
  };

  return {
    settings,
    loading,
    updateSettings,
    setBackgroundImage,
    setThemeTone,
    themeColors: THEME_COLORS,
  };
}
