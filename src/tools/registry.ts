/**
 * Tool Registry for KiCAD MCP Server
 *
 * Centralizes all tool definitions and provides lookup/search functionality
 */

import { z } from "zod";
import { DEFAULT_MCP_PROFILE, McpProfile } from "../profiles.js";

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodObject<any> | z.ZodType<any>;
  // Handler will be registered separately in the existing tool files
}

export interface ToolCategory {
  name: string;
  description: string;
  tools: string[]; // Tool names in this category
}

interface AdditionalToolMetadata {
  name: string;
  category: string;
  description: string;
  profiles: readonly McpProfile[];
}

/**
 * Tool category definitions
 * Each category groups related tools for better organization
 */
export const toolCategories: ToolCategory[] = [
  {
    name: "board",
    description: "Board configuration: layers, mounting holes, zones, visualization",
    tools: [
      "add_layer",
      "set_active_layer",
      "get_layer_list",
      "add_mounting_hole",
      "add_board_text",
      "add_zone",
      "get_board_extents",
      "get_board_2d_view",
    ],
  },
  {
    name: "component",
    description: "Advanced component operations: edit, delete, search, group, annotate",
    tools: [
      "rotate_component",
      "delete_component",
      "edit_component",
      "find_component",
      "get_component_properties",
      "add_component_annotation",
      "group_components",
      "replace_component",
    ],
  },
  {
    name: "export",
    description: "File export for fabrication and documentation: Gerber, PDF, BOM, 3D models",
    tools: [
      "export_gerber",
      "export_pdf",
      "export_svg",
      "export_3d",
      "export_bom",
      "export_netlist",
      "export_position_file",
      "export_vrml",
    ],
  },
  {
    name: "drc",
    description: "Design rule checking and electrical validation: DRC, net classes, clearances",
    tools: [
      "set_design_rules",
      "get_design_rules",
      "run_drc",
      "add_net_class",
      "assign_net_to_class",
      "set_layer_constraints",
      "check_clearance",
      "get_drc_violations",
    ],
  },
  {
    name: "schematic",
    description:
      "Schematic operations: create, inspect, add/edit/delete components, wire connections, netlists, annotation",
    tools: [
      "create_schematic",
      "add_schematic_component",
      "list_schematic_components",
      "move_schematic_component",
      "rotate_schematic_component",
      "annotate_schematic",
      "add_schematic_wire",
      "delete_schematic_wire",
      "add_schematic_net_label",
      "delete_schematic_net_label",
      "add_no_connect",
      "connect_to_net",
      "connect_passthrough",
      "get_net_connections",
      "list_schematic_nets",
      "list_schematic_wires",
      "list_schematic_labels",
      "get_wire_connections",
      "generate_netlist",
      "sync_schematic_to_board",
      "get_schematic_view",
      "export_schematic_svg",
      "export_schematic_pdf",
      "add_schematic_text",
      "list_schematic_texts",
    ],
  },
  {
    name: "library",
    description: "Footprint library access: search, browse, get footprint information",
    tools: ["list_libraries", "search_footprints", "list_library_footprints", "get_footprint_info"],
  },
  {
    name: "routing",
    description: "Advanced routing operations: vias, copper pours",
    tools: ["add_via", "add_copper_pour"],
  },
  {
    name: "autoroute",
    description: "Freerouting autorouter: automatic PCB routing via Specctra DSN/SES",
    tools: ["autoroute", "export_dsn", "import_ses", "check_freerouting"],
  },
];

/**
 * Direct tools that are always visible (not routed)
 * These are the most frequently used tools
 */
export const directToolNames = [
  // Project lifecycle
  "create_project",
  "open_project",
  "save_project",
  "snapshot_project",
  "get_project_info",

  // Core PCB operations
  "place_component",
  "move_component",
  "add_net",
  "route_trace",
  "get_board_info",
  "set_board_size",

  // Board setup
  "add_board_outline",

  // Schematic essentials (always visible so AI uses them correctly)
  "add_schematic_component",
  "list_schematic_components",
  "annotate_schematic",
  "connect_passthrough",
  "connect_to_net",
  "add_schematic_net_label",

  // Schematic <-> PCB sync (F8 equivalent)
  "sync_schematic_to_board",

  // UI management
  "check_kicad_ui",
  "launch_kicad_ui",
];

const PROFILE_CATEGORY_NAMES: Record<McpProfile, readonly string[]> = {
  full: toolCategories.map((category) => category.name),
  schematic: ["schematic"],
  pcb: ["board", "component", "export", "drc", "library", "routing", "autoroute"],
};

