const state = {
  workflow: "single_point",
  systemType: "molecule",
  global: {
    projectName: "cp2k_job",
    printLevel: "MEDIUM",
  },
  structure: {
    atoms: [],
    elements: [],
    cell: { Lx: null, Ly: null, Lz: null },
    charge: 0,
    multiplicity: 1,
  },
  method: {
    xcPreset: "PBE_D3",
    basisPreset: "standard_condensed",
    cutoff: 400,
    relCutoff: 60,
    spinTreatment: "restricted",
    smearing: { enabled: true, tempK: 300 },
    scfSolver: "diagonalization",
    mixing: { method: "BROYDEN_MIXING", alpha: 0.4, history: 5 },
    kpoints: { scheme: "GAMMA", nx: 1, ny: 1, nz: 1 },
  },
  run: {
    timestepFs: 0.5,
    nsteps: 1000,
    temperatureK: 300,
    thermostat: {
      type: "CSVR",
      timeConstantFs: 100,
    },
    velInit: "MAXWELL",
    velSeed: 12345,
    epsScf: 1e-5,
    maxScf: 50,
  },
  output: {
    trajFreq: 10,
    energyFreq: 1,
    restartFreq: 100,
    forceFreq: 0,
    stressFreq: 0,
  },
};

let currentStep = 1;
const maxStep = 6;

document.addEventListener("DOMContentLoaded", () => {
  bindInputs();
  setInitialValues();
  goToStep(1);
  updateVisibility();
  refreshOutputs();
});

