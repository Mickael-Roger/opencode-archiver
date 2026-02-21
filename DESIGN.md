# Conversation Archiver Plugin - Design Document

## Overview

A plugin for opencode that automatically archives conversations to markdown files when:
1. User executes `/new` command (archive current session before new one starts)
2. Opencode server starts (archive orphaned sessions from previous runs)

Only sessions using configured agents are archived.

## Installation & Dependencies

### External Dependencies
This plugin requires the `better-sqlite3` package to read from opencode's SQLite database.

For local plugin installation, dependencies must be declared in:
- `~/.config/opencode/package.json` - Global config directory

Example `~/.config/opencode/package.json`:
```json
{
  "dependencies": {
    "better-sqlite3": "^11.8.1"
  }
}
```

OpenCode automatically runs `bun install` at startup to install dependencies declared in this file.

