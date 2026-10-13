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
    const pantalla = $(`.pantalla[data-ruta="${r}"]`);
    pantalla.scrollTop = 0;
    window.scrollTo(0, 0);
    PINTAR[r]?.();
    escalonar(pantalla);
  }
  window.addEventListener('hashchange', render);

  /* ----- Animaciones: utilidades ----- */

  const MOVIMIENTO = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reflow = el => void el.getBoundingClientRect();

  // Entrada escalonada: anima los bloques de primer nivel de la pantalla, uno detrás de otro
  const BLOQUES = '.tarjeta, .caja, .nota, .titular, .titular-md, .bajada, .zona-carga, .buscador, .botonera, .marca, ' +
    '.titulo-pantalla, .opciones-grupo, .grilla-2, .fp, .chat, .pie-limites, .pie-datos, .pie-privacidad, .rotulo-seccion, ' +
    '.flujo-cabeza, .asistente-contexto > strong, .col-puntajes > p, form > p, .col-controles > p';
  function escalonar(pantalla) {
    if (!MOVIMIENTO) return;
    const els = $$(BLOQUES, pantalla).filter(el => !el.parentElement.closest(BLOQUES));
    els.forEach((el, i) => { el.classList.remove('entra'); el.style.setProperty('--i', Math.min(i, 14)); });
    // Mientras los bloques suben, las columnas no muestran barra de scroll por el desplazamiento
    pantalla.classList.add('entrando');
    clearTimeout(pantalla._t);
    pantalla._t = setTimeout(() => pantalla.classList.remove('entrando'), Math.min(els.length, 15) * 45 + 650);
    reflow(pantalla);
    els.forEach(el => {
      el.classList.add('entra');
      // Se saca la clase al terminar para que no queden capas de apilamiento colgando
      const fin = e => { if (e.target !== el || e.animationName !== 'entrar') return; el.classList.remove('entra'); el.removeEventListener('animationend', fin); };
      el.addEventListener('animationend', fin);
    });
  }

  // Cuenta un número desde "desde" hasta "hasta" con desaceleración
  const suave = t => 1 - Math.pow(1 - t, 3);
  function contar(el, desde, hasta, ms = 900, retraso = 0, fmt = v => Math.round(v)) {
    cancelAnimationFrame(el._raf);
    if (!MOVIMIENTO || ms <= 0) { el.textContent = fmt(hasta); el._shown = hasta; return; }
    const t0 = performance.now() + retraso;
    el.textContent = fmt(desde);
    const paso = now => {
      const t = clamp((now - t0) / ms, 0, 1);
      el._shown = desde + (hasta - desde) * suave(t);
      el.textContent = fmt(el._shown);
      if (t < 1) el._raf = requestAnimationFrame(paso);
    };
    el._raf = requestAnimationFrame(paso);
  }

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

  /* El mapa se arma por capas: ejes y puntos de fondo se dibujan una sola vez;
     referencias, "antes" y "tu canción" se actualizan. Así el punto de tu canción
     se desliza en el simulador en vez de redibujarse, y la entrada se anima. */
  const choca = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  const anchoTexto = s => s.length * 6.7 + 4;

  function mapa(svg, { tu, antes, etiquetas = 'todas', refs = true, animar = false } = {}) {
    if (!svg._capas) {
      svg.innerHTML = `
        <g class="m-base">
          <line class="m-eje" x1="${X0}" y1="${Y0}" x2="${X1}" y2="${Y0}"/>
          <line class="m-eje" x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y1}"/>
          <line class="m-guia" x1="${px(50)}" y1="${Y1}" x2="${px(50)}" y2="${Y0}"/>
          <line class="m-guia" x1="${X0}" y1="${py(50)}" x2="${X1}" y2="${py(50)}"/>
          <text class="m-cuadrante" x="${X0 + 10}" y="${Y1 + 18}">prestigio sin público</text>
          <text class="m-cuadrante" x="${X1 - 10}" y="${Y1 + 18}" text-anchor="end">las dos cosas</text>
          <text class="m-cuadrante" x="${X1 - 10}" y="${Y0 - 12}" text-anchor="end">hit puro</text>
          <text class="m-cuadrante" x="${X0 + 10}" y="${Y0 - 12}">ni una cosa ni la otra</text>
          <text class="m-eje-texto" x="${(X0 + X1) / 2}" y="${Y0 + 36}" text-anchor="middle">popularidad →</text>
          <text class="m-eje-texto" x="22" y="${(Y0 + Y1) / 2}" text-anchor="middle" transform="rotate(-90 22 ${(Y0 + Y1) / 2})">prestigio →</text>
        </g>
        <g class="m-capa-fondo">${M.fondo.map(([x, y]) => `<circle class="m-fondo" cx="${px(x).toFixed(1)}" cy="${py(y).toFixed(1)}" r="2.6" style="--d:${Math.round(px(x) - X0)}"/>`).join('')}</g>
        <g class="m-capa-antes"></g><g class="m-capa-refs"></g><g class="m-capa-tu"></g>`;
      svg._capas = { fondo: $('.m-capa-fondo', svg), refs: $('.m-capa-refs', svg), antes: $('.m-capa-antes', svg), tu: $('.m-capa-tu', svg) };
    }
    const C = svg._capas;
    if (animar && MOVIMIENTO) { C.fondo.classList.remove('anim'); reflow(svg); C.fondo.classList.add('anim'); }

    // Espacio ya ocupado: rótulos de cuadrante y, si hay, tu canción con su etiqueta
    const ocupado = [
      { x0: X0, x1: X0 + 150, y0: Y1 + 4, y1: Y1 + 24 }, { x0: X1 - 100, x1: X1, y0: Y1 + 4, y1: Y1 + 24 },
      { x0: X1 - 70, x1: X1, y0: Y0 - 26, y1: Y0 - 6 }, { x0: X0, x1: X0 + 150, y0: Y0 - 26, y1: Y0 - 6 },
    ];
    let tx, ty, ty_txt;
    if (tu) {
      tx = px(tu.pop); ty = py(tu.pres); ty_txt = ty > 440 ? -26 : 38;
      const w = antes ? 62 : 104;
      ocupado.push({ x0: tx - 19, x1: tx + 19, y0: ty - 19, y1: ty + 19 }, { x0: tx - w / 2, x1: tx + w / 2, y0: ty + ty_txt - 14, y1: ty + ty_txt + 4 });
    }

    if (refs) {
      let lista = M.referencias.map((r, i) => ({ ...r, i, x: px(r.pop), y: py(r.pres) }));
      let cercanas = null;
      if (etiquetas === 'cercanas' && tu) {
        lista.forEach(r => { r.d = Math.hypot(r.pop - tu.pop, r.pres - tu.pres); });
        cercanas = new Set([...lista].sort((a, b) => a.d - b.d).slice(0, 6).map(r => r.titulo));
        lista.sort((a, b) => a.d - b.d);   // las cercanas eligen lugar primero
      }
      lista.forEach(r => ocupado.push({ x0: r.x - 7, x1: r.x + 7, y0: r.y - 7, y1: r.y + 7 }));
      // Cada etiqueta prueba derecha, izquierda, arriba y abajo; si no entra en ningún lado, se oculta
      const html = lista.map(r => {
        const lejos = cercanas && !cercanas.has(r.titulo);
        let txt = '';
        if (!lejos) {
          const w = anchoTexto(r.titulo), der = r.x > 620;
          const lados = [
            { x: 11, y: 4, a: 'start', c: { x0: r.x + 9, x1: r.x + 11 + w, y0: r.y - 9, y1: r.y + 7 } },
            { x: -11, y: 4, a: 'end', c: { x0: r.x - 11 - w, x1: r.x - 9, y0: r.y - 9, y1: r.y + 7 } },
            { x: 0, y: -11, a: 'middle', c: { x0: r.x - w / 2, x1: r.x + w / 2, y0: r.y - 24, y1: r.y - 8 } },
            { x: 0, y: 20, a: 'middle', c: { x0: r.x - w / 2, x1: r.x + w / 2, y0: r.y + 8, y1: r.y + 24 } },
          ];
          if (der) [lados[0], lados[1]] = [lados[1], lados[0]];
          // Si no entra pegada al punto, prueba un poco más corrida en diagonal
          for (const dy of [-15, 15, -28, 28]) {
            lados.push({ dy, x: 11, y: 4 + dy, a: 'start', c: { x0: r.x + 9, x1: r.x + 11 + w, y0: r.y - 9 + dy, y1: r.y + 7 + dy } });
            lados.push({ dy, x: -11, y: 4 + dy, a: 'end', c: { x0: r.x - 11 - w, x1: r.x - 9, y0: r.y - 9 + dy, y1: r.y + 7 + dy } });
          }
          const ok = lados.find(l => l.c.x0 >= 4 && l.c.x1 <= 796 && !ocupado.some(o => choca(o, l.c)));
          if (ok) {
            ocupado.push(ok.c);
            const guia = ok.dy ? `<line class="m-guia-ref" x1="${ok.x > 0 ? 5 : -5}" y1="${ok.dy > 0 ? 4 : -4}" x2="${ok.x > 0 ? 9 : -9}" y2="${ok.dy}"/>` : '';
            txt = `${guia}<text x="${ok.x}" y="${ok.y}" text-anchor="${ok.a}">${esc(r.titulo)}</text>`;
          }
        }
        return `<g class="m-ref${lejos ? ' lejana' : ''}" transform="translate(${r.x.toFixed(1)} ${r.y.toFixed(1)})" style="--i:${r.i}" ${lejos ? 'opacity=".45"' : ''}>
          <title>${esc(r.titulo)} — ${esc(r.artista)} (${r.anio}) · popularidad ${Math.round(r.pop)}% · prestigio ${Math.round(r.pres)}%</title>
          ${refCirculo(r)}${txt}</g>`;
      }).join('');
      C.refs.classList.toggle('anim', animar && MOVIMIENTO);
      C.refs.innerHTML = html;
    } else C.refs.innerHTML = '';

    if (antes && tu) {
      const ax = px(antes.pop), ay = py(antes.pres);
      C.antes.innerHTML = `<circle class="m-antes" cx="${ax}" cy="${ay}" r="7"/>
        <text class="m-cuadrante" x="${ax}" y="${ay + 24}" text-anchor="middle">antes</text>
        ${Math.hypot(tx - ax, ty - ay) > 12 ? `<line class="m-flecha" x1="${ax}" y1="${ay}" x2="${tx}" y2="${ty}"/>` : ''}`;
    } else C.antes.innerHTML = '';

    if (tu) {
      let g = $('.m-tu-g', C.tu);
      const nuevo = !g;
      if (nuevo) {
        C.tu.innerHTML = `<g class="m-tu-g"><circle class="m-tu-onda" r="9"/><circle class="m-tu-halo" r="17"/><circle class="m-tu" r="8"/><text class="m-tu-texto" text-anchor="middle"></text></g>`;
        g = $('.m-tu-g', C.tu);
      }
      const t = $('.m-tu-texto', g);
      t.setAttribute('y', ty_txt);
      t.textContent = antes ? 'AHORA' : 'TU CANCIÓN';
      if (nuevo || animar) g.style.transition = 'none';
      g.style.transform = `translate(${tx}px, ${ty}px)`;
      if (animar && MOVIMIENTO) { g.classList.remove('cae'); reflow(g); g.classList.add('cae'); }
      if (nuevo || animar) { reflow(g); g.style.transition = ''; }
    } else C.tu.innerHTML = '';
  }

  /* ================= Inicio: cargar canción ================= */

  PINTAR.inicio = () => {
    $('#saludo').textContent = S.usuario ? `, ${S.usuario.nombre.split(' ')[0]}` : '';
    mapa($('#mapa-inicio'), { animar: true });
    // Precarga Essentia en segundo plano, así el análisis arranca sin esperar la descarga
    setTimeout(() => window.AnalisisEssentia?.preparar().catch(() => {}), 1200);
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
    correrAnalisis(file.name, () => medirAudio(file), { archivo: true });
  }

  function alertaInicio(msg) {
    let el = $('#alerta-inicio');
    if (!el) { el = document.createElement('p'); el.id = 'alerta-inicio'; el.className = 'aviso'; zonaCarga.after(el); }
    el.textContent = msg;
  }

  const esperar = ms => new Promise(r => setTimeout(r, ms));

  /* ----- Pantalla de carga ----- */

  // Barras de la onda: alturas al azar pero fijas, para que parezca un espectro
  $('.cargando-onda').innerHTML = Array.from({ length: 46 }, (_, k) =>
    `<i style="--k:${k};--alto:${(0.35 + 0.65 * Math.abs(Math.sin(k * 1.7) * Math.cos(k * 0.45))).toFixed(2)}"></i>`).join('');

  function progreso(hasta, ms) {
    const b = $('#progreso-barra');
    b.style.transitionDuration = ms + 'ms';
    b.style.transform = `scaleX(${hasta / 100})`;
  }

  // Texto vivo de cada paso mientras está en curso. Devuelve una función para cortarlo.
  function ticker(paso, i, archivo = false) {
    const det = $('.paso-detalle', paso);
    det.dataset.original ??= det.textContent;
    if (!MOVIMIENTO) return () => {};
    let id;
    if (i === 0) {
      const palabras = archivo ? ['tempo', 'tonalidad', 'volumen', 'bailabilidad', 'energía', 'duración'] : ['energía', 'volumen', 'tempo', 'duración', 'acústica', 'bailabilidad', 'brillo'];
      const pre = archivo ? 'Essentia.js mide' : 'midiendo';
      let n = 0;
      const tic = () => { det.innerHTML = `${pre} <em>${palabras[n++ % palabras.length]}</em>…`; };
      tic(); id = setInterval(tic, archivo ? 260 : 150);
    } else if (i === 1) {
      const t0 = performance.now(), total = 53577;
      const tic = () => {
        const v = Math.round(total * suave(clamp((performance.now() - t0) / 650, 0, 1)));
        det.innerHTML = `comparando contra <em>${v.toLocaleString('es-AR')}</em> canciones`;
      };
      tic(); id = setInterval(tic, 40);
    } else {
      const frase = det.dataset.original;
      let n = 0;
      const tic = () => { det.textContent = frase.slice(0, ++n) + (n < frase.length ? '▍' : ''); if (n >= frase.length) clearInterval(id); };
      det.textContent = ''; id = setInterval(tic, 28);
    }
    return () => clearInterval(id);
  }

  const seg = ms => `${coma(ms / 1000, 1)} s`;

  async function correrAnalisis(nombre, obtener, { archivo = false } = {}) {
    $('#alerta-inicio')?.remove();
    const capa = $('#cargando'), pasos = $$('.paso', capa);
    $('#cargando-nombre').textContent = nombre;
    pasos.forEach(p => {
      p.classList.remove('actual', 'hecho');
      $('.paso-tiempo', p).textContent = '';
      const det = $('.paso-detalle', p); if (det.dataset.original) det.textContent = det.dataset.original;
    });
    capa.classList.remove('fase-ambar', 'listo', 'saliendo');
    $('.cargando-cabeza .rotulo-seccion', capa).textContent = 'Analizando';
    progreso(0, 0);
    capa.hidden = false;
    reflow(capa);

    let parar = () => {};
    const iniciar = (i, hasta, ms) => { pasos[i].classList.add('actual'); progreso(hasta, ms); parar = ticker(pasos[i], i, archivo); return performance.now(); };
    const terminar = (i, t, detalle) => {
      parar();
      const det = $('.paso-detalle', pasos[i]);
      det.innerHTML = detalle ?? det.dataset.original;
      pasos[i].classList.replace('actual', 'hecho');
      $('.paso-tiempo', pasos[i]).textContent = seg(performance.now() - t);
    };

    try {
      let t = iniciar(0, 36, archivo ? 7000 : 900);
      const [{ rasgos, fuentes, essentia = null, aviso = null }] = await Promise.all([obtener(), esperar(900)]);
      terminar(0, t, essentia
        ? `Essentia.js · ${mmss(rasgos.duration_ms)} · ${Math.round(essentia.bpm)} BPM · ${tonalidad(essentia)} · ${coma(essentia.lufs, 1)} LUFS`
        : archivo ? `medición básica · ${mmss(rasgos.duration_ms)} · ${Math.round(rasgos.tempo)} BPM` : `${mmss(rasgos.duration_ms)} · ${Math.round(rasgos.tempo)} BPM · ${coma(rasgos.loudness, 1)} dB`);

      t = iniciar(1, 72, 700);
      await esperar(700);
      terminar(1, t);

      capa.classList.add('fase-ambar');
      t = iniciar(2, 100, 750);
      await esperar(750);
      terminar(2, t);

      capa.classList.add('listo');
      $('.cargando-cabeza .rotulo-seccion', capa).textContent = 'Listo';
      await esperar(420);
      S.analisis = { nombre, rasgos, fuentes, essentia, aviso, archivo };
      S.sim = { ...rasgos };
      S.chat = []; S.ultimoRasgo = null;
      capa.classList.add('saliendo');
      location.hash = 'resultado';
      await esperar(300);
    } catch (err) {
      console.error(err);
      alertaInicio('No pudimos leer ese audio. Probá con otro formato (wav o mp3 suelen andar siempre).');
    } finally {
      parar();
      capa.hidden = true;
      capa.classList.remove('saliendo');
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

    // Paso 1 de Essentia: tempo, modo, volumen y bailabilidad medidos de verdad.
    // Si Essentia no carga (sin internet), quedan los valores de arriba.
    let essentia = null, aviso = null;
    try {
      if (!window.AnalisisEssentia) throw new Error('falta analisis_essentia.js');
      essentia = await window.AnalisisEssentia.analizar(audio);
      if (Number.isFinite(essentia.bpm) && essentia.bpm > 0) { rasgos.tempo = essentia.bpm; fuentes.tempo = 'essentia'; }
      if (essentia.escala === 'major' || essentia.escala === 'minor') { rasgos.mode = essentia.escala === 'major' ? 1 : 0; fuentes.mode = 'essentia'; }
      if (Number.isFinite(essentia.lufs)) { rasgos.loudness = clamp(essentia.lufs, -30, -1); fuentes.loudness = 'essentia'; }
      if (Number.isFinite(essentia.danceabilityDFA)) { rasgos.danceability = bailabilidadSpotify(essentia.danceabilityDFA); fuentes.danceability = 'essentia'; }
    } catch (err) {
      console.warn('[P&P] Essentia no disponible, se usa la medición básica:', err);
      aviso = 'No se pudo cargar Essentia.js (hace falta internet la primera vez). Se usó la medición básica del navegador.';
    }
    return { rasgos, fuentes, essentia, aviso };
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

  /* ================= Resultado ================= */

  // retraso en ms: si viene, el número cuenta desde 0 y la barra crece
  function tarjetaEje(el, titulo, e, color, retraso = null) {
    const animar = retraso != null && MOVIMIENTO;
    el.innerHTML = `
      <div class="puntaje-rotulo">${titulo}</div>
      <div class="puntaje-numero"><span class="num">${Math.round(e.v)}</span>%</div>
      <div class="puntaje-margen">con un margen entre ${Math.round(e.lo)}% y ${Math.round(e.hi)}%</div>
      <div class="barra-margen eje-${color}${animar ? ' anim' : ''}" style="--retraso:${(retraso || 0) / 1000}s">
        <div class="rango" style="left:${e.lo}%;width:${e.hi - e.lo}%"></div>
        <div class="marca-valor" style="left:calc(${e.v}% - 1px)"></div>
      </div>
      <div class="escala"><span>0</span><span>50</span><span>100</span></div>`;
    if (animar) contar($('.num', el), 0, e.v, 1000, retraso);
  }

  PINTAR.resultado = () => {
    const r = S.analisis.rasgos, p = puntajes(r), z = zona(p), c = conflicto(r);
    tarjetaEje($('#tarjeta-pres'), 'Prestigio', p.pres, 'azul', 150);
    tarjetaEje($('#tarjeta-pop'), 'Popularidad', p.pop, 'ambar', 300);
    const foco = c ? ` El conflicto está en ${la(c.k).replace(/^(el|la) /, '$1 <strong>')}</strong>.` : '';
    $('#zona-cayo').innerHTML = `<div class="cayo-rotulo">Tu canción cayó en</div><div class="cayo-zona">${z.nombre}</div><p class="chico">${z.txt}${foco}</p>`;
    const u = S.usuario;
    $('#nota-genero').innerHTML = u
      ? `<strong>Te comparamos contra toda la música.</strong><p>La lectura dentro de ${esc(u.genero.toLowerCase())} llega cuando sumemos el género al dataset: hoy el dump no lo trae.</p>`
      : '';
    mapa($('#mapa-resultado'), { tu: { pop: p.pop.v, pres: p.pres.v }, etiquetas: 'cercanas', animar: true });
  };

  /* ================= Ficha: valores medidos ================= */

  const FUENTES = {
    essentia: { txt: 'Essentia.js', clase: 'f-essentia' },
    medido: { txt: 'medido en el navegador', clase: 'f-medido' },
    estimado: { txt: 'estimado (provisorio)', clase: 'f-estimado' },
    promedio: { txt: 'promedio del corpus', clase: 'f-promedio' },
    dataset: { txt: 'dataset (Spotify)', clase: 'f-dataset' },
  };

  function datosFicha() {
    const a = S.analisis, p = puntajes(a.rasgos);
    const r = Object.fromEntries(R.map(k => [k, k === 'duration_ms' ? Math.round(a.rasgos[k] * 60000) : +a.rasgos[k].toFixed(4)]));
    return {
      cancion: a.nombre,
      origen: a.archivo ? 'archivo de audio' : 'dataset',
      rasgos: r,                       // misma escala que el dataset (duration_ms en milisegundos)
      fuentes: a.fuentes,
      essentia: a.essentia ? {
        version: a.essentia.version,
        bpm: +a.essentia.bpm.toFixed(2),
        tonalidad: `${a.essentia.tonica} ${a.essentia.escala}`,
        fuerza_tonalidad: +a.essentia.fuerzaTono.toFixed(3),
        loudness_lufs: +a.essentia.lufs.toFixed(2),
        rango_loudness_lu: +a.essentia.rangoLoudness.toFixed(2),
        danceability_dfa: +a.essentia.danceabilityDFA.toFixed(3),
        extracto_ritmo_seg: Math.round(a.essentia.extractoSeg),
        ms_analisis: a.essentia.ms,
      } : null,
      puntajes: { prestigio: +p.pres.v.toFixed(1), popularidad: +p.pop.v.toFixed(1) },
    };
  }

  function abrirFicha() {
    const a = S.analisis, d = $('#ficha');
    $('#ficha-titulo').textContent = a.nombre;
    const av = $('#ficha-aviso'); av.hidden = !a.aviso; av.textContent = a.aviso || '';
    const orden = ['tempo', 'mode', 'loudness', 'danceability', 'duration_ms', 'energy', 'acousticness', 'valence', 'speechiness', 'instrumentalness'];
    $('#ficha-filas').innerHTML = orden.map((k, i) => {
      const f = FUENTES[a.fuentes[k]] || { txt: a.fuentes[k], clase: '' };
      let valor = valorLargo(k, a.rasgos[k]);
      if (a.fuentes[k] === 'essentia' && k === 'mode') valor = `${tonalidad(a.essentia)}`;
      if (a.fuentes[k] === 'essentia' && k === 'tempo') valor = `${coma(a.essentia.bpm, 1)} BPM`;
      if (a.fuentes[k] === 'essentia' && k === 'loudness') valor = `${coma(a.essentia.lufs, 1)} LUFS`;
      return `<tr style="--i:${i}"><td>${INFO[k].nombre}</td><td class="mono">${valor}</td><td><span class="etiqueta-fuente ${f.clase}">${f.txt}</span></td></tr>`;
    }).join('');
    const e = a.essentia;
    $('#ficha-essentia').innerHTML = e
      ? `<div class="firma-modelo"><i></i>Essentia.js ${esc(e.version)} · análisis en ${coma(e.ms / 1000, 1)} s</div>
         <p>Tonalidad <strong>${tonalidad(e)}</strong> (confianza ${coma(e.fuerzaTono, 2)}) · rango dinámico ${coma(e.rangoLoudness, 1)} LU ·
         bailabilidad cruda ${coma(e.danceabilityDFA, 2)} → <strong>${coma(a.rasgos.danceability, 2)}</strong> en la escala del modelo.</p>
         <p class="tenue">El tempo y la bailabilidad se miden sobre ${Math.round(e.extractoSeg)} s del centro del tema. La conversión de bailabilidad y volumen a la escala de Spotify es provisoria hasta la calibración (paso 2).</p>`
      : a.archivo ? '' : '<p class="tenue">Canción del dataset: los valores vienen de Spotify, no de un análisis de audio.</p>';
    $('#ficha-estado').textContent = '';
    d.showModal();
  }

  $('#ver-ficha').addEventListener('click', abrirFicha);
  $('#ficha').addEventListener('click', e => { if (e.target === e.currentTarget || e.target.closest('[data-cerrar]')) $('#ficha').close(); });
  $('#ficha-copiar').addEventListener('click', async () => {
    const txt = JSON.stringify(datosFicha(), null, 2);
    let ok = false;
    try { await navigator.clipboard.writeText(txt); ok = true; } catch {
      const ta = document.createElement('textarea'); ta.value = txt; $('#ficha').append(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch { /* nada */ } ta.remove();
    }
    $('#ficha-estado').textContent = ok ? 'Copiado ✓' : 'No se pudo copiar: usá "Descargar"';
  });
  $('#ficha-descargar').addEventListener('click', () => {
    const datos = datosFicha();
    const url = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: `pyp_${sinTildes(datos.cancion).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 60) || 'cancion'}.json` });
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#ficha-estado').textContent = 'Descargado ✓';
  });

  /* ================= Qué suma y qué resta ================= */

  function moverPill() {
    const b = $('.selector button.activo'), pill = $('.selector-pill');
    if (!b || !b.offsetWidth) return;
    pill.style.left = b.offsetLeft + 'px';
    pill.style.width = b.offsetWidth + 'px';
  }

  $$('.selector button').forEach(b => b.addEventListener('click', () => {
    if (S.ejeDesglose === b.dataset.eje) return;
    S.ejeDesglose = b.dataset.eje;
    $$('.selector button').forEach(x => x.classList.toggle('activo', x === b));
    moverPill();
    PINTAR.desglose();
  }));

  PINTAR.desglose = () => {
    const a = S.analisis, r = a.rasgos, nom = S.ejeDesglose;
    const e = eje(nom, r);
    moverPill();
    const valor = $('#desglose-valor');
    const previo = valor._v ?? 0;
    valor.innerHTML = `<b><span class="num">${Math.round(e.v)}</span>%</b>entre ${Math.round(e.lo)}% y ${Math.round(e.hi)}%`;
    contar($('.num', valor), previo, e.v, 700);
    valor._v = e.v;
    const lista = aportes(nom, r).sort((x, y) => Math.abs(y.pts) - Math.abs(x.pts));
    const maximo = Math.max(10, ...lista.map(x => Math.abs(x.pts)));
    const filas = $('#desglose-filas');
    filas.classList.remove('anim'); reflow(filas); if (MOVIMIENTO) filas.classList.add('anim');
    filas.innerHTML = lista.map(({ k, pts }, idx) => {
      const signo = Math.round(pts) > 0 ? 'suma' : Math.round(pts) < 0 ? 'resta' : 'cero';
      const ancho = Math.abs(pts) / maximo * 48;
      const fuente = a.fuentes[k] !== 'dataset' && a.fuentes[k] !== 'medido' ? `<span class="fuente ${a.fuentes[k]}">${a.fuentes[k] === 'essentia' ? 'Essentia' : a.fuentes[k]}</span>` : '';
      return `<div class="fila-rasgo" style="--i:${idx}">
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

  function actualizarSim(animar = false) {
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
    const caja = $('#sim-tension');
    if (caja.innerHTML !== t) {
      // Destello suave solo cuando cambia el tipo de lectura (no en cada pixel del slider)
      const titular = t.match(/<strong>(.*?)<\/strong>/)?.[1];
      if (titular !== caja._titular && caja._titular != null && MOVIMIENTO) { caja.classList.remove('cambia'); reflow(caja); caja.classList.add('cambia'); }
      caja._titular = titular;
      caja.innerHTML = t;
    }
    mapa($('#mapa-sim'), { tu: { pop: b.pop.v, pres: b.pres.v }, antes: { pop: a.pop.v, pres: a.pres.v }, etiquetas: 'cercanas', animar });
  }

  function titularCambio(dp, dq) {
    const a = Math.round(dp), b = Math.round(dq);
    if (!a && !b) return 'Casi no se mueve nada';
    if (!a) return b > 0 ? 'Sube solo la popularidad' : 'Baja solo la popularidad';
    if (!b) return a > 0 ? 'Sube solo el prestigio' : 'Baja solo el prestigio';
    return a > 0 ? 'Los dos suben' : 'Los dos bajan';
  }

  // La tarjeta se arma una vez y después solo se actualiza: así el número se
  // desliza y la barra se mueve con transición mientras arrastrás el control.
  function cifraSim(el, titulo, a, b, color) {
    const clase = color === 'azul' ? 't-azul' : 't-ambar';
    if (!el._vivo) {
      el.innerHTML = `<div class="puntaje-rotulo">${titulo}</div>
        <div class="sim-cifras"><s></s><span class="flecha ${clase}"></span><b><span class="num">0</span>%</b></div>
        <div class="puntaje-margen"></div>
        <div class="barra-margen eje-${color}"><div class="rango" style="left:50%;width:0"></div><div class="marca-antes"></div><div class="marca-valor" style="left:0"></div></div>
        <div class="escala"><span>0</span><span>50</span><span>100</span></div>
        <div class="sim-delta ${clase}"></div>`;
      el._vivo = true;
      reflow(el);
    }
    const d = Math.round(b.v - a.v);
    $('.sim-cifras s', el).textContent = d ? `${Math.round(a.v)}%` : '';
    const flecha = $('.flecha', el), f = d ? (d > 0 ? '→' : '←') : '';
    if (flecha.textContent !== f) flecha.textContent = f;
    $('.sim-cifras b', el).className = d ? clase : '';
    const num = $('.num', el);
    contar(num, num._shown ?? 0, b.v, el._primera ? 1000 : 260);
    el._primera = false;
    $('.puntaje-margen', el).textContent = `con un margen entre ${Math.round(b.lo)}% y ${Math.round(b.hi)}%`;
    Object.assign($('.rango', el).style, { left: b.lo + '%', width: (b.hi - b.lo) + '%' });
    $('.marca-antes', el).style.left = a.v + '%';
    $('.marca-valor', el).style.left = `calc(${b.v}% - 1px)`;
    const delta = $('.sim-delta', el);
    delta.textContent = d ? `${d > 0 ? '↑' : '↓'} ${Math.abs(d)} puntos` : '';
  }

  $('#restablecer').addEventListener('click', () => { S.sim = { ...S.analisis.rasgos }; pintarControles(); actualizarSim(); });

  PINTAR.simulador = () => {
    ['#sim-pres', '#sim-pop'].forEach(s => { const el = $(s); el._primera = true; const n = $('.num', el); if (n) n._shown = 0; });
    $('#sim-tension')._titular = null;
    pintarControles();
    actualizarSim(true);
  };

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
    bajarChat();
  }

  // Scroll dentro de la lista de mensajes (no de la página)
  const bajarChat = () => { const m = $('#mensajes'); requestAnimationFrame(() => m.scrollTo({ top: m.scrollHeight, behavior: MOVIMIENTO ? 'smooth' : 'auto' })); };

  let respondiendo = false;
  async function preguntar(texto) {
    texto = texto.trim();
    if (!texto || respondiendo) return;
    respondiendo = true;
    agregarMensaje({ quien: 'yo', txt: texto });
    $('#pregunta').value = '';
    const r = responder(texto);
    const tipeo = document.createElement('div');
    tipeo.className = 'msj ia escribiendo';
    tipeo.innerHTML = (r.modelo ? '<div class="consultando"><i class="giro"></i>consultando el modelo</div>' : '') + '<span class="puntos"><span></span><span></span><span></span></span>';
    $('#mensajes').append(tipeo);
    $('.chat').classList.add('pensando');
    bajarChat();
    await esperar(r.modelo ? 1000 : 600);
    tipeo.remove();
    $('.chat').classList.remove('pensando');
    agregarMensaje({ quien: 'ia', ...r });
    respondiendo = false;
  }

  $('#form-chat').addEventListener('submit', e => { e.preventDefault(); preguntar($('#pregunta').value); });

  PINTAR.asistente = () => {
    contexto();
    const cont = $('#mensajes');
    cont.innerHTML = '';
    const previos = S.chat; S.chat = [];
    if (!previos.length) agregarMensaje({ quien: 'ia', txt: saludoIA() });
    else previos.forEach(agregarMensaje);
    $('#sugerencias').innerHTML = sugerencias().map((s, i) => `<button type="button" style="--i:${i}">${esc(s)}</button>`).join('');
    $$('#sugerencias button').forEach(b => b.addEventListener('click', () => preguntar(b.textContent)));
  };

  /* ================= Arranque ================= */
  render();
})();
