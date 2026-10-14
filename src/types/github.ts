export interface GitHubRepo {
    id: number;
    name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string;
    updated_at: string;
    /** The fields below arrive from newer server builds; older cached data lacks them. */
    pushed_at?: string;
    fork?: boolean;
    topics?: string[];
    homepage?: string;
}

export interface GitHubUser {
    login: string;
    name: string;
    bio: string;
    avatar_url: string;
    location: string;
    blog: string;
    twitter_username: string;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
}
