---
layout: concept
title: Building surfaces with ASE
short_title: Reproducible ASE workflow
heading: Turn the geometry into a reproducible model
theme: Practice
card_description: Map the crystallography to explicit ASE parameters, inspect the result, converge the model, and preserve its provenance.
intro: ASE can build and manipulate an atomistic slab, but the script must still state the crystal, orientation, termination, cell, site, constraints, and numerical tests that define the model.
description: Build, inspect, constrain, converge, and record reproducible crystal-surface slabs with the Atomic Simulation Environment.
concept: true
order: 6
permalink: /surface-atlas/concepts/ase-building/
sections:
  - {id: map-parameters, label: Map concepts to parameters}
  - {id: explicit-example, label: Build an explicit model}
  - {id: site-coordinates, label: Place the adsorbate}
  - {id: inspect-model, label: Inspect and assert}
  - {id: converge-model, label: Converge the approximation}
  - {id: preserve-record, label: Preserve the record}
references:
  - larsen-2017
  - ase-surfaces
  - ase-surface-source-3-24
  - sun-ceder-2013
  - bengtsson-1999
---

## Translate each scientific choice into a parameter {#map-parameters}

The Atomic Simulation Environment (ASE) represents atoms, cells, periodic boundary conditions, constraints, calculators, and file formats in a scriptable Python interface. It does not decide which physical model is appropriate; that remains part of the scientific work. {% include cite.html id="larsen-2017" %}

<div class="table-wrap"><table><thead><tr><th>Scientific choice</th><th>ASE representation</th><th>What must be recorded</th></tr></thead><tbody><tr><td>Bulk structure and metric</td><td>builder, element, <code>a</code>, and for HCP <code>c</code></td><td>Source and state of the lattice parameters</td></tr><tr><td>Orientation and termination</td><td>facet-specific builder or <code>surface()</code></td><td>Indices, input bulk cell, and exposed termination</td></tr><tr><td>Surface cell and thickness</td><td><code>size=(n₁,n₂,nlayers)</code></td><td>In-plane vectors and atom-bearing layer count</td></tr><tr><td>Adsorption geometry</td><td>named keyword or explicit Cartesian <code>(x,y)</code></td><td>Initial lateral site, height, and molecular orientation</td></tr><tr><td>Bulk-like support</td><td><code>FixAtoms</code> or another constraint</td><td>Exactly which atoms were constrained</td></tr></tbody></table></div>

ASE provides specialized helpers for common low-index surfaces and a general surface builder for other orientations. Supported named adsorption sites depend on the helper; a physically meaningful site is not automatically an ASE keyword. {% include cite.html id="ase-surfaces" %}

## Build one complete structure explicitly {#explicit-example}

This example creates a \\(3\times3\\), four-layer Cu(111) slab, starts H at an FCC hollow, adds 12 Å of vacuum on **each** side of the complete slab–adsorbate structure, and fixes the bottom metal layer. The numerical lattice constant and starting height are explicit, illustrative inputs; replace them with sourced values appropriate to the intended calculation. ASE's surface builders assign positive integer tags to substrate layers, beginning with 1 at the outermost layer. {% include cite.html id="ase-surfaces" %}

```python
import ase
import numpy as np
from ase.build import add_adsorbate, fcc111
from ase.constraints import FixAtoms
from ase.io import write

a = 3.615  # Å; illustrative input—replace and cite for production work
slab = fcc111("Cu", size=(3, 3, 4), a=a, vacuum=None)

add_adsorbate(slab, "H", height=1.2, position="fcc")
slab.center(vacuum=12.0, axis=2)

# Surface builders tag the outermost metal layer 1 and count inward.
bottom_tag = max(slab.get_tags())
slab.set_constraint(FixAtoms(mask=slab.get_tags() == bottom_tag))

slab.info["model"] = {
    "ase_version": ase.__version__,
    "facet": "Cu(111)",
    "lattice_constant_A": a,
    "lattice_parameter_source": "illustrative teaching input",
    "initial_site": "fcc",
    "initial_height_A": 1.2,
}
write("cu111_h_initial.traj", slab)

print("ASE:", ase.__version__)
print("cell / Å:\n", slab.cell.array)
print("PBC:", slab.pbc)
print("tags:", np.unique(slab.get_tags(), return_counts=True))
```

Adding the adsorbate before calling `center()` makes the requested vacuum apply to the complete structure rather than only to the clean slab. An explicit lattice parameter prevents the geometry from silently changing with a library default or database update. The script records—but does not claim that 3.615 Å is the correct bulk parameter for a particular state or that 1.2 Å is a relaxed H–surface distance.

## Keep lateral site and vertical height separate {#site-coordinates}

`add_adsorbate()` accepts either a builder-supported site name or an absolute Cartesian \\((x,y)\\) position. Its `offset` argument is expressed in surface-cell repeats. For a molecule, `mol_index` selects the atom placed at that reference point; orienting the rest of the molecule is the user's responsibility. {% include cite.html id="ase-surfaces" %}

