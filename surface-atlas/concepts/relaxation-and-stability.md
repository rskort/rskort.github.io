---
layout: concept
title: Surface relaxation and stability
short_title: Energetics and stability
heading: From ideal geometry to a stable surface
theme: Energetics
card_description: Separate ideal terminations from relaxed structures, local minima, surface energies, and environment-dependent stability.
intro: Geometry defines possible structures; energetics determines which structures are stationary, metastable, or thermodynamically favoured under stated conditions.
description: Understand surface relaxation, reconstruction, potential-energy landscapes, surface energy, adsorption energy, and environment-dependent stability.
concept: true
order: 5
permalink: /surface-atlas/concepts/relaxation-and-stability/
sections:
  - {id: ideal-and-relaxed, label: Ideal and relaxed surfaces}
  - {id: energy-landscape, label: Minima and saddles}
  - {id: surface-energy, label: Surface energy}
  - {id: adsorption-energy, label: Adsorption energy}
  - {id: environment, label: Environment and stability}
references:
  - muller-1986
  - gross-2003
  - henkelman-2000
  - fiorentini-methfessel-1996
  - tran-2016
  - reuter-scheffler-2003
  - tasker-1979
---

## The bulk truncation is a reference, not a prediction {#ideal-and-relaxed}

The atlas begins from an **ideal termination**: choose an orientation and termination, then stop the bulk stacking without moving any atoms. Creating that boundary changes the electronic density and leaves surface atoms with a different environment from atoms in the bulk. If the nuclei are optimized, they move until the remaining forces meet the chosen convergence criterion.

Terminology varies across subfields, so this atlas uses an operational distinction. **Relaxation** changes atomic positions within the stated atom count and two-dimensional repeat. **Reconstruction** denotes a different surface structure involving a changed translational periodicity, stoichiometry, or bonding topology; simple displacements within the original repeat are described as relaxation here. A different **termination** exposes a different layer or composition at the same orientation. State the actual cell and coordinates whenever a label could be ambiguous. {% include cite.html id="muller-1986" %}

<div class="comparison"><div><strong>Relaxation</strong><span>Atoms rumple or interlayer spacings change within the stated surface cell.</span></div><div><strong>Reconstruction</strong><span>The surface adopts a different motif, often with a larger or differently shaped repeat.</span></div><div><strong>Termination</strong><span>A different member of the oriented layer sequence ends the crystal.</span></div></div>

These labels describe the model, not the cause. A reconstruction can involve pairing, buckling, vacancies, added atoms, or adsorbates; a relaxation can lower point symmetry without creating a new translational repeat.

## A relaxation finds a nearby stationary structure {#energy-landscape}

For fixed composition and cell, the potential energy is a function of all nuclear coordinates, \\(E(\mathbf R)\\). A geometry optimizer follows local forces and normally reaches a nearby stationary point. It does not search every possible reconstruction, adsorbate orientation, dissociation state, or cell size. This is why several physically distinct starting structures must be tested. {% include cite.html id="gross-2003" %}

- At a **local minimum**, the forces vanish and small displacements raise the energy.
- At a **saddle point**, the forces also vanish, but at least one direction lowers the energy.
- A true **global minimum** is lowest over the entire stated configuration space. A finite study normally establishes only the lowest structure found among its tested compositions, cells, constraints, and starting geometries.

A bridge-like adsorption geometry may therefore relax into a hollow, remain as a metastable minimum, or represent a diffusion saddle. A pathway method such as the climbing-image nudged elastic band method connects known endpoints and locates a minimum-energy path; a single endpoint optimization cannot provide that barrier. {% include cite.html id="henkelman-2000" %}

<aside class="concept-callout warning"><strong>Zero force is not enough.</strong><p>A converged optimization can still represent the wrong termination, a metastable basin, an artificially constrained cell, or an unconverged slab. Stability is always conditional on the model and comparison set.</p></aside>

## Surface energy measures the excess cost of a surface {#surface-energy}

For a symmetric elemental slab with two equivalent faces, a common zero-temperature total-energy estimate is

<div class="formula-strip">\[\gamma=\frac{E_{\mathrm{slab}}-N E_{\mathrm{bulk}}}{2A}.\]</div>

Here \\(E_{\mathrm{bulk}}\\) is the bulk energy **per atom**, \\(N\\) is the number of slab atoms, and \\(A\\) is the area of one face. The denominator \\(2A\\) counts two equal-area faces; equivalence is what lets the result be assigned to either individual face. For inequivalent faces, the same division gives only their mean excess. The slab and bulk references must use mutually consistent lattice parameters and numerical settings; otherwise a tiny per-atom mismatch grows with slab thickness and contaminates \\(\gamma\\). {% include cite.html id="fiorentini-methfessel-1996" %}

The expression must be converged with respect to slab thickness, vacuum, relaxation depth, reciprocal-space sampling, and the electronic-structure settings relevant to the calculation. For an asymmetric slab, the total excess gives the **sum** of the two face contributions; it does not uniquely assign a separate energy to either face. {% include cite.html id="tran-2016" %}

For multicomponent or nonstoichiometric surfaces, atom counts can differ between terminations. A grand-potential form introduces reservoir chemical potentials,

<div class="formula-strip">\[\gamma(T,\{\mu_i\})=\frac{G_{\mathrm{slab}}-\sum_i N_i\mu_i}{2A},\]</div>

again shown for equivalent faces. The allowed \\(\mu_i\\) are constrained by the phases with which the surface can coexist. {% include cite.html id="reuter-scheffler-2003" %} Ionic surfaces require particular care: an ideal stacking repeat with a dipole normal to the surface can be electrostatically unstable and must compensate through reconstruction, stoichiometry, charge redistribution, or adsorption. {% include cite.html id="tasker-1979" %}

## Define the adsorption-energy reference explicitly {#adsorption-energy}

One widely used convention is

<div class="formula-strip">\[E_{\mathrm{ads}}=E_{\mathrm{slab+ads}}-E_{\mathrm{slab}}-E_{\mathrm{adsorbate}},\]</div>

for which negative \\(E_{\mathrm{ads}}\\) means exothermic binding relative to the stated clean slab and isolated adsorbate reference. Some communities report the negative of this quantity. The equation, adsorbate reference state, coverage, cell, and relaxation protocol therefore belong next to the reported number. {% include cite.html id="gross-2003" %}

This total-energy difference is not automatically an adsorption enthalpy or free energy. Zero-point motion, temperature, entropy, pressure, solvation, electrode potential, and reference-state corrections may matter depending on the experiment being modelled. {% include cite.html id="gross-2003" %}

## Stable means stable under stated conditions {#environment}

At fixed temperature and reservoir chemical potentials, the thermodynamically preferred surface minimizes the appropriate surface free energy. Changing gas pressure, composition, electrochemical potential, or adsorbate coverage can change the preferred termination or reconstruction. Atomistic thermodynamics makes those reservoir assumptions explicit instead of treating a single clean-slab energy as universal. {% include cite.html id="reuter-scheffler-2003" %}

Thermodynamic preference and kinetic persistence are different. A lower-energy state may be inaccessible on the experimental timescale if the pathway has a large barrier; a metastable structure can therefore be reproducible and experimentally relevant.

<aside class="concept-callout"><strong>What the atlas claims</strong><p>The diagrams establish ideal crystallographic references and reproducible geometric site constructions. They do not claim a relaxed structure, an adsorption minimum, a reconstruction, or a stability ranking.</p></aside>
