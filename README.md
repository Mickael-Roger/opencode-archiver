# OpenCode Archiver

Automatically archive your OpenCode conversations to markdown files.

## Benefits

- **Never lose a conversation** - Your chats are automatically saved as readable markdown files
- **ChatGPT-like experience** - Use a dedicated "Chat" agent for conversational interactions with full history conservation
- **Organized archives** - Conversations are stored with dates and titles for easy browsing
- **Zero maintenance** - Archives are created automatically when you start a new session or when OpenCode starts

## Installation

Add the plugin to your `opencode.json` config file:

```json
{
  "plugin": ["opencode-archiver"]
}
```

That's it! The plugin will automatically start archiving conversations.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENCODE_ARCHIVER_DIRECTORY` | Directory where archives are stored | `~/.opencode-archives` |
| `OPENCODE_ARCHIVER_AGENTS` | Comma-separated list of agents to archive | `Chat` |

Example configuration in your shell:

```bash
export OPENCODE_ARCHIVER_DIRECTORY="~/my-archives"
export OPENCODE_ARCHIVER_AGENTS="Chat,Assistant,Helper"
```

## Using the Chat Agent (Recommended)

For a ChatGPT-like experience with persistent history, we recommend creating a dedicated "Chat" agent.

### Why Use a Chat Agent?

- **Focused conversations** - Keep general chats separate from coding tasks
- **History conservation** - All your conversations are archived and searchable
- **Consistent context** - Each archived session preserves the full conversation flow

### Setup

Create the file `~/.config/opencode/agent/Chat.md` with the following content:

```yaml
---
model: your-preferred-model
---

You are a helpful conversational assistant. Engage in natural dialogue, answer questions, 
and provide thoughtful responses. Maintain context throughout the conversation.
```

Replace `your-preferred-model` with your preferred model ID (e.g., `openrouter/anthropic/claude-3.5-sonnet`).

### How It Works

1. Start OpenCode and select the "Chat" agent
2. Have your conversation as you would with ChatGPT
3. When you start a new session, the previous one is automatically archived
4. Find your archived conversations in `~/.opencode-archives/`

## Archive Format

Archives are stored as markdown files with the naming convention:

```
YYYY-MM-DD-session-id.md
```

Each file contains:
- Title of the conversation
- Full message history with clear user/assistant separation

## Default Behavior

**By default, only conversations with the "Chat" agent are archived.**

To archive additional agents, set the `OPENCODE_ARCHIVER_AGENTS` environment variable with a comma-separated list:

```bash
export OPENCODE_ARCHIVER_AGENTS="Chat,CodingAssistant"
```
