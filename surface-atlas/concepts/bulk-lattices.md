---
layout: concept
title: Bulk crystal structures
short_title: Bulk structure
heading: Begin with the periodic crystal
theme: Structure
card_description: Build the six atlas structures from translation vectors and atomic positions, then compare their coordination and layer stacking.
intro: A surface inherits its atomic arrangement from the bulk beneath it. Start by separating the translations that repeat from the atoms carried by each repeat.
description: Learn how lattice vectors, fractional coordinates, atomic bases, and cell choices describe FCC, BCC, HCP, SC, SH, and BCT bulk crystals.
concept: true
order: 1
permalink: /surface-atlas/concepts/bulk-lattices/
sections:
  - {id: periodic-coordinates, label: Periodic coordinates}
  - {id: lattice-and-basis, label: Cells and atomic bases}
  - {id: compare-lattices, label: Compare the six structures}
  - {id: coordination-and-stacking, label: Coordination and stacking}
references:
  - iucr-lattice
  - iucr-unit-cell
  - hammond-2015
  - iucr-close-packing
---

## Translation vectors locate every repeat {#periodic-coordinates}

Choose three independent **primitive** translation vectors, \\(\mathbf a_1\\), \\(\mathbf a_2\\), and \\(\mathbf a_3\\). Integer combinations of them generate every point of the **Bravais lattice**:

<div class="formula-strip">\[\mathbf R_{n_1n_2n_3}=n_1\mathbf a_1+n_2\mathbf a_2+n_3\mathbf a_3,\qquad n_i\in\mathbb Z.\]</div>

Each \\(\mathbf R\\) is a lattice point with an identical environment. The vectors define the **direct lattice**; they need not be mutually perpendicular or equal in length. A nonprimitive conventional cell instead spans a sublattice and contains more than one lattice point. {% include cite.html id="iucr-lattice" %}

A position can be written in fractional coordinates as

<div class="formula-strip">\[\mathbf r=x\mathbf a_1+y\mathbf a_2+z\mathbf a_3.\]</div>

The triplet \\((x,y,z)\\) has meaning only together with the stated vectors. Adding an integer to any component reaches a periodically equivalent position, so \\((0,0,0)\\) and \\((1,0,0)\\) mark equivalent points in neighbouring cells.

## A lattice and a basis make the crystal {#lattice-and-basis}

A **unit cell** is a region whose translations reproduce the crystal. A primitive cell contains exactly one lattice point; a conventional cell may contain several lattice points but makes the crystal symmetry easier to see. These are different coordinate descriptions of the same infinite structure, not different materials. {% include cite.html id="iucr-unit-cell" %}

The Bravais lattice alone specifies only equivalent points. Attach one or more atomic positions \\(\boldsymbol\tau_j\\), called the **basis**, to every lattice point to obtain all atomic positions:

<div class="formula-strip">\[\mathbf r_{n_1n_2n_3,j}=\mathbf R_{n_1n_2n_3}+\boldsymbol\tau_j.\]</div>

This distinction matters at a surface: the translations determine which orientations can repeat, while the basis determines which elements and atomic layers occur along a chosen orientation.

<aside class="concept-callout"><strong>The cell outline is a convention.</strong><p>Atoms on opposite cell boundaries are periodic images. A primitive and a conventional cell can describe exactly the same crystal when their vectors and atomic positions are transformed consistently.</p></aside>

## Six structures used throughout the atlas {#compare-lattices}

The coordinate lists below use explicit conventional-cell choices. SC, FCC, BCC, SH, and BCT are Bravais lattices, although centred conventional cells contain more than one lattice point. HCP instead requires a two-atom basis on a primitive hexagonal Bravais lattice.

