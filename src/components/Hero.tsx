import { IconArrowDown, IconBrandGithub } from '@tabler/icons-react';
import {
    motion,
    useReducedMotion,
    useScroll,
    useTransform,
} from 'motion/react';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNumbers } from '../hooks/useNumbers';
import type { GitHubRepo, GitHubUser } from '../types/github';
import { languageShares } from '../utils/languages';
import { EASE_OUT, SplitText } from './Motion';

interface HeroProps {
    user: GitHubUser | null;
    repos: GitHubRepo[];
    scrollToSection: (id: string) => void;
    /** Picking a language routes the project list to it. */
    onPickLanguage: (language: string) => void;
}

/**
 * The name as a poster, the one sentence of what I do, and the languages I
 * write in as the lines of a network: pick one and the repository list
 * re-routes to it. The route line starts at the ring under all of this.
 */
export const Hero = ({
    user,
    repos,
    scrollToSection,
    onPickLanguage,
}: HeroProps) => {
    const { t, i18n } = useTranslation();
    const n = useNumbers();
    const reduce = useReducedMotion();
    const ref = useRef<HTMLElement>(null);

    // The poster drifts up a little slower than the page as you leave.
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });
    const drift = useTransform(
        scrollYProgress,
        [0, 1],
        ['0%', reduce ? '0%' : '-18%']
    );
    const fade = useTransform(
        scrollYProgress,
        [0, 0.8],
        [1, reduce ? 1 : 0.25]
    );

    const login = user?.login || 'iamilia';
    const shares = useMemo(() => languageShares(repos), [repos]);
    const since = user?.created_at
        ? new Date(user.created_at).getFullYear()
        : null;
    // First name only: one word at poster scale.
    const name = t('navigation.userName');

    return (
        <section
            ref={ref}
            className="relative flex min-h-[100svh] flex-col pt-24 pb-10 md:pt-28 xl:pt-32"
        >
            <div className="wrap flex flex-1 flex-col">
                {/* ------------------------------------------ who, where */}
                <motion.div
                    className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[0.9375rem]"
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.1 }}
                >
                    {user?.avatar_url && (
                        <img
                            src={user.avatar_url}
                            alt=""
                            width={44}
                            height={44}
                            className="avatar w-11 shrink-0"
                        />
                    )}
                    <a
                        href={`https://github.com/${login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-1.5 font-semibold"
                        dir="ltr"
                    >
                        <IconBrandGithub size={17} aria-hidden="true" />
                        <span className="draw-line">{login}</span>
                    </a>
                    <span className="text-muted flex items-center gap-2">
                        <span className="marker" />
                        {t('hero.available')}
                    </span>
                    {user?.location && (
                        <span
                            className="text-muted hidden sm:inline"
                            dir="auto"
                        >
                            {user.location}
                        </span>
                    )}
                    {since && (
                        <span className="text-muted hidden md:inline">
                            {t('hero.joined', { year: n(since, 'plain') })}
                        </span>
                    )}
                </motion.div>

                {/* -------------------------- statement, lines, actions */}
                <div className="mt-10 grid flex-1 content-center gap-10 md:mt-14 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-12">
                    {/* ------------------------------------------- the poster */}
                    <motion.h1
                        className="poster lg:col-span-7 lg:row-span-2 lg:self-center"
                        style={{ y: drift, opacity: fade }}
                        aria-label={name}
                        key={i18n.language}
                    >
                        <SplitText text={name} immediate delay={0.15} />
                    </motion.h1>

                    <div className="lg:col-span-5 lg:col-start-8 lg:self-end">
                        <p className="display display-md max-w-[30ch] text-balance md:text-[1.75rem]! lg:text-[1.625rem]! 2xl:text-[2rem]!">
                            <SplitText
                                text={t('hero.headline')}
                                immediate
                                delay={0.55}
                                stagger={0.025}
                            />
                        </p>
                        <motion.div
                            className="mt-8 flex flex-wrap gap-3"
                            initial={reduce ? false : { opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.8,
                                ease: EASE_OUT,
                                delay: 1,
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => scrollToSection('projects')}
                                className="btn"
                            >
                                {t('hero.ctaWork')}
                                <IconArrowDown
                                    size={18}
                                    className="btn-arrow"
                                    aria-hidden="true"
                                />
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollToSection('contact')}
                                className="btn-outline"
                            >
                                {t('hero.ctaContact')}
                            </button>
                        </motion.div>
                    </div>

                    {shares.length > 0 && (
                        <motion.nav
                            aria-label={t('hero.lines')}
                            className="lg:col-span-5 lg:col-start-8 lg:self-start"
                            initial={reduce ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 1.1 }}
                        >
                            <p className="label label-ink">{t('hero.lines')}</p>
                            <p className="prose-sm mt-1">
                                {t('hero.linesHint')}
                            </p>
                            <ul className="m-0 mt-4 list-none p-0" dir="ltr">
                                {shares.slice(0, 5).map((s, i) => (
                                    <motion.li
                                        key={s.name}
                                        className="row"
                                        initial={
                                            reduce
                                                ? false
                                                : { opacity: 0, x: 24 }
                                        }
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.7,
                                            ease: EASE_OUT,
                                            delay: 1.15 + i * 0.07,
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onPickLanguage(s.name)
                                            }
                                            className="group flex min-h-12 w-full items-center gap-3 text-start"
                                        >
                                            <span
                                                className="lang-dot transition-transform duration-300 group-hover:scale-150"
                                                style={{
                                                    ['--c' as string]: s.color,
                                                }}
                                            />
                                            <span className="font-semibold">
                                                {s.name}
                                            </span>
                                            {/* the line's share of the network */}
                                            <span className="relative mx-2 h-[3px] flex-1 overflow-hidden rounded-full bg-(--tint-hover)">
                                                <motion.span
                                                    className="absolute inset-y-0 left-0 rounded-full"
                                                    style={{
                                                        background: s.color,
                                                    }}
                                                    initial={
                                                        reduce
                                                            ? false
                                                            : { width: 0 }
                                                    }
                                                    animate={{
                                                        width: `${Math.round(s.share * 100)}%`,
                                                    }}
                                                    transition={{
                                                        duration: 1.2,
                                                        ease: EASE_OUT,
                                                        delay: 1.3 + i * 0.07,
                                                    }}
                                                />
                                            </span>
                                            <span className="text-muted mono nums w-10 text-end text-sm">
                                                {Math.round(s.share * 100)}%
                                            </span>
                                        </button>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.nav>
                    )}
                </div>
            </div>

            {/* The ring the line starts at, on the far side from the rail. */}
            <div className="wrap mt-12 md:mt-16" aria-hidden="true">
                <div className="flex justify-end">
                    <span data-route-start className="size-0" />
                </div>
            </div>
        </section>
    );
};
