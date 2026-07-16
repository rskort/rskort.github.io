#!/usr/bin/env python3
"""Generate reference diagrams and interactive geometry for the surface atlas."""

from __future__ import annotations

from dataclasses import dataclass
import json
from math import atan2, ceil, degrees
from pathlib import Path

import matplotlib as mpl
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
import numpy as np
import yaml
from ase import Atoms
from ase.build import bulk, surface
from ase.build.tools import minimize_tilt

try:
    from tools.site_geometry import derive_surface_sites
except ModuleNotFoundError:  # Direct execution adds tools/, not the repo root.
    from site_geometry import derive_surface_sites


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "surface-atlas" / "assets" / "surfaces"
SITE_GEOMETRY_FILE = ROOT / "_data" / "site_geometry.yml"
@dataclass(frozen=True)
class VisualSpec:
    crystal: str
    miller: tuple[int, int, int]
    profile_axis: int = 0


SPECS = {
    "fcc-100": VisualSpec("fcc", (1, 0, 0)),
    "fcc-110": VisualSpec("fcc", (1, 1, 0)),
    "fcc-111": VisualSpec("fcc", (1, 1, 1)),
    "fcc-210": VisualSpec("fcc", (2, 1, 0)),
    "fcc-211": VisualSpec("fcc", (2, 1, 1)),
    "fcc-221": VisualSpec("fcc", (2, 2, 1), profile_axis=1),
    "fcc-310": VisualSpec("fcc", (3, 1, 0)),
    "fcc-311": VisualSpec("fcc", (3, 1, 1)),
    "fcc-331": VisualSpec("fcc", (3, 3, 1), profile_axis=1),
    "fcc-511": VisualSpec("fcc", (5, 1, 1)),
    "bcc-100": VisualSpec("bcc", (1, 0, 0)),
    "bcc-110": VisualSpec("bcc", (1, 1, 0)),
    "bcc-111": VisualSpec("bcc", (1, 1, 1)),
    "bcc-210": VisualSpec("bcc", (2, 1, 0)),
    "bcc-211": VisualSpec("bcc", (2, 1, 1)),
    "bcc-310": VisualSpec("bcc", (3, 1, 0)),
    "hcp-0001": VisualSpec("hcp", (0, 0, 1)),
    "hcp-10m10": VisualSpec("hcp", (1, 0, 0)),
    "hcp-11m20": VisualSpec("hcp", (1, 1, 0)),
    "hcp-10m11": VisualSpec("hcp", (1, 0, 1)),
    "hcp-10m12": VisualSpec("hcp", (1, 0, 2)),
    "hcp-11m21": VisualSpec("hcp", (1, 1, 1), profile_axis=1),
    "sc-100": VisualSpec("sc", (1, 0, 0)),
    "sc-110": VisualSpec("sc", (1, 1, 0)),
    "sc-111": VisualSpec("sc", (1, 1, 1)),
    "sc-210": VisualSpec("sc", (2, 1, 0)),
    "sc-211": VisualSpec("sc", (2, 1, 1)),
    "sh-0001": VisualSpec("sh", (0, 0, 1)),
    "sh-10m10": VisualSpec("sh", (1, 0, 0)),
    "sh-11m20": VisualSpec("sh", (1, 1, 0)),
    "sh-10m11": VisualSpec("sh", (1, 0, 1)),
    "bct-001": VisualSpec("bct", (0, 0, 1)),
    "bct-100": VisualSpec("bct", (1, 0, 0)),
    "bct-110": VisualSpec("bct", (1, 1, 0)),
    "bct-101": VisualSpec("bct", (1, 0, 1)),
    "bct-111": VisualSpec("bct", (1, 1, 1)),
    "bct-211": VisualSpec("bct", (2, 1, 1)),
}

CRYSTALS = {
    "fcc": {"element": "Cu", "a": 3.61, "c": None, "nearest": 3.61 / np.sqrt(2)},
    "bcc": {"element": "Fe", "a": 2.87, "c": None, "nearest": 2.87 * np.sqrt(3) / 2},
    "hcp": {"element": "Mg", "a": 3.21, "c": 5.21, "nearest": 3.21},
    "sc": {"element": "Po", "a": 3.35, "c": None, "nearest": 3.35},
    "sh": {"element": "X", "a": 2.70, "c": 4.40, "nearest": 2.70},
    "bct": {
        "element": "In",
        "a": 3.25,
        "c": 4.95,
        "nearest": min(3.25, 4.95, np.sqrt(2 * 3.25**2 + 4.95**2) / 2),
    },
}