const PROFILE_DIRECT_TOOL_NAMES: Record<McpProfile, readonly string[]> = {
  full: directToolNames,
  schematic: [
    "create_project",
    "open_project",
    "save_project",
    "snapshot_project",
    "get_project_info",
    "add_schematic_component",
    "list_schematic_components",
    "annotate_schematic",
    "connect_passthrough",
    "connect_to_net",
    "add_schematic_net_label",
    "check_kicad_ui",
    "launch_kicad_ui",
  ],
  pcb: [
    "create_project",
    "open_project",
    "save_project",
    "snapshot_project",
    "get_project_info",
    "place_component",
    "move_component",
    "add_net",
    "route_trace",
    "get_board_info",
    "set_board_size",
    "add_board_outline",
    "sync_schematic_to_board",
    "check_kicad_ui",
    "launch_kicad_ui",
  ],
};

const PROFILE_BLOCKED_CATEGORY_TOOL_NAMES: Record<McpProfile, ReadonlySet<string>> = {
  full: new Set<string>(),
  schematic: new Set(["sync_schematic_to_board"]),
  pcb: new Set<string>(),
};

const additionalToolMetadata: AdditionalToolMetadata[] = [
  {
    name: "list_tool_categories",
    category: "router",
    description: "list_tool_categories (router discovery)",
    profiles: ["full", "schematic", "pcb"],
  },
  {
    name: "get_category_tools",
    category: "router",
    description: "get_category_tools (router discovery)",
    profiles: ["full", "schematic", "pcb"],
  },
  {
    name: "search_tools",
    category: "router",
    description: "search_tools (router discovery)",
    profiles: ["full", "schematic", "pcb"],
  },
  {
    name: "import_svg_logo",
    category: "board",
    description: "import_svg_logo (board logo import)",
    profiles: ["full", "pcb"],
  },
  {
    name: "get_component_pads",
    category: "component",
    description: "get_component_pads (PCB component pads)",
    profiles: ["full", "pcb"],
  },
  {
    name: "get_component_list",
    category: "component",
    description: "get_component_list (PCB component listing)",
    profiles: ["full", "pcb"],
  },
  {
    name: "get_pad_position",
    category: "component",
    description: "get_pad_position (PCB pad coordinates)",
    profiles: ["full", "pcb"],
  },
  {
    name: "place_component_array",
    category: "component",
    description: "place_component_array (PCB placement helper)",
    profiles: ["full", "pcb"],
  },
  {
    name: "align_components",
    category: "component",
    description: "align_components (PCB alignment helper)",
    profiles: ["full", "pcb"],
  },
  {
    name: "duplicate_component",
    category: "component",
    description: "duplicate_component (PCB duplication helper)",
    profiles: ["full", "pcb"],
  },
  {
    name: "delete_trace",
    category: "routing",
    description: "delete_trace (routing helper)",
    profiles: ["full", "pcb"],
  },
  {
    name: "query_traces",
    category: "routing",
    description: "query_traces (routing query helper)",
    profiles: ["full", "pcb"],
  },
  {
    name: "get_nets_list",
    category: "routing",
    description: "get_nets_list (PCB net listing)",
    profiles: ["full", "pcb"],
  },
  {
    name: "modify_trace",
    category: "routing",
    description: "modify_trace (routing edit helper)",
    profiles: ["full", "pcb"],
  },
  {
    name: "create_netclass",
    category: "routing",
    description: "create_netclass (PCB netclass helper)",
    profiles: ["full", "pcb"],
  },
  {
    name: "route_differential_pair",
    category: "routing",
    description: "route_differential_pair (high-speed routing helper)",
    profiles: ["full", "pcb"],
  },
  {
    name: "refill_zones",
    category: "routing",
    description: "refill_zones (copper zone refill)",
    profiles: ["full", "pcb"],
  },
  {
    name: "route_pad_to_pad",
    category: "routing",
    description: "route_pad_to_pad (pad-to-pad routing)",
    profiles: ["full", "pcb"],
  },
  {
    name: "copy_routing_pattern",
    category: "routing",
    description: "copy_routing_pattern (routing reuse helper)",
    profiles: ["full", "pcb"],
  },
  {
    name: "delete_schematic_component",
    category: "schematic",
    description: "delete_schematic_component (schematic editing)",
    profiles: ["full", "schematic"],
  },
  {
    name: "edit_schematic_component",
    category: "schematic",
    description: "edit_schematic_component (schematic editing)",
    profiles: ["full", "schematic"],
  },
  {
    name: "set_schematic_component_property",
    category: "schematic",
    description: "set_schematic_component_property (schematic properties)",
    profiles: ["full", "schematic"],
  },
  {
    name: "remove_schematic_component_property",
    category: "schematic",
    description: "remove_schematic_component_property (schematic properties)",
    profiles: ["full", "schematic"],
  },
  {
    name: "get_schematic_component",
    category: "schematic",
    description: "get_schematic_component (schematic inspection)",
    profiles: ["full", "schematic"],
  },
  {
    name: "move_schematic_net_label",
    category: "schematic",
    description: "move_schematic_net_label (schematic editing)",
    profiles: ["full", "schematic"],
  },
  {
    name: "get_schematic_pin_locations",
    category: "schematic",
    description: "get_schematic_pin_locations (schematic geometry)",
    profiles: ["full", "schematic"],
  },
  {
    name: "get_net_at_point",
    category: "schematic",
    description: "get_net_at_point (schematic net analysis)",
    profiles: ["full", "schematic"],
  },
  {
    name: "run_erc",
    category: "schematic",
    description: "run_erc (schematic validation)",
    profiles: ["full", "schematic"],
  },
  {
    name: "get_schematic_view_region",
    category: "schematic",
    description: "get_schematic_view_region (schematic rendering helper)",
    profiles: ["full", "schematic"],
  },
  {
    name: "find_overlapping_elements",
    category: "schematic",
    description: "find_overlapping_elements (schematic geometry helper)",
    profiles: ["full", "schematic"],
  },
  {
    name: "get_elements_in_region",
    category: "schematic",
    description: "get_elements_in_region (schematic geometry helper)",
    profiles: ["full", "schematic"],
  },
  {
    name: "find_wires_crossing_symbols",
    category: "schematic",
    description: "find_wires_crossing_symbols (schematic DRC helper)",
    profiles: ["full", "schematic"],
  },
  {
    name: "list_floating_labels",
    category: "schematic",
    description: "list_floating_labels (schematic net analysis)",
    profiles: ["full", "schematic"],
  },
  {
    name: "find_orphaned_wires",
    category: "schematic",
    description: "find_orphaned_wires (schematic net analysis)",
    profiles: ["full", "schematic"],
  },
  {
    name: "snap_to_grid",
    category: "schematic",
    description: "snap_to_grid (schematic geometry helper)",
    profiles: ["full", "schematic"],
  },
  {
    name: "add_schematic_hierarchical_label",
    category: "schematic",
    description: "add_schematic_hierarchical_label (hierarchical schematic helper)",
    profiles: ["full", "schematic"],
  },
  {
    name: "add_sheet_pin",
    category: "schematic",
    description: "add_sheet_pin (hierarchical schematic helper)",
    profiles: ["full", "schematic"],
  },
  {
    name: "list_symbol_libraries",
    category: "symbol_library",
    description: "list_symbol_libraries (symbol library discovery)",
    profiles: ["full", "schematic"],
  },
  {
    name: "search_symbols",
    category: "symbol_library",
    description: "search_symbols (symbol library search)",
    profiles: ["full", "schematic"],
  },
  {
    name: "list_library_symbols",
    category: "symbol_library",
    description: "list_library_symbols (symbol library browse)",
    profiles: ["full", "schematic"],
  },
  {
    name: "get_symbol_info",
    category: "symbol_library",
    description: "get_symbol_info (symbol library details)",
    profiles: ["full", "schematic"],
  },
  {
    name: "create_symbol",
    category: "symbol_creator",
    description: "create_symbol (symbol creation)",
    profiles: ["full", "schematic"],
  },
  {
    name: "delete_symbol",
    category: "symbol_creator",
    description: "delete_symbol (symbol library editing)",
    profiles: ["full", "schematic"],
  },
  {
    name: "list_symbols_in_library",
    category: "symbol_creator",
    description: "list_symbols_in_library (custom symbol library browse)",
    profiles: ["full", "schematic"],
  },
  {
    name: "register_symbol_library",
    category: "symbol_creator",
    description: "register_symbol_library (symbol library registration)",
    profiles: ["full", "schematic"],
  },
  {
    name: "create_footprint",
    category: "footprint",
    description: "create_footprint (footprint creation)",
    profiles: ["full", "pcb"],
  },
  {
    name: "edit_footprint_pad",
    category: "footprint",
    description: "edit_footprint_pad (footprint editing)",
    profiles: ["full", "pcb"],
  },
  {
    name: "register_footprint_library",
    category: "footprint",
    description: "register_footprint_library (footprint library registration)",
    profiles: ["full", "pcb"],
  },
  {
    name: "list_footprint_libraries",
    category: "footprint",
    description: "list_footprint_libraries (footprint library browse)",
    profiles: ["full", "pcb"],
  },
  {
    name: "enrich_datasheets",
    category: "datasheet",
    description: "enrich_datasheets (schematic datasheet enrichment)",
    profiles: ["full"],
  },
  {
    name: "get_datasheet_url",
    category: "datasheet",
    description: "get_datasheet_url (LCSC datasheet lookup)",
    profiles: ["full"],
  },
  {
    name: "download_jlcpcb_database",
    category: "jlcpcb",
    description: "download_jlcpcb_database (JLCPCB catalog setup)",
    profiles: ["full"],
  },
  {
    name: "search_jlcpcb_parts",
    category: "jlcpcb",
    description: "search_jlcpcb_parts (JLCPCB part search)",
    profiles: ["full"],
  },
  {
    name: "get_jlcpcb_part",
    category: "jlcpcb",
    description: "get_jlcpcb_part (JLCPCB part details)",
    profiles: ["full"],
  },
  {
    name: "get_jlcpcb_database_stats",
    category: "jlcpcb",
    description: "get_jlcpcb_database_stats (JLCPCB database stats)",
    profiles: ["full"],
  },
  {
    name: "suggest_jlcpcb_alternatives",
    category: "jlcpcb",
    description: "suggest_jlcpcb_alternatives (JLCPCB part alternatives)",
    profiles: ["full"],
  },
];

