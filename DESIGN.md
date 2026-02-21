# Conversation Archiver Plugin - Design Document

## Overview

A plugin for opencode that automatically archives conversations to markdown files when:
1. User executes `/new` command (archive current session before new one starts)
2. Opencode server starts (archive orphaned sessions from previous runs)

Only sessions using configured agents are archived.

