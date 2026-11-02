import { IconArrowRight, IconLock } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EASE_OUT, Reveal, SEEN_MARGIN } from '../components/Motion';
import { Station, SubPageShell } from '../components/SubPageShell';
import { GAMES, type GameMeta } from '../games/registry';

const MotionLink = motion.create(Link);

/** A playable game: a big card, the whole of it a link. */
const LiveGame = ({ game }: { game: GameMeta }) => {
    const { t } = useTranslation();
    const reduce = useReducedMotion();
    const Icon = game.icon;
    if (!game.path) return null;

    return (
        <MotionLink
            to={game.path}
            className="card card-link group relative w-full overflow-hidden p-6! md:p-10!"
            whileHover={reduce ? undefined : { y: -6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        >
            <Icon
                aria-hidden="true"
                stroke={1.25}
                className="pointer-events-none absolute -end-6 -bottom-8 size-48 text-(--tint-hover) transition-transform duration-700 group-hover:-rotate-12 group-hover:scale-110 md:size-64"
            />
            <span className="flex items-center gap-2 text-sm font-semibold text-(--fg-muted)">
                <span className="marker" />
                {t('games.status.live')}
            </span>
            <h3 className="mt-5 text-[clamp(3rem,10vw,7rem)] leading-[0.9] font-extrabold tracking-[-0.06em]">
                {t(`games.items.${game.id}.title`)}
            </h3>
            <p className="lede bidi-auto relative mt-5 max-w-xl" dir="auto">
                {t(`games.items.${game.id}.description`)}
            </p>
            <div className="relative mt-6 flex flex-wrap gap-1.5" dir="ltr">
                {game.tags.map((tag) => (
                    <span key={tag} className="tag">
                        {tag}
                    </span>
                ))}
            </div>
            <span className="btn relative mt-8 self-start">
                {t('games.play')}
                <IconArrowRight
                    size={18}
                    aria-hidden="true"
                    className="btn-arrow rtl:-scale-x-100"
                />
            </span>
        </MotionLink>
    );
};

/** Not playable yet: no link, quieter. */
const SoonGame = ({ game }: { game: GameMeta }) => {
    const { t } = useTranslation();
    const Icon = game.icon;
    return (
        <div className="card h-full w-full" aria-disabled>
            <div className="flex items-start justify-between gap-3">
                <Icon
                    size={28}
                    stroke={1.5}
                    aria-hidden="true"
                    className="text-(--fg-muted)"
                />
                <IconLock
                    size={16}
                    aria-hidden="true"
                    className="text-(--fg-muted)"
                />
            </div>
            <h3 className="display display-md mt-6">
                {t(`games.items.${game.id}.title`)}
            </h3>
            <p className="prose-sm bidi-auto mt-2" dir="auto">
                {t(`games.items.${game.id}.description`)}
            </p>
            <div className="card-foot">
                <span>{t('games.inProgress')}</span>
            </div>
        </div>
    );
};

export const GameList = () => {
    const { t } = useTranslation();
    const reduce = useReducedMotion();

    useEffect(() => {
        document.title = `${t('games.title')} — ${t('navigation.userName')}`;
    }, [t]);

    const live = GAMES.filter((g) => g.status === 'live');
    const soon = GAMES.filter((g) => g.status === 'soon');

    return (
        <SubPageShell
            kicker={t('navigation.userName')}
            title={t('games.title')}
            subtitle={t('games.subtitle')}
        >
            <Station no={1} title={t('games.status.live')}>
                <ul className="m-0 grid list-none gap-5 p-0">
                    {live.map((game) => (
                        <Reveal as="li" key={game.id} className="flex">
                            <LiveGame game={game} />
                        </Reveal>
                    ))}
                </ul>
            </Station>

            <Station
                no={2}
                title={t('games.status.soon')}
                className="pb-24! md:pb-32!"
            >
                <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 xl:gap-5">
                    {soon.map((game, i) => (
                        <motion.li
                            key={game.id}
                            className="flex"
                            initial={reduce ? false : { opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: SEEN_MARGIN }}
                            transition={{
                                duration: 0.7,
                                ease: EASE_OUT,
                                delay: i * 0.08,
                            }}
                        >
                            <SoonGame game={game} />
                        </motion.li>
                    ))}
                </ul>
                <p className="prose-sm mt-10">{t('games.footnote')}</p>
            </Station>
        </SubPageShell>
    );
};
