// Regenera el grupo de control con el MISMO esquema que corpus_v2.csv.
//
// La primera versión del control se escribió antes de decidir qué características
// quedaban, así que arrastraba tres problemas:
//   · t_norm y a_norm — columnas internas de trabajo (los títulos normalizados que
//     se usan para cruzar las fuentes). No van en un archivo que se comparte.
//   · liveness y key — se sacaron del corpus pero seguían acá.
//   · faltaban la rareza y las columnas de etiqueta.
//
// Con los dos archivos en el mismo esquema se pueden apilar directamente, que es
// lo que hace falta para entrenar: el corpus aporta las premiadas y los hits, el
// control aporta las canciones comunes contra las que comparar.
//
// Uso: node scripts/armar_control_v2.js
// Salida: datasets/control_v2.csv

const { Database } = require('duckdb-async');
const path = require('path');

const p = (...x) => path.join(__dirname, '..', ...x).split(path.sep).join('/');
const POZO    = p('datasets', 'pozo_control.parquet');
const CONTROL = p('datasets', 'control.csv');
const SALIDA  = p('datasets', 'control_v2.csv');

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

  // Misma referencia por año que usa armar_corpus_v2.js, para que la rareza
  // sea comparable entre los dos archivos.
  await db.all(`CREATE TABLE musica AS SELECT * FROM read_parquet('${POZO}')
    WHERE NOT ${NO_ES_MUSICA} AND anio BETWEEN 1970 AND 2026`);
  const aggs = CONTINUAS.map(f => `avg(${f}) m_${f}, coalesce(stddev_samp(${f}),1) s_${f}`).join(', ');
  await db.all(`CREATE TABLE ref AS SELECT anio, ${aggs}
    FROM musica GROUP BY anio HAVING count(*) >= 500`);

  const cuadrados = CONTINUAS
    .map(f => `pow(greatest(-5, least(5, (c.${f} - r.m_${f}) / nullif(r.s_${f}, 0))), 2)`)
    .join(' + ');

  // Mismo orden de columnas que corpus_v2.csv, para que los dos archivos se
  // puedan apilar sin tocar nada.
  await db.all(`
    CREATE TABLE v2 AS
    SELECT
      c.track_name  AS titulo,
      c.artist_name AS artista,
      c.anio,
      0 AS grammy_gano,
      0 AS grammy_nominada,
      NULL::VARCHAR AS grammy_categorias,
      NULL::BIGINT AS mejor_puesto,
      0 AS semanas_en_chart,
      0 AS fue_hit,
      'control' AS grupo,
      c.danceability, c.energy, c.valence, c.acousticness, c.instrumentalness,
      c.speechiness, c.loudness, c.tempo, c.mode, c.duration_ms,
      CASE WHEN r.anio IS NULL THEN NULL
           ELSE round(sqrt((${cuadrados}) / ${CONTINUAS.length}), 4) END AS rareza
    FROM read_csv_auto('${CONTROL}', header=true) c
    LEFT JOIN ref r ON r.anio = least(c.anio, 2025)`);

  const t = (await db.all(`SELECT count(*) tot, count(rareza) con FROM v2`))[0];
  console.log(`control: ${n(t.tot).toLocaleString('es')} canciones · con rareza: ${n(t.con).toLocaleString('es')}`);

  console.log('\npor década:');
  for (const x of await db.all(`SELECT floor(anio/10)::INT*10 AS decada, count(*) n,
      round(avg(energy),3) energia, round(avg(rareza),3) rareza
    FROM v2 GROUP BY 1 ORDER BY 1`)) {
    console.log(`  ${x.decada}s  ${String(n(x.n)).padStart(5)}   energía ${x.energia}   rareza ${x.rareza}`);
  }

  await db.all(`COPY v2 TO '${SALIDA}' (HEADER, DELIMITER ',')`);
  console.log('\n->', SALIDA);
  await db.close();
})().catch(e => { console.error('FALLO:', e.message); process.exit(1); });
