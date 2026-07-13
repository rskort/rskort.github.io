---
layout: concept
title: Adsorption sites
short_title: Adsorption sites
heading: Place an adsorbate relative to the surface
theme: Coordination
card_description: Separate lateral registry from height and orientation, then compare coordination, subsurface registry, steps, and coverage.
intro: An adsorption-site name identifies a geometric relation to the substrate. It is a reproducible starting description, not a universal bond length or a promise of energetic stability.
description: Learn how ontop, bridge, hollow, step, and trough adsorption sites are constructed and how site geometry relates to coverage.
concept: true
order: 4
permalink: /surface-atlas/concepts/adsorption-sites/
sections:
  - {id: adsorption-and-site, label: Adsorbate and site}
  - {id: construct-position, label: Construct the lateral position}
  - {id: local-coordination, label: Local coordination}
  - {id: registry-and-steps, label: Registry, steps, and troughs}
  - {id: coverage, label: Coverage in the cell}
  - {id: candidate-not-minimum, label: Geometry versus energy}
references:
  - iupac-adsorption
  - somorjai-li-2010
  - montoya-persson-2017
  - iupac-sites-1976
  - kolasinski-2012
  - iupac-coverage
  - gross-2003
---

## Adsorption places an additional particle at the interface {#adsorption-and-site}

**Adsorption** is enrichment of a component in the interfacial region rather than in the adjoining bulk phase. The species at the surface is the **adsorbate**; here, the solid that supports it is the **substrate**. Adsorption should not be confused with absorption into the bulk. {% include cite.html id="iupac-adsorption" %}

An adsorption geometry contains more information than a site name. For an atom, a convenient initial position is

<div class="formula-strip">\[\mathbf r_{\mathrm{ads}}=\mathbf r_0+u\mathbf a_1+v\mathbf a_2+z\hat{\mathbf n},\]</div>

where \\(\mathbf r_0\\) is the stated surface-cell origin, \\((u,v)\\) gives the lateral registry in that cell, and \\(z\\) is measured from the corresponding reference plane along the outward normal \\(\hat{\mathbf n}\\). A molecule also needs an orientation and internal geometry.

In this atlas, **site** primarily means the lateral relation \\((u,v)\\) to nearby substrate atoms. The appropriate initial height depends on the adsorbate, substrate, site, and chosen computational method. It cannot be inferred from a label such as “ontop” or from the depth of a buried support atom. Molecular orientation is likewise an independent choice. {% include cite.html id="somorjai-li-2010" %}

## Construct the lateral position from substrate atoms {#construct-position}

The catalogue positions are generated from explicit atomic geometry, not placed by eye. Each construction first chooses substrate atoms and, where necessary, the nearest periodic images of those atoms. Their projections are expressed in one unwrapped copy of the surface cell before the result is wrapped back into the reference cell.

For projected fractional positions \\(\mathbf s_i=(u_i,v_i)\\), the common constructions are

<div class="formula-strip">\[\begin{aligned}
\text{ontop:}\quad &\mathbf s=\mathbf s_1,\\
\text{bridge:}\quad &\mathbf s=\tfrac12(\mathbf s_1+\mathbf s_2),\\
\text{shell centre:}\quad &\mathbf s=\frac1N\sum_{i=1}^{N}\mathbf s_i.
\end{aligned}\]</div>

The shell centre is formed from an explicitly identified triangle, square, or local pocket; it is not an arbitrary empty point. When a named convention is supplied in a different primitive cell, its coordinate is mapped into the displayed reference cell by an exact affine cell transformation.

Projection, neighbour edges, and centres of selected surface-atom ensembles are established ways to generate reproducible candidate sites before symmetry reduction and energetic optimization. {% include cite.html id="montoya-persson-2017" %}

On a corrugated surface, the supporting atoms may sit at different heights. The site guides therefore report a local substrate reference \\(\Delta z\\); when an explicit support shell is listed, this is its mean height relative to the outermost layer. That number describes the **metal atoms**, not the adsorbate position. In every catalogue viewer, numbered sites are lifted to one shared schematic guide plane above the slab. That display height is deliberately not a predicted adsorption distance.

<aside class="concept-callout"><strong>A buried registry does not bury the adsorbate.</strong><p>A lateral position may lie above a second- or third-layer atom when viewed from above. Only its lateral projection is shared; a starting adsorbate still belongs outside the substrate at a separately chosen height.</p></aside>

## Coordination summarizes the chosen support shell {#local-coordination}

For an ideal geometric site, the catalogue coordination is the number of nearby substrate atoms assigned to its primary local environment. In familiar low-index cases this gives:

