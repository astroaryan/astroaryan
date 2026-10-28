# Interactive astronomy visualizations

Implemented on 2026-10-28 using plain JavaScript, native HTML controls, and transparent SVGs. The planet-equilibrium visualization is followed by the blackbody spectrum. Scientific conventions come from `quick_visualizations/planet_equilibrium_temperature.ipynb` and `quick_visualizations/blackbody_flambda.ipynb`. Both work as ordinary static files, including when `visualizations.html` is opened directly in a browser.

## Architecture

Use plain JavaScript for the calculations and interaction, HTML range inputs for the sliders, and an inline SVG for the star, planet, orbit, photons, and labels. SVG suits this small collection of shapes and remains sharp when resized. Keep its background transparent so the existing red nebula is visible underneath. No framework, build system, or Python server is needed for this implementation.

The repository is already a static HTML/CSS/JavaScript site. This approach fits its existing hosting model; [GitHub Pages serves static HTML, CSS, and JavaScript](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages). Use [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) for mouse, touch, and pen dragging, and [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) for animation timed to elapsed seconds.

Keep Python as the scientific reference and use it once to export colour tables and reference results. The web version translates the equations into JavaScript. It will not execute the notebook in visitors' browsers.

| Approach | Fit for this visualization |
| --- | --- |
| JavaScript + SVG | Recommended: direct manipulation, transparent graphics, native browser controls, and existing static hosting. |
| Matplotlib animation exported to HTML/video | Useful for predetermined playback, but does not itself implement recalculation and arbitrary planet dragging. |
| Notebook widget embed | An exported widget state is not a running Python kernel. These `interactive(...)` callbacks calculate and draw in Python, so exporting controls alone does not reproduce them. |
| Python web application | Can retain Python callbacks, but adds a separate runtime/service and hosting requirements. |
| Python/WebAssembly in the browser | Possible, but introduces runtime/package loading and integration work that these short equations do not require. |

