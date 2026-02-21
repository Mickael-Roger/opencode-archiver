import { mkdir, readdir, writeFile } from "node:fs/promises"
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

async function listSessionIdsToArchive(): Promise<string[]> {
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

async function checkMissingArchives(client: { app: { log: (args: { body: { service: string; level: "info" | "debug" | "error" | "warn"; message: string } }) => unknown } }): Promise<void> {
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
      await reconcileArchive(client, sessionId)
    }
  }
}

function getDbPath(): string {
  return join(homedir(), ".local", "share", "opencode", "opencode.db")
}

function getSessionInfo(sessionId: string): { title: string | null; createdAt: number | null } {
  const DB_PATH = getDbPath()

  try {
    const db = new Database(DB_PATH, { readonly: true })
    const query = db.query("SELECT title, time_created FROM session WHERE id = ?")
    const row = query.get(sessionId) as { title: string | null; time_created: number | null } | undefined
    db.close()

    if (row) {
      return { title: row.title, createdAt: row.time_created }
    }
  } catch (error) {
    console.error(`[ARCHIVER] Error getting session info for ${sessionId}:`, error)
  }

  return { title: null, createdAt: null }
}

function generateKeywords(sessionId: string): string[] {
  return []
}

interface MessageInfo {
  id: string
  role: "user" | "assistant"
  finish: string | null
}

interface MessagePart {
  type: string
  text?: string
}

function getMessagesForSession(sessionId: string): MessageInfo[] {
  const DB_PATH = getDbPath()
  const messages: MessageInfo[] = []

  try {
    const db = new Database(DB_PATH, { readonly: true })
    const query = db.query("SELECT id, data FROM message WHERE session_id = ? ORDER BY time_created ASC")
    const rows = query.all(sessionId) as { id: string; data: string }[]

    for (const row of rows) {
      try {
        const data = JSON.parse(row.data) as { role: string; finish?: string }
        if (data.role === "user" || (data.role === "assistant" && data.finish === "stop")) {
          messages.push({
            id: row.id,
            role: data.role as "user" | "assistant",
            finish: data.finish || null,
          })
        }
      } catch {
        // Skip invalid JSON
      }
    }

    db.close()
  } catch (error) {
    console.error(`[ARCHIVER] Error getting messages for session ${sessionId}:`, error)
  }

  return messages
}

function getMessageContent(messageId: string): string {
  const DB_PATH = getDbPath()
  const textParts: string[] = []

  try {
    const db = new Database(DB_PATH, { readonly: true })
    const query = db.query("SELECT data FROM part WHERE message_id = ? ORDER BY time_created ASC")
    const rows = query.all(messageId) as { data: string }[]
    db.close()

    for (const row of rows) {
      try {
        const part = JSON.parse(row.data) as MessagePart
        if (part.type === "text" && part.text) {
          textParts.push(part.text)
        }
      } catch {
        // Skip invalid JSON
      }
    }
  } catch (error) {
    console.error(`[ARCHIVER] Error getting content for message ${messageId}:`, error)
  }

  return textParts.join("\n")
}

async function reconcileArchive(
  client: { app: { log: (args: { body: { service: string; level: "info" | "debug" | "error" | "warn"; message: string } }) => unknown } },
  sessionId: string,
): Promise<void> {
  await client.app.log({
    body: {
      service: "opencode-archiver",
      level: "info",
      message: `[ARCHIVER] Reconciling archive for session: ${sessionId}`,
    },
  })

  const { title, createdAt } = getSessionInfo(sessionId)

  if (!title || createdAt === null) {
    await client.app.log({
      body: {
        service: "opencode-archiver",
        level: "error",
        message: `[ARCHIVER] Could not get session info for ${sessionId}`,
      },
    })
    return
  }

  const messages = getMessagesForSession(sessionId)
  const conversationLines: string[] = []

  for (const message of messages) {
    const content = getMessageContent(message.id)
    if (content) {
      const role = message.role === "user" ? "User" : "Assistant"
      conversationLines.push(`# ${role}\n---\n\n${content}\n`)
    }
  }

  const date = new Date(createdAt)
  const dateStr = date.toISOString().split("T")[0]
  const filename = `${dateStr}-${sessionId}.md`
  const filePath = join(ARCHIVE_DIR, filename)

  const keywords = generateKeywords(sessionId)
  const keywordsStr = keywords.join(", ")

  const content = `keywords: ${keywordsStr}
title: ${title}
---
${conversationLines.join("\n")}
`

  try {
    await writeFile(filePath, content, "utf-8")
    await client.app.log({
      body: {
        service: "opencode-archiver",
        level: "info",
        message: `[ARCHIVER] Created archive file: ${filename}`,
      },
    })
  } catch (error) {
    await client.app.log({
      body: {
        service: "opencode-archiver",
        level: "error",
        message: `[ARCHIVER] Error writing archive file for ${sessionId}: ${error}`,
      },
    })
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
