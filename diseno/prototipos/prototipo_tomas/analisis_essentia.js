/* P&P — análisis de audio con Essentia.js (paso 1)
 *
 * Essentia es la librería de análisis musical del Music Technology Group (UPF).
 * Essentia.js es su versión para el navegador: corre en WebAssembly, sin servidor.
 *
 * Qué mide en este paso:
 *   - tempo        RhythmExtractor2013 (método "degara") sobre 90 s del centro del tema
 *   - modo         KeyExtractor: tonalidad + mayor/menor, sobre el tema entero
 *   - volumen      LoudnessEBUR128: volumen integrado en LUFS, sobre el tema entero
 *   - bailabilidad Danceability (análisis de fluctuaciones), sobre los mismos 90 s
 *
 * Cómo funciona:
 *   - Corre en un Web Worker (en segundo plano) para que la página no se congele.
 *   - El worker se arma desde un Blob y baja Essentia del CDN de jsDelivr, así la app
 *     se sigue abriendo con doble click (file://), sin servidor.
 *   - Necesita internet la primera vez (2,6 MB). Si no puede cargar, app.js vuelve a la
 *     medición básica del navegador.
 *
 * Velocidad: un tema de 4 minutos tarda ~4 s. Para eso el volumen y la tonalidad se
 * calculan a 11.025 Hz (cambia el resultado en menos de 0,2 dB y no cambia la
 * tonalidad) y el tempo sobre 90 s.
 *
 * Licencia: Essentia.js es AGPL-3.0. Uso académico sin problema; para uso comercial
 * hay que pedirle licencia al MTG.
 */
