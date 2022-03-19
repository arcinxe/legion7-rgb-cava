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
const path = __importStar(require("path"));
const spawn = require("child_process").spawn;
class CavaRunner {
    constructor() {
        this.configFilePath = path.resolve(__dirname, "../", "cava.config");
        this.childrenProcess = spawn("unbuffer", [
            "cava",
            "-p",
            this.configFilePath,
        ]);
        this.childrenProcess.stdout.setEncoding("utf8");
        this.childrenProcess.stdout.on("data", (data) => {
            // console.log({data})
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
            let numericValues = values.map((v) => Math.floor(parseInt(v)));
            // .map((v) => Functions.mapValue(v, 0, 999, 10, 255))
            if (isFull) {
                this.emitEvent(numericValues);
            }
        });
        this.childrenProcess.on("close", function (code) {
            console.log("process exit code " + code);
        });
    }
    emitEvent(values) {
        // console.log(`values`, values)
        if (this.onData != null && typeof this.onData === "function") {
            this.onData(values);
        }
    }
}
exports.default = CavaRunner;
