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

                    <ul className="m-0 max-w-2xl list-none p-0">
                        {channels.map(({ title, value, href, external }) => (
                            <li key={title}>
                                <a
                                    href={href}
                                    target={external ? '_blank' : undefined}
                                    rel="noopener noreferrer"
                                    className="row row-link invert-on-hover flex flex-col gap-0.5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                                >
                                    <span className="text-muted text-[0.9375rem]">
                                        {title}
                                    </span>
                                    <span
                                        className="row-title max-w-full self-start truncate text-[1.0625rem] transition-colors sm:self-auto"
                                        dir="ltr"
                                    >
                                        {value}
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                    {user?.location && (
                        <p className="prose-sm mt-6 bidi-auto" dir="auto">
                            {t('contact.where', { place: user.location })}
                        </p>
                    )}
                </Window>
            </div>
        </section>
    );
};
