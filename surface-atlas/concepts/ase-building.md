---
layout: concept
title: Building surfaces with ASE
short_title: Build a slab
heading: Turn the geometry into a slab model
theme: Practice
card_description: Build, inspect, constrain, and converge a periodic surface model with ASE.
intro: A slab calculation replaces a semi-infinite solid with a finite stack of atomic layers, repeated laterally and separated from its periodic image by vacuum.
description: Build reliable crystal surface slabs with ASE using suitable layers, vacuum, supercells, constraints, and adsorbate positions.
concept: true
order: 6
permalink: /surface-atlas/concepts/ase-building/
sections:
  - {id: minimal-example, label: A minimal model}
  - {id: inspect-first, label: Inspect before calculating}
  - {id: convergence, label: Converge the model}
  - {id: asymmetric-slabs, label: Asymmetric slabs}
  - {id: reproducibility, label: Record the choices}
---

## A minimal, explicit example {#minimal-example}

The Atomic Simulation Environment (ASE) provides helpers for common facets. This example builds a \\(3\times3\\), four-layer FCC(111) model, fixes its bottom layer, and places H at an FCC hollow:

```python
from ase.build import add_adsorbate, fcc111
from ase.constraints import FixAtoms

slab = fcc111("Cu", size=(3, 3, 4), a=3.615, vacuum=12.0)

# ASE tags the outermost layer 1 and counts inward.
bottom_tag = max(slab.get_tags())
slab.set_constraint(FixAtoms(mask=slab.get_tags() == bottom_tag))

add_adsorbate(slab, "H", height=1.2, position="fcc")
```

Here, `size=(3, 3, 4)` creates three repeats along each surface vector and four atomic layers. The explicit lattice constant avoids silently depending on a library default. The vacuum separates periodic slab images. `height` is an initial geometric guess above ASE's reference surface plane—not a predicted bond length.

## Inspect the object before running a calculator {#inspect-first}

Before a calculation, check the lattice constant, termination, cell vectors, layer count, vacuum thickness, periodic boundary conditions, and adsorbate-image separation. Convergence tests are more reliable than universal fixed values. During relaxation, it is common to constrain one or more bottom layers to mimic the bulk.

```python
import numpy as np

print(slab.cell)
print("PBC:", slab.pbc)
print("atoms:", len(slab))
print("z levels:", np.unique(np.round(slab.positions[:, 2], 5)))
print("tags:", np.unique(slab.get_tags(), return_counts=True))
```

Always view the structure from both top and side. A plausible atom count does not prove that the intended termination, cell orientation, or fixed-layer mask was built.

## Converge one approximation at a time {#convergence}

<div class="table-wrap"><table><thead><tr><th>Test</th><th>Change independently</th><th>Watch</th></tr></thead><tbody><tr><td>Slab thickness</td><td>Number of atomic layers</td><td>Surface energy, adsorption energy, central-layer geometry</td></tr><tr><td>Vacuum</td><td>Cell length normal to the slab</td><td>Electrostatic potential and image interaction</td></tr><tr><td>Lateral size</td><td>Surface supercell</td><td>Adsorbate-image interaction and coverage</td></tr><tr><td>Reciprocal sampling</td><td>k-point density, scaled with cell size</td><td>Total energies, forces, metallic states</td></tr><tr><td>Relaxed depth</td><td>Number of unconstrained layers</td><td>Forces and near-surface relaxation</td></tr></tbody></table></div>

Converge the quantity you will report. A geometry may appear stable before an energy difference, work function, or barrier has converged.

## Symmetric and asymmetric slabs {#asymmetric-slabs}

A symmetric slab exposes equivalent top and bottom faces and can avoid a net dipole, but usually costs more atoms and may require adsorbates on both sides. An asymmetric slab is convenient for adsorption on one face but can create a dipole normal to the surface; many electronic-structure codes offer a dipole correction.

Do not assume that `slab.center(vacuum=...)` creates a physically symmetric slab. It centres the coordinates in the cell; atomic terminations and adsorbate decoration still determine the symmetry.

<aside class="concept-callout warning"><strong>Never relax only one starting site.</strong><p>For an unfamiliar adsorbate–surface pair, test several symmetry-distinct sites and orientations. Optimization answers “where does this starting geometry go?”, not “what is the global minimum?”</p></aside>

## Leave a reproducible record {#reproducibility}

Save both the input structure and the relaxed structure. Record the ASE builder and version, element, lattice constants, Miller indices, termination, `size`, vacuum, constraints, adsorbate coverage and starting site, calculator settings, and convergence evidence.

The atlas pages provide facet-specific ASE builders and site keywords. For a surface outside that common set, use the interactive builder to understand the cell and layer sequence, then construct and verify the corresponding atomistic model explicitly.

<div class="concept-actions"><a class="button" href="{{ '/surface-sites/' | relative_url }}">Browse ASE examples</a><a class="button secondary" href="{{ '/surface-builder/' | relative_url }}">Explore another orientation</a></div>
