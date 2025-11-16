---
layout: default
title: "Computing the Radial Distribution Function (RDF) - WORK IN PROGRESS"
tags: [radial distribution function, RDF, g(r), molecular dynamics, MD, tutorial]
description: "Step by step tutorial on how to compute and interpret the radial distribution function g(r) from molecular dynamics trajectories, with examples, quizzes, and implementation tips."
styles:
  - /css/tutorials/rdf.css
---

# {{ page.title }}

The radial distribution function---$g(r)$ or RDF---is a common structural analysis method in molecular simulations. It measures how the local particle density around a reference particle varies with distance, compared to a perfectly uniform reference fluid at the same average density.

---

## 1. Visualizing what the RDF measures

Imagine a single reference particle at the origin, and around it, many random particles.

![Figure 1: Central particle with random neighbors](/assets/tutorials/rdf/rdf_schematic.png){: .default }

Now let's draw a spherical shell of thickness $\Delta r$.

![Figure 2: Central particle with random neighbors and 1 shell of radius \Delta r](/assets/tutorials/rdf/rdf_schematic_with_shell.png){: .default }

So the shell goes from $r$ (inner radius) to $r + \Delta r$ (outer radius). If you count the number of particles inside this sphere, we get a value of **75**. Now, let's add more shells.

![Figure 3: Central particles with evenly colored shells indicating different shell regions](/assets/tutorials/rdf/rdf_schematic_colored_shells.png){: .default }

Each shell now uses the same visual color, so we label them by their radial range instead. If we look at the number of particles in each region:

{: .table-compact }
| Shell range (r) | Number of particles |
|:---------------:|:-------------------:|
| 0.0 – 0.5       | 155                 |
| 0.5 – 1.0       | 470                 |
| 1.0 – 1.5       | 782                 |
| 1.5 – 2.0       | 1093                |


Intuitively, it makes sense that the number of particles is bigger in a sphere with a bigger radius, even though $\Delta r$ remains the same, since the area of the shell becomes bigger for bigger radii. However, it would be useful if we would account for this in the comparison, showing the *direct effect* of the **distance to the particle**, independent of the increase in area size.

For a 2D system, like in the figures above, we can *normalize* our count by the area of the shell:

$$
\text{Normalized count} = \frac{N_{\text{shell}}}{A_{\text{shell}}}
$$

where $N_{\text{shell}}$ is the number of particles in the shell between $r$ and $r + \Delta r$, and $A_{\text{shell}}$ is the area of that shell. The area of the shell can easily be computed as the area of a circle with radius $r + \Delta r$ minus one with a radius of $r$:

$$
A_\text{shell} = (2\pi \cdot (r + \Delta r)) - (2\pi \cdot r)
$$

This normalization leads to the following counts:

{: .table-compact }
| Shell range (r) | Number of particles | Normalized particle count |
|:---------------:|:-------------------:|:-------------------------:|
| 0.0 – 0.5       | 155                 | ~197.35                   |
| 0.5 – 1.0       | 470                 | ~199.47                   |
| 1.0 – 1.5       | 782                 | ~199.13                   |
| 1.5 – 2.0       | 1093                | ~198.81                   |

You might have noticed that the by normalizing, we divide by area and thus compute the **number density**, $\rho_\text{shell}$, of the shell. The last thing we must do to obtain the actual RDF is also divide by the average number density, $\rho$, of the full system.

$$
\rho = \dfrac{N_\text{total}}{V_\text{total}}
$$

This gives us a reference towards the average number density of the whole system.