function bindInputs() {
  document.querySelectorAll('input[name="workflow"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      state.workflow = event.target.value;
      updateVisibility();
      refreshOutputs();
    });
  });

  document.querySelectorAll('input[name="system-type"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      state.systemType = event.target.value;
      updateVisibility();
      refreshOutputs();
    });
  });

  const fileInput = document.getElementById("xyz-upload");
  if (fileInput) {
    fileInput.addEventListener("change", async (event) => {
      if (event.target.files?.length) {
        await handleXyzUpload(event.target.files[0]);
      }
    });
  }

  const changeMap = [
    ["project-name", (value) => (state.global.projectName = value || "cp2k_job")],
    ["print-level", (value) => (state.global.printLevel = value)],
    ["xc-preset", (value) => (state.method.xcPreset = value)],
    ["basis-preset", (value) => (state.method.basisPreset = value)],
    ["cutoff", (value) => (state.method.cutoff = toNumber(value, state.method.cutoff))],
    ["rel-cutoff", (value) => (state.method.relCutoff = toNumber(value, state.method.relCutoff))],
    ["spin-treatment", (value) => (state.method.spinTreatment = value)],
    ["scf-solver", (value) => (state.method.scfSolver = value)],
    ["mixing-method", (value) => (state.method.mixing.method = value)],
    ["mixing-alpha", (value) => (state.method.mixing.alpha = toNumber(value, state.method.mixing.alpha))],
    ["mixing-history", (value) => (state.method.mixing.history = toNumber(value, state.method.mixing.history))],
    ["box-lx", (value) => (state.structure.cell.Lx = toNumber(value, state.structure.cell.Lx))],
    ["box-ly", (value) => (state.structure.cell.Ly = toNumber(value, state.structure.cell.Ly))],
    ["box-lz", (value) => (state.structure.cell.Lz = toNumber(value, state.structure.cell.Lz))],
    ["total-charge", (value) => (state.structure.charge = toNumber(value, state.structure.charge))],
    ["multiplicity", (value) => (state.structure.multiplicity = toNumber(value, state.structure.multiplicity))],
    ["eps-scf", (value) => (state.run.epsScf = toNumber(value, state.run.epsScf))],
    ["max-scf", (value) => (state.run.maxScf = toNumber(value, state.run.maxScf))],
    ["timestep", (value) => (state.run.timestepFs = toNumber(value, state.run.timestepFs))],
    ["md-steps", (value) => (state.run.nsteps = toNumber(value, state.run.nsteps))],
    ["temperature", (value) => (state.run.temperatureK = toNumber(value, state.run.temperatureK))],
    ["thermostat", (value) => (state.run.thermostat.type = value)],
    ["time-constant", (value) => (state.run.thermostat.timeConstantFs = toNumber(value, state.run.thermostat.timeConstantFs))],
    ["vel-scaling", (value) => (state.run.velInit = value)],
    ["vel-seed", (value) => (state.run.velSeed = toNumber(value, state.run.velSeed))],
    ["traj-freq", (value) => (state.output.trajFreq = toNumber(value, state.output.trajFreq))],
    ["energy-freq", (value) => (state.output.energyFreq = toNumber(value, state.output.energyFreq))],
    ["restart-freq", (value) => (state.output.restartFreq = toNumber(value, state.output.restartFreq))],
    ["force-freq", (value) => (state.output.forceFreq = toNumber(value, state.output.forceFreq))],
    ["stress-freq", (value) => (state.output.stressFreq = toNumber(value, state.output.stressFreq))],
    ["kpoint-scheme", (value) => (state.method.kpoints.scheme = value)],
    ["kpoint-nx", (value) => (state.method.kpoints.nx = toNumber(value, state.method.kpoints.nx))],
    ["kpoint-ny", (value) => (state.method.kpoints.ny = toNumber(value, state.method.kpoints.ny))],
    ["kpoint-nz", (value) => (state.method.kpoints.nz = toNumber(value, state.method.kpoints.nz))],
  ];

  changeMap.forEach(([id, setter]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", (event) => {
        setter(event.target.value);
        refreshOutputs();
      });
    }
  });

  const smearToggle = document.getElementById("smear-toggle");
  if (smearToggle) {
    smearToggle.addEventListener("change", (event) => {
      state.method.smearing.enabled = Boolean(event.target.checked);
      refreshOutputs();
    });
  }
  const smearTemp = document.getElementById("smear-temp");
  if (smearTemp) {
    smearTemp.addEventListener("input", (event) => {
      state.method.smearing.tempK = toNumber(event.target.value, state.method.smearing.tempK);
      refreshOutputs();
    });
  }

  const progress = document.getElementById("wizard-progress");
  if (progress) {
    progress.querySelectorAll("button[data-step]").forEach((btn) => {
      btn.addEventListener("click", () => goToStep(Number(btn.dataset.step)));
    });
  }

  const nextBtn = document.getElementById("next-step");
  const prevBtn = document.getElementById("prev-step");
  if (nextBtn) nextBtn.addEventListener("click", () => goToStep(currentStep + 1));
  if (prevBtn) prevBtn.addEventListener("click", () => goToStep(currentStep - 1));

  const copyButtons = ["copy-input", "copy-input-side"];
  copyButtons.forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", async () => {
        const text = generateCp2kInput(state);
        await copyToClipboard(text);
      });
    }
  });

  const downloadButtons = ["download-input", "download-input-side"];
  downloadButtons.forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () => {
        const text = generateCp2kInput(state);
        downloadText(text, "cp2k.inp");
      });
    }
  });

  const previewToggle = document.getElementById("preview-toggle");
  if (previewToggle) {
    previewToggle.addEventListener("click", () => {
      const panel = document.getElementById("live-preview");
      if (!panel) return;
      panel.classList.toggle("expanded");
      previewToggle.textContent = panel.classList.contains("expanded") ? "Collapse" : "Expand";
    });
  }
}

