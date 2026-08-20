/**
 * Dark mode.
 *
 * System-first: the operating system decides until the visitor says otherwise.
 * Toggling writes an explicit override; from then on the site stops following
 * the system for that browser — and toggling back to whatever the system says
 * drops the override, so it starts following again.
 *
 * The DOM side effects and the media-query listener live here rather than in a
 * component, so they happen once per page instead of once per mount, and the
 * class on <html> can never disagree with the store.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { rawStorage } from './rawStorage';

const STORAGE_KEY = 'theme';

/** Keep these in step with --bg in style.css and the inline script in index.html. */
const LIGHT_BG = '#faf7f2';
const DARK_BG = '#0b0f1a';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** An explicit choice, or `null` for "follow the system". */
type Override = 'dark' | 'light' | null;

const systemPrefersDark = (): boolean =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(DARK_QUERY).matches;

const applyMode = (dark: boolean): void => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
    root.style.backgroundColor = dark ? DARK_BG : LIGHT_BG;
    document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', dark ? DARK_BG : LIGHT_BG);
};

interface ThemeState {
    /** Persisted. `null` is stored as an absent key, not as a value. */
    override: Override;
    /** Derived from `override` and the system; never persisted. */
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            override: null,
            darkMode: systemPrefersDark(),

            toggleDarkMode: () => {
                const darkMode = !get().darkMode;

                set({
                    darkMode,
                    override:
                        darkMode === systemPrefersDark()
                            ? null
                            : darkMode
                              ? 'dark'
                              : 'light',
                });
            },
        }),
        {
            name: STORAGE_KEY,
            storage: rawStorage<Pick<ThemeState, 'override'>>(
                (raw) => ({
                    override: raw === 'dark' || raw === 'light' ? raw : null,
                }),
                (state) => state.override
            ),
            partialize: (state) => ({ override: state.override }),
            // Only the override is stored, so the visible mode has to be
            // recomputed from it — and from the system when there is none.
            onRehydrateStorage: () => (state) => {
                if (!state) return;
                state.darkMode = state.override
                    ? state.override === 'dark'
                    : systemPrefersDark();
            },
        }
    )
);

/* ------------------------------ side effects ------------------------------ */

// The inline script in index.html already painted the right theme; this keeps
// the two in step for the rest of the page's life.
applyMode(useThemeStore.getState().darkMode);
useThemeStore.subscribe((state) => applyMode(state.darkMode));

/**
 * Follow the OS live — someone flipping their system to dark at sunset should
 * see the site follow, but only while they have no override set.
 */
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    window.matchMedia(DARK_QUERY).addEventListener('change', (event) => {
        if (useThemeStore.getState().override === null) {
            useThemeStore.setState({ darkMode: event.matches });
        }
    });
}
