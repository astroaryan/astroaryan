/* Small shared helpers for the two standalone SVG visualizations. */
window.AstroVisuals = (() => {
    const { clamp, snap } = AstroPhysics;
    function attributes(element, values) {
        for (const [name, value] of Object.entries(values)) element.setAttribute(name, value);
        return element;
    }
    function svgElement(tag, values, parent, text) {
        const element = attributes(document.createElementNS('http://www.w3.org/2000/svg', tag), values);
        if (text !== undefined) element.textContent = text;
        parent.append(element);
        return element;
    }
    function control(container, options, onChange) {
        const { id, label, min, max, step, value, format = String, logarithmic = false, integer = false } = options;
        const row = document.createElement('div');
        row.className = 'viz-control';
        row.innerHTML = `<div class="control-label"><label for="${id}">${label}</label><input id="${id}-value" type="number" min="${min}" max="${max}" step="any" aria-label="${label}, exact value"></div><input id="${id}" type="range" step="any"><div class="control-limits"><span>${format(min)}</span><span>${format(max)}</span></div>`;
        container.append(row);
        const slider = row.querySelector('input[type="range"]'), number = row.querySelector('input[type="number"]');
        const toSlider = logarithmic ? Math.log10 : value => value;
        const fromSlider = logarithmic ? value => 10 ** value : value => value;
        const sliderMin = toSlider(min), sliderMax = toSlider(max);
        attributes(slider, { min: sliderMin, max: sliderMax });
        let current = value;
        function setValue(next) {
            current = next;
            slider.value = toSlider(next);
            slider.setAttribute('aria-valuetext', format(next));
            number.value = Number(next.toPrecision(12));
        }
        function commitSlider(next) {
            const position = snap(next, sliderMin, sliderMax, step);
            const result = position === sliderMax ? max : position === sliderMin ? min : fromSlider(position);
            setValue(result);
            onChange(result);
        }
        slider.addEventListener('input', () => commitSlider(Number(slider.value)));
        slider.addEventListener('keydown', event => {
            const directions = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
            if (!(event.key in directions) && event.key !== 'Home' && event.key !== 'End') return;
            event.preventDefault();
            commitSlider(event.key === 'Home' ? sliderMin : event.key === 'End' ? sliderMax : toSlider(current) + directions[event.key] * step);
        });
        number.addEventListener('change', () => {
            if (number.value === '' || !Number.isFinite(number.valueAsNumber)) return setValue(current);
            const next = clamp(integer ? Math.round(number.valueAsNumber) : number.valueAsNumber, min, max);
            setValue(next);
            onChange(next);
        });
        setValue(value);
        return { row, slider, number, setValue, label: row.querySelector('label') };
    }
    function svgPoint(svg, event) {
        return new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
    }
    return { attributes, svgElement, control, svgPoint };
})();
