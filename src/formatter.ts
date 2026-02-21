import type { Session, Message, Part, ArchiverConfig, TextPart, ToolPart, ReasoningPart } from "./types.js"

export function formatSessionHeader(session: Session, agent?: string): string {
  const date = session.time?.created 
    ? new Date(session.time.created).toISOString().slice(0, 16).replace("T", " ")
    : "Unknown"
  
  return `# ${session.title ?? "Untitled Session"}

| Field | Value |
|-------|-------|
| Session ID | ${session.id} |
| Agent | ${agent ?? "unknown"} |
| Created | ${date} |
| Directory | ${session.directory ?? "N/A"} |
`
}

export function formatMessage(message: Message, parts: Part[], config: ArchiverConfig): string {
  const role = message.role === "user" ? "User" : "Assistant"
  let content = `### ${role}\n\n`
  
  for (const part of parts) {
    content += formatPart(part, config)
  }
  
  return content
}

function formatPart(part: Part, config: ArchiverConfig): string {
  switch (part.type) {
    case "text":
      return formatTextPart(part)
    case "tool":
      return config.includeTools ? formatToolPart(part) : ""
    case "reasoning":
      return config.includeThinking ? formatReasoningPart(part) : ""
    default:
      return ""
  }
}

function formatTextPart(part: TextPart): string {
  return `${part.text}\n\n`
}

function formatToolPart(part: ToolPart): string {
  const state = part.state
  let result = `**Tool: ${part.tool}**\n\n`
  
  if (state.status === "completed") {
    result += `Input:\n\`\`\`json\n${JSON.stringify(state.input, null, 2)}\n\`\`\`\n\n`
    result += `Output:\n\`\`\`\n${state.output}\n\`\`\`\n\n`
  } else if (state.status === "error") {
    result += `Error: ${state.error}\n\n`
  }
  
  return result
}

function formatReasoningPart(part: ReasoningPart): string {
  return `> **Reasoning:**\n> ${part.text.split("\n").join("\n> ")}\n\n`
}

export function sessionToMarkdown(session: Session, messages: Message[], partsByMessage: Map<string, Part[]>, config: ArchiverConfig, agent?: string): string {
  let markdown = formatSessionHeader(session, agent)
  markdown += "\n---\n\n## Conversation\n\n"
  
  for (const message of messages) {
    const parts = partsByMessage.get(message.id) ?? []
    markdown += formatMessage(message, parts, config)
  }
  
  return markdown
}