import type { Plugin } from "@opencode-ai/plugin"

export const OpencodeArchiver: Plugin = async ({ client }) => {
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
