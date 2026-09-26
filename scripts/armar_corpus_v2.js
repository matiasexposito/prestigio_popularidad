// Arma la versión 2 del corpus: saca dos características, agrega una nueva.
//
// SACA
//   tonalidad (key)  — viene como número 0-11 (Do=0, Do#=1...). El modelo lo leería
//                      como una cantidad y creería que el 11 está lejos del 0, cuando
//                      musicalmente son vecinos. Mete ruido.
//   en vivo (liveness) — al deduplicar sacamos las tomas en vivo, así que casi no
//                      varía: solo el 0,8% del corpus pasa de 0,8. Separaba poco (0,128).
//
// AGREGA
//   rareza — cuán lejos está la canción del centro de su propio año, medido a la vez
//            en las nueve características continuas. La referencia son las 8,9M del
//            pozo agrupadas por año: o sea toda la música publicada ese año, no solo
//            los hits. Un valor alto significa "no sonaba como nada de lo que se hacía".
//
//            Es una hipótesis nueva y comprobable: puede que la Academia premie lo que
//            se sale de la norma y el público lo que se le parece.
//
//            Se calcula desde 1970. Antes de esa fecha el pozo no tiene un año confiable
//            (ver validar_anio.js), así que queda vacía.
//
// Uso: node scripts/armar_corpus_v2.js
// Salida: datasets/corpus_v2.csv

const { Database } = require('duckdb-async');
const path = require('path');

const p = (...x) => path.join(__dirname, '..', ...x).split(path.sep).join('/');
const POZO   = p('datasets', 'pozo_control.parquet');
const CORPUS = p('datasets', 'corpus.csv');
const SALIDA = p('datasets', 'corpus_v2.csv');

// Las nueve continuas que entran en el cálculo de rareza. El modo (mayor/menor) queda
// afuera porque es categórico: no tiene sentido medir "distancia" sobre un sí/no.
const CONTINUAS = ['danceability', 'energy', 'valence', 'acousticness',
  'instrumentalness', 'speechiness', 'loudness', 'tempo', 'duration_ms'];

const NO_ES_MUSICA = `(
  speechiness > 0.66 OR duration_ms < 60000 OR duration_ms > 900000
  OR regexp_matches(lower(artist_name || ' ' || track_name),
       '(white|pink|brown) noise|sleep sound|asmr|binaural|meditation|nature sound|'
    || 'rain sound|ocean sound|womb|baby sleep|sound machine|relaxing|relajante|rilassante|'
    || 'lullab|deep sleep|study music|focus music|spa music')
)`;

