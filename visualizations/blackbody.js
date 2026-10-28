(() => {
    const { blackbodySpectrum, rgb, significant } = AstroPhysics;
    const { attributes, svgElement, control } = AstroVisuals;
    const svg = document.getElementById('blackbody-diagram');
    let temperature = 588;
    const temperatureControl = control(document.getElementById('blackbody-controls'), {
        id: 'blackbody-temperature', label: 'Temperature [K]', min: 200, max: 6000, step: 30, integer: true, value: temperature, format: value => `${value} K`
    }, value => {
        temperature = value;
        render();
    });
    const definitions = svgElement('defs', {}, svg);
    const clip = svgElement('clipPath', { id: 'blackbody-clip' }, definitions);
    const clipRectangle = svgElement('rect', {}, clip);
    const axes = svgElement('g', { 'aria-hidden': 'true' }, svg);
    const plot = svgElement('g', { 'clip-path': 'url(#blackbody-clip)' }, svg);
    const outline = svgElement('path', { fill: 'none', stroke: 'rgb(76.5, 76.5, 76.5)', 'stroke-width': 4.667, 'stroke-linejoin': 'round' }, plot);
    const curve = svgElement('path', { id: 'blackbody-curve', fill: 'none', 'stroke-width': 3.333, 'stroke-linejoin': 'round' }, plot);
    const peakLine = svgElement('line', { stroke: 'gray', 'stroke-dasharray': '6 4', 'stroke-width': 1.5 }, plot);
    const legend = svgElement('g', { 'aria-hidden': 'true' }, svg);

    function ticks(minimum, maximum, count) {
        const rough = (maximum - minimum) / count;
        const power = 10 ** Math.floor(Math.log10(rough));
        const step = [1, 2, 2.5, 5, 10].find(value => value * power >= rough) * power;
        const values = [];
        for (let value = Math.ceil(minimum / step) * step; value <= maximum + step * 1e-8; value += step) values.push(value);
        return values;
    }
    function render() {
        const spectrum = blackbodySpectrum(temperature);
        const width = Math.max(240, svg.clientWidth), compact = width < 450;
        const height = Math.max(300, Math.min(500, width * 0.625));
        const margin = { left: compact ? 49 : 80, right: 18, top: 65, bottom: 56 };
        const plotWidth = width - margin.left - margin.right, plotHeight = height - margin.top - margin.bottom;
        const maximumFlux = Math.max(...spectrum.flux), minimumFlux = Math.min(...spectrum.flux);
        // Matplotlib's default 5% margins on both linear axes.
        const xMin = -0.145 * spectrum.peak, xMax = 5.245 * spectrum.peak;
        const yMin = minimumFlux - 0.05 * (maximumFlux - minimumFlux), yMax = maximumFlux + 0.05 * (maximumFlux - minimumFlux);
        const x = value => margin.left + (value - xMin) / (xMax - xMin) * plotWidth;
        const y = value => margin.top + (yMax - value) / (yMax - yMin) * plotHeight;
        attributes(svg, { viewBox: `0 0 ${width} ${height}` });
        attributes(clipRectangle, { x: margin.left, y: margin.top, width: plotWidth, height: plotHeight });
        axes.replaceChildren();
        svgElement('rect', { x: margin.left, y: margin.top, width: plotWidth, height: plotHeight, fill: 'none', stroke: '#eee' }, axes);
        const fontSize = compact ? 12 : 15;
        const text = (label, values) => svgElement('text', { class: 'plot-text', style: `font-size:${fontSize}px`, ...values }, axes, label);
        for (const value of ticks(xMin, xMax, compact ? 3 : 6)) {
            svgElement('line', { x1: x(value), x2: x(value), y1: height - margin.bottom, y2: height - margin.bottom + 5, stroke: '#eee' }, axes);
            text(significant(value), { x: x(value), y: height - margin.bottom + 20, 'text-anchor': 'middle' });
        }
        const exponent = Math.floor(Math.log10(maximumFlux));
        const multiplier = exponent >= 6 || exponent <= -5 ? 10 ** exponent : 1;
        for (const value of ticks(yMin, yMax, compact ? 4 : 6)) {
            svgElement('line', { x1: margin.left - 5, x2: margin.left, y1: y(value), y2: y(value), stroke: '#eee' }, axes);
            text(significant(value / multiplier), { x: margin.left - 9, y: y(value) + 4, 'text-anchor': 'end' });
        }
        if (multiplier !== 1) text(`×10${String(exponent).replace(/[-0-9]/g, character => ({ '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' })[character])}`, { x: margin.left, y: margin.top - 10 });
        text('Wavelength λ [μm]', { x: margin.left + plotWidth / 2, y: height - 12, 'text-anchor': 'middle' });
        if (!compact) text('Surface spectral flux Fλ [W m⁻² μm⁻¹]', { transform: `translate(19 ${margin.top + plotHeight / 2}) rotate(-90)`, 'text-anchor': 'middle' });
        const path = spectrum.wavelengths.map((wavelength, index) => `${index ? 'L' : 'M'}${x(wavelength)},${y(spectrum.flux[index])}`).join(' ');
        outline.setAttribute('d', path);
        attributes(curve, { d: path, stroke: rgb(spectrum.colour) });
        attributes(peakLine, { x1: x(spectrum.peak), x2: x(spectrum.peak), y1: margin.top, y2: height - margin.bottom });
        legend.replaceChildren();
        const legendX = width - (compact ? 144 : 180);
        svgElement('line', { x1: legendX, x2: legendX + 25, y1: 19, y2: 19, stroke: 'rgb(76.5, 76.5, 76.5)', 'stroke-width': 4.667 }, legend);
        svgElement('line', { x1: legendX, x2: legendX + 25, y1: 19, y2: 19, stroke: rgb(spectrum.colour), 'stroke-width': 3.333 }, legend);
        svgElement('text', { x: legendX + 33, y: 24, class: 'plot-text', style: `font-size:${fontSize}px` }, legend, `${temperature} K`);
        svgElement('line', { x1: legendX, x2: legendX + 25, y1: 42, y2: 42, stroke: 'gray', 'stroke-dasharray': '6 4' }, legend);
        svgElement('text', { x: legendX + 33, y: 47, class: 'plot-text', style: `font-size:${fontSize}px` }, legend, `peak = ${spectrum.peak.toFixed(2)} μm`);
        document.getElementById('blackbody-result').textContent = `Blackbody spectrum · ${temperature} K`;
        document.getElementById('blackbody-peak').textContent = `Peak wavelength = ${spectrum.peak.toFixed(2)} μm`;
        document.getElementById('blackbody-svg-description').textContent = `At ${temperature} kelvin, peak wavelength is ${spectrum.peak.toFixed(2)} micrometres. Wavelength is plotted from ${significant(spectrum.wavelengths[0])} to ${significant(spectrum.wavelengths[499])} micrometres. Surface spectral flux is in watts per square metre per micrometre.`;
    }
    document.getElementById('blackbody-reset').addEventListener('click', () => {
        temperature = 588;
        temperatureControl.setValue(temperature);
        render();
    });
    new ResizeObserver(render).observe(svg);
    render();
})();
