/* Logica del modelo — extraida tal cual del prototipo de Diogenes.
   Las cuentas no se tocan: los puntajes, los aportes y el conflicto se
   calculan exactamente igual. Solo cambia como se muestran. */
(function () {
  const M = window.MODELO;
  const R = M.rasgos;

  /* ================= Rasgos: nombres, rangos y formato ================= */

  const INFO = {
    energy:           { nombre: 'energía',          min: 0,   max: 1,   paso: 0.01, delta: 0.15 },
    valence:          { nombre: 'valencia',         min: 0,   max: 1,   paso: 0.01, delta: 0.15 },
    acousticness:     { nombre: 'acústica',         min: 0,   max: 1,   paso: 0.01, delta: 0.15 },
    duration_ms:      { nombre: 'duración',         min: 0.5, max: 8,   paso: 0.05, delta: 0.5 },   // en minutos
    danceability:     { nombre: 'bailabilidad',     min: 0,   max: 1,   paso: 0.01, delta: 0.15 },
    loudness:         { nombre: 'volumen',          min: -25, max: -2,  paso: 0.5,  delta: 3 },
    speechiness:      { nombre: 'habla',            min: 0,   max: 0.6, paso: 0.01, delta: 0.1 },
    tempo:            { nombre: 'tempo',            min: 60,  max: 200, paso: 1,    delta: 15 },
    mode:             { nombre: 'modo',             min: 0,   max: 1,   paso: 1,    delta: 1 },
    instrumentalness: { nombre: 'instrumentalidad', min: 0,   max: 1,   paso: 0.01, delta: 0.2 },
  };
  // Artículo correcto para cada rasgo: "la energía", "el tempo"
  const MASC = ['loudness', 'tempo', 'mode', 'speechiness'];
  const la = k => `${MASC.includes(k) ? 'el' : 'la'} ${INFO[k].nombre}`;
  const La = k => la(k)[0].toUpperCase() + la(k).slice(1);
  const lo_ = k => MASC.includes(k) ? 'lo' : 'la';
  const SLIDERS = ['energy', 'duration_ms', 'acousticness', 'valence', 'danceability', 'loudness', 'tempo', 'mode'];

  const coma = (v, d = 2) => v.toFixed(d).replace('.', ',');
  const mmss = min => { const s = Math.round(min * 60); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function nivel(v) {
    if (v < 0.15) return 'casi nula'; if (v < 0.35) return 'baja';
    if (v < 0.6) return 'media'; if (v < 0.8) return 'alta'; return 'muy alta';
  }
  function valorCorto(k, v) {
    if (k === 'duration_ms') return mmss(v);
    if (k === 'loudness') return `${coma(v, 1)} dB`;
    if (k === 'tempo') return `${Math.round(v)} BPM`;
    if (k === 'mode') return v >= 0.5 ? 'mayor' : 'menor';
    return coma(v);
  }
  function valorLargo(k, v) {
    const c = valorCorto(k, v);
    if (k === 'duration_ms') return `${c} · ${v < 3 ? 'corta' : v < 4.5 ? 'media' : 'larga'}`;
    if (k === 'loudness') return `${c} · ${v < -12 ? 'baja' : v < -7 ? 'media' : 'alta'}`;
    if (k === 'tempo' || k === 'mode') return c;
    if (k === 'valence') return `${c} · ${v < 0.35 ? 'melancólica' : v < 0.6 ? 'neutra' : 'alegre'}`;
    if (k === 'speechiness') return `${c} · ${v < 0.1 ? 'cantada' : v < 0.33 ? 'algo hablada' : 'hablada'}`;
    return `${c} · ${nivel(v)}`;
  }

  /* ================= Modelo ================= */

  const zs = r => R.map((k, i) => (r[k] - M.media[i]) / M.desv[i]);
  const puntuar = (coef, z) => z.reduce((s, v, i) => s + coef[i + 1] * v, coef[0]);
  const sigm = x => 1 / (1 + Math.exp(-x));
  // Un eje puede ser una recta sola (prestigio) o dos preguntas encadenadas
  // (popularidad): P(entra) × hasta dónde llega. c1/c2 permiten pasar un remuestreo.
  function puntuarModelo(m, z, c1 = m.coef, c2 = m.coef2) {
    const s = puntuar(c1, z);
    return c2 ? sigm(s) * clamp(puntuar(c2, z), 0, 100) : s;
  }
  const puntuarBoot = (m, z, c) => Array.isArray(c[0]) ? puntuarModelo(m, z, c[0], c[1]) : puntuarModelo(m, z, c);

  function percentil(s, q) {
    if (s <= q[0]) return 0;
    const n = q.length - 1;
    if (s >= q[n]) return 100;
    let lo = 0, hi = n;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; (q[m] <= s ? lo = m : hi = m); }
    const f = (s - q[lo]) / ((q[hi] - q[lo]) || 1);
    return ((lo + f) / n) * 100;
  }

  // Un eje calculado con un modelo dado (el de hoy, o el de un período del viaje en el tiempo)
  function ejeCon(m, r) {
    const z = zs(r);
    const v = percentil(puntuarModelo(m, z), m.cuantiles);
    const b = m.boots.map(c => percentil(puntuarBoot(m, z, c), m.cuantiles)).sort((a, c) => a - c);
    // Margen: 10º–90º percentil de 20 remuestreos, con un piso de ±4 puntos
    const lo = clamp(Math.min(b[2], v - 4), 0, 100), hi = clamp(Math.max(b[17], v + 4), 0, 100);
    return { v, lo, hi };
  }
  const eje = (nombre, r) => ejeCon(M[nombre], r);
  const puntajes = r => ({ pres: eje('prestigio', r), pop: eje('popularidad', r) });
  // El viaje en el tiempo: la misma canción leída por el modelo de cada período
  const puntajesEn = (periodo, r) => ({ pres: ejeCon(periodo.prestigio, r), pop: ejeCon(periodo.popularidad, r) });

  // Cuántos puntos aporta cada rasgo: el puntaje real menos el puntaje si ese rasgo fuera promedio
  function aportes(nombre, r) {
    const m = M[nombre], z = zs(r), base = percentil(puntuarModelo(m, z), m.cuantiles);
    return R.map((k, i) => {
      const z0 = z.slice(); z0[i] = 0;                    // ese rasgo en el promedio
      return { k, pts: base - percentil(puntuarModelo(m, z0), m.cuantiles) };
    });
  }

  // El conflicto: el rasgo que empuja los dos ejes en direcciones opuestas con más fuerza.
  // Se mira en los aportes de ESTA canción (puntos reales), no en los coeficientes: con
  // la popularidad encadenada el efecto de un rasgo depende de la canción. Cada aporte se
  // compara contra el más fuerte de su propio eje.
  // La instrumentalidad no compite: en un tema cantado vale casi 0 y "hacerlo instrumental"
  // no es una decisión real de arreglo.
  const NO_CONFLICTO = ['instrumentalness'];
  const maxAbs = a => Math.max(1e-9, ...a.map(x => Math.abs(x.pts)));
  function conflicto(r) {
    const a = aportes('prestigio', r), b = aportes('popularidad', r);
    const mp = maxAbs(a), mq = maxAbs(b);
    let mejor = null;
    R.forEach((k, i) => {
      const ap = a[i].pts, aq = b[i].pts;
      if (NO_CONFLICTO.includes(k) || Math.sign(ap) === Math.sign(aq) || Math.abs(ap) < 0.5 || Math.abs(aq) < 0.5) return;
      const peso = Math.min(Math.abs(ap) / mp, Math.abs(aq) / mq);
      if (!mejor || peso > mejor.peso) mejor = { k, peso, cp: ap, cq: aq, ap, aq };
    });
    return mejor;
  }

  function zona(p) {
    const a = p.pres.v >= 50, b = p.pop.v >= 50;
    if (a && b) return { nombre: 'Las dos cosas', txt: 'Estás en la zona más chica del mapa: perfil de premio y de público a la vez.' };
    if (a) return { nombre: 'Prestigio sin público', txt: 'Tu sonido se parece a lo que la Academia nomina, pero no a lo que entra al ranking.' };
    if (b) return { nombre: 'Hit puro', txt: 'Buen potencial comercial, lejos del perfil que premia la Academia.' };
    return { nombre: 'Ni una cosa ni la otra', txt: 'Por ahora tu sonido no se parece ni a lo premiado ni a lo masivo. Es donde está la mayoría de la música publicada.' };
  }


  window.PP = {
    M, R, INFO, SLIDERS, la, La, lo_, coma, mmss, clamp,
    nivel, valorCorto, valorLargo,
    zs, puntuar, percentil, eje, puntajes, puntajesEn, aportes, conflicto, zona
  };
})();
