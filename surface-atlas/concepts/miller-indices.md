---
layout: concept
title: Crystal planes and Miller indices
short_title: Planes and indices
heading: Orient a surface with Miller indices
theme: Orientation
card_description: Relate direct- and reciprocal-space descriptions of a plane, read cubic and hexagonal indices, and separate orientation from termination.
intro: Miller indices label the orientation and spacing of a family of crystal planes. The bulk basis then determines which atomic layers occur along that orientation.
description: Learn how reciprocal-space normals, intercepts, Miller indices, and Miller–Bravais indices describe crystal planes and surface orientations.
concept: true
order: 2
permalink: /surface-atlas/concepts/miller-indices/
sections:
  - {id: choose-plane, label: Plane families and normals}
  - {id: intercept-rule, label: The intercept rule}
  - {id: read-notation, label: Notation and spacing}
  - {id: cubic-and-hcp, label: Cubic and hexagonal indices}
  - {id: termination, label: Orientation vs termination}
references:
  - iucr-reciprocal
  - iucr-miller
  - hammond-2015
---

## Plane families have reciprocal-space normals {#choose-plane}

Let \\(\mathbf b_1,\mathbf b_2,\mathbf b_3\\) be the **dual basis** of the chosen direct-cell vectors, defined without a \\(2\pi\\) factor so that \\(\mathbf b_i\!\cdot\!\mathbf a_j=\delta_{ij}\\). The reciprocal-space vector

<div class="formula-strip">\[\mathbf g_{hkl}=h\mathbf b_1+k\mathbf b_2+l\mathbf b_3\]</div>

is normal to the \\((hkl)\\) orientation. When the direct vectors are primitive translations, their duals form a primitive reciprocal-lattice basis. For a centred conventional cell, however, \\(\mathbf g_{hkl}\\) is still the correct orientation normal but need not itself be a reciprocal-lattice node; centring conditions determine which diffraction vectors occur.

When \\((h,k,l)\\) is reduced to relatively prime integers, parallel coordinate planes carrying that orientation label satisfy

<div class="formula-strip">\[hx+ky+lz=m,\qquad m\in\mathbb Z.\]</div>

This reciprocal-space statement works for orthogonal and oblique cells alike. It is the safe general rule: \\((hkl)\\) gives a reciprocal-space normal, not necessarily the direct-space direction \\([hkl]\\). {% include cite.html id="iucr-reciprocal" %}

In this atlas, a **facet** means a macroscopically flat region of a crystal surface characterized by a particular orientation and termination. The Miller indices specify its orientation; they do not by themselves identify the last exposed atomic layer.

The demonstration uses an FCC conventional cell because its cubic axes make the intercepts easy to see. The coloured sheet shows an orientation through the cell. A surface made by truncating the crystal consists of the uppermost remaining atomic layer and the layers beneath it, not only atoms whose centres happen to lie in the displayed mathematical sheet.

{% include plane-demo.html id="miller-plane" %}

## Obtain Miller indices from axis intercepts {#intercept-rule}

The intercept construction is an equivalent way to find the indices. If the chosen member of a plane family passes through the origin, first translate it to a parallel member; the orientation is unchanged. Then:

<ol class="steps">
  <li><div><strong>Write the axial intercepts in lattice-vector units.</strong><p>An intercept \(p\) means \(p\mathbf a_1\). A plane parallel to an axis has an infinite intercept on that axis.</p></div></li>
  <li><div><strong>Take the reciprocals.</strong><p>The fractional intercepts \((p,q,r)\) give \((1/p,1/q,1/r)\); by convention, \(1/\infty=0\).</p></div></li>
  <li><div><strong>Clear fractions and remove a common factor.</strong><p>Write the smallest relatively prime integer triplet \((hkl)\) for the surface orientation.</p></div></li>
</ol>

<div class="formula-strip">\[(p,q,r)\longrightarrow\left(\frac1p,\frac1q,\frac1r\right)\propto(h,k,l).\]</div>

For example, intercepts \\((1,1,\infty)\\) give \\((110)\\). An overbar marks a negative index: \\((1\bar{1}0)\\) meets the first and second axes on opposite sides of the origin and remains parallel to the third. {% include cite.html id="iucr-miller" %}

## Keep planes, directions, and families distinct {#read-notation}

<div class="table-wrap"><table><thead><tr><th>Notation</th><th>Meaning</th></tr></thead><tbody><tr><td>\((hkl)\)</td><td>A plane orientation; in surface science, a surface with that orientation</td></tr><tr><td>\(\{hkl\}\)</td><td>The symmetry-equivalent family of plane orientations</td></tr><tr><td>\([uvw]\)</td><td>A crystallographic direction in direct space</td></tr><tr><td>\(\langle uvw\rangle\)</td><td>The symmetry-equivalent family of directions</td></tr></tbody></table></div>

