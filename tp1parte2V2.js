/*TP1 Computación Gráfica Aplicada y Sistemas Generativos
comisión Lisandro
Ezequiel Andrés Casale 118989/5
Valentín Marchesi
94702/9
Camila Pedro
93538/1
Manuel Zuccato
121285/2
Nico Sutti
21387/3
Uriel ian Villordo
120384/0
*/

// Variables y arrays globales
let palette;
let maskImgs = [];
let maskBuffers = [];
let manchasCalidasImgs = [];
let manchasFriasImgs = [];
let rects = [];
let lines = [];
let brushes = [];
let imgPalette;
let texturaCuadrados = [];
let micStarted = false;
let startButton;

let prevVOffset = 0;
let prevHOffset = 0;

const NUM_BRUSHES = 48;
const NUM_MASKS = 3; // SOLO 3 texturas de línea
const NUM_MANCHAS_CALIDAS = 3;
const NUM_MANCHAS_FRIAS = 3;
const MIN_RECT_SIZE = 80;  // Tamaño mínimo
const MAX_RECT_SIZE = 180; // Tamaño máximo

// Buffers para manchas, para optimizar createGraphics
let buffersManchasCalidas = [];
let buffersManchasFrias = [];

// Para pinceles: buffers precalculados en setup
let brushBuffers = [];

function preload() {
  for (let i = 1; i <= NUM_MANCHAS_CALIDAS; i++) {
    manchasCalidasImgs.push(loadImage('imagenes/manchaca' + i + '.png'));
  }
  for (let i = 1; i <= NUM_MANCHAS_FRIAS; i++) {
    manchasFriasImgs.push(loadImage('imagenes/manchafr' + i + '.png'));
  }
  // SOLO 3 texturas de línea
  for (let i = 1; i <= NUM_MASKS; i++) {
    maskImgs.push(loadImage('imagenes/mascara' + i + '.png'));
  }
  texturaCuadrados[0] = loadImage('imagenes/mascuadrado1.png');
  texturaCuadrados[1] = loadImage('imagenes/mascuadrado2.png');
  texturaCuadrados[2] = loadImage('imagenes/mascuadrado3.png');
  texturaLinea = loadImage('imagenes/mascara8L.png');
}

function setup() {
  createCanvas(600, 600);
  colorMode(HSB, 360, 100, 100, 255);
  palette = new ColorPalette();

  // Precalcula buffers para manchas calidas/frías
  buffersManchasCalidas = manchasCalidasImgs.map(img => precalcularBuffer(img));
  buffersManchasFrias = manchasFriasImgs.map(img => precalcularBuffer(img));

  // Precalcula buffers de las 3 máscaras para líneas
  maskBuffers = [];
  for (let i = 0; i < maskImgs.length; i++) {
    maskBuffers.push(createMaskBuffer(maskImgs[i]));
  }

  // Precalcula buffers para los pinceles
  brushBuffers = [];
  for (let i = 0; i < NUM_BRUSHES; i++) {
    let bw = random(48, 130);
    let bh = random(10, 46);
    let mi = int(random(maskImgs.length));
    let maskBuffer = createGraphics(bw, bh);
    maskBuffer.clear();
    maskBuffer.image(maskImgs[mi], 0, 0, bw, bh);
    brushBuffers.push({
      maskBuffer: maskBuffer,
      bw: bw,
      bh: bh,
      mi: mi
    });
  }

  inicializarEscena();

  startButton = createButton("Hacé click aquí para activar el micrófono y comenzar");
  startButton.position(width / 2 - 120, height / 2 - 20);
  startButton.mousePressed(iniciarMicrofono);
}

function precalcularBuffer(img) {
  let escala = 1.25;
  let bufferW = img.width * escala;
  let bufferH = img.height * escala;
  let pg = createGraphics(bufferW, bufferH);
  pg.clear();
  pg.imageMode(CENTER);
  pg.push();
  pg.translate(bufferW / 2, bufferH / 2);
  pg.image(img, 0, 0, bufferW, bufferH);
  pg.pop();
  return pg;
}

function createMaskBuffer(maskImg) {
  // Buffer base de 100x10, se escala en draw
  let pg = createGraphics(100, 10);
  pg.clear();
  pg.imageMode(CORNER);
  pg.image(maskImg, 0, 0, 100, 10);
  return pg;
}

function iniciarMicrofono() {
  userStartAudio().then(() => {
    inicializarSonido();
    micStarted = true;
    startButton.hide();
  });
}