// Build lookup maps at module load time
const categoryMap = new Map<string, ToolCategory>();
const toolCategoryMap = new Map<string, string>();

export function initializeRegistry() {
  // Build category map
  for (const category of toolCategories) {
    categoryMap.set(category.name, category);

    // Build tool -> category map
    for (const toolName of category.tools) {
      toolCategoryMap.set(toolName, category.name);
    }
  }
}

/**
 * Get a category by name
 */
export function getCategory(name: string): ToolCategory | undefined {
  return categoryMap.get(name);
}

function getCategoryNamesForProfile(profile: McpProfile): readonly string[] {
  return PROFILE_CATEGORY_NAMES[profile];
}

function getDirectToolNamesForProfile(profile: McpProfile): readonly string[] {
  return PROFILE_DIRECT_TOOL_NAMES[profile];
}

function getBlockedCategoryToolNames(profile: McpProfile): ReadonlySet<string> {
  return PROFILE_BLOCKED_CATEGORY_TOOL_NAMES[profile];
}

function getAdditionalToolMetadataForProfile(profile: McpProfile): AdditionalToolMetadata[] {
  return additionalToolMetadata.filter((tool) => tool.profiles.includes(profile));
}

function getAdditionalToolNamesForProfile(profile: McpProfile): string[] {
  return getAdditionalToolMetadataForProfile(profile).map((tool) => tool.name);
}

