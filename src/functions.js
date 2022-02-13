"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = exports.hslToRgb = exports.parseHexColor = exports.mapValue = void 0;
let mapValue = (x, inMin, inMax, outMin, outMax) => {
    return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};
exports.mapValue = mapValue;
const parseHexColor = (hexValue) => {
    const regex = /^\#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i;
    const hexColorTest = regex.exec(hexValue);
    if (hexColorTest) {
        const colorArray = [hexColorTest[1], hexColorTest[2], hexColorTest[3]].map((v) => parseInt(v, 16));
        const color = {
            red: colorArray[0],
            green: colorArray[1],
            blue: colorArray[2],
        };
        return color;
    }
    return {
        red: 0,
        green: 0,
        blue: 0,
    };
};
exports.parseHexColor = parseHexColor;
const hslToRgb = (hue, saturation, lightness) => {
    let red, green, blue;
    if (saturation == 0) {
        red = green = blue = lightness; // achromatic
    }
    else {
        let hue2rgb = (p, q, t) => {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        let q = lightness < 0.5
            ? lightness * (1 + saturation)
            : lightness + saturation - lightness * saturation;
        let p = 2 * lightness - q;
        red = hue2rgb(p, q, hue + 1 / 3);
        green = hue2rgb(p, q, hue);
        blue = hue2rgb(p, q, hue - 1 / 3);
    }
    return {
        red: Math.round(red * 255),
        green: Math.round(green * 255),
        blue: Math.round(blue * 255),
    };
};
exports.hslToRgb = hslToRgb;
const clamp = (value, min, max) => value <= min ? min : value >= max ? max : value;
exports.clamp = clamp;