function setInitialValues() {
  setRadioValue('input[name="workflow"]', state.workflow);
  setRadioValue('input[name="system-type"]', state.systemType);
  setValue("project-name", state.global.projectName);
  setValue("print-level", state.global.printLevel);
  setValue("xc-preset", state.method.xcPreset);
  setValue("basis-preset", state.method.basisPreset);
  setValue("cutoff", state.method.cutoff);
  setValue("rel-cutoff", state.method.relCutoff);
  setValue("spin-treatment", state.method.spinTreatment);
  setValue("smear-temp", state.method.smearing.tempK);
  const smearToggle = document.getElementById("smear-toggle");
  if (smearToggle) smearToggle.checked = state.method.smearing.enabled;
  setValue("scf-solver", state.method.scfSolver);
  setValue("mixing-method", state.method.mixing.method);
  setValue("mixing-alpha", state.method.mixing.alpha);
  setValue("mixing-history", state.method.mixing.history);
  setValue("box-lx", state.structure.cell.Lx ?? "");
  setValue("box-ly", state.structure.cell.Ly ?? "");
  setValue("box-lz", state.structure.cell.Lz ?? "");
  setValue("total-charge", state.structure.charge);
  setValue("multiplicity", state.structure.multiplicity);
  setValue("eps-scf", state.run.epsScf);
  setValue("max-scf", state.run.maxScf);
  setValue("timestep", state.run.timestepFs);
  setValue("md-steps", state.run.nsteps);
  setValue("temperature", state.run.temperatureK);
  setValue("thermostat", state.run.thermostat.type);
  setValue("time-constant", state.run.thermostat.timeConstantFs);
  setValue("vel-scaling", state.run.velInit);
  setValue("vel-seed", state.run.velSeed);
  setValue("traj-freq", state.output.trajFreq);
  setValue("energy-freq", state.output.energyFreq);
  setValue("restart-freq", state.output.restartFreq);
  setValue("force-freq", state.output.forceFreq);
  setValue("stress-freq", state.output.stressFreq);
  setValue("kpoint-scheme", state.method.kpoints.scheme);
  setValue("kpoint-nx", state.method.kpoints.nx);
  setValue("kpoint-ny", state.method.kpoints.ny);
  setValue("kpoint-nz", state.method.kpoints.nz);
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el !== null && el !== undefined) {
    el.value = value;
  }
}

function setRadioValue(selector, value) {
  document.querySelectorAll(selector).forEach((input) => {
    input.checked = input.value === value;
  });
}

async function handleXyzUpload(file) {
  const feedback = document.getElementById("structure-feedback");
  try {
    const text = await file.text();
    const parsed = parseXyz(text);
    state.structure.atoms = parsed.atoms;
    state.structure.elements = parsed.elements;
    updateStructureSummary();
    if (feedback) {
      feedback.textContent = `Loaded ${parsed.count} atoms from ${file.name}.`;
      feedback.className = "feedback";
    }
    refreshOutputs();
  } catch (error) {
    console.error(error);
    if (feedback) {
      feedback.textContent = `Could not read file: ${error.message}`;
      feedback.className = "feedback error";
    }
  }
}

function parseXyz(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error("File is too short to be a valid XYZ.");
  }
  const atomCount = Number.parseInt(lines[0], 10);
  if (!Number.isFinite(atomCount) || atomCount <= 0) {
    throw new Error("First line must provide a positive atom count.");
  }
  const coordLines = lines.slice(2);
  if (coordLines.length < atomCount) {
    throw new Error(`Expected ${atomCount} coordinate lines, found ${coordLines.length}.`);
  }

  const atoms = [];
  for (let i = 0; i < atomCount; i += 1) {
    const parts = coordLines[i].split(/\s+/);
    if (parts.length < 4) {
      throw new Error(`Line ${i + 3} is missing coordinates.`);
    }
    const [element, xStr, yStr, zStr] = parts;
    const x = Number.parseFloat(xStr);
    const y = Number.parseFloat(yStr);
    const z = Number.parseFloat(zStr);
    if (![x, y, z].every((v) => Number.isFinite(v))) {
      throw new Error(`Line ${i + 3} has non-numeric coordinates.`);
    }
    atoms.push({ element, x, y, z });
  }
  const elements = [...new Set(atoms.map((a) => a.element))];
  return { atoms, elements, count: atomCount };
}

function updateVisibility() {
  const isBulk = state.systemType === "bulk";
  document.querySelectorAll(".bulk-only").forEach((el) => {
    el.classList.toggle("visible", isBulk);
  });

  document.querySelectorAll(".run-only").forEach((el) => {
    const mode = el.dataset.workflow;
    el.classList.toggle("visible", mode === state.workflow);
  });

  updateStructureSummary();
  updateProgress();
}

function goToStep(step) {
  currentStep = Math.min(Math.max(step, 1), maxStep);
  document.querySelectorAll(".wizard-step").forEach((stepEl) => {
    stepEl.classList.toggle("active", Number(stepEl.dataset.step) === currentStep);
  });
  updateProgress();
  updateNavButtons();
}

