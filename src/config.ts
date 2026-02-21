import type { ArchiverConfig } from "./types.js"

export const defaultConfig: Partial<ArchiverConfig> = {
  outputDir: "~/.opencode-archives",
  includeTools: true,
  includeThinking: false,
}

export function loadConfig(userConfig: unknown): ArchiverConfig {
  const config = { ...defaultConfig, ...(userConfig as Record<string, unknown>) } as ArchiverConfig
  return config
}