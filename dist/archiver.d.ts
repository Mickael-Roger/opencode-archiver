import type { Session, Message, Part, ArchiverConfig } from "./types.js";
export declare function getArchiveDir(config: ArchiverConfig): string;
export declare function generateFilename(session: Session): string;
export declare function shouldArchive(agent: string | undefined, config: ArchiverConfig): boolean;
export declare function archiveSession(session: Session, messages: {
    info: Message;
    parts: Part[];
}[], config: ArchiverConfig, agent?: string): Promise<void>;
//# sourceMappingURL=archiver.d.ts.map