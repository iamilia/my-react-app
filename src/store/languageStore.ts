/**
 * Interface language.
 *
 * One owner for the current language: this store writes `dir` and `lang` on
 * <html> and tells i18next, so those three can never drift apart. i18next is
 * imported here rather than reached through a hook, which means the switch to
 * Persian happens while the module graph loads — before the first render,
 * instead of in an effect after it.
 *
 * The font is deliberately not switched: the sans/display stacks list
 * Vazirmatn after the Latin faces, so Persian glyphs resolve to it per-glyph
 * while Latin runs (repo names, stack lists) keep the face they were set in.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';
import type { Language } from '../types/lang';
import { rawStorage } from './rawStorage';

const STORAGE_KEY = 'language';

const DEFAULT: Language = 'en';

const isLanguage = (value: unknown): value is Language =>
    value === 'en' || value === 'fa';

const applyLanguage = (language: Language): void => {
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;

    if (i18n.language !== language) void i18n.changeLanguage(language);
};

interface LanguageState {
    language: Language;
    setLanguage: (language: Language) => void;
    toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set, get) => ({
            language: DEFAULT,

            setLanguage: (language) => set({ language }),

            toggleLanguage: () =>
                set({ language: get().language === 'en' ? 'fa' : 'en' }),
        }),
        {
            name: STORAGE_KEY,
            storage: rawStorage<Pick<LanguageState, 'language'>>(
                (raw) => ({ language: isLanguage(raw) ? raw : DEFAULT }),
                (state) => state.language
            ),
            partialize: (state) => ({ language: state.language }),
        }
    )
);

/* ------------------------------ side effects ------------------------------ */

applyLanguage(useLanguageStore.getState().language);
useLanguageStore.subscribe((state) => applyLanguage(state.language));