(() => {
  'use strict';

  const CDN = 'https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/';
  const SR = 44100;          // RhythmExtractor2013 y Danceability trabajan a 44,1 kHz
  const SR_CHICO = 11025;    // volumen y tonalidad
  const EXTRACTO_S = 90;

  // Código del worker. Va como texto para poder crearlo desde un Blob.
  const CODIGO = `
    self.exports = {};
    self.Module = {};
    const listo = new Promise((ok, mal) => {
      self.Module.onRuntimeInitialized = ok;
      self.Module.onAbort = mal;
    });
    let essentia = null, errorCarga = null;
    try {
      importScripts('${CDN}essentia-wasm.umd.js', '${CDN}essentia.js-core.umd.min.js');
    } catch (e) { errorCarga = e; }

    async function iniciar() {
      if (errorCarga) throw errorCarga;
      if (!self.Module.calledRun) await listo;
      if (!essentia) essentia = new Essentia(self.exports.EssentiaWASM || self.Module);
      return essentia;
    }

    function enVector(e, arr, fn) {
      const v = e.arrayToVector(arr);
      try { return fn(v); } finally { v.delete && v.delete(); }
    }

    self.onmessage = async ({ data }) => {
      if (data.tipo === 'preparar') {
        try { await iniciar(); self.postMessage({ tipo: 'listo', version: essentia.version }); }
        catch (err) { self.postMessage({ tipo: 'error', mensaje: String(err && err.message || err) }); }
        return;
      }
      const t0 = performance.now();
      try {
        const e = await iniciar();
        const { mono44, izq11, der11, mono11 } = data;

        // 90 s del centro (o el tema entero si es más corto)
        const largo = Math.min(mono44.length, ${EXTRACTO_S} * ${SR});
        const ini = Math.max(0, Math.floor((mono44.length - largo) / 2));
        const extracto = mono44.subarray(ini, ini + largo);

        const ritmo = enVector(e, extracto, v => e.RhythmExtractor2013(v, 208, 'degara', 40));
        const baile = enVector(e, extracto, v => e.Danceability(v, 8800, 310, ${SR}));

        const vi = e.arrayToVector(izq11), vd = e.arrayToVector(der11);
        let volumen;
        try { volumen = e.LoudnessEBUR128(vi, vd, 0.1, ${SR_CHICO}, false); }
        finally { vi.delete && vi.delete(); vd.delete && vd.delete(); }

        const tono = enVector(e, mono11, v =>
          e.KeyExtractor(v, true, 4096, 4096, 12, 3500, 60, 25, 0.2, 'bgate', ${SR_CHICO}, 0.0001, 440, 'cosine', 'hann'));

        self.postMessage({
          tipo: 'resultado',
          bpm: ritmo.bpm,
          danceabilityDFA: baile.danceability,
          lufs: volumen.integratedLoudness,
          rangoLoudness: volumen.loudnessRange,
          tonica: tono.key,
          escala: tono.scale,
          fuerzaTono: tono.strength,
          extractoSeg: largo / ${SR},
          ms: Math.round(performance.now() - t0),
          version: e.version,
        });
      } catch (err) {
        self.postMessage({ tipo: 'error', mensaje: String(err && err.message || err) });
      }
    };
  `;

  let worker = null, preparacion = null;

  function crearWorker() {
    if (worker) return worker;
    const url = URL.createObjectURL(new Blob([CODIGO], { type: 'text/javascript' }));
    worker = new Worker(url);
    return worker;
  }

  // Espera un mensaje del worker con timeout
  function esperarMensaje(w, ms) {
    return new Promise((ok, mal) => {
      const t = setTimeout(() => { limpiar(); mal(new Error('Essentia tardó demasiado en responder')); }, ms);
      const alMensaje = ({ data }) => {
        if (data.tipo === 'error') { limpiar(); mal(new Error(data.mensaje)); }
        else if (data.tipo === 'listo' || data.tipo === 'resultado') { limpiar(); ok(data); }
      };
      const alError = ev => { limpiar(); mal(new Error(ev.message || 'No se pudo cargar Essentia.js')); };
      function limpiar() { clearTimeout(t); w.removeEventListener('message', alMensaje); w.removeEventListener('error', alError); }
      w.addEventListener('message', alMensaje);
      w.addEventListener('error', alError);
    });
  }

  // Baja e inicia Essentia en segundo plano. Se puede llamar varias veces.
  function preparar() {
    if (preparacion) return preparacion;
    try {
      const w = crearWorker();
      preparacion = esperarMensaje(w, 40000);
      w.postMessage({ tipo: 'preparar' });
      preparacion.catch(() => { descartar(); });
    } catch (err) {
      preparacion = Promise.reject(err);
      preparacion.catch(() => {});
      setTimeout(descartar, 0);
    }
    return preparacion;
  }

  function descartar() { worker?.terminate(); worker = null; preparacion = null; }

  // Re-muestrea con el motor de audio del navegador (filtra bien, es nativo y rápido)
  async function remuestrear(audio, sr, canales) {
    const Off = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const ctx = new Off(canales, Math.max(1, Math.ceil(audio.duration * sr)), sr);
    const src = ctx.createBufferSource();
    src.buffer = audio;
    src.connect(ctx.destination);
    src.start();
    return ctx.startRendering();
  }

  function aMono(buf) {
    if (buf.numberOfChannels === 1) return buf.getChannelData(0).slice();
    const a = buf.getChannelData(0), b = buf.getChannelData(1), m = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) m[i] = (a[i] + b[i]) / 2;
    return m;
  }

  // audio: AudioBuffer ya decodificado. Devuelve los valores crudos de Essentia.
  async function analizar(audio) {
    await preparar();
    const estereo = Math.min(2, audio.numberOfChannels);
    const [b44, b11] = await Promise.all([remuestrear(audio, SR, 1), remuestrear(audio, SR_CHICO, estereo)]);
    const mono44 = b44.getChannelData(0).slice();
    const izq11 = b11.getChannelData(0).slice();
    const der11 = estereo > 1 ? b11.getChannelData(1).slice() : izq11.slice();
    const mono11 = aMono(b11);
    const w = crearWorker();
    const respuesta = esperarMensaje(w, 90000);
    w.postMessage({ tipo: 'analizar', mono44, izq11, der11, mono11 }, [mono44.buffer, izq11.buffer, der11.buffer, mono11.buffer]);
    return respuesta;
  }

  window.AnalisisEssentia = { preparar, analizar, CDN };
})();