LAYER_COLOURS = ("#176b72", "#91aaa6", "#d4dfda", "#e9efeb")
LAYER_SIZES = (168, 125, 94, 70)
INK = "#173033"
SITE = "#a96824"
PAPER = "#ffffff"
SVG_METADATA = {"Creator": "tools/generate_surface_figures.py", "Date": None}

mpl.use("Agg")
mpl.rcParams.update(
    {
        "font.family": "DejaVu Sans",
        "font.size": 10,
        "figure.facecolor": PAPER,
        "axes.facecolor": PAPER,
        "svg.fonttype": "none",
        "svg.hashsalt": "surface-atlas-v3",
    }
)


def bulk_cell(spec: VisualSpec) -> Atoms:
    """Build the conventional cell in which ``spec.miller`` is defined."""
    crystal_data = CRYSTALS[spec.crystal]
    a = crystal_data["a"]
    c = crystal_data["c"]
    element = crystal_data["element"]
    if spec.crystal == "sh":
        return Atoms(
            element,
            scaled_positions=[(0.0, 0.0, 0.0)],
            cell=((a, 0.0, 0.0), (-a / 2, a * np.sqrt(3) / 2, 0.0), (0.0, 0.0, c)),
            pbc=True,
        )
    if spec.crystal == "bct":
        return Atoms(
            f"{element}2",
            scaled_positions=[(0.0, 0.0, 0.0), (0.5, 0.5, 0.5)],
            cell=((a, 0.0, 0.0), (0.0, a, 0.0), (0.0, 0.0, c)),
            pbc=True,
        )
    kwargs = {"a": crystal_data["a"]}
    if spec.crystal in {"fcc", "bcc", "sc"}:
        kwargs["cubic"] = True
    else:
        kwargs["c"] = crystal_data["c"]
    return bulk(element, spec.crystal, **kwargs)


def unit_slab(spec: VisualSpec) -> Atoms:
    slab = surface(bulk_cell(spec), spec.miller, layers=10, vacuum=None, periodic=True)
    # Choose an equivalent, reduced in-plane basis. This avoids extremely thin
    # parallelograms for facets such as (331) while preserving the same surface.
    minimize_tilt(slab)
    va, vb = slab.cell[0, :2], slab.cell[1, :2]
    polygon = np.array(((0.0, 0.0), va, va + vb, vb))
    span = np.ptp(polygon, axis=0)
    if span[1] > span[0] * 1.25:
        diagonals = (va + vb, va - vb)
        longest = max(diagonals, key=np.linalg.norm)
        slab.rotate(-degrees(atan2(longest[1], longest[0])), "z", rotate_cell=True)
    return slab


def top_layers(atoms: Atoms, count: int = 4) -> list[np.ndarray]:
    z = atoms.positions[:, 2]
    levels = sorted({round(float(value), 5) for value in z}, reverse=True)[:count]
    return [np.flatnonzero(np.isclose(z, level, atol=1e-4)) for level in levels]


