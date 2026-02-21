import { mkdir } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import type { Plugin } from "@opencode-ai/plugin"

const ARCHIVE_DIR = process.env.OPENCODE_ARCHIVER_DIRECTORY || join(homedir(), ".opencode-archives")

async function ensureArchiveDir(): Promise<string> {
  await mkdir(ARCHIVE_DIR, { recursive: true })
  return ARCHIVE_DIR
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
        await client.app.log({
          body: {
            service: "opencode-archiver",
            level: "info",
            message: `[ARCHIVER] Event captured: ${event.type}`,
            extra: { event },
          },
        })
      }
    },
  }
}

export default OpencodeArchiver
