import { useTranslation } from 'react-i18next';
import { useNumbers } from '../hooks/useNumbers';
import type { GitHubUser } from '../types/github';
import { SectionHeading } from './SectionHeading';

interface AboutProps {
    user: GitHubUser | null;
}

/**
 * A few plain paragraphs about what I've actually built, next to the
 * figures GitHub has for the account. No adjectives that can't be checked.
 */
export const About = ({ user }: AboutProps) => {
    const { t } = useTranslation();
    const n = useNumbers();

    const facts = [
        {
            label: t('about.since'),
            value: user?.created_at
                ? n(new Date(user.created_at).getFullYear(), 'plain')
                : null,
        },
        { label: t('about.publicRepos'), value: n(user?.public_repos) },
        { label: t('about.githubFollowers'), value: n(user?.followers) },
    ];

    return (
        <section id="about" className="section scroll-mt-16">
            <div className="wrap">
                <SectionHeading title={t('about.title')} />

                <div className="field">
                    <div className="field-body max-w-[62ch] lg:order-2">
                        <p className="text-[1.0625rem] leading-relaxed">
                            {t('about.body1')}
                        </p>
                        <p className="text-muted mt-4 text-[1.0625rem] leading-relaxed">
                            {t('about.body2')}
                        </p>
                    </div>

                    <dl className="field-aside m-0 lg:order-1">
                        {facts.map(({ label, value }) => (
                            <div
                                key={label}
                                className="row flex items-baseline justify-between gap-4 py-3"
                            >
                                <dt className="text-muted text-[0.9375rem]">
                                    {label}
                                </dt>
                                <dd className="nums m-0 font-semibold">
                                    {value ?? '—'}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
};
