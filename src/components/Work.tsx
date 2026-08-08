import type { ReactNode } from 'react';
import {
    IconWorld,
    IconCloudUpload,
    IconHeadset,
    IconFileText,
    IconArrowUpRight,
    IconPointFilled,
    IconArchive,
    IconDeviceGamepad2,
    IconCar,
    IconHeadphones,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useReveal } from '../hooks/useReveal';
import { SectionHeading } from './SectionHeading';

type Platform = {
    /** i18n key under `work.genesis.platforms` */
    key: string;
    name: string;
    icon: ReactNode;
};

type Site = {
    /** i18n key under `work.genesis.sites` */
    key: string;
    host: string;
    icon: ReactNode;
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
    { key: 'fivem', name: 'FiveM', icon: <IconDeviceGamepad2 /> },
    { key: 'vmp', name: 'VMP', icon: <IconCar /> },
    { key: 'teamspeak', name: 'TeamSpeak', icon: <IconHeadphones /> },
];

/**
 * The web side of the same project. Unlike <Projects />, this list is
 * hand-maintained — these are production services, not GitHub repositories.
 *
 * To add another one, drop an entry in SITES and add the matching
 * `label` / `description` strings to both translation files.
 */
const SITES: Site[] = [
    { key: 'main', host: 'genesisrp.ir', icon: <IconWorld /> },
    { key: 'upload', host: 'upload.genesisrp.ir', icon: <IconCloudUpload /> },
    { key: 'support', host: 'support.genesisrp.ir', icon: <IconHeadset /> },
    { key: 'log', host: 'log.genesisrp.ir', icon: <IconFileText /> },
];

const STACK = ['React', 'TypeScript', 'Node.js', 'MySQL', 'Nginx'];

