import { Leds } from "./leds";
import HID from "node-hid";
import * as path from "path";
import * as fs from "fs";
import * as Functions from "./functions";
import * as Types from "./types";

export default class LedsController {
  leds: Leds;
  deviceInfo: HID.Device | undefined;
  color: Types.ColorRgb;
  constructor(defaultColor: Types.ColorRgb) {
    const devices = HID.devices();
    this.color = defaultColor;
    this.deviceInfo = devices.find(
      (device) => device.vendorId === 0x048d && device.productId === 0xc956
    );
    const ledsPath = path.resolve(__dirname, "../", "leds.json");
    const rawData = fs.readFileSync(ledsPath);
    this.leds = new Leds(rawData.toString(), defaultColor);
  }
  updateLeds = () => {
    if (this.deviceInfo?.path) {
      const device = new HID.HID(this.deviceInfo.path);
      const chunks = this.leds.getByteChunks();
      chunks.forEach((chunk, idx) => {
        // console.log(`chunk #${idx}`, chunk);
        // console.log(`writing packet #${idx}`);
        device.sendFeatureReport(chunk);
      });
    }
  };
}
