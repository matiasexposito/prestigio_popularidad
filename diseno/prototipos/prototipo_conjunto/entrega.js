/* P&P — Entrega 1: pequeños ajustes de la capa que une las tres versiones. */
(function () {
  'use strict';
  const PP = window.PP;

  // La portada: si ya hay una canción analizada, "Ingresar" pasa a "Continuar" y vuelve al resultado
  PP.PINTAR.portada = () => {
    const b = document.getElementById('btn-ingresar');
    if (!b) return;
    const sigue = !!(PP.estado && PP.estado.analisis);
    const txt = sigue ? 'Continuar' : 'Ingresar';
    if (b.textContent !== txt) b.textContent = txt;
    b.setAttribute('href', sigue ? '#resultado' : '#bienvenida');
  };
  PP.PINTAR.portada();

  // Desde Historia, Cómo lo hicimos y Nosotros: si ya hay una canción analizada, el botón
  // vuelve al resultado en vez de mandar a subir otra.
  const volver = () => {
    const sigue = !!(PP.estado && PP.estado.analisis);
    document.querySelectorAll('.volver-app').forEach(a => {
      a.setAttribute('href', sigue ? '#resultado' : '#subir');
      a.textContent = sigue ? (a.classList.contains('boton') ? 'Volver a mi resultado' : 'Volver a mi resultado →')
                            : (a.classList.contains('boton') ? 'Probar la app' : 'Probar la app →');
    });
  };
  addEventListener('hashchange', volver);
  volver();
  // Las páginas largas (historia, cómo lo hicimos, nosotros) arrancan siempre arriba
  addEventListener('hashchange', () => {
    document.querySelectorAll('.cuerpo-scroll').forEach(c => { c.scrollTop = 0; });
  });
  // Un solo audio de fondo a la vez: los videos van sin sonido, así que no hay nada más que cuidar.
  // Si el navegador pide "reducir movimiento", loco.js y videos.js ya no animan.
})();
