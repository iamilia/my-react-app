import { useTranslation } from 'react-i18next';
import { useReveal } from '../hooks/useReveal';
import { SectionHeading } from './SectionHeading';

/**
 * Grouped rather than gridded. Twenty logo tiles say "I can name twenty
 * technologies"; five labelled rows say what each of them is actually for,
 * and read in a second.
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
    { id: 'systems', items: ['C++', 'Lua', 'Bash'] },
    { id: 'data', items: ['MongoDB', 'MySQL', 'ORM', 'HeidiSQL'] },
    { id: 'tools', items: ['Git', 'Figma', 'Visual Studio'] },
] as const;

export const Skills = () => {
    const { t } = useTranslation();
    const ref = useReveal<HTMLElement>();

    return (
        <section
            ref={ref}
            id="skills"
            className="section section-alt scroll-mt-16"
        >
            <div className="wrap">
                <SectionHeading
                    index={2}
                    label={t('navigation.skills')}
                    title={t('skills.title')}
                    subtitle={t('skills.subtitle')}
                />

                <div className="field">
                    <div className="field-body">
                        <dl className="m-0">
                            {GROUPS.map((group, i) => (
                                <div
                                    key={group.id}
                                    className="reveal grid gap-2 border-t border-(--line) py-5 sm:grid-cols-[11rem_1fr] sm:gap-8 sm:py-6"
                                    data-delay={i * 50}
                                >
                                    <dt className="label pt-1">
                                        {t(`skills.groups.${group.id}`)}
                                    </dt>
                                    {/* Every entry is a Latin technology name,
                                        so the run reads left-to-right in
                                        source order regardless of the page. */}
                                    <dd
                                        className="ltr-run m-0 flex flex-wrap items-baseline gap-x-5 gap-y-2"
                                        dir="ltr"
                                    >
                                        {group.items.map((item) => (
                                            <span
                                                key={item}
                                                className="force-mono text-[0.9375rem]"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                        <hr className="rule" />
                    </div>
                </div>
            </div>
        </section>
    );
};
