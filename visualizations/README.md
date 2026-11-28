# Interactive astronomy visualizations

Implemented on 2026-10-28 using plain JavaScript, native HTML controls, and SVGs. The planet-equilibrium visualization uses a black starfield; the blackbody spectrum uses a white plotting surface. Scientific conventions come from `quick_visualizations/planet_equilibrium_temperature.ipynb` and `quick_visualizations/blackbody_flambda.ipynb`, with a radius and luminosity extension documented below. Both work as ordinary static files, including when `visualizations.html` is opened directly in a browser.

## Architecture

Use plain JavaScript for the calculations and interaction, HTML range inputs for the sliders, and an inline SVG for the star, planet, orbit, photons, and labels. SVG suits this small collection of shapes and remains sharp when resized. Keep the existing red nebula around the plots and white results panels. No framework, build system, or Python server is needed for this implementation.

The repository is already a static HTML/CSS/JavaScript site. This approach fits its existing hosting model; [GitHub Pages serves static HTML, CSS, and JavaScript](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages). Use [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) for mouse, touch, and pen dragging, and [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) for animation timed to elapsed seconds.

Keep Python as the scientific reference and use it once to export colour tables and reference results. The web version translates the equations into JavaScript. It will not execute the notebook in visitors' browsers.

| Approach | Fit for this visualization |
| --- | --- |
| JavaScript + SVG | Direct manipulation, scalable graphics, native browser controls, and existing static hosting. |
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
    ├── visualizations.js
    ├── visualizations.css
    └── README.md
