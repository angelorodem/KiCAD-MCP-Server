/**
 * Configuration handling for KiCAD MCP server
 */

import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { logger } from "./logger.js";
import { DEFAULT_MCP_PROFILE, MCP_PROFILE_VALUES, parseMcpProfile } from "./profiles.js";

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default config location
const DEFAULT_CONFIG_PATH = join(dirname(__dirname), "config", "default-config.json");
const LOG_LEVEL_VALUES = ["error", "warn", "info", "debug"] as const;
const LogLevelSchema = z.enum(LOG_LEVEL_VALUES);
const ProfileSchema = z.enum(MCP_PROFILE_VALUES);

/**
 * Server configuration schema
 */
const ConfigSchema = z.object({
  name: z.string().default("kicad-mcp-server"),
  version: z.string().default("1.0.0"),
  description: z.string().default("MCP server for KiCAD PCB design operations"),
  pythonPath: z.string().optional(),
  kicadPath: z.string().optional(),
  logLevel: LogLevelSchema.default("info"),
  profile: ProfileSchema.default(DEFAULT_MCP_PROFILE),
  logDir: z.string().optional(),
});

/**
 * Server configuration type
 */
export type Config = z.infer<typeof ConfigSchema>;

function getEnvLogLevel(): Config["logLevel"] | undefined {
  for (const envName of ["KICAD_MCP_LOG_LEVEL", "LOG_LEVEL"] as const) {
    const rawLevel = process.env[envName];
    if (!rawLevel) {
      continue;
    }

    const normalized = rawLevel.trim().toLowerCase();
    const level = normalized === "warning" ? "warn" : normalized;
    const parsed = LogLevelSchema.safeParse(level);
    if (!parsed.success) {
      const acceptedValues = [...LOG_LEVEL_VALUES, "warning"].join(", ");
      logger.warn(
        `Ignoring invalid ${envName} value: ${rawLevel}. Expected one of: ${acceptedValues}`,
      );
      continue;
    }

    return parsed.data;
  }

  return undefined;
}

function getEnvProfile(): Config["profile"] | undefined {
  const rawProfile = process.env.KICAD_MCP_PROFILE;
  if (!rawProfile) {
    return undefined;
  }

  const parsed = parseMcpProfile(rawProfile);
  if (parsed) {
    return parsed;
  }

  logger.warn(
    `Ignoring invalid KICAD_MCP_PROFILE value: ${rawProfile}. Expected one of: ${MCP_PROFILE_VALUES.join(", ")}`,
  );
  return undefined;
}

function applyEnvironmentOverrides(config: Config): Config {
  const envLogLevel = getEnvLogLevel();
  const envProfile = getEnvProfile();

  if (!envLogLevel && !envProfile) {
    return config;
  }

  return {
    ...config,
    logLevel: envLogLevel ?? config.logLevel,
    profile: envProfile ?? config.profile,
  };
}

/**
 * Load configuration from file
 *
 * @param configPath Path to the configuration file (optional)
 * @returns Loaded and validated configuration
 */
export async function loadConfig(configPath?: string): Promise<Config> {
  try {
    // Determine which config file to load
    const filePath = configPath || DEFAULT_CONFIG_PATH;

    // Check if file exists
    if (!existsSync(filePath)) {
      logger.warn(`Configuration file not found: ${filePath}, using defaults`);
      return applyEnvironmentOverrides(ConfigSchema.parse({}));
    }

    // Read and parse configuration
    const configData = await readFile(filePath, "utf-8");
    const config = JSON.parse(configData);

    // Validate configuration
    return applyEnvironmentOverrides(ConfigSchema.parse(config));
  } catch (error) {
    logger.error(`Error loading configuration: ${error}`);

    // Return default configuration
    return applyEnvironmentOverrides(ConfigSchema.parse({}));
  }
}
