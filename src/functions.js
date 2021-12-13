"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapValue = void 0;
let mapValue = (x, inMin, inMax, outMin, outMax) => {
    return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};
exports.mapValue = mapValue;
