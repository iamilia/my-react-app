import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    IconArrowBackUp,
    IconArrowLeft,
    IconArrowsMove,
    IconHandFinger,
    IconKeyboard,
    IconMoodSad,
    IconRefresh,
    IconTarget,
    IconTrophy,
} from '@tabler/icons-react';
import { SubPageShell } from '../components/SubPageShell';
import { Board } from '../games/2048/Board';
import { use2048 } from '../games/2048/use2048';
import { useBoardInput } from '../games/2048/useBoardInput';

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

    return (
        <SubPageShell>
            <div className="mx-auto max-w-3xl">
                <Link
                    to="/game"
                    className="text-muted inline-flex items-center gap-2 font-mono text-xs tracking-wider uppercase transition-colors hover:text-(--accent)"
                >
                    <IconArrowLeft size={15} className="rtl:-scale-x-100" />
                    {t('game2048.back')}
                </Link>

                <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">{t('navigation.games')}</p>
                        <h1 className="display force-mono mt-3 text-[clamp(2.4rem,8vw,3.6rem)]">
                            2048
                        </h1>
                        <p className="text-muted mt-3 max-w-md text-sm leading-relaxed">
                            {t('game2048.tagline')}
                        </p>
                    </div>

                    <div className="flex gap-3" dir="ltr">
                        <Stat
                            label={t('game2048.score')}
                            value={board.score}
                            gain={gained}
                        />
                        <Stat label={t('game2048.best')} value={best} />
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button onClick={restart} className="btn-neon px-5 py-2.5 text-sm">
                        <IconRefresh size={16} />
                        {t('game2048.newGame')}
                    </button>
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        className="btn-ghost px-5 py-2.5 text-sm disabled:pointer-events-none disabled:opacity-40"
                    >
                        <IconArrowBackUp size={16} className="rtl:-scale-x-100" />
                        {t('game2048.undo')}
                    </button>
                </div>

                {/* --- board --------------------------------------------------- */}
                <div className="mt-7 flex justify-center">
                    <div className="relative w-full max-w-120 rounded-[20px]">
                        <Board
                            board={board}
                            frameRef={frameRef}
                            frozen={showWin || showLoss}
                        />

                        {showWin && (
                            <div className="overlay2048">
                                <IconTrophy size={40} className="text-accent" />
                                <h2 className="display text-2xl">
                                    {t('game2048.win.title')}
                                </h2>
                                <p className="text-muted max-w-xs text-sm">
                                    {t('game2048.win.body')}
                                </p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <button
                                        onClick={keepPlaying}
                                        className="btn-neon px-5 py-2.5 text-sm"
                                    >
                                        {t('game2048.win.keepPlaying')}
                                    </button>
                                    <button
                                        onClick={restart}
                                        className="btn-ghost px-5 py-2.5 text-sm"
                                    >
                                        {t('game2048.newGame')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {showLoss && (
                            <div className="overlay2048">
                                <IconMoodSad size={40} className="text-accent" />
                                <h2 className="display text-2xl">
                                    {t('game2048.lose.title')}
                                </h2>
                                <p className="text-muted max-w-xs text-sm">
                                    {t('game2048.lose.body', {
                                        score: board.score,
                                    })}
                                </p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <button
                                        onClick={restart}
                                        className="btn-neon px-5 py-2.5 text-sm"
                                    >
                                        <IconRefresh size={16} />
                                        {t('game2048.lose.tryAgain')}
                                    </button>
                                    {canUndo && (
                                        <button
                                            onClick={undo}
                                            className="btn-ghost px-5 py-2.5 text-sm"
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
                </div>

                {/* --- how to play --------------------------------------------- */}
                <div className="panel mt-8 p-6">
                    <h2 className="text-muted font-mono text-[0.66rem] tracking-[0.22em] uppercase">
                        {t('game2048.howTo.title')}
                    </h2>
                    <ul className="mt-5 grid gap-4 sm:grid-cols-3">
                        {[
                            { icon: IconKeyboard, key: 'keys' },
                            { icon: IconHandFinger, key: 'swipe' },
                            { icon: IconTarget, key: 'goal' },
                        ].map(({ icon: Icon, key }) => (
                            <li key={key} className="flex items-start gap-3">
                                <span className="text-accent border-(--line) bg-(--bg-elev) mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                                    <Icon size={17} />
                                </span>
                                <p className="text-muted text-sm leading-relaxed">
                                    {t(`game2048.howTo.${key}`)}
                                </p>
                            </li>
                        ))}
                    </ul>
                    <p className="text-muted mt-5 flex items-center gap-2 font-mono text-[0.7rem] tracking-wider">
                        <IconArrowsMove size={14} className="text-accent" />
                        {t('game2048.howTo.hint')}
                    </p>
                </div>
            </div>
        </SubPageShell>
    );
};
