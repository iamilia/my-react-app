import {
    IconStar,
    IconGitFork,
    IconArrowUpRight,
    IconRefresh,
} from '@tabler/icons-react';
import type { GitHubRepo } from '../types/github';
import type { GitHubStatus } from '../store/githubStore';
import { useTranslation } from 'react-i18next';
import { SectionHeading } from './SectionHeading';
import { Window } from './Window';

interface ProjectsProps {
    repos: GitHubRepo[];
    status: GitHubStatus;
    error: string | null;
    onRetry: () => void;
}

/**
 * The only part of the page that needs the GitHub fetch to have landed, so
 * it is also the only part that shows a loading or error state — the rest
 * of the page, headline included, renders on first paint.
 */
export const Projects = ({ repos, status, error, onRetry }: ProjectsProps) => {
    const { t } = useTranslation();

    const pending = repos.length === 0 && status !== 'error';

    return (
        <section id="projects" className="section scroll-mt-16">
            <div className="wrap">
                <Window title={t('navigation.projects')}>
                    <SectionHeading
                        title={t('projects.title')}
                        subtitle={t('projects.subtitle')}
                    />

                    {pending && (
                        <div className="max-w-sm" role="status">
                            <span className="label">
                                {t('loading.loading')}
                            </span>
                            <div className="loader-track mt-2">
                                <span className="loader-bar" />
                            </div>
                        </div>
                    )}

                    {status === 'error' && repos.length === 0 && (
                        <div className="max-w-md" role="alert">
                            <p className="label label-ink">
                                {t('loading.errorTitle')}
                            </p>
                            {error && <p className="prose-sm mt-1">{error}</p>}
                            <button
                                type="button"
                                onClick={onRetry}
                                className="btn-outline mt-5"
                            >
                                <IconRefresh size={16} />
                                {t('loading.tryAgain')}
                            </button>
                        </div>
                    )}

                    {repos.length > 0 && (
                        <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
                            {repos.map((repo) => (
                                <li key={repo.id} className="flex">
                                    <a
                                        href={repo.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="card card-link invert-on-hover w-full"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <h3
                                                className="force-mono min-w-0 text-[0.9375rem] font-bold wrap-break-word"
                                                dir="ltr"
                                            >
                                                {repo.name}
                                            </h3>
                                            <IconArrowUpRight
                                                size={16}
                                                className="mt-0.5 shrink-0 rtl:-scale-x-100"
                                            />
                                        </div>

                                        {/* Descriptions come from GitHub, so they
                                            may be English on a Persian page or
                                            the reverse — `dir="auto"` lets each
                                            one align itself. */}
                                        <p
                                            className="prose-sm bidi-auto mt-2 line-clamp-3"
                                            dir="auto"
                                        >
                                            {repo.description ||
                                                t('projects.noDescription')}
                                        </p>

                                        <div
                                            className="card-foot ltr-run nums"
                                            dir="ltr"
                                        >
                                            {repo.language && (
                                                <span className="truncate">
                                                    {repo.language}
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
                    )}

                    <div className="mt-10">
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
                </Window>
            </div>
        </section>
    );
};
