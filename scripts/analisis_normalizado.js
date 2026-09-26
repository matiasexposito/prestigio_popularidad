// El análisis decisivo: ¿los dos mundos se separaron, o solo cambió la música?
//
// El problema que resuelve: comparar una canción de 1975 con una de 2024 en valores
// crudos mezcla dos cosas distintas. Una es la decisión musical; la otra es cómo se
// grababa y masterizaba en cada época (la "guerra del volumen" de los 90 en adelante).
// Sin separarlas, cualquier tendencia que encontremos puede ser tecnología, no música.
//
// Cómo lo separa: en vez de comparar valores absolutos, medimos cuánto se aparta cada
// canción de LO QUE SONABA ESE AÑO. La referencia son los 8,9M del pozo, agrupados por
// año. Si una canción de 1975 tiene energía +0,8 significa "más enérgica que la música
// típica de 1975", y eso sí se puede comparar con un +0,8 de 2024.
//
// Uso: node scripts/analisis_normalizado.js

const { Database } = require('duckdb-async');
const path = require('path');

const p = (...x) => path.join(__dirname, '..', ...x).split(path.sep).join('/');
const POZO   = p('datasets', 'pozo_control.parquet');
const CORPUS = p('datasets', 'corpus_v2.csv');

const FEATURES = ['energy', 'valence', 'acousticness', 'danceability', 'speechiness', 'loudness', 'duration_ms'];
const ES_NOMBRE = {
  energy: 'energía', valence: 'valencia', acousticness: 'acústica',
  danceability: 'bailable', speechiness: 'habla', loudness: 'volumen', duration_ms: 'duración',
};

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

  // ---------- Auditoría del filtro de basura ----------
  await db.all(`CREATE TABLE pozo AS SELECT * FROM read_parquet('${POZO}')`);
  const tot = n((await db.all('SELECT count(*) AS n FROM pozo'))[0].n);
  const sac = n((await db.all(`SELECT count(*) AS n FROM pozo WHERE ${NO_ES_MUSICA}`))[0].n);
  console.log(`pozo: ${tot.toLocaleString('es')} · filtrado como no-música: ${sac.toLocaleString('es')} (${(100*sac/tot).toFixed(1)}%)`);

  await db.all(`CREATE TABLE musica AS SELECT * FROM pozo WHERE NOT ${NO_ES_MUSICA} AND anio BETWEEN 1970 AND 2025`);
  console.log('\nauditoría — instrumental y tranquila que SOBREVIVE (debe ser clásica/ambient real):');
  for (const c of await db.all(`SELECT track_name AS t, artist_name AS a FROM musica
      WHERE instrumentalness > 0.9 AND energy < 0.25 USING SAMPLE 5 ROWS`)) {
    console.log(`  · ${c.t} — ${c.a}`);
  }

  // ---------- Referencia por año: cómo sonaba la música cada año ----------
  const aggs = FEATURES.map(f => `avg(${f}) AS m_${f}, coalesce(stddev_samp(${f}), 1) AS s_${f}`).join(', ');
  await db.all(`CREATE TABLE ref AS SELECT anio, count(*) AS n_ref, ${aggs} FROM musica GROUP BY anio`);
  const cob = await db.all(`SELECT min(n_ref) AS mn, median(n_ref) AS md FROM ref`);
  console.log(`\nreferencia por año: mediana ${n(cob[0].md).toLocaleString('es')} canciones/año (mínimo ${n(cob[0].mn).toLocaleString('es')})`);

  // ---------- Corpus etiquetado, en unidades normalizadas ----------
  const zs = FEATURES.map(f => `(c.${f} - r.m_${f}) / nullif(r.s_${f}, 0) AS z_${f}`).join(', ');
  await db.all(`
    CREATE TABLE etiq AS
    SELECT c.titulo, c.artista, c.anio, c.grammy_nominada, c.grammy_gano, c.fue_hit,
           c.mejor_puesto, c.grammy_categorias,
           CASE WHEN c.grammy_categorias LIKE '%of the Year%' THEN 1 ELSE 0 END AS es_general,
           ${zs}
    FROM read_csv_auto('${CORPUS}', header=true) c
    JOIN ref r ON r.anio = c.anio
    WHERE c.anio BETWEEN 1970 AND 2025`);
  console.log('canciones etiquetadas normalizables (1970-2025):',
    n((await db.all('SELECT count(*) AS n FROM etiq'))[0].n).toLocaleString('es'));

  // ---------- 1. Perfil de cada mundo, ya sin el efecto de la época ----------
  console.log('\n══════ PERFIL DE CADA MUNDO (en desvíos respecto de su propio año) ══════');
  console.log('  0 = suena como la música típica de su año · + = por encima · − = por debajo\n');
  const sel = FEATURES.map(f => `round(avg(z_${f}), 3) AS ${f}`).join(', ');
  const perfiles = await db.all(`
    SELECT CASE WHEN grammy_nominada = 1 AND es_general = 1 THEN 'premiada (general)'
                WHEN grammy_nominada = 1 THEN 'premiada (género)'
                ELSE 'hit sin premio' END AS mundo,
           count(*) AS n, ${sel}
    FROM etiq GROUP BY 1 ORDER BY 1`);
  console.log('  mundo                    n     ' + FEATURES.map(f => ES_NOMBRE[f].padStart(9)).join(''));
  for (const r of perfiles) {
    console.log('  ' + r.mundo.padEnd(20) + String(n(r.n)).padStart(6) + '     ' +
      FEATURES.map(f => String(r[f]).padStart(9)).join(''));
  }

  // ---------- 2. La pregunta central: ¿la brecha se abrió o se cerró? ----------
  console.log('\n══════ LA BRECHA A LO LARGO DEL TIEMPO ══════');
  console.log('  premiadas (Record/Song of the Year) menos hits, en desvíos\n');
  const brecha = await db.all(`
    SELECT floor(anio/10)::INT*10 AS decada,
           count(*) FILTER (WHERE grammy_nominada=1 AND es_general=1) AS n_prem,
           round(avg(z_valence)      FILTER (WHERE grammy_nominada=1 AND es_general=1)
               - avg(z_valence)      FILTER (WHERE grammy_nominada=0), 3) AS valencia,
           round(avg(z_energy)       FILTER (WHERE grammy_nominada=1 AND es_general=1)
               - avg(z_energy)       FILTER (WHERE grammy_nominada=0), 3) AS energia,
           round(avg(z_acousticness) FILTER (WHERE grammy_nominada=1 AND es_general=1)
               - avg(z_acousticness) FILTER (WHERE grammy_nominada=0), 3) AS acustica,
           round(avg(z_duration_ms)  FILTER (WHERE grammy_nominada=1 AND es_general=1)
               - avg(z_duration_ms)  FILTER (WHERE grammy_nominada=0), 3) AS duracion
    FROM etiq GROUP BY 1 ORDER BY 1`);
  console.log('  década  n_prem   valencia   energía  acústica  duración');
  for (const r of brecha) {
    console.log(`  ${r.decada}s ${String(n(r.n_prem)).padStart(6)}   ` +
      [r.valencia, r.energia, r.acustica, r.duracion].map(v => String(v).padStart(8)).join('  '));
  }

  // ---------- 3. ¿Se movieron los hits, las premiadas, o las dos? ----------
  console.log('\n══════ ¿QUIÉN SE MOVIÓ? (posición de cada mundo respecto de su año) ══════\n');
  const mov = await db.all(`
    SELECT floor(anio/10)::INT*10 AS decada,
           round(avg(z_valence) FILTER (WHERE grammy_nominada=1 AND es_general=1), 3) AS val_prem,
           round(avg(z_valence) FILTER (WHERE grammy_nominada=0), 3) AS val_hit,
           round(avg(z_duration_ms) FILTER (WHERE grammy_nominada=1 AND es_general=1), 3) AS dur_prem,
           round(avg(z_duration_ms) FILTER (WHERE grammy_nominada=0), 3) AS dur_hit
    FROM etiq GROUP BY 1 ORDER BY 1`);
  console.log('  década   valencia:premiada  valencia:hit    duración:premiada  duración:hit');
  for (const r of mov) {
    console.log(`  ${r.decada}s ` +
      String(r.val_prem).padStart(15) + String(r.val_hit).padStart(14) +
      String(r.dur_prem).padStart(21) + String(r.dur_hit).padStart(14));
  }

  await db.close();
})().catch(e => { console.error('FALLO:', e.message); process.exit(1); });
