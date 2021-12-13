export interface Led {
  address: number;
  name: string;
  character: string;
  button: string;
  horizontalPosition: number;
  verticalPosition: number;
  color: Color;
}

export interface Color {
  red: number;
  green: number;
  blue: number;
}
