import {
    IconBrandGithub,
    IconBrandTwitter,
    IconMail,
    IconMapPin,
    IconCalendar,
    IconBrandTelegram,
    IconArrowDown,
} from '@tabler/icons-react';
import type { GitHubUser } from '../types/github';
import { TypeAnimation } from 'react-type-animation';
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
    const { t, i18n } = useTranslation();
    const ref = useReveal<HTMLElement>();

    const animationSequence = useMemo(
        () => [
            t('hero.animationSequence.0'),
            3000,
            t('hero.animationSequence.1'),
            3000,
            t('hero.animationSequence.2'),
            3000,
            t('hero.animationSequence.3'),
            3000,
            t('hero.animationSequence.4'),
            3000,
        ],
        [t]
    );

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
            className="relative flex min-h-[100svh] items-center px-4 pt-28 pb-16 sm:px-6 lg:px-8"
        >
            <div className="mx-auto w-full max-w-6xl">
                <div className="grid items-center gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
                    {/* Left — copy */}
                    <div className="text-center lg:text-start">
                        <p className="eyebrow reveal justify-center lg:justify-start">
                            {t('hero.status')}
                        </p>

                        <h1
                            className="display reveal mt-5 text-[clamp(2.75rem,9vw,5.5rem)]"
                            data-delay="80"
                        >
                            <span className="hero-greeting">
                                {t('hero.greeting')}
                            </span>
                            <span className="gradient-text glow-text block">
                                {user?.name || 'Ilia'}
                            </span>
                        </h1>

                        <TypeAnimation
                            key={i18n.language}
                            sequence={animationSequence}
                            wrapper="p"
                            cursor={true}
                            repeat={Infinity}
                            className="reveal text-muted mt-5 block text-lg font-light sm:text-xl lg:text-2xl"
                        />

                        {user?.bio && (
                            <p
                                className="text-muted reveal mx-auto mt-5 max-w-xl text-sm leading-relaxed sm:text-base lg:mx-0"
                                data-delay="120"
                            >
                                {user.bio}
                            </p>
                        )}

                        {/* CTAs */}
                        <div
                            className="reveal mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
                            data-delay="160"
                        >
                            <button
                                onClick={() => scrollToSection('projects')}
                                className="btn-neon text-sm sm:text-base"
                            >
                                {t('hero.ctaWork')}
                                <IconArrowDown size={17} />
                            </button>
                            <button
                                onClick={() => scrollToSection('contact')}
                                className="btn-ghost text-sm sm:text-base"
                            >
                                {t('hero.ctaContact')}
                            </button>
                        </div>

                        {/* Socials */}
                        <div
                            className="reveal mt-8 flex items-center justify-center gap-2.5 lg:justify-start"
                            data-delay="200"
                        >
                            {links.map(({ href, label, Icon }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target={
                                        href.startsWith('mailto')
                                            ? undefined
                                            : '_blank'
                                    }
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="icon-btn h-11 w-11"
                                >
                                    <Icon size={19} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Right — avatar + meta */}
                    <div className="reveal flex flex-col items-center gap-7" data-delay="120">
                        <div className="relative">
                            <span className="avatar-halo" />
                            <div className="avatar-ring h-40 w-40 sm:h-48 sm:w-48 lg:h-56 lg:w-56">
                                <img
                                    src={user?.avatar_url}
                                    alt={user?.name || 'Ilia'}
                                    loading="eager"
                                    className="h-full w-full rounded-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {user?.location && (
                                <span className="chip">
                                    <IconMapPin size={13} />
                                    {user.location}
                                </span>
                            )}
                            {user?.created_at && (
                                <span className="chip">
                                    <IconCalendar size={13} />
                                    {new Date(user.created_at).getFullYear()}
                                </span>
                            )}
                            <span className="chip">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                {t('hero.available')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Scroll cue */}
                <button
                    onClick={() => scrollToSection('about')}
                    className="text-muted mx-auto mt-16 hidden items-center gap-2 font-mono text-[0.68rem] tracking-[0.25em] uppercase transition-colors hover:text-[var(--accent)] lg:flex"
                >
                    {t('hero.scroll')}
                    <IconArrowDown size={14} className="animate-bounce" />
                </button>
            </div>
        </section>
    );
};
