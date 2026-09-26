// Cruza las tres fuentes y reporta LA CIFRA que decide el proyecto:
// de las nominaciones al Grammy y de las canciones del Hot 100,
// cuántas encuentran sus features acústicos.
//
// Uso: node scripts/cruzar.js
// Requiere: datasets/raw/spotify_features.parquet (4,1 GB)
// Salida:   datasets/corpus.csv  +  reporte por consola

const { Database } = require('duckdb-async');
const path = require('path');
const fs = require('fs');

const p = (...partes) => path.join(__dirname, '..', ...partes).split(path.sep).join('/');
const PARQUET  = p('datasets', 'raw', 'spotify_features.parquet');
const BILLBOARD = p('datasets', 'billboard_canciones.csv');
const GRAMMY    = p('datasets', 'grammy_nominaciones.csv');
const OUT       = p('datasets', 'corpus.csv');

// Normalización de títulos: es donde se gana o se pierde el matching.
// "Bohemian Rhapsody - Remastered 2011" y "Bohemian Rhapsody" tienen que colapsar
// al mismo texto, pero "Bohemian Rhapsody - Live" NO debe confundirse con el estudio.
const NORM_TITULO = (col) => `
  regexp_replace(
    regexp_replace(
      regexp_replace(
        lower(strip_accents(${col})),
        '\\s*[-–]\\s*(remaster(ed)?|mono|stereo|single|radio|album|\\d{4}\\s*remaster).*$', '', 'g'),
      '\\s*\\((remaster(ed)?|mono|stereo|single version|album version|radio edit)[^)]*\\)', '', 'g'),
    '[^a-z0-9 ]', '', 'g')`;

// Artista: nos quedamos con el principal, antes de featuring/&/with/and.
const NORM_ARTISTA = (col) => `
  trim(regexp_replace(
    regexp_replace(
      lower(strip_accents(${col})),
      '\\s+(feat\\.?|featuring|with|&|,|\\+|x|and)\\s+.*$', '', 'g'),
    '[^a-z0-9 ]', '', 'g'))`;

// Versiones que NO son la grabación de estudio original.
const ES_ALTERNATIVA = `(
  lower(track_name) LIKE '%live%' OR lower(track_name) LIKE '%remix%' OR
  lower(track_name) LIKE '%karaoke%' OR lower(track_name) LIKE '%cover%' OR
  lower(track_name) LIKE '%instrumental%' OR lower(track_name) LIKE '%acoustic version%' OR
  lower(track_name) LIKE '%demo%' OR lower(track_name) LIKE '%tribute%' OR
  lower(album_name) LIKE '%karaoke%' OR lower(album_name) LIKE '%tribute%'
)`;

