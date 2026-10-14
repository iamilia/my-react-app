import { IconBrandGithub } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNumbers } from '../hooks/useNumbers';
import type { GitHubRepo, GitHubUser } from '../types/github';
import { languageShares } from '../utils/languages';

interface HeroProps {
    user: GitHubUser | null;
    repos: GitHubRepo[];
    scrollToSection: (id: string) => void;
}

/**
 * Who I am and what I write, in one sentence, and then the evidence for it:
 * how my own GitHub repositories split by language. The bar is the only
 * coloured thing on the page, and every colour in it is GitHub's own.
 */
export const Hero = ({ user, repos, scrollToSection }: HeroProps) => {
    const { t } = useTranslation();
    const n = useNumbers();

    const login = user?.login || 'iamilia';
    const shares = useMemo(() => languageShares(repos), [repos]);
    const counted = shares.reduce((sum, s) => sum + s.count, 0);
    const since = user?.created_at
        ? new Date(user.created_at).getFullYear()
        : null;

    return (
        <section className="pt-28 pb-14 sm:pt-36 sm:pb-20">
            <div className="wrap hero-in">
                <div className="flex items-center gap-4">
                    {user?.avatar_url && (
                        <img
                            src={user.avatar_url}
                            alt=""
                            loading="eager"
                            width={64}
                            height={64}
                            className="avatar w-14 shrink-0 sm:w-16"
                        />
                    )}
                    <div className="min-w-0">
                        <p className="text-lg font-semibold">
                            {t('hero.name')}
                        </p>
                        <a
                            href={`https://github.com/${login}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link inline-flex items-center gap-1.5 text-[0.9375rem]"
                            dir="ltr"
                        >
                            <IconBrandGithub size={15} />
                            {login}
                        </a>
                    </div>
                </div>

                <h1 className="display display-xl mt-8 max-w-[24ch] sm:mt-10">
                    {t('hero.headline')}
                </h1>

                <ul className="text-muted m-0 mt-5 flex list-none flex-wrap items-center gap-x-6 gap-y-2 p-0 text-[0.9375rem]">
                    <li className="flex items-center gap-2">
                        <span className="marker" />
                        {t('hero.available')}
                    </li>
                    {user?.location && (
                        <li className="bidi-auto" dir="auto">
                            {user.location}
                        </li>
                    )}
                    {since && (
                        <li>{t('hero.joined', { year: n(since, 'plain') })}</li>
                    )}
                </ul>

                <div className="mt-8 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => scrollToSection('work')}
                        className="btn"
                    >
                        {t('hero.ctaWork')}
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollToSection('contact')}
                        className="btn-outline"
                    >
                        {t('hero.ctaContact')}
                    </button>
                </div>

                {shares.length > 0 && (
                    <figure className="m-0 mt-14 max-w-xl sm:mt-16">
                        <div className="lang-bar" aria-hidden="true" dir="ltr">
                            {shares.map((s) => (
                                <span
                                    key={s.name}
                                    style={{
                                        ['--c' as string]: s.color,
                                        flexGrow: s.count,
                                    }}
                                />
                            ))}
                        </div>
                        <ul
                            className="m-0 mt-3 flex list-none flex-wrap gap-x-5 gap-y-1 p-0 text-sm"
                            dir="ltr"
                        >
                            {shares.map((s) => (
                                <li
                                    key={s.name}
                                    className="flex items-center gap-2"
                                >
                                    <span
                                        className="lang-dot"
                                        style={{ ['--c' as string]: s.color }}
                                    />
                                    <span className="font-medium">
                                        {s.name}
                                    </span>
                                    <span className="text-muted nums">
                                        {Math.round(s.share * 100)}%
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <figcaption className="prose-sm mt-2">
                            {t('hero.languagesCaption', { num: n(counted) })}
                        </figcaption>
                    </figure>
                )}
            </div>
        </section>
    );
};
