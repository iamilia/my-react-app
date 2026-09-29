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
import { Window } from './Window';

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

    const login = user?.login || 'iamilia';

    return (
        <section className="pt-18 pb-3.5 sm:pt-22 sm:pb-5 lg:pt-28 lg:pb-7">
            <div className="wrap">
                {/* Two windows on the desktop. On a phone they stack; from
                    `lg` the profile window is pulled up and over the edge of
                    the first, the way two open documents overlap. */}
                <div className="grid gap-6 lg:grid-cols-12 lg:gap-0">
                    <Window
                        zoom
                        title="iamilia.ir"
                        className="lg:col-span-8 lg:row-start-1"
                    >
                        <p className="flex items-center gap-2.5">
                            <span className="marker" />
                            <span className="label label-ink">
                                {t('hero.status')}
                            </span>
                        </p>

                        <p className="kicker mt-8 sm:mt-10">
                            {t('hero.greeting')}
                        </p>

                        {/* The name is Latin in both languages, so it keeps the
                            pixel face even on the Persian page. */}
                        <h1 className="display display-xl force-pixel mt-2">
                            {user?.name || 'Ilia'}
                        </h1>

                        {/* Each role gets a square pixel bullet, so the three
                            read as separate items when they share a line. */}
                        <ul className="display-md display m-0 mt-5 flex list-none flex-wrap gap-x-6 gap-y-1 p-0 sm:mt-6">
                            {roles.map((role) => (
                                <li
                                    key={role}
                                    className="flex items-center gap-2.5 before:size-2 before:shrink-0 before:bg-current before:content-['']"
                                >
                                    {role}
                                </li>
                            ))}
                        </ul>

                        {/* The bio is whatever is on the GitHub profile —
                            usually English, even when the page is Persian.
                            `dir="auto"` lets it pick its own side. */}
                        {user?.bio && (
                            <p className="lede bidi-auto mt-5" dir="auto">
                                {user.bio}
                            </p>
                        )}

                        <div className="mt-8 flex flex-col items-stretch gap-4 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center">
                            <button
                                type="button"
                                onClick={() => scrollToSection('work')}
                                className="btn"
                            >
                                {t('hero.ctaWork')}
                                <IconArrowDown size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollToSection('contact')}
                                className="btn-outline"
                            >
                                {t('hero.ctaContact')}
                            </button>
                        </div>
                    </Window>

                    {/* The whole profile is Latin content — a handle, a year,
                        four service names — so it is pinned LTR end to end. */}
                    <Window
                        title={`@${login}`}
                        dir="ltr"
                        className="z-10 self-start lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:-ms-10 lg:mt-24"
                        bodyClassName="p-5! sm:p-6!"
                    >
                        <div className="flex items-center gap-4">
                            {user?.avatar_url && (
                                <img
                                    src={user.avatar_url}
                                    alt={user.name || 'Ilia'}
                                    loading="eager"
                                    width={88}
                                    height={88}
                                    className="avatar w-20 shrink-0 sm:w-22"
                                />
                            )}

                            <div className="min-w-0">
                                <p className="force-mono truncate text-[0.9375rem] font-bold">
                                    @{login}
                                </p>

                                {/* the one field a user could write in
                                    Persian, so it still decides for itself */}
                                {user?.location && (
                                    <p
                                        className="text-muted bidi-auto mt-1.5 flex items-center gap-1.5 text-sm"
                                        dir="auto"
                                    >
                                        <IconMapPin
                                            size={14}
                                            className="shrink-0"
                                        />
                                        <span className="truncate">
                                            {user.location}
                                        </span>
                                    </p>
                                )}

                                {user?.created_at && (
                                    <p className="text-muted nums mt-0.5 flex items-center gap-1.5 text-sm">
                                        <IconCalendar
                                            size={14}
                                            className="shrink-0"
                                        />
                                        {new Date(
                                            user.created_at
                                        ).getFullYear()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <ul className="m-0 mt-5 list-none p-0">
                            {links.map(({ href, label, Icon }) => (
                                <li key={label} className="row">
                                    <a
                                        href={href}
                                        target={
                                            href.startsWith('mailto')
                                                ? undefined
                                                : '_blank'
                                        }
                                        rel="noopener noreferrer"
                                        className="invert-on-hover -mx-2 flex min-h-11 items-center gap-3 px-2 text-[0.9375rem]"
                                    >
                                        <Icon size={17} className="shrink-0" />
                                        <span className="flex-1">{label}</span>
                                        <IconArrowUpRight
                                            size={15}
                                            className="shrink-0"
                                        />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Window>
                </div>
            </div>
        </section>
    );
};
