import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGitHubStore } from '../store/githubStore';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import { Navigation } from '../components/Navigation';
import { Hero } from '../components/Hero';
import { About } from '../components/About';
import { Work } from '../components/Work';
import { Projects } from '../components/Projects';
import { Contact } from '../components/Contact';
import { Skills } from '../components/Skills';
import { Footer } from '../components/Footer';
import { smoothScrollToSection } from '../utils/scroll';

const USERNAME = 'iamilia';
const REPO_COUNT = 6;

export const Home = () => {
    const user = useGitHubStore((s) => s.user);
    const repos = useGitHubStore((s) => s.repos);
    const status = useGitHubStore((s) => s.status);
    const error = useGitHubStore((s) => s.error);
    const load = useGitHubStore((s) => s.load);
    const darkMode = useThemeStore((s) => s.darkMode);
    const toggleDarkMode = useThemeStore((s) => s.toggleDarkMode);
    const language = useLanguageStore((s) => s.language);
    const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);
    const { hash } = useLocation();
    const { t } = useTranslation();

    // The sub-pages retitle the tab, so put the original back on the way in.
    useEffect(() => {
        document.title = 'Ilia Lotfi — Software & Game Developer';
    }, []);

    // The store decides whether this actually hits the network — a fresh
    // cache resolves it without a request.
    useEffect(() => {
        void load(USERNAME, REPO_COUNT);
    }, [load]);

    /**
     * Links on the sub-pages point at `/#contact` and friends. Every section
     * renders on first paint now (only the repo grid waits for GitHub), so
     * the target exists by the next frame.
     */
    useEffect(() => {
        if (!hash) return;
        const id = hash.slice(1);
        const frame = requestAnimationFrame(() => smoothScrollToSection(id));
        return () => cancelAnimationFrame(frame);
    }, [hash]);

    return (
        <>
            <Navigation
                userName={user?.name || 'Ilia'}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                scrollToSection={smoothScrollToSection}
                toggleLanguage={toggleLanguage}
                language={language}
            />

            <main>
                <Hero user={user} scrollToSection={smoothScrollToSection} />
                <About user={user} />
                <Skills />
                <Work />
                <Projects
                    repos={repos}
                    status={status}
                    error={error}
                    onRetry={() => void load(USERNAME, REPO_COUNT)}
                />
                <Contact user={user} />
            </main>

            <Footer
                userName={t('navigation.userName')}
                scrollToSection={smoothScrollToSection}
            />
        </>
    );
};
