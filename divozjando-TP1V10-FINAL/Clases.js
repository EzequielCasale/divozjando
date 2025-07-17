class HRect {
  constructor(x, y, w, h, palette) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.palette = palette;
    this.c1 = palette.randomColor();
    this.c2 = random() < 0.4 ? palette.randomColor() : this.c1;
    this.blend = this.c1.toString() !== this.c2.toString() && random() < 0.7;
    this.textura = texturaCuadrados[int(random(texturaCuadrados.length))];
    this.baseCol = this.blend ? this.palette.lerpHSV(this.c1, this.c2, 0.2) : this.c1;
  }

  esCalido(hsv) {
    let h = hsv[0];
    return (h < 70 || (h > 330 && h <= 360));
  }

  color(illumCalido, illumFrio) {
    let brillo = this.esCalido(this.baseCol) ? illumCalido : illumFrio;
    return this.palette.applyIllumination(this.baseCol, brillo);
  }

  draw(illumCalido, illumFrio) {
    let scale = 1.5;
    let tw = this.w * scale;
    let th = this.h * scale;
    let pg = createGraphics(tw, th);
    pg.colorMode(HSB, 360, 100, 100, 255);
    let col = this.color(illumCalido, illumFrio);
    pg.noStroke();
    pg.fill(col[0], col[1], col[2]);
    pg.rect(0, 0, tw, th);

    let texturaRedimensionada = createImage(tw, th);
    texturaRedimensionada.copy(this.textura, 0, 0, this.textura.width, this.textura.height, 0, 0, tw, th);

    pg.loadPixels();
    texturaRedimensionada.loadPixels();
    for (let i = 0; i < pg.pixels.length; i += 4) {
      pg.pixels[i + 3] = texturaRedimensionada.pixels[i + 3];
    }
    pg.updatePixels();

    image(pg, this.x - (tw - this.w) / 2, this.y - (th - this.h) / 2);
  }
}
