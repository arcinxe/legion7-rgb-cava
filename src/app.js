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
const leds_1 = require("./leds");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yargs = __importStar(require("yargs"));
const node_hid_1 = __importDefault(require("node-hid"));
const devices = node_hid_1.default.devices();
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
const leds = new leds_1.Leds(rawData.toString());
if (isVerbose)
    console.log({ cavaConfigPath });
if (deviceInfo && deviceInfo?.path) {
    const device = new node_hid_1.default.HID(deviceInfo.path);
    var ledByteChunks = leds.getByteChunks();
    ledByteChunks.forEach((chunk, idx) => {
        // console.log(`writing packet #${idx}`);
        device.sendFeatureReport(chunk);
    });
    let spawn = require("child_process").spawn;
    let childrenProcess = spawn("unbuffer", ["cava", "-p", cavaConfigPath]);
    childrenProcess.stdout.setEncoding("utf8");
    childrenProcess.stdout.on("data", function (data) {
        let str = data.toString();
        let lines = str.split(/(\r?\n)/g);
        let text = lines.join("");
        let values = text.split(";");
        let isFull = values.length === 21 && values[values.length - 1] === "!";
        if (isFull)
            values.pop();
        values = values
            .map((v) => v?.padStart(3, "0"))
            .map((v) => (v?.length > 3 ? "999" : v));
        let numericValues = values.map((v) => Math.floor(Functions.mapValue(parseInt(v), 0, 999, 10, 255)));
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
    childrenProcess.on("close", function (code) {
        console.log("process exit code " + code);
    });
}
