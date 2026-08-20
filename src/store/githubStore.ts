/**
 * Client-side cache for the GitHub profile.
 *
 * Zustand + `persist` replaces the hand-rolled localStorage juggling that used
 * to live in the service, and gives every component the same copy of the data
 * without threading props through the page.
 *
 * The policy is stale-while-revalidate: whatever was stored last render is
 * shown immediately, and a refresh runs behind it when it has aged out. A
 * failed refresh keeps the old data on screen — an error screen is only for
 * visitors who have nothing cached at all.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    fetchGitHubProfile,
    type ProfileSource,
} from '../services/githubService';
import type { GitHubUser, GitHubRepo } from '../types/github';

/** How long stored data is used without checking the server again. */
const TTL = 15 * 60 * 1000;

export type GitHubStatus = 'idle' | 'loading' | 'ready' | 'error';

interface GitHubState {
    username: string | null;
    user: GitHubUser | null;
    repos: GitHubRepo[];
    /** ms; 0 means nothing has been stored yet. */
    fetchedAt: number;
    source: ProfileSource | null;

    status: GitHubStatus;
    /** True while a background refresh runs over data already on screen. */
    refreshing: boolean;
    error: string | null;

    /** Fills the store, using the cache when it is still fresh. */
    load: (username: string, limit?: number) => Promise<void>;
    /** Ignores the cache and goes out to the network. */
    refresh: (limit?: number) => Promise<void>;
}

/**
 * React 19 runs effects twice in development, and the sub-pages mount Home
 * again on the way back. Both would otherwise start their own request.
 */
let inFlight: Promise<void> | null = null;

export const useGitHubStore = create<GitHubState>()(
    persist(
        (set, get) => {
            const fetchInto = async (
                username: string,
                limit: number
            ): Promise<void> => {
                const hadData = get().user !== null;

                set(
                    hadData
                        ? { refreshing: true }
                        : { status: 'loading', error: null }
                );

                try {
                    const profile = await fetchGitHubProfile(username, limit);

                    set({
                        username,
                        user: profile.user,
                        repos: profile.repos,
                        fetchedAt: profile.fetchedAt,
                        source: profile.source,
                        status: 'ready',
                        refreshing: false,
                        error: null,
                    });
                } catch (err) {
                    console.error('Error fetching GitHub data:', err);

                    // Stale data beats an error screen; the visitor cannot tell
                    // the difference and a stars count being minutes old is
                    // not worth blanking the page for.
                    set(
                        hadData
                            ? { refreshing: false, status: 'ready' }
                            : {
                                  status: 'error',
                                  refreshing: false,
                                  error: 'Failed to load GitHub data',
                              }
                    );
                }
            };

            const run = (username: string, limit: number): Promise<void> => {
                if (inFlight) return inFlight;

                inFlight = fetchInto(username, limit).finally(() => {
                    inFlight = null;
                });

                return inFlight;
            };

            return {
                username: null,
                user: null,
                repos: [],
                fetchedAt: 0,
                source: null,
                status: 'idle',
                refreshing: false,
                error: null,

                load: async (username, limit = 6) => {
                    const state = get();
                    const cached =
                        state.user !== null && state.username === username;

                    if (cached && Date.now() - state.fetchedAt < TTL) {
                        if (state.status !== 'ready') set({ status: 'ready' });
                        return;
                    }

                    await run(username, limit);
                },

                refresh: async (limit = 6) => {
                    const username = get().username;
                    if (!username) return;
                    await run(username, limit);
                },
            };
        },
        {
            name: 'github-profile',
            version: 1,
            storage: createJSONStorage(() => localStorage),
            // Transient flags must not be restored: a reload during a fetch
            // would otherwise come back stuck on `loading`.
            partialize: (state) => ({
                username: state.username,
                user: state.user,
                repos: state.repos,
                fetchedAt: state.fetchedAt,
                source: state.source,
            }),
            // Runs before the first render, so a returning visitor never sees
            // the loading screen.
            onRehydrateStorage: () => (state) => {
                if (state?.user) state.status = 'ready';
            },
        }
    )
);

/** Keys written by the pre-Zustand cache; harmless, but no longer read. */
for (const key of Object.keys(localStorage)) {
    if (key.startsWith('github_user_') || key.startsWith('github_repos_')) {
        localStorage.removeItem(key);
    }
}
