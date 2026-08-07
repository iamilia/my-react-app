import {
    IconBrandGithub,
    IconStar,
    IconGitFork,
    IconArrowUpRight,
} from '@tabler/icons-react';
import type { GitHubRepo } from '../types/github';
import { useTranslation } from 'react-i18next';
import { useReveal } from '../hooks/useReveal';
import { SectionHeading } from './SectionHeading';

interface ProjectsProps {
    repos: GitHubRepo[];
}

const LANGUAGE_COLORS: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    'C#': '#178600',
    C: '#555555',
    Go: '#00ADD8',
    Rust: '#dea584',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Scala: '#c22d40',
    Shell: '#89e051',
    HTML: '#e34c26',
    CSS: '#563d7c',
    SCSS: '#c6538c',
    Vue: '#41b883',
    Lua: '#000080',
    Haskell: '#5e5086',
    Elixir: '#6e4a7e',
    Erlang: '#B83998',
    PowerShell: '#012456',
    Dockerfile: '#384d54',
    Makefile: '#427819',
    Assembly: '#6E4C13',
    Batchfile: '#C1F12E',
};

const langColor = (language: string) => LANGUAGE_COLORS[language] || '#8b8589';

export const Projects = ({ repos }: ProjectsProps) => {
    const { t } = useTranslation();
    const ref = useReveal<HTMLElement>();

    return (
        <section
            ref={ref}
            id="projects"
            className="scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8"
        >
            <div className="mx-auto max-w-6xl">
                <SectionHeading
                    index="03"
                    label={t('navigation.projects')}
                    title={t('projects.title')}
                    subtitle={t('projects.subtitle')}
                />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {repos.map((repo, i) => (
                        <a
                            key={repo.id}
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="panel panel-hover panel-glow group flex flex-col p-6 reveal"
                            data-delay={(i % 3) * 80}
                        >
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <h3 className="force-mono font-mono text-base font-semibold tracking-tight transition-colors duration-300 group-hover:text-[var(--accent)] sm:text-lg" dir="ltr">
                                    {repo.name}
                                </h3>
                                <IconArrowUpRight
                                    size={18}
                                    className="text-muted shrink-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)] rtl:-scale-x-100"
                                />
                            </div>

                            <p className="text-muted line-clamp-3 min-h-[3.9rem] text-sm leading-relaxed">
                                {repo.description || t('projects.noDescription')}
                            </p>

                            <hr className="my-5 border-0 border-t border-[var(--line)]" />

                            <div className="mt-auto flex items-center justify-between font-mono text-xs">
                                {repo.language ? (
                                    <span className="flex items-center gap-2">
                                        <span
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{
                                                backgroundColor: langColor(
                                                    repo.language
                                                ),
                                                boxShadow: `0 0 10px ${langColor(repo.language)}80`,
                                            }}
                                        />
                                        {repo.language}
                                    </span>
                                ) : (
                                    <span />
                                )}
                                <span className="text-muted flex items-center gap-4">
                                    <span className="flex items-center gap-1.5">
                                        <IconStar size={14} />
                                        {repo.stargazers_count}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <IconGitFork size={14} />
                                        {repo.forks_count}
                                    </span>
                                </span>
                            </div>
                        </a>
                    ))}
                </div>

                <div className="reveal mt-12 text-center" data-delay="100">
                    <a
                        href="https://github.com/iamilia?tab=repositories"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost text-sm sm:text-base"
                    >
                        <IconBrandGithub size={18} />
                        {t('projects.viewAllProjects')}
                    </a>
                </div>
            </div>
        </section>
    );
};
