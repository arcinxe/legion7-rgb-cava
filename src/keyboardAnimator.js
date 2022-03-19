"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Functions = __importStar(require("./functions"));
class KeyboardAnimator {
    constructor(ledsController, configManager) {
        this.mode = "spectrum";
        this.keyboardWidthMm = 330;
        this.keyboardHeightMm = 120;
        this.keyboardMargins = { top: 5, right: 0, bottom: 5, left: 0 };
        this.selectMode = (mode) => {
            this.mode = mode;
        };
        this.selectHueAndLightness = (hue, lightness) => {
            this.colorRgb = Functions.hslToRgb(hue / 360, 1, lightness / 100);
            console.log("current color: ", this.colorRgb);
        };
        this.changeHueAndLightness = (hue, lightness) => {
            this.colorRgb = Functions.hslToRgb(hue / 360, 1, lightness / 100);
            console.log("current color: ", this.colorRgb);
        };
        this.onCavaData = (values) => {
            this.audioData = values;
            const mappedValues = values.map((v) => Math.floor(Functions.mapValue(v, 0, 999, 0, this.keyboardHeightMm)));
            // console.log(mappedValues.map(v => v.toString().padStart(3,'0')).join(", "));
            const barWidth = this.keyboardWidthMm / values.length;
            const invertVertically = this.configManager.config.modes.spectrum.invertVertically;
            const smoothVertically = this.configManager.config.modes.spectrum.smoothVertically;
            this.ledsController.leds.ledsArray.forEach((led) => {
                let brightness = 15;
                values.forEach((value, idx) => {
                    if (led.horizontalPosition > 0 && led.virtualVerticalPosition > 0) {
                        const barStart = idx * barWidth;
                        const barEnd = barStart + barWidth;
                        const verticalActivationStrength = Functions.clamp(Math.abs(value - led.virtualVerticalPosition), 0, 9);
                        const smoothBrightness = Functions.mapValue(verticalActivationStrength, 0, 9, 15, 255);
                        if (led.horizontalPosition >= barStart &&
                            led.horizontalPosition <= barEnd) {
                            if (invertVertically &&
                                led.virtualVerticalPosition >= 999 - value + 1) {
                                brightness = smoothVertically ? smoothBrightness : 255;
                            }
                            else if (!invertVertically &&
                                led.virtualVerticalPosition <= value) {
                                brightness = smoothVertically ? smoothBrightness : 255;
                            }
                        }
                        else if (led.horizontalPosition >= barStart - 0.5 * barWidth &&
                            led.horizontalPosition <= barEnd + 0.5 * barWidth) {
                            const leftBarValue = idx > 0 ? values[idx - 1] : 0;
                            const rightBarValue = idx < values.length - 2 ? values[idx + 1] : 0;
                            const leftBleeding = values[idx];
                            const rightBleeding = values[idx];
                        }
                    }
                    else if (led.virtualVerticalPosition < 0 &&
                        led.horizontalPosition < 0) {
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
        this.ledsController = ledsController;
        this.configManager = configManager;
        this.audioData = [];
        this.colorRgb = ledsController.color;
        this.colorHsl = Functions.rgbColorToHsl(ledsController.color);
        let config = this.configManager.config;
        // console.log(JSON.stringify(config))
        ledsController.updateLeds();
    }
}
exports.default = KeyboardAnimator;
