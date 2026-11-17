/* =========================================================
   P&P — The Engineer (lado del navegador)

   El asistente de IA. Su cerebro (el texto de sistema) vive en el
   servidor, en api/asistente.js. Acá solo se arma lo que se le manda:
   los números de la canción (nunca el título ni el artista) y la
   conversación. Si la IA no responde (sin clave, sin conexión, límite),
   contestan unas reglas simples con el mismo modelo del navegador.
   ========================================================= */
(function () {
  'use strict';
  const PP = window.PP;
  const { M, R, INFO, la, La, lo_, valorCorto, valorLargo, aportes, conflicto, zona, clamp } = PP;
  const S = PP.estado;

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sinTildes = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const MOVIMIENTO = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ENGINEER = { url: '/api/asistente', espera: 40000 };

  /* ---------- Los números de la canción, en el formato del servidor ---------- */

  function analisisParaIA(recalculo) {
    const a = S.analisis;
    if (!a) return null;
    const p = PP.puntajesDe(a), o = a.rasgos, c = conflicto(o);
    const top = eje => aportes(eje, o).sort((x, y) => Math.abs(y.pts) - Math.abs(x.pts)).slice(0, 4)
      .map(x => ({ nombre: INFO[x.k].nombre, valor: valorCorto(x.k, o[x.k]), pts: x.pts }));
    return {
      pres: p.pres, pop: p.pop, zona: zona(p).nombre, busca: null,
      rasgos: R.map(k => ({ nombre: INFO[k].nombre, valor: valorCorto(k, o[k]) })),
      aportesPres: top('prestigio'), aportesPop: top('popularidad'),
      conflicto: c ? { nombre: INFO[c.k].nombre, valor: valorCorto(c.k, o[c.k]), ap: c.ap, aq: c.aq } : null,
      recalculo: recalculo || null,
    };
  }

  /* ---------- Reglas de respaldo (si la IA no está) ---------- */

  const ALIAS = {
    energy: ['energia', 'energetic'], valence: ['valencia', 'alegr', 'triste', 'animo'],
    acousticness: ['acustic'], duration_ms: ['duracion', 'largo', 'corta', 'minutos'],
    danceability: ['bailabilidad', 'bailable', 'bailar'], loudness: ['volumen', 'fuerte', 'decibel'],
    speechiness: ['habla', 'rap'], tempo: ['tempo', 'bpm', 'velocidad', 'ritmo'],
    mode: ['modo', 'mayor', 'menor'], instrumentalness: ['instrumental'],
  };
  const detectarRasgo = t => { for (const [k, al] of Object.entries(ALIAS)) if (al.some(x => t.includes(x))) return k; return null; };

  function responder(pregunta) {
    const t = sinTildes(pregunta), a = S.analisis, o = a.rasgos, base = PP.puntajes(o);
    const p = PP.puntajesDe(a);
    let k = detectarRasgo(t);
    const baja = /(bajo|bajar|baja|menos|reduzco|reducir|saco|acorto|acortar)/.test(t);
    const sube = !baja && /(subo|subir|sube|mas\s|aumento|aumentar|agrego|alargo|alargar)/.test(t);
    k = k || ((baja || sube) ? S.ultimoRasgo : null);

    if (k && (baja || sube || /(y si|a \d)/.test(t))) {
      const I = INFO[k];
      const num = t.match(/(?:a|en)\s*(-?\d+(?:[.,]\d+)?)/);
      let nuevo;
      if (k === 'mode') nuevo = o[k] >= 0.5 ? 0 : 1;
      else if (num) { nuevo = parseFloat(num[1].replace(',', '.')); if (k === 'duration_ms' && nuevo > 20) nuevo /= 60; }
      else nuevo = o[k] + (baja && !sube ? -I.delta : I.delta);
      nuevo = clamp(nuevo, I.min, I.max);
      S.ultimoRasgo = k;
      if (Math.abs(nuevo - o[k]) < I.paso / 2) return { txt: `${La(k)} ya está en ${valorCorto(k, o[k])}, el ${nuevo <= I.min ? 'mínimo' : 'máximo'} que maneja el simulador. Probá moviéndo${lo_(k)} para el otro lado.` };
      const n = PP.puntajes({ ...o, [k]: nuevo });
      const dp = n.pres.v - base.pres.v, dq = n.pop.v - base.pop.v;
      const lectura = Math.sign(Math.round(dp)) * Math.sign(Math.round(dq)) < 0 ? 'Es un intercambio: ganás en un puntaje lo que perdés en el otro.'
        : !Math.round(dp) && !Math.round(dq) ? `Casi no mueve ninguno de los dos: ${la(k)} pesa poco en el modelo.`
        : Math.round(dp) >= 0 && Math.round(dq) >= 0 ? 'Acá no hay conflicto: ninguno de los dos baja.' : 'Te baja en los dos puntajes.';
      return {
        modelo: true, cambio: { k, v: nuevo },
        txt: `Si ${k === 'mode' ? 'cambiás' : nuevo < o[k] ? 'bajás' : 'subís'} ${la(k)} de ${valorCorto(k, o[k])} a ${valorCorto(k, nuevo)}, tu prestigio pasa de ${Math.round(base.pres.v)} a ${Math.round(n.pres.v)} y tu popularidad de ${Math.round(base.pop.v)} a ${Math.round(n.pop.v)}. ${lectura}`,
      };
    }
    if (/(letra|cancion sobre|idea|escribir|escribi)/.test(t)) return { txt: 'Para escribir ideas o letras necesito la IA, y ahora no está disponible. Probá de nuevo en un momento. Mientras tanto puedo recalcular tus puntajes si me decís qué cambiarías: "¿y si bajo la energía a 0,6?".' };
    if (/(explica|resultado|significa|que hago|como subo|como mejoro)/.test(t) || !k) {
      const z = zona(p);
      const top = aportes('prestigio', o).concat(aportes('popularidad', o).map(x => ({ ...x, de: 'popularidad' })))
        .filter(x => Math.abs(x.pts) >= 1 && !(x.k === 'instrumentalness' && o[x.k] < 0.1))
        .sort((x, y) => Math.abs(y.pts) - Math.abs(x.pts)).slice(0, 2);
      return { txt: `Estás en zona de ${z.nombre.toLowerCase()}: prestigio ${Math.round(p.pres.v)} y popularidad ${Math.round(p.pop.v)}. ${top.length ? 'Lo que más pesa: ' + top.map(x => `${la(x.k)} (${valorCorto(x.k, o[x.k])}) ${x.pts > 0 ? 'suma' : 'resta'} ${Math.abs(Math.round(x.pts))} puntos de ${x.de || 'prestigio'}`).join(' y ') + '.' : ''} Podés preguntarme "¿y si bajo la energía?" y lo recalculo con el modelo.` };
    }
    return { txt: 'No te entendí del todo. Probá con "¿y si bajo la energía a 0,6?" o "explicame mi resultado".' };
  }

  /* ---------- Mensajes y conversación ---------- */

  let chat = [], chatDe = null, motivoIA = '', respondiendo = false;
  const aTexto = html => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent.trim(); };

  function agregarMensaje(m, guardar = true) {
    if (guardar) chat.push(m);
    const el = document.createElement('div');
    el.className = 'msj ' + m.quien;
    el.innerHTML = m.quien === 'ia'
      ? `<div${m.plano ? ' class="msj-plano"' : ''}>${m.plano ? esc(m.txt) : m.txt}</div>${m.cambio ? '<button type="button" class="boton boton-borde boton-chico">Probarlo en el simulador</button>' : ''}`
      : esc(m.txt);
    const b = el.querySelector('button');
    if (b) b.addEventListener('click', () => { S.sim = { ...S.analisis.rasgos, [m.cambio.k]: m.cambio.v }; location.hash = '#simulador'; });
    $('#mensajes').append(el);
    bajar();
  }
  const bajar = () => { const m = $('#mensajes'); requestAnimationFrame(() => m.scrollTo({ top: m.scrollHeight, behavior: MOVIMIENTO ? 'smooth' : 'auto' })); };

  function historialIA() {
    const h = [];
    chat.forEach(m => {
      const role = m.quien === 'yo' ? 'user' : 'assistant';
      const content = m.quien === 'yo' || m.plano ? m.txt : aTexto(m.txt);
      if (!content) return;
      if (h.length && h[h.length - 1].role === role) h[h.length - 1].content += '\n\n' + content;
      else h.push({ role, content });
    });
    const r = h.slice(-12);
    while (r.length && r[0].role !== 'user') r.shift();
    return r;
  }

  function recalculoTexto(r) {
    const k = r.cambio.k, o = S.analisis.rasgos, b = PP.puntajes(o), n = PP.puntajes({ ...o, [k]: r.cambio.v });
    return `${INFO[k].nombre} de ${valorCorto(k, o[k])} a ${valorCorto(k, r.cambio.v)}: prestigio ${Math.round(b.pres.v)} → ${Math.round(n.pres.v)}, popularidad ${Math.round(b.pop.v)} → ${Math.round(n.pop.v)}.`;
  }

  async function pedirAlEngineer(cuerpo) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ENGINEER.espera);
    try {
      const r = await fetch(ENGINEER.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal, body: cuerpo });
      if (!r.ok) return { motivo: `http_${r.status}` };
      const d = await r.json();
      if (d && d.disponible && d.texto) return { texto: d.texto };
      return { motivo: (d && d.motivo) || 'sin_texto' };
    } catch (e) { return { motivo: e && e.name === 'AbortError' ? 'tiempo_agotado' : 'red' }; }
    finally { clearTimeout(t); }
  }

  async function preguntarAlEngineer(recalculo) {
    if (location.protocol === 'file:') { motivoIA = 'archivo_local'; return null; }
    const cuerpo = JSON.stringify({ mensajes: historialIA(), analisis: analisisParaIA(recalculo) });
    let r = await pedirAlEngineer(cuerpo);
    if (!r.texto && /^(api_(429|5\d\d)|error|red|http_5\d\d)$/.test(r.motivo)) r = await pedirAlEngineer(cuerpo);
    motivoIA = r.texto ? '' : r.motivo;
    if (!r.texto) console.warn('[The Engineer] sin respuesta de la IA:', r.motivo);
    return r.texto || null;
  }

  const fijarEstado = ia => {
    const e = $('#chat-estado');
    if (e) e.textContent = ia ? 'ya conoce tu análisis · IA conectada' : `ya conoce tu análisis · sin conexión con la IA${motivoIA ? ' (' + motivoIA + ')' : ''}: respuestas simples`;
  };
  const ajustarCampo = () => { const c = $('#pregunta'); c.style.height = 'auto'; c.style.height = Math.min(c.scrollHeight, 160) + 'px'; };

  async function preguntar(texto) {
    texto = texto.trim();
    if (!texto || respondiendo || !S.analisis) return;
    respondiendo = true;
    agregarMensaje({ quien: 'yo', txt: texto });
    $('#pregunta').value = ''; ajustarCampo();
    const r = responder(texto);
    const tipeo = document.createElement('div');
    tipeo.className = 'msj ia escribiendo';
    tipeo.innerHTML = (r.modelo ? '<div class="consultando"><i class="giro"></i>consultando el modelo</div>' : '') + '<span class="puntos"><span></span><span></span><span></span></span>';
    $('#mensajes').append(tipeo);
    $('.chat').classList.add('pensando');
    bajar();
    const t0 = Date.now();
    const ia = await preguntarAlEngineer(r.modelo ? recalculoTexto(r) : null);
    if (!ia) await esperar(Math.max(0, (r.modelo ? 900 : 500) - (Date.now() - t0)));
    tipeo.remove();
    $('.chat').classList.remove('pensando');
    fijarEstado(!!ia);
    if (ia) agregarMensaje({ quien: 'ia', plano: true, txt: ia, cambio: r.modelo ? r.cambio : undefined });
    else agregarMensaje({ quien: 'ia', ...r });
    respondiendo = false;
  }

  /* ---------- Pantalla ---------- */

  function saludo() {
    const a = S.analisis, p = PP.puntajesDe(a), c = conflicto(a.rasgos), z = zona(p);
    const cerca = [...M.referencias].map(x => ({ ...x, d: Math.hypot(x.pop - p.pop.v, x.pres - p.pres.v) })).sort((x, y) => x.d - y.d).slice(0, 2);
    let t = `Soy <strong>The Engineer</strong>. Tu canción cayó en zona de <strong>${z.nombre.toLowerCase()}</strong>: prestigio ${Math.round(p.pres.v)} y popularidad ${Math.round(p.pop.v)}. `;
    if (c) t += `Lo que más tensiona los dos puntajes es <strong>${la(c.k)}</strong> (${valorLargo(c.k, a.rasgos[c.k])}). `;
    if (cerca.length) t += `Las canciones de referencia más cercanas en el mapa son ${cerca.map(x => `<strong>${esc(x.titulo)}</strong>`).join(' y ')}. `;
    t += c ? `¿Querés ver qué pasa si movés ${la(c.k)}? ` : '¿Qué querés saber? ';
    t += 'También podés contarme qué canción querés escribir o pegarme tu letra.';
    S.ultimoRasgo = c ? c.k : null;
    return t;
  }

  function sugerencias() {
    const c = conflicto(S.analisis.rasgos), k = c ? c.k : 'energy';
    const sube = c ? c.ap > 0 : false;
    return [`Si ${sube ? 'subo' : 'bajo'} ${la(k)}, ¿cuánto pierdo en el otro puntaje?`, 'Explicame mi resultado', '¿Cómo subo mi popularidad?', 'Quiero hacer una canción sobre una despedida', 'Quiero trabajar mi letra'];
  }

  function contexto() {
    const a = S.analisis, p = PP.puntajesDe(a), o = a.rasgos;
    const caja = (clase, nombre, e) => `<div class="ctx-puntaje ${clase}"><span>${nombre}</span><div><b>${Math.round(e.v)}</b><small>${Math.round(e.lo)}–${Math.round(e.hi)}</small></div></div>`;
    $('#ctx-puntajes').innerHTML = caja('azul', 'Prestigio', p.pres) + caja('ambar', 'Popularidad', p.pop);
    const pesos = [...aportes('prestigio', o).map(x => ({ ...x, de: 'prestigio' })), ...aportes('popularidad', o).map(x => ({ ...x, de: 'popularidad' }))]
      .filter(x => Math.abs(x.pts) >= 1 && !(x.k === 'instrumentalness' && o[x.k] < 0.1))
      .sort((x, y) => Math.abs(y.pts) - Math.abs(x.pts)).slice(0, 4);
    $('#ctx-pesos').innerHTML = pesos.map(x => `<li><span>${La(x.k)} <span class="tenue">· ${valorCorto(x.k, o[x.k])} · ${x.de}</span></span><b class="${x.pts > 0 ? 'suma' : 'resta'}">${x.pts > 0 ? '+' : '−'}${Math.abs(Math.round(x.pts))}</b></li>`).join('');
  }

  PP.PINTAR.asistente = () => {
    const a = S.analisis;
    $('#titulo-asistente').textContent = `${a.titulo} — ${a.artista}`;
    contexto();
    if (chatDe !== a) { chat = []; chatDe = a; S.ultimoRasgo = null; }
    const cont = $('#mensajes');
    cont.innerHTML = '';
    const previos = chat; chat = [];
    if (!previos.length) agregarMensaje({ quien: 'ia', txt: saludo() });
    else previos.forEach(m => agregarMensaje(m));
    $('#sugerencias').innerHTML = sugerencias().map(s => `<button type="button">${esc(s)}</button>`).join('');
    $$('#sugerencias button').forEach(b => b.addEventListener('click', () => preguntar(b.textContent)));
    fijarEstado(!motivoIA);
    if (matchMedia('(hover: hover)').matches) setTimeout(() => $('#pregunta').focus({ preventScroll: true }), 700);
  };

  $('#pregunta').addEventListener('input', ajustarCampo);
  $('#pregunta').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); $('#form-chat').requestSubmit(); }
  });
  $('#form-chat').addEventListener('submit', e => { e.preventDefault(); preguntar($('#pregunta').value); });
})();
