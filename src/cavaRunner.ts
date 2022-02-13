import * as fs from "fs";
import * as path from "path";
import * as Functions from "./functions";
const spawn = require("child_process").spawn;
export default class CavaRunner {
  configFilePath: string;
  onData: Function | undefined;
  childrenProcess: any;
  constructor() {
    this.configFilePath = path.resolve(__dirname, "../", "cava.config");
    this.childrenProcess = spawn("unbuffer", [
      "cava",
      "-p",
      this.configFilePath,
    ]);
    this.childrenProcess.stdout.setEncoding("utf8");

    this.childrenProcess.stdout.on("data", (data: any) => {
      // console.log({data})
      let str: string = data.toString();
      let lines = str.split(/(\r?\n)/g);
      let text = lines.join("");
      let values = text.split(";");
      let isFull = values.length === 13 && values[values.length - 1] === "!";
      if (isFull) values.pop();
      values = values
        .map((v) => v?.padStart(3, "0"))
        .map((v) => (v?.length > 3 ? "999" : v));
      let numericValues = values.map((v) => Math.floor(parseInt(v)));
      // .map((v) => Functions.mapValue(v, 0, 999, 10, 255))

      if (isFull) {
        this.emitEvent(numericValues);
      }
    });

    this.childrenProcess.on("close", function (code: any) {
      console.log("process exit code " + code);
    });
  }

  emitEvent(values: number[]) {
    // console.log(`values`, values)
    if (this.onData != null && typeof this.onData === "function") {
      this.onData(values);
    }
  }
}
