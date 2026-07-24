// utils/scripts/storages/create/appPreferences.ts
import { defineStore } from "pinia";

export type AppLanguage = 'ru' | 'en';
export type AppTheme = 'light' | 'dark';

export type AppPreferences = {
  language: AppLanguage;
  theme: AppTheme;
};

type AppPreferencesState = {
  preferences: AppPreferences;
  pending: boolean;
  initialized: boolean;
};

export const useAppPreferencesStore = defineStore('app-preferences', {
  state: (): AppPreferencesState => ({
    preferences: {
      language: 'ru',
      theme: 'light'
    },
    pending: false,
    initialized: false,
  }),

  actions: {
    setPending(value: boolean) {
      this.pending = value;
    },

    setPreferences(nextPreferences: AppPreferences) {
      this.preferences = { ...nextPreferences };
      this.initialized = true;
    },

    patchPreferences(partialPreferences: Partial<AppPreferences>) {
      this.preferences = {
        ...this.preferences,
        ...partialPreferences,
      };

      this.initialized = true;
    }
  }
});
