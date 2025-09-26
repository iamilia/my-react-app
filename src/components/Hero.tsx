import {
    IconBrandGithub,
    IconBrandTwitter,
    IconMail,
    IconMapPin,
    IconCalendar,
    IconBrandTelegram,
} from '@tabler/icons-react';
import type { GitHubUser } from '../types/github';
import { TypeAnimation } from 'react-type-animation';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

interface HeroProps {
    user: GitHubUser | null;
}

export const Hero = ({ user }: HeroProps) => {
    const { t, i18n } = useTranslation();
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

    return (
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-gradient-to-r from-sky-200/50 to-teal-200/50 rounded-full blob-1 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 bg-gradient-to-r from-teal-300/50 to-blue-200/50 rounded-full blob-2 blur-3xl"></div>{' '}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 bg-gradient-to-r from-sky-300/40 to-teal-400/40 rounded-full blob-3 blur-2xl"></div>
            </div>

            {/* Dark theme blobs */}
            <div className="absolute inset-0 -z-10 dark:block hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-gradient-to-r from-cyan-950/40 to-zinc-700/40 rounded-full blob-1 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 bg-gradient-to-r from-stone-950/40 to-cyan-950/40 rounded-full blob-2 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 bg-gradient-to-r from-zinc-700/30 to-stone-950/30 rounded-full blob-3 blur-2xl"></div>
            </div>

            <div className="max-w-7xl mx-auto text-center w-full relative z-10">
                <div className="mb-8 relative floating">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-300 to-teal-400 dark:from-cyan-950 dark:to-zinc-700 rounded-full w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 mx-auto blur-2xl opacity-30 glow"></div>
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-teal-600 dark:from-cyan-950 dark:to-stone-950 rounded-full animate-spin-slow opacity-20"></div>
                        <img
                            src={user?.avatar_url}
                            alt={user?.name}
                            className="relative w-full h-full rounded-full shadow-2xl border-4 border-white/20 dark:border-zinc-700/20 backdrop-blur-sm transition-all duration-500 hover:scale-110 hover:rotate-6"
                        />
                    </div>
                </div>

                <div className="space-y-4 sm:space-y-6 mb-12">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 dark:from-cyan-950 dark:via-zinc-700 dark:to-stone-950 bg-clip-text text-transparent leading-tight tracking-tight">
                        Hi, I'm {user?.name || 'Ilia'}
                    </h1>
                    <TypeAnimation
                        key={i18n.language}
                        sequence={animationSequence}
                        wrapper="p"
                        cursor={true}
                        repeat={Infinity}
                        className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-sky-600 dark:text-cyan-300 max-w-4xl mx-auto font-light leading-relaxed"
                    />
                </div>

                <div className="flex justify-center space-x-4 sm:space-x-6 mb-12 sm:mb-16">
                    <a
                        href="https://github.com/iamilia"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-4 sm:p-6 liquid-card hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                    >
                        <IconBrandGithub
                            size={24}
                            className="sm:w-8 sm:h-8 group-hover:scale-125 transition-transform duration-300 text-slate-600 dark:text-cyan-400"
                        />
                    </a>
                    {user?.twitter_username && (
                        <a
                            href={`https://twitter.com/${user.twitter_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-4 sm:p-6 liquid-card hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                        >
                            <IconBrandTwitter
                                size={24}
                                className="sm:w-8 sm:h-8 group-hover:scale-125 transition-transform duration-300 text-sky-500 dark:text-zinc-400"
                            />
                        </a>
                    )}
                    <a
                        href="mailto:ilialotfi@outlook.com"
                        className="group p-4 sm:p-6 liquid-card hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                    >
                        <IconMail
                            size={24}
                            className="sm:w-8 sm:h-8 group-hover:scale-125 transition-transform duration-300 text-teal-600 dark:text-stone-400"
                        />
                    </a>
                    <a
                        href="https://t.me/org_ilia"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-4 sm:p-6 liquid-card hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                    >
                        <IconBrandTelegram
                            size={24}
                            className="sm:w-8 sm:h-8 group-hover:scale-125 transition-transform duration-300 text-sky-600 dark:text-blue-600"
                        />
                    </a>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8 text-slate-600 dark:text-cyan-400">
                    {user?.location && (
                        <div className="flex items-center space-x-3 liquid-card px-4 py-2 sm:px-6 sm:py-3">
                            <IconMapPin size={16} className="sm:w-5 sm:h-5" />
                            <span className="font-medium text-sm sm:text-base">
                                {user.location}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center space-x-3 liquid-card px-4 py-2 sm:px-6 sm:py-3">
                        <IconCalendar size={16} className="sm:w-5 sm:h-5" />
                        <span className="font-medium text-sm sm:text-base">
                            Joined{' '}
                            {new Date(user?.created_at || '').getFullYear()}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};
