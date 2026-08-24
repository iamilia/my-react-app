import { IconStar, IconGitFork, IconArrowUpRight } from '@tabler/icons-react';
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
    Lua: '#4b6bff',
    Haskell: '#5e5086',
    Elixir: '#6e4a7e',
    Erlang: '#B83998',
    PowerShell: '#519aba',
    Dockerfile: '#6fa2c9',
    Makefile: '#427819',
    Assembly: '#a08a4a',
    Batchfile: '#C1F12E',
};

const langColor = (language: string) => LANGUAGE_COLORS[language] || '#94a3b8';

export const Projects = ({ repos }: ProjectsProps) => {
    const { t } = useTranslation();
    const ref = useReveal<HTMLElement>();

    return (
        <section
            ref={ref}
            id="projects"
            className="section section-alt scroll-mt-16"
        >
            <div className="wrap">
                <SectionHeading
                    index={4}
                    label={t('navigation.projects')}
                    title={t('projects.title')}
                    subtitle={t('projects.subtitle')}
                />

                <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
                    {repos.map((repo, i) => (
                        <li
                            key={repo.id}
                            className="reveal-pop flex"
                            data-delay={(i % 3) * 60}
                        >
                            <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="card card-link group w-full"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h3
                                        className="force-mono min-w-0 text-[0.9375rem] font-bold tracking-tight wrap-break-word transition-colors duration-200 group-hover:text-(--accent)"
                                        dir="ltr"
                                    >
                                        {repo.name}
                                    </h3>
                                    <IconArrowUpRight
                                        size={16}
                                        className="text-muted mt-0.5 shrink-0 transition-colors duration-200 group-hover:text-(--accent) rtl:-scale-x-100"
                                    />
                                </div>

                                {/* Descriptions come from GitHub, so they may be
                                    English on a Persian page or the reverse —
                                    `dir="auto"` lets each one align itself. */}
                                <p
                                    className="prose-sm bidi-auto mt-2.5 line-clamp-3"
                                    dir="auto"
                                >
                                    {repo.description ||
                                        t('projects.noDescription')}
                                </p>

                                {/* Counts and the language name are Latin data:
                                    pinned LTR so the icon always leads, and
                                    pushed back to the reading edge so the
                                    strip still lines up with the card above. */}
                                <div
                                    className="card-foot ltr-run nums"
                                    dir="ltr"
                                >
                                    {repo.language && (
                                        <span className="flex min-w-0 items-center gap-1.5">
                                            <span
                                                className="h-2 w-2 shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor: langColor(
                                                        repo.language
                                                    ),
                                                }}
                                            />
                                            <span className="truncate">
                                                {repo.language}
                                            </span>
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        <IconStar size={13} />
                                        {repo.stargazers_count}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <IconGitFork size={13} />
                                        {repo.forks_count}
                                    </span>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="reveal mt-10" data-delay="80">
                    <a
                        href="https://github.com/iamilia?tab=repositories"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline"
                    >
                        {t('projects.viewAllProjects')}
                        <IconArrowUpRight
                            size={16}
                            className="rtl:-scale-x-100"
                        />
                    </a>
                </div>
            </div>
        </section>
    );
};
