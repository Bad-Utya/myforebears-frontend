import {storeToRefs} from "pinia";
import {
  type AppLanguage,
  type AppPreferences,
  useAppPreferencesStore
} from "~/composables/scripts/storages/create/appPreferences";

const STORAGE_KEY = 'rooots.app-preferences';

function normalizeLanguage(value?: string): AppLanguage {
  return value?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

function detectSystemPreferences(): AppPreferences {
  if (typeof window === 'undefined') {
    return {
      language: 'en',
    };
  }

  const browserLanguage = navigator.languages?.[0] ?? navigator.language;

  return {
    language: normalizeLanguage(browserLanguage),
  };
}

function readStoredPreferences(): AppPreferences | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<AppPreferences>;

    return {
      language: normalizeLanguage(parsedValue.language),
    };
  } catch {
    return null;
  }
}

function persistPreferences(preferences: AppPreferences) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

function applyPreferences(preferences: AppPreferences) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.lang = preferences.language;
}

export default function useAppPreferencesHandler() {
  const appPreferencesStore = useAppPreferencesStore();
  const {preferences, initialized} = storeToRefs(appPreferencesStore);
  const language = computed(() => preferences.value?.language ?? 'en');

  function syncPreferences(nextPreferences: AppPreferences) {
    appPreferencesStore.setPreferences(nextPreferences);
    persistPreferences(nextPreferences);
    applyPreferences(nextPreferences);
  }

  function ensureLoaded() {
    if (initialized.value) {
      if (preferences.value) {
        applyPreferences(preferences.value);
      }

      return;
    }

    syncPreferences(readStoredPreferences() ?? detectSystemPreferences());
  }

  function setLanguage(nextLanguage: AppLanguage) {
    syncPreferences({
      language: nextLanguage,
    });
  }

  return {
    preferences,
    initialized,
    language,
    ensureLoaded,
    setLanguage,
  };
}
