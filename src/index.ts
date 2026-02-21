import type { Plugin, PluginInput } from "@opencode-ai/plugin"
import type { Event, Session, Message, Part } from "@opencode-ai/sdk"
import { loadConfig } from "./config.js"
import { shouldArchive, archiveSession } from "./archiver.js"

interface OpencodeConfig {
  archiver?: {
    agents?: string[]
    outputDir?: string
    includeTools?: boolean
    includeThinking?: boolean
  }
}

export const ConversationArchiver: Plugin = async ({ client }: PluginInput) => {
  const configResult = await client.config.get()
  const opencodeConfig = configResult.data as OpencodeConfig | undefined
  const config = loadConfig(opencodeConfig?.archiver ?? {})
  
  return {
    event: async ({ event }: { event: Event }) => {
      if (event.type === "tui.command.execute" && event.properties.command === "session.new") {
        await archiveCurrentSession(client, config)
      }
      
      if (event.type === "server.connected") {
        await archiveAllSessions(client, config)
      }
    },
  }
}

async function archiveCurrentSession(client: PluginInput["client"], config: ReturnType<typeof loadConfig>): Promise<void> {
  try {
    const sessionsResult = await client.session.list({})
    
    if (sessionsResult.data && sessionsResult.data.length > 0) {
      const session = sessionsResult.data[0] as Session
      const messagesResult = await client.session.messages({ path: { id: session.id } })
      
      if (messagesResult.data && messagesResult.data.length > 0) {
        const messages = messagesResult.data as { info: Message; parts: Part[] }[]
        const agent = extractAgentFromMessages(messages)
        if (shouldArchive(agent, config)) {
          await archiveSession(session, messages, config, agent)
        }
      }
    }
  } catch (error) {
    console.error("Failed to archive session:", error)
  }
}

async function archiveAllSessions(client: PluginInput["client"], config: ReturnType<typeof loadConfig>): Promise<void> {
  try {
    const sessionsResult = await client.session.list({})
    
    if (sessionsResult.data) {
      for (const sessionData of sessionsResult.data) {
        const session = sessionData as Session
        const messagesResult = await client.session.messages({ path: { id: session.id } })
        
        if (messagesResult.data && messagesResult.data.length > 0) {
          const messages = messagesResult.data as { info: Message; parts: Part[] }[]
          const agent = extractAgentFromMessages(messages)
          if (shouldArchive(agent, config)) {
            await archiveSession(session, messages, config, agent)
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to archive sessions on startup:", error)
  }
}

function extractAgentFromMessages(messages: { info: Message; parts: Part[] }[]): string | undefined {
  if (messages.length === 0) return undefined
  const firstMessage = messages[0]
  if (firstMessage && "agent" in firstMessage.info) {
    return (firstMessage.info as { agent?: string }).agent
  }
  return undefined
}

export default ConversationArchiver