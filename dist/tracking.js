import { promises as fs } from "fs";
import * as path from "path";
export async function isArchived(trackingPath, sessionId) {
    try {
        const data = await readTrackingFile(trackingPath);
        return data.archivedSessions.includes(sessionId);
    }
    catch {
        return false;
    }
}
export async function markArchived(trackingPath, sessionId) {
    let data;
    try {
        data = await readTrackingFile(trackingPath);
    }
    catch {
        data = { version: 1, archivedSessions: [] };
    }
    if (!data.archivedSessions.includes(sessionId)) {
        data.archivedSessions.push(sessionId);
        await writeTrackingFile(trackingPath, data);
    }
}
async function readTrackingFile(trackingPath) {
    const content = await fs.readFile(trackingPath, "utf-8");
    return JSON.parse(content);
}
async function writeTrackingFile(trackingPath, data) {
    const dir = path.dirname(trackingPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(trackingPath, JSON.stringify(data, null, 2));
}
//# sourceMappingURL=tracking.js.map