/* =========================================================
   P&P — medir una canción en el navegador
   Tomado tal cual del prototipo de Diogenes: decodifica el
   archivo, saca una medición basica propia, y despues pisa lo
   que puede con Essentia.js (tempo y modo) y con ReccoBeats
   (energia, valencia, acustica, bailabilidad, habla, volumen).
   Nada de esto sale de la maquina del usuario salvo los tramos
   que ReccoBeats necesita para responder.
   ========================================================= */
(function () {
  'use strict';
  const { M, R, clamp } = window.PP;

  /* ----- Medición en el navegador (reemplazo provisorio de librosa) ----- */

  async function medirAudio(file) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const audio = await ctx.decodeAudioData(await file.arrayBuffer());
    ctx.close?.();

    // Mono y submuestreado a ~11 kHz para que sea rápido
    const paso = Math.max(1, Math.floor(audio.sampleRate / 11025));
    const sr = audio.sampleRate / paso;
    const canales = [...Array(audio.numberOfChannels)].map((_, i) => audio.getChannelData(i));
    const n = Math.floor(canales[0].length / paso);
    const x = new Float32Array(n);
    for (let i = 0; i < n; i++) { let s = 0; for (const c of canales) s += c[i * paso]; x[i] = s / canales.length; }

    // Volumen (RMS global en dBFS) y cruces por cero (brillo)
    let sum2 = 0, cruces = 0;
    for (let i = 0; i < n; i++) { sum2 += x[i] * x[i]; if (i && (x[i] >= 0) !== (x[i - 1] >= 0)) cruces++; }
    const rms = Math.sqrt(sum2 / n) || 1e-9;
    const loudness = clamp(20 * Math.log10(rms) + 3, -30, -1);
    const zcr = cruces / n;

    // Envolvente de energía por ventanas de ~46 ms
    const V = 512, env = [];
    for (let i = 0; i + V < n; i += V) { let e = 0; for (let j = i; j < i + V; j++) e += x[j] * x[j]; env.push(Math.sqrt(e / V)); }
    const onset = env.map((v, i) => Math.max(0, v - (env[i - 1] || 0)));
    const media = onset.reduce((a, b) => a + b, 0) / onset.length || 1e-9;
    const fps = sr / V;

    // Tempo por autocorrelación de los ataques, entre 60 y 200 BPM, con preferencia suave por ~120
    let mejor = { bpm: 120, v: -Infinity }, total = 0;
    const o = onset.map(v => v - media);
    for (const v of o) total += v * v;
    for (let lag = Math.round(fps * 60 / 200); lag <= Math.round(fps * 60 / 60); lag++) {
      let c = 0; for (let i = lag; i < o.length; i++) c += o[i] * o[i - lag];
      const bpm = 60 * fps / lag;
      const pref = Math.exp(-0.5 * (Math.log2(bpm / 120) / 0.9) ** 2);
      if (c * pref > mejor.v) mejor = { bpm, v: c * pref, c };
    }
    const claridad = clamp((mejor.c || 0) / (total || 1), 0, 1);
    const densidad = onset.filter(v => v > media * 1.5).length / (env.length / fps);   // ataques por segundo

    const energy = clamp(0.55 * clamp((loudness + 24) / 20, 0, 1) + 0.25 * clamp(densidad / 6, 0, 1) + 0.2 * clamp(zcr / 0.15, 0, 1), 0, 1);
    const acousticness = clamp(1 - (zcr - 0.03) / 0.12, 0, 1) * clamp(1 - (loudness + 12) / 10, 0.1, 1);
    const danceability = clamp(0.35 + 1.4 * claridad, 0, 0.98);

    const rasgos = {}, fuentes = {};
    R.forEach((k, i) => { rasgos[k] = k === 'mode' ? Math.round(M.media[i]) : M.media[i]; fuentes[k] = 'promedio'; });
    Object.assign(rasgos, { duration_ms: audio.duration / 60, loudness, tempo: mejor.bpm, energy, acousticness, danceability });
    ['duration_ms', 'loudness', 'tempo'].forEach(k => { fuentes[k] = 'medido'; });
    ['energy', 'acousticness', 'danceability'].forEach(k => { fuentes[k] = 'estimado'; });

    // Essentia mide tempo y modo (acierta 8 de 10 contra Spotify). ReccoBeats mide energía,
    // valencia, acústica, bailabilidad, habla, volumen e instrumentalidad, en la escala de
    // Spotify y calibrado (ver analisis_reccobeats.js). Corren en paralelo; si alguno falla,
    // esos rasgos se quedan con la medición básica de arriba.
    let essentia = null, reccobeats = null;
    const avisos = [];
    const [rE, rR] = await Promise.allSettled([
      window.AnalisisEssentia ? window.AnalisisEssentia.analizar(audio) : Promise.reject(new Error('falta analisis_essentia.js')),
      window.AnalisisReccoBeats ? window.AnalisisReccoBeats.analizar(audio) : Promise.reject(new Error('falta analisis_reccobeats.js')),
    ]);
    if (rE.status === 'fulfilled') {
      essentia = rE.value;
      if (Number.isFinite(essentia.bpm) && essentia.bpm > 0) { rasgos.tempo = essentia.bpm; fuentes.tempo = 'essentia'; }
      if (essentia.escala === 'major' || essentia.escala === 'minor') { rasgos.mode = essentia.escala === 'major' ? 1 : 0; fuentes.mode = 'essentia'; }
    } else {
      console.warn('[P&P] Essentia no disponible:', rE.reason);
      avisos.push('No se pudo cargar Essentia.js (hace falta internet): el tempo y el modo son una medición básica.');
    }
    if (rR.status === 'fulfilled') {
      reccobeats = rR.value;
      for (const k of window.AnalisisReccoBeats.RASGOS) { rasgos[k] = reccobeats.calibrado[k]; fuentes[k] = 'reccobeats'; }
    } else {
      console.warn('[P&P] ReccoBeats no disponible:', rR.reason);
      avisos.push('No se pudo consultar ReccoBeats: energía, acústica y bailabilidad son estimaciones, y valencia y habla quedan en el promedio del corpus.');
      if (essentia) {   // respaldo: lo que da Essentia, con la conversión provisoria
        if (Number.isFinite(essentia.lufs)) { rasgos.loudness = clamp(essentia.lufs, -30, -1); fuentes.loudness = 'essentia'; }
        if (Number.isFinite(essentia.danceabilityDFA)) { rasgos.danceability = bailabilidadSpotify(essentia.danceabilityDFA); fuentes.danceability = 'essentia'; }
      }
    }
    return { rasgos, fuentes, essentia, reccobeats, aviso: avisos.join(' ') || null };
  }

  /* Conversiones de Essentia a la escala de Spotify (con la que se entrenó el modelo).
     PROVISORIAS hasta la calibración del paso 2, que las va a reemplazar por una
     equivalencia medida sobre canciones del dataset.
     - Bailabilidad: Essentia da ~0,5–2,5 (más alto = más bailable); Spotify va de 0 a 1.
       Lineal alrededor de la media del corpus (0,58) suponiendo un valor típico de 1,15.
     - Volumen: Spotify da dB promedio y Essentia LUFS integrados; se toman iguales por ahora. */
  const bailabilidadSpotify = d => clamp(0.58 + 0.33 * (d - 1.15), 0.05, 0.98);

  const NOTAS = { C: 'Do', 'C#': 'Do♯', Db: 'Re♭', D: 'Re', 'D#': 'Re♯', Eb: 'Mi♭', E: 'Mi', F: 'Fa', 'F#': 'Fa♯', Gb: 'Sol♭',
    G: 'Sol', 'G#': 'Sol♯', Ab: 'La♭', A: 'La', 'A#': 'La♯', Bb: 'Si♭', B: 'Si' };
  const tonalidad = e => `${NOTAS[e.tonica] || e.tonica} ${e.escala === 'major' ? 'mayor' : 'menor'}`;

  window.PP.medirAudio = medirAudio;
  window.PP.tonalidad = tonalidad;
})();
