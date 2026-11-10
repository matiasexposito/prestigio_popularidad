/* Convierte los documentos .md en paginas HTML del sitio.
   Se corre a mano cuando cambia alguno:  node armar_documentos.js
   No usa librerias: solo las marcas que usamos de verdad en los tres
   documentos (titulos, listas, tablas, citas, negrita, itálica, codigo). */
const fs = require('fs');
const path = require('path');

const DOCS = [
  { md: 'la_pagina.md',            salida: 'la-pagina.html',            titulo: 'Qué hace cada pantalla' },
  { md: 'decisiones_de_diseno.md', salida: 'decisiones-de-diseno.html', titulo: 'Las decisiones de diseño' },
  { md: '../../../analisis/la_letra.md',    salida: 'la-letra.html',             titulo: 'Cómo impacta la letra' },
];

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Lo de adentro de un renglon: codigo primero, para que no se toque lo de adentro
function enlinea(s) {
  const guardado = [];
  s = esc(s).replace(/`([^`]+)`/g, (_, c) => `\u0000${guardado.push(`<code>${c}</code>`) - 1}\u0000`);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[\s(—])\*([^*]+)\*/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => guardado[i]);
}

function aHtml(md) {
  const lineas = md.split(/\r?\n/);
  const out = [];
  let i = 0;

  const fila = (l, celda) => '<tr>' + l.slice(1, -1).split('|')
    .map(c => `<${celda}>${enlinea(c.trim())}</${celda}>`).join('') + '</tr>';

  while (i < lineas.length) {
    const l = lineas[i];

    if (!l.trim()) { i++; continue; }

    if (/^---+$/.test(l.trim())) { out.push('<hr>'); i++; continue; }

    const t = l.match(/^(#{1,4})\s+(.*)$/);
    if (t) { const n = t[1].length; out.push(`<h${n}>${enlinea(t[2])}</h${n}>`); i++; continue; }

    // tabla: encabezado, separador, filas
    if (l.trim().startsWith('|') && (lineas[i + 1] || '').trim().startsWith('|-')) {
      const filas = [fila(l.trim(), 'th')];
      i += 2;
      while (i < lineas.length && lineas[i].trim().startsWith('|')) filas.push(fila(lineas[i++].trim(), 'td'));
      out.push(`<div class="tabla-caja"><table>${filas.join('')}</table></div>`);
      continue;
    }

    if (/^>\s?/.test(l)) {
      const cita = [];
      while (i < lineas.length && /^>\s?/.test(lineas[i])) cita.push(lineas[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${enlinea(cita.join(' '))}</blockquote>`);
      continue;
    }

    const lista = l.match(/^(\s*)([-*]|\d+\.)\s+/);
    if (lista) {
      const ord = /\d/.test(lista[2]);
      const items = [];
      while (i < lineas.length && /^(\s*)([-*]|\d+\.)\s+/.test(lineas[i])) {
        items.push(`<li>${enlinea(lineas[i++].replace(/^(\s*)([-*]|\d+\.)\s+/, ''))}</li>`);
      }
      out.push(`<${ord ? 'ol' : 'ul'}>${items.join('')}</${ord ? 'ol' : 'ul'}>`);
      continue;
    }

    const parrafo = [];
    while (i < lineas.length && lineas[i].trim() && !/^(#{1,4}\s|---+$|>|\||\s*([-*]|\d+\.)\s)/.test(lineas[i])) {
      parrafo.push(lineas[i++]);
    }
    out.push(`<p>${enlinea(parrafo.join(' '))}</p>`);
  }
  return out.join('\n');
}

