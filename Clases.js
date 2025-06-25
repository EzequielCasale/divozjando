// Clases.js - SOLO clases visuales

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
  }

  esCalido(hsv) {
    let h = hsv[0];
    return (h < 70 || (h > 330 && h <= 360));
  }

  color(illumCalido, illumFrio) {
    let baseCol = this.blend ? this.palette.lerpHSV(this.c1, this.c2, 0.4) : this.c1;
    let brillo = this.esCalido(baseCol) ? illumCalido : illumFrio;
    return this.palette.applyIllumination(baseCol, brillo);
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

class LineSegment {
  constructor(ini, fin, grosor) {
    this.ini = ini;
    this.fin = fin;
    this.grosor = grosor;
  }

  draw(lineAlpha, vOffset, hOffset) {
    let [x1, y1] = this.ini;
    let [x2, y2] = this.fin;
    let dx = abs(x1 - x2);
    let dy = abs(y1 - y2);
    if (dx < dy) { y1 += vOffset; y2 += vOffset; }
    else if (dy < dx) { x1 += hOffset; x2 += hOffset; }
    let len = dist(x1, y1, x2, y2);
    let ang = atan2(y2 - y1, x2 - x1);
    push();
    translate(x1, y1);
    rotate(ang);
    fill(0, 0, 0, lineAlpha);
    noStroke();
    rect(0, -this.grosor / 2, len, this.grosor);
    pop();
  }
}

class BrushStroke {
  constructor(palette, maskImgs) {
    this.bx = random(width);
    this.by = random(height);
    this.bw = random(48, 130);
    this.bh = random(10, 46);
    this.ang = random(TWO_PI);
    this.bc = [...palette.randomColor(), 170];
    this.mi = int(random(maskImgs.length));
    this.maskImgs = maskImgs;
  }

  draw() {
    let pg = createGraphics(this.bw, this.bh);
    pg.colorMode(HSB, 360, 100, 100, 255);
    pg.clear();
    pg.image(this.maskImgs[this.mi], 0, 0, this.bw, this.bh);
    pg.loadPixels();
    for (let i = 0; i < pg.pixels.length; i += 4) {
      if (pg.pixels[i + 3] > 10) {
        let c = color(this.bc[0], this.bc[1], this.bc[2], this.bc[3]);
        let [r, g, b, a] = [red(c), green(c), blue(c), alpha(c)];
        pg.pixels[i + 0] = r;
        pg.pixels[i + 1] = g;
        pg.pixels[i + 2] = b;
        pg.pixels[i + 3] = a;
      }
    }
    pg.updatePixels();
    push();
    translate(this.bx, this.by);
    rotate(this.ang);
    image(pg, 0, 0);
    pop();
  }
}
