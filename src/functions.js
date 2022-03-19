"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hslToHsv = exports.hsvToHsl = exports.clamp = exports.rgbColorToHsl = exports.rgbToHsl = exports.hslToRgb = exports.hslColorToRgb = exports.parseHexColor = exports.mapValue = void 0;
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
const hslColorToRgb = (color) => {
    const { hue, saturation, lightness } = color;
    return (0, exports.hslToRgb)(hue, saturation, lightness);
};
exports.hslColorToRgb = hslColorToRgb;
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
const rgbToHsl = (red, green, blue) => {
    (red /= 255), (green /= 255), (blue /= 255);
    var max = Math.max(red, green, blue), min = Math.min(red, green, blue);
    var hue = 0, saturation, lightness = (max + min) / 2;
    if (max == min) {
        hue = saturation = 0; // achromatic
    }
    else {
        var d = max - min;
        saturation = lightness > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case red:
                hue = (green - blue) / d + (green < blue ? 6 : 0);
                break;
            case green:
                hue = (blue - red) / d + 2;
                break;
            case blue:
                hue = (red - green) / d + 4;
                break;
        }
        hue /= 6;
    }
    return { hue, saturation, lightness };
};
exports.rgbToHsl = rgbToHsl;
const rgbColorToHsl = (color) => {
    const { red, green, blue } = color;
    return (0, exports.rgbToHsl)(red, green, blue);
};
exports.rgbColorToHsl = rgbColorToHsl;
const clamp = (value, min, max) => value <= min ? min : value >= max ? max : value;
exports.clamp = clamp;
const hsvToHsl = (hue, saturation, value) => {
    const lightness = value - (value * saturation) / 2;
    const min = Math.min(lightness, 1 - lightness);
    return { hue, saturation: min ? (value - lightness) / min : 0, lightness };
};
exports.hsvToHsl = hsvToHsl;
const hslToHsv = (hue, saturation, lightness) => {
    const value = saturation * Math.min(lightness, 1 - lightness) + lightness;
    return { hue, saturation: value ? 2 - (2 * lightness) / value : 0, value };
};
exports.hslToHsv = hslToHsv;
