import type { GitHubRepo } from '../types/github';

/**
 * GitHub's own language colours (github-linguist), so a dot here means the
 * same thing it means on github.com. Anything missing falls back to grey.
 */
const COLORS: Record<string, string> = {
    Lua: '#000080',
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Java: '#b07219',
    HTML: '#e34c26',
    CSS: '#663399',
    SCSS: '#c6538c',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Go: '#00ADD8',
    Rust: '#dea584',
    Shell: '#89e051',
    PHP: '#4F5D95',
    Kotlin: '#A97BFF',
};

export const languageColor = (language: string): string =>
    COLORS[language] ?? '#8b949e';

/** Repositories that are actually mine: no forks. */
export const ownRepos = (repos: GitHubRepo[]): GitHubRepo[] =>
    repos.filter((r) => !r.fork);

/** Most recently pushed first; falls back to `updated_at` for older data. */
export const byRecentPush = (a: GitHubRepo, b: GitHubRepo): number =>
    Date.parse(b.pushed_at || b.updated_at) -
    Date.parse(a.pushed_at || a.updated_at);

export interface LanguageShare {
    name: string;
    count: number;
    /** 0..1 */
    share: number;
    color: string;
}

/**
 * How my own repositories split by primary language, counted per
 * repository. Counting bytes would let one repo with a vendored dependency
 * swamp the rest; a count says what I actually reach for.
 */
export const languageShares = (repos: GitHubRepo[]): LanguageShare[] => {
    const counts = new Map<string, number>();
    for (const repo of ownRepos(repos)) {
        if (!repo.language) continue;
        counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
    }
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({
            name,
            count,
            share: total ? count / total : 0,
            color: languageColor(name),
        }));
};
