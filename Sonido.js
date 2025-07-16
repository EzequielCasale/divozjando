//variables generales
let mic, fft;
let hOffset = 0;
let vOffset = 0;
let illumCalido = 1.0;
let illumFrio = 1.0;

let graves = 0;
let agudos = 0;

// Normalización adaptativa y robusta para independencia del volumen del SO/mic
let nivelMinAuto = 1;
let nivelMaxAuto = 0;
let normalizacionRapida = 0.01; // puedes ajustar (0.01 = lento, 0.1 = rápido)
let rangoMinimo = 0.06;         // rango mínimo artificial para que la obra nunca se apague
let amplificacion = 4;          // multiplica la señal para compensar posible volumen bajo

const thresholdGraves = 150; // Umbral absoluto para graves (opcional, puedes ajustar o quitar)
const thresholdProp = 0.18; // Umbral de predominancia para graves/agudos (ajusta sensibilidad)

function inicializarSonido() {
  mic = new p5.AudioIn();
  mic.start();//captura audio del microfono
  fft = new p5.FFT(0.8, 1024);//analiza frecuencias en un rango, siendo 1024 el limite del detalle
  fft.setInput(mic);
}

function actualizarDesdeSonido() {
  let spectrum = fft.analyze();
  graves = fft.getEnergy(20, 250);
  agudos = fft.getEnergy(50, 4000);
  let energiaTotal = fft.getEnergy(20, 20000); // Energía total en el rango audible

  // Calcula la proporción de graves/agudos respecto al total (predominancia real)
  let propGraves = energiaTotal > 0 ? graves / energiaTotal : 0;
  let propAgudos = energiaTotal > 0 ? agudos / energiaTotal : 0;

  // Filtra: solo deja pasar grave/agudo si es predominante
  if (propGraves < thresholdProp) graves = 0;
  if (propAgudos < thresholdProp) agudos = 0;

  // (Opcional) además puedes mantener un umbral absoluto para graves
  if (graves < thresholdGraves) graves = 0;

  // Exponer globalmente para el draw
  window.graves = graves;
  window.agudos = agudos;

  let nivel = mic.getLevel(100) * amplificacion;

  // Normalización adaptativa
  nivelMinAuto = lerp(nivelMinAuto, min(nivel, nivelMinAuto), normalizacionRapida);
  nivelMaxAuto = lerp(nivelMaxAuto, max(nivel, nivelMaxAuto), normalizacionRapida);

  // Mantén un rango mínimo SIEMPRE, aunque el volumen del SO sea bajo
  if (nivelMaxAuto - nivelMinAuto < rangoMinimo) {
    nivelMinAuto = nivelMaxAuto - rangoMinimo;
  }

  // Si el rango está demasiado bajo, fuerza un rango artificial para que nunca se apague
  if (nivelMaxAuto < rangoMinimo) {
    nivelMaxAuto = rangoMinimo * 2;
    nivelMinAuto = rangoMinimo;
  }

  hOffset = map(agudos, 0, 255, -150, 150);//desplazamiento horizontal de los agudos
  vOffset = map(graves, 0, 255, 150, -150);//desplazamiento vertical de los graves

  let brilloMin = 1;
  let brilloMax = 100;

  // Cálidos suben con volumen, fríos bajan con volumen
  illumCalido = map(nivel, nivelMinAuto, nivelMaxAuto, brilloMin, brilloMax, true); // sube con volumen
  illumFrio   = map(nivel, nivelMinAuto, nivelMaxAuto, brilloMax, brilloMin, true); // baja con volumen
}
