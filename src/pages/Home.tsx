import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconRefresh, IconAlertTriangle } from '@tabler/icons-react';
import { githubService } from '../services/githubService';
import { useDarkMode } from '../hooks/useDarkMode';
import { useLanguage } from '../hooks/useLanguage';
import type { GitHubUser, GitHubRepo } from '../types/github';
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

export const Home = () => {
    const [user, setUser] = useState<GitHubUser | null>(null);
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { darkMode, toggleDarkMode } = useDarkMode();
    const { language, toggleLanguage } = useLanguage();
    const { hash } = useLocation();
    const { t } = useTranslation();

    // The sub-pages retitle the tab, so put the original back on the way in.
    useEffect(() => {
        document.title = 'Iam Ilia - Software Developer Portfolio';
    }, []);

    useEffect(() => {
        const fetchGitHubData = async () => {
            try {
                setLoading(true);
                const [userData, reposData] = await Promise.all([
                    githubService.getUser('iamilia'),
                    githubService.getUserRepos('iamilia', 6),
                ]);

                setUser(userData);
                setRepos(reposData);
            } catch (err) {
                console.error('Error fetching GitHub data:', err);
                setError('Failed to load GitHub data');
            } finally {
                setLoading(false);
            }
        };

        fetchGitHubData();
    }, []);

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

    const scrollToSection = (sectionId: string) => smoothScrollToSection(sectionId);

    if (loading) return <PageLoader />;

    if (error) {
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
                        onClick={() => window.location.reload()}
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
