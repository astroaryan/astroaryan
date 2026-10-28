/* Run with Node.js. Reference values are independently calculated by NumPy. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = {};
context.window = context;
vm.createContext(context);
for (const name of ['colormaps.js', 'physics.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, name), 'utf8'), context);
const physics = context.AstroPhysics;
const references = JSON.parse(fs.readFileSync(path.join(__dirname, 'reference-values.json'), 'utf8'));
function close(actual, expected, label) {
    assert.ok(Number.isFinite(actual), `${label}: non-finite value`);
    assert.ok(Math.abs(actual - expected) <= Math.max(1e-25, Math.abs(expected) * 2e-12), `${label}: ${actual} ≠ ${expected}`);
}
for (const reference of references.planet) {
    const result = physics.planetSystem(reference.input, true);
    close(result.separation, reference.separation, 'Separation');
    close(result.equilibrium, reference.equilibrium, 'Equilibrium temperature');
    assert.equal(result.warning, reference.warning, 'Stellar crossing warning');
    reference.starColour.forEach((value, index) => close(result.starColour[index], value, 'Stellar colour'));
    reference.planetColour.forEach((value, index) => close(result.planetColour[index], value, 'Planet colour'));
    if (reference.input.eccentricity === 0) close(physics.planetSystem(reference.input, false).equilibrium, result.equilibrium, 'Circular/eccentric consistency');
}
for (const reference of references.blackbody) {
    const result = physics.blackbodySpectrum(reference.temperature);
    close(result.peak, reference.peak, 'Wien peak');
    reference.colour.forEach((value, index) => close(result.colour[index], value, 'Blackbody colour'));
    reference.wavelengths.forEach((value, index) => close(result.wavelengths[index], value, 'Wavelength'));
    reference.flux.forEach((value, index) => close(result.flux[index], value, 'Spectral flux'));
}
for (const eccentricity of [0, 0.4, 0.75]) {
    for (const anomaly of [0, 1e-8, 0.1, Math.PI, 5, 2 * Math.PI - 1e-8]) {
        const actual = physics.trueFromMean(physics.meanFromTrue(anomaly, eccentricity), eccentricity);
        assert.ok(Math.abs(actual - anomaly) < 2e-12, 'Kepler conversion round trip');
    }
}
const state = { radius: 3, temperature: 8000, albedo: 0, distance: 0.01, eccentricity: 0, anomaly: 0 };
assert.equal(physics.planetSystem(state).warning, true);
assert.ok(physics.planetSystem(state).equilibrium > 2000, 'Temperature must not be capped by the colour scale');
assert.equal(physics.planetSystem({ ...state, albedo: 1 }).equilibrium, 0);
assert.equal(physics.planetSystem({ ...state, distance: 30 }).warning, false);
assert.equal(physics.snap(Math.log10(30), -2, Math.log10(30), 0.01), Math.log10(30));
assert.equal(physics.snap(2 * Math.PI, 0, 2 * Math.PI, 0.05), 2 * Math.PI);
assert.equal(physics.snap(6000, 200, 6000, 30), 6000);
console.log(`Passed ${references.planet.length} Python planet cases, ${references.blackbody.length} complete 500-point Python spectra, colours, Kepler conversions, and boundary checks.`);
