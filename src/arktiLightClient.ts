import * as Types from "./types";
import * as Functions from "./functions";
import LedsController from "./ledsController";
import CavaRunner from "./cavaRunner";
import ConfigManager from "./configManager";
import WebSocket, { CLOSING } from "ws";

export default class ArktiLightClient {
  configManager: ConfigManager;
  audioData: number[];
  color: Types.ColorRgb;
  ip: string;
  webSocketPc: WebSocket;
  enabled = true;

  indexesFlags = 0b000000011;
  hue = 358;
  lightness = 50;
  constructor(configManager: ConfigManager, ip: string) {
    this.configManager = configManager;
    this.audioData = [];
    this.color = { red: 255, green: 0, blue: 10 };
    // let config = this.configManager.config;
    // console.log(JSON.stringify(config))
    this.ip = ip;
    this.webSocketPc = this.initWebSocketConnection();
  }

  selectHueAndLightness = (hue: number, lightness: number): void => {
    this.color = Functions.hslToRgb(hue / 360, 1, lightness / 100);
    this.hue = hue;
    this.lightness = lightness;
    this.webSocketPc.send(`hue=${this.hue.toString().padStart(3, "0")}`);
    this.webSocketPc.send(
      `lightness=${this.lightness.toString().padStart(3, "0")}`
    );
  };
  enable = (enable: boolean): void => {
    this.enabled = enable;
  };
  
  onCavaData = (values: number[]): void => {
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
      if (this.webSocketPc.readyState === WebSocket.OPEN) {
        this.webSocketPc.send(text);
      }
    }
  };

  initWebSocketConnection = (): WebSocket => {
    console.log("connecting...");

    this.webSocketPc = new WebSocket(`ws://${this.ip}:81/`);

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

  sendInitData = () => {
    const arktilightCtx = this;
    this.webSocketPc.on("open", function open() {
      console.log("connection opened");
      if (arktilightCtx.webSocketPc.readyState === WebSocket.OPEN) {
        arktilightCtx.webSocketPc.send(
          `hue=${arktilightCtx.hue.toString().padStart(3, "0")}`
        );
      }
      if (arktilightCtx.webSocketPc.readyState === WebSocket.OPEN) {
        arktilightCtx.webSocketPc.send(
          `lightness=${arktilightCtx.lightness.toString().padStart(3, "0")}`
        );
      }
    });
  };

  restartConnection = (): void => {
    console.log("restarting connection");

    this.webSocketPc.terminate();
    setTimeout(this.initWebSocketConnection, 1000);
  };
}
