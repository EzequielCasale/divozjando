
class ColorPalette {//No pudismos encontrar la forma de extraer la paleta de colores. Cuando "funciona" solo se pone blanco. Preferimos usar una paleta de colores que nosotros pudieramos encontrar a ojo. Tambien intentamos usar paleta de 5 colores donde habia un solo azul, sin embargo por alguna razon ese azul no funcionaba, asi que estos funcionan correctamente
  constructor() {
    this.colors = [
      [218, 88, 40],   // Azul oscuro 
      [202, 77, 50],   // Celeste oscuro 
      [0, 87, 12],     // Rojo oscuro
      [50, 88, 15],    // Amarillo oscuro
      [0, 0, 100],     // Blanco
      [0, 0, 0],       // Negro
      [30, 87, 18],    // Naranja oscuro
      [243, 49, 38]    // Azul violeta 
    ];
  }

  randomColor() {
    return this.colors[int(random(this.colors.length))];//devuelve un color random de la paleta previa
  }

  lerpHSV(a, b, amt) {//ayuda a dar colores mejores usando hsv, mezclando, por ejemplo rojo y azul para dar violeta
    let dh = ((b[0] - a[0] + 540) % 360) - 180;
    let h = (a[0] + dh * amt + 360) % 360;
    let s = lerp(a[1], b[1], amt);
    let v = lerp(a[2], b[2], amt);
    return [h, s, v];
  }

  applyIllumination(hsv, illum) {//ajusta el valor del brillo devuelto por hsv
    let h = hsv[0];
    let s = hsv[1];
    let v = constrain(hsv[2] * illum, 0, 100);
    return [h, s, v];
  }
}
