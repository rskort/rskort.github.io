#!/usr/bin/env python3
"""Generate clear, deterministic SVG diagrams for the FCC surface atlas."""

from __future__ import annotations

from dataclasses import dataclass
from math import ceil
from pathlib import Path

import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
from ase import Atoms
from ase.build import bulk, surface
from ase.build.tools import minimize_tilt


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "assets" / "surfaces"
A = 3.61
MILLER = {
    "fcc-100": (1, 0, 0),
    "fcc-110": (1, 1, 0),
    "fcc-111": (1, 1, 1),
    "fcc-210": (2, 1, 0),
    "fcc-211": (2, 1, 1),
    "fcc-221": (2, 2, 1),
    "fcc-310": (3, 1, 0),
    "fcc-311": (3, 1, 1),
    "fcc-331": (3, 3, 1),
    "fcc-511": (5, 1, 1),
}


@dataclass(frozen=True)
class VisualSpec:
    site_fractions: tuple[tuple[float, float], ...]
    profile_axis: int = 0


SPECS = {
    "fcc-100": VisualSpec(((0.50, 0.00), (0.25, 0.25), (0.50, 0.50))),
    "fcc-110": VisualSpec(((0.25, 0.50), (0.50, 0.50), (0.25, 0.00), (0.50, 0.00))),
    "fcc-111": VisualSpec(((0.167, 0.167), (0.417, 0.167), (0.333, 0.333), (0.50, 0.50))),
    "fcc-210": VisualSpec(((0.25, 0.50), (0.50, 0.50), (0.75, 0.00))),
    "fcc-211": VisualSpec(((0.34, 0.50), (0.00, 0.50), (0.66, 0.25))),
    "fcc-221": VisualSpec(((0.20, 0.50), (0.45, 0.50), (0.72, 0.25)), profile_axis=1),
    "fcc-310": VisualSpec(((0.35, 0.50), (0.52, 0.50), (0.80, 0.00))),
    "fcc-311": VisualSpec(((0.34, 0.36), (0.59, 0.36), (0.82, 0.55))),
    "fcc-331": VisualSpec(((0.38, 0.36), (0.50, 0.58), (0.72, 0.74)), profile_axis=1),
    "fcc-511": VisualSpec(((0.42, 0.36), (0.56, 0.36), (0.09, 0.61), (0.82, 0.55))),
}

LAYER_COLOURS = ("#176b72", "#91aaa6", "#d4dfda", "#e9efeb")
LAYER_SIZES = (168, 125, 94, 70)
INK = "#173033"
SITE = "#d85f45"
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
        "svg.hashsalt": "surface-science-notes-v2",
    }
)


def unit_slab(miller: tuple[int, int, int]) -> Atoms:
    crystal = bulk("Cu", "fcc", a=A, cubic=True)
    slab = surface(crystal, miller, layers=10, vacuum=None, periodic=True)
    # Choose an equivalent, reduced in-plane basis. This avoids extremely thin
    # parallelograms for facets such as (331) while preserving the same surface.
    minimize_tilt(slab)
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


def draw_bonds(ax: plt.Axes, points: np.ndarray, cutoff: float = A / np.sqrt(2) * 1.08) -> None:
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


def draw_top(surface_id: str, slab: Atoms, spec: VisualSpec) -> None:
    atoms, origin = repeat_for_view(slab)
    layers = top_layers(atoms)
    fig, ax = plt.subplots(figsize=(9, 6))
    if layers:
        draw_bonds(ax, atoms.positions[layers[0], :2])
    for depth in range(len(layers) - 1, -1, -1):
        xy = atoms.positions[layers[depth], :2]
        ax.scatter(xy[:, 0], xy[:, 1], s=LAYER_SIZES[depth], c=LAYER_COLOURS[depth],
                   edgecolors=PAPER, linewidths=1.4, zorder=3 + len(layers) - depth)
    draw_cell(ax, slab, origin)
    va, vb = slab.cell[0, :2], slab.cell[1, :2]
    for marker, (u, v) in enumerate(spec.site_fractions, start=1):
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


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for surface_id, miller in MILLER.items():
        slab = unit_slab(miller)
        draw_top(surface_id, slab, SPECS[surface_id])
        draw_profile(surface_id, slab, SPECS[surface_id])
        draw_stacking(surface_id, slab)
        print(f"Generated three figures for {surface_id}")


if __name__ == "__main__":
    main()