<div class="interactive-test" data-test-id="rdf-density">
  <p>
    Assume that the <em>local particle density</em> at distance $r$ is <strong>twice</strong> the average density $\rho$.<br>
    What is the corresponding value of the radial distribution function $g(r)$?
  </p>
  <form class="quiz" data-answer="1">

  <div class="quiz-correct hidden">
  **Correct.** The RDF is defined as $\rho_\text{local}$ divided by $\rho$. If the local density is twice the average density, then $g(r) = \frac{\rho_\text{local}}{\rho} = \frac{2\rho}{\rho} = 2.$
  </div>

  <div class="quiz-wrong hidden">
  **Incorrect.** The RDF is defined as $g(r) = \frac{\rho_\text{local}}{\rho}.$ If $\rho_\text{local} = 2\rho$, then $g(r) = \frac{2\rho}{\rho} = 2.$
  </div>

  <label>
    <input type="radio" name="rdf-density" value="0">
    $g(r)$ equals $2\rho$, since the local density equals twice the average density $\rho$.
  </label>

  <label>
    <input type="radio" name="rdf-density" value="1">
    $g(r)$ equals $2$, since the local density equals twice the average density $\rho$.
  </label>

  <label>
    <input type="radio" name="rdf-density" value="2">
    $g(r)$ equals $\dfrac{1}{2}$, since you divide by $2\rho$.
  </label>

  <label>
    <input type="radio" name="rdf-density" value="3">
    $g(r)$ equals $0$, since particles behave independently at large $r$.
  </label>

  <button type="button" class="quiz-submit">
    Check answer
    </button>
  </form>
  <p class="quiz-feedback quiz-feedback" aria-live="polite"></p>
</div>

So, if we know compute the total number of particles $N_\text{total}\ (= 2500)$  and the total area $A_\text{total}\ (\approx 12.57)$, we can compute the average number density:

$$
\rho = \frac{N_\text{total}}{A_\text{total}} \approx \frac{2500}{12.57} \approx 198.9
$$

Now we can complete our table by adding the RDF:

{: .table-compact }
| Shell range (r) | Number of particles | Normalized particle count | Radial Distribution Function (RDF) |
|:---------------:|:-------------------:|:-------------------------:|:----------------------------------:|
| 0.0 – 0.5       | 155                 | ~197.35                   | ~0.992                             |
| 0.5 – 1.0       | 470                 | ~199.47                   | ~1.003                             |
| 1.0 – 1.5       | 782                 | ~199.13                   | ~1.001                             |
| 1.5 – 2.0       | 1093                | ~198.81                   | ~0.999                             |

If we plot this, we get the following boring graph:

![Figure 4: RDF barplot to show the RDF for each shell](/assets/tutorials/rdf/rdf_barplot.png){: .wide }











<!-- 
For each shell between $r$ and $r + \Delta r$:

- Count how many neighbors fall into that shell, averaged over all reference particles and over time.
- Compare that count to what you would expect if particles were distributed completely randomly with average density $\rho$.

Mathematically, in a homogeneous and isotropic fluid,

$$
  g(r) = \frac{1}{4 \pi r^{2} \Delta r \, \rho \, N_{\text{ref}}} \sum_{\text{pairs in shell}} 1
$$

where:

- $r$ is the distance between particle centers.
- $\Delta r$ is the shell thickness.
- $\rho$ is the average number density $N / V$.
- $N_{\text{ref}}$ is the total number of reference particles used (including all configurations).

If the fluid were ideal and uncorrelated, then on average you would get $g(r) = 1$ at all distances.

---

## 3. What you need from a simulation

To compute $g(r)$ from molecular dynamics (or Monte Carlo) you need:

- A trajectory with particle positions at many time frames.
- The simulation cell size and shape for each frame, especially if you use periodic boundary conditions.
- A choice of:
  - Maximum distance $r_{\max}$, usually not larger than half of the smallest box length in any direction.
  - Bin width $\Delta r$, which sets the radial resolution.

### 3.1 Typical choices

For a cubic box of length $L$:

- Set $r_{\max} \le L / 2$ so that each shell is fully contained without double counting due to periodicity.
- Choose $\Delta r$ on the order of $0.01$ nm to $0.05$ nm for atomic liquids, depending on how much sampling you have.

---

## 4. Formal definition of g(r)

In a one component homogeneous fluid of $N$ particles in volume $V$ with density $\rho = N / V$, the radial distribution function is defined as

$$
g(r) = \frac{1}{4 \pi r^{2} \rho} \frac{\mathrm{d}n(r)}{\mathrm{d}r}
$$

