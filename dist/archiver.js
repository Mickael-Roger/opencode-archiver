import { promises as fs } from "fs";
import * as path from "path";
import * as os from "os";
import { isArchived, markArchived } from "./tracking.js";
import { sessionToMarkdown } from "./formatter.js";
function expandPath(p) {
    if (p.startsWith("~")) {
        return path.join(os.homedir(), p.slice(1));
    }
    return p;
}
export function getArchiveDir(config) {
    return expandPath(config.outputDir);
}
export function generateFilename(session) {
    const date = session.time?.created
        ? new Date(session.time.created)
        : new Date();
    const dateStr = date.toISOString()
        .slice(0, 16)
        .replace("T", "_")
        .replace(":", "-");
    return `${dateStr}_${session.id}.md`;
}
export function shouldArchive(agent, config) {
    if (!agent)
        return false;
    return config.agents.includes(agent);
}
export async function archiveSession(session, messages, config, agent) {
    const archiveDir = getArchiveDir(config);
    const trackingPath = path.join(archiveDir, ".archive_tracking.json");
    if (await isArchived(trackingPath, session.id)) {
        return;
    }
    await fs.mkdir(archiveDir, { recursive: true });
    const filename = generateFilename(session);
    const filepath = path.join(archiveDir, filename);
    const partsByMessage = new Map();
    const messageList = [];
    for (const msg of messages) {
        messageList.push(msg.info);
        partsByMessage.set(msg.info.id, msg.parts);
    }
    const markdown = sessionToMarkdown(session, messageList, partsByMessage, config, agent);
    await fs.writeFile(filepath, markdown);
    await markArchived(trackingPath, session.id);
}
//# sourceMappingURL=archiver.js.map