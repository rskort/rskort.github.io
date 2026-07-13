"""Derive adsorption-site markers from atoms in a periodic surface slab.

Coordinates are fractional in the two drawn surface-cell vectors.  Named ASE
sites on low-index facets use exact, independently checked constructions.
Manual sites are projections, periodic midpoints, or least-squares centroids
of compact shells selected from the first exposed atomic rows.
"""

from __future__ import annotations

from collections import Counter
from itertools import combinations, product
from fractions import Fraction
from typing import Iterable

import numpy as np
from ase import Atoms


EXPLICIT: dict[str, list[dict]] = {
    "fcc-100": [
        {"kind": "projection", "supports": [(1, (0.5, 0.0))]},
        {"kind": "midpoint", "supports": [(1, (0.5, 0.0)), (1, (0.0, 0.5))]},
        {"kind": "centroid", "supports": [(1, (0.5, 0.0)), (1, (0.0, 0.5)), (1, (0.5, 1.0)), (1, (1.0, 0.5))]},
    ],
    "fcc-110": [
        {"kind": "projection", "supports": [(1, (0.25, 0.5))]},
        {"kind": "midpoint", "supports": [(1, (0.25, 0.5)), (1, (0.75, 0.5))]},
        {"kind": "midpoint", "supports": [(1, (0.25, -0.5)), (1, (0.25, 0.5))]},
        {"kind": "centroid", "supports": [(1, (0.25, -0.5)), (1, (0.75, -0.5)), (1, (0.25, 0.5)), (1, (0.75, 0.5))]},
    ],
    "fcc-111": [
        {"kind": "projection", "supports": [(1, (0.0, 0.0))]},
        {"kind": "midpoint", "supports": [(1, (0.0, 0.0)), (1, (0.5, 0.0))]},
        {"kind": "centroid", "supports": [(1, (0.0, 0.0)), (1, (0.5, 0.0)), (1, (0.0, 0.5))]},
        {"kind": "centroid", "supports": [(1, (0.5, 0.0)), (1, (0.0, 0.5)), (1, (0.5, 0.5))]},
    ],
    "bcc-100": [
        {"kind": "projection", "supports": [(1, (0.5, 0.5))]},
        {"kind": "midpoint", "supports": [(1, (0.5, -0.5)), (1, (0.5, 0.5))]},
        {"kind": "centroid", "supports": [(1, (-0.5, -0.5)), (1, (0.5, -0.5)), (1, (-0.5, 0.5)), (1, (0.5, 0.5))]},
    ],
    "bcc-110": [
        {"kind": "projection", "supports": [(1, (0.5, 0.0))]},
        {"kind": "midpoint", "supports": [(1, (0.5, 0.0)), (1, (0.0, 0.5))]},
        {"kind": "midpoint", "supports": [(1, (0.5, 0.0)), (1, (0.5, 1.0))]},
        {
            "kind": "ase-transform",
            "uv": (0.625, 0.5),
            "method": "ASE bcc110 hollow (3/8, 1/4), transformed from its primitive oblique cell into this rectangular cell.",
        },
    ],
    "bcc-111": [
        {"kind": "projection", "supports": [(1, (1 / 3, 1 / 3))]},
        {"kind": "projection", "supports": [(2, (0.0, 0.0))]},
        {"kind": "midpoint", "supports": [(1, (1 / 3, 1 / 3)), (2, (0.0, 0.0))]},
        {
            "kind": "ase-transform",
            "uv": (2 / 3, 2 / 3),
            "method": "Current ASE bcc111 hollow offset (1/3, 1/3) added to the outermost atom at (1/3, 1/3).",
        },
    ],
    "hcp-0001": [
        {"kind": "projection", "supports": [(1, (1 / 3, 1 / 3))]},
        {"kind": "midpoint", "supports": [(1, (1 / 3, 1 / 3)), (1, (4 / 3, 1 / 3))]},
        {"kind": "centroid", "supports": [(1, (1 / 3, 1 / 3)), (1, (4 / 3, 1 / 3)), (1, (1 / 3, 4 / 3))]},
        {"kind": "centroid", "supports": [(1, (4 / 3, 1 / 3)), (1, (1 / 3, 4 / 3)), (1, (4 / 3, 4 / 3))]},
    ],
}


def _wrapped(value: float) -> float:
    result = value % 1.0
    return 0.0 if abs(result) < 1e-9 or abs(result - 1.0) < 1e-9 else result


def _fraction(value: float) -> str:
    candidate = Fraction(float(value)).limit_denominator(48)
    if abs(float(candidate) - value) < 1e-7:
        if candidate.denominator == 1:
            return str(candidate.numerator)
        return f"{candidate.numerator}/{candidate.denominator}"
    return f"{value:.4f}".rstrip("0").rstrip(".")


def _coordinate(values: Iterable[float], wrap: bool = False) -> str:
    pair = [(_wrapped(value) if wrap else value) for value in values]
    return f"({_fraction(pair[0])}, {_fraction(pair[1])})"


