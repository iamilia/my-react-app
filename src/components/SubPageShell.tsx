import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

/**
 * Chrome for every page that isn't the one-pager: same nav, same footer, and
 * enough top padding to clear the fixed header.
 */
export const SubPageShell = ({ children }: { children: ReactNode }) => {
    const darkMode = useThemeStore((s) => s.darkMode);
    const toggleDarkMode = useThemeStore((s) => s.toggleDarkMode);
    const language = useLanguageStore((s) => s.language);
    const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);
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

            <main className="pt-28 pb-20 lg:pt-36">
                <div className="wrap">{children}</div>
            </main>

            <Footer userName={t('navigation.userName')} />
        </>
    );
};
