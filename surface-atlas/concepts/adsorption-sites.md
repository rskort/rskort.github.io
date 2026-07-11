---
layout: concept
title: Adsorption sites
short_title: Adsorption sites
heading: Read adsorption sites from local geometry
theme: Coordination
card_description: Distinguish ontop, bridge, hollow, trough, and step sites—and learn why a geometric label is not an energy minimum.
intro: Adsorption-site names describe an initial position relative to nearby surface atoms. Coordination, subsurface registry, and surface symmetry make that name chemically meaningful.
description: Visual explanation of ontop, bridge, hollow, step, and trough adsorption sites on crystal surfaces.
concept: true
order: 4
permalink: /surface-atlas/concepts/adsorption-sites/
sections:
  - {id: local-coordination, label: Local coordination}
  - {id: subsurface-registry, label: Subsurface registry}
  - {id: stepped-surfaces, label: Steps and troughs}
  - {id: geometry-to-minimum, label: Geometry vs energy}
---

## Count the nearest surface neighbours {#local-coordination}

Common ideal sites are:

- **Ontop:** above one surface atom.
- **Bridge:** between two surface atoms.
- **Hollow:** centred among three or more surface atoms.

The same name need not imply the same environment on every facet. FCC(100) has a fourfold hollow, FCC(111) has two types of threefold hollow, and FCC(110) has anisotropic bridges and troughs. Subsurface stacking can distinguish sites that look identical from above.

<div class="comparison"><div><strong>Ontop · 1</strong><span>One nearest surface atom directly below.</span></div><div><strong>Bridge · 2</strong><span>Two neighbouring atoms flank the lateral position.</span></div><div><strong>Hollow · 3 or 4</strong><span>The centre of a triangle or square of surface atoms.</span></div></div>

<figure class="site-geometry-figure"><svg viewBox="0 0 720 260" role="img" aria-labelledby="site-diagram-title site-diagram-desc"><title id="site-diagram-title">Ontop, bridge, threefold hollow, and fourfold hollow adsorption sites</title><desc id="site-diagram-desc">Teal circles are surface atoms and coloured markers identify characteristic geometric sites.</desc><g class="site-net bonds"><path d="M85 75H225M85 185H225M85 75V185M225 75V185M405 185 475 64 545 185ZM475 64 615 64 545 185"/></g><g class="site-net atoms"><circle cx="85" cy="75"/><circle cx="225" cy="75"/><circle cx="85" cy="185"/><circle cx="225" cy="185"/><circle cx="405" cy="185"/><circle cx="475" cy="64"/><circle cx="545" cy="185"/><circle cx="615" cy="64"/></g><g class="site-net markers"><circle cx="85" cy="75"/><circle cx="155" cy="75"/><circle cx="155" cy="130"/><circle cx="475" cy="145"/></g><g class="site-net labels"><text x="65" y="42">ontop</text><text x="133" y="42">bridge</text><text x="123" y="237">fourfold</text><text x="446" y="232">threefold</text></g></svg><figcaption>Coordination is counted laterally around the marker. The adsorbate itself begins above the surface plane.</figcaption></figure>

## Look beneath the first layer {#subsurface-registry}

On FCC(111), both hollows have three identical nearest neighbours in the top layer. Look underneath: an HCP hollow sits above a second-layer atom, whereas an FCC hollow sits above a third-layer atom and continues the crystal's ABC stacking. A top-layer-only drawing cannot show this distinction.

On HCP(0001), the same geometric distinction is usually described relative to the ABAB bulk stacking. Site labels should therefore be interpreted with the substrate structure and layer registry, not as universal Cartesian coordinates.

## Low-coordination surfaces add new site families {#stepped-surfaces}

High-index and open facets expose rows, ledges, kinks, and troughs. A “step bridge” can connect two rim atoms while a “terrace bridge” lies within a flat patch; both are twofold by a simple neighbour count but have different second-neighbour environments. Useful labels combine position and morphology: **step ontop**, **short bridge**, **long bridge**, **trough**, or **kink**.

<div class="table-wrap"><table><thead><tr><th>Label tells you</th><th>Label does not guarantee</th></tr></thead><tbody><tr><td>Initial lateral position</td><td>A local minimum exists there</td></tr><tr><td>Nearest surface coordination</td><td>The same bond strength on every facet</td></tr><tr><td>Relation to a step or terrace</td><td>The adsorbate remains molecular</td></tr><tr><td>Top-layer symmetry</td><td>Identical subsurface registry</td></tr></tbody></table></div>

## From a candidate site to a relaxed minimum {#geometry-to-minimum}

These sites are reference geometries, not guaranteed energy minima. Adsorbates can relax laterally, tilt, dissociate, penetrate a subsurface pocket, or induce reconstruction. Test several symmetry-distinct candidates with consistent settings, then classify the optimized geometries again.

Report both the initial named site and the final optimized geometry when they differ. For diffusion, a bridge-like position may instead be a saddle point between stable hollows; locating that barrier requires a pathway method rather than a single relaxation.

<aside class="concept-callout"><strong>About the builder markers</strong><p>They are generated from exposed-atom geometry: ontop positions, nearest-neighbour midpoints, and empty circumcentres. They are useful starting guesses, not verified minima.</p></aside>

<div class="concept-actions"><a class="button" href="{{ '/surface-sites/fcc-111.html' | relative_url }}">Compare FCC and HCP hollows</a><a class="button secondary" href="{{ '/surface-builder/' | relative_url }}">Generate candidate sites</a></div>

