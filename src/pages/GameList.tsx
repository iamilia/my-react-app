import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconArrowUpRight, IconLock } from '@tabler/icons-react';
import { SubPageShell } from '../components/SubPageShell';
import { SectionHeading } from '../components/SectionHeading';
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
                <h3 className="display display-md min-w-0">
                    {t(`games.items.${game.id}.title`)}
                </h3>
                {live ? (
                    <IconArrowUpRight
                        size={16}
                        className="mt-1 shrink-0 rtl:-scale-x-100"
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
        <Link to={livePath} className="card card-link invert-on-hover w-full">
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

    useEffect(() => {
        document.title = `${t('games.title')} — ${t('navigation.userName')}`;
    }, [t]);

    return (
        <SubPageShell title={t('navigation.games')}>
            <div>
                <SectionHeading
                    as="h1"
                    title={t('games.title')}
                    subtitle={t('games.subtitle')}
                />

                <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
                    {GAMES.map((game) => (
                        <li key={game.id} className="flex">
                            <GameCard game={game} />
                        </li>
                    ))}
                </ul>

                <p className="prose-sm mt-10">{t('games.footnote')}</p>
            </div>
        </SubPageShell>
    );
};
