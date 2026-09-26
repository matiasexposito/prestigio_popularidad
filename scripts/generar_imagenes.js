// Genera los mockups de la app como archivos PNG, para pegar en Canva o en las
// diapositivas. Renderiza HTML con Chrome en modo headless y le saca una captura.
//
// Los mockups se diseñaron para verse dentro del chat, donde los colores vienen
// del entorno. Acá esos colores se definen explícitamente (PALETA), porque el
// archivo tiene que ser autónomo.
//
// Uso: node scripts/generar_imagenes.js
// Salida: imagenes/*.png  (a doble resolución, para que no se pixelen al ampliar)

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const p = (...x) => path.join(__dirname, '..', ...x);
const SALIDA = p('imagenes');

const NAVEGADORES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];

const PALETA = `
:root{
  --surface-1:#ffffff; --surface-0:#f4f3f1;
  --text-primary:#1c1b1a; --text-secondary:#57534e; --text-muted:#8d8880;
  --border:#e3e0da; --border-strong:#c2beb6;
  --text-accent:#1f5fbf; --bg-accent:#dce8fa;
  --text-warning:#a35a06; --bg-warning:#fbe2a8;
}
*{box-sizing:border-box}
body{margin:0;padding:20px;background:#ffffff;
  font-family:"Segoe UI",system-ui,-apple-system,sans-serif;
  color:var(--text-primary);-webkit-font-smoothing:antialiased}
`;

// ---------- 1. Los dos puntajes con su rango ----------
const PUNTAJES = `
<style>
.track{position:relative;height:10px;border-radius:5px;background:var(--surface-0);border:1px solid var(--border)}
.band{position:absolute;top:0;bottom:0;border-radius:5px}
.mark{position:absolute;top:-4px;bottom:-4px;width:2px;border-radius:1px}
.tick{display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:var(--text-muted)}
.card{background:var(--surface-1);border:1px solid var(--border);border-radius:12px;padding:20px}
</style>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
  <div class="card">
    <div style="font-size:13px;color:var(--text-secondary);margin-bottom:4px">Prestigio</div>
    <div style="font-size:44px;font-weight:500;line-height:1">32%</div>
    <div style="font-size:14px;color:var(--text-secondary);margin:6px 0 18px">con un margen entre 24% y 41%</div>
    <div class="track">
      <div class="band" style="left:24%;width:17%;background:var(--bg-accent)"></div>
      <div class="mark" style="left:32%;background:var(--text-accent)"></div>
    </div>
    <div class="tick"><span>0</span><span>50</span><span>100</span></div>
  </div>
  <div class="card">
    <div style="font-size:13px;color:var(--text-secondary);margin-bottom:4px">Popularidad</div>
    <div style="font-size:44px;font-weight:500;line-height:1">68%</div>
    <div style="font-size:14px;color:var(--text-secondary);margin:6px 0 18px">con un margen entre 59% y 76%</div>
    <div class="track">
      <div class="band" style="left:59%;width:17%;background:var(--bg-warning)"></div>
      <div class="mark" style="left:68%;background:var(--text-warning)"></div>
    </div>
    <div class="tick"><span>0</span><span>50</span><span>100</span></div>
  </div>
</div>
<div class="card" style="margin-top:16px">
  <div style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">Para qué sirve el rango: dos temas de un mismo disco</div>
  <div style="display:grid;grid-template-columns:110px 1fr 60px;align-items:center;gap:12px;margin-bottom:14px">
    <div style="font-size:13px">tema 3</div>
    <div class="track"><div class="band" style="left:24%;width:17%;background:var(--bg-accent)"></div><div class="mark" style="left:32%;background:var(--text-accent)"></div></div>
    <div style="font-size:15px;text-align:right">32%</div>
  </div>
  <div style="display:grid;grid-template-columns:110px 1fr 60px;align-items:center;gap:12px">
    <div style="font-size:13px">tema 7</div>
    <div class="track"><div class="band" style="left:27%;width:17%;background:var(--bg-accent)"></div><div class="mark" style="left:35%;background:var(--text-accent)"></div></div>
    <div style="font-size:15px;text-align:right">35%</div>
  </div>
  <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border);font-size:13px;color:var(--text-secondary);line-height:1.6">
    Las dos bandas se pisan casi enteras: 32% y 35% son indistinguibles para el modelo. Con un solo número, el usuario elegiría el tema 7 creyendo que es mejor.
  </div>
</div>`;

