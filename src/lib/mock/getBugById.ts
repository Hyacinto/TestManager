import { mockBugs } from "./bugs";
import { Bug } from "@/types/bug";

export function getBugById(id: string): Bug | null {
    return mockBugs.find((b) => b.id === id) ?? null;
}
