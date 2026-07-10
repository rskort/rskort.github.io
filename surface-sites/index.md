---
layout: default
title: Surface site atlas
description: Visual guides to FCC crystal facets and their adsorption sites.
permalink: /surface-sites/
---

# Surface site atlas

Crystal facets expose different two-dimensional arrangements of atoms. Those arrangements control which adsorption positions are available and how adsorbates interact with the substrate. This atlas uses one visual and data structure for every facet so that similarities and differences remain clear.

## Low-index FCC surfaces

<div class="table-wrap">
<table>
  <thead><tr><th>Surface</th><th>Surface net</th><th>Characteristic sites</th><th>ASE builder</th></tr></thead>
  <tbody>
  {% for surface in site.data.surfaces %}
    <tr>
      <th><a href="{{ '/surface-sites/' | append: surface.id | append: '.html' | relative_url }}">{{ surface.title }}</a></th>
      <td>{{ surface.surface_shape }}</td>
      <td>{% for entry in surface.sites %}{{ entry.label }}{% unless forloop.last %}, {% endunless %}{% endfor %}</td>
      <td><code>{{ surface.ase_builder }}</code></td>
    </tr>
  {% endfor %}
  </tbody>
</table>
</div>

## What is an adsorption site?

An adsorption site is a lateral position where an atom or molecule can bind to a surface. Names such as *ontop*, *bridge*, and *hollow* describe the nearby surface atoms. They are useful high-symmetry starting points, although an optimized adsorbate may move away from the ideal position.

## Reading the figures

Each page shows an XY top view, two perpendicular side views, and a stacking view. The top three atomic layers use different grayscale tones and sizes. Numbered coloured markers identify sites; their detailed definitions appear in the legend below the figures. Side and stacking views reveal geometric distinctions that a top view can hide.

## Background concepts

<ul class="concept-links">
  <li><a href="{{ '/concepts/miller-indices/' | relative_url }}">Miller indices</a></li>
  <li><a href="{{ '/concepts/surface-cells/' | relative_url }}">Surface cells</a></li>
  <li><a href="{{ '/concepts/adsorption-sites/' | relative_url }}">Adsorption sites</a></li>
  <li><a href="{{ '/concepts/ase-building/' | relative_url }}">Building slabs with ASE</a></li>
</ul>

