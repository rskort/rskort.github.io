#!/usr/bin/env python3
"""Validate surface data, page mappings, and generated figure files."""

from __future__ import annotations

import re
import sys
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "_data" / "surfaces.yml"
PAGES_DIR = ROOT / "surface-sites"

REQUIRED_SURFACE_FIELDS = {
    "id", "title", "lattice", "facet", "ase_builder", "surface_shape",
    "description", "math_summary", "sites", "ase_example", "common_mistakes", "figures",
}
REQUIRED_SITE_FIELDS = {"label", "marker", "definition", "coordination", "ase_keyword"}
REQUIRED_FIGURES = {"top", "xz", "yz", "stacking"}


def page_surface_id(path: Path) -> str | None:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"^surface_id:\s*([^\s#]+)\s*$", text, flags=re.MULTILINE)
    return match.group(1).strip('"\'') if match else None


def validate() -> list[str]:
    errors: list[str] = []
    try:
        surfaces = yaml.safe_load(DATA_FILE.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as exc:
        return [f"Cannot load {DATA_FILE}: {exc}"]

    if not isinstance(surfaces, list):
        return ["_data/surfaces.yml must contain a top-level list"]

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
                path = ROOT / url.lstrip("/")
                if not path.is_file():
                    errors.append(f"{surface_id}: figure does not exist: {url}")

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
