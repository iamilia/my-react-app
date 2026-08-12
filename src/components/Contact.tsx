import { IconArrowUpRight } from '@tabler/icons-react';
import type { GitHubUser } from '../types/github';
import { useTranslation } from 'react-i18next';
import { useReveal } from '../hooks/useReveal';
import { SectionHeading } from './SectionHeading';

interface ContactProps {
    user: GitHubUser | null;
}

export const Contact = ({ user }: ContactProps) => {
    const { t } = useTranslation();
    const ref = useReveal<HTMLElement>();

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
        <section ref={ref} id="contact" className="section scroll-mt-16">
            <div className="wrap">
                <SectionHeading
                    index={5}
                    label={t('navigation.contact')}
                    title={t('contact.title')}
                    subtitle={t('contact.subtitle')}
                />

                <div className="field">
                    {/* the ask, set in the margin where a standfirst would go */}
                    <div className="field-aside reveal">
                        <p className="display display-md">
                            {t('contact.readyToCollaborate')}
                        </p>
                        <p className="prose-sm mt-4">
                            {t('contact.collaborationText')}
                        </p>
                        {user?.location && (
                            <p className="label mt-6">{user.location}</p>
                        )}
                    </div>

                    <div className="field-body">
                        <ul className="m-0 list-none p-0">
                            {channels.map(
                                ({ title, value, href, external }, i) => (
                                    <li
                                        key={title}
                                        className="reveal"
                                        data-delay={i * 50}
                                    >
                                        <a
                                            href={href}
                                            target={
                                                external ? '_blank' : undefined
                                            }
                                            rel="noopener noreferrer"
                                            className="row row-link group flex flex-col gap-1.5 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:py-6"
                                        >
                                            <span className="label">
                                                {title}
                                            </span>
                                            <span className="flex min-w-0 items-baseline gap-4">
                                                <span
                                                    className="force-mono truncate text-[0.9375rem] transition-colors duration-200 group-hover:text-(--accent) sm:text-lg"
                                                    dir="ltr"
                                                >
                                                    {value}
                                                </span>
                                                <IconArrowUpRight
                                                    size={16}
                                                    className="text-muted shrink-0 transition-colors duration-200 group-hover:text-(--accent) rtl:-scale-x-100"
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
            </div>
        </section>
    );
};
