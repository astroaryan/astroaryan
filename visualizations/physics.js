/* Notebook equations and display coordinates. SI constants match the Python sources. */
window.AstroPhysics = (() => {
    const R_SUN = 6.957e8, AU = 1.495978707e11, TAU = 2 * Math.PI;
    const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
    const colourAt = (table, fraction) => table[Math.min(table.length - 1, Math.floor(clamp(fraction, 0, 1) * table.length))];
    const rgb = colour => `rgb(${colour.map(channel => channel * 255).join(', ')})`;
    const significant = value => Number(value.toPrecision(3)).toString();

    function snap(value, minimum, maximum, step) {
        const nearest = minimum + Math.round((value - minimum) / step) * step;
        return clamp(Math.abs(maximum - value) < Math.abs(nearest - value) ? maximum : Number(nearest.toPrecision(14)), minimum, maximum);
    }

    function planetSystem(state, eccentric = false) {
        const { radius, temperature, albedo, distance, anomaly } = state;
        const eccentricity = eccentric ? state.eccentricity : 0;
        const separation = distance * (1 - eccentricity ** 2) / (1 + eccentricity * Math.cos(anomaly));
        const perihelion = distance * (1 - eccentricity), aphelion = distance * (1 + eccentricity);
        const equilibrium = temperature * Math.sqrt(radius * R_SUN / (2 * separation * AU)) * (1 - albedo) ** 0.25;
        const distanceFraction = Math.log10(distance / 0.01) / Math.log10(3000);
        const orbitA = 1.3 + 1.2 * distanceFraction;
        const starX = eccentric ? 1.8 : 1.3;
        const displayDistance = eccentric ? orbitA * (1 - eccentricity ** 2) / (1 + eccentricity * Math.cos(anomaly)) : orbitA;
        return { separation, perihelion, aphelion, equilibrium, starX, starRadius: 0.4 * radius, orbitA,
            orbitB: eccentric ? orbitA * Math.sqrt(1 - eccentricity ** 2) : 0.325 * orbitA,
            orbitCenter: starX + orbitA * eccentricity, displayDistance,
            planetX: eccentric ? starX - displayDistance * Math.cos(anomaly) : 2.6 + 1.2 * distanceFraction,
            planetY: eccentric ? displayDistance * Math.sin(anomaly) : 0,
            warning: perihelion * AU <= radius * R_SUN,
            starColour: colourAt(AstroColormaps.stellar, (temperature - 2500) / 5500),
            planetColour: colourAt(AstroColormaps.coolwarm, equilibrium / 2000) };
    }

    function meanFromTrue(anomaly, eccentricity) {
        const eccentricAnomaly = 2 * Math.atan2(Math.sqrt(1 - eccentricity) * Math.sin(anomaly / 2), Math.sqrt(1 + eccentricity) * Math.cos(anomaly / 2));
        return eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly);
    }

    function trueFromMean(mean, eccentricity) {
        mean = ((mean % TAU) + TAU) % TAU;
        let eccentricAnomaly = mean;
        for (let iteration = 0; iteration < 12; iteration++) {
            const correction = (eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - mean) / (1 - eccentricity * Math.cos(eccentricAnomaly));
            eccentricAnomaly -= correction;
            if (Math.abs(correction) < 1e-12) break;
        }
        const anomaly = 2 * Math.atan2(Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2), Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2));
        return ((anomaly % TAU) + TAU) % TAU;
    }

    function blackbodyColour(temperature) {
        const knots = AstroColormaps.blackbody;
        const upper = knots.findIndex(row => row[0] >= temperature);
        if (upper <= 0) return knots[upper === 0 ? 0 : knots.length - 1].slice(1);
        const fraction = (temperature - knots[upper - 1][0]) / (knots[upper][0] - knots[upper - 1][0]);
        return knots[upper].slice(1).map((channel, index) => knots[upper - 1][index + 1] + fraction * (channel - knots[upper - 1][index + 1]));
    }

    function blackbodySpectrum(temperature) {
        const h = 6.62607015e-34, c = 299792458, kB = 1.380649e-23;
        const peak = 2897.8 / temperature;
        const wavelengths = Array.from({ length: 500 }, (_, index) => 0.1 * peak + index * (4.9 * peak / 499));
        const flux = wavelengths.map(wavelength => {
            const metres = wavelength * 1e-6;
            return Math.PI * 2 * h * c ** 2 / metres ** 5 / Math.expm1(h * c / (metres * kB * temperature)) * 1e-6;
        });
        return { peak, wavelengths, flux, colour: blackbodyColour(temperature) };
    }

    return { R_SUN, AU, TAU, clamp, snap, colourAt, rgb, significant, planetSystem, meanFromTrue, trueFromMean, blackbodyColour, blackbodySpectrum };
})();