def repeat_for_view(slab: Atoms) -> tuple[Atoms, np.ndarray]:
    a_len, b_len = slab.cell.lengths()[:2]
    target = max(a_len, b_len, 8.0)
    rx = max(1, min(5, ceil(target / a_len)))
    ry = max(1, min(5, ceil(target / b_len)))
    repeated = slab.repeat((rx + 1, ry + 1, 1))
    origin = max(0, (rx - 1) // 2) * slab.cell[0, :2] + max(0, (ry - 1) // 2) * slab.cell[1, :2]
    return repeated, origin


def draw_bonds(ax: plt.Axes, points: np.ndarray, cutoff: float) -> None:
    if len(points) > 150:
        return
    for i, point in enumerate(points):
        delta = points[i + 1 :] - point
        distances = np.linalg.norm(delta, axis=1)
        mask = (distances > 0.1) & (distances < cutoff)
        for other in points[i + 1 :][mask]:
            ax.plot((point[0], other[0]), (point[1], other[1]), color="#bfd0cb", lw=1.15, zorder=1)


def draw_cell(ax: plt.Axes, slab: Atoms, origin: np.ndarray, label_vectors: bool = True) -> None:
    va = slab.cell[0, :2]
    vb = slab.cell[1, :2]
    polygon = np.array((origin, origin + va, origin + va + vb, origin + vb, origin))
    ax.plot(polygon[:, 0], polygon[:, 1], color=INK, lw=1.6, zorder=7)
    if label_vectors:
        arrow = dict(arrowstyle="-|>", color=INK, lw=1.25, shrinkA=0, shrinkB=0)
        ax.annotate("", xy=origin + 0.92 * va, xytext=origin + 0.08 * va, arrowprops=arrow, zorder=8)
        ax.annotate("", xy=origin + 0.92 * vb, xytext=origin + 0.08 * vb, arrowprops=arrow, zorder=8)
        ax.text(*(origin + 0.48 * va), r"$\mathbf{a}_1$", color=INK, fontsize=10, weight="bold", ha="center", va="bottom", zorder=9)
        ax.text(*(origin + 0.48 * vb), r"$\mathbf{a}_2$", color=INK, fontsize=10, weight="bold", ha="right", va="center", zorder=9)


def finish(ax: plt.Axes) -> None:
    ax.set_aspect("equal", adjustable="datalim")
    ax.margins(0.06)
    ax.set_axis_off()


def save(fig: plt.Figure, path: Path) -> None:
    fig.savefig(path, format="svg", bbox_inches="tight", pad_inches=0.08, metadata=SVG_METADATA)
    plt.close(fig)
    # Matplotlib writes spaces before many SVG newlines. Strip them so generated
    # assets remain clean in diffs without changing the markup.
    text = path.read_text(encoding="utf-8")
    path.write_text("\n".join(line.rstrip() for line in text.splitlines()) + "\n", encoding="utf-8")


def draw_top(surface_id: str, slab: Atoms, spec: VisualSpec, geometries: list[dict]) -> None:
    atoms, origin = repeat_for_view(slab)
    layers = top_layers(atoms)
    fig, ax = plt.subplots(figsize=(9, 6))
    if layers:
        draw_bonds(ax, atoms.positions[layers[0], :2], CRYSTALS[spec.crystal]["nearest"] * 1.08)
    for depth in range(len(layers) - 1, -1, -1):
        xy = atoms.positions[layers[depth], :2]
        ax.scatter(xy[:, 0], xy[:, 1], s=LAYER_SIZES[depth], c=LAYER_COLOURS[depth],
                   edgecolors=PAPER, linewidths=1.4, zorder=3 + len(layers) - depth)
    draw_cell(ax, slab, origin)
    va, vb = slab.cell[0, :2], slab.cell[1, :2]
    for geometry in geometries:
        marker = geometry["marker"]
        u, v = geometry["uv"]
        point = origin + u * va + v * vb
        ax.scatter(*point, s=275, c=SITE, edgecolors=PAPER, linewidths=2.4, zorder=15)
        ax.text(*point, str(marker), ha="center", va="center", color=PAPER, fontsize=10, weight="bold", zorder=16)
    finish(ax)
    save(fig, OUTPUT_DIR / f"{surface_id}-top.svg")


def draw_stacking(surface_id: str, slab: Atoms) -> None:
    atoms, origin = repeat_for_view(slab)
    layers = top_layers(atoms, 3)
    fig, ax = plt.subplots(figsize=(8, 5))
    for depth in range(len(layers) - 1, -1, -1):
        xy = atoms.positions[layers[depth], :2]
        ax.scatter(xy[:, 0], xy[:, 1], s=(130, 98, 74)[depth], c=LAYER_COLOURS[depth],
                   alpha=(1.0, 0.72, 0.48)[depth], edgecolors=PAPER, linewidths=1.2,
                   zorder=4 + len(layers) - depth)
    draw_cell(ax, slab, origin, label_vectors=False)
    finish(ax)
    save(fig, OUTPUT_DIR / f"{surface_id}-stacking.svg")


def draw_profile(surface_id: str, slab: Atoms, spec: VisualSpec) -> None:
    repeats = [1, 1, 1]
    repeats[spec.profile_axis] = 3
    atoms = slab.repeat(tuple(repeats))
    direction = slab.cell[spec.profile_axis, :2]
    direction = direction / np.linalg.norm(direction)
    horizontal = atoms.positions[:, :2] @ direction
    z = atoms.positions[:, 2]
    levels = sorted({round(float(value), 5) for value in z}, reverse=True)

    # Show one visible registry cycle plus a little context. Low-index surfaces
    # repeat quickly and should not need a deep, visually redundant slab;
    # complex stepped facets retain up to six levels.
    period_length = np.linalg.norm(slab.cell[spec.profile_axis, :2])
    signatures: list[tuple[float, ...]] = []
    for level in levels:
        layer_x = horizontal[np.isclose(z, level, atol=1e-4)]
        fractional = np.mod(layer_x, period_length) / period_length
        signatures.append(tuple(sorted(np.round(fractional, 3))))
    repeat_depth = next(
        (depth for depth in range(1, min(7, len(signatures))) if signatures[depth] == signatures[0]),
        None,
    )
    visible_count = min(len(levels), max(3, min(6, (repeat_depth + 1) if repeat_depth else 6)))
    levels = levels[:visible_count]
    visible = np.isin(np.round(z, 5), levels)
    horizontal = horizontal[visible]
    z = z[visible]

    fig, ax = plt.subplots(figsize=(8, 5))
    for atom_x, atom_z in zip(horizontal, z):
        depth = min(range(len(levels)), key=lambda i: abs(levels[i] - atom_z))
        shade = LAYER_COLOURS[min(depth, len(LAYER_COLOURS) - 1)] if depth < 4 else "#eef2ef"
        size = 130 if depth == 0 else max(48, 105 - depth * 7)
        ax.scatter(atom_x, atom_z, s=size, c=shade, edgecolors=PAPER, linewidths=1.0,
                   zorder=5 if depth < 4 else 2)
    top = max(z)
    ax.axhline(top + 0.45, color=SITE, linestyle=(0, (4, 4)), lw=1.5, zorder=1)
    ax.text(horizontal.min(), top + 0.62, "macroscopic surface plane", color=SITE, fontsize=8, va="bottom")
    ax.set_aspect("equal", adjustable="datalim")
    ax.margins(x=0.03, y=0.08)
    ax.set_axis_off()
    save(fig, OUTPUT_DIR / f"{surface_id}-profile.svg")


def cut_polyhedron(spec: VisualSpec) -> tuple[np.ndarray, list[tuple[int, int]], np.ndarray, np.ndarray]:
    """Return bulk-cell vertices, edges, representative atoms and a plane normal."""
    if spec.crystal in {"fcc", "bcc", "sc"}:
        vertices = np.array([(x, y, z) for z in (0.0, 1.0) for y in (0.0, 1.0) for x in (0.0, 1.0)])
        edges = [(i, j) for i in range(8) for j in range(i + 1, 8)
                 if np.count_nonzero(np.abs(vertices[i] - vertices[j]) > 0.1) == 1]
        corners = vertices.copy()
        if spec.crystal == "fcc":
            faces = np.array(((0.5, 0.5, 0), (0.5, 0.5, 1), (0.5, 0, 0.5),
                              (0.5, 1, 0.5), (0, 0.5, 0.5), (1, 0.5, 0.5)))
            atoms = np.vstack((corners, faces))
        elif spec.crystal == "bcc":
            atoms = np.vstack((corners, np.array(((0.5, 0.5, 0.5),))))
        else:
            atoms = corners
        normal = np.asarray(spec.miller, dtype=float)
        return vertices, edges, atoms, normal

    if spec.crystal == "bct":
        c_over_a = CRYSTALS["bct"]["c"] / CRYSTALS["bct"]["a"]
        vertices = np.array(
            [(x, y, z) for z in (0.0, c_over_a) for y in (0.0, 1.0) for x in (0.0, 1.0)]
        )
        edges = [(i, j) for i in range(8) for j in range(i + 1, 8)
                 if np.count_nonzero(np.abs(vertices[i] - vertices[j]) > 0.1) == 1]
        atoms = np.vstack((vertices, np.array(((0.5, 0.5, c_over_a / 2),))))
        h, k, l = spec.miller
        normal = np.array((h, k, l / c_over_a), dtype=float)
        return vertices, edges, atoms, normal

    angles = np.linspace(0, 2 * np.pi, 6, endpoint=False)
    basal = np.column_stack((0.58 * np.cos(angles), 0.58 * np.sin(angles)))
    vertices = np.array([(x, y, z) for z in (0.0, 1.0) for x, y in basal])
    edges = [(z * 6 + i, z * 6 + (i + 1) % 6) for z in range(2) for i in range(6)]
    edges += [(i, i + 6) for i in range(6)]
    basal_centres = np.array(((0.0, 0.0, 0.0), (0.0, 0.0, 1.0)))
    if spec.crystal == "hcp":
        middle = np.column_stack((0.34 * np.cos(angles[::2] + np.pi / 3),
                                  0.34 * np.sin(angles[::2] + np.pi / 3),
                                  np.full(3, 0.5)))
        atoms = np.vstack((vertices, basal_centres, middle))
    else:
        atoms = np.vstack((vertices, basal_centres))
    cell = np.array(((1.0, 0.0, 0.0), (-0.5, np.sqrt(3) / 2, 0.0),
                     (0.0, 0.0, CRYSTALS[spec.crystal]["c"] / CRYSTALS[spec.crystal]["a"])))
    normal = np.linalg.solve(cell, np.asarray(spec.miller, dtype=float))
    return vertices, edges, atoms, normal


def plane_intersections(vertices: np.ndarray, edges: list[tuple[int, int]], normal: np.ndarray,
                        offset: float) -> np.ndarray:
    values = vertices @ normal - offset
    points: list[np.ndarray] = []
    for i, j in edges:
        p, q = vertices[i], vertices[j]
        dp, dq = values[i], values[j]
        if abs(dp) < 1e-9:
            points.append(p)
        if dp * dq < -1e-10:
            points.append(p + (-dp / (dq - dp)) * (q - p))
    unique: list[np.ndarray] = []
    for point in points:
        if not any(np.linalg.norm(point - known) < 1e-6 for known in unique):
            unique.append(point)
    polygon = np.asarray(unique)
    centroid = polygon.mean(axis=0)
    n = normal / np.linalg.norm(normal)
    reference = np.array((0.0, 0.0, 1.0)) if abs(n[2]) < 0.9 else np.array((1.0, 0.0, 0.0))
    u = np.cross(n, reference)
    u /= np.linalg.norm(u)
    v = np.cross(n, u)
    angle = np.arctan2((polygon - centroid) @ v, (polygon - centroid) @ u)
    return polygon[np.argsort(angle)]


def project_bulk(points: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """A stable isometric projection used by every bulk-cut diagram."""
    x, y, z = points[:, 0], points[:, 1], points[:, 2]
    screen = np.column_stack(((x - y) * 0.86, z + (x + y) * 0.38))
    return screen, x + y - 0.35 * z


def draw_bulk_cut(surface_id: str, spec: VisualSpec) -> None:
    vertices, edges, atoms, normal = cut_polyhedron(spec)
    centre_offset = float(vertices.mean(axis=0) @ normal)
    atomic_offsets = np.unique(np.round(atoms @ normal, 7))
    offset = float(atomic_offsets[np.argmin(np.abs(atomic_offsets - centre_offset))])
    plane = plane_intersections(vertices, edges, normal, offset)
    projected_vertices, _ = project_bulk(vertices)
    projected_plane, _ = project_bulk(plane)
    projected_atoms, atom_depth = project_bulk(atoms)
    fig, ax = plt.subplots(figsize=(8, 5.4))
    ax.add_patch(Polygon(projected_plane, closed=True, facecolor="#d85f45", alpha=0.25,
                         edgecolor="#d85f45", linewidth=2.0, zorder=3))
    for i, j in edges:
        ax.plot((projected_vertices[i, 0], projected_vertices[j, 0]),
                (projected_vertices[i, 1], projected_vertices[j, 1]),
                color="#8ca29e", lw=1.25, zorder=2)
    order = np.argsort(atom_depth)
    for index in order:
        lies_in_plane = abs(float(atoms[index] @ normal) - offset) < 1e-6
        ax.scatter(*projected_atoms[index], s=145, c="#176b72" if lies_in_plane else "#ffffff",
                   edgecolors="#ffffff" if lies_in_plane else "#176b72",
                   linewidths=1.6, zorder=4 + index / 100)
    center = plane.mean(axis=0)
    direction = normal / np.linalg.norm(normal)
    arrow_points, _ = project_bulk(np.vstack((center, center + 0.55 * direction)))
    ax.annotate("", xy=arrow_points[1], xytext=arrow_points[0],
                arrowprops=dict(arrowstyle="-|>", color="#173033", lw=1.8), zorder=8)
    ax.text(*arrow_points[1], "  normal", color="#173033", fontsize=9, weight="bold", va="center")
    finish(ax)
    save(fig, OUTPUT_DIR / f"{surface_id}-cut.svg")


def write_viewer_geometry(surface_id: str, slab: Atoms, spec: VisualSpec, site_data: list[dict], geometries: list[dict]) -> None:
    atoms, origin = repeat_for_view(slab)
    layers = top_layers(atoms, 6)
    chosen = np.concatenate(layers)
    positions = atoms.positions[chosen]
    layer_for_atom: dict[int, int] = {}
    for depth, indices in enumerate(layers):
        layer_for_atom.update({int(index): depth for index in indices})
    atom_entries = [
        {"x": round(float(atoms.positions[index, 0]), 4),
         "y": round(float(atoms.positions[index, 1]), 4),
         "z": round(float(atoms.positions[index, 2]), 4),
         "layer": layer_for_atom[int(index)]}
        for index in chosen
    ]
    nearest = CRYSTALS[spec.crystal]["nearest"]
    bonds: list[list[int]] = []
    for i, point in enumerate(positions):
        distances = np.linalg.norm(positions[i + 1:] - point, axis=1)
        for relative in np.flatnonzero((distances > 0.1) & (distances < nearest * 1.12)):
            bonds.append([i, i + 1 + int(relative)])
    va, vb = slab.cell[0, :2], slab.cell[1, :2]
    top = float(atoms.positions[:, 2].max())
    # Catalogue markers identify lateral sites; they are not adsorbates with a
    # calculated bond length.  Keep them together on a clearly separated guide
    # plane so support atoms in lower rows cannot pull a marker into the slab.
    display_lift = nearest * 0.55
    display_z = top + display_lift
    sites = []
    for geometry in geometries:
        marker = geometry["marker"]
        u, v = geometry["uv"]
        point = origin + u * va + v * vb
        entry = site_data[marker - 1] if marker <= len(site_data) else {}
        label = entry.get("label", f"Site {marker}")
        lowered = label.lower()
        kind = "ontop" if "ontop" in lowered else "bridge" if "bridge" in lowered else "hollow"
        sites.append({"marker": marker, "label": label, "x": round(float(point[0]), 4),
                      "y": round(float(point[1]), 4), "z": round(display_z, 4),
                      "kind": kind, "aseKeyword": entry.get("ase_keyword")})
    cell_xy = [origin, origin + va, origin + va + vb, origin + vb]
    payload = {
        "surface": surface_id,
        "crystal": spec.crystal.upper(),
        "element": CRYSTALS[spec.crystal]["element"],
        "atoms": atom_entries,
        "bonds": bonds,
        "sites": sites,
        "siteDisplay": {"mode": "uniform-guide-plane", "heightAboveTop": round(display_lift, 4)},
        "cell": [[round(float(x), 4), round(float(y), 4), round(top + 0.05, 4)] for x, y in cell_xy],
    }
    path = OUTPUT_DIR / f"{surface_id}-viewer.json"
    path.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    surface_data = yaml.safe_load((ROOT / "_data" / "surfaces.yml").read_text(encoding="utf-8"))
    sites = {item["id"]: item["sites"] for item in surface_data}
    all_geometries = {}
    for surface_id, spec in SPECS.items():
        slab = unit_slab(spec)
        geometries = derive_surface_sites(surface_id, slab, sites.get(surface_id, []))
        a_length, b_length = slab.cell.lengths()[:2]
        all_geometries[surface_id] = {
            "cell": {
                "element": CRYSTALS[spec.crystal]["element"],
                "a1": f"{a_length:.4f} Å",
                "a2": f"{b_length:.4f} Å",
                "angle": f"{slab.cell.angles()[2]:.2f}°",
                "area": f"{np.linalg.norm(np.cross(slab.cell[0], slab.cell[1])):.4f} Å²",
            },
            "sites": geometries,
        }
        draw_top(surface_id, slab, spec, geometries)
        draw_profile(surface_id, slab, spec)
        draw_stacking(surface_id, slab)
        draw_bulk_cut(surface_id, spec)
        write_viewer_geometry(surface_id, slab, spec, sites.get(surface_id, []), geometries)
        print(f"Generated figures and 3D geometry for {surface_id}")
    SITE_GEOMETRY_FILE.write_text(
        yaml.safe_dump(all_geometries, sort_keys=False, allow_unicode=True, width=120),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