function updateNavButtons() {
  const prev = document.getElementById("prev-step");
  const next = document.getElementById("next-step");
  if (prev) prev.disabled = currentStep <= 1;
  if (next) next.disabled = currentStep >= maxStep;
  if (next) next.textContent = currentStep >= maxStep ? "Reviewing" : "Next";
}

function updateProgress() {
  document.querySelectorAll("#wizard-progress button[data-step]").forEach((btn) => {
    const step = Number(btn.dataset.step);
    btn.classList.toggle("active", step === currentStep);
    btn.classList.toggle("completed", step < currentStep);
  });
}

function refreshOutputs() {
  const cp2kText = generateCp2kInput(state);
  const preview = document.getElementById("cp2k-preview");
  const review = document.getElementById("review-preview");
  if (preview) preview.textContent = cp2kText;
  if (review) review.value = cp2kText;
  renderSummary();
  renderSanity();
}

function renderSummary() {
  const list = document.getElementById("summary-list");
  if (!list) return;
  const items = [
    `Workflow: ${state.workflow === "nvt_md" ? "NVT molecular dynamics" : "Single point energy"}.`,
    `System: ${state.systemType === "bulk" ? "Bulk periodic" : "Isolated molecule"} with ${state.structure.atoms.length || "no"} atoms (${state.structure.elements.join(", ") || "elements pending"}).`,
    `Charge ${state.structure.charge}, multiplicity ${state.structure.multiplicity}, spin ${state.method.spinTreatment}.`,
    `Method: ${state.method.xcPreset.replace("_", " ")} - basis preset ${humanBasis(state.method.basisPreset)} - cutoffs ${state.method.cutoff}/${state.method.relCutoff} Ry.`,
    `SCF: ${state.method.scfSolver}, mixing ${state.method.mixing.method} (alpha ${state.method.mixing.alpha}, history ${state.method.mixing.history}), smearing ${state.method.smearing.enabled ? `${state.method.smearing.tempK} K` : "off"}.`,
    state.systemType === "bulk"
      ? `K-points: ${state.method.kpoints.scheme} ${state.method.kpoints.nx}x${state.method.kpoints.ny}x${state.method.kpoints.nz}.`
      : "K-points: not used for non-periodic systems.",
    state.workflow === "nvt_md"
      ? `MD: ${state.run.nsteps} steps, timestep ${state.run.timestepFs} fs, T=${state.run.temperatureK} K, thermostat ${state.run.thermostat.type} (${state.run.thermostat.timeConstantFs} fs), velocities ${state.run.velInit} (seed ${state.run.velSeed}).`
      : `SCF targets: EPS_SCF ${state.run.epsScf}, MAX_SCF ${state.run.maxScf}.`,
    `Output: trajectory ${state.output.trajFreq}, energy ${state.output.energyFreq}, restart ${state.output.restartFreq}, forces ${state.output.forceFreq}, stress ${state.output.stressFreq}.`,
  ];
  list.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function renderSanity() {
  const container = document.getElementById("sanity-list");
  if (!container) return;
  const messages = runSanityChecks(state);
  if (!messages.length) {
    container.innerHTML = "<li class=\"info\">No checks available yet. Load a structure to see geometry checks.</li>";
    return;
  }
  container.innerHTML = messages
    .map((msg) => `<li class="${msg.severity}"><strong>${msg.severity.toUpperCase()}:</strong> ${msg.message}</li>`)
    .join("");
}

function runSanityChecks(current) {
  const messages = [];
  const atoms = current.structure.atoms;

  if (!atoms.length) {
    messages.push({ severity: "info", message: "Structure not loaded yet; geometry-based checks will appear after parsing an XYZ file." });
  } else {
    const minDist = minInteratomicDistance(atoms);
    if (minDist < 0.5) {
      messages.push({ severity: "warning", message: `Atoms are very close (minimum distance ${minDist.toFixed(2)} Angstrom). Check for overlaps.` });
    } else {
      messages.push({ severity: "info", message: `Minimum interatomic distance: ${minDist.toFixed(2)} Angstrom.` });
    }
  }

  if (current.workflow === "nvt_md" && atoms.some((a) => a.element.toUpperCase() === "H") && current.run.timestepFs > 1.0) {
    messages.push({ severity: "warning", message: "Timestep exceeds 1.0 fs with hydrogens present; consider tightening for stability." });
  }

  if (current.systemType === "bulk" && current.method.cutoff < 300) {
    messages.push({ severity: "warning", message: "Plane-wave cutoff below 300 Ry for a periodic system may be too low." });
  }

  if (current.workflow === "nvt_md" && current.output.trajFreq > 0) {
    const frames = Math.floor(current.run.nsteps / current.output.trajFreq);
    if (frames > 10000) {
      messages.push({ severity: "warning", message: `Trajectory frequency will produce ~${frames} frames; expect a large file.` });
    }
  }

  if (current.structure.multiplicity > 1 && current.method.spinTreatment === "restricted") {
    messages.push({ severity: "warning", message: "Multiplicity > 1 but spin is restricted; set spin to unrestricted (UKS=true)." });
  }

  return messages;
}

function minInteratomicDistance(atoms) {
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < atoms.length; i += 1) {
    for (let j = i + 1; j < atoms.length; j += 1) {
      const dx = atoms[i].x - atoms[j].x;
      const dy = atoms[i].y - atoms[j].y;
      const dz = atoms[i].z - atoms[j].z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < min) min = dist;
    }
  }
  return min;
}