(async () => {
  const db = await Database.create(':memory:');
  await db.all("SET preserve_insertion_order = false;");
  await db.all("SET memory_limit = '5GB';");
  await db.all(`SET temp_directory = '${p('datasets', 'tmp')}';`);
  const n = x => Number(x);

  // Referencia por año: cómo sonaba la música ese año
  await db.all(`CREATE TABLE musica AS
    SELECT * FROM read_parquet('${POZO}')
    WHERE NOT ${NO_ES_MUSICA} AND anio BETWEEN 1970 AND 2026`);
  const aggs = CONTINUAS.map(f => `avg(${f}) m_${f}, coalesce(stddev_samp(${f}),1) s_${f}`).join(', ');
  // Solo años con referencia suficiente. 2026 tiene 6 canciones en el pozo (el dump se
  // armó antes de que ese año se llenara), y contra una referencia así cualquier
  // canción da una distancia disparatada.
  await db.all(`CREATE TABLE ref AS SELECT anio, count(*) n_ref, ${aggs}
    FROM musica GROUP BY anio HAVING count(*) >= 500`);
  const cob = (await db.all(`SELECT min(n_ref) mn, round(median(n_ref)) md, count(*) c FROM ref`))[0];
  console.log(`referencia: ${n(cob.c)} años · mediana ${n(cob.md).toLocaleString('es')} canciones/año (mínimo ${n(cob.mn).toLocaleString('es')})`);

  // rareza = raíz de la media de los cuadrados de los desvíos.
  // Se usa la media y no la suma para que el número no dependa de cuántas
  // características haya, y quede en la misma unidad que un desvío cualquiera.
  //
  // Cada desvío se recorta a ±5 antes de elevarlo al cuadrado: sin eso, un solo
  // valor extremo (un tempo mal detectado, una duración atípica) se lleva puesto
  // el resultado de toda la canción.
  const cuadrados = CONTINUAS
    .map(f => `pow(greatest(-5, least(5, (c.${f} - r.m_${f}) / nullif(r.s_${f}, 0))), 2)`)
    .join(' + ');

  await db.all(`
    CREATE TABLE v2 AS
    SELECT
      c.titulo, c.artista, c.anio,
      c.grammy_gano, c.grammy_nominada, c.grammy_categorias,
      c.mejor_puesto,
      coalesce(c.semanas_en_chart, 0) AS semanas_en_chart,
      c.fue_hit,
      CASE WHEN c.grammy_nominada=1 AND c.fue_hit=1 THEN 'ambas'
           WHEN c.grammy_nominada=1 THEN 'premiada'
           WHEN c.fue_hit=1 THEN 'hit'
           ELSE 'control' END AS grupo,
      c.danceability, c.energy, c.valence, c.acousticness, c.instrumentalness,
      c.speechiness, c.loudness, c.tempo, c.mode, c.duration_ms,
      CASE WHEN r.anio IS NULL THEN NULL
           ELSE round(sqrt((${cuadrados}) / ${CONTINUAS.length}), 4) END AS rareza
    FROM read_csv_auto('${CORPUS}', header=true) c
    LEFT JOIN ref r ON r.anio = least(c.anio, 2025)`);
  // El CASE es necesario: en DuckDB least(5, NULL) devuelve 5, no NULL. Sin él, las
  // canciones anteriores a 1970 (sin referencia) quedaban con rareza 5, el máximo.

  const t = (await db.all(`SELECT count(*) tot, count(rareza) con FROM v2`))[0];
  console.log(`corpus: ${n(t.tot).toLocaleString('es')} canciones · con rareza: ${n(t.con).toLocaleString('es')} (1970 en adelante)`);

  // ---------- ¿La rareza separa los dos mundos? ----------
  console.log('\n══════ ¿la rareza separa premiadas de hits? ══════\n');
  const g = await db.all(`
    SELECT CASE WHEN grammy_nominada=1 AND grammy_categorias LIKE '%of the Year%' THEN 'premiada (general)'
                WHEN grammy_nominada=1 THEN 'premiada (género)'
                WHEN fue_hit=1 THEN 'hit sin premio' END grupo,
           count(*) n, round(avg(rareza),3) rareza, round(stddev_samp(rareza),3) sd
    FROM v2 WHERE rareza IS NOT NULL GROUP BY 1 HAVING grupo IS NOT NULL ORDER BY 3 DESC`);
  for (const x of g) {
    console.log(`  ${x.grupo.padEnd(20)} n=${String(n(x.n)).padStart(6)}   rareza ${x.rareza}   (desvío ${x.sd})`);
  }

  const sep = (await db.all(`
    WITH pr AS (SELECT avg(rareza) a FROM v2 WHERE grammy_nominada=1 AND grammy_categorias LIKE '%of the Year%'),
         hi AS (SELECT avg(rareza) a FROM v2 WHERE grammy_nominada=0 AND fue_hit=1),
         sd AS (SELECT stddev_samp(rareza) s FROM v2 WHERE rareza IS NOT NULL)
    SELECT round(abs((SELECT a FROM pr)-(SELECT a FROM hi))/(SELECT s FROM sd),3) v`))[0];
  console.log(`\n  poder de separación: ${sep.v}`);
  console.log('  (para comparar: energía 0,473 · valencia 0,461 · acústica 0,349 · duración 0,344)');

  console.log('\n══════ evolución por década ══════\n');
  const d = await db.all(`SELECT floor(anio/10)::INT*10 AS decada,
      round(avg(rareza) FILTER (WHERE grammy_nominada=1 AND grammy_categorias LIKE '%of the Year%'),3) premiadas,
      round(avg(rareza) FILTER (WHERE grammy_nominada=0 AND fue_hit=1),3) hits
    FROM v2 WHERE rareza IS NOT NULL GROUP BY 1 ORDER BY 1`);
  console.log('  década   premiadas    hits');
  for (const x of d) {
    console.log(`  ${x.decada}s ${String(x.premiadas).padStart(10)} ${String(x.hits).padStart(8)}`);
  }

  console.log('\n══════ las más raras del corpus ══════\n');
  for (const x of await db.all(`SELECT titulo, artista, anio, rareza FROM v2
      WHERE rareza IS NOT NULL AND (grammy_nominada=1 OR mejor_puesto<=20)
      ORDER BY rareza DESC LIMIT 6`)) {
    console.log(`  ${String(x.rareza).padStart(6)}  ${x.titulo} — ${x.artista} (${n(x.anio)})`);
  }

  await db.all(`COPY v2 TO '${SALIDA}' (HEADER, DELIMITER ',')`);
  console.log('\n->', SALIDA);
  await db.close();
})().catch(e => { console.error('FALLO:', e.message); process.exit(1); });