where $n(r)$ is the average number of particles in a sphere of radius $r$ around a reference particle.

Equivalently, in a thin shell between $r$ and $r + \Delta r$,

$$
g(r) \approx
\frac{\langle N_{\text{shell}}(r, r + \Delta r) \rangle}
{\rho \, 4 \pi r^{2} \Delta r}
$$

where $\langle N_{\text{shell}} \rangle$ is the average number of neighbors in that shell per reference particle.

In simulations we estimate $g(r)$ by building a histogram of distances.

---

## 5. Step by step algorithm in 3D

Here is the standard 3D algorithm for a single species system.

### 5.1 Step 1: Construct the histogram grid

1. Choose bin width $\Delta r$ and maximum distance $r_{\max}$.
2. Compute the number of bins
   $$
   n_{\text{bins}} = \left\lfloor \frac{r_{\max}}{\Delta r} \right\rfloor
   $$
3. Define bin edges
   $$
   r_0 = 0, \quad r_1 = \Delta r, \quad r_2 = 2 \Delta r, \dots, r_{n_{\text{bins}}}
   $$
4. Initialize an array of counts $C_k = 0$ for $k = 0, \dots, n_{\text{bins}} - 1$.

Each bin $k$ corresponds to distances between $k \Delta r$ and $(k + 1) \Delta r$. The bin center is usually taken as

$$
r_k = \left(k + \tfrac{1}{2}\right) \Delta r
$$

---

### 5.2 Step 2: Loop over frames and particle pairs

For each saved frame:

1. For each particle $i$, treat it as reference.
2. For every other particle $j \ne i$:
   - Compute the distance $r_{ij}$.
   - If you use periodic boundary conditions, apply the minimum image convention:
     - Compute displacement vector $\mathbf{d} = \mathbf{r}_j - \mathbf{r}_i$.
     - Fold each component back into the range $-L/2 < d_{\alpha} \le L/2$ for a cubic box.
     - Then $r_{ij} = \|\mathbf{d}\|$.
   - If $0 < r_{ij} < r_{\max}$, determine the bin index
     $$
     k = \left\lfloor \frac{r_{ij}}{\Delta r} \right\rfloor
     $$
     and increment the count: $C_k \leftarrow C_k + 1$.

3. Count how many reference particles you used in total:
   $$
   N_{\text{ref}} = N \times N_{\text{frames}}
   $$
   if you use all particles in every frame.

This builds a histogram of pair distances.

---

### 5.3 Step 3: Normalize the histogram to get g(r)

For each radial bin $k$ with center $r_k$:

1. Compute the shell volume in 3D
   $$
   V_{\text{shell}}(r_k) = 4 \pi r_k^{2} \Delta r
   $$
2. Compute the average density
   $$
   \rho = \frac{N}{V}
   $$
   or an appropriate average if box volume fluctuates.
3. Normalize the raw counts to obtain $g(r_k)$

$$
g(r_k) = \frac{C_k}{N_{\text{ref}} \, \rho \, V_{\text{shell}}(r_k)}
$$

This ensures that if your particles were distributed randomly with uniform density $\rho$, you would obtain $g(r) \approx 1$ for all $r$, up to statistical noise.

---

### 5.4 Step 4: Optional averaging and smoothing

You may have:

- Multiple independent simulations.
- Separate RDFs for different segments of a long trajectory.

In that case you can average the already normalized $g(r)$ curves. If the curve is still noisy, apply a mild smoothing after normalization, for example a short moving average over neighboring bins. The smoothing window should be small enough that it does not shift peak positions noticeably.

---

## 6. Interactive checkpoint 1: long range behavior