// ---------- 2. El mapa inicial poblado ----------
// Coordenadas de datos (0-100 en los dos ejes) a píxeles del dibujo.
const PX = c => 70 + c * 5.85;
const PY = p => 415 - p * 3.85;

const punto = (c, p, tipo) => tipo === 'gano'
  ? `<circle cx="${PX(c)}" cy="${PY(p)}" r="6" fill="var(--text-accent)"/>`
  : tipo === 'nom'
  ? `<circle cx="${PX(c)}" cy="${PY(p)}" r="5.5" fill="none" stroke="var(--text-accent)" stroke-width="2"/>`
  : `<circle cx="${PX(c)}" cy="${PY(p)}" r="5" fill="#ffffff" stroke="var(--text-muted)" stroke-width="1.5"/>`;

const etiq = (c, p, t, anchor, dx, dy) =>
  `<text x="${PX(c) + dx}" y="${PY(p) + dy}" font-size="11.5" fill="var(--text-primary)" text-anchor="${anchor}">${t}</text>`;

// Cada canción: popularidad, prestigio, tipo, etiqueta, anclaje, desplazamiento.
// Los desplazamientos están puestos a mano: con las etiquetas automáticas se pisaban.
const DESTACADAS = [
  [12, 84, 'no',   'Imagine · Jack Johnson',    'start',  12,   4],
  [30, 81, 'no',   'Hallelujah · L. Cohen',     'start',  12,   4],
  [55, 72, 'nom',  'Take Five · Brubeck',       'start',  12,   4],
  [78, 88, 'gano', 'Bridge over Troubled Water','end',   -12,  -8],
  [94, 84, 'no',   'Someone Like You',          'end',   -12,   4],
  [74, 79, 'gano', 'Yesterday',                 'end',   -12,   4],
  [84, 78, 'no',   'Purple Rain',               'start',  12,   4],
  [96, 74, 'no',   'Bohemian Rhapsody',         'end',   -12,  18],
  [86, 61, 'gano', 'Lose Yourself',             'end',   -12,   4],
  [95, 57, 'gano', 'Bad Guy',                   'end',   -12,   4],
  [80, 57, 'gano', 'Hotel California',          'end',   -12,  10],
  [96, 44, 'gano', 'Rolling in the Deep',       'end',   -12,   4],
  [88, 43, 'no',   'Gangnam Style',             'end',   -12,  16],
  [96, 35, 'nom',  'Despacito',                 'end',   -12,  16],
  [78, 35, 'nom',  'Smells Like Teen Spirit',   'end',   -12,   4],
  [66, 29, 'no',   'Macarena',                  'start',  12,   4],
];

