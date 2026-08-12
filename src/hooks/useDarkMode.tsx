import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'theme';

/** Keep these in step with --bg in style.css and the inline script in index.html. */
const LIGHT_BG = '#f9f4ec';
const DARK_BG = '#020617';

const systemPrefersDark = () =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

const readOverride = (): 'dark' | 'light' | null => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === 'dark' || saved === 'light' ? saved : null;
    } catch {
        /* localStorage unavailable (private mode, blocked cookies) */
        return null;
    }
};

/**
 * System-first: the operating system decides until the visitor says otherwise.
 * Toggling writes an explicit override; from then on the site stops following
 * the system for that browser.
 */
const getInitialMode = (): boolean => {
    const override = readOverride();
    return override ? override === 'dark' : systemPrefersDark();
};

const applyMode = (dark: boolean) => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
    root.style.backgroundColor = dark ? DARK_BG : LIGHT_BG;
    document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', dark ? DARK_BG : LIGHT_BG);
};

export const useDarkMode = () => {
    const [darkMode, setDarkMode] = useState<boolean>(getInitialMode);

    useEffect(() => {
        applyMode(darkMode);
    }, [darkMode]);

    /**
     * Follow the OS live — someone flipping their system to dark at sunset
     * should see the site follow, but only while they have no override set.
     */
    useEffect(() => {
        if (typeof window.matchMedia !== 'function') return;

        const query = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (event: MediaQueryListEvent) => {
            if (readOverride() === null) setDarkMode(event.matches);
        };

        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);

    const toggleDarkMode = useCallback(() => {
        setDarkMode((prev) => {
            const next = !prev;
            try {
                // Back to following the system once the choice matches it again.
                if (next === systemPrefersDark())
                    localStorage.removeItem(STORAGE_KEY);
                else localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
            } catch {
                /* ignore write failures */
            }
            return next;
        });
    }, []);

    return { darkMode, toggleDarkMode };
};
