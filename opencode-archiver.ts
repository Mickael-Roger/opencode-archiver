import { mkdir, readdir } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import { Database } from "bun:sqlite"
import type { Plugin } from "@opencode-ai/plugin"

const ARCHIVE_DIR = process.env.OPENCODE_ARCHIVER_DIRECTORY || join(homedir(), ".opencode-archives")
const ARCHIVE_AGENTS = process.env.OPENCODE_ARCHIVER_AGENTS
  ? process.env.OPENCODE_ARCHIVER_AGENTS.split(",").map((agent) => agent.trim())
  : ["Chat"]

async function ensureArchiveDir(): Promise<string> {
  await mkdir(ARCHIVE_DIR, { recursive: true })
  return ARCHIVE_DIR
}

async function listArchivedSessionIds(): Promise<string[]> {
  try {
    const files = await readdir(ARCHIVE_DIR)
    const sessionIds: string[] = []
    const pattern = /^\d{4}-\d{2}-\d{2}-(.+)\.md$/

    for (const file of files) {
      const match = file.match(pattern)
      if (match) {
        sessionIds.push(match[1])
      }
    }

    return sessionIds
  } catch {
    return []
  }
}

async function listSessionIdsToArchive(): string[] {
  const DB_PATH = join(homedir(), ".local", "share", "opencode", "opencode.db")
  const sessionIds: string[] = []

  try {
    const db = new Database(DB_PATH, { readonly: true })

    const conditions = ARCHIVE_AGENTS.map(() => 'data like ?').join(' or ')
    const params = ARCHIVE_AGENTS.map(agent => `%"agent":"${agent}"%`)

    const query = `select distinct session_id from message where ${conditions}`
    const stmt = db.prepare(query)
    const rows = stmt.all(...params) as { session_id: string }[]

    for (const row of rows) {
      sessionIds.push(row.session_id)
    }

    db.close()
  } catch (error) {
    console.error("[ARCHIVER] Error in listSessionIdsToArchive:", error)
    return []
  }

  return sessionIds
}

async function checkMissingArchives(client: { app: { log: (args: { body: { service: string; level: string; message: string } }) => Promise<void> } }): Promise<void> {
  const toArchive = await listSessionIdsToArchive()
  const archived = await listArchivedSessionIds()
  const archivedSet = new Set(archived)

  await client.app.log({
    body: {
      service: "opencode-archiver",
      level: "info",
      message: `[ARCHIVER] To archive: ${toArchive}`,
    },
  })

  await client.app.log({
    body: {
      service: "opencode-archiver",
      level: "info",
      message: `[ARCHIVER] Archived: ${archived}`,
    },
  })

  for (const sessionId of toArchive) {
    if (!archivedSet.has(sessionId)) {
      await client.app.log({
        body: {
          service: "opencode-archiver",
          level: "info",
          message: `[ARCHIVER] Missing archive for session: ${sessionId}`,
        },
      })
    }
  }
}

export const OpencodeArchiver: Plugin = async ({ client }) => {
  const archiveDir = await ensureArchiveDir()

  await client.app.log({
    body: {
      service: "opencode-archiver",
      level: "info",
      message: `[ARCHIVER] Archive directory: ${archiveDir}`,
    },
  })

  return {
    event: async ({ event }) => {
      if (event.type === "server.instance.disposed" || event.type === "session.created") {
        await checkMissingArchives(client)
      }
    },
  }
}

export default OpencodeArchiver
