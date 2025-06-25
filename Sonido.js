// Sonido.js

let mic, fft;
let hOffset = 0;
let vOffset = 0;
let illumCalido = 1.0;
let illumFrio = 1.0;
let lineAlpha = 255;

function inicializarSonido() {
  mic = new p5.AudioIn(); // Inicialización correcta con p5.sound.min.js local
  mic.start();
  fft = new p5.FFT(0.8, 1024);
  fft.setInput(mic);
}

function actualizarDesdeSonido() {
  let spectrum = fft.analyze();
  let graves = fft.getEnergy(20, 250);
  let agudos = fft.getEnergy(4000, 10000);
  let nivel = mic.getLevel();

  hOffset = map(agudos, 0, 255, -150, 150);
  vOffset = map(graves, 0, 255, 150, -150);

  let brilloMax = map(nivel, 0, 0.2, 1.0, 2.0, true);
  let brilloMin = map(nivel, 0, 0.2, 1.0, 0.5, true);

  if (nivel > 0.06) {
    illumCalido = brilloMax;
    illumFrio = brilloMin;
  } else {
    illumCalido = brilloMin;
    illumFrio = brilloMax;
  }

  let total = fft.getEnergy(100, 10000);
  lineAlpha = map(total, 0, 255, 40, 255, true);
}
