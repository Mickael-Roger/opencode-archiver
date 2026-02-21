import type { Session, Message, Part, ArchiverConfig } from "./types.js"
import { promises as fs } from "fs"
import * as path from "path"
import * as os from "os"
import { isArchived, markArchived } from "./tracking.js"
import { sessionToMarkdown } from "./formatter.js"

function expandPath(p: string): string {
  if (p.startsWith("~")) {
    return path.join(os.homedir(), p.slice(1))
  }
  return p
}

export function getArchiveDir(config: ArchiverConfig): string {
  return expandPath(config.outputDir)
}

export function generateFilename(session: Session): string {
  const date = session.time?.created 
    ? new Date(session.time.created)
    : new Date()
  
  const dateStr = date.toISOString()
    .slice(0, 16)
    .replace("T", "_")
    .replace(":", "-")
  
  return `${dateStr}_${session.id}.md`
}

export function shouldArchive(agent: string | undefined, config: ArchiverConfig): boolean {
  if (!agent) return false
  return config.agents.includes(agent)
}

export async function archiveSession(
  session: Session,
  messages: { info: Message; parts: Part[] }[],
  config: ArchiverConfig,
  agent?: string
): Promise<void> {
  const archiveDir = getArchiveDir(config)
  const trackingPath = path.join(archiveDir, ".archive_tracking.json")
  
  if (await isArchived(trackingPath, session.id)) {
    return
  }
  
  await fs.mkdir(archiveDir, { recursive: true })
  
  const filename = generateFilename(session)
  const filepath = path.join(archiveDir, filename)
  
  const partsByMessage = new Map<string, Part[]>()
  const messageList: Message[] = []
  
  for (const msg of messages) {
    messageList.push(msg.info)
    partsByMessage.set(msg.info.id, msg.parts)
  }
  
  const markdown = sessionToMarkdown(session, messageList, partsByMessage, config, agent)
  
  await fs.writeFile(filepath, markdown)
  await markArchived(trackingPath, session.id)
}