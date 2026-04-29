import {defineStore} from "pinia";

export type AppTheme = 'light' | 'dark';
export type AppLanguage = 'ru' | 'en';

export type AppPreferences = {
  theme: AppTheme;
  language: AppLanguage;
};

type AppPreferencesState = {
  preferences: AppPreferences | null;
  initialized: boolean;
};

export const useAppPreferencesStore = defineStore('app-preferences', {
  state: (): AppPreferencesState => ({
    preferences: null,
    initialized: false,
  }),

  actions: {
    setPreferences(preferences: AppPreferences) {
      this.preferences = preferences;
      this.initialized = true;
    },

    patchPreferences(partialPreferences: Partial<AppPreferences>) {
      this.preferences = {
        theme: this.preferences?.theme ?? 'dark',
        language: this.preferences?.language ?? 'en',
        ...partialPreferences,
      };
      this.initialized = true;
    },

    resetPreferences() {
      this.preferences = null;
      this.initialized = false;
    }
  }
});
