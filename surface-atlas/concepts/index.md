---
layout: default
title: Concepts
description: A referenced, prerequisite-first introduction to crystal lattices, surface geometry, adsorption, energetics, and reproducible slab construction.
permalink: /surface-atlas/concepts/
---

{% assign concepts = site.pages | where: "concept", true | sort: "order" %}
<header class="concept-index-header">
  <div>
    <p class="eyebrow">Concepts</p>
    <h1>Surface science, in a useful order</h1>
    <p class="lede">Start with three-dimensional crystal structure, then derive the plane, surface repeat, adsorption geometry, and energetics before implementing and checking the model in ASE.</p>
  </div>
</header>

<ol class="concept-grid concept-path">
  {% for item in concepts %}
    {% capture step_number %}{% if forloop.index < 10 %}0{% endif %}{{ forloop.index }}{% endcapture %}
    <li><a class="concept-card" href="{{ item.url }}"><span>Step {{ step_number | strip }} · {{ item.theme }}</span><h2>{{ item.short_title | default: item.title }}</h2><p>{{ item.card_description }}</p><b aria-hidden="true">→</b></a></li>
  {% endfor %}
</ol>

<p class="concept-builder-link">Each chapter builds on the preceding one, cites key claims inline, and ends with a reusable reference list. Once the sequence is clear, use the <a href="{{ '/surface-builder/' | relative_url }}">surface builder</a> to inspect an arbitrary orientation.</p>