```

`visualizations.html` remains beside `index.html`, `constellations.html`, and `resources.html`. The shared navigation reads Constellation Games → Visualizations → Astronomy Resources. The new page reuses `style1.css`, the quiz panel's dotted border and nebula, and `variables.js` for the contact address. Its footer describes Aryan's astrophysics and STEM outreach interests; the Sagittarius footer remains on Constellation Games.

The only visualization-specific browser dependencies are `visualizations.js` and `visualizations.css`. The README is documentation for future maintenance. `visualizations.html` stays in the repository root and also uses the existing shared `style1.css`, `variables.js`, and image assets.

`visualizations.js` combines the colour tables, scientific equations, control/SVG helpers, and the three visualization controllers in clearly marked sections. It loads once with `defer`; no build, CDN, framework, server-side Python, or runtime downloads are required. The existing function scopes are retained so combining files does not change their behaviour. Add future visualizations as another labelled section while the script remains manageable. Equilibrium-temperature and RV dragging use separate named start/move/end functions and independent drag state in the same script. The equilibrium planet retains its original direct true-anomaly mapping. Their coordinate helper uses the displayed SVG bounds and the default xMidYMid meet viewBox alignment, so pointer coordinates and grab sizes follow CSS zoom and letterboxing.

The previous files had these roles:

| Previous file | Purpose | Current location/status |
| --- | --- | --- |
| `colormaps.js` | Exact sampled RGB colour tables used by the diagrams | Included in `visualizations.js`; the colour data is still required |
| `physics.js` | Temperature, orbital geometry, Kepler motion, and Planck-spectrum equations | Included in `visualizations.js` |
| `controls.js` | Shared native sliders, numeric inputs, and SVG helpers | Included in `visualizations.js` |
| `planet-equilibrium-temperature.js` and `blackbody.js` | The two interactive displays | Included in `visualizations.js` |
| `export_reference.py` | Development-only generator for colours and numerical references | Removed; never needed by the website |
| `reference-values.json` | Expected Python outputs consumed by the regression checker | Removed; never loaded by the website |
| `check-physics.cjs` | Node.js regression checker comparing JavaScript outputs with Python references | Removed; never loaded by the website |

The standalone automated checker and its fixtures are intentionally omitted from this minimal file set. The numerical conventions, reference cases, colour provenance, and verification procedure remain documented below. Original notebooks remain the scientific source of truth. Update or regenerate comparisons from them when changing the science, not when making presentation-only edits.

The nebula is the same `images/constellationbackground2.png` used by the quiz, with its original alpha 165/255 (approximately 64.7% opacity). The introduction above the visualizations uses the Constellation Games blue-purple background and text formatting. The orbit has a black background with 100 small, static SVG stars; the blackbody plot stays white. Flexbox puts controls on the left, the plot in the middle, and a white results panel on the right for both visualizations. Below 1100 pixels, results move beneath the plot; below 760 pixels, controls, plot, and results stack. Orbit bounds and equal scaling are retained. Blackbody tick spacing and font sizes adapt to the available width; axis units remain visible on phones.

Number-input stepper arrows are hidden in Chromium, Safari, and Firefox. Users can drag sliders or type exact values; accessible keyboard slider controls remain available. Do not restore clickable increment/decrement buttons.

The planet results panel contains equilibrium temperature, current distance, perihelion, aphelion, warnings when applicable, the equation, and a short dragging instruction. Configurable values appear only in the controls; do not restore duplicate star labels or parameter summaries. Reset planet and Play/Pause orbit sit directly below true anomaly. The equilibrium equation is an inline SVG in `visualizations.html`, typeset from TeX notation with Matplotlib MathText. Its vector glyph paths stay sharp without a browser math library, external image, or extra repository file; an SVG title supplies accessible text. If the equation changes, regenerate the paths from `T_{\mathrm{eq}} = T_\star\sqrt{\frac{R_\star}{2r}}\,(1-A_{\mathrm{B}})^{1/4}` using the DejaVu Serif math font, or replace them with an equivalent typeset SVG.

The temperature heading is simply “Equilibrium temperature: … K”; current distance is shown once in its own derived-value row. The blackbody panel contains total luminosity, peak wavelength, and typeset Stefan–Boltzmann and Planck equations. Its plot has a spectrum title, curve, and axes, with no peak line or legend. All equations are inline vector SVGs with accessible titles and unique glyph IDs, so the folder still needs only the same three files.

## Exact controls from the notebook

The notebook contains two separate orbit views. The website uses its eccentric-orbit model and defaults for a single interface. Set eccentricity to zero for a circular orbit. Reset planet restores all six defaults and pauses playback.

| Control | Default | Minimum | Maximum | Step |
| --- | ---: | ---: | ---: | --- |
| Stellar radius, solar radii | 0.3 | 0.2 | 3.0 | 0.02 |
| Stellar temperature, K | 3150 | 2500 | 8000 | 50 |
| Bond albedo | 0.0 | 0.0 | 1.0 | 0.05 |
| Semimajor axis, AU | 0.02 | 0.01 | 30 | 0.01 in log10(a) |
| Eccentricity | 0.4 | 0.0 | 0.75 | 0.01 |
| True anomaly, radians | 0.0 | 0.0 | 2π | 0.05 |

The logarithmic inputs use base 10 with exponent limits -2 and log10(30), not linear steps of 0.01 AU. Preserve the exact initial 0.02 AU and the upper 30 AU endpoint: these do not fall neatly on an exponent grid anchored at -2. Similarly, preserve the exact 2π endpoint even though 0.05 does not divide 2π. The range inputs use `step="any"` internally and explicit snapping in their input handlers, so initialization, Reset, and Home/End preserve these exact values. Mouse and keyboard slider changes snap to the notebook step grid with explicit upper-endpoint handling. Number fields additionally allow direct in-range values, including values between slider stops; temperature fields retain integer values.

Preserve label formatting: temperature in whole kelvin with thousands separators; orbital distances to three significant figures; radius, albedo, eccentricity, and anomaly to two decimals in formatted readouts. Slider accessible readouts are formatted explicitly; number fields show editable parameter values.

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

At albedo 1, the result is exactly 0 K in this model. The 2000 K limit is a **colour-scale saturation**, not a cap on the calculated temperature. The allowed 0.01–30 AU interval bounds semimajor axis, not the instantaneous separation: at the full allowed extremes, separation can span 0.0025–52.5 AU.

Warn if perihelion in metres is less than or equal to stellar radius in metres, even when the planet is currently elsewhere in its orbit. At eccentricity zero, this also checks the circular distance. Continue drawing, calculating, and displaying derived values when the warning appears. Do not substitute visual overlap for this test: the drawing is deliberately not to physical scale. The permitted inputs include star-crossing cases. Do not silently clamp them away or reinterpret them as valid planetary orbits.

Reference checks calculated directly from the notebook equations:

| Case | Separation | Temperature | Display |
| --- | ---: | ---: | --- |
| Defaults with e = 0 | 0.02 AU | 588.2873111641347 K | 588 K |
| Eccentric defaults, ν = 0 | 0.012 AU | 759.4756529746115 K | 759 K |
| Eccentric defaults, ν = π | 0.028 AU | 497.19352403316736 K | 497 K |
| Albedo = 1 | Any allowed separation | 0 K | 0 K |

## Drawing and colour conventions

Preserve the notebook's representative coordinates and equal axis scaling. Use an SVG coordinate transform that keeps the notebook's positive-y-up convention; SVG's native y direction is downward. Keep text upright. The orbit's starfield is decorative and does not affect its geometry, dragging, or scientific colours. Fonts and antialiasing will differ between Matplotlib and browsers, so the goal is matching science, geometry, and colour values rather than pixel-identical raster output.

Geometry from the notebook's eccentric view (also used when e = 0):

- Distance fraction = log10(a / 0.01) / log10(30 / 0.01), using semimajor axis.
- Stellar display radius = 0.4 × stellar radius in solar units; planet display radius = 0.07.
- Stellar glow radii = 1.7 and 1.35 times stellar display radius, at alpha 0.06 and 0.10.
- Planet outline = gray, linewidth 0.8 in notebook points. Orbit = dashed blue-gray (`#aab4c8`), alpha 0.75 for contrast against black. Photon alpha = 0.8.
- Retain the notebook layering: orbit behind photons, stellar disk over photons, planet over the disk where they overlap.

