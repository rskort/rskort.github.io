(() => {
  "use strict";

  const initialisePlaneDemo = () => {
    const root = document.querySelector("[data-plane-demo]");
    if (!root) return;
    const svg = root.querySelector("svg");
    const buttons = [...root.querySelectorAll("[data-plane]")];
    const title = root.querySelector("[data-plane-title]");
    const equation = root.querySelector("[data-plane-equation]");
    const description = root.querySelector("[data-plane-description]");
    const planes = {
      "100": {
        points: "398,245 244,156 244,2 398,91",
        guides: [[398,245,244,156], [244,156,244,2], [244,2,398,91], [398,91,398,245]],
        equation: "Intercepts (a, ∞, ∞) → reciprocals (1/a, 0, 0) → (100)",
        description: "The plane meets x after one lattice constant and runs parallel to y and z. Repeating this cut exposes a square net.",
        accent: "#d85f45"
      },
      "110": {
        points: "398,245 90,245 90,91 398,91",
        guides: [[398,245,90,245], [90,245,90,91], [90,91,398,91], [398,91,398,245]],
        equation: "Intercepts (a, a, ∞) → reciprocals (1/a, 1/a, 0) → (110)",
        description: "The plane meets x and y at one lattice constant and stays parallel to z. The exposed net contains dense rows and open troughs.",
        accent: "#3b7f86"
      },
      "111": {
        points: "398,245 90,245 244,180",
        guides: [[398,245,90,245], [90,245,244,180], [244,180,398,245]],
        equation: "Intercepts (a, a, a) → reciprocals (1/a, 1/a, 1/a) → (111)",
        description: "The plane meets all three axes equally. Its atoms form the close-packed triangular net characteristic of FCC(111).",
        accent: "#8b6aa8"
      }
    };
    const setPlane = (key) => {
      const plane = planes[key];
      svg.querySelector(".cut-plane").setAttribute("points", plane.points);
      svg.querySelector(".cut-plane").style.setProperty("--plane-colour", plane.accent);
      svg.querySelector(".plane-guides").innerHTML = plane.guides
        .map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`).join("");
      title.textContent = `FCC(${key})`;
      equation.textContent = plane.equation;
      description.textContent = plane.description;
      buttons.forEach(button => button.setAttribute("aria-pressed", button.dataset.plane === key ? "true" : "false"));
    };
    buttons.forEach(button => button.addEventListener("click", () => setPlane(button.dataset.plane)));
    setPlane("100");
  };

  class SurfaceViewer {
    constructor(root, initialData = null) {
      this.root = root;
      this.canvas = root.querySelector("canvas");
      this.context = this.canvas.getContext("2d");
      this.loading = root.querySelector(".viewer-loading");
      this.tooltip = root.querySelector(".viewer-tooltip");
      this.status = root.querySelector(".viewer-status");
      this.yaw = -0.55;
      this.pitch = 0.72;
      this.zoom = 1;
      this.dragging = false;
      this.pointers = new Map();
      this.hitTargets = [];
      this.colours = ["#176b72", "#6f9691", "#a8beb8", "#cad8d3", "#dde6e2", "#edf2ef"];
      this.bindControls();
      if (initialData) this.setData(initialData);
      else if (root.dataset.geometry) this.load();
    }

    async load() {
      try {
        const response = await fetch(this.root.dataset.geometry);
        if (!response.ok) throw new Error(`Geometry request failed (${response.status})`);
        this.setData(await response.json());
      } catch (error) {
        this.loading.textContent = "The interactive model could not be loaded. The diagrams below remain available.";
        this.loading.classList.add("viewer-error");
        this.status.textContent = error.message;
      }
    }

    setData(data, options = {}) {
      this.data = data;
      this.prepareGeometry();
      if (this.loading) this.loading.hidden = true;
      if (options.view === "top") {
        this.pitch = 0;
        this.yaw = 0;
      }
      if (options.zoom) this.zoom = options.zoom;
      const siteDescription = data.candidateSites ? "geometric candidates" : "ideal sites";
      if (this.status) {
        this.status.textContent = `${data.element} slab · ${data.atoms.length} atoms · ${data.sites.length} ${siteDescription}`;
      }
      if (!this.resizeObserver) {
        this.resizeObserver = new ResizeObserver(() => this.render());
        this.resizeObserver.observe(this.root.querySelector(".viewer-stage"));
      }
      this.render();
    }

    prepareGeometry() {
      const all = [...this.data.atoms, ...this.data.sites];
      const axes = ["x", "y", "z"];
      this.centre = {};
      axes.forEach(axis => {
        const values = all.map(point => point[axis]);
        this.centre[axis] = (Math.min(...values) + Math.max(...values)) / 2;
      });
      const spans = axes.map(axis => {
        const values = all.map(point => point[axis]);
        return Math.max(...values) - Math.min(...values);
      });
      this.extent = Math.max(...spans, 1);
    }

    bindControls() {
      this.root.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => {
        if (button.dataset.view === "top") {
          this.pitch = 0;
          this.yaw = 0;
        } else if (button.dataset.view === "side") {
          this.pitch = -Math.PI / 2;
          this.yaw = 0;
        } else {
          this.pitch = 0.72;
          this.yaw = -0.55;
          this.zoom = 1;
        }
        this.render();
      }));
      this.root.querySelectorAll("[data-toggle]").forEach(input => input.addEventListener("change", () => this.render()));
      this.canvas.addEventListener("pointerdown", event => this.pointerDown(event));
      this.canvas.addEventListener("pointermove", event => this.pointerMove(event));
      this.canvas.addEventListener("pointerup", event => this.pointerUp(event));
      this.canvas.addEventListener("pointercancel", event => this.pointerUp(event));
      this.canvas.addEventListener("pointerleave", () => {
        if (!this.dragging) this.hideTooltip();
      });
      this.canvas.addEventListener("wheel", event => {
        event.preventDefault();
        this.zoom = Math.max(0.55, Math.min(2.8, this.zoom * Math.exp(-event.deltaY * 0.001)));
        this.render();
      }, {passive: false});
    }

    pointerDown(event) {
      this.canvas.setPointerCapture(event.pointerId);
      this.pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
      this.dragging = true;
      this.lastPointer = {x: event.clientX, y: event.clientY};
      if (this.pointers.size === 2) this.lastPinch = this.pointerDistance();
      this.hideTooltip();
    }

    pointerMove(event) {
      const rect = this.canvas.getBoundingClientRect();
      if (!this.pointers.has(event.pointerId)) {
        this.showTooltip(event.clientX - rect.left, event.clientY - rect.top);
        return;
      }
      this.pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
      if (this.pointers.size === 2) {
        const distance = this.pointerDistance();
        if (this.lastPinch) this.zoom = Math.max(0.55, Math.min(2.8, this.zoom * distance / this.lastPinch));
        this.lastPinch = distance;
      } else {
        const dx = event.clientX - this.lastPointer.x;
        const dy = event.clientY - this.lastPointer.y;
        this.yaw += dx * 0.008;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch - dy * 0.008));
        this.lastPointer = {x: event.clientX, y: event.clientY};
      }
      this.render();
    }

    pointerUp(event) {
      this.pointers.delete(event.pointerId);
      this.dragging = this.pointers.size > 0;
      this.lastPinch = null;
    }

    pointerDistance() {
      const [a, b] = [...this.pointers.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    }

    toggle(name) {
      const input = this.root.querySelector(`[data-toggle="${name}"]`);
      return !input || input.checked;
    }

    project(point, width, height, scale) {
      const x = point.x - this.centre.x;
      const y = point.y - this.centre.y;
      const z = point.z - this.centre.z;
      const cosYaw = Math.cos(this.yaw);
      const sinYaw = Math.sin(this.yaw);
      const x1 = cosYaw * x - sinYaw * y;
      const y1 = sinYaw * x + cosYaw * y;
      const cosPitch = Math.cos(this.pitch);
      const sinPitch = Math.sin(this.pitch);
      const y2 = cosPitch * y1 - sinPitch * z;
      const depth = sinPitch * y1 + cosPitch * z;
      return {x: width / 2 + x1 * scale, y: height / 2 - y2 * scale, depth};
    }

    render() {
      if (!this.data) return;
      const rect = this.canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (this.canvas.width !== Math.round(width * ratio) || this.canvas.height !== Math.round(height * ratio)) {
        this.canvas.width = Math.round(width * ratio);
        this.canvas.height = Math.round(height * ratio);
      }
      const ctx = this.context;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width, height) * 0.72 / this.extent * this.zoom;
      const deep = this.toggle("deep");
      const visible = this.data.atoms.map(atom => deep || atom.layer < 3);
      const projectedAtoms = this.data.atoms.map(atom => this.project(atom, width, height, scale));
      this.hitTargets = [];

      if (this.toggle("cell") && this.data.cell && this.data.cell.length >= 3) {
        const cell = this.data.cell.map(point => this.project({x: point[0], y: point[1], z: point[2]}, width, height, scale));
        ctx.strokeStyle = "rgba(23,48,51,.72)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        cell.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (this.toggle("bonds")) {
        ctx.strokeStyle = "rgba(123,155,149,.42)";
        ctx.lineWidth = 1.15;
        this.data.bonds.forEach(([a, b]) => {
          if (!visible[a] || !visible[b]) return;
          ctx.beginPath();
          ctx.moveTo(projectedAtoms[a].x, projectedAtoms[a].y);
          ctx.lineTo(projectedAtoms[b].x, projectedAtoms[b].y);
          ctx.stroke();
        });
      }

      const atomOrder = this.data.atoms.map((atom, index) => ({atom, index, ...projectedAtoms[index]}))
        .filter(item => visible[item.index]).sort((a, b) => a.depth - b.depth);
      atomOrder.forEach(item => {
        const radius = Math.max(4.2, 8.3 - item.atom.layer * 0.55);
        ctx.beginPath();
        ctx.arc(item.x, item.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.colours[Math.min(item.atom.layer, this.colours.length - 1)];
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.92)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        this.hitTargets.push({x: item.x, y: item.y, radius, text: `${this.data.element} · layer ${item.atom.layer + 1}`});
      });

      if (this.toggle("sites")) {
        this.data.sites.filter(site => !site.kind || this.toggle(site.kind)).forEach(site => {
          const point = this.project(site, width, height, scale);
          const isCandidate = Boolean(this.data.candidateSites);
          const radius = isCandidate ? 7.5 : 11;
          ctx.beginPath();
          ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
          const siteColours = {ontop: "#d85f45", bridge: "#c98a32", hollow: "#8b6aa8"};
          ctx.fillStyle = siteColours[site.kind] || "#d85f45";
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = isCandidate ? 1.7 : 2.2;
          ctx.stroke();
          if (!isCandidate) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "700 11px Inter, system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(site.marker, point.x, point.y + 0.5);
          }
          this.hitTargets.push({x: point.x, y: point.y, radius: isCandidate ? 11 : 14, text: isCandidate ? site.label : `${site.marker}. ${site.label}`});
        });
      }
    }

    showTooltip(x, y) {
      const target = [...this.hitTargets].reverse().find(item => Math.hypot(item.x - x, item.y - y) <= item.radius + 3);
      if (!target) {
        this.hideTooltip();
        return;
      }
      this.tooltip.textContent = target.text;
      this.tooltip.style.left = `${x}px`;
      this.tooltip.style.top = `${y}px`;
      this.tooltip.hidden = false;
    }

    hideTooltip() {
      this.tooltip.hidden = true;
    }
  }

  initialisePlaneDemo();
  window.SurfaceViewer = SurfaceViewer;
  document.querySelectorAll(".surface-viewer[data-geometry]").forEach(root => new SurfaceViewer(root));
})();
