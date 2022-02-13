#!/usr/bin/env node

import * as Functions from "./functions";
import * as Types from "./types";
import { Leds } from "./leds";
import ConfigManager from "./configManager";
import LedsController from "./ledsController";
import CavaRunner from "./cavaRunner";
import * as fs from "fs";
import * as path from "path";
import * as yargs from "yargs";
import HID from "node-hid";
import KeyboardAnimator from "./keyboardAnimator";
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

const color: Types.Color = Functions.parseHexColor(options.c) ?? {
  red: 255,
  green: 0,
  blue: 16,
};
Object.freeze(color);
const configManager = new ConfigManager();
const ledsController = new LedsController(color);
const keyboardAnimator = new KeyboardAnimator(ledsController, configManager);
const onCavaData = (values: number[]): void => {
  // console.log(`values`, values)
  keyboardAnimator.onCavaData(values);
};

process.stdin.on("keypress", (str: string, key: Types.Key) => {
  if (key.ctrl && key.name === "c") {
    process.exit();
  } else {
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
var cavaRunner = new CavaRunner();
cavaRunner.onData = onCavaData;
