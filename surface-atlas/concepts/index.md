---
layout: default
title: Concepts
description: Learn Miller indices, crystal surface cells, adsorption sites, and practical slab construction through clear visual explanations.
permalink: /surface-atlas/concepts/
---

{% assign concepts = site.pages | where: "concept", true | sort: "order" %}
<header class="concept-index-header"><p class="eyebrow">From bulk crystal to adsorption model</p><h1>A surface model in six steps.</h1><p class="lede">Begin with the three-dimensional lattice, choose a crystallographic plane, find its two-dimensional repeat, understand its sites and stability, and finally build a calculation you can trust.</p></header>

<div class="learning-path" aria-label="Concept learning path">
  {% for item in concepts %}<span><b>0{{ item.order }}</b>{{ item.short_title | default: item.title }}</span>{% endfor %}
</div>

<div class="concept-grid">
  {% for item in concepts %}
    <a class="concept-card" href="{{ item.url }}"><span>0{{ item.order }} · {{ item.theme }}</span><h2>{{ item.short_title | default: item.title }}</h2><p>{{ item.card_description }}</p><b aria-hidden="true">→</b></a>
  {% endfor %}
</div>

<aside class="concept-start"><div><p class="kicker">Already know the basics?</p><h2>Make the plane concrete.</h2><p>Enter any FCC, BCC, or HCP indices and compare the bulk cut, surface cell, exposed layers, and geometric adsorption-site candidates.</p></div><a class="button" href="{{ '/surface-builder/' | relative_url }}">Open the surface builder</a></aside>
