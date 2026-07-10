#!/usr/bin/env python3
"""Generate deterministic SVG diagrams for the surface-site atlas.

ASE supplies the slab geometry. Site marker positions are deliberately explicit
for the first three FCC facets, making conventions reviewable and extensions
straightforward rather than relying on fragile site-name inference.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Callable

import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
from ase import Atoms
from ase.build import fcc100, fcc110, fcc111


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "assets" / "surfaces"
SLAB_SIZE = (4, 4, 5)
LATTICE_CONSTANT = 3.61

mpl.use("Agg")
mpl.rcParams.update(
    {
        "font.family": "DejaVu Sans",
        "font.size": 9,
        "axes.edgecolor": "#75828a",
        "axes.labelcolor": "#26343c",
        "axes.linewidth": 0.8,
        "svg.fonttype": "none",
        "svg.hashsalt": "surface-site-atlas",
    }
)


@dataclass(frozen=True)
class SurfaceSpec:
    builder: Callable[..., Atoms]
    site_fractions: tuple[tuple[int, float, float], ...]
    stacking_labels: tuple[str, str, str]


SURFACES: dict[str, SurfaceSpec] = {
    "fcc-100": SurfaceSpec(
        builder=fcc100,
        site_fractions=((1, 0.0, 0.0), (2, 0.5, 0.0), (3, 0.5, 0.5)),
        stacking_labels=("A", "B", "A"),
    ),
    "fcc-111": SurfaceSpec(
        builder=fcc111,
        site_fractions=(
            (1, 0.0, 0.0),
            (2, 0.5, 0.0),
            (3, 1.0 / 3.0, 1.0 / 3.0),
            (4, 2.0 / 3.0, 2.0 / 3.0),
        ),
        stacking_labels=("A", "C", "B"),
    ),
    "fcc-110": SurfaceSpec(
        builder=fcc110,
        site_fractions=((1, 0.0, 0.0), (2, 0.5, 0.0), (3, 0.0, 0.5), (4, 0.5, 0.5)),
        stacking_labels=("A", "B", "A"),
    ),
}

LAYER_COLORS = ("#26343c", "#7f8b91", "#c2c9cc")
LAYER_SIZES = (78, 58, 42)
SITE_COLOR = "#d45b3f"
SVG_METADATA = {"Creator": "tools/generate_surface_figures.py", "Date": None}


def build_slab(spec: SurfaceSpec) -> Atoms:
    """Build a conventional five-layer slab with a reproducible Cu geometry."""
    slab = spec.builder(
        "Cu", size=SLAB_SIZE, a=LATTICE_CONSTANT, vacuum=0.0, orthogonal=True
    )
    slab.wrap()
    return slab


def top_three_layers(slab: Atoms) -> list[np.ndarray]:
    """Return atom-index arrays for the top three distinct z layers."""
    z = slab.positions[:, 2]
    levels = sorted({round(float(value), 6) for value in z}, reverse=True)[:3]
    if len(levels) != 3:
        raise ValueError(f"Expected at least three layers, found {len(levels)}")
    return [np.flatnonzero(np.isclose(z, level, atol=1e-5)) for level in levels]


def style_axis(ax: plt.Axes, xlabel: str, ylabel: str) -> None:
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    ax.set_aspect("equal", adjustable="datalim")
    ax.grid(color="#e4e9eb", linewidth=0.6, zorder=0)
    ax.tick_params(colors="#607079", labelsize=8)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)


def save(fig: plt.Figure, path: Path) -> None:
    fig.savefig(
        path,
        format="svg",
        bbox_inches="tight",
        pad_inches=0.08,
        transparent=False,
        metadata=SVG_METADATA,
    )
    plt.close(fig)


def draw_top(surface_id: str, slab: Atoms, spec: SurfaceSpec, layers: list[np.ndarray]) -> None:
    fig, ax = plt.subplots(figsize=(5.2, 3.9), constrained_layout=True)
    for depth in range(2, -1, -1):
        xy = slab.positions[layers[depth], :2]
        ax.scatter(
            xy[:, 0], xy[:, 1], s=LAYER_SIZES[depth], c=LAYER_COLORS[depth],
            edgecolors="white", linewidths=0.55, zorder=3 - depth,
        )

    # Each fraction is relative to one primitive repeat. Offset the marker set
    # into the interior of the 4 x 4 plotting cell.
    primitive_a = slab.cell[0, :2] / SLAB_SIZE[0]
    primitive_b = slab.cell[1, :2] / SLAB_SIZE[1]
    target = 1.5 * primitive_a + 1.5 * primitive_b
    top_xy = slab.positions[layers[0], :2]
    origin = top_xy[np.argmin(np.linalg.norm(top_xy - target, axis=1))]
    for marker, u, v in spec.site_fractions:
        point = origin + u * primitive_a + v * primitive_b
        ax.scatter(*point, s=150, c=SITE_COLOR, edgecolors="white", linewidths=1.2, zorder=8)
        ax.text(*point, str(marker), ha="center", va="center", color="white", weight="bold", zorder=9)

    style_axis(ax, "x (Å)", "y (Å)")
    ax.set_title(f"{surface_id.upper()} · XY top view", loc="left", weight="bold")
    save(fig, OUTPUT_DIR / f"{surface_id}-top.svg")


def draw_side(surface_id: str, slab: Atoms, layers: list[np.ndarray], horizontal: int, suffix: str) -> None:
    fig, ax = plt.subplots(figsize=(5.2, 3.9), constrained_layout=True)
    for depth in range(2, -1, -1):
        positions = slab.positions[layers[depth]]
        ax.scatter(
            positions[:, horizontal], positions[:, 2], s=LAYER_SIZES[depth],
            c=LAYER_COLORS[depth], edgecolors="white", linewidths=0.55,
            zorder=3 - depth,
        )
    axis_name = "x" if horizontal == 0 else "y"
    style_axis(ax, f"{axis_name} (Å)", "z (Å)")
    ax.set_title(f"{surface_id.upper()} · {suffix.upper()} side view", loc="left", weight="bold")
    save(fig, OUTPUT_DIR / f"{surface_id}-{suffix}.svg")


def draw_stacking(surface_id: str, slab: Atoms, spec: SurfaceSpec, layers: list[np.ndarray]) -> None:
    fig, ax = plt.subplots(figsize=(5.2, 3.9), constrained_layout=True)
    for depth in range(2, -1, -1):
        xy = slab.positions[layers[depth], :2]
        label = f"{spec.stacking_labels[depth]} · layer {depth + 1}"
        ax.scatter(
            xy[:, 0], xy[:, 1], s=LAYER_SIZES[depth], c=LAYER_COLORS[depth],
            edgecolors="white", linewidths=0.55, label=label, zorder=3 - depth,
        )
    style_axis(ax, "x (Å)", "y (Å)")
    ax.set_title(f"{surface_id.upper()} · layer registry", loc="left", weight="bold")
    ax.legend(frameon=True, facecolor="white", edgecolor="#d7dfe3", fontsize=8)
    save(fig, OUTPUT_DIR / f"{surface_id}-stacking.svg")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for surface_id, spec in SURFACES.items():
        slab = build_slab(spec)
        layers = top_three_layers(slab)
        draw_top(surface_id, slab, spec, layers)
        draw_side(surface_id, slab, layers, horizontal=0, suffix="xz")
        draw_side(surface_id, slab, layers, horizontal=1, suffix="yz")
        draw_stacking(surface_id, slab, spec, layers)
        print(f"Generated four figures for {surface_id}")


if __name__ == "__main__":
    main()
