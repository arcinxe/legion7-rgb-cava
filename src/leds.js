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
exports.Leds = void 0;
const Functions = __importStar(require("./functions"));
class Leds {
    constructor(jsonData, defaultColor) {
        this._brightness = 255;
        this.getBytes = () => {
            // console.log("before brightness", this.ledsArray)
            let result = this.ledsArray.map((led) => [
                led.address,
                Math.floor(led.color.red * (this._brightness / 255)),
                Math.floor(led.color.green * (this._brightness / 255)),
                Math.floor(led.color.blue * (this._brightness / 255)),
            ]);
            // console.log("raw bytes", result)
            let flattenedResult = result.flat();
            // console.log("flattened bytes", result)
            return flattenedResult;
        };
        this.getByteChunks = () => {
            let bytes = this.getBytes();
            var result = bytes.reduce((resultArray, item, index) => {
                const chunkIndex = Math.floor(index / 180);
                if (!resultArray[chunkIndex]) {
                    resultArray[chunkIndex] = [0x07, 0xa1, 0x2f, 0x00]; // start a new chunk
                }
                resultArray[chunkIndex].push(item);
                return resultArray;
            }, []);
            return result;
        };
        this.ledsArray = JSON.parse(jsonData);
        this.ledsArray.forEach((led) => {
            led.color = {
                red: defaultColor.red,
                green: defaultColor.green,
                blue: defaultColor.blue,
            };
            led.sideSegmentsBleedingStrength = 0;
            led.address = parseInt(led.address.toString(), 16);
            led.virtualVerticalPosition = Functions.mapValue(led.verticalPosition, 2, 115, 0, 999);
        });
        var foo = this.ledsArray.slice(0, 30);
        // console.log(`foo`, foo)
        // console.log("leds:", this.leds)
    }
    set brightness(v) {
        this._brightness = v;
        // console.log(`setting brightness to ${this._brightness}`)
    }
}
exports.Leds = Leds;
