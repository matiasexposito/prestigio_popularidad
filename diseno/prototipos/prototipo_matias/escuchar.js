/* Escuchar una cancion del mapa — tomado tal cual del prototipo de Diogenes (03/11/2026).
   Cualquier punto del mapa se puede clickear: abre una tarjeta con la cancion, sus dos
   puntajes y una vista previa (Apple Music, o YouTube si hay clave). */
(function () {
  'use strict';
  const { M, clamp } = window.PP;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sinTildes = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  /* ================= Escuchar una canción del mapa =================
     Cualquier punto del mapa (las referencias con nombre y la muestra de fondo) se puede
     clickear: abre una tarjetita al lado del punto con la canción, sus dos puntajes y un
     reproductor, sin salir de la app.

     YouTube no deja incrustar una BÚSQUEDA: para mostrar un video adentro de la app hace
     falta su id, y para conseguirlo hay que usar la API de YouTube con una clave.
       - Con clave (YOUTUBE_API_KEY): busca el video y lo muestra en la tarjeta.
       - Sin clave: reproduce la vista previa de 30 s de Apple Music (su buscador es público
         y no pide clave) y deja el botón para abrir la búsqueda en YouTube. */
  const YOUTUBE_API_KEY = window.PYP_YOUTUBE_KEY || '';

  const GRUPO = { ambas: 'hit y nominada', premiada: 'nominada', hit: 'hit, nunca nominada', control: 'ni hit ni nominada' };
  function cancionDePunto(el) {
    if (el.dataset.f != null) {
      const [pop, pres, grupo, titulo, artista, anio] = M.fondo[+el.dataset.f];
      return { titulo, artista, anio, pop, pres, etiqueta: GRUPO[grupo] || '' };
    }
    const r = M.referencias[+el.dataset.ref];
    return { ...r, etiqueta: r.gano ? 'ganó un Grammy' : r.nominada ? 'nominada' : 'ni nominada' };
  }

  // "Mark Ronson Featuring Bruno Mars" → "Mark Ronson"; "Tema (Remix)" → "Tema"
  const artistaPrincipal = a => a.split(/\s+(?:featuring|feat\.?|ft\.?|with|x|&|and)\s+|,/i)[0].trim();
  const tituloLimpio = t => t.replace(/\s*[([].*?[)\]]/g, '').trim() || t;
  const urlYouTube = c => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${c.titulo} ${c.artista}`)}`;

  const cacheYT = new Map(), cacheApple = new Map();
  async function buscarYouTube(c) {
    const q = `${tituloLimpio(c.titulo)} ${artistaPrincipal(c.artista)}`;
    if (!cacheYT.has(q)) cacheYT.set(q, fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=1&q=${encodeURIComponent(q)}&key=${YOUTUBE_API_KEY}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status)).then(d => d.items?.[0]?.id?.videoId || null));
    return cacheYT.get(q);
  }

  // Buscador de iTunes: responde con CORS; si algún navegador lo bloquea, se pide como JSONP
  function jsonp(url) {
    return new Promise((ok, mal) => {
      const cb = `pypItunes${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
      const s = document.createElement('script');
      const fin = () => { delete window[cb]; s.remove(); };
      window[cb] = d => { fin(); ok(d); };
      s.onerror = () => { fin(); mal(); };
      s.src = `${url}&callback=${cb}`;
      document.head.append(s);
      setTimeout(() => { if (window[cb]) { fin(); mal(); } }, 8000);
    });
  }
  async function buscarApple(c) {
    const titulo = tituloLimpio(c.titulo), artista = artistaPrincipal(c.artista);
    const q = `${titulo} ${artista}`;
    if (!cacheApple.has(q)) {
      const url = `https://itunes.apple.com/search?media=music&entity=song&limit=10&term=${encodeURIComponent(q)}`;
      cacheApple.set(q, fetch(url).then(r => r.json()).catch(() => jsonp(url)).then(d => {
        const res = (d.results || []).filter(x => x.previewUrl);
        const n = s => sinTildes(s).replace(/[^a-z0-9]/g, '');
        // Solo vale si coinciden título y artista: mejor "no la encontramos" que otra canción
        const mismo = (x, y) => x && y && (x.includes(y) || y.includes(x));
        return res.find(x => mismo(n(x.trackName), n(titulo)) && mismo(n(x.artistName), n(artista))) || null;
      }));
    }
    return cacheApple.get(q);
  }

  const globo = document.createElement('div');
  globo.className = 'm-globo';
  globo.hidden = true;
  const tarjetaPunto = document.createElement('div');
  tarjetaPunto.className = 'pop-cancion';
  tarjetaPunto.setAttribute('role', 'dialog');
  tarjetaPunto.hidden = true;
  let puntoActivo = null;

  // Ubica un elemento HTML al lado de un punto del SVG, sin salirse de la caja del mapa
  function ubicar(el, punto, caja, sep = 12) {
    const p = punto.getBoundingClientRect(), c = caja.getBoundingClientRect();
    const cx = p.left + p.width / 2 - c.left, cy = p.top + p.height / 2 - c.top;
    const w = el.offsetWidth, h = el.offsetHeight;
    let x = cx + sep;
    if (x + w > c.width - 4) x = cx - sep - w;
    x = clamp(x, 4, Math.max(4, c.width - w - 4));
    const y = clamp(cy - h / 2, 4, Math.max(4, c.height - h - 4));
    el.style.left = `${x}px`; el.style.top = `${y}px`;
  }

  function cerrarCancion() {
    if (tarjetaPunto.hidden) return;
    $('audio', tarjetaPunto)?.pause();
    tarjetaPunto.hidden = true;
    tarjetaPunto.innerHTML = '';          // corta el video si estaba sonando
    puntoActivo?.classList.remove('activo');
    puntoActivo = null;
  }

  async function abrirCancion(el, caja) {
    if (puntoActivo === el) return cerrarCancion();
    cerrarCancion();
    globo.hidden = true;
    const c = cancionDePunto(el);
    puntoActivo = el; el.classList.add('activo');
    caja.append(tarjetaPunto);
    tarjetaPunto.setAttribute('aria-label', `${c.titulo} — ${c.artista}`);
    tarjetaPunto.innerHTML = `
      <button type="button" class="pop-cerrar" aria-label="Cerrar">×</button>
      <div class="pop-cabeza">
        <div class="pop-tapa"></div>
        <div class="pop-datos">
          <strong>${esc(c.titulo)}</strong>
          <span>${esc(c.artista)}</span>
          <small class="mono">${c.anio}${c.etiqueta ? ` · ${esc(c.etiqueta)}` : ''}</small>
        </div>
      </div>
      <div class="pop-cifras mono"><span>prestigio ${Math.round(c.pres)}%</span><span>popularidad ${Math.round(c.pop)}%</span></div>
      <div class="pop-player"><span class="pop-cargando"><i class="giro"></i>buscando la canción…</span></div>
      <a class="pop-yt" href="${urlYouTube(c)}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M23 7.2a3 3 0 00-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 001 7.2 31 31 0 00.5 12a31 31 0 00.5 4.8 3 3 0 002.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 002.1-2.1 31 31 0 00.5-4.8 31 31 0 00-.5-4.8zM9.8 15.1V8.9l5.7 3.1-5.7 3.1z"/></svg>
        Buscar en YouTube</a>`;
    tarjetaPunto.hidden = false;
    ubicar(tarjetaPunto, el, caja, 16);
    $('.pop-cerrar', tarjetaPunto).addEventListener('click', cerrarCancion);

    const player = $('.pop-player', tarjetaPunto);
    const sigue = () => puntoActivo === el;
    try {
      if (YOUTUBE_API_KEY) {
        const id = await buscarYouTube(c);
        if (!sigue()) return;
        if (id) {
          player.classList.add('video');
          player.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${esc(c.titulo)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
          ubicar(tarjetaPunto, el, caja, 16);
          return;
        }
      }
      const t = await buscarApple(c);
      if (!sigue()) return;
      if (!t) throw new Error('sin resultado');
      $('.pop-tapa', tarjetaPunto).style.backgroundImage = `url("${t.artworkUrl100}")`;
      player.innerHTML = `<audio controls autoplay preload="none" src="${t.previewUrl}"></audio><small class="tenue">Vista previa de 30 s · Apple Music</small>`;
    } catch {
      if (!sigue()) return;
      player.innerHTML = `<small class="tenue">No encontramos una vista previa. Escuchala en YouTube.</small>`;
    }
    ubicar(tarjetaPunto, el, caja, 16);
  }

  function activarPuntos(svg) {
    const caja = svg.closest('.mapa-caja');
    const punto = e => e.target.closest?.('.m-fondo, .m-ref');
    svg.addEventListener('pointerover', e => {
      const el = punto(e);
      if (!el || e.pointerType === 'touch' || puntoActivo === el) return;
      const c = cancionDePunto(el);
      globo.innerHTML = `<strong>${esc(c.titulo)}</strong> — ${esc(c.artista)} <span class="tenue">· ${c.anio}</span><small>click para escuchar</small>`;
      caja.append(globo);
      globo.hidden = false;
      ubicar(globo, el, caja);
    });
    svg.addEventListener('pointerout', e => { if (punto(e)) globo.hidden = true; });
    svg.addEventListener('click', e => {
      const el = punto(e);
      if (el) { e.stopPropagation(); abrirCancion(el, caja); }
    });
  }

  document.addEventListener('click', e => { if (!tarjetaPunto.hidden && !tarjetaPunto.contains(e.target)) cerrarCancion(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarCancion(); });
  window.addEventListener('hashchange', cerrarCancion);
  window.addEventListener('resize', cerrarCancion);

  window.PP.activarPuntos = activarPuntos;
})();
