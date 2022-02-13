import { Leds } from "./leds";
import HID from "node-hid";
import * as path from "path";
import * as fs from "fs";
import * as Functions from "./functions";
import * as Types from "./types";

export default class ConfigManager {
  config: Types.Config;
  constructor() {
    this.config = this.getConfig();
  }
  updateConfig = () => {
    this.config = this.getConfig();
  };
  getConfig = (): Types.Config => {
    const configPath = path.resolve(__dirname, "../", "config.json");
    const rawData = fs.readFileSync(configPath);
    return JSON.parse(rawData.toString());
  };
}
