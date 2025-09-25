import {
    IconBrandTypescript,
    IconBrandReact,
    IconBrandNodejs,
    IconBrandTailwind,
    IconBrandGit,
    IconBrandVite,
    IconBrandJavascript,
    IconBrandHtml5,
    IconBrandCss3,
    IconBrandSass,
    IconBrandCpp,
} from '@tabler/icons-react';

const skills = [
    { name: 'Bash', icon: <span className="text-2xl">🐚</span> },
    { name: 'CPP', icon: <IconBrandCpp size={32} /> },
    { name: 'CSS', icon: <IconBrandCss3 size={32} /> },
    { name: 'Express', icon: <span className="text-2xl">🚂</span> },
    { name: 'Figma', icon: <span className="text-2xl">🎨</span> },
    { name: 'Git', icon: <IconBrandGit size={32} /> },
    { name: 'HeidiSQL', icon: <span className="text-2xl">🐘</span> },
    { name: 'HTML5', icon: <IconBrandHtml5 size={32} /> },
    { name: 'JavaScript', icon: <IconBrandJavascript size={32} /> },
    { name: 'Lua', icon: <span className="text-2xl">🌙</span> },
    { name: 'MongoDB', icon: <span className="text-2xl">🍃</span> },
    { name: 'MySQL', icon: <span className="text-2xl">🛢️</span> },
    { name: 'NodeJs', icon: <IconBrandNodejs size={32} /> },
    { name: 'ORM', icon: <span className="text-2xl">🔗</span> },
    { name: 'React', icon: <IconBrandReact size={32} /> },
    { name: 'Sass', icon: <IconBrandSass size={32} /> },
    { name: 'Tailwind CSS', icon: <IconBrandTailwind size={32} /> },
    { name: 'TypeScript', icon: <IconBrandTypescript size={32} /> },
    { name: 'Vite', icon: <IconBrandVite size={32} /> },
    { name: 'Visual Studio', icon: <span className="text-2xl">🖥️</span> },
];

export const Skills = () => {
    return (
        <section id="skills" className="py-20 bg-white/50 dark:bg-stone-950/10 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-cyan-300 mb-4 transition-colors">
                        Technologies & Skills
                    </h2>
                    <p className="text-lg sm:text-xl text-slate-600 dark:text-zinc-400 transition-colors">
                        A look at the tools and technologies I use.
                    </p>
                </div>
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8 text-center">
                        {skills.map((skill) => (
                            <div
                                key={skill.name}
                                className="group liquid-card p-6 flex flex-col items-center justify-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                            >
                                <div className="text-sky-600 dark:text-cyan-400 mb-4 group-hover:scale-125 transition-transform">
                                    {skill.icon}
                                </div>
                                <h3 className="text-md sm:text-lg font-semibold text-slate-700 dark:text-zinc-300">
                                    {skill.name}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};