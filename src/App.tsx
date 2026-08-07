import { useState, useEffect } from 'react';
import { githubService } from './services/githubService';
import { useDarkMode } from './hooks/useDarkMode';
import { useLanguage } from './hooks/useLanguage';
import type { GitHubUser, GitHubRepo } from './types/github';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Projects } from './components/Projects';
import { Contact } from './components/Contact';
import { Skills } from './components/Skills';
import { Backdrop } from './components/Backdrop';
import { useTranslation } from 'react-i18next';
import { IconRefresh, IconAlertTriangle } from '@tabler/icons-react';

function App() {
    const [user, setUser] = useState<GitHubUser | null>(null);
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { darkMode, toggleDarkMode } = useDarkMode();
    const { language, toggleLanguage } = useLanguage();
    const { t } = useTranslation();

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

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (!element) return;

        const startY = window.scrollY;
        const endY = element.getBoundingClientRect().top + window.scrollY - 80;
        const duration = 700;
        const startTime = performance.now();

        const easeInOutCubic = (x: number) =>
            x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

        const animateScroll = (currentTime: number) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            window.scrollTo(0, startY + (endY - startY) * easeInOutCubic(progress));
            if (progress < 1) requestAnimationFrame(animateScroll);
        };

        requestAnimationFrame(animateScroll);
    };

    if (loading) {
        return (
            <>
                <Backdrop />
                <div className="flex min-h-[100svh] flex-col items-center justify-center gap-6">
                    <div className="relative h-20 w-20">
                        <span className="absolute inset-0 rounded-full border border-[var(--line)]" />
                        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[var(--accent)]" />
                        <span className="absolute inset-3 rounded-full bg-[var(--accent)] opacity-20 blur-md" />
                    </div>
                    <p className="text-muted font-mono text-[0.7rem] tracking-[0.3em] uppercase">
                        {t('loading.loading')}
                    </p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Backdrop />
                <div className="flex min-h-[100svh] items-center justify-center px-4">
                    <div className="panel max-w-md p-8 text-center">
                        <span className="text-accent border-[var(--line-strong)] bg-[var(--accent-soft)] mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border">
                            <IconAlertTriangle size={22} />
                        </span>
                        <h2 className="text-xl font-semibold">
                            {t('loading.errorTitle')}
                        </h2>
                        <p className="text-muted mt-3 text-sm">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-neon mt-7 text-sm"
                        >
                            <IconRefresh size={16} />
                            {t('loading.tryAgain')}
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Backdrop />
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
                <Projects repos={repos} />
                <Contact user={user} />
            </main>

            <footer className="border-t border-[var(--line)] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-start">
                    <p className="text-muted font-mono text-[0.7rem] tracking-[0.14em]">
                        © {new Date().getFullYear()} {user?.name || 'Ilia'}
                    </p>
                    <p className="text-muted font-mono text-[0.7rem] tracking-[0.14em]">
                        {t('footer.builtWith')}
                    </p>
                </div>
            </footer>
        </>
    );
}

export default App;
