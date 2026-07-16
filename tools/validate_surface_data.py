#!/usr/bin/env python3
"""Validate surface data, page mappings, and generated figure files."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import numpy as np
import yaml

try:
    from tools.generate_surface_figures import (
        CRYSTALS, SPECS, cut_polyhedron, plane_intersections, unit_slab,
    )
    from tools.site_geometry import derive_surface_sites
except ModuleNotFoundError:
    from generate_surface_figures import (
        CRYSTALS, SPECS, cut_polyhedron, plane_intersections, unit_slab,
    )
    from site_geometry import derive_surface_sites


ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "_data" / "surfaces.yml"
FAMILIES_FILE = ROOT / "_data" / "crystal_families.yml"
SITE_GEOMETRY_FILE = ROOT / "_data" / "site_geometry.yml"
PUBLIC_DIR = ROOT / "surface-atlas"
ASSETS_DIR = PUBLIC_DIR / "assets" / "surfaces"
PAGES_DIR = PUBLIC_DIR / "surface-sites"

REQUIRED_SURFACE_FIELDS = {
    "id", "crystal", "title", "lattice", "facet", "ase_builder", "surface_shape",
    "description", "cut_description", "math_summary", "sites", "ase_example",
    "common_mistakes", "figures",
}
REQUIRED_SITE_FIELDS = {"label", "marker", "definition", "coordination"}
REQUIRED_FIGURES = {"top", "profile", "stacking"}
SUPPORTED_CRYSTALS = {"fcc", "bcc", "hcp", "sc", "sh", "bct"}
REQUIRED_NEW_SURFACES = {
    "sc-100", "sc-110", "sc-111", "sc-210", "sc-211",
    "sh-0001", "sh-10m10", "sh-11m20", "sh-10m11",
    "bct-001", "bct-100", "bct-110", "bct-101", "bct-111", "bct-211",
}
ASE_SITE_KEYWORDS = {
    "fcc-100": {"ontop", "bridge", "hollow"},
    "fcc-110": {"ontop", "shortbridge", "longbridge", "hollow"},
    "fcc-111": {"ontop", "bridge", "fcc", "hcp"},
    "bcc-100": {"ontop", "bridge", "hollow"},
    "bcc-110": {"ontop", "shortbridge", "longbridge", "hollow"},
    "bcc-111": {"ontop", "hollow"},
    "hcp-0001": {"ontop", "bridge", "fcc", "hcp"},
    "hcp-10m10": {"ontop"},
}


def page_surface_id(path: Path) -> str | None:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"^surface_id:\s*([^\s#]+)\s*$", text, flags=re.MULTILINE)
    return match.group(1).strip('"\'') if match else None


def projected_layer_match(slab, uv: list[float], layer_number: int) -> bool:
    z = slab.positions[:, 2]
    levels = sorted({round(float(value), 6) for value in z}, reverse=True)
    scaled = slab.get_scaled_positions(wrap=True)
    points = scaled[np.isclose(z, levels[layer_number - 1], atol=1e-4), :2]
    metric = slab.cell[:2, :2]
    target = np.asarray(uv)
    return any(
        np.linalg.norm((np.mod(point - target + 0.5, 1.0) - 0.5) @ metric) < 2e-3
        for point in points
    )


def validate() -> list[str]:
    errors: list[str] = []
    try:
        surfaces = yaml.safe_load(DATA_FILE.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as exc:
        return [f"Cannot load {DATA_FILE}: {exc}"]

    if not isinstance(surfaces, list):
        return ["_data/surfaces.yml must contain a top-level list"]

    try:
        stored_geometry = yaml.safe_load(SITE_GEOMETRY_FILE.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as exc:
        return [f"Cannot load {SITE_GEOMETRY_FILE}: {exc}"]
    if not isinstance(stored_geometry, dict):
        return ["_data/site_geometry.yml must contain a top-level mapping"]

    ids: set[str] = set()
    for index, surface in enumerate(surfaces, start=1):
        if not isinstance(surface, dict):
            errors.append(f"Surface entry {index} is not a mapping")
            continue
        surface_id = str(surface.get("id", f"entry-{index}"))
        missing = REQUIRED_SURFACE_FIELDS - surface.keys()
        if missing:
            errors.append(f"{surface_id}: missing fields {sorted(missing)}")
        for field in REQUIRED_SURFACE_FIELDS - {"sites", "figures", "common_mistakes"}:
            if field in surface and (surface[field] is None or str(surface[field]).strip() == ""):
                errors.append(f"{surface_id}: field {field!r} must not be empty")
        if surface_id in ids:
            errors.append(f"{surface_id}: duplicate surface id")
        ids.add(surface_id)
        if surface.get("crystal") not in SUPPORTED_CRYSTALS:
            errors.append(f"{surface_id}: crystal must be one of {sorted(SUPPORTED_CRYSTALS)}")

        sites = surface.get("sites", [])
        if not isinstance(sites, list) or not sites:
            errors.append(f"{surface_id}: sites must be a non-empty list")
        else:
            markers: set[int] = set()
            for site_index, site in enumerate(sites, start=1):
                if not isinstance(site, dict):
                    errors.append(f"{surface_id}: site {site_index} is not a mapping")
                    continue
                site_missing = REQUIRED_SITE_FIELDS - site.keys()
                if site_missing:
                    errors.append(f"{surface_id}: site {site_index} missing {sorted(site_missing)}")
                for field in REQUIRED_SITE_FIELDS - {"marker", "coordination"}:
                    if field in site and (site[field] is None or str(site[field]).strip() == ""):
                        errors.append(
                            f"{surface_id}: site {site_index} field {field!r} must not be empty"
                        )
                marker = site.get("marker")
                if not isinstance(marker, int) or marker < 1:
                    errors.append(f"{surface_id}: site {site_index} has invalid marker {marker!r}")
                elif marker in markers:
                    errors.append(f"{surface_id}: duplicate marker {marker}")
                else:
                    markers.add(marker)
                coordination = site.get("coordination")
                if not isinstance(coordination, int) or coordination < 1:
                    errors.append(
                        f"{surface_id}: site {site_index} has invalid coordination {coordination!r}"
                    )
                if site.get("ase_status") not in {None, "source-only"}:
                    errors.append(
                        f"{surface_id}: site {site_index} has invalid ASE status {site.get('ase_status')!r}"
                    )
            expected_markers = set(range(1, len(sites) + 1))
            if markers != expected_markers:
                errors.append(f"{surface_id}: site markers must be contiguous from 1")
            actual_keywords = {site["ase_keyword"] for site in sites if site.get("ase_keyword")}
            expected_keywords = ASE_SITE_KEYWORDS.get(surface_id, set())
            if actual_keywords != expected_keywords:
                errors.append(
                    f"{surface_id}: ASE keywords {sorted(actual_keywords)} do not match "
                    f"expected {sorted(expected_keywords)}"
                )

        spec = SPECS.get(surface_id)
        if spec is None:
            errors.append(f"{surface_id}: no mathematical visual specification")
        else:
            try:
                slab = unit_slab(spec)
                if abs(float(slab.cell[0, 2])) > 1e-8 or abs(float(slab.cell[1, 2])) > 1e-8:
                    errors.append(f"{surface_id}: in-plane cell vectors are not perpendicular to the surface normal")
                if np.linalg.norm(np.cross(slab.cell[0], slab.cell[1])) < 1e-8:
                    errors.append(f"{surface_id}: surface cell has zero area")
                levels = sorted({round(float(value), 6) for value in slab.positions[:, 2]})
                if len(levels) < 10:
                    errors.append(f"{surface_id}: expected at least 10 atom-bearing layers, found {len(levels)}")
                if spec.crystal in {"fcc", "bcc", "sc"}:
                    d_hkl = CRYSTALS[spec.crystal]["a"] / np.linalg.norm(spec.miller)
                    gaps = np.diff(levels)
                    ratio = d_hkl / float(np.median(gaps))
                    if min(abs(ratio - 1), abs(ratio - 2)) > 2e-5:
                        errors.append(f"{surface_id}: atomic-layer spacing is inconsistent with d_hkl")
                elif spec.crystal == "bct":
                    h, k, l = spec.miller
                    a = CRYSTALS["bct"]["a"]
                    c = CRYSTALS["bct"]["c"]
                    d_hkl = 1 / np.sqrt((h * h + k * k) / (a * a) + l * l / (c * c))
                    gaps = np.diff(levels)
                    ratio = d_hkl / float(np.median(gaps))
                    if min(abs(ratio - 1), abs(ratio - 2)) > 2e-5:
                        errors.append(f"{surface_id}: atomic-layer spacing is inconsistent with tetragonal d_hkl")
                derived = derive_surface_sites(surface_id, slab, sites)
                stored_entry = stored_geometry.get(surface_id, {})
                if stored_entry.get("sites") != derived:
                    errors.append(f"{surface_id}: stored site geometry is stale or not geometry-derived")
                registry_checks = {
                    "fcc-111": ((2, 3, True), (3, 2, True)),
                    "hcp-0001": ((2, 2, False), (3, 2, True)),
                    "bcc-111": ((3, 3, True),),
                    "sc-111": ((2, 2, True), (3, 3, True)),
                    "sh-0001": ((2, 2, False),),
                    "bct-001": ((2, 2, True),),
                    "bct-100": ((3, 2, True),),
                    "bct-110": ((2, 2, True),),
                }
                for site_index, layer_number, expected in registry_checks.get(surface_id, ()):
                    actual = projected_layer_match(slab, derived[site_index]["uv"], layer_number)
                    if actual != expected:
                        errors.append(
                            f"{surface_id}: site {site_index + 1} has incorrect L{layer_number} registry"
                        )
            except (ValueError, IndexError, KeyError) as exc:
                errors.append(f"{surface_id}: cannot derive site geometry: {exc}")

            try:
                vertices, edges, atoms, normal = cut_polyhedron(spec)
                if np.linalg.norm(normal) < 1e-12:
                    errors.append(f"{surface_id}: reciprocal plane normal is zero")
                offset = float(vertices.mean(axis=0) @ normal)
                polygon = plane_intersections(vertices, edges, normal, offset)
                residual = np.max(np.abs(polygon @ normal - offset))
                if residual > 1e-8:
                    errors.append(f"{surface_id}: bulk-cut polygon is not in the requested Miller plane")
                if spec.crystal in {"fcc", "bcc", "sc"} and not np.allclose(normal, spec.miller):
                    errors.append(f"{surface_id}: cubic reciprocal normal does not equal [hkl]")
                if spec.crystal == "hcp" and len(atoms) != 17:
                    errors.append(f"{surface_id}: HCP conventional-cell drawing must contain 17 displayed atom positions")
                if spec.crystal == "sh" and len(atoms) != 14:
                    errors.append(f"{surface_id}: SH conventional-cell drawing must contain 14 displayed atom positions")
                if spec.crystal == "bct":
                    c_over_a = CRYSTALS["bct"]["c"] / CRYSTALS["bct"]["a"]
                    expected_normal = np.array((spec.miller[0], spec.miller[1], spec.miller[2] / c_over_a))
                    if not np.allclose(normal, expected_normal):
                        errors.append(f"{surface_id}: tetragonal reciprocal normal does not use independent a and c")
            except (ValueError, IndexError) as exc:
                errors.append(f"{surface_id}: cannot validate Miller-plane cut: {exc}")

        figures = surface.get("figures", {})
        if not isinstance(figures, dict):
            errors.append(f"{surface_id}: figures must be a mapping")
        else:
            missing_figures = REQUIRED_FIGURES - figures.keys()
            if missing_figures:
                errors.append(f"{surface_id}: missing figure types {sorted(missing_figures)}")
            for figure_type, url in figures.items():
                if not isinstance(url, str) or not url.startswith("/"):
                    errors.append(f"{surface_id}: figure {figure_type} must be a root-relative path")
                    continue
                path = PUBLIC_DIR / url.lstrip("/")
                if not path.is_file():
                    errors.append(f"{surface_id}: figure does not exist: {url}")

        cut_path = ASSETS_DIR / f"{surface_id}-cut.svg"
        if not cut_path.is_file():
            errors.append(f"{surface_id}: bulk-cut figure does not exist")
        viewer_path = ASSETS_DIR / f"{surface_id}-viewer.json"
        try:
            viewer = json.loads(viewer_path.read_text(encoding="utf-8"))
            for key in ("surface", "atoms", "bonds", "sites", "siteDisplay", "cell"):
                if key not in viewer:
                    errors.append(f"{surface_id}: viewer geometry missing {key!r}")
            if viewer.get("surface") != surface_id:
                errors.append(f"{surface_id}: viewer geometry has wrong surface id")
            if not viewer.get("atoms"):
                errors.append(f"{surface_id}: viewer geometry contains no atoms")
            atom_count = len(viewer.get("atoms", []))
            for bond in viewer.get("bonds", []):
                if (not isinstance(bond, list) or len(bond) != 2 or
                        any(not isinstance(value, int) or value < 0 or value >= atom_count for value in bond)):
                    errors.append(f"{surface_id}: viewer geometry contains an invalid bond {bond!r}")
                    break
            viewer_sites = viewer.get("sites", [])
            if len(viewer_sites) != len(sites):
                errors.append(f"{surface_id}: viewer site count does not match surface data")
            elif [entry.get("label") for entry in viewer_sites] != [entry.get("label") for entry in sites]:
                errors.append(f"{surface_id}: viewer site labels do not match surface data")
            elif [entry.get("aseKeyword") for entry in viewer_sites] != [entry.get("ase_keyword") for entry in sites]:
                errors.append(f"{surface_id}: viewer ASE keywords do not match surface data")
            elif spec is not None and surface_id in stored_geometry:
                top = max(atom["z"] for atom in viewer.get("atoms", []))
                nearest = CRYSTALS[spec.crystal]["nearest"]
                display_lift = round(nearest * 0.55, 4)
                expected_z = [round(top + display_lift, 4)] * len(stored_geometry[surface_id]["sites"])
                actual_z = [entry.get("z") for entry in viewer_sites]
                if len(actual_z) != len(expected_z) or any(
                    actual is None or abs(actual - expected) > 2e-4
                    for actual, expected in zip(actual_z, expected_z)
                ):
                    errors.append(f"{surface_id}: viewer sites must share one guide plane above the slab")
                site_display = viewer.get("siteDisplay", {})
                if (site_display.get("mode") != "uniform-guide-plane" or
                        abs(site_display.get("heightAboveTop", -1) - display_lift) > 2e-4):
                    errors.append(f"{surface_id}: viewer site-display metadata is invalid")
                if any(z is None or z <= top for z in actual_z):
                    errors.append(f"{surface_id}: viewer site marker intersects the slab height range")
            if len(viewer.get("cell", [])) != 4:
                errors.append(f"{surface_id}: viewer cell must contain four corners")
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f"{surface_id}: cannot load viewer geometry: {exc}")

    page_ids: dict[str, Path] = {}
    for page in PAGES_DIR.glob("*.md"):
        found_id = page_surface_id(page)
        if found_id:
            if found_id in page_ids:
                errors.append(f"Duplicate pages for {found_id}: {page_ids[found_id]} and {page}")
            page_ids[found_id] = page
            if found_id not in ids:
                errors.append(f"{page}: surface_id {found_id!r} has no data entry")
    for surface_id in ids:
        if surface_id not in page_ids:
            errors.append(f"{surface_id}: no matching surface page")
    missing_new_surfaces = REQUIRED_NEW_SURFACES - ids
    if missing_new_surfaces:
        errors.append(f"Required SC, SH, or BCT surfaces are missing: {sorted(missing_new_surfaces)}")
    extra_geometry = set(stored_geometry) - ids
    if extra_geometry:
        errors.append(f"Site geometry contains unknown surfaces: {sorted(extra_geometry)}")

    try:
        families = yaml.safe_load(FAMILIES_FILE.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as exc:
        errors.append(f"Cannot load {FAMILIES_FILE}: {exc}")
        families = []
    if not isinstance(families, list):
        errors.append("_data/crystal_families.yml must contain a top-level list")
    else:
        family_ids = [entry.get("id") for entry in families if isinstance(entry, dict)]
        if len(family_ids) != len(families) or set(family_ids) != SUPPORTED_CRYSTALS:
            errors.append("Crystal-family navigation must define every supported crystal exactly once")
        for entry in families:
            if isinstance(entry, dict) and (not entry.get("name") or not entry.get("summary")):
                errors.append(f"Crystal-family navigation entry {entry.get('id')!r} is incomplete")

    if CRYSTALS["bct"]["a"] == CRYSTALS["bct"]["c"]:
        errors.append("BCT reference geometry must retain independent a and c parameters")

    return errors


def main() -> int:
    errors = validate()
    if errors:
        print("Surface data validation failed:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1
    print("Surface data validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
