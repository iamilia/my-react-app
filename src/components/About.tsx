import type { GitHubUser } from '../types/github';
import { useTranslation } from 'react-i18next';
import { useReveal } from '../hooks/useReveal';
import { useNumbers } from '../hooks/useNumbers';
import { SectionHeading } from './SectionHeading';

interface AboutProps {
    user: GitHubUser | null;
}

const PILLARS = ['development', 'experience', 'collaboration'] as const;

export const About = ({ user }: AboutProps) => {
    const { t } = useTranslation();
    const ref = useReveal<HTMLElement>();
    const n = useNumbers();

    const stats = [
        { value: user?.public_repos, label: t('about.publicRepos') },
        { value: user?.followers, label: t('about.githubFollowers') },
        { value: user?.following, label: t('about.following') },
    ];

    return (
        <section ref={ref} id="about" className="section scroll-mt-16">
            <div className="wrap">
                <SectionHeading
                    index={1}
                    label={t('navigation.about')}
                    title={t('about.title')}
                    subtitle={t('about.subtitle')}
                />

                {/* ------------------------- pillars ------------------------- */}
                <div className="field">
                    <div className="field-body">
                        <div className="grid gap-8 sm:gap-x-8 sm:gap-y-10 md:grid-cols-3">
                            {PILLARS.map((key, i) => (
                                <article
                                    key={key}
                                    className="reveal"
                                    data-delay={i * 70}
                                >
                                    <hr className="rule-ink" />
                                    <span className="folio nums mt-3 block">
                                        {n(i + 1, 'padded')}
                                    </span>
                                    <h3 className="display display-md mt-2">
                                        {t(`about.${key}.title`)}
                                    </h3>
                                    <p className="prose-sm mt-3">
                                        {t(`about.${key}.description`)}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>

                {/* -------------------------- figures ------------------------- */}
                <div className="field mt-14 lg:mt-24">
                    <div className="field-aside reveal">
                        <span className="label">GitHub</span>
                    </div>

                    <div className="field-body">
                        <div className="grid grid-cols-3 gap-4 sm:gap-10">
                            {stats.map(({ value, label }, i) => (
                                <div
                                    key={label}
                                    className="reveal"
                                    data-delay={i * 60}
                                >
                                    <hr className="rule-ink" />
                                    <div className="display nums mt-3 text-[clamp(2.25rem,9vw,4rem)]">
                                        {n(value)}
                                    </div>
                                    <div className="label mt-1 block">
                                        {label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
