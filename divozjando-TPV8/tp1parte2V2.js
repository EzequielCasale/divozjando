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

//inicializamos variables y arrays
let palette;
let maskImgs = [];
let rects = [];
let lines = [];
let brushes = [];
let imgPalette;
let texturaCuadrados = [];
let micStarted = false;//para el microfono
let startButton;

// para opacidad de líneas según movimiento dado por nuestra voz
let prevVOffset = 0;
let prevHOffset = 0;

const NUM_BRUSHES = 48;
const NUM_MASKS = 10;
const MIN_RECT_SIZE = 70;
const MAX_RECT_SIZE = 220;

function preload() {
  //imgPalette = loadImage('imagenes/Obra.png'); // decidimos cambiarlo por problemas en su uso
  //no nos funciono lo de extraer colores
  for (let i = 1; i <= NUM_MASKS; i++) {
    maskImgs.push(loadImage('imagenes/mascara' + i + '.png'));
  }
  texturaCuadrados[0] = loadImage('imagenes/mascuadrado1.png');
  texturaCuadrados[1] = loadImage('imagenes/mascuadrado2.png');
  texturaCuadrados[2] = loadImage('imagenes/mascuadrado3.png');
  texturaLinea = loadImage('imagenes/mascara8L.png'); //cargamos las texturas visuales necesarias, principalmente de pinceles
}

function setup() {
  createCanvas(600, 600);
  colorMode(HSB, 360, 100, 100, 255);
  palette = new ColorPalette();
  inicializarEscena();//para poder hacer click y activar el microfono. Leimos en una parte que era necesario hacerlo para que se active el microfono correctamente

  startButton = createButton("Hacé click aquí para activar el micrófono y comenzar");
  startButton.position(width / 2 - 120, height / 2 - 20);
  startButton.mousePressed(iniciarMicrofono);
}

function iniciarMicrofono() {
  userStartAudio().then(() => {
    inicializarSonido();
    micStarted = true;
    startButton.hide();
  });
}

function draw() {
  background(50, 25, 98); // de color amarillo pálido

  if (!micStarted) {
    textAlign(CENTER, CENTER);
    textSize(24);
    fill(0);
    text("Esperando activación del micrófono...", width / 2, height / 2 + 40);
    return;
  }

  actualizarDesdeSonido();

  // Variaciones de la opacidad de las lineas dependiendo del movimiento de estas
  let movimiento = abs(vOffset - prevVOffset) + abs(hOffset - prevHOffset);
  let lineAlpha = map(movimiento, 0, 10, 60, 255, true);
  prevVOffset = vOffset;
  prevHOffset = hOffset;
  

  for (let r of rects) r.draw(illumCalido, illumFrio);
  for (let l of lines) l.draw(lineAlpha, vOffset, hOffset);
  for (let b of brushes) b.draw(illumCalido, illumFrio); //afectan a la luminosidad de los colores
}

function inicializarEscena() {//aca el lienzo se divide de forma aleatoria en tamaños menores al rectsize y se guardan en arrays rects
  rects = [];
  lines = [];
  brushes = [];
  subdividirRect(0, 0, width, height);
  generarLineas();
  for (let i = 0; i < NUM_BRUSHES; i++) {
    brushes.push(new BrushStroke(palette, maskImgs));
  }
}

function subdividirRect(x, y, w, h) {
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
  rects.push(new HRect(x, y, w, h, palette));
}

function generarLineas() { //genera las lineas negras.Aca podemos ajustar grosor de estas
  lines = [];
  for (let r of rects) {
    let lados = [
      [[r.x, r.y], [r.x + r.w, r.y]],
      [[r.x + r.w, r.y], [r.x + r.w, r.y + r.h]],
      [[r.x + r.w, r.y + r.h], [r.x, r.y + r.h]],
      [[r.x, r.y + r.h], [r.x, r.y]],
    ];
    for (let s of lados) {
      if (random() < 0.86) {
        let grosor = random(2, 7);
        let partes = int(random(2, 6));
        for (let i = 0; i < partes; i++) {
          let t0 = i / partes + random(-0.07, 0.07);
          let t1 = (i + 0.7) / partes + random(-0.07, 0.07);
          let ini = [
            lerp(s[0][0], s[1][0], t0),
            lerp(s[0][1], s[1][1], t0)
          ];
          let fin = [
            lerp(s[0][0], s[1][0], t1),
            lerp(s[0][1], s[1][1], t1)
          ];
          lines.push(new LineSegment(ini, fin, grosor));
        }
      }
    }
  }
}
