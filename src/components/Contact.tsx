import { IconArrowUpRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { GitHubUser } from '../types/github';
import { Reveal } from './Motion';
import { SectionHeading } from './SectionHeading';

interface ContactProps {
    no: number;
    user: GitHubUser | null;
}

const EMAIL = 'ilialotfi@outlook.com';

/**
 * The terminus. The address is set at poster scale because writing to it is
 * the whole point of the page; the other channels follow as rows.
 */
export const Contact = ({ no, user }: ContactProps) => {
    const { t } = useTranslation();

    const channels = [
        {
            title: t('contact.telegram'),
            value: '@org_ilia',
            href: 'https://t.me/org_ilia',
        },
        {
            title: t('contact.discordServer'),
            value: t('contact.joinServer'),
            href: 'https://discord.gg/kz6cSRrTdy',
        },
        {
            title: 'GitHub',
            value: 'github.com/iamilia',
            href: 'https://github.com/iamilia',
        },
    ];

    return (
        <section id="contact" className="section scroll-mt-16 pb-24! md:pb-32!">
            <div className="wrap">
                <div className="lined">
                    <SectionHeading
                        no={no}
                        title={t('contact.title')}
                        subtitle={t('contact.subtitle')}
                    />

                    <Reveal>
                        <p className="label block">{t('contact.lead')}</p>
                        <a
                            href={`mailto:${EMAIL}`}
                            className="group mt-2 inline-flex max-w-full items-center gap-3 text-[clamp(1.5rem,6.2vw,5.5rem)] leading-[1.05] font-extrabold tracking-[-0.045em] break-all text-(--color-text-link) md:gap-5"
                            dir="ltr"
                        >
                            <span className="draw-line">{EMAIL}</span>
                            <IconArrowUpRight
                                aria-hidden="true"
                                className="size-[0.7em] shrink-0 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-45"
                            />
                        </a>
                    </Reveal>

                    <ul className="m-0 mt-14 grid list-none gap-0 p-0 md:mt-20 md:grid-cols-3 md:gap-6">
                        {channels.map(({ title, value, href }, i) => (
                            <Reveal as="li" key={title} delay={i * 0.08}>
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="row group flex items-baseline justify-between gap-4 py-5 md:flex-col md:items-start md:gap-1"
                                >
                                    <span className="text-muted text-[0.9375rem]">
                                        {title}
                                    </span>
                                    <span
                                        className="flex items-center gap-1.5 text-lg font-bold md:text-xl"
                                        dir="ltr"
                                    >
                                        <span className="draw-line">
                                            {value}
                                        </span>
                                        <IconArrowUpRight
                                            size={18}
                                            aria-hidden="true"
                                            className="text-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                        />
                                    </span>
                                </a>
                            </Reveal>
                        ))}
                    </ul>

                    {user?.location && (
                        <p className="prose-sm mt-10 bidi-auto" dir="auto">
                            {t('contact.where', { place: user.location })}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};
