# rskort.github.io

Rick S. Kort’s personal academic site from the Leiden Institute of Chemistry, collecting short explainers, static figures, research notes, tools, and interactive demos that illustrate computational electrochemistry, molecular simulations, and AFM.

## Site layout
- `index.html` is the landing page with the latest highlights and links into the rest of the site.
- `about.html` and `contact.html` describe Rick’s research interests and provide ways to get in touch.
- `_tutorials/` holds Jekyll-powered lessons and notes that can grow over time; each markdown file becomes a standalone tutorial page.
- `_games/` hosts lightweight HTML/JS interactions such as the Sudoku demo, while `tools.html` surfaces small utilities or interactive calculators.
- Shared layouts and navigation come from `_layouts/` and `_includes/`, while styles live under `css/` (with `css/tutorials/` for tutorial-specific themes).

## Development
1. Install Ruby (3.2+) and Bundler, then run `bundle install` so all Jekyll dependencies from `Gemfile` are available.
2. Use `bundle exec jekyll serve` to build and preview the site locally.
3. Edit HTML, CSS, and JavaScript assets directly; assets under `css/`, `assets/js/`, and `_includes/` are copied through the build as-is.

## Future plans
- Expand `_tutorials/` with additional walkthroughs on electrochemical simulations and data visualization.
- Grow the `_games/` section with more demos or interactive teaching aids tied to current projects.
- Add richer tooling to `tools.html` so the page becomes a living lab for common calculations and visualizations.

## Publishing
- Hosted on https://rskort.github.io via GitHub Pages; pushing to `main` (or the default branch) triggers the build automatically.
- Keep `_config.yml` and `css/` in sync with the content you want live; rebuilding picks up all tracked files.
