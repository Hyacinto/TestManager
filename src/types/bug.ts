export type BugStatus = "open" | "in_progress" | "done";
export type BugSeverity = "low" | "medium" | "high" | "critical";

export interface Bug {
    id: string;
    title: string;
    status: BugStatus;
    severity: BugSeverity;
    createdAt: string; // ISO string
    relatedRunId?: string;
}

export type BugItem = {
    id: string;

    title: string;
    product: string;

    testCase?: string;
    stepIndex?: number;

    severity: "blocker" | "critical" | "major" | "minor";
    priority: "high" | "medium" | "low";

    status: "OPEN" | "CLOSED";

    assignee?: string;
    githubIssueNumber?: number;

    createdAt?: string;
    updatedAt?: string;

    path: string;
};

