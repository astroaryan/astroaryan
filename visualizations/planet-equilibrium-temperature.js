(() => {
    const { TAU, clamp, snap, rgb, significant, planetSystem, meanFromTrue, trueFromMean } = AstroPhysics;
    const { attributes, svgElement, control, svgPoint } = AstroVisuals;
    const defaults = { radius: 0.3, temperature: 3150, albedo: 0, distance: 0.02, eccentricity: 0.4, anomaly: 0 };
    const states = { circular: { ...defaults }, eccentric: { ...defaults } };
    const svg = document.getElementById('planet-diagram');
    const result = document.getElementById('planet-result'), status = document.getElementById('planet-status');
    const play = document.getElementById('planet-play');
    let mode = 'circular', playing = false, frame = null, lastTime = null, meanAnomaly = 0, pointer = null;
    const wholeKelvin = value => value.toLocaleString('en-US', { maximumFractionDigits: 0 });
    const options = [
        { name: 'radius', label: 'Stellar radius [R☉]', min: 0.2, max: 3, step: 0.02, format: value => value.toFixed(2) },
        { name: 'temperature', label: 'Stellar temperature [K]', min: 2500, max: 8000, step: 50, integer: true, format: wholeKelvin },
        { name: 'albedo', label: 'Bond albedo', min: 0, max: 1, step: 0.05, format: value => value.toFixed(2) },
        { name: 'distance', label: 'Distance [AU]', min: 0.01, max: 30, step: 0.01, logarithmic: true, format: significant },
        { name: 'eccentricity', label: 'Eccentricity e', min: 0, max: 0.75, step: 0.01, format: value => value.toFixed(2) },
        { name: 'anomaly', label: 'True anomaly ν [rad]', min: 0, max: TAU, step: 0.05, format: value => value.toFixed(2) }
    ];
    const controls = {};
    for (const option of options) {
        controls[option.name] = control(document.getElementById('planet-controls'), { ...option, id: `planet-${option.name}`, value: defaults[option.name] }, value => {
            pause();
            states[mode][option.name] = value;
            render();
        });
    }

    const orbit = svgElement('ellipse', { fill: 'none', stroke: 'gray', 'stroke-dasharray': '6 4', 'stroke-width': 1.5 }, svg);
    const glowOuter = svgElement('circle', { opacity: 0.06 }, svg);
    const glowInner = svgElement('circle', { opacity: 0.10 }, svg);
    const photons = svgElement('g', { opacity: 0.8, 'aria-hidden': 'true' }, svg);
    const star = svgElement('circle', {}, svg);
    const planet = svgElement('circle', { r: 7, stroke: 'gray', 'stroke-width': 1.07, id: 'planet-disk' }, svg);
    const starLabel = svgElement('text', { class: 'plot-text diagram-label', 'text-anchor': 'middle' }, svg);
    const temperatureLabel = svgElement('text', { class: 'plot-text diagram-label', 'text-anchor': 'middle' }, svg);
    const planetLabel = svgElement('text', { class: 'plot-text diagram-label', 'text-anchor': 'middle' }, svg);
    const perihelionLabel = svgElement('text', { class: 'plot-text secondary-label', 'text-anchor': 'middle' }, svg, 'perihelion');
    const aphelionLabel = svgElement('text', { class: 'plot-text secondary-label', 'text-anchor': 'middle' }, svg, 'aphelion');
    const hit = svgElement('circle', { class: 'planet-hit', id: 'planet-drag', tabindex: 0, role: 'slider', 'aria-describedby': 'planet-help' }, svg);

    function render() {
        const state = states[mode], eccentric = mode === 'eccentric';
        const system = planetSystem(state, eccentric);
        const x = value => (value + (eccentric ? 1 : 0)) * 100;
        const y = value => ((eccentric ? 2.5 : 2.2) - value) * 100;
        svg.setAttribute('viewBox', eccentric ? '0 0 800 515' : '0 0 550 440');
        attributes(orbit, { cx: x(system.orbitCenter), cy: y(0), rx: 100 * system.orbitA, ry: 100 * system.orbitB, opacity: eccentric ? 0.55 : 0.45 });
        for (const [element, scale] of [[glowOuter, 1.7], [glowInner, 1.35], [star, 1]]) {
            attributes(element, { cx: x(system.starX), cy: y(0), r: 100 * system.starRadius * scale, fill: rgb(system.starColour) });
        }
        attributes(planet, { cx: x(system.planetX), cy: y(system.planetY), fill: rgb(system.planetColour) });
        photons.replaceChildren();
        const start = system.starRadius + 0.12, end = system.displayDistance - (eccentric ? 0.12 : 0.18);
        if (eccentric ? system.displayDistance > system.starRadius + 0.15 : end > start) {
            for (let index = 0; index < 6; index++) {
                const distance = start + index * (end - start) / 5;
                const photonX = x(system.starX + distance * (system.planetX - system.starX) / system.displayDistance);
                const photonY = y(distance * system.planetY / system.displayDistance);
                if (eccentric) svgElement('circle', { cx: photonX, cy: photonY, r: 2.5, fill: rgb(system.starColour) }, photons);
                else svgElement('path', { d: `M${photonX - 3},${photonY - 3} L${photonX + 3},${photonY} L${photonX - 3},${photonY + 3} Z`, fill: rgb(system.starColour) }, photons);
            }
        }
        attributes(starLabel, { x: x(system.starX), y: y(eccentric ? 1.85 : 1.25) - 23 });
        attributes(temperatureLabel, { x: x(system.starX), y: y(eccentric ? 1.85 : 1.25) });
        starLabel.textContent = `R★ = ${state.radius.toFixed(eccentric ? 2 : 1)} R☉`;
        temperatureLabel.textContent = `T★ = ${wholeKelvin(state.temperature)} K`;
        const leftLabel = eccentric && system.planetX < 0.3;
        attributes(planetLabel, { x: x(system.planetX + (leftLabel ? 0.1 : 0)), y: y(system.planetY + (eccentric ? 0.2 : 0.38)), 'text-anchor': leftLabel ? 'start' : 'middle' });
        planetLabel.replaceChildren();
        svgElement('tspan', {}, planetLabel, 'T');
        svgElement('tspan', { 'baseline-shift': 'sub', 'font-size': '70%' }, planetLabel, 'eq');
        svgElement('tspan', {}, planetLabel, ` = ${wholeKelvin(system.equilibrium)} K`);
        for (const [label, position] of [[perihelionLabel, system.orbitCenter - system.orbitA], [aphelionLabel, system.orbitCenter + system.orbitA]]) {
            attributes(label, { x: x(position), y: y(-0.22) + 15, visibility: eccentric ? 'visible' : 'hidden' });
        }
        const screenScale = svg.getScreenCTM()?.a || 1;
        attributes(hit, { cx: x(system.planetX), cy: y(system.planetY), r: Math.max(12, 22 / screenScale),
            'aria-label': eccentric ? 'Planet position: true anomaly' : 'Planet distance', 'aria-valuemin': eccentric ? 0 : 0.01,
            'aria-valuemax': eccentric ? TAU : 30, 'aria-valuenow': eccentric ? state.anomaly : state.distance,
            'aria-valuetext': eccentric ? `${state.anomaly.toFixed(2)} radians` : `${significant(state.distance)} AU` });
        result.textContent = eccentric ? `Equilibrium temperature at r = ${significant(system.separation)} AU: ${wholeKelvin(system.equilibrium)} K` : `Planet equilibrium temperature: ${wholeKelvin(system.equilibrium)} K`;
        document.getElementById('planet-star-summary').textContent = `${starLabel.textContent} · ${temperatureLabel.textContent}`;
        document.getElementById('planet-parameters').innerHTML = `a = ${significant(state.distance)} AU${eccentric ? ` · e = ${state.eccentricity.toFixed(2)} · ν = ${state.anomaly.toFixed(2)} rad` : ''} · A<sub>B</sub> = ${state.albedo.toFixed(2)}`;
        status.classList.toggle('warning', system.warning);
        // Avoid announcing every frame during playback; manual changes remain live.
        status.setAttribute('aria-live', playing ? 'off' : 'polite');
        status.textContent = system.warning ? (eccentric ? 'Warning: perihelion lies inside the star.' : 'Warning: this orbital distance lies inside the star.') : eccentric ? `Current distance = ${significant(system.separation)} AU · perihelion = ${significant(system.perihelion)} AU · aphelion = ${significant(system.aphelion)} AU` : 'Circular orbit · visual spacing is logarithmically compressed';
        document.getElementById('planet-svg-description').textContent = `${result.textContent}. ${status.textContent}. Use the planet's arrow keys or the labelled controls to adjust ${eccentric ? 'true anomaly' : 'distance'}.`;
    }

    function pause() {
        playing = false;
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        lastTime = null;
        play.textContent = 'Play orbit';
        play.setAttribute('aria-pressed', 'false');
        status.setAttribute('aria-live', 'polite');
    }
    function animate(timestamp) {
        if (!playing) return;
        const state = states.eccentric;
        if (lastTime !== null) meanAnomaly += (timestamp - lastTime) / 12000 * TAU;
        lastTime = timestamp;
        state.anomaly = trueFromMean(meanAnomaly, state.eccentricity);
        controls.anomaly.setValue(state.anomaly);
        render();
        frame = requestAnimationFrame(animate);
    }
    function selectMode(next) {
        pause();
        mode = next;
        for (const option of options) controls[option.name].setValue(states[mode][option.name]);
        for (const name of ['eccentricity', 'anomaly']) controls[name].row.hidden = mode !== 'eccentric';
        const label = mode === 'eccentric' ? 'Semimajor axis a [AU]' : 'Distance [AU]';
        controls.distance.label.textContent = label;
        controls.distance.number.setAttribute('aria-label', `${label}, exact value`);
        play.hidden = mode !== 'eccentric';
        document.getElementById('planet-playback-note').hidden = mode !== 'eccentric';
        document.getElementById('planet-help').textContent = mode === 'eccentric' ? 'Drag the planet around its orbit to change true anomaly. Dragging or adjusting a control pauses playback.' : 'Drag the planet left or right to change its distance. You can also use the sliders or enter exact values.';
        for (const button of document.querySelectorAll('[data-orbit]')) button.setAttribute('aria-pressed', String(button.dataset.orbit === mode));
        render();
    }
    document.querySelectorAll('[data-orbit]').forEach(button => button.addEventListener('click', () => selectMode(button.dataset.orbit)));
    document.getElementById('planet-reset').addEventListener('click', () => {
        states[mode] = { ...defaults };
        selectMode(mode);
    });
    play.addEventListener('click', () => {
        if (playing) return pause();
        playing = true;
        meanAnomaly = meanFromTrue(states.eccentric.anomaly, states.eccentric.eccentricity);
        play.textContent = 'Pause orbit';
        play.setAttribute('aria-pressed', 'true');
        frame = requestAnimationFrame(animate);
    });
    hit.addEventListener('pointerdown', event => {
        if (!event.isPrimary || event.button !== 0) return;
        event.preventDefault();
        pause();
        pointer = event.pointerId;
        hit.setPointerCapture(pointer);
        hit.classList.add('dragging');
        hit.focus({ preventScroll: true });
    });
    hit.addEventListener('pointermove', event => {
        if (event.pointerId !== pointer) return;
        const point = svgPoint(svg, event), state = states[mode];
        if (mode === 'circular') {
            const exponent = -2 + clamp((point.x / 100 - 2.6) / 1.2, 0, 1) * Math.log10(3000);
            const snapped = snap(exponent, -2, Math.log10(30), 0.01);
            state.distance = snapped === Math.log10(30) ? 30 : 10 ** snapped;
            controls.distance.setValue(state.distance);
        } else {
            const dx = 1.8 - (point.x / 100 - 1), dy = 2.5 - point.y / 100;
            if (Math.hypot(dx, dy) < 1e-8) return;
            const anomaly = (Math.atan2(dy, dx) + TAU) % TAU;
            state.anomaly = snap(anomaly, 0, TAU, 0.05);
            controls.anomaly.setValue(state.anomaly);
        }
        render();
    });
    function release(event) {
        if (event.pointerId !== pointer) return;
        pointer = null;
        hit.classList.remove('dragging');
        if (hit.hasPointerCapture(event.pointerId)) hit.releasePointerCapture(event.pointerId);
    }
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) hit.addEventListener(name, release);
    hit.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        controls[mode === 'eccentric' ? 'anomaly' : 'distance'].slider.dispatchEvent(new KeyboardEvent('keydown', { key: event.key }));
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => { if (event.matches) pause(); });
    new ResizeObserver(render).observe(svg);
    selectMode('circular');
})();