/**
 * Past game-server work. These are shut down and have no public URL, so the
 * cards are deliberately not links — only the framework and a one-line
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
    const ref = useReveal<HTMLElement>();

    return (
        <section
            ref={ref}
            id="work"
            className="scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8"
        >
            <div className="mx-auto max-w-6xl">
                <SectionHeading
                    index="03"
                    label={t('navigation.work')}
                    title={t('work.title')}
                    subtitle={t('work.subtitle')}
                />

                {/* ============================ LIVE ============================ */}
                <p className="eyebrow reveal mb-5">{t('work.liveLabel')}</p>

                <div className="panel panel-glow reveal overflow-hidden">
                    <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                        {/* ---------------- project summary ---------------- */}
                        <div className="border-b border-(--line) p-6 sm:p-8 lg:border-e lg:border-b-0">
                            <span className="chip">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--accent) opacity-70" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--accent)" />
                                </span>
                                {t('work.live')}
                            </span>

                            <h3
                                className="force-mono mt-5 font-mono text-2xl font-semibold tracking-tight sm:text-3xl"
                                dir="ltr"
                            >
                                {t('work.genesis.name')}
                            </h3>

                            <p className="text-accent mt-2 font-mono text-xs tracking-[0.18em] uppercase">
                                {t('work.genesis.role')}
                            </p>

                            <p className="text-muted mt-5 text-sm leading-relaxed">
                                {t('work.genesis.description')}
                            </p>

                            <div className="mt-7 flex flex-wrap gap-2">
                                {STACK.map((item) => (
                                    <span
                                        key={item}
                                        className="text-muted rounded-full border border-(--line) px-3 py-1 font-mono text-[0.68rem] tracking-wide"
                                        dir="ltr"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* ------------- platforms + web services ------------- */}
                        <div className="p-3 sm:p-4">
                            {/* in-game and voice — connect addresses, not URLs,
                                so these are rows rather than links */}
                            <p className="text-muted px-3 pt-3 pb-2 font-mono text-[0.66rem] tracking-[0.22em] uppercase">
                                {t('work.platformsLabel')}
                            </p>

                            <ul>
                                {PLATFORMS.map((platform, i) => (
                                    <li key={platform.key}>
                                        <div className="flex items-center gap-4 px-3 py-4">
                                            <span className="text-muted border-(--line) flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border [&>svg]:h-5 [&>svg]:w-5">
                                                {platform.icon}
                                            </span>

                                            <span className="min-w-0 flex-1">
                                                <span className="block text-sm font-medium">
                                                    {t(
                                                        `work.genesis.platforms.${platform.key}.label`
                                                    )}
                                                </span>
                                                <span
                                                    className="force-mono text-muted mt-0.5 block truncate font-mono text-xs"
                                                    dir="ltr"
                                                >
                                                    {platform.name}
                                                </span>
                                            </span>

                                            <span className="text-muted hidden max-w-52 shrink-0 items-center gap-1.5 text-xs sm:flex">
                                                <IconPointFilled
                                                    size={10}
                                                    className="text-accent shrink-0"
                                                />
                                                <span className="truncate">
                                                    {t(
                                                        `work.genesis.platforms.${platform.key}.description`
                                                    )}
                                                </span>
                                            </span>
                                        </div>

                                        {i < PLATFORMS.length - 1 && (
                                            <hr className="mx-3 border-0 border-t border-(--line)" />
                                        )}
                                    </li>
                                ))}
                            </ul>

                            <hr className="hairline mx-3 my-3" />

                            <p className="text-muted px-3 pt-2 pb-2 font-mono text-[0.66rem] tracking-[0.22em] uppercase">
                                {t('work.endpoints')}
                            </p>

                            <ul>
                                {SITES.map((site, i) => (
                                    <li key={site.key}>
                                        <a
                                            href={`https://${site.host}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-4 rounded-xl px-3 py-4 transition-colors duration-300 hover:bg-(--accent-soft)"
                                        >
                                            <span className="text-muted border-(--line) flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 group-hover:border-(--line-strong) group-hover:text-(--accent) [&>svg]:h-5 [&>svg]:w-5">
                                                {site.icon}
                                            </span>

                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center gap-2 text-sm font-medium transition-colors duration-300 group-hover:text-(--accent)">
                                                    {t(
                                                        `work.genesis.sites.${site.key}.label`
                                                    )}
                                                </span>
                                                <span
                                                    className="force-mono text-muted mt-0.5 block truncate font-mono text-xs"
                                                    dir="ltr"
                                                >
                                                    {site.host}
                                                </span>
                                            </span>

                                            <span className="text-muted hidden max-w-52 shrink-0 items-center gap-1.5 text-xs sm:flex">
                                                <IconPointFilled
                                                    size={10}
                                                    className="text-accent shrink-0"
                                                />
                                                <span className="truncate">
                                                    {t(
                                                        `work.genesis.sites.${site.key}.description`
                                                    )}
                                                </span>
                                            </span>

                                            <IconArrowUpRight
                                                size={18}
                                                className="text-muted shrink-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-(--accent) rtl:-scale-x-100"
                                            />
                                        </a>

                                        {i < SITES.length - 1 && (
                                            <hr className="mx-3 border-0 border-t border-(--line)" />
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ========================== ARCHIVED ========================== */}
                <div className="mt-20">
                    <p className="eyebrow reveal">{t('work.archived.label')}</p>

                    <p
                        className="text-muted reveal mt-4 max-w-2xl text-sm leading-relaxed"
                        data-delay="60"
                    >
                        {t('work.archived.note')}
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {ARCHIVED.map((project, i) => (
                            <article
                                key={project.key}
                                className="panel panel-hover reveal flex flex-col p-5"
                                data-delay={(i % 3) * 80}
                            >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <h4
                                        className="force-mono font-mono text-base font-semibold tracking-tight"
                                        dir="ltr"
                                    >
                                        {project.name}
                                    </h4>

                                    <span
                                        className="text-muted border-(--line) shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[0.62rem] tracking-wider"
                                        dir="ltr"
                                    >
                                        {project.platform}
                                    </span>
                                </div>

                                <p className="text-accent font-mono text-[0.64rem] tracking-[0.18em] uppercase opacity-80">
                                    {t(`work.archived.kinds.${project.kind}`)}
                                </p>

                                <p className="text-muted mt-3 text-sm leading-relaxed">
                                    {t(
                                        `work.archived.items.${project.key}.description`
                                    )}
                                </p>

                                <hr className="my-4 border-0 border-t border-(--line)" />

                                <div className="text-muted mt-auto flex items-center justify-between gap-3 font-mono text-[0.68rem]">
                                    {project.framework ? (
                                        <span className="truncate" dir="ltr">
                                            {project.framework}
                                        </span>
                                    ) : (
                                        <span />
                                    )}

                                    <span className="flex shrink-0 items-center gap-1.5 opacity-70">
                                        <IconArchive size={13} />
                                        {t('work.archived.badge')}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
