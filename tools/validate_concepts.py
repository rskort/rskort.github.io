#!/usr/bin/env python3
"""Validate site math, the concept learning path, citations, and navigation."""

from __future__ import annotations

from pathlib import Path
import re
import sys
from urllib.parse import urlsplit

import yaml


ROOT = Path(__file__).resolve().parents[1]
CONCEPT_DIR = ROOT / "surface-atlas" / "concepts"
REFERENCES_FILE = ROOT / "_data" / "references.yml"
SURFACES_FILE = ROOT / "_data" / "surfaces.yml"
CONFIG_FILE = ROOT / "_config.yml"

FRONT_MATTER = re.compile(r"\A---\s*\r?\n(.*?)\r?\n---\s*\r?\n", re.DOTALL)
HEADING = re.compile(r"^##\s+(.+?)\s*$", re.MULTILINE)
HEADING_ANCHOR = re.compile(r"\{#([a-z0-9][a-z0-9-]*)\}\s*$")
CITATION = re.compile(r"\{%\s*include\s+cite\.html\s+id=\"([^\"]+)\"\s*%\}")
RELATIVE_LINK = re.compile(r"\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}")
SINGLE_INLINE_MATH = re.compile(r"(?<!\\)\\[()]")
SINGLE_DISPLAY_MATH = re.compile(r"(?<!\\)\\(?:\[|\])")
HTML_BLOCK_TAG = r"(?:aside|div|figure|li|ol|p|section|table|td|th|ul)"
HTML_BLOCK_START = re.compile(rf"^\s*<{HTML_BLOCK_TAG}\b", re.IGNORECASE)
HTML_BLOCK_OPEN = re.compile(rf"<{HTML_BLOCK_TAG}\b[^>]*?(?<!/)>", re.IGNORECASE)
HTML_BLOCK_CLOSE = re.compile(rf"</{HTML_BLOCK_TAG}\s*>", re.IGNORECASE)
SAFE_REFERENCE_ID = re.compile(r"^[a-z0-9][a-z0-9-]*$")
MOJIBAKE = ("�", "Ã", "Â", "â€", "â†", "âˆ", "â€“", "â—")


class UniqueKeyLoader(yaml.SafeLoader):
    """Safe YAML loader that rejects duplicate mapping keys."""


def _construct_unique_mapping(loader: UniqueKeyLoader, node: yaml.MappingNode, deep: bool = False):
    mapping = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=deep)
        if key in mapping:
            raise yaml.constructor.ConstructorError(
                "while constructing a mapping", node.start_mark,
                f"duplicate key {key!r}", key_node.start_mark,
            )
        mapping[key] = loader.construct_object(value_node, deep=deep)
    return mapping


UniqueKeyLoader.add_constructor(
    yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG,
    _construct_unique_mapping,
)


def read_front_matter(path: Path) -> tuple[dict, str]:
    text = path.read_text(encoding="utf-8")
    match = FRONT_MATTER.match(text)
    if not match:
        raise ValueError("missing YAML front matter")
    metadata = yaml.load(match.group(1), Loader=UniqueKeyLoader) or {}
    return metadata, text[match.end():]


def unique_in_order(values: list[str]) -> list[str]:
    result: list[str] = []
    for value in values:
        if value not in result:
            result.append(value)
    return result


