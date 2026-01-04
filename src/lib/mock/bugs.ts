import { Bug } from "@/types/bug";

export const mockBugs: Bug[] = [
    {
        id: "BUG-001",
        title: "Login után üres oldal jelenik meg",
        status: "open",
        severity: "high",
        createdAt: "2025-01-12T10:15:00Z",
        relatedRunId: "RUN-2025-01-12-01",
    },
    {
        id: "BUG-002",
        title: "Mentés gomb nem reagál",
        status: "in_progress",
        severity: "critical",
        createdAt: "2025-01-13T08:40:00Z",
    },
    {
        id: "BUG-003",
        title: "Lista görgetésnél UI szétesik",
        status: "done",
        severity: "medium",
        createdAt: "2025-01-10T14:22:00Z",
    },
];
