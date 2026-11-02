import { useTranslation } from 'react-i18next';
import { useNumbers } from '../hooks/useNumbers';
import type { GitHubUser } from '../types/github';
import { CountUp, Reveal } from './Motion';
import { SectionHeading } from './SectionHeading';

interface AboutProps {
    no: number;
    user: GitHubUser | null;
}

/**
 * Two plain paragraphs at reading size, and the figures GitHub has for the
 * account set large enough to be the section's image. They count up once.
 */
export const About = ({ no, user }: AboutProps) => {
    const { t } = useTranslation();
    const n = useNumbers();

    const since = user?.created_at
        ? new Date(user.created_at).getFullYear()
        : null;
    const facts = [
        { label: t('about.since'), value: since, plain: true },
        {
            label: t('about.publicRepos'),
            value: user?.public_repos,
            plain: false,
        },
        {
            label: t('about.githubFollowers'),
            value: user?.followers,
            plain: false,
        },
    ];

    return (
        <section id="about" className="section scroll-mt-16">
            <div className="wrap">
                <div className="lined">
                    <SectionHeading no={no} title={t('about.title')} />

                    <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
                        <div className="lg:col-span-7">
                            <Reveal>
                                <p className="text-[clamp(1.25rem,2.2vw,1.75rem)] leading-[1.45] font-medium tracking-[-0.015em] text-pretty">
                                    {t('about.body1')}
                                </p>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <p className="text-muted mt-6 text-[clamp(1.0625rem,1.6vw,1.25rem)] leading-relaxed">
                                    {t('about.body2')}
                                </p>
                            </Reveal>
                        </div>

                        <dl className="m-0 grid grid-cols-3 gap-4 lg:col-span-4 lg:col-start-9 lg:grid-cols-1 lg:gap-8">
                            {facts.map(({ label, value, plain }, i) => (
                                <Reveal
                                    key={label}
                                    delay={i * 0.1}
                                    className="flex flex-col-reverse border-t border-(--line-strong) pt-3"
                                >
                                    <dt className="text-muted mt-2 text-sm">
                                        {label}
                                    </dt>
                                    <dd className="m-0 text-[clamp(2rem,6vw,4.5rem)] leading-none font-extrabold tracking-[-0.05em]">
                                        {plain ? (
                                            <span className="nums">
                                                {value
                                                    ? n(value, 'plain')
                                                    : '—'}
                                            </span>
                                        ) : (
                                            <CountUp
                                                value={value}
                                                format={(v) => n(v)}
                                            />
                                        )}
                                    </dd>
                                </Reveal>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
        </section>
    );
};
