---
layout: page
title: AFM series
permalink: /afm-series/
---

Chapter regarding the connection between AFM experiments and atomistic simulations.

{% assign items = site.chapters | where: "series", "afm-series" | sort: "chapter" %}
<ol>
{% for c in items %}
  <li><a href="{{ c.url }}">{{ c.title }}</a></li>
{% endfor %}
</ol>
