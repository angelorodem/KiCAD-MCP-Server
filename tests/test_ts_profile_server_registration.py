import json
import subprocess
from pathlib import Path

import pytest


REPO_ROOT = Path(__file__).resolve().parent.parent
DIST_INDEX = REPO_ROOT / "dist" / "index.js"


def _probe_server_profile(profile: str):
    if not DIST_INDEX.exists():
        pytest.skip("TypeScript build output is missing; run npm run build first")

    script = f"""
import {{ KiCADMcpServer }} from './dist/index.js';
const instance = new KiCADMcpServer('./python/kicad_interface.py', 'error', '{profile}');
const internal = instance.server;
const result = {{
  tools: Object.keys(internal._registeredTools ?? {{}}),
  prompts: Object.keys(internal._registeredPrompts ?? {{}}),
  resources: Object.keys(internal._registeredResources ?? {{}}).concat(
    Object.keys(internal._registeredResourceTemplates ?? {{}})
  ),
}};
console.log(JSON.stringify(result));
"""
    completed = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(completed.stdout)


@pytest.mark.unit
def test_schematic_profile_runtime_registration():
    result = _probe_server_profile("schematic")

    assert "sync_schematic_to_board" not in result["tools"]
    assert "kicad://project/summary" not in result["resources"]
    assert "component_placement_strategy" not in result["prompts"]
    assert "component_sourcing_properties" in result["prompts"]


@pytest.mark.unit
def test_pcb_profile_runtime_registration():
    result = _probe_server_profile("pcb")

    assert "sync_schematic_to_board" in result["tools"]
    assert "kicad://board/info" in result["resources"]
    assert "component_placement_strategy" in result["prompts"]
    assert "component_sourcing_properties" not in result["prompts"]


@pytest.mark.unit
def test_full_profile_runtime_registration():
    result = _probe_server_profile("full")

    assert "sync_schematic_to_board" in result["tools"]
    assert "kicad://project/summary" in result["resources"]
    assert "component_placement_strategy" in result["prompts"]
    assert "component_sourcing_properties" in result["prompts"]