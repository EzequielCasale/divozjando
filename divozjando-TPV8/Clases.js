
class HRect {//en esta clase se guardan las propiedades de los rectangulos grandes
  constructor(x, y, w, h, palette) {
    this.x = x;//posiciones y ancho del rectangulo
    this.y = y;
    this.w = w;
    this.h = h;
    this.palette = palette;
    this.c1 = palette.randomColor();//elige un color random de mi paleta
    this.c2 = random() < 0.4 ? palette.randomColor() : this.c1;
    this.blend = this.c1.toString() !== this.c2.toString() && random() < 0.7;//aca la mezcla con un color secundario elegido y le da, en este caso, 70% de probabilidad de que suceda, paraa tener variedad de colores a parte de la que existen, ya que sentimos la paleta dada un poco limitada para la interaccion entre colores calidos y frio
    this.textura = texturaCuadrados[int(random(texturaCuadrados.length))];
    // Guardar el color base de la mezcla (sin brillo alterado)
    this.baseCol = this.blend ? this.palette.lerpHSV(this.c1, this.c2, 0.2) : this.c1;
  }

  esCalido(hsv) { //define que un color sea calido
    let h = hsv[0];
    return (h < 70 || (h > 330 && h <= 360));
  }

  color(illumCalido, illumFrio) {
    // SIEMPRE partir del color base guardado, nunca del resultado anterior
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
    pg.rect(0, 0, tw, th);//se dibuja el rectangulo con los graficos implementados (escala, color, "iluminacion", etc)

 //redimensiona la textura de los rectangulos
    let texturaRedimensionada = createImage(tw, th);//redimensiona la textura
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

class LineSegment { //Tenemos una segunda version de esta clase donde implementamos textura de pinceles, sin embargo ralentiza mucho la obra, por lo que decidimos dejarlo asi.
  constructor(ini, fin, grosor) {
    this.ini = ini;;//punto inicial de la linea
    this.fin = fin;//punto final de la linea
    this.grosor = grosor;//guarda el grosor
  }

  draw(lineAlpha, vOffset, hOffset) {
    let [x1, y1] = this.ini;
    let [x2, y2] = this.fin;
    let dx = abs(x1 - x2);
    let dy = abs(y1 - y2);
    if (dx < dy) { y1 += vOffset; y2 += vOffset; }
    else if (dy < dx) { x1 += hOffset; x2 += hOffset; }
    let len = dist(x1, y1, x2, y2);//longitud de la linea
    let ang = atan2(y2 - y1, x2 - x1);//angulo de la linea
    push();
    translate(x1, y1);
    rotate(ang);
    fill(0, 0, 0, lineAlpha);
    noStroke();
    rect(0, -this.grosor / 2, len, this.grosor);
    pop();
  }
}
//en caso de querer implementar la otra version, se debe reemplazar toda la class de linesegment con la dicha.

class BrushStroke {//crea una pincelada con posición, tamaño, rotación y color y máscara aleatorios
  constructor(palette, maskImgs) {
    this.palette = palette;
    this.bx = random(width);
    this.by = random(height);
    this.bw = random(48, 130);
    this.bh = random(10, 46);
    this.ang = random(TWO_PI);
    this.baseColor = palette.randomColor(); // Guarda color base
    this.mi = int(random(maskImgs.length));
    this.maskImgs = maskImgs;
  }

  esCalido(hsv) {//verifica que el color sea calido o no
    let h = hsv[0];
    return (h < 70 || (h > 330 && h <= 360));
  }

  draw(illumCalido, illumFrio) {//implementa el brillo dependiendo si el color es calido o frio sobre lo previamente creado
    
    let brillo = this.esCalido(this.baseColor) ? illumCalido : illumFrio;
    let c = this.palette.applyIllumination(this.baseColor, brillo);

    let pg = createGraphics(this.bw, this.bh);
    pg.colorMode(HSB, 360, 100, 100, 255);
    pg.clear();
    pg.image(this.maskImgs[this.mi], 0, 0, this.bw, this.bh);
    pg.loadPixels();
    for (let i = 0; i < pg.pixels.length; i += 4) {
      if (pg.pixels[i + 3] > 10) {
        let colorHSB = color(c[0], c[1], c[2], 170);
        let [r, g, b, a] = [red(colorHSB), green(colorHSB), blue(colorHSB), alpha(colorHSB)];
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