function getCategoryToolsForProfile(category: ToolCategory, profile: McpProfile): string[] {
  const blockedToolNames = getBlockedCategoryToolNames(profile);
  return category.tools.filter((toolName) => !blockedToolNames.has(toolName));
}

function isCategoryAllowed(profile: McpProfile, categoryName: string): boolean {
  return getCategoryNamesForProfile(profile).includes(categoryName);
}

function resolveProfile(profile: McpProfile | undefined): McpProfile {
  return profile ?? DEFAULT_MCP_PROFILE;
}

export function getDirectTools(profile?: McpProfile): string[] {
  return [...getDirectToolNamesForProfile(resolveProfile(profile))];
}

export function getCategoryForProfile(
  name: string,
  profile?: McpProfile,
): ToolCategory | undefined {
  const resolvedProfile = resolveProfile(profile);
  if (!isCategoryAllowed(resolvedProfile, name)) {
    return undefined;
  }

  const category = categoryMap.get(name);
  if (!category) {
    return undefined;
  }

  return {
    ...category,
    tools: getCategoryToolsForProfile(category, resolvedProfile),
  };
}

/**
 * Get the category name for a tool
 */
export function getToolCategory(toolName: string): string | undefined {
  return toolCategoryMap.get(toolName);
}

/**
 * Get all categories
 */
export function getAllCategories(): ToolCategory[] {
  return toolCategories;
}

export function getAllCategoriesForProfile(profile?: McpProfile): ToolCategory[] {
  const resolvedProfile = resolveProfile(profile);
  return toolCategories
    .filter((category) => isCategoryAllowed(resolvedProfile, category.name))
    .map((category) => ({
      ...category,
      tools: getCategoryToolsForProfile(category, resolvedProfile),
    }))
    .filter((category) => category.tools.length > 0);
}

