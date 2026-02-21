# Project-Specific Agent Guidelines

## Overview
This project is an **opencode plugin** that automatically archives conversations to markdown files when specific conditions are met.

## Key Files
- `src/index.ts` - Main plugin entry point
- `src/archiver.ts` - Core archiving logic
- `src/formatter.ts` - Markdown formatting utilities
- `src/config.ts` - Configuration handling
- `DESIGN.md` - Plugin design documentation
- `TASKS.md` - Implementation task list

## Rules
- Use TypeScript with strict typing
- Follow opencode plugin patterns (see DESIGN.md)
- Import types from `@opencode-ai/plugin`
- Use `client.app.log()` for logging, not `console.log`
- All user-facing strings in English

## Development
- Build: `bun run build` (if applicable)
- Test: Manual testing via opencode TUI with plugin loaded

## Configuration
Users configure the plugin in their `opencode.json`:
```json
{
  "plugin": ["conversation-archiver"],
  "archiver": {
    "agents": ["general", "explore"],
    "outputDir": "~/.opencode-archives",
    "includeTools": true,
    "includeThinking": false
  }
}
```

## Lessons Learned
- (To be populated as issues arise)

## See Also
- [DESIGN.md](DESIGN.md) for detailed plugin architecture
- [TASKS.md](TASKS.md) for implementation progress
- https://opencode.ai/docs/plugins/ for plugin API reference
