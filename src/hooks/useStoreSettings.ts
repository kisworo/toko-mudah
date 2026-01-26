import { useState, useEffect } from 'react';
import { StoreSettings, ThemeTone } from '@/types';
import { api } from '@/lib/api';

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

// Convert API Settings to local Settings format
const convertApiSettings = (s: any): StoreSettings => ({
  storeName: s.store_name,
  storeAddress: s.store_address,
  storePhone: s.store_phone,
  themeTone: s.theme_tone,
  backgroundImage: s.background_image,
});

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await api.getSettings();
        if (data) {
          setSettings(convertApiSettings(data));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
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
    // Optimistic update
    setSettings(prev => ({ ...prev, ...updates }));

    try {
      const apiSettings = {
        store_name: updates.storeName || settings.storeName,
        store_address: updates.storeAddress || settings.storeAddress,
        store_phone: updates.storePhone || settings.storePhone,
        theme_tone: updates.themeTone || settings.themeTone,
        background_image: updates.backgroundImage !== undefined ? updates.backgroundImage : settings.backgroundImage,
      };
      await api.updateSettings(apiSettings as any);
    } catch (error) {
      console.error('Error updating settings:', error);
      // Revert on error? For now, we just log it.
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
    updateSettings,
    setBackgroundImage,
    setThemeTone,
    themeColors: THEME_COLORS,
    loading,
  };
}
