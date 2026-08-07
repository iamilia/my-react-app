import type { ReactNode } from 'react';
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
    IconBrandFigma,
    IconBrandMongodb,
    IconDatabase,
    IconTerminal2,
    IconServer2,
    IconMoon,
    IconLink,
    IconDeviceDesktop,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useReveal } from '../hooks/useReveal';
import { SectionHeading } from './SectionHeading';

type Skill = { name: string; icon: ReactNode; group: string };

const skills: Skill[] = [
    { name: 'TypeScript', icon: <IconBrandTypescript />, group: 'core' },
    { name: 'JavaScript', icon: <IconBrandJavascript />, group: 'core' },
    { name: 'React', icon: <IconBrandReact />, group: 'core' },
    { name: 'Node.js', icon: <IconBrandNodejs />, group: 'core' },
    { name: 'Tailwind CSS', icon: <IconBrandTailwind />, group: 'core' },
    { name: 'Vite', icon: <IconBrandVite />, group: 'core' },
    { name: 'HTML5', icon: <IconBrandHtml5 />, group: 'web' },
    { name: 'CSS', icon: <IconBrandCss3 />, group: 'web' },
    { name: 'Sass', icon: <IconBrandSass />, group: 'web' },
    { name: 'Express', icon: <IconServer2 />, group: 'web' },
    { name: 'C++', icon: <IconBrandCpp />, group: 'systems' },
    { name: 'Lua', icon: <IconMoon />, group: 'systems' },
    { name: 'Bash', icon: <IconTerminal2 />, group: 'systems' },
    { name: 'MongoDB', icon: <IconBrandMongodb />, group: 'data' },
    { name: 'MySQL', icon: <IconDatabase />, group: 'data' },
    { name: 'ORM', icon: <IconLink />, group: 'data' },
    { name: 'HeidiSQL', icon: <IconDatabase />, group: 'data' },
    { name: 'Git', icon: <IconBrandGit />, group: 'tools' },
    { name: 'Figma', icon: <IconBrandFigma />, group: 'tools' },
    { name: 'Visual Studio', icon: <IconDeviceDesktop />, group: 'tools' },
];

export const Skills = () => {
    const { t } = useTranslation();
    const ref = useReveal<HTMLElement>();

    // duplicated once for a seamless marquee loop
    const ticker = [...skills, ...skills];

    return (
        <section
            ref={ref}
            id="skills"
            className="scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8"
        >
            <div className="mx-auto max-w-6xl">
                <SectionHeading
                    index="02"
                    label={t('navigation.skills')}
                    title={t('skills.title')}
                    subtitle={t('skills.subtitle')}
                />

                {/* Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {skills.map((skill, i) => (
                        <div
                            key={skill.name}
                            className="panel panel-hover panel-glow reveal group flex flex-col items-center justify-center gap-3 px-3 py-6"
                            data-delay={(i % 5) * 60}
                        >
                            <span className="text-muted transition-colors duration-300 group-hover:text-[var(--accent)] [&>svg]:h-7 [&>svg]:w-7">
                                {skill.icon}
                            </span>
                            <span className="text-center font-mono text-[0.72rem] tracking-wide">
                                {skill.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Marquee ticker */}
                <div
                    className="marquee-mask reveal mt-10 overflow-hidden"
                    data-delay="120"
                >
                    <div className="marquee gap-8 py-2">
                        {ticker.map((skill, i) => (
                            <span
                                key={`${skill.name}-${i}`}
                                className="text-muted flex shrink-0 items-center gap-2 font-mono text-xs tracking-[0.18em] whitespace-nowrap uppercase"
                            >
                                <span className="text-accent">/</span>
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