const plantilla = (titulo, cuerpo) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo} — P&amp;P</title>
<meta name="description" content="${titulo}. Prestigio &amp; Popularidad.">
<meta property="og:title" content="${titulo} — P&amp;P">
<meta property="og:description" content="Prestigio &amp; Popularidad: el sonido del éxito comercial y del reconocimiento de los Grammy.">
<meta property="og:type" content="article">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,300&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{
  --fondo:#fff; --tinta:#12110f; --texto:#3a3833; --tenue:#6b6862; --tenue-2:#8a8780;
  --borde:#e6e3dd; --azul:#1b4fd8; --ambar:#b45309; --radio:12px;
  --sans:"Inter",system-ui,-apple-system,sans-serif;
  --titulo:"Fraunces",Georgia,serif;
  --mono:"IBM Plex Mono",ui-monospace,monospace;
}
*{box-sizing:border-box}
body{margin:0;background:var(--fondo);color:var(--texto);font-family:var(--sans);font-size:16px;line-height:1.65;-webkit-text-size-adjust:100%}
.barra{border-bottom:1px solid var(--borde);padding:14px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.logo{font-family:var(--titulo);font-weight:600;font-size:19px;color:var(--tinta);text-decoration:none;letter-spacing:-.01em}
.barra .sep{width:1px;height:14px;background:var(--borde)}
.barra a.vinculo{font-size:12.5px;color:var(--tenue);text-decoration:none}
.barra a.vinculo:hover{color:var(--azul)}
main{max-width:660px;margin:0 auto;padding:40px 20px 80px}
h1{font-family:var(--titulo);font-weight:600;font-size:clamp(30px,7vw,40px);line-height:1.12;letter-spacing:-.02em;color:var(--tinta);margin:0 0 28px}
h2{font-family:var(--titulo);font-weight:600;font-size:clamp(21px,4.6vw,25px);line-height:1.25;letter-spacing:-.01em;color:var(--tinta);margin:44px 0 12px}
h3{font-family:var(--titulo);font-weight:600;font-size:18px;color:var(--tinta);margin:34px 0 10px}
h4{font-size:15px;font-weight:600;color:var(--tinta);margin:24px 0 8px}
p{margin:0 0 16px}
strong{color:var(--tinta);font-weight:600}
em{font-style:italic}
a{color:var(--azul)}
code{font-family:var(--mono);font-size:.88em;background:#f5f3f0;border:1px solid var(--borde);border-radius:5px;padding:1px 5px;color:var(--tinta)}
hr{border:0;border-top:1px solid var(--borde);margin:36px 0}
ul,ol{margin:0 0 16px;padding-left:22px}
li{margin:0 0 8px}
blockquote{margin:0 0 20px;padding:14px 18px;border-left:3px solid var(--ambar);background:#fdf8f1;border-radius:0 var(--radio) var(--radio) 0;color:var(--texto)}
blockquote p:last-child{margin:0}
.tabla-caja{overflow-x:auto;margin:0 0 22px;border:1px solid var(--borde);border-radius:var(--radio)}
table{border-collapse:collapse;width:100%;font-size:14.5px}
th,td{text-align:left;padding:10px 14px;border-bottom:1px solid var(--borde);vertical-align:top}
tr:last-child td{border-bottom:0}
th{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--tenue-2);font-weight:500;background:#faf9f7}
.pie{max-width:660px;margin:0 auto;padding:0 20px 60px;font-size:12.5px;color:var(--tenue-2);line-height:1.6}
.pie a{color:var(--tenue)}
@media(max-width:560px){main{padding:28px 18px 60px}body{font-size:16.5px}}
</style>
</head>
<body>
<nav class="barra">
  <a class="logo" href="/">P&amp;P</a>
  <span class="sep"></span>
  <a class="vinculo" href="/">la app</a>
  <a class="vinculo" href="/la-pagina">las pantallas</a>
  <a class="vinculo" href="/decisiones-de-diseno">el diseño</a>
  <a class="vinculo" href="/la-letra">la letra</a>
</nav>
<main>
${cuerpo}
</main>
<footer class="pie">
  P&amp;P — Prestigio &amp; Popularidad. Matías Expósito, Tomás Kelly y Diógenes Ustariz.
  <a href="/">Volver a la app</a>.
</footer>
</body>
</html>
`;

for (const d of DOCS) {
  const md = fs.readFileSync(path.join(__dirname, d.md), 'utf8');
  fs.writeFileSync(path.join(__dirname, d.salida), plantilla(d.titulo, aHtml(md)), 'utf8');
  console.log(d.salida, '<-', d.md);
}
