import { useState, useEffect } from 'react';
import { githubService } from './services/githubService';
import { useDarkMode } from './hooks/useDarkMode';
import type { GitHubUser, GitHubRepo } from './types/github';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Projects } from './components/Projects';
import { Contact } from './components/Contact';
import { Skills } from './components/Skills';

function App() {
    const [user, setUser] = useState<GitHubUser | null>(null);
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { darkMode, toggleDarkMode } = useDarkMode();

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
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:from-stone-950 dark:via-cyan-950 dark:to-zinc-900 flex items-center justify-center transition-colors">
                <div className="relative">
                    <div className="animate-spin rounded-full h-32 w-32 border-4 border-slate-200 dark:border-zinc-600"></div>
                    <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-sky-500 dark:border-cyan-400 absolute top-0"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-teal-500 dark:bg-stone-400 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:from-stone-950 dark:via-cyan-950 dark:to-zinc-900 flex items-center justify-center transition-colors">
                <div className="text-center p-8 liquid-card max-w-md">
                    <h2 className="text-2xl font-bold text-sky-600 dark:text-cyan-400 mb-4">
                        Error Loading Data
                    </h2>
                    <p className="text-slate-600 dark:text-zinc-300 mb-6">
                        {error}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gradient-to-r from-sky-500 to-teal-600 dark:from-cyan-800 dark:to-stone-800 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-l dark:from-stone-950 dark:via-cyan-950 dark:to-zinc-900 transition-colors">
            <Navigation
                userName={user?.name || 'Ilia'}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                scrollToSection={scrollToSection}
            />
            <Hero user={user} />
            <About user={user} />
            <Skills />
            <Projects repos={repos} />
            <Contact user={user} />
            {/* Footer */}
            <footer className="bg-white/50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-700 py-6 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-slate-600 dark:text-cyan-400 transition-colors">
                            © {new Date().getFullYear()} {user?.name || 'Ilia'}
                            . Built with React, TypeScript, Tailwind CSS & ❤️
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
