import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconArrowUpRight, IconLock } from '@tabler/icons-react';
import { SubPageShell } from '../components/SubPageShell';
import { SectionHeading } from '../components/SectionHeading';
import { useReveal } from '../hooks/useReveal';
import { GAMES, type GameMeta } from '../games/registry';

const GameCard = ({ game }: { game: GameMeta }) => {
    const { t } = useTranslation();
    // One binding for both questions ("is it playable?" and "where to?") so
    // the link target narrows on its own.
    const livePath = game.status === 'live' ? game.path : null;
    const live = livePath !== null;

    const body = (
        <>
            <div className="flex items-start justify-between gap-3">
                <h3 className="display display-md min-w-0 transition-colors duration-200 group-hover:text-(--accent)">
                    {t(`games.items.${game.id}.title`)}
                </h3>
                {live ? (
                    <IconArrowUpRight
                        size={16}
                        className="text-muted mt-1 shrink-0 transition-colors duration-200 group-hover:text-(--accent) rtl:-scale-x-100"
                    />
                ) : (
                    <IconLock size={14} className="text-muted mt-1 shrink-0" />
                )}
            </div>

            <p className="prose-sm bidi-auto mt-2.5 line-clamp-3" dir="auto">
                {t(`games.items.${game.id}.description`)}
            </p>

            <div className="ltr-run mt-4 flex flex-wrap gap-1.5" dir="ltr">
                {game.tags.map((tag) => (
                    <span key={tag} className="tag">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="card-foot">
                {live ? (
                    <span className="text-accent inline-flex items-center gap-2">
                        <span className="marker" />
                        {t('games.play')}
                    </span>
                ) : (
                    <span>{t('games.inProgress')}</span>
                )}
            </div>
        </>
    );

    return livePath ? (
        <Link to={livePath} className="card card-link group w-full">
            {body}
        </Link>
    ) : (
        <div className="card w-full opacity-60" aria-disabled>
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
            <div ref={ref}>
                <SectionHeading
                    index={1}
                    label={t('navigation.games')}
                    title={t('games.title')}
                    subtitle={t('games.subtitle')}
                />

                <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
                    {GAMES.map((game, i) => (
                        <li
                            key={game.id}
                            className="reveal flex"
                            data-delay={(i % 3) * 60}
                        >
                            <GameCard game={game} />
                        </li>
                    ))}
                </ul>

                <p className="prose-sm reveal mt-10" data-delay="80">
                    {t('games.footnote')}
                </p>
            </div>
        </SubPageShell>
    );
};
