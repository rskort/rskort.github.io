---
layout: default
title: Concepts
description: Learn Miller indices, crystal surface cells, adsorption sites, and practical slab construction through clear visual explanations.
permalink: /surface-atlas/concepts/
---

{% assign concepts = site.pages | where: "concept", true | sort: "order" %}
<header class="concept-index-header"><p class="eyebrow">Reference</p><h1>Surface science concepts</h1><p class="lede">Crystal structures, plane notation, surface periodicity, adsorption geometry, relaxation, and slab construction.</p></header>

<div class="concept-grid">
  {% for item in concepts %}
    <a class="concept-card" href="{{ item.url }}"><span>{{ item.theme }}</span><h2>{{ item.short_title | default: item.title }}</h2><p>{{ item.card_description }}</p><b aria-hidden="true">→</b></a>
  {% endfor %}
</div>

<p class="concept-builder-link">For an arbitrary orientation, use the <a href="{{ '/surface-builder/' | relative_url }}">surface builder</a> to inspect the bulk cut, exposed layers, surface cell, and geometric site candidates.</p>