<div class="interactive-test" data-test-id="long-range">
  <p>
    Consider a simple homogeneous liquid at equilibrium. As the distance $r$ becomes very large compared to the molecular size, what should $g(r)$ approach if the system is large enough and well equilibrated?
  </p>
  <form class="rdf-quiz"
        data-answer="1"
        data-correct-explanation="Correct. At large distances correlations decay, so the probability to find a particle in a shell of volume $4\pi r^2 \Delta r$ is just $\rho 4\pi r^2 \Delta r$, which gives $g(r) \to 1$."
        data-wrong-explanation="Not quite. Remember that $g(r)$ is defined as the ratio of the actual local density to the average density $\rho$. Far away from any specific particle, the fluid should look uniform, so this ratio should approach one.">
    <label>
      <input type="radio" name="rdf-long-range" value="0">
      $g(r) \to 0$, because particles become independent at large distances.
    </label>
    <br>
    <label>
      <input type="radio" name="rdf-long-range" value="1">
      $g(r) \to 1$, because correlations vanish and the density becomes uniform.
    </label>
    <br>
    <label>
      <input type="radio" name="rdf-long-range" value="2">
      $g(r) \to \infty$, because the volume of the spherical shell grows with $r^{2}$.
    </label>
    <br>
    <button type="button" class="rdf-quiz-submit">
      Check answer
    </button>
  </form>
  <p class="rdf-quiz-feedback" aria-live="polite"></p>
</div>

---

## 7. Interpreting g(r): what do the peaks mean?

A typical RDF for a liquid looks like this:

![Figure 2: Example RDF for a simple liquid. The first peak corresponds to nearest neighbors, the second peak to the second coordination shell, and g(r) tends to 1 at large r.](../assets/tutorials/rdf/rdf_example_liquid.svg)

### 7.1 First peak

- Position:
  - Gives the most probable nearest neighbor distance.
  - For liquid water at ambient conditions, the first oxygen oxygen peak is around $r \approx 0.28$ nm.
- Height:
  - A high first peak indicates strong structuring and well defined nearest neighbors.
  - A lower first peak indicates more disordered or weakly interacting neighbors.

### 7.2 Second and higher peaks

- Reflect second and higher coordination shells.
- For liquids with significant medium range order, such as liquid water or silica, you often see pronounced second and third peaks.

### 7.3 Region where g(r) is less than 1

- If $g(r) < 1$ for some range of $r$, that distance is depleted compared to a random distribution.
- This can indicate an excluded volume region or repulsive interactions.

### 7.4 Long range limit

- In a homogeneous bulk liquid, $g(r) \to 1$ as $r \to \infty$.
- If $g(r)$ does not approach 1 at large $r$, you might have:
  - Finite size effects.
  - Strong inhomogeneity.
  - Insufficient sampling.

---

## 8. Coordination numbers from g(r)

A coordination number is the average number of neighbors within a certain distance. You can get it by integrating $g(r)$:

$$
n(r_c) = 4 \pi \rho \int_{0}^{r_c} g(r) r^{2} \, \mathrm{d}r
$$

Common choice:

- Select $r_c$ as the position of the first minimum of $g(r)$ after the first peak. This defines the first coordination shell.

In discrete form using your histogram,

$$
n(r_c) \approx 4 \pi \rho \sum_{k, r_k < r_c} g(r_k) r_k^{2} \Delta r
$$

This tells you, for example, how many water molecules are in the first solvation shell of an ion.

---

## 9. Worked example: liquid water at 300 K

Consider a simulation of $N = 512$ water molecules in a cubic box of length $L \approx 2.5$ nm at 300 K. You want the oxygen oxygen RDF.

1. Choose:
   - $r_{\max} = L/2 \approx 1.25$ nm.
   - $\Delta r = 0.01$ nm, so you get about 125 bins.
2. For each saved frame:
   - For every pair of water molecules $i, j$, compute the distance between their oxygen atoms using minimum image.
   - Accumulate counts in the appropriate bins.
3. After processing all frames:
   - Compute the density $\rho = N / V$.
   - Normalize the counts to obtain $g_{\text{OO}}(r_k)$.

Typical outcome:

- A strong first peak at around $r \approx 0.28$ nm.
- A first minimum around $r \approx 0.34$ to $0.36$ nm.
- A second peak near $r \approx 0.45$ to $0.5$ nm.
- $g(r)$ oscillates around 1 and approaches 1 at large $r$.

