let mic, fft;
let hOffset = 0;
let vOffset = 0;
let illumCalido = 1.0;
let illumFrio = 1.0;
// let lineAlpha = 255; // ELIMINADO
let maxNivelVisto = 0;

function inicializarSonido() {
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0.8, 1024);
  fft.setInput(mic);
}

function actualizarDesdeSonido() {
  let spectrum = fft.analyze();
  let graves = fft.getEnergy(20, 250);
  let agudos = fft.getEnergy(1000, 4000);
  let nivel = mic.getLevel(100);

  if (nivel > maxNivelVisto) maxNivelVisto = nivel;

  hOffset = map(agudos, 0, 255, -150, 150);
  vOffset = map(graves, 0, 255, 150, -150);

  // AJUSTA estos valores según lo que veas en consola
  let brilloMin = 1;
  let brilloMax = 50.0;
  let nivelMin = 0.05; // Cambia este valor si tu mic tiene un piso mayor en silencio
  let nivelMax = 0.22;

  illumCalido = map(nivel, nivelMin, nivelMax, brilloMin, brilloMax, true);
  illumFrio   = map(nivel, nivelMin, nivelMax, brilloMax, brilloMin, true);

  // QUITADO: cálculo de lineAlpha por energía
  // let total = fft.getEnergy(100, 10000);
  // lineAlpha = map(total, 0, 255, 40, 255, true);

  // Log de depuración:
  console.clear();
  console.log("--------- SONIDO / VOLUMEN ---------");
  console.log("Nivel mic:", nivel.toFixed(4), " | Máx:", maxNivelVisto.toFixed(4));
  console.log("illumCalido (cálidos):", illumCalido.toFixed(2), " | illumFrio (fríos):", illumFrio.toFixed(2));
  console.log("-------------------------------------");
}
