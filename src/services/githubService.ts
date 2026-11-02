/**
 * GitHub data comes from my own Express app under `/_gh`, not from
 * api.github.com directly.
 *
 * Same-origin on purpose: the browser never has to reach GitHub, which is
 * where the page used to break for visitors on networks that cannot get there.
 * The server holds the cache, so a cold visitor gets a response in a few
 * milliseconds and GitHub being down does not empty the page.
 *
 * The direct call is kept only as a last resort, for the case where my own
 * server is the unreachable one.
 */

import type { GitHubRepo, GitHubUser } from '../types/github';

const BASE = '/_gh';

/** Slow networks are the reason this exists, so leave room — but not forever. */
const TIMEOUT = 8000;

/** GET + JSON with a timeout; throws on non-2xx so callers can fall back. */
async function getJson<T>(url: string): Promise<T> {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    return res.json() as Promise<T>;
}

export type ProfileSource = 'server' | 'github';

export interface GitHubProfile {
    user: GitHubUser;
    repos: GitHubRepo[];
    source: ProfileSource;
    /** When the *server* last heard from GitHub, in ms. */
    fetchedAt: number;
}

interface ServerResponse {
    username: string;
    user: GitHubUser;
    repos: GitHubRepo[];
    fetchedAt: number;
    stale: boolean;
}

async function fromServer(
    username: string,
    limit: number
): Promise<GitHubProfile> {
    const data = await getJson<ServerResponse>(
        `${BASE}/${username}?limit=${limit}`
    );

    if (!data?.user) throw new Error('Malformed profile response');

    return {
        user: data.user,
        repos: data.repos ?? [],
        source: 'server',
        fetchedAt: data.fetchedAt || Date.now(),
    };
}

async function fromGitHub(
    username: string,
    limit: number
): Promise<GitHubProfile> {
    const api = `https://api.github.com/users/${username}`;
    const [user, repos] = await Promise.all([
        getJson<GitHubUser>(api),
        getJson<GitHubRepo[]>(`${api}/repos?sort=updated&per_page=${limit}`),
    ]);

    return {
        user,
        repos,
        source: 'github',
        fetchedAt: Date.now(),
    };
}

export async function fetchGitHubProfile(
    username: string,
    limit = 6
): Promise<GitHubProfile> {
    try {
        return await fromServer(username, limit);
    } catch (err) {
        console.warn('GitHub proxy failed, trying api.github.com:', err);
        return await fromGitHub(username, limit);
    }
}
