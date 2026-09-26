// Descarga categorías del Grammy desde Wikipedia y las parsea a CSV.
// Cada fila del CSV = una nominación (haya ganado o no).
//
// Uso: node scripts/fetch_grammy.js
// Salida: datasets/grammy_nominaciones.csv
//
// El parser lee los ENCABEZADOS de cada tabla para saber qué columna es el título
// y cuál el intérprete. Es necesario porque las categorías no comparten estructura:
//   Record of the Year -> Year | Record | Artist(s) | Production team
//   Song of the Year   -> Year | Song   | Songwriter(s) | Artist(s)
// Tomar "la última columna" daría el equipo de producción en un caso y el
// intérprete en el otro.

const fs = require('fs');
const path = require('path');

const CATEGORIAS = [
  ['Grammy_Award_for_Record_of_the_Year',             'Record of the Year'],
  ['Grammy_Award_for_Song_of_the_Year',               'Song of the Year'],
  ['Grammy_Award_for_Best_Pop_Solo_Performance',      'Best Pop Solo Performance'],
  ['Grammy_Award_for_Best_Pop_Duo/Group_Performance', 'Best Pop Duo/Group Performance'],
  ['Grammy_Award_for_Best_Rock_Song',                 'Best Rock Song'],
  ['Grammy_Award_for_Best_Rock_Performance',          'Best Rock Performance'],
  ['Grammy_Award_for_Best_R&B_Song',                  'Best R&B Song'],
  ['Grammy_Award_for_Best_R&B_Performance',           'Best R&B Performance'],
  ['Grammy_Award_for_Best_Country_Song',              'Best Country Song'],
  ['Grammy_Award_for_Best_Country_Solo_Performance',  'Best Country Solo Performance'],
  ['Grammy_Award_for_Best_Rap_Song',                  'Best Rap Song'],
  ['Grammy_Award_for_Best_Rap_Performance',           'Best Rap Performance'],
  ['Grammy_Award_for_Best_Melodic_Rap_Performance',   'Best Melodic Rap Performance'],
  ['Grammy_Award_for_Best_Dance_Recording',           'Best Dance Recording'],
  ['Grammy_Award_for_Best_Metal_Performance',         'Best Metal Performance'],
  ['Grammy_Award_for_Best_Alternative_Music_Album',   'Best Alternative Music Album'],
];

const limpiar = s => String(s || '')
  .replace(/<ref[^>]*\/>/g, '')
  .replace(/<ref[\s\S]*?<\/ref>/g, '')
  .replace(/\{\{\s*sortname\s*\|([^|}]*)\|([^|}]*)(?:\|[^}]*)?\}\}/gi, '$1 $2')
  .replace(/\{\{\s*(?:sort|nowrap|nobr|lang)\s*\|(?:[^|}]*\|)?([^|}]*)\}\}/gi, '$1')
  .replace(/\{\{[\s\S]*?\}\}/g, '')
  .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1')
  .replace(/\[\[([^\]]*)\]\]/g, '$1')
  .replace(/\[https?:\/\/\S+\s([^\]]*)\]/g, '$1')
  .replace(/'''/g, '').replace(/''/g, '')
  .replace(/"([^"]+)"/g, '$1')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/^[\s"“”']+|[\s"“”']+$/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const RE_ATTRS = /^\s*((?:[a-zA-Z-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s|]+)\s*)+)\|(?!\|)/;
const cuerpoCelda = t => { const m = t.match(RE_ATTRS); return m ? t.slice(m[0].length) : t; };
const attrsCelda  = t => { const m = t.match(RE_ATTRS); return m ? m[1] : ''; };

// Parte una tabla wikitext en filas; cada celda registra si venía de una línea "!"
function filasDeTabla(tabla) {
  const filas = [];
  let actual = null;
  for (const L of tabla.split('\n')) {
    if (/^\s*\{\|/.test(L)) continue;
    if (/^\s*\|\}/.test(L)) break;
    if (/^\s*\|-/.test(L)) { actual = { attrs: L, celdas: [] }; filas.push(actual); continue; }
    if (!actual) { actual = { attrs: '', celdas: [] }; filas.push(actual); }
    if (/^\s*[|!]/.test(L)) {
      const esHeader = /^\s*!/.test(L);
      const sinPrefijo = L.replace(/^\s*[|!]+\s?/, '');
      for (const p of sinPrefijo.split(/\|\||!!/)) actual.celdas.push({ crudo: p, esHeader });
    } else if (actual.celdas.length) {
      actual.celdas[actual.celdas.length - 1].crudo += '\n' + L;
    }
  }
  return filas;
}

const esAnio = txt => {
  const t = limpiar(txt);
  if (t.length > 60) return null;
  const m = t.match(/\b(19[5-9]\d|20[0-4]\d)\b/);
  return m ? +m[1] : null;
};

function parsearTabla(tabla, categoria, salida) {
  const filas = filasDeTabla(tabla);

  // --- Encabezados: primera fila mayoritariamente de celdas "!" ---
  let headers = null;
  for (const f of filas) {
    if (!f.celdas.length) continue;
    const nh = f.celdas.filter(c => c.esHeader).length;
    if (nh >= 2 && nh >= f.celdas.length - 1) {
      headers = f.celdas.map(c => limpiar(cuerpoCelda(c.crudo)));
      break;
    }
  }
  if (!headers) headers = ['Year', 'Title', 'Artist'];

  const buscar = re => headers.findIndex(h => re.test(h));
  let idxTitulo = buscar(/^(song|record|record|work|title|album|nominee)/i);
  // Interprete: preferimos "Artist(s)"/"Performer" y descartamos "Production team"
  let idxArtista = headers.findIndex(h => /artist|performer/i.test(h) && !/production/i.test(h));
  if (idxArtista < 0) idxArtista = headers.findIndex(h => /songwriter|composer/i.test(h));
  if (idxTitulo < 0) idxTitulo = 1;
  if (idxArtista < 0) idxArtista = Math.min(2, headers.length - 1);

  // Cuantas columnas tiene la tabla de verdad (puede traer una de "Ref" fuera de los encabezados)
  const maxCeldas = filas.reduce((m, f) => Math.max(m, f.celdas.length), 0);
  const ncols = Math.max(headers.length, maxCeldas);

  // Wikipedia usa rowspan cuando dos canciones comparten ano o artista: la segunda
  // fila NO trae esa celda. Sin esto, las columnas se corren y el artista queda vacio.
  const arrastre = new Array(ncols).fill(null);
  let anioActual = null;

  for (const fila of filas) {
    const hayArrastre = arrastre.some(a => a && a.restantes > 0);
    if (!fila.celdas.length && !hayArrastre) continue;
    if (fila.celdas.length && fila.celdas.every(c => c.esHeader) && fila.celdas.length >= 2) continue;

    const propias = fila.celdas.map(c => ({
      texto: cuerpoCelda(c.crudo),
      attrs: attrsCelda(c.crudo),
      crudo: c.crudo,
    }));

    // Rearmamos la fila completa: cada columna sale del arrastre o de las celdas propias
    const celdas = [];
    let k = 0;
    for (let i = 0; i < ncols; i++) {
      if (arrastre[i] && arrastre[i].restantes > 0) {
        celdas.push(arrastre[i].celda);
        arrastre[i].restantes--;
      } else if (k < propias.length) {
        const c = propias[k++];
        celdas.push(c);
        const m = c.attrs.match(/rowspan\s*=\s*"?(\d+)"?/i);
        arrastre[i] = (m && +m[1] > 1) ? { celda: c, restantes: +m[1] - 1 } : null;
      } else {
        celdas.push(null);
      }
    }

    const anioAca = celdas[0] ? esAnio(celdas[0].texto) : null;
    if (anioAca) anioActual = anioAca;
    if (!anioActual) continue;

    const cTitulo  = celdas[idxTitulo];
    const cArtista = celdas[idxArtista];

    const titulo  = cTitulo  ? limpiar(cTitulo.texto)  : '';
    let   artista = cArtista ? limpiar(cArtista.texto) : '';

    // Ultimo recurso: si sigue vacio, la ultima celda con texto de la fila
    if (!artista) {
      for (let i = ncols - 1; i > idxTitulo; i--) {
        if (celdas[i]) { const v = limpiar(celdas[i].texto); if (v) { artista = v; break; } }
      }
    }

    if (!titulo || titulo.length > 150) continue;
    if (/^(year|song|record|work|artist|nominee|songwriter|production team|result|ref)/i.test(titulo)) continue;

    // Ganador: fila resaltada en amarillo, o contenido en negrita
    const gano = (/faeb86/i.test(fila.attrs) || propias.some(c => /'''/.test(c.texto))) ? 1 : 0;

    salida.push({ anio: anioActual, categoria, titulo, artista, ganador: gano });
  }
}