def validate_inline_math(path: Path, content: str, errors: list[str]) -> None:
    """Enforce the delimiter form that survives each Markdown parsing context."""
    path_label = path.relative_to(ROOT).as_posix()
    html_depth = 0
    in_fence = False
    in_formula_strip = False
    markdown_open = markdown_close = 0
    html_open = html_close = 0
    body_line_offset = (
        path.read_text(encoding="utf-8").count("\n") - content.count("\n")
    )

    for line_number, line in enumerate(content.splitlines(), 1):
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence:
            continue

        starts_html = bool(HTML_BLOCK_START.match(line))
        in_raw_html = html_depth > 0 or starts_html
        if in_raw_html:
            if "\\\\(" in line or "\\\\)" in line:
                errors.append(
                    f"{path_label}:{body_line_offset + line_number}: raw HTML must use "
                    "single-backslash MathJax delimiters"
                )
            html_open += line.count("\\(")
            html_close += line.count("\\)")
            if 'class="formula-strip"' in line:
                formula_start = line.split(">", 1)[1].lstrip()
                if not formula_start.startswith("\\[") or formula_start.startswith("\\\\["):
                    errors.append(
                        f"{path_label}:{body_line_offset + line_number}: formula strips "
                        "must start with a single-backslash display delimiter"
                    )
                in_formula_strip = "</div>" not in line
            if ('class="formula-strip"' in line or in_formula_strip) and "</div>" in line:
                formula_end = line.rsplit("</div>", 1)[0].rstrip()
                if not formula_end.endswith("\\]") or formula_end.endswith("\\\\]"):
                    errors.append(
                        f"{path_label}:{body_line_offset + line_number}: formula strips "
                        "must end with a single-backslash display delimiter"
                    )
                in_formula_strip = False
        else:
            if SINGLE_INLINE_MATH.search(line) or SINGLE_DISPLAY_MATH.search(line):
                errors.append(
                    f"{path_label}:{body_line_offset + line_number}: Markdown text must use "
                    "double-backslash MathJax delimiters"
                )
            markdown_open += line.count("\\\\(")
            markdown_close += line.count("\\\\)")

        if in_raw_html:
            html_depth += len(HTML_BLOCK_OPEN.findall(line))
            html_depth -= len(HTML_BLOCK_CLOSE.findall(line))
            html_depth = max(0, html_depth)

    if markdown_open != markdown_close:
        errors.append(f"{path_label}: unbalanced escaped inline MathJax delimiters in Markdown text")
    if html_open != html_close:
        errors.append(f"{path_label}: unbalanced inline MathJax delimiters in raw HTML")
    if in_formula_strip:
        errors.append(f"{path_label}: unclosed formula strip")


def validate_html_math_value(label: str, value: str, errors: list[str]) -> None:
    """Validate data values that Liquid inserts directly into rendered HTML."""
    if "\\\\(" in value or "\\\\)" in value:
        errors.append(f"{label}: HTML-injected math must use single-backslash delimiters")
    if value.count("\\(") != value.count("\\)"):
        errors.append(f"{label}: unbalanced inline MathJax delimiters")


def collect_permalinks(errors: list[str]) -> set[str]:
    permalinks = {"/surface-atlas/"}
    for path in ROOT.rglob("*.md"):
        if any(part in {".git", "_site"} for part in path.parts):
            continue
        try:
            metadata, _ = read_front_matter(path)
        except (ValueError, yaml.YAMLError):
            continue
        permalink = metadata.get("permalink")
        if isinstance(permalink, str):
            permalinks.add(permalink)
    return permalinks


