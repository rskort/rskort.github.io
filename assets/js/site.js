(() => {
  "use strict";

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
    const guideGroup = svg.querySelector(".plane-guides");
    guideGroup.innerHTML = plane.guides.map(([x1,y1,x2,y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`).join("");
    title.textContent = `FCC(${key})`;
    equation.textContent = plane.equation;
    description.textContent = plane.description;
    buttons.forEach(button => button.setAttribute("aria-pressed", button.dataset.plane === key ? "true" : "false"));
  };

  buttons.forEach(button => button.addEventListener("click", () => setPlane(button.dataset.plane)));
  setPlane("100");
})();
