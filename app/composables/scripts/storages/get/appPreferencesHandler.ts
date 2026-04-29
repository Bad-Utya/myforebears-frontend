import {storeToRefs} from "pinia";
import {
  type AppLanguage,
  type AppPreferences,
  type AppTheme,
  useAppPreferencesStore
} from "~/composables/scripts/storages/create/appPreferences";

const STORAGE_KEY = 'rooots.app-preferences';

type StoredAppPreferences = Partial<AppPreferences> & {
  themeManual?: boolean;
  languageManual?: boolean;
};

function normalizeTheme(value?: string): AppTheme {
  return value === 'light' ? 'light' : 'dark';
}

function normalizeLanguage(value?: string): AppLanguage {
  return value?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

function detectSystemPreferences(): AppPreferences {
  if (typeof window === 'undefined') {
    return {
      theme: 'dark',
      language: 'en',
    };
  }

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
  const browserLanguage = navigator.languages?.[0] ?? navigator.language;

  return {
    theme: prefersDark ? 'dark' : 'light',
    language: normalizeLanguage(browserLanguage),
  };
}

function readStoredPreferences(): StoredAppPreferences | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as StoredAppPreferences;

    return {
      theme: normalizeTheme(parsedValue.theme),
      language: normalizeLanguage(parsedValue.language),
      themeManual: parsedValue.themeManual === true,
      languageManual: parsedValue.languageManual === true,
    };
  } catch {
    return null;
  }
}

function persistPreferences(preferences: StoredAppPreferences) {
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
  document.documentElement.dataset.appTheme = preferences.theme;
  document.documentElement.style.colorScheme = preferences.theme;
}

export default function useAppPreferencesHandler() {
  const appPreferencesStore = useAppPreferencesStore();
  const {preferences, initialized} = storeToRefs(appPreferencesStore);
  const theme = computed(() => preferences.value?.theme ?? 'dark');
  const language = computed(() => preferences.value?.language ?? 'en');

  function syncPreferences(nextPreferences: AppPreferences) {
    appPreferencesStore.setPreferences(nextPreferences);
    applyPreferences(nextPreferences);
  }

  function persistManualPreferences(partialPreferences: Partial<AppPreferences>) {
    const storedPreferences = readStoredPreferences();

    persistPreferences({
      theme: partialPreferences.theme ?? storedPreferences?.theme,
      language: partialPreferences.language ?? storedPreferences?.language,
      themeManual: partialPreferences.theme !== undefined ? true : storedPreferences?.themeManual === true,
      languageManual: partialPreferences.language !== undefined ? true : storedPreferences?.languageManual === true,
    });
  }

  function ensureLoaded() {
    if (initialized.value) {
      if (preferences.value) {
        applyPreferences(preferences.value);
      }

      return;
    }

    const systemPreferences = detectSystemPreferences();
    const storedPreferences = readStoredPreferences();

    syncPreferences({
      theme: storedPreferences?.themeManual ? storedPreferences.theme ?? systemPreferences.theme : systemPreferences.theme,
      language: storedPreferences?.languageManual ? storedPreferences.language ?? systemPreferences.language : systemPreferences.language,
    });
  }

  function setTheme(nextTheme: AppTheme) {
    const nextPreferences = {
      theme: nextTheme,
      language: language.value,
    } satisfies AppPreferences;

    syncPreferences(nextPreferences);
    persistManualPreferences({ theme: nextTheme });
  }

  function setLanguage(nextLanguage: AppLanguage) {
    const nextPreferences = {
      theme: theme.value,
      language: nextLanguage,
    } satisfies AppPreferences;

    syncPreferences(nextPreferences);
    persistManualPreferences({ language: nextLanguage });
  }

  return {
    preferences,
    initialized,
    theme,
    language,
    ensureLoaded,
    setTheme,
    setLanguage,
  };
}
