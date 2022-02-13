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

export const parseHexColor = (hexValue: string): Types.Color => {
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

export const hslToRgb = (
  hue: number,
  saturation: number,
  lightness: number
): Types.Color => {
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
export const clamp = (value: number, min: number, max: number) =>
  value <= min ? min : value >= max ? max : value;
