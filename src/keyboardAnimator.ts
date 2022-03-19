import * as Types from "./types";
import * as Functions from "./functions";
import LedsController from "./ledsController";
import CavaRunner from "./cavaRunner";
import ConfigManager from "./configManager";

export default class KeyboardAnimator {
  ledsController: LedsController;
  configManager: ConfigManager;
  mode: LightMode = "spectrum";
  audioData: number[];
  keyboardWidthMm = 330;
  keyboardHeightMm = 120;
  keyboardMargins = { top: 5, right: 0, bottom: 5, left: 0 };
  colorRgb: Types.ColorRgb;
  colorHsl: Types.ColorHsl;
  constructor(ledsController: LedsController, configManager: ConfigManager) {
    this.ledsController = ledsController;
    this.configManager = configManager;
    this.audioData = [];
    this.colorRgb = ledsController.color;
    this.colorHsl = Functions.rgbColorToHsl(ledsController.color)
    let config = this.configManager.config;
    // console.log(JSON.stringify(config))
    ledsController.updateLeds();
  }

  selectMode = (mode: LightMode): void => {
    this.mode = mode;
  };
  selectHueAndLightness = (hue: number, lightness: number): void => {
    this.colorRgb = Functions.hslToRgb(hue / 360, 1, lightness / 100);
    console.log("current color: ", this.colorRgb);
  };

  changeHueAndLightness = (hue: number, lightness: number): void => {
    this.colorRgb = Functions.hslToRgb(hue / 360, 1, lightness / 100);
    console.log("current color: ", this.colorRgb);
  };
  onCavaData = (values: number[]): void => {
    this.audioData = values;
    const mappedValues = values.map((v) =>
      Math.floor(Functions.mapValue(v, 0, 999, 0, this.keyboardHeightMm))
    );
    // console.log(mappedValues.map(v => v.toString().padStart(3,'0')).join(", "));
    const barWidth = this.keyboardWidthMm / values.length;
    const invertVertically =
      this.configManager.config.modes.spectrum.invertVertically;
    const smoothVertically =
      this.configManager.config.modes.spectrum.smoothVertically;
    this.ledsController.leds.ledsArray.forEach((led) => {
      let brightness = 15;
      values.forEach((value, idx) => {
        if (led.horizontalPosition > 0 && led.virtualVerticalPosition > 0) {
          const barStart = idx * barWidth;
          const barEnd = barStart + barWidth;
          const verticalActivationStrength = Functions.clamp(
            Math.abs(value - led.virtualVerticalPosition),
            0,
            9
          );
          const smoothBrightness = Functions.mapValue(
            verticalActivationStrength,
            0,
            9,
            15,
            255
          );
          if (
            led.horizontalPosition >= barStart &&
            led.horizontalPosition <= barEnd
          ) {
            if (
              invertVertically &&
              led.virtualVerticalPosition >= 999 - value + 1
            ) {
              brightness = smoothVertically ? smoothBrightness : 255;
            } else if (
              !invertVertically &&
              led.virtualVerticalPosition <= value
            ) {
              brightness = smoothVertically ? smoothBrightness : 255;
            }
          } else if (
            led.horizontalPosition >= barStart - 0.5 * barWidth &&
            led.horizontalPosition <= barEnd + 0.5 * barWidth
          ) {
            const leftBarValue = idx > 0 ? values[idx - 1] : 0;
            const rightBarValue = idx < values.length - 2 ? values[idx + 1] : 0;
            const leftBleeding = values[idx];
            const rightBleeding = values[idx];
          }
        } else if (
          led.virtualVerticalPosition < 0 &&
          led.horizontalPosition < 0
        ) {
          let lowFreqMax = Math.max(...values.slice(0, 2));
          let highFreqMax = Math.max(...values.slice(-2));
          let maxVol = Math.max(lowFreqMax, highFreqMax);
          brightness = Functions.mapValue(lowFreqMax, 0, 999, 0, 255);
        }
      });

      led.color.red = Math.floor((this.colorRgb.red * brightness) / 255);
      led.color.green = Math.floor((this.colorRgb.green * brightness) / 255);
      led.color.blue = Math.floor((this.colorRgb.blue * brightness) / 255);
    });
    this.ledsController.updateLeds();
  };
}

export type LightMode = "spectrum";
