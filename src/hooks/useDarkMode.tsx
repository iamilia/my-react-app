import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'darkMode';

/** Dark-first: unless the user has explicitly opted out, the site is dark. */
const getInitialMode = (): boolean => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) return JSON.parse(saved) as boolean;
    } catch {
        /* localStorage unavailable — fall through */
    }
    return true;
};

const applyMode = (dark: boolean) => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
    root.style.backgroundColor = dark ? '#08060a' : '#fff7f8';
    document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', dark ? '#08060a' : '#fff7f8');
};

export const useDarkMode = () => {
    const [darkMode, setDarkMode] = useState<boolean>(getInitialMode);

    useEffect(() => {
        applyMode(darkMode);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(darkMode));
        } catch {
            /* ignore write failures (private mode, etc.) */
        }
    }, [darkMode]);

    const toggleDarkMode = useCallback(() => setDarkMode((prev) => !prev), []);

    return { darkMode, toggleDarkMode };
};
