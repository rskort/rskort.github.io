---
title: "Atomic Force Microscopy (AFM)"
series: "afm-series"
permalink: /afm-series/
---

# AFM Series Overview

This series explores the fascinating connection between **Atomic Force Microscopy (AFM) experiments** and **atomistic simulations**.  
From understanding tip–sample interactions to reconstructing force profiles and hydration structures, each chapter builds a bridge between theory and experiment.

---

## Chapters

{% assign items = site.chapter
  | where: "series", "afm-series"
  | where_exp: "p", "p.chapter"
  | sort: "chapter" %}

<ol>
{% for c in items %}
  <li>
    <a href="{{ c.url | relative_url }}">Chapter {{ c.chapter }}: {{ c.title }}</a>
  </li>
{% endfor %}
</ol>

---

## About this series

These chapters are meant to be read in sequence, but each one is self-contained.  
All code examples, figures, and simulation references link directly to relevant open-source data where possible.
