import { IconArrowUpRight } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { EASE_OUT, Reveal, SEEN_MARGIN, SplitText } from './Motion';
import { SectionHeading } from './SectionHeading';

type Platform = {
    /** i18n key under `work.genesis.platforms` */
    key: string;
    name: string;
};

type Site = {
    /** i18n key under `work.genesis.sites` */
    key: string;
    host: string;
};

type Archived = {
    /** i18n key under `work.archived.items` */
    key: string;
    name: string;
    platform: 'FiveM' | 'RedM';
    /** framework / core the server was built on; empty when not applicable */
    framework: string;
    /** i18n key under `work.archived.kinds` */
    kind: 'roleplay' | 'zombie' | 'anticheat';
};

/**
 * Where the community actually plays and talks. These have connect addresses
 * rather than URLs, so they render as plain rows instead of links.
 */
const PLATFORMS: Platform[] = [
    { key: 'fivem', name: 'FiveM' },
    { key: 'vmp', name: 'VMP' },
    { key: 'teamspeak', name: 'TeamSpeak' },
];

/**
 * The web side of the same project. Unlike <Projects />, this list is
 * hand-maintained — these are production services, not GitHub repositories.
 *
 * To add another one, drop an entry in SITES and add the matching
 * `label` / `description` strings to both translation files.
 */
const SITES: Site[] = [
    { key: 'main', host: 'genesisrp.ir' },
    { key: 'upload', host: 'upload.genesisrp.ir' },
    { key: 'support', host: 'support.genesisrp.ir' },
    { key: 'log', host: 'log.genesisrp.ir' },
];

const STACK = ['React', 'TypeScript', 'Node.js', 'MySQL', 'Nginx'];

/**
 * Past game-server work. These are shut down and have no public URL, so the
 * list is deliberately not linked — only the framework and a one-line
 * summary, pulled from the translation files.
 */
const ARCHIVED: Archived[] = [
    {
        key: 'endtime',
        name: 'EndTime',
        platform: 'FiveM',
        framework: 'extendedmode',
        kind: 'zombie',
    },
    {
        key: 'arkacity',
        name: 'ArkaCity',
        platform: 'FiveM',
        framework: 'essentialmode , extendedmode',
        kind: 'roleplay',
    },
    {
        key: 'iceroleplay',
        name: 'ICE RolePlay',
        platform: 'FiveM',
        framework: 'QBCore',
        kind: 'roleplay',
    },
    {
        key: 'moonlight',
        name: 'MoonLight',
        platform: 'FiveM',
        framework: 'ESX Core',
        kind: 'roleplay',
    },
    {
        key: 'silverlife',
        name: 'Silverlife',
        platform: 'FiveM',
        framework: 'essentialmode',
        kind: 'roleplay',
    },
    {
        key: 'tokyorp',
        name: 'Tokyo RP',
        platform: 'FiveM',
        framework: 'essentialmode',
        kind: 'roleplay',
    },
    {
        key: 'syncwest',
        name: 'SyncWest',
        platform: 'RedM',
        framework: 'VORP Core',
        kind: 'roleplay',
    },
    {
        key: 'redline',
        name: 'RedLine',
        platform: 'FiveM',
        framework: '',
        kind: 'anticheat',
    },
];