def _layer_data(slab: Atoms, count: int = 4) -> tuple[list[np.ndarray], list[float]]:
    z = slab.positions[:, 2]
    levels = sorted({round(float(value), 6) for value in z}, reverse=True)[:count]
    scaled = slab.get_scaled_positions(wrap=True)
    layers = []
    for level in levels:
        points = scaled[np.isclose(z, level, atol=1e-4), :2]
        points = np.mod(points, 1.0)
        points[np.isclose(points, 1.0, atol=1e-8)] = 0.0
        points[np.isclose(points, 0.0, atol=1e-8)] = 0.0
        layers.append(np.array(sorted(points.tolist(), key=lambda item: (item[0], item[1]))))
    return layers, levels


def _images(points: np.ndarray, layer: int, reference: np.ndarray, slab: Atoms, limit: int = 10):
    candidates = []
    metric = slab.cell[:2, :2]
    for atom_index, point in enumerate(points):
        for shift in product(range(-1, 2), repeat=2):
            uv = point + np.asarray(shift, dtype=float)
            distance = float(np.linalg.norm((uv - reference) @ metric))
            candidates.append((distance, layer, atom_index, uv))
    candidates.sort(key=lambda entry: (entry[0], entry[1], entry[2], entry[3][0], entry[3][1]))
    return candidates[:limit]


def _nearest_pair(slab: Atoms, layers: list[np.ndarray], levels: list[float], first: int, second: int):
    reference = layers[first][0]
    left = _images(layers[first], first, reference, slab, limit=12)
    right = _images(layers[second], second, reference, slab, limit=12)
    metric = slab.cell[:2, :2]
    candidates = []
    for _, layer_a, atom_a, uv_a in left:
        for _, layer_b, atom_b, uv_b in right:
            if layer_a == layer_b and atom_a == atom_b and np.allclose(uv_a, uv_b):
                continue
            lateral = np.linalg.norm((uv_b - uv_a) @ metric)
            vertical = levels[layer_b] - levels[layer_a]
            distance = float(np.hypot(lateral, vertical))
            midpoint = np.mod((uv_a + uv_b) / 2, 1.0)
            candidates.append((distance, midpoint[0], midpoint[1], uv_a, uv_b))
    _, _, _, first_uv, second_uv = min(candidates, key=lambda entry: entry[:3])
    return [(first + 1, first_uv), (second + 1, second_uv)]


def _axis_pair(layers: list[np.ndarray], layer: int, axis: int):
    first = layers[layer][0]
    second = first.copy()
    second[axis] += 1.0
    return [(layer + 1, first), (layer + 1, second)]


def _compact_shell(slab: Atoms, layers: list[np.ndarray], requested: list[int]):
    counts = Counter(requested)
    reference = layers[requested[0]][0]
    groups = []
    for layer, amount in sorted(counts.items()):
        candidates = _images(layers[layer], layer, reference, slab, limit=10)
        groups.append(list(combinations(candidates, amount)))
    metric = slab.cell[:2, :2]
    shells = []
    for selected_groups in product(*groups):
        selected = [item for group in selected_groups for item in group]
        identities = {(item[1], item[2], round(float(item[3][0]), 8), round(float(item[3][1]), 8)) for item in selected}
        if len(identities) != len(selected):
            continue
        uv = np.asarray([item[3] for item in selected])
        xy = uv @ metric
        centred = xy - xy.mean(axis=0)
        if np.linalg.matrix_rank(centred, tol=1e-5) < 2:
            continue
        distances = np.linalg.norm(centred, axis=1)
        pairwise = np.linalg.norm(xy[:, None, :] - xy[None, :, :], axis=2)
        centroid = np.mod(uv.mean(axis=0), 1.0)
        # A hollow/pocket cannot share the lateral projection of an atom in
        # the exposed shell. Reject such compact but physically mislabeled
        # centroids before ranking the remaining shells.
        atom_clearance = min(
            np.linalg.norm((np.mod(point - centroid + 0.5, 1.0) - 0.5) @ metric)
            for layer_points in layers[:3]
            for point in layer_points
        )
        if atom_clearance < 0.08 * min(slab.cell.lengths()[:2]):
            continue
        score = float(pairwise.max() + distances.std() + 0.03 * distances.mean())
        shells.append((score, centroid[0], centroid[1], selected))
    if not shells:
        raise ValueError(f"No non-collinear shell for layer pattern {requested}")
    selected = min(shells, key=lambda entry: entry[:3])[3]
    return [(item[1] + 1, item[3]) for item in selected]


def _ontop_layer(label: str, labels: list[str]) -> int:
    lowered = label.lower()
    if "lower" in lowered:
        return 1
    if "terrace" in lowered:
        has_upper = any(any(word in other.lower() for word in ("step", "ridge", "ledge", "raised")) and "ontop" in other.lower() for other in labels)
        has_lower = any("lower" in other.lower() and "ontop" in other.lower() for other in labels)
        return 2 if has_upper and has_lower else 1
    return 0


