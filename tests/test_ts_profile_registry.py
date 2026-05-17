import json
import subprocess
from pathlib import Path

import pytest


REPO_ROOT = Path(__file__).resolve().parent.parent
DIST_REGISTRY = REPO_ROOT / "dist" / "tools" / "registry.js"


def _run_registry_probe(expression: str):
    if not DIST_REGISTRY.exists():
        pytest.skip("TypeScript build output is missing; run npm run build first")

    command = [
        "node",
        "--input-type=module",
        "-e",
        (
            "import { "
            "getAllCategoriesForProfile, "
            "isDirectToolForProfile, "
            "searchToolsForProfile "
            f"}} from './dist/tools/registry.js'; {expression}"
        ),
    ]
    completed = subprocess.run(
        command,
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(completed.stdout)


@pytest.mark.unit
def test_schematic_profile_hides_pcb_discovery_tools():
    result = _run_registry_probe(
        "console.log(JSON.stringify({"
        "categories: getAllCategoriesForProfile('schematic').map((category) => category.name),"
        "syncIsDirect: isDirectToolForProfile('sync_schematic_to_board', 'schematic'),"
        "syncMatches: searchToolsForProfile('sync_schematic_to_board', 'schematic').length,"
        "gerberMatches: searchToolsForProfile('gerber', 'schematic').length,"
        "symbolMatches: searchToolsForProfile('create_symbol', 'schematic').length"
        "}));"
    )

    assert result["categories"] == ["schematic"]
    assert result["syncIsDirect"] is False
    assert result["syncMatches"] == 0
    assert result["gerberMatches"] == 0
    assert result["symbolMatches"] > 0


@pytest.mark.unit
def test_pcb_profile_keeps_sync_and_hides_schematic_discovery():
    result = _run_registry_probe(
        "console.log(JSON.stringify({"
        "categories: getAllCategoriesForProfile('pcb').map((category) => category.name),"
        "syncIsDirect: isDirectToolForProfile('sync_schematic_to_board', 'pcb'),"
        "schematicMatches: searchToolsForProfile('annotate', 'pcb').filter((match) => match.category === 'schematic').length,"
        "footprintMatches: searchToolsForProfile('create_footprint', 'pcb').length"
        "}));"
    )

    assert "schematic" not in result["categories"]
    assert result["syncIsDirect"] is True
    assert result["schematicMatches"] == 0
    assert result["footprintMatches"] > 0