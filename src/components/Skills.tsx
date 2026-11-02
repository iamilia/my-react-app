import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { EASE_OUT, SEEN_MARGIN } from './Motion';
import { SectionHeading } from './SectionHeading';

/**
 * Grouped by what each one is for, and set as type rather than as tiles:
 * the names are the picture. Each row slides in, then its words follow.
 */
const GROUPS = [
    {
        id: 'core',
        items: [
            'TypeScript',
            'JavaScript',
            'React',
            'Node.js',
            'Tailwind CSS',
            'Vite',
        ],
    },
    { id: 'web', items: ['HTML', 'CSS', 'Sass', 'Express'] },
    { id: 'systems', items: ['C++', 'Lua', 'Bash', 'Python'] },
    {
        id: 'data',
        items: ['MongoDB', 'MySQL', 'ORM', 'HeidiSQL', 'Postgresql', 'Redis'],
    },
    { id: 'tools', items: ['Git', 'Figma', 'Visual Studio', 'FFmpeg'] },
] as const;

export const Skills = ({ no }: { no: number }) => {
    const { t } = useTranslation();
    const reduce = useReducedMotion();

    return (
        <section id="skills" className="section scroll-mt-16">
            <div className="wrap">
                <div className="lined">
                    <SectionHeading
                        no={no}
                        title={t('skills.title')}
                        subtitle={t('skills.subtitle')}
                    />

                    <dl className="m-0">
                        {GROUPS.map((group) => (
                            <motion.div
                                key={group.id}
                                className="row grid gap-3 py-6 md:grid-cols-[10rem_1fr] md:items-baseline md:gap-8 md:py-8 xl:grid-cols-[14rem_1fr]"
                                initial={reduce ? false : 'hidden'}
                                whileInView="shown"
                                viewport={{
                                    once: true,
                                    margin: SEEN_MARGIN,
                                }}
                                transition={{ staggerChildren: 0.05 }}
                            >
                                <dt className="station-no text-(--fg-muted)!">
                                    {t(`skills.groups.${group.id}`)}
                                </dt>
                                {/* Latin technology names: read left-to-right on either page. */}
                                <dd
                                    className="m-0 flex flex-wrap gap-x-[0.6em] gap-y-1"
                                    dir="ltr"
                                >
                                    {group.items.map((item, i) => (
                                        <motion.span
                                            key={item}
                                            className="text-[clamp(1.5rem,3.6vw,3rem)] leading-tight font-bold tracking-[-0.035em] transition-colors duration-300 hover:text-(--accent)"
                                            variants={{
                                                hidden: { opacity: 0, y: 20 },
                                                shown: { opacity: 1, y: 0 },
                                            }}
                                            transition={{
                                                duration: 0.7,
                                                ease: EASE_OUT,
                                            }}
                                        >
                                            {item}
                                            {i < group.items.length - 1 && (
                                                <span
                                                    className="text-(--fg-subtle) font-normal"
                                                    aria-hidden="true"
                                                >
                                                    {' /'}
                                                </span>
                                            )}
                                        </motion.span>
                                    ))}
                                </dd>
                            </motion.div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
};
