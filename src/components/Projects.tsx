import {
    IconBook2,
    IconGitFork,
    IconRefresh,
    IconStar,
} from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { GitHubStatus } from '../store/githubStore';
import type { GitHubRepo } from '../types/github';
import { byRecentPush, languageColor, ownRepos } from '../utils/languages';
import { SectionHeading } from './SectionHeading';

interface ProjectsProps {
    repos: GitHubRepo[];
    status: GitHubStatus;
    error: string | null;
    onRetry: () => void;
}

/** How many of my own repositories to show. */
const SHOWN = 6;

/** The profile README repository is not a project. */
const isProfileReadme = (repo: GitHubRepo) =>
    repo.name.toLowerCase() === 'iamilia';

/**
 * My own public repositories, laid out the way GitHub lays out pinned
 * repositories — the same box, the same blue name, the same language dot —
 * so anyone arriving from GitHub reads it without thinking. Forks are left
 * out; they're other people's work.
 */
export const Projects = ({ repos, status, error, onRetry }: ProjectsProps) => {
    const { t, i18n } = useTranslation();

    const shown = useMemo(
        () =>
            ownRepos(repos)
                .filter((r) => !isProfileReadme(r))
                .sort(byRecentPush)
                .slice(0, SHOWN),
        [repos]
    );

    const month = useMemo(
        () =>
            new Intl.DateTimeFormat(
                i18n.language === 'fa' ? 'fa-IR' : 'en-GB',
                {
                    month: 'short',
                    year: 'numeric',
                }
            ),
        [i18n.language]
    );

    const pending = repos.length === 0 && status !== 'error';

    return (
        <section id="projects" className="section scroll-mt-16">
            <div className="wrap">
                <SectionHeading
                    title={t('projects.title')}
                    subtitle={t('projects.subtitle')}
                />

                {pending && (
                    <div className="max-w-xs" role="status">
                        <span className="label">{t('loading.loading')}</span>
                        <div className="loader-track mt-2">
                            <span className="loader-bar" />
                        </div>
                    </div>
                )}

                {status === 'error' && repos.length === 0 && (
                    <div className="max-w-md" role="alert">
                        <p className="font-semibold">
                            {t('loading.errorTitle')}
                        </p>
                        {error && <p className="prose-sm mt-1">{error}</p>}
                        <button
                            type="button"
                            onClick={onRetry}
                            className="btn-outline mt-4"
                        >
                            <IconRefresh size={16} />
                            {t('loading.tryAgain')}
                        </button>
                    </div>
                )}

                {shown.length > 0 && (
                    <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
                        {shown.map((repo) => {
                            const pushed = repo.pushed_at || repo.updated_at;
                            return (
                                <li key={repo.id} className="flex">
                                    <article className="card w-full" dir="ltr">
                                        <h3 className="flex min-w-0 items-center gap-2">
                                            <IconBook2
                                                size={16}
                                                className="text-muted shrink-0"
                                                aria-hidden="true"
                                            />
                                            <a
                                                href={repo.html_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="link truncate text-[0.9375rem] font-semibold"
                                            >
                                                {repo.name}
                                            </a>
                                        </h3>

                                        {/* Descriptions are whatever the
                                            repo says — may be English on a
                                            Persian page, or the reverse. */}
                                        <p
                                            className="prose-sm bidi-auto mt-2 line-clamp-3"
                                            dir="auto"
                                        >
                                            {repo.description ||
                                                t('projects.noDescription')}
                                        </p>

                                        {repo.topics &&
                                            repo.topics.length > 0 && (
                                                <ul className="m-0 mt-3 flex list-none flex-wrap gap-1.5 p-0">
                                                    {repo.topics
                                                        .slice(0, 5)
                                                        .map((topic) => (
                                                            <li key={topic}>
                                                                <a
                                                                    href={`https://github.com/topics/${topic}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="topic"
                                                                >
                                                                    {topic}
                                                                </a>
                                                            </li>
                                                        ))}
                                                </ul>
                                            )}

                                        <div className="card-foot nums">
                                            {repo.language && (
                                                <span className="flex items-center gap-1.5">
                                                    <span
                                                        className="lang-dot"
                                                        style={{
                                                            ['--c' as string]:
                                                                languageColor(
                                                                    repo.language
                                                                ),
                                                        }}
                                                    />
                                                    {repo.language}
                                                </span>
                                            )}
                                            {repo.stargazers_count > 0 && (
                                                <span
                                                    className="flex items-center gap-1"
                                                    title={t('projects.stars')}
                                                >
                                                    <IconStar size={14} />
                                                    {repo.stargazers_count}
                                                </span>
                                            )}
                                            {repo.forks_count > 0 && (
                                                <span
                                                    className="flex items-center gap-1"
                                                    title={t('projects.forks')}
                                                >
                                                    <IconGitFork size={14} />
                                                    {repo.forks_count}
                                                </span>
                                            )}
                                            {pushed && (
                                                <span
                                                    className="ms-auto"
                                                    dir="auto"
                                                >
                                                    {t('projects.updated', {
                                                        date: month.format(
                                                            new Date(pushed)
                                                        ),
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </article>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {repos.length > 0 && (
                    <p className="mt-8 text-[0.9375rem]">
                        <a
                            href="https://github.com/iamilia?tab=repositories"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link"
                        >
                            {t('projects.viewAllProjects')}
                        </a>
                    </p>
                )}
            </div>
        </section>
    );
};