| Geometry | Value |
| --- | --- |
| Star centre | (1.8, 0) |
| Orbit | Display semimajor axis d = 1.3 + 1.2 × distance fraction; semiminor axis = d sqrt(1 − e²); centre = (1.8 + de, 0) |
| Planet | Display separation s = d(1 − e²)/(1 + e cos(ν)); x = 1.8 − s cos(ν); y = s sin(ν) |
| Plot bounds | x: −1–7; y: −2.65–2.5 |
| Original figure size | 9 × 5 inches |

The eccentric star is at the left focus: ν = 0 places the planet to its left at perihelion; ν = π places it to the right at aphelion. Increasing ν initially moves it upward. Do not accidentally mirror this when converting to SVG.

Photons are six dots, size 14 points², along the star-to-planet direction from star_display_radius + 0.12 to display separation − 0.12; draw only when display separation exceeds star_display_radius + 0.15. These glyphs are schematic radiation indicators.

Label both apsides at y = −0.22, hiding those labels when e = 0. Numeric results and warnings live in the HTML results panel rather than in the diagram. Apsis labels are light blue-gray against black; warnings use crimson text and a crimson border on white.

Stellar colour uses `LinearSegmentedColormap.from_list` with evenly spaced stops `#d73027`, `#f28e2b`, `#ffd84d`, and `#70a7ff`, evaluated at (T_star − 2500) / 5500. Planet colour uses Matplotlib `coolwarm` evaluated at clip(T_eq / 2000, 0, 1).

The checked-in tables were exported from the notebook's `astro_work` environment using **Matplotlib 3.10.0**: 256 RGB entries for each of the stellar and `coolwarm` colormaps. The JavaScript lookup uses the same clipped, discrete indexing, including the upper endpoint, and retains floating-point channels rather than approximating the maps with CSS gradients. The notebook itself does not record an installed Matplotlib version, so this is the version of the available source environment used for verification.

## Planet interaction and animation

Sliders update the diagram, colours, temperature, and warnings immediately. Number fields commit exact in-range values when leaving the field. Empty or invalid entries restore the last value. Reset restores all six original settings.

- Dragging projects the planet onto its current ellipse and changes true anomaly; semimajor axis and eccentricity remain fixed. This also works for e = 0. Manual dragging snaps to the anomaly slider's steps. Arrow keys, Home/End, and PageUp/PageDown work on both the sliders and the focusable planet handle.
- Playback starts paused. It advances mean anomaly uniformly, solves Kepler's equation, and converts to true anomaly. A complete orbit takes an illustrative 12 seconds. This is not a physical period: the notebook specifies no stellar mass. Animation can interpolate between the manual slider's 0.05-radian steps.
- Changing a control, dragging, resetting, hiding the page, or switching to reduced-motion preference pauses playback. Explicit Play remains available with reduced motion; nothing autoplays.
- The planet has a minimum 44-pixel invisible pointer target. Pointer capture keeps dragging active outside the original hit area and handles pointer cancellation/release. Photon markers retain the notebook's six static glyphs.

