class ColorPalette {
  constructor() {
    this.colors = [
      [0, 87, 90],     // Rojo 
      [30, 87, 80],    // Naranja 
      [50, 88, 70],    // Amarillo 
      [218, 88, 85],   // Azul frío 
      [202, 77, 80],   // Celeste 
      [243, 49, 75],   // Azul 
      [0, 0, 100],     // Blanco
      [0, 0, 0]        // Negro
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
    let v = constrain(hsv[2] * illum / 100, 0, 100);
    return [h, s, v];
  }
}
