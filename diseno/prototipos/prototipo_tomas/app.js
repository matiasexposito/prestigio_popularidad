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

  /* (1 · La portada la dibuja galaxia.js) */

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
      // primero las que EMPIEZAN con lo que escribiste
      .sort((a, b) => b[0].toLowerCase().startsWith(q) - a[0].toLowerCase().startsWith(q))
      .slice(0, 5);
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

  // Cómo se calcula cada número, explicado en la misma tarjeta (pedido de los docentes, 10/11).
  // Todas las cifras salen del modelo (modelo.js), así cambian solas si se vuelve a entrenar.
  const miles = n => Number(n).toLocaleString('es-AR');
  function comoSeCalcula(nombre, e) {
    // Corto y a la vista: una palabra que resume el número y una frase que dice contra qué
    // se compara. "De cada 100" se entiende más rápido que un porcentaje de 23.279.
    const v = Math.round(e.v);
    const palabra = v >= 75 ? 'Muy parecida' : v >= 50 ? 'Parecida' : v >= 25 ? 'Poco parecida' : 'Muy poco parecida';
    const aQue = nombre === 'Prestigio' ? 'al sonido de las nominadas al Grammy' : 'al sonido de las que entran al Hot 100';
    return `<p class="que-significa"><b>${palabra}</b> ${aQue}. Le gana a ${v} de cada 100 canciones.</p>`;
  }

  // "Instrumentalidad +20" en una canción cantada no le dice nada a nadie: quiere decir
  // "tiene voz", que es obvio. No se muestra entre lo que más pesa, salvo que sea alta.
  const sinInteres = (k, r) => k === 'instrumentalness' && r[k] < 0.1;

  function tarjetaPuntaje(nombre, e) {
    return `<div class="tarjeta-puntaje ${nombre === 'Prestigio' ? 'tp-azul' : 'tp-ambar'}">
      <div class="puntaje-cabeza"><b>${nombre}</b><span class="puntaje-margen" title="Margen de error: tu número real está casi seguro entre estos dos">margen: ${Math.round(e.lo)} a ${Math.round(e.hi)}</span></div>
      <div class="puntaje-fila">
        <div class="puntaje-cifra"><span>${Math.round(e.v)}</span><span>%</span></div>
        ${comoSeCalcula(nombre, e)}
      </div>
      <div class="riel"><i style="width:${e.v}%"></i><u style="left:${e.lo}%;width:${Math.max(2, e.hi - e.lo)}%"></u></div>
    </div>`;
  }

  PINTAR.resultado = () => {
    const a = S.analisis, p = PP.puntajesDe(a), z = zona(p), c = conflicto(a.rasgos);
    $('#titulo-cancion').textContent = `${a.titulo} — ${a.artista}`;
    $('#nombre-cancion').textContent = a.titulo;
    $('#artista-cancion').textContent = a.fuente === 'medido'
      ? 'Medida desde tu archivo con ReccoBeats y Essentia. Por eso el margen es más ancho.'
      : `${a.artista} · ${a.anio}`;
    // Si la medición quedó incompleta, se dice en la pantalla (antes solo iba a la consola)
    const aviso = $('#aviso-medicion');
    aviso.textContent = a.aviso || '';
    aviso.hidden = !a.aviso;

    $('#tarjetas-puntaje').innerHTML =
      tarjetaPuntaje('Prestigio', p.pres) + tarjetaPuntaje('Popularidad', p.pop);

    $('#lectura').innerHTML = `Estás en zona de <strong>${z.nombre.toLowerCase()}</strong>. ${z.txt}`;

    // Debajo de la lectura: los tres rasgos que más pesan, con el color de su puntaje
    const pesos = [...aportes('prestigio', a.rasgos).map(x => ({ ...x, eje: 'azul', de: 'prestigio' })),
                   ...aportes('popularidad', a.rasgos).map(x => ({ ...x, eje: 'ambar', de: 'popularidad' }))]
      .filter(x => Math.abs(x.pts) >= 1 && !sinInteres(x.k, a.rasgos))
      .sort((x, y) => Math.abs(y.pts) - Math.abs(x.pts)).slice(0, 3);
    $('#lectura-pesos').innerHTML = pesos.map(x =>
      `<span class="peso peso-${x.eje}" title="${La(x.k)}: ${valorCorto(x.k, a.rasgos[x.k])}. ${x.pts > 0 ? 'Suma' : 'Resta'} ${Math.abs(Math.round(x.pts))} puntos de ${x.de}"><b>${signo(x.pts)}</b> ${INFO[x.k].nombre} <i>en ${x.de}</i></span>`).join('');
    // La IA pone en palabras los mismos números; si no está, queda la lectura fija de arriba
    const cajaLectura = $('#lectura').closest('.caja');
    cajaLectura.classList.remove('con-ia');
    $('#lectura-pie').textContent = '';
    PP.lecturaIA?.(a, p, z, c, { caja: cajaLectura, parrafo: $('#lectura'), pie: $('#lectura-pie') });

    mapa($('#mapa-resultado'), { tu: { pop: p.pop.v, pres: p.pres.v }, etiquetas: 'cercanas', animar: MOVIMIENTO });
  };

  /* ================= 6 · Desglose: la consola ================= */

  $$('.selector button').forEach(b => b.addEventListener('click', () => {
    S.eje = b.dataset.eje;
    $$('.selector button').forEach(x => x.classList.toggle('activo', x === b));
    b.closest('.selector').dataset.eje = S.eje;
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
    cons.dataset.eje = S.eje;                 // las barras toman el color del eje que se mira
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
        `<div class="cifra-conflicto cc-azul"><span>Prestigio</span><b>${signo(c.ap)}</b></div>
         <div class="cifra-conflicto cc-ambar"><span>Popularidad</span><b>${signo(c.aq)}</b></div>`;
      $('#conflicto-lectura').textContent =
        'No hay una sola dirección que te mejore los dos puntajes. Es la decisión que tenés que tomar.';
    } else {
      // Sin conflicto: se nombra el rasgo que más pesa en el puntaje que se está mirando
      const fuerte = aportes(S.eje, r).slice().sort((x, y) => Math.abs(y.pts) - Math.abs(x.pts))[0];
      $('#conflicto-titulo').textContent = 'No tenés un conflicto marcado';
      $('#conflicto-texto').innerHTML = `Ningún rasgo te suma mucho en un puntaje y te resta mucho en el otro. Lo que más pesa acá es <strong>${la(fuerte.k)}</strong> (${valorCorto(fuerte.k, r[fuerte.k])}): ${fuerte.pts > 0 ? 'suma' : 'resta'} ${Math.abs(Math.round(fuerte.pts))} puntos.`;
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
    ].map(([n, e, e0, d]) => `<div class="tarjeta-puntaje ${n === 'Prestigio' ? 'tp-azul' : 'tp-ambar'}">
      <div class="puntaje-cabeza"><b>${n}</b><span class="puntaje-margen ${d ? 'movido' : ''}">${d === 0 ? 'sin cambios' : signo(d)}</span></div>
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
