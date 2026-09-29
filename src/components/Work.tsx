import { IconArrowUpRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionHeading } from './SectionHeading';
import { Window } from './Window';

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
 * table is deliberately not linked — only the framework and a one-line
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

export const Work = () => {
    const { t } = useTranslation();

    return (
        <section id="work" className="section scroll-mt-16">
            <div className="wrap">
                <Window title={t('navigation.work')}>
                    <SectionHeading
                        title={t('work.title')}
                        subtitle={t('work.subtitle')}
                    />

                    {/* ============================ LIVE ============================ */}
                    <div className="field">
                        <div className="field-aside">
                            <span className="flex items-center gap-2.5">
                                <span className="marker" />
                                <span className="label label-ink">
                                    {t('work.live')}
                                </span>
                            </span>
                            <p className="prose-sm mt-2">
                                {t('work.liveLabel')}
                            </p>
                        </div>

                        <div className="field-body">
                            <h3
                                className="display display-lg force-pixel"
                                dir="ltr"
                            >
                                {t('work.genesis.name')}
                            </h3>
                            <p className="label label-ink mt-3">
                                {t('work.genesis.role')}
                            </p>
                            <p className="lede mt-4">
                                {t('work.genesis.description')}
                            </p>
                            <ul
                                className="ltr-run m-0 mt-5 flex list-none flex-wrap gap-2 p-0"
                                dir="ltr"
                            >
                                {STACK.map((item) => (
                                    <li key={item} className="tag">
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            {/* ----------- in-game and voice: not links ----------- */}
                            <h4 className="label label-ink mt-12 block">
                                {t('work.platformsLabel')}
                            </h4>

                            <ul className="m-0 mt-3 list-none p-0">
                                {PLATFORMS.map((platform) => (
                                    <li
                                        key={platform.key}
                                        className="row grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[1fr_1fr_1.2fr] sm:items-baseline"
                                    >
                                        <span className="font-bold">
                                            {t(
                                                `work.genesis.platforms.${platform.key}.label`
                                            )}
                                        </span>
                                        <span
                                            className="force-mono text-muted ltr-run text-xs"
                                            dir="ltr"
                                        >
                                            {platform.name}
                                        </span>
                                        <span
                                            className="text-muted bidi-auto text-sm"
                                            dir="auto"
                                        >
                                            {t(
                                                `work.genesis.platforms.${platform.key}.description`
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <hr className="rule" />

                            {/* --------------------- endpoints -------------------- */}
                            <h4 className="label label-ink mt-12 block">
                                {t('work.endpoints')}
                            </h4>

                            <ul className="m-0 mt-3 list-none p-0">
                                {SITES.map((site) => (
                                    <li key={site.key}>
                                        <a
                                            href={`https://${site.host}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="row row-link invert-on-hover grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[1fr_1fr_1.2fr_auto] sm:items-baseline"
                                        >
                                            <span className="font-bold">
                                                {t(
                                                    `work.genesis.sites.${site.key}.label`
                                                )}
                                            </span>
                                            <span
                                                className="force-mono text-muted ltr-run truncate text-xs"
                                                dir="ltr"
                                            >
                                                {site.host}
                                            </span>
                                            <span
                                                className="text-muted bidi-auto text-sm"
                                                dir="auto"
                                            >
                                                {t(
                                                    `work.genesis.sites.${site.key}.description`
                                                )}
                                            </span>
                                            <IconArrowUpRight
                                                size={16}
                                                className="hidden shrink-0 sm:block rtl:-scale-x-100"
                                            />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <hr className="rule" />
                        </div>
                    </div>

                    {/* ========================== ARCHIVED ========================== */}
                    <div className="field mt-16 lg:mt-24">
                        <div className="field-aside">
                            <h3 className="label label-ink">
                                {t('work.archived.label')}
                            </h3>
                            <p className="prose-sm mt-2">
                                {t('work.archived.note')}
                            </p>
                        </div>

                        <div className="field-body">
                            <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2">
                                {ARCHIVED.map((project) => (
                                    <li key={project.key} className="flex">
                                        <article className="card w-full">
                                            <div className="flex items-start justify-between gap-3">
                                                <h4
                                                    className="display force-pixel text-xl"
                                                    dir="ltr"
                                                >
                                                    {project.name}
                                                </h4>
                                                <span
                                                    className="tag shrink-0"
                                                    dir="ltr"
                                                >
                                                    {project.platform}
                                                </span>
                                            </div>

                                            <p className="label label-ink mt-1.5">
                                                {t(
                                                    `work.archived.kinds.${project.kind}`
                                                )}
                                            </p>

                                            <p
                                                className="prose-sm bidi-auto mt-2"
                                                dir="auto"
                                            >
                                                {t(
                                                    `work.archived.items.${project.key}.description`
                                                )}
                                            </p>

                                            {project.framework && (
                                                <div
                                                    className="card-foot"
                                                    dir="ltr"
                                                >
                                                    <span className="truncate">
                                                        {project.framework}
                                                    </span>
                                                </div>
                                            )}
                                        </article>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Window>
            </div>
        </section>
    );
};