export const Work = ({ no }: { no: number }) => {
    const { t } = useTranslation();
    const reduce = useReducedMotion();

    return (
        <section id="work" className="section scroll-mt-16">
            <div className="wrap">
                <div className="lined">
                    <SectionHeading
                        no={no}
                        title={t('work.title')}
                        subtitle={t('work.subtitle')}
                    />

                    {/* ============================ LIVE ============================ */}
                    <article className="card overflow-hidden p-6! md:p-10! xl:p-14!">
                        <Reveal>
                            <p className="flex items-center gap-2.5">
                                <span className="marker" />
                                <span className="label label-ink">
                                    {t('work.live')}
                                </span>
                            </p>
                        </Reveal>
                        <h3
                            className="mt-6 text-[clamp(3rem,11vw,9rem)] leading-[0.85] font-extrabold tracking-[-0.06em]"
                            dir="ltr"
                        >
                            <SplitText text={t('work.genesis.name')} />
                        </h3>

                        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-12">
                            <Reveal className="lg:col-span-7" delay={0.1}>
                                <p className="label label-ink">
                                    {t('work.genesis.role')}
                                </p>
                                <p className="lede mt-3">
                                    {t('work.genesis.description')}
                                </p>
                                <ul
                                    className="m-0 mt-6 flex list-none flex-wrap gap-2 p-0"
                                    dir="ltr"
                                >
                                    {STACK.map((item) => (
                                        <li key={item} className="tag">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </Reveal>

                            <div className="lg:col-span-5">
                                {/* in-game and voice: addresses, not links */}
                                <h4 className="label label-ink">
                                    {t('work.platformsLabel')}
                                </h4>
                                <ul className="m-0 mt-3 list-none p-0">
                                    {PLATFORMS.map((platform, i) => (
                                        <Reveal
                                            as="li"
                                            key={platform.key}
                                            delay={i * 0.06}
                                            className="row flex items-baseline justify-between gap-4 py-3.5"
                                        >
                                            <span>
                                                <span className="block font-bold">
                                                    {t(
                                                        `work.genesis.platforms.${platform.key}.label`
                                                    )}
                                                </span>
                                                <span
                                                    className="text-muted text-sm"
                                                    dir="auto"
                                                >
                                                    {t(
                                                        `work.genesis.platforms.${platform.key}.description`
                                                    )}
                                                </span>
                                            </span>
                                            <span
                                                className="mono text-muted text-xs"
                                                dir="ltr"
                                            >
                                                {platform.name}
                                            </span>
                                        </Reveal>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* --------------------- endpoints -------------------- */}
                        <h4 className="label label-ink mt-12 block">
                            {t('work.endpoints')}
                        </h4>
                        <ul className="m-0 mt-4 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-4">
                            {SITES.map((site, i) => (
                                <Reveal
                                    as="li"
                                    key={site.key}
                                    delay={i * 0.07}
                                    className="flex"
                                >
                                    <a
                                        href={`https://${site.host}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex w-full flex-col rounded-(--radius-md) bg-(--bg) p-4 transition-colors hover:bg-(--tint-hover) md:p-5"
                                    >
                                        <span className="flex items-center justify-between gap-2">
                                            <span className="font-bold">
                                                {t(
                                                    `work.genesis.sites.${site.key}.label`
                                                )}
                                            </span>
                                            <IconArrowUpRight
                                                size={18}
                                                aria-hidden="true"
                                                className="text-muted shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-(--accent) rtl:-scale-x-100"
                                            />
                                        </span>
                                        <span
                                            className="mono mt-1 truncate text-xs text-(--color-text-link)"
                                            dir="ltr"
                                        >
                                            {site.host}
                                        </span>
                                        <span
                                            className="text-muted mt-3 text-sm"
                                            dir="auto"
                                        >
                                            {t(
                                                `work.genesis.sites.${site.key}.description`
                                            )}
                                        </span>
                                    </a>
                                </Reveal>
                            ))}
                        </ul>
                    </article>

                    {/* ========================== ARCHIVED ========================== */}
                    <div className="mt-20 md:mt-28">
                        <Reveal className="max-w-2xl">
                            <h3 className="display display-lg">
                                {t('work.archived.label')}
                            </h3>
                            <p className="prose-sm mt-3">
                                {t('work.archived.note')}
                            </p>
                        </Reveal>

                        <ul className="m-0 mt-8 grid list-none gap-px overflow-hidden rounded-(--radius-lg) border border-(--line) bg-(--line) p-0 sm:grid-cols-2 xl:grid-cols-4">
                            {ARCHIVED.map((project, i) => (
                                <motion.li
                                    key={project.key}
                                    className="flex flex-col bg-(--surface) p-5 md:p-6"
                                    initial={reduce ? false : { opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{
                                        once: true,
                                        margin: SEEN_MARGIN,
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        ease: EASE_OUT,
                                        delay: (i % 4) * 0.08,
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h4
                                            className="text-xl font-extrabold tracking-tight"
                                            dir="ltr"
                                        >
                                            {project.name}
                                        </h4>
                                        <span
                                            className="mono text-muted shrink-0 text-xs"
                                            dir="ltr"
                                        >
                                            {project.platform}
                                        </span>
                                    </div>
                                    <p className="label label-ink mt-1">
                                        {t(
                                            `work.archived.kinds.${project.kind}`
                                        )}
                                    </p>
                                    <p
                                        className="prose-sm bidi-auto mt-3"
                                        dir="auto"
                                    >
                                        {t(
                                            `work.archived.items.${project.key}.description`
                                        )}
                                    </p>
                                    {project.framework && (
                                        <p
                                            className="mono text-muted mt-auto truncate pt-4 text-xs"
                                            dir="ltr"
                                        >
                                            {project.framework}
                                        </p>
                                    )}
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};
