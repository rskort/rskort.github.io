---
layout: concept
title: Surface cells
short_title: Surface cells
heading: Describe the repeating surface
theme: Periodicity
card_description: Define the two-dimensional repeat, choose a reference cell, and turn an ideal surface into a finite periodic slab.
intro: A crystal surface extends without an edge. Two in-plane translations describe its lateral repeat; a finite slab and vacuum make that geometry usable in a periodic calculation.
description: Learn how surface vectors, fractional coordinates, reference cells, periodic boundary conditions, and finite slabs describe a crystal surface.
concept: true
order: 3
permalink: /surface-atlas/concepts/surface-cells/
sections:
  - {id: two-dimensional-repeat, label: The two-dimensional repeat}
  - {id: fractional-coordinates, label: Fractional surface coordinates}
  - {id: cell-choices, label: Primitive, reference, and supercells}
  - {id: periodic-slab, label: The periodic slab model}
  - {id: faces-and-symmetry, label: Two faces and symmetry}
references:
  - iucr-unit-cell
  - wood-1964
  - sun-ceder-2013
---

## The surface is a two-dimensional crystal {#two-dimensional-repeat}

The previous page fixed the orientation and termination of an ideal bulk cut. Its lateral pattern repeats under two independent translations. Choose non-collinear in-plane vectors \\(\mathbf a_1\\) and \\(\mathbf a_2\\). Translating by any integer combination returns an equivalent part of the infinite surface:

<div class="formula-strip">\[\mathbf R_{mn}=m\mathbf a_1+n\mathbf a_2,\qquad m,n\in\mathbb Z.\]</div>

The parallelogram spanned by these vectors is a **surface cell**, and its area is

<div class="formula-strip">\[A=\left|\mathbf a_1\times\mathbf a_2\right|.\]</div>

As in the bulk, the vectors are only the translation lattice. The atoms associated with one repeat form its basis. Vectors plus basis reproduce the complete ideal surface. A unit cell is therefore a repeat convention, not a physical boundary. {% include cite.html id="iucr-unit-cell" %}

Surface crystallography uses the ideal two-dimensional lattice as a reference. A later structure with a different repeat has its own surface translations, which should be stated relative to that reference. {% include cite.html id="wood-1964" %}

## Fractional coordinates belong to the chosen cell {#fractional-coordinates}

Write a lateral point in fractional surface coordinates as

<div class="formula-strip">\[\mathbf r_{\parallel}=u\mathbf a_1+v\mathbf a_2.\]</div>

The pairs \\((u,v)\\) and \\((u+m,v+n)\\), with integer \\(m,n\\), identify periodic images of the same lateral position. This remains true for an oblique cell, where Cartesian \\(x,y\\) values alone do not reveal the periodic relation.

A full three-dimensional position also needs a coordinate normal to the surface. On a corrugated facet, atoms at similar \\((u,v)\\) can belong to different atomic heights. The lateral coordinate and the height are therefore separate pieces of information, which is a distinction that becomes essential when an atom or molecule is added above the surface.

<aside class="concept-callout"><strong>The outline is not a wall.</strong><p>An atom drawn on one edge has a periodic image on the opposite edge. Count the basis once, using one consistent boundary convention.</p></aside>

## Primitive, reference, and supercells serve different purposes {#cell-choices}

A **primitive surface cell** has the smallest area compatible with the two-dimensional translation lattice. A **reference cell** is the cell explicitly chosen for a drawing, table, or calculation; it may be primitive or deliberately larger or more rectangular. A **supercell** contains an integer number of repeats of that reference cell.

<div class="comparison"><div><strong>Primitive cell</strong><span>Smallest lateral repeat of the stated surface structure.</span></div><div><strong>Reference cell</strong><span>The declared vectors to which coordinates and labels refer.</span></div><div><strong>Supercell</strong><span>An integer expansion used to represent a larger periodic pattern.</span></div></div>

For a general integer transformation,

<div class="formula-strip">\[\begin{pmatrix}\mathbf A_1\\[2pt]\mathbf A_2\end{pmatrix}=\begin{pmatrix}p&q\\r&s\end{pmatrix}\begin{pmatrix}\mathbf a_1\\[2pt]\mathbf a_2\end{pmatrix},\qquad \frac{A'}{A}=|ps-qr|,\quad ps-qr\ne0.\]</div>

The nonsingular integer matrix keeps \\(\mathbf A_1\\) and \\(\mathbf A_2\\) independent, and the magnitude of its determinant gives the number of reference-cell areas in the new cell. A simple \\((m\times n)\\) expansion has \\(\mathbf A_1=m\mathbf a_1\\) and \\(\mathbf A_2=n\mathbf a_2\\), but the notation is meaningful only after the reference vectors have been stated. Rotated surface structures require additional information; the label alone does not determine the vectors, origin, or atomic basis. {% include cite.html id="wood-1964" %}

Different-looking primitive cells can describe the same lattice. An integer change of basis with determinant \\(\pm1\\) changes the vectors without changing the cell area or translation lattice. To compare two conventions, compare their real-space vectors, areas, fractional positions, and origins; not only a label such as \\((1\times1)\\).

## A calculation represents a surface with a periodic slab {#periodic-slab}

A macroscopic surface bounds a solid that is effectively semi-infinite. An atomistic calculation instead uses a **slab**: a finite stack of atomic layers that repeats along \\(\mathbf a_1\\) and \\(\mathbf a_2\\). In codes with three-dimensional periodic boundary conditions, the third cell vector contains both the slab and an empty **vacuum region** so that repeated slabs are separated along the surface normal.

This construction makes three approximations visible:

- finite slab thickness replaces the semi-infinite bulk;
- finite vacuum separates periodic slab images rather than removing them;
- the lateral cell periodically repeats every displacement, defect, or added species placed in it.

Slab thickness and vacuum must be tested for the quantity being calculated. The central layers should recover sufficiently bulk-like behaviour, while interactions between repeated slabs should be negligible at the required accuracy. There is no single layer count or vacuum thickness that is reliable for every material and property. {% include cite.html id="sun-ceder-2013" %}

## Every finite slab has two faces {#faces-and-symmetry}

Truncating a finite stack creates a top face and a bottom face. In a **symmetric slab**, the two faces have equivalent terminations and atomic environments. In an **asymmetric slab**, their terminations or decorations differ. Merely centring the atoms inside the vacuum does not make the slab structurally symmetric.

Within one face, surface-symmetry operations can map apparently different positions onto equivalent local environments. Translations always belong to the ideal surface lattice; rotations, reflections, or glide operations may add further equivalences for a particular facet and termination. This is why a cell can contain several drawn copies of one physical position, and why only symmetry-distinct starting positions need separate labels.

<aside class="concept-callout warning"><strong>State which cell and which face you mean.</strong><p>Report the in-plane vectors, termination, slab thickness, vacuum, and whether the two faces are equivalent. Those choices are part of the model, not display settings.</p></aside>
