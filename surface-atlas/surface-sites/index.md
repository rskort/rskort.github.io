---
layout: default
title: Common crystal surfaces and adsorption sites
description: Compare common FCC, BCC, and HCP surfaces, their atomic structures, Miller-plane cuts, layer stacking, and ontop, bridge, and hollow adsorption sites.
permalink: /surface-atlas/surface-sites/
---

<div class="atlas-intro">
  <div><p class="eyebrow">22 surfaces · three bulk lattices</p><h1>Common surfaces and adsorption sites</h1><p class="lede">Compare how FCC, BCC, and HCP crystals respond to common crystallographic cuts. Each guide connects the Miller plane, exposed atomic structure, subsurface registry, adsorption sites, and a rotatable slab.</p><p><a class="button" href="{{ '/surface-builder/' | relative_url }}">Build any indexed surface</a></p></div>
  <p class="atlas-note">Dark teal atoms belong to the outermost layer and paler atoms sit below it. Orange numbers mark constructed starting sites. Each site shows its fractional coordinate and whether ASE accepts it as a named keyword.</p>
</div>

<div class="surface-group-heading"><h2>Face-centred cubic</h2><span>Close-packed faces, open rows, and regular steps</span></div>
<div class="surface-grid">
{% for surface in site.data.surfaces %}{% if surface.crystal == 'fcc' %}
  <a class="surface-card" href="{{ '/surface-sites/' | append: surface.id | append: '.html' | relative_url }}"><img src="{{ surface.figures.top | relative_url }}" alt="{{ surface.title }} atomic surface net"><div class="surface-card-body"><h3>{{ surface.title }} <span>→</span></h3><p>{{ surface.card_description }}</p><div class="site-tags">{% for entry in surface.sites limit:3 %}<span>{{ entry.label }}</span>{% endfor %}{% if surface.sites.size > 3 %}{% assign remaining = surface.sites.size | minus: 3 %}<span class="more">+{{ remaining }} sites</span>{% endif %}</div></div></a>
{% endif %}{% endfor %}
</div>

<div class="surface-group-heading"><h2>Body-centred cubic</h2><span>Dense (110), open low-index faces, and stepped rows</span></div>
<div class="surface-grid">
{% for surface in site.data.surfaces %}{% if surface.crystal == 'bcc' %}
  <a class="surface-card" href="{{ '/surface-sites/' | append: surface.id | append: '.html' | relative_url }}"><img src="{{ surface.figures.top | relative_url }}" alt="{{ surface.title }} atomic surface net"><div class="surface-card-body"><h3>{{ surface.title }} <span>→</span></h3><p>{{ surface.card_description }}</p><div class="site-tags">{% for entry in surface.sites limit:3 %}<span>{{ entry.label }}</span>{% endfor %}{% if surface.sites.size > 3 %}{% assign remaining = surface.sites.size | minus: 3 %}<span class="more">+{{ remaining }} sites</span>{% endif %}</div></div></a>
{% endif %}{% endfor %}
</div>

<div class="surface-group-heading"><h2>Hexagonal close packed</h2><span>Basal, prismatic, and pyramidal cuts</span></div>
<div class="surface-grid">
{% for surface in site.data.surfaces %}{% if surface.crystal == 'hcp' %}
  <a class="surface-card" href="{{ '/surface-sites/' | append: surface.id | append: '.html' | relative_url }}"><img src="{{ surface.figures.top | relative_url }}" alt="{{ surface.title }} atomic surface net"><div class="surface-card-body"><h3>{{ surface.title }} <span>→</span></h3><p>{{ surface.card_description }}</p><div class="site-tags">{% for entry in surface.sites limit:3 %}<span>{{ entry.label }}</span>{% endfor %}{% if surface.sites.size > 3 %}{% assign remaining = surface.sites.size | minus: 3 %}<span class="more">+{{ remaining }} sites</span>{% endif %}</div></div></a>
{% endif %}{% endfor %}
</div>

<p class="quiet" style="margin-top:2rem">New to the notation? Begin with <a href="{{ '/concepts/miller-indices/' | relative_url }}">how Miller planes cut a bulk crystal</a>.</p>

<section class="atlas-explainer" aria-labelledby="surface-sites-explained">
  <p class="kicker">Surface-site basics</p>
  <h2 id="surface-sites-explained">What are surface adsorption sites?</h2>
  <p>Surface adsorption sites are characteristic positions where an atom or molecule can begin interacting with a crystal surface. An <strong>ontop site</strong> lies above one surface atom, a <strong>bridge site</strong> spans two neighbouring atoms, and a <strong>hollow site</strong> sits among three or more atoms. The available sites change with the crystal lattice and Miller indices because every cut exposes a different atomic pattern.</p>
  <p>The guides above document familiar low- and high-index facets. For a plane not listed here, use the <a href="{{ '/surface-builder/' | relative_url }}">interactive surface builder</a> to generate its bulk cut, surface cell, atomic layers, and geometric adsorption-site candidates.</p>
</section>

