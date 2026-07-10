---
layout: default
title: Surface site atlas
description: Visual guides to FCC crystal facets and their adsorption sites.
permalink: /surface-sites/
---

# Surface site atlas

<div class="atlas-intro">
  <div><p class="eyebrow">Nine views of the same bulk crystal</p><h1>Surface site atlas</h1><p class="lede">A different cut through FCC changes the density, symmetry, and local coordination of the exposed atoms. Start with the three simplest planes, then follow how terraces and steps emerge at higher indices.</p></div>
  <p class="atlas-note">In every map, dark teal atoms belong to the outermost layer. Paler atoms sit below it. Orange numbers mark ideal adsorption positions, and the outlined polygon is one repeating surface cell.</p>
</div>

<div class="surface-group-heading"><h2>Low-index planes</h2><span>Flat, high-symmetry surfaces</span></div>
<div class="surface-grid">
{% for surface in site.data.surfaces %}{% if surface.group == 'low-index' %}
  <a class="surface-card" href="{{ '/surface-sites/' | append: surface.id | append: '.html' | relative_url }}"><img src="{{ surface.figures.top | relative_url }}" alt="{{ surface.title }} atomic surface net"><div class="surface-card-body"><h3>{{ surface.title }} <span>→</span></h3><p>{{ surface.card_description }}</p><div class="site-tags">{% for entry in surface.sites %}<span>{{ entry.label }}</span>{% endfor %}</div></div></a>
{% endif %}{% endfor %}
</div>

<div class="surface-group-heading"><h2>Stepped and open planes</h2><span>Terraces, ledges, and troughs</span></div>
<div class="surface-grid">
{% for surface in site.data.surfaces %}{% if surface.group == 'high-index' %}
  <a class="surface-card" href="{{ '/surface-sites/' | append: surface.id | append: '.html' | relative_url }}"><img src="{{ surface.figures.top | relative_url }}" alt="{{ surface.title }} atomic surface net"><div class="surface-card-body"><h3>{{ surface.title }} <span>→</span></h3><p>{{ surface.card_description }}</p><div class="site-tags">{% for entry in surface.sites %}<span>{{ entry.label }}</span>{% endfor %}</div></div></a>
{% endif %}{% endfor %}
</div>

<p class="quiet" style="margin-top:2rem">New to the notation? Begin with <a href="{{ '/concepts/miller-indices/' | relative_url }}">how Miller planes cut an FCC crystal</a>.</p>

