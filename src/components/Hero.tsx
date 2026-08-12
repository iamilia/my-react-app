import {
    IconBrandGithub,
    IconBrandTwitter,
    IconMail,
    IconBrandTelegram,
    IconArrowDown,
    IconArrowUpRight,
    IconMapPin,
    IconCalendar,
} from '@tabler/icons-react';
import type { GitHubUser } from '../types/github';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { useReveal } from '../hooks/useReveal';

interface HeroProps {
    user: GitHubUser | null;
    scrollToSection: (id: string) => void;
}

const socials = [
    {
        href: 'https://github.com/iamilia',
        label: 'GitHub',
        Icon: IconBrandGithub,
    },
    {
        href: 'https://t.me/org_ilia',
        label: 'Telegram',
        Icon: IconBrandTelegram,
    },
    {
        href: 'mailto:ilialotfi@outlook.com',
        label: 'Email',
        Icon: IconMail,
    },
];

export const Hero = ({ user, scrollToSection }: HeroProps) => {
    const { t } = useTranslation();
    const ref = useReveal<HTMLElement>();

    /**
     * These used to cycle through a typewriter, then sat stacked in the
     * margin column where they ended up jammed against the viewport edge.
     * One line under the name is enough: it reads in a glance and stays part
     * of the same block as everything else.
     */
    const roles = useMemo(() => {
        const value = t('hero.roles', { returnObjects: true });
        return Array.isArray(value) ? (value as string[]) : [];
    }, [t]);

    const links = user?.twitter_username
        ? [
              ...socials,
              {
                  href: `https://twitter.com/${user.twitter_username}`,
                  label: 'Twitter',
                  Icon: IconBrandTwitter,
              },
          ]
        : socials;

    return (
        <section
            ref={ref}
            className="pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-28"
        >
            <div className="wrap">
                <p className="reveal flex items-center gap-2.5">
                    <span className="marker" />
                    <span className="label label-ink">{t('hero.status')}</span>
                </p>

                {/* Two columns that both carry weight: the statement on one
                    side, the profile card on the other. The old layout put a
                    cropped portrait opposite a one-word bio and left a dead
                    band between them. */}
                <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-7">
                        <p className="kicker reveal block" data-delay="60">
                            {t('hero.greeting')}
                        </p>

                        <h1
                            className="display display-xl reveal mt-2"
                            data-delay="90"
                        >
                            {user?.name || 'Ilia'}
                        </h1>

                        <p
                            className="display display-md reveal mt-5"
                            data-delay="130"
                        >
                            {roles.map((role, i) => (
                                <span key={role}>
                                    {i > 0 && (
                                        <span className="text-accent"> · </span>
                                    )}
                                    {role}
                                </span>
                            ))}
                        </p>

                        {/* The bio is whatever is on the GitHub profile —
                            usually English, even when the page is Persian.
                            `dir="auto"` lets it pick its own side. */}
                        {user?.bio && (
                            <p
                                className="lede bidi-auto reveal mt-5"
                                dir="auto"
                                data-delay="160"
                            >
                                {user.bio}
                            </p>
                        )}

                        <div
                            className="reveal mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
                            data-delay="190"
                        >
                            <button
                                onClick={() => scrollToSection('work')}
                                className="btn"
                            >
                                {t('hero.ctaWork')}
                                <IconArrowDown size={16} />
                            </button>
                            <button
                                onClick={() => scrollToSection('contact')}
                                className="btn-outline"
                            >
                                {t('hero.ctaContact')}
                            </button>
                        </div>
                    </div>

                    {/* ---------------------- profile card ---------------------- */}
                    <aside
                        className="reveal lg:col-span-4 lg:col-start-9"
                        data-delay="150"
                    >
                        {/* The whole card is Latin content — a GitHub handle,
                            a year, four service names — so it is pinned LTR
                            end to end. Half of it flipping with the page was
                            what put the avatar on the opposite side from the
                            link list underneath it. */}
                        <div className="card" dir="ltr">
                            <div className="flex items-start gap-4">
                                {user?.avatar_url && (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.name || 'Ilia'}
                                        loading="eager"
                                        width={96}
                                        height={96}
                                        className="avatar w-20 shrink-0 sm:w-24"
                                    />
                                )}

                                <div className="min-w-0 pt-0.5">
                                    <p className="force-mono truncate text-[0.9375rem] font-bold">
                                        @{user?.login || 'iamilia'}
                                    </p>

                                    {/* the one field a user could write in
                                        Persian, so it still decides for itself */}
                                    {user?.location && (
                                        <p
                                            className="text-muted bidi-auto mt-2 flex items-center gap-1.5 text-xs"
                                            dir="auto"
                                        >
                                            <IconMapPin
                                                size={13}
                                                className="shrink-0"
                                            />
                                            <span className="truncate">
                                                {user.location}
                                            </span>
                                        </p>
                                    )}

                                    {user?.created_at && (
                                        <p className="text-muted force-mono nums mt-1 flex items-center gap-1.5 text-xs">
                                            <IconCalendar
                                                size={13}
                                                className="shrink-0"
                                            />
                                            {new Date(
                                                user.created_at
                                            ).getFullYear()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <hr className="rule my-4" />

                            <ul className="m-0 list-none p-0">
                                {links.map(({ href, label, Icon }) => (
                                    <li key={label}>
                                        <a
                                            href={href}
                                            target={
                                                href.startsWith('mailto')
                                                    ? undefined
                                                    : '_blank'
                                            }
                                            rel="noopener noreferrer"
                                            className="text-muted group flex min-h-10 items-center gap-2.5 text-sm transition-colors hover:text-(--accent)"
                                        >
                                            <Icon size={16} className="shrink-0" />
                                            <span className="force-mono flex-1">
                                                {label}
                                            </span>
                                            <IconArrowUpRight
                                                size={14}
                                                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                            />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
};