function humanBasis(preset) {
  if (preset === "cheap_exploratory") return "Cheap exploratory";
  if (preset === "triple_zeta") return "Accurate (triple-zeta)";
  return "Standard condensed phase";
}

function formatCoordinates(atoms) {
  if (!atoms.length) return "      # Add coordinates by uploading an XYZ file";
  return atoms
    .map(
      (atom) =>
        `      ${atom.element.padEnd(3)} ${atom.x.toFixed(6).padStart(12)} ${atom.y.toFixed(6).padStart(12)} ${atom.z.toFixed(6).padStart(12)}`
    )
    .join("\n");
}

function generateCp2kInput(current) {
  const { basisPreset, xcPreset, cutoff, relCutoff } = current.method;
  const { workflow, systemType } = current;
  const basisMap = {
    standard_condensed: { basis: "DZVP-MOLOPT-SR-GTH", potential: "GTH-PBE" },
    triple_zeta: { basis: "TZV2P-MOLOPT-GTH", potential: "GTH-PBE" },
    cheap_exploratory: { basis: "SZV-MOLOPT-GTH", potential: "GTH-PBE-q" },
  };
  const basisChoice = basisMap[basisPreset] || basisMap.standard_condensed;

  const xcFunctional = xcPreset === "RPBE_D3" ? "RPBE" : xcPreset === "BLYP_D3" ? "BLYP" : "PBE";
  const useUks = current.method.spinTreatment === "unrestricted" || current.structure.multiplicity > 1;

  const lines = [];
  lines.push("# ==== GLOBAL SETTINGS ====");
  lines.push("&GLOBAL");
  lines.push(`  PROJECT ${current.global.projectName}`);
  lines.push(`  RUN_TYPE ${workflow === "nvt_md" ? "MD" : "ENERGY"}`);
  lines.push(`  PRINT_LEVEL ${current.global.printLevel}`);
  lines.push("&END GLOBAL");
  lines.push("");
  lines.push("# ==== FORCE_EVAL ====");
  lines.push("&FORCE_EVAL");
  lines.push("  METHOD QS");
  lines.push("  &DFT");
  lines.push("    BASIS_SET_FILE_NAME BASIS_MOLOPT");
  lines.push("    POTENTIAL_FILE_NAME GTH_POTENTIALS");
  lines.push(`    CHARGE ${current.structure.charge}`);
  lines.push(`    MULTIPLICITY ${current.structure.multiplicity}`);
  lines.push(`    UKS ${useUks ? "TRUE" : "FALSE"}`);
  lines.push("    &MGRID");
  lines.push(`      CUTOFF ${cutoff}    # real-space plane-wave cutoff (Ry)`);
  lines.push(`      REL_CUTOFF ${relCutoff}  # auxiliary grid cutoff (Ry)`);
  lines.push("    &END MGRID");
  lines.push("    &SCF");
  lines.push(`      EPS_SCF ${current.run.epsScf}`);
  lines.push(`      MAX_SCF ${current.run.maxScf}`);
  if (current.method.scfSolver === "ot") {
    lines.push("      SCF_GUESS ATOMIC");
    lines.push("      &OT");
    lines.push("        MINIMIZER DIIS");
    lines.push("        PRECONDITIONER FULL_SINGLE_INVERSE");
    lines.push("        ENERGY_GAP 0.001");
    lines.push("      &END OT");
  } else {
    lines.push("      &DIAGONALIZATION");
    lines.push("      &END DIAGONALIZATION");
    lines.push("      &MIXING");
    lines.push(`        METHOD ${current.method.mixing.method}`);
    lines.push(`        ALPHA ${current.method.mixing.alpha}`);
    lines.push(`        NBROYDEN ${current.method.mixing.history}`);
    lines.push("      &END MIXING");
  }
  if (current.method.smearing.enabled) {
    lines.push("      &SMEAR");
    lines.push("        METHOD FERMI_DIRAC");
    lines.push(`        ELECTRON_TEMPERATURE ${current.method.smearing.tempK}`);
    lines.push("      &END SMEAR");
  }
  lines.push("    &END SCF");
  lines.push("    &POISSON");
  lines.push(`      PERIODIC ${systemType === "bulk" ? "XYZ" : "NONE"}  # boundary conditions`);
  if (systemType !== "bulk") {
    lines.push("      POISSON_SOLVER WAVELET  # recommended for isolated systems");
  }
  lines.push("    &END POISSON");
  lines.push("    &XC");
  lines.push(`      # Exchange-correlation: ${xcFunctional} with D3 dispersion`);
  lines.push(`      &XC_FUNCTIONAL ${xcFunctional}`);
  lines.push("      &END XC_FUNCTIONAL");
  lines.push("      &VDW_POTENTIAL");
  lines.push("        POTENTIAL_TYPE PAIR_POTENTIAL");
  lines.push("        &PAIR_POTENTIAL");
  lines.push("          TYPE DFTD3(BJ)");
  lines.push(`          REFERENCE_FUNCTIONAL ${xcFunctional}`);
  lines.push("          PARAMETER_FILE_NAME dftd3.dat");
  lines.push("        &END PAIR_POTENTIAL");
  lines.push("      &END VDW_POTENTIAL");
  lines.push("    &END XC");
  if (systemType === "bulk") {
    lines.push("    &KPOINTS");
    if (current.method.kpoints.scheme === "MONKHORST-PACK") {
      lines.push(`      SCHEME MONKHORST-PACK ${current.method.kpoints.nx} ${current.method.kpoints.ny} ${current.method.kpoints.nz}`);
    } else {
      lines.push("      SCHEME GAMMA");
    }
    lines.push("    &END KPOINTS");
  }
  lines.push("");
  lines.push("    &SUBSYS");
  if (systemType === "bulk") {
    const { Lx, Ly, Lz } = current.structure.cell;
    lines.push("      # Orthorhombic unit cell provided by user");
    lines.push("      &CELL");
    if ([Lx, Ly, Lz].every((v) => Number.isFinite(v))) {
      lines.push(`        ABC ${Lx} ${Ly} ${Lz}`);
    } else {
      lines.push("        # TODO: provide cell lengths (ABC)");
    }
    lines.push("        PERIODIC XYZ");
    lines.push("      &END CELL");
  } else {
    lines.push("      # Non-periodic system; handled via Poisson solver");
  }
  lines.push("      &COORD");
  lines.push("        UNIT ANGSTROM");
  lines.push(formatCoordinates(current.structure.atoms));
  lines.push("      &END COORD");

  const kinds = current.structure.elements.length ? current.structure.elements : ["H"];
  kinds.forEach((el) => {
    lines.push(`      &KIND ${el}`);
    lines.push(`        BASIS_SET ${basisChoice.basis}`);
    lines.push(`        POTENTIAL ${basisChoice.potential}`);
    lines.push("      &END KIND");
  });

  lines.push("    &END SUBSYS");
  lines.push("");
  lines.push("    &PRINT");
  lines.push("      &ENERGY");
  lines.push("        ADD_LAST NUMERIC");
  lines.push("        &EACH");
  lines.push(`          ${workflow === "nvt_md" ? "MD" : "QS"} ${current.output.energyFreq}`);
  lines.push("        &END EACH");
  lines.push("      &END ENERGY");
  if (current.output.forceFreq > 0) {
    lines.push("      &FORCES");
    lines.push("        FILENAME forces");
    lines.push("        &EACH");
    lines.push(`          ${workflow === "nvt_md" ? "MD" : "QS"} ${current.output.forceFreq}`);
    lines.push("        &END EACH");
    lines.push("      &END FORCES");
  }
  if (current.output.stressFreq > 0) {
    lines.push("      &STRESS");
    lines.push("        &EACH");
    lines.push(`          ${workflow === "nvt_md" ? "MD" : "QS"} ${current.output.stressFreq}`);
    lines.push("        &END EACH");
    lines.push("      &END STRESS");
  }
  lines.push("    &END PRINT");
  lines.push("  &END DFT");
  lines.push("");
  lines.push("&END FORCE_EVAL");

  if (workflow === "nvt_md") {
    lines.push("");
    lines.push("# ==== MOTION (NVT MD) ====");
    lines.push("&MOTION");
    lines.push("  &MD");
    lines.push("    ENSEMBLE NVT");
    lines.push(`    STEPS ${current.run.nsteps}`);
    lines.push(`    TIMESTEP ${current.run.timestepFs}  # fs`);
    lines.push(`    TEMPERATURE ${current.run.temperatureK}`);
    lines.push("    &THERMOSTAT");
    lines.push(`      TYPE ${current.run.thermostat.type}`);
    if (current.run.thermostat.type === "NOSE") {
      lines.push("      &NOSE");
      lines.push(`        TIMECON ${current.run.thermostat.timeConstantFs}`);
      lines.push("        LENGTH 3");
      lines.push("      &END NOSE");
    } else {
      lines.push("      &CSVR");
      lines.push(`        TIMECON ${current.run.thermostat.timeConstantFs}`);
      lines.push("      &END CSVR");
    }
    lines.push("    &END THERMOSTAT");
    lines.push("    &INITIAL_VELOCITY");
    lines.push(`      TYPE ${current.run.velInit}`);
    if (current.run.velInit === "MAXWELL") {
      lines.push(`      TEMPERATURE ${current.run.temperatureK}`);
    }
    lines.push(`      SEED ${current.run.velSeed}`);
    lines.push("    &END INITIAL_VELOCITY");
    lines.push("  &END MD");
    lines.push("  &PRINT");
    lines.push("    &TRAJECTORY");
    lines.push("      FORMAT XYZ");
    lines.push("      &EACH");
    lines.push(`        MD ${current.output.trajFreq}`);
    lines.push("      &END EACH");
    lines.push("    &END TRAJECTORY");
    lines.push("    &RESTART");
    lines.push("      BACKUP_COPIES 2");
    lines.push("      &EACH");
    lines.push(`        MD ${current.output.restartFreq}`);
    lines.push("      &END EACH");
    lines.push("    &END RESTART");
    lines.push("  &END PRINT");
    lines.push("&END MOTION");
  }

  lines.push("");
  lines.push("# ==== END OF INPUT ====");
  return lines.join("\n");
}

function updateStructureSummary() {
  const atoms = state.structure.atoms;
  const countEl = document.getElementById("struct-atom-count");
  const elementsEl = document.getElementById("struct-elements");
  if (countEl) countEl.textContent = atoms.length ? atoms.length : "-";
  if (elementsEl) elementsEl.textContent = state.structure.elements.length ? state.structure.elements.join(", ") : "-";
}

function copyToClipboard(text) {
  if (!navigator.clipboard) return Promise.reject(new Error("Clipboard not supported"));
  return navigator.clipboard.writeText(text);
}

function downloadText(text, filename) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}
