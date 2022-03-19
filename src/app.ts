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
import ArktiLightClient from "./arktiLightClient";
const readline = require("readline");

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
let hue = 357;
let lightness = 50;
let controllingKeyboard = true;
let controllingSoundbar = true;

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
  })
  .option("b", {
    alias: "soundbar",
    describe: "Enable arktilight for soundbar",
    type: "boolean",
    demandOption: false,
    default: false,
  })
  .option("s", {
    alias: "shelf",
    describe: "Enable arktilight for shelf light",
    type: "boolean",
    demandOption: false,
    default: false,
  }).argv;

const isVerbose = options.v !== undefined && options.v;

const color: Types.ColorRgb = Functions.parseHexColor(options.c) ?? {
  red: 255,
  green: 0,
  blue: 16,
};
Object.freeze(color);
const configManager = new ConfigManager();
const ledsController = new LedsController(color);
const keyboardAnimator = new KeyboardAnimator(ledsController, configManager);
let arktiLightClientSoundbar: ArktiLightClient;
let arktiLightClientShelf: ArktiLightClient;
if (options.b) {
  arktiLightClientSoundbar = new ArktiLightClient(configManager, "192.168.1.5");
}
if (options.s) {
  arktiLightClientShelf = new ArktiLightClient(configManager, "192.168.1.2");
}
let onCavaData = (values: number[]): void => {
  // console.log(`values`, values)
  keyboardAnimator.onCavaData(values);
  arktiLightClientSoundbar?.onCavaData(values);
  arktiLightClientShelf?.onCavaData(values);
};

process.stdin.on("keypress", (str: string, key: Types.Key) => {
  if (key.ctrl && key.name === "c") {
    process.exit();
  } else {
    // console.log(key.name);
let lightnessChange = 0;
let hueChange = 0;
    switch (key.name) {
      case "up":
        lightness = Math.abs(++lightness % 101);
        break;
      case "down":
        lightness = Math.abs(--lightness % 101);
        break;
      case "left":
        hue = --hue % 361;
        break;
      case "right":
        hue = ++hue % 361;
        break;
      case "r":
        configManager.updateConfig();
        break;
      case "s":
        configManager.config.modes.spectrum.invertVertically =
          !configManager.config.modes.spectrum.invertVertically;
        break;
      case "k":
        controllingKeyboard = !controllingKeyboard;
        break;
      case "b":
        controllingSoundbar = !controllingSoundbar;
        break;
      default:
        break;
    }
    console.log({ hue, lightness });
    if (controllingKeyboard)
      keyboardAnimator.selectHueAndLightness(hue, lightness);
    if (controllingSoundbar)
      arktiLightClientSoundbar.selectHueAndLightness(hue, lightness);
  }
});
var cavaRunner = new CavaRunner();
cavaRunner.onData = onCavaData;
