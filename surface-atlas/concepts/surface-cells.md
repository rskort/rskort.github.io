---
layout: concept
title: Surface cells
short_title: Surface cells
heading: Find the two-dimensional repeat
theme: Periodicity
card_description: Build primitive and supercell descriptions from two in-plane vectors, then connect cell area to coverage and cost.
intro: A cut is infinite. A surface cell compresses that infinite two-dimensional pattern into two translation vectors and the atoms associated with one repeat.
description: Learn how two in-plane lattice vectors define a repeating crystal surface cell and its atomic structure.
concept: true
order: 3
permalink: /surface-atlas/concepts/surface-cells/
sections:
  - {id: two-vectors, label: Two in-plane vectors}
  - {id: primitive-and-supercell, label: Primitive cells and supercells}
  - {id: coverage, label: Coverage and periodic images}
  - {id: equivalent-cells, label: Equivalent cell choices}
---

## Two vectors tile the plane {#two-vectors}

Two in-plane vectors, \\(\mathbf{a}_1\\) and \\(\mathbf{a}_2\\), span the surface; a third cell vector points across the slab and its vacuum region. Any periodic image of an in-plane point is

<div class="formula-strip">\[\mathbf r_{mn}=\mathbf r_0+m\mathbf a_1+n\mathbf a_2,\qquad m,n\in\mathbb Z.\]</div>

The surface-cell area is

<div class="formula-strip">\[A=\left|\mathbf a_1\times\mathbf a_2\right|.\]</div>

For a fractional in-plane coordinate \\((u,v)\\), the lateral position inside one chosen cell is \\(\mathbf r_{\parallel}=u\mathbf a_1+v\mathbf a_2\\). Fractional coordinates remain meaningful when the cell is oblique; x and y coordinates alone can hide that periodicity.

## Primitive cell or supercell? {#primitive-and-supercell}

The smallest possible choice is a primitive cell. A larger \\((m\times n)\\) supercell repeats it \\(m\\) and \\(n\\) times. Larger cells reduce interactions between periodic adsorbate images and allow more complex coverages, reconstructions, or coadsorption patterns, at greater computational cost.

<div class="comparison"><div><strong>\((1\times1)\)</strong><span>The smallest chemical repeat; highest periodic adsorbate coverage.</span></div><div><strong>\((2\times2)\)</strong><span>Four primitive cells; adsorbate images are twice as far apart along both vectors.</span></div><div><strong>Rectangular cell</strong><span>Often convenient for visualization even when the primitive net is oblique.</span></div></div>

For a simple diagonal expansion, \\(\mathbf A_1=m\mathbf a_1\\) and \\(\mathbf A_2=n\mathbf a_2\\), so the area grows by \\(mn\\). A general integer surface matrix can also shear or rotate the cell:

<div class="formula-strip">\[\begin{pmatrix}\mathbf A_1\\[2pt]\mathbf A_2\end{pmatrix}=\begin{pmatrix}p&q\\r&s\end{pmatrix}\begin{pmatrix}\mathbf a_1\\[2pt]\mathbf a_2\end{pmatrix},\qquad \frac{A'}{A}=|ps-qr|.\]</div>

## Coverage lives in the periodic cell {#coverage}

If one adsorbate occupies a supercell containing four equivalent surface atoms, its nominal coverage is often reported as \\(1/4\\) monolayer. That convention must be defined: on stepped or multicomponent surfaces, “one monolayer” may refer to terrace atoms, all exposed atoms, or a particular site family.

The cell also fixes the shortest separation between periodic adsorbate images. A visually large cell can still have a short oblique lattice vector, so measure periodic distances rather than judging the drawing.

<aside class="concept-callout warning"><strong>The outline is not a wall.</strong><p>Atoms, bonds, charge density, and adsorbates continue through every cell edge under periodic boundary conditions. An atom drawn on one boundary is shared with the neighbouring image.</p></aside>

## Different boxes can describe the same surface {#equivalent-cells}

Cell-vector conventions can differ between codes even when they describe the same infinite surface. A triangular net may use a rhombic primitive cell or a larger rectangular cell. Compare the real-space vectors, determinant, atomic positions, and symmetry rather than relying only on a label such as \\((2\times2)\\).

Before comparing energies from different cells, normalize extensive quantities by surface area, number of surface atoms, or number of adsorbates as appropriate—and ensure the sampled reciprocal-space density is comparable.

<div class="concept-actions"><a class="button" href="{{ '/surface-sites/fcc-111.html' | relative_url }}">See the FCC(111) cell</a><a class="button secondary" href="{{ '/surface-builder/?lattice=fcc&h=1&k=1&l=1&offset=0.500' | relative_url }}">Generate it interactively</a></div>

