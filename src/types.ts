export interface Led {
  address: number;
  name: string;
  character: string;
  button: string;
  horizontalPosition: number;
  verticalPosition: number;
  color: ColorRgb;
  virtualVerticalPosition: number;
  sideSegmentsBleedingStrength: number;
}

export interface ColorRgb {
  red: number;
  green: number;
  blue: number;
}
export interface ColorHsv {
  hue: number;
  saturation: number;
  value: number;
}
export interface ColorHsl {
  hue: number;
  saturation: number;
  lightness: number;
}
export interface Key {
  
  sequence: string;
  name: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  code: string;
}

export interface Config {
  dev: dev;
  modes: LightModes;
}

export interface LightModes{
  spectrum:SpectrumMode
}
export interface SpectrumMode {
  colors: LightModeColors;
  invertVertically:boolean;
  smoothVertically:boolean;
  smoothHorizontally:boolean;
}
export interface LightModeColors {
  main0: string;
  main1: string;
  main2: string;
  background0: string;
  background1: string;
  background2: string;
  logo: string;
  neon: string;
  vents: string;
}
export interface dev {
  temp0: string;
  temp1: string;
  temp2: string;
  temp3: string;
}
