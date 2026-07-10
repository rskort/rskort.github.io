---
layout: default
title: Surface cells
permalink: /concepts/surface-cells/
---

# Surface cells

A surface cell is the two-dimensional repeat unit used to describe a periodic slab. Two in-plane vectors, \(\mathbf{a}_1\) and \(\mathbf{a}_2\), span the surface; a third vector points across the slab and its vacuum region.

The smallest possible choice is a primitive cell. A larger \((m\times n)\) supercell repeats it \(m\) and \(n\) times. Larger cells reduce interactions between periodic adsorbate images and allow more complex coverages, reconstructions, or coadsorption patterns, at greater computational cost.

For a fractional in-plane coordinate \((u,v)\), the lateral position is

\[
\mathbf{r}_{\parallel}=u\mathbf{a}_1+v\mathbf{a}_2.
\]

Cell-vector conventions can differ between codes even when they describe the same surface. Compare the real-space vectors and atomic positions rather than relying only on a label such as \((2\times2)\).

[Return to the surface atlas]({{ '/surface-sites/' | relative_url }}).

