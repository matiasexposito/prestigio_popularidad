/* =========================================================
   P&P — la galaxia de la portada

   Cada punto es una canción real de la base (240):
     azul  = fue nominada al Grammy
     ámbar = entró al Hot 100
     gris  = ninguna de las dos
   Giran muy despacio, como una galaxia. Cada tanto una se enciende
   y suena una nota suave. Si pasás el mouse por una, te dice cuál es.

   El sonido arranca apagado: los navegadores no dejan que una página
   suene sola. Se prende con el botón o con el primer clic.
   ========================================================= */
(function () {
  'use strict';
  const lienzo = document.getElementById('galaxia');
  const M = window.MODELO;
  if (!lienzo || !M || !M.fondo) return;

  const seccion = lienzo.closest('.pantalla');
  const boton = document.getElementById('sonido');
  const ctx = lienzo.getContext('2d');
  const QUIETO = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const COLOR = { azul: '27,79,216', ambar: '180,83,9', gris: '150,146,138' };
  const colorDe = g => (g === 'ambas' || g === 'premiada') ? 'azul' : g === 'hit' ? 'ambar' : 'gris';

  // Azar con semilla: la galaxia es la misma cada vez que se abre
  let semilla = 97;
  const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;

  // De do a la, sin semitonos (escala pentatónica): cualquier combinación suena bien
  const NOTAS = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];

  // 240 canciones: todas las nominadas de la muestra (son pocas), 110 hits y 100 del resto
  const de = (c, n) => M.fondo.filter(f => colorDe(f[2]) === c).slice(0, n);
  const elegidas = [...de('azul', 30), ...de('ambar', 110), ...de('gris', 100)];
  const estrellas = elegidas.map(([pop, pres, grupo, titulo, artista, anio], i) => {
    const r = 0.27 + Math.pow(azar(), 0.8) * 0.78;          // distancia al centro (el medio queda libre para el logo)
    const brazo = Math.floor(azar() * 2) * Math.PI;                      // dos brazos en espiral
    const color = colorDe(grupo);
    // Las nominadas suenan más agudo; los hits, más grave; el tono exacto sale de su puntaje
    const paso = Math.min(4, Math.floor((color === 'ambar' ? pop : pres) / 20));
    return {
      titulo, artista, anio, color, r,
      ang: brazo + r * 3.4 + (azar() - 0.5) * 1.5,
      vel: 0.016 / (0.35 + r),                               // radianes por segundo: las de adentro giran más rápido
      tam: color === 'gris' ? 1.5 + azar() * 1.5 : color === 'azul' ? 3.2 + azar() * 2.4 : 2.2 + azar() * 2.6,
      brillo: color === 'gris' ? 0.5 : color === 'azul' ? 0.75 + azar() * 0.2 : 0.5 + azar() * 0.35,
      nota: NOTAS[(color === 'azul' ? 5 : 0) + paso],
      pulso: -9, x: 0, y: 0,
    };
  });

  /* ---------- Sonido ---------- */
  let audio = null, salida = null, sonando = false;

  function prender() {
    try {
      if (!audio) {
        audio = new (window.AudioContext || window.webkitAudioContext)();
        salida = audio.createGain();
        salida.gain.value = 0.5;
        // Un eco muy corto para que la nota quede flotando
        const eco = audio.createDelay(), vuelta = audio.createGain();
        eco.delayTime.value = 0.33; vuelta.gain.value = 0.28;
        salida.connect(audio.destination);
        salida.connect(eco); eco.connect(vuelta); vuelta.connect(eco); vuelta.connect(audio.destination);
      }
      audio.resume();
      sonando = true;
    } catch { sonando = false; }
    pintarBoton();
  }
  function apagar() { sonando = false; if (audio) audio.suspend(); pintarBoton(); }
  function pintarBoton() {
    if (!boton) return;
    boton.classList.toggle('activo', sonando);
    boton.querySelector('span').textContent = sonando ? 'Sonido activado' : 'Activar sonido';
    boton.setAttribute('aria-pressed', sonando);
  }

  function tocar(e, fuerza = 1) {
    if (!sonando || !audio || audio.state !== 'running') return;
    const t = audio.currentTime;
    const g = audio.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.07 * fuerza, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    g.connect(salida);
    // Dos ondas: la nota y su octava, bajita. Da un timbre de campanita.
    [[e.nota, 1], [e.nota * 2, 0.22]].forEach(([f, v]) => {
      const o = audio.createOscillator(), gv = audio.createGain();
      o.type = 'sine'; o.frequency.value = f; gv.gain.value = v;
      o.connect(gv); gv.connect(g);
      o.start(t); o.stop(t + 2.3);
    });
  }

  if (boton) boton.addEventListener('click', e => { e.stopPropagation(); sonando ? apagar() : prender(); });
  // El primer clic en cualquier lado de la portada también lo prende
  seccion.addEventListener('pointerdown', e => { if (!audio && !e.target.closest('#sonido, a')) prender(); });

  /* ---------- Dibujo ---------- */
  let ancho = 0, alto = 0, cerca = null, proxima = 1.5, antes = 0, tiempo = 0, andando = false;
  const raton = { x: -999, y: -999 };

  function medir() {
    const d = Math.min(2, window.devicePixelRatio || 1);
    ancho = lienzo.clientWidth; alto = lienzo.clientHeight;
    lienzo.width = ancho * d; lienzo.height = alto * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  function encender(e, fuerza) { e.pulso = tiempo; tocar(e, fuerza); }

  function cuadro(ahora) {
    if (!andando) return;
    const dt = Math.min(0.05, (ahora - antes) / 1000 || 0);
    antes = ahora; tiempo += dt;

    const cx = ancho / 2, cy = alto / 2, R = Math.hypot(ancho, alto) / 2;
    ctx.clearRect(0, 0, ancho, alto);

    let mejor = null, dMin = 18;
    for (const e of estrellas) {
      if (!QUIETO) e.ang += e.vel * dt;
      e.x = cx + R * e.r * Math.cos(e.ang);
      e.y = cy + R * e.r * Math.sin(e.ang) * 0.6;            // aplastada: se ve como un disco inclinado
      const d = Math.hypot(e.x - raton.x, e.y - raton.y);
      if (d < dMin) { dMin = d; mejor = e; }

      const edad = tiempo - e.pulso;                          // segundos desde que se encendió
      const vivo = edad < 1.8 ? 1 - edad / 1.8 : 0;
      const c = COLOR[e.color];
      if (vivo) {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.tam + 4 + edad * 16, 0, 6.2832);
        ctx.strokeStyle = `rgba(${c},${0.45 * vivo})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.tam + vivo * 2.2, 0, 6.2832);
      ctx.fillStyle = `rgba(${c},${Math.min(1, e.brillo + vivo * 0.5)})`;
      ctx.fill();
    }

    // Pasar el mouse por una canción: se enciende, suena y dice cuál es
    if (mejor !== cerca) { cerca = mejor; if (cerca) encender(cerca, 1); }
    if (cerca) {
      const texto = `${cerca.titulo} — ${cerca.artista}`;
      ctx.font = '500 12.5px Inter, system-ui, sans-serif';
      const w = ctx.measureText(texto).width;
      const tx = Math.max(10, Math.min(ancho - w - 10, cerca.x - w / 2)), ty = cerca.y - 14;
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineJoin = 'round';
      ctx.strokeText(texto, tx, ty);
      ctx.fillStyle = '#12110f';
      ctx.fillText(texto, tx, ty);
    }

    // Cada tanto, una canción al azar se enciende sola
    if (!QUIETO && tiempo > proxima) {
      proxima = tiempo + 1.3 + Math.random() * 1.9;
      const visibles = estrellas.filter(e => e.color !== 'gris' && e.x > 0 && e.x < ancho && e.y > 0 && e.y < alto);
      if (visibles.length) encender(visibles[Math.floor(Math.random() * visibles.length)], 0.7);
    }

    if (QUIETO) { andando = false; return; }
    requestAnimationFrame(cuadro);
  }

  // Solo corre mientras la portada está a la vista
  function revisar() {
    const visible = seccion.classList.contains('activa') && !document.hidden;
    if (visible && !andando) { andando = true; medir(); antes = performance.now(); requestAnimationFrame(cuadro); }
    if (!visible) { andando = false; if (sonando) audio.suspend(); }
    else if (sonando && audio) audio.resume();
  }

  seccion.addEventListener('pointermove', e => {
    const c = lienzo.getBoundingClientRect();
    raton.x = e.clientX - c.left; raton.y = e.clientY - c.top;
  });
  seccion.addEventListener('pointerleave', () => { raton.x = raton.y = -999; });
  addEventListener('resize', () => { medir(); if (QUIETO) { andando = true; requestAnimationFrame(cuadro); } });
  addEventListener('hashchange', () => setTimeout(revisar, 0));
  document.addEventListener('visibilitychange', revisar);
  new MutationObserver(revisar).observe(seccion, { attributes: true, attributeFilter: ['class'] });
  pintarBoton();
  revisar();
})();
