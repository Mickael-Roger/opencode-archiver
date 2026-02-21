# Project-Specific Agent Guidelines

## Overview
This project is an **opencode plugin** that automatically archives conversations to markdown files when specific conditions are met.

## Key Files
- `DESIGN.md` - Plugin design documentation
- `TASKS.md` - Implementation task list

## Rules
- Use TypeScript with strict typing
- Follow opencode plugin patterns (see DESIGN.md)
- Import types from `@opencode-ai/plugin`
- Use `client.app.log()` for logging, not `console.log`
- All user-facing strings in English
- **STRICTLY follow user orders - only do exactly what is requested, do not add extra files or functionality beyond the explicit instruction**

## Development
- Test: Manual testing via opencode TUI with plugin loaded

## External Dependencies
Local plugins using external npm packages must declare them in:
- `~/.config/opencode/package.json` - Global config directory (NOT the plugins directory)

OpenCode runs `bun install` at startup to install these dependencies automatically.

**IMPORTANT: Never use `better-sqlite3` - it is not compatible with Bun. Use `bun:sqlite` instead.**

Example:
```json
{
  "dependencies": {
    "some-package": "^1.0.0"
  }
}
```

## See Also
- [DESIGN.md](DESIGN.md) for detailed plugin architecture
- [TASKS.md](TASKS.md) for implementation progress
- https://opencode.ai/docs/plugins/ for plugin API reference
