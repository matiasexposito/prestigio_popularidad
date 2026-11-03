/* =========================================================
   P&P — capa de vista
   Las cuentas viven en logica.js y el mapa en mapa.js, los dos
   tomados del prototipo de Diogenes. Este archivo solo decide
   que se muestra y como, siguiendo el diseno que armamos.
   ========================================================= */
(function () {
  'use strict';

  const PP = window.PP;
  const { M, R, INFO, SLIDERS, la, La,
          valorCorto, valorLargo, puntajes, aportes, conflicto, zona, mapa } = PP;

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const signo = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(Math.round(n));
  const MOVIMIENTO = !matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Chrome en Windows no tiene guionado en espanol, asi que el unico nombre
  // que no entra en una columna lleva su corte puesto a mano (guion blando).
  const CORTES = { instrumentalidad: 'instrumen­talidad' };
  const nombreRasgo = k => CORTES[INFO[k].nombre] || INFO[k].nombre;

  /* ================= Estado ================= */

  const S = {
    usuario: leer('pp_usuario'),
    analisis: null,     // { titulo, artista, rasgos, fuente }
    sim: null,          // rasgos modificados en el simulador
    eje: 'prestigio',   // cual se muestra en el desglose
  };

  function leer(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
  function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } }

  /* ================= Navegacion ================= */

  const CON_ANALISIS = ['resultado', 'desglose', 'simulador'];
  const PINTAR = {};

  function ruta() {
    const r = (location.hash || '#portada').slice(1);
    if (!$(`[data-ruta="${r}"]`)) return 'portada';
    if (CON_ANALISIS.includes(r) && !S.analisis) return S.usuario ? 'subir' : 'cuenta';
    if (r === 'subir' && !S.usuario) return 'cuenta';
    return r;
  }

  function render() {
    const r = ruta();
    if (location.hash.slice(1) !== r) { location.replace('#' + r); return; }
    $$('.pantalla').forEach(p => p.classList.toggle('activa', p.dataset.ruta === r));
    document.body.scrollTop = 0;
    if (PINTAR[r]) PINTAR[r]();
  }

  addEventListener('hashchange', render);

  /* ================= 1 · Splash: el polvo de canciones ================= */

  (function polvo() {
    const cont = $('#polvo');
    if (!cont) return;
    let semilla = 31;
    const azar = () => { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; };
    const paleta = ['#1b4fd8', '#1b4fd8', '#b45309', '#b45309', '#c9c6c0', '#c9c6c0', '#c9c6c0'];
    let html = '';
    for (let i = 0; i < 64; i++) {
      const x = azar(), y = azar();
      const dx = x - 0.5, dy = y - 0.5;
      if ((dx * dx) / 0.055 + (dy * dy) / 0.030 < 1) continue;   // el centro queda libre para el logo
      const c = paleta[Math.floor(azar() * paleta.length)];
      const grande = azar() > 0.82;
      const op = c === '#c9c6c0' ? 0.55 : (grande ? 0.5 : 0.32);
      html += `<i style="left:${(x * 100).toFixed(1)}%;top:${(y * 100).toFixed(1)}%;width:${grande ? 9 : 5}px;height:${grande ? 9 : 5}px;background:${c};opacity:${op}"></i>`;
    }
    cont.innerHTML = html;
  })();

  /* ================= 3 · Crear cuenta ================= */

  $('#form-cuenta').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    S.usuario = { nombre: f.nombre.value.trim() || 'vos', email: f.email.value.trim() };
    guardar('pp_usuario', S.usuario);
    location.hash = '#subir';
  });

  $('#entrar-directo').addEventListener('click', e => {
    if (S.usuario) return;                       // ya tiene cuenta: el enlace va solo
    e.preventDefault();
    S.usuario = { nombre: 'vos', email: '' };
    guardar('pp_usuario', S.usuario);
    location.hash = '#subir';
  });

  /* ================= 4 · Subir o buscar ================= */

  PINTAR.subir = () => {
    $('#saludo').textContent = S.usuario ? `Hola, ${S.usuario.nombre.split(' ')[0]}` : 'Hola';
  };

  // Las buscables vienen del modelo: [titulo, artista, anio, gano, nominada, ...rasgos]
  function desdeFila(f) {
    const rasgos = {};
    R.forEach((k, i) => { rasgos[k] = f[5 + i]; });
    return { titulo: f[0], artista: f[1], anio: f[2], gano: f[3], nominada: f[4], rasgos, fuente: 'dataset' };
  }

  const campoBuscar = $('#buscar'), listaRes = $('#resultados');

  campoBuscar.addEventListener('input', () => {
    const q = campoBuscar.value.trim().toLowerCase();
    if (q.length < 2) { listaRes.hidden = true; return; }
    const hits = M.buscables
      .filter(f => (f[0] + ' ' + f[1]).toLowerCase().includes(q))
      .slice(0, 6);
    if (!hits.length) {
      // Que el silencio no parezca un error: la herramienta arranca en el 2000.
      listaRes.innerHTML = `<li class="sin-resultados">No encontramos esa canción entre las ${M.buscables.length} que tenemos a mano. Son todas del 2000 en adelante.</li>`;
      listaRes.hidden = false;
      return;
    }
    listaRes.innerHTML = hits.map(f =>
      `<li data-i="${M.buscables.indexOf(f)}">${esc(f[0])} <span class="tenue">— ${esc(f[1])}</span></li>`).join('');
    listaRes.hidden = false;
  });

  listaRes.addEventListener('click', e => {
    const li = e.target.closest('li[data-i]');
    if (!li) return;
    analizar(desdeFila(M.buscables[+li.dataset.i]));
  });

  // Subida de archivo
  const zona_ = $('#zona-carga'), campoArchivo = $('#archivo');
  $('#btn-archivo').addEventListener('click', () => campoArchivo.click());
  zona_.addEventListener('click', () => campoArchivo.click());
  ['dragenter', 'dragover'].forEach(ev => zona_.addEventListener(ev, e => { e.preventDefault(); zona_.classList.add('encima'); }));
  ['dragleave', 'drop'].forEach(ev => zona_.addEventListener(ev, e => { e.preventDefault(); zona_.classList.remove('encima'); }));
  zona_.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) medirArchivo(f); });
  campoArchivo.addEventListener('change', () => { const f = campoArchivo.files[0]; if (f) medirArchivo(f); });

  async function medirArchivo(file) {
    const panel = $('#cargando'), texto = $('#cargando-texto');
    panel.hidden = false;
    texto.textContent = 'Decodificando el archivo…';
    try {
      // medirAudio corre Essentia y ReccoBeats en paralelo y devuelve
      // { rasgos, fuentes, essentia, reccobeats, aviso }
      texto.textContent = 'Midiendo tu canción. Esto puede tardar medio minuto…';
      const m = await PP.medirAudio(file);
      if (m.aviso) console.warn('[P&P]', m.aviso);
      analizar({
        titulo: file.name.replace(/\.[^.]+$/, ''),
        artista: 'tu archivo',
        rasgos: m.rasgos,
        fuentes: m.fuentes,
        tonalidad: m.essentia ? PP.tonalidad(m.essentia) : null,
        aviso: m.aviso,
        fuente: 'medido',
      });
    } catch (err) {
      console.warn('[P&P] no se pudo medir:', err);
      texto.textContent = 'No pudimos medir ese archivo. Probá con un mp3 o wav, o buscá una canción conocida.';
      setTimeout(() => { panel.hidden = true; }, 3200);
      return;
    }
    panel.hidden = true;
  }

  function analizar(a) {
    S.analisis = a;
    S.sim = null;
    location.hash = '#resultado';
  }

  /* ================= 5 · Resultado ================= */

  function tarjetaPuntaje(nombre, e) {
    return `<div class="tarjeta-puntaje">
      <div class="puntaje-cabeza"><b>${nombre}</b><span class="puntaje-margen">entre ${Math.round(e.lo)} y ${Math.round(e.hi)}</span></div>
      <div class="puntaje-cifra"><span>${Math.round(e.v)}</span><span>%</span></div>
      <div class="riel"><i style="width:${e.v}%"></i><u style="left:${e.lo}%;width:${Math.max(2, e.hi - e.lo)}%"></u></div>
    </div>`;
  }

  PINTAR.resultado = () => {
    const a = S.analisis, p = puntajes(a.rasgos), z = zona(p), c = conflicto(a.rasgos);
    $('#titulo-cancion').textContent = `${a.titulo} — ${a.artista}`;
    $('#nombre-cancion').textContent = a.titulo;
    $('#artista-cancion').textContent = a.fuente === 'medido'
      ? 'Medida con ReccoBeats y Essentia, en tu navegador'
      : `${a.artista} · ${a.anio}`;

    $('#tarjetas-puntaje').innerHTML =
      tarjetaPuntaje('Prestigio', p.pres) + tarjetaPuntaje('Popularidad', p.pop);

    const foco = c
      ? ` Lo que más te tensiona los dos ejes es <strong>${la(c.k)}</strong>: ${valorLargo(c.k, a.rasgos[c.k])}.`
      : '';
    $('#lectura').innerHTML = `Estás en zona de <strong>${z.nombre.toLowerCase()}</strong>. ${z.txt}${foco}`;

    mapa($('#mapa-resultado'), { tu: { pop: p.pop.v, pres: p.pres.v }, etiquetas: 'cercanas', animar: MOVIMIENTO });
  };

  /* ================= 6 · Desglose: la consola ================= */

  $$('.selector button').forEach(b => b.addEventListener('click', () => {
    S.eje = b.dataset.eje;
    $$('.selector button').forEach(x => x.classList.toggle('activo', x === b));
    PINTAR.desglose();
  }));

  PINTAR.desglose = () => {
    const a = S.analisis, r = a.rasgos, p = puntajes(r), c = conflicto(r);
    $('#titulo-desglose').textContent = `${a.titulo} — ${a.artista}`;
    $('#selector-valor').textContent = `${Math.round(p[S.eje === 'prestigio' ? 'pres' : 'pop'].v)}%`;

    const lista = aportes(S.eje, r)
      .filter(x => Math.abs(x.pts) >= 0.5)
      .sort((x, y) => y.pts - x.pts);
    const maximo = Math.max(...lista.map(x => Math.abs(x.pts)), 1);

    const cons = $('#consola');
    cons.classList.remove('anim'); void cons.getBoundingClientRect();
    if (MOVIMIENTO) cons.classList.add('anim');

    cons.innerHTML = lista.map(({ k, pts }, i) => {
      const cual = pts > 0 ? 'suma' : pts < 0 ? 'resta' : 'cero';
      const alto = Math.abs(pts) / maximo * 46;
      return `<div class="col-rasgo" style="--i:${i}">
        <div class="rasgo-cabeza">
          <div class="rasgo-nombre">${nombreRasgo(k)}</div>
          <div class="rasgo-valor">${valorCorto(k, r[k])}</div>
        </div>
        <div class="fader">
          <div class="fader-eje"></div>
          ${cual !== 'cero' ? `<div class="fader-relleno ${cual}" style="height:${alto}%"></div>` : ''}
        </div>
        <div class="efecto ${cual}">${signo(pts)}</div>
      </div>`;
    }).join('');

    if (c) {
      $('#conflicto-titulo').textContent = `${La(c.k)} tira para los dos lados`;
      $('#conflicto-texto').innerHTML = `En tu canción ${la(c.k)} es ${valorLargo(c.k, r[c.k])}. Eso es justo lo que te acerca a un mundo y lo que te aleja del otro.`;
      $('#conflicto-cifras').innerHTML =
        `<div class="cifra-conflicto"><span>Prestigio</span><b class="${c.ap > 0 ? 'efecto suma' : 'efecto resta'}">${signo(c.ap)}</b></div>
         <div class="cifra-conflicto"><span>Popularidad</span><b class="${c.aq > 0 ? 'efecto suma' : 'efecto resta'}">${signo(c.aq)}</b></div>`;
      $('#conflicto-lectura').textContent =
        'No hay una sola dirección que te mejore los dos puntajes. Es la decisión que tenés que tomar.';
    } else {
      $('#conflicto-titulo').textContent = 'No tenés un conflicto marcado';
      $('#conflicto-texto').textContent = 'Ningún rasgo te empuja fuerte hacia un mundo y te saca del otro. Podés mover varias cosas sin pagar un precio grande.';
      $('#conflicto-cifras').innerHTML = '';
      $('#conflicto-lectura').textContent = 'Probá en el simulador: vas a ver que los dos puntajes se mueven bastante juntos.';
    }
  };

  /* ================= 7 · Simulador ================= */

  function rasgosSim() { return S.sim || { ...S.analisis.rasgos }; }

  PINTAR.simulador = () => {
    const base = S.analisis.rasgos, act = rasgosSim();

    $('#controles').innerHTML = SLIDERS.map(k => {
      const I = INFO[k], v = act[k];
      const pct = (v - I.min) / (I.max - I.min) * 100;
      const movido = Math.abs(v - base[k]) > (I.paso || 0.01) / 2;
      return `<div class="control" data-k="${k}">
        <div class="control-cabeza">
          <b>${La(k)}</b>
          <span><span class="control-valor">${valorCorto(k, v)}</span><span class="control-delta">${movido ? 'cambiado' : 'original'}</span></span>
        </div>
        <input type="range" min="0" max="100" value="${pct}" aria-label="${La(k)}">
        <div class="control-escala"><span>${valorCorto(k, I.min)}</span><span>original: ${valorCorto(k, base[k])}</span><span>${valorCorto(k, I.max)}</span></div>
      </div>`;
    }).join('');

    $$('#controles input[type="range"]').forEach(inp => {
      inp.addEventListener('input', () => {
        const k = inp.closest('.control').dataset.k, I = INFO[k];
        const v = I.min + (I.max - I.min) * (+inp.value / 100);
        S.sim = { ...rasgosSim(), [k]: k === 'mode' ? Math.round(v) : v };
        pintarSim(false);
      });
    });

    pintarSim(true);
  };

  function pintarSim(primeraVez) {
    const base = S.analisis.rasgos, act = rasgosSim();
    const p0 = puntajes(base), p = puntajes(act);

    // Los valores y el "cambiado/original" de cada control
    $$('#controles .control').forEach(ctl => {
      const k = ctl.dataset.k, I = INFO[k];
      const movido = Math.abs(act[k] - base[k]) > (I.paso || 0.01) / 2;
      ctl.querySelector('.control-valor').textContent = valorCorto(k, act[k]);
      ctl.querySelector('.control-delta').textContent = movido ? 'cambiado' : 'original';
    });

    const dp = Math.round(p.pres.v) - Math.round(p0.pres.v);
    const dq = Math.round(p.pop.v) - Math.round(p0.pop.v);

    $('#sim-puntajes').innerHTML = [
      ['Prestigio', p.pres, p0.pres, dp],
      ['Popularidad', p.pop, p0.pop, dq],
    ].map(([n, e, e0, d]) => `<div class="tarjeta-puntaje">
      <div class="puntaje-cabeza"><b>${n}</b><span class="puntaje-margen ${d > 0 ? 'efecto suma' : d < 0 ? 'efecto resta' : ''}">${d === 0 ? 'sin cambios' : signo(d)}</span></div>
      <div class="puntaje-cifra"><span>${Math.round(e.v)}</span><span class="chico tenue">antes ${Math.round(e0.v)}</span></div>
      <div class="riel"><i style="width:${e.v}%"></i><u style="left:${e0.v}%;width:2px;border-color:var(--tenue-2)"></u></div>
    </div>`).join('');

    let lectura;
    if (!dp && !dq) lectura = 'Mové un control y mirá cómo se desplaza el punto en el mapa. Vas a ver que no hay una dirección que mejore los dos.';
    else if (dp > 0 && dq < 0) lectura = `Ahí está el conflicto: ganaste ${Math.abs(dp)} de prestigio y perdiste ${Math.abs(dq)} de popularidad.`;
    else if (dp < 0 && dq > 0) lectura = `Te fuiste hacia el chart: ganaste ${Math.abs(dq)} de popularidad a cambio de ${Math.abs(dp)} de prestigio.`;
    else if (dp >= 0 && dq >= 0) lectura = 'Acá no hay conflicto: ninguno de los dos baja. Es poco común.';
    else lectura = 'Este cambio te baja en los dos ejes, así que no parece buena idea.';
    $('#sim-lectura').textContent = lectura;

    mapa($('#mapa-simulador'), {
      tu: { pop: p.pop.v, pres: p.pres.v },
      antes: { pop: p0.pop.v, pres: p0.pres.v },
      etiquetas: 'cercanas',
      animar: primeraVez && MOVIMIENTO,
    });
  }

  $('#reiniciar').addEventListener('click', () => { S.sim = null; PINTAR.simulador(); });

  /* ================= Arranque ================= */
  render();
})();
