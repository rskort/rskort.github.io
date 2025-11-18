---
layout: default
title: "How to run CP2K"
tags: [cp2k, molecular dynamics, DFT, CP2K, tutorial]
description: "Step-by-step tutorial on how to run CP2K: from executables and modules to job scripts, parallel settings and basic sanity checks, with interactive questions and examples."
styles:
  - /css/tutorials/tutorial.css
---

# {{ page.title }}

[CP2K](https://www.cp2k.org/) is an *open source* **electronic structure** and **molecular dynamics** package for simulations of solids, liquids, molecules and interfaces, with methods such as **density functional theory (DFT)** in the *Gaussian and plane waves (GPW)* framework and *classical force fields*.

This tutorial will not be about the *theory* behind CP2K or MD/DFT calculations, but about the **practical steps** needed to get started with running CP2K on your own hardware or on a shared cluster.<br>
**Conceptually**, running CP2K is rather simple:

1. You have a **CP2K executable**, for example `cp2k.psmp`.
2. You prepare an **input file** that describes the system and the task.
3. You run the executable on some **hardware**, often through a job scheduler.
4. CP2K writes **output files** that you inspect and postprocess.

However, the details can be tricky, especially on shared HPC systems. This tutorial walks you through the key steps to get started with CP2K, with interactive questions to test your understanding along the way.

I will try to keep the input file very simple and refer to the [official documentation](https://manual.cp2k.org/) for details.

---

## 1. What does “running CP2K” actually mean

CP2K follows a classic batch style:

- The executable is a compiled binary such as `cp2k.psmp` or `cp2k.popt`.  
- The **only required text input** is a CP2K input file, typically called `input.inp`.  
- CP2K writes a main log file plus additional files such as restart files, trajectory files or cube files, depending on the [input settings](https://manual.cp2k.org/trunk/CP2K_INPUT.html).

The key ideas:

- CP2K does *not* have a graphical interface. You interact through files and the command line.  
- You can run it interactively for quick tests, but production work usually goes through a scheduler like [SLURM](https://slurm.schedmd.com/overview.html), [PBS](https://www.pbspro.org/) or [LSF](https://www.ibm.com/docs/en/spectrum-lsf).  
- The same executable and input concept applies whether you use DFT, classical MD, QM/MM or something more exotic.

---

## 2. Getting a CP2K executable

There are two common ways that we can obtain a CP2K executable, either through a module provided by the system, or by installing it locally.

### 2.1 Provided by a cluster module

On many <abbr title="High Performance Computing">HPC systems</abbr>, CP2K is installed centrally and exposed as a **module**. For example:

<pre class="code-block" data-lang="bash">
  <code>
  $ module avail cp2k         # See available CP2K versions
  $ module load cp2k          # Load a default CP2K module

  $ which cp2k.psmp           # Check where the executable lives
  $ cp2k.psmp --version       # Show version information
  </code>
</pre>

<details>
  <summary>
   {% raw %}Getting a <span class="inline-code">No module(s) or extension(s) found!</span> error?{% endraw %}
  </summary>

  <div markdown="1">
If `$ module avail cp2k` shows no results, either CP2K is not installed as a module on your system
(then you can contact your system administrator or IT support to ask if CP2K is available,
or you should consider installing it yourself, see next section), or the program is installed under
a different module name.

You can try `$ module avail` to see all available modules and search for CP2K related names,
or you can use `$ module spider cp2k` to see if the module is available under a different name.
  </div>
</details>



If this works, your life is easy: you do not compile CP2K yourself, and you inherit the site specific optimizations.

Now it is time for a first check of the executable:

<div class="interactive-test" data-test-id="cp2k-env-check">
  <p>
    You ran `$ module load cp2k` and then `$ which cp2k.psmp`.<br>
    The shell prints `/usr/local/cp2k/2024.1/bin/cp2k.psmp`.<br>
    What is the most sensible next command to confirm that CP2K runs at all?
  </p>

  <form class="quiz" data-answer="1">

<div class="quiz-correct hidden">
  Correct. Starting CP2K with `--help` or `--version` confirms that the executable runs and prints information without needing any input file.
</div>

<div class="quiz-wrong hidden">
  Not quite. Before launching a big parallel run, first check that the executable actually runs, for example with `cp2k.psmp --help` or `cp2k.psmp --version`.
</div>

<label>
  <input type="radio" name="cp2k-env-check" value="0">
  Submit a production job with `sbatch`.
</label>

<label>
  <input type="radio" name="cp2k-env-check" value="1">
  Run `cp2k.psmp --help` or `cp2k.psmp --version`.
</label>

<label>
  <input type="radio" name="cp2k-env-check" value="2">
  Reboot the login node so that the module is fully active.
</label>

<label>
  <input type="radio" name="cp2k-env-check" value="3">
  Open the binary in a text editor to check that it looks correct.
</label>

<button type="button" class="quiz-submit">
  Check answer
</button>

  </form>
  <p class="quiz-feedback" aria-live="polite"></p>
</div>

### 2.2 Local installation

If you need CP2K on a workstation or laptop, or your cluster does not provide it, you [install from source](https://manual.cp2k.org/trunk/getting-started/build-from-source.html), via a [distribution](https://manual.cp2k.org/trunk/getting-started/distributions.html), or via [Spack](https://manual.cp2k.org/trunk/getting-started/build-with-spack.html).

For the rest of this tutorial we assume you already have a *working executable*. For further installation details, I highly recommend consulting the CP2K manual.

---

## 3. CP2K binaries and parallel execution

In many installations you will see several CP2K binaries, for example:

* `cp2k.popt`
* `cp2k.ssmp`
* `cp2k.psmp`

The details depend on the build, but a common convention is:

* `popt` pure <abbr title="Message Passing Interface">MPI</abbr>
* `ssmp` pure <abbr title="Open Multi-Processing">OpenMP</abbr>
* `psmp` MPI plus OpenMP hybrid

CP2K’s [official benchmark suite](https://www.cp2k.org/performance) shows that a well tuned **hybrid `psmp`** (MPI plus OpenMP) build often performs best in terms of speed an memory usage, but the optimal choice is system dependent and should be determined through benchmarking. In the case of `psmp`, the code scales primarily through MPI, but using only MPI ranks can lead to excessive memory use. A common starting point in CP2K [MPI vs OpenMP FAQ](https://www.cp2k.org/faq:mpi_vs_openmp) is to start with **two OpenMP threads per MPI rank** and benchmarking to find the best ratio for your system.


On a modern cluster node, where you have (for example) 64 physical cores, sensible parallel layouts are:

| Parallel layout                 | MPI ranks | OpenMP threads | Total cores used | Notes                                      |
| ------------------------------- | --------- | -------------- | ---------------- | ------------------------------------------ |
| **Pure MPI**                    | 64        | 1              | 64               | Highest memory use, simplest scaling       |
| **Hybrid (light threading)**    | 32        | 2              | 64               | Recommended starting point (CP2K FAQ)      |
| **Hybrid (moderate threading)** | 16        | 4              | 64               | More memory per rank, often faster for HFX |
| **Hybrid (thread-heavy)**       | 8         | 8              | 64               | Useful for memory-intensive workloads      |

All four configurations fully occupy a 64-core node.
The optimal choice depends on **problem size**, **basis**, and **hardware**, which is why CP2K explicitly recommends <abbr title="Which is running the same CP2K calculation with different MPI and OpenMP layouts to determine which configuration gives the best performance on your hardware.">benchmarking</abbr>.

<div class="interactive-test" data-test-id="cp2k-mpi-omp">
  <p>
    You have a node with 64 physical cores. You run CP2K with the `cp2k.psmp` executable and want to follow the common recommendation to start with 2 OpenMP threads per MPI rank.
    Which `mpirun` setup is consistent with this idea?
  </p>

  <form class="quiz" data-answer="2">

<div class="quiz-correct hidden">
  Correct. 32 MPI ranks times 2 threads per rank uses all 64 cores and matches the suggested starting point for hybrid CP2K runs.
</div>

<div class="quiz-wrong hidden">
  Not quite. The recommendation is to start with a modest number of threads per rank, for example 2, and then benchmark different combinations. 32 ranks times 2 threads is one such choice on a 64 core node.
</div>

<label>
  <input type="radio" name="cp2k-mpi-omp" value="0">
  `mpirun -np 64 cp2k.psmp` with `OMP_NUM_THREADS=1`
</label>

<label>
  <input type="radio" name="cp2k-mpi-omp" value="1">
  `mpirun -np 2 cp2k.psmp` with `OMP_NUM_THREADS=32`
</label>

<label>
  <input type="radio" name="cp2k-mpi-omp" value="2">
  `mpirun -np 32 cp2k.psmp` with `OMP_NUM_THREADS=2`
</label>

<label>
  <input type="radio" name="cp2k-mpi-omp" value="3">
  `mpirun -np 64 cp2k.psmp` with `OMP_NUM_THREADS=2`
</label>

<button type="button" class="quiz-submit">
  Check answer
</button>

  </form>
  <p class="quiz-feedback" aria-live="polite"></p>
</div>

---

## 4. Organising a run directory

Before writing an input file it helps to have a clean directory structure, especially on clusters.

A minimal layout for a tiny test system could be:

<pre class="code-block" data-lang="text">
  <code>
    cp2k_example/
      input.inp          # CP2K input file
      job.slurm          # Job script (if you use SLURM)
      README.md          # Optional notes
  </code>
</pre>

[Basis sets](https://www.cp2k.org/basis_sets) and [pseudopotentials](https://www.cp2k.org/tools:cp2k-basis) are normally provided by the CP2K installation, often in a shared folder like `cp2k/data`, and accessed through [`BASIS_SET_FILE_NAME` and `POTENTIAL_FILE_NAME` keywords](https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT.html) in the input file. A great database of basis sets is available at [www.basissetexchange.org](https://www.basissetexchange.org/). For pseudopotentials you can search on [www.pseudopotentiallibrary.org](https://www.pseudopotentiallibrary.org/) or [the database from CP2K](https://cp2k.org/static/potentials/). For selecting appropriate basis sets and pseudopotentials, see the [this guide by CP2K](https://www.cp2k.org/_media/events:2015_cecam_tutorial:ling_basis_pseudo.pdf).

If you maintain your own data directory with basis sets and pseudopotential files, CP2K will also look in a directory pointed to by the environment variable `CP2K_DATA_DIR`. For example, in your shell configuration:

<pre class="code-block" data-lang="bash">
  <code>
    $ export CP2K_DATA_DIR="$HOME/path/to/cp2k_data"
  </code>
</pre>

<div class="interactive-test" data-test-id="cp2k-data-dir">
  <p>
    You copied the files `BASIS_MOLOPT` and `GTH_POTENTIALS` to `$HOME/cp2k_data`.<br>
    Your `input.inp` file contains:<br>
    `BASIS_SET_FILE_NAME   BASIS_MOLOPT` and `POTENTIAL_FILE_NAME   GTH_POTENTIALS`.<br>
    What else must be true for CP2K to find these files without full paths?
  </p>

  <form class="quiz" data-answer="3">

<div class="quiz-correct hidden">
  Correct. CP2K checks both its internal data path and any directory given by the CP2K_DATA_DIR environment variable. Pointing `CP2K_DATA_DIR` to `$HOME/cp2k_data` allows CP2K to find those files automatically.
</div>

<div class="quiz-wrong hidden">
  That is not sufficient. CP2K does not search arbitrary folders unless they are part of its built-in data path or specified through `CP2K_DATA_DIR`.
</div>

<label>
  <input type="radio" name="cp2k-data-dir" value="0">
  The input file must be located in `$HOME/cp2k_data`.
</label>

<label>
  <input type="radio" name="cp2k-data-dir" value="1">
  You must rename the files to `BASIS_SET` and `POTENTIAL`.
</label>

<label>
  <input type="radio" name="cp2k-data-dir" value="2">
  You must compile CP2K again every time you change the data folder.
</label>

<label>
  <input type="radio" name="cp2k-data-dir" value="3">
  The environment variable `CP2K_DATA_DIR` must point to `$HOME/cp2k_data`.
</label>

<button type="button" class="quiz-submit">
  Check answer
</button>

  </form>
  <p class="quiz-feedback" aria-live="polite"></p>
</div>

---

## 5. A minimal input file with references

We still need one concrete input, but we keep it small and treat it as an example. It mirrors the structure recommended in [CP2K's "First calculation tutorials"](https://manual.cp2k.org/trunk/getting-started/first-calculation.html): 

- `GLOBAL` section for run type
- `FORCE_EVAL` for energy and force evaluation
  - `SUBSYS` for the system description.

A CP2K input file is written in Fortran-like namelist format, with sections starting with `&SECTION_NAME` and ending with `&END SECTION_NAME`. Here is a minimal input file (`input.inp`) for a single point energy calculation of a water molecule in a cubic box:

<pre class="code-block" data-lang="fortran">
  <code>
&GLOBAL
  PROJECT example-project
  RUN_TYPE ENERGY           ! For GEO_OPT, MD, etc. (see <a href="https://manual.cp2k.org/trunk/CP2K_INPUT/GLOBAL.html#CP2K_INPUT.GLOBAL.RUN_TYPE">RUN_TYPE in CP2K manual</a>)
  PRINT_LEVEL MEDIUM
&END GLOBAL

&FORCE_EVAL
  METHOD QUICKSTEP          ! Electronic structure method (see <a href="https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL.html#CP2K_INPUT.FORCE_EVAL.METHOD">QUICKSTEP in CP2K manual</a>)

  &DFT
    BASIS_SET_FILE_NAME BASIS_MOLOPT
    POTENTIAL_FILE_NAME GTH_POTENTIALS

    &MGRID
      CUTOFF 400            ! Grid cutoff (see <a href="https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT/MGRID.html#CP2K_INPUT.FORCE_EVAL.DFT.MGRID.CUTOFF">CUTOFF in CP2K manual</a>)
    &END MGRID

    &XC
      &XC_FUNCTIONAL PBE
      &END XC_FUNCTIONAL
    &END XC
  &END DFT

  &SUBSYS
    &CELL
      ABC 10.0 10.0 10.0    ! Box in Å (see <a href="https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/SUBSYS/CELL.html#CP2K_INPUT.FORCE_EVAL.SUBSYS.CELL.ABC">ABC in CP2K manual</a>)
    &END CELL

    &COORD
      O   0.000   0.000   0.000
      H   0.757   0.586   0.000
      H  -0.757   0.586   0.000
    &END COORD

    &KIND H
      BASIS_SET DZVP-MOLOPT-SR-GTH
      POTENTIAL GTH-PBE-q1
    &END KIND

    &KIND O
      BASIS_SET DZVP-MOLOPT-SR-GTH
      POTENTIAL GTH-PBE-q6
    &END KIND
  &END SUBSYS
&END FORCE_EVAL
  </code>
</pre>

For the generation of input files, I would like to guide you to my [CP2K Input Generator](/tools/cp2k-input-generator/), and recommend always cross-checking with the [official CP2K manual](https://manual.cp2k.org/trunk/).


<div class="interactive-test" data-test-id="cp2k-run-type">
  <p>
    You want to switch from a single point energy calculation to a geometry optimization using the same system.
    Which of the following changes, by itself, is consistent with the CP2K documentation?
  </p>

  <form class="quiz" data-answer="1">

<div class="quiz-correct hidden">
  Correct. `GEO_OPT` as a valid value for `RUN_TYPE` in the `GLOBAL` section, but a full geometry optimization requires an appropriate `&MOTION / &GEO_OPT` block as well. A full list of `RUN_TYPE` options is available in the <a href="https://manual.cp2k.org/trunk/CP2K_INPUT/GLOBAL.html#CP2K_INPUT.GLOBAL.RUN_TYPE">CP2K manual</a>.
</div>

<div class="quiz-wrong hidden">
  Not quite. The `RUN_TYPE` keyword in `&GLOBAL` controls the overall type of calculation such as `ENERGY`, `MD` or `GEO_OPT`. Other changes may be needed for a robust geometry optimization, but this is the proper starting point. A full list of `RUN_TYPE` options is available in the <a href="https://manual.cp2k.org/trunk/CP2K_INPUT/GLOBAL.html#CP2K_INPUT.GLOBAL.RUN_TYPE">CP2K manual</a>.
</div>

<label>
  <input type="radio" name="cp2k-run-type" value="0">
  Leave `RUN_TYPE ENERGY` and only change the basis set to a larger one.
</label>

<label>
  <input type="radio" name="cp2k-run-type" value="1">
  Add a `&MOTION / &GEO_OPT` block and change `RUN_TYPE ENERGY` to `RUN_TYPE GEO_OPT`
</label>

<label>
  <input type="radio" name="cp2k-run-type" value="2">
  Delete the `RUN_TYPE` keyword, CP2K will choose `GEO_OPT` automatically.
</label>

<label>
  <input type="radio" name="cp2k-run-type" value="3">
  Only add a `&MOTION / &GEO_OPT` block (without changing `RUN_TYPE`).
</label>

<button type="button" class="quiz-submit">
  Check answer
</button>

  </form>
  <p class="quiz-feedback" aria-live="polite"></p>
</div>

---

## 6. Running CP2K interactively

Let’s recap what we have so far:

* The CP2K executable `cp2k.psmp` is available on your `PATH`, so the shell can find it.
* The CP2K input file `input.inp` is in your current working directory.

### 6.1 Basic command line

A minimal interactive CP2K run using 4 MPI ranks looks like this:

<pre class="code-block" data-lang="bash">
  <code>
$ mpirun -np 4 cp2k.psmp -i input.inp -o output.out
  </code>
</pre>

Here is what each part of the command does:

* `mpirun -np 4` starts 4 MPI processes that will run in parallel.
* `cp2k.psmp` is the hybrid MPI/OpenMP CP2K binary (psmp = MPI + OpenMP/threads).
* `-i input.inp` tells CP2K which input file to read.
* `-o output.out` sets the base name of the main CP2K output file.

<details>
  <summary>
   {% raw %}Depending on your system, <span class="inline-code">mpirun</span> may be replaced by <span class="inline-code">srun</span>, <span class="inline-code">mpiexec</span>, or <span class="inline-code">jsrun</span>.{% endraw %}
  </summary>

  <div markdown="1">
  `srun`, `mpirun`, and `mpiexec` are different MPI launcher commands provided by different job schedulers or MPI implementations, but all serve the same purpose of starting parallel MPI processes, as described in the [SLURM documentation](https://slurm.schedmd.com/srun.html) and the [MPI standard](https://www.mpi-forum.org/docs/).
  </div>
</details>

### 6.2 Output files

After the run completes, you will typically see:

* `output.out` – the **main CP2K log file**, containing timing, convergence, and energy information.
* `example-project-1.log` or similar internal log, depending on version. (`example-project` comes from the `PROJECT` keyword in the `&GLOBAL` section of `input.inp`.)
* Optional files such as:

  * `*.restart` – restart files
  * `*.wfn` – wavefunction files
  * `*.xyz` or `*.pdb` – trajectory coordinates
  * `*.cube` – electron density or orbital visualization files

The exact set of generated files depends entirely on what you requested in the CP2K input.


<div class="interactive-test" data-test-id="cp2k-basic-run">
  <p>
    You are in a directory containing `input.inp`. The command<br>
    `$ mpirun -np 4 cp2k.psmp -i input.inp -o result.out`<br>
    is executed successfully. Which of the following statements is true?
  </p>

  <form class="quiz" data-answer="2">

<div class="quiz-correct hidden">
  Correct. The CP2K executable reads `input.inp` as input and writes its main log to `result.out`, while MPI runs it on 4 parallel ranks.
</div>

<div class="quiz-wrong hidden">
  That does not match how CP2K’s command line works. MPI handles `-np`, while CP2K uses `-i` for the input file and `-o` for the output log.
</div>

<label>
  <input type="radio" name="cp2k-basic-run" value="0">
  CP2K runs in serial mode and writes all output to `input.inp`.
</label>

<label>
  <input type="radio" name="cp2k-basic-run" value="1">
  CP2K uses 4 OpenMP threads, reads from `input.inp`, and writes its main output to `result.out`.
</label>

<label>
  <input type="radio" name="cp2k-basic-run" value="2">
  CP2K runs on 4 MPI processes, reads from `input.inp`, and writes its main output to `result.out`.
</label>

<label>
  <input type="radio" name="cp2k-basic-run" value="3">
  The program returns an error because the command is incomplete due to CP2K requiring a name for the restart file.
</label>

<button type="button" class="quiz-submit">
  Check answer
</button>

  </form>
  <p class="quiz-feedback" aria-live="polite"></p>
</div>


---

## 7. Running CP2K through a scheduler (SLURM example)

On production <abbr title="High-Performance Computing">HPC</abbr> systems, you normally run CP2K through a **batch scheduler** rather than interactively. This prevents heavy simulations from running on login nodes, ensures fair resource sharing, and allows your job to run unattended whenever resources become available.

Below is a minimal SLURM script `job.slurm` that requests one compute node and runs CP2K using 4 MPI ranks:

<pre class="code-block" data-lang="bash">
  <code>
#!/bin/bash
#SBATCH --job-name=example-project
#SBATCH --nodes=1
#SBATCH --ntasks=4
#SBATCH --time=00:10:00
#SBATCH --output=example-project.%j.out

# Load CP2K module provided by the system
module load cp2k

# Always run from the directory where sbatch was called
cd "${SLURM_SUBMIT_DIR}"

# Number of OpenMP threads per MPI rank (hybrid runs may change this)
export OMP_NUM_THREADS=1

# Launch CP2K through SLURM's parallel launcher
srun cp2k.psmp -i example-project.inp -o example-project.out
  </code>
</pre>

Submit the job with:

<pre class="code-block" data-lang="bash">
  <code>
$ sbatch job.slurm
  </code>
</pre>

SLURM will place the job in its queue, allocate the requested resources when available, and run CP2K on a compute node. Output appears in two places:

* `example-project.<jobid>.out` — the SLURM job output (<abbr title="The standard output stream where a program writes its normal text output">stdout</abbr> and <abbr title="The standard error stream used for reporting warnings, errors, and diagnostic messages separately from regular output">stderr</abbr> from the script)
* `example-project.out` — the main CP2K output log, written directly by CP2K

If you request more nodes, more tasks, or more threads, you simply adjust `--nodes`, `--ntasks`, and `OMP_NUM_THREADS` accordingly. The same CP2K call works as long as your MPI configuration matches the allocated resources.


<div class="interactive-test" data-test-id="cp2k-slurm-cores">
  <p>
    In the SLURM script above you request `--nodes=1` and `--ntasks=4` and set `OMP_NUM_THREADS=1`.
    Ignoring <abbr title="A technology that allows a single physical CPU core to appear as multiple logical cores to the operating system">hyperthreading</abbr> and <abbr title="Running more processes or threads than there are CPU cores, which can lead to performance degradation">oversubscription</abbr>, how many CPU cores do you effectively ask SLURM to allocate for CP2K?
  </p>

  <form class="quiz" data-answer="2">

<div class="quiz-correct hidden">
  Correct. Each of the 4 MPI tasks uses 1 OpenMP thread, so you are effectively using 4 cores for the CP2K run on that node.
</div>

<div class="quiz-wrong hidden">
  Not quite. On a system with one CPU core per task and one thread per task, the number of cores used equals `ntasks` x `OMP_NUM_THREADS` in this simple setup.
</div>

<label>
  <input type="radio" name="cp2k-slurm-cores" value="0">
  1 core
</label>

<label>
  <input type="radio" name="cp2k-slurm-cores" value="1">
  1/4 cores
</label>

<label>
  <input type="radio" name="cp2k-slurm-cores" value="2">
  4 cores
</label>

<label>
  <input type="radio" name="cp2k-slurm-cores" value="3">
  40 cores
</label>

<button type="button" class="quiz-submit">
  Check answer
</button>

  </form>
  <p class="quiz-feedback" aria-live="polite"></p>
</div>

---

## 8. Reading the output and checking success

Once a CP2K calculation finishes, the first and most important step is to inspect the main output file (for example `example-project.out`). This file contains the full log of the run, including system details, SCF progress, warnings, timings, and the final energy.

A quick sanity check usually involves:

<ol>
  <li><strong>Open the main output file</strong> (the one given via <span class="inline-code">-o</span>).</li>
  <li><strong>Scroll to the bottom</strong> and check for a clean termination banner, for example:</li>
</ol>

<pre class="code-block" data-lang="text">
  <code>
  **** **** ******  **  PROGRAM ENDED AT                 YYYY-MM-DD hh:mm:ss.sss
 ***** ** ***  *** **   PROGRAM RAN ON                                  hostname
 **    ****   ******    PROGRAM RAN BY                                  username
 ***** **    ** ** **   PROGRAM PROCESS ID                     project_id_number
  **** **  *******  **  PROGRAM STOPPED IN    /path/to/workdir/project_id_number
  </code>
</pre>

<ol start="3">
  <li><strong>Look for a final energy summary</strong>, especially if you are running DFT via Quickstep.</li>
</ol>

<pre class="code-block" data-lang="text">
  <code>
  *** SCF run converged in XX steps ***


  Electronic density on regular grids:          X.XXXXXXXXXX        X.0000000000
  Core density on regular grids:                X.XXXXXXXXXX        X.XXXXXXXXXX
  Total charge density on r-space grids:        X.XXXXXXXXXX
  Total charge density g-space grids:           X.XXXXXXXXXX

  Overlap energy of the core charge distribution:               X.XXXXXXXXXXXXXX
  Self energy of the core charge distribution:                  X.XXXXXXXXXXXXXX
  Core Hamiltonian energy:                                      X.XXXXXXXXXXXXXX
  Hartree energy:                                               X.XXXXXXXXXXXXXX
  Exchange-correlation energy:                                  X.XXXXXXXXXXXXXX
  Dispersion energy:                                            X.XXXXXXXXXXXXXX
  Electronic entropic energy:                                   X.XXXXXXXXXXXXXX
  Fermi energy:                                                 X.XXXXXXXXXXXXXX

  Total energy:                                                 X.XXXXXXXXXXXXXX
  </code>
</pre>

<ol start="4">
  <li><strong>Check for warnings</strong> and messages printed in ALL CAPS, such as missing files, basis issues, or SCF convergence problems.</li>
  <li><strong>Verify no <span class="inline-code">[ABORT]</span> blocks appear</strong>, as these mean the run stopped prematurely. <br>For example, if the SCF did not converge:</li>
</ol>

<pre class="code-block" data-lang="text">
  <code>
 *******************************************************************************
 *   ___                                                                       *
 *  /   \                                                                      *
 * [ABORT]                                                                     *
 *  \___/     SCF run NOT converged. To continue the calculation regardless,   *
 *    |             please set the keyword IGNORE_CONVERGENCE_FAILURE.         *
 *  O/|                                                                        *
 * /| |                                                                        *
 * / \                                                            qs_scf.F:632 *
 *******************************************************************************
  </code>
</pre>

The [CP2K documentation](https://www.cp2k.org) explains the energy components and SCF behavior in further detail.


<div class="interactive-test" data-test-id="cp2k-output-check">
  <p>
    You scroll to the end of the output file and you see a "Total energy" **and** the warning:<br>
    `SCF run NOT converged. To continue the calculation regardless, please set IGNORE_CONVERGENCE_FAILURE.`<br>
    What is the most appropriate next step?
  </p>

  <form class="quiz" data-answer="2">

<div class="quiz-correct hidden">
  Correct. SCF failure means the electronic structure did not converge; the next step is to adjust the input and improve convergence settings rather than blindly forcing the run to continue. For more info about the SCF settings, see the <a href="https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT/SCF.html">CP2K manual</a>.
</div>

<div class="quiz-wrong hidden">
  Not quite. When CP2K aborts due to non-convergence, the correct response is to modify the input and improve SCF stability before rerunning. You also do not neccessarily need to change the geometry, as the issue may be purely electronic. For more info about the SCF settings, see the <a href="https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT/SCF.html">CP2K manual</a>.
</div>

<label>
  <input type="radio" name="cp2k-output-check" value="0">
  Set IGNORE_CONVERGENCE_FAILURE and run the same input again.
</label>

<label>
  <input type="radio" name="cp2k-output-check" value="1">
  If the input truely failed, there would not have been a total energy printed. So ignore we can safely ignore the warning and use the energy provided.
</label>

<label>
  <input type="radio" name="cp2k-output-check" value="2">
  Improve SCF settings (e.g. smearing, mixing, better initial guess) and rerun.
</label>

<label>
  <input type="radio" name="cp2k-output-check" value="3">
  There is something wrong with the geometry, so change the atomic coordinates and rerun.
</label>

<button type="button" class="quiz-submit">
  Check answer
</button>

  </form>
  <p class="quiz-feedback" aria-live="polite"></p>
</div>


---

## 9. Restarts and continuing runs

Many realistic CP2K workflows *cannot* be completed in a single execution, either because they exceed the wall time limit, involve multiple simulation phases, or intentionally reuse previously converged electronic states. CP2K is designed for these situations and can write **restart files** that store the essential state of the calculation: **coordinates**, **velocities**, **wavefunctions**, **density matrices**, or even the **SCF history**.

The restart capability is useful for:

* **Recovering** from a scheduler timeout instead of discarding partial progress.
* **Switching** from a cheaper “preconverged” calculation to a more accurate one (for example: LDA to PBE, smaller cutoff to larger cutoff, or pure DFT to hybrid DFT).
* **Multi-stage workflows** such as equilibration, annealing, production MD, or metadynamics.
* **Incremental geometry optimization**, where intermediate electronic states help subsequent steps converge faster.

CP2K writes **two different kinds of restart files**, and they serve different purposes.

### 9.1. The `.restart` file

This is a **structured text file** containing metadata needed to continue a calculation.
It can store (depending on settings):

* atomic positions
* velocities
* cell parameters
* thermostat state
* barostat state
* counters and MD step index
* metadynamics hills
* bead positions in PIMD
* and many other internal states

This behavior is controlled by keywords in [`&EXT_RESTART`](https://manual.cp2k.org/trunk/CP2K_INPUT/EXT_RESTART.html), for example:

<pre class="code-block" data-lang="fortran">
  <code>
&EXT_RESTART
  RESTART_FILE_NAME example-project-1.restart
&END EXT_RESTART
  </code>
</pre>

The `&EXT_RESTART` section has [many options](https://manual.cp2k.org/trunk/CP2K_INPUT/EXT_RESTART.html) to control what is written and read from the restart file. For example, you can choose to restart only positions, or positions and velocities, or also thermostat state, etc.

Setting these parameters can be a little bit tricky, however, so let's look at some practical examples.

- By default, if `&EXT_RESTART` is not present, CP2K does **not** read any restart file.
- If `&EXT_RESTART` is present with only `RESTART_FILE_NAME`, CP2K reads the restart file with **all available data**, because `RESTART_DEFAULT` is `.TRUE.` by default.
  - If you set `RESTART_DEFAULT .FALSE.`, no data is read.
- If you explicitly set e.g. `RESTART_POS .TRUE.`, then **only this data** is read from the restart file.
  - In other words, `RESTART_DEFAULT` is overridden by any explicit `RESTART_* .TRUE.` settings.
- If you explicitly set e.g. `RESTART_POS .FALSE.`, then **only this data** is **not** read from the restart file, while other data is.

<div class="interactive-test" data-test-id="cp2k-ext-restart-basics">
  <p>
    You run CP2K with the following restart settings:
  </p>

```fortran
&EXT_RESTART
  RESTART_FILE_NAME example-project-1.restart
  RESTART_DEFAULT .TRUE.
  RESTART_VEL .FALSE.
&END EXT_RESTART
```

  <p>
    Assuming `example-project-1.restart` contains positions, velocities, cell, and thermostat state, what will CP2K actually read from the restart file?
  </p>

  <form class="quiz" data-answer="2">

  <div class="quiz-correct hidden">
    Correct. `RESTART_DEFAULT .TRUE.` activates all restartable quantities, and `RESTART_VEL .FALSE.` selectively disables velocities, so positions, cell, thermostat state and all other restart data are read, but velocities are not.
  </div>

  <div class="quiz-wrong hidden">
    Not quite. `RESTART_DEFAULT` controls the global default, and explicit `RESTART_*` keywords refine that behavior. In this case, everything that can be restarted is read except the velocities, which are explicitly disabled with `RESTART_VEL .FALSE.`.
  </div>

  <label>
    <input type="radio" name="cp2k-ext-restart-basics" value="0">
    **Only velocities** are read, because `RESTART_VEL .FALSE.` sets everything except velocities to false.
  </label>

  <label>
    <input type="radio" name="cp2k-ext-restart-basics" value="1">
    **No data** is read, since `RESTART_VEL .FALSE.` overrides `RESTART_DEFAULT .TRUE.`.
  </label>

  <label>
    <input type="radio" name="cp2k-ext-restart-basics" value="2">
    **All** restartable quantities, **except velocities**, are read.
  </label>

  <label>
    <input type="radio" name="cp2k-ext-restart-basics" value="3">
    **All** restartable quantities are read, because `RESTART_DEFAULT .TRUE.` overrides `RESTART_VEL .FALSE.`.
  </label>

  <button type="button" class="quiz-submit">
    Check answer
  </button>

  </form>
  <p class="quiz-feedback" aria-live="polite"></p>
</div>


### 9.2. The `.wfn` file

This is a **binary wavefunction file** containing the electronic state:

* Molecular orbital coefficients
* Orbital occupations
* Electronic density information

It does **not** store coordinates, velocities, cell parameters, thermostat data, or MD history. 
It is used to let CP2K restart an SCF cycle from an already converged electronic structure, instead of building the wavefunction from scratch.

It should be requested through `SCF_GUESS RESTART` and the wavefunction file name can be defined via `WFN_RESTART_FILE_NAME`, for example:

<pre class="code-block" data-lang="fortran">
  <code>
&DFT
  WFN_RESTART_FILE_NAME example-RESTART.wfn
  &SCF
    SCF_GUESS RESTART
  &END SCF
&END DFT
  </code>
</pre>

A `.wfn` file is safe to reuse as an initial SCF guess as long as the basis sets, pseudopotentials and number and type of atoms are unchanged. Geometry and many DFT settings (such as adding dispersion or tightening SCF thresholds) can change; the wavefunction will just be iterated to the new self consistent solution.


<div class="interactive-test" data-test-id="cp2k-wfn-validity">
  <p>
    You finished a DFT run using PBE, TZV2P basis sets, and GTH-PBE pseudopotentials,
    producing the file `water-RESTART.wfn`.
    In which scenario can this wavefunction file still be safely reused?
  </p>

  <form class="quiz" data-answer="2">

  <div class="quiz-correct hidden">
    Correct. Changing SCF convergence settings does not modify the underlying
    electronic basis, so the `.wfn` file remains valid and can be reused.
  </div>

  <div class="quiz-wrong hidden">
    Not quite. A `.wfn` file is only valid if the basis sets, pseudopotentials,
    and number and types of atoms stay the same. Most other changes invalidate it,
    even if CP2K does not immediately crash.
  </div>

  <label>
    <input type="radio" name="cp2k-wfn-validity" value="0">
    Switching the XC functional from PBE to SCAN.
  </label>

  <label>
    <input type="radio" name="cp2k-wfn-validity" value="1">
    Keeping PBE, but changing all oxygen atoms from TZV2P to TZVP basis sets.
  </label>

  <label>
    <input type="radio" name="cp2k-wfn-validity" value="2">
    Tightening SCF convergence settings (e.g. smaller `EPS_SCF`).
  </label>

  <label>
    <input type="radio" name="cp2k-wfn-validity" value="3">
    Making the cell size larger, but adding new atoms to keep the density the same.
  </label>

  <button type="button" class="quiz-submit">
    Check answer
  </button>

  </form>
  <p class="quiz-feedback" aria-live="polite"></p>
</div>



---

## 10. Practical use of CP2K documentation

When using CP2K, a few good habits I would suggest are:

* Keep a browser tab open with the [CP2K manual](https://manual.cp2k.org/).
* For methods such as geometry optimization or MD, start from the method specific tutorials in the manual, which provide complete example inputs.
* Use my [CP2K Input Generator](/tools/cp2k-input-generator/) to create initial inputs :)

You can also generate an input reference that exactly matches your executable by running CP2K with special flags:

<pre class="code-block" data-lang="bash">
  <code>
cp2k.psmp --xml
  </code>
</pre>

This tells CP2K to print an <abbr title="eXtensible Markup Language">XML</abbr> representation of the full input tree and defaults (the entire keyword hierarchy).

---

## 11. Summary

In this tutorial we focused on the **workflow** of running CP2K:

* How to obtain and check a CP2K executable on a cluster or local machine.
* What the main binaries mean and how MPI and OpenMP combine.
* How to organise a run directory and point CP2K to its data files.
* How to write a minimal but valid input file while relying on the official input reference for the details.
* How to run CP2K interactively and through a scheduler such as SLURM.
* How to perform basic success checks and where to look first when something fails.
* How to connect your executable to matching documentation using the CP2K manual and `--xml` or related flags.

Once this workflow is comfortable, you can move on to more method specific workflows, more advanced input features, and performance tuning. At that point CP2K becomes just one component in a larger toolchain: pre processing, simulation, and post processing all linked together by scripts and analysis codes.

---

{% include quiz.html %}