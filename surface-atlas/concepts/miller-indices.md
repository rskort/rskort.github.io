---
layout: concept
title: Miller indices
short_title: Miller planes
description: Learn how Miller indices define crystal planes and how FCC, BCC, and HCP bulk crystals are cut to form surfaces.
concept: true
order: 1
permalink: /surface-atlas/concepts/miller-indices/
---

# From an FCC crystal to a surface

A crystal surface is not a separate structure placed on top of the bulk. It is the two-dimensional pattern left behind when the three-dimensional lattice is cut along a chosen plane. Miller indices tell us the orientation of that cut.

## First, picture the FCC unit cell

Face-centred cubic means exactly what it says: atoms occupy the eight corners of a cube and the centre of each of its six faces. The pattern repeats by one lattice constant \(a\) along x, y, and z. Shared corner and face atoms add up to four atoms per conventional cell.

## Then choose where the plane meets the axes

Select a plane below. The coloured sheet is the cut through the conventional FCC cell; the atoms that repeat in that sheet become the surface net.

<div class="plane-demo" data-plane-demo>
  <div class="plane-stage">
    <svg viewBox="25 0 420 370" role="img" aria-label="An FCC unit cell with a selectable Miller plane">
      <defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#445c5f"/></marker></defs>
      <path class="cube-edge cube-back" d="M90 91 L244 2 L398 91 L244 180 Z M90 91 L90 245 M398 91 L398 245"/>
      <path class="cube-edge" d="M90 245 L244 156 L398 245 L244 334 Z M244 156 L244 2 M90 245 L90 91 M398 245 L398 91 M244 334 L244 180"/>
      <polygon class="cut-plane" points="398,245 244,156 244,2 398,91" style="--plane-colour:#d85f45"/>
      <g class="plane-guides"></g>
      <g aria-label="corner atoms">
        <circle class="atom" cx="90" cy="91" r="8"/><circle class="atom" cx="244" cy="2" r="8"/><circle class="atom" cx="398" cy="91" r="8"/><circle class="atom" cx="244" cy="180" r="8"/>
        <circle class="atom" cx="90" cy="245" r="8"/><circle class="atom" cx="244" cy="156" r="8"/><circle class="atom" cx="398" cy="245" r="8"/><circle class="atom" cx="244" cy="334" r="8"/>
      </g>
      <g aria-label="face-centred atoms">
        <circle class="atom face-atom" cx="167" cy="123" r="9"/><circle class="atom face-atom" cx="321" cy="123" r="9"/><circle class="atom face-atom" cx="244" cy="91" r="9"/>
        <circle class="atom face-atom" cx="167" cy="212" r="9"/><circle class="atom face-atom" cx="321" cy="212" r="9"/><circle class="atom face-atom" cx="244" cy="245" r="9"/>
      </g>
      <line class="axis" x1="244" y1="334" x2="420" y2="236"/><text class="axis-label" x="427" y="238">x</text>
      <line class="axis" x1="244" y1="334" x2="68" y2="236"/><text class="axis-label" x="52" y="238">y</text>
      <line class="axis" x1="244" y1="334" x2="244" y2="196"/><text class="axis-label" x="252" y="200">z</text>
    </svg>
  </div>
  <div class="plane-controls">
    <div class="plane-buttons" aria-label="Choose a plane"><button type="button" data-plane="100" aria-pressed="true">(100)</button><button type="button" data-plane="110" aria-pressed="false">(110)</button><button type="button" data-plane="111" aria-pressed="false">(111)</button></div>
    <h3 data-plane-title>FCC(100)</h3>
    <p class="plane-equation" data-plane-equation></p>
    <p class="plane-description" data-plane-description></p>
  </div>
</div>

<p><a class="button" href="{{ '/surface-builder/' | relative_url }}">Try any FCC, BCC, or HCP plane</a></p>

## The three-step rule

<ol class="steps">
  <li><div><strong>Write the intercepts in units of \(a\).</strong><p>Where does the plane meet x, y, and z? A plane parallel to an axis has an infinite intercept on that axis.</p></div></li>
  <li><div><strong>Take the reciprocals.</strong><p>For example, \((a,a,\infty)\) becomes \((1/a,1/a,0)\). This is why a parallel direction receives a zero.</p></div></li>
  <li><div><strong>Clear fractions to obtain the smallest integers.</strong><p>Drop the common \(1/a\) factor. The example above becomes \((110)\).</p></div></li>
</ol>

<div class="formula-strip">\[(x_0,y_0,z_0) \longrightarrow \left(\frac{a}{x_0},\frac{a}{y_0},\frac{a}{z_0}\right) \longrightarrow (hkl)\]</div>

## One bulk crystal, three surface patterns

<div class="comparison"><div><strong>FCC(100)</strong><span>Square net · fourfold hollows</span></div><div><strong>FCC(110)</strong><span>Dense rows · open troughs</span></div><div><strong>FCC(111)</strong><span>Triangular net · close packed</span></div></div>

For a cubic lattice, the direction \([hkl]\) is normal to the plane \((hkl)\). Higher-index cuts such as (211) or (311) are tilted away from a low-index plane. At atomic scale, that tilt appears as narrow terraces separated by regular steps.

Parentheses denote a plane, as in \((111)\); square brackets denote a direction, as in \([111]\); and braces such as \(\{111\}\) collect all symmetry-equivalent planes.

## What changes for BCC and HCP?

The intercept rule describes the plane orientation; the bulk basis determines which atoms that plane actually exposes. FCC and BCC share cubic axes but place atoms at face centres or the body centre, so the same (110) orientation produces different surface nets.

HCP uses three equivalent basal axes separated by \(120^\circ\), plus the c axis. Its planes are commonly written with four Miller–Bravais indices \((hkil)\), where the third basal index is redundant:

\[
i=-(h+k).
\]

Thus (0001) is the basal plane, (10-10) and (11-20) are prism planes parallel to c, and a nonzero final index—such as in (10-11)—tilts the cut into a pyramidal plane.

## Why the termination matters

Indices specify orientation, not every detail of a slab. A material can have multiple chemical terminations, reconstructions, or registries for the same \((hkl)\). Always report the composition, termination, cell, and slab thickness alongside the facet.

