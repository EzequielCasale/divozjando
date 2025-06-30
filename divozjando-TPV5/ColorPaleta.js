// ColorPalette.js - SOLO la clase ColorPalette

class ColorPalette {
  constructor() {
    this.colors = [
      [218, 88, 58],   // Azul oscuro
      [202, 77, 87],   // Celeste
      [0, 87, 85],     // Rojo
      [50, 88, 98],    // Amarillo
      [0, 0, 100],     // Blanco
      [0, 0, 0],       // Negro
      [30, 87, 96],    // Naranja
      [243, 49, 25]    // Azul violeta
    ];
  }

  randomColor() {
    return this.colors[int(random(this.colors.length))];
  }

  lerpHSV(a, b, amt) {
    let dh = ((b[0] - a[0] + 540) % 360) - 180;
    let h = (a[0] + dh * amt + 360) % 360;
    let s = lerp(a[1], b[1], amt);
    let v = lerp(a[2], b[2], amt);
    return [h, s, v];
  }

  applyIllumination(hsv, illum) {
    let h = hsv[0];
    let s = hsv[1];
    let v = constrain(hsv[2] * illum, 0, 100);
    return [h, s, v];
  }
}
