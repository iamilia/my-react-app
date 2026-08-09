import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../hooks/useDarkMode';
import { useLanguage } from '../hooks/useLanguage';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

/**
 * Chrome for every page that isn't the one-pager: same nav, same footer, and
 * enough top padding to clear the fixed header.
 */
export const SubPageShell = ({ children }: { children: ReactNode }) => {
    const { darkMode, toggleDarkMode } = useDarkMode();
    const { language, toggleLanguage } = useLanguage();
    const { t } = useTranslation();

    return (
        <>
            <Navigation
                userName={t('navigation.userName')}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                toggleLanguage={toggleLanguage}
                language={language}
            />

            <main className="px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-8">
                {children}
            </main>

            <Footer userName={t('navigation.userName')} />
        </>
    );
};