function draw() {
  background(0);

  if (!micStarted) {
    textAlign(CENTER, CENTER);
    textSize(24);
    fill(255);
    text("Esperando activación del micrófono...", width / 2, height / 2 + 40);
    return;
  }

  actualizarDesdeSonido();

  let movimiento = abs(vOffset - prevVOffset) + abs(hOffset - prevHOffset);
  let lineAlpha = map(movimiento, 0, 10, 60, 255, true);
  prevVOffset = vOffset;
  prevHOffset = hOffset;

  for (let r of rects) r.draw();
  for (let l of lines) {
    l.update(window.graves, window.agudos);
    l.draw(lineAlpha);
  }
  for (let b of brushes) b.draw(illumCalido, illumFrio);
}

function inicializarEscena() {
  rects = [];
  lines = [];
  brushes = [];
  subdividirRect(0, 0, width, height);
  generarLineas();
  for (let i = 0; i < NUM_BRUSHES; i++) {
    brushes.push(new BrushStrokeOptimized(palette, brushBuffers[i]));
  }
}

function subdividirRect(x, y, w, h) {
  // Usamos un PADDING negativo para superposición
  const PADDING = -14; // Valor negativo, mayor superposición cuanto más negativo
  if (w > MAX_RECT_SIZE) {
    let nx = random(MIN_RECT_SIZE, w - MIN_RECT_SIZE);
    subdividirRect(x, y, nx, h);
    subdividirRect(x + nx, y, w - nx, h);
    return;
  }
  if (h > MAX_RECT_SIZE) {
    let ny = random(MIN_RECT_SIZE, h - MIN_RECT_SIZE);
    subdividirRect(x, y, w, ny);
    subdividirRect(x, y + ny, w, h - ny);
    return;
  }
  let tipo = random() < 0.5 ? 'calida' : 'fria';
  rects.push(new ManchaRectOptimized(
    x + PADDING,
    y + PADDING,
    w - 2 * PADDING,
    h - 2 * PADDING,
    tipo
  ));
}

function generarLineas() {
  lines = [];
  for (let r of rects) {
    let lados = [
      [[r.x, r.y], [r.x + r.w, r.y]],             // arriba (horizontal)
      [[r.x + r.w, r.y], [r.x + r.w, r.y + r.h]], // derecha (vertical)
      [[r.x + r.w, r.y + r.h], [r.x, r.y + r.h]], // abajo (horizontal)
      [[r.x, r.y + r.h], [r.x, r.y]],             // izquierda (vertical)
    ];
    for (let i = 0; i < lados.length; i++) {
      if (random() < 0.86) {
        let grosor = random(2, 7);
        let partes = int(random(2, 6));
        let orientation = (i % 2 === 0) ? 'horizontal' : 'vertical';
        let s = lados[i];
        for (let j = 0; j < partes; j++) {
          let t0 = j / partes + random(-0.07, 0.07);
          let t1 = (j + 0.7) / partes + random(-0.07, 0.07);
          let ini = [
            lerp(s[0][0], s[1][0], t0),
            lerp(s[0][1], s[1][1], t0)
          ];
          let fin = [
            lerp(s[0][0], s[1][0], t1),
            lerp(s[0][1], s[1][1], t1)
          ];
          // Cada línea negra usa SOLO UNA DE LAS 3 MÁSCARAS
          lines.push(new MovingLineSegment(ini, fin, grosor, orientation));
        }
      }
    }
  }
}

// CLASE OPTIMIZADA PARA MANCHAS PNG usando buffers precalculados
class ManchaRectOptimized {
  constructor(x, y, w, h, tipo) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.tipo = tipo;
    if (tipo === 'calida') {
      this.imgIdx = int(random(buffersManchasCalidas.length));
      this.pgBase = buffersManchasCalidas[this.imgIdx];
    } else {
      this.imgIdx = int(random(buffersManchasFrias.length));
      this.pgBase = buffersManchasFrias[this.imgIdx];
    }
    const posiblesRotaciones = [0, HALF_PI, PI, PI + HALF_PI];
    this.rot = random(posiblesRotaciones);
    this.escala = this.calcularEscala();
  }

  calcularEscala() {
    let escalaW = this.w / this.pgBase.width;
    let escalaH = this.h / this.pgBase.height;
    return max(escalaW, escalaH);
  }

  draw() {
    push();
    translate(this.x + this.w / 2, this.y + this.h / 2);
    rotate(this.rot);
    scale(this.escala);
    let opacidad;
    if (this.tipo === 'calida') {
      opacidad = map(illumCalido, 1, 100, 120, 255, true);
    } else {
      opacidad = map(illumFrio, 1, 100, 120, 255, true);
    }
    tint(255, opacidad);
    imageMode(CENTER);
    image(this.pgBase, 0, 0);
    pop();
  }
}

