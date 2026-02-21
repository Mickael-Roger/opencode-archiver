# Conversation Archiver Plugin - Design Document

## Overview

A plugin for opencode that automatically archives conversations to markdown files when:
1. User executes `/new` command (archive current session before new one starts)
2. Opencode server starts (archive orphaned sessions from previous runs)

Only sessions using configured agents are archived.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Opencode Runtime                         │
│  ┌─────────────────┐    ┌─────────────────────────────────┐│
│  │   TUI Client    │    │         Server + SDK            ││
│  │  (triggers /new)│    │  client.session.messages()      ││
│  └────────┬────────┘    │  client.session.list()          ││
│           │             └──────────────┬──────────────────┘│
│           │                            │                    │
│           ▼                            ▼                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Conversation Archiver Plugin               ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  ││
│  │  │   Hooks     │  │  Archiver   │  │   Formatter     │  ││
│  │  │ - /new      │  │  - filter   │  │   - markdown    │  ││
│  │  │ - startup   │  │  - write    │  │   - parts       │  ││
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  ~/.opencode-archives/  │
              │  YYYY-MM-DD_HH-MM_ID.md │
              └─────────────────────────┘
```

## Plugin Hooks

### `tui.command.execute`
Fires when a TUI command is executed. We intercept `/new` to:
1. Get current session ID
2. Check if session should be archived (agent filter)
3. Archive session to markdown
4. Allow `/new` to proceed

### `server.connected`
Fires when opencode server starts. Used to:
1. List all existing sessions
2. Compare against already-archived sessions
3. Archive any unarchived sessions matching agent filter

## Data Flow

### Session Retrieval
```
client.session.list()           → Session[] (metadata only)
client.session.get({ path: id }) → Session (full details)
client.session.messages({ path: id }) → { info, parts }[]
```

### Message Parts Types
- `text` - User/assistant text content
- `tool_use` - Tool invocation request
- `tool_result` - Tool execution result
- `thinking` - Model reasoning (optional include)

## Configuration Schema

```typescript
interface ArchiverConfig {
  agents: string[]        // Agent names to archive (required)
  outputDir: string       // Output directory (default: ~/.opencode-archives)
  includeTools: boolean   // Include tool executions (default: true)
  includeThinking: boolean // Include thinking blocks (default: false)
}
```

### Default Values
```typescript
const defaults: Partial<ArchiverConfig> = {
  outputDir: "~/.opencode-archives",
  includeTools: true,
  includeThinking: false
}
```

## File Naming Convention

```
YYYY-MM-DD_HH-MM_sessionID.md

Example: 2026-02-21_14-30_abc123def456.md
```

## Markdown Output Format

```markdown
# [Session Title]

| Field | Value |
|-------|-------|
| Session ID | abc123def456 |
| Agent | general |
| Created | 2026-02-21 14:30 |
| Project | /path/to/project |

---

## Conversation

### User

Can you help me understand the auth flow?

### Assistant

I'll analyze the authentication flow in this codebase.

**Tool: read**
```
File: src/auth/index.ts
```

The authentication module exports...

### User

Can you add JWT support?

### Assistant

I'll implement JWT authentication support...
```

## Duplicate Prevention

Two strategies:

### Option A: Filename Check
- Before archiving, check if `{outputDir}/*_{sessionId}.md` exists
- Simple but requires file system scan

### Option B: Tracking File (Chosen)
- Maintain `{outputDir}/.archive_tracking.json`
- Contains array of archived session IDs
- Fast lookup, single file to manage

```json
{
  "version": 1,
  "archivedSessions": ["abc123", "def456", ...]
}
```

## Error Handling

1. **Config not found**: Use defaults, log warning
2. **Session fetch fails**: Log error, skip session
3. **File write fails**: Log error, don't crash opencode
4. **Invalid agent list**: Log warning, archive all sessions

All errors logged via `client.app.log({ level: "error", ... })`

## Module Structure

```
src/
├── index.ts          # Plugin entry point, hook definitions
├── archiver.ts       # Core archiving orchestration
├── config.ts         # Configuration loading and validation
├── formatter.ts      # Session to markdown conversion
├── tracking.ts       # Duplicate prevention logic
└── types.ts          # TypeScript interfaces
```

## Dependencies

- `@opencode-ai/plugin` - Plugin types and utilities
- Bun built-ins for file operations (`Bun.file`, etc.)

No external npm dependencies required.

## Testing Strategy

1. **Manual Testing**
   - Load plugin in opencode
   - Trigger `/new` with various agents
   - Restart opencode to test startup archiving
   - Verify markdown output

2. **Test Scenarios**
   - Session with configured agent → archived
   - Session with non-configured agent → skipped
   - Already archived session → not re-archived
   - Empty session → handled gracefully

## Future Enhancements

- [ ] Custom markdown templates
- [ ] Archive on session.idle (immediate archiving)
- [ ] Delete archived sessions from opencode DB
- [ ] Archive search/filter command
- [ ] Compression of old archives