In ASE 3.24.0, `height` is added to the \\(z\\) coordinate of the stored top-layer atom. If that metadata is absent, ASE finds and caches the slab atom with the largest \\(z\\). It does **not** infer a chemistry-dependent bond length or a local height above a lower terrace atom. {% include cite.html id="ase-surface-source-3-24" %}

For a site given by atlas fractional coordinates \\((u,v)\\), first verify that the atlas and ASE structures use the same vector order, handedness, and surface-cell origin. If they do, convert through the actual ASE in-plane vectors and add that origin before passing the Cartesian position to ASE:

```python
u, v = 1 / 3, 1 / 3
origin_xy = np.array([0.0, 0.0])  # ASE origin matching the atlas origin
xy = origin_xy + u * slab.cell[0, :2] + v * slab.cell[1, :2]

# Use a deliberately chosen initial z for corrugated or stepped surfaces.
# add_adsorbate(slab, "H", height=..., position=xy)
```

If the origins or cell conventions differ, map the coordinate with the corresponding affine cell transformation instead of copying \\((u,v)\\). On a corrugated surface, construct the local support geometry explicitly and inspect the resulting Cartesian position. The atlas's shared marker height is only a visualization convention; it is not an input recommendation.

## Inspect the structure and make assumptions executable {#inspect-model}

A successful constructor call proves only that an `Atoms` object exists. View the structure from above and from the side, then check its invariants in code:

```python
metal = slab[slab.get_tags() > 0]
z_levels = np.unique(np.round(metal.positions[:, 2], 5))

assert tuple(bool(x) for x in slab.pbc) == (True, True, False)
assert len(z_levels) == 4
assert np.count_nonzero(slab.get_tags() == bottom_tag) == 9
assert slab.cell.area(2) > 0

print("metal layer z / Å:", z_levels)
print("vacuum-axis length / Å:", slab.cell.lengths()[2])
```

Inspect the termination, layer sequence, in-plane vectors, atom count, constraints, adsorbate orientation, and shortest periodic adsorbate-image distance. Assertions should encode properties that are invariant for the intended model, not incidental ordering of atoms in a file.

<aside class="concept-callout warning"><strong>Do not trust a familiar filename.</strong><p>A file called <code>fcc111.xyz</code> can still contain the wrong lattice constant, termination, cell orientation, vacuum, or fixed layer. The structure and metadata are the evidence.</p></aside>

## Converge the quantity you intend to report {#converge-model}

There is no universal safe layer count or vacuum thickness. Change one approximation at a time and monitor the quantity used in the conclusion. Surface-slab construction and convergence require consistent bulk and slab references, particularly for surface energies. {% include cite.html id="sun-ceder-2013" %}

<div class="table-wrap"><table><thead><tr><th>Test</th><th>Change</th><th>Monitor</th></tr></thead><tbody><tr><td>Bulk reference</td><td>lattice parameter, cutoff, k-point density</td><td>energy per atom and stress</td></tr><tr><td>Slab thickness</td><td>number of atomic layers</td><td>surface/adsorption energy and central-layer behaviour</td></tr><tr><td>Vacuum</td><td>cell length normal to the surface</td><td>energy, potential, work function, and image interaction</td></tr><tr><td>Lateral cell</td><td>surface supercell</td><td>coverage and adsorbate-image interaction</td></tr><tr><td>Relaxed depth</td><td>fixed versus mobile layers</td><td>forces and near-surface geometry</td></tr><tr><td>Reciprocal sampling</td><td>k-point density scaled with cell size</td><td>energies, forces, and metallic states</td></tr></tbody></table></div>

A symmetric slab has equivalent faces by construction. A one-sided adsorbate usually makes the slab asymmetric and can create a dipole normal to the surface under three-dimensional periodic electrostatics. Vacuum alone does not necessarily remove the artificial field; use and document the correction appropriate to the chosen calculator. {% include cite.html id="bengtsson-1999" %}

## Save enough information to reproduce the model {#preserve-record}

Keep the initial and relaxed structures, the generating script, calculator input, and software environment together. A useful record includes:

- ASE and calculator versions, plus pseudopotential or basis identifiers;
- element or composition, lattice parameters, and their source;
- indices, termination, reconstruction, in-plane vectors, and slab thickness;
- vacuum, periodic boundary conditions, constraints, and dipole treatment;
- adsorbate identity, coverage, starting coordinate, height, and orientation;
- electronic settings and the convergence evidence for the reported quantity;
- initial and final geometries when relaxation changes the named site.

Pin dependencies in a lock file or environment specification when the work must be rerun exactly. Cite the ASE paper for the software and the version-relevant official documentation or source for API behaviour. A short script plus a structure file is substantially more reproducible than either one alone.

<div class="concept-actions"><a class="button" href="{{ '/surface-sites/' | relative_url }}">Use a facet example</a><a class="button secondary" href="{{ '/surface-builder/' | relative_url }}">Inspect another orientation</a></div>
