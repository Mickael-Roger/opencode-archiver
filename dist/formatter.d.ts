import type { Session, Message, Part, ArchiverConfig } from "./types.js";
export declare function formatSessionHeader(session: Session, agent?: string): string;
export declare function formatMessage(message: Message, parts: Part[], config: ArchiverConfig): string;
export declare function sessionToMarkdown(session: Session, messages: Message[], partsByMessage: Map<string, Part[]>, config: ArchiverConfig, agent?: string): string;
//# sourceMappingURL=formatter.d.ts.map