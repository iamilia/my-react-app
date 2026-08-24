import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconRefresh, IconAlertTriangle } from '@tabler/icons-react';
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
import { PageLoader } from '../components/PageLoader';
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
        document.title = 'Iam Ilia - Software Developer Portfolio';
    }, []);

    // The store decides whether this actually hits the network — a fresh
    // cache resolves it without a request.
    useEffect(() => {
        void load(USERNAME, REPO_COUNT);
    }, [load]);

    const loading = status === 'loading' || status === 'idle';

    /**
     * Links on the sub-pages point at `/#contact` and friends. The sections
     * only exist once the fetch resolves, so the scroll waits for that.
     */
    useEffect(() => {
        if (loading || !hash) return;
        const id = hash.slice(1);
        const frame = requestAnimationFrame(() => smoothScrollToSection(id));
        return () => cancelAnimationFrame(frame);
    }, [loading, hash]);

    const scrollToSection = (sectionId: string) =>
        smoothScrollToSection(sectionId);

    if (loading) return <PageLoader />;

    if (status === 'error') {
        return (
            <div className="flex min-h-svh items-center px-6">
                <div className="mx-auto w-full max-w-md">
                    <hr className="rule-heavy" />
                    <span className="label label-ink mt-5 flex items-center gap-2.5">
                        <IconAlertTriangle size={15} className="text-accent" />
                        {t('loading.errorTitle')}
                    </span>
                    <p className="prose-sm mt-3">{error}</p>
                    <button
                        type="button"
                        onClick={() => void load(USERNAME, REPO_COUNT)}
                        className="btn mt-7"
                    >
                        <IconRefresh size={16} />
                        {t('loading.tryAgain')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navigation
                userName={user?.name || 'Ilia'}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                scrollToSection={scrollToSection}
                toggleLanguage={toggleLanguage}
                language={language}
            />

            <main>
                <Hero user={user} scrollToSection={scrollToSection} />
                <About user={user} />
                <Skills />
                <Work />
                <Projects repos={repos} />
                <Contact user={user} />
            </main>

            <Footer
                userName={t('navigation.userName')}
                scrollToSection={scrollToSection}
            />
        </>
    );
};
