/* P&P — análisis de audio con ReccoBeats (paso 2)
 *
 * Por qué: el modelo se entrenó con las características de Spotify (energía, valencia,
 * acústica, etc.). Spotify cerró esa API en 2024. ReccoBeats es una API gratuita que
 * devuelve esas mismas características, en la misma escala, a partir de un archivo de audio.
 *
 * Límite de ReccoBeats: analiza solo los primeros 30 s de lo que recibe (y hasta 5 MB).
 * Probamos que un solo tramo es una lotería (la valencia de una misma canción va de 0,17
 * a 0,43 según el tramo), así que:
 *   1. cortamos el tema en tramos de 30 s (desde el segundo 10, hasta 5 s antes del final)
 *   2. mandamos cada tramo como MP3 estéreo de 44,1 kHz a 192 kbps (≈720 KB). Probado:
 *      ReccoBeats rechaza WAV y MP3 mono (error 4002) aunque su documentación diga lo
 *      contrario. El MP3 se arma en el navegador con lamejs, en dos Web Workers en
 *      paralelo para que la página no se congele (cada tramo tarda ~2,5 s en codificarse).
 *   3. promediamos los resultados
 *   4. aplicamos la calibración medida contra Spotify (ver CALIBRACION)
 *
 * Calibración: 10 canciones del corpus (Adele, Billie Eilish, Bon Iver, Chlöe, Drake ×2,
 * Meghan Trainor, P!nk, Rihanna, The Chainsmokers), 64 tramos, comparadas contra sus
 * valores de Spotify. Cada corrección se eligió por validación dejando una canción afuera.
 *   - energía        +0,081                 (correlación 0,93)
 *   - bailabilidad   +0,058                 (correlación 0,97)
 *   - valencia       sin corrección          (correlación 0,91)
 *   - acústica       1,13·x − 0,13          (correlación 0,89; sin P!nk, dato roto en el corpus)
 *   - habla          2,21·x − 0,09          (ReccoBeats comprime el rap)
 *   - volumen        0,68·x − 0,82 dB
 *   - tempo de ReccoBeats NO se usa: falla (correlación −0,36). Lo mide Essentia.
 * Con 10 canciones es una calibración de prototipo: la dirección es firme, los números finos no.
 *
 * CORS: verificado, ReccoBeats acepta llamadas desde el navegador (también desde file://).
 */
