import { useTranslation } from 'react-i18next';
import { SectionHeading } from './SectionHeading';
import { Window } from './Window';

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

    return (
        <section id="skills" className="section scroll-mt-16">
            <div className="wrap">
                <Window title={t('navigation.skills')}>
                    <SectionHeading
                        title={t('skills.title')}
                        subtitle={t('skills.subtitle')}
                    />

                    <dl className="m-0">
                        {GROUPS.map((group) => (
                            <div
                                key={group.id}
                                className="row grid gap-3 py-4 sm:grid-cols-[11rem_1fr] sm:items-baseline sm:gap-8 sm:py-5"
                            >
                                <dt className="label label-ink">
                                    {t(`skills.groups.${group.id}`)}
                                </dt>
                                {/* Every entry is a Latin technology name,
                                    so the run reads left-to-right in source
                                    order regardless of the page. */}
                                <dd
                                    className="ltr-run m-0 flex flex-wrap gap-2"
                                    dir="ltr"
                                >
                                    {group.items.map((item) => (
                                        <span key={item} className="tag">
                                            {item}
                                        </span>
                                    ))}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <hr className="rule" />
                </Window>
            </div>
        </section>
    );
};
