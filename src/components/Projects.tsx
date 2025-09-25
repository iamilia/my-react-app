import { IconBrandGithub, IconStar, IconGitFork, IconExternalLink } from '@tabler/icons-react';
import type { GitHubRepo } from '../types/github';

interface ProjectsProps {
    repos: GitHubRepo[];
}

const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
        JavaScript: 'bg-yellow-400',
        TypeScript: 'bg-blue-500',
        Python: 'bg-green-500',
        Java: 'bg-red-600',
        'C++': 'bg-purple-600',
        'C#': 'bg-green-700',
        C: 'bg-gray-700',
        Go: 'bg-cyan-500',
        Rust: 'bg-orange-600',
        PHP: 'bg-indigo-500',
        Ruby: 'bg-red-400',
        Swift: 'bg-orange-400',
        Kotlin: 'bg-purple-400',
        Dart: 'bg-sky-400',
        Scala: 'bg-red-700',
        Shell: 'bg-gray-400',
        HTML: 'bg-orange-500',
        CSS: 'bg-blue-400',
        Vue: 'bg-green-400',
        React: 'bg-cyan-400',
        ObjectiveC: 'bg-blue-800',
        ObjectiveCPlusPlus: 'bg-blue-900',
        Perl: 'bg-pink-400',
        R: 'bg-blue-300',
        Lua: 'bg-indigo-400',
        Haskell: 'bg-violet-700',
        Elixir: 'bg-purple-700',
        Erlang: 'bg-red-700',
        DartLang: 'bg-sky-400',
        PowerShell: 'bg-blue-800',
        Groovy: 'bg-pink-700',
        CoffeeScript: 'bg-yellow-700',
        Assembly: 'bg-gray-600',
        Makefile: 'bg-gray-500',
        Dockerfile: 'bg-blue-300',
        TeX: 'bg-green-800',
        MATLAB: 'bg-yellow-600',
        Julia: 'bg-purple-400',
        FSharp: 'bg-green-600',
        VisualBasic: 'bg-blue-700',
        Fortran: 'bg-orange-700',
        Crystal: 'bg-cyan-700',
        Nim: 'bg-yellow-500',
        Elm: 'bg-green-600',
        Batchfile: 'bg-gray-500',
    };
    return colors[language] || 'bg-gray-500';
};

export const Projects = ({ repos }: ProjectsProps) => {
    return (
        <section id="projects" className="py-20 bg-white/50 dark:bg-stone-950/10 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-cyan-300 mb-4 transition-colors">Recent Projects</h2>
                    <p className="text-lg sm:text-xl text-slate-600 dark:text-zinc-400 transition-colors">Some of my latest work on GitHub</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {repos.map((repo) => (
                        <div
                            key={repo.id}
                            className="group liquid-card p-6 sm:p-8 flex flex-col justify-between hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-cyan-300 group-hover:text-sky-500 dark:group-hover:text-zinc-300 transition-colors">
                                        {repo.name}
                                    </h3>
                                    <a
                                        href={repo.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-slate-400 dark:text-zinc-500 hover:text-sky-500 dark:hover:text-cyan-300 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg"
                                    >
                                        <IconExternalLink size={20} />
                                    </a>
                                </div>
                                <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 mb-6 line-clamp-3 leading-relaxed">
                                    {repo.description || 'No description available'}
                                </p>
                            </div>
                            <div className="mt-auto">
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <div className="flex items-center space-x-4">
                                        {repo.language && (
                                            <span className="flex items-center space-x-2">
                                                <div
                                                    className={`w-3 h-3 sm:w-4 sm:h-4 ${getLanguageColor(
                                                        repo.language
                                                    )} rounded-full shadow-sm`}
                                                ></div>
                                                <span className="text-slate-700 dark:text-cyan-300 font-medium">
                                                    {repo.language}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-3 sm:space-x-4 text-slate-500 dark:text-zinc-400">
                                        <span className="flex items-center space-x-1">
                                            <IconStar size={14} />
                                            <span>{repo.stargazers_count}</span>
                                        </span>
                                        <span className="flex items-center space-x-1">
                                            <IconGitFork size={14} />
                                            <span>{repo.forks_count}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-16">
                    <a
                        href="https://github.com/iamilia?tab=repositories"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 liquid-button text-white rounded-2xl hover:shadow-xl transition-all duration-500 hover:-translate-y-1 text-base sm:text-lg font-semibold"
                    >
                        <IconBrandGithub size={20} className="mr-3" />
                        View All Projects
                    </a>
                </div>
            </div>
        </section>
    );
};