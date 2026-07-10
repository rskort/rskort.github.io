---
layout: default
title: Surface site atlas
description: Visual guides to FCC, BCC, and HCP crystal facets and their adsorption sites.
permalink: /surface-sites/
---

# Surface site atlas

<div class="atlas-intro">
  <div><p class="eyebrow">22 facets · three bulk lattices</p><h1>Surface site atlas</h1><p class="lede">Compare how FCC, BCC, and HCP crystals respond to different cuts. Each page connects the bulk plane, exposed atomic net, subsurface registry, adsorption sites, and a rotatable slab.</p></div>
  <p class="atlas-note">In every map, dark teal atoms belong to the outermost layer. Paler atoms sit below it. Orange numbers mark ideal adsorption positions, and the outlined polygon is one repeating surface cell.</p>
</div>

<div class="surface-group-heading"><h2>Face-centred cubic</h2><span>Close-packed faces, open rows, and regular steps</span></div>
<div class="surface-grid">
{% for surface in site.data.surfaces %}{% if surface.crystal == 'fcc' %}
  <a class="surface-card" href="{{ '/surface-sites/' | append: surface.id | append: '.html' | relative_url }}"><img src="{{ surface.figures.top | relative_url }}" alt="{{ surface.title }} atomic surface net"><div class="surface-card-body"><h3>{{ surface.title }} <span>→</span></h3><p>{{ surface.card_description }}</p><div class="site-tags">{% for entry in surface.sites %}<span>{{ entry.label }}</span>{% endfor %}</div></div></a>
{% endif %}{% endfor %}
</div>

<div class="surface-group-heading"><h2>Body-centred cubic</h2><span>Dense (110), open low-index faces, and stepped rows</span></div>
<div class="surface-grid">
{% for surface in site.data.surfaces %}{% if surface.crystal == 'bcc' %}
  <a class="surface-card" href="{{ '/surface-sites/' | append: surface.id | append: '.html' | relative_url }}"><img src="{{ surface.figures.top | relative_url }}" alt="{{ surface.title }} atomic surface net"><div class="surface-card-body"><h3>{{ surface.title }} <span>→</span></h3><p>{{ surface.card_description }}</p><div class="site-tags">{% for entry in surface.sites %}<span>{{ entry.label }}</span>{% endfor %}</div></div></a>
{% endif %}{% endfor %}
</div>

<div class="surface-group-heading"><h2>Hexagonal close packed</h2><span>Basal, prismatic, and pyramidal cuts</span></div>
<div class="surface-grid">
{% for surface in site.data.surfaces %}{% if surface.crystal == 'hcp' %}
  <a class="surface-card" href="{{ '/surface-sites/' | append: surface.id | append: '.html' | relative_url }}"><img src="{{ surface.figures.top | relative_url }}" alt="{{ surface.title }} atomic surface net"><div class="surface-card-body"><h3>{{ surface.title }} <span>→</span></h3><p>{{ surface.card_description }}</p><div class="site-tags">{% for entry in surface.sites %}<span>{{ entry.label }}</span>{% endfor %}</div></div></a>
{% endif %}{% endfor %}
</div>

<p class="quiet" style="margin-top:2rem">New to the notation? Begin with <a href="{{ '/concepts/miller-indices/' | relative_url }}">how Miller planes cut a bulk crystal</a>.</p>