Keep layout-specific explanations out of the plot. The results panel remains readable on phones, and geometry and physical boundaries retain the notebook conventions.

## Blackbody spectrum

The blackbody visualization preserves the spectrum calculations from `blackbody_flambda.ipynb` and adds a spherical radius to convert surface flux into luminosity:

| Parameter or convention | Value |
| --- | --- |
| Temperature | Default 5600 K; minimum 200 K; maximum 10,000 K; slider step 30 K |
| Radius | Default 1 R☉; minimum 0.01 R☉; maximum 10 R☉; logarithmic slider step 0.01 in log10(R/R☉) |
| Wien peak | 2897.8 / T, in μm |
| Wavelength samples | 500 equally spaced points from 0.1 to 5 times the Wien peak |
| Planck constant h | 6.62607015e−34 J s |
| Speed of light c | 299792458 m/s |
| Boltzmann constant k_B | 1.380649e−23 J/K |
| Surface flux | Fλ = πBλ; multiply the per-metre result by 1e−6 for W m−2 μm−1 |
| Spectral luminosity | Lλ = 4πR²Fλ; divide by 3.828e26 W to plot in L☉ μm−1 |
| Total luminosity | L = 4πR²σT⁴; display L / L☉ to three significant figures |
| Stefan–Boltzmann constant σ | 5.670374419e−8 W m−2 K−4 |
| Solar conversion constants | R☉ = 6.957e8 m; L☉ = 3.828e26 W |
| Denominator | `expm1(hc / (λk_BT))`, matching NumPy's stable exponential calculation |
| Plot axes | Linear; rescaled on every update with Matplotlib's default 5% data margins |
| Peak readout | Two decimals in the right-hand panel; no line or legend on the plot |
| Curve | Interpolated CIE-derived blackbody colours; 2.5-point stroke with a 3.5-point dark outline |

The initial temperature is 5600 K. The exact upper endpoint 10,000 K is retained even though it is not on the 30 K grid anchored at 200 K. Reset returns to 5600 K and 1 R☉; Home/End reach the exact bounds of each slider. Manual slider movement snaps to its step grid; number fields accept in-range values between slider stops, with integer temperatures. This radius is independent of the stellar radius in the planet visualization.

The plotted spectrum uses the same 500-wavelength sampling, Planck function, and per-micrometre conversion as the notebook, multiplied by the sphere's surface area and divided by the solar luminosity. Its temperature range now extends beyond the notebook's 6000 K maximum to 10,000 K, and its curve colours follow the CIE-derived table described below. Changing radius scales every spectral-luminosity value by R² without changing peak wavelength or colour. Axes continue to rescale automatically, so the changing amplitude is reflected in the y-axis numbers. The total luminosity is calculated from Stefan–Boltzmann over **all wavelengths**, not by integrating the truncated displayed wavelength interval.

