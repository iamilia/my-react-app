import {
    IconCode,
    IconBriefcase,
    IconUser,
    IconBook,
    IconUsers,
    IconHeart,
} from '@tabler/icons-react';
import type { GitHubUser } from '../types/github';
import { useTranslation } from 'react-i18next';
import { useReveal } from '../hooks/useReveal';
import { SectionHeading } from './SectionHeading';

interface AboutProps {
    user: GitHubUser | null;
}

export const About = ({ user }: AboutProps) => {
    const { t } = useTranslation();
    const ref = useReveal<HTMLElement>();

    const pillars = [
        { key: 'development', Icon: IconCode },
        { key: 'experience', Icon: IconBriefcase },
        { key: 'collaboration', Icon: IconUser },
    ] as const;

    const stats = [
        {
            value: user?.public_repos,
            label: t('about.publicRepos'),
            Icon: IconBook,
        },
        {
            value: user?.followers,
            label: t('about.githubFollowers'),
            Icon: IconUsers,
        },
        {
            value: user?.following,
            label: t('about.following'),
            Icon: IconHeart,
        },
    ];

    return (
        <section
            ref={ref}
            id="about"
            className="scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8"
        >
            <div className="mx-auto max-w-6xl">
                <SectionHeading
                    index="01"
                    label={t('navigation.about')}
                    title={t('about.title')}
                    subtitle={t('about.subtitle')}
                />

                {/* Pillars */}
                <div className="grid gap-5 md:grid-cols-3">
                    {pillars.map(({ key, Icon }, i) => (
                        <article
                            key={key}
                            className="panel panel-hover panel-glow reveal p-6 sm:p-7"
                            data-delay={i * 90}
                        >
                            <div className="mb-5 flex items-center justify-between">
                                <span className="border-(--line-strong) bg-(--accent-soft) text-accent inline-flex h-11 w-11 items-center justify-center rounded-xl border">
                                    <Icon size={21} />
                                </span>
                                <span className="text-muted font-mono text-xs opacity-50">
                                    0{i + 1}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold sm:text-xl">
                                {t(`about.${key}.title`)}
                            </h3>
                            <p className="text-muted mt-3 text-sm leading-relaxed">
                                {t(`about.${key}.description`)}
                            </p>
                        </article>
                    ))}
                </div>

                {/* Stats strip */}
                <div className="panel reveal mt-5 overflow-hidden" data-delay="120">
                    <div className="grid divide-y divide-(--line) sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        {stats.map(({ value, label, Icon }) => (
                            <div
                                key={label}
                                className="group flex items-center gap-4 px-6 py-7"
                            >
                                <Icon
                                    size={22}
                                    className="text-accent shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
                                />
                                <div>
                                    <div className="display glow-text text-3xl sm:text-4xl">
                                        {value ?? '—'}
                                    </div>
                                    <div className="text-muted mt-1 font-mono text-[0.68rem] tracking-[0.16em] uppercase">
                                        {label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
