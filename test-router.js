/**
 * Quick test of router tool registry
 * Run with: node test-router.js
 */

import {
  getAllCategoriesForProfile,
  searchToolsForProfile,
  getRegistryStatsForProfile,
  isDirectToolForProfile,
} from "./dist/tools/registry.js";

const requestedProfile = process.argv.includes("--profile")
  ? process.argv[process.argv.indexOf("--profile") + 1]
  : undefined;
const profiles = requestedProfile ? [requestedProfile] : ["full", "schematic", "pcb"];

console.log("=".repeat(70));
console.log("KICAD MCP ROUTER - TEST");
console.log("=".repeat(70));

for (const profile of profiles) {
  console.log(`\n📊 Registry Statistics (${profile}):`);
  const stats = getRegistryStatsForProfile(profile);
  console.log(JSON.stringify(stats, null, 2));

  console.log(`\n📁 Tool Categories (${profile}):`);
  const categories = getAllCategoriesForProfile(profile);
  categories.forEach((cat) => {
    console.log(`  - ${cat.name}: ${cat.description} (${cat.tools.length} tools)`);
  });

  console.log(`\n🔍 Search Test (${profile}): \"gerber\"`);
  const results = searchToolsForProfile("gerber", profile);
  console.log(`Found ${results.length} matches:`);
  results.forEach((result) => {
    console.log(`  - ${result.tool} (${result.category})`);
  });

  console.log(`\n✅ Direct Tools Test (${profile}):`);
  console.log(`  - create_project is direct: ${isDirectToolForProfile("create_project", profile)}`);
  console.log(`  - place_component is direct: ${isDirectToolForProfile("place_component", profile)}`);
  console.log(`  - sync_schematic_to_board is direct: ${isDirectToolForProfile("sync_schematic_to_board", profile)}`);
  console.log(`  - add_via is direct: ${isDirectToolForProfile("add_via", profile)}`);
}

console.log("\n" + "=".repeat(70));
console.log("✅ Router tests complete!");
console.log("=".repeat(70));
