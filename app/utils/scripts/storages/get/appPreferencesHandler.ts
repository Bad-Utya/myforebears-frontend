import {storeToRefs} from 'pinia';
import {
  useAppPreferencesStore,
  type AppPreferences,
  type AppTheme, type AppLanguage
} from '~/utils/scripts/storages/create/appPreferences';
import {sendUpdatePreferencesRequest} from "~/services/users/updatePreferences";

// TODO: make separate file

function getSystemLanguage(): AppLanguage {
  if (import.meta.server) return 'en';

  const navLang = navigator.language.toLowerCase();
  return navLang.startsWith('ru') ? 'ru' : 'en';
}

function getSystemTheme(): AppTheme {
  if (import.meta.server) return 'light';

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDark ? 'dark' : 'light';
}

export default function useAppPreferencesHandler() {
  const store = useAppPreferencesStore();
  const {preferences} = storeToRefs(store);

  function getServerPreferences(theme?: string, language?: string) {
    const themeConverted = (theme === 'light' || theme === 'dark') ? (theme as AppTheme) : undefined;
    const languageConverted = (language === 'ru' || language === 'en') ? (language as AppLanguage) : undefined;

    console.log(themeConverted, languageConverted);

    const patch: Partial<AppPreferences> = {};

    if (!themeConverted) {
      patch.theme = getSystemTheme();
    } else {
      patch.theme = themeConverted;
    }

    if (!languageConverted) {
      patch.language = getSystemLanguage();
    } else {
      patch.language = languageConverted;
    }

    store.patchPreferences(patch);
  }


  async function updatePreferences(patch: Partial<AppPreferences>) {
    store.patchPreferences(patch);

    try {
      await sendUpdatePreferencesRequest(
        store.preferences.language,
        store.preferences.theme
      );
    } catch (e) {
      console.error('Failed to sync preferences with server', e);
    }
  }

  async function switchTheme() {
    const nextTheme = preferences.value.theme === 'dark' ? 'light' : 'dark';
    await updatePreferences({theme: nextTheme});
  }

  return {
    preferences,
    updatePreferences,
    switchTheme,
    getServerPreferences,
  };
}