<div class="structure-definitions">
  <section><h3>FCC</h3><p><strong>Face-centred cubic Bravais lattice.</strong> In the conventional cubic cell:</p><code>(0, 0, 0) · (0, 1/2, 1/2) · (1/2, 0, 1/2) · (1/2, 1/2, 0)</code><p>The four occupied positions represent four lattice points per conventional cell.</p></section>
  <section><h3>BCC</h3><p><strong>Body-centred cubic Bravais lattice.</strong> In the conventional cubic cell:</p><code>(0, 0, 0) · (1/2, 1/2, 1/2)</code><p>The corner and body-centred positions represent two lattice points per conventional cell.</p></section>
  <section><h3>HCP</h3><p><strong>Hexagonal lattice plus a basis.</strong> With basal vectors separated by \(120^\circ\) and a third vector along \(c\), one common convention is:</p><code>(0, 0, 0) · (2/3, 1/3, 1/2)</code><p>The two-atom basis produces the hexagonal close-packed structure. Another vector convention may use symmetry-equivalent fractions.</p></section>
  <section><h3>SC</h3><p><strong>Simple cubic Bravais lattice.</strong> The conventional and primitive cubic cells coincide:</p><code>(0, 0, 0)</code><p>One lattice site repeats along three perpendicular translations of length \(a\).</p></section>
  <section><h3>SH</h3><p><strong>Primitive hexagonal Bravais lattice.</strong> The one-site basis is:</p><code>(0, 0, 0)</code><p>Basal triangular nets repeat directly in AA registry after the independent translation \(c\).</p></section>
  <section><h3>BCT</h3><p><strong>Body-centred tetragonal Bravais lattice.</strong> In the conventional tetragonal cell:</p><code>(0, 0, 0) · (1/2, 1/2, 1/2)</code><p>The two basal vectors have length \(a\); the perpendicular tetragonal vector has the independent length \(c\).</p></section>
</div>

Calling all six “lattices” is convenient shorthand, but it hides an important distinction: HCP is a crystal structure with a two-atom basis, whereas the other five names identify Bravais lattices used here with a one-site basis. {% include cite.html id="hammond-2015" %}

## Neighbours reveal packing and layer registry {#coordination-and-stacking}

The **bulk coordination number** counts an atom's nearest neighbours in the ideal infinite structure. It describes a three-dimensional neighbour shell; it is not the same as the number of surface atoms later used to construct a lateral point above the crystal.

<div class="table-wrap"><table><thead><tr><th>Structure</th><th>Nearest-neighbour coordination</th><th>Layer and packing character</th></tr></thead><tbody><tr><td><strong>FCC</strong></td><td>12</td><td>Close-packed \(\{111\}\) layers in an ABCABC sequence</td></tr><tr><td><strong>BCC</strong></td><td>8</td><td>Densest \(\{110\}\) planes and \(\langle111\rangle\) rows; not close packed</td></tr><tr><td><strong>Ideal HCP</strong></td><td>12</td><td>Close-packed basal \((0001)\) layers in an ABAB sequence</td></tr><tr><td><strong>SC</strong></td><td>6</td><td>Equal neighbours along the three cubic axes</td></tr><tr><td><strong>SH</strong></td><td>Metric dependent</td><td>AA basal layers; six basal neighbours when \(c&gt;a\)</td></tr><tr><td><strong>BCT</strong></td><td>Metric dependent</td><td>Body-centred layers distorted by the chosen \(c/a\) ratio</td></tr></tbody></table></div>

In the stacking notation, A, B, and C label the three possible lateral registries of a close-packed layer. FCC cycles through all three; HCP alternates between two. For equal touching spheres, ideal HCP has

<div class="formula-strip">\[\frac{c}{a}=\sqrt{\frac{8}{3}}\approx1.633.\]</div>

Real HCP materials can have a different \\(c/a\\) ratio, which splits some neighbour distances while preserving the same translational symmetry and AB stacking. Close packing and its layer sequences are geometric models, not assumptions that real atoms are rigid spheres. {% include cite.html id="iucr-close-packing" %}

The bulk description now tells us where every atom is. The next step is to choose an orientation through that periodic structure without confusing the orientation with the atomic layer at which the crystal ends.
