let mic, fft;
let hOffset = 0;
let vOffset = 0;
let illumCalido = 1.0;
let illumFrio = 1.0;

let graves = 0;
let agudos = 0;

let nivelMinAuto = 1;
let nivelMaxAuto = 0;
let normalizacionRapida = 0.01; 
let rangoMinimo = 0.06;         // siempre un volumen bajo min, para que no es apague
let amplificacion = 4;          // multiplica los bajos

const thresholdGraves = 150; // umbral graves
const thresholdProp = 0.18; // sensibilidad agudos-graves

function inicializarSonido() {
  mic = new p5.AudioIn();
  mic.start();// Captura audio
  fft = new p5.FFT(0.8, 1024);// Analiza la frecuencia
  fft.setInput(mic);
}

function actualizarDesdeSonido() {
  let spectrum = fft.analyze();
  graves = fft.getEnergy(20, 250);
  agudos = fft.getEnergy(50, 4000);
  let energiaTotal = fft.getEnergy(20, 20000);

  // Calcula los graves/agudos
  let propGraves = energiaTotal > 0 ? graves / energiaTotal : 0;
  let propAgudos = energiaTotal > 0 ? agudos / energiaTotal : 0;

  // filtra los grave/agudo
  if (propGraves < thresholdProp) graves = 0;
  if (propAgudos < thresholdProp) agudos = 0;

  if (graves < thresholdGraves) graves = 0;

  window.graves = graves;
  window.agudos = agudos;

  let nivel = mic.getLevel(100) * amplificacion;

  // Normalización adaptativa
  nivelMinAuto = lerp(nivelMinAuto, min(nivel, nivelMinAuto), normalizacionRapida);
  nivelMaxAuto = lerp(nivelMaxAuto, max(nivel, nivelMaxAuto), normalizacionRapida);

  // Rango min siempre
  if (nivelMaxAuto - nivelMinAuto < rangoMinimo) {
    nivelMinAuto = nivelMaxAuto - rangoMinimo;
  }

  // Si es bajo no se apaga
  if (nivelMaxAuto < rangoMinimo) {
    nivelMaxAuto = rangoMinimo * 2;
    nivelMinAuto = rangoMinimo;
  }

  hOffset = map(agudos, 0, 255, -150, 150);//Movimiento horiz-agudos
  vOffset = map(graves, 0, 22255, 150, -150);//Movimiento vert-graves

  let brilloMin = 1;
  let brilloMax = 100;

  // calidos los sube-frios los baja
  illumCalido = map(nivel, nivelMinAuto, nivelMaxAuto, brilloMin, brilloMax, true); // sube
  illumFrio   = map(nivel, nivelMinAuto, nivelMaxAuto, brilloMax, brilloMin, true); // baja
}
