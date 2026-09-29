import type { GitHubUser } from '../types/github';
import { useTranslation } from 'react-i18next';
import { useNumbers } from '../hooks/useNumbers';
import { SectionHeading } from './SectionHeading';
import { Window } from './Window';

interface AboutProps {
    user: GitHubUser | null;
}

const PILLARS = ['development', 'experience', 'collaboration'] as const;

export const About = ({ user }: AboutProps) => {
    const { t } = useTranslation();
    const n = useNumbers();

    const stats = [
        { value: user?.public_repos, label: t('about.publicRepos') },
        { value: user?.followers, label: t('about.githubFollowers') },
        { value: user?.following, label: t('about.following') },
    ];

    return (
        <section id="about" className="section scroll-mt-16">
            <div className="wrap">
                <Window title={t('navigation.about')}>
                    <SectionHeading
                        title={t('about.title')}
                        subtitle={t('about.subtitle')}
                    />

                    <div className="grid gap-8 md:grid-cols-3 md:gap-10">
                        {PILLARS.map((key) => (
                            <article key={key}>
                                <hr className="rule-heavy" />
                                <h3 className="display display-md mt-4">
                                    {t(`about.${key}.title`)}
                                </h3>
                                <p className="prose-sm mt-2.5">
                                    {t(`about.${key}.description`)}
                                </p>
                            </article>
                        ))}
                    </div>

                    {/* The GitHub counters, set like a Get Info panel: one
                        framed box, three readings side by side. */}
                    <div className="mt-12 border-2 border-(--fg) sm:mt-16">
                        <p className="label label-ink border-b border-dotted border-(--fg) px-4 py-2 sm:px-5">
                            GitHub
                        </p>
                        <dl className="m-0 grid grid-cols-3">
                            {stats.map(({ value, label }, i) => (
                                // `dt` must come first in a `dl` group, so the
                                // figure is lifted above its label visually.
                                <div
                                    key={label}
                                    className={`flex flex-col-reverse justify-end gap-2 px-4 py-4 sm:px-5 sm:py-5 ${
                                        i > 0
                                            ? 'border-s border-dotted border-(--fg)'
                                            : ''
                                    }`}
                                >
                                    <dt className="label block text-[0.8125rem] sm:text-[0.9375rem]">
                                        {label}
                                    </dt>
                                    <dd className="display nums m-0 text-[clamp(2rem,8vw,3.5rem)] leading-none">
                                        {n(value)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </Window>
            </div>
        </section>
    );
};