(() => {
  'use strict';

  const URL_API = 'https://api.reccobeats.com/v1/analysis/audio-features';
  const LAME = 'https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js';
  const SR = 44100, KBPS = 192, WORKERS = 2;
  const TRAMO_S = 30, INICIO_S = 10, MARGEN_FINAL_S = 5, MAX_TRAMOS = 10;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const CALIBRACION = {
    energy:           x => clamp(x + 0.081, 0, 1),
    danceability:     x => clamp(x + 0.058, 0, 1),
    valence:          x => clamp(x, 0, 1),
    acousticness:     x => clamp(1.13 * x - 0.13, 0, 1),
    speechiness:      x => clamp(2.21 * x - 0.09, 0, 1),
    loudness:         x => clamp(0.68 * x - 0.82, -30, -1),
    instrumentalness: x => clamp(x, 0, 1),
  };
  const RASGOS = Object.keys(CALIBRACION);

  // Remuestrea a 44,1 kHz estéreo con el motor de audio del navegador
  async function aEstereo44(audio) {
    const Off = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const ctx = new Off(2, Math.max(1, Math.ceil(audio.duration * SR)), SR);
    const src = ctx.createBufferSource();
    src.buffer = audio;
    src.connect(ctx.destination);   // un tema mono se copia a los dos canales
    src.start();
    const b = await ctx.startRendering();
    return [b.getChannelData(0), b.getChannelData(1)];
  }

  // Worker que convierte dos canales Float32 en un MP3 (lamejs)
  const CODIGO_WORKER = `
    importScripts('${LAME}');
    const a16 = f => { const o = new Int16Array(f.length); for (let i = 0; i < f.length; i++) { const v = Math.max(-1, Math.min(1, f[i])); o[i] = v < 0 ? v * 0x8000 : v * 0x7fff; } return o; };
    self.onmessage = ({ data: { id, izq, der } }) => {
      try {
        const L = a16(izq), R = a16(der), enc = new lamejs.Mp3Encoder(2, ${SR}, ${KBPS}), partes = [];
        for (let i = 0; i < L.length; i += 1152) { const b = enc.encodeBuffer(L.subarray(i, i + 1152), R.subarray(i, i + 1152)); if (b.length) partes.push(b); }
        partes.push(enc.flush());
        self.postMessage({ id, partes });
      } catch (e) { self.postMessage({ id, error: String(e && e.message || e) }); }
    };`;

  function crearPool() {
    const url = URL.createObjectURL(new Blob([CODIGO_WORKER], { type: 'text/javascript' }));
    const workers = [...Array(WORKERS)].map(() => new Worker(url));
    let n = 0;
    const codificar = (izq, der) => new Promise((ok, mal) => {
      const id = n++, w = workers[id % WORKERS];
      const t = setTimeout(() => { fin(); mal(new Error('lamejs tardó demasiado')); }, 60000);
      const al = ({ data }) => { if (data.id !== id) return; fin(); data.error ? mal(new Error(data.error)) : ok(new Blob(data.partes, { type: 'audio/mpeg' })); };
      const err = ev => { fin(); mal(new Error(ev.message || 'No se pudo cargar lamejs')); };
      function fin() { clearTimeout(t); w.removeEventListener('message', al); w.removeEventListener('error', err); }
      w.addEventListener('message', al);
      w.addEventListener('error', err);
      w.postMessage({ id, izq, der }, [izq.buffer, der.buffer]);
    });
    return { codificar, cerrar: () => { workers.forEach(w => w.terminate()); URL.revokeObjectURL(url); } };
  }

  // Dónde arranca cada tramo (en segundos)
  function cortes(dur) {
    const c = [];
    for (let t = INICIO_S; t + TRAMO_S <= dur - MARGEN_FINAL_S; t += TRAMO_S) c.push(t);
    if (!c.length) c.push(Math.max(0, (dur - TRAMO_S) / 2));       // tema corto: un tramo del centro
    if (c.length > MAX_TRAMOS) {                                   // tema largo: repartidos parejo
      const paso = (c.length - 1) / (MAX_TRAMOS - 1);
      return [...Array(MAX_TRAMOS)].map((_, i) => c[Math.round(i * paso)]);
    }
    return c;
  }

  const esperar = ms => new Promise(r => setTimeout(r, ms));

  async function consultar(blob, intento = 0) {
    const fd = new FormData();
    fd.append('audioFile', blob, 'tramo.mp3');
    const r = await fetch(URL_API, { method: 'POST', body: fd });
    if (r.status === 429 && intento < 3) {
      await esperar((+r.headers.get('Retry-After') || 2) * 1000);
      return consultar(blob, intento + 1);
    }
    if (!r.ok) throw new Error(`ReccoBeats respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    if (!Number.isFinite(j.energy)) throw new Error('ReccoBeats devolvió una respuesta sin características');
    return j;
  }

  // audio: AudioBuffer ya decodificado. alAvanzar(hechos, total) es opcional.
  async function analizar(audio, alAvanzar = () => {}) {
    const t0 = performance.now();
    const [izq, der] = await aEstereo44(audio);
    const inicios = cortes(audio.duration);
    const pool = crearPool();
    let hechos = 0;
    try {
      // Cada tramo: codificar (worker) y consultar. Los dos workers trabajan en paralelo.
      const resultados = await Promise.allSettled(inicios.map(async s => {
        const a = Math.floor(s * SR), b = Math.min(izq.length, a + TRAMO_S * SR);
        const mp3 = await pool.codificar(izq.slice(a, b), der.slice(a, b));
        const r = await consultar(mp3);
        alAvanzar(++hechos, inicios.length);
        return r;
      }));
      const tramos = resultados.filter(r => r.status === 'fulfilled').map(r => r.value);
      resultados.filter(r => r.status === 'rejected').forEach(r => console.warn('[P&P] tramo de ReccoBeats perdido:', r.reason));
      if (!tramos.length) throw resultados[0].reason;
      const crudo = Object.fromEntries(RASGOS.map(k => [k, tramos.reduce((s, t) => s + t[k], 0) / tramos.length]));
      const calibrado = Object.fromEntries(RASGOS.map(k => [k, CALIBRACION[k](crudo[k])]));
      return { crudo, calibrado, tramos: tramos.length, ms: Math.round(performance.now() - t0) };
    } finally {
      pool.cerrar();
    }
  }

  window.AnalisisReccoBeats = { analizar, RASGOS };
})();
