import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { DitherField } from './components/DitherField';
import { PageLoader } from './components/PageLoader';
import { ScrollProgress } from './components/ScrollProgress';
import { ScrollToTop } from './components/ScrollToTop';
import { usePageview } from './hooks/usePageview';
import { Home } from './pages/Home';

/**
 * Games are code-split: the portfolio is the page most visitors land on, and
 * none of the game code needs to be in that first bundle.
 */
const GameList = lazy(() =>
    import('./pages/GameList').then((m) => ({ default: m.GameList }))
);
const Game2048 = lazy(() =>
    import('./pages/Game2048').then((m) => ({ default: m.Game2048 }))
);
// Pulls in the metro data and Motion; the 3D scene is split off again inside.
const Metro = lazy(() =>
    import('./pages/Metro').then((m) => ({ default: m.Metro }))
);

// Only I ever open this, so it has no business in the bundle everyone else
// downloads.
const Stats = lazy(() =>
    import('./pages/Stats').then((m) => ({ default: m.Stats }))
);

function App() {
    usePageview();

    return (
        <>
            {/* Outside <Routes> so it survives navigation — otherwise the
                progress bar would remount mid-scroll. */}
            <DitherField />
            <ScrollProgress />
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/game" element={<GameList />} />
                    <Route path="/game/2048" element={<Game2048 />} />
                    <Route path="/metro" element={<Metro />} />
                    {/* /games is the URL people guess — keep it working. */}
                    <Route
                        path="/games"
                        element={<Navigate to="/game" replace />}
                    />
                    <Route
                        path="/games/*"
                        element={<Navigate to="/game" replace />}
                    />
                    <Route path="/admin/stats" element={<Stats />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </>
    );
}

export default App;
