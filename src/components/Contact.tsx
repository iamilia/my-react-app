import {
    IconMail,
    IconMapPin,
    IconBrandGithub,
    IconBrandTelegram,
    IconBrandDiscord,
    IconArrowUpRight,
} from '@tabler/icons-react';
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
            Icon: IconMail,
            external: false,
        },
        {
            title: t('contact.telegram'),
            value: '@org_ilia',
            href: 'https://t.me/org_ilia',
            Icon: IconBrandTelegram,
            external: true,
        },
        {
            title: t('contact.discordServer'),
            value: t('contact.joinServer'),
            href: 'https://discord.gg/kz6cSRrTdy',
            Icon: IconBrandDiscord,
            external: true,
        },
    ];

    return (
        <section
            ref={ref}
            id="contact"
            className="scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8"
        >
            <div className="mx-auto max-w-6xl">
                <SectionHeading
                    index="04"
                    label={t('navigation.contact')}
                    title={t('contact.title')}
                    subtitle={t('contact.subtitle')}
                />

                {/* Channels */}
                <div className="grid gap-4 md:grid-cols-3">
                    {channels.map(({ title, value, href, Icon, external }, i) => (
                        <a
                            key={title}
                            href={href}
                            target={external ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            className="panel panel-hover panel-glow reveal group flex items-center gap-4 p-6"
                            data-delay={i * 80}
                        >
                            <span className="border-[var(--line-strong)] bg-[var(--accent-soft)] text-accent inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border">
                                <Icon size={20} />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="text-muted block font-mono text-[0.66rem] tracking-[0.18em] uppercase">
                                    {title}
                                </span>
                                <span className="mt-1 block truncate text-sm font-medium transition-colors group-hover:text-[var(--accent)] sm:text-base">
                                    {value}
                                </span>
                            </span>
                            <IconArrowUpRight
                                size={17}
                                className="text-muted shrink-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)] rtl:-scale-x-100"
                            />
                        </a>
                    ))}
                </div>

                {/* CTA panel */}
                <div
                    className="panel reveal relative mt-5 overflow-hidden p-8 text-center sm:p-14"
                    data-delay="120"
                >
                    <div
                        className="pointer-events-none absolute inset-0 opacity-70"
                        style={{
                            background:
                                'radial-gradient(600px circle at 50% 0%, var(--accent-soft), transparent 60%)',
                        }}
                    />
                    <div className="relative">
                        <h3 className="display text-[clamp(1.5rem,4vw,2.5rem)]">
                            <span className="gradient-text">
                                {t('contact.readyToCollaborate')}
                            </span>
                        </h3>
                        <p className="text-muted mx-auto mt-4 max-w-2xl text-sm leading-relaxed sm:text-base">
                            {t('contact.collaborationText')}
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            <a
                                href="mailto:ilialotfi@outlook.com"
                                className="btn-neon text-sm sm:text-base"
                            >
                                <IconMail size={17} />
                                {t('contact.email')}
                            </a>
                            <a
                                href="https://github.com/iamilia"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-ghost text-sm sm:text-base"
                            >
                                <IconBrandGithub size={17} />
                                github.com/iamilia
                            </a>
                        </div>

                        {user?.location && (
                            <p className="text-muted mt-8 inline-flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.18em] uppercase">
                                <IconMapPin size={13} />
                                {user.location}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
