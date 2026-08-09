import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconArrowUpRight, IconLock, IconPlayerPlay } from '@tabler/icons-react';
import { SubPageShell } from '../components/SubPageShell';
import { SectionHeading } from '../components/SectionHeading';
import { useReveal } from '../hooks/useReveal';
import { GAMES, type GameMeta } from '../games/registry';

const GameCard = ({ game, index }: { game: GameMeta; index: number }) => {
    const { t } = useTranslation();
    const Icon = game.icon;
    const live = game.status === 'live' && game.path !== null;

    const body = (
        <>
            <div className="mb-5 flex items-start justify-between gap-3">
                <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border transition-colors duration-300 ${
                        live
                            ? 'text-accent border-(--line-strong) bg-(--accent-soft)'
                            : 'text-muted border-(--line) bg-(--bg-elev)'
                    }`}
                >
                    <Icon size={24} />
                </span>

                <span
                    className={`chip ${live ? 'text-accent border-(--line-strong)' : ''}`}
                >
                    {live ? (
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--accent) opacity-70" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--accent)" />
                        </span>
                    ) : (
                        <IconLock size={12} />
                    )}
                    {t(`games.status.${game.status}`)}
                </span>
            </div>

            <h3 className="text-lg font-semibold tracking-tight transition-colors duration-300 group-hover:text-(--accent)">
                {t(`games.items.${game.id}.title`)}
            </h3>

            <p className="text-muted mt-3 line-clamp-3 min-h-[3.9rem] text-sm leading-relaxed">
                {t(`games.items.${game.id}.description`)}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
                {game.tags.map((tag) => (
                    <span key={tag} className="chip force-mono">
                        {tag}
                    </span>
                ))}
            </div>

            <hr className="my-5 border-0 border-t border-(--line)" />

            <div className="text-muted mt-auto flex items-center justify-between font-mono text-xs tracking-wider uppercase">
                {live ? (
                    <>
                        <span className="text-accent inline-flex items-center gap-2">
                            <IconPlayerPlay size={14} />
                            {t('games.play')}
                        </span>
                        <IconArrowUpRight
                            size={18}
                            className="transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-(--accent) rtl:-scale-x-100"
                        />
                    </>
                ) : (
                    <span className="inline-flex items-center gap-2">
                        <IconLock size={14} />
                        {t('games.inProgress')}
                    </span>
                )}
            </div>
        </>
    );

    const className = `panel panel-glow group reveal flex flex-col p-6 ${
        live ? 'panel-hover' : 'cursor-not-allowed opacity-60'
    }`;

    return live ? (
        <Link
            to={game.path!}
            className={className}
            data-delay={(index % 3) * 80}
        >
            {body}
        </Link>
    ) : (
        <div className={className} data-delay={(index % 3) * 80} aria-disabled>
            {body}
        </div>
    );
};

export const GameList = () => {
    const { t } = useTranslation();
    const ref = useReveal<HTMLDivElement>();

    useEffect(() => {
        document.title = `${t('games.title')} — ${t('navigation.userName')}`;
    }, [t]);

    return (
        <SubPageShell>
            <div ref={ref} className="mx-auto max-w-6xl">
                <SectionHeading
                    index="01"
                    label={t('navigation.games')}
                    title={t('games.title')}
                    subtitle={t('games.subtitle')}
                />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {GAMES.map((game, i) => (
                        <GameCard key={game.id} game={game} index={i} />
                    ))}
                </div>

                <p
                    className="text-muted reveal mt-12 text-center font-mono text-xs tracking-wider"
                    data-delay="120"
                >
                    {t('games.footnote')}
                </p>
            </div>
        </SubPageShell>
    );
};
