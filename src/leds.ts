import * as Types from "./types";

export class Leds {
  leds: Types.Led[];
  _brightness = 255;
  constructor(jsonData: string) {
    this.leds = JSON.parse(jsonData);
    this.leds.forEach((led) => {
      led.color = { red: 255, green: 0, blue: 20 };
      led.address = parseInt(led.address.toString(), 16);
    });
    // console.log("leds:", this.leds)
  }

  public set brightness(v: number) {
    this._brightness = v;
    // console.log(`setting brightness to ${this._brightness}`)
  }

  getBytes = () => {
    let result = this.leds.map((led) => [
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