From the integral up to the first minimum you get the average first shell coordination number of roughly 4 for water oxygen oxygen, depending on the water model.

---

## 10. Multi component systems and partial RDFs

If you have more than one species, you can compute partial RDFs:

- $g_{AB}(r)$: probability of finding a particle of type $B$ at distance $r$ from a particle of type $A$.
- $g_{AA}(r)$: same species correlations.

To compute $g_{AB}(r)$:

- Let $N_A$ be the number of particles of type $A$, $N_B$ of type $B$.
- Use all $A$ particles as reference particles.
- Only count distances to particles of type $B$.

The normalization becomes

$$
g_{AB}(r_k) = \frac{C_{AB,k}}{N_{A,\text{ref}} \, \rho_B \, V_{\text{shell}}(r_k)}
$$

with

$$
\rho_B = \frac{N_B}{V}
$$

and $N_{A,\text{ref}}$ the total number of $A$ references sampled over all frames.

Partial RDFs are essential for understanding mixtures, solvation shells, and ion water structure.

---

## 11. Common pitfalls and how to avoid them

### 11.1 Using too large r_max in periodic systems

If $r_{\max}$ is larger than half of the smallest box dimension, then shells start to overlap with their periodic images. This leads to incorrect normalization and artificial features.

**Rule:** always use $r_{\max} \le L_{\text{min}} / 2$.

---

### 11.2 Too small bin width

Choosing $\Delta r$ extremely small yields very high resolution but huge statistical noise. The result looks like a jagged curve that is hard to interpret.

### 11.3 Too few frames

If you only have a handful of frames, especially for small systems, then the histogram statistics are poor. You see large fluctuations from bin to bin.

---

## 12. Interactive checkpoint 2: improving statistics

```html
<div class="interactive-test" data-test-id="statistics">
  <p>
    You computed $g(r)$ for a liquid and obtained a very noisy curve. You would like to improve the statistics without washing out structural features. What is the best strategy?
  </p>
  <form class="rdf-quiz"
        data-answer="2"
        data-correct-explanation="Exactly. By increasing the number of samples (more frames, or using more reference particles) you reduce statistical noise while keeping the physical resolution $\Delta r$ intact."
        data-wrong-explanation="Changing $\Delta r$ can help a bit, but the most robust way to reduce noise is to collect more samples. If you make $\Delta r$ too large you smear out the peaks, and making it too small only increases the noise.">
    <label>
      <input type="radio" name="rdf-statistics" value="0">
      Decrease $\Delta r$ so that you have more, thinner bins.
    </label>
    <br>
    <label>
      <input type="radio" name="rdf-statistics" value="1">
      Increase $\Delta r$ until the curve looks completely flat.
    </label>
    <br>
    <label>
      <input type="radio" name="rdf-statistics" value="2">
      Increase the amount of sampling (more frames, longer simulation, more reference particles) while keeping $\Delta r$ reasonable.
    </label>
    <br>
    <button type="button" class="rdf-quiz-submit">
      Check answer
    </button>
  </form>
  <p class="rdf-quiz-feedback" aria-live="polite"></p>
</div>
```

---

## 13. Implementation examples

### 13.1 Minimal pseudocode

Here is a language agnostic pseudocode version for a single component system with periodic cubic box:

```code
Given: positions[frame][i], box_length L, dr, r_max

nbins = floor(r_max / dr)
counts[0..nbins-1] = 0
Nref = 0

for frame in frames:
    for i in 0..N-1:
        Nref += 1
        for j in 0..N-1, j != i:
            # displacement with minimum image
            dx = positions[frame][j].x - positions[frame][i].x
            dy = positions[frame][j].y - positions[frame][i].y
            dz = positions[frame][j].z - positions[frame][i].z

            dx = dx - L * round(dx / L)
            dy = dy - L * round(dy / L)
            dz = dz - L * round(dz / L)

            r = sqrt(dx*dx + dy*dy + dz*dz)

            if r > 0 and r < r_max:
                k = floor(r / dr)
                counts[k] += 1

rho = N / (L^3)

for k in 0..nbins-1:
    r_k = (k + 0.5) * dr
    shell_volume = 4 * pi * r_k * r_k * dr
    g[k] = counts[k] / (Nref * rho * shell_volume)
```

