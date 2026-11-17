/* P&P — slots de video de fondo
 *
 * Copiá los videos a la carpeta videos/ y escribí sus rutas acá abajo.
 * Si una pantalla no tiene video, se ve exactamente igual que sin slot.
 * La clave es el data-ruta de la pantalla: portada, bienvenida, crear, inicio, etc.
 *
 * Un solo video:
 *   src        'videos/portada.mp4'   (o ['videos/portada.webm', 'videos/portada.mp4'] si tenés dos formatos)
 *
 * Varios videos (el siguiente sube y empuja al anterior):
 *   lista      ['videos/uno.mp4', 'videos/dos.mp4', ...]   el orden de la lista es el orden en pantalla
 *              cada ítem puede ser también { src: 'videos/uno.mp4', poster: 'videos/uno.jpg' }
 *   cada       segundos que dura cada video antes de pasar al siguiente (0 = no cambia solo)
 *   transicion segundos que tarda el empuje
 *   controles  'centro' | 'izq' | 'der' | false   → botones ↑ ↓, contador y barra de tiempo
 *   tinta      color de los controles (por defecto se elige solo según el velo)
 *
 * Para cualquier slot:
 *   poster     imagen mientras carga, o si el sistema pide "reducir movimiento"
 *   velo       0 a 1: qué tan opaca es la capa encima del video (para que el texto se lea)
 *   veloColor  color de esa capa
 *   fondo      color de la pantalla detrás del video
 *   ajuste     'cover' (llena, recorta) o 'contain' (entra entero)
 *   posicion   hacia dónde se centra el recorte: 'center', 'top', '30% 50%'...
 *
 * Cambiar a mano: botones ↑ ↓ en pantalla, teclas ← →, o desde la consola:
 *   PPVideos.siguiente('portada')   PPVideos.anterior('portada')   PPVideos.ir('portada', 2)
 *
 * Los videos van sin sonido, en loop, y solo se reproducen mientras su pantalla está abierta.
 */