- **Ontop:** one supporting atom.
- **Bridge:** two supporting atoms.
- **Threefold hollow:** three atoms surrounding a triangular opening.
- **Fourfold hollow:** four atoms surrounding a square or rectangular opening.

This count is a geometric descriptor, not necessarily the number of points required to locate the coordinate: symmetry can define a fourfold channel centre from the midpoint of one opposing pair, for example. It is also not a complete bond analysis. After force-based structural optimization, bond lengths can become unequal and additional substrate atoms can enter the chemical coordination sphere. The same coordination number can hide different second-neighbour environments. Standard site names are therefore most useful when reported together with the facet, cell, and atomic registry. {% include cite.html id="iupac-sites-1976" %}

<div class="comparison"><div><strong>Ontop · 1</strong><span>One substrate atom defines the lateral projection.</span></div><div><strong>Bridge · 2</strong><span>The periodic midpoint of a selected neighbouring pair.</span></div><div><strong>Hollow · 3 or 4</strong><span>The centre of an explicit triangular or quadrilateral shell.</span></div></div>

{% include site-geometry.html id="adsorption-site-geometry" %}

## Subsurface registry and morphology complete the label {#registry-and-steps}

On FCC(111), the two threefold hollows have the same top-layer coordination but different atoms beneath them. An HCP hollow lies above a second-layer atom; an FCC hollow lies above a third-layer atom and follows the continuation of the ABC stacking sequence. A top-layer drawing alone cannot distinguish them. On HCP(0001), analogous labels must be interpreted relative to the substrate's ABAB stacking. {% include cite.html id="kolasinski-2012" %}

High-index and open facets expose terraces, step edges, atomic rows, kinks, and troughs. A **step bridge** can join two ledge atoms, whereas a **terrace bridge** joins atoms within a flatter patch. Both are twofold in the primary shell, but their lower-layer registry and wider neighbourhood differ. Terms such as **short bridge**, **long bridge**, **step ontop**, **trough**, and **kink** should therefore be accompanied by coordinates or an explicit construction.

Surface symmetry removes redundant labels only when it maps the complete local environment onto itself, not merely the topmost pair or triangle. A changed surface motif, defect, coadsorbate, or molecular orientation can break a symmetry that the clean ideal surface possessed.

## Coverage belongs to a declared periodic cell {#coverage}

Coverage states how much adsorbate is associated with a surface area or a declared monolayer capacity. Two useful quantities are an areal density and a normalized coverage:

<div class="formula-strip">\[\rho=\frac{N_{\mathrm{ads}}}{A},\qquad \theta=\frac{N_{\mathrm{ads}}}{N_{\mathrm{ML}}}.\]</div>

Here \\(A\\) is the area of the decorated face and \\(N_{\mathrm{ML}}\\) is the number of adsorbates assigned to a complete monolayer on that same area. That capacity depends on the stated structural convention, for example, one adsorbate per exposed atom or per site in a named site family. “One monolayer” is therefore not self-defining on a stepped surface, a surface with a changed repeat, or a multicomponent surface. {% include cite.html id="iupac-coverage" %}

If a primitive cell contains one site of the chosen family, one adsorbate in a simple \\((2\times2)\\) supercell occupies one quarter of that periodic site population. Calling this \\(1/4\\) monolayer is justified only when one monolayer has been defined as one adsorbate per such site. For a slab decorated on both faces, state the number and coverage **per face**.

Periodic boundary conditions also fix the adsorbate–image separations. Measure the shortest periodic distances using the actual, possibly oblique, cell vectors. Two structures with the same named site but different cells can represent different coverages and different lateral interactions.

## A constructed site is a candidate, not an energetic result {#candidate-not-minimum}

A geometric site is a reproducible starting configuration. During **structural relaxation**, a force-driven local optimization, the adsorbate may remain at that site, move laterally, change height or orientation, dissociate, or induce a different substrate motif. A bridge-like configuration may be a transition region rather than a minimum. The next concept page defines relaxation, reconstruction, and the potential-energy landscape in detail. {% include cite.html id="gross-2003" %}

<div class="table-wrap"><table><thead><tr><th>The site description records</th><th>It does not guarantee</th></tr></thead><tbody><tr><td>Lateral coordinate and support construction</td><td>A universal adsorbate height</td></tr><tr><td>Ideal local coordination and registry</td><td>That the geometry is a local minimum</td></tr><tr><td>Relation to a terrace, step, or trough</td><td>The same binding strength for every species</td></tr><tr><td>Coverage when the reference population is stated</td><td>Negligible interaction between periodic images</td></tr></tbody></table></div>
