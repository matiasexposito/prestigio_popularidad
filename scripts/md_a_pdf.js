// Convierte un documento Markdown a PDF, con estilo legible en pantalla y en papel.
//
// Por qué así y no con la herramienta habitual: la vía estándar para generar PDF
// necesita Python, que no está instalado en esta máquina. Chrome y Edge saben
// imprimir a PDF desde la línea de comandos, así que rendereamos el Markdown a
// HTML y dejamos que el navegador lo imprima.
//
// Uso: node scripts/md_a_pdf.js <archivo.md> [salida.pdf]

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const MarkdownIt = require('markdown-it');

const NAVEGADORES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];

const CSS = `
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    font-size: 10.5pt; line-height: 1.55; color: #1a1a1a;
    max-width: 100%; margin: 0; padding: 0;
  }
  h1 { font-size: 21pt; margin: 0 0 .5em; padding-bottom: .3em;
       border-bottom: 3px solid #2b2b2b; page-break-after: avoid; }
  h2 { font-size: 15pt; margin: 1.6em 0 .5em; padding-bottom: .2em;
       border-bottom: 1px solid #d4d4d4; page-break-after: avoid; }
  h3 { font-size: 12.5pt; margin: 1.3em 0 .4em; page-break-after: avoid; }
  h4 { font-size: 11pt; margin: 1.1em 0 .3em; page-break-after: avoid; }
  p, li { orphans: 2; widows: 2; }
  blockquote {
    margin: 1em 0; padding: .7em 1em; background: #f6f7f9;
    border-left: 3px solid #8a8a8a; color: #333;
  }
  blockquote p { margin: .35em 0; }
  table {
    border-collapse: collapse; width: 100%; margin: 1em 0;
    font-size: 9.5pt; page-break-inside: avoid;
  }
  th, td { border: 1px solid #ccc; padding: .45em .6em; text-align: left; vertical-align: top; }
  th { background: #f0f1f3; font-weight: 600; }
  tr:nth-child(even) td { background: #fafafa; }
  code {
    font-family: Consolas, "Courier New", monospace; font-size: 9pt;
    background: #f0f1f3; padding: .1em .35em; border-radius: 3px;
  }
  pre {
    background: #f6f7f9; border: 1px solid #e0e0e0; border-radius: 4px;
    padding: .8em 1em; overflow-x: auto; font-size: 8.8pt;
    page-break-inside: avoid; line-height: 1.4;
  }
  pre code { background: none; padding: 0; }
  hr { border: none; border-top: 1px solid #d4d4d4; margin: 2em 0; }
  a { color: #1a4d8f; text-decoration: none; }
  ul, ol { padding-left: 1.4em; }
  li { margin: .25em 0; }
  strong { font-weight: 600; }
  img { max-width: 100%; }
`;

function main() {
  const entrada = process.argv[2];
  if (!entrada) {
    console.error('Uso: node scripts/md_a_pdf.js <archivo.md> [salida.pdf]');
    process.exit(1);
  }
  if (!fs.existsSync(entrada)) {
    console.error('No existe:', entrada);
    process.exit(1);
  }

  // Rutas absolutas: Chrome resuelve --print-to-pdf desde su propio directorio,
  // no desde el nuestro, así que una ruta relativa deja el archivo en cualquier lado.
  const salida = path.resolve(process.argv[3] ||
    path.join(path.dirname(entrada), path.basename(entrada, '.md') + '.pdf'));
  fs.mkdirSync(path.dirname(salida), { recursive: true });

  const navegador = NAVEGADORES.find(n => fs.existsSync(n));
  if (!navegador) {
    console.error('No encontré Chrome ni Edge para imprimir el PDF.');
    process.exit(1);
  }

  const md = new MarkdownIt({ html: true, linkify: true, typographer: false });
  const cuerpo = md.render(fs.readFileSync(entrada, 'utf8'));
  const titulo = path.basename(entrada, '.md');

  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>${titulo}</title><style>${CSS}</style></head>
<body>${cuerpo}</body></html>`;

  const tmp = path.join(path.dirname(salida), `._${titulo}.html`);
  fs.writeFileSync(tmp, html, 'utf8');

  try {
    execFileSync(navegador, [
      '--headless=new',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--print-to-pdf=${salida}`,
      'file:///' + tmp.replace(/\\/g, '/'),
    ], { stdio: 'pipe', timeout: 120000 });
  } finally {
    fs.unlinkSync(tmp);
  }

  const kb = (fs.statSync(salida).size / 1024).toFixed(0);
  console.log(`OK  ${path.basename(salida)}  (${kb} KB)`);
  console.log('->', salida);
}

main();
