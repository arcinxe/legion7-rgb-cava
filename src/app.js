#!/usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Functions = __importStar(require("./functions"));
const configManager_1 = __importDefault(require("./configManager"));
const ledsController_1 = __importDefault(require("./ledsController"));
const cavaRunner_1 = __importDefault(require("./cavaRunner"));
const yargs = __importStar(require("yargs"));
const keyboardAnimator_1 = __importDefault(require("./keyboardAnimator"));
const readline = require("readline");
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
let hue = 357;
let lightness = 50;
const options = yargs
    .option("v", {
    alias: "verbose",
    describe: "Display sent values",
    type: "boolean",
    demandOption: false,
})
    .option("c", {
    alias: "color",
    describe: "Hex color",
    type: "string",
    default: "#FF0010",
    demandOption: false,
}).argv;
const isVerbose = options.v !== undefined && options.v;
const color = Functions.parseHexColor(options.c) ?? {
    red: 255,
    green: 0,
    blue: 16,
};
Object.freeze(color);
const configManager = new configManager_1.default();
const ledsController = new ledsController_1.default(color);
const keyboardAnimator = new keyboardAnimator_1.default(ledsController, configManager);
const onCavaData = (values) => {
    // console.log(`values`, values)
    keyboardAnimator.onCavaData(values);
};
process.stdin.on("keypress", (str, key) => {
    if (key.ctrl && key.name === "c") {
        process.exit();
    }
    else {
        // console.log(key.name);
        switch (key.name) {
            case "up":
                lightness = (++lightness) % 100;
                break;
            case "down":
                lightness = (--lightness) % 100;
                break;
            case "left":
                hue = (--hue) % 360;
                break;
            case "right":
                hue = (++hue) % 360;
                break;
            case "r":
                configManager.updateConfig();
                break;
            case "s":
                configManager.config.modes.spectrum.invertVertically =
                    !configManager.config.modes.spectrum.invertVertically;
                break;
            default:
                break;
        }
        console.log({ hue, lightness });
        keyboardAnimator.selectHueAndLightness(hue, lightness);
    }
});
var cavaRunner = new cavaRunner_1.default();
cavaRunner.onData = onCavaData;
