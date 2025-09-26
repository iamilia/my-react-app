import {
    IconMail,
    IconMapPin,
    IconBrandGithub,
    IconBrandTelegram,
    IconBrandDiscord,
} from '@tabler/icons-react';
import type { GitHubUser } from '../types/github';
import { useTranslation } from 'react-i18next';
interface ContactProps {
    user: GitHubUser | null;
}

export const Contact = ({ user, }: ContactProps) => {
    const { t } = useTranslation();

    return (
        <section
            id="contact"
            className="py-20 bg-white/50 dark:bg-stone-950/10 transition-colors"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-cyan-300 mb-4 transition-colors">
                        {t('contact.title')}
                    </h2>
                    <p className="text-lg sm:text-xl text-slate-600 dark:text-zinc-400 transition-colors">
                        {t('contact.subtitle')}
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Email */}
                        <div className="liquid-card p-6 sm:p-8 text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-sky-400 to-sky-600 dark:from-cyan-800 dark:to-cyan-950 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                <IconMail className="text-white" size={24} />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-cyan-300 mb-4">
                                {t('contact.email')}
                            </h3>
                            <a
                                href="mailto:ilialotfi@outlook.com"
                                className="text-slate-600 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-cyan-300 transition-colors text-sm sm:text-lg font-medium break-all"
                            >
                                ilialotfi@outlook.com
                            </a>
                        </div>

                        {/* Telegram */}
                        <div className="liquid-card p-6 sm:p-8 text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-400 to-teal-600 dark:from-zinc-600 dark:to-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                <IconBrandTelegram
                                    className="text-white"
                                    size={24}
                                />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-cyan-300 mb-4">
                                {t('contact.telegram')}
                            </h3>
                            <a
                                href="https://t.me/org_ilia"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-cyan-300 transition-colors text-sm sm:text-lg font-medium"
                            >
                                @org_ilia
                            </a>
                        </div>

                        {/* Discord */}
                        <div className="liquid-card p-6 sm:p-8 text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 md:col-span-2 lg:col-span-1">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-stone-700 dark:to-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                <IconBrandDiscord
                                    className="text-white"
                                    size={24}
                                />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-cyan-300 mb-4">
                                {t('contact.discordServer')}
                            </h3>
                            <a
                                href="https://discord.gg/kz6cSRrTdy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-cyan-300 transition-colors text-sm sm:text-lg font-medium"
                            >
                                {t('contact.joinServer')}
                            </a>
                        </div>
                    </div>

                    {/* Additional Contact Info */}
                    <div className="mt-16 text-center">
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
                            {user?.location && (
                                <div className="flex items-center justify-center space-x-3 liquid-card px-4 py-3 sm:px-6 sm:py-4">
                                    <div className="p-2 bg-gradient-to-br from-sky-400 to-teal-500 dark:from-cyan-800 dark:to-zinc-700 rounded-lg">
                                        <IconMapPin
                                            size={16}
                                            className="text-white"
                                        />
                                    </div>
                                    <span className="text-slate-700 dark:text-cyan-300 font-medium text-sm sm:text-lg">
                                        {user.location}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-center space-x-3 liquid-card px-4 py-3 sm:px-6 sm:py-4">
                                <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 dark:from-zinc-700 dark:to-stone-900 rounded-lg">
                                    <IconBrandGithub
                                        size={16}
                                        className="text-white"
                                    />
                                </div>
                                <a
                                    href="https://github.com/iamilia"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-700 dark:text-cyan-300 hover:text-sky-500 dark:hover:text-zinc-300 transition-colors font-medium text-sm sm:text-lg"
                                >
                                    github.com/iamilia
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="mt-16 text-center">
                        <div className="liquid-card p-6 sm:p-8 max-w-2xl mx-auto">
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-cyan-300 mb-4">
                                {t('contact.readyToCollaborate')}
                            </h3>
                            <p className="text-slate-600 dark:text-zinc-400 text-sm sm:text-lg leading-relaxed">
                                {t('contact.collaborationText')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
