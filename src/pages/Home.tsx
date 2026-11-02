import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { About } from '../components/About';
import { Contact } from '../components/Contact';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { Navigation } from '../components/Navigation';
import { Projects } from '../components/Projects';
import { RouteLine } from '../components/RouteLine';
import { Skills } from '../components/Skills';
import { Work } from '../components/Work';
import { useGitHubStore } from '../store/githubStore';
import { useLanguageStore } from '../store/languageStore';
import { useThemeStore } from '../store/themeStore';
import { smoothScrollToSection } from '../utils/scroll';

const USERNAME = 'iamilia';
// Ask for everything the server keeps (30): forks are filtered out on this
// side, and the language split is computed from the whole list.
const REPO_COUNT = 30;

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
    const mainRef = useRef<HTMLElement>(null);
    /** The line the visitor picked; shared by the hero legend and Projects. */
    const [line, setLine] = useState<string | null>(null);

    const pickLine = (language: string) => {
        setLine(language);
        smoothScrollToSection('projects');
    };

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

            <main ref={mainRef} className="relative">
                <RouteLine container={mainRef} />
                <Hero
                    user={user}
                    repos={repos}
                    scrollToSection={smoothScrollToSection}
                    onPickLanguage={pickLine}
                />
                <Projects
                    no={1}
                    repos={repos}
                    status={status}
                    error={error}
                    onRetry={() => void load(USERNAME, REPO_COUNT)}
                    language={line}
                    onLanguage={setLine}
                />
                <Work no={2} />
                <About no={3} user={user} />
                <Skills no={4} />
                <Contact no={5} user={user} />
            </main>

            <Footer
                userName={t('navigation.userName')}
                scrollToSection={smoothScrollToSection}
            />
        </>
    );
};
