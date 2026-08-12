import { useEffect, useSyncExternalStore } from 'react';
import type { Language } from '../types/lang';
import { useTranslation } from 'react-i18next';

type Listener = () => void;

function getInitialLanguage(): Language {
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'fa') return saved;
    return 'en';
}

let currentLanguage: Language = getInitialLanguage();
const listeners = new Set<Listener>();

/**
 * `dir` and `lang` are the only things that need to change. The font no
 * longer does: the sans/display stacks list Vazirmatn after the Latin faces,
 * so Persian glyphs resolve to it per-glyph while Latin runs (repo names,
 * stack lists) keep the Latin face they were set in.
 */
function applyDomSideEffects(lang: Language) {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
}

function setGlobalLanguage(lang: Language) {
    if (lang === currentLanguage) return;
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    applyDomSideEffects(lang);
    listeners.forEach(l => l());
}

applyDomSideEffects(currentLanguage);

function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot() {
    return currentLanguage;
}

export const useLanguage = () => {
    const { i18n } = useTranslation();
    const language = useSyncExternalStore(subscribe, getSnapshot);

    useEffect(() => {
        if (i18n.language !== language) {
            i18n.changeLanguage(language);
        }
    }, [language, i18n]);

    const toggleLanguage = () => {
        setGlobalLanguage(language === 'en' ? 'fa' : 'en');
    };

    return { language, toggleLanguage };
};