/**
 * Get all routed tool names (excludes direct tools)
 */
export function getRoutedToolNames(): string[] {
  const allRoutedTools: string[] = [];
  for (const category of toolCategories) {
    allRoutedTools.push(...category.tools);
  }
  return allRoutedTools;
}

export function getRoutedToolNamesForProfile(profile?: McpProfile): string[] {
  const allRoutedTools: string[] = [];
  for (const category of getAllCategoriesForProfile(profile)) {
    allRoutedTools.push(...category.tools);
  }
  return allRoutedTools;
}

/**
 * Check if a tool is a direct tool
 */
export function isDirectTool(toolName: string): boolean {
  return directToolNames.includes(toolName);
}

export function isDirectToolForProfile(toolName: string, profile?: McpProfile): boolean {
  return getDirectToolNamesForProfile(resolveProfile(profile)).includes(toolName);
}

/**
 * Check if a tool is a routed tool
 */
export function isRoutedTool(toolName: string): boolean {
  return toolCategoryMap.has(toolName);
}

export function isRoutedToolForProfile(toolName: string, profile?: McpProfile): boolean {
  const categoryName = toolCategoryMap.get(toolName);
  if (!categoryName) {
    return false;
  }

  const resolvedProfile = resolveProfile(profile);
  return (
    isCategoryAllowed(resolvedProfile, categoryName) &&
    !getBlockedCategoryToolNames(resolvedProfile).has(toolName)
  );
}

/**
 * Search for tools by keyword
 * Searches tool names, descriptions, and category names
 */
export interface SearchResult {
  category: string;
  tool: string;
  description: string;
}

export function searchTools(query: string): SearchResult[] {
  return searchToolsForProfile(query);
}

export function searchToolsForProfile(query: string, profile?: McpProfile): SearchResult[] {
  const resolvedProfile = resolveProfile(profile);
  const q = query.toLowerCase();
  const matches: SearchResult[] = [];
  const seenToolNames = new Set<string>();

  const addMatch = (result: SearchResult) => {
    if (seenToolNames.has(result.tool)) {
      return;
    }

    seenToolNames.add(result.tool);
    matches.push(result);
  };

  // Search direct tools first
  for (const toolName of getDirectToolNamesForProfile(resolvedProfile)) {
    if (toolName.toLowerCase().includes(q)) {
      addMatch({
        category: "direct",
        tool: toolName,
        description: `${toolName} (direct tool — call directly by name)`,
      });
    }
  }

  // Search routed tools by name and category
  for (const category of getAllCategoriesForProfile(resolvedProfile)) {
    const categoryMatch =
      category.name.toLowerCase().includes(q) || category.description.toLowerCase().includes(q);

    for (const toolName of category.tools) {
      if (toolName.toLowerCase().includes(q) || categoryMatch) {
        addMatch({
          category: category.name,
          tool: toolName,
          description: `${toolName} (${category.name})`,
        });
      }
    }
  }

  for (const tool of getAdditionalToolMetadataForProfile(resolvedProfile)) {
    if (tool.name.toLowerCase().includes(q) || tool.description.toLowerCase().includes(q)) {
      addMatch({
        category: tool.category,
        tool: tool.name,
        description: tool.description,
      });
    }
  }

  return matches.slice(0, 20); // Limit results
}

/**
 * Get statistics about the tool registry
 */
export function getRegistryStats() {
  return getRegistryStatsForProfile();
}

export function getRegistryStatsForProfile(profile?: McpProfile) {
  const resolvedProfile = resolveProfile(profile);
  const routedToolCount = getRoutedToolNamesForProfile(resolvedProfile).length;
  const directToolCount = getDirectToolNamesForProfile(resolvedProfile).length;
  const additionalToolCount = getAdditionalToolNamesForProfile(resolvedProfile).length;
  const categories = getAllCategoriesForProfile(resolvedProfile);
  const totalToolCount = new Set([
    ...getDirectToolNamesForProfile(resolvedProfile),
    ...getRoutedToolNamesForProfile(resolvedProfile),
    ...getAdditionalToolNamesForProfile(resolvedProfile),
  ]).size;

  return {
    profile: resolvedProfile,
    total_categories: categories.length,
    total_routed_tools: routedToolCount,
    total_direct_tools: directToolCount,
    total_additional_tools: additionalToolCount,
    total_tools: totalToolCount,
    categories: categories.map((c) => ({
      name: c.name,
      tool_count: c.tools.length,
    })),
  };
}

// Initialize on module load
initializeRegistry();
