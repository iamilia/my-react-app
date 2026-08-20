import type { PersistStorage } from 'zustand/middleware';

/**
 * A `persist` storage for keys that hold a bare value instead of Zustand's
 * `{state,version}` envelope.
 *
 * Three reasons these keys cannot become JSON: the inline script in index.html
 * reads `theme` before React exists and must stay a two-line read; the keys
 * predate this store, so a format change would silently reset the preferences
 * of everyone who already visited; and a bare value is what a human sees in
 * devtools when they go looking.
 *
 * `encode` returning `null` removes the key, which is how "no preference" is
 * stored — an absent key is not the same as a stored default.
 */
export function rawStorage<S>(
    decode: (raw: string | null) => S,
    encode: (state: S) => string | null
): PersistStorage<S> {
    return {
        getItem: (name) => {
            let raw: string | null = null;
            try {
                raw = localStorage.getItem(name);
            } catch {
                /* private mode or blocked cookies — fall through to defaults */
            }
            // Never null: `decode(null)` is the "nothing stored yet" state, so
            // rehydration always runs and the store has one code path.
            return { state: decode(raw) };
        },

        setItem: (name, value) => {
            try {
                const raw = encode(value.state);
                if (raw === null) localStorage.removeItem(name);
                else localStorage.setItem(name, raw);
            } catch {
                /* ignore write failures: the app works, it just won't remember */
            }
        },

        removeItem: (name) => {
            try {
                localStorage.removeItem(name);
            } catch {
                /* ignore */
            }
        },
    };
}
