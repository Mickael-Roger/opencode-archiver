import type { Session, Message, Part, TextPart, ToolPart, ReasoningPart } from "@opencode-ai/sdk";
export type { Session, Message, Part, TextPart, ToolPart, ReasoningPart };
export interface ArchiverConfig {
    agents: string[];
    outputDir: string;
    includeTools: boolean;
    includeThinking: boolean;
}
export interface TrackingData {
    version: number;
    archivedSessions: string[];
}
//# sourceMappingURL=types.d.ts.map