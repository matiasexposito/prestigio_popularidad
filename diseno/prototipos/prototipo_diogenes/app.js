/* P&P — prototipo funcional (Diogenes)
 *
 * Todo corre en el navegador, sin servidor:
 *  - modelo.js trae dos regresiones logísticas entrenadas con corpus_v2 + control_v2
 *    (ver generar_modelo.py). Los puntajes son el percentil dentro de 53.577 canciones.
 *  - El audio se mide acá mismo con Web Audio: duración, volumen, energía, tempo y
 *    brillo. Lo que el navegador no puede medir queda en el promedio del corpus
 *    hasta conectar librosa.
 *  - El asistente responde con reglas, pero SIEMPRE recalculando con el modelo:
 *    ningún número del chat está escrito a mano.
 */
(() => {
  'use strict';

  const M = window.MODELO;
  const R = M.rasgos;               // claves en inglés, como en el dataset
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

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

  function percentil(s, q) {
    if (s <= q[0]) return 0;
    const n = q.length - 1;
    if (s >= q[n]) return 100;
    let lo = 0, hi = n;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; (q[m] <= s ? lo = m : hi = m); }
    const f = (s - q[lo]) / ((q[hi] - q[lo]) || 1);
    return ((lo + f) / n) * 100;
  }

  function eje(nombre, r) {
    const m = M[nombre], z = zs(r);
    const v = percentil(puntuar(m.coef, z), m.cuantiles);
    const b = m.boots.map(c => percentil(puntuar(c, z), m.cuantiles)).sort((a, c) => a - c);
    // Margen: 10º–90º percentil de 20 remuestreos, con un piso de ±4 puntos
    const lo = clamp(Math.min(b[2], v - 4), 0, 100), hi = clamp(Math.max(b[17], v + 4), 0, 100);
    return { v, lo, hi };
  }
  const puntajes = r => ({ pres: eje('prestigio', r), pop: eje('popularidad', r) });

  // Cuántos puntos aporta cada rasgo: el puntaje real menos el puntaje si ese rasgo fuera promedio
  function aportes(nombre, r) {
    const m = M[nombre], z = zs(r), s = puntuar(m.coef, z), base = percentil(s, m.cuantiles);
    return R.map((k, i) => ({ k, pts: base - percentil(s - m.coef[i + 1] * z[i], m.cuantiles) }));
  }

  function conflicto(r) {
    const a = aportes('prestigio', r), b = aportes('popularidad', r);
    let mejor = null;
    R.forEach((k, i) => {
      const cp = M.prestigio.coef[i + 1], cq = M.popularidad.coef[i + 1];
      if (Math.sign(cp) === Math.sign(cq) || !cp || !cq) return;
      const peso = Math.min(Math.abs(cp), Math.abs(cq));
      if (!mejor || peso > mejor.peso) mejor = { k, peso, cp, cq, ap: a[i].pts, aq: b[i].pts };
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

  /* ================= Estado ================= */

  const S = {
    usuario: leer('pyp_usuario'),
    analisis: null,     // { nombre, rasgos, fuentes }
    sim: null,          // copia de rasgos que mueve el simulador
    ejeDesglose: 'prestigio',
    chat: [],
    ultimoRasgo: null,
  };

  function leer(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
  function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } }

  /* ================= Navegación ================= */

  const SIN_BARRA = ['portada', 'bienvenida', 'crear'];
  const DE_ANALISIS = ['resultado', 'desglose', 'simulador', 'asistente'];
  const PINTAR = {};

  function ruta() {
    let r = location.hash.slice(1) || 'portada';
    if (!$(`.pantalla[data-ruta="${r}"]`)) r = 'portada';
    if (DE_ANALISIS.includes(r) && !S.analisis) r = 'inicio';
    if (r === 'inicio' && !S.usuario) r = 'crear';
    return r;
  }

  function render() {
    const r = ruta();
    if (location.hash.slice(1) !== r && location.hash) history.replaceState(null, '', '#' + r);
    $$('.pantalla').forEach(p => p.classList.toggle('activa', p.dataset.ruta === r));
    const conBarra = !SIN_BARRA.includes(r);
    $('#barra').hidden = !conBarra;
    document.body.classList.toggle('sin-barra', !conBarra);
    if (conBarra) pintarBarra(r);
    PINTAR[r]?.();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', render);

  function pintarBarra(r) {
    const a = S.analisis;
    $('#barra-titulo').textContent = a ? a.nombre : 'Prestigio & Popularidad';
    $('#barra-detalle').textContent = a ? `${mmss(a.rasgos.duration_ms)} · ${Math.round(a.rasgos.tempo)} BPM` : '';
    const link = (h, t) => `<a href="#${h}" class="${r === h ? 'activo' : ''}">${t}</a>`;
    $('#barra-nav').innerHTML = a
      ? link('resultado', 'Resultado') + link('desglose', 'Qué suma y qué resta') + link('simulador', 'Simular') +
        link('asistente', 'Asistente') + '<span class="separador"></span>' + link('inicio', 'Analizar otra')
      : `<a href="#pronto" data-pronto="Explorar la historia">Explorar la historia</a>` +
        `<a href="#pronto" data-pronto="Modo álbum">Modo álbum</a>` + link('flujo', 'Cómo funciona');
    $$('#barra-nav a[href="#pronto"]').forEach(el => el.addEventListener('click', () => {
      $('#pronto-titulo').textContent = el.dataset.pronto || el.textContent;
    }));
  }

  /* ================= Bienvenida y cuenta ================= */

  $('#ya-tengo').addEventListener('click', () => {
    if (S.usuario) { location.hash = 'inicio'; return; }
    const av = $('#aviso-cuenta');
    av.textContent = 'En este navegador no hay ninguna cuenta guardada todavía. Creá una: son cuatro preguntas.';
    av.hidden = false;
  });

  PINTAR.crear = () => {
    const f = $('#form-usuario'), u = S.usuario;
    if (!u) return;
    f.nombre.value = u.nombre; f.email.value = u.email;
    ['rol', 'genero', 'busca'].forEach(n => { const el = f.querySelector(`input[name="${n}"][value="${u[n]}"]`); if (el) el.checked = true; });
  };

  $('#form-usuario').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const errores = {};
    if (!f.nombre.value.trim()) errores.nombre = 'Poné un nombre, aunque sea artístico.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) errores.email = 'Ese email no parece válido.';
    $$('[data-error]', f).forEach(el => { el.textContent = errores[el.dataset.error] || ''; });
    ['nombre', 'email'].forEach(n => f[n].classList.toggle('invalido', !!errores[n]));
    if (Object.keys(errores).length) { f[Object.keys(errores)[0]].focus(); return; }
    S.usuario = {
      nombre: f.nombre.value.trim(), email: f.email.value.trim(),
      rol: f.rol.value, genero: f.genero.value, busca: f.busca.value,
    };
    guardar('pyp_usuario', S.usuario);
    location.hash = 'inicio';
  });

  /* ================= Mapa (SVG) ================= */

  const X0 = 60, X1 = 770, Y0 = 500, Y1 = 24;
  const px = p => X0 + (X1 - X0) * p / 100;
  const py = p => Y0 - (Y0 - Y1) * p / 100;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function refCirculo(r) {
    if (r.gano) return `<circle r="6" style="fill:var(--azul)"/>`;
    if (r.nominada) return `<circle r="5.5" style="fill:none;stroke:var(--azul);stroke-width:2"/>`;
    return `<circle r="5" style="fill:none;stroke:var(--tenue-2);stroke-width:1.5"/>`;
  }

  function mapa(svg, { tu, antes, etiquetas = 'todas', refs = true } = {}) {
    let h = `
      <line class="m-eje" x1="${X0}" y1="${Y0}" x2="${X1}" y2="${Y0}"/>
      <line class="m-eje" x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y1}"/>
      <line class="m-guia" x1="${px(50)}" y1="${Y1}" x2="${px(50)}" y2="${Y0}"/>
      <line class="m-guia" x1="${X0}" y1="${py(50)}" x2="${X1}" y2="${py(50)}"/>
      <text class="m-cuadrante" x="${X0 + 10}" y="${Y1 + 18}">prestigio sin público</text>
      <text class="m-cuadrante" x="${X1 - 10}" y="${Y1 + 18}" text-anchor="end">las dos cosas</text>
      <text class="m-cuadrante" x="${X1 - 10}" y="${Y0 - 12}" text-anchor="end">hit puro</text>
      <text class="m-cuadrante" x="${X0 + 10}" y="${Y0 - 12}">ni una cosa ni la otra</text>`;
    h += M.fondo.map(([x, y]) => `<circle class="m-fondo" cx="${px(x).toFixed(1)}" cy="${py(y).toFixed(1)}" r="2.6"/>`).join('');

    if (refs) {
      let lista = M.referencias.map(r => ({ ...r }));
      let cercanas = null;
      if (etiquetas === 'cercanas' && tu) {
        lista.forEach(r => { r.d = Math.hypot(r.pop - tu.pop, r.pres - tu.pres); });
        cercanas = new Set([...lista].sort((a, b) => a.d - b.d).slice(0, 6).map(r => r.titulo));
      }
      h += lista.map(r => {
        const x = px(r.pop), y = py(r.pres), der = x > 620;
        const lejos = cercanas && !cercanas.has(r.titulo);
        const txt = lejos ? '' : `<text x="${der ? -11 : 11}" y="4" text-anchor="${der ? 'end' : 'start'}">${esc(r.titulo)}</text>`;
        return `<g class="m-ref${lejos ? ' lejana' : ''}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" ${lejos ? 'opacity=".45"' : ''}>
          <title>${esc(r.titulo)} — ${esc(r.artista)} (${r.anio}) · popularidad ${Math.round(r.pop)}% · prestigio ${Math.round(r.pres)}%</title>
          ${refCirculo(r)}${txt}</g>`;
      }).join('');
    }

    if (antes && tu) {
      const ax = px(antes.pop), ay = py(antes.pres), tx = px(tu.pop), ty = py(tu.pres);
      h += `<circle class="m-antes" cx="${ax}" cy="${ay}" r="7"/>
            <text class="m-cuadrante" x="${ax}" y="${ay + 24}" text-anchor="middle">antes</text>`;
      if (Math.hypot(tx - ax, ty - ay) > 12) h += `<line class="m-flecha" x1="${ax}" y1="${ay}" x2="${tx}" y2="${ty}"/>`;
    }
    if (tu) {
      const x = px(tu.pop), y = py(tu.pres);
      h += `<circle class="m-tu-halo" cx="${x}" cy="${y}" r="17"/>
            <circle class="m-tu" cx="${x}" cy="${y}" r="8"/>
            <text class="m-tu-texto" x="${x}" y="${y + (y > 440 ? -26 : 38)}" text-anchor="middle">${antes ? 'AHORA' : 'TU CANCIÓN'}</text>`;
    }
    h += `<text class="m-eje-texto" x="${(X0 + X1) / 2}" y="${Y0 + 36}" text-anchor="middle">popularidad →</text>
          <text class="m-eje-texto" x="22" y="${(Y0 + Y1) / 2}" text-anchor="middle" transform="rotate(-90 22 ${(Y0 + Y1) / 2})">prestigio →</text>`;
    svg.innerHTML = h;
  }

  /* ================= Inicio: cargar canción ================= */

  PINTAR.inicio = () => {
    $('#saludo').textContent = S.usuario ? `, ${S.usuario.nombre.split(' ')[0]}` : '';
    mapa($('#mapa-inicio'));
  };

  const zonaCarga = $('#zona-carga');
  $('#archivo').addEventListener('change', e => { if (e.target.files[0]) analizarArchivo(e.target.files[0]); e.target.value = ''; });
  ['dragenter', 'dragover'].forEach(t => zonaCarga.addEventListener(t, e => { e.preventDefault(); zonaCarga.classList.add('encima'); }));
  ['dragleave', 'drop'].forEach(t => zonaCarga.addEventListener(t, e => { e.preventDefault(); zonaCarga.classList.remove('encima'); }));
  zonaCarga.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) analizarArchivo(f); });

  // Búsqueda por nombre entre las canciones del corpus que vienen en modelo.js
  const sinTildes = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const INDICE = M.buscables.map(b => ({ b, clave: sinTildes(b[0] + ' ' + b[1]) }));
  const inputBuscar = $('#buscar'), listaRes = $('#resultados-busqueda');
  let foco = -1, visibles = [];
  inputBuscar.addEventListener('input', () => {
    const q = sinTildes(inputBuscar.value.trim());
    foco = -1;
    if (q.length < 2) { listaRes.hidden = true; return; }
    visibles = INDICE.filter(x => q.split(/\s+/).every(p => x.clave.includes(p))).slice(0, 8).map(x => x.b);
    listaRes.innerHTML = visibles.length
      ? visibles.map((b, i) => `<li data-i="${i}"><span>${esc(b[0])} — ${esc(b[1])}</span><small>${b[2]}${b[3] ? ' · ganó' : b[4] ? ' · nominada' : ''}</small></li>`).join('')
      : '<li class="tenue">No está entre las 1.825 buscables (las que lograron las dos cosas o llegaron al #1)</li>';
    listaRes.hidden = false;
  });
  inputBuscar.addEventListener('keydown', e => {
    const items = $$('li[data-i]', listaRes);
    if (!items.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      foco = (foco + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach((li, i) => li.classList.toggle('foco', i === foco));
    } else if (e.key === 'Enter') { e.preventDefault(); elegirBuscada(visibles[Math.max(foco, 0)]); }
    else if (e.key === 'Escape') listaRes.hidden = true;
  });
  listaRes.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (li) elegirBuscada(visibles[+li.dataset.i]); });
  document.addEventListener('click', e => { if (!e.target.closest('.buscador')) listaRes.hidden = true; });

  function elegirBuscada(b) {
    listaRes.hidden = true; inputBuscar.value = '';
    const rasgos = {}; R.forEach((k, i) => { rasgos[k] = b[5 + i]; });
    const fuentes = Object.fromEntries(R.map(k => [k, 'dataset']));
    correrAnalisis(`${b[0]} — ${b[1]}`, async () => ({ rasgos, fuentes }));
  }

  function analizarArchivo(file) {
    if (!/^audio\//.test(file.type) && !/\.(mp3|wav|flac|m4a|ogg|aac)$/i.test(file.name)) {
      alertaInicio('Ese archivo no parece de audio. Probá con mp3, wav o flac.');
      return;
    }
    correrAnalisis(file.name, () => medirAudio(file));
  }

  function alertaInicio(msg) {
    let el = $('#alerta-inicio');
    if (!el) { el = document.createElement('p'); el.id = 'alerta-inicio'; el.className = 'aviso'; zonaCarga.after(el); }
    el.textContent = msg;
  }

  const esperar = ms => new Promise(r => setTimeout(r, ms));

  async function correrAnalisis(nombre, obtener) {
    $('#alerta-inicio')?.remove();
    const capa = $('#cargando'), pasos = $$('.paso', capa);
    $('#cargando-nombre').textContent = nombre;
    pasos.forEach(p => p.classList.remove('actual', 'hecho'));
    capa.hidden = false;
    try {
      pasos[0].classList.add('actual');
      const [{ rasgos, fuentes }] = await Promise.all([obtener(), esperar(700)]);
      pasos[0].classList.replace('actual', 'hecho'); pasos[1].classList.add('actual');
      await esperar(600);
      pasos[1].classList.replace('actual', 'hecho'); pasos[2].classList.add('actual');
      await esperar(600);
      S.analisis = { nombre, rasgos, fuentes };
      S.sim = { ...rasgos };
      S.chat = []; S.ultimoRasgo = null;
      location.hash = 'resultado';
    } catch (err) {
      console.error(err);
      alertaInicio('No pudimos leer ese audio. Probá con otro formato (wav o mp3 suelen andar siempre).');
    } finally {
      capa.hidden = true;
    }
  }

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
    return { rasgos, fuentes };
  }

  /* ================= Resultado ================= */

  function tarjetaEje(el, titulo, e, color, antes) {
    el.innerHTML = `
      <div class="puntaje-rotulo">${titulo}</div>
      ${antes == null ? `<div class="puntaje-numero">${Math.round(e.v)}%</div>` : ''}
      <div class="puntaje-margen">con un margen entre ${Math.round(e.lo)}% y ${Math.round(e.hi)}%</div>
      <div class="barra-margen eje-${color}">
        <div class="rango" style="left:${e.lo}%;width:${e.hi - e.lo}%"></div>
        ${antes != null ? `<div class="marca-antes" style="left:${antes}%"></div>` : ''}
        <div class="marca-valor" style="left:calc(${e.v}% - 1px)"></div>
      </div>
      <div class="escala"><span>0</span><span>50</span><span>100</span></div>`;
  }

  PINTAR.resultado = () => {
    const r = S.analisis.rasgos, p = puntajes(r), z = zona(p), c = conflicto(r);
    tarjetaEje($('#tarjeta-pres'), 'Prestigio', p.pres, 'azul');
    tarjetaEje($('#tarjeta-pop'), 'Popularidad', p.pop, 'ambar');
    const foco = c ? ` El conflicto está en ${la(c.k).replace(/^(el|la) /, '$1 <strong>')}</strong>.` : '';
    $('#zona-cayo').innerHTML = `<div class="cayo-rotulo">Tu canción cayó en</div><div class="cayo-zona">${z.nombre}</div><p class="chico">${z.txt}${foco}</p>`;
    const u = S.usuario;
    $('#nota-genero').innerHTML = u
      ? `<strong>Te comparamos contra toda la música.</strong><p>La lectura dentro de ${esc(u.genero.toLowerCase())} llega cuando sumemos el género al dataset: hoy el dump no lo trae.</p>`
      : '';
    mapa($('#mapa-resultado'), { tu: { pop: p.pop.v, pres: p.pres.v }, etiquetas: 'cercanas' });
  };

  /* ================= Qué suma y qué resta ================= */

  $$('.selector button').forEach(b => b.addEventListener('click', () => {
    S.ejeDesglose = b.dataset.eje;
    $$('.selector button').forEach(x => x.classList.toggle('activo', x === b));
    PINTAR.desglose();
  }));

  PINTAR.desglose = () => {
    const a = S.analisis, r = a.rasgos, nom = S.ejeDesglose;
    const e = eje(nom, r);
    $('#desglose-valor').innerHTML = `<b>${Math.round(e.v)}%</b>entre ${Math.round(e.lo)}% y ${Math.round(e.hi)}%`;
    const lista = aportes(nom, r).sort((x, y) => Math.abs(y.pts) - Math.abs(x.pts));
    const maximo = Math.max(10, ...lista.map(x => Math.abs(x.pts)));
    $('#desglose-filas').innerHTML = lista.map(({ k, pts }) => {
      const signo = Math.round(pts) > 0 ? 'suma' : Math.round(pts) < 0 ? 'resta' : 'cero';
      const ancho = Math.abs(pts) / maximo * 48;
      const fuente = a.fuentes[k] !== 'dataset' && a.fuentes[k] !== 'medido' ? `<span class="fuente">${a.fuentes[k]}</span>` : '';
      return `<div class="fila-rasgo">
        <div><div class="rasgo-nombre">${INFO[k].nombre}${fuente}</div><div class="rasgo-valor">${valorLargo(k, r[k])}</div></div>
        <div class="barra-efecto"><div class="eje-central"></div>${signo !== 'cero' ? `<div class="relleno ${signo}" style="width:${ancho}%"></div>` : ''}</div>
        <div class="efecto ${signo}">${pts > 0.5 ? '+' : ''}${Math.round(pts) === 0 ? '0' : Math.round(pts).toString().replace('-', '−')}</div>
      </div>`;
    }).join('');
    const c = conflicto(r);
    $('#conflicto').innerHTML = `<div class="firma-ia"><i></i>la IA traduce · tu conflicto principal</div><p>${c ? textoConflicto(c) : 'Ningún rasgo empuja los dos ejes en sentidos opuestos: lo que te suma en uno no te resta en el otro.'}</p>`;
  };

  function textoConflicto(c) {
    const n = INFO[c.k].nombre;
    const subePres = c.cp > 0;
    return `${La(c.k).replace(/^(El|La) /, '$1 <strong>')}</strong> tira los dos ejes en direcciones opuestas: ${subePres ? 'subir' : 'bajar'}${lo_(c.k)} te acerca al premio pero te aleja del público. ` +
      `Hoy te está dando ${fmtPts(c.ap)} en prestigio y ${fmtPts(c.aq)} en popularidad. <strong>No hay forma de mover${lo_(c.k)} que mejore las dos cosas.</strong>`;
  }
  const fmtPts = p => `${p >= 0 ? '+' : '−'}${Math.abs(Math.round(p))} puntos`;

  /* ================= Simulador ================= */

  function pintarControles() {
    const o = S.analisis.rasgos;
    $('#controles').innerHTML = SLIDERS.map(k => {
      const I = INFO[k], v = S.sim[k];
      const pOrig = (clamp(o[k], I.min, I.max) - I.min) / (I.max - I.min) * 100;
      return `<div class="control" data-k="${k}">
        <div class="control-cabeza"><span>${I.nombre}</span><span class="control-valor"></span></div>
        <div class="control-pista">
          <input type="range" min="${I.min}" max="${I.max}" step="${I.paso}" value="${clamp(v, I.min, I.max)}" aria-label="${I.nombre}">
          <div class="fantasma" style="left:calc(10px + (100% - 20px) * ${pOrig / 100} - 1px)"></div>
        </div>
      </div>`;
    }).join('');
    $$('#controles input').forEach(inp => inp.addEventListener('input', () => {
      S.sim[inp.closest('.control').dataset.k] = +inp.value;
      actualizarSim();
    }));
  }

  function actualizarSim() {
    const o = S.analisis.rasgos, s = S.sim;
    $$('#controles .control').forEach(c => {
      const k = c.dataset.k, I = INFO[k], inp = $('input', c);
      const movido = Math.abs(s[k] - o[k]) > I.paso / 2;
      inp.classList.toggle('movido', movido);
      inp.style.setProperty('--p', ((s[k] - I.min) / (I.max - I.min) * 100) + '%');
      const val = $('.control-valor', c);
      val.classList.toggle('cambio', movido);
      val.innerHTML = movido ? `<s>${valorCorto(k, o[k])}</s><b>${valorCorto(k, s[k])}</b>` : valorCorto(k, s[k]);
    });
    const a = puntajes(o), b = puntajes(s);
    cifraSim($('#sim-pres'), 'Prestigio', a.pres, b.pres, 'azul');
    cifraSim($('#sim-pop'), 'Popularidad', a.pop, b.pop, 'ambar');

    const cambios = SLIDERS.filter(k => Math.abs(s[k] - o[k]) > INFO[k].paso / 2);
    const dp = b.pres.v - a.pres.v, dq = b.pop.v - a.pop.v;
    let t;
    if (!cambios.length) t = '<strong>Mové cualquier control</strong><p>Los dos puntajes se recalculan con el mismo modelo que el resultado.</p>';
    else {
      const lista = cambios.map(k => `${INFO[k].nombre} de ${valorCorto(k, o[k])} a ${valorCorto(k, s[k])}`).join(', ');
      const tension = Math.sign(Math.round(dp)) * Math.sign(Math.round(dq)) < 0;
      t = tension
        ? `<strong>Acá se ve la tensión</strong><p>Cambiaste ${lista} y <strong>un puntaje subió mientras el otro bajaba</strong>.</p>`
        : `<strong>${titularCambio(dp, dq)}</strong><p>Cambiaste ${lista}. Prestigio ${fmtPts(dp)}, popularidad ${fmtPts(dq)}.</p>`;
    }
    $('#sim-tension').innerHTML = t;
    mapa($('#mapa-sim'), { tu: { pop: b.pop.v, pres: b.pres.v }, antes: { pop: a.pop.v, pres: a.pres.v }, etiquetas: 'cercanas' });
  }

  function titularCambio(dp, dq) {
    const a = Math.round(dp), b = Math.round(dq);
    if (!a && !b) return 'Casi no se mueve nada';
    if (!a) return b > 0 ? 'Sube solo la popularidad' : 'Baja solo la popularidad';
    if (!b) return a > 0 ? 'Sube solo el prestigio' : 'Baja solo el prestigio';
    return a > 0 ? 'Los dos suben' : 'Los dos bajan';
  }

  function cifraSim(el, titulo, a, b, color) {
    const d = Math.round(b.v - a.v);
    const clase = color === 'azul' ? 't-azul' : 't-ambar';
    el.innerHTML = `<div class="puntaje-rotulo">${titulo}</div>
      <div class="sim-cifras">${d ? `<s>${Math.round(a.v)}%</s><span class="${clase}">${d > 0 ? '→' : '←'}</span>` : ''}<b class="${d ? clase : ''}">${Math.round(b.v)}%</b></div>`;
    const cont = document.createElement('div');
    tarjetaEje(cont, '', b, color, a.v);
    el.append(...[...cont.children].slice(1));
    if (d) el.insertAdjacentHTML('beforeend', `<div class="sim-delta ${clase}">${d > 0 ? '↑' : '↓'} ${Math.abs(d)} puntos</div>`);
  }

  $('#restablecer').addEventListener('click', () => { S.sim = { ...S.analisis.rasgos }; pintarControles(); actualizarSim(); });

  PINTAR.simulador = () => { pintarControles(); actualizarSim(); };

  /* ================= Asistente ================= */

  const ALIAS = {
    energy: ['energia', 'energ', 'intensidad'],
    valence: ['valencia', 'alegr', 'triste', 'melancol'],
    acousticness: ['acustic'],
    duration_ms: ['duracion', 'larga', 'corta', 'minutos', 'dure'],
    danceability: ['bailab', 'bailable'],
    loudness: ['volumen', 'loudness', 'fuerte', 'masteriz'],
    speechiness: ['habla', 'hablad', 'rapead', 'recit'],
    tempo: ['tempo', 'bpm', 'rapid', 'lenta', 'velocidad'],
    mode: ['modo', 'mayor', 'menor', 'tonalidad'],
    instrumentalness: ['instrumental'],
  };
  const GLOSARIO = {
    energy: 'mide qué tan intensa y activa se siente: volumen, densidad de ataques, brillo. Un tema de metal está cerca de 1; una balada a piano, cerca de 0,2.',
    valence: 'mide qué tan "positiva" suena. Arriba de 0,6 suena alegre; abajo de 0,35, melancólica. No lee la letra: es solo el sonido.',
    acousticness: 'es la probabilidad de que la grabación sea acústica, sin instrumentos eléctricos ni sintetizadores dominantes.',
    duration_ms: 'es el largo del tema. Los hits de las últimas décadas se acortaron; lo nominado suele ser más largo.',
    danceability: 'combina qué tan estable y marcado es el pulso. Un beat regular y claro sube la bailabilidad.',
    loudness: 'es el volumen promedio en decibeles (siempre negativo). Cerca de −5 es una mezcla muy comprimida y fuerte.',
    speechiness: 'mide cuánta voz hablada hay. Arriba de 0,33 ya es casi rap o spoken word.',
    tempo: 'es la velocidad en pulsos por minuto.',
    mode: 'dice si la canción está en tono mayor o menor.',
    instrumentalness: 'estima qué tan poca voz tiene. Cerca de 1 es instrumental.',
  };
  const PRACTICA = {
    energy: ['menos capas de percusión, la batería menos presente en la mezcla, y dejá respirar los silencios entre frases', 'sumá capas rítmicas, subí la presencia de la batería y apretá la compresión en el estribillo'],
    valence: ['llevá la armonía a acordes menores o suspendidos y bajá el brillo de los sintes', 'probá progresiones mayores, más brillo en la mezcla y un groove más saltado'],
    acousticness: ['cambiá sintes por guitarra acústica, piano o cuerdas grabadas', 'reemplazá instrumentos acústicos por sintes o guitarras eléctricas procesadas'],
    duration_ms: ['recortá la intro, sacá una vuelta de estrofa o llegá antes al estribillo', 'sumá un puente o una sección instrumental que deje crecer el tema'],
    danceability: ['rompé el pulso con cambios de métrica o un groove más libre', 'fijá un beat estable y marcado, con el bombo en negras'],
    loudness: ['bajá la compresión del master y dejá más rango dinámico', 'subí el nivel del master con más compresión y limitador'],
    speechiness: ['cantá las frases en vez de recitarlas', 'sumá partes habladas o rapeadas'],
    tempo: ['bajá unos BPM o probá medio tiempo en el estribillo', 'subí el tempo o duplicá la subdivisión de la batería'],
    mode: ['pasá la canción a su relativa menor', 'pasá la canción a su relativa mayor'],
    instrumentalness: ['dale más protagonismo a la voz', 'sumá secciones instrumentales largas'],
  };
  const FUERA = /(letra|lyric|sello|disquer|campa|marketing|seguidor|redes|instagram|tiktok|playlist|spotify|promo|gira|manager)/;

  function detectarRasgo(t) {
    for (const [k, al] of Object.entries(ALIAS)) if (al.some(a => t.includes(a))) return k;
    return null;
  }

  function contexto() {
    const a = S.analisis, r = a.rasgos, p = puntajes(r), c = conflicto(r);
    const cerca = [...M.referencias].map(x => ({ ...x, d: Math.hypot(x.pop - p.pop.v, x.pres - p.pres.v) })).sort((x, y) => x.d - y.d).slice(0, 3);
    const pesoP = aportes('prestigio', r).sort((x, y) => Math.abs(y.pts) - Math.abs(x.pts))[0];
    const pesoQ = aportes('popularidad', r).sort((x, y) => Math.abs(y.pts) - Math.abs(x.pts))[0];
    $('#contexto').innerHTML = `
      <li>Las 10 características de tu canción<small>${['energy', 'valence', 'duration_ms', 'tempo'].map(k => `${INFO[k].nombre} ${valorCorto(k, r[k])}`).join(' · ')}</small></li>
      <li>Los dos puntajes con sus márgenes<small>prestigio ${Math.round(p.pres.v)}% (${Math.round(p.pres.lo)}–${Math.round(p.pres.hi)}) · popularidad ${Math.round(p.pop.v)}% (${Math.round(p.pop.lo)}–${Math.round(p.pop.hi)})</small></li>
      <li>Qué característica pesó más en cada eje<small>prestigio: ${INFO[pesoP.k].nombre} · popularidad: ${INFO[pesoQ.k].nombre}${c ? ` · conflicto: ${INFO[c.k].nombre}` : ''}</small></li>
      <li>Las canciones de referencia más cercanas<small>${cerca.map(x => x.titulo).join(' · ')}</small></li>
      <li class="vivo"><strong>Acceso al modelo en vivo</strong> — para recalcular cuando le preguntan "¿y si…?"</li>`;
    return { r, p, c, cerca };
  }

  function saludoIA() {
    const { p, c, cerca } = contexto();
    const z = zona(p), busca = S.usuario?.busca;
    const pres = `prestigio ${Math.round(p.pres.v)}%`, pop = `popularidad ${Math.round(p.pop.v)}%`;
    const orden = busca === 'reconocimiento' ? `${pres} y ${pop}` : `${pop} y ${pres}`;
    let t = `Tu canción cayó en la zona de <strong>${z.nombre.toLowerCase()}</strong>: ${orden}. `;
    if (c) t += `Lo que más tensiona los dos ejes es <strong>${la(c.k)}</strong> (${valorLargo(c.k, S.analisis.rasgos[c.k])}). `;
    t += `Las referencias más cercanas en el mapa son ${cerca.slice(0, 2).map(x => `<strong>${esc(x.titulo)}</strong>`).join(' y ')}. `;
    t += c ? `¿Querés ver qué pasa si movés ${la(c.k)}?` : '¿Qué querés saber?';
    S.ultimoRasgo = c?.k || null;
    return t;
  }

  function sugerencias() {
    const c = conflicto(S.analisis.rasgos), k = c?.k || 'energy';
    const sube = c ? c.cp > 0 : false;
    return [`Si ${sube ? 'subo' : 'bajo'} ${la(k)}, ¿cuánto pierdo en popularidad?`, `¿Por qué la duración importa tanto?`, `Explicame qué es la valencia`, `¿Me conviene cambiar la letra?`];
  }

  function responder(pregunta) {
    const t = sinTildes(pregunta);
    const o = S.analisis.rasgos, base = puntajes(o);
    let k = detectarRasgo(t);

    if (FUERA.test(t)) return { txt: 'Eso está <strong>fuera del análisis</strong>. Solo medimos cómo suena la grabación: la letra, el sello, la campaña o los seguidores no entran en el cálculo, así que no puedo decirte cómo te afectan sin inventar. Lo que sí puedo es mostrarte qué pasa si cambiás algo del sonido.' };

    if (/(album|disco|la otra|esta o)/.test(t)) return { txt: 'Para comparar dos temas del disco hace falta el <strong>modo álbum</strong>, que todavía no está en el prototipo. Por ahora podés analizar cada una por separado y comparar dónde cae cada una en el mapa.' };

    if (/(que es|que significa|explica)/.test(t) && k) {
      S.ultimoRasgo = k;
      return { txt: `<strong>${La(k)}</strong> ${GLOSARIO[k]} En tu canción: ${valorLargo(k, o[k])}.` };
    }

    if (/(por que|porque|importa|pesa)/.test(t) && k) {
      S.ultimoRasgo = k;
      const i = R.indexOf(k), cp = M.prestigio.coef[i + 1], cq = M.popularidad.coef[i + 1];
      const g = M.grupos, fmt = v => valorCorto(k, v);
      const dir = (c, eje) => Math.abs(c) < 0.03 ? `casi no pesa en ${eje}` : `${c > 0 ? 'más' : 'menos'} ${INFO[k].nombre} suma en ${eje}`;
      return { txt: `Porque en los datos las nominadas y los hits se separan ahí. En promedio, las canciones que lograron premio y éxito tienen ${fmt(g.ambas[k])} de ${INFO[k].nombre} y las que fueron solo hit, ${fmt(g.hit[k])}. En el modelo, ${dir(cp, 'prestigio')} y ${dir(cq, 'popularidad')}. En tu canción: ${valorLargo(k, o[k])}.` };
    }

    if (/(como hago|en la practica|que hago|como lo|como bajo|como subo)/.test(t)) {
      k = k || S.ultimoRasgo;
      if (!k) return { txt: 'Decime qué característica querés mover —energía, duración, acústica, valencia…— y te digo cómo se traduce a arreglo y mezcla.' };
      const quiereBajar = S.sim && S.sim[k] < o[k] ? true : /(bajo|bajar|menos)/.test(t) || (conflicto(o)?.k === k && conflicto(o).cp < 0);
      const refs = M.referencias.filter(x => x.nominada).map(x => ({ ...x, v: x.rasgos[k] })).sort((a, b) => quiereBajar ? a.v - b.v : b.v - a.v).slice(0, 2);
      return { txt: `Para ${quiereBajar ? 'bajar' : 'subir'} ${la(k)}: ${PRACTICA[k][quiereBajar ? 0 : 1]}. Para escucharlo, fijate ${refs.map(x => `<strong>${esc(x.titulo)}</strong> de ${esc(x.artista)}`).join(' o ')}.` };
    }

    // "¿y si bajo/subo X?" → recalcular con el modelo
    const baja = /(bajo|bajar|baja|menos|reduzco|reducir|saco|acorto|acortar|mas corta|mas lenta)/.test(t);
    const sube = !baja && /(subo|subir|sube|mas\s|aumento|aumentar|agrego|alargo|alargar)/.test(t);
    k = k || ((baja || sube) ? S.ultimoRasgo : null);
    if (k && (baja || sube || /(a \d|y si)/.test(t))) {
      const I = INFO[k];
      const num = t.match(/(?:a|en)\s*(-?\d+(?:[.,]\d+)?)/);
      let nuevo;
      if (k === 'mode') nuevo = o[k] >= 0.5 ? 0 : 1;
      else if (num) { nuevo = parseFloat(num[1].replace(',', '.')); if (k === 'duration_ms' && nuevo > 20) nuevo /= 60; }
      else nuevo = o[k] + (baja && !sube ? -I.delta : I.delta);
      nuevo = clamp(nuevo, I.min, I.max);
      if (Math.abs(nuevo - o[k]) < I.paso / 2) {
        S.ultimoRasgo = k;
        return { txt: `${La(k)} ya está en ${valorCorto(k, o[k])}, el ${nuevo <= I.min ? 'mínimo' : 'máximo'} que maneja el simulador. Probá moviéndo${lo_(k)} para el otro lado.` };
      }
      const s = { ...o, [k]: nuevo }, p = puntajes(s);
      const dp = p.pres.v - base.pres.v, dq = p.pop.v - base.pop.v;
      S.ultimoRasgo = k;
      const busca = S.usuario?.busca;
      let lectura;
      if (Math.sign(Math.round(dp)) * Math.sign(Math.round(dq)) < 0) {
        const ganaPres = dp > 0;
        lectura = busca === 'reconocimiento' ? (ganaPres ? 'Es un intercambio favorable si tu objetivo es el reconocimiento.' : 'Si buscás reconocimiento, este cambio te juega en contra.')
          : busca === 'publico' ? (ganaPres ? 'Si buscás llegar a mucha gente, este cambio te juega en contra.' : 'Es un intercambio favorable si tu objetivo es llegar a mucha gente.')
          : 'Es un intercambio: ganás en un eje lo que perdés en el otro.';
      } else if (!Math.round(dp) && !Math.round(dq)) lectura = `Casi no mueve ninguno de los dos: ${la(k)} pesa poco en el modelo.`;
      else lectura = Math.round(dp) >= 0 && Math.round(dq) >= 0 ? 'Acá no hay conflicto: ninguno de los dos baja.' : 'Te baja en los dos ejes, así que no parece buena idea.';
      return {
        modelo: true, cambio: { k, v: nuevo },
        txt: `Si ${k === 'mode' ? 'cambiás' : nuevo < o[k] ? 'bajás' : 'subís'} ${la(k)} de ${valorCorto(k, o[k])} a ${valorCorto(k, nuevo)}, tu prestigio pasa de ${Math.round(base.pres.v)}% a <strong>${Math.round(p.pres.v)}%</strong> y la popularidad de ${Math.round(base.pop.v)}% a <strong>${Math.round(p.pop.v)}%</strong>. ${lectura}`,
      };
    }

    if (/(hola|buenas|que tal)/.test(t)) return { txt: `¡Hola${S.usuario ? ', ' + esc(S.usuario.nombre.split(' ')[0]) : ''}! Preguntame qué pasa si cambiás algo de tu canción, o qué significa alguna característica.` };

    return { txt: 'No te entendí del todo. Puedo: <strong>recalcular</strong> si cambiás una característica ("¿y si bajo la energía a 0,6?"), <strong>explicarte</strong> qué es cada una, o decirte <strong>por qué</strong> pesa en el resultado.' };
  }

  function agregarMensaje(m) {
    S.chat.push(m);
    const el = document.createElement('div');
    el.className = 'msj ' + m.quien;
    el.innerHTML = m.quien === 'ia'
      ? `${m.modelo ? '<div class="consultando">⌁ consultando el modelo</div>' : ''}<div>${m.txt}</div>${m.cambio ? '<button type="button" class="boton secundario chico">Probarlo en el simulador</button>' : ''}`
      : esc(m.txt);
    if (m.cambio) $('button', el).addEventListener('click', () => { S.sim = { ...S.analisis.rasgos, [m.cambio.k]: m.cambio.v }; location.hash = 'simulador'; });
    $('#mensajes').append(el);
    el.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  async function preguntar(texto) {
    texto = texto.trim();
    if (!texto) return;
    agregarMensaje({ quien: 'yo', txt: texto });
    $('#pregunta').value = '';
    const r = responder(texto);
    const tipeo = document.createElement('div');
    tipeo.className = 'msj ia escribiendo';
    tipeo.innerHTML = (r.modelo ? '<div class="consultando">⌁ consultando el modelo</div><br>' : '') + '<span></span><span></span><span></span>';
    $('#mensajes').append(tipeo);
    tipeo.scrollIntoView({ behavior: 'smooth', block: 'end' });
    await esperar(r.modelo ? 900 : 500);
    tipeo.remove();
    agregarMensaje({ quien: 'ia', ...r });
  }

  $('#form-chat').addEventListener('submit', e => { e.preventDefault(); preguntar($('#pregunta').value); });

  PINTAR.asistente = () => {
    contexto();
    const cont = $('#mensajes');
    cont.innerHTML = '';
    const previos = S.chat; S.chat = [];
    if (!previos.length) agregarMensaje({ quien: 'ia', txt: saludoIA() });
    else previos.forEach(agregarMensaje);
    $('#sugerencias').innerHTML = sugerencias().map(s => `<button type="button">${esc(s)}</button>`).join('');
    $$('#sugerencias button').forEach(b => b.addEventListener('click', () => preguntar(b.textContent)));
  };

  /* ================= Arranque ================= */
  render();
})();
