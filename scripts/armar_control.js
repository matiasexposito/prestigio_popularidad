// Arma el grupo de control: canciones que no ganaron nada y nunca fueron hit.
//
// Sin este grupo los dos puntajes de la app no significan nada, porque el modelo
// no tendría contra qué comparar. Es como enseñar a reconocer caras famosas
// mostrando únicamente fotos de famosos.
//
// Se limita a 1970 en adelante: antes de esa fecha el año que trae el dump se
// desvía 8-12 años, porque las grabaciones viejas llegaron a Spotify como
// reediciones. Medido en scripts/validar_anio.js.
//
// El escaneo del dump tarda ~12 minutos, así que guarda el pozo completo de
// candidatas en datasets/pozo_control.parquet. Para reajustar filtros después,
// correr con --desde-pozo y tarda segundos.
//
// Uso: node scripts/armar_control.js [--desde-pozo]
// Salida: datasets/control.csv  +  datasets/pozo_control.parquet

const { Database } = require('duckdb-async');
const path = require('path');
const fs = require('fs');

const p = (...x) => path.join(__dirname, '..', ...x).split(path.sep).join('/');
const PARQUET   = p('datasets', 'raw', 'spotify_features.parquet');
const BILLBOARD = p('datasets', 'billboard_canciones.csv');
const GRAMMY    = p('datasets', 'grammy_nominaciones.csv');
const POZO      = p('datasets', 'pozo_control.parquet');
const OUT       = p('datasets', 'control.csv');

const DESDE = 1970;
const POR_DECADA = 4500;
const desdePozo = process.argv.includes('--desde-pozo');

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

const ES_ALTERNATIVA = `(
  lower(track_name) LIKE '%live%' OR lower(track_name) LIKE '%remix%' OR
  lower(track_name) LIKE '%karaoke%' OR lower(track_name) LIKE '%cover%' OR
  lower(track_name) LIKE '%instrumental%' OR lower(track_name) LIKE '%acoustic version%' OR
  lower(track_name) LIKE '%demo%' OR lower(track_name) LIKE '%tribute%' OR
  lower(album_name) LIKE '%karaoke%' OR lower(album_name) LIKE '%tribute%'
)`;

// --- Qué NO es música ---
//
// OJO: la regla obvia (muy instrumental + poca energía) NO sirve. Describe igual de
// bien a un generador de ruido blanco que a una Gnossienne de Satie o a la London
// Symphony Orchestra. Usarla borraría del control toda la música tranquila e
// instrumental, y el modelo aprendería que "no ser hit" = "tener voz y ser movida".
//
// Estos filtros son deliberadamente conservadores: prefieren dejar pasar algo de
// ruido antes que borrar música legítima.
const NO_ES_MUSICA = `(
  -- palabra hablada: audiolibros y radioteatros. Spotify define >0.66 como
  -- "enteramente hablado". En el control era el 5,8%; entre los hits, el 0,05%.
  speechiness > 0.66
  -- fragmentos y capítulos partidos
  OR duration_ms < 60000
  -- capítulos de audiolibro y sesiones de DJ (15 min; deja pasar prog y clásica larga)
  OR duration_ms > 900000
  -- contenido de fábrica: ruido para dormir, ASMR, meditación.
  -- Se busca en el nombre del ARTISTA, que en estos casos es genérico
  -- ("Relaxing Radiance", "White Noise Baby Sleep"), no en el título, para no
  -- pisar canciones que se llamen "Rain" o "Sleep".
  OR regexp_matches(lower(artist_name),
       '(white|pink|brown) noise|sleep sounds?|asmr|binaural|meditation music|'
       || 'nature sounds?|rain sounds?|ocean sounds?|womb|baby sleep|sound machine')
)`;

