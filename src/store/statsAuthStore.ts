/**
 * The token for my own analytics dashboard.
 *
 * It only ever unlocks `/_a/stats`, and the server is the thing that checks
 * it — this store just remembers what was typed so the dashboard survives a
 * reload. Kept in the same raw key it has always used, so the token I already
 * have saved keeps working.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { rawStorage } from './rawStorage';

const STORAGE_KEY = 'ilia:analytics-token';

interface StatsAuthState {
    token: string | null;
    signIn: (token: string) => void;
    /** Also called when the server rejects the token, not just on logout. */
    signOut: () => void;
}

export const useStatsAuthStore = create<StatsAuthState>()(
    persist(
        (set) => ({
            token: null,
            signIn: (token) => set({ token }),
            signOut: () => set({ token: null }),
        }),
        {
            name: STORAGE_KEY,
            storage: rawStorage<Pick<StatsAuthState, 'token'>>(
                (raw) => ({ token: raw }),
                (state) => state.token
            ),
            partialize: (state) => ({ token: state.token }),
        }
    )
);
