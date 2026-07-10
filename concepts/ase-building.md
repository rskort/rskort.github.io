---
layout: concept
title: Building surfaces with ASE
short_title: Build a slab
concept: true
order: 4
permalink: /concepts/ase-building/
---

# Building surfaces with ASE

The Atomic Simulation Environment (ASE) provides helpers for common facets. A minimal FCC(111) slab is:

```python
from ase.build import add_adsorbate, fcc111

slab = fcc111("Cu", size=(3, 3, 4), vacuum=10.0)
add_adsorbate(slab, "H", height=1.2, position="fcc")
slab.center(axis=2, vacuum=10.0)
```

Here, `size=(3, 3, 4)` creates three repeats along each surface vector and four atomic layers. The vacuum separates periodic slab images. `height` is the initial vertical distance from ASE's reference surface plane.

Before a calculation, check the lattice constant, termination, cell vectors, layer count, vacuum thickness, periodic boundary conditions, and adsorbate-image separation. Convergence tests are more reliable than universal fixed values. During relaxation, it is common to constrain one or more bottom layers to mimic the bulk.

The atlas pages provide facet-specific builders and site keywords. The figure generator in `tools/` uses the same ASE slab constructors.

## A useful pre-flight check

1. View the slab from the side and confirm that the intended plane is horizontal.
2. Count distinct z layers rather than assuming the builder's size convention.
3. Check that the bottom and top terminations are the ones you expect.
4. Increase the lateral cell, slab thickness, and vacuum separately until the quantity of interest is converged.
5. Record the builder, lattice constant, size, and constraints with the result.