With the dual-basis convention above, adjacent coordinate planes in the reduced \\((hkl)\\) family have metric spacing

<div class="formula-strip">\[d_{hkl}=\frac{1}{|\mathbf g_{hkl}|}.\]</div>

For a cubic cell with lattice constant \\(a\\), the axes are orthogonal and equal, so this becomes

<div class="formula-strip">\[d_{hkl}=\frac{a}{\sqrt{h^2+k^2+l^2}}.\]</div>

For a cubic metric, the direct-space direction \\([hkl]\\) is parallel to the normal of \\((hkl)\\) for every index triplet. Outside cubic systems this does not hold in general, although particular directions and plane normals may coincide; use \\(\mathbf g_{hkl}\\) to obtain the normal and spacing. {% include cite.html id="iucr-reciprocal" %}

This \\(d_{hkl}\\) is the spacing of the indexed coordinate-plane family. A centred lattice or multi-atom basis can place atom-bearing sublayers between those planes, so the smallest vertical separation visible in an atomic profile need not equal \\(d_{hkl}\\). Likewise, a surface-orientation label need not be an allowed diffraction vector: for example, FCC(110) is a valid surface orientation even though FCC centring makes 220 the first reciprocal-lattice node in that direction. {% include cite.html id="hammond-2015" %}

Triplets with a common factor are parallel: \\((222)\\) and \\((111)\\) have the same surface normal. A surface-orientation tool may therefore reduce them to \\((111)\\). Diffraction retains reciprocal-lattice multiples such as 222 because \\(\mathbf g_{222}=2\mathbf g_{111}\\), so their associated reciprocal spacing information is not interchangeable.

## The basis and axis system determine what is exposed {#cubic-and-hcp}

FCC and BCC use the same conventional cubic axes, so a given triplet specifies the same geometric normal in both. Their different occupied positions nevertheless produce different atomic layer sequences and planar densities along that normal. Indices orient the cut; the bulk structure supplies its atoms.

Hexagonal crystals are commonly indexed with three equivalent basal axes separated by \\(120^\circ\\) and one \\(c\\) axis. A plane then uses four Miller–Bravais indices \\((hkil)\\), with the redundant basal index

<div class="formula-strip">\[i=-(h+k).\]</div>

Thus \\((0001)\\) is the basal orientation, \\((10\bar{1}0)\\) and \\((11\bar{2}0)\\) are prism orientations parallel to \\(c\\), and \\((10\bar{1}1)\\) is pyramidal. For hexagonal lattice parameters \\(a\\) and \\(c\\), their plane spacing obeys

<div class="formula-strip">\[\frac{1}{d_{hkil}^{2}}=\frac{4}{3}\frac{h^2+hk+k^2}{a^2}+\frac{l^2}{c^2},\qquad i=-(h+k).\]</div>

Hexagonal directions can likewise use four indices, but plane indices and direction indices must not be exchanged: their relation is set by the reciprocal metric, just as in any non-cubic crystal. {% include cite.html id="iucr-miller" %} The cubic and hexagonal spacing expressions above follow directly from their respective reciprocal metrics. {% include cite.html id="hammond-2015" %}

## Orientation is not termination {#termination}

The indices fix \\(\mathbf g_{hkl}\\), hence the orientation. A parallel cut can still be translated along that normal. In an equation \\(\mathbf g_{hkl}\!\cdot\!\mathbf r=\alpha\\), changing \\(\alpha\\) changes the offset without changing \\((hkl)\\).

The **termination** identifies which atomic or chemical layer is last when the bulk is truncated. A multi-atom basis or multicomponent crystal can present inequivalent terminations at different offsets. Even elemental FCC and BCC expose different sequences for the same cubic indices because their bulk positions differ.

Higher-index orientations are often tilted relative to a nearby low-index orientation. In an ideal atomic model, that geometry can appear as periodically repeated terraces separated by steps. The terrace width and step structure follow from the indices, basis, and termination; the phrase “high index” alone does not uniquely determine them.

<aside class="concept-callout"><strong>Report more than \((hkl)\).</strong><p>A reproducible surface description states the crystal structure and composition, orientation, termination, and surface-cell convention. Miller indices do not specify the later atomic response to creating the surface.</p></aside>

Once the orientation and termination are clear, the next task is to find the two translations that repeat within the plane.
