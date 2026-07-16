---
layout: default
title: Common crystal surfaces and adsorption sites
description: Compare common FCC, BCC, HCP, SC, SH, and BCT surfaces, their atomic structures, Miller-plane cuts, layer stacking, and adsorption sites.
permalink: /surface-atlas/surface-sites/
---

<div class="atlas-intro">
  <div>
    <p class="eyebrow">Common surfaces · six structure families</p>
    <h1>Common surfaces and adsorption sites</h1>
    <p class="lede">
      Compare how FCC, BCC, HCP, SC, SH, and BCT crystals respond to common crystallographic cuts. Each guide connects the Miller plane, exposed atomic structure, subsurface registry, adsorption sites, and a rotatable slab.
    </p>
    <p>
      <a class="button" href="{{ '/surface-builder/' | relative_url }}">Build any indexed surface</a>
    </p>
    <p class="quiet" style="margin-top:2rem">
      New to the notation? Begin with <a href="{{ '/concepts/miller-indices/' | relative_url }}">how Miller planes cut a bulk crystal</a>.
    </p>
  </div>
  <p class="atlas-note">The shade of the atoms indicates the depth of the layer, where paler atoms sit lower. Orange numbers mark constructed adsorption sites.</p>
</div>

{% for family in site.data.crystal_families %}
<div class="surface-group-heading"><h2>{{ family.name }}</h2><span>{{ family.summary }}</span></div>
<div class="surface-grid">
{% for surface in site.data.surfaces %}{% if surface.crystal == family.id %}
  <a class="surface-card" href="{{ '/surface-sites/' | append: surface.id | append: '.html' | relative_url }}"><img src="{{ surface.figures.top | relative_url }}" alt="{{ surface.title }} atomic surface net"><div class="surface-card-body"><h3>{{ surface.title }} <span>→</span></h3><p>{{ surface.card_description }}</p><div class="site-tags">{% for entry in surface.sites limit:3 %}<span>{{ entry.label }}</span>{% endfor %}{% if surface.sites.size > 3 %}{% assign remaining = surface.sites.size | minus: 3 %}<span class="more">+{{ remaining }} sites</span>{% endif %}</div></div></a>
{% endif %}{% endfor %}
</div>
{% endfor %}

<section class="atlas-explainer" aria-labelledby="surface-sites-explained">
  <h2 id="surface-sites-explained">What are surface adsorption sites?</h2>
  <p>Surface adsorption sites are characteristic positions where an atom or molecule can begin interacting with a crystal surface. An <strong>ontop site</strong> lies above one surface atom, a <strong>bridge site</strong> spans two neighbouring atoms, and a <strong>hollow site</strong> sits among three or more atoms. The available sites change with the crystal lattice and Miller indices because every cut exposes a different atomic pattern.</p>
  <p>The guides above document familiar low- and high-index facets. For a plane not listed here, use the <a href="{{ '/surface-builder/' | relative_url }}">interactive surface builder</a> to generate its bulk cut, surface cell, atomic layers, and geometric adsorption-site candidates.</p>
</section>
