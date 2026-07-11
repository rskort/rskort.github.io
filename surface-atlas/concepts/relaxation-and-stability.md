---
layout: concept
title: Surface relaxation and stability
short_title: Stability
heading: Relaxation, reconstruction, and stability
theme: Energetics
card_description: Relaxation, reconstruction, termination, surface energy, and adsorption minima.
intro: The atlas shows ideal, unreconstructed terminations because they make geometry legible. Real surfaces move, exchange atoms, reconstruct, and respond to their chemical environment.
description: Understand surface relaxation, reconstruction, termination, surface energy, polarity, and the limits of ideal adsorption-site models.
concept: true
order: 5
permalink: /surface-atlas/concepts/relaxation-and-stability/
sections:
  - {id: what-can-change, label: What can change}
  - {id: surface-energy, label: Surface energy}
  - {id: adsorption-landscape, label: Adsorption landscape}
  - {id: reporting-model, label: Report the model}
---

## Relaxation, reconstruction, and termination {#what-can-change}

Creating a surface removes neighbours from atoms that were coordinated in the bulk. The remaining atoms redistribute charge and force until a new equilibrium is reached.

<div class="comparison"><div><strong>Relaxation</strong><span>Atoms move while the surface periodicity and composition remain the same.</span></div><div><strong>Reconstruction</strong><span>The surface adopts a new periodicity, bonding pattern, or atom count.</span></div><div><strong>Termination</strong><span>A choice of which atomic or chemical layer ends the bulk.</span></div></div>

Interlayer spacings often contract or expand near the surface. A reconstruction can be subtler or more dramatic: rows may pair, vacancies may order, or a nominal \((1\times1)\) surface may become \((2\times1)\). These changes cannot be inferred from Miller indices alone.

## Comparing surface energies {#surface-energy}

For a symmetric elemental slab with two equivalent faces, a common definition is

<div class="formula-strip">\[\gamma=\frac{E_{\mathrm{slab}}-N E_{\mathrm{bulk}}}{2A}.\]</div>

Here \(A\) is the area of one face. The factor of two is valid only when the two surfaces are equivalent. For multicomponent, polar, asymmetric, or adsorbate-covered slabs, chemical potentials and face-specific terms may be required.

Lower-index close-packed facets often have lower surface energy because they break fewer or weaker bonds per unit area. This correlation is not universal. Temperature, pressure, adsorbates, magnetism, and composition can change which facet or termination is stable.

<aside class="concept-callout warning"><strong>Geometry is not a stability prediction.</strong><p>The builder's sites are geometric starting points. It does not calculate surface energies, phonons, reconstructions, or adsorption free energies.</p></aside>

## From named site to energy landscape {#adsorption-landscape}

An ontop, bridge, or hollow label defines an initial local geometry. During optimization an adsorbate may move to another site, tilt, dissociate, penetrate a subsurface pocket, or induce a reconstruction. Compare several plausible starting structures using the same computational settings.

For adsorption energy, state the sign convention. One widely used choice is

<div class="formula-strip">\[E_{\mathrm{ads}}=E_{\mathrm{slab+ads}}-E_{\mathrm{slab}}-E_{\mathrm{adsorbate}},\]</div>

for which a negative value denotes exothermic binding. Other fields use the opposite sign, so the equation belongs next to the number.

## Make the model reproducible {#reporting-model}

Report enough information to distinguish the calculation from every other slab with the same indices:

- crystal structure, element or composition, and lattice parameters;
- Miller indices, termination, reconstruction, and surface-cell vectors;
- slab thickness, vacuum, fixed layers, and whether the two faces are equivalent;
- adsorbate coverage, initial site, and final relaxed geometry;
- electronic-structure settings and the convergence tests relevant to the quantity reported.

The atlas shows the ideal reference geometry. Report relaxation and reconstruction relative to that structure.
