import {
    IconArrowDown,
    IconArrowUpRight,
    IconBrandGithub,
    IconBrandTelegram,
    IconBrandTwitter,
    IconCalendar,
    IconMail,
    IconMapPin,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GitHubUser } from '../types/github';
import { PixelMark } from './PixelMark';
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

/**
 * Types each role out, holds it, rubs it back out, moves to the next.
 * Under reduced motion it just returns all of them at once.
 */
const useTypewriter = (words: string[]) => {
    const [text, setText] = useState('');

    useEffect(() => {
        if (words.length === 0) return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            setText(words.join(' · '));
            return;
        }
        let i = 0;
        let len = 0;
        let deleting = false;
        let timer: ReturnType<typeof setTimeout>;

        const tick = () => {
            if (!deleting && len === words[i].length) {
                deleting = true;
                timer = setTimeout(tick, 1700);
                return;
            }
            if (deleting && len === 0) {
                deleting = false;
                i = (i + 1) % words.length;
            }
            len += deleting ? -1 : 1;
            setText(words[i].slice(0, len));
            timer = setTimeout(tick, deleting ? 32 : 70 + Math.random() * 60);
        };

        tick();
        return () => clearTimeout(timer);
    }, [words]);

    return text;
};

export const Hero = ({ user, scrollToSection }: HeroProps) => {
    const { t } = useTranslation();

    const roles = useMemo(() => {
        const value = t('hero.roles', { returnObjects: true });
        return Array.isArray(value) ? (value as string[]) : [];
    }, [t]);

    const typed = useTypewriter(roles);
    const name = user?.name || 'Ilia';

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
                        title="iamilia.ir"
                        className="lg:col-span-8 lg:row-start-1"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <p className="flex items-center gap-2.5">
                                <span className="marker" />
                                <span className="label label-ink">
                                    {t('hero.status')}
                                </span>
                            </p>
                            {/* It watches the pointer and blinks — the page
                                looking back at whoever opened it. */}
                            <PixelMark
                                className="hero-face lg:me-10"
                                size={72}
                            />
                        </div>

                        <p className="kicker mt-2 sm:mt-4">
                            {t('hero.greeting')}
                        </p>

                        {/* The name is Latin in both languages, so it keeps the
                            pixel face even on the Persian page. Each letter
                            inverts under the pointer and flips back a beat
                            later, so a sweep across it leaves a trail. */}
                        <h1
                            className="display display-xl force-pixel mt-2"
                            aria-label={name}
                        >
                            {/* Latin, so its letters run left to right even
                                on the Persian page; the heading still sits
                                at the reading edge. */}
                            <span dir="ltr">
                                {name.split(' ').map((word) => (
                                    <span
                                        key={word}
                                        className="trail"
                                        aria-hidden="true"
                                    >
                                        {[...word].map((ch, i) => (
                                            // biome-ignore lint/suspicious/noArrayIndexKey: letters repeat; position is their identity
                                            <span key={i}>{ch}</span>
                                        ))}
                                    </span>
                                ))}
                            </span>
                        </h1>

                        {/* The roles type themselves out after a prompt. The
                            moving line is hidden from screen readers, which
                            get the plain list instead. */}
                        <p
                            className="display display-md mt-5 flex min-h-[1.2em] items-center gap-2 sm:mt-6"
                            aria-hidden="true"
                        >
                            <span>&gt;</span>
                            <span className="min-w-0 truncate">{typed}</span>
                            <span className="caret" />
                        </p>
                        <ul className="sr-only">
                            {roles.map((role) => (
                                <li key={role}>{role}</li>
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
