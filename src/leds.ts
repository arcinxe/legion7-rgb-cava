import * as Types from "./types";
import * as Functions from "./functions";
export class Leds {
  ledsArray: Types.Led[];
  _brightness = 255;
  constructor(jsonData: string, defaultColor: Types.ColorRgb) {
    this.ledsArray = JSON.parse(jsonData);
    this.ledsArray.forEach((led) => {
      led.color = {
        red: defaultColor.red,
        green: defaultColor.green,
        blue: defaultColor.blue,
      };
      led.sideSegmentsBleedingStrength = 0;
      led.address = parseInt(led.address.toString(), 16);
      led.virtualVerticalPosition = Functions.mapValue(led.verticalPosition, 2,115,0,999)
    });
    var foo = this.ledsArray.slice(0,30)
    // console.log(`foo`, foo)
    // console.log("leds:", this.leds)
  }

  public set brightness(v: number) {
    this._brightness = v;
    // console.log(`setting brightness to ${this._brightness}`)
  }

  getBytes = () => {
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

  getByteChunks = () => {
    let bytes = this.getBytes();
    var result = bytes.reduce((resultArray: number[][], item, index) => {
      const chunkIndex = Math.floor(index / 180);
      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [0x07, 0xa1, 0x2f, 0x00]; // start a new chunk
      }
      resultArray[chunkIndex].push(item);
      return resultArray;
    }, []);

    return result;
  };
}
