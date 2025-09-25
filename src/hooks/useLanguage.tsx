import { useState, useEffect } from 'react';

export type Language = 'en' | 'fa';

const getSystemLanguage = (): Language => {
    const systemLang = navigator.language || navigator.languages[0];
    return systemLang.startsWith('fa') ? 'fa' : 'en';
};

export const useLanguage = () => {
    const [language, setLanguage] = useState<Language>(() => {
        // First check localStorage
        const savedLang = localStorage.getItem('language');
        if (savedLang && (savedLang === 'en' || savedLang === 'fa')) {
            return savedLang as Language;
        }
        // If no saved preference, check system preference
        return getSystemLanguage();
    });

    useEffect(() => {
        // Apply RTL/LTR direction
        document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        if (language === 'fa') {
            document.documentElement.classList.add('font-vazir');
        } else {
            document.documentElement.classList.remove('font-vazir');
        }
    }, []);

    useEffect(() => {
        // Save to localStorage and apply direction when language changes
        localStorage.setItem('language', language);
        document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        if (language === 'fa') {
            document.documentElement.classList.add('font-vazir');
        } else {
            document.documentElement.classList.remove('font-vazir');
        }
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prevLang => prevLang === 'en' ? 'fa' : 'en');
    };

    return { language, toggleLanguage };
};