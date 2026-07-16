---
layout: default
title: Home
description: Explore FCC, BCC, HCP, SC, SH, and BCT crystal surfaces, Miller planes, atomic surface structures, and common adsorption sites with interactive 3D models.
permalink: /surface-atlas/
---

<section class="home-hero">
  <div>
    <p class="eyebrow">A visual guide to surface structure</p>
    <h1>Explore crystal surfaces and adsorption sites.</h1>
    <p class="lede">Explore how six cubic, hexagonal, and tetragonal crystal structures are cut, which atomic patterns appear at their surfaces, and where adsorbates can bind.</p>
    <div class="hero-actions">
      <a class="button" href="{{ '/surface-sites/' | relative_url }}">Explore common surfaces</a>
      <a class="button secondary" href="{{ '/concepts/miller-indices/' | relative_url }}">How a surface is formed</a>
    </div>
  </div>
  <div class="lattice-motif" aria-label="A simple triangular arrangement of atoms">
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <polygon points="50,8 84,28 84,68 50,88 16,68 16,28"></polygon>

      <line x1="50" y1="48" x2="50" y2="8"></line>
      <line x1="50" y1="48" x2="84" y2="28"></line>
      <line x1="50" y1="48" x2="84" y2="68"></line>
      <line x1="50" y1="48" x2="50" y2="88"></line>
      <line x1="50" y1="48" x2="16" y2="68"></line>
      <line x1="50" y1="48" x2="16" y2="28"></line>
    </svg>

    <span style="--x: 50%; --y: 8%;"></span>
    <span style="--x: 84%; --y: 28%;"></span>
    <span style="--x: 84%; --y: 68%;"></span>
    <span class="central-atom" style="--x: 50%; --y: 48%;"></span>
    <span style="--x: 50%; --y: 88%;"></span>
    <span style="--x: 16%; --y: 68%;"></span>
    <span style="--x: 16%; --y: 28%;"></span>
  </div>
</section>

<section class="home-sections" aria-label="Ways into the guide">
  <a class="home-card" href="{{ '/surface-sites/' | relative_url }}"><small>Compare</small><h2>Common surfaces</h2><p>Move across FCC, BCC, HCP, SC, SH, and BCT, from close-packed planes to stepped and open facets, with the same visual language throughout.</p></a>
  <a class="home-card" href="{{ '/concepts/' | relative_url }}"><small>Understand</small><h2>Core concepts</h2><p>Follow the cut from bulk FCC to a two-dimensional surface cell, then place adsorption sites and build a slab.</p></a>
</section>
