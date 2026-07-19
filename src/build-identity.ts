import packageManifest from "../package.json" with { type: "json" };

export const forgeVersion = packageManifest.version;
export const forgeChannel = "local";
export const forgeCommit = "unknown";
