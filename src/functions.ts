import * as fs from "fs";
import * as path from "path";
import * as cliProgress from "cli-progress";
import * as Types from "./types";

export let mapValue = (
  x: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => {
  return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};
