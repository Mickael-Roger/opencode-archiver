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

## Development
- Test: Manual testing via opencode TUI with plugin loaded

## See Also
- [DESIGN.md](DESIGN.md) for detailed plugin architecture
- [TASKS.md](TASKS.md) for implementation progress
- https://opencode.ai/docs/plugins/ for plugin API reference
