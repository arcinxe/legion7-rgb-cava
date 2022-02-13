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
const leds_1 = require("./leds");
const node_hid_1 = __importDefault(require("node-hid"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class LedsController {
    constructor(defaultColor) {
        this.updateLeds = () => {
            if (this.deviceInfo?.path) {
                const device = new node_hid_1.default.HID(this.deviceInfo.path);
                const chunks = this.leds.getByteChunks();
                chunks.forEach((chunk, idx) => {
                    // console.log(`chunk #${idx}`, chunk);
                    // console.log(`writing packet #${idx}`);
                    device.sendFeatureReport(chunk);
                });
            }
        };
        const devices = node_hid_1.default.devices();
        this.color = defaultColor;
        this.deviceInfo = devices.find((device) => device.vendorId === 0x048d && device.productId === 0xc956);
        const ledsPath = path.resolve(__dirname, "../", "leds.json");
        const rawData = fs.readFileSync(ledsPath);
        this.leds = new leds_1.Leds(rawData.toString(), defaultColor);
    }
}
exports.default = LedsController;