Jupyter documents [embedding saved widget state](https://ipywidgets.readthedocs.io/en/stable/embedding.html), while Matplotlib's [backend documentation](https://matplotlib.org/stable/users/explain/figure/backends.html) describes notebook integrations and the server used by WebAgg. These are alternatives, not prerequisites for the recommended port.

## Files and page structure

```text
astroaryan_space/
├── visualizations.html
└── visualizations/
    ├── visualizations.css
    ├── colormaps.js
    ├── physics.js
    ├── controls.js
    ├── planet-equilibrium-temperature.js
    ├── blackbody.js
    ├── export_reference.py
    ├── reference-values.json
    ├── check-physics.cjs
    └── README.md
```

`visualizations.html` remains beside `index.html`, `constellations.html`, and `resources.html`. The shared navigation reads Constellation Games → Visualizations → Astronomy Resources. The new page reuses `style1.css`, the quiz panel's dotted border and nebula, and `variables.js` for the contact address. Its footer describes Aryan's astrophysics and STEM outreach interests; the Sagittarius footer remains on Constellation Games.

`physics.js` holds the numerical functions; `controls.js` contains small shared helpers for SVG elements and accessible native inputs. Each visualization has its own interaction/rendering script. The scripts load in order with `defer`; no build, CDN, framework, server-side Python, or runtime downloads are required.

The nebula is the same `images/constellationbackground2.png` used by the quiz, with its original alpha 165/255 (approximately 64.7% opacity). The SVG backgrounds are transparent. Flexbox lays out controls beside each diagram on desktop, wraps controls on tablets, and stacks them on phones. Plot bounds and equal scaling are retained for the orbit diagrams. On narrow phones, duplicate in-diagram star/temperature labels are hidden; readable values remain above and below the figure. Blackbody tick spacing and font sizes adapt to the available width, with full flux units repeated beneath the plot.

## Exact controls from the notebook

The notebook contains **two separate orbit views**. The circular/eccentric selector retains separate settings for each, and Reset planet restores the active view's notebook defaults.

| Control | Default | Minimum | Maximum | Step | Applies to |
| --- | ---: | ---: | ---: | --- | --- |
| Stellar radius, solar radii | 0.3 | 0.2 | 3.0 | 0.02 | Both |
| Stellar temperature, K | 3150 | 2500 | 8000 | 50 | Both |
| Bond albedo | 0.0 | 0.0 | 1.0 | 0.05 | Both |
| Circular distance, AU | 0.02 | 0.01 | 30 | 0.01 in log10(distance) | Circular |
| Semimajor axis, AU | 0.02 | 0.01 | 30 | 0.01 in log10(a) | Eccentric |
| Eccentricity | 0.4 | 0.0 | 0.75 | 0.01 | Eccentric |
| True anomaly, radians | 0.0 | 0.0 | 2π | 0.05 | Eccentric |

The logarithmic inputs use base 10 with exponent limits -2 and log10(30), not linear steps of 0.01 AU. Preserve the exact initial 0.02 AU and the upper 30 AU endpoint: these do not fall neatly on an exponent grid anchored at -2. Similarly, preserve the exact 2π endpoint even though 0.05 does not divide 2π. The range inputs use `step="any"` internally and explicit snapping in their input handlers, so initialization, Reset, and Home/End preserve these exact values. Mouse and keyboard slider changes snap to the notebook step grid with explicit upper-endpoint handling. Number fields additionally allow direct in-range values, including values between slider stops; temperature fields retain integer values.

Preserve label formatting: temperature in whole kelvin with thousands separators; orbital distances to three significant figures; albedo, eccentricity, and anomaly to two decimals. The circular diagram displays radius to one decimal place, while the eccentric diagram uses two. Keep these notebook conventions even though the circular label rounds some distinct radius settings to the same text. Slider accessible readouts are formatted explicitly; number fields show editable parameter values.

## Physics and boundaries

Use the notebook constants exactly: solar radius = 6.957e8 m; AU = 1.495978707e11 m. Convert solar radii and AU to metres before evaluating the temperature.

```text
T_eq = T_star × sqrt(R_star / (2r)) × (1 − A_B)^(1/4)

Circular:   r = a
Eccentric:  r = a(1 − e²) / (1 + e cos(ν))
Perihelion: q = a(1 − e)
Aphelion:   Q = a(1 + e)
```

This assumes zero internal heating and uniform redistribution across the whole planet. It includes no greenhouse effect or thermal lag. The eccentric view uses the current separation, so it is an instantaneous equilibrium estimate rather than an orbit-averaged temperature. Keep the notebook's terminology, including “perihelion” and “aphelion.”

At albedo 1, the result is exactly 0 K in this model. The 2000 K limit is a **colour-scale saturation**, not a cap on the calculated temperature. The allowed 0.01–30 AU interval bounds circular distance or eccentric semimajor axis, not the instantaneous eccentric separation: at the full allowed extremes, separation can span 0.0025–52.5 AU.

Keep the notebook's warnings and continue drawing/calculating when they appear:

- Circular: warn if distance in metres is less than or equal to stellar radius in metres.
- Eccentric: warn if perihelion in metres is less than or equal to stellar radius in metres, even when the planet is currently elsewhere in its orbit.

Do not substitute visual overlap for either test: the drawing is deliberately not to physical scale. The permitted inputs include star-crossing cases. Do not silently clamp them away or reinterpret them as valid planetary orbits.

Reference checks calculated directly from the notebook equations:

| Case | Separation | Temperature | Display |
| --- | ---: | ---: | --- |
| Circular defaults | 0.02 AU | 588.2873111641347 K | 588 K |
| Eccentric defaults, ν = 0 | 0.012 AU | 759.4756529746115 K | 759 K |
| Eccentric defaults, ν = π | 0.028 AU | 497.19352403316736 K | 497 K |
| Either view, albedo = 1 | Any allowed separation | 0 K | 0 K |

## Drawing and colour conventions

Preserve the notebook's representative coordinates and equal axis scaling. Use an SVG coordinate transform that keeps the notebook's positive-y-up convention; SVG's native y direction is downward. Keep text upright. A transparent drawing and light text suitable for the nebula replace the notebook's white plotting surface; scientific colours and numeric conventions remain unchanged. Fonts and antialiasing will differ between Matplotlib and browsers, so the goal is matching science, geometry, and colour values rather than pixel-identical raster output.

Shared geometry:

- Distance fraction = log10(a / 0.01) / log10(30 / 0.01), using circular distance in the circular view and semimajor axis in the eccentric view.
- Stellar display radius = 0.4 × stellar radius in solar units; planet display radius = 0.07.
- Stellar glow radii = 1.7 and 1.35 times stellar display radius, at alpha 0.06 and 0.10.
- Planet outline = gray, linewidth 0.8 in notebook points. Orbit = dashed gray, alpha 0.45 circular or 0.55 eccentric. Photon alpha = 0.8.
- Retain the notebook layering: orbit behind photons, stellar disk over photons, planet over the disk where they overlap.

| Geometry | Circular view | Eccentric view |
| --- | --- | --- |
| Star centre | (1.3, 0) | (1.8, 0) |
| Orbit | Radius = planet_x − 1.3; ellipse width = 2 × radius, height = 0.65 × radius | Display semimajor axis d = 1.3 + 1.2 × distance fraction; semiminor axis = d sqrt(1 − e²); centre = (1.8 + de, 0) |
| Planet | x = 2.6 + 1.2 × distance fraction; y = 0 | Display separation s = d(1 − e²)/(1 + e cos(ν)); x = 1.8 − s cos(ν); y = s sin(ν) |
| Plot bounds | x: 0–5.5; y: −2.2–2.2 | x: −1–7; y: −2.65–2.5 |
| Original figure size | 9 × 4.5 inches | 9 × 5 inches |

The eccentric star is at the left focus: ν = 0 places the planet to its left at perihelion; ν = π places it to the right at aphelion. Increasing ν initially moves it upward. Do not accidentally mirror this when converting to SVG.

Circular photons are six right-pointing triangles, size 18 points², spaced evenly from star_x + star_display_radius + 0.12 to planet_x − 0.18; draw them only when the end exceeds the start. Eccentric photons are six dots, size 14 points², along the star-to-planet direction from star_display_radius + 0.12 to display separation − 0.12; draw only when display separation exceeds star_display_radius + 0.15. These glyphs are schematic radiation indicators.

Carry over the titles, radius/stellar-temperature labels, planet temperature label, parameter summary, and status line. Circular label positions are (1.3, 1.25), (planet_x, 0.38), (2.75, −1.55), and (2.75, −1.9). Eccentric labels use star (1.8, 1.85), planet (planet_x, planet_y + 0.2), parameters (3, −2.1), and status (3, −2.4); move the planet label right by 0.1 and left-align it if planet_x < 0.3. Label both apsides at y = −0.22. Warning text is crimson; secondary labels are gray in the notebook. The web version uses light labels with a dark text outline over the nebula. Warnings use white text on a dark crimson-tinted strip with a crimson border for legibility.

Stellar colour uses `LinearSegmentedColormap.from_list` with evenly spaced stops `#d73027`, `#f28e2b`, `#ffd84d`, and `#70a7ff`, evaluated at (T_star − 2500) / 5500. Planet colour uses Matplotlib `coolwarm` evaluated at clip(T_eq / 2000, 0, 1).

The checked-in tables were exported from the notebook's `astro_work` environment using **Matplotlib 3.10.0**: 256 RGB entries for each of the stellar and `coolwarm` colormaps. The JavaScript lookup uses the same clipped, discrete indexing, including the upper endpoint, and retains floating-point channels rather than approximating the maps with CSS gradients. The notebook itself does not record an installed Matplotlib version, so this is the version of the available source environment used for verification.

## Planet interaction and animation

Sliders update the diagram, colours, temperature, and warnings immediately. Number fields commit exact in-range values when leaving the field. Empty or invalid entries restore the last value. Reset restores the active mode's original settings.

- Circular mode: horizontal planet dragging inverts the notebook's logarithmic display mapping and changes distance, clamped to 0.01–30 AU. The planet stays on the notebook's horizontal track.
- Eccentric mode: dragging projects the planet onto its current ellipse and changes true anomaly; semimajor axis and eccentricity remain fixed. Manual dragging snaps to the anomaly slider's steps. Arrow keys, Home/End, and PageUp/PageDown work on both the sliders and the focusable planet handle.
- Playback starts paused and is available in eccentric mode. It advances mean anomaly uniformly, solves Kepler's equation, and converts to true anomaly. A complete orbit takes an illustrative 12 seconds. This is not a physical period: the notebook specifies no stellar mass. Animation can interpolate between the manual slider's 0.05-radian steps.
- Changing a control, dragging, switching modes, resetting, hiding the page, or switching to reduced-motion preference pauses playback. Explicit Play remains available with reduced motion; nothing autoplays.
- The planet has a minimum 44-pixel invisible pointer target. Pointer capture keeps dragging active outside the original hit area and handles pointer cancellation/release. Photon markers retain the notebook's six static glyphs.

Desktop SVG labels follow the notebook's placement. The titles, parameter summaries, and warning/status lines sit in normal HTML around the diagram so they wrap and remain readable on phones. Geometry and physical boundaries retain the notebook conventions.

## Blackbody spectrum

The second visualization follows `blackbody_flambda.ipynb`:

| Parameter or convention | Value |
| --- | --- |
| Temperature | Default 588 K; minimum 200 K; maximum 6000 K; slider step 30 K |
| Wien peak | 2897.8 / T, in μm |
| Wavelength samples | 500 equally spaced points from 0.1 to 5 times the Wien peak |
| Planck constant h | 6.62607015e−34 J s |
| Speed of light c | 299792458 m/s |
| Boltzmann constant k_B | 1.380649e−23 J/K |
| Surface flux | Fλ = πBλ; multiply the per-metre result by 1e−6 for W m−2 μm−1 |
| Denominator | `expm1(hc / (λk_BT))`, matching NumPy's stable exponential calculation |
| Plot axes | Linear; rescaled on every update with Matplotlib's default 5% data margins |
| Peak line | Gray dashed line at the Wien peak; label to two decimals |
| Curve | Notebook RGB interpolation; 2.5-point stroke with a 3.5-point dark outline |

The exact initial 588 K is retained even though it is not on the 30 K grid anchored at 200 K. Reset returns to 588 K; Home/End reach exactly 200/6000 K. Manual slider movement snaps to its step grid; the number field accepts any integer within the bounds.

All 16 colour-table rows are taken directly from the notebook. Linear interpolation occurs independently in the supplied sRGB channels, exactly as with its `np.interp` calls. These colours approximate visible blackbody colour with normalized brightness and clipped gamut; the plot explains that cold blackbodies emit almost no visible light. The controls are independent of the planet-temperature visualization, matching the separate notebooks.

## Regenerating references and checking the code

`export_reference.py` reads colour definitions and physical constants from the two source notebooks, exports the colormaps, and calculates independent NumPy references. Run it with a Python environment containing NumPy and Matplotlib:

```sh
python visualizations/export_reference.py /path/to/quick_visualizations
node visualizations/check-physics.cjs
```

Python is a development tool only. The exported data and numerical checks are already included; visitors need only a browser. Regenerate references intentionally when the notebook conventions change, and review changes in the exported Matplotlib version.

The numerical checks cover 100 planet cases (defaults, parameter extremes, both orbital endpoints, and the stellar-surface boundary), six complete 500-point blackbody spectra, both colour mappings, circular/eccentric consistency at e = 0, Kepler conversion round trips, uncapped temperatures above 2000 K, zero absorption at unit albedo, warnings, and exact control endpoints. Browser verification covers desktop widths down to 320 pixels, mouse and emulated touch dragging, slider and planet keyboard controls, independent mode settings, warning states, playback/pause/reset, and spectrum rescaling. Browser fonts and antialiasing differ from Matplotlib; numerical outputs and colour-table values are matched, rather than raster pixels.