def _generic_construction(slab: Atoms, layers: list[np.ndarray], levels: list[float], site: dict, labels: list[str]):
    label = site["label"].lower()
    coordination = int(site["coordination"])
    if "ontop" in label:
        layer = _ontop_layer(label, labels)
        return {"kind": "projection", "supports": [(layer + 1, layers[layer][0])]}
    if "bridge" in label:
        if "axial" in label:
            return {"kind": "midpoint", "supports": _axis_pair(layers, 0, 1)}
        if "cross" in label or "to-lower" in label or "to-trough" in label:
            second = 2 if "lower" in label else 1
            return {"kind": "midpoint", "supports": _nearest_pair(slab, layers, levels, 0, second)}
        layer = 1 if "terrace" in label else 0
        return {"kind": "midpoint", "supports": _nearest_pair(slab, layers, levels, layer, layer)}
    if "terrace" in label:
        requested = [1] * coordination
    elif "lower" in label:
        requested = [2] * coordination
    elif coordination == 4 and ("channel" in label or "trough" in label):
        requested = [0, 0, 1, 1]
    elif coordination == 4:
        requested = [0, 0, 1, 1]
    else:
        requested = [0, 1, 2]
    return {"kind": "centroid", "supports": _compact_shell(slab, layers, requested)}


def _validate_supports(surface_id: str, slab: Atoms, layers: list[np.ndarray], supports) -> None:
    metric = slab.cell[:2, :2]
    for layer, uv in supports:
        wrapped = np.mod(np.asarray(uv), 1.0)
        distances = [np.linalg.norm((np.mod(point - wrapped + 0.5, 1.0) - 0.5) @ metric) for point in layers[layer - 1]]
        if not distances or min(distances) > 2e-3:
            raise ValueError(f"{surface_id}: support L{layer} {_coordinate(uv)} is not an atom projection")


def _render(surface_id: str, marker: int, construction: dict, slab: Atoms, layers: list[np.ndarray], levels: list[float]):
    kind = construction["kind"]
    supports = construction.get("supports", [])
    if supports:
        _validate_supports(surface_id, slab, layers, supports)
        points = np.asarray([uv for _, uv in supports], dtype=float)
        uv = points[0] if kind == "projection" else points.mean(axis=0)
    else:
        uv = np.asarray(construction["uv"], dtype=float)
    reference_z = float(np.mean([levels[layer - 1] for layer, _ in supports])) if supports else levels[0]
    reference_offset = reference_z - levels[0]
    wrapped = np.asarray([_wrapped(value) for value in uv])
    if kind == "projection":
        method = f"Projection of the L{supports[0][0]} atom at {_coordinate(supports[0][1])}."
        formula = "s = s₁"
    elif kind == "midpoint":
        method = f"Periodic midpoint of L{supports[0][0]} {_coordinate(supports[0][1])} and L{supports[1][0]} {_coordinate(supports[1][1])}."
        formula = "s = (s₁ + s₂) / 2"
    elif kind == "centroid":
        shell = ", ".join(f"L{layer} {_coordinate(point)}" for layer, point in supports)
        method = f"Least-squares centroid of the {len(supports)}-atom projected shell: {shell}."
        formula = f"s = (Σᵢ sᵢ) / {len(supports)}"
    else:
        method = construction["method"]
        formula = "exact ASE affine transform"
    return {
        "marker": marker,
        "uv": [round(float(wrapped[0]), 8), round(float(wrapped[1]), 8)],
        "coordinate": _coordinate(wrapped),
        "formula": formula,
        "method": method,
        "reference_offset": round(reference_offset, 8),
        "height_reference": f"support shell: mean Δz = {reference_offset:+.3f} Å from L1",
        "supports": [
            {"layer": layer, "coordinate": _coordinate(point)} for layer, point in supports
        ],
    }


def derive_surface_sites(surface_id: str, slab: Atoms, site_entries: list[dict]) -> list[dict]:
    layers, levels = _layer_data(slab)
    labels = [entry["label"] for entry in site_entries]
    explicit = EXPLICIT.get(surface_id)
    if explicit is not None and len(explicit) != len(site_entries):
        raise ValueError(f"{surface_id}: explicit construction count does not match site count")
    result = []
    for index, site in enumerate(site_entries):
        construction = explicit[index] if explicit is not None else _generic_construction(slab, layers, levels, site, labels)
        result.append(_render(surface_id, index + 1, construction, slab, layers, levels))
    coordinates = [(*item["uv"], item["reference_offset"]) for item in result]
    if len(set(coordinates)) != len(coordinates):
        duplicates = [coordinate for coordinate, count in Counter(coordinates).items() if count > 1]
        raise ValueError(f"{surface_id}: duplicate derived site coordinates {duplicates}")
    return result
