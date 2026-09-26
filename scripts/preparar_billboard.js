// Colapsa el Hot 100 semanal a una fila por canción.
//
// De 355k filas-semana salen las canciones únicas, cada una con su mejor puesto,
// sus semanas en chart y el año de su primera aparición. Ese año es importante:
// lo usamos como año de la canción porque la fecha del dump de Spotify es la de
// la reedición, no la del lanzamiento original (Bohemian Rhapsody figura en 2024).
//
// Uso: node scripts/preparar_billboard.js
// Salida: datasets/billboard_canciones.csv

const { Database } = require('duckdb-async');
const path = require('path');

const p = (...partes) => path.join(__dirname, '..', ...partes).split(path.sep).join('/');
const RAW = p('datasets', 'raw', 'billboard_hot100.csv');
const OUT = p('datasets', 'billboard_canciones.csv');

(async () => {
  const db = await Database.create(':memory:');

  await db.all(`
    CREATE TABLE canciones AS
    SELECT
      title                 AS titulo,
      performer             AS artista,
      min(peak_pos)         AS mejor_puesto,
      max(wks_on_chart)     AS semanas_en_chart,
      year(min(chart_week)) AS anio_primera_aparicion,
      count(*)              AS apariciones
    FROM read_csv_auto('${RAW}', header=true)
    GROUP BY title, performer
  `);

  const [{ n }] = await db.all('SELECT count(*) AS n FROM canciones');
  console.log('canciones únicas en el Hot 100:', Number(n));

  console.log('\n--- distribución por década ---');
  const dec = await db.all(`
    SELECT floor(anio_primera_aparicion / 10)::INT * 10 AS decada,
           count(*)                                AS canciones,
           count(*) FILTER (WHERE mejor_puesto <= 10) AS top10
    FROM canciones GROUP BY 1 ORDER BY 1
  `);
  for (const r of dec) {
    console.log(
      `  ${r.decada}s  ${String(Number(r.canciones)).padStart(5)} canciones` +
      `   ${String(Number(r.top10)).padStart(4)} llegaron al top 10`
    );
  }

  console.log('\n--- ejemplos de nº1 ---');
  const ej = await db.all(`
    SELECT titulo, artista, mejor_puesto, semanas_en_chart, anio_primera_aparicion
    FROM canciones
    WHERE mejor_puesto = 1 AND anio_primera_aparicion IN (1964, 1983, 1999, 2017)
    ORDER BY anio_primera_aparicion, semanas_en_chart DESC
    LIMIT 8
  `);
  console.table(ej.map(r => ({
    ...r,
    semanas_en_chart: Number(r.semanas_en_chart),
    mejor_puesto: Number(r.mejor_puesto),
  })));

  await db.all(`COPY canciones TO '${OUT}' (HEADER, DELIMITER ',')`);
  console.log('\n->', OUT);
  await db.close();
})().catch(e => { console.error('FALLO:', e.message); process.exit(1); });