// PINCELES: buffer base creado en setup, solo recolorea si cambia el brillo
class BrushStrokeOptimized {
  constructor(palette, bufferObj) {
    this.palette = palette;
    this.bx = random(width);
    this.by = random(height);
    this.bw = bufferObj.bw;
    this.bh = bufferObj.bh;
    this.ang = random(TWO_PI);
    this.baseColor = palette.randomColor();
    this.maskBuffer = bufferObj.maskBuffer;
    // Buffer de color para recolorear solo si cambia el brillo
    this.coloredBuffer = createGraphics(this.bw, this.bh);
    this.lastColorData = null;
  }

  esCalido(hsv) {
    let h = hsv[0];
    return (h < 70 || (h > 330 && h <= 360));
  }

  draw(illumCalido, illumFrio) {
    let brillo = this.esCalido(this.baseColor) ? illumCalido : illumFrio;
    let c = this.palette.applyIllumination(this.baseColor, brillo);

    let colorKey = `${c[0].toFixed(3)}_${c[1].toFixed(3)}_${c[2].toFixed(3)}`;
    if (this.lastColorData !== colorKey) {
      this.coloredBuffer.clear();
      this.coloredBuffer.image(this.maskBuffer, 0, 0);
      this.coloredBuffer.loadPixels();
      this.maskBuffer.loadPixels();
      let colorHSB = color(c[0], c[1], c[2], 170);
      let [r, g, b, a] = [red(colorHSB), green(colorHSB), blue(colorHSB), alpha(colorHSB)];
      for (let i = 0; i < this.coloredBuffer.pixels.length; i += 4) {
        if (this.maskBuffer.pixels[i + 3] > 10) {
          this.coloredBuffer.pixels[i + 0] = r;
          this.coloredBuffer.pixels[i + 1] = g;
          this.coloredBuffer.pixels[i + 2] = b;
          this.coloredBuffer.pixels[i + 3] = a;
        }
      }
      this.coloredBuffer.updatePixels();
      this.lastColorData = colorKey;
    }

    push();
    translate(this.bx, this.by);
    rotate(this.ang);
    image(this.coloredBuffer, 0, 0);
    pop();
  }
}

// LINEAS NEGRAS CON MÁSCARA PNG usando buffer precalculado
class MovingLineSegment {
  constructor(ini, fin, grosor, orientation) {
    this.iniOrig = ini.slice();
    this.finOrig = fin.slice();
    this.ini = ini.slice();
    this.fin = fin.slice();
    this.grosor = grosor;
    this.orientation = orientation;
    this.vel = 0;
    this.targetVel = 0;
    this.maxVel = 8;
    // SOLO 3 texturas posibles
    this.maskBuffer = maskBuffers[int(random(3))];
  }

  update(graves, agudos) {
    let gravesUsados = graves;
    let agudosUsados = agudos;
    let thresholdGraves = 18;
    let thresholdAgudos = 18;
    if (gravesUsados < thresholdGraves) gravesUsados = 0;
    if (agudosUsados < thresholdAgudos) agudosUsados = 0;

    if (this.orientation === "horizontal") {
      this.targetVel = map(agudosUsados, 0, 255, 0, this.maxVel, true);
    } else {
      this.targetVel = -map(gravesUsados, 0, 255, 0, this.maxVel, true);
    }
    let desaceleracion = 0.12;
    this.vel = lerp(this.vel, this.targetVel, desaceleracion);

    if (abs(this.targetVel) < 0.1) this.vel *= 0.92;

    if (this.orientation === "horizontal") {
      this.ini[0] += this.vel;
      this.fin[0] += this.vel;
      if (this.ini[0] > width && this.fin[0] > width) {
        this.ini[0] -= width;
        this.fin[0] -= width;
      }
      if (this.ini[0] < 0 && this.fin[0] < 0) {
        this.ini[0] += width;
        this.fin[0] += width;
      }
    } else {
      this.ini[1] += this.vel;
      this.fin[1] += this.vel;
      if (this.ini[1] < 0 && this.fin[1] < 0) {
        this.ini[1] += height;
        this.fin[1] += height;
      }
      if (this.ini[1] > height && this.fin[1] > height) {
        this.ini[1] -= height;
        this.fin[1] -= height;
      }
    }
  }

  draw(lineAlpha) {
    let [x1, y1] = this.ini;
    let [x2, y2] = this.fin;
    let len = dist(x1, y1, x2, y2);
    let ang = atan2(y2 - y1, x2 - x1);

    push();
    translate(x1, y1);
    rotate(ang);
    tint(0, 0, 0, lineAlpha);
    imageMode(CORNER);
    image(this.maskBuffer, 0, -this.grosor / 2, len, this.grosor);
    pop();
  }
}