async function traer(pagina, intento = 1) {
  const url = 'https://en.wikipedia.org/w/api.php?action=parse&page=' +
    encodeURIComponent(pagina) + '&prop=wikitext&format=json&formatversion=2';
  const r = await fetch(url, {
    headers: { 'User-Agent': 'PyP-academic-project/0.1 (proyecto universitario)' },
  });
  const txt = await r.text();
  let j;
  try {
    j = JSON.parse(txt);
  } catch {
    if (intento < 6) {
      await new Promise(x => setTimeout(x, 20000 * intento));
      return traer(pagina, intento + 1);
    }
    throw new Error('respuesta no-JSON de Wikipedia: ' + txt.slice(0, 60));
  }
  if (j.error) throw new Error(j.error.info);
  return j.parse.wikitext;
}

(async () => {
  const todo = [];
  for (const [pagina, categoria] of CATEGORIAS) {
    try {
      const wt = await traer(pagina);
      const desde = wt.search(/==+\s*(Recipients|Winners|Recipients and nominees)\s*==+/i);
      const cuerpo = desde >= 0 ? wt.slice(desde) : wt;
      const tablas = cuerpo.match(/\{\|[\s\S]*?\n\s*\|\}/g) || [];
      const antes = todo.length;
      for (const t of tablas) parsearTabla(t, categoria, todo);
      const nuevas = todo.slice(antes);
      const anios = nuevas.map(n => n.anio);
      console.log(
        categoria.padEnd(32),
        String(nuevas.length).padStart(5), 'nom.',
        String(nuevas.filter(n => n.ganador).length).padStart(4), 'gan.',
        anios.length ? `${Math.min(...anios)}-${Math.max(...anios)}` : ''
      );
    } catch (e) {
      console.log(categoria.padEnd(32), 'ERROR:', e.message);
    }
    await new Promise(r => setTimeout(r, 3000));
  }

  const esc = v => { const s = String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const csv = ['anio,categoria,titulo,artista,ganador']
    .concat(todo.map(f => [f.anio, f.categoria, f.titulo, f.artista, f.ganador].map(esc).join(',')))
    .join('\n');

  const dest = path.join(__dirname, '..', 'datasets', 'grammy_nominaciones.csv');
  fs.writeFileSync(dest, csv);
  console.log(`\nTOTAL: ${todo.length} nominaciones, ${todo.filter(f => f.ganador).length} ganadoras`);
  console.log('->', dest);
})();