def validate() -> list[str]:
    errors: list[str] = []
    try:
        references_text = REFERENCES_FILE.read_text(encoding="utf-8")
        references = yaml.load(references_text, Loader=UniqueKeyLoader) or {}
    except (OSError, yaml.YAMLError) as exc:
        return [f"Cannot read {REFERENCES_FILE}: {exc}"]

    for token in MOJIBAKE:
        if token in references_text:
            errors.append(f"references.yml: probable mojibake token {token!r}")
            break

    required_reference_fields = ("authors", "title", "source", "url", "link_label")
    for reference_id, reference in references.items():
        if not isinstance(reference_id, str) or not SAFE_REFERENCE_ID.fullmatch(reference_id):
            errors.append(f"Reference ID {reference_id!r} is unsafe for an HTML anchor")
        if not isinstance(reference, dict):
            errors.append(f"Reference {reference_id!r} must be a mapping")
            continue
        for field in required_reference_fields:
            if not reference.get(field):
                errors.append(f"Reference {reference_id!r} is missing {field!r}")
        for url_field in ("url", "open_url"):
            url = reference.get(url_field, "")
            if not url:
                continue
            parsed = urlsplit(str(url))
            if parsed.scheme != "https" or not parsed.netloc:
                errors.append(f"Reference {reference_id!r} field {url_field!r} must be an absolute HTTPS URL")

    try:
        surfaces = yaml.load(
            SURFACES_FILE.read_text(encoding="utf-8"), Loader=UniqueKeyLoader
        ) or []
    except (OSError, yaml.YAMLError) as exc:
        errors.append(f"Cannot read {SURFACES_FILE}: {exc}")
        surfaces = []
    if not isinstance(surfaces, list):
        errors.append("surfaces.yml must contain a list")
    else:
        for index, surface in enumerate(surfaces, 1):
            if not isinstance(surface, dict):
                continue
            summary = surface.get("math_summary")
            if isinstance(summary, str):
                surface_label = surface.get("id", f"entry {index}")
                validate_html_math_value(
                    f"surfaces.yml {surface_label} math_summary", summary, errors
                )

    for path in sorted((ROOT / "surface-atlas").rglob("*.md")):
        try:
            _, content = read_front_matter(path)
        except (ValueError, yaml.YAMLError):
            continue
        validate_inline_math(path, content, errors)

    config = yaml.safe_load(CONFIG_FILE.read_text(encoding="utf-8")) or {}
    baseurl = str(config.get("baseurl", "")).rstrip("/")
    permalinks = collect_permalinks(errors)
    concept_orders: dict[int, Path] = {}
    concept_permalinks: dict[str, Path] = {}

    for path in sorted(CONCEPT_DIR.glob("*.md")):
        if path.name == "index.md":
            continue
        try:
            metadata, content = read_front_matter(path)
        except (ValueError, yaml.YAMLError) as exc:
            errors.append(f"{path}: {exc}")
            continue
        if metadata.get("concept") is not True:
            errors.append(f"{path.name}: concept pages must set concept: true")

        for field in ("title", "short_title", "heading", "theme", "card_description", "intro", "description"):
            if not metadata.get(field):
                errors.append(f"{path.name}: missing display field {field!r}")

        order = metadata.get("order")
        if not isinstance(order, int) or order < 1:
            errors.append(f"{path.name}: order must be a positive integer")
        elif order in concept_orders:
            errors.append(f"{path.name}: duplicate order {order} also used by {concept_orders[order].name}")
        else:
            concept_orders[order] = path

        permalink = metadata.get("permalink")
        if not isinstance(permalink, str):
            errors.append(f"{path.name}: missing permalink")
        elif permalink in concept_permalinks:
            errors.append(f"{path.name}: duplicate permalink also used by {concept_permalinks[permalink].name}")
        else:
            concept_permalinks[permalink] = path

        declared_sections = [item.get("id") for item in metadata.get("sections", []) if isinstance(item, dict)]
        heading_lines = HEADING.findall(content)
        heading_ids: list[str] = []
        for heading_text in heading_lines:
            match = HEADING_ANCHOR.search(heading_text)
            if not match:
                errors.append(f"{path.name}: H2 lacks an explicit anchor: {heading_text!r}")
            else:
                heading_ids.append(match.group(1))
        if declared_sections != heading_ids:
            errors.append(
                f"{path.name}: front-matter sections {declared_sections!r} "
                f"do not match H2 anchors {heading_ids!r}"
            )
        if len(heading_ids) != len(set(heading_ids)):
            errors.append(f"{path.name}: duplicate H2 anchor")

        declared_references = metadata.get("references", [])
        if not isinstance(declared_references, list):
            errors.append(f"{path.name}: references must be a list")
            declared_references = []
        if len(declared_references) != len(set(declared_references)):
            errors.append(f"{path.name}: duplicate key in references list")
        cited = CITATION.findall(content)
        citation_order = unique_in_order(cited)
        if declared_references != citation_order:
            errors.append(
                f"{path.name}: references must follow first-citation order; "
                f"declared {declared_references!r}, cited {citation_order!r}"
            )
        for reference_id in declared_references:
            if not isinstance(reference_id, str) or not SAFE_REFERENCE_ID.fullmatch(reference_id):
                errors.append(f"{path.name}: unsafe reference ID {reference_id!r}")
                continue
            if reference_id not in references:
                errors.append(f"{path.name}: unknown reference {reference_id!r}")

        for token in MOJIBAKE:
            if token in content:
                errors.append(f"{path.name}: probable mojibake token {token!r}")
                break

        for raw_url in RELATIVE_LINK.findall(content):
            clean_path = raw_url.split("?", 1)[0].split("#", 1)[0]
            if not clean_path.startswith("/"):
                errors.append(f"{path.name}: relative_url target must start with '/': {raw_url!r}")
                continue
            resolved = clean_path if clean_path.startswith(f"{baseurl}/") else f"{baseurl}{clean_path}"
            if resolved not in permalinks:
                errors.append(f"{path.name}: no page has permalink {resolved!r} (from {raw_url!r})")

    if not concept_orders:
        errors.append("No concept pages found")
    return errors


def main() -> int:
    errors = validate()
    if errors:
        print("Content validation failed:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1
    print("Content validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
