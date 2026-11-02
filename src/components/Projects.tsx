import {
    IconArrowUpRight,
    IconGitFork,
    IconRefresh,
    IconStar,
} from '@tabler/icons-react';
import {
    AnimatePresence,
    LayoutGroup,
    motion,
    useReducedMotion,
} from 'motion/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNumbers } from '../hooks/useNumbers';
import type { GitHubStatus } from '../store/githubStore';
import type { GitHubRepo } from '../types/github';
import {
    byRecentPush,
    languageColor,
    languageShares,
    ownRepos,
} from '../utils/languages';
import { EASE_OUT, Reveal, SEEN_MARGIN } from './Motion';
import { SectionHeading } from './SectionHeading';

interface ProjectsProps {
    no: number;
    repos: GitHubRepo[];
    status: GitHubStatus;
    error: string | null;
    onRetry: () => void;
    /** `null` = every language. Owned by Home so the hero can set it. */
    language: string | null;
    onLanguage: (language: string | null) => void;
}

/** Without a filter: the most recent few. With one: everything in it, capped. */
const SHOWN_ALL = 6;
const SHOWN_FILTERED = 9;

const isProfileReadme = (repo: GitHubRepo) =>
    repo.name.toLowerCase() === 'iamilia';

/**
 * My own public repositories. The language switcher is the page's one real
 * interaction: choose a line and the list re-routes, cards sliding to their
 * new places while the count is announced.
 */