---

### 13.2 Python example: simple RDF for a cubic box

The following Python script illustrates a basic RDF calculation. It assumes:

- Positions are stored as a NumPy array `positions` with shape `(n_frames, n_particles, 3)`.
- The box is cubic with side length `L`.

```python
import numpy as np

def compute_rdf(positions, L, r_max, dr):
    """
    Compute the radial distribution function g(r) for a single-component system
    in a cubic periodic box.

    Parameters
    ----------
    positions : ndarray, shape (n_frames, n_particles, 3)
        Cartesian coordinates of all particles for each frame.
    L : float
        Box length (same in x, y, z).
    r_max : float
        Maximum distance up to which g(r) is computed.
    dr : float
        Bin width for the distance histogram.

    Returns
    -------
    r : ndarray
        Bin centers.
    g_r : ndarray
        Radial distribution function values for each bin.
    """
    n_frames, n_particles, _ = positions.shape

    # Number of histogram bins
    n_bins = int(np.floor(r_max / dr))
    counts = np.zeros(n_bins, dtype=np.float64)

    # Total number of reference particles
    n_ref = n_frames * n_particles

    # Precompute half box length for minimum image convention
    half_L = 0.5 * L

    # Loop over frames and particle pairs
    for frame in range(n_frames):
        frame_pos = positions[frame]

        for i in range(n_particles):
            # Treat particle i as the reference
            ri = frame_pos[i]

            # Vectorized distances to all other particles j
            # Compute displacement vectors rj - ri
            d = frame_pos - ri

            # Apply minimum image convention along each axis
            d[:, 0] -= L * np.round(d[:, 0] / L)
            d[:, 1] -= L * np.round(d[:, 1] / L)
            d[:, 2] -= L * np.round(d[:, 2] / L)

            # Compute distances
            distances = np.linalg.norm(d, axis=1)

            # Exclude self distance at j == i
            distances[i] = np.inf

            # Select distances within (0, r_max)
            valid = (distances > 0.0) & (distances < r_max)
            valid_distances = distances[valid]

            # Compute bin indices
            bin_indices = (valid_distances / dr).astype(int)

            # Accumulate counts
            for k in bin_indices:
                counts[k] += 1.0

    # Compute density
    volume = L ** 3
    rho = n_particles / volume

    # Prepare r grid and normalize histogram
    r = (np.arange(n_bins) + 0.5) * dr
    shell_volumes = 4.0 * np.pi * r ** 2 * dr

    # Normalization: divide pair counts by expected counts in an ideal gas
    g_r = counts / (n_ref * rho * shell_volumes)

    return r, g_r


if __name__ == "__main__":
    # Example usage:
    # Here we generate random positions as a demonstration.
    # In practice, you would load real positions from your MD trajectory.

    n_frames = 100
    n_particles = 256
    L = 3.0  # box length in nm
    r_max = L / 2.0
    dr = 0.02

    # Generate random positions for an ideal gas
    rng = np.random.default_rng(seed=42)
    positions = rng.uniform(0.0, L, size=(n_frames, n_particles, 3))

    # Compute RDF
    r, g_r = compute_rdf(positions, L, r_max, dr)

    # For an ideal gas, we expect g(r) ~ 1 for all r (up to statistical noise).
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots()
    ax.plot(r, g_r, label="g(r) ideal gas")
    ax.axhline(1.0, linestyle="--", linewidth=1, label="g(r) = 1")
    ax.set_xlabel("r [nm]")
    ax.set_ylabel("g(r)")
    ax.legend()
    fig.tight_layout()
    plt.show()
```

This script is deliberately straightforward:

- It uses a double loop over reference particles and frames.
- It handles periodic boundary conditions with the minimum image convention.
- It normalizes by the shell volume and the ideal gas density.