(() => {
  'use strict';

  const VIDEOS = {
    portada: {
      lista: ['videos/portada.mp4', 'videos/portada-2.mp4', 'videos/portada-3.mp4'],
      cada: 8, transicion: 1.1, controles: 'centro',
      velo: 0.35, veloColor: '#000', fondo: '#000',
    },
    bienvenida: { src: '', poster: '', velo: 0.78, veloColor: '#fff', fondo: '#fff' },
    // inicio:  { src: 'videos/inicio.mp4', velo: 0.6, veloColor: '#fff', fondo: '#fff' },
  };

  // ---------------------------------------------------------------------------

  const QUIETO = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TIPOS = { mp4: 'video/mp4', m4v: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', ogv: 'video/ogg' };
  const tipo = s => TIPOS[(String(s).split('?')[0].split('.').pop() || '').toLowerCase()] || '';
  const pad = x => String(x).padStart(2, '0');
  const esClaro = c => /^(#fff|#ffffff|white)$/i.test(String(c || '').trim());
  const crear = (tag, clase) => { const e = document.createElement(tag); if (clase) e.className = clase; return e; };
  const normalizar = it => (it && typeof it === 'object' && !Array.isArray(it))
    ? { fuentes: [].concat(it.src || []), poster: it.poster || '' }
    : { fuentes: [].concat(it || []), poster: '' };

  const REG = {};

  function armar(ruta, c) {
    const pantalla = document.querySelector(`.pantalla[data-ruta="${ruta}"]`);
    if (!pantalla) { console.warn(`[videos] no existe una pantalla con data-ruta="${ruta}"`); return; }

    const items = (c.lista && c.lista.length ? c.lista : [c.src]).map(normalizar).filter(i => i.fuentes.length && i.fuentes[0]);
    if (!items.length) return;
    const n = items.length;
    const cada = c.cada == null ? 8 : Number(c.cada);
    const dur = c.transicion == null ? 1.1 : Number(c.transicion);

    const slot = crear('div', 'video-slot');
    slot.setAttribute('aria-hidden', 'true');
    slot.dataset.ruta = ruta;
    slot.style.setProperty('--video-dur', dur + 's');
    const caja = crear('div', 'video-slot-caja');

    // Una capa por video. Solo el primero se pide al arrancar; los demás, cuando les toca.
    const capas = items.map((it, i) => {
      const capa = crear('div', 'video-capa');
      const v = crear('video');
      v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      v.preload = i === 0 ? 'auto' : 'none';
      v.disablePictureInPicture = true;
      const poster = it.poster || c.poster; if (poster) v.poster = poster;
      v.style.objectFit = c.ajuste || 'cover';
      v.style.objectPosition = c.posicion || 'center';
      it.fuentes.forEach(s => {
        const so = crear('source'); so.src = s;
        const t = tipo(s); if (t) so.type = t;
        v.append(so);
      });
      capa.append(v);
      const e = { capa, v, listo: false, error: false, cb: [] };
      const avisar = () => { const f = e.cb.splice(0); f.forEach(fn => fn()); };
      v.addEventListener('loadeddata', () => { e.listo = true; avisar(); });
      v.lastElementChild.addEventListener('error', () => {
        if (e.listo) return;
        e.error = true;
        console.warn(`[videos] no se pudo cargar "${it.fuentes.join(', ')}" (${ruta})`);
        avisar();
      });
      caja.append(capa);
      return e;
    });

    const velo = crear('div', 'video-slot-velo');
    velo.style.background = c.veloColor || '#000';
    velo.style.opacity = c.velo == null ? 0 : c.velo;
    caja.append(velo);
    slot.append(caja);
    pantalla.prepend(slot);

    // Devuelve una promesa: true si ese video quedó listo, false si falló o tardó demasiado
    const pedir = e => new Promise(res => {
      if (e.listo || e.error) return res(e.listo);
      e.cb.push(() => res(e.listo));
      if (e.v.preload !== 'auto') { e.v.preload = 'auto'; e.v.load(); }
      setTimeout(() => res(e.listo), 6000);
    });

    // ---- Controles ----
    let ctrl = null;
    if (n > 1 && c.controles !== false) {
      const tinta = c.tinta || (esClaro(c.veloColor) ? '#000' : '#fff');
      ctrl = crear('div', `video-ctrl video-ctrl-${['izq', 'der'].includes(c.controles) ? c.controles : 'centro'}${cada > 0 && !QUIETO ? '' : ' sin-auto'}`);
      ctrl.hidden = true;
      ctrl.style.setProperty('--video-tinta', tinta);
      ctrl.style.setProperty('--video-contra', esClaro(tinta) || tinta === '#fff' ? '#000' : '#fff');
      ctrl.style.setProperty('--video-cada', cada + 's');
      ctrl.innerHTML = `<button type="button" data-dir="-1" aria-label="Video anterior">↑</button>` +
        `<span class="video-ctrl-n"><b>01</b> / ${pad(n)}</span>` +
        `<button type="button" data-dir="1" aria-label="Video siguiente">↓</button>` +
        `<span class="video-ctrl-barra"><i></i></span>`;
      ctrl.addEventListener('click', ev => {
        const b = ev.target.closest('button[data-dir]');
        if (b) mover(Number(b.dataset.dir));
      });
      document.body.append(ctrl);
    }
    const barra = () => ctrl && ctrl.querySelector('.video-ctrl-barra i');
    const reiniciarBarra = () => { const b = barra(); if (!b) return; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; };
    const marcar = () => { if (ctrl) ctrl.querySelector('.video-ctrl-n b').textContent = pad(actual + 1); };

    // ---- Estado y reloj ----
    let actual = -1, moviendo = false, vivo = false;
    const T = { id: null, ini: 0, rest: cada * 1000 };
    const auto = () => n > 1 && cada > 0 && !QUIETO;

    function arrancar() {
      if (!auto() || !vivo || moviendo || actual < 0 || T.id) return;
      T.ini = Date.now();
      T.id = setTimeout(() => { T.id = null; mover(1); }, T.rest);
      const b = barra(); if (b) b.style.animationPlayState = 'running';
    }
    function detener() {
      if (T.id) { clearTimeout(T.id); T.id = null; T.rest = Math.max(0, T.rest - (Date.now() - T.ini)); }
      const b = barra(); if (b) b.style.animationPlayState = 'paused';
    }
    function programar() { detener(); T.rest = cada * 1000; reiniciarBarra(); arrancar(); }

    const reproducir = v => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    function sincronizar() {
      const antes = vivo;
      vivo = pantalla.classList.contains('activa');
      if (ctrl) ctrl.hidden = !(vivo && actual >= 0);
      if (actual < 0) return;
      if (!moviendo) capas.forEach((e, i) => { if (i === actual && vivo && !QUIETO) reproducir(e.v); else e.v.pause(); });
      if (vivo && !antes) arrancar(); else if (!vivo && antes) detener();
    }

    const precargar = () => { if (n > 1) pedir(capas[(actual + 1) % n]); };

    async function mover(dir, destino) {
      if (moviendo || n < 2 || actual < 0) return;
      moviendo = true;
      detener();
      let j = actual, ok = false;
      if (destino != null) {
        j = destino;
        ok = j !== actual && await pedir(capas[j]);
      } else {
        for (let k = 0; k < n && !ok; k++) {
          j = (j + dir + n) % n;
          if (j === actual) break;
          ok = await pedir(capas[j]);
        }
      }
      if (!ok) { moviendo = false; arrancar(); return; }

      const nueva = capas[j], vieja = capas[actual], adelante = dir > 0;
      nueva.capa.className = 'video-capa ' + (adelante ? 'entra-abajo' : 'entra-arriba');
      try { nueva.v.currentTime = 0; } catch (e) { /* aún sin metadatos */ }
      if (vivo && !QUIETO) reproducir(nueva.v);
      void nueva.capa.offsetWidth;                                    // fija el punto de partida
      const m = QUIETO ? '' : ' mueve';
      nueva.capa.className = 'video-capa es-actual' + m;
      vieja.capa.className = 'video-capa ' + (adelante ? 'sale-arriba' : 'sale-abajo') + m;
      actual = j;
      marcar();
      setTimeout(() => {
        vieja.capa.className = 'video-capa';
        vieja.v.pause();
        nueva.capa.className = 'video-capa es-actual';
        moviendo = false;
        sincronizar();
        programar();
        precargar();
      }, QUIETO ? 0 : dur * 1000 + 80);
    }

    // ---- Arranque: el primer video que cargue ----
    (async () => {
      for (let k = 0; k < n; k++) {
        if (!(await pedir(capas[k]))) continue;
        capas[k].capa.className = 'video-capa es-actual';
        actual = k;
        if (c.fondo) pantalla.style.setProperty('--video-fondo', c.fondo);
        pantalla.classList.add('con-video');
        marcar();
        vivo = false;
        sincronizar();
        programar();
        precargar();
        return;
      }
      slot.remove(); if (ctrl) ctrl.remove();                         // ninguno cargó: la pantalla queda como estaba
    })();

    new MutationObserver(sincronizar).observe(pantalla, { attributes: true, attributeFilter: ['class'] });

    REG[ruta] = {
      mover: dir => mover(dir),
      ir: k => { const j = Number(k) - 1; if (j >= 0 && j < n) mover(j > actual ? 1 : -1, j); },
      activa: () => vivo && n > 1,
    };
  }

  Object.entries(VIDEOS).forEach(([ruta, c]) => { if (c && (c.src && c.src.length || c.lista && c.lista.length)) armar(ruta, c); });

  // Teclas ← → cambian el video de la pantalla abierta
  document.addEventListener('keydown', ev => {
    if (ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const t = ev.target;
    if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
    const d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    const r = Object.values(REG).find(x => x.activa());
    if (r) { ev.preventDefault(); r.mover(d); }
  });

  window.PPVideos = {
    siguiente: r => REG[r] && REG[r].mover(1),
    anterior: r => REG[r] && REG[r].mover(-1),
    ir: (r, k) => REG[r] && REG[r].ir(k),
  };
})();
