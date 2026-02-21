import { loadConfig } from "./config.js";
import { shouldArchive, archiveSession } from "./archiver.js";
export const ConversationArchiver = async ({ client }) => {
    const configResult = await client.config.get();
    const opencodeConfig = configResult.data;
    const config = loadConfig(opencodeConfig?.archiver ?? {});
    return {
        event: async ({ event }) => {
            if (event.type === "tui.command.execute" && event.properties.command === "session.new") {
                await archiveCurrentSession(client, config);
            }
            if (event.type === "server.connected") {
                await archiveAllSessions(client, config);
            }
        },
    };
};
async function archiveCurrentSession(client, config) {
    try {
        const sessionsResult = await client.session.list({});
        if (sessionsResult.data && sessionsResult.data.length > 0) {
            const session = sessionsResult.data[0];
            const messagesResult = await client.session.messages({ path: { id: session.id } });
            if (messagesResult.data && messagesResult.data.length > 0) {
                const messages = messagesResult.data;
                const agent = extractAgentFromMessages(messages);
                if (shouldArchive(agent, config)) {
                    await archiveSession(session, messages, config, agent);
                }
            }
        }
    }
    catch (error) {
        console.error("Failed to archive session:", error);
    }
}
async function archiveAllSessions(client, config) {
    try {
        const sessionsResult = await client.session.list({});
        if (sessionsResult.data) {
            for (const sessionData of sessionsResult.data) {
                const session = sessionData;
                const messagesResult = await client.session.messages({ path: { id: session.id } });
                if (messagesResult.data && messagesResult.data.length > 0) {
                    const messages = messagesResult.data;
                    const agent = extractAgentFromMessages(messages);
                    if (shouldArchive(agent, config)) {
                        await archiveSession(session, messages, config, agent);
                    }
                }
            }
        }
    }
    catch (error) {
        console.error("Failed to archive sessions on startup:", error);
    }
}
function extractAgentFromMessages(messages) {
    if (messages.length === 0)
        return undefined;
    const firstMessage = messages[0];
    if (firstMessage && "agent" in firstMessage.info) {
        return firstMessage.info.agent;
    }
    return undefined;
}
export default ConversationArchiver;
//# sourceMappingURL=index.js.map