export const MCP_PROFILE_VALUES = ["full", "schematic", "pcb"] as const;

export type McpProfile = (typeof MCP_PROFILE_VALUES)[number];

export const DEFAULT_MCP_PROFILE: McpProfile = "full";

export function parseMcpProfile(value: string | undefined): McpProfile | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if ((MCP_PROFILE_VALUES as readonly string[]).includes(normalized)) {
    return normalized as McpProfile;
  }

  return undefined;
}

export function supportsPcbTools(profile: McpProfile): boolean {
  return profile === "full" || profile === "pcb";
}

export function supportsSchematicTools(profile: McpProfile): boolean {
  return profile === "full" || profile === "schematic";
}