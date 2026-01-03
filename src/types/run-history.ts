export type RunHistoryItem = {
    path: string;
    title: string;
    date: string;
    passed: number;
    failed: number;
    githubIssueNumber?: number;
    hasOpenBug?: boolean;
};