const MAPA = `
<div style="background:var(--surface-1);border:1px solid var(--border);border-radius:12px;padding:20px 16px 12px">
<svg viewBox="0 0 680 470" style="width:100%;height:auto">
  <line x1="70" y1="415" x2="655" y2="415" stroke="var(--border-strong)" stroke-width="1"/>
  <line x1="70" y1="415" x2="70" y2="30" stroke="var(--border-strong)" stroke-width="1"/>
  <line x1="362" y1="30" x2="362" y2="415" stroke="var(--border)" stroke-dasharray="3 4"/>
  <line x1="70" y1="222" x2="655" y2="222" stroke="var(--border)" stroke-dasharray="3 4"/>
  ${NUBE.map(([p, c]) => `<circle cx="${PX(c)}" cy="${PY(p)}" r="2.6" fill="var(--border-strong)" opacity="0.5"/>`).join('')}
  <text x="362" y="443" text-anchor="middle" font-size="12" fill="var(--text-secondary)">popularidad →</text>
  <text x="24" y="222" text-anchor="middle" font-size="12" fill="var(--text-secondary)" transform="rotate(-90 24 222)">prestigio →</text>
  <text x="80" y="48" font-size="11" fill="var(--text-muted)">prestigio sin público</text>
  <text x="645" y="48" font-size="11" fill="var(--text-muted)" text-anchor="end">las dos cosas</text>
  <text x="645" y="405" font-size="11" fill="var(--text-muted)" text-anchor="end">hit puro</text>
  <text x="80" y="405" font-size="11" fill="var(--text-muted)">ni una cosa ni la otra</text>
  ${DESTACADAS.map(([c, p, t]) => punto(c, p, t)).join('')}
  ${DESTACADAS.map(([c, p, , t, a, dx, dy]) => etiq(c, p, t, a, dx, dy)).join('')}
</svg>
<div style="display:flex;gap:20px;padding:12px 0 4px;border-top:1px solid var(--border);margin-top:8px;font-size:12px;color:var(--text-secondary)">
  <span style="display:flex;align-items:center;gap:7px"><svg width="13" height="13"><circle cx="6.5" cy="6.5" r="5.5" fill="var(--text-accent)"/></svg>ganó un Grammy</span>
  <span style="display:flex;align-items:center;gap:7px"><svg width="13" height="13"><circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="var(--text-accent)" stroke-width="2"/></svg>nominada</span>
  <span style="display:flex;align-items:center;gap:7px"><svg width="13" height="13"><circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="var(--text-muted)" stroke-width="1.5"/></svg>ni nominada</span><span style="display:flex;align-items:center;gap:7px"><svg width="13" height="13"><circle cx="6.5" cy="6.5" r="2.6" fill="var(--border-strong)"/></svg>el resto del corpus</span>
</div></div>`;

// ---------- 3. El desglose del puntaje ----------
const fila = (nombre, valor, pts, dir) => {
  const w = Math.abs(pts) / 11 * 45;
  const col = dir === 'resta' ? 'var(--bg-warning)' : 'var(--bg-accent)';
  const txt = dir === 'resta' ? 'var(--text-warning)' : 'var(--text-accent)';
  const lado = dir === 'resta' ? `right:50%;width:${w}%` : `left:50%;width:${w}%`;
  return `<div class="row">
    <div><div class="nm">${nombre}</div><div class="vl">${valor}</div></div>
    <div class="bar"><div class="axis"></div><div class="fill" style="${lado};background:${col}"></div></div>
    <div class="ef" style="color:${txt}">${pts > 0 ? '+' : '−'}${Math.abs(pts)} pts</div>
  </div>`;
};

