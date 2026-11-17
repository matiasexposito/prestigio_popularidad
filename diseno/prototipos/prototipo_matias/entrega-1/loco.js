/* P&P — capa de movimiento inspirada en locomotive.ca
 *
 * Va DESPUÉS de app.js y no toca la lógica de la app: solo escucha la navegación
 * (cambios de #ruta) y el mouse. Hace cinco cosas:
 *   1. Preloader: pantalla negra con un contador 0→100 que se levanta como un telón.
 *   2. Telón entre pantallas: al tocar un link interno, un panel negro sube, cambia
 *      la pantalla y sigue subiendo hasta destaparla.
 *   3. Títulos que suben línea por línea, cada palabra desde atrás de una máscara.
 *   4. Shuffle: al pasar el mouse por un link o botón, sus letras se mezclan y se
 *      reacomodan de izquierda a derecha.
 *   5. Depixelado: la tapa del disco en la tarjeta de canción aparece de pixelada a nítida.
 * Con "reducir movimiento" activado en el sistema no anima nada.
 */
(() => {
  'use strict';

  const QUIETO = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const raiz = document.documentElement;
  raiz.classList.add('loco');
  if (QUIETO) raiz.classList.add('loco-quieto');

  // Cada app puede ajustar qué se anima antes de cargar este archivo (window.LOCO = {...})
  const CONF = Object.assign({
    titulos: 'h1, h2, .titular, .titular-md, .titulo-pantalla, .splash-logo',
    excluir: '.portada-logo, [data-sin-loco], .ficha *',
    shuffle: '.boton, .barra-nav a, .enlace-tenue, .selector button, .resultados li[data-i], .link, a.logo, .pop-yt',
    bloques: '',          // bloques que entran con un fundido hacia arriba (vacío = ninguno)
    marca: 'P&amp;P',
    bajada: 'Prestigio &amp; Popularidad',
  }, window.LOCO || {});

  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reflow = el => void el.getBoundingClientRect();
  const activa = () => document.querySelector('.pantalla.activa');

  /* ================= 3 · Títulos línea por línea ================= */

  // Envuelve cada palabra en una máscara. Los elementos de adentro (un <span id> que la
  // app actualiza, un <em>) se mueven enteros, así no se pierden sus referencias.
  function partir(el) {
    if (el._locoFirma === el.textContent && el.querySelector(':scope > .loco-p')) return;
    const nodos = [...el.childNodes];
    const frag = document.createDocumentFragment();
    // Lo que va pegado a la palabra anterior sin espacio (", Diogenes" o el "?" final)
    // entra en la misma máscara, así no queda solo en otra línea.
    let ultima = null;
    const palabra = contenido => {
      if (ultima) { ultima.append(contenido); return; }
      const p = document.createElement('span'); p.className = 'loco-p';
      const i = document.createElement('span'); i.className = 'loco-pi';
      i.append(contenido); p.append(i); frag.append(p); ultima = i;
    };
    for (const n of nodos) {
      if (n.nodeType === 3) {
        n.data.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.append(document.createTextNode(t)); ultima = null; }
          else palabra(document.createTextNode(t));
        });
      } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('loco-p')) {
        palabra(n);
      } else { frag.append(n); ultima = null; }
    }
    el.textContent = '';
    el.append(frag);
    el._locoFirma = el.textContent;
  }

  // Numera las líneas según dónde cayó cada palabra, para escalonarlas
  function numerarLineas(el) {
    let ultimo = null, linea = -1;
    $$(':scope > .loco-p', el).forEach(p => {
      const y = Math.round(p.offsetTop);
      if (y !== ultimo) { linea++; ultimo = y; }
      p.style.setProperty('--l', linea);
    });
  }

  function animarPantalla(pantalla, retraso = 0) {
    if (!pantalla || QUIETO) return;
    const titulos = $$(CONF.titulos, pantalla).filter(t => !t.closest(CONF.excluir) && t.textContent.trim() && t.offsetParent !== null);
    titulos.forEach((t, k) => {
      partir(t);
      numerarLineas(t);
      t.style.setProperty('--loco-retraso', `${retraso + k * 90}ms`);
      t.classList.remove('loco-entra'); reflow(t); t.classList.add('loco-entra');
    });
    if (CONF.bloques) {
      $$(CONF.bloques, pantalla).filter(b => !b.closest(CONF.excluir)).forEach((b, k) => {
        b.style.setProperty('--loco-retraso', `${retraso + 120 + Math.min(k, 10) * 60}ms`);
        b.classList.remove('loco-sube'); reflow(b); b.classList.add('loco-sube');
      });
    }
  }

  // Si la app cambia el texto de un título ya animado (p. ej. el nombre de la canción
  // llega después), se vuelve a partir y a animar ese título solo.
  const vigilados = new WeakSet();
  const obsTitulos = new MutationObserver(cambios => {
    const tocados = new Set();
    for (const c of cambios) {
      const t = (c.target.nodeType === 1 ? c.target : c.target.parentElement)?.closest(CONF.titulos);
      if (t && t._locoFirma !== undefined && t._locoFirma !== t.textContent) tocados.add(t);
    }
    tocados.forEach(t => {
      if (!t.closest('.pantalla.activa')) return;
      partir(t); numerarLineas(t);
      t.style.setProperty('--loco-retraso', '0ms');
      t.classList.remove('loco-entra'); reflow(t); t.classList.add('loco-entra');
    });
  });

  /* ================= 2 · Telón entre pantallas ================= */

  const telon = document.createElement('div');
  telon.className = 'loco-telon';
  telon.setAttribute('aria-hidden', 'true');
  telon.innerHTML = `<span class="loco-telon-marca">${CONF.marca}</span>`;
  let enTransicion = false, ultimoCambio = 0;

  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const DUR = 520;

  async function cubrirYCambiar(hash) {
    enTransicion = true;
    telon.className = 'loco-telon abajo'; reflow(telon);
    telon.className = 'loco-telon cubre';
    await esperar(DUR);
    location.hash = hash;
    await esperar(60);
    destapar();
  }

  function destapar() {
    telon.className = 'loco-telon cubre'; reflow(telon);
    telon.className = 'loco-telon arriba';
    animarPantalla(activa(), DUR * 0.45);
    setTimeout(() => { telon.className = 'loco-telon'; enTransicion = false; }, DUR + 40);
  }

  document.addEventListener('click', e => {
    if (QUIETO || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.target || enTransicion) return;
    const hash = a.getAttribute('href');
    if (hash.length < 2 || hash === location.hash) return;
    e.preventDefault();
    cubrirYCambiar(hash);
  });

  // Cambios de ruta que no vienen de un click (la app navega sola después de analizar):
  // solo la mitad de salida del telón.
  addEventListener('hashchange', () => {
    const ahora = performance.now();
    if (enTransicion || QUIETO) return;
    if (ahora - ultimoCambio < 150) return;   // la app corrigió la ruta enseguida (redirección)
    ultimoCambio = ahora;
    requestAnimationFrame(destapar);
  });

  /* ================= 1 · Preloader ================= */

  function preloader() {
    const pre = document.createElement('div');
    pre.className = 'loco-pre';
    pre.setAttribute('aria-hidden', 'true');
    pre.innerHTML = `
      <div class="loco-pre-arriba"><span>${CONF.marca}</span><span>${CONF.bajada}</span></div>
      <div class="loco-pre-cifra"><span>0</span></div>
      <div class="loco-pre-barra"><i></i></div>`;
    document.body.append(pre);
    const cifra = pre.querySelector('.loco-pre-cifra span'), barra = pre.querySelector('.loco-pre-barra i');
    const t0 = performance.now(), dur = 1150;
    const paso = t => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      cifra.textContent = Math.round(e * 100);
      barra.style.transform = `scaleX(${e})`;
      if (k < 1) return requestAnimationFrame(paso);
      setTimeout(() => {
        pre.classList.add('fuera');
        animarPantalla(activa(), 380);
        setTimeout(() => pre.remove(), 1100);
      }, 160);
    };
    requestAnimationFrame(paso);
  }

  /* ================= 4 · Shuffle de letras ================= */

  const LETRA = /[^\s]/;
  function textos(el) {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => LETRA.test(n.data) ? 1 : 2 });
    const r = []; let n; while ((n = w.nextNode())) r.push(n);
    return r;
  }
  function mezclar(arr) {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }
  // Un cuadro del shuffle: las primeras `fijas` letras quedan en su lugar, el resto se
  // reordena al azar (son las mismas letras, como en Locomotive). Los espacios no se mueven.
  function cuadro(original, fijas) {
    const chars = [...original];
    const libres = [];
    chars.forEach((c, i) => { if (i >= fijas && LETRA.test(c)) libres.push(i); });
    const letras = mezclar(libres.map(i => chars[i]));
    libres.forEach((i, k) => { chars[i] = letras[k]; });
    return chars.join('');
  }
  function shuffle(el) {
    if (el._locoShuffle) return;
    const nodos = textos(el);
    if (!nodos.length || nodos.length > 3) return;
    const originales = nodos.map(n => n.data);
    const total = Math.max(...originales.map(s => s.length));
    if (total < 2 || total > 60) return;
    el._locoShuffle = true;
    const t0 = performance.now(), dur = Math.min(520, 180 + total * 22);
    let escritos = originales.slice();
    const paso = t => {
      // si la app cambió el texto mientras mezclábamos, se corta sin pisar nada
      if (nodos.some((n, i) => n.data !== escritos[i])) { el._locoShuffle = false; return; }
      const k = Math.min(1, (t - t0) / dur);
      if (k < 1) {
        escritos = originales.map(s => cuadro(s, Math.floor(k * s.length)));
        nodos.forEach((n, i) => { n.data = escritos[i]; });
        setTimeout(() => requestAnimationFrame(paso), 34);
      } else {
        nodos.forEach((n, i) => { n.data = originales[i]; });
        el._locoShuffle = false;
      }
    };
    requestAnimationFrame(paso);
  }
  if (!QUIETO) {
    document.addEventListener('pointerover', e => {
      if (e.pointerType === 'touch') return;
      const el = e.target.closest?.(CONF.shuffle);
      if (el && !el.contains(e.relatedTarget)) shuffle(el);
    });
  }

  /* ================= 5 · Depixelado de la tapa ================= */

  function depixelar(caja, url) {
    const img = new Image();
    img.onload = () => {
      const w = caja.clientWidth, h = caja.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(2, devicePixelRatio || 1);
      const c = document.createElement('canvas');
      c.className = 'loco-pix';
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      const ctx = c.getContext('2d');
      const chico = document.createElement('canvas'), cx = chico.getContext('2d');
      caja.append(c);
      const pasos = [3, 5, 8, 12, 18, 28, 44];
      let i = 0;
      const dibujar = () => {
        if (i >= pasos.length) { c.classList.add('fuera'); setTimeout(() => c.remove(), 260); return; }
        const n = pasos[i++];
        chico.width = n; chico.height = Math.max(1, Math.round(n * h / w));
        cx.drawImage(img, 0, 0, chico.width, chico.height);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(chico, 0, 0, c.width, c.height);
        setTimeout(dibujar, 75);
      };
      dibujar();
    };
    img.src = url;
  }
  const obsTapas = new MutationObserver(cambios => {
    for (const c of cambios) {
      const el = c.target;
      if (!(el instanceof HTMLElement) || !el.classList.contains('pop-tapa')) continue;
      const m = /url\(["']?(.+?)["']?\)/.exec(el.style.backgroundImage || '');
      if (!m || el._locoUrl === m[1]) continue;
      // la tapa de iTunes viene en 100×100: pedimos una más grande para que se vea nítida
      const grande = m[1].replace(/\/\d+x\d+bb\./, '/300x300bb.');
      el._locoUrl = grande;
      if (grande !== m[1]) el.style.backgroundImage = `url("${grande}")`;
      if (!QUIETO) depixelar(el, grande);
    }
  });

  /* ================= Arranque ================= */

  function arrancar() {
    document.body.append(telon);
    obsTitulos.observe(document.body, { subtree: true, childList: true, characterData: true });
    obsTapas.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['style'] });
    if (QUIETO) return;
    // La primera vez de la sesión, preloader; si recargás la misma pestaña, solo el telón
    let visto = false;
    try { visto = sessionStorage.getItem('loco_pre') === '1'; sessionStorage.setItem('loco_pre', '1'); } catch { /* sin almacenamiento */ }
    if (visto) destapar(); else preloader();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
