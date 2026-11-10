#!/usr/bin/env node
/* =========================================================
   letra.js — consulta la letra de una canción y la mide

   Uso:
     node codigo/letra.js "Luis Fonsi" "Despacito"            → métricas de la letra
     node codigo/letra.js "Luis Fonsi" "Despacito" --texto    → además, muestra la letra en pantalla
     node codigo/letra.js "Luis Fonsi" "Despacito" --csv      → agrega una fila a letras_metricas.csv
     node codigo/letra.js --lote canciones.csv                → mide todas (columnas: artista,titulo)

   Fuente: la API pública de lyrics.ovh (https://lyrics.ovh), sin clave ni registro.
   No consulta Genius: bloquea a los programas y sus términos de uso prohíben copiar
   las letras.

   Sobre los derechos: la letra de una canción tiene derechos de autor. Este script
   NO guarda el texto en ningún archivo: con --texto lo muestra en la terminal para
   leerlo, y con --csv guarda solo los números (cantidad de palabras, repetición,
   etc.), que es lo único que puede ir al repositorio o a la app.
   ========================================================= */

const fs = require('fs');
const path = require('path');

const API = 'https://api.lyrics.ovh/v1';
const ARCHIVO_CSV = path.join(__dirname, '..', 'datasets_procesados', 'letras_metricas.csv');

async function pedirLetra(artista, titulo) {
  const url = `${API}/${encodeURIComponent(artista)}/${encodeURIComponent(titulo)}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'P&P letra.js (trabajo académico)' } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`lyrics.ovh respondió ${r.status}`);
  const j = await r.json();
  return (j.lyrics || '').replace(/\r/g, '').trim() || null;
}

// Las métricas: lo único que se guarda. Ninguna permite reconstruir la letra.
function medir(texto) {
  const lineas = texto.split('\n').map(l => l.trim()).filter(l => l && !/^\[.*\]$/.test(l));
  const palabras = texto.toLowerCase().match(/[a-záéíóúñüàèìòùâêîôûäëïöçœ']+/g) || [];
  const distintas = new Set(palabras);
  const frecuencia = {};
  for (const p of palabras) frecuencia[p] = (frecuencia[p] || 0) + 1;
  const [masRepetida, veces] = Object.entries(frecuencia).sort((a, b) => b[1] - a[1])[0] || ['', 0];
  const lineasDistintas = new Set(lineas.map(l => l.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, '')));
  const primeraPersona = palabras.filter(p => ['yo', 'me', 'mi', 'mis', 'conmigo', 'i', 'me', 'my', 'mine', 'myself'].includes(p)).length;
  return {
    palabras: palabras.length,
    palabras_distintas: distintas.size,
    variedad: +(distintas.size / Math.max(1, palabras.length)).toFixed(3),        // 1 = ninguna palabra repetida
    repeticion_de_lineas: +(1 - lineasDistintas.size / Math.max(1, lineas.length)).toFixed(3), // 0 = ninguna línea repetida
    lineas: lineas.length,
    palabra_mas_repetida: masRepetida,
    veces_la_mas_repetida: veces,
    primera_persona: +(primeraPersona / Math.max(1, palabras.length)).toFixed(3),  // proporción de "yo/me/mi"
  };
}

function aCsv(artista, titulo, m) {
  const cab = ['artista', 'titulo', ...Object.keys(m)];
  const fila = [artista, titulo, ...Object.values(m)].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  if (!fs.existsSync(ARCHIVO_CSV)) fs.writeFileSync(ARCHIVO_CSV, cab.join(',') + '\n');
  fs.appendFileSync(ARCHIVO_CSV, fila + '\n');
}

function mostrar(artista, titulo, m) {
  console.log(`\n${titulo} — ${artista}`);
  console.log(`  palabras: ${m.palabras} · distintas: ${m.palabras_distintas} · variedad: ${m.variedad}`);
  console.log(`  líneas: ${m.lineas} · repetición de líneas: ${m.repeticion_de_lineas}`);
  console.log(`  palabra más repetida: "${m.palabra_mas_repetida}" (${m.veces_la_mas_repetida} veces) · primera persona: ${m.primera_persona}`);
}

async function una(artista, titulo, { texto = false, csv = false } = {}) {
  const letra = await pedirLetra(artista, titulo);
  if (!letra) { console.log(`\n${titulo} — ${artista}: lyrics.ovh no la tiene.`); return null; }
  const m = medir(letra);
  mostrar(artista, titulo, m);
  if (texto) console.log('\n' + letra + '\n');
  if (csv) { aCsv(artista, titulo, m); console.log(`  → fila agregada a ${path.relative(process.cwd(), ARCHIVO_CSV)}`); }
  return m;
}

async function lote(archivo) {
  const filas = fs.readFileSync(archivo, 'utf8').split(/\r?\n/).filter(Boolean);
  const cab = filas.shift().split(',').map(s => s.trim().toLowerCase());
  const ia = cab.indexOf('artista'), it = cab.indexOf('titulo');
  if (ia < 0 || it < 0) throw new Error('el CSV necesita las columnas artista,titulo');
  let ok = 0, sin = 0;
  for (const f of filas) {
    const c = f.match(/("([^"]|"")*"|[^,]*)/g).filter((_, i) => i % 2 === 0).map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'));
    const r = await una(c[ia], c[it], { csv: true });
    r ? ok++ : sin++;
    await new Promise(res => setTimeout(res, 400));   // sin apurar al servicio
  }
  console.log(`\nListo: ${ok} medidas, ${sin} sin letra.`);
}

(async () => {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter(a => a.startsWith('--')));
  const pos = args.filter(a => !a.startsWith('--'));
  try {
    if (flags.has('--lote')) return await lote(pos[0]);
    if (pos.length < 2) {
      console.log('Uso: node codigo/letra.js "Artista" "Título" [--texto] [--csv]\n     node codigo/letra.js --lote canciones.csv');
      process.exit(1);
    }
    await una(pos[0], pos[1], { texto: flags.has('--texto'), csv: flags.has('--csv') });
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
