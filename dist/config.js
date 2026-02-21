export const defaultConfig = {
    outputDir: "~/.opencode-archives",
    includeTools: true,
    includeThinking: false,
};
export function loadConfig(userConfig) {
    const config = { ...defaultConfig, ...userConfig };
    return config;
}
//# sourceMappingURL=config.js.map