const DESGLOSE = `
<style>
.row{display:grid;grid-template-columns:150px 1fr 74px;align-items:center;gap:12px;padding:9px 0}
.bar{position:relative;height:20px}
.axis{position:absolute;left:50%;top:-4px;bottom:-4px;width:1px;background:var(--border-strong)}
.fill{position:absolute;top:3px;height:14px;border-radius:3px}
.nm{font-size:13px}.vl{font-size:11.5px;color:var(--text-muted)}.ef{font-size:13px;text-align:right}
</style>
<div style="background:var(--surface-1);border:1px solid var(--border);border-radius:12px;overflow:hidden">
<div style="padding:18px 20px;border-bottom:1px solid var(--border);display:flex;align-items:baseline;gap:14px">
  <span style="font-size:13px;color:var(--text-secondary)">Prestigio</span>
  <span style="font-size:32px;font-weight:500;line-height:1">32%</span>
  <span style="font-size:13px;color:var(--text-secondary)">entre 24% y 41%</span>
  <span style="margin-left:auto;font-size:12px;color:var(--text-accent)">qué lo empujó ↓</span>
</div>
<div style="padding:14px 20px 6px">
  <div style="display:grid;grid-template-columns:150px 1fr 74px;gap:12px;font-size:11px;color:var(--text-muted);padding-bottom:6px">
    <span>característica</span><span style="text-align:center">resta ← → suma</span><span style="text-align:right">efecto</span>
  </div>
  ${fila('energía', '0,82 · muy alta', -11, 'resta')}
  ${fila('duración', '2:55 · corta', -7, 'resta')}
  ${fila('acústica', '0,08 · casi nula', -5, 'resta')}
  ${fila('valencia', '0,71 · alegre', -4, 'resta')}
  ${fila('bailabilidad', '0,75 · alta', -3, 'resta')}
  ${fila('habla', '0,04 · cantada', 3, 'suma')}
  ${fila('modo', 'menor', 2, 'suma')}
</div>
<div style="margin:8px 20px 18px;padding:14px 16px;background:var(--bg-accent);border-radius:8px">
  <div style="font-size:12px;color:var(--text-accent);margin-bottom:5px">tu conflicto principal</div>
  <div style="font-size:13.5px;line-height:1.6">La energía es lo que más pesa en los dos ejes, y en direcciones opuestas: bajarla te acerca al premio pero te aleja del público. No hay forma de moverla que mejore las dos cosas.</div>
</div>
<div style="border-top:1px solid var(--border);padding:14px 20px;font-size:12px;color:var(--text-secondary);line-height:1.7">
  <div style="margin-bottom:8px;color:var(--text-muted);font-size:11px">de dónde salió cada dato</div>
  <div>los valores de tu canción · analizados de tu archivo con librosa, hoy</div>
  <div>la comparación · 401 nominadas a Record y Song of the Year, 1970-2026</div>
  <div>la referencia de época · 40.301 canciones publicadas en 2024</div>
  <div style="margin-top:10px;color:var(--text-accent)">ver las 12 canciones premiadas más parecidas a la tuya →</div>
</div></div>`;

