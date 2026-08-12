import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    IconArrowBackUp,
    IconArrowLeft,
    IconRefresh,
} from '@tabler/icons-react';
import { SubPageShell } from '../components/SubPageShell';
import { useNumbers } from '../hooks/useNumbers';
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

    return (
        <SubPageShell>
            <div className="mx-auto max-w-3xl">
                <Link
                    to="/game"
                    className="text-muted label inline-flex items-center gap-2 transition-colors hover:text-(--fg)"
                >
                    <IconArrowLeft size={14} className="rtl:-scale-x-100" />
                    {t('game2048.back')}
                </Link>

                <hr className="rule-heavy mt-5" />

                <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <span className="label">{t('navigation.games')}</span>
                        <h1 className="display force-mono mt-2 text-[clamp(2.5rem,9vw,4.5rem)]">
                            2048
                        </h1>
                        <p className="prose-sm mt-3 max-w-md">
                            {t('game2048.tagline')}
                        </p>
                    </div>

                    <div className="flex gap-8" dir="ltr">
                        <Stat
                            label={t('game2048.score')}
                            value={board.score}
                            gain={gained}
                        />
                        <Stat label={t('game2048.best')} value={best} />
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button onClick={restart} className="btn">
                        <IconRefresh size={16} />
                        {t('game2048.newGame')}
                    </button>
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        className="btn-outline disabled:pointer-events-none disabled:opacity-40"
                    >
                        <IconArrowBackUp size={16} className="rtl:-scale-x-100" />
                        {t('game2048.undo')}
                    </button>
                </div>

                {/* --- board --------------------------------------------------- */}
                <div className="mt-8 flex justify-center">
                    <div className="relative w-full max-w-120">
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
                                <div className="flex flex-wrap justify-center gap-3">
                                    <button
                                        onClick={keepPlaying}
                                        className="btn"
                                    >
                                        {t('game2048.win.keepPlaying')}
                                    </button>
                                    <button
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
                                <div className="flex flex-wrap justify-center gap-3">
                                    <button onClick={restart} className="btn">
                                        <IconRefresh size={16} />
                                        {t('game2048.lose.tryAgain')}
                                    </button>
                                    {canUndo && (
                                        <button
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
                </div>

                {/* --- how to play --------------------------------------------- */}
                <div className="mt-14">
                    <hr className="rule-ink" />
                    <h2 className="label mt-4 block">
                        {t('game2048.howTo.title')}
                    </h2>

                    <dl className="m-0 mt-5 grid gap-6 sm:grid-cols-3">
                        {(['keys', 'swipe', 'goal'] as const).map((key, i) => (
                            <div key={key}>
                                <dt className="folio nums">
                                    {n(i + 1, 'padded')}
                                </dt>
                                <dd className="prose-sm m-0 mt-2">
                                    {t(`game2048.howTo.${key}`)}
                                </dd>
                            </div>
                        ))}
                    </dl>

                    <p className="text-muted mt-6 text-xs">
                        {t('game2048.howTo.hint')}
                    </p>
                </div>
            </div>
        </SubPageShell>
    );
};
