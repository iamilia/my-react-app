import { IconArrowBackUp, IconRefresh } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Reveal } from '../components/Motion';
import { Station, SubPageShell } from '../components/SubPageShell';
import { Board } from '../games/2048/Board';
import { use2048 } from '../games/2048/use2048';
import { useBoardInput } from '../games/2048/useBoardInput';
import { useNumbers } from '../hooks/useNumbers';

const Stat = ({
    label,
    value,
    gain,
}: {
    label: string;
    value: number;
    gain?: { amount: number; key: number } | null;
}) => (
    <div className="stat2048">
        <span className="stat2048-label">{label}</span>
        <span className="stat2048-value force-mono">{value}</span>
        {gain && gain.amount > 0 && (
            <span key={gain.key} className="stat2048-gain force-mono">
                +{gain.amount}
            </span>
        )}
    </div>
);

export const Game2048 = () => {
    const { t } = useTranslation();
    const n = useNumbers();
    const frameRef = useRef<HTMLDivElement>(null);
    const {
        board,
        best,
        gained,
        canUndo,
        showWin,
        showLoss,
        play,
        restart,
        undo,
        keepPlaying,
    } = use2048();

    useBoardInput(frameRef, play);

    useEffect(() => {
        document.title = `2048 — ${t('navigation.userName')}`;
    }, [t]);

    const overlayButtons = 'flex flex-wrap justify-center gap-3';

    return (
        <SubPageShell
            back={{ to: '/game', label: t('game2048.back') }}
            title="2048"
            subtitle={t('game2048.tagline')}
            aside={
                <div className="flex gap-4" dir="ltr">
                    <Stat
                        label={t('game2048.score')}
                        value={board.score}
                        gain={gained}
                    />
                    <Stat label={t('game2048.best')} value={best} />
                </div>
            }
        >
            <Station no={1} title={t('game2048.boardTitle')}>
                <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
                    {/* --- board --------------------------------------------------- */}
                    <div className="relative w-full max-w-120 lg:col-span-7">
                        <Board
                            board={board}
                            frameRef={frameRef}
                            frozen={showWin || showLoss}
                        />

                        {showWin && (
                            <div className="overlay2048">
                                <h2 className="display display-md">
                                    {t('game2048.win.title')}
                                </h2>
                                <p className="prose-sm max-w-xs">
                                    {t('game2048.win.body')}
                                </p>
                                <div className={overlayButtons}>
                                    <button
                                        type="button"
                                        onClick={keepPlaying}
                                        className="btn"
                                    >
                                        {t('game2048.win.keepPlaying')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={restart}
                                        className="btn-outline"
                                    >
                                        {t('game2048.newGame')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {showLoss && (
                            <div className="overlay2048">
                                <h2 className="display display-md">
                                    {t('game2048.lose.title')}
                                </h2>
                                <p className="prose-sm max-w-xs">
                                    {t('game2048.lose.body', {
                                        score: board.score,
                                    })}
                                </p>
                                <div className={overlayButtons}>
                                    <button
                                        type="button"
                                        onClick={restart}
                                        className="btn"
                                    >
                                        <IconRefresh size={16} />
                                        {t('game2048.lose.tryAgain')}
                                    </button>
                                    {canUndo && (
                                        <button
                                            type="button"
                                            onClick={undo}
                                            className="btn-outline"
                                        >
                                            <IconArrowBackUp
                                                size={16}
                                                className="rtl:-scale-x-100"
                                            />
                                            {t('game2048.undo')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- controls ------------------------------------------------ */}
                    <div className="flex flex-col gap-4 lg:col-span-5">
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={restart}
                                className="btn"
                            >
                                <IconRefresh size={16} />
                                {t('game2048.newGame')}
                            </button>
                            <button
                                type="button"
                                onClick={undo}
                                disabled={!canUndo}
                                className="btn-outline disabled:pointer-events-none disabled:opacity-40"
                            >
                                <IconArrowBackUp
                                    size={16}
                                    className="rtl:-scale-x-100"
                                />
                                {t('game2048.undo')}
                            </button>
                        </div>
                        <p className="text-muted text-sm">
                            {t('game2048.howTo.hint')}
                        </p>
                    </div>
                </div>
            </Station>

            {/* --- how to play --------------------------------------------- */}
            <Station
                no={2}
                title={t('game2048.howTo.title')}
                className="pb-24! md:pb-32!"
            >
                <dl className="m-0 grid gap-8 sm:grid-cols-3">
                    {(['keys', 'swipe', 'goal'] as const).map((key, i) => (
                        <Reveal
                            key={key}
                            delay={i * 0.08}
                            className="border-t border-(--line-strong) pt-4"
                        >
                            <dt className="text-[clamp(2.5rem,5vw,4rem)] leading-none font-extrabold tracking-[-0.05em] nums">
                                {n(i + 1, 'padded')}
                            </dt>
                            <dd className="prose-sm m-0 mt-3">
                                {t(`game2048.howTo.${key}`)}
                            </dd>
                        </Reveal>
                    ))}
                </dl>
            </Station>
        </SubPageShell>
    );
};