(async () => {
  const db = await Database.create(':memory:');
  await db.all("SET preserve_insertion_order = false;");
  await db.all("SET memory_limit = '5GB';");
  await db.all(`SET temp_directory = '${p('datasets', 'tmp')}';`);
  await db.all("SET max_temp_directory_size = '20GB';");
  const n = x => Number(x);
  const pct = (a, b) => (100 * a / b).toFixed(1) + '%';

  if (desdePozo && fs.existsSync(POZO)) {
    console.log('Usando el pozo ya guardado (sin rescanear el dump).');
    await db.all(`CREATE TABLE candidatas AS SELECT * FROM read_parquet('${POZO}')`);
  } else {
    await db.all(`
      CREATE TABLE etiquetadas AS
      SELECT ${NORM_TITULO('titulo')} AS t_norm, ${NORM_ARTISTA('artista')} AS a_norm
      FROM read_csv_auto('${BILLBOARD}', header=true)
      UNION
      SELECT ${NORM_TITULO('titulo')}, ${NORM_ARTISTA('artista')}
      FROM read_csv_auto('${GRAMMY}', header=true)`);
    console.log('ya etiquetadas (a excluir):',
      n((await db.all('SELECT count(*) AS n FROM etiquetadas'))[0].n).toLocaleString('es'));

    console.log(`\nEscaneando el dump desde ${DESDE} (~12 min)...`);
    console.time('  escaneo');
    await db.all(`
      CREATE TABLE muestra AS
      SELECT ${NORM_TITULO('track_name')}   AS t_norm,
             ${NORM_ARTISTA('artist_name')} AS a_norm,
             track_name, artist_name,
             year(album_release_date) AS anio,
             coalesce(track_popularity, 0) AS popularidad,
             danceability, energy, valence, acousticness, instrumentalness,
             speechiness, liveness, loudness, tempo, key, mode, duration_ms
      FROM read_parquet('${PARQUET}')
      WHERE track_name IS NOT NULL AND artist_name IS NOT NULL
        AND album_release_date IS NOT NULL
        AND year(album_release_date) BETWEEN ${DESDE} AND 2026
        AND coalesce(track_popularity, 0) >= 15
        AND NOT ${ES_ALTERNATIVA}`);
    console.timeEnd('  escaneo');

    await db.all(`
      CREATE TABLE candidatas AS
      SELECT * EXCLUDE (rn) FROM (
        SELECT *, row_number() OVER (PARTITION BY t_norm, a_norm ORDER BY popularidad DESC) AS rn
        FROM muestra WHERE t_norm <> '' AND a_norm <> ''
      ) WHERE rn = 1`);
    await db.all(`DELETE FROM candidatas c WHERE EXISTS
      (SELECT 1 FROM etiquetadas e WHERE e.t_norm = c.t_norm AND e.a_norm = c.a_norm)`);
    await db.all(`COPY candidatas TO '${POZO}' (FORMAT PARQUET)`);
    console.log('  pozo guardado ->', POZO);
  }

  const totalPozo = n((await db.all('SELECT count(*) AS n FROM candidatas'))[0].n);
  console.log('\ncandidatas sin etiqueta:', totalPozo.toLocaleString('es'));

  // --- Qué saca cada filtro (para poder auditarlo) ---
  console.log('\n══════ limpieza de lo que no es música ══════');
  const f = await db.all(`SELECT
      count(*) FILTER (WHERE speechiness > 0.66) AS hablada,
      count(*) FILTER (WHERE duration_ms < 60000) AS muy_corta,
      count(*) FILTER (WHERE duration_ms > 900000) AS muy_larga,
      count(*) FILTER (WHERE regexp_matches(lower(artist_name),
        '(white|pink|brown) noise|sleep sounds?|asmr|binaural|meditation music|nature sounds?|rain sounds?|ocean sounds?|womb|baby sleep|sound machine')) AS ruido_fabrica,
      count(*) FILTER (WHERE ${NO_ES_MUSICA}) AS total
    FROM candidatas`);
  const r = f[0];
  console.log(`  palabra hablada  ${String(n(r.hablada)).padStart(6)}  (${pct(n(r.hablada), totalPozo)})`);
  console.log(`  menos de 1 min   ${String(n(r.muy_corta)).padStart(6)}  (${pct(n(r.muy_corta), totalPozo)})`);
  console.log(`  más de 15 min    ${String(n(r.muy_larga)).padStart(6)}  (${pct(n(r.muy_larga), totalPozo)})`);
  console.log(`  ruido de fábrica ${String(n(r.ruido_fabrica)).padStart(6)}  (${pct(n(r.ruido_fabrica), totalPozo)})`);
  console.log(`  TOTAL SACADO     ${String(n(r.total)).padStart(6)}  (${pct(n(r.total), totalPozo)})`);

  await db.all(`CREATE TABLE limpias AS SELECT * FROM candidatas WHERE NOT ${NO_ES_MUSICA}`);

  // Control: verificar que la música clásica tranquila SIGUE adentro
  const clas = await db.all(`SELECT track_name AS titulo, artist_name AS artista,
      round(instrumentalness,2) AS instr, round(energy,2) AS energia
    FROM limpias WHERE instrumentalness > 0.9 AND energy < 0.25 LIMIT 4`);
  console.log('\n  verificación — la clásica tranquila NO se borró:');
  for (const c of clas) console.log(`    ${c.titulo} — ${c.artista}`);

  // --- Reparto parejo por década ---
  await db.all(`
    CREATE TABLE control AS
    SELECT * EXCLUDE (rk) FROM (
      SELECT *, row_number() OVER (PARTITION BY floor(anio/10) ORDER BY random()) AS rk
      FROM limpias
    ) WHERE rk <= ${POR_DECADA}`);

  console.log('\n══════ grupo de control final ══════');
  const d = await db.all(`SELECT floor(anio/10)::INT*10 AS decada, count(*) AS n,
      round(avg(energy),3) AS energia, round(avg(valence),3) AS valencia,
      round(avg(duration_ms)/1000) AS dur_seg
    FROM control GROUP BY 1 ORDER BY 1`);
  for (const x of d) {
    console.log(`  ${x.decada}s  ${String(n(x.n)).padStart(5)}   energía ${x.energia}   valencia ${x.valencia}   ${n(x.dur_seg)}s`);
  }
  console.log('  TOTAL:', n((await db.all('SELECT count(*) AS n FROM control'))[0].n).toLocaleString('es'));

  console.log('\n--- muestra al azar ---');
  console.table((await db.all(`SELECT track_name AS titulo, artist_name AS artista, anio
    FROM control USING SAMPLE 8 ROWS`)).map(x => ({ ...x, anio: n(x.anio) })));

  await db.all(`COPY control TO '${OUT}' (HEADER, DELIMITER ',')`);
  console.log('\n->', OUT);
  await db.close();
})().catch(e => { console.error('FALLO:', e.message); process.exit(1); });
