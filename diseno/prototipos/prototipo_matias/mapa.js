/* Mapa — extraido tal cual del prototipo de Diogenes.
   Dibuja el SVG con la nube de canciones, las referencias y tu punto. */
(function () {
  const { M, valorCorto } = window.PP;
  const $ = (s, r = document) => r.querySelector(s);
  const MOVIMIENTO = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reflow = el => void el.getBoundingClientRect();

  /* ================= Mapa (SVG) ================= */

  const X0 = 60, X1 = 770, Y0 = 500, Y1 = 24;
  const px = p => X0 + (X1 - X0) * p / 100;
  const py = p => Y0 - (Y0 - Y1) * p / 100;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function refCirculo(r) {
    if (r.gano) return `<circle r="6" style="fill:var(--azul)"/>`;
    if (r.nominada) return `<circle r="5.5" style="fill:var(--fondo);stroke:var(--azul);stroke-width:2"/>`;
    return `<circle r="5.5" style="fill:var(--ambar)"/>`;
  }

  /* Las 100 canciones del mapa. Son canciones reales, cada una ubicada con sus dos
     puntajes, calculados con el mismo modelo que se usa para tu canción:
       - las 19 con nombre (las referencias)
       - 19 nominadas o ganadoras más y 32 éxitos nunca nominados, de las conocidas
       - 30 que no entraron al ranking
     En total: 30 nominadas, 40 éxitos y 30 que no entraron. La elección es al azar
     pero con semilla fija, así el mapa es el mismo cada vez. */
  (function cienCanciones() {
    const { puntajes, R } = window.PP;
    let s = 2026;
    const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const mezclar = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(azar() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const clave = t => String(t).toLowerCase();
    const usadas = new Set(M.referencias.map(r => clave(r.titulo)));
    const sinRepetir = f => !usadas.has(clave(f[0])) && usadas.add(clave(f[0]));
    const deFila = f => {
      const r = {}; R.forEach((k, i) => { r[k] = f[5 + i]; });
      const p = puntajes(r);
      return [+p.pop.v.toFixed(1), +p.pres.v.toFixed(1), f[3] ? 'gano' : f[4] ? 'nominada' : 'hit', f[0], f[1], f[2]];
    };
    const conocidas = mezclar(M.buscables);
    const nominadas = conocidas.filter(f => f[4] || f[3]).filter(sinRepetir).slice(0, 19).map(deFila);
    const exitos = conocidas.filter(f => !f[4] && !f[3]).filter(sinRepetir).slice(0, 32).map(deFila);
    const afuera = M.fondo.filter(f => f[2] === 'control' && !usadas.has(clave(f[3])) && usadas.add(clave(f[3]))).slice(0, 30);
    M.fondoTodo = M.fondo;
    M.fondo = [...afuera, ...exitos, ...nominadas];   // las azules se dibujan arriba de todo
  })();

  /* El mapa se arma por capas: ejes y puntos de fondo se dibujan una sola vez;
     referencias, "antes" y "tu canción" se actualizan. Así el punto de tu canción
     se desliza en el simulador en vez de redibujarse, y la entrada se anima. */
  const choca = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  const anchoTexto = s => s.length * 6.7 + 4;

  function mapa(svg, { tu, antes, etiquetas = 'todas', refs = true, animar = false } = {}) {
    if (!svg._capas) {
      svg.innerHTML = `
        <g class="m-base">
          <line class="m-eje" x1="${X0}" y1="${Y0}" x2="${X1}" y2="${Y0}"/>
          <line class="m-eje" x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y1}"/>
          <line class="m-guia" x1="${px(50)}" y1="${Y1}" x2="${px(50)}" y2="${Y0}"/>
          <line class="m-guia" x1="${X0}" y1="${py(50)}" x2="${X1}" y2="${py(50)}"/>
          <text class="m-cuadrante" x="${X0 + 10}" y="${Y1 + 18}">prestigio sin público</text>
          <text class="m-cuadrante" x="${X1 - 10}" y="${Y1 + 18}" text-anchor="end">las dos cosas</text>
          <text class="m-cuadrante" x="${X1 - 10}" y="${Y0 - 12}" text-anchor="end">hit puro</text>
          <text class="m-cuadrante" x="${X0 + 10}" y="${Y0 - 12}">ni una cosa ni la otra</text>
          <text class="m-num" x="${X0}" y="${Y0 + 16}" text-anchor="middle">0</text>
          <text class="m-num" x="${px(50)}" y="${Y0 + 16}" text-anchor="middle">50</text>
          <text class="m-num" x="${X1}" y="${Y0 + 16}" text-anchor="middle">100</text>
          <text class="m-num" x="${X0 - 8}" y="${py(50) + 4}" text-anchor="end">50</text>
          <text class="m-num" x="${X0 - 8}" y="${Y1 + 4}" text-anchor="end">100</text>
          <text class="m-eje-texto m-eje-pop" x="${(X0 + X1) / 2}" y="${Y0 + 40}" text-anchor="middle">popularidad →</text>
          <text class="m-eje-texto m-eje-pres" x="22" y="${(Y0 + Y1) / 2}" text-anchor="middle" transform="rotate(-90 22 ${(Y0 + Y1) / 2})">prestigio →</text>
        </g>
        <g class="m-capa-fondo">${M.fondo.map(([x, y, g], i) => `<circle class="m-fondo g-${g}" data-f="${i}" cx="${px(x).toFixed(1)}" cy="${py(y).toFixed(1)}" r="${g === 'control' ? 3.4 : 4.4}" style="--d:${Math.round(px(x) - X0)}"/>`).join('')}</g>
        <g class="m-capa-antes"></g><g class="m-capa-refs"></g><g class="m-capa-tu"></g>`;
      svg._capas = { fondo: $('.m-capa-fondo', svg), refs: $('.m-capa-refs', svg), antes: $('.m-capa-antes', svg), tu: $('.m-capa-tu', svg) };
      window.PP.activarPuntos?.(svg);   // escuchar.js: click en un punto para oir la cancion
    }
    const C = svg._capas;
    if (animar && MOVIMIENTO) { C.fondo.classList.remove('anim'); reflow(svg); C.fondo.classList.add('anim'); }

    // Espacio ya ocupado: rótulos de cuadrante y, si hay, tu canción con su etiqueta
    const ocupado = [
      { x0: X0, x1: X0 + 150, y0: Y1 + 4, y1: Y1 + 24 }, { x0: X1 - 100, x1: X1, y0: Y1 + 4, y1: Y1 + 24 },
      { x0: X1 - 70, x1: X1, y0: Y0 - 26, y1: Y0 - 6 }, { x0: X0, x1: X0 + 150, y0: Y0 - 26, y1: Y0 - 6 },
    ];
    let tx, ty, ty_txt;
    if (tu) {
      tx = px(tu.pop); ty = py(tu.pres); ty_txt = ty > 440 ? -26 : 38;
      const w = antes ? 62 : 104;
      ocupado.push({ x0: tx - 19, x1: tx + 19, y0: ty - 19, y1: ty + 19 }, { x0: tx - w / 2, x1: tx + w / 2, y0: ty + ty_txt - 14, y1: ty + ty_txt + 4 });
    }

    if (refs) {
      let lista = M.referencias.map((r, i) => ({ ...r, i, x: px(r.pop), y: py(r.pres) }));
      let cercanas = null;
      if (etiquetas === 'cercanas' && tu) {
        lista.forEach(r => { r.d = Math.hypot(r.pop - tu.pop, r.pres - tu.pres); });
        cercanas = new Set([...lista].sort((a, b) => a.d - b.d).slice(0, 6).map(r => r.titulo));
        lista.sort((a, b) => a.d - b.d);   // las cercanas eligen lugar primero
      }
      lista.forEach(r => ocupado.push({ x0: r.x - 7, x1: r.x + 7, y0: r.y - 7, y1: r.y + 7 }));
      // Cada etiqueta prueba derecha, izquierda, arriba y abajo; si no entra en ningún lado, se oculta
      const html = lista.map(r => {
        const lejos = cercanas && !cercanas.has(r.titulo);
        let txt = '';
        if (!lejos) {
          const w = anchoTexto(r.titulo), der = r.x > 620;
          const lados = [
            { x: 11, y: 4, a: 'start', c: { x0: r.x + 9, x1: r.x + 11 + w, y0: r.y - 9, y1: r.y + 7 } },
            { x: -11, y: 4, a: 'end', c: { x0: r.x - 11 - w, x1: r.x - 9, y0: r.y - 9, y1: r.y + 7 } },
            { x: 0, y: -11, a: 'middle', c: { x0: r.x - w / 2, x1: r.x + w / 2, y0: r.y - 24, y1: r.y - 8 } },
            { x: 0, y: 20, a: 'middle', c: { x0: r.x - w / 2, x1: r.x + w / 2, y0: r.y + 8, y1: r.y + 24 } },
          ];
          if (der) [lados[0], lados[1]] = [lados[1], lados[0]];
          // Si no entra pegada al punto, prueba un poco más corrida en diagonal
          for (const dy of [-15, 15, -28, 28]) {
            lados.push({ dy, x: 11, y: 4 + dy, a: 'start', c: { x0: r.x + 9, x1: r.x + 11 + w, y0: r.y - 9 + dy, y1: r.y + 7 + dy } });
            lados.push({ dy, x: -11, y: 4 + dy, a: 'end', c: { x0: r.x - 11 - w, x1: r.x - 9, y0: r.y - 9 + dy, y1: r.y + 7 + dy } });
          }
          const ok = lados.find(l => l.c.x0 >= 4 && l.c.x1 <= 796 && !ocupado.some(o => choca(o, l.c)));
          if (ok) {
            ocupado.push(ok.c);
            const guia = ok.dy ? `<line class="m-guia-ref" x1="${ok.x > 0 ? 5 : -5}" y1="${ok.dy > 0 ? 4 : -4}" x2="${ok.x > 0 ? 9 : -9}" y2="${ok.dy}"/>` : '';
            txt = `${guia}<text x="${ok.x}" y="${ok.y}" text-anchor="${ok.a}">${esc(r.titulo)}</text>`;
          }
        }
        return `<g class="m-ref${lejos ? ' lejana' : ''}" data-ref="${r.i}" transform="translate(${r.x.toFixed(1)} ${r.y.toFixed(1)})" style="--i:${r.i}" ${lejos ? 'opacity=".45"' : ''}>
          ${refCirculo(r)}${txt}</g>`;
      }).join('');
      C.refs.classList.toggle('anim', animar && MOVIMIENTO);
      C.refs.innerHTML = html;
    } else C.refs.innerHTML = '';

    if (antes && tu) {
      const ax = px(antes.pop), ay = py(antes.pres);
      C.antes.innerHTML = `<circle class="m-antes" cx="${ax}" cy="${ay}" r="7"/>
        <text class="m-cuadrante" x="${ax}" y="${ay + 24}" text-anchor="middle">antes</text>
        ${Math.hypot(tx - ax, ty - ay) > 12 ? `<line class="m-flecha" x1="${ax}" y1="${ay}" x2="${tx}" y2="${ty}"/>` : ''}`;
    } else C.antes.innerHTML = '';

    if (tu) {
      let g = $('.m-tu-g', C.tu);
      const nuevo = !g;
      if (nuevo) {
        C.tu.innerHTML = `<g class="m-tu-g"><circle class="m-tu-onda" r="9"/><circle class="m-tu-halo" r="17"/><circle class="m-tu" r="8"/><text class="m-tu-texto" text-anchor="middle"></text></g>`;
        g = $('.m-tu-g', C.tu);
      }
      const t = $('.m-tu-texto', g);
      t.setAttribute('y', ty_txt);
      t.textContent = antes ? 'ahora' : 'tu canción';
      // La posición va en el atributo transform (unidades del SVG), no en CSS con px:
      // Safari escala los px de CSS con el zoom del navegador (Cmd +/−) y el punto se
      // corría respecto del resto del mapa. El deslizamiento se anima a mano.
      cancelAnimationFrame(g._raf);
      const poner = (x, y) => { g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); g._pos = [x, y]; };
      const desde = g._pos;
      if (nuevo || animar || !desde || !MOVIMIENTO) poner(tx, ty);
      else {
        const t0 = performance.now(), dur = 200;
        const paso = t => {
          const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          poner(desde[0] + (tx - desde[0]) * e, desde[1] + (ty - desde[1]) * e);
          if (k < 1) g._raf = requestAnimationFrame(paso);
        };
        g._raf = requestAnimationFrame(paso);
      }
      if (animar && MOVIMIENTO) { g.classList.remove('cae'); reflow(g); g.classList.add('cae'); }
    } else C.tu.innerHTML = '';
  }


  window.PP.mapa = mapa;
})();
