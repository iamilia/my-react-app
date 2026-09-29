import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { Window } from './Window';

interface SubPageShellProps {
    /** Title bar text for the page's window; defaults to the site name. */
    title?: string;
    children: ReactNode;
}

/**
 * Chrome for every page that isn't the one-pager: same menu bar, same
 * footer, and the page itself open in a single window on the desktop.
 */
export const SubPageShell = ({ title, children }: SubPageShellProps) => {
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

            <main className="pt-18 pb-4 sm:pt-22 lg:pt-28">
                <div className="wrap">
                    <Window title={title ?? t('navigation.userName')}>
                        {children}
                    </Window>
                </div>
            </main>

            <Footer userName={t('navigation.userName')} />
        </>
    );
};
