(() => {
  "use strict";

  const SQRT3 = Math.sqrt(3);
  const EPSILON = 1e-8;
  const INDEX_LIMIT = 8;

  const vector = {
    add: (a, b) => a.map((value, index) => value + b[index]),
    subtract: (a, b) => a.map((value, index) => value - b[index]),
    scale: (a, amount) => a.map(value => value * amount),
    dot: (a, b) => a.reduce((sum, value, index) => sum + value * b[index], 0),
    cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    length: a => Math.hypot(...a),
    normalise(a) {
      const length = this.length(a);
      return length < EPSILON ? [0, 0, 0] : this.scale(a, 1 / length);
    },
    combine(coefficients, basis) {
      return coefficients.reduce((result, coefficient, index) => this.add(result, this.scale(basis[index], coefficient)), [0, 0, 0]);
    }
  };

  const LATTICES = {
    fcc: {
      label: "FCC",
      system: "cubic",
      defaults: {a: 3.61},
      geometry: ({a}) => ({
        primitive: [[0, a / 2, a / 2], [a / 2, 0, a / 2], [a / 2, a / 2, 0]],
        basis: [[0, 0, 0]], nearest: a / Math.sqrt(2)
      })
    },
    bcc: {
      label: "BCC",
      system: "cubic",
      defaults: {a: 2.87},
      geometry: ({a}) => ({
        primitive: [[-a / 2, a / 2, a / 2], [a / 2, -a / 2, a / 2], [a / 2, a / 2, -a / 2]],
        basis: [[0, 0, 0]], nearest: a * Math.sqrt(3) / 2
      })
    },
    hcp: {
      label: "HCP",
      system: "hexagonal",
      defaults: {a: 3.21, c: 5.21},
      geometry: ({a, c}) => ({
        primitive: [[a, 0, 0], [-a / 2, SQRT3 * a / 2, 0], [0, 0, c]],
        basis: [[0, 0, 0], [a / 2, SQRT3 * a / 6, c / 2]],
        nearest: Math.min(a, c, Math.hypot(a / SQRT3, c / 2))
      })
    },
    sc: {
      label: "SC",
      system: "cubic",
      defaults: {a: 3.35},
      geometry: ({a}) => ({
        primitive: [[a, 0, 0], [0, a, 0], [0, 0, a]],
        basis: [[0, 0, 0]], nearest: a
      })
    },
    sh: {
      label: "SH",
      system: "hexagonal",
      defaults: {a: 2.70, c: 4.40},
      geometry: ({a, c}) => ({
        primitive: [[a, 0, 0], [-a / 2, SQRT3 * a / 2, 0], [0, 0, c]],
        basis: [[0, 0, 0]], nearest: Math.min(a, c)
      })
    },
    bct: {
      label: "BCT",
      system: "tetragonal",
      defaults: {a: 3.25, c: 4.95},
      geometry: ({a, c}) => ({
        primitive: [[-a / 2, a / 2, c / 2], [a / 2, -a / 2, c / 2], [a / 2, a / 2, -c / 2]],
        basis: [[0, 0, 0]], nearest: Math.min(a, c, Math.sqrt(2 * a * a + c * c) / 2)
      })
    }
  };

  const latticeGeometry = (lattice, parameters = {}) => {
    const definition = LATTICES[lattice];
    if (!definition) throw new Error(`Unknown lattice: ${lattice}.`);
    const a = Number.isFinite(parameters.a) ? parameters.a : definition.defaults.a;
    const c = Number.isFinite(parameters.c) ? parameters.c : (definition.defaults.c || a);
    return {...definition, ...definition.geometry({a, c}), a, c};
  };

  const CATALOGUE = {
    fcc: {
      "1,0,0": "fcc-100", "1,1,0": "fcc-110", "1,1,1": "fcc-111",
      "2,1,0": "fcc-210", "2,1,1": "fcc-211", "2,2,1": "fcc-221",
      "3,1,0": "fcc-310", "3,1,1": "fcc-311", "3,3,1": "fcc-331", "5,1,1": "fcc-511"
    },
    bcc: {
      "1,0,0": "bcc-100", "1,1,0": "bcc-110", "1,1,1": "bcc-111",
      "2,1,0": "bcc-210", "2,1,1": "bcc-211", "3,1,0": "bcc-310"
    },
    hcp: {
      "0,0,1": "hcp-0001", "1,0,0": "hcp-10m10", "1,1,0": "hcp-11m20",
      "1,0,1": "hcp-10m11", "1,0,2": "hcp-10m12", "1,1,1": "hcp-11m21"
    },
    sc: {
      "1,0,0": "sc-100", "1,1,0": "sc-110", "1,1,1": "sc-111",
      "2,1,0": "sc-210", "2,1,1": "sc-211"
    },
    sh: {
      "0,0,1": "sh-0001", "1,0,0": "sh-10m10", "1,1,0": "sh-11m20",
      "1,0,1": "sh-10m11"
    },
    bct: {
      "0,0,1": "bct-001", "1,0,0": "bct-100", "1,1,0": "bct-110",
      "1,0,1": "bct-101", "1,1,1": "bct-111", "2,1,1": "bct-211"
    }
  };

  const absoluteGcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a;
  };

  const gcdMany = values => values.reduce((result, value) => absoluteGcd(result, value), 0) || 1;

  const normaliseIndices = indices => {
    const divisor = gcdMany(indices);
    return indices.map(value => value / divisor);
  };

  const validateEditableIndices = indices => {
    if (!Array.isArray(indices) || indices.length !== 3 || indices.some(value => !Number.isInteger(value))) throw new Error("Enter an integer for every editable index.");
    if (indices.some(value => value < -INDEX_LIMIT || value > INDEX_LIMIT)) throw new Error(`Editable indices must stay between −${INDEX_LIMIT} and +${INDEX_LIMIT}.`);
    if (indices.every(value => value === 0)) throw new Error("The all-zero plane is undefined. Make at least one index nonzero.");
    return indices;
  };

  const reciprocalNormal = (lattice, indices, parameters = {}) => {
    const latticeData = latticeGeometry(lattice, parameters);
    if (latticeData.system === "cubic") return indices.map(value => value / latticeData.a);
    if (latticeData.system === "tetragonal") {
      return [indices[0] / latticeData.a, indices[1] / latticeData.a, indices[2] / latticeData.c];
    }
    const [a1, a2, a3] = latticeData.primitive;
    const volume = vector.dot(a1, vector.cross(a2, a3));
    const reciprocal = [
      vector.scale(vector.cross(a2, a3), 1 / volume),
      vector.scale(vector.cross(a3, a1), 1 / volume),
      vector.scale(vector.cross(a1, a2), 1 / volume)
    ];
    return vector.combine(indices, reciprocal);
  };

  const primitivePlaneCoefficients = (lattice, [h, k, l]) => {
    let coefficients;
    if (lattice === "fcc") coefficients = [k + l, h + l, h + k];
    else if (lattice === "bcc" || lattice === "bct") coefficients = [-h + k + l, h - k + l, h + k - l];
    else coefficients = [h, k, l];
    const divisor = gcdMany(coefficients);
    return coefficients.map(value => value / divisor);
  };

  const canonicalCoefficient = coefficients => {
    const first = coefficients.find(value => value !== 0);
    return first > 0;
  };

  const integerCross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];

  const equalIntegers = (a, b) => a.every((value, index) => value === b[index]);

  const reduceSurfacePair = (first, second) => {
    let u = {coefficients: [...first.coefficients], cartesian: [...first.cartesian]};
    let v = {coefficients: [...second.coefficients], cartesian: [...second.cartesian]};
    for (let iteration = 0; iteration < 16; iteration += 1) {
      if (vector.length(v.cartesian) < vector.length(u.cartesian)) [u, v] = [v, u];
      const multiple = Math.round(vector.dot(u.cartesian, v.cartesian) / vector.dot(u.cartesian, u.cartesian));
      if (!multiple) break;
      v = {
        coefficients: v.coefficients.map((value, index) => value - multiple * u.coefficients[index]),
        cartesian: vector.subtract(v.cartesian, vector.scale(u.cartesian, multiple))
      };
    }
    if (vector.dot(u.cartesian, v.cartesian) < 0) {
      const candidate = {
        coefficients: v.coefficients.map((value, index) => value + u.coefficients[index]),
        cartesian: vector.add(v.cartesian, u.cartesian)
      };
      if (vector.length(candidate.cartesian) <= vector.length(v.cartesian) + 1e-8) v = candidate;
    }
    return [u, v];
  };

  const findSurfaceTranslations = (lattice, indices, parameters = {}) => {
    const primitive = latticeGeometry(lattice, parameters).primitive;
    const planeCoefficients = primitivePlaneCoefficients(lattice, indices);
    const range = Math.max(5, Math.max(...planeCoefficients.map(Math.abs)) + 2);
    const candidates = [];
    for (let x = -range; x <= range; x += 1) {
      for (let y = -range; y <= range; y += 1) {
        for (let z = -range; z <= range; z += 1) {
          const coefficients = [x, y, z];
          if ((!x && !y && !z) || vector.dot(coefficients, planeCoefficients) !== 0 || !canonicalCoefficient(coefficients)) continue;
          const cartesian = vector.combine(coefficients, primitive);
          candidates.push({coefficients, cartesian, length: vector.length(cartesian)});
        }
      }
    }
    candidates.sort((a, b) => a.length - b.length);
    const limit = Math.min(candidates.length, 500);
    let pair = null;
    for (let i = 0; i < limit && !pair; i += 1) {
      for (let j = i + 1; j < limit; j += 1) {
        const cross = integerCross(candidates[i].coefficients, candidates[j].coefficients);
        if (equalIntegers(cross, planeCoefficients)) {
          pair = [candidates[i], candidates[j]];
          break;
        }
        if (equalIntegers(cross, planeCoefficients.map(value => -value))) {
          pair = [candidates[i], {
            coefficients: candidates[j].coefficients.map(value => -value),
            cartesian: candidates[j].cartesian.map(value => -value)
          }];
          break;
        }
      }
    }
    if (!pair) {
      const first = candidates[0];
      const second = candidates.find(candidate => vector.length(vector.cross(first.cartesian, candidate.cartesian)) > EPSILON);
      if (!first || !second) throw new Error("Could not construct an in-plane surface cell.");
      pair = [first, second];
    }
    let [u, v] = reduceSurfacePair(...pair);
    const physicalNormal = reciprocalNormal(lattice, indices, parameters);
    if (vector.dot(vector.cross(u.cartesian, v.cartesian), physicalNormal) < 0) {
      v = {coefficients: v.coefficients.map(value => -value), cartesian: v.cartesian.map(value => -value)};
    }
    return {u, v, planeCoefficients};
  };

  const extendedGcd = (a, b) => {
    if (b === 0) return [a, 1, 0];
    const [gcd, x1, y1] = extendedGcd(b, a % b);
    return [gcd, y1, x1 - Math.trunc(a / b) * y1];
  };

  const bezoutVector = coefficients => {
    const signs = coefficients.map(value => value < 0 ? -1 : 1);
    const values = coefficients.map(Math.abs);
    const [gcd01, x01, y01] = extendedGcd(values[0], values[1]);
    const [gcdAll, scale01, z] = extendedGcd(gcd01, values[2]);
    if (gcdAll !== 1) throw new Error("Plane coefficients are not primitive.");
    return [scale01 * x01 * signs[0], scale01 * y01 * signs[1], z * signs[2]];
  };

  const wrapUnit = value => ((value % 1) + 1) % 1;

  const uniqueLevels = records => {
    const levels = [];
    records.forEach(record => {
      if (!levels.some(level => Math.abs(level - record.z) < 1e-6)) levels.push(record.z);
    });
    return levels.sort((a, b) => b - a);
  };

  const createSurfaceGeometry = ({lattice, indices, offset, a, c}) => {
    const parameters = {a, c};
    const latticeData = latticeGeometry(lattice, parameters);
    const physicalNormal = reciprocalNormal(lattice, indices, parameters);
    const normalLength = vector.length(physicalNormal);
    const normal = vector.scale(physicalNormal, 1 / normalLength);
    const spacing = 1 / normalLength;
    const {u, v, planeCoefficients} = findSurfaceTranslations(lattice, indices, parameters);
    const transverseCoefficients = bezoutVector(planeCoefficients);
    const transverse = vector.combine(transverseCoefficients, latticeData.primitive);
    const e1 = vector.normalise(u.cartesian);
    let e2 = vector.normalise(vector.subtract(v.cartesian, vector.scale(e1, vector.dot(v.cartesian, e1))));
    if (vector.dot(vector.cross(e1, e2), normal) < 0) e2 = vector.scale(e2, -1);
    const u2 = [vector.length(u.cartesian), 0];
    const v2 = [vector.dot(v.cartesian, e1), vector.dot(v.cartesian, e2)];
    if (v2[1] < 0) {
      v2[0] *= -1;
      v2[1] *= -1;
    }
    const determinant = u2[0] * v2[1];
    const cutLevel = (offset - .5) * spacing + 1e-7;
    const records = [];
    for (let layer = -24; layer <= 24; layer += 1) {
      const translation = vector.scale(transverse, layer);
      latticeData.basis.forEach(basis => {
        const point = vector.add(translation, basis);
        const projectedX = vector.dot(point, e1);
        const projectedY = vector.dot(point, e2);
        const alpha = (projectedX * v2[1] - projectedY * v2[0]) / determinant;
        const beta = projectedY / v2[1];
        const baseAlpha = wrapUnit(alpha);
        const baseBeta = wrapUnit(beta);
        const height = vector.dot(point, normal);
        for (let repeatU = 0; repeatU < 3; repeatU += 1) {
          for (let repeatV = 0; repeatV < 3; repeatV += 1) {
            const fractionalU = baseAlpha + repeatU;
            const fractionalV = baseBeta + repeatV;
            records.push({
              x: fractionalU * u2[0] + fractionalV * v2[0],
              y: fractionalV * v2[1],
              z: height,
              fu: fractionalU,
              fv: fractionalV
            });
          }
        }
      });
    }
    const belowCut = records.filter(record => record.z <= cutLevel);
    const levels = uniqueLevels(belowCut).slice(0, 6);
    if (!levels.length) throw new Error("No atomic layers intersect the selected viewing window.");
    const deduplicated = new Map();
    belowCut.forEach(record => {
      const layer = levels.findIndex(level => Math.abs(level - record.z) < 1e-6);
      if (layer < 0) return;
      const key = `${record.x.toFixed(6)},${record.y.toFixed(6)},${record.z.toFixed(6)}`;
      deduplicated.set(key, {...record, layer});
    });
    const internalAtoms = [...deduplicated.values()];
    const atoms = internalAtoms.map(({x, y, z, layer}) => ({x, y, z, layer}));
    const bonds = [];
    for (let first = 0; first < atoms.length; first += 1) {
      for (let second = first + 1; second < atoms.length; second += 1) {
        const distance = Math.hypot(atoms[first].x - atoms[second].x, atoms[first].y - atoms[second].y, atoms[first].z - atoms[second].z);
        if (distance > .08 && distance < latticeData.nearest * 1.12) bonds.push([first, second]);
      }
    }
    const sites = findCandidateSites(internalAtoms, {u2, v2, nearest: latticeData.nearest, levels});
    const top = levels[0];
    const corner = (fu, fv) => [fu * u2[0] + fv * v2[0], fv * v2[1], top + .02];
    return {
      payload: {
        surface: `${lattice}-${indices.join("")}`,
        crystal: lattice.toUpperCase(),
        element: latticeData.label,
        candidateSites: true,
        atoms,
        bonds,
        sites,
        cell: [corner(1, 1), corner(2, 1), corner(2, 2), corner(1, 2)]
      },
      metrics: {
        spacing,
        surfaceLengths: [vector.length(u.cartesian), vector.length(v.cartesian)],
        surfaceAngle: Math.acos(Math.max(-1, Math.min(1, vector.dot(u.cartesian, v.cartesian) / (vector.length(u.cartesian) * vector.length(v.cartesian))))) * 180 / Math.PI,
        layerCount: levels.length,
        normal,
        cutLevel
      }
    };
  };

  const fractionalCoordinates = (x, y, u2, v2) => {
    const beta = y / v2[1];
    return [(x - beta * v2[0]) / u2[0], beta];
  };

  const inCentralCell = ([u, v], margin = 0) => u >= 1 + margin && u < 2 - margin && v >= 1 + margin && v < 2 - margin;

  const deduplicateSites = (sites, tolerance) => {
    const unique = [];
    sites.forEach(site => {
      if (!unique.some(known => known.kind === site.kind && Math.hypot(known.x - site.x, known.y - site.y) < tolerance)) unique.push(site);
    });
    return unique;
  };

  const circumcentre = (a, b, c) => {
    const denominator = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
    if (Math.abs(denominator) < 1e-8) return null;
    const aa = a.x * a.x + a.y * a.y;
    const bb = b.x * b.x + b.y * b.y;
    const cc = c.x * c.x + c.y * c.y;
    return {
      x: (aa * (b.y - c.y) + bb * (c.y - a.y) + cc * (a.y - b.y)) / denominator,
      y: (aa * (c.x - b.x) + bb * (a.x - c.x) + cc * (b.x - a.x)) / denominator
    };
  };

  function findCandidateSites(atoms, {u2, v2, nearest}) {
    const exposed = atoms.filter(atom => atom.layer < 3);
    const centreX = 1.5 * u2[0] + 1.5 * v2[0];
    const centreY = 1.5 * v2[1];
    const byCentre = (a, b) => Math.hypot(a.x - centreX, a.y - centreY) - Math.hypot(b.x - centreX, b.y - centreY);
    const ontop = exposed.filter(atom => inCentralCell([atom.fu, atom.fv]))
      .map(atom => ({kind: "ontop", label: "ontop candidate", x: atom.x, y: atom.y, z: atom.z + .32 * nearest}))
      .sort(byCentre).slice(0, 12);

    const bridgeCandidates = [];
    for (let first = 0; first < exposed.length; first += 1) {
      for (let second = first + 1; second < exposed.length; second += 1) {
        const a = exposed[first];
        const b = exposed[second];
        const distance = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
        if (distance < .15 || distance > nearest * 1.12) continue;
        const x = (a.x + b.x) / 2;
        const y = (a.y + b.y) / 2;
        if (!inCentralCell(fractionalCoordinates(x, y, u2, v2))) continue;
        bridgeCandidates.push({kind: "bridge", label: "bridge candidate", x, y, z: Math.max(a.z, b.z) + .32 * nearest});
      }
    }
    const bridges = deduplicateSites(bridgeCandidates, nearest * .08).sort(byCentre).slice(0, 20);

    const hollowCandidates = [];
    for (let layer = 0; layer < 3; layer += 1) {
      const triangulationPool = exposed.filter(atom => atom.layer === layer && atom.fu > -.05 && atom.fu < 3.05 && atom.fv > -.05 && atom.fv < 3.05).slice(0, 90);
      for (let a = 0; a < triangulationPool.length; a += 1) {
        for (let b = a + 1; b < triangulationPool.length; b += 1) {
          for (let c = b + 1; c < triangulationPool.length; c += 1) {
            const centre = circumcentre(triangulationPool[a], triangulationPool[b], triangulationPool[c]);
            if (!centre) continue;
            const radius = Math.hypot(centre.x - triangulationPool[a].x, centre.y - triangulationPool[a].y);
            if (radius < nearest * .25 || radius > nearest * 1.35 || !inCentralCell(fractionalCoordinates(centre.x, centre.y, u2, v2), .02)) continue;
            const hasInteriorAtom = triangulationPool.some((atom, index) => ![a, b, c].includes(index) && Math.hypot(atom.x - centre.x, atom.y - centre.y) < radius - nearest * .045);
            if (hasInteriorAtom) continue;
            const neighbours = triangulationPool.filter(atom => Math.abs(Math.hypot(atom.x - centre.x, atom.y - centre.y) - radius) < Math.max(nearest * .055, radius * .075));
            if (neighbours.length < 3) continue;
            const coordination = Math.min(8, neighbours.length);
            hollowCandidates.push({
              kind: "hollow",
              label: `${coordination}-fold hollow candidate`,
              coordination,
              x: centre.x,
              y: centre.y,
              z: Math.max(...neighbours.map(atom => atom.z)) + .32 * nearest
            });
          }
        }
      }
    }
    const hollows = deduplicateSites(hollowCandidates, nearest * .10).sort(byCentre).slice(0, 12);
    return [...ontop, ...bridges, ...hollows].map((site, index) => ({...site, marker: index + 1}));
  }

  const bulkPolyhedron = (lattice, parameters = {}) => {
    const latticeData = latticeGeometry(lattice, parameters);
    if (latticeData.system !== "hexagonal") {
      const vertices = [];
      const height = latticeData.system === "tetragonal" ? latticeData.c : latticeData.a;
      for (const z of [0, height]) for (const y of [0, latticeData.a]) for (const x of [0, latticeData.a]) vertices.push([x, y, z]);
      const edges = [];
      for (let first = 0; first < vertices.length; first += 1) {
        for (let second = first + 1; second < vertices.length; second += 1) {
          if (vertices[first].filter((value, index) => Math.abs(value - vertices[second][index]) > .1).length === 1) edges.push([first, second]);
        }
      }
      const atoms = [...vertices];
      const halfA = latticeData.a / 2;
      if (lattice === "fcc") {
        atoms.push(
          [halfA, halfA, 0], [halfA, halfA, height],
          [halfA, 0, height / 2], [halfA, latticeData.a, height / 2],
          [0, halfA, height / 2], [latticeData.a, halfA, height / 2]
        );
      } else if (lattice === "bcc" || lattice === "bct") atoms.push([halfA, halfA, height / 2]);
      return {vertices, edges, atoms};
    }
    const basal = Array.from({length: 6}, (_, index) => {
      const angle = index * Math.PI / 3;
      return [latticeData.a / SQRT3 * Math.cos(angle), latticeData.a / SQRT3 * Math.sin(angle)];
    });
    const vertices = [];
    for (const z of [0, latticeData.c]) basal.forEach(([x, y]) => vertices.push([x, y, z]));
    const edges = [];
    for (let layer = 0; layer < 2; layer += 1) for (let index = 0; index < 6; index += 1) edges.push([layer * 6 + index, layer * 6 + (index + 1) % 6]);
    for (let index = 0; index < 6; index += 1) edges.push([index, index + 6]);
    const atoms = [...vertices, [0, 0, 0], [0, 0, latticeData.c]];
    if (lattice === "hcp") {
      for (let index = 0; index < 3; index += 1) {
        const angle = index * 2 * Math.PI / 3 + Math.PI / 3;
        atoms.push([latticeData.a / 3 * Math.cos(angle), latticeData.a / 3 * Math.sin(angle), latticeData.c / 2]);
      }
    }
    return {vertices, edges, atoms};
  };

  const planePolygon = (vertices, edges, normal, offset) => {
    const values = vertices.map(point => vector.dot(point, normal) - offset);
    const points = [];
    edges.forEach(([first, second]) => {
      const p = vertices[first];
      const q = vertices[second];
      const dp = values[first];
      const dq = values[second];
      if (Math.abs(dp) < EPSILON) points.push(p);
      if (dp * dq < -EPSILON) points.push(vector.add(p, vector.scale(vector.subtract(q, p), -dp / (dq - dp))));
    });
    const unique = [];
    points.forEach(point => {
      if (!unique.some(known => vector.length(vector.subtract(point, known)) < 1e-6)) unique.push(point);
    });
    if (unique.length < 3) return unique;
    const centroid = unique.reduce((sum, point) => vector.add(sum, point), [0, 0, 0]).map(value => value / unique.length);
    const reference = Math.abs(normal[2]) < .9 ? [0, 0, 1] : [1, 0, 0];
    const u = vector.normalise(vector.cross(normal, reference));
    const v = vector.cross(normal, u);
    return unique.sort((a, b) => Math.atan2(vector.dot(vector.subtract(a, centroid), v), vector.dot(vector.subtract(a, centroid), u)) - Math.atan2(vector.dot(vector.subtract(b, centroid), v), vector.dot(vector.subtract(b, centroid), u)));
  };

  class BulkCutView {
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d");
      this.resizeObserver = new ResizeObserver(() => this.render());
      this.resizeObserver.observe(canvas.parentElement);
    }

    setState(state) {
      this.state = state;
      this.render();
    }

    project(point) {
      return [(point[0] - point[1]) * .86, point[2] + (point[0] + point[1]) * .38, point[0] + point[1] - .35 * point[2]];
    }

    render() {
      if (!this.state) return;
      const {lattice, indices, offset, a, c} = this.state;
      const parameters = {a, c};
      const geometry = bulkPolyhedron(lattice, parameters);
      const rawNormal = reciprocalNormal(lattice, indices, parameters);
      const normal = vector.normalise(rawNormal);
      const spacing = 1 / vector.length(rawNormal);
      const centroid = geometry.vertices.reduce((sum, point) => vector.add(sum, point), [0, 0, 0]).map(value => value / geometry.vertices.length);
      const centreOffset = vector.dot(centroid, normal);
      const atomicOffsets = [...new Set(geometry.atoms.map(atom => vector.dot(atom, normal).toFixed(7)))].map(Number);
      const baseOffset = atomicOffsets.reduce((best, value) => Math.abs(value - centreOffset) < Math.abs(best - centreOffset) ? value : best, atomicOffsets[0]);
      const planeOffset = baseOffset + (offset - .5) * spacing;
      const polygon = planePolygon(geometry.vertices, geometry.edges, normal, planeOffset);
      const rect = this.canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const ratio = Math.min(devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(width * ratio);
      this.canvas.height = Math.round(height * ratio);
      const ctx = this.context;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const projectedVertices = geometry.vertices.map(point => this.project(point));
      const allProjected = projectedVertices.concat(polygon.map(point => this.project(point)));
      const minX = Math.min(...allProjected.map(point => point[0]));
      const maxX = Math.max(...allProjected.map(point => point[0]));
      const minY = Math.min(...allProjected.map(point => point[1]));
      const maxY = Math.max(...allProjected.map(point => point[1]));
      const scale = Math.min(width * .72 / Math.max(maxX - minX, .1), height * .72 / Math.max(maxY - minY, .1));
      const map = point => ({x: width / 2 + (point[0] - (minX + maxX) / 2) * scale, y: height / 2 - (point[1] - (minY + maxY) / 2) * scale, depth: point[2]});
      if (polygon.length >= 3) {
        const screen = polygon.map(point => map(this.project(point)));
        ctx.beginPath();
        screen.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
        ctx.closePath();
        ctx.fillStyle = "rgba(216,95,69,.25)";
        ctx.fill();
        ctx.strokeStyle = "#d85f45";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.strokeStyle = "#8ca29e";
      ctx.lineWidth = 1.25;
      geometry.edges.forEach(([first, second]) => {
        const a = map(projectedVertices[first]);
        const b = map(projectedVertices[second]);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      geometry.atoms.map(atom => ({atom, projected: this.project(atom)})).sort((a, b) => a.projected[2] - b.projected[2]).forEach(({atom, projected}) => {
        const point = map(projected);
        const intersects = Math.abs(vector.dot(atom, normal) - planeOffset) < spacing * .035;
        ctx.beginPath(); ctx.arc(point.x, point.y, intersects ? 8 : 7, 0, Math.PI * 2);
        ctx.fillStyle = intersects ? "#176b72" : "#ffffff"; ctx.fill();
        ctx.strokeStyle = intersects ? "#ffffff" : "#176b72"; ctx.lineWidth = 1.5; ctx.stroke();
      });
      if (polygon.length >= 3) {
        const centre = polygon.reduce((sum, point) => vector.add(sum, point), [0, 0, 0]).map(value => value / polygon.length);
        const start = map(this.project(centre));
        const end = map(this.project(vector.add(centre, vector.scale(normal, .55))));
        ctx.strokeStyle = "#173033"; ctx.fillStyle = "#173033"; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        ctx.beginPath(); ctx.moveTo(end.x, end.y); ctx.lineTo(end.x - 8 * Math.cos(angle - .45), end.y - 8 * Math.sin(angle - .45)); ctx.lineTo(end.x - 8 * Math.cos(angle + .45), end.y - 8 * Math.sin(angle + .45)); ctx.closePath(); ctx.fill();
        ctx.font = "700 11px Inter, system-ui, sans-serif"; ctx.fillText("normal", end.x + 7, end.y - 5);
      }
    }
  }

  const catalogueMatch = (lattice, indices) => {
    let key;
    if (LATTICES[lattice].system === "hexagonal") key = indices.map(Math.abs).join(",");
    else if (LATTICES[lattice].system === "tetragonal") {
      const [h, k, l] = indices.map(Math.abs);
      key = [Math.max(h, k), Math.min(h, k), l].join(",");
    } else key = indices.map(Math.abs).sort((a, b) => b - a).join(",");
    return CATALOGUE[lattice][key] || null;
  };

  const formatPlane = (lattice, [h, k, l]) => LATTICES[lattice].system === "hexagonal" ? `(${h} ${k} ${-(h + k)} ${l})` : `(${h} ${k} ${l})`;

  class SurfaceBuilder {
    constructor(root) {
      this.root = root;
      this.form = root.querySelector("form");
      this.inputs = Object.fromEntries(["h", "k", "i", "l", "a", "c", "offset"].map(name => [name, root.querySelector(`[name="${name}"]`)]));
      this.error = root.querySelector("[data-builder-error]");
      this.normalisedOutput = root.querySelector("[data-normalised-plane]");
      this.spacingOutput = root.querySelector("[data-spacing]");
      this.cellOutput = root.querySelector("[data-cell]");
      this.atomOutput = root.querySelector("[data-atom-count]");
      this.offsetOutput = root.querySelector("[data-offset-value]");
      this.catalogueLink = root.querySelector("[data-catalogue-link]");
      this.hcpIndex = root.querySelector("[data-hcp-index]");
      this.cParameter = root.querySelector("[data-c-parameter]");
      this.cutView = new BulkCutView(root.querySelector("[data-bulk-cut-canvas]"));
      this.viewer = new window.SurfaceViewer(root.querySelector(".surface-viewer"));
      this.debounceTimer = null;
      this.bind();
      this.restoreFromUrl();
      this.generate({resetOffset: false});
    }

    get lattice() {
      return this.form.elements.lattice.value;
    }

    bind() {
      this.form.addEventListener("submit", event => event.preventDefault());
      this.form.querySelectorAll('[name="lattice"]').forEach(input => input.addEventListener("change", () => {
        this.updateLatticeControls(true);
        this.inputs.offset.value = .5;
        this.schedule(true);
      }));
      [this.inputs.h, this.inputs.k, this.inputs.l].forEach(input => input.addEventListener("input", () => {
        this.updateDerivedIndex();
        this.inputs.offset.value = .5;
        this.schedule(true);
      }));
      [this.inputs.a, this.inputs.c].forEach(input => input.addEventListener("input", () => this.schedule(false)));
      this.inputs.offset.addEventListener("input", () => {
        this.offsetOutput.textContent = Number(this.inputs.offset.value).toFixed(2);
        this.schedule(false, 35);
      });
      window.addEventListener("popstate", () => {
        this.restoreFromUrl();
        this.generate({resetOffset: false, updateUrl: false});
      });
    }

    updateLatticeControls(resetParameters = false) {
      const definition = LATTICES[this.lattice];
      const usesC = definition.system !== "cubic";
      this.hcpIndex.hidden = definition.system !== "hexagonal";
      this.cParameter.hidden = !usesC;
      if (resetParameters) {
        this.inputs.a.value = definition.defaults.a;
        this.inputs.c.value = definition.defaults.c || definition.defaults.a;
      }
      this.updateDerivedIndex();
    }

    updateDerivedIndex() {
      const h = this.inputs.h.value.trim() === "" ? Number.NaN : Number(this.inputs.h.value);
      const k = this.inputs.k.value.trim() === "" ? Number.NaN : Number(this.inputs.k.value);
      this.inputs.i.value = Number.isInteger(h) && Number.isInteger(k) ? -(h + k) : "";
    }

    readState() {
      const indices = [this.inputs.h, this.inputs.k, this.inputs.l].map(input => input.value.trim() === "" ? Number.NaN : Number(input.value));
      validateEditableIndices(indices);
      const a = Number(this.inputs.a.value);
      const usesC = LATTICES[this.lattice].system !== "cubic";
      const c = usesC ? Number(this.inputs.c.value) : a;
      if (!Number.isFinite(a) || a <= 0 || !Number.isFinite(c) || c <= 0) throw new Error("Lattice parameters a and c must be positive numbers.");
      return {lattice: this.lattice, rawIndices: indices, indices: normaliseIndices(indices), a, c, offset: Number(this.inputs.offset.value)};
    }

    schedule(resetOffset, delay = 180) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.generate({resetOffset}), delay);
    }

    generate({resetOffset = false, updateUrl = true} = {}) {
      try {
        if (resetOffset) this.inputs.offset.value = .5;
        const state = this.readState();
        this.error.hidden = true;
        this.updateDerivedIndex();
        const result = createSurfaceGeometry(state);
        this.viewer.setData(result.payload, this.hasGenerated ? {} : {view: "top", zoom: 1.12});
        this.hasGenerated = true;
        this.cutView.setState(state);
        this.normalisedOutput.textContent = `${LATTICES[state.lattice].label}${formatPlane(state.lattice, state.indices)}`;
        this.spacingOutput.textContent = `${result.metrics.spacing.toFixed(3)} Å`;
        this.cellOutput.textContent = `${result.metrics.surfaceLengths[0].toFixed(2)} × ${result.metrics.surfaceLengths[1].toFixed(2)} · ${result.metrics.surfaceAngle.toFixed(1)}°`;
        this.atomOutput.textContent = String(result.payload.atoms.length);
        this.offsetOutput.textContent = state.offset.toFixed(2);
        const match = catalogueMatch(state.lattice, state.indices);
        if (match) {
          this.catalogueLink.href = `${this.root.dataset.baseUrl || ""}/surface-sites/${match}.html`;
          this.catalogueLink.textContent = `Open the detailed ${LATTICES[state.lattice].label}${formatPlane(state.lattice, state.indices)} page →`;
          this.catalogueLink.hidden = false;
        } else this.catalogueLink.hidden = true;
        if (updateUrl) this.updateUrl(state);
      } catch (error) {
        this.error.textContent = error.message;
        this.error.hidden = false;
      }
    }

    updateUrl(state) {
      const url = new URL(window.location.href);
      url.searchParams.set("lattice", state.lattice);
      url.searchParams.set("h", state.rawIndices[0]);
      url.searchParams.set("k", state.rawIndices[1]);
      url.searchParams.set("l", state.rawIndices[2]);
      url.searchParams.set("a", state.a.toFixed(4));
      if (LATTICES[state.lattice].system === "cubic") url.searchParams.delete("c");
      else url.searchParams.set("c", state.c.toFixed(4));
      url.searchParams.set("offset", state.offset.toFixed(3));
      history.replaceState(null, "", url);
    }

    restoreFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const lattice = Object.hasOwn(LATTICES, params.get("lattice")) ? params.get("lattice") : "fcc";
      const radio = this.form.querySelector(`[name="lattice"][value="${lattice}"]`);
      radio.checked = true;
      const fallback = {h: 1, k: 1, l: 1};
      for (const name of ["h", "k", "l"]) {
        const raw = params.get(name);
        const parsed = raw === null || raw.trim() === "" ? Number.NaN : Number(raw);
        this.inputs[name].value = Number.isInteger(parsed) && parsed >= -INDEX_LIMIT && parsed <= INDEX_LIMIT ? parsed : fallback[name];
      }
      const offset = Number.parseFloat(params.get("offset"));
      this.inputs.offset.value = Number.isFinite(offset) ? Math.max(0, Math.min(1, offset)) : .5;
      const definition = LATTICES[lattice];
      const parsedA = Number.parseFloat(params.get("a"));
      const parsedC = Number.parseFloat(params.get("c"));
      this.inputs.a.value = Number.isFinite(parsedA) && parsedA > 0 ? parsedA : definition.defaults.a;
      this.inputs.c.value = Number.isFinite(parsedC) && parsedC > 0 ? parsedC : (definition.defaults.c || definition.defaults.a);
      this.updateLatticeControls();
      this.offsetOutput.textContent = Number(this.inputs.offset.value).toFixed(2);
    }
  }

  window.CrystalSurfaceBuilder = {validateEditableIndices, normaliseIndices, reciprocalNormal, findSurfaceTranslations, createSurfaceGeometry, catalogueMatch};
  document.querySelectorAll("[data-surface-builder]").forEach(root => new SurfaceBuilder(root));
})();
