# Router Architecture Design

## Overview

The router in the current KiCAD MCP Server is a discovery layer, not an execution gateway.
The live server registers callable MCP tools directly and uses the router metadata to help
clients discover which tool names are relevant for a given task.

The router metadata is also profile-aware. The TypeScript layer can expose the server as:

- `full` - complete tool surface
- `schematic` - schematic-first workflow surface
- `pcb` - PCB-first workflow surface

## Current Model

### Direct tools

`src/tools/registry.ts` marks a subset of high-frequency tools as direct tools. These are
meant to be easy to discover and call directly by name.

### Routed categories

The registry also groups many tools into 8 discovery categories:

- `board`
- `component`
- `export`
- `drc`
- `schematic`
- `library`
- `routing`
- `autoroute`

These category labels are discovery metadata only. Routed tools are still individually
registered MCP tools when the active profile allows them.

### Specialized tools outside routed categories

Some tool families are registered directly but are not part of the routed category lists,
for example symbol creation, footprint creation, datasheet helpers, and JLCPCB helpers.

## Router Tools

The live server exposes three router tools:

1. `list_tool_categories`
2. `get_category_tools`
3. `search_tools`

There is no live `execute_tool` router tool. Once a client finds the desired tool name,
it should call that MCP tool directly.

## Profile Filtering

Profile filtering happens in two places:

1. `src/server.ts` controls which tools, resources, and prompts are registered at all.
2. `src/tools/registry.ts` and `src/tools/router.ts` filter discovery results so the
    router does not advertise tools outside the active profile.

Current profile behavior:

- `full` exposes all direct tools, all routed categories, and the additional specialist tools.
- `schematic` exposes the `schematic` discovery category plus shared project/UI tools.
- `pcb` exposes `board`, `component`, `export`, `drc`, `library`, `routing`, and `autoroute`
   plus shared project/UI tools and `sync_schematic_to_board`.

`sync_schematic_to_board` is intentionally not exposed in the `schematic` profile even though
the implementation lives in `src/tools/schematic.ts`.

## Implementation Files

- `src/server.ts` - authoritative registration gate for tools, resources, prompts, and profiles
- `src/profiles.ts` - profile enum and basic helpers
- `src/tools/registry.ts` - direct/routed metadata plus profile-aware category and search helpers
- `src/tools/router.ts` - discovery tools that filter their output by active profile

## Practical Guidance
- ✅ Tool discovery time: <2 calls (search → execute)
- ✅ User experience: Unchanged (seamless)
- ✅ Maintainability: Improved (organized categories)
- ✅ Scalability: Can add 100+ more tools easily
