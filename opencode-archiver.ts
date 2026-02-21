import type { Plugin } from "@opencode-ai/plugin"

export const OpencodeArchiver: Plugin = async ({ client }) => {
  return {
    event: async ({ event }) => {
      await client.app.log({
        body: {
          service: "opencode-archiver",
          level: "info",
          message: `Event triggered: ${event.type}`,
          extra: { event },
        },
      })
    },
  }
}

export default OpencodeArchiver
