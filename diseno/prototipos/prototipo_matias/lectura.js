/* =========================================================
   P&P — la IA que explica tu resultado (lado del navegador)

   Arma el paquete de números de la canción y se lo manda a la
   función del servidor (api/lectura.js), que es la que habla con
   la IA. Si la IA no está disponible (sin clave, sin internet, o
   la app abierta como archivo), la pantalla se queda con la lectura
   fija del modelo: nunca se rompe y nunca inventa.

   Lo que se manda NO incluye el título ni el artista: la IA solo
   puede hablar de lo que medimos.
   ========================================================= */
(function () {
  'use strict';
  const { R, INFO, valorCorto, aportes } = window.PP;

  function paquete(a, p, z, c) {
    const conValor = (nombre) => aportes(nombre, a.rasgos)
      .filter(x => Math.abs(x.pts) >= 1)
      .sort((x, y) => Math.abs(y.pts) - Math.abs(x.pts))
      .slice(0, 4)
      .map(x => ({ nombre: INFO[x.k].nombre, valor: valorCorto(x.k, a.rasgos[x.k]), pts: Math.round(x.pts) }));
    return {
      fuente: a.fuente,
      pres: { v: Math.round(p.pres.v), lo: Math.round(p.pres.lo), hi: Math.round(p.pres.hi) },
      pop: { v: Math.round(p.pop.v), lo: Math.round(p.pop.lo), hi: Math.round(p.pop.hi) },
      zona: z.nombre,
      rasgos: R.map(k => ({ nombre: INFO[k].nombre, valor: valorCorto(k, a.rasgos[k]) })),
      aportesPres: conValor('prestigio'),
      aportesPop: conValor('popularidad'),
      conflicto: c ? { nombre: INFO[c.k].nombre, valor: valorCorto(c.k, a.rasgos[c.k]), ap: Math.round(c.ap), aq: Math.round(c.aq) } : null,
    };
  }

  // Una sola lectura en vuelo por canción: si el usuario cambia de canción
  // antes de que llegue, la respuesta vieja se descarta.
  let vigente = 0;

  async function lecturaIA(a, p, z, c, { caja, parrafo, pie }) {
    const mia = ++vigente;
    if (location.protocol === 'file:') return;          // abierta como archivo: no hay servidor
    caja.classList.add('escribiendo');
    pie.textContent = 'La IA está leyendo tus números…';
    try {
      const r = await fetch('/api/lectura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paquete(a, p, z, c)),
      });
      if (mia !== vigente) return;
      const j = r.ok ? await r.json() : { disponible: false };
      if (j.disponible && j.texto) {
        parrafo.innerHTML = j.texto.split(/\n\s*\n/).map(t => `<span class="parrafo">${esc(t.trim())}</span>`).join('');
        pie.textContent = 'Escrita por una IA a partir de tus números. Lo que dice sale del modelo; la IA solo lo pone en palabras.';
        caja.classList.add('con-ia');
      } else {
        pie.textContent = 'Lectura del modelo. La versión escrita por IA no está disponible ahora.';
      }
    } catch {
      if (mia !== vigente) return;
      pie.textContent = 'Lectura del modelo. La versión escrita por IA no está disponible ahora.';
    } finally {
      if (mia === vigente) caja.classList.remove('escribiendo');
    }
  }

  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  window.PP.lecturaIA = lecturaIA;
  window.PP.paqueteIA = paquete;
})();
