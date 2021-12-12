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
const path = __importStar(require("path"));
const yargs = __importStar(require("yargs"));
const ws_1 = __importDefault(require("ws"));
const options = yargs.option("v", {
    alias: "verbose",
    describe: "Display sent values",
    type: "boolean",
    demandOption: false,
}).option("c", {
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
let webSocketPc = new ws_1.default("ws://192.168.1.35:81/");
webSocketPc.on("open", function open() {
    console.log("pc connection opened");
    webSocketPc.send(`hue=${hue.toString().padStart(3, "0")}`);
});
webSocketPc.on("message", function incoming(message) {
    console.log("received: %s", message);
});
webSocketPc.on("close", function incoming(message) {
    console.log("pc connection closed");
    webSocketPc = new ws_1.default("ws://192.168.1.35:81/");
});
let basePath = path.resolve(__dirname, "../");
let cavaConfigPath = `${basePath}/cava.config`;
if (isVerbose)
    console.log({ cavaConfigPath });
let spawn = require("child_process").spawn;
let childrenProcess = spawn("unbuffer", ["cava", "-p", cavaConfigPath]);
childrenProcess.stdout.setEncoding("utf8");
childrenProcess.stdout.on("data", function (data) {
    let str = data.toString();
    let lines = str.split(/(\r?\n)/g);
    let text = lines.join("");
    // console.log(text);
    // console.log("DATA");
    // let values = text.split(";").filter((v: string) => v != "" && v != " " && v != "\n");
    let values = text.split(";");
    let isFull = values.length === 16 && values[values.length - 1] === "!";
    if (isFull)
        values.pop();
    // values[values.length - 1] = values[values.length - 2];s
    // console.log({ isFull, values });
    values = values
        .map((v) => v?.padStart(3, "0"))
        .map((v) => (v?.length > 3 ? "999" : v));
    // values.reverse();
    // console.log({ values });
    text = `${indexesFlags.toString().padStart(3, "0")}:${values.join(";")};`;
    // console.log(values.join(";"));
    if (isFull) {
        webSocketPc.send(text);
        // webSocketBoard.send(text);
        if (isVerbose)
            console.log(text);
    }
});
childrenProcess.on("close", function (code) {
    console.log("process exit code " + code);
});