const NUBE = [[43,2,0],[54,16,0],[62,21,0],[58,78,0],[42,60,0],[50,24,0],[31,19,0],[49,6,0],[27,16,0],[27,11,0],[46,96,0],[46,81,0],[77,22,0],[37,16,0],[41,37,0],[59,9,0],[54,21,0],[73,5,0],[48,96,1],[50,15,0],[40,70,0],[49,20,0],[72,83,0],[66,32,0],[92,8,0],[43,7,0],[50,13,0],[54,41,0],[62,9,0],[33,34,0],[41,46,0],[59,15,0],[38,19,0],[44,10,0],[67,12,0],[49,11,0],[38,11,0],[34,8,0],[45,17,0],[64,35,0],[81,10,0],[38,9,0],[47,21,0],[49,20,0],[78,2,0],[60,80,0],[46,8,0],[44,15,0],[87,73,0],[36,69,0],[50,22,0],[27,1,0],[70,2,0],[52,33,0],[37,21,0],[42,52,0],[47,6,0],[76,16,0],[31,49,0],[61,15,0],[60,11,0],[52,47,0],[70,18,0],[51,16,0],[48,21,1],[80,17,0],[62,1,0],[93,18,0],[68,7,0],[46,17,0],[41,53,0],[48,34,0],[62,6,0],[51,6,0],[42,41,0],[41,46,0],[25,11,0],[51,9,0],[47,1,0],[45,6,0],[36,57,0],[73,15,0],[29,6,0],[48,2,0],[75,10,0],[49,27,0],[43,43,0],[42,21,0],[20,2,0],[40,9,0],[40,19,0],[38,27,0],[87,6,0],[38,21,0],[36,11,0],[36,74,0],[61,8,0],[30,50,0],[35,53,0],[42,48,0],[58,80,0],[27,83,0],[31,75,0],[56,35,0],[49,23,0],[51,5,0],[61,11,1],[67,5,0],[40,21,0],[34,16,0],[35,6,0],[52,9,0],[40,11,0],[31,1,0],[50,10,0],[66,5,0],[42,55,0],[67,4,0],[38,13,0],[37,13,0],[82,42,0],[38,70,0],[35,90,1],[86,19,0],[61,14,0],[56,75,0],[31,15,0],[48,13,0],[33,3,0],[53,52,0],[62,3,0],[55,19,0],[68,8,0],[52,9,0],[54,6,0],[59,66,0],[23,9,0],[48,73,0],[60,30,0],[55,83,0],[39,19,0],[60,70,0],[37,1,0],[32,33,0],[37,67,0],[47,1,0],[60,82,0],[46,81,0],[43,88,0],[41,21,0],[58,15,0],[47,89,1],[93,5,0],[31,6,0],[63,77,0],[34,31,0],[27,9,0],[44,29,0],[74,6,0],[53,8,1],[40,10,0],[44,10,0],[43,5,0],[51,16,0],[58,21,0],[48,11,0],[44,36,0],[62,15,0],[59,11,0],[46,35,0],[37,11,0],[34,16,0],[57,13,0],[41,14,0],[49,19,0],[24,15,0],[53,26,0],[38,42,0],[91,4,0],[38,18,0],[60,53,0],[53,9,0],[46,80,0],[29,30,0],[46,41,0],[79,8,0],[29,22,0],[60,4,0],[48,59,0],[61,5,0],[50,9,0],[34,8,0],[45,20,0],[75,70,0],[44,15,0],[22,11,0],[38,9,0],[25,45,0],[43,11,0],[45,35,0],[74,2,0],[43,1,0],[31,78,0],[34,45,0],[83,6,0],[48,21,0],[37,4,0],[34,3,0],[44,33,0],[43,75,1],[43,11,0],[42,2,0],[69,9,0],[39,11,0],[47,52,0],[50,72,0],[91,8,0],[49,51,0],[39,1,0],[68,47,0],[58,64,0],[57,14,0],[50,15,0],[35,2,0],[43,21,0],[74,36,0],[69,21,0],[39,55,0],[75,5,0],[44,11,0],[45,33,0],[92,7,0],[49,11,0],[33,14,0],[77,70,0],[54,13,0],[61,82,0],[70,7,0],[61,12,0],[32,88,0],[31,32,0],[42,63,0],[98,11,0],[45,29,0],[47,19,0],[60,42,0],[24,5,0],[62,56,0],[53,33,1],[59,3,0],[75,75,0],[28,9,0],[42,14,0],[74,18,0],[36,32,0],[52,17,0],[54,6,0],[49,12,0],[52,3,0],[60,29,0]];

const IMAGENES = [
  { nombre: '1-puntajes-con-rango', html: PUNTAJES, ancho: 760, alto: 470 },
  { nombre: '2-mapa-inicial', html: MAPA, ancho: 760, alto: 560 },
  { nombre: '3-desglose-prestigio', html: DESGLOSE, ancho: 760, alto: 790 },
];

function main() {
  const navegador = NAVEGADORES.find(n => fs.existsSync(n));
  if (!navegador) { console.error('No encontré Chrome ni Edge.'); process.exit(1); }
  fs.mkdirSync(SALIDA, { recursive: true });

  for (const img of IMAGENES) {
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<style>${PALETA}</style></head><body>${img.html}</body></html>`;
    const tmp = path.join(SALIDA, `._${img.nombre}.html`);
    const png = path.join(SALIDA, `${img.nombre}.png`);
    fs.writeFileSync(tmp, html, 'utf8');
    try {
      execFileSync(navegador, [
        '--headless=new', '--disable-gpu', '--hide-scrollbars',
        '--force-device-scale-factor=2',
        `--window-size=${img.ancho},${img.alto}`,
        `--screenshot=${png}`,
        'file:///' + tmp.replace(/\\/g, '/'),
      ], { stdio: 'pipe', timeout: 90000 });
    } finally { fs.unlinkSync(tmp); }
    const kb = (fs.statSync(png).size / 1024).toFixed(0);
    console.log(`  ${img.nombre}.png  ${img.ancho * 2}x${img.alto * 2}px  (${kb} KB)`);
  }
  console.log('\n->', SALIDA);
}

main();