You can optimize it further if needed, for example by using neighbor lists or vectorized pair distance computations.

---

## 14. Interactive checkpoint 3: coordination number

```html
<div class="interactive-test" data-test-id="coordination">
  <p>
    You computed an RDF $g(r)$ and found that the first peak extends up to the first minimum at $r = r_{\min}$. How can you obtain the average number of neighbors in the first coordination shell?
  </p>
  <form class="rdf-quiz"
        data-answer="1"
        data-correct-explanation="Correct. The coordination number is obtained by integrating $4\pi \rho g(r) r^2$ from 0 up to the first minimum. In practice you approximate this by a discrete sum over your histogram bins."
        data-wrong-explanation="The coordination number is not just the height of the peak or the area under g(r) without the geometric factor. You need to integrate $4\pi \rho g(r) r^2$ up to the first minimum to account for the volume element.">
    <label>
      <input type="radio" name="rdf-coordination" value="0">
      Take the maximum value of $g(r)$ in the first peak and multiply by $\rho$.
    </label>
    <br>
    <label>
      <input type="radio" name="rdf-coordination" value="1">
      Integrate $4 \pi \rho g(r) r^{2}$ from $r = 0$ to the first minimum and approximate this integral as a sum over histogram bins.
    </label>
    <br>
    <label>
      <input type="radio" name="rdf-coordination" value="2">
      Count how many particles are in the simulation box and divide by the number of peaks.
    </label>
    <br>
    <button type="button" class="rdf-quiz-submit">
      Check answer
    </button>
  </form>
  <p class="rdf-quiz-feedback" aria-live="polite"></p>
</div>
```

---

## 15. Summary checklist

Before you trust your RDF, quickly check:

1. **Geometry**

   - ( r_{\max} \le L_{\text{min}} / 2 ).
   - Correct handling of periodic boundary conditions.
2. **Sampling**

   - Enough frames and reference particles.
   - Reasonable ( \Delta r ) so that peaks are smooth but not oversmeared.
3. **Normalization**

   - Use ( \rho = N / V ).
   - Normalize by ( 4 \pi r^{2} \Delta r ).
   - For a test ideal gas, RDF should be approximately 1.
4. **Physics**

   - First peak in plausible position.
   - Long range ( g(r) ) tends to 1.
   - Coordination numbers are reasonable.

---

## 16. Further reading

For more detailed theory and advanced topics, consult:

- M. P. Allen and D. J. Tildesley, *Computer Simulation of Liquids*, Oxford University Press.
- D. Frenkel and B. Smit, *Understanding Molecular Simulation*, Academic Press.
- J. P. Hansen and I. R. McDonald, *Theory of Simple Liquids*, Academic Press.

These references discuss the relation between ( g(r) ), thermodynamics, and scattering experiments, as well as connections to the structure factor ( S(q) ).

----->

<script>
  (function () {
    function setupQuizzes() {
      var quizzes = document.querySelectorAll("form.quiz");

      quizzes.forEach(function (form) {
        var button = form.querySelector(".quiz-submit");
        if (!button) {
          return;
        }

        var correctBlock = form.querySelector(".quiz-correct");
        var wrongBlock = form.querySelector(".quiz-wrong");

        button.addEventListener("click", function () {
          var selected = form.querySelector("input[type='radio']:checked");
          var feedback = form.parentElement.querySelector(".quiz-feedback");
          if (!feedback) {
            return;
          }

          if (!selected) {
            feedback.textContent = "Please select an option before checking your answer.";
            return;
          }

          var correctValue = form.dataset.answer;

          if (selected.value === correctValue) {
            var explanation = correctBlock ? correctBlock.innerHTML : "Correct.";
            feedback.innerHTML = "✅ " + explanation;
          } else {
            var wrongExplanation = wrongBlock ? wrongBlock.innerHTML : "Incorrect.";
            feedback.innerHTML = "❌ " + wrongExplanation;
          }

          if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([feedback]);
          }
        });
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setupQuizzes);
    } else {
      setupQuizzes();
    }
  })();
</script>
