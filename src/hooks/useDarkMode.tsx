import { useState, useEffect } from 'react';

export const useDarkMode = () => {
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        // First check localStorage
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode !== null) {
            return JSON.parse(savedMode);
        }
        // If no saved preference, check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        // Apply the theme immediately when component mounts
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []); // Run once on mount

    useEffect(() => {
        // Save to localStorage and apply theme when darkMode changes
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(prevMode => !prevMode);
    };

    return { darkMode, toggleDarkMode };
};