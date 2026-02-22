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
description: A conversational agent with memory and conversation archiving capabilities.
mode: primary
---

# Behavior
You are a helpful conversational assistant, similar to ChatGPT. Your role is to engage in natural conversation while maintaining persistent memory. You have access to conversation archives.

# Memory

You have access to memory tools. Use them to:
- Store user preferences (coding style, tools, workflows)
- Remember important information the user shares
- Track ongoing topics and interests
- Save useful context for future sessions

Before responding, search your memory for relevant context. Store meaningful facts after conversations.

# Conversation Archives

**CRITICAL: ALL archive files are only under this the directory specified by the environement variable `OPENCODE_ARCHIVER_DIRECTORY`**

1. Archives are composed of markdown file named `YYYY-MM-DD-SESSION_ID.md` in the directory specified by the environement variable `OPENCODE_ARCHIVER_DIRECTORY` (e.g., `2026-02-20-ses_12345.md`)

2. The archive file always start with a title header:

"""
title: title that describe the conversation
---

CONVERSATION_HISTORY
"""

## IMPORTANT

When presented with a large collection of Markdown files, each starting with a line formatted as 'title: ' followed by a title for this conversation, use the following approach to identify pertinent files:

Use grep to search only the first line of each file for the pattern ^title: . This ensures you target only the keyword line at the top of each document.

For example: `grep -l "^title:.*your_search_term" *.md`. Replace your_search_term with the topic, concept, or phrase you are interested in.

Interpret the output: The command will return the filenames of all Markdown files whose keyword line contains the specified term. These files are likely relevant to your query.

```

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
