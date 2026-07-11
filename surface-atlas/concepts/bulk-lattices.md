---
layout: concept
title: Bulk crystal lattices
short_title: Bulk lattices
heading: Start with the bulk lattice
theme: Structure
card_description: FCC, BCC, and HCP translation vectors, atomic bases, coordination, and layer stacking.
intro: A surface inherits its geometry from the infinite crystal beneath it. Before choosing a plane, separate the lattice that repeats from the atomic basis carried by every lattice point.
description: Visual introduction to FCC, BCC, and HCP bulk crystal lattices, conventional and primitive cells, coordination, and close packing.
concept: true
order: 1
permalink: /surface-atlas/concepts/bulk-lattices/
sections:
  - {id: lattice-and-basis, label: Lattice and basis}
  - {id: compare-lattices, label: Compare FCC, BCC, and HCP}
  - {id: why-surfaces-differ, label: Why surfaces differ}
---

## Translation plus decoration {#lattice-and-basis}

A **Bravais lattice** is the set of positions produced by integer combinations of primitive translation vectors. A **basis** is the atom or group of atoms attached to each lattice point. Together they make the crystal structure.

The familiar cubic boxes used for FCC and BCC are conventional cells: they make the symmetry obvious, but they are not the smallest possible repeat. Counting shared atoms gives four atoms per conventional FCC cell and two per conventional BCC cell. The primitive cell of either lattice contains one lattice point.

<div class="structure-definitions">
  <section><h3>FCC</h3><p>Conventional cubic fractional positions:</p><code>(0,0,0) · (0,½,½) · (½,0,½) · (½,½,0)</code><p>Translations reproduce the corner and face-centred positions of neighbouring cells.</p></section>
  <section><h3>BCC</h3><p>Conventional cubic fractional positions:</p><code>(0,0,0) · (½,½,½)</code><p>The second position is the body-centred lattice point.</p></section>
  <section><h3>HCP</h3><p>One common hexagonal fractional convention:</p><code>(0,0,0) · (⅔,⅓,½)</code><p>The two-position basis gives ABAB stacking along the c axis.</p></section>
</div>

## Three common elemental structures {#compare-lattices}

<div class="table-wrap"><table><thead><tr><th>Structure</th><th>Conventional description</th><th>Nearest-neighbour coordination</th><th>Packing character</th></tr></thead><tbody><tr><td><strong>FCC</strong></td><td>Cubic, 4 atoms per conventional cell</td><td>12</td><td>Close packed; ABC layer stacking</td></tr><tr><td><strong>BCC</strong></td><td>Cubic, 2 atoms per conventional cell</td><td>8</td><td>Not close packed; dense (110) rows</td></tr><tr><td><strong>HCP</strong></td><td>Hexagonal, 2-atom primitive basis</td><td>12</td><td>Close packed; AB layer stacking</td></tr></tbody></table></div>

For the ideal HCP geometry, \(c/a=\sqrt{8/3}\approx1.633\). Real materials may deviate from this ratio, changing interlayer distances without changing the Miller–Bravais notation.

<aside class="concept-callout"><strong>Cell choice is not structure.</strong><p>A primitive and a conventional cell can describe exactly the same infinite crystal. What matters is the translation group plus the basis, not the shape of the box drawn around them.</p></aside>

## A plane does not determine a surface alone {#why-surfaces-differ}

Miller indices orient a plane relative to the lattice vectors. The basis determines which atoms occur at each height along that normal. That is why FCC(110) and BCC(110) share a normal direction but expose different row spacings, layer sequences, and adsorption pockets.

Cutting also creates a **termination**: the particular atomic level at which the infinite bulk is stopped. Translating a plane through one interplanar period can encounter inequivalent layers, especially in crystals with a multi-atom basis or more than one element.

<div class="concept-actions"><a class="button" href="{{ '/surface-builder/?lattice=fcc&h=1&k=1&l=0&offset=0.500' | relative_url }}">Compare FCC(110)</a><a class="button secondary" href="{{ '/surface-builder/?lattice=bcc&h=1&k=1&l=0&offset=0.500' | relative_url }}">Compare BCC(110)</a></div>
