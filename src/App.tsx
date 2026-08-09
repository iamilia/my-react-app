import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Backdrop } from './components/Backdrop';
import { PageLoader } from './components/PageLoader';
import { ScrollToTop } from './components/ScrollToTop';
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

function App() {
    return (
        <>
            <Backdrop />
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/game" element={<GameList />} />
                    <Route path="/game/2048" element={<Game2048 />} />
                    {/* /games is the URL people guess — keep it working. */}
                    <Route
                        path="/games"
                        element={<Navigate to="/game" replace />}
                    />
                    <Route
                        path="/games/*"
                        element={<Navigate to="/game" replace />}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </>
    );
}

export default App;
