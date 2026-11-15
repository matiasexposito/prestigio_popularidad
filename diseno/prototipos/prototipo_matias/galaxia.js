/* =========================================================
   P&P — la galaxia de canciones (portada y "creá tu cuenta")

   Cada punto es una canción real de la base:
     azul  = fue nominada al Grammy
     ámbar = entró al Hot 100
     gris  = ninguna de las dos
   Giran muy despacio, como una galaxia. Si pasás el mouse por una,
   te dice cuál es.

   El sonido (solo en la portada) es una melodía lenta: una nota por
   vez, a ritmo parejo, siempre dentro del mismo acorde. Cada nota
   enciende una canción. Nunca suenan dos notas al azar una arriba
   de la otra, así que siempre queda armónico.

   Arranca apagado: los navegadores no dejan que una página suene
   sola. Se prende con el botón o con el primer clic.
   ========================================================= */
(function () {
  'use strict';
  const M = window.MODELO;
  if (!M || !M.fondo) return;

  const QUIETO = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLOR = { azul: '27,79,216', ambar: '180,83,9', gris: '150,146,138' };
  const colorDe = g => (g === 'ambas' || g === 'premiada') ? 'azul' : g === 'hit' ? 'ambar' : 'gris';
  const de = (c, n) => M.fondo.filter(f => colorDe(f[2]) === c).slice(0, n);

  /* ---------- Sonido: una melodía, no notas sueltas ---------- */
  // Cuatro acordes que se repiten (Do, La menor, Fa, Sol). De cada uno se tocan
  // cuatro notas, de a una, subiendo y bajando. Frecuencias en hercios.
  const ACORDES = [
    [261.63, 329.63, 392.00, 493.88],   // Do con séptima mayor
    [220.00, 261.63, 329.63, 392.00],   // La menor con séptima
    [174.61, 220.00, 261.63, 329.63],   // Fa con séptima mayor
    [196.00, 246.94, 293.66, 392.00],   // Sol
  ];
  const DIBUJO = [0, 2, 1, 3, 2, 1, 3, 2];   // en qué orden se tocan las cuatro notas del acorde
  const PULSO = 1.15;                         // segundos entre nota y nota

  let audio = null, salida = null, sonando = false, paso = 0;
  const boton = document.getElementById('sonido');

  function prender() {
    try {
      if (!audio) {
        audio = new (window.AudioContext || window.webkitAudioContext)();
        salida = audio.createGain();
        salida.gain.value = 0.5;
        salida.connect(audio.destination);
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

  // La nota que toca ahora, según por dónde va la melodía
  function notaSiguiente() {
    const acorde = ACORDES[Math.floor(paso / DIBUJO.length) % ACORDES.length];
    const nota = acorde[DIBUJO[paso % DIBUJO.length]];
    paso++;
    return nota;
  }

  function tocar(frecuencia, aguda) {
    if (!sonando || !audio || audio.state !== 'running') return;
    const t = audio.currentTime, f = aguda ? frecuencia * 2 : frecuencia;
    const g = audio.createGain();
    // Entra suave y se apaga antes de que llegue la próxima: no se pisan
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.085, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + PULSO * 1.6);
    g.connect(salida);
    [[f, 1], [f * 2, 0.12]].forEach(([hz, v]) => {
      const o = audio.createOscillator(), gv = audio.createGain();
      o.type = 'sine'; o.frequency.value = hz; gv.gain.value = v;
      o.connect(gv); gv.connect(g);
      o.start(t); o.stop(t + PULSO * 1.7);
    });
  }

  if (boton) boton.addEventListener('click', e => { e.stopPropagation(); sonando ? apagar() : prender(); });

  /* ---------- Una galaxia por lienzo ---------- */
  function montar(lienzo, { conSonido, cuantas, hueco, opacidad }) {
    const seccion = lienzo.closest('.pantalla');
    const ctx = lienzo.getContext('2d');

    // Azar con semilla: la galaxia es la misma cada vez que se abre
    let semilla = 97;
    const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;

    const elegidas = [...de('azul', cuantas[0]), ...de('ambar', cuantas[1]), ...de('gris', cuantas[2])];
    const estrellas = elegidas.map(([, , grupo, titulo, artista]) => {
      const r = hueco + Math.pow(azar(), 0.8) * (1.05 - hueco);   // distancia al centro (el medio queda libre)
      const color = colorDe(grupo);
      return {
        titulo, artista, color, r,
        ang: Math.floor(azar() * 2) * Math.PI + r * 3.4 + (azar() - 0.5) * 1.5,   // dos brazos en espiral
        vel: 0.016 / (0.35 + r),                                 // las de adentro giran más rápido
        tam: color === 'gris' ? 1.5 + azar() * 1.5 : color === 'azul' ? 3.2 + azar() * 2.4 : 2.2 + azar() * 2.6,
        brillo: (color === 'gris' ? 0.5 : color === 'azul' ? 0.75 + azar() * 0.2 : 0.5 + azar() * 0.35) * opacidad,
        pulso: -9, x: 0, y: 0,
      };
    });

    let ancho = 0, alto = 0, cerca = null, proxima = 1, antes = 0, tiempo = 0, andando = false;
    const raton = { x: -999, y: -999 };

    function medir() {
      const d = Math.min(2, window.devicePixelRatio || 1);
      ancho = lienzo.clientWidth; alto = lienzo.clientHeight;
      lienzo.width = ancho * d; lienzo.height = alto * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    }

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

      // Pasar el mouse por una canción: se enciende y dice cuál es (sin sonido propio,
      // para no pisar la melodía)
      if (mejor !== cerca) { cerca = mejor; if (cerca) cerca.pulso = tiempo; }
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

      // A ritmo parejo, una canción se enciende y suena la nota que sigue en la melodía
      if (!QUIETO && tiempo > proxima) {
        proxima = tiempo + PULSO;
        const visibles = estrellas.filter(e => e.color !== 'gris' && e.x > 0 && e.x < ancho && e.y > 0 && e.y < alto);
        if (visibles.length) {
          const e = visibles[Math.floor(Math.random() * visibles.length)];
          e.pulso = tiempo;
          if (conSonido) tocar(notaSiguiente(), e.color === 'azul');   // las nominadas, una octava más arriba
        }
      }

      if (QUIETO) { andando = false; return; }
      requestAnimationFrame(cuadro);
    }

    // Solo corre mientras su pantalla está a la vista
    function revisar() {
      const visible = seccion.classList.contains('activa') && !document.hidden;
      if (visible && !andando) { andando = true; medir(); antes = performance.now(); requestAnimationFrame(cuadro); }
      if (!visible) andando = false;
      if (conSonido && audio && sonando) (visible ? audio.resume() : audio.suspend());
    }

    if (conSonido) {
      // El primer clic en cualquier lado de la portada también prende el sonido
      seccion.addEventListener('pointerdown', e => { if (!audio && !e.target.closest('#sonido, a')) prender(); });
    }
    seccion.addEventListener('pointermove', e => {
      const c = lienzo.getBoundingClientRect();
      raton.x = e.clientX - c.left; raton.y = e.clientY - c.top;
    });
    seccion.addEventListener('pointerleave', () => { raton.x = raton.y = -999; });
    addEventListener('resize', () => { medir(); if (QUIETO) { andando = true; requestAnimationFrame(cuadro); } });
    document.addEventListener('visibilitychange', revisar);
    new MutationObserver(revisar).observe(seccion, { attributes: true, attributeFilter: ['class'] });
    revisar();
  }

  const portada = document.getElementById('galaxia');
  if (portada) montar(portada, { conSonido: true, cuantas: [30, 110, 100], hueco: 0.27, opacidad: 1 });
  // En "creá tu cuenta" el formulario ocupa el centro: menos canciones, más lejos y más suaves
  const cuenta = document.getElementById('galaxia-cuenta');
  if (cuenta) montar(cuenta, { conSonido: false, cuantas: [24, 70, 50], hueco: 0.5, opacidad: 0.8 });
  pintarBoton();
})();
