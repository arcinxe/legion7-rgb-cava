#!/usr/bin/env node

import * as Functions from "./functions";
import * as Types from "./types";
import { Leds } from "./leds";
import * as fs from "fs";
import * as path from "path";
import * as yargs from "yargs";
import HID from "node-hid";

const devices = HID.devices();
const deviceInfo = devices.find(function (d) {
  const isKeyboard = d.vendorId === 0x048d && d.productId === 0xc956;
  return isKeyboard;
});

const options = yargs
  .option("v", {
    alias: "verbose",
    describe: "Display sent values",
    type: "boolean",
    demandOption: false,
  })
  .option("c", {
    alias: "color",
    describe: "Hue of the color",
    type: "number",
    default: 349,
    demandOption: false,
  }).argv;

const isVerbose = options.v !== undefined && options.v;

const hue = options.c;
let indexesFlags = 0b10000001; // stripBot, stripTop, indicator0, stripIns, fanFrontBot, fanFrontMid, fanFrontTop, fanRearTop

// let webSocketBoard = new WebSocket("ws://192.168.1.30:81/");
// webSocketBoard.on("open", function open() {
//   console.log("board connection opened");
//   // webSocketBoard.send(`hue=${hue.toString().padStart(3, "0")}`);
// });
// webSocketBoard.on("close", function incoming(message) {
//   console.log("board connection closed");
//   webSocketBoard = new WebSocket("ws://192.168.1.35:81/");
// });

let basePath = path.resolve(__dirname, "../");
let cavaConfigPath = `${basePath}/cava.config`;
let rawData = fs.readFileSync("leds.json");

const leds = new Leds(rawData.toString());
if (isVerbose) console.log({ cavaConfigPath });

if (deviceInfo && deviceInfo?.path) {
  const device = new HID.HID(deviceInfo.path);
  var ledByteChunks = leds.getByteChunks();
  ledByteChunks.forEach((chunk, idx) => {
    // console.log(`writing packet #${idx}`);
    device.sendFeatureReport(chunk);
  });

  let spawn = require("child_process").spawn;
  let childrenProcess = spawn("unbuffer", ["cava", "-p", cavaConfigPath]);
  childrenProcess.stdout.setEncoding("utf8");

  childrenProcess.stdout.on("data", function (data: any) {
    let str: string = data.toString();
    let lines = str.split(/(\r?\n)/g);
    let text = lines.join("");
    let values = text.split(";");
    let isFull = values.length === 21 && values[values.length - 1] === "!";
    if (isFull) values.pop();
    values = values
      .map((v) => v?.padStart(3, "0"))
      .map((v) => (v?.length > 3 ? "999" : v));
    let numericValues = values.map((v) =>
      Math.floor(Functions.mapValue(parseInt(v), 0, 999, 10, 255))
    );
    // text = `${indexesFlags.toString().padStart(3, "0")}:${values.join(";")};`;

    if (isFull) {
      // if (isVerbose) console.log(numericValues);
      leds.brightness = numericValues[0];
      ledByteChunks = leds.getByteChunks();
      ledByteChunks.forEach((chunk, idx) => {
        // console.log(`chunk #${idx}`, chunk);
        // console.log(`writing packet #${idx}`);
        device.sendFeatureReport(chunk);
      });
    }
  });

  childrenProcess.on("close", function (code: any) {
    console.log("process exit code " + code);
  });
}
