import axios from 'axios';
import type { GitHubUser, GitHubRepo } from '../types/github';

const api = axios.create({
    baseURL: 'https://api.github.com',
    timeout: 10000,
});

const CACHE_EXPIRATION = 30 * 60 * 1000; // 30 minutes in milliseconds

const getCachedData = (key: string) => {
    const cached = localStorage.getItem(key);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRATION) {
            return data;
        }
    }
    return null;
};

const setCachedData = <T>(key: string, data: T) => {
    localStorage.setItem(
        key,
        JSON.stringify({ data, timestamp: Date.now() })
    );
};

export const githubService = {
    async getUser(username: string): Promise<GitHubUser> {
        const cacheKey = `github_user_${username}`;
        const cachedUser = getCachedData(cacheKey);
        if (cachedUser) {
            return cachedUser;
        }

        const response = await api.get<GitHubUser>(`/users/${username}`);
        setCachedData(cacheKey, response.data);
        return response.data;
    },

    async getUserRepos(username: string, limit: number = 6): Promise<GitHubRepo[]> {
        const cacheKey = `github_repos_${username}`;
        const cachedRepos = getCachedData(cacheKey);
        if (cachedRepos) {
            return cachedRepos;
        }

        const response = await api.get<GitHubRepo[]>(`/users/${username}/repos`, {
            params: {
                sort: 'updated',
                per_page: limit,
            },
        });
        setCachedData(cacheKey, response.data);
        return response.data;
    },
};