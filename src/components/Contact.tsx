import { IconArrowUpRight } from '@tabler/icons-react';
import type { GitHubUser } from '../types/github';
import { useTranslation } from 'react-i18next';
import { SectionHeading } from './SectionHeading';
import { Window } from './Window';

interface ContactProps {
    user: GitHubUser | null;
}

export const Contact = ({ user }: ContactProps) => {
    const { t } = useTranslation();

    const channels = [
        {
            title: t('contact.email'),
            value: 'ilialotfi@outlook.com',
            href: 'mailto:ilialotfi@outlook.com',
            external: false,
        },
        {
            title: t('contact.telegram'),
            value: '@org_ilia',
            href: 'https://t.me/org_ilia',
            external: true,
        },
        {
            title: t('contact.discordServer'),
            value: t('contact.joinServer'),
            href: 'https://discord.gg/kz6cSRrTdy',
            external: true,
        },
        {
            title: 'GitHub',
            value: 'github.com/iamilia',
            href: 'https://github.com/iamilia',
            external: true,
        },
    ];

    return (
        <section id="contact" className="section scroll-mt-16">
            <div className="wrap">
                <Window title={t('navigation.contact')}>
                    <SectionHeading
                        title={t('contact.title')}
                        subtitle={t('contact.subtitle')}
                    />

                    <div className="field">
                        {/* the ask, set in the margin where a standfirst would go */}
                        <div className="field-aside">
                            <p className="display display-md">
                                {t('contact.readyToCollaborate')}
                            </p>
                            <p className="prose-sm mt-3">
                                {t('contact.collaborationText')}
                            </p>
                            {user?.location && (
                                <p className="label bidi-auto mt-5" dir="auto">
                                    {user.location}
                                </p>
                            )}
                        </div>

                        <div className="field-body">
                            <ul className="m-0 list-none p-0">
                                {channels.map(
                                    ({ title, value, href, external }) => (
                                        <li key={title}>
                                            <a
                                                href={href}
                                                target={
                                                    external
                                                        ? '_blank'
                                                        : undefined
                                                }
                                                rel="noopener noreferrer"
                                                className="row row-link invert-on-hover flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:py-5"
                                            >
                                                <span className="label">
                                                    {title}
                                                </span>
                                                <span className="flex min-w-0 items-center gap-3">
                                                    <span
                                                        className="force-mono truncate text-[0.9375rem] sm:text-lg"
                                                        dir="ltr"
                                                    >
                                                        {value}
                                                    </span>
                                                    <IconArrowUpRight
                                                        size={16}
                                                        className="shrink-0 rtl:-scale-x-100"
                                                    />
                                                </span>
                                            </a>
                                        </li>
                                    )
                                )}
                            </ul>
                            <hr className="rule" />
                        </div>
                    </div>
                </Window>
            </div>
        </section>
    );
};
