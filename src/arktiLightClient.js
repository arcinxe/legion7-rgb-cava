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
const ws_1 = __importDefault(require("ws"));
class ArktiLightClient {
    constructor(configManager, ip) {
        this.enabled = true;
        this.indexesFlags = 0b000000011;
        this.hue = 358;
        this.lightness = 50;
        this.selectHueAndLightness = (hue, lightness) => {
            this.color = Functions.hslToRgb(hue / 360, 1, lightness / 100);
            this.hue = hue;
            this.lightness = lightness;
            this.webSocketPc.send(`hue=${this.hue.toString().padStart(3, "0")}`);
            this.webSocketPc.send(`lightness=${this.lightness.toString().padStart(3, "0")}`);
        };
        this.enable = (enable) => {
            this.enabled = enable;
        };
        this.onCavaData = (values) => {
            if (this.enabled) {
                this.audioData = values.reverse();
                const stringValues = values
                    .map((v) => v.toString()?.padStart(3, "0"))
                    .map((v) => (v?.length > 3 ? "999" : v));
                // values.reverse();
                // console.log({ values });
                const text = `${this.indexesFlags
                    .toString()
                    .padStart(3, "0")}:${stringValues.join(";")};`;
                // console.log(values.join(";"));
                if (this.webSocketPc.readyState === ws_1.default.OPEN) {
                    this.webSocketPc.send(text);
                }
            }
        };
        this.initWebSocketConnection = () => {
            console.log("connecting...");
            this.webSocketPc = new ws_1.default(`ws://${this.ip}:81/`);
            this.webSocketPc.on("close", () => {
                console.log("connection closed");
                setTimeout(this.restartConnection, 2000);
            });
            this.webSocketPc.on("error", () => {
                console.log("connection error occurred");
                setTimeout(this.restartConnection, 2000);
            });
            this.sendInitData();
            return this.webSocketPc;
        };
        this.sendInitData = () => {
            const arktilightCtx = this;
            this.webSocketPc.on("open", function open() {
                console.log("connection opened");
                if (arktilightCtx.webSocketPc.readyState === ws_1.default.OPEN) {
                    arktilightCtx.webSocketPc.send(`hue=${arktilightCtx.hue.toString().padStart(3, "0")}`);
                }
                if (arktilightCtx.webSocketPc.readyState === ws_1.default.OPEN) {
                    arktilightCtx.webSocketPc.send(`lightness=${arktilightCtx.lightness.toString().padStart(3, "0")}`);
                }
            });
        };
        this.restartConnection = () => {
            console.log("restarting connection");
            this.webSocketPc.terminate();
            setTimeout(this.initWebSocketConnection, 1000);
        };
        this.configManager = configManager;
        this.audioData = [];
        this.color = { red: 255, green: 0, blue: 10 };
        // let config = this.configManager.config;
        // console.log(JSON.stringify(config))
        this.ip = ip;
        this.webSocketPc = this.initWebSocketConnection();
    }
}
exports.default = ArktiLightClient;
