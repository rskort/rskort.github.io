---
layout: default
title: Surface builder
description: Build an ideal FCC, BCC, HCP, SC, SH, or BCT surface from Miller indices and lattice parameters.
permalink: /surface-atlas/surface-builder/
scripts:
  - /assets/js/surface-builder.js
---

<article class="builder-page" data-surface-builder data-base-url="{{ site.baseurl }}">
  <header class="builder-hero">
    <p class="eyebrow">Interactive crystallography</p>
    <h1>Build a surface from its indices.</h1>
    <p class="lede">Choose a bulk structure, set its lattice parameters and plane orientation, then compare the cut, exposed layers, repeat cell, and geometric adsorption-site candidates.</p>
  </header>

  <form class="builder-controls" novalidate>
    <fieldset class="lattice-selector">
      <legend>1 · Bulk lattice</legend>
      <label><input type="radio" name="lattice" value="fcc" checked><span><strong>FCC</strong><small>Face-centred cubic</small></span></label>
      <label><input type="radio" name="lattice" value="bcc"><span><strong>BCC</strong><small>Body-centred cubic</small></span></label>
      <label><input type="radio" name="lattice" value="hcp"><span><strong>HCP</strong><small>Hexagonal close packed</small></span></label>
      <label><input type="radio" name="lattice" value="sc"><span><strong>SC</strong><small>Simple cubic</small></span></label>
      <label><input type="radio" name="lattice" value="sh"><span><strong>SH</strong><small>Simple hexagonal</small></span></label>
      <label><input type="radio" name="lattice" value="bct"><span><strong>BCT</strong><small>Body-centred tetragonal</small></span></label>
      <div class="lattice-parameter-inputs">
        <label><span>a (Å)</span><input name="a" type="number" min="0.1" step="0.01" value="3.61" inputmode="decimal"></label>
        <label data-c-parameter hidden><span>c (Å)</span><input name="c" type="number" min="0.1" step="0.01" value="3.61" inputmode="decimal"></label>
      </div>
      <p class="lattice-parameter-note">Hexagonal and tetragonal structures use independent a and c values.</p>
    </fieldset>

    <fieldset class="index-selector">
      <legend>2 · Miller indices</legend>
      <div class="index-inputs">
        <label><span>h</span><input name="h" type="number" min="-8" max="8" step="1" value="1" inputmode="numeric"></label>
        <label><span>k</span><input name="k" type="number" min="-8" max="8" step="1" value="1" inputmode="numeric"></label>
        <label data-hcp-index hidden><span>i</span><input name="i" type="number" value="-2" readonly tabindex="-1"><small>−(h+k)</small></label>
        <label><span>l</span><input name="l" type="number" min="-8" max="8" step="1" value="1" inputmode="numeric"></label>
      </div>
      <p>Editable values may range from −8 to +8. Common factors are reduced automatically.</p>
    </fieldset>

    <fieldset class="offset-selector">
      <legend>3 · Plane position</legend>
      <label for="plane-offset"><span>Translate through one interplanar period</span><output data-offset-value>0.50</output></label>
      <input id="plane-offset" name="offset" type="range" min="0" max="1" step="0.002" value="0.5">
      <div class="offset-labels"><span>previous plane</span><span>representative layer</span><span>next plane</span></div>
    </fieldset>
    <p class="builder-error" data-builder-error hidden role="alert"></p>
  </form>

  <section class="builder-summary" aria-label="Generated surface summary">
    <div><span>Reduced plane</span><strong data-normalised-plane>FCC(1 1 1)</strong></div>
    <div><span>Plane spacing</span><strong data-spacing>—</strong></div>
    <div><span>Surface cell</span><strong data-cell>—</strong></div>
    <div><span>Displayed atoms</span><strong data-atom-count>—</strong></div>
    <a data-catalogue-link hidden href="#"></a>
  </section>

  <section class="builder-visuals" aria-label="Generated cut and surface">
    <div class="builder-panel cut-builder-panel">
      <div class="builder-panel-heading"><div><p class="kicker">Bulk crystal</p><h2>The cut</h2></div><p>The coloured plane moves continuously. Teal atoms lie directly in it.</p></div>
      <div class="live-cut-stage"><canvas data-bulk-cut-canvas role="img" aria-label="The selected Miller plane cutting through the chosen bulk lattice"></canvas></div>
    </div>

    <div class="builder-panel surface-builder-panel">
      <div class="builder-panel-heading"><div><p class="kicker">Result</p><h2>The surface</h2></div><p>Drag to rotate · scroll or pinch to zoom</p></div>
      <div class="surface-viewer">
        <div class="viewer-stage">
          <canvas aria-label="Interactive generated crystal surface"></canvas>
          <div class="viewer-loading">Constructing the surface…</div>
          <div class="viewer-tooltip" hidden></div>
        </div>
        <div class="viewer-toolbar builder-viewer-toolbar">
          <div class="viewer-views" aria-label="Preset views"><button type="button" data-view="reset">Perspective</button><button type="button" data-view="top">Top</button><button type="button" data-view="side">Side</button></div>
          <div class="viewer-toggles candidate-toggles">
            <label><input type="checkbox" data-toggle="sites" checked> Candidates</label>
            <label class="ontop-toggle"><input type="checkbox" data-toggle="ontop" checked> Ontop</label>
            <label class="bridge-toggle"><input type="checkbox" data-toggle="bridge" checked> Bridge</label>
            <label class="hollow-toggle"><input type="checkbox" data-toggle="hollow" checked> Hollow</label>
            <label><input type="checkbox" data-toggle="bonds" checked> Bonds</label>
            <label><input type="checkbox" data-toggle="cell" checked> Cell</label>
            <label><input type="checkbox" data-toggle="deep" checked> Deeper layers</label>
          </div>
        </div>
        <p class="viewer-status" aria-live="polite"></p>
      </div>
    </div>
  </section>

  <aside class="candidate-note">
    <h2>How to read the candidates</h2>
    <div><span class="candidate-dot ontop"></span><p><strong>Ontop</strong> positions sit above exposed atoms.</p></div>
    <div><span class="candidate-dot bridge"></span><p><strong>Bridge</strong> positions are nearest-neighbour midpoints.</p></div>
    <div><span class="candidate-dot hollow"></span><p><strong>Hollow or pocket</strong> positions are empty circumcentres, classified by the number of surrounding atoms.</p></div>
    <p>These are geometric starting points; not predicted adsorption minima. Relaxation, reconstruction, chemistry, and the chosen termination can change the preferred position.</p>
  </aside>
</article>
