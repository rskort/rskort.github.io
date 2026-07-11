---
layout: concept
title: Bulk crystal lattices
short_title: Bulk lattices
heading: Start with the bulk lattice
theme: Structure
card_description: See how FCC, BCC, and HCP translation vectors and atomic bases determine what a cut can expose.
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

<div class="lattice-cards">
  <figure><svg viewBox="0 0 180 145" role="img" aria-label="FCC conventional cell with corner and face-centred atoms"><path class="cell-wire" d="M34 46 98 12 153 43 90 78Zm0 0v63l56 27 63-34V43M90 78v58M34 109l64-34 55 27M98 12v63"/><g class="lattice-atoms"><circle cx="34" cy="46"/><circle cx="98" cy="12"/><circle cx="153" cy="43"/><circle cx="90" cy="78"/><circle cx="34" cy="109"/><circle cx="90" cy="136"/><circle cx="153" cy="102"/><circle cx="98" cy="75" class="basis-atom"/><circle cx="62" cy="94" class="basis-atom"/><circle cx="122" cy="90" class="basis-atom"/></g></svg><figcaption><strong>FCC</strong><span>Atoms at corners and face centres</span></figcaption></figure>
  <figure><svg viewBox="0 0 180 145" role="img" aria-label="BCC conventional cell with a body-centred atom"><path class="cell-wire" d="M34 46 98 12 153 43 90 78Zm0 0v63l56 27 63-34V43M90 78v58M34 109l64-34 55 27M98 12v63"/><g class="lattice-atoms"><circle cx="34" cy="46"/><circle cx="98" cy="12"/><circle cx="153" cy="43"/><circle cx="90" cy="78"/><circle cx="34" cy="109"/><circle cx="90" cy="136"/><circle cx="153" cy="102"/><circle cx="94" cy="75" class="basis-atom large"/></g></svg><figcaption><strong>BCC</strong><span>One atom at the body centre</span></figcaption></figure>
  <figure><svg viewBox="0 0 180 145" role="img" aria-label="HCP hexagonal cell with alternating close-packed layers"><path class="cell-wire" d="M31 40 62 20 119 20 150 40 119 60 62 60Zm0 0v64l31 20h57l31-20V40M62 60v64M119 60v64M31 104l31-20h57l31 20"/><g class="lattice-atoms"><circle cx="31" cy="40"/><circle cx="62" cy="20"/><circle cx="119" cy="20"/><circle cx="150" cy="40"/><circle cx="119" cy="60"/><circle cx="62" cy="60"/><circle cx="90" cy="77" class="basis-atom large"/><circle cx="62" cy="124"/><circle cx="119" cy="124"/></g></svg><figcaption><strong>HCP</strong><span>AB-stacked hexagonal layers</span></figcaption></figure>
</div>

## Three common elemental structures {#compare-lattices}

<div class="table-wrap"><table><thead><tr><th>Structure</th><th>Conventional description</th><th>Nearest-neighbour coordination</th><th>Packing character</th></tr></thead><tbody><tr><td><strong>FCC</strong></td><td>Cubic, 4 atoms per conventional cell</td><td>12</td><td>Close packed; ABC layer stacking</td></tr><tr><td><strong>BCC</strong></td><td>Cubic, 2 atoms per conventional cell</td><td>8</td><td>Not close packed; dense (110) rows</td></tr><tr><td><strong>HCP</strong></td><td>Hexagonal, 2-atom primitive basis</td><td>12</td><td>Close packed; AB layer stacking</td></tr></tbody></table></div>

For the ideal HCP geometry, \(c/a=\sqrt{8/3}\approx1.633\). Real materials may deviate from this ratio, changing interlayer distances without changing the Miller–Bravais notation.

<aside class="concept-callout"><strong>Cell choice is not structure.</strong><p>A primitive and a conventional cell can describe exactly the same infinite crystal. What matters is the translation group plus the basis, not the shape of the box drawn around them.</p></aside>

## A plane does not determine a surface alone {#why-surfaces-differ}

Miller indices orient a plane relative to the lattice vectors. The basis determines which atoms occur at each height along that normal. That is why FCC(110) and BCC(110) share a normal direction but expose different row spacings, layer sequences, and adsorption pockets.

Cutting also creates a **termination**: the particular atomic level at which the infinite bulk is stopped. Translating a plane through one interplanar period can encounter inequivalent layers, especially in crystals with a multi-atom basis or more than one element.

<div class="concept-actions"><a class="button" href="{{ '/surface-builder/?lattice=fcc&h=1&k=1&l=0&offset=0.500' | relative_url }}">Compare FCC(110)</a><a class="button secondary" href="{{ '/surface-builder/?lattice=bcc&h=1&k=1&l=0&offset=0.500' | relative_url }}">Compare BCC(110)</a></div>
