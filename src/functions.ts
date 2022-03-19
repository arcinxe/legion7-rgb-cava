import * as fs from "fs";
import * as path from "path";
import * as cliProgress from "cli-progress";
import * as Types from "./types";

export let mapValue = (
  x: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => {
  return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const parseHexColor = (hexValue: string): Types.ColorRgb => {
  const regex = /^\#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i;
  const hexColorTest = regex.exec(hexValue);
  if (hexColorTest) {
    const colorArray = [hexColorTest[1], hexColorTest[2], hexColorTest[3]].map(
      (v) => parseInt(v, 16)
    );
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
export const hslColorToRgb = (color: Types.ColorHsl): Types.ColorRgb => {
  const { hue, saturation, lightness } = color;
  return hslToRgb(hue, saturation, lightness);
};
export const hslToRgb = (
  hue: number,
  saturation: number,
  lightness: number
): Types.ColorRgb => {
  let red: number, green: number, blue: number;

  if (saturation == 0) {
    red = green = blue = lightness; // achromatic
  } else {
    let hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let q =
      lightness < 0.5
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

export const rgbToHsl = (
  red: number,
  green: number,
  blue: number
): Types.ColorHsl => {
  (red /= 255), (green /= 255), (blue /= 255);
  var max = Math.max(red, green, blue),
    min = Math.min(red, green, blue);
  var hue = 0,
    saturation,
    lightness = (max + min) / 2;

  if (max == min) {
    hue = saturation = 0; // achromatic
  } else {
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

export const rgbColorToHsl = (color: Types.ColorRgb): Types.ColorHsl => {
  const { red, green, blue } = color;
  return rgbToHsl(red, green, blue);
};

export const clamp = (value: number, min: number, max: number) =>
  value <= min ? min : value >= max ? max : value;

export const hsvToHsl = (
  hue: number,
  saturation: number,
  value: number
): Types.ColorHsl => {
  const lightness = value - (value * saturation) / 2;
  const min = Math.min(lightness, 1 - lightness);
  return { hue, saturation: min ? (value - lightness) / min : 0, lightness };
};

export const hslToHsv = (
  hue: number,
  saturation: number,
  lightness: number
): Types.ColorHsv => {
  const value = saturation * Math.min(lightness, 1 - lightness) + lightness;
  return { hue, saturation: value ? 2 - (2 * lightness) / value : 0, value };
};