The nominal solar conversion constants follow [IAU 2015 Resolution B3](https://www.iau.org/common/Uploaded%20files/IAUGA2015-Resolution-B3-recommended-nominal-conversion.pdf). The Stefan–Boltzmann constant uses the displayed precision from [NIST CODATA 2022](https://physics.nist.gov/cuu/Constants/Table/allascii.txt).

The displayed equations use Bλ(T) = (2hc²/λ⁵)/(exp(x) − 1), x = hc/(λk_B T), Fλ = πBλ, Lλ = 4πR²Fλ, and L = 4πR²σT⁴. Regenerate the inline SVGs with Matplotlib MathText and the DejaVu Serif math font if these expressions change; prefix glyph IDs uniquely for each equation. In these formulas, use SI metres for wavelength and radius. Convert the resulting spectrum to per micrometre and solar luminosity units for the plotted axis.

Bλ is intensity per unit solid angle. Integrating its projected contribution over the outward hemisphere gives Fλ = integral(Bλ cos(θ) dΩ) = πBλ. This is the surface-flux convention used in the source notebook; multiplying by 4πR² then gives the sphere's emitted spectral power. [NRAO's radiation fundamentals](https://www.cv.nrao.edu/~sransom/web/Ch2.html#Ch2.E107) derives this angular factor.

Useful luminosity checks (values rounded): 588 K and 1 R☉ → 1.07696845e−4 L☉; the same temperature at 2 R☉ → four times that value; 1176 K at 1 R☉ → sixteen times the 588 K value; 5772 K at 1 R☉ → 0.999997624 L☉, displayed as 1 L☉. The tiny departure from exactly one uses the documented nominal constants and rounded solar effective temperature.

The blackbody colour table now contains 99 rows at 100 K intervals from 200 to 10,000 K. It replaces the notebook's 16 approximate colour knots at the user's request; stellar/coolwarm colours in the planet visualization remain unchanged. Colour is based on the whole visible Planck spectrum rather than the peak wavelength alone. The 10,000 K curve is pale blue-white, approximately `#cdd9ff`; 3000 K is approximately `#ffb86d`.

To regenerate the blackbody table, evaluate Bλ with the documented h, c, and k_B over 360–830 nm in 1 nm steps, multiply by the CIE 1931 2° colour-matching functions, and sum each XYZ component. Divide XYZ by its sum, convert with the [W3C XYZ-to-linear-sRGB matrix](https://www.w3.org/TR/css-color-4/#color-conversion-code) without chromatic adaptation, clip negative channels to zero, normalize by the maximum linear RGB channel, and apply the sRGB transfer function. Store channels rounded to six decimal places. Runtime interpolation remains linear in the stored sRGB channels. Brightness is normalized to keep the curve visible; the red curve at 200 K is illustrative because such a cool object has negligible visible emission.

Data attribution: CIE 2019, *Colour-matching functions of CIE 1931 standard colorimetric observer*, International Commission on Illumination (CIE), Vienna, AT, [DOI: 10.25039/CIE.DS.xvudnb9b](https://doi.org/10.25039/CIE.DS.xvudnb9b). Source: `CIE_xyz_1931_2deg.csv`, MD5 `17cca777db64b17170f06f67ce9d3ab7`, from the [official dataset](https://cie.co.at/datatable/cie-1931-colour-matching-functions-2-degree-observer). The source data and derived blackbody colour table are licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The original colour-matching data was transformed into temperature-indexed, brightness-normalized sRGB colours as described above; it is not distributed as an extra website asset.

The Stefan–Boltzmann and Planck SVGs both use a 160-unit viewBox width and identical glyph scale so their mathematical text has the same rendered size. The blackbody section ends with the radius/luminosity instruction. Both section titles use the same heading rule. The planet panel's 3-pixel white inset box-shadow draws inside the existing black background without altering panel or plot dimensions.

## Checking future changes

There is no retained test runner, fixture JSON, or Python exporter in this minimal directory. The website uses the embedded colour data directly and does not generate it at runtime. The source notebooks still provide an independent reference when scientific changes need verification.

1. For scientific edits, run the original notebooks and compare their results with the numerical functions in the **Scientific equations and display coordinates** section of `visualizations.js`. Preserve the constants, units, sample counts, colormap indexing, defaults, and endpoint conventions documented above.
2. Check circular defaults (588.2873111641347 K), eccentric defaults at perihelion (759.4756529746115 K), and eccentric defaults at aphelion (497.19352403316736 K). Check albedo 1 gives 0 K, e = 0 agrees with the circular case, stellar-surface warnings include equality, and temperatures above 2000 K remain uncapped.
3. For the blackbody curve, compare all 500 wavelength/flux samples at representative temperatures, including 200, 588, 6000, and 10,000 K. Check the Wien peak, micrometre conversion, and interpolated RGB channels. Validate spectral luminosity against an independent Planck implementation (such as Astropy BlackBody) with area and solar-unit conversions. Check R² scaling, T⁴ total-luminosity scaling, radius-independent peak wavelength, and the solar reference case.
4. If regenerating the planet colour tables, use Matplotlib 3.10.0 for matching results: create the stellar `LinearSegmentedColormap` from the four documented stops, sample that map and `coolwarm` at integer indices 0–255, and retain their floating-point RGB values. Regenerate the blackbody table using the CIE method documented above. Record any intentional version or colour changes here.
5. Open `visualizations.html` in a browser. Check defaults, e = 0, slider/number input, mouse and touch dragging, Play/Pause/Reset, warning states, and keyboard Home/End. Confirm the orbit has a black starfield, the spectrum and both results panels are white, all equations render, stepper arrows are hidden, and the planet buttons sit below true anomaly. Test widths down to 320 pixels and confirm there are no console errors or failed script loads.

During initial implementation and file consolidation, checks passed against 100 Python planet cases and six complete 500-point Python blackbody spectra, including colour mappings, Kepler conversions, and parameter boundaries. Browser checks covered mouse/touch controls and layouts from 320 to 1440 pixels. Fonts and antialiasing can differ from Matplotlib; numerical outputs and colour-table values are the fidelity targets.

The current radius/luminosity implementation passed nine independent Astropy comparisons (4,500 spectral samples, including 10,000 K), Stefan–Boltzmann totals, radius/temperature scaling checks, and browser checks at six widths from 320 to 1440 pixels. Browser checks also confirmed the exact 10,000 K endpoint, blue-white curve, matching equation and heading sizes, and unchanged orbit-panel dimensions with its inset border. These temporary development checks are not website dependencies or additional repository files.


## Keplerian radial velocity

Added between planet equilibrium temperature and blackbody spectrum, using `quick_visualizations/keplerian_radial_velocity.ipynb` as the scientific reference. The implementation follows the same file structure: section markup and an inline MathText equation in `visualizations.html`, calculations in `AstroPhysics`, a separate drawing/control closure in `visualizations.js`, and scoped additions to `visualizations.css`. No new runtime files or dependencies are needed.

The shared slider helper, exact-value fields, gold controls, dotted dividers, white results card, plot typography, and responsive breakpoints are retained. The white RV plot, black starfield orbit, and white results card sit side by side. The results card is 190 pixels wide and the gaps are 12 pixels to keep the row compact. The RV plot uses a 1.2:1 share of the plotting row relative to the orbit, with a taller SVG aspect ratio (height 0.95 times its width, bounded to 360–520 pixels); below 900 pixels geometry moves above the plots in two columns, and below 600 pixels the panels and geometry controls stack for readability. The model/observations legend sits inside the plot at the upper right. Orbit geometry controls remain on the left. Expandable Observation settings sit below the RV curve, and expandable Mass & period settings sit below the orbit; both groups start open. The orbital and sampling controls retain their notebook ranges, except random seeds run from 1 to 10, Jupiter-mode noise spans 0–20 m/s, and Jupiter masses start at 0.5 M<sub>Jup</sub>. Time window and Noise model share one row; noise is Gaussian or None. Reset orbit and Play orbit remain below geometry on the left and apply to the whole visualization. Reset restores every parameter, including both collapsed groups, and pauses playback.

| Control | Default | Range | Slider step |
| --- | --- | --- | --- |
| Stellar mass | 1 M☉ | 0.1–3 M☉ | 0.05 |
| Planet mass, Earth mode | 10 M⊕ | 1–200 M⊕ | 1 |
| Planet mass, Jupiter mode | 1 M<sub>Jup</sub> on switching | 0.5–80 M<sub>Jup</sub> | 0.5 |
| Period | 30 days | 1–365 days | 1 |
| Eccentricity | 0 | 0–0.75 | 0.01 |
| Inclination | 90° | 0–180° | 1° |
| Star’s argument of periastron | 270° | 0–360° | 5° |
| Orbital phase t/P | 0.5 | 0–1 | 0.01 |
| Time window | 2 cycles | 2 cycles or 365 days | — |
| Noise model | Gaussian | Gaussian, None | — |
| Noise σ, Earth mode | 1 m/s | 0–5 m/s | 0.1 |
| Noise σ, Jupiter mode | 5 m/s on switching | 0–20 m/s | 0.1 |
| Observations | 100 | 20–300 | 10 |
| Random seed | 1 | 1–10 | 1 |

A fresh page load or reload initializes Earth masses (10 M⊕), a 2-cycle time window, and Gaussian noise (1 m/s). All three dropdowns are synchronized to the model on initialization, reset, and pageshow, with browser autocomplete disabled. Switching mass units resets companion mass to one selected unit and noise to that mode’s default. Noise σ is entered in m/s in both modes and converted to km/s internally for the Jupiter-mode plot and error bars. Selecting None disables σ and removes noise/error bars. Number fields retain the existing direct-entry convention; integer-valued parameters round to integers.

Constants are G = 6.67430e−11, M☉ = 1.98840987e30 kg, M_Jup = 1.89812460e27 kg, M⊕ = 5.97216787e24 kg, and day = 86400 s. Systemic velocity is zero. The RV is K[cos(ν + ω) + e cos ω]; ω belongs to the star, and mean anomaly advances with time. Inclination 0° or 180° gives exactly zero orbital RV. The y-axis always includes the full edge-on theoretical range plus observations and ±σ bars, so decreasing inclination visibly shrinks the curve.

The orbit uses the notebook’s x/z bird’s-eye projection, opposite star/companion positions, and schematic wobble scales. Transit alignment checks both sky coordinates and requires the companion to be between the star and Earth. The default circular system is at transit, zero RV, and phase 0.5. This point-mass model does not calculate finite-radius transit durations or orbital survival.

Observation times are random rather than regularly spaced. The browser uses seeded Mulberry32 draws and Box–Muller Gaussian noise; it reproduces the notebook’s distributions and seed behavior, not NumPy’s exact random samples. Changing phase does not regenerate observations. Model samples are uniform in eccentric anomaly, with 120–1200 samples per cycle depending on the displayed cycle count, to resolve periastron while keeping long windows responsive.

Verification: 360 notebook configurations spanning both mass modes, eccentricities 0/0.4/0.75, inclinations 0/30/90/150/180°, periastron arguments 0/90/270/360°, and periods 1/30/365 days matched 2520 RV and orbit samples. Checks also covered seeded reproducibility, noise bounds, face-on flat curves, the 365-day/1-day-period extreme, and the existing planet and blackbody physics. Development comparison scripts and fixtures stay outside the repository, consistent with the existing minimal file set.

Playback advances mean anomaly uniformly, with one illustrative orbit per 12 seconds. The red star marker traverses the whole displayed time window, wrapping at its end; orbital phase wraps each orbit. The simulated observations remain fixed during playback, phase changes, and dragging. Changing a control, dragging, resetting, hiding the page, or enabling reduced motion pauses playback. Play resumes from the current time.

Drag either the star or planet in the RV orbit view to update orbital phase and the red star on the curve. Dragging tracks phase crossings in either direction, so the marker continues through successive orbits and wraps only at the end of the plotted time window. The orbital phase slider and exact-value field select the first orbit from 0 to 1 inclusive and stay at the selected endpoint. Star and planet dragging, their keyboard controls, and playback wrap automatically through the full time window. Geometry, mass, and noise edits retain the current cycle; changing the period or time window starts from the same phase in the first cycle. The pointer position is transformed back through the projected ellipse, then eccentric anomaly is converted to mean anomaly and phase. At exactly face-on inclinations, the orbit projects to a line in this view, so dragging retains the phase branch nearest the previous phase. Both bodies have minimum 44-pixel targets and the same keyboard controls as the equilibrium-temperature planet. The RV orbit panel captures the pointer for one explicitly selected body; that body’s signed orbit scale recovers the shared phase. Releasing, cancelling, resetting, hiding the page, losing window focus, or moving with no button pressed clears the active drag. Delayed capture-loss events cannot cancel a newly started drag. When grab areas overlap, the body nearest the pointer receives the drag. The initial grab offset is retained so picking up a body away from its center does not shift its position. The orbit’s stellar disk is slightly enlarged; orbital dimensions are unchanged. Star/companion text labels and the extended dotted sightline are omitted, and the short line-of-sight arrow stays fixed. The orbit is shifted up 12 SVG units, while Earth and the arrow are shifted down 4 units to leave a gap below the planet at the default phase.

The interaction update passed 10,500 orbit-projection/phase round trips, including both face-on endpoints, plus the existing 360 notebook configurations. Browser checks covered synchronized playback into the second RV cycle, dragging to quadrature, dragging to pause playback, reset, Gaussian/None, fixed observation samples and sight arrow, and desktop/mobile layouts.

The results card shows K (RV semi-amplitude), current radial velocity, orbital phase, and direction from the sign of the instantaneous RV ("No direction yet!" at phase 0 or 0.5, accounting for floating-point rounding; a dash at other zero-RV phases). Its Radial Velocity Function equation uses v_r(t) and ν(t), typeset over three lines for legibility in the narrow card. The visible instructions and schematic disclaimer have been removed from the card; the SVG descriptions retain accessible context. Earth’s green polygons depict a schematic Asia-facing globe with India, Southeast Asia, and offshore islands.

### On-demand RV analysis

Show Orbit and Show Analysis use the Reset/Play button styling, with slightly smaller text to fit side by side in a second row below them. Orbit is the initial view. Show Analysis pauses playback and replaces only the black orbit panel with two stacked white charts: Periodogram above Amplitude Fit. The radial velocity curve, results card, and parameter controls remain visible in their original columns. The hidden orbit retains its layout space, and the two analysis charts share exactly that height, including their gap and padding. The analysis plots have no legends. Single-line titles show Periodogram: Period Recovered (… days) and Amplitude Fit: Amplitude Recovered (… m/s or km/s), using the fitted period, amplitude, and snapshot units. The plot name stays larger and bold beside the smaller recovered-value text; both scale together only when needed to fit the panel width. Smaller top margins give the power and velocity axes more vertical space without changing panel dimensions, gaps, or borders. The reference lines and observation/bin/fit styling are retained. View-button borders change on hover only; the pressed state remains available to assistive technology. Each click takes a fresh snapshot of the current simulated observations. Slider changes and resizing never rerun the analysis; resizing only redraws the stored results. Show Orbit restores the black orbit panel. Play also returns to the orbit view; Reset restores all defaults, clears the analysis, and returns to Orbit.

The browser fits `a cos(2πt/P) + b sin(2πt/P) + c` by ordinary least squares at 1,996 trial periods from 1 to 400 days, spaced by 0.2 days in **period**, with a logarithmic period axis. All observations have the same prescribed uncertainty, so equal weights give the same fit as constant inverse-variance weights. Cosine and sine columns are centered before solving the two coefficients and recovering the constant offset. The standard/GLS-ZK power is the fractional reduction in squared residuals relative to a constant model, bounded to 0–1. Only the observed data enter the fit; the injected period is used solely for its reference line. The dominant grid peak supplies the recovery period, with no refinement or additional peak markers.

The dashed nominal 0.1% FAP threshold uses the same independent-frequency approximation as the notebook's PyAstronomy GLS: `M = max(1, time span × (1/1 day − 1/400 days))`, single-frequency tail `(1 − power)^((N − 3)/2)`, and search-wide FAP `1 − (1 − single-frequency tail)^M`. This is an analytic reference, not a calibrated false-alarm guarantee or bootstrap result. The coarse period grid can miss narrow peaks, particularly at short periods over long baselines; eccentric signals can favor harmonics. References: [GLS normalization](https://docs.astropy.org/en/stable/timeseries/lombscargle.html#periodogram-normalizations), [PyAstronomy GLS implementation](https://github.com/sczesla/PyAstronomy/blob/master/PyAstronomy/pyTiming/pyPeriod/gls.py), and [FAP interpretation](https://docs.astropy.org/en/stable/timeseries/lombscargle.html#false-alarm-approximations).

Amplitude Fit folds the same snapshot at the dominant period, with phase zero at the first observation. Gray points are individual observations, green points are means in 20 equal phase buckets, and the orange curve is the unbinned least-squares sinusoid with semi-amplitude `K = hypot(a, b)`. Bin locations are mean phases. Error bars use the sample standard deviation (N−1 denominator) divided by the square root of the bin count. Empty bins are omitted; singleton bins retain a point without an undefined error bar. A constant/noiseless face-on dataset displays no recovered period or amplitude. Units come from the snapshot: m/s for Earth masses and km/s for Jupiter masses.

Development validation compared eight configurations, including short/long periods, both mass units, eccentricity 0.75, 20–300 observations, zero noise, and face-on cases, against independent NumPy least-squares fits and Astropy GLS. Maximum periodogram-power disagreement was 4.1e−13. Coefficients, phase-bin means/standard errors, and nominal FAP thresholds also agreed. Computation took 6–87 ms locally for varying data (one click per search). Browser checks covered frozen snapshots after slider edits, refresh on click, unit switching, flat-data handling, Reset/Play, and 390/900/1440-pixel layouts. No Python package or new runtime dependency is used by the website.
