import { useState, useEffect } from 'react';
import type { Language } from '../types/lang';
import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState<Language>(() => {
        // First check localStorage
        const savedLang = localStorage.getItem('language');
        if (savedLang && (savedLang === 'en' || savedLang === 'fa')) {
            return savedLang as Language;
        }
        return i18n.language === 'fa' ? 'fa' : 'en';
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
        i18n.changeLanguage(language);
    }, );

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
        i18n.changeLanguage(language);
    }, [language, i18n]);

    const toggleLanguage = () => {
        setLanguage(prevLang => prevLang === 'en' ? 'fa' : 'en');
    };

    return { language, toggleLanguage };
};