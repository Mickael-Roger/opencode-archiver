# Implementation Tasks

- [x] Project Setup
  - [x] Initialize TypeScript project with bun
  - [x] Create package.json with @opencode-ai/plugin dependency
  - [x] Configure tsconfig.json
  - [x] Set up source directory structure

- [x] Core Types Definition
  - [x] Define ArchiverConfig interface
  - [x] Define Session, Message, Part types (or import from SDK)
  - [x] Define TrackingData interface

- [x] Configuration Module
  - [x] Implement config loading from opencode.json
  - [x] Define default values
  - [x] Validate configuration schema
  - [x] Handle missing/invalid config gracefully

- [x] Tracking Module
  - [x] Implement tracking file read/write
  - [x] Implement isArchived(sessionId) check
  - [x] Implement markArchived(sessionId) function
  - [x] Handle missing/corrupt tracking file

- [x] Formatter Module
  - [x] Implement formatSessionHeader(session) → string
  - [x] Implement formatMessage(message, parts) → string
  - [x] Implement formatTextPart(part) → string
  - [x] Implement formatToolUsePart(part) → string
  - [x] Implement formatToolResultPart(part) → string
  - [x] Implement formatThinkingPart(part) → string
  - [x] Implement sessionToMarkdown(session, messages, config) → string

- [x] Archiver Module
  - [x] Implement getArchiveDir(config) → string
  - [x] Implement generateFilename(session) → string
  - [x] Implement shouldArchive(session, config) → boolean
  - [x] Implement archiveSession(session, client, config) → Promise<void>
  - [x] Implement archiveAllUnarchived(client, config) → Promise<void>

- [x] Plugin Entry Point
  - [x] Implement main plugin export
  - [x] Implement tui.command.execute hook
  - [x] Implement server.connected hook
  - [x] Add error handling and logging

- [x] File Operations
  - [x] Implement ensureDirectory(path) → Promise<void>
  - [x] Implement writeFile(path, content) → Promise<void>
  - [x] Handle path expansion (~ → home directory)

- [ ] Testing & Validation
  - [ ] Test with configured agent → should archive
  - [ ] Test with non-configured agent → should skip
  - [ ] Test /new trigger
  - [ ] Test server start trigger
  - [ ] Test duplicate prevention
  - [ ] Test various message part types
  - [ ] Test error scenarios

- [ ] Documentation
  - [ ] Update AGENTS.md with any new findings
  - [ ] Add usage examples to README.md
  - [ ] Document configuration options
