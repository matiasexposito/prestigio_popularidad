// ¿Sirve la fecha del dump para estimar el año de una canción?
//
// Importa porque las canciones del grupo de control no están ni en Billboard ni en
// Grammy, así que no tienen año por ningún otro lado. Si la fecha del dump no sirve,
// no las podemos ubicar en el tiempo y hay que replantear la normalización por época.
//
// Lo medimos contra Billboard, que sí tiene el año verdadero (primera aparición
// en el ranking). Filtramos primero a esas canciones y recién ahí agrupamos: agrupar
// los 43M de canciones enteros no entra en memoria.
//
// Uso: node scripts/validar_anio.js

const { Database } = require('duckdb-async');
const path = require('path');

const p = (...x) => path.join(__dirname, '..', ...x).split(path.sep).join('/');
const PARQUET   = p('datasets', 'raw', 'spotify_features.parquet');
const BILLBOARD = p('datasets', 'billboard_canciones.csv');

const NORM_TITULO = (c) => `
  regexp_replace(
    regexp_replace(
      regexp_replace(lower(strip_accents(${c})),
        '\\s*[-–]\\s*(remaster(ed)?|mono|stereo|single|radio|album|\\d{4}\\s*remaster).*$', '', 'g'),
      '\\s*\\((remaster(ed)?|mono|stereo|single version|album version|radio edit)[^)]*\\)', '', 'g'),
    '[^a-z0-9 ]', '', 'g')`;

const NORM_ARTISTA = (c) => `
  trim(regexp_replace(
    regexp_replace(lower(strip_accents(${c})),
      '\\s+(feat\\.?|featuring|with|&|,|\\+|x|and)\\s+.*$', '', 'g'),
    '[^a-z0-9 ]', '', 'g'))`;

(async () => {
  const db = await Database.create(':memory:');
  await db.all("SET preserve_insertion_order = false;");
  await db.all("SET memory_limit = '5GB';");
  await db.all(`SET temp_directory = '${p('datasets', 'tmp')}';`);
  await db.all("SET max_temp_directory_size = '20GB';");
  const n = x => Number(x);

  await db.all(`
    CREATE TABLE billboard AS
    SELECT ${NORM_TITULO('titulo')} AS t_norm, ${NORM_ARTISTA('artista')} AS a_norm,
           min(anio_primera_aparicion) AS anio_real
    FROM read_csv_auto('${BILLBOARD}', header=true)
    GROUP BY 1, 2`);
  console.log('claves de Billboard:', n((await db.all('SELECT count(*) AS n FROM billboard'))[0].n).toLocaleString('es'));

  console.log('\nEscaneando el dump filtrando solo esas canciones...');
  console.time('  escaneo');
  // El filtro va ANTES del agrupamiento: se agrupan ~30k canciones, no 43M.
  await db.all(`
    CREATE TABLE fechas AS
    SELECT b.t_norm, b.a_norm, b.anio_real,
           min(year(f.album_release_date)) AS anio_min,
           count(*) AS ediciones
    FROM read_parquet('${PARQUET}') f
    JOIN billboard b
      ON ${NORM_TITULO('f.track_name')} = b.t_norm
     AND ${NORM_ARTISTA('f.artist_name')} = b.a_norm
    WHERE f.album_release_date IS NOT NULL
    GROUP BY 1, 2, 3`);
  console.timeEnd('  escaneo');
  console.log('  canciones con fecha:', n((await db.all('SELECT count(*) AS n FROM fechas'))[0].n).toLocaleString('es'));

  console.log('\n══════ Precisión de la fecha del dump vs. el año real ══════\n');
  const val = await db.all(`
    SELECT floor(anio_real/10)::INT*10 AS decada, count(*) AS n,
           median(anio_min - anio_real) AS desvio_mediano,
           round(100.0*count(*) FILTER (WHERE abs(anio_min-anio_real)<=1)/count(*),1) AS p1,
           round(100.0*count(*) FILTER (WHERE abs(anio_min-anio_real)<=3)/count(*),1) AS p3,
           round(100.0*count(*) FILTER (WHERE abs(anio_min-anio_real)<=5)/count(*),1) AS p5
    FROM fechas GROUP BY 1 ORDER BY 1`);
  console.log('  década      n    desvío mediano   ±1año   ±3años   ±5años');
  for (const r of val) {
    console.log(
      `  ${r.decada}s ${String(n(r.n)).padStart(6)}  ${String(n(r.desvio_mediano)).padStart(9)} años   ` +
      `${String(r.p1).padStart(5)}%   ${String(r.p3).padStart(5)}%   ${String(r.p5).padStart(5)}%`
    );
  }

  const g = (await db.all(`
    SELECT round(100.0*count(*) FILTER (WHERE abs(anio_min-anio_real)<=3)/count(*),1) AS p3,
           median(abs(anio_min-anio_real)) AS err
    FROM fechas`))[0];
  console.log(`\n  GLOBAL: ${g.p3}% cae dentro de ±3 años · error mediano ${n(g.err)} años`);

  await db.close();
})().catch(e => { console.error('FALLO:', e.message); process.exit(1); });