export const Projects = ({
    no,
    repos,
    status,
    error,
    onRetry,
    language,
    onLanguage,
}: ProjectsProps) => {
    const { t, i18n } = useTranslation();
    const n = useNumbers();
    const reduce = useReducedMotion();

    const own = useMemo(
        () =>
            ownRepos(repos)
                .filter((r) => !isProfileReadme(r))
                .sort(byRecentPush),
        [repos]
    );
    const lines = useMemo(() => languageShares(repos), [repos]);

    const matching = language
        ? own.filter((r) => r.language === language)
        : own;
    const shown = matching.slice(0, language ? SHOWN_FILTERED : SHOWN_ALL);

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
    const options: (string | null)[] = [null, ...lines.map((l) => l.name)];

    return (
        <section id="projects" className="section scroll-mt-16">
            <div className="wrap">
                <div className="lined">
                    <SectionHeading
                        no={no}
                        title={t('projects.title')}
                        subtitle={t('projects.subtitle')}
                    />

                    {pending && (
                        <div className="max-w-xs" role="status">
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

                    {own.length > 0 && (
                        <div data-nsd-interaction="filter">
                            {/* ------------------------------ switcher */}
                            <Reveal>
                                <LayoutGroup id="lang-filter">
                                    <fieldset
                                        className="-mx-1 m-0 flex min-w-0 border-0 gap-1 overflow-x-auto px-1 pb-2 [scrollbar-width:none]"
                                        dir="ltr"
                                    >
                                        <legend className="sr-only">
                                            {t('projects.filterLabel')}
                                        </legend>
                                        {options.map((opt) => {
                                            const active = opt === language;
                                            return (
                                                <button
                                                    key={opt ?? 'all'}
                                                    type="button"
                                                    aria-pressed={active}
                                                    onClick={() =>
                                                        onLanguage(opt)
                                                    }
                                                    className={`relative isolate flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[0.9375rem] font-semibold transition-colors ${
                                                        active
                                                            ? 'text-(--on-accent)'
                                                            : 'text-muted hover:text-(--fg)'
                                                    }`}
                                                >
                                                    {active && (
                                                        <motion.span
                                                            layoutId="lang-pill"
                                                            className="absolute inset-0 -z-10 rounded-full bg-(--accent)"
                                                            transition={{
                                                                type: 'spring',
                                                                stiffness: 420,
                                                                damping: 34,
                                                            }}
                                                        />
                                                    )}
                                                    {opt && (
                                                        <span
                                                            className="lang-dot"
                                                            style={{
                                                                ['--c' as string]:
                                                                    languageColor(
                                                                        opt
                                                                    ),
                                                            }}
                                                        />
                                                    )}
                                                    {opt ?? t('projects.all')}
                                                </button>
                                            );
                                        })}
                                    </fieldset>
                                </LayoutGroup>
                            </Reveal>

                            <p
                                className="text-muted mt-4 text-sm"
                                aria-live="polite"
                            >
                                {t('projects.count', {
                                    shown: n(shown.length),
                                    total: n(matching.length),
                                })}
                            </p>

                            {/* --------------------------------- grid */}
                            <motion.ul
                                layout={!reduce}
                                className="m-0 mt-6 grid list-none gap-4 p-0 md:grid-cols-2 xl:grid-cols-3 xl:gap-5"
                            >
                                <AnimatePresence
                                    mode="popLayout"
                                    initial={false}
                                >
                                    {shown.map((repo, i) => {
                                        const pushed =
                                            repo.pushed_at || repo.updated_at;
                                        return (
                                            <motion.li
                                                key={repo.id}
                                                layout={!reduce}
                                                className="flex"
                                                initial={
                                                    reduce
                                                        ? false
                                                        : {
                                                              opacity: 0,
                                                              y: 32,
                                                              scale: 0.96,
                                                          }
                                                }
                                                whileInView={{
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: 1,
                                                }}
                                                viewport={{
                                                    once: true,
                                                    margin: SEEN_MARGIN,
                                                }}
                                                exit={
                                                    reduce
                                                        ? undefined
                                                        : {
                                                              opacity: 0,
                                                              scale: 0.94,
                                                              transition: {
                                                                  duration: 0.2,
                                                              },
                                                          }
                                                }
                                                transition={{
                                                    duration: 0.7,
                                                    ease: EASE_OUT,
                                                    delay: (i % 3) * 0.06,
                                                    layout: {
                                                        type: 'spring',
                                                        stiffness: 260,
                                                        damping: 30,
                                                    },
                                                }}
                                            >
                                                <motion.a
                                                    href={repo.html_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="card card-link group w-full p-5! md:p-6!"
                                                    dir="ltr"
                                                    whileHover={
                                                        reduce
                                                            ? undefined
                                                            : { y: -6 }
                                                    }
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 300,
                                                        damping: 20,
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <h3 className="min-w-0 text-[1.25rem] leading-tight font-bold tracking-tight break-words md:text-[1.375rem]">
                                                            {repo.name}
                                                        </h3>
                                                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-(--tint) text-(--fg-muted) transition-all duration-300 group-hover:rotate-45 group-hover:bg-(--accent) group-hover:text-(--on-accent)">
                                                            <IconArrowUpRight
                                                                size={18}
                                                                aria-hidden="true"
                                                            />
                                                        </span>
                                                    </div>

                                                    <p
                                                        className="prose-sm bidi-auto mt-3 line-clamp-3"
                                                        dir="auto"
                                                    >
                                                        {repo.description ||
                                                            t(
                                                                'projects.noDescription'
                                                            )}
                                                    </p>

                                                    {repo.topics &&
                                                        repo.topics.length >
                                                            0 && (
                                                            <ul className="m-0 mt-4 flex list-none flex-wrap gap-1.5 p-0">
                                                                {repo.topics
                                                                    .slice(0, 4)
                                                                    .map(
                                                                        (
                                                                            topic
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    topic
                                                                                }
                                                                                className="topic"
                                                                            >
                                                                                {
                                                                                    topic
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                            </ul>
                                                        )}

                                                    <div className="card-foot mono nums border-t border-(--line) mt-5! pt-4!">
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
                                                        {repo.stargazers_count >
                                                            0 && (
                                                            <span
                                                                className="flex items-center gap-1"
                                                                title={t(
                                                                    'projects.stars'
                                                                )}
                                                            >
                                                                <IconStar
                                                                    size={14}
                                                                    aria-hidden="true"
                                                                />
                                                                {
                                                                    repo.stargazers_count
                                                                }
                                                            </span>
                                                        )}
                                                        {repo.forks_count >
                                                            0 && (
                                                            <span
                                                                className="flex items-center gap-1"
                                                                title={t(
                                                                    'projects.forks'
                                                                )}
                                                            >
                                                                <IconGitFork
                                                                    size={14}
                                                                    aria-hidden="true"
                                                                />
                                                                {
                                                                    repo.forks_count
                                                                }
                                                            </span>
                                                        )}
                                                        {pushed && (
                                                            <span className="ms-auto">
                                                                {month.format(
                                                                    new Date(
                                                                        pushed
                                                                    )
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </motion.a>
                                            </motion.li>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.ul>

                            <p className="mt-10">
                                <a
                                    href="https://github.com/iamilia?tab=repositories"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-outline"
                                >
                                    {t('projects.viewAllProjects')}
                                    <IconArrowUpRight
                                        size={18}
                                        className="btn-arrow rtl:-scale-x-100"
                                        aria-hidden="true"
                                    />
                                </a>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
