# rskort.github.io

A Jekyll-compatible GitHub Pages site containing a data-driven atlas of crystal surface facets and adsorption sites.

## Preview locally

GitHub Pages builds the Markdown and Liquid templates with Jekyll. With Ruby and Bundler available, install Jekyll and serve the site:

```bash
gem install bundler jekyll
jekyll serve
```

Then open <http://localhost:4000>. On Windows PowerShell, the same commands work in PowerShell after Ruby is installed. A quick content-only preview can also use `python -m http.server`, but it will not render Jekyll templates or Markdown.

## Generate and validate figures

macOS or Linux:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r tools/requirements.txt
python tools/generate_surface_figures.py
python tools/validate_surface_data.py
```

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r tools/requirements.txt
python tools/generate_surface_figures.py
python tools/validate_surface_data.py
```

The generator uses ASE for slab structures, NumPy for coordinate handling, and Matplotlib for the twelve committed SVG files in `assets/surfaces/`.

## Add a surface

1. Add an entry to `_data/surfaces.yml`, including all summary, site, example, mistake, and figure fields.
2. Add a small page in `surface-sites/` with `layout: surface`, a unique `surface_id`, and an explicit permalink.
3. Add a `SurfaceSpec` entry in `tools/generate_surface_figures.py`. Site marker fractions are expressed relative to the facet's primitive surface vectors.
4. Regenerate the figures and run `python tools/validate_surface_data.py`.

Stepped facets can reuse the layout while adding terrace, step-edge, and kink sites to their data entry. If their visual needs grow, extend the data and layout consistently rather than creating a one-off page.

## Deploy

Push the repository to the GitHub Pages branch configured for `rskort.github.io` (normally `main`). In the repository settings, set **Pages → Build and deployment → Source** to **Deploy from a branch** and select the repository root. GitHub Pages will run Jekyll automatically; no server or paid deployment service is required.