(async () => {
  if (!fs.existsSync(PARQUET)) {
    console.error('Falta el parquet. Corré primero la descarga.');
    process.exit(1);
  }

  const db = await Database.create(':memory:');
  await db.all("SET preserve_insertion_order = false;");
  await db.all("SET memory_limit = '4GB';");

  // --- 1. Features: una sola fila por (título, artista) ---
  // De 56M de tracks, colapsamos versiones duplicadas quedándonos con la
  // grabación de estudio más reconocible (mayor popularidad).
  console.log('Deduplicando 56M de tracks a una versión por canción...');
  console.time('  dedup');
  await db.all(`
    CREATE TABLE features AS
    SELECT * FROM (
      SELECT
        ${NORM_TITULO('track_name')}   AS t_norm,
        ${NORM_ARTISTA('artist_name')} AS a_norm,
        track_name, artist_name, album_release_date,
        danceability, energy, valence, acousticness, instrumentalness,
        speechiness, liveness, loudness, tempo, key, mode, duration_ms,
        track_popularity,
        row_number() OVER (
          PARTITION BY ${NORM_TITULO('track_name')}, ${NORM_ARTISTA('artist_name')}
          ORDER BY track_popularity DESC NULLS LAST
        ) AS rn
      FROM read_parquet('${PARQUET}')
      WHERE track_name IS NOT NULL AND artist_name IS NOT NULL
        AND NOT ${ES_ALTERNATIVA}
    ) WHERE rn = 1
  `);
  console.timeEnd('  dedup');
  const [{ nf }] = await db.all('SELECT count(*) AS nf FROM features');
  console.log('  canciones únicas con features:', Number(nf).toLocaleString('es'));

  // --- 2. Billboard normalizado ---
  await db.all(`
    CREATE TABLE billboard AS
    SELECT ${NORM_TITULO('titulo')} AS t_norm, ${NORM_ARTISTA('artista')} AS a_norm,
           titulo, artista, mejor_puesto, semanas_en_chart, anio_primera_aparicion
    FROM read_csv_auto('${BILLBOARD}', header=true)
  `);

  // --- 3. Grammy normalizado, colapsado a una fila por canción ---
  await db.all(`
    CREATE TABLE grammy AS
    SELECT ${NORM_TITULO('titulo')} AS t_norm, ${NORM_ARTISTA('artista')} AS a_norm,
           any_value(titulo) AS titulo, any_value(artista) AS artista,
           min(anio) AS anio_grammy,
           max(ganador) AS gano,
           count(*) AS nominaciones,
           string_agg(DISTINCT categoria, ' | ') AS categorias
    FROM read_csv_auto('${GRAMMY}', header=true)
    GROUP BY 1, 2
  `);

  // --- 4. El número que decide todo ---
  console.log('\n══════════ TASA DE MATCHING ══════════');
  const q = async (sql) => Number((await db.all(sql))[0].n);

  const gTotal = await q('SELECT count(*) AS n FROM grammy');
  const gMatch = await q(`SELECT count(*) AS n FROM grammy g
                          WHERE EXISTS (SELECT 1 FROM features f WHERE f.t_norm=g.t_norm AND f.a_norm=g.a_norm)`);
  const gGana  = await q('SELECT count(*) AS n FROM grammy WHERE gano=1');
  const gGanaM = await q(`SELECT count(*) AS n FROM grammy g WHERE g.gano=1
                          AND EXISTS (SELECT 1 FROM features f WHERE f.t_norm=g.t_norm AND f.a_norm=g.a_norm)`);
  const bTotal = await q('SELECT count(*) AS n FROM billboard');
  const bMatch = await q(`SELECT count(*) AS n FROM billboard b
                          WHERE EXISTS (SELECT 1 FROM features f WHERE f.t_norm=b.t_norm AND f.a_norm=b.a_norm)`);

  const pct = (a, b) => b ? (100 * a / b).toFixed(1) + '%' : '-';
  console.log(`  Grammy  (canciones únicas) : ${gMatch} de ${gTotal}  (${pct(gMatch, gTotal)})`);
  console.log(`  Grammy  (solo ganadoras)   : ${gGanaM} de ${gGana}  (${pct(gGanaM, gGana)})`);
  console.log(`  Billboard                  : ${bMatch} de ${bTotal}  (${pct(bMatch, bTotal)})`);

  console.log('\n--- matching de Grammy por década ---');
  const porDec = await db.all(`
    SELECT floor(anio_grammy/10)::INT*10 AS decada, count(*) AS total,
           count(*) FILTER (WHERE EXISTS (SELECT 1 FROM features f WHERE f.t_norm=g.t_norm AND f.a_norm=g.a_norm)) AS con_features
    FROM grammy g GROUP BY 1 ORDER BY 1
  `);
  for (const r of porDec) {
    const t = Number(r.total), c = Number(r.con_features);
    console.log(`  ${r.decada}s  ${String(c).padStart(4)} de ${String(t).padStart(4)}  (${pct(c, t)})`);
  }

  // --- 5. Corpus final: las tres fuentes fusionadas ---
  await db.all(`
    CREATE TABLE corpus AS
    SELECT
      coalesce(g.titulo, b.titulo)   AS titulo,
      coalesce(g.artista, b.artista) AS artista,
      coalesce(b.anio_primera_aparicion, g.anio_grammy) AS anio,
      coalesce(g.gano, 0)                               AS grammy_gano,
      CASE WHEN g.t_norm IS NOT NULL THEN 1 ELSE 0 END  AS grammy_nominada,
      g.categorias                                      AS grammy_categorias,
      b.mejor_puesto, b.semanas_en_chart,
      CASE WHEN b.t_norm IS NOT NULL THEN 1 ELSE 0 END  AS fue_hit,
      f.danceability, f.energy, f.valence, f.acousticness, f.instrumentalness,
      f.speechiness, f.liveness, f.loudness, f.tempo, f.key, f.mode, f.duration_ms
    FROM features f
    LEFT JOIN grammy    g ON f.t_norm = g.t_norm AND f.a_norm = g.a_norm
    LEFT JOIN billboard b ON f.t_norm = b.t_norm AND f.a_norm = b.a_norm
    WHERE g.t_norm IS NOT NULL OR b.t_norm IS NOT NULL
  `);
  const [{ nc }] = await db.all('SELECT count(*) AS nc FROM corpus');
  console.log(`\nCorpus etiquetado: ${Number(nc).toLocaleString('es')} canciones`);

  const inter = await q('SELECT count(*) AS n FROM corpus WHERE grammy_nominada=1 AND fue_hit=1');
  console.log(`  reconocidas Y hit (la intersección): ${inter}`);

  await db.all(`COPY corpus TO '${OUT}' (HEADER, DELIMITER ',')`);
  console.log('->', OUT);
  await db.close();
})().catch(e => { console.error('FALLO:', e.message); process.exit(1); });
