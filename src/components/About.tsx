import { IconCode, IconBriefcase, IconUser } from '@tabler/icons-react';
import type { GitHubUser } from '../types/github';

interface AboutProps {
    user: GitHubUser | null;
}

export const About = ({ user }: AboutProps) => {
    return (
        <section id="about" className="py-20 bg-white/50 dark:bg-stone-950/10 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-cyan-300 mb-4 transition-colors">About Me</h2>
                    <p className="text-lg sm:text-xl text-slate-600 dark:text-zinc-400 transition-colors">Passionate about creating innovative solutions</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="group text-center p-6 sm:p-8 liquid-card hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-sky-400 to-sky-600 dark:from-cyan-800 dark:to-cyan-950 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                            <IconCode className="text-white" size={28} />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-slate-800 dark:text-cyan-300">Development</h3>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">Experienced in modern web technologies and software development practices.</p>
                    </div>
                    
                    <div className="group text-center p-6 sm:p-8 liquid-card hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-400 to-teal-600 dark:from-zinc-600 dark:to-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                            <IconBriefcase className="text-white" size={28} />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-slate-800 dark:text-cyan-300">Experience</h3>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">Building projects and contributing to open source communities.</p>
                    </div>
                    
                    <div className="group text-center p-6 sm:p-8 liquid-card hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-stone-700 dark:to-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                            <IconUser className="text-white" size={28} />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-slate-800 dark:text-cyan-300">Collaboration</h3>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">Love working with teams and sharing knowledge with the community.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 sm:gap-8 text-center">
                    <div className="p-6 sm:p-8 liquid-card bg-gradient-to-br from-sky-100/50 to-teal-100/50 dark:from-cyan-950/40 dark:to-zinc-700/40 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="text-3xl sm:text-4xl font-bold mb-2 text-sky-600 dark:text-cyan-300">{user?.public_repos}</div>
                        <div className="text-sm sm:text-base text-slate-600 dark:text-zinc-400">Public Repositories</div>
                    </div>
                    <div className="p-6 sm:p-8 liquid-card bg-gradient-to-br from-teal-100/50 to-blue-100/50 dark:from-zinc-700/40 dark:to-stone-950/40 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="text-3xl sm:text-4xl font-bold mb-2 text-teal-600 dark:text-cyan-300">{user?.followers}</div>
                        <div className="text-sm sm:text-base text-slate-600 dark:text-zinc-400">GitHub Followers</div>
                    </div>
                    <div className="p-6 sm:p-8 liquid-card bg-gradient-to-br from-blue-100/50 to-sky-100/50 dark:from-stone-950/40 dark:to-cyan-950/40 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                        <div className="text-3xl sm:text-4xl font-bold mb-2 text-blue-600 dark:text-cyan-300">{user?.following}</div>
                        <div className="text-sm sm:text-base text-slate-600 dark:text-zinc-400">Following</div>
                    </div>
                </div>
            </div>
        </section>
    );